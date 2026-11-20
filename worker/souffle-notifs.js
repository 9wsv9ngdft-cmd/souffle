// Souffle : envoie les rappels (notifications push) aux horaires du jour, selon le rythme de la personne.
// Ne reçoit jamais de dosage ni d'historique détaillé : seulement un petit résumé (voir cleanState).
const APP_URL = "https://9wsv9ngdft-cmd.github.io/souffle/";
const TZ = "Europe/Paris";
const MAX_USERS = 20;
const PUSH_HOSTS = ["push.apple.com", "googleapis.com", "push.services.mozilla.com", "notify.windows.com"];

const enc = new TextEncoder();
const b64u = buf => { let s = ""; for (const b of new Uint8Array(buf)) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const unb64u = s => { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
const concat = (...a) => { const out = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let o = 0; for (const x of a) { out.set(x, o); o += x.length; } return out; };
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const json = (o, status) => new Response(JSON.stringify(o), { status: status || 200, headers: Object.assign({ "Content-Type": "application/json" }, CORS) });

function local(ts) {
  const p = {};
  for (const x of new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(ts))) p[x.type] = x.value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, min: +p.minute };
}
const dayKey = ts => { const l = local(ts - 4 * 3600000); return `${l.y}-${l.m}-${l.d}`; };

// ---------- clés VAPID (créées une seule fois, gardées dans KV) ----------
async function vapid(env, create) {
  let v = await env.SOUFFLE.get("vapid", "json");
  if (!v && create) {
    const k = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    v = { pub: b64u(await crypto.subtle.exportKey("raw", k.publicKey)), jwk: await crypto.subtle.exportKey("jwk", k.privateKey) };
    await env.SOUFFLE.put("vapid", JSON.stringify(v));
  }
  return v;
}
async function vapidHeader(v, endpoint) {
  const aud = new URL(endpoint).origin;
  const head = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = b64u(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: APP_URL })));
  const key = await crypto.subtle.importKey("jwk", v.jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(head + "." + body));
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${v.pub}`;
}
// ---------- chiffrement du message (RFC 8291, aes128gcm) ----------
async function hkdf(salt, ikm, info, bytes) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, bytes * 8));
}
async function encrypt(sub, text) {
  const uaPub = unb64u(sub.keys.p256dh), auth = unb64u(sub.keys.auth);
  const as = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(auth, secret, concat(enc.encode("WebPush: info\0"), uaPub, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, concat(enc.encode(text), new Uint8Array([2]))));
  const head = new Uint8Array(21); head.set(salt); new DataView(head.buffer).setUint32(16, 4096); head[20] = 65;
  return concat(head, asPub, ct);
}
async function push(env, v, sub, msg) {
  const body = await encrypt(sub, JSON.stringify(msg));
  const r = await fetch(sub.endpoint, { method: "POST", body, headers: {
    "Authorization": await vapidHeader(v, sub.endpoint), "Content-Encoding": "aes128gcm",
    "Content-Type": "application/octet-stream", "TTL": "3600", "Urgency": "normal" } });
  return r.status;
}

// ---------- horaires et messages ----------
// Chaque créneau : heure, type de message. Trois niveaux d'intensité.
const SLOTS = {
  calm:   [["08:00", "morning"], ["13:30", "quiz"], ["21:00", "evening"]],
  normal: [["08:00", "morning"], ["10:00", "point"], ["13:30", "quiz"], ["17:00", "move"], ["18:30", "risk"], ["21:00", "evening"]],
  more:   [["08:00", "morning"], ["10:00", "point"], ["11:45", "water"], ["13:30", "quiz"], ["15:30", "fact"], ["17:00", "move"], ["18:30", "risk"], ["19:45", "quiz"], ["21:00", "evening"], ["22:15", "bye"]]
};
const pick = a => a[Math.floor(Math.random() * a.length)];
const MSG = {
  morning: [
    n => ["☀️ Bonjour !", n > 0 ? `Ton objectif du jour : ${n} au maximum. Ta mission t'attend.` : "Aujourd'hui, c'est zéro. Ta mission t'attend, 2 minutes."],
    () => ["☀️ Nouvelle journée", "Une mission de 2 minutes t'attend. Et un patch à poser si tu en as un !"]
  ],
  point: [
    () => ["☕ Petit point", "Depuis ce matin, comment ça va ? Réponds en un tap, et une anecdote t'attend."],
    () => ["🌬️ Coucou", "Un petit point rapide ? Aucun jugement, juste un tap."]
  ],
  water: [
    () => ["💧 Défi express", "Un grand verre d'eau, cul sec ! Dix secondes, et tu as gagné."],
    () => ["💧 Hydratation", "Bois un verre d'eau lentement : la bouche et les mains occupées, c'est déjà une victoire."]
  ],
  quiz: [
    () => ["🎲 Quiz de 30 secondes ?", "Une bonne réponse = confettis. Tu es partant·e ?"],
    () => ["🎯 Pause fun", "Une petite question pour toi. Les confettis t'attendent."],
    () => ["🧠 Tu es plus fort·e que tu crois", "Teste-toi : un quiz de 30 secondes."]
  ],
  fact: [
    () => ["🧠 Tiens, le savais-tu ?", "Une anecdote fraîche t'attend sur l'accueil."],
    () => ["💡 Anecdote du moment", "Une petite info qui change tout, à lire en 10 secondes."]
  ],
  move: [
    () => ["🏃 7 minutes ?", "Le circuit t'attend : une chaise, un mur, et l'envie s'envole."],
    () => ["🏃 Un peu de mouvement", "Même 3 minutes : l'onglet SOS, puis Bouger."]
  ],
  risk: [
    () => ["🚨 Heure sensible", "La fin de journée, c'est le piège classique. Respire 3 minutes ou lance un quiz."],
    () => ["🛟 On tient bon", "Un petit point, puis respire. Tu gères."]
  ],
  evening: [
    () => ["🌙 Bilan du soir", "Comment s'est passée ta journée ? Note-la, même si elle n'a pas été parfaite."],
    () => ["🌙 Fin de journée", "Fais ton point du soir : chaque jour compte."]
  ],
  bye: [
    () => ["🌟 Bravo pour aujourd'hui", "Une journée de plus de gagnée. Dors bien !"]
  ]
};
// niveau réel d'après le réglage et le rythme des derniers jours
function level(u) {
  const s = u.state || {};
  if (u.level === "calm" || u.level === "normal" || u.level === "more") return u.level;
  if (s.rhythm === "more") return "more";
  if (s.rhythm === "less") return "calm";
  return "normal";
}
const toMin = t => +t.slice(0, 2) * 60 + +t.slice(3);

