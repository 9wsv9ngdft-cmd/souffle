/* ============ Souffle — partie 2 : affichage et actions ============ */
function seg(el, val, onChange) {
  el.querySelectorAll("button").forEach(b => {
    b.classList.toggle("on", b.dataset.v === String(val));
    b.onclick = () => { el.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); el.dataset.val = b.dataset.v; onChange && onChange(b.dataset.v); };
  });
  el.dataset.val = String(val);
}
const num = sel => { const v = $(sel).value; return v === "" ? "" : +v; };

/* ---------- navigation ---------- */
function go(v) {
  $$(".view").forEach(x => x.classList.remove("on"));
  $("#v-" + v).classList.add("on");
  $$("nav button").forEach(b => b.classList.toggle("on", b.dataset.go === v));
  $("nav").style.display = v === "setup" ? "none" : "flex";
  window.scrollTo(0, 0);
  if (S) { if (v === "sos") showSosReason(); if (v === "stats") renderStats(); if (v === "badges") renderBadges(); if (v === "infos") renderInfos(); }
}
$$("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
function boot() {
  if (!S) { setupInit(); go("setup"); return; }
  renderAll();
  const cur = document.querySelector(".view.on");
  go(!cur || cur.id === "v-setup" ? "home" : cur.id.slice(2));
  if (location.hash === "#quiz") { go("sos"); $("#sosSeg").querySelector("[data-v=quiz]").click(); }
}
function renderAll() { if (!S) return; renderHome(); renderReasons(); renderTips(); checkBadges(); }

/* ---------- onboarding ---------- */
function setupInit() {
  $("#s-date").value = toLocalInput(Date.now());
  const upd = () => {
    const quit = $("#s-mode").dataset.val === "quit";
    $("#s-reduceBox").style.display = quit ? "none" : "block";
    $("#s-quitBox").style.display = quit ? "block" : "none";
    const b = +$("#s-day").value || 0, p = +$("#s-pace").dataset.val;
    if (b > 0) $("#s-proj").textContent = `Objectif aujourd'hui : ${Math.max(0, b - 1)}. À ce rythme, tu atteins zéro vers le ${fmtDate(Date.now() + (b - 1) * p * DAY)}.`;
  };
  seg($("#s-mode"), "reduce", upd); seg($("#s-pace"), "3", upd); $("#s-day").oninput = upd; upd();
  $$("#s-subs .chip").forEach(c => c.onclick = () => c.classList.toggle("on"));
}
$("#setupForm").addEventListener("submit", e => {
  e.preventDefault();
  const quit = $("#s-mode").dataset.val === "quit", why = $("#s-why").value.trim(), d = defaults();
  const qa = quit ? (new Date($("#s-date").value).getTime() || Date.now()) : null;
  Object.assign(d, { mode: quit ? "quit" : "reduce", start: quit ? qa : Date.now(), baseline: +$("#s-day").value, pace: +$("#s-pace").dataset.val,
    packPrice: +$("#s-price").value, perPack: +$("#s-pack").value, quitAt: qa, reasons: why ? [why] : [] });
  if (quit) d.quitFrom = dayStart(qa);
  const on = $$("#s-subs .chip.on").map(c => c.dataset.v);
  d.subs.patch = on.includes("patch"); d.subs.gum = on.includes("gum"); d.subs.vape = on.includes("vape");
  S = d; save(); renderAll(); go("home");
});

/* ---------- accueil ---------- */
function renderHome() {
  const reduce = S.mode === "reduce";
  $("#actReduce").style.display = reduce ? "grid" : "none";
  $("#actQuit").style.display = reduce ? "none" : "grid";
  renderHero(); renderCi(); renderSubs(); renderSpacing(); renderDday(); renderMission(); renderEvening(); renderEnc(); renderAnec(); renderTiles(); renderNext(); renderGoal();
  tick();
}
function renderHero() {
  const hero = $("#hero"), ds = dayStats(), now = Date.now(), c = ds.c[ds.today] || 0, tg = target(ds.today), ls = lastSmoke();
  if (S.mode === "reduce") {
    hero.classList.toggle("over", c > tg);
    const pct = tg > 0 ? Math.min(100, c / tg * 100) : (c > 0 ? 100 : 0);
    hero.innerHTML = `<div class="small" style="opacity:.85">Aujourd'hui</div>
      <div class="big">${c}<span style="font-size:1.6rem;opacity:.8"> / ${tg}</span></div>
      <div class="sub">${ls ? `Dernière il y a ${ago(now - ls.t)}` : "Aucune cigarette notée"}</div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="small" style="opacity:.85;margin-top:10px">${S.dDay ? "Jour J" : "Objectif zéro"} : ${fmtDate(effD())}</div>`;
  } else {
    hero.classList.remove("over");
    const slip = ls && ls.t > S.quitAt;
    hero.innerHTML = `<div class="small" style="opacity:.85">Sans fumer depuis</div><div class="big" id="qDays"></div><div class="sub" id="qClock"></div>
      ${slip ? `<div class="small" style="opacity:.85;margin-top:8px">Dernier écart il y a ${ago(now - ls.t)}. Ça ne remet pas tout à zéro.</div>` : ""}`;
  }
}
function tick() {
  if (!S || S.mode !== "quit") return;
  const el = $("#qDays"); if (!el) return;
  const sec = Math.max(0, (Date.now() - S.quitAt) / 1000);
  const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60), s = Math.floor(sec % 60);
  el.textContent = d + (d > 1 ? " jours" : " jour");
  $("#qClock").textContent = `${pad(h)} h ${pad(m)} min ${pad(s)} s`;
}
function renderSubs() {
  const sb = S.subs, el = $("#subsCard");
  if (!sb.gum && !sb.patch && !sb.vape) { el.style.display = "none"; return; }
  el.style.display = "block";
  const dk = dayKey(Date.now()), gc = gumsToday(), mg = subsMg();
  let h = `<div class="small muted">Substituts aujourd'hui</div>`;
  if (sb.gum) h += `<div class="row" style="margin-top:8px"><div><b>${gc} gomme${gc > 1 ? "s" : ""}</b></div><button class="btn-primary" data-act="gum">+ Gomme</button></div>`;
  if (sb.vape) { const vc = vapesToday(), nic = +sb.vapeNic > 0; h += `<div class="row" style="margin-top:10px"><div><b>${vc} pause${vc > 1 ? "s" : ""} vape</b><div class="small muted">${nic ? "avec nicotine (" + String(sb.vapeNic).replace(".", ",") + " mg/ml)" : "sans nicotine"}</div></div><button class="btn-primary" data-act="vape">+ Vape</button></div>`; }
  if (sb.patch) { const on = !!S.patches[dk]; h += `<div class="row" style="margin-top:10px"><div><b>Patch</b><div class="small muted">${on ? "posé aujourd'hui ✓" : "pas encore posé"}</div></div><button class="${on ? "btn-ghost" : ""}" data-act="patch">${on ? "Annuler" : "Patch posé"}</button></div>`; }
  if (mg > 0) h += `<div class="small muted" style="margin-top:8px">Nicotine des substituts : ${String(mg).replace(".", ",")} mg (d'après tes boîtes)</div>`;
  if (gumRising()) h += `<div class="warn">Tu en prends de plus en plus ces derniers jours. Parles-en à ton pharmacien ou au 39 89 : ton dosage est peut-être à ajuster.</div>`;
  h += `<div class="small muted" style="margin-top:8px">Souffle ne conseille aucun dosage. Demande à ton médecin, ton pharmacien ou au 39 89.</div>`;
  el.innerHTML = h;
}
function renderSpacing() {
  const el = $("#spacing");
  if (S.mode !== "reduce") { el.style.display = "none"; return; }
  const ds = dayStats(), tg = target(ds.today), ls = lastSmoke(), now = Date.now();
  if (tg <= 0) { el.style.display = "none"; return; }
  const interval = 16 * 60 / tg, since = ls ? (now - ls.t) / 60000 : Infinity;
  el.style.display = "block";
  el.innerHTML = since < interval
    ? `<div class="small muted">Pour tenir ${tg} sur la journée</div><b>Essaie de tenir encore ${Math.ceil(interval - since)} min</b><div class="bar"><i style="width:${since / interval * 100}%;background:var(--sky)"></i></div>`
    : `<div class="small muted">Pour tenir ${tg} sur la journée</div><b>Ton intervalle de ${String(Math.round(interval / 6) / 10).replace(".", ",")} h est passé 👍</b><div class="small muted" style="margin-top:4px">Chaque minute de plus est un bonus.</div>`;
}
function renderDday() {
  const el = $("#dday");
  if (S.mode !== "reduce") { el.style.display = "none"; return; }
  const d = effD(), to = daysToD();
  if (to <= 0) {
    el.style.display = "block";
    el.innerHTML = `<b>C'est le jour J 🚭</b><p class="small muted" style="margin:4px 0 10px">Tu as fait tout le chemin de la réduction. Prêt·e à arrêter complètement ?</p><button class="btn-primary btn-block" data-act="launch">Je passe à l'arrêt total</button>`;
    return;
  }
  if (to > 7) { el.style.display = "none"; return; }
  const done = CHECK.filter(c => S.check[c[0]]).length, th = topHours().top.slice(0, 3).map(x => `${x[1]}h–${x[1] + 1}h`).join(", ");
  el.style.display = "block";
  el.innerHTML = `<div class="row"><div><div class="small muted">Jour J · ${fmtDate(d, { weekday: "long", day: "numeric", month: "long" })}</div><div class="dj">J-${to}</div></div><button class="btn-ghost btn-sm" data-act="edit">Changer la date</button></div>
    <div class="bar"><i style="width:${done / CHECK.length * 100}%"></i></div><div class="small muted" style="margin:6px 0 4px">${done}/${CHECK.length} préparatifs</div>`
    + CHECK.map(([k, t]) => `<div class="check ${S.check[k] ? "on" : ""}" data-act="check" data-k="${k}"><div class="box">${S.check[k] ? "✓" : ""}</div><div class="tx">${t}${k === "risk" && th ? `<div class="small muted">Tes heures à risque : ${th}</div>` : ""}</div></div>`).join("");
}
function renderMission() {
  const m = getMission(), ms = missionStats(), el = $("#mission");
  el.innerHTML = `<div class="row"><div class="small muted">Mission du jour</div>${ms.streak > 0 ? `<div class="small muted">🔗 ${ms.streak} jour${ms.streak > 1 ? "s" : ""} de suite</div>` : ""}</div>
    <div class="q">${esc(missionText(m.id))}</div>`
    + (m.done ? `<div class="small">🎉 Mission accomplie !</div>`
      : `<div class="grid"><button class="btn-primary" data-act="mdone">Fait ✓</button>${m.swaps < 1 ? `<button class="btn-ghost" data-act="mswap">Une autre</button>` : "<span></span>"}</div>`);
}
function renderEvening() {
  const el = $("#evening"), h = new Date().getHours();
  if (!(h >= 20 || h < 4)) { el.style.display = "none"; return; }
  const ds = dayStats(), c = ds.c[ds.today] || 0, tg = target(ds.today), m = getMission();
  el.style.display = "block";
  el.innerHTML = `<b>Bilan du soir 🌙</b><div class="small muted" style="margin:4px 0 10px">${S.mode === "reduce" ? `${c} cigarette${c > 1 ? "s" : ""} sur ${tg} · ` : ""}${m.done ? "mission faite" : "mission pas encore faite"}. Comment te sens-tu ?</div><button class="btn-ghost btn-block" data-act="sym">Noter mes symptômes de manque</button>`;
}
function renderEnc() {
  const ds = dayStats(), now = Date.now(), today = ds.today, c = ds.c[today] || 0, tg = target(today), lines = [];
  if (S.mode === "reduce") {
    const ySame = S.smokes.filter(s => dayIdx(s.t) === today - 1 && s.t <= now - DAY).length;
    if (today > 0 && c < ySame) lines.push(`À cette heure-ci hier, tu en étais à ${ySame}. Tu fais mieux aujourd'hui !`);
    else if (c < tg) lines.push(`${c} sur ${tg} aujourd'hui. Chaque cigarette pas fumée est un bonus.`);
    else if (c === tg) lines.push("Objectif du jour atteint. Tiens jusqu'à ce soir et la journée est validée.");
    else lines.push("Objectif dépassé, ce n'est pas grave. Chaque cigarette en moins compte encore aujourd'hui, et demain est un nouveau jour.");
  } else {
    const f = freeSec();
    lines.push(f < 3 * 86400 ? "Les 3 premiers jours sont les plus durs. Tu es en plein dedans, et tu tiens." : `${Math.floor(f / 86400)} jours sans fumer. Le manque physique est derrière toi, le plus dur est fait.`);
  }
  if (ds.streak >= 2) lines.push(`🔥 ${ds.streak} jours de suite dans l'objectif.`);
  $("#enc").innerHTML = `<div class="small muted">Message du jour</div><div class="q">${ENC[Math.floor(now / DAY) % ENC.length]}</div>${lines.map(l => `<div class="small" style="margin-top:8px">${l}</div>`).join("")}`;
}
function ciLevel() { // sur les 3 derniers jours, d'après les points « depuis tout à l'heure »
  const l = S.ci.filter(x => x.t > Date.now() - 3 * DAY); if (l.length < 6) return "";
  const sm = l.filter(x => x.r === "smoke").length / l.length, ok = l.filter(x => x.r === "ok").length / l.length;
  return sm >= .4 ? "more" : ok >= .8 ? "less" : "";
}
function ciRhythm() {
  const lv = ciLevel();
  if (lv === "more") return "Ces derniers jours, ça craque assez souvent. Si tu veux plus de soutien, ajoute un rappel. Et si ça dure, parles-en à ton pharmacien ou au 39 89.";
  if (lv === "less") return "Ça va très bien en ce moment ! Tu peux espacer tes rappels si tu veux te faire plus discret.";
  return "";
}
function renderCi() {
  const el = $("#ciCard"), c = S.ci[S.ci.length - 1];
  if (c && Date.now() - c.t < 90 * 60000) {
    const rh = ciRhythm();
    el.innerHTML = `<div class="small muted">Point de ${new Date(c.t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div><div style="margin-top:6px">${esc(c.adv)}</div>${rh ? `<div class="small muted" style="margin-top:8px">${esc(rh)}</div>` : ""}`;
    return;
  }
  el.innerHTML = `<div class="small muted">Petit point</div><div class="serif" style="font-size:1.1rem;margin:4px 0 10px">Depuis tout à l'heure, ça s'est passé comment ?</div><div class="grid"><button class="btn-primary" data-act="ci" data-r="ok">Rien fumé 💪</button><button class="btn-ghost" data-act="ci" data-r="sub">Gomme ou vape</button></div><button class="btn-ghost btn-block" style="margin-top:8px" data-act="ci" data-r="smoke">J'ai craqué</button>`;
}
let anecI = -1;
function renderAnec(next) {
  if (anecI < 0 || next) anecI = next ? (anecI + 1 + Math.floor(Math.random() * (ANEC.length - 1))) % ANEC.length : Math.floor(Date.now() / DAY) % ANEC.length;
  if (next) { S.fun.anec++; save(); }
  $("#anec").innerHTML = `<div class="small muted">💡 Tiens, le savais-tu ?</div><div style="margin-top:6px">${ANEC[anecI]}</div><div class="grid" style="margin-top:10px"><button class="btn-ghost" id="anecNext">Une autre</button><button class="btn-ghost" id="anecQuiz">🎲 Un quiz</button></div>`;
  $("#anecNext").onclick = () => { renderAnec(true); };
  $("#anecQuiz").onclick = () => { go("sos"); $("#sosSeg").querySelector('[data-v=quiz]').click(); };
}
function confetti() {
  const cols = ["#2f7d5b", "#e8836b", "#5b9bd5", "#f2c14e", "#9b7fd1"];
  for (let i = 0; i < 28; i++) {
    const e = document.createElement("i"); e.className = "conf";
    e.style.left = (8 + Math.random() * 84) + "vw"; e.style.background = cols[i % cols.length];
    e.style.setProperty("--dx", (Math.random() * 120 - 60) + "px"); e.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
    e.style.animationDelay = (Math.random() * .3) + "s";
    document.body.appendChild(e); setTimeout(() => e.remove(), 2200);
  }
}
let qzOrder = [], qzI = 0;
function quizNext() {
  if (!qzOrder.length || qzI >= qzOrder.length) { qzOrder = QUIZ.map((_, i) => i).sort(() => Math.random() - .5); qzI = 0; }
  const q = QUIZ[qzOrder[qzI++]];
  $("#qzCount").textContent = `${S.fun.ok} bonne${S.fun.ok > 1 ? "s" : ""} réponse${S.fun.ok > 1 ? "s" : ""} sur ${S.fun.quiz}`;
  $("#qzQ").textContent = q[0]; $("#qzRes").textContent = ""; $("#qzNext").style.display = "none";
  $("#qzOpts").innerHTML = q[1].map((o, i) => `<button type="button" data-i="${i}">${esc(o)}</button>`).join("");
  $$("#qzOpts button").forEach(b => b.onclick = () => {
    const good = +b.dataset.i === q[2]; S.fun.quiz++; if (good) S.fun.ok++; save();
    $$("#qzOpts button").forEach(x => { x.disabled = true; if (+x.dataset.i === q[2]) x.classList.add("on"); });
    $("#qzRes").innerHTML = (good ? "🎉 <b>Bravo !</b> " : "Presque ! ") + esc(q[3]);
    $("#qzCount").textContent = `${S.fun.ok} bonne${S.fun.ok > 1 ? "s" : ""} réponse${S.fun.ok > 1 ? "s" : ""} sur ${S.fun.quiz}`;
    $("#qzNext").style.display = "block";
    if (good) { confetti(); $("#qzQ").classList.add("pop"); setTimeout(() => $("#qzQ").classList.remove("pop"), 600); }
    checkBadges();
  });
}
$("#qzNext").onclick = quizNext;
function renderTiles() {
  const sv = savings();
  $("#h-money").textContent = euro(sv.money);
  $("#h-money-l").textContent = sv.cost > 0 ? "économisés (substituts déduits)" : "économisés";
  $("#h-cigs").textContent = sv.avoided.toLocaleString("fr-FR");
  const lm = sv.avoided * 20;
  $("#h-life").textContent = lm < 1440 ? Math.floor(lm / 60) + " h" : (lm / 1440).toFixed(1).replace(".", ",") + " j";
  $("#h-won").textContent = S.cravings.length;
}
function renderNext() {
  const reduce = S.mode === "reduce", ls = lastSmoke(), now = Date.now();
  const ref = reduce ? (ls ? ls.t : S.start) : S.quitAt, sec = Math.max(0, (now - ref) / 1000), next = MS.find(x => x[0] > sec);
  if (next) {
    const prev = [...MS].reverse().find(x => x[0] <= sec), from = prev ? prev[0] : 0, pct = Math.min(100, (sec - from) / (next[0] - from) * 100);
    $("#h-next").innerHTML = `<div class="small muted">${reduce ? "Depuis ta dernière cigarette · " : ""}prochaine étape dans ${dur(next[0] - sec)}</div><div style="font-weight:600;margin-top:4px">${next[1]} — ${next[2]}</div><div class="bar"><i style="width:${pct}%"></i></div>`;
  } else $("#h-next").innerHTML = `<b>Toutes les étapes sont franchies. Incroyable. 🌳</b>`;
}
function renderGoal() {
  const sv = savings();
  if (S.goal && S.goalPrice > 0) {
    const p = Math.min(100, sv.money / S.goalPrice * 100);
    $("#goalBtn").textContent = "Modifier l'objectif";
    $("#h-goal").innerHTML = `<div class="row"><b>${esc(S.goal)}</b><span class="muted small">${euro(sv.money)} / ${euro(S.goalPrice)}</span></div><div class="bar"><i style="width:${p}%;background:var(--gold)"></i></div>${p >= 100 ? '<div class="small" style="margin-top:8px">🎉 Objectif atteint, fais-toi plaisir !</div>' : ""}`;
  } else {
    $("#goalBtn").textContent = "Fixer un objectif d'achat";
    $("#h-goal").innerHTML = `Sur un an, en arrêtant complètement, tu économiserais environ <b>${euro(S.baseline * 365 * S.packPrice / S.perPack)}</b>.`;
  }
}
function renderReasons() {
  $("#reasons").innerHTML = S.reasons.length ? S.reasons.map((r, i) => `<div class="reason"><span>${esc(r)}</span><button class="x" data-act="rdel" data-k="${i}" aria-label="Supprimer">✕</button></div>`).join("")
    : `<p class="muted small">Note ce qui compte pour toi. On te le rappellera dans les moments difficiles.</p>`;
}
$("#reasonForm").addEventListener("submit", e => { e.preventDefault(); const v = $("#reasonIn").value.trim(); if (!v) return; S.reasons.push(v); $("#reasonIn").value = ""; save(); renderAll(); });

