// Souffle : reçoit les rappels (notifications). Ne garde rien en cache : la page se met à jour toute seule.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Souffle 🌬️", {
    body: d.body || "Un petit point ?", icon: "icon-192.png", badge: "icon-192.png", tag: d.tag || "souffle", data: { url: d.url || "./" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = e.notification.data.url || "./", quiz = /#quiz$/.test(url);
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    for (const w of ws) if ("focus" in w) { if (quiz) w.postMessage({ go: "quiz" }); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
