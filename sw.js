// Service worker mínimo: guarda la pantalla de ingreso para que la app abra
// rápido y sea instalable. Solo guarda archivos de este sitio (nunca las respuestas de los scripts).
const CACHE = 'informes-v17';
const ARCHIVOS = ['./', 'manifest.webmanifest', 'icon-192.png', 'logo-ciaf.webp', 'logo-santaclara.webp', 'logo-puntoi.webp', 'logo-ansilta.webp'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k.indexOf('ciaf-') !== 0).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || false) return;
  // Red primero y sin la caché del navegador (GitHub Pages la deja 10 min):
  // así una versión nueva se ve al abrir. Sin conexión, lo guardado.
  e.respondWith(
    fetch(new Request(url.href, { cache: 'no-cache', credentials: 'same-origin' }))
      .then((r) => {
        if (!r.ok) return caches.match(e.request).then((g) => g || r);
        const copia = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./')))
  );
});