/* ---------- actions (délégation) ---------- */
const ACT = {
  ci(b) {
    const r = b.dataset.r, pool = ADV[r], adv = pool[Math.floor(Math.random() * pool.length)];
    S.ci.push({ t: Date.now(), r, adv }); if (S.ci.length > 200) S.ci.shift();
    if (r === "sub") { if (S.subs.vape) S.vapes.push({ t: Date.now() }); else S.gums.push({ t: Date.now() }); }
    save(); renderAll();
    if (r === "ok") { confetti(); toast("Bien joué 🎉"); }
    if (r === "smoke") logSmoke();
  },
  vape() { S.vapes.push({ t: Date.now() }); save(); renderAll(); toast(`Pause vape notée ✓ (${vapesToday()} aujourd'hui)`); },
  gum() { S.gums.push({ t: Date.now() }); save(); renderAll(); toast(`Gomme notée ✓ (${gumsToday()} aujourd'hui)`); },
  patch() { const k = dayKey(Date.now()); if (S.patches[k]) delete S.patches[k]; else S.patches[k] = true; save(); renderAll(); },
  mdone() { getMission().done = true; save(); renderAll(); confetti(); toast("Mission accomplie 🎉"); },
  mswap() {
    const m = getMission(), p = missionPool(), cur = p.findIndex(x => x[0] === m.id), dk = dayKey(Date.now());
    let n = (cur + 1 + hashStr(dk + "x") % 3) % p.length; if (p[n][0] === m.id) n = (n + 1) % p.length;
    m.id = p[n][0]; m.swaps = 1; save(); renderAll();
  },
  launch() { switchToQuit(true); },
  sym() { openSym(); },
  edit() { openSettings(); },
  check(b) { const k = b.dataset.k; S.check[k] = !S.check[k]; if (k === "conf" && S.check[k]) S.dDay = effD(); save(); renderAll(); },
  rdel(b) { S.reasons.splice(+b.dataset.k, 1); save(); renderAll(); },
  del(b) { delEvent(b.dataset.k, +b.dataset.t); }
};
document.addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (!b || !S) return; const f = ACT[b.dataset.act]; if (f) f(b); });
function delEvent(k, t) {
  const arr = { s: S.smokes, c: S.cravings, g: S.gums, v: S.vapes, y: S.symptoms }[k], i = arr ? arr.findIndex(x => x.t === t) : -1;
  if (i >= 0) { arr.splice(i, 1); save(); renderAll(); renderStats(); toast("Supprimé"); }
}

