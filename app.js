const SUPABASE_URL="https://zdrprvgahdlsvtqxslpl.supabase.co";
const SUPABASE_KEY="sb_publishable_Q7B3X5jiuNeFOmbMZddqsg_6tC80C6T";
const db=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);
const TECH_CATEGORIES=["Technologie","Programmation","Développement web","Cybersécurité","Réseaux","Bases de données","Intelligence artificielle","Systèmes","Cloud","Outils informatiques"];
const $=s=>document.querySelector(s);
const modal=$("#authModal"),form=$("#authForm"),message=$("#authMessage");
let authMode="signup",currentUser=null;
$("#year").textContent=new Date().getFullYear();
$("#menuToggle").addEventListener("click",()=>{const nav=$("#mainNav"),open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));});
$("#mainNav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{$("#mainNav").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");}));
function setAuthMode(mode){authMode=mode;const signup=mode==="signup";$("#authTitle").textContent=signup?"Créer un compte":"Se connecter";$("#authIntro").textContent=signup?"Rejoignez gratuitement notre communauté d'apprentissage.":"Retrouvez votre espace d'apprentissage.";$("#fullName").hidden=!signup;$("#fullName").required=signup;$("#authSubmit").textContent=signup?"Créer mon compte":"Se connecter";$("#authSwitch").innerHTML=signup?'Déjà inscrit ? <button type="button" data-switch-auth="login">Se connecter</button>':'Pas encore de compte ? <button type="button" data-switch-auth="signup">Créer un compte</button>';$("#authSwitch").querySelector("button").addEventListener("click",()=>setAuthMode(signup?"login":"signup"));message.textContent="";}
function openAuth(mode){setAuthMode(mode);modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
function closeAuth(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.style.overflow="";}
document.querySelectorAll("[data-open-auth]").forEach(b=>b.addEventListener("click",()=>openAuth(b.dataset.openAuth)));
document.querySelectorAll("[data-close-auth]").forEach(b=>b.addEventListener("click",closeAuth));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAuth();});
document.querySelectorAll("[data-switch-auth]").forEach(b=>b.addEventListener("click",()=>setAuthMode(b.dataset.switchAuth)));
function say(text,error=false){message.textContent=text;message.style.color=error?"#ff8d9a":"#73e1bd";}
form.addEventListener("submit",async e=>{e.preventDefault();if(!db)return say("Le service de connexion est indisponible. Rechargez la page.",true);const email=$("#authEmail").value.trim(),password=$("#authPassword").value;const submit=$("#authSubmit");submit.disabled=true;say(authMode==="signup"?"Création du compte…":"Connexion…");try{let result;if(authMode==="signup"){const full_name=$("#fullName").value.trim();if(!full_name)throw new Error("Veuillez saisir votre nom complet.");result=await db.auth.signUp({email,password,options:{data:{full_name}}});}else{result=await db.auth.signInWithPassword({email,password});}if(result.error)throw result.error;if(authMode==="signup"&&!result.data.session){say("Compte créé. Vérifiez votre boîte e-mail pour confirmer votre adresse.");}else{currentUser=result.data.user;closeAuth();}}catch(err){say(err.message||"Une erreur est survenue.",true);}finally{submit.disabled=false;}});

