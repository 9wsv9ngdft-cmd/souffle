const { chromium } = require("playwright");
const path = "file://" + require("path").resolve(__dirname, "../index.html");
const out = __dirname + "/shots";
require("fs").mkdirSync(out, { recursive: true });
let fails = 0;
const ok = (c, msg) => { console.log((c ? "✓ " : "✗ ") + msg); if (!c) fails++; };

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: "Europe/Paris", locale: "fr-FR", deviceScaleFactor: 2 });
  await ctx.route(/^https?:/, r => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text())) errors.push("console: " + m.text()); });
  await page.clock.install({ time: new Date("2026-11-19T10:00:00+01:00") });
  await page.goto(path);
  const origClick = page.click.bind(page);
  page.click = async (sel, o) => { if (sel !== "#bmOk" && await page.isVisible("#badgeModal.on")) await origClick("#bmOk"); return origClick(sel, o); };
  const E = s => page.evaluate(s);
  const shot = n => page.screenshot({ path: `${out}/${n}.png` });

  // 1. onboarding
  ok(await page.isVisible("#v-setup"), "onboarding visible au premier lancement");
  ok((await E("$('#s-proj').textContent")).includes("Objectif aujourd'hui : 14"), "projection du rythme affichée");
  await shot("01-onboarding");
  await page.fill("#s-why", "Courir sans être essoufflé");
  await page.click("#setupForm button[type=submit]");
  ok(await page.isVisible("#v-home"), "accueil après onboarding");
  ok((await E("$('#hero').textContent")).includes("0 / 14"), "objectif du jour = 14 (15 − 1)");
  ok(await page.isVisible("#subsCard"), "carte substituts visible (patchs + gommes)");
  ok((await E("$('#mission').textContent")).includes("Mission du jour"), "mission du jour affichée");
  await shot("02-accueil");

  // 2. cigarette
  await page.click("#smokeBtn");
  await page.click("#smokeTrig .chip:has-text('Café')");
  ok((await E("$('#hero').textContent")).includes("1 / 14"), "cigarette notée → 1 / 14");
  ok((await E("S.smokes[0].trig")) === "Café", "déclencheur enregistré");
  ok((await E("S.badges.honest")) !== undefined, "badge « Honnête » débloqué");
  await page.click("#bmOk");

  // 3. substituts
  await page.click("[data-act=gum]"); await page.click("[data-act=gum]");
  ok((await E("gumsToday()")) === 2, "2 gommes notées");
  await page.click("[data-act=patch]");
  ok((await E("Object.keys(S.patches).length")) === 1, "patch posé");
  ok(await E("!!S.badges.subs1"), "badge « Bien accompagné »");
  

  // 4. mission
  const m0 = await E("getMission().id");
  await page.click("[data-act=mswap]");
  const m1 = await E("getMission().id");
  ok(m0 !== m1, "« Une autre » change la mission");
  ok((await E("$('#mission').textContent")).indexOf("Une autre") === -1, "swap limité à une fois par jour");
  await page.click("[data-act=mdone]");
  ok(await E("getMission().done"), "mission cochée");
  

  // 5. SOS respiration + séance 7 min
  await page.click("nav [data-go=sos]");
  ok((await E("$('#sosReason').textContent")).includes("Courir sans être essoufflé"), "raison affichée dans le SOS");
  await page.click("#sosSeg [data-v=move]");
  ok(await page.isVisible("#sosMove") && !(await page.isVisible("#sosBreath")), "onglet « Bouger » affiché");
  await shot("03-sos-bouger");
  await page.click("#wkStart");
  await page.clock.runFor(5000);
  ok((await E("$('#wkName').textContent")) === "Jumping jacks", "1er exercice = Jumping jacks");
  await page.clock.runFor(30000);
  ok((await E("$('#wkName').textContent")) === "Pause", "pause après 30 s");
  await page.clock.runFor(10000);
  ok((await E("$('#wkName').textContent")) === "Chaise contre le mur", "2e exercice = chaise contre le mur");
  await shot("04-seance");
  const before = await E("S.cravings.length");
  await page.clock.runFor(8 * 60 * 1000);
  ok((await E("S.workouts.length")) === 1, "séance terminée et enregistrée");
  ok((await E("S.cravings.length")) === before + 1, "la séance compte comme une envie surmontée");
  ok(await E("!!S.badges.wk1"), "badge « Premier circuit »");
  

  // version courte : 6 exercices, 3 minutes
  await page.click("nav [data-go=sos]"); await page.click("#sosSeg [data-v=move]");
  await page.click("#wkSeg [data-v=short]"); await page.click("#wkStart");
  await page.clock.runFor(5000 + 6 * 25000 + 5 * 6000 + 500);
  ok((await E("S.workouts.length")) === 2 && (await E("S.workouts[1].kind")) === "short", "séance courte (3 min) terminée");
  

  // 6. respiration 3 min
  await page.click("nav [data-go=sos]"); await page.click("#sosSeg [data-v=breathe]");
  await page.click("#sosStart"); await page.clock.runFor(181000);
  ok(await page.isVisible("#cravModal.on"), "fin des 3 min → fenêtre « envie surmontée »");
  await page.click("#intensity .chip:has-text('4')"); await page.click("#cravTrig .chip:has-text('Stress')"); await page.click("#cravSave");
  ok((await E("S.cravings[S.cravings.length-1].trig")) === "Stress", "envie enregistrée avec déclencheur");
  

  // 7. symptômes
  await page.click("nav [data-go=sos]");
  await page.click("[data-act=sym]");
  await page.click("#symChips .chip:has-text('Anxiété')");
  await page.click("#symChips .chip:has-text('Sommeil')");
  await page.click("#symInt .chip:has-text('4')");
  await shot("05-symptomes");
  await page.click("#symSave");
  ok((await E("$('#symBody').textContent")).includes("patch 24 h"), "conseil adapté affiché (sommeil)");
  ok((await E("S.symptoms.length")) === 1, "symptômes enregistrés");
  await shot("06-conseils");
  await page.click("#symOk");

  // 8. stats / badges / infos
  await page.click("nav [data-go=stats]");
  ok((await E("$('#chartDays').innerHTML")).includes("<rect"), "graphique 14 jours dessiné");
  ok((await E("$('#chartSym').innerHTML")).includes("<rect"), "graphique symptômes dessiné");
  ok((await E("$('#logList').textContent")).includes("Séance bouger"), "historique contient la séance");
  await shot("07-stats");
  await page.click("nav [data-go=badges]");
  const bc = await E("$('#badgeCount').textContent");
  ok(/sur 49/.test(bc), "badges : " + bc);
  await shot("08-badges");
  await page.click("nav [data-go=infos]");
  ok((await E("$('#infos').textContent")).includes("Ta montre"), "infos : conseil Apple Watch");

  // 9. jour J : date dans 5 jours → préparation
  await page.click("nav [data-go=home]");
  await page.click("#openSettings");
  const d5 = await E("toDateInput(Date.now()+5*DAY)");
  await page.fill("#e-dday", d5);
  await page.fill("#e-patchMg", "21"); await page.fill("#e-gumMg", "2"); await page.fill("#e-gumPrice", "9"); await page.fill("#e-gumPer", "30");
  await page.click("#setForm button[type=submit]");
  ok((await E("$('#dday').textContent")).includes("J-5"), "compte à rebours J-5");
  ok((await E("$$('#dday .check').length")) === 6, "checklist de 6 préparatifs");
  ok((await E("$('#subsCard').textContent")).includes("25 mg"), "nicotine des substituts affichée (doses saisies)");
  ok((await E("subsMg()")) === 25, "…mais calcul d'après les doses saisies (2×2 + 21 = 25 mg)");
  await page.click("#dday [data-k=conf]"); await page.click("#dday [data-k=proches]");
  ok(await E("S.check.conf && S.check.proches"), "préparatifs cochables");
  await shot("09-jour-j");
  ok((await E("S.dDay")) !== null && (await E("target(dayIdx(Date.now()+6*DAY))")) === 0, "objectif = 0 à partir du jour J");
  ok((await E("target(dayIdx(Date.now()+2*DAY))")) >= 1, "objectif ≥ 1 avant le jour J");

  // 10. le jour J arrive
  await page.clock.setSystemTime(new Date(Date.now() + 5 * 864e5 + 3600e3));
  await page.evaluate("renderAll()");
  ok((await E("$('#dday').textContent")).includes("C'est le jour J"), "carte « C'est le jour J »");
  await page.click("[data-act=launch]");
  ok((await E("S.mode")) === "quit" && (await E("S.launched")), "passage en arrêt total");
  ok((await E("$('#hero').textContent")).includes("Sans fumer depuis"), "compteur d'arrêt affiché");
  ok(await E("!!S.badges.dd_go && !!S.badges.quit"), "badges Jour J + Grand saut");
  
  await shot("10-arret");

  // 11. soir : bilan
  await page.clock.setSystemTime(new Date("2026-11-25T21:00:00+01:00"));
  await page.evaluate("renderAll()");
  ok((await E("$('#evening').textContent")).includes("Bilan du soir"), "bilan du soir après 20 h");
  

  // 12. écart en mode arrêt : le compteur ne se remet pas à zéro
  const qa = await E("S.quitAt");
  await page.click("#slipBtn"); await page.click("#smokeSkip");
  ok((await E("S.quitAt")) === qa, "un écart ne remet pas le compteur à zéro");
  ok((await E("$('#hero').textContent")).includes("Dernier écart"), "écart mentionné");

  // 13. persistance
  await page.reload();
  ok(await E("S && S.mode === 'quit' && S.workouts.length === 2"), "données conservées après rechargement");

  // 14. migration depuis l'ancienne version (v1)
  await page.evaluate(() => localStorage.setItem("souffle-v1", JSON.stringify({ quitAt: Date.now() - 3 * 864e5, perDay: 12, packPrice: 12, perPack: 20, reasons: ["Ma fille"], log: [{ t: Date.now() - 864e5, ok: true, int: 3, trig: "Café" }, { t: Date.now() - 3600e3, ok: false, int: 3, trig: "—" }], goal: "", goalPrice: 0 })));
  await page.reload();
  ok((await E("S.v")) === 3 && (await E("S.mode")) === "quit" && (await E("S.cravings.length")) === 1 && (await E("S.smokes.length")) === 1, "migration v1 → v3");
  await shot("11-migration");

  // 15. réinitialisation
  await page.click("#openSettings"); await page.click("#resetBtn"); await page.click("#resetYes");
  ok(await page.isVisible("#v-setup"), "tout effacer → retour onboarding");

  // 16. mode « arrêter maintenant » dès l'onboarding
  await page.click("#s-mode [data-v=quit]");
  ok(await page.isVisible("#s-quitBox"), "champ date de dernière cigarette en mode arrêt");
  await page.click("#setupForm button[type=submit]");
  ok((await E("target(0)")) === 0 && (await E("$('#hero').textContent")).includes("Sans fumer depuis"), "arrêt direct : objectif 0, compteur affiché");

  console.log("\nErreurs JS :", errors.length ? errors : "aucune");
  console.log(fails ? `\n${fails} ÉCHEC(S)` : "\nTout est OK");
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})();