/* ---------- cigarette / envie ---------- */
let lastLogged = null;
function logSmoke() {
  const s = { t: Date.now(), trig: null }; S.smokes.push(s); lastLogged = s; save();
  $("#smokeTitle").textContent = S.mode === "quit" ? "Un écart, pas un échec" : "Cigarette notée";
  $("#smokeSub").textContent = S.mode === "quit" ? "Ton compteur d'arrêt continue. Note ce qui s'est passé pour mieux anticiper la prochaine fois." : "Noter honnêtement, c'est ce qui te fera progresser. Qu'est-ce qui l'a déclenchée ?";
  $("#smokeTrig").innerHTML = TRIGGERS.map(t => `<button type="button" class="chip" data-v="${t}">${t}</button>`).join("");
  $$("#smokeTrig .chip").forEach(b => b.onclick = () => { lastLogged.trig = b.dataset.v; save(); closeSmoke(); });
  $("#smokeModal").classList.add("on");
}
function closeSmoke() { $("#smokeModal").classList.remove("on"); renderAll(); go("home"); }
$("#smokeBtn").onclick = logSmoke; $("#slipBtn").onclick = logSmoke;
$("#smokeSkip").onclick = closeSmoke;
$("#smokeUndo").onclick = () => { S.smokes = S.smokes.filter(s => s !== lastLogged); save(); closeSmoke(); toast("Annulé"); };

