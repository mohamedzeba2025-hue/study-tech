-- STUDY TECH — catalogue initial de cours gratuits
-- À exécuter dans Supabase > SQL Editor.
-- Les cours déjà présents et les leçons déjà ajoutées ne sont pas écrasés.

insert into public.courses (title, slug, category, description, is_published)
values
('Python — Les bases','python-les-bases','Programmation','Apprenez Python pas à pas : variables, conditions, boucles, fonctions et petits projets.',true),
('Développement Web — HTML, CSS et JavaScript','developpement-web-html-css-js','Développement web','Créez des pages web modernes et interactives avec les technologies fondamentales du web.',true),
('Cybersécurité — Les fondamentaux','cybersecurite-fondamentaux','Cybersécurité','Découvrez les principes de sécurité numérique, les menaces courantes et les bonnes pratiques.',true),
('Réseaux informatiques — Débutant','reseaux-informatiques-debutant','Réseaux','Comprenez les réseaux, les adresses IP, les routeurs et les échanges de données.',true),
('Développement Android — Introduction','developpement-android-introduction','Développement mobile','Découvrez les étapes de création d’une application Android et les outils essentiels.',true),
('Linux — Premiers pas','linux-premiers-pas','Systèmes','Prenez en main Linux, son terminal, les commandes essentielles et la gestion des fichiers.',true)
on conflict (slug) do nothing;