async function run(env, now) {
  const v = await vapid(env, false); if (!v) return;
  const l = local(now), cur = l.h * 60 + l.min, day = dayKey(now);
  const list = await env.SOUFFLE.list({ prefix: "u:" });
  for (const k of list.keys) {
    const u = await env.SOUFFLE.get(k.name, "json"); if (!u || !u.on) continue;
    const slot = SLOTS[level(u)].find(([t]) => cur >= toMin(t) && cur < toMin(t) + 15);
    if (!slot) continue;
    const sentKey = "s:" + k.name.slice(2) + ":" + day + ":" + slot[0];
    if (await env.SOUFFLE.get(sentKey)) continue;
    // pas de rappel juste après une saisie (moins de 20 min) : la personne est déjà dans l'appli
    if (u.state && u.state.last && now - u.state.last < 20 * 60000) continue;
    const [title, body] = pick(MSG[slot[1]])((u.state && u.state.target) || 0);
    const url = APP_URL + (slot[1] === "quiz" || slot[1] === "risk" ? "#quiz" : "");
    const st = await push(env, v, u.sub, { title, body, url, tag: "souffle-" + slot[1] });
    await env.SOUFFLE.put(sentKey, "1", { expirationTtl: 2 * 86400 });
    if (st === 404 || st === 410) await env.SOUFFLE.delete(k.name);
  }
}

// ---------- API ----------
const okId = id => typeof id === "string" && /^[A-Za-z0-9-]{8,64}$/.test(id);
function okSub(sub) {
  try {
    const h = new URL(sub.endpoint).hostname;
    return sub.endpoint.startsWith("https://") && PUSH_HOSTS.some(x => h === x || h.endsWith("." + x)) && sub.keys && sub.keys.p256dh && sub.keys.auth;
  } catch (e) { return false; }
}
// petit résumé seulement : objectif du jour, rythme, dernière saisie
function cleanState(s) {
  s = s && typeof s === "object" ? s : {};
  return {
    target: Math.max(0, Math.min(60, +s.target || 0)),
    rhythm: ["more", "less"].includes(s.rhythm) ? s.rhythm : "",
    last: +s.last > 0 ? +s.last : 0
  };
}
export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const path = new URL(req.url).pathname;
    if (req.method === "GET" && path === "/key") return json({ key: (await vapid(env, true)).pub });
    if (req.method === "GET" && path === "/") return json({ ok: true, app: "Souffle : rappels" });
    if (req.method !== "POST") return json({ error: "not found" }, 404);
    let b; try { b = JSON.parse(await req.text()); } catch (e) { return json({ error: "bad json" }, 400); }
    if (!b || !okId(b.id)) return json({ error: "bad id" }, 400);
    const key = "u:" + b.id;
    if (path === "/register") {
      if (!okSub(b.sub)) return json({ error: "bad subscription" }, 400);
      const old = await env.SOUFFLE.get(key, "json");
      if (!old && (await env.SOUFFLE.list({ prefix: "u:" })).keys.length >= MAX_USERS) return json({ error: "full" }, 403);
      await env.SOUFFLE.put(key, JSON.stringify({ sub: b.sub, on: b.on !== false, level: ["auto", "calm", "normal", "more"].includes(b.level) ? b.level : "auto", state: cleanState(b.state), at: Date.now() }));
      return json({ ok: true });
    }
    const u = await env.SOUFFLE.get(key, "json");
    if (path === "/unregister") { await env.SOUFFLE.delete(key); return json({ ok: true }); }
    if (!u) return json({ error: "unknown" }, 404);
    if (path === "/state") {
      u.state = cleanState(b.state);
      if (["auto", "calm", "normal", "more"].includes(b.level)) u.level = b.level;
      if (typeof b.on === "boolean") u.on = b.on;
      await env.SOUFFLE.put(key, JSON.stringify(u));
      return json({ ok: true });
    }
    if (path === "/test") {
      const st = await push(env, await vapid(env, false), u.sub, { title: "Souffle 🌬️", body: "Ça marche ! Tes rappels arriveront comme ça, avec un petit jeu à chaque fois.", url: APP_URL, tag: "souffle-test" });
      return json({ ok: st >= 200 && st < 300, status: st });
    }
    return json({ error: "not found" }, 404);
  },
  async scheduled(ev, env, ctx) { ctx.waitUntil(run(env, Date.now())); }
};
