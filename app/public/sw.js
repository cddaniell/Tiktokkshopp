/* VetCamp · guarda a página para o aplicativo abrir mesmo com sinal fraco.
   Os dados em si ficam no banco do Firebase, que já funciona sem internet. */
const CACHE = 'samvet-5d918b9de7';
const BASICO = ['./', 'index.html', 'firebase-config.js', 'manifest.webmanifest', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICO)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('samvet-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const proprio = u.origin === location.origin;
  const sdk = u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/');
  const libs = u.hostname === 'cdn.jsdelivr.net' || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (!proprio && !sdk && !libs) return;
  // primeiro a rede (para pegar atualizações); sem rede, a cópia guardada
  e.respondWith(fetch(r).then(resp => {
    if (resp && (resp.ok || resp.type === 'opaque')) { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(r, copia)); }
    return resp;
  }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : undefined))));
});
