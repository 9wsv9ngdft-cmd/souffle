# Souffle — Cahier des charges

Web app mobile pour **réduire puis arrêter de fumer**.

---

## 1. Objectif

Accompagner la réduction progressive de la cigarette jusqu'à l'arrêt complet, avec :
- un objectif quotidien qui baisse petit à petit ;
- des rappels ;
- des badges ;
- des stats ;
- des infos santé et des encouragements.

---

## 2. Démarrage (onboarding)

Questions posées au premier lancement :
- **Approche** : « Réduire d'abord » ou « Arrêter maintenant »
- **Cigarettes par jour** actuellement (point de départ)
- **Rythme de réduction** (si réduction) :
  - Doux : −1 cigarette tous les 5 jours
  - Régulier : −1 cigarette tous les 3 jours
  - Rapide : −1 cigarette tous les 2 jours
- **Prix du paquet** et **nombre de cigarettes par paquet**
- **Première raison d'arrêter**

L'app affiche ensuite une projection : « À ce rythme, tu atteins zéro vers le *date* ».

---

## 3. Mode Réduction

### Accueil
- Compteur du jour : **cigarettes fumées / objectif du jour** (ex. 4 / 12)
- Couleur verte si on est dans l'objectif, corail si on le dépasse
- « Dernière cigarette il y a X »
- Bouton **« J'en fume une »** → note la cigarette, puis propose de choisir un déclencheur (café, stress, après repas, alcool, ennui, pause, entourage, réveil, voiture, autre). Bouton « Annuler » en cas d'erreur.
- Bouton **SOS envie**
- **Espacement conseillé** : « Essaie de tenir encore X min » (calculé sur ~16 h éveillé ÷ objectif du jour)
- Les journées vont de 4 h à 4 h : une cigarette à 1 h du matin compte pour la veille.

### Passage à l'arrêt
Quand l'objectif du jour atteint 0, l'app propose : « Je passe à l'arrêt total ». On peut aussi le faire à tout moment depuis les réglages, et revenir en réduction sans culpabiliser.

---

## 4. Mode Arrêt total

- Compteur en direct depuis l'arrêt (jours, heures, minutes, secondes)
- Un écart est noté **sans remettre le compteur à zéro**
- Étapes santé (20 min → 15 ans)

---

## 5. SOS envie

- Minuteur de **3 minutes** (une envie dure 3 à 5 min)
- **Exercice de respiration** animé (inspire 4 s, bloque 2 s, expire 6 s)
- Affiche une de **mes raisons** au hasard
- Idées pour tenir : repousser de 10 min, boire de l'eau, bouger, chewing-gum, appeler quelqu'un, occuper ses mains
- Fin : « J'ai tenu 💪 » (intensité 1–5 + déclencheur) ou « J'ai fumé »
- Rappel : Tabac Info Service, **39 89** (appel gratuit)

### Lien avec l'app Apple « Pleine conscience »
- L'app **Pleine conscience** (séances *Respirer* et *Réflexion*, de 1 à 5 min) est sur l'**Apple Watch**. Sur iPhone, il n'y a pas d'app de respiration intégrée : l'app Santé permet surtout de noter son état d'esprit.
- Une web app ne peut pas lancer l'app Apple ni écrire dans Santé. On garde donc la respiration animée dans Souffle, qui marche partout.
- ✅ **J'ai une Apple Watch** : l'écran SOS affiche un raccourci « Ou lance *Respirer* sur ta montre ⌚ ». On règle aussi les rappels de pleine conscience de la montre sur les heures à risque : *app Apple Watch sur iPhone → Ma montre → Pleine conscience*.

### Option « Bouge 7 minutes »
Une courte séance de sport aide à faire passer une envie. Dans l'écran SOS, on peut choisir **Respirer 3 min** ou **Bouger 7 min**.

