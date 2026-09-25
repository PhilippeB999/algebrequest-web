/* Service worker — rend AlgèbreQuest disponible hors ligne.
   Au premier chargement, il met en cache tous les fichiers de l'app.
   Ensuite, l'app se lance sans réseau, exactement comme une app native. */

const CACHE = "algebrequest-v5";
const ASSETS = [
  "index.html",
  "theme-saisonnier.js",
  "manifest.json",
  "favicon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// RÉSEAU D'ABORD : en ligne on sert toujours la version fraîche et on met le
// cache à jour ; hors ligne seulement, on se rabat sur le cache.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() =>
      caches.match(e.request).then((hit) => hit || caches.match("index.html"))
    )
  );
});