let draft = { int: 3, trig: null };
function chipRow(el, items, key) {
  el.innerHTML = items.map(v => `<button type="button" class="chip ${draft[key] === v ? "on" : ""}" data-v="${v}">${v}</button>`).join("");
  el.querySelectorAll(".chip").forEach(c => c.onclick = () => { draft[key] = key === "int" ? +c.dataset.v : c.dataset.v; chipRow(el, items, key); });
}
function openCrav() { draft = { int: 3, trig: null }; chipRow($("#intensity"), [1, 2, 3, 4, 5], "int"); chipRow($("#cravTrig"), TRIGGERS, "trig"); $("#cravModal").classList.add("on"); }
$("#cravCancel").onclick = () => $("#cravModal").classList.remove("on");
$("#cravSave").onclick = () => {
  S.cravings.push({ t: Date.now(), int: draft.int, trig: draft.trig }); save();
  $("#cravModal").classList.remove("on"); renderAll(); go("home"); toast(`Envie surmontée ✓ — ça fait ${S.cravings.length} !`);
};

/* ---------- SOS : respiration ---------- */
function showSosReason() {
  const el = $("#sosReason");
  if (S && S.reasons.length) { el.style.display = "block"; el.innerHTML = `<div class="small muted">Souviens-toi pourquoi tu fais ça</div><div class="q serif" style="font-size:1.2rem;margin-top:4px">« ${esc(S.reasons[Math.floor(Math.random() * S.reasons.length)])} »</div>`; }
  else el.style.display = "none";
}
function renderTips() { $("#tips").innerHTML = TIPS.map(t => `<div class="tip">${t}</div>`).join(""); }
let sosInt = null, breathT = null;
function stopSos() { clearInterval(sosInt); clearTimeout(breathT); sosInt = null; $("#circle").style.transform = "scale(1)"; $("#breathTxt").textContent = "Prêt ?"; $("#sosTimer").textContent = "3:00"; $("#sosStart").textContent = "Démarrer 3 minutes"; }
function breathe() {
  const c = $("#circle"), t = $("#breathTxt"), steps = [["Inspire", 4000, 1.9], ["Bloque", 2000, 1.9], ["Expire", 6000, 1]]; let i = 0;
  const step = () => { const [txt, ms, sc] = steps[i % 3]; t.textContent = txt; c.style.transitionDuration = (ms / 1000) + "s"; c.style.transform = `scale(${sc})`; i++; breathT = setTimeout(step, ms); };
  step();
}
$("#sosStart").addEventListener("click", () => {
  if (sosInt) { stopSos(); return; }
  let left = 180; $("#sosStart").textContent = "Arrêter"; breathe();
  sosInt = setInterval(() => { left--; $("#sosTimer").textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`; if (left <= 0) { stopSos(); $("#sosTimer").textContent = "C'est passé ✨"; openCrav(); } }, 1000);
});
function setSosMode(m) {
  $("#sosBreath").style.display = m === "breathe" ? "block" : "none";
  $("#sosMove").style.display = m === "move" ? "block" : "none";
  $("#sosQuiz").style.display = m === "quiz" ? "block" : "none";
  if (m === "quiz" && S) quizNext();
  if (m !== "breathe") stopSos(); if (m !== "move") stopWorkout();
}
seg($("#sosSeg"), "breathe", setSosMode); seg($("#wkSeg"), "full");
$("#won").onclick = () => { stopSos(); stopWorkout(); openCrav(); };
$("#slip").onclick = () => { stopSos(); stopWorkout(); logSmoke(); };

/* ---------- SOS : séance « bouger » ---------- */
let wk = null, wl = null, ac = null;
function beep(f, d) {
  try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = .15; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d); } catch (e) {}
  try { navigator.vibrate && navigator.vibrate(60); } catch (e) {}
}
function startWorkout() {
  const full = $("#wkSeg").dataset.val !== "short", list = full ? EX : EXS, work = full ? 30 : 25, rest = full ? 10 : 6;
  wk = { list, work, rest, i: 0, phase: "prep", left: 5, elapsed: 0, total: list.length * work + (list.length - 1) * rest, kind: full ? "full" : "short", iv: null };
  $("#wkSetup").style.display = "none"; $("#wkRun").style.display = "block";
  try { navigator.wakeLock && navigator.wakeLock.request("screen").then(l => { wl = l; }).catch(() => {}); } catch (e) {}
  beep(660, .15); drawWk(); wk.iv = setInterval(wkTick, 1000);
}
function wkTick() {
  if (!wk) return;
  wk.left--; if (wk.phase !== "prep") wk.elapsed++;
  if (wk.left > 0 && wk.left <= 3) beep(660, .08);
  if (wk.left <= 0) {
    if (wk.phase === "prep") { wk.phase = "work"; wk.left = wk.work; beep(990, .25); }
    else if (wk.phase === "work") { if (wk.i >= wk.list.length - 1) { finishWorkout(); return; } wk.phase = "rest"; wk.left = wk.rest; beep(520, .2); }
    else { wk.i++; wk.phase = "work"; wk.left = wk.work; beep(990, .25); }
  }
  drawWk();
}
function drawWk() {
  const w = wk;
  $("#wkPhase").textContent = w.phase === "prep" ? "Prépare-toi" : w.phase === "work" ? `Exercice ${w.i + 1} sur ${w.list.length}` : "Récupère";
  $("#wkName").textContent = w.phase === "prep" ? "C'est parti !" : w.phase === "rest" ? "Pause" : w.list[w.i];
  $("#wkTime").textContent = w.left + " s";
  const nxt = w.phase === "prep" ? w.list[0] : w.list[w.i + 1];
  $("#wkNext").textContent = nxt ? "Ensuite : " + nxt : "Dernier exercice !";
  $("#wkBar").style.width = Math.min(100, w.elapsed / w.total * 100) + "%";
}
function stopWorkout() {
  if (wk) { clearInterval(wk.iv); wk = null; }
  try { wl && wl.release(); } catch (e) {} wl = null;
  $("#wkSetup").style.display = "block"; $("#wkRun").style.display = "none";
}
function finishWorkout() {
  const kind = wk.kind; stopWorkout(); beep(990, .4);
  S.workouts.push({ t: Date.now(), kind }); S.cravings.push({ t: Date.now(), int: 0, trig: null, tool: "move" });
  save(); renderAll(); go("home"); toast("Séance terminée 💪 +1 envie surmontée");
}
$("#wkStart").onclick = startWorkout; $("#wkStop").onclick = stopWorkout;

/* ---------- symptômes ---------- */
let symDraft = null;
function openSym() { symDraft = { sel: new Set(), int: 3 }; drawSymForm(); $("#symModal").classList.add("on"); }
function drawSymForm() {
  $("#symBody").innerHTML = `<h2 style="margin-top:0">Comment te sens-tu ?</h2><p class="muted small">Coche ce que tu ressens. Ces symptômes sont fréquents et passent en quelques semaines.</p>
    <div class="chips" id="symChips" style="margin-top:10px">${SYMPTOMS.map(s => `<button type="button" class="chip ${symDraft.sel.has(s[0]) ? "on" : ""}" data-k="${s[0]}">${s[1]}</button>`).join("")}</div>
    <label>Intensité globale</label><div class="chips" id="symInt">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="chip ${symDraft.int === n ? "on" : ""}" data-n="${n}">${n}</button>`).join("")}</div>
    <div class="grid" style="margin-top:18px"><button class="btn-ghost" id="symCancel">Annuler</button><button class="btn-primary" id="symSave">Voir mes conseils</button></div>`;
  $$("#symChips .chip").forEach(c => c.onclick = () => { const k = c.dataset.k; symDraft.sel.has(k) ? symDraft.sel.delete(k) : symDraft.sel.add(k); drawSymForm(); });
  $$("#symInt .chip").forEach(c => c.onclick = () => { symDraft.int = +c.dataset.n; drawSymForm(); });
  $("#symCancel").onclick = () => $("#symModal").classList.remove("on");
  $("#symSave").onclick = () => {
    if (!symDraft.sel.size) { toast("Coche au moins un symptôme"); return; }
    const list = [...symDraft.sel]; S.symptoms.push({ t: Date.now(), list, int: symDraft.int }); save(); renderAll(); drawSymAdvice(list);
  };
}
function drawSymAdvice(list) {
  $("#symBody").innerHTML = `<h2 style="margin-top:0">Tes conseils</h2>`
    + list.map(k => { const s = SYMPTOMS.find(x => x[0] === k); return `<div class="adv"><b>${s[1]}</b><div class="small muted">${s[2]}</div></div>`; }).join("")
    + `<p class="small muted" style="margin-top:10px">Ces symptômes sont normaux : plus forts les premiers jours, ils diminuent en quelques semaines.</p>`
    + symAlerts().map(a => `<div class="warn">${a}</div>`).join("")
    + `<button class="btn-primary btn-block" style="margin-top:16px" id="symOk">OK</button>`;
  $("#symOk").onclick = () => $("#symModal").classList.remove("on");
}

/* ---------- stats ---------- */
function renderStats() {
  const ds = dayStats(), today = ds.today, c = ds.c, sb = S.subs, gc = tally(S.gums), sv = savings();
  const done = Math.min(7, today); let sum7 = 0; for (let k = 1; k <= done; k++) sum7 += c[today - k] || 0;
  if (done > 0) { const avg = sum7 / done; $("#st-avg").textContent = avg.toFixed(1).replace(".", ","); const red = Math.round((1 - avg / S.baseline) * 100); $("#st-red").textContent = (red > 0 ? "−" : red < 0 ? "+" : "") + Math.abs(red) + " %"; }
  else { $("#st-avg").textContent = "–"; $("#st-red").textContent = "–"; }
  $("#st-streak").textContent = ds.streak;
  $("#st-best").textContent = ds.best === null ? "–" : ds.best + " cig.";

  const sub = $("#st-sub");
  if (sb.gum || sb.patch) {
    const bits = []; if (sb.gum) bits.push(`${gumsToday()} gomme${gumsToday() > 1 ? "s" : ""} aujourd'hui`); if (sb.patch) bits.push(S.patches[dayKey(Date.now())] ? "patch posé" : "patch pas encore posé");
    const mg = subsMg();
    sub.style.display = "block";
    sub.innerHTML = `<div class="small muted">Substituts</div><b>${bits.join(" · ")}</b>`
      + (mg > 0 ? `<div class="small muted" style="margin-top:4px">Nicotine des substituts aujourd'hui : ${String(mg).replace(".", ",")} mg (d'après tes boîtes)</div>` : "")
      + (sv.cost > 0 ? `<div class="small muted">Coût des substituts depuis le début : ${euro(sv.cost)}</div>` : "")
      + (gumRising() ? `<div class="warn">Tu prends plus de gommes ces derniers jours. Parles-en à ton pharmacien ou au 39 89.</div>` : "");
  } else sub.style.display = "none";

  // 14 jours
  const N = 14, W = 340, Hh = 150, pb = 22, pt = 10, bw = W / N;
  const days = [...Array(N)].map((_, k) => { const i = today - (N - 1 - k); return { i, n: i >= 0 ? (c[i] || 0) : null, tg: i >= 0 ? target(i) : null, g: i >= 0 ? (gc[i] || 0) : 0, p: i >= 0 && !!S.patches[dayKey(idxStart(i) + 6 * HR)], d: new Date(idxStart(i)) }; });
  const maxV = Math.max(S.baseline, ...days.map(d => Math.max(d.n || 0, d.g))) + 1, y = v => pt + (Hh - pb - pt) * (1 - v / maxV);
  let svg = `<svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="Cigarettes par jour">`;
  svg += `<line x1="0" x2="${W}" y1="${y(S.baseline)}" y2="${y(S.baseline)}" stroke="var(--line)" stroke-dasharray="3 3"/><text x="${W - 2}" y="${y(S.baseline) - 4}" text-anchor="end" font-size="9" fill="var(--muted)">avant : ${S.baseline}</text>`;
  days.forEach((d, k) => {
    const x = k * bw + bw * .12, w = bw * .76, cw = sb.gum ? w / 2 : w;
    if (d.n !== null) {
      svg += `<rect x="${x}" y="${y(d.n)}" width="${cw}" height="${Math.max(0, y(0) - y(d.n))}" rx="3" fill="${d.n <= d.tg ? "var(--green)" : "var(--coral)"}" opacity="${d.i === today ? .6 : 1}"/>`;
      if (d.n > 0) svg += `<text x="${x + cw / 2}" y="${y(d.n) - 3}" text-anchor="middle" font-size="9" fill="var(--muted)">${d.n}</text>`;
      if (sb.gum && d.g > 0) svg += `<rect x="${x + cw}" y="${y(d.g)}" width="${cw}" height="${Math.max(0, y(0) - y(d.g))}" rx="3" fill="var(--sky)"/>`;
      svg += `<line x1="${x - 2}" x2="${x + w + 2}" y1="${y(d.tg)}" y2="${y(d.tg)}" stroke="var(--ink)" stroke-width="1.5" opacity=".55"/>`;
      if (sb.patch && d.p) svg += `<circle cx="${x + w / 2}" cy="${Hh - 16}" r="2.5" fill="var(--sky)"/>`;
    }
    svg += `<text x="${x + w / 2}" y="${Hh - 4}" text-anchor="middle" font-size="9" fill="var(--muted)">${d.i === today ? "auj." : d.d.toLocaleDateString("fr-FR", { weekday: "narrow" })}</text>`;
  });
  $("#chartDays").innerHTML = svg + "</svg>";
  $("#legendDays").innerHTML = `<span style="--c:var(--green)">cigarettes, dans l'objectif</span><span style="--c:var(--coral)">au-dessus</span>${sb.gum ? '<span style="--c:var(--sky)">gommes</span>' : ""}${sb.patch ? '<span style="--c:var(--sky)">● patch posé</span>' : ""}<span style="--c:var(--ink)">objectif</span>`;

  // symptômes
  if (S.symptoms.length) {
    $("#symBox").style.display = "block";
    const vals = [...Array(N)].map((_, k) => { const i = today - (N - 1 - k); return { i, v: i >= 0 ? symDayAvg(i) : null }; }), H2 = 110;
    let s3 = `<svg viewBox="0 0 ${W} ${H2}" width="100%" role="img" aria-label="Intensité des symptômes">`;
    vals.forEach((d, k) => { const x = k * bw + bw * .12, w = bw * .76; if (d.v !== null) { const h = (H2 - 26) * d.v / 5; s3 += `<rect x="${x}" y="${H2 - 18 - h}" width="${w}" height="${h}" rx="3" fill="var(--gold)"/><text x="${x + w / 2}" y="${H2 - 21 - h}" text-anchor="middle" font-size="9" fill="var(--muted)">${d.v.toFixed(1).replace(".", ",")}</text>`; }
      s3 += `<text x="${x + w / 2}" y="${H2 - 4}" text-anchor="middle" font-size="9" fill="var(--muted)">${d.i === today ? "auj." : new Date(idxStart(d.i)).toLocaleDateString("fr-FR", { weekday: "narrow" })}</text>`; });
    $("#chartSym").innerHTML = s3 + "</svg>";
    $("#symTxt").textContent = symBetter() ? "Tes symptômes sont en baisse sur les 7 derniers jours. Ça va mieux 🌤️" : "Intensité moyenne notée chaque jour (de 1 à 5). Elle baisse en général en quelques semaines.";
  } else $("#symBox").style.display = "none";

  // heures
  const { hrs, top } = topHours(), hm = Math.max(1, ...hrs), H3 = 90;
  let s2 = `<svg viewBox="0 0 ${W} ${H3}" width="100%" role="img" aria-label="Cigarettes par heure">`;
  hrs.forEach((v, h) => { const b = W / 24, bh = (H3 - 20) * v / hm; s2 += `<rect x="${h * b + 1}" y="${H3 - 16 - bh}" width="${b - 2}" height="${bh}" rx="2" fill="var(--sky)"/>`; if (h % 6 === 0) s2 += `<text x="${h * b + 1}" y="${H3 - 3}" font-size="9" fill="var(--muted)">${h}h</text>`; });
  $("#chartHours").innerHTML = s2 + "</svg>";
  $("#hoursTxt").textContent = top.length ? `Tes moments les plus fréquents : ${top.slice(0, 2).map(x => x[1] + "h–" + (x[1] + 1) + "h").join(" et ")}. C'est là qu'il faut prévoir une parade.` : "Note tes cigarettes pour voir apparaître tes moments à risque.";

  // déclencheurs
  const cnt = {}; S.smokes.forEach(s => { if (s.trig) cnt[s.trig] = (cnt[s.trig] || 0) + 1; });
  const tr = Object.entries(cnt).sort((a, b) => b[1] - a[1]), mx = tr[0] ? tr[0][1] : 1;
  $("#triggers").innerHTML = tr.length ? tr.map(([k, v]) => `<div style="margin:6px 0"><div class="row small"><span>${k}</span><span class="muted">${v}</span></div><div class="bar"><i style="width:${v / mx * 100}%;background:var(--sky)"></i></div></div>`).join("")
    + `<p class="small muted" style="margin-top:10px">Astuce : attaque en premier la cigarette « ${tr[0][0]} ». Remplace-la par autre chose pendant quelques jours.</p>`
    : `<p class="muted small">Indique un déclencheur quand tu notes une cigarette pour les voir ici.</p>`;

  // historique
  const ev = [...S.smokes.map(s => ({ ...s, k: "s" })), ...S.cravings.map(s => ({ ...s, k: "c" })), ...S.gums.map(s => ({ ...s, k: "g" })), ...S.vapes.map(s => ({ ...s, k: "v" })), ...S.symptoms.map(s => ({ ...s, k: "y" }))].sort((a, b) => b.t - a.t).slice(0, 50);
  const label = e => e.k === "s" ? `Cigarette${e.trig ? " · " + e.trig : ""}` : e.k === "g" ? "Gomme" : e.k === "v" ? "Pause vape" : e.k === "y" ? "Symptômes · " + e.list.map(l => (SYMPTOMS.find(x => x[0] === l) || [0, l])[1]).join(", ") : e.tool === "move" ? "Séance bouger" : `Envie surmontée${e.trig ? " · " + e.trig : ""}${e.int ? " · " + e.int + "/5" : ""}`;
  $("#logList").innerHTML = ev.length ? ev.map(e => { const d = new Date(e.t); return `<div class="log"><div><div>${esc(label(e))}</div><div class="small muted">${d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} à ${pad(d.getHours())}h${pad(d.getMinutes())}</div></div>
    <div class="row"><span class="pill ${e.k === "s" ? "ko" : e.k === "c" ? "ok" : "sk"}">${e.k === "s" ? "Fumée" : e.k === "c" ? "Tenu" : e.k === "g" || e.k === "v" ? "Substitut" : "Manque"}</span><button class="x" data-act="del" data-k="${e.k}" data-t="${e.t}" aria-label="Supprimer">✕</button></div></div>`; }).join("") : `<p class="muted small">Rien pour l'instant.</p>`;
}

/* ---------- rappels sur le téléphone (notifications) ---------- */
const PUSH_API = "https://souffle-notifs.6fgbcr2vtp.workers.dev";
const PAGES_URL = "https://9wsv9ngdft-cmd.github.io/souffle/";
const onPages = /github\.io$/.test(location.hostname);
const PUSH_KEY = "souffle-push";
const pushCfg = () => { try { return JSON.parse(localStorage.getItem(PUSH_KEY)) || {}; } catch (e) { return {}; } };
const setPushCfg = c => { try { localStorage.setItem(PUSH_KEY, JSON.stringify(c)); } catch (e) {} };
const LVL_TXT = { auto: "Auto : Souffle s'adapte. Si ça craque, il en envoie plus ; si tout va bien, il se fait discret.", calm: "Discret : 3 rappels par jour (8 h, 13 h 30, 21 h).", normal: "Normal : 6 rappels par jour, tous avec un petit jeu.", more: "Soutien : jusqu'à 10 rappels par jour, pour les jours difficiles." };
function pushApi(path, body) { return fetch(PUSH_API + path, { method: body ? "POST" : "GET", body: body ? JSON.stringify(body) : undefined, headers: body ? { "Content-Type": "text/plain" } : {} }).then(r => r.json()); }
function pushSummary() {
  const last = Math.max(0, ...[S.smokes, S.gums, S.vapes, S.ci, S.cravings].map(a => a.length ? a[a.length - 1].t : 0));
  return { target: S.mode === "quit" ? 0 : target(dayIdx(Date.now())), rhythm: ciLevel(), last };
}
let pushT = null;
function pushSoon() { const c = pushCfg(); if (!c.on || !S) return; clearTimeout(pushT); pushT = setTimeout(() => { pushApi("/state", { id: c.id, state: pushSummary() }).catch(() => {}); }, 4000); }
const b64ToBytes = s => { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
async function enablePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !window.Notification) throw new Error("unsupported");
  if ((await Notification.requestPermission()) !== "granted") throw new Error("denied");
  const reg = await navigator.serviceWorker.register("sw.js"); await navigator.serviceWorker.ready;
  const { key } = await pushApi("/key");
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key) });
  const c = pushCfg(); c.id = c.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)); c.on = true; c.level = c.level || "auto";
  const r = await pushApi("/register", { id: c.id, sub: sub.toJSON(), on: true, level: c.level, state: pushSummary() });
  if (r.error) throw new Error(r.error);
  setPushCfg(c);
}
async function disablePush() {
  const c = pushCfg(); c.on = false; setPushCfg(c);
  try { const reg = await navigator.serviceWorker.getRegistration(); const sub = reg && await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); } catch (e) {}
  try { await pushApi("/unregister", { id: c.id }); } catch (e) {}
}
function renderPushBox() {
  const msg = $("#pushMsg"), ctl = $("#pushCtl"), c = pushCfg();
  const standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia("(display-mode: standalone)").matches);
  if (!onPages) { msg.innerHTML = `Pour recevoir des rappels, ouvre la version installable de Souffle : <b>${PAGES_URL.replace("https://", "")}</b>, puis ajoute-la à l'écran d'accueil (Partager, Sur l'écran d'accueil).`; ctl.style.display = "none"; return; }
  if (!("PushManager" in window) || (!standalone && /iPhone|iPad/.test(navigator.userAgent))) { msg.textContent = "Ajoute d'abord Souffle à l'écran d'accueil (Partager, Sur l'écran d'accueil), puis ouvre-le depuis l'icône. Les rappels demandent iOS 16.4 ou plus récent."; ctl.style.display = "none"; return; }
  ctl.style.display = "block";
  msg.textContent = c.on ? "Les rappels sont activés. Chaque rappel est un petit jeu : quiz, anecdote, défi." : "Reçois des rappels ludiques sur ton téléphone, sans ouvrir l'appli.";
  $("#pushToggle").textContent = c.on ? "Désactiver" : "Activer";
  $("#pushTest").style.display = c.on ? "block" : "none";
  seg($("#pushLevel"), c.level || "auto", v => { const k = pushCfg(); k.level = v; setPushCfg(k); $("#pushLvlTxt").textContent = LVL_TXT[v]; if (k.on) pushApi("/state", { id: k.id, level: v, state: pushSummary() }).catch(() => {}); });
  $("#pushLvlTxt").textContent = LVL_TXT[c.level || "auto"];
}
$("#pushToggle").onclick = async () => {
  const b = $("#pushToggle"); b.disabled = true;
  try { if (pushCfg().on) { await disablePush(); toast("Rappels désactivés"); } else { await enablePush(); toast("Rappels activés 🎉"); } }
  catch (e) { toast(e.message === "denied" ? "Notifications refusées : autorise-les dans les réglages du téléphone" : e.message === "full" ? "Le service est complet pour l'instant" : "Impossible d'activer les rappels pour l'instant"); }
  b.disabled = false; renderPushBox();
};
$("#pushTest").onclick = async () => { try { const r = await pushApi("/test", { id: pushCfg().id }); toast(r.ok ? "Notification envoyée 📬" : "Test impossible, réessaie"); } catch (e) { toast("Test impossible, réessaie"); } };
try { if (onPages && "serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", e => { if (e.data && e.data.go === "quiz" && S) { go("sos"); $("#sosSeg").querySelector("[data-v=quiz]").click(); } }); } catch (e) {}