- Circuit classique « 7 minutes » : **12 exercices de 30 s**, avec **10 s de pause** entre chaque. On n'a besoin que d'une chaise et d'un mur :
  1. Jumping jacks
  2. Chaise contre le mur
  3. Pompes
  4. Abdos (crunchs)
  5. Montées sur une chaise
  6. Squats
  7. Dips sur une chaise
  8. Gainage (planche)
  9. Montées de genoux sur place
  10. Fentes
  11. Pompes avec rotation
  12. Gainage latéral
- Minuteur guidé dans Souffle : nom de l'exercice, compte à rebours et exercice suivant (bip ou vibration si possible).
- Version **courte** (3 min, 6 exercices), pratique quand on est au bureau.
- Chaque séance compte comme une envie surmontée et s'ajoute aux stats.
- Nouveaux badges : 🏃 **Premier circuit** (1 séance) et 🏋️ **Sportif** (10 séances).
- ✅ **Décidé** : le circuit est **intégré à Souffle**, pas d'app externe.

---

## 6. Rappels

> ⚠️ Une web app ne peut pas envoyer de notifications de façon fiable. Les rappels seraient donc créés dans l'**app Rappels du téléphone**.

Rappels proposés :
| Moment | Message |
|---|---|
| Matin (ex. 8 h) | « Ton objectif du jour : X cigarettes. Tu peux le faire. » |
| Après le café / repas (heures à risque) | « Moment à risque : repousse de 10 minutes. » |
| Soir (ex. 21 h) | « Comment s'est passée ta journée ? Note tes cigarettes. » |
| Chaque baisse d'objectif | « Nouvel objectif : −1 cigarette à partir d'aujourd'hui. » |

✅ **Horaires validés :** tous les jours à **8 h** (objectif du jour), **13 h 30** (après le déjeuner, moment à risque) et **21 h** (bilan de la journée). Le rappel de baisse d'objectif arrive le matin des jours concernés.

---

## 7. Stats

