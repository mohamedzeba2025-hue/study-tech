const translations = {
  fr: {
    announcement:"L'apprentissage doit être accessible à tous.",navHome:"Accueil",navCourses:"Cours",navAbout:"À propos",navContact:"Contact",login:"Connexion",join:"S'inscrire",
    eyebrow:"LA TECHNOLOGIE AU SERVICE DU SAVOIR",heroTitle:'Apprends aujourd\'hui.<br><span>Construis demain.</span>',heroText:"Développe tes compétences, découvre de nouvelles idées et avance à ton rythme avec une plateforme pensée pour apprendre autrement.",explore:"Explorer les cours",discover:"Découvrir STUDY TECH",proof:"Un espace pour apprendre, partager et progresser.",learning:"EN APPRENTISSAGE",cardCaption:"Ton prochain chapitre commence ici.",progress:"Ton parcours",noteTech:"Compétences numériques",noteFree:"Apprendre librement",
    statOneTitle:"Accessible",statOneText:"Un apprentissage ouvert à tous",statTwoTitle:"Flexible",statTwoText:"Sur mobile et ordinateur",statThreeTitle:"Évolutif",statThreeText:"Apprendre à son propre rythme",
    coursesEyebrow:"APPRENDS DE NOUVELLES CHOSES",coursesTitle:'Explore nos domaines<br><span>d\'apprentissage.</span>',coursesIntro:"Des bases essentielles aux compétences de demain, découvre les sujets qui t'aideront à aller plus loin.",courseOne:"Informatique & technologie",courseOneText:"Comprendre le numérique et maîtriser les outils technologiques.",courseTwo:"Développement web",courseTwoText:"Découvrir comment imaginer et créer des expériences sur le web.",courseThree:"Compétences numériques",courseThreeText:"Renforcer les compétences utiles dans le monde connecté.",learnMore:"Découvrir le domaine",courseDisclaimer:"Les domaines ci-dessus présentent les catégories prévues. Les cours détaillés seront ajoutés progressivement.",
    aboutEyebrow:"NOTRE VISION",aboutTitle:"Le savoir ouvre<br>de nouvelles portes.",aboutText:"STUDY TECH est un espace d'apprentissage en construction, avec une ambition simple : rendre les connaissances et les ressources éducatives plus accessibles, pour permettre à chacun de développer son potentiel.",joinCommunity:"Rejoindre la communauté",
    signupEyebrow:"TON PARCOURS COMMENCE ICI",signupTitle:'Prêt à apprendre<br><span>quelque chose de nouveau ?</span>',signupText:"L'inscription sera ouverte à tous. L'espace membre sera activé après la mise en place du système sécurisé de comptes.",signupPanelTitle:"Bientôt, ton espace d'apprentissage.",signupPanelText:"Nous préparons une expérience simple pour suivre tes cours et retrouver tes ressources.",contactUs:"Nous contacter",noAccountYet:"Les comptes ne sont pas encore activés.",footerText:"Apprendre, progresser et construire son avenir.",rights:"Tous droits réservés.",footerMade:"Conçu pour apprendre sans limites."
  },
  en: {
    announcement:"Learning should be accessible to everyone.",navHome:"Home",navCourses:"Courses",navAbout:"About",navContact:"Contact",login:"Log in",join:"Sign up",
    eyebrow:"TECHNOLOGY IN THE SERVICE OF KNOWLEDGE",heroTitle:'Learn today.<br><span>Build tomorrow.</span>',heroText:"Grow your skills, discover new ideas and move at your own pace with a platform designed for a different way of learning.",explore:"Explore courses",discover:"Discover STUDY TECH",proof:"A place to learn, share and make progress.",learning:"NOW LEARNING",cardCaption:"Your next chapter starts here.",progress:"Your journey",noteTech:"Digital skills",noteFree:"Learn freely",
    statOneTitle:"Accessible",statOneText:"Learning open to everyone",statTwoTitle:"Flexible",statTwoText:"On mobile and desktop",statThreeTitle:"Self-paced",statThreeText:"Learn at your own pace",
    coursesEyebrow:"LEARN SOMETHING NEW",coursesTitle:'Explore our learning<br><span>categories.</span>',coursesIntro:"From essential foundations to tomorrow's skills, discover topics that will help you go further.",courseOne:"IT & technology",courseOneText:"Understand digital technology and master useful tools.",courseTwo:"Web development",courseTwoText:"Discover how to imagine and build experiences for the web.",courseThree:"Digital skills",courseThreeText:"Strengthen the skills needed in a connected world.",learnMore:"Explore category",courseDisclaimer:"The categories above are planned learning areas. Detailed courses will be added progressively.",
    aboutEyebrow:"OUR VISION",aboutTitle:"Knowledge opens<br>new doors.",aboutText:"STUDY TECH is a learning space in development, with a simple ambition: make knowledge and educational resources more accessible so everyone can develop their potential.",joinCommunity:"Join the community",
    signupEyebrow:"YOUR JOURNEY STARTS HERE",signupTitle:'Ready to learn<br><span>something new?</span>',signupText:"Registration will be open to everyone. Member accounts will be activated once the secure account system is ready.",signupPanelTitle:"Your learning space is coming soon.",signupPanelText:"We are preparing a simple experience to follow your courses and find your resources.",contactUs:"Contact us",noAccountYet:"Member accounts are not active yet.",footerText:"Learn, grow and build your future.",rights:"All rights reserved.",footerMade:"Designed for learning without limits."
  }
};
let currentLanguage = "fr";
const languageButton = document.getElementById("languageSwitch");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[language][key]) element.innerHTML = translations[language][key];
  });
  languageButton.textContent = language === "fr" ? "EN" : "FR";
  languageButton.setAttribute("aria-label", language === "fr" ? "Switch to English" : "Passer en français");
}

languageButton.addEventListener("click", () => setLanguage(currentLanguage === "fr" ? "en" : "fr"));
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});
document.getElementById("year").textContent = new Date().getFullYear();