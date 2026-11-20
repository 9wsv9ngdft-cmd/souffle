"use strict";
/* ============ Souffle — partie 1 : données, calculs ============ */
const KEY = "souffle-v1", DAY = 864e5, HR = 36e5, H4 = 4 * HR;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const pad = n => String(n).padStart(2, "0");
const euro = n => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: n < 100 ? 2 : 0 });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const toLocalInput = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const toDateInput = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fmtDate = (t, o) => new Date(t).toLocaleDateString("fr-FR", o || { day: "numeric", month: "long" });
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 2600); }
function ago(ms) { const m = Math.floor(ms / 60000); if (m < 1) return "à l'instant"; if (m < 60) return m + " min"; const h = Math.floor(m / 60); if (h < 48) return h + " h " + pad(m % 60); return Math.floor(h / 24) + " jours"; }
function dur(sec) { if (sec < 3600) return Math.ceil(sec / 60) + " min"; if (sec < 86400) return Math.ceil(sec / 3600) + " h"; return Math.ceil(sec / 86400) + " j"; }

/* Une « journée » va de 4 h à 4 h : une cigarette à 1 h du matin compte pour la veille. */
function dayStart(t) { const d = new Date(t - H4); d.setHours(0, 0, 0, 0); return d.getTime() + H4; }
function dayKey(t) { const d = new Date(t - H4); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

/* ---------- contenu ---------- */
const MS = [
  [1200, "20 minutes", "Ta tension et ton rythme cardiaque redescendent vers la normale."],
  [28800, "8 heures", "Le monoxyde de carbone dans ton sang a baissé de moitié, tes cellules sont mieux oxygénées."],
  [86400, "24 heures", "Le monoxyde de carbone est éliminé. Tes poumons commencent à se nettoyer."],
  [172800, "48 heures", "Le goût et l'odorat s'améliorent. Il n'y a plus de nicotine dans ton corps."],
  [259200, "72 heures", "Respirer devient plus facile, tes bronches se relâchent. Plus d'énergie."],
  [1209600, "2 semaines", "Ta circulation s'améliore : marcher et monter les escaliers devient plus facile."],
  [7776000, "3 mois", "Ta capacité pulmonaire progresse nettement, tu tousses moins."],
  [23328000, "9 mois", "Les cils de tes bronches ont repoussé : moins d'infections, moins d'essoufflement."],
  [31536000, "1 an", "Ton risque d'infarctus est divisé par deux."],
  [157680000, "5 ans", "Ton risque d'AVC se rapproche de celui d'un non-fumeur."],
  [315360000, "10 ans", "Ton risque de cancer du poumon est environ divisé par deux."],
  [473040000, "15 ans", "Ton risque cardiovasculaire rejoint celui d'un non-fumeur."]
];
const TIPS = [
  "⏱️ Repousse de 10 minutes. Puis encore 10.",
  "💧 Bois un grand verre d'eau, lentement.",
  "🚶 Bouge : fais le tour du pâté de maisons ou monte un étage à pied.",
  "🍬 Occupe ta bouche : chewing-gum, fruit, bâton de réglisse.",
  "📱 Envoie un message à quelqu'un qui te soutient.",
  "🖐️ Occupe tes mains : stylo, balle anti-stress, vaisselle.",
  "🧠 Rappelle-toi : l'envie va passer, que tu fumes ou non."
];
const ANEC = [
  "La nicotine atteint ton cerveau en une dizaine de secondes. Ton envie, elle, dure 3 à 5 minutes : tu as le temps de gagner.",
  "20 minutes après la dernière cigarette, ton rythme cardiaque commence déjà à redescendre.",
  "Après 24 à 48 h sans fumer, le monoxyde de carbone a quitté ton sang : ton cœur respire mieux.",
  "Le goût et l'odorat reviennent en quelques jours. Les premiers repas deviennent un festival.",
  "Une cigarette contient des milliers de composés chimiques, dont environ 70 sont cancérigènes.",
  "Un an après l'arrêt, le risque d'infarctus est à peu près divisé par deux.",
  "La plupart des anciens fumeurs ont essayé plusieurs fois avant d'y arriver. Chaque essai t'apprend quelque chose.",
  "Bouger seulement 5 à 10 minutes suffit souvent à faire baisser une envie.",
  "Les poumons se nettoient peu à peu : la toux du début est souvent bon signe, c'est le ménage qui commence.",
  "À 13 € le paquet de 20, chaque cigarette non fumée, c'est 65 centimes qui restent dans ta poche.",
  "Une envie, c'est une vague : tu peux la regarder monter et redescendre sans la suivre.",
  "Boire un grand verre d'eau lentement occupe la bouche, les mains et la tête. Simple, et ça marche.",
  "Le cerveau s'habitue vite aux nouveaux rituels : 2 à 3 semaines suffisent pour que le café sans clope devienne normal.",
  "Chaque envie surmontée affaiblit un peu la suivante.",
  "Ton corps commence à se réparer dès les premières heures. Tu n'as rien à attendre pour que ça serve."
];
const QUIZ = [
  ["Combien de temps dure en général une envie de fumer ?", ["3 à 5 minutes", "1 heure", "Toute la journée"], 0, "Une envie monte, atteint un pic puis redescend en quelques minutes, que tu fumes ou non."],
  ["Quel est le numéro de Tabac Info Service ?", ["15", "39 89", "3631"], 1, "Le 39 89 est gratuit : des tabacologues t'y répondent."],
  ["Combien de temps après l'arrêt le monoxyde de carbone quitte-t-il le sang ?", ["24 à 48 heures", "Un mois", "Un an"], 0, "En un à deux jours, ton sang transporte de nouveau bien l'oxygène."],
  ["Un an après l'arrêt, le risque d'infarctus est…", ["inchangé", "à peu près divisé par deux", "multiplié par deux"], 1, "Les bénéfices sur le cœur arrivent très vite, bien avant les 10 ans."],
  ["Rechuter une fois, c'est…", ["la preuve que tu n'y arriveras pas", "très fréquent et ça fait partie du chemin", "interdit"], 1, "Beaucoup d'ex-fumeurs ont eu plusieurs essais avant le bon. On repart, c'est tout."],
  ["Combien de temps la nicotine met-elle à atteindre le cerveau ?", ["10 secondes environ", "10 minutes", "1 heure"], 0, "C'est ce qui rend la cigarette si addictive. Les substituts agissent beaucoup plus doucement."],
  ["À 13 € le paquet de 20, 10 cigarettes par jour coûtent environ…", ["600 € par an", "2 400 € par an", "10 000 € par an"], 1, "10 × 0,65 € × 365 jours ≈ 2 370 € par an."],
  ["Pour calmer une envie, quoi marche bien ?", ["Bouger 5 à 10 minutes", "Rester immobile à y penser", "Boire un café en fumant"], 0, "Une courte activité physique fait baisser l'envie. Tu as une séance de 7 minutes dans l'onglet SOS."],
  ["Que deviennent le goût et l'odorat après l'arrêt ?", ["Ils reviennent en quelques jours", "Rien ne change", "Ils disparaissent"], 0, "Les papilles et les capteurs de l'odorat se remettent vite."],
  ["Les symptômes de manque sont en général les plus forts…", ["la première semaine", "au bout d'un an", "jamais"], 0, "Puis ça s'atténue. Si ça ne passe pas, parles-en à ton pharmacien ou au 39 89."],
  ["Une envie qu'on laisse passer…", ["revient toujours plus fort", "tend à être suivie d'envies plus espacées", "ne change rien"], 1, "Chaque vague surmontée affaiblit la suivante."],
  ["Qui peut t'aider à choisir un dosage de substituts ?", ["Une appli", "Ton médecin ou ton pharmacien", "Un ami"], 1, "Souffle ne conseille jamais de dosage. Ton médecin, ton pharmacien ou le 39 89 le feront bien mieux."]
];
const ADV = {
  ok: ["Bravo, c'est exactement ça. 🎉 Garde la lancée : un verre d'eau, et on enchaîne.", "Super ! Chaque heure tenue compte. Tu peux t'offrir 30 secondes de quiz pour fêter ça.", "Tu gères. Cette réussite, note-la dans ta tête : elle servira à la prochaine envie."],
  sub: ["Bien joué : tu as remplacé au lieu de fumer, c'est le but d'un relais. 👍", "Un relais, ça compte. Essaie de boire de l'eau ensuite pour occuper la bouche.", "Parfait : ça fait partie du jeu. Reste à l'écoute de ton envie, pas besoin d'en faire plus."],
  smoke: ["Ce n'est pas un échec, c'est une info. 💛 Qu'est-ce qui l'a déclenchée ? Plus tu le sais, plus tu anticipes.", "Ça arrive à tout le monde. Respire 3 minutes, bois de l'eau, et repars de zéro sur la prochaine heure.", "Un écart ne remet rien à zéro. On note, on respire, on repart."]
};
const VERSION = "3.2 · 20 novembre 2026";
const INFOS = [
  ["Une envie, c'est une vague", "Elle monte, atteint un pic, puis redescend en quelques minutes, même si tu ne fumes pas. Plus tu en laisses passer, plus elles s'espacent."],
  ["Commence par les cigarettes automatiques", "Café, voiture, sortie du travail… Celles que tu fumes par habitude sont souvent les plus faciles à supprimer en premier. Regarde tes déclencheurs dans Stats."],
  ["Attention à la compensation", "En réduisant, on a tendance à tirer plus fort ou à fumer jusqu'au filtre. Essaie de garder ta façon de fumer habituelle."],
  ["Réduire, c'est une étape", "Même quelques cigarettes par jour gardent un risque cardiovasculaire nettement plus élevé que zéro. La réduction est un excellent tremplin vers l'arrêt complet."],
  ["Souffle sur ton écran d'accueil", "Ouvre le lien de Souffle dans Safari, puis Partager → Sur l'écran d'accueil. L'icône ouvre toujours la dernière version : pas d'App Store, pas de mise à jour à faire. Si tu ne vois pas une nouveauté, ferme l'appli et rouvre-la. Tes données restent enregistrées dans ton compte. Version actuelle : " + VERSION + "."],
  ["Et la cigarette électronique ?", "Elle peut t'aider à remplacer des cigarettes et à occuper tes mains, avec ou sans nicotine. Elle n'est pas sans risque, c'est un outil de transition : l'objectif reste de réduire jusqu'à zéro. Avec nicotine, le dosage se choisit avec ton médecin ou ton pharmacien, pas avec une appli."],
  ["Bien utiliser les patchs et les gommes", "Ils calment le manque et aident à réduire comme à arrêter. Ils peuvent être pris en charge sur prescription. Un dosage inadapté est une cause fréquente de manque qui persiste : ajuste-le avec ton médecin ou ton pharmacien, jamais seul·e."],
  ["Ta montre peut t'aider", "Sur ton Apple Watch, l'app Pleine conscience propose Respirer et Réflexion (1 à 5 min). Dans l'app Watch de ton iPhone : Ma montre → Pleine conscience, tu règles ses rappels sur tes heures à risque."],
  ["Change ton décor", "Fumer moins, c'est aussi casser les rituels : change de place pour le café, garde le paquet hors de portée, ne rachète pas de briquet."],
  ["Tes rappels", "Une web app ne peut pas t'envoyer de notifications. Tes rappels (8 h, 13 h 30 et 21 h) sont dans l'app Rappels de ton iPhone."],
  ["Tu n'es pas seul·e", "Tabac Info Service (39 89, appel gratuit) propose un accompagnement gratuit par des tabacologues, au téléphone ou via leur appli."]
];
const ENC = [
  "Chaque cigarette en moins compte. Vraiment.",
  "Tu n'as pas besoin d'être parfait, juste de continuer.",
  "Ton corps te remercie déjà, même si tu ne le sens pas encore.",
  "Une envie, c'est une vague : elle monte, puis elle redescend.",
  "Les jours difficiles font partie du chemin, pas un retour en arrière.",
  "Tu reprends le contrôle, une cigarette à la fois.",
  "Noter honnêtement, c'est déjà une victoire.",
  "Ce que tu fais demande du courage. Sois fier·e de toi."
];
const TRIGGERS = ["Café", "Stress", "Après repas", "Alcool", "Ennui", "Pause", "Entourage", "Réveil", "Voiture", "Autre"];
const SYMPTOMS = [
  ["irrit", "Irritabilité, nervosité", "Respire 3 minutes ou fais le circuit 7 min. Prévins tes proches que tu es à fleur de peau."],
  ["anx", "Anxiété", "Respiration lente, marche un peu, limite le café."],
  ["conc", "Difficulté à me concentrer", "Fais des pauses courtes, des tâches simples, aère-toi."],
  ["sleep", "Sommeil perturbé", "Pas de café après 14 h. Si tu portes un patch 24 h et que tu dors mal, parles-en à ton pharmacien."],
  ["faim", "Faim, grignotage", "Grand verre d'eau, fruits ou légumes croquants, chewing-gum sans sucre."],
  ["const", "Constipation", "Bois de l'eau, mange des fibres et bouge un peu."],
  ["toux", "Toux", "C'est normal : tes poumons se nettoient."],
  ["moral", "Moral en baisse", "Parle à quelqu'un et fais une activité qui te fait plaisir."]
];
const EX = ["Jumping jacks", "Chaise contre le mur", "Pompes", "Abdos (crunchs)", "Montées sur une chaise", "Squats", "Dips sur une chaise", "Gainage (planche)", "Montées de genoux sur place", "Fentes", "Pompes avec rotation", "Gainage latéral"];
const EXS = ["Jumping jacks", "Squats", "Pompes", "Abdos (crunchs)", "Montées de genoux sur place", "Gainage (planche)"];
const MISSIONS = {
  reduce: [["r1", "Repousse ta première cigarette de 30 minutes aujourd'hui."], ["r2", "Pas de cigarette avec le café ce matin : bois-le près d'une fenêtre ou en marchant."], ["r3", "Range ton paquet dans une autre pièce, hors de portée."], ["r4", "Note pourquoi tu fumes ta cigarette d'après le déjeuner : habitude, ennui, stress ?"], ["r5", "Quand une envie arrive, attends 10 minutes avant de fumer. Chronomètre-toi."], ["r6", "Fume ta prochaine cigarette debout, sans téléphone, en y pensant vraiment. Elle t'a plu ?"], ["r7", "Change ta routine après le repas : brosse-toi les dents ou marche 5 minutes."], ["r8", "N'en finis aucune aujourd'hui : éteins-les à la moitié."]],
  prep: [["p1", "Choisis une récompense pour le jour J et écris-la."], ["p2", "Prévois ta parade pour ton moment le plus risqué."], ["p3", "Dis à une personne de confiance quel jour tu arrêtes."], ["p4", "Jette un cendrier ou un briquet dès aujourd'hui."], ["p5", "Relis tes raisons d'arrêter à voix haute."]],
  quit: [["q1", "Lave ta veste préférée pour enlever l'odeur de tabac."], ["q2", "Note une chose que tu sens ou goûtes mieux depuis que tu as arrêté."], ["q3", "Prépare ta réponse si on te propose une cigarette."], ["q4", "Fais 10 minutes de marche à l'air libre."], ["q5", "Change l'endroit où tu avais l'habitude de fumer."], ["q6", "Bois 1,5 l d'eau aujourd'hui."]],
  all: [["a1", "Fais le circuit 7 minutes (SOS → Bouger)."], ["a2", "Lance Respirer 2 fois sur ta montre ⌚."], ["a3", "Envoie un message à quelqu'un qui te soutient."], ["a4", "Calcule ce que tu feras avec l'argent économisé ce mois-ci."], ["a5", "Prends 10 minutes de grand air."]]
};
const CHECK = [
  ["conf", "Confirmer ma date"],
  ["proches", "Prévenir mes proches"],
  ["subs", "Avoir mes patchs et gommes d'avance (et demander conseil au pharmacien sur le dosage)"],
  ["risk", "Repérer mes 3 moments à risque et prévoir une parade pour chacun"],
  ["trash", "Jeter cendriers, briquets et paquets la veille"],
  ["reward", "Prévoir une activité ou une récompense pour le jour J"]
];

/* ---------- état ---------- */
let S = null;
function defaults() {
  return {
    v: 3, mode: "reduce", start: Date.now(), baseline: 15, pace: 3, packPrice: 13, perPack: 20,
    quitAt: null, quitFrom: null, dDay: null, launched: false,
    smokes: [], cravings: [], gums: [], vapes: [], ci: [], fun: { quiz: 0, ok: 0, anec: 0 }, patches: {}, symptoms: [], missions: {}, workouts: [], check: {},
    subs: { patch: false, gum: false, vape: false, vapeNic: "", vapePrice: 0, vapeDays: 7, patchMg: "", gumMg: "", patchPrice: 0, patchPer: 7, gumPrice: 0, gumPer: 30 },
    reasons: [], goal: "", goalPrice: 0, badges: {}, updatedAt: Date.now()
  };
}
function quitFromFor(s) {
  const q = s.quitAt, ds = dayStart(q);
  return ds + (s.smokes.some(x => dayStart(x.t) === ds) ? DAY : 0);
}
function migrate(s) {
  if (!s) return null;
  const d = defaults();
  if (s.v >= 3) return Object.assign(d, s, { subs: Object.assign(d.subs, s.subs || {}), fun: Object.assign(d.fun, s.fun || {}) });
  if (s.v === 2) { const m = Object.assign(d, s, { v: 3 }); if (m.mode === "quit" && m.quitAt && m.quitFrom == null) m.quitFrom = quitFromFor(m); return m; }
  // v1 : ancienne version « arrêt seul »
  const log = s.log || [];
  const m = Object.assign(d, {
    mode: "quit", start: s.quitAt || Date.now(), quitAt: s.quitAt || Date.now(), baseline: s.perDay || 15, packPrice: s.packPrice || 13, perPack: s.perPack || 20,
    smokes: log.filter(l => !l.ok).map(l => ({ t: l.t, trig: l.trig === "—" ? null : l.trig })),
    cravings: log.filter(l => l.ok).map(l => ({ t: l.t, int: l.int, trig: l.trig === "—" ? null : l.trig })),
    reasons: s.reasons || [], goal: s.goal || "", goalPrice: s.goalPrice || 0
  });
  m.quitFrom = quitFromFor(m);
  return m;
}

/* ---------- sauvegarde ---------- */
let userDoc = null, saveT = null, saving = false, pending = false;
function loadLocal() { try { const r = localStorage.getItem(KEY); return r ? migrate(JSON.parse(r)) : null; } catch (e) { return null; } }
function saveLocal() { try { S ? localStorage.setItem(KEY, JSON.stringify(S)) : localStorage.removeItem(KEY); } catch (e) {} }
function save() { if (S) S.updatedAt = Date.now(); saveLocal(); clearTimeout(saveT); saveT = setTimeout(pushRemote, 600); try { typeof pushSoon === "function" && pushSoon(); } catch (e) {} }
async function pushRemote() {
  if (!userDoc) return;
  if (saving) { pending = true; return; }
  saving = true;
  try { await userDoc.set({ state: S ? JSON.stringify(S) : "" }); } catch (e) {}
  saving = false;
  if (pending) { pending = false; pushRemote(); }
}
async function initRemote() {
  try {
    if (!window.claude || !window.claude.use) return;
    const db = await window.claude.use("db");
    const user = await window.claude.use("user");
    if (!db || !user) return;
    const id = await user.id(); if (!id) return;
    userDoc = db.collection("data/users/" + id).doc("state");
    const snap = await Promise.race([userDoc.get(), new Promise(r => setTimeout(() => r(null), 10000))]);
    const data = snap && (typeof snap.data === "function" ? snap.data() : snap);
    let remote = null;
    if (data && data.state) { try { remote = migrate(JSON.parse(data.state)); } catch (e) {} }
    if (remote && (!S || (remote.updatedAt || 0) > (S.updatedAt || 0))) { S = remote; saveLocal(); boot(); }
    else if (S) pushRemote();
  } catch (e) {}
}

/* ---------- calculs ---------- */
const dayIdx = t => Math.round((dayStart(t) - dayStart(S.start)) / DAY);
const idxStart = i => dayStart(dayStart(S.start) + i * DAY + 6 * HR);
const zeroIdx = () => Math.max(0, (S.baseline - 1) * S.pace);
const effD = () => S.dDay || idxStart(zeroIdx());                  // début du jour J (réel ou prévu)
const daysToD = () => Math.round((effD() - dayStart(Date.now())) / DAY);
function target(i) {
  if (S.mode === "quit" && S.quitFrom != null && idxStart(i) >= S.quitFrom - 2 * HR) return 0;
  let n = Math.max(0, S.baseline - 1 - Math.floor(i / S.pace));
  if (S.dDay) { if (idxStart(i) >= S.dDay - 2 * HR) return 0; n = Math.max(1, n); }
  return n;
}
function tally(arr) { const c = {}; arr.forEach(s => { const i = dayIdx(s.t); if (i >= 0) c[i] = (c[i] || 0) + 1; }); return c; }
const lastSmoke = () => S.smokes.length ? S.smokes.reduce((a, b) => b.t > a.t ? b : a) : null;
function savings() {
  const now = Date.now(), days = Math.max(0, (now - S.start) / DAY), sb = S.subs;
  const since = S.smokes.filter(s => s.t >= S.start).length;
  const avoided = Math.max(0, Math.floor(days * S.baseline) - since);
  const gross = avoided * S.packPrice / S.perPack;
  let cost = 0;
  if (sb.gum && sb.gumPrice > 0) cost += S.gums.filter(g => g.t >= S.start).length * sb.gumPrice / (sb.gumPer || 1);
  if (sb.vape && sb.vapePrice > 0) cost += Math.floor(days) * sb.vapePrice / (sb.vapeDays || 7);
  if (sb.patch && sb.patchPrice > 0) cost += Object.keys(S.patches).length * sb.patchPrice / (sb.patchPer || 1);
  return { avoided, gross, cost, money: Math.max(0, gross - cost) };
}
function freeSec() {
  if (S.mode !== "quit") return 0;
  const ls = lastSmoke(), from = Math.max(S.quitAt || 0, ls ? ls.t : 0);
  return Math.max(0, (Date.now() - from) / 1000);
}
function dayStats() {
  const c = tally(S.smokes), today = dayIdx(Date.now());
  let okDays = 0, streak = 0, bestStreak = 0, minRatio = 1, best = null;
  for (let i = 0; i < today; i++) {
    const n = c[i] || 0, ok = n <= target(i);
    if (ok) { okDays++; streak++; bestStreak = Math.max(bestStreak, streak); } else streak = 0;
    minRatio = Math.min(minRatio, n / S.baseline);
    if (best === null || n < best) best = n;
  }
  return { c, today, okDays, streak, bestStreak, minRatio, best };
}
const vapesToday = () => { const t = dayIdx(Date.now()); return S.vapes.filter(g => dayIdx(g.t) === t).length; };
const gumsToday = () => { const t = dayIdx(Date.now()); return S.gums.filter(g => dayIdx(g.t) === t).length; };
function gumRising() {
  const today = dayIdx(Date.now()); if (today < 3) return false;
  const g = tally(S.gums), a = g[today - 3] || 0, b = g[today - 2] || 0, c = g[today - 1] || 0;
  return a < b && b < c;
}
function subsMg() { // nicotine des substituts aujourd'hui (d'après les doses saisies)
  const sb = S.subs, dk = dayKey(Date.now());
  const gm = sb.gum && +sb.gumMg > 0 ? gumsToday() * +sb.gumMg : 0;
  const pm = sb.patch && +sb.patchMg > 0 && S.patches[dk] ? +sb.patchMg : 0;
  return gm + pm;
}
function topHours() {
  const hrs = Array(24).fill(0), lim = Date.now() - 30 * DAY;
  S.smokes.filter(s => s.t >= lim).forEach(s => hrs[new Date(s.t).getHours()]++);
  return { hrs, top: hrs.map((v, h) => [v, h]).sort((a, b) => b[0] - a[0]).filter(x => x[0] > 0) };
}

/* ---------- missions ---------- */
function phase() {
  if (S.mode === "quit") return "quit";
  const to = daysToD(); return to >= 0 && to <= 7 ? "prep" : "reduce";
}
const hashStr = s => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
function missionPool() { return [...MISSIONS[phase()], ...MISSIONS.all]; }
function missionText(id) { for (const k in MISSIONS) { const m = MISSIONS[k].find(x => x[0] === id); if (m) return m[1]; } return ""; }
function getMission() {
  const dk = dayKey(Date.now());
  if (!S.missions[dk]) { const p = missionPool(); S.missions[dk] = { id: p[hashStr(dk) % p.length][0], done: false, swaps: 0 }; save(); }
  return S.missions[dk];
}
function missionStats() {
  const done = Object.values(S.missions).filter(m => m.done).length;
  let streak = 0, n = 0;
  if (!(S.missions[dayKey(Date.now())] || {}).done) n = 1;       // aujourd'hui pas encore fait : on compte à partir d'hier
  for (; n < 400; n++) { const m = S.missions[dayKey(Date.now() - n * DAY)]; if (m && m.done) streak++; else break; }
  return { done, streak };
}

/* ---------- symptômes ---------- */
function symDayAvg(idx) { const e = S.symptoms.filter(s => dayIdx(s.t) === idx); return e.length ? e.reduce((a, s) => a + s.int, 0) / e.length : null; }
function symBetter() {
  const today = dayIdx(Date.now()), avg = (a, b) => { const v = []; for (let i = a; i <= b; i++) { const x = symDayAvg(i); if (x !== null) v.push(x); } return v.length >= 2 ? v.reduce((p, q) => p + q, 0) / v.length : null; };
  const rec = avg(today - 6, today), pri = avg(today - 13, today - 7);
  return rec !== null && pri !== null && rec < pri;
}
function symAlerts() {
  const today = dayIdx(Date.now()), out = [];
  let strong = 0; for (let i = 0; i < 5; i++) if (S.symptoms.some(s => dayIdx(s.t) === today - i && s.int >= 4)) strong++;
  if (strong >= 3) out.push("Des symptômes forts reviennent depuis plusieurs jours. " + (S.subs.patch || S.subs.gum ? "Ton dosage de substituts n'est peut-être pas suffisant : p" : "P") + "arles-en à ton pharmacien ou au 39 89.");
  const mor = i => S.symptoms.some(s => dayIdx(s.t) === today - i && s.list.includes("moral"));
  if (mor(0) && mor(1) && mor(2)) out.push("Ton moral est en baisse depuis 3 jours. Pense à en parler à ton médecin.");
  return out;
}
function relayDay() { const c = tally(S.smokes), g = tally(S.gums.concat(S.vapes)), t = dayIdx(Date.now()); for (let i = 0; i <= t; i++) if ((g[i] || 0) > 0 && (g[i] || 0) > (c[i] || 0)) return true; return false; }

/* ---------- badges ---------- */
const B = (id, e, n, d, cat, fn) => ({ id, e, n, d, cat, fn });
const BADGES = [
  B("start", "🌱", "Premier pas", "Tu as commencé", "Démarrage", c => true),
  B("honest", "📝", "Honnête", "Noter une cigarette", "Démarrage", c => c.smokes > 0),
  B("reasons", "💬", "Mes raisons", "Écrire 3 raisons", "Démarrage", c => c.reasons >= 3),
  B("goal", "🎁", "Cadeau mérité", "Atteindre ton objectif d'achat", "Démarrage", c => c.goalDone),
  B("target1", "🎯", "Dans le mille", "1 journée dans l'objectif", "Réduction", c => c.okDays >= 1),
  B("streak3", "🔥", "Sur la lancée", "3 jours de suite dans l'objectif", "Réduction", c => c.bestStreak >= 3),
  B("streak7", "☄️", "Inarrêtable", "7 jours de suite dans l'objectif", "Réduction", c => c.bestStreak >= 7),
  B("streak14", "🌋", "Increvable", "14 jours de suite dans l'objectif", "Réduction", c => c.bestStreak >= 14),
  B("cut25", "✂️", "Un quart en moins", "Une journée à −25\u00a0%", "Réduction", c => c.minRatio <= .75),
  B("cut50", "🌓", "Moitié moins", "Une journée à −50\u00a0%", "Réduction", c => c.minRatio <= .5),
  B("cut75", "🌒", "Presque libre", "Une journée à −75\u00a0%", "Réduction", c => c.minRatio <= .25),
  B("zero", "🌞", "Journée sans tabac", "Une journée entière à zéro", "Réduction", c => c.minRatio === 0),
  B("crav1", "💪", "Résistant", "1 envie surmontée", "Envies", c => c.crav >= 1),
  B("crav10", "🛡️", "Bouclier", "10 envies surmontées", "Envies", c => c.crav >= 10),
  B("crav25", "⚔️", "Guerrier", "25 envies surmontées", "Envies", c => c.crav >= 25),
  B("crav50", "🏰", "Forteresse", "50 envies surmontées", "Envies", c => c.crav >= 50),
  B("crav100", "🗻", "Montagne", "100 envies surmontées", "Envies", c => c.crav >= 100),
  B("m10", "🪙", "Tirelire", "10 € économisés", "Argent", c => c.money >= 10),
  B("m50", "💶", "Cagnotte", "50 € économisés", "Argent", c => c.money >= 50),
  B("m100", "💰", "Trésor", "100 € économisés", "Argent", c => c.money >= 100),
  B("m200", "💎", "Pépite", "200 € économisés", "Argent", c => c.money >= 200),
  B("m500", "🏝️", "Évasion", "500 € économisés", "Argent", c => c.money >= 500),
  B("m1000", "🏦", "Coffre-fort", "1 000 € économisés", "Argent", c => c.money >= 1000),
  B("av100", "🚭", "100 évitées", "100 cigarettes évitées", "Cigarettes évitées", c => c.avoided >= 100),
  B("av500", "🌿", "500 évitées", "500 cigarettes évitées", "Cigarettes évitées", c => c.avoided >= 500),
  B("av1000", "🌳", "1 000 évitées", "1 000 cigarettes évitées", "Cigarettes évitées", c => c.avoided >= 1000),
  B("av5000", "🌲", "5 000 évitées", "5 000 cigarettes évitées", "Cigarettes évitées", c => c.avoided >= 5000),
  B("free1", "🌬️", "24 h libre", "24 h sans fumer", "Sans fumer", c => c.free >= DAY / 1000),
  B("free3", "🌤️", "3 jours libre", "3 jours sans fumer", "Sans fumer", c => c.free >= 3 * DAY / 1000),
  B("free7", "🗓️", "1 semaine libre", "7 jours sans fumer", "Sans fumer", c => c.free >= 7 * DAY / 1000),
  B("free14", "🌈", "2 semaines libre", "14 jours sans fumer", "Sans fumer", c => c.free >= 14 * DAY / 1000),
  B("free30", "🏆", "1 mois libre", "30 jours sans fumer", "Sans fumer", c => c.free >= 30 * DAY / 1000),
  B("free60", "🥇", "2 mois libre", "60 jours sans fumer", "Sans fumer", c => c.free >= 60 * DAY / 1000),
  B("free100", "💯", "100 jours libre", "100 jours sans fumer", "Sans fumer", c => c.free >= 100 * DAY / 1000),
  B("free180", "🎖️", "6 mois libre", "180 jours sans fumer", "Sans fumer", c => c.free >= 180 * DAY / 1000),
  B("free365", "👑", "1 an libre", "365 jours sans fumer", "Sans fumer", c => c.free >= 365 * DAY / 1000),
  B("subs1", "🩹", "Bien accompagné", "Noter un premier substitut", "Substituts", c => c.subs > 0),
  B("relay", "📉", "Relais", "Une journée avec plus de substituts que de cigarettes", "Substituts", c => c.relay),
  B("wk1", "🏃", "Premier circuit", "1 séance de 7 minutes", "Mouvement", c => c.wk >= 1),
  B("wk10", "🏋️", "Sportif", "10 séances", "Mouvement", c => c.wk >= 10),
  B("ms1", "✅", "Première mission", "1 mission faite", "Missions", c => c.msDone >= 1),
  B("ms7", "📋", "Habitué", "7 missions faites", "Missions", c => c.msDone >= 7),
  B("ms30", "🎓", "Expert", "30 missions faites", "Missions", c => c.msDone >= 30),
  B("msS7", "🔗", "Série de 7", "7 jours de missions d'affilée", "Missions", c => c.msStreak >= 7),
  B("dd_date", "📅", "Date choisie", "Choisir ton jour J", "Jour J", c => c.dDate),
  B("dd_check", "☑️", "Prêt·e", "Checklist du jour J complète", "Jour J", c => c.check),
  B("dd_go", "🚀", "Jour J", "Lancer l'arrêt le jour J", "Jour J", c => c.launched),
  B("quit", "🚭", "Le grand saut", "Passer à l'arrêt total", "Jour J", c => c.quit),
  B("fq5", "🎯", "Curieux·se", "5 bonnes réponses au quiz", "Fun", c => c.fq >= 5),
  B("fq15", "🧠", "Pro du quiz", "15 bonnes réponses au quiz", "Fun", c => c.fq >= 15),
  B("better", "🌤️", "Ça va mieux", "Symptômes de manque en baisse sur 7 jours", "Santé", c => c.symBetter)
];
function badgeCtx() {
  const ds = dayStats(), sv = savings(), ms = missionStats();
  return {
    smokes: S.smokes.length, okDays: ds.okDays, bestStreak: ds.bestStreak, minRatio: ds.today > 0 ? ds.minRatio : 1,
    crav: S.cravings.length, money: sv.money, avoided: sv.avoided, free: freeSec(), quit: S.mode === "quit",
    subs: S.gums.length + S.vapes.length + Object.keys(S.patches).length, fq: S.fun.ok, relay: relayDay(), wk: S.workouts.length,
    msDone: ms.done, msStreak: ms.streak, dDate: !!S.dDay, check: CHECK.every(c => S.check[c[0]]), launched: S.launched,
    symBetter: symBetter(), goalDone: !!(S.goal && S.goalPrice > 0 && sv.money >= S.goalPrice), reasons: S.reasons.length
  };
}