- Moyenne par jour sur 7 jours
- **Réduction en %** par rapport à avant
- Série de jours dans l'objectif
- Meilleure journée
- **Graphique des 14 derniers jours** (barres + trait d'objectif)
- **Heures à risque** (répartition sur 24 h, 30 derniers jours)
- **Déclencheurs** les plus fréquents, avec une astuce : « Attaque en premier la cigarette *Café* »
- Historique (cigarettes + envies surmontées)
- Argent économisé, cigarettes évitées, vie regagnée (estimation ~20 min par cigarette, étude UCL 2024)

---

## 8. Badges

| Badge | Condition |
|---|---|
| 🌱 Premier pas | Commencer |
| 📝 Honnête | Noter une première cigarette |
| 🎯 Dans le mille | 1 journée dans l'objectif |
| 🔥 Sur la lancée | 3 jours de suite dans l'objectif |
| ☄️ Inarrêtable | 7 jours de suite dans l'objectif |
| 💪 Résistant | 1 envie surmontée |
| 🛡️ Bouclier | 10 envies surmontées |
| 🏰 Forteresse | 50 envies surmontées |
| ✂️ Un quart en moins | Une journée à −25 % |
| 🌓 Moitié moins | Une journée à −50 % |
| 🌒 Presque libre | Une journée à −75 % |
| 🌞 Journée sans tabac | Une journée entière à zéro |
| 🪙 Tirelire | 10 € économisés |
| 💶 Cagnotte | 50 € économisés |
| 💰 Trésor | 100 € économisés |
| 🏝️ Évasion | 500 € économisés |
| 🚭 Le grand saut | Passer à l'arrêt total |
| 🌬️ 24 h libre | 24 h sans fumer |
| 🗓️ 1 semaine libre | 7 jours sans fumer |
| 🏆 1 mois libre | 30 jours sans fumer |
| 👑 1 an libre | 365 jours sans fumer |

### Badges en plus ✅ *(inspirés de QuitNow!)*
Pour avoir une récompense régulièrement :

| Catégorie | Paliers |
|---|---|
| Jours sans fumer | 3 j · 14 j · 60 j · 100 j · 6 mois |
| Cigarettes évitées | 100 · 500 · 1 000 · 5 000 |
| Argent économisé | 200 € · 1 000 € |
| Missions faites | 1 · 7 · 30 · série de 7 jours |
| Jour J | 📅 Date choisie · ✅ Checklist complète · 🚀 Jour J |
| Symptômes | 🌤️ « Ça va mieux » : symptômes en baisse sur 7 jours |

Au total, **une cinquantaine de badges**.

Un écran de célébration s'affiche quand on débloque un badge.

---

## 9. Encouragements

- **Message du jour** qui change chaque jour (« Chaque cigarette en moins compte. », « Tu reprends le contrôle, une cigarette à la fois. »…)
- **Messages selon la situation** :
  - « À cette heure-ci hier, tu en étais à 6. Tu fais mieux aujourd'hui ! »
  - « Objectif du jour atteint. Tiens jusqu'à ce soir et la journée est validée. »
  - Si l'objectif est dépassé : message bienveillant, sans culpabiliser
  - « 🔥 4 jours de suite dans l'objectif »
- **Mes raisons** : liste perso, rappelée dans les moments SOS
- **Objectif d'achat** : « Un week-end à la mer — 42 € / 300 € »

---

## 10. Infos

**Ton corps se répare** : étapes santé depuis la dernière cigarette (mode réduction) ou depuis l'arrêt (mode arrêt), de 20 minutes à 15 ans.

**Bon à savoir** :
- Une envie est une vague : elle passe en quelques minutes.
- Supprimer d'abord les cigarettes « automatiques » (café, voiture…).
- Attention à la compensation : en réduisant, on tire plus fort sur chaque cigarette.
- Réduire est une étape : même quelques cigarettes par jour gardent un risque cardiovasculaire élevé.
- Les substituts nicotiniques aident aussi à réduire (remboursés sur prescription).
- Casser les rituels : changer de place, éloigner le paquet.
- Tabac Info Service : accompagnement gratuit par des tabacologues.

---

## 11. Technique

- Une seule page web, pensée pour le téléphone, avec un mode sombre automatique
- Données privées, enregistrées dans le compte (synchronisées entre appareils)
- 5 onglets : **Accueil · SOS · Stats · Badges · Infos**
- **Écran d'accueil et mises à jour** : l'icône ajoutée à l'écran d'accueil (Safari → Partager → Sur l'écran d'accueil) ouvre le lien de l'appli, donc la dernière version publiée, sans mise à jour manuelle. Si une nouveauté n'apparaît pas, fermer et rouvrir l'appli. Les données sont dans le compte, pas sur l'icône. Le numéro de version est affiché dans Infos pour vérifier.
- Réglages : départ, rythme, prix, objectif d'achat, changement de mode, tout effacer

---

## 12. Suivi des substituts nicotiniques ✅

Inspiré de Kwit. Les substituts aident à réduire comme à arrêter.

### Réglage
Dans les réglages, on coche « J'utilise des substituts », puis on choisit ses produits et leur dosage tel qu'il est écrit sur la boîte :
- **Patch** : 24 h ou 16 h, dosage en mg
- **Gomme** (mg)
- **Pastille / comprimé** (mg)
- **Inhaleur**, **spray buccal** (mg par prise)

✅ **Mes substituts : patchs + gommes à mâcher.** L'app affiche seulement ces deux-là. Les autres restent disponibles dans les réglages si besoin un jour.

### Au quotidien
- Sur l'accueil, un bouton **« + Gomme »** à côté de « J'en fume une » : on note une gomme en 1 tap.
- **Patch** : on coche « Patch posé » le matin. Le rappel de 8 h ajoute « Pense à ton patch ».
- Quand une envie passe grâce à une gomme ou une pastille, on peut la noter comme **envie surmontée**.

### Stats
- Nombre de gommes, pastilles ou prises par jour, et patch du jour
- **Nicotine du jour par source** : cigarettes et substituts (dose écrite sur la boîte, à titre indicatif)
- Graphique sur 14 jours : on voit les cigarettes baisser pendant que les substituts prennent le relais
- Coût des substituts, déduit de l'argent économisé (prix de la boîte à renseigner)

### Infos et garde-fous
- Fiche « Bien utiliser les substituts » : ils sont remboursés sur prescription, et un dosage trop faible fait souvent échouer.
- Souffle **ne conseille aucun dosage**. Message affiché : « Pour choisir ou ajuster ton dosage, demande à ton médecin, ton pharmacien ou au 39 89. »
- Si les gommes ou pastilles augmentent plusieurs jours de suite, message doux : « Tu en prends plus en ce moment, parles-en à ton pharmacien. »

### Badges
- 🩹 **Bien accompagné** : premier substitut noté
- 📉 **Relais** : une journée avec plus de substituts que de cigarettes

---

## 13. Mission du jour ✅ *(inspirée de Smoke Free)*

- Chaque matin, l'accueil affiche **une petite mission** de moins de 5 minutes. Le rappel de 8 h la mentionne.
- On la coche quand elle est faite, et on peut en **changer une fois par jour**.
- Les missions suivent le mode et le parcours : réduction, préparation du jour J, puis les premières semaines d'arrêt.
- Exemples :
  - Réduction : « Pas de cigarette avec le café ce matin », « Retarde ta première cigarette de 30 min », « Range ton paquet dans une autre pièce », « Écris pourquoi tu fumes ta cigarette de 13 h 30 »
  - Toutes phases : « Fais le circuit 7 minutes », « Lance *Respirer* 2 fois sur ta montre », « Calcule ce que tu feras avec l'argent du mois », « Envoie un message à quelqu'un qui te soutient »
  - Arrêt : « Lave ta veste préférée pour enlever l'odeur », « Note une chose que tu sens ou goûtes mieux », « Prépare ta réponse si on te propose une cigarette »
- Stats : nombre de missions faites et série de jours.

---

## 14. Préparer le jour J ✅ *(inspiré de Tabac Info Service)*

- Le jour J, c'est le jour de l'arrêt total. Par défaut, c'est la date où l'objectif atteint 0, mais on peut la choisir ou l'avancer.
- À partir de **J-7**, l'accueil affiche un compte à rebours et une **checklist** :
  - [ ] Confirmer ma date
  - [ ] Prévenir mes proches
  - [ ] Avoir mes patchs et gommes d'avance (et demander conseil au pharmacien sur le dosage)
  - [ ] Repérer mes 3 moments à risque (tirés des stats) et prévoir une parade pour chacun
  - [ ] Jeter cendriers, briquets et paquets la veille
  - [ ] Prévoir une activité ou une récompense pour le jour J
- Le jour J, un écran de lancement « C'est aujourd'hui 🚭 » passe Souffle en mode arrêt.

---

## 15. Symptômes de manque ✅ *(inspiré de Stop-tabac)*

- Bouton « Je ne me sens pas bien » dans le SOS, et question optionnelle au bilan de 21 h.
- On coche ce qu'on ressent et l'app donne **tout de suite un conseil adapté** :

| Symptôme | Conseil immédiat |
|---|---|
| Irritabilité, nervosité | Respiration ou circuit 7 min, prévenir l'entourage |
| Anxiété | Respiration lente, marcher, limiter le café |
| Difficulté à se concentrer | Pauses courtes, tâches simples, s'aérer |
| Troubles du sommeil | Pas de café après 14 h. Un patch 24 h peut gêner le sommeil : en parler au pharmacien |
| Faim, grignotage | Grand verre d'eau, fruits ou légumes croquants, chewing-gum sans sucre |
| Constipation | Eau, fibres, bouger |
| Toux | Normal : les poumons se nettoient |
| Moral en baisse | Parler à quelqu'un, activité plaisir |

- Message général : « Ces symptômes sont normaux, ils sont plus forts les premiers jours et diminuent en quelques semaines. »
- **Garde-fous** :
  - Si des symptômes forts reviennent plusieurs jours, l'app suggère : « Ton dosage de substituts n'est peut-être pas suffisant. Parles-en à ton pharmacien ou au 39 89. »
  - Si on coche « Moral en baisse » plusieurs jours de suite, l'app suggère d'en parler à son médecin.
- Stats : intensité des symptômes dans le temps, pour **voir qu'ils baissent**.

---

## 16. Cigarette électronique ✅
- Choix « Cigarette électronique » parmi les substituts (onboarding et réglages).
- Réglages : nicotine du liquide en mg/ml (0 = sans nicotine), prix du flacon, durée approximative d'un flacon (pour le coût).
- Bouton **+ Vape** sur l'accueil : chaque pause vape est comptée comme les gommes (stats, historique, badge « Relais », coût déduit des économies).
- Avec nicotine : Souffle affiche la concentration saisie mais **ne conseille jamais de dosage** → médecin, pharmacien, 39 89.
- Message de fond : outil de transition, pas sans risque ; l'objectif reste zéro.

## 17. Pause fun et rappels ludiques ✅
Principe : léger, jamais envahissant, optionnel.
- **Anecdote du jour** sur l'accueil (« Tiens, le savais-tu ? ») avec bouton « Une autre ».
- **Quiz** : 3e onglet du SOS (12 questions, explication après chaque réponse). Bonne réponse = confettis.
- **Confettis** à la mission accomplie, au badge débloqué, à une bonne réponse (coupés si l'appareil demande moins d'animations).
- **Badges Fun** : Curieux·se (5 bonnes réponses), Pro du quiz (15).
- **Rappels** : le texte de la notification est ludique (« Tiens, le savais-tu ? », « Un quiz de 30 secondes ? ») et le lien `#quiz` ouvre directement le quiz.
- **Petit point** (carte sur l'accueil) : « Depuis tout à l'heure, ça s'est passé comment ? » avec 3 réponses : *Rien fumé*, *Gomme ou vape* (notée comme substitut), *J'ai craqué* (ouvre la saisie d'une cigarette). Chaque réponse donne un conseil bienveillant, sans culpabiliser. La carte revient 90 min après.
- **Rythme adaptatif** : sur 3 jours, si les écarts sont fréquents, l'appli propose plus de soutien (rappel en plus, pharmacien, 39 89) ; si tout va bien, elle propose d'espacer les rappels.
- Les rappels du téléphone ne s'adaptent pas seuls : c'est l'appli qui suggère, la personne décide.
- Limite : une notification iPhone ne peut pas contenir de quiz ni d'animation : elle sert d'accroche, le jeu est dans l'appli.

## 18. Rappels sur le téléphone (notifications push) ✅
Même méthode que Wouaf Balades : web push + petit programme Cloudflare.
- Site : https://9wsv9ngdft-cmd.github.io/souffle/ (GitHub Pages), à ajouter à l'écran d'accueil (iOS 16.4 ou plus).
- Programme : `worker/souffle-notifs.js` (Worker « souffle-notifs », KV `SOUFFLE`, cron toutes les 15 min, clés VAPID créées tout seul).
- Réglages › « Rappels sur le téléphone » : activer/désactiver, bouton Tester, 4 intensités :
  - **Auto** : s'adapte au « petit point » (si ça craque, plus de rappels ; si tout va bien, moins) ;
  - **Discret** : 3 par jour (8 h, 13 h 30, 21 h) ;
  - **Normal** : 6 par jour (+ 10 h, 17 h, 18 h 30) ;
  - **Soutien** : jusqu'à 10 par jour (+ 11 h 45, 15 h 30, 19 h 45, 22 h 15).
- Chaque rappel est un petit jeu (quiz, anecdote, défi d'eau, circuit 7 min). Le toucher ouvre l'appli, et le quiz pour les rappels « quiz » et « heure sensible ».
- Pas de rappel dans les 20 min après une saisie, et jamais avant 8 h ni après 22 h 15.
- **Données envoyées au programme** (seulement) : objectif du jour, rythme (« plus » / « moins »), heure de la dernière saisie. Aucun historique, aucun dosage.
- Dans l'appli installée sur Claude, les rappels ne marchent pas : il faut la version GitHub Pages.

## 19. Inspirations : Kwit, Tabac Info Service, Stop-tabac, QuitNow!, Smoke Free

### Kwit

Kwit est une app française d'arrêt du tabac, validée par l'OMS. La version gratuite est sans pub, et un abonnement Premium débloque d'autres fonctions.

| Fonction Kwit | Dans Souffle ? | Proposition |
|---|---|---|
| Compteurs (jours, argent, cigarettes) | ✅ Oui | — |
| Journal des cigarettes et des envies, gestion des rechutes | ✅ Oui | — |
| Trophées | ✅ Badges | Ajouter des **niveaux** (Niv. 1 → 10) qui montent avec les badges |
| Cartes de motivation | 🟡 Message du jour | **Cartes à piocher** : encouragements, défis, citations |
| Respiration guidée | ✅ Oui | + Apple Watch, + 7 minutes (en plus de Kwit) |
| Suivi des substituts (patchs, gommes, pastilles) | ✅ Retenu | Voir section 12 |
| Vapotage | ❌ Non | Plus tard, si besoin |
| Petites actions du jour | ❌ Non | **1 mini-défi par jour** (« Pas de cigarette avec le café », « Marche 10 min ») |
| Humeur et énergie | ❌ Non | **Humeur du soir** (5 smileys) liée au bilan de 21 h |
| Articles d'experts | 🟡 Section Infos | Enrichir avec des fiches courtes |
| Groupes de parole | ❌ Non | Remplacer par un **partage avec un proche** (lien vers tes progrès) |
| Module BPCO | ❌ Non | Pas prévu |

### Autres apps étudiées

| App | Ce qu'elle fait de marquant | Idée pour Souffle |
|---|---|---|
| **Tabac Info Service** (Assurance Maladie, gratuite) | Coaching personnalisé, préparation du **jour J**, choix d'une stratégie dont l'arrêt progressif, questions à un tabacologue, **vidéos de soutien des proches** | **Préparer le jour J** : compte à rebours et checklist quand l'objectif approche de zéro. **Messages de proches** affichés dans le SOS. Lien vers le 39 89 (déjà prévu) |
| **Stop-tabac** (Université de Genève, gratuite) | Aide immédiate pendant les envies **et les symptômes de manque**, messages personnalisés pendant 6 mois, module substituts, fiches | **Symptômes de manque** : noter irritabilité, sommeil, faim, concentration… et recevoir un conseil adapté tout de suite |
| **QuitNow!** | Environ 70 succès (jours, cigarettes évitées, argent), étapes santé basées sur l'OMS, chat communautaire, FAQ | **Plus de badges** (paliers réguliers). Pas de chat |
| **Smoke Free** | **Missions quotidiennes**, journal des envies avec intensité, coach en ligne. Dans un essai sur 28 000 personnes, les missions ont presque **doublé** les chances de rester non-fumeur | **1 mission par jour** : c'est l'idée la mieux prouvée scientifiquement, je la recommande en priorité |

**Ce que Souffle fait en plus de Kwit** : le mode réduction avec un objectif qui baisse, l'espacement conseillé, les heures à risque, le circuit 7 minutes, le raccourci Apple Watch et tout gratuit.

---

## 20. Questions ouvertes

- [x] Horaires des rappels : 8 h · 13 h 30 · 21 h
- [x] Apple Watch : oui → raccourci vers *Respirer* dans le SOS
- [x] 7 minutes : intégré à Souffle
- [ ] Rythme de réduction par défaut ?
- [x] Idées Kwit : **suivi des substituts** retenu
- [x] Idées retenues : mission du jour, préparer le jour J, symptômes de manque, plus de badges
- [x] Non retenues pour l'instant : messages de proches, niveaux, humeur du soir, chat communautaire
- [x] Substituts : patchs + gommes à mâcher
- [x] Rappels : push (section 18). Les 3 rappels de l'app Rappels (8 h, 13 h 30, 21 h) et 3 ajoutés par erreur (10 h, 17 h, 18 h 30) restent à supprimer une fois le push activé, pour éviter les doublons.
- Vape avec nicotine : faut-il aussi suivre le nombre de flacons restants ?