async function showMember(user){if(currentUser?.id===user.id&&!$("#dashboard").hidden)return;currentUser=user;$("#accountCard").hidden=true;$("#dashboard").hidden=false;let name=user.user_metadata?.full_name||user.email||"étudiant";const {data:profile,error}=await db.from("profiles").select("full_name,role").eq("id",user.id).maybeSingle();if(error){console.error("Profile load failed",error);$("#myCourses").textContent="Impossible de charger le profil. Vérifiez les règles d'accès Supabase.";return;}if(profile?.full_name)name=profile.full_name;$("#studentName").textContent=name;const isAdmin=profile?.role==="admin";$("#adminPanel").hidden=!isAdmin;$("#dashboard").dataset.role=isAdmin?"admin":"student";if(isAdmin){$("#myCourses").textContent="Votre espace administrateur est prêt. Gérez les cours et les leçons ci-dessous.";await loadAdminData();}else{await loadStudentCourses(user.id);}}
async function loadStudentCourses(userId){
  const target=$("#myCourses");
  target.textContent="Chargement de votre espace d’apprentissage…";
  const {data:rows,error}=await db.from("enrollments").select("course_id,courses(id,title,description,category)").eq("user_id",userId).order("enrolled_at",{ascending:false});
  if(error){target.textContent="Impossible de charger vos inscriptions. Réessayez dans quelques instants.";console.error("Enrollment loading failed",error);return;}
  const enrolled=(rows||[]).filter(row=>row.courses&&TECH_CATEGORIES.includes(row.courses.category));
  if(!enrolled.length){target.innerHTML='<div class="student-empty"><strong>Votre parcours commence ici.</strong><p>Vous n’êtes inscrit à aucun cours pour le moment. Explorez les formations gratuites et choisissez votre premier cours.</p><a href="#courses" class="student-explore">Découvrir les cours →</a></div>';return;}
  target.innerHTML="";
  let totalLessons=0,totalDone=0;
  let overallFillRef=null,overallTextRef=null;
  const summaries=[];
  for(const row of enrolled){
    const course=row.courses;
    const card=document.createElement("article");
    card.className="student-course student-course-card";
    const heading=document.createElement("div");heading.className="student-course-heading";
    const info=document.createElement("div");
    const title=document.createElement("strong");title.textContent=course.title;
    const desc=document.createElement("small");desc.textContent=course.description||"Votre formation STUDY TECH";
    info.append(title,desc);
    const badge=document.createElement("span");badge.className="student-course-badge";badge.textContent="FORMATION";
    heading.append(info,badge);
    const {data:lessons,error:lessonError}=await db.from("lessons").select("id,title,position,content").eq("course_id",course.id).eq("is_published",true).order("position");
    const lessonRows=lessonError?[]:(lessons||[]);
    const {data:progress,error:progressError}=lessonRows.length?await db.from("lesson_progress").select("lesson_id,completed").eq("user_id",userId).in("lesson_id",lessonRows.map(l=>l.id)):{data:[],error:null};
    const done=new Set(progressError?[]:(progress||[]).filter(p=>p.completed).map(p=>p.lesson_id));
    const doneCount=done.size,total=lessonRows.length,percent=total?Math.round(doneCount/total*100):0;
    totalLessons+=total;totalDone+=doneCount;
    const progressArea=document.createElement("div");progressArea.className="course-progress";
    const progressTop=document.createElement("div");progressTop.className="course-progress-top";
    const progressLabel=document.createElement("span");progressLabel.textContent="Votre progression";
    const progressText=document.createElement("strong");progressText.textContent=total?percent+" %":"À venir";
    progressTop.append(progressLabel,progressText);
    const track=document.createElement("div");track.className="course-progress-track";track.setAttribute("role","progressbar");track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax","100");track.setAttribute("aria-valuenow",String(percent));
    const fill=document.createElement("span");fill.className="course-progress-fill";fill.style.width=percent+"%";track.append(fill);
    const count=document.createElement("small");count.className="course-progress-count";count.textContent=total?doneCount+" leçon"+(doneCount>1?"s":"")+" terminée"+(doneCount>1?"s":"")+" sur "+total:"Aucune leçon publiée pour le moment";
    progressArea.append(progressTop,track,count);
    const lessonsWrap=document.createElement("div");lessonsWrap.className="student-lessons";
    const lessonsTitle=document.createElement("h4");lessonsTitle.textContent="Contenu du cours";lessonsWrap.append(lessonsTitle);
    if(lessonError){const err=document.createElement("p");err.className="student-empty-note";err.textContent="Les leçons ne sont pas disponibles pour le moment.";lessonsWrap.append(err);}
    else if(!total){const empty=document.createElement("p");empty.className="student-empty-note";empty.textContent="Les leçons seront bientôt disponibles.";lessonsWrap.append(empty);}
    else{
      for(const lesson of lessonRows){
        const item=document.createElement("article");item.className="student-lesson";
        const line=document.createElement("div");line.className="student-lesson-row";
        const label=document.createElement("span");label.className="student-lesson-title";label.textContent=(done.has(lesson.id)?"✓ ":"○ ")+lesson.title;
        if(done.has(lesson.id))label.classList.add("is-complete");
        const actions=document.createElement("div");actions.className="student-lesson-actions";
        const reader=document.createElement("details");reader.className="lesson-reader";
        const summary=document.createElement("summary");summary.textContent="Lire la leçon";
        const body=document.createElement("div");body.className="lesson-reader-content";body.textContent=lesson.content||"Le contenu de cette leçon sera bientôt disponible.";
        reader.append(summary,body);
        const button=document.createElement("button");button.className="lesson-link";button.textContent=done.has(lesson.id)?"Terminée":"Marquer terminée";button.disabled=done.has(lesson.id);
        button.addEventListener("click",()=>completeLesson(lesson.id,userId,button,label,{progressText,fill,track,count,doneCount,total,refreshOverall:()=>{totalDone+=1;const pct=totalLessons?Math.round(totalDone/totalLessons*100):0;if(overallFillRef)overallFillRef.style.width=pct+"%";if(overallTextRef)overallTextRef.textContent=totalDone+" / "+totalLessons+" leçon"+(totalLessons>1?"s":"")+" terminée"+(totalLessons>1?"s":"");}}));
        actions.append(reader,button);line.append(label,actions);item.append(line);lessonsWrap.append(item);
      }
    }
    card.append(heading,progressArea,lessonsWrap);target.append(card);
    summaries.push({title:course.title,done:doneCount,total});
  }
  const overall=document.createElement("div");overall.className="student-overview";
  const overallTitle=document.createElement("strong");overallTitle.textContent="Bilan de votre apprentissage";
  const overallText=document.createElement("span");overallText.textContent=totalDone+" / "+totalLessons+" leçon"+(totalLessons>1?"s":"")+" terminée"+(totalLessons>1?"s":"");overallTextRef=overallText;
  const overallTrack=document.createElement("div");overallTrack.className="course-progress-track";
  const overallFill=document.createElement("span");overallFill.className="course-progress-fill";overallFill.style.width=(totalLessons?Math.round(totalDone/totalLessons*100):0)+"%";overallFillRef=overallFill;overallTrack.append(overallFill);
  overall.append(overallTitle,overallText,overallTrack);target.prepend(overall);
}
async function completeLesson(lessonId,userId,button,label,progress){
  button.disabled=true;button.textContent="Enregistrement…";
  const {error}=await db.from("lesson_progress").upsert({user_id:userId,lesson_id:lessonId,completed:true,completed_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"user_id,lesson_id"});
  if(error){button.disabled=false;button.textContent="Marquer terminée";alert("Impossible d'enregistrer la progression : "+error.message);return;}
  button.textContent="Terminée";label.textContent="✓ "+label.textContent.replace(/^○ /,"");label.classList.add("is-complete");
  if(progress){
    const next=progress.doneCount+1,percent=Math.round(next/progress.total*100);
    progress.progressText.textContent=percent+" %";progress.fill.style.width=percent+"%";progress.track.setAttribute("aria-valuenow",String(percent));
    progress.count.textContent=next+" leçon"+(next>1?"s":"")+" terminée"+(next>1?"s":"")+" sur "+progress.total;
    progress.refreshOverall?.();
  }
}
async function loadAdminData(){const {data:courses,error}=await db.from("courses").select("id,title,slug,description,category,is_published").order("created_at",{ascending:false});const list=$("#adminCourseList"),select=$("#lessonCourse");list.innerHTML="";select.innerHTML='<option value="">Choisir un cours</option>';if(error){list.textContent="Erreur de chargement : "+error.message;return;}if(!courses?.length){list.innerHTML='<div class="admin-empty">Aucun cours pour le moment. Créez votre premier cours ci-dessus.</div>';return;}for(const course of courses){const option=document.createElement("option");option.value=course.id;option.textContent=course.title;select.append(option);const row=document.createElement("div");row.className="admin-row";const info=document.createElement("div");const title=document.createElement("strong");title.textContent=course.title;const meta=document.createElement("small");meta.textContent=(course.category||"Général")+" · "+(course.is_published?"Publié":"Brouillon");info.append(title,meta);const actions=document.createElement("div");actions.className="admin-row-actions";const toggle=document.createElement("button");toggle.textContent=course.is_published?"Dépublier":"Publier";toggle.addEventListener("click",()=>toggleCourse(course.id,!course.is_published));actions.append(toggle);row.append(info,actions);list.append(row);const {data:lessons}=await db.from("lessons").select("id,title,is_published,position").eq("course_id",course.id).order("position");if(lessons?.length){const lessonList=document.createElement("div");lessonList.className="lesson-list";for(const lesson of lessons){const line=document.createElement("div");line.className="lesson-item";const label=document.createElement("span");label.textContent=lesson.title+" · "+(lesson.is_published?"Publié":"Brouillon");const button=document.createElement("button");button.className="lesson-link";button.textContent=lesson.is_published?"Dépublier":"Publier";button.addEventListener("click",()=>toggleLesson(lesson.id,!lesson.is_published));line.append(label,button);lessonList.append(line);}list.append(lessonList);}}}
async function toggleCourse(id,published){const {error}=await db.from("courses").update({is_published:published,updated_at:new Date().toISOString()}).eq("id",id);if(error){alert("Modification impossible : "+error.message);return;}await loadAdminData();await loadCourses(currentUser?.id);}
async function toggleLesson(id,published){const {error}=await db.from("lessons").update({is_published:published,updated_at:new Date().toISOString()}).eq("id",id);if(error){alert("Modification impossible : "+error.message);return;}await loadAdminData();}
$("#createCourseForm").addEventListener("submit",async e=>{e.preventDefault();const feedback=$("#courseFeedback");feedback.textContent="Création…";const title=$("#newCourseTitle").value.trim();const slug=$("#newCourseSlug").value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");const {error}=await db.from("courses").insert({title,slug,category:$("#newCourseCategory").value||"Programmation",description:$("#newCourseDescription").value.trim(),created_by:currentUser.id,is_published:false});if(error){feedback.textContent="Erreur : "+error.message;return;}feedback.textContent="Cours créé en brouillon.";e.target.reset();await loadAdminData();});
$("#createLessonForm").addEventListener("submit",async e=>{e.preventDefault();const feedback=$("#lessonFeedback"),courseId=$("#lessonCourse").value;if(!courseId){feedback.textContent="Choisissez un cours.";return;}feedback.textContent="Ajout…";const {count,error:countError}=await db.from("lessons").select("id",{count:"exact",head:true}).eq("course_id",courseId);if(countError){feedback.textContent="Erreur : "+countError.message;return;}const {error}=await db.from("lessons").insert({course_id:courseId,title:$("#newLessonTitle").value.trim(),content:$("#newLessonContent").value.trim(),position:(count||0)+1,is_published:$("#publishLesson").checked});if(error){feedback.textContent="Erreur : "+error.message;return;}feedback.textContent="Leçon ajoutée.";e.target.reset();await loadAdminData();});
$("#logoutButton").addEventListener("click",async()=>{if(!db)return;const {error}=await db.auth.signOut();if(error){alert(error.message);return;}currentUser=null;$("#dashboard").hidden=true;$("#accountCard").hidden=false;});
async function loadCourses(userId=null){
  const grid=$("#courseGrid");
  if(!db){grid.innerHTML='<div class="loading-card">Connexion à la base de données indisponible.</div>';return;}
  grid.innerHTML='<div class="loading-card">Chargement des formations…</div>';
  const {data,error}=await db.from("courses").select("id,title,slug,description,category").eq("is_published",true).in("category",TECH_CATEGORIES).order("created_at",{ascending:false});
  if(error){
    grid.innerHTML='<div class="loading-card">Impossible de charger les formations pour le moment.</div>';
    $("#courseStatus").textContent="Vérifiez la configuration Supabase et les autorisations de lecture.";
    console.error("Course loading failed",error);
    return;
  }
  if(!data?.length){
    grid.innerHTML='<div class="loading-card">Les premières formations arrivent bientôt. Revenez découvrir les nouveautés !</div>';
    $("#courseStatus").textContent="";
    return;
  }
  grid.innerHTML="";
  for(const course of data){
    const card=document.createElement("article");
    card.className="course-card";
    const tag=document.createElement("span");
    tag.className="course-tag";
    tag.textContent=(course.category||"FORMATION").toUpperCase();
    const title=document.createElement("h3");
    title.textContent=course.title;
    const desc=document.createElement("p");
    desc.textContent=course.description||"Découvrez ce cours et développez vos compétences.";
    const meta=document.createElement("small");
    meta.className="course-meta";
    const {count,error:countError}=await db.from("lessons").select("id",{count:"exact",head:true}).eq("course_id",course.id).eq("is_published",true);
    meta.textContent=countError?"Leçons disponibles":(count||0)+" leçon"+((count||0)>1?"s":"");
    const action=document.createElement("button");
    action.className="course-action";
    action.textContent=userId?"S'inscrire au cours →":"Se connecter pour apprendre →";
    action.addEventListener("click",()=>enroll(course.id,userId));
    card.append(tag,title,desc,meta,action);
    grid.append(card);
  }
  $("#courseStatus").textContent=data.length+" formation"+(data.length>1?"s":"")+" disponible"+(data.length>1?"s":"")+" gratuitement.";
}
async function enroll(courseId,userId){if(!userId){openAuth("login");return;}const {error}=await db.from("enrollments").insert({user_id:userId,course_id:courseId});if(error&&error.code!=="23505"){alert(error.message);return;}alert(error?"Vous êtes déjà inscrit à ce cours.":"Inscription réussie !");await showMember(currentUser);}
function init(){
  if(!db){
    $("#courseGrid").innerHTML='<div class="loading-card">La plateforme de cours sera disponible après configuration de la base de données.</div>';
    return;
  }
  db.auth.onAuthStateChange((_event,session)=>{
    Promise.resolve().then(async()=>{
      if(session?.user){
        await loadCourses(session.user.id);
        await showMember(session.user);
      }else{
        currentUser=null;
        $("#dashboard").hidden=true;
        $("#accountCard").hidden=false;
        await loadCourses();
      }
    });
  });
}
init();


const enCopy={nav:["Home","Courses","About","Contact"],login:"Log in",signup:"Sign up",hero:"Learn to code,<br><em>build</em><br>your future.",lead:"Modern coding courses, accessible to everyone, to grow your skills and bring your projects to life.",start:"Start learning now",discover:"Discover STUDY TECH",note:"Learn at your own pace, wherever you are.",benefits:[["Free courses","Learn without fees, open to everyone."],["Your own pace","Make progress on your schedule."],["All your devices","Desktop, tablet and mobile."],["Active community","Learn and share together."]],courseTitle:"Courses to help you <em>go further.</em>",courseIntro:"Choose a course, learn the foundations and put your knowledge into practice.",aboutTitle:"A platform designed<br>for <em>your success.</em>",aboutText:"We believe everyone can learn to code. STUDY TECH provides accessible resources to help you build your skills and bring your ideas to life.",accountTitle:"Ready to begin<br><em>your journey?</em>",accountText:"Create your account to enrol in courses and track your progress.",accountCard:"Join STUDY TECH",accountDesc:"A free account to learn and grow.",contactTitle:"Have a question? <em>Let's talk.</em>",contactText:"For questions about the platform, contact the STUDY TECH project team.",contactButton:"View project on GitHub ↗"};
let pageLanguage="fr";
function switchPageLanguage(){pageLanguage=pageLanguage==="fr"?"en":"fr";const en=pageLanguage==="en";const t=en?enCopy:null;document.documentElement.lang=pageLanguage;$("#languageSwitch").textContent=en?"FR":"EN";$("#mainNav").querySelectorAll("a").forEach((a,i)=>a.textContent=en?t.nav[i]:["Accueil","Cours","À propos","Contact"][i]);document.querySelectorAll('[data-open-auth="login"]').forEach(b=>b.textContent=en?t.login:"Se connecter");document.querySelectorAll('[data-open-auth="signup"]').forEach(b=>b.textContent=en?t.signup:"S'inscrire");$(".hero h1").innerHTML=en?t.hero:"Apprenez le code,<br><em>construisez</em><br>votre avenir.";$(".lead").textContent=en?t.lead:"Des cours de programmation modernes, accessibles à tous, pour développer vos compétences et réaliser vos projets.";$ (".hero-cta .btn-primary").innerHTML=(en?t.start:"Commencer maintenant")+" <b>→</b>";$(".hero-cta .btn-outline").textContent=en?t.discover:"Découvrir STUDY TECH";$(".hero-note").lastChild.textContent=" "+(en?t.note:"Apprenez à votre rythme, où que vous soyez.");$(".benefits").querySelectorAll("article").forEach((a,i)=>{const fr=[["Cours gratuits","Apprenez sans frais, pour tous."],["À votre rythme","Progressez selon votre disponibilité."],["Tous vos appareils","Ordinateur, tablette et mobile."],["Communauté active","Apprenez et partagez ensemble."]][i];const v=en?t.benefits[i]:fr;a.querySelector("b").textContent=v[0];a.querySelector("small").textContent=v[1];});$(".section-head h2").innerHTML=en?t.courseTitle:"Des cours pour <em>aller plus loin.</em>";$(".section-head p").textContent=en?t.courseIntro:"Choisissez un cours, apprenez les bases et mettez vos connaissances en pratique.";$ (".about h2").innerHTML=en?t.aboutTitle:"Une plateforme pensée<br>pour <em>votre réussite.</em>";$(".about-inner>div>p").textContent=en?t.aboutText:"Nous croyons que chacun peut apprendre à coder. STUDY TECH met à disposition des ressources accessibles pour vous aider à développer vos compétences et réaliser vos idées.";$ (".account h2").innerHTML=en?t.accountTitle:"Prêt à commencer<br><em>votre parcours ?</em>";$(".account>div>p").textContent=en?t.accountText:"Créez votre compte pour vous inscrire aux cours et suivre votre progression.";$ (".account-card h3").textContent=en?t.accountCard:"Rejoignez STUDY TECH";$(".account-card p").textContent=en?t.accountDesc:"Un compte gratuit pour apprendre et progresser.";$ (".contact h2").innerHTML=en?t.contactTitle:"Une question ? <em>Écrivons la suite.</em>";$(".contact p").textContent=en?t.contactText:"Pour toute question concernant la plateforme, contactez l'équipe STUDY TECH.";$ (".contact .btn").textContent=en?t.contactButton:"Voir le projet sur GitHub ↗";}
$("#languageSwitch").addEventListener("click",switchPageLanguage);