with lesson_data(course_slug,title,position,content) as (
values
('python-les-bases','Bienvenue dans Python',1,$l$# Bienvenue dans Python

Python est un langage de programmation apprécié pour sa syntaxe lisible. Il sert à créer des scripts, des sites web, automatiser des tâches et analyser des données.

Objectifs : comprendre à quoi sert Python, découvrir une instruction et écrire son premier programme.

Premier programme :
    print("Bonjour, STUDY TECH !")

La fonction print() affiche un message à l’écran. Un programme est une suite d’instructions exécutées par l’ordinateur.$l$),
('python-les-bases','Variables et types de données',2,$l$# Variables et types de données

Une variable conserve une valeur pour la réutiliser.

Exemple :
    prenom = "Mohamed"
    age = 18
    taille = 1.75
    est_etudiant = True
    print(prenom)

Types courants :
- str : texte, par exemple "Bonjour".
- int : nombre entier, par exemple 18.
- float : nombre décimal, par exemple 1.75.
- bool : valeur vraie ou fausse (True / False).

Python détermine automatiquement le type à partir de la valeur.$l$),
('python-les-bases','Opérations et saisie utilisateur',3,$l$# Opérations et saisie utilisateur

Python effectue des calculs et demande des informations.

    a = 12
    b = 5
    print(a + b)  # addition
    print(a - b)  # soustraction
    print(a * b)  # multiplication
    print(a / b)  # division

Pour demander un nom :
    nom = input("Quel est ton nom ? ")
    print("Bienvenue", nom)

Attention : input() renvoie du texte. Pour obtenir un entier, utilisez int(input(...)).$l$),
('python-les-bases','Conditions : if, elif et else',4,$l$# Les conditions

Les conditions exécutent un bloc seulement si un test est vrai.

    note = 15
    if note >= 10:
        print("Admis")
    else:
        print("À améliorer")

Pour tester plusieurs cas, utilisez elif. En Python, l’indentation (les espaces au début des lignes) est importante.$l$),
('python-les-bases','Boucles for et while',5,$l$# Les boucles

Une boucle répète des instructions.

Boucle for :
    for nombre in range(1, 6):
        print(nombre)

Cette boucle affiche les nombres de 1 à 5.

Boucle while :
    compteur = 1
    while compteur <= 3:
        print("Tour", compteur)
        compteur += 1

Utilisez for pour parcourir une séquence ou une plage connue. Utilisez while lorsqu’une répétition dépend d’une condition.$l$),
('python-les-bases','Fonctions et mini-projet',6,$l$# Fonctions et mini-projet

Une fonction regroupe des instructions réutilisables.

    def saluer(prenom):
        return "Bonjour " + prenom

    print(saluer("Awa"))

Mini-projet : calculer une moyenne.

    note1 = float(input("Première note : "))
    note2 = float(input("Deuxième note : "))
    note3 = float(input("Troisième note : "))
    moyenne = (note1 + note2 + note3) / 3
    print("Moyenne :", moyenne)

Défi : demandez aussi le nom de l’étudiant et affichez-le avec sa moyenne.$l$),
('developpement-web-html-css-js','Comprendre le fonctionnement du Web',1,$l$# Comprendre le Web

Un site web est consulté avec un navigateur.
- HTML organise le contenu.
- CSS définit l’apparence.
- JavaScript ajoute des interactions.

Dans ce parcours, vous construirez progressivement une page web, puis vous la rendrez responsive et interactive.$l$),
('developpement-web-html-css-js','Créer une page avec HTML',2,$l$# Les bases du HTML

HTML utilise des éléments appelés balises.

Exemple :
    <!doctype html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Ma page</title></head>
    <body>
      <h1>Bonjour le monde</h1>
      <p>Ma première page web.</p>
    </body>
    </html>

Le navigateur interprète ces balises pour afficher le contenu.$l$),
('developpement-web-html-css-js','Mettre en forme avec CSS',3,$l$# Les bases du CSS

CSS contrôle les couleurs, les espacements, les tailles et la disposition.

Exemple :
    body {
      font-family: Arial, sans-serif;
      background: #f2f6ff;
      color: #10213b;
    }
    h1 { color: #087bff; }

Le sélecteur h1 cible les titres de niveau 1.$l$),
('cybersecurite-fondamentaux','Comprendre la cybersécurité',1,$l$# Comprendre la cybersécurité

La cybersécurité regroupe les pratiques qui protègent les appareils, les comptes, les réseaux et les données.

Trois objectifs importants :
- Confidentialité : seules les personnes autorisées accèdent aux informations.
- Intégrité : les informations ne sont pas modifiées sans autorisation.
- Disponibilité : les services restent accessibles.$l$),
('cybersecurite-fondamentaux','Mots de passe et authentification',2,$l$# Protéger ses comptes

Utilisez un mot de passe long et unique pour chaque service. Un gestionnaire de mots de passe peut aider à les conserver.

Activez l’authentification à plusieurs facteurs (MFA). Ne partagez jamais vos codes de vérification.$l$),
('cybersecurite-fondamentaux','Reconnaître le phishing',3,$l$# Reconnaître le phishing

Le phishing (hameçonnage) cherche à obtenir vos identifiants ou informations personnelles.

Signaux d’alerte : message urgent, adresse d’expéditeur inhabituelle, lien trompeur, demande de mot de passe ou de code secret.

En cas de doute, ouvrez le site officiel en saisissant vous-même son adresse.$l$),
('reseaux-informatiques-debutant','Qu’est-ce qu’un réseau ?',1,$l$# Qu’est-ce qu’un réseau ?

Un réseau informatique relie des appareils pour échanger des données et partager des ressources.

Un réseau local (LAN) couvre une zone limitée, comme une maison ou une école. Internet est un réseau mondial de réseaux.$l$),
('reseaux-informatiques-debutant','Adresse IP et routeur',2,$l$# Adresse IP et routeur

Une adresse IP identifie une interface sur un réseau IP. Un routeur transfère les paquets entre différents réseaux.

Exemple d’adresse IPv4 privée : 192.168.1.10. Cette adresse est un exemple pédagogique, pas une adresse à configurer sans vérifier votre réseau.$l$),
('reseaux-informatiques-debutant','DNS et navigation web',3,$l$# Le rôle du DNS

Le DNS traduit un nom de domaine, comme example.com, en adresse IP utilisable par les appareils.

Lorsque vous ouvrez un site, votre appareil doit résoudre le nom du serveur avant d’établir la connexion.$l$),
('developpement-android-introduction','Découvrir le développement Android',1,$l$# Découvrir Android

Le développement Android consiste à créer des applications pour les appareils utilisant Android.

Les applications peuvent être développées notamment avec Kotlin ou Java. Android Studio est l’environnement de développement couramment utilisé.$l$),
('developpement-android-introduction','Préparer son environnement',2,$l$# Préparer son environnement

Pour commencer sur ordinateur :
1. Installer Android Studio depuis le site officiel Android Developers.
2. Installer le SDK Android proposé par l’assistant.
3. Créer un projet de test.
4. Lancer l’application sur un émulateur ou un appareil de test.

Vérifiez la configuration requise avant l’installation.$l$),
('developpement-android-introduction','Structure d’une application',3,$l$# Structure d’une application

Un projet Android contient le code source, les ressources (images, textes, interfaces), les paramètres de compilation et les fichiers de configuration.

Explorez les dossiers du projet avant de modifier le code.$l$),
('linux-premiers-pas','Découvrir Linux et le terminal',1,$l$# Découvrir Linux

Linux est une famille de systèmes d’exploitation de type Unix. Le terminal permet d’interagir avec le système en saisissant des commandes.

Ouvrez un terminal et observez l’invite de commande avant de commencer.$l$),
('linux-premiers-pas','Les commandes essentielles',2,$l$# Premières commandes

    pwd       # afficher le dossier courant
    ls        # lister les fichiers
    cd Documents
    mkdir test

Ces commandes permettent de se repérer et d’organiser ses fichiers. Vérifiez toujours le dossier courant avant une commande qui modifie ou supprime des données.$l$),
('linux-premiers-pas','Fichiers et permissions',3,$l$# Fichiers et permissions

Linux associe des permissions aux fichiers et dossiers : lecture (r), écriture (w) et exécution (x).

La commande ls -l affiche notamment ces permissions. N’utilisez pas sudo sans comprendre son effet.$l$)
)
insert into public.lessons (course_id,title,content,position,is_published)
select c.id,d.title,d.content,d.position,true
from lesson_data d
join public.courses c on c.slug=d.course_slug
where not exists (
  select 1 from public.lessons l
  where l.course_id=c.id and l.title=d.title
);