/* ---------- badges ---------- */
let badgeQueue = [];
function checkBadges() {
  if (!S) return;
  const ctx = badgeCtx(), fresh = [];
  let changed = false;
  BADGES.forEach(b => { if (!S.badges[b.id] && b.fn(ctx)) { S.badges[b.id] = Date.now(); changed = true; if (b.id !== "start") fresh.push(b); } }); // « Premier pas » est attribué sans fenêtre
  if (changed) save();
  if (fresh.length) { badgeQueue.push(...fresh); if (!$("#badgeModal").classList.contains("on")) showBadge(); }
}
function showBadge() {
  const b = badgeQueue[0]; if (!b) return;
  const more = badgeQueue.length - 1; badgeQueue = [];
  $("#bmE").textContent = b.e; $("#bmN").textContent = b.n; $("#bmD").textContent = b.d;
  $("#bmMore").textContent = more > 0 ? `+ ${more} autre${more > 1 ? "s" : ""} badge${more > 1 ? "s" : ""} débloqué${more > 1 ? "s" : ""}` : "";
  $("#badgeModal").classList.add("on"); confetti();
}
function showBadgeFx() { confetti(); }
$("#bmOk").onclick = () => { $("#badgeModal").classList.remove("on"); if ($("#v-badges").classList.contains("on")) renderBadges(); };
function renderBadges() {
  const got = BADGES.filter(b => S.badges[b.id]).length;
  $("#badgeCount").textContent = `${got} sur ${BADGES.length} débloqués`;
  const cats = []; BADGES.forEach(b => { if (!cats.includes(b.cat)) cats.push(b.cat); });
  $("#badgeGrid").innerHTML = cats.map(cat => `<div class="cat">${cat}</div><div class="badges">${BADGES.filter(b => b.cat === cat).map(b => { const t = S.badges[b.id];
    return `<div class="badge ${t ? "got" : "locked"}"><div class="e">${b.e}</div><div class="n">${b.n}</div><div class="d">${t ? fmtDate(t, { day: "numeric", month: "short" }) : b.d}</div></div>`; }).join("")}</div>`).join("");
}

