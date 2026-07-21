/* Maliya service worker — app-shell cache, version-stamped.
   Rules: never touch non-GET requests, and NEVER cache anything going to
   Supabase (auth/data) — those must always hit the network. */
const VERSION = "maliya-v2.0.0";
const SHELL = ["./", "./index.html", "./css/app.css", "./js/config.js",
  "./js/core.js", "./js/app.js", "./manifest.json",
  "./assets/icon-192.png", "./assets/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.endsWith("supabase.co") || url.hostname.endsWith("supabase.in")) return; /* network only */
  e.respondWith(
    caches.match(req).then(hit => hit ||
      fetch(req).then(res => {
        if (res.ok && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
