import worker from "../worker/souffle-notifs.js";
let fails = 0; const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const store = new Map();
const env = { SOUFFLE: {
  async get(k, t) { const v = store.get(k); if (v === undefined) return null; return t === "json" ? JSON.parse(v) : v; },
  async put(k, v) { store.set(k, String(v)); }, async delete(k) { store.delete(k); },
  async list({ prefix }) { return { keys: [...store.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })) }; } } };
const pushes = [];
globalThis.fetch = async (url, o) => { pushes.push({ url, h: o.headers }); return new Response(null, { status: 201 }); };
const call = async (path, body) => (await worker.fetch(new Request("https://x" + path, { method: body ? "POST" : "GET", body: body ? JSON.stringify(body) : undefined }), env)).json();
const b64u = b => Buffer.from(b).toString("base64url");
const kp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
const sub = { endpoint: "https://web.push.apple.com/abc", keys: { p256dh: b64u(await crypto.subtle.exportKey("raw", kp.publicKey)), auth: b64u(crypto.getRandomValues(new Uint8Array(16))) } };
const id = "test-user-0001";
ok((await call("/key")).key.length > 60, "clé VAPID créée");
ok((await call("/register", { id, sub, level: "normal", state: { target: 9 } })).ok, "inscription");
ok((await call("/register", { id: "x", sub })).error, "mauvais identifiant refusé");
ok((await call("/register", { id: "bad-sub-0001", sub: { endpoint: "https://evil.example/x", keys: sub.keys } })).error, "service de push inconnu refusé");
const at = (h, m) => Date.parse(`2026-11-21T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+01:00`);
const run = t => worker.scheduled({}, env, { waitUntil: p => p }) && 0;
// appel direct de run via scheduled avec horloge simulée
const realNow = Date.now; const runAt = async t => { Date.now = () => t; let p; await worker.scheduled({}, env, { waitUntil: x => { p = x; } }); await p; Date.now = realNow; };
await runAt(at(8, 5)); ok(pushes.length === 1, "08 h 05 : mission du matin envoyée");
await runAt(at(8, 10)); ok(pushes.length === 1, "pas de doublon dans le même créneau");
await runAt(at(9, 0)); ok(pushes.length === 1, "9 h : rien");
await runAt(at(10, 5)); ok(pushes.length === 2, "10 h 05 : petit point (niveau normal)");
await call("/state", { id, level: "calm" });
await runAt(at(17, 5)); ok(pushes.length === 2, "niveau discret : pas de rappel à 17 h");
await runAt(at(21, 2)); ok(pushes.length === 3, "niveau discret : bilan du soir à 21 h");
await call("/state", { id, level: "auto", state: { target: 5, rhythm: "more" } });
await runAt(at(11, 50)); ok(pushes.length === 4, "auto + ça craque : rappel supplémentaire à 11 h 45");
await call("/state", { id, level: "auto", state: { target: 5, rhythm: "less" } });
await runAt(at(15, 35)); ok(pushes.length === 4, "auto + tout va bien : pas de rappel de 15 h 30");
await call("/state", { id, level: "normal", state: { target: 5, last: at(18, 25) } });
Date.now = () => at(18, 35); let p2; await worker.scheduled({}, env, { waitUntil: x => { p2 = x; } }); await p2; Date.now = realNow;
ok(pushes.length === 4, "saisie il y a moins de 20 min : on ne dérange pas");
ok((await call("/test", { id })).ok, "test d'envoi");
ok(pushes[0].h["Authorization"].startsWith("vapid t="), "en-tête VAPID présent");
ok((await call("/unregister", { id })).ok && !(await call("/state", { id, state: {} })).ok, "désinscription");
console.log(fails ? "ÉCHECS : " + fails : "Tout est OK"); process.exit(fails ? 1 : 0);