/* ---------- infos ---------- */
function renderInfos() {
  const reduce = S.mode === "reduce", ls = lastSmoke(), ref = reduce ? (ls ? ls.t : S.start) : S.quitAt, sec = Math.max(0, (Date.now() - ref) / 1000);
  $("#msIntro").textContent = reduce ? "Depuis ta dernière cigarette. En mode réduction, les premières étapes se rejouent à chaque fois : plus tu espaces, plus ton corps récupère." : "Depuis ton arrêt total.";
  $("#milestones").innerHTML = MS.map(([t, l, txt]) => { const dn = sec >= t, pct = Math.min(100, sec / t * 100);
    return `<div class="ms ${dn ? "done" : ""}"><div class="dot">${dn ? "✓" : ""}</div><div style="flex:1"><div class="t">${l}</div><div class="small muted">${txt}</div>${dn ? "" : `<div class="bar"><i style="width:${pct}%"></i></div>`}</div></div>`; }).join("");
  $("#infos").innerHTML = INFOS.map(([t, d]) => `<div class="info"><b>${t}</b><span class="small muted">${d}</span></div>`).join("");
}

/* ---------- mode et réglages ---------- */
function switchToQuit(fromLaunch) {
  const ls = lastSmoke();
  S.mode = "quit"; S.quitAt = ls ? ls.t : Date.now(); S.quitFrom = quitFromFor(S); if (fromLaunch) S.launched = true;
  save(); $("#setModal").classList.remove("on"); renderAll(); go("home"); toast("Le grand saut ! Tu peux le faire. 🚭");
}
$("#setToQuit").onclick = () => switchToQuit(false);
$("#setToReduce").onclick = () => { S.mode = "reduce"; S.quitAt = null; S.quitFrom = null; save(); $("#setModal").classList.remove("on"); renderAll(); go("home"); toast("Retour en mode réduction. On avance à ton rythme."); };
function subFields() { const on0 = $$("#e-subs .chip.on").map(c => c.dataset.v); $("#e-vapeBox").style.display = on0.includes("vape") ? "block" : "none"; const on = $$("#e-subs .chip.on").map(c => c.dataset.v); $("#e-patchBox").style.display = on.includes("patch") ? "block" : "none"; $("#e-gumBox").style.display = on.includes("gum") ? "block" : "none"; }
function openSettings() {
  const sb = S.subs, q = S.mode === "quit";
  $("#e-day").value = S.baseline; $("#e-price").value = S.packPrice; $("#e-pack").value = S.perPack;
  $("#e-goal").value = S.goal || ""; $("#e-goalp").value = S.goalPrice || "";
  seg($("#e-pace"), String(S.pace));
  $("#e-dday").value = S.dDay ? toDateInput(S.dDay + 6 * HR) : "";
  $("#e-reduceBox").style.display = q ? "none" : "block"; $("#e-quitBox").style.display = q ? "block" : "none";
  if (q) $("#e-date").value = toLocalInput(S.quitAt);
  $$("#e-subs .chip").forEach(c => { c.classList.toggle("on", !!sb[c.dataset.v]); c.onclick = () => { c.classList.toggle("on"); subFields(); }; });
  $("#e-patchMg").value = sb.patchMg; $("#e-patchPrice").value = sb.patchPrice || ""; $("#e-patchPer").value = sb.patchPer || 7;
  $("#e-gumMg").value = sb.gumMg; $("#e-gumPrice").value = sb.gumPrice || ""; $("#e-gumPer").value = sb.gumPer || 30;
  $("#e-vapeNic").value = sb.vapeNic; $("#e-vapePrice").value = sb.vapePrice || ""; $("#e-vapeDays").value = sb.vapeDays || 7;
  subFields();
  $("#setToQuit").style.display = q ? "none" : "block"; $("#setToReduce").style.display = q ? "block" : "none";
  $("#resetConfirm").style.display = "none"; renderPushBox(); $("#setModal").classList.add("on");
}
$("#openSettings").onclick = openSettings;
$("#goalBtn").onclick = () => { openSettings(); setTimeout(() => $("#e-goal").focus(), 200); };
$("#setCancel").onclick = () => $("#setModal").classList.remove("on");
$("#setForm").addEventListener("submit", e => {
  e.preventDefault();
  const on = $$("#e-subs .chip.on").map(c => c.dataset.v);
  Object.assign(S, { baseline: +$("#e-day").value, pace: +$("#e-pace").dataset.val, packPrice: +$("#e-price").value, perPack: +$("#e-pack").value, goal: $("#e-goal").value.trim(), goalPrice: +$("#e-goalp").value || 0 });
  Object.assign(S.subs, { vape: on.includes("vape"), vapeNic: num("#e-vapeNic"), vapePrice: +$("#e-vapePrice").value || 0, vapeDays: +$("#e-vapeDays").value || 7, patch: on.includes("patch"), gum: on.includes("gum"), patchMg: num("#e-patchMg"), patchPrice: +$("#e-patchPrice").value || 0, patchPer: +$("#e-patchPer").value || 7, gumMg: num("#e-gumMg"), gumPrice: +$("#e-gumPrice").value || 0, gumPer: +$("#e-gumPer").value || 30 });
  if (S.mode === "reduce") { const dd = $("#e-dday").value; S.dDay = dd ? dayStart(new Date(dd + "T12:00").getTime()) : null; }
  else { const t = new Date($("#e-date").value).getTime(); if (t) { S.quitAt = t; S.quitFrom = quitFromFor(S); } }
  save(); renderAll(); $("#setModal").classList.remove("on"); toast("Enregistré");
});
$("#resetBtn").onclick = () => $("#resetConfirm").style.display = "block";
$("#resetYes").onclick = () => { S = null; save(); $("#setModal").classList.remove("on"); boot(); };
$$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m && m.id !== "badgeModal") m.classList.remove("on"); }));

/* ---------- démarrage ---------- */
S = loadLocal();
boot();
initRemote();
setInterval(tick, 1000);
setInterval(() => { if (S && $("#v-home").classList.contains("on")) { renderHome(); checkBadges(); } }, 30000);
document.addEventListener("visibilitychange", () => { if (!document.hidden && S) renderAll(); });
