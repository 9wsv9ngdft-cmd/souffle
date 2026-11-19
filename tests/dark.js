const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark", locale: "fr-FR", timezoneId: "Europe/Paris", deviceScaleFactor: 2 });
  await ctx.route(/^https?:/, r => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("file://" + require("path").resolve(__dirname, "../index.html"));
  await p.click("#s-mode [data-v=quit]");
  await p.fill("#s-why", "Ma santé");
  await p.click("#setupForm button[type=submit]");
  await p.evaluate(() => { S.quitAt = Date.now() - (9*864e5 + 5*36e5); S.start = S.quitAt; S.quitFrom = dayStart(S.quitAt); save(); renderAll(); });
  await p.waitForTimeout(300);
  if (await p.isVisible("#badgeModal.on")) await p.click("#bmOk");
  await p.screenshot({ path: __dirname + "/shots/12-dark-arret.png" });
  await p.click("nav [data-go=badges]"); await p.waitForTimeout(200);
  console.log("badges:", await p.evaluate("$('#badgeCount').textContent"), "erreurs:", errs);
  await b.close();
})();
