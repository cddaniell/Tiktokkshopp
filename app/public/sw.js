/* VetCamp · guarda a página para o aplicativo abrir mesmo com sinal fraco.
   Os dados em si ficam no banco do Firebase, que já funciona sem internet. */
const CACHE = 'samvet-f3aeb5e05c';
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
  if (proprio && u.pathname.startsWith('/__/')) return; // páginas de login do Firebase: sempre direto
  const sdk = u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/');
  const libs = u.hostname === 'cdn.jsdelivr.net' || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (!proprio && !sdk && !libs) return;
  const guardar = resp => { if (resp && (resp.ok || resp.type === 'opaque')) { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(r, copia)); } return resp; };
  // bibliotecas com versão no endereço nunca mudam: abre direto da cópia guardada (mais rápido)
  const libProprio = proprio && u.pathname.startsWith('/lib/'); // muda de nome de cache a cada versão
  if (sdk || libProprio || (libs && u.hostname === 'cdn.jsdelivr.net')) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(guardar)));
    return;
  }
  // página do app: primeiro a rede (para pegar atualizações), mas sem esperar mais de 2 s com sinal fraco
  const rede = fetch(r).then(guardar);
  const copia = () => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : undefined));
  e.respondWith(new Promise(ok => {
    let feito = false;
    const t = setTimeout(() => copia().then(m => { if (m && !feito) { feito = true; ok(m); } }), 2000);
    rede.then(resp => { if (!feito) { feito = true; clearTimeout(t); ok(resp); } })
      .catch(() => copia().then(m => { if (!feito) { feito = true; clearTimeout(t); ok(m || Response.error()); } }));
  }));
});
