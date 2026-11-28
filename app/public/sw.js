/* VetCamp · guarda a página para o aplicativo abrir mesmo com sinal fraco.
   Os dados em si ficam no banco do Firebase, que já funciona sem internet. */
const CACHE = 'samvet-445f0fd4e5';
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

/* avisos: tocar na notificação abre o VetCamp */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const c of l) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
/* aviso em segundo plano (Android e computador com o app instalado): usa a agenda que o app deixou guardada */
self.addEventListener('periodicsync', e => {
  if (e.tag !== 'vetcamp-lembretes') return;
  e.waitUntil((async () => {
    const cache = await caches.open('vetcamp-notif');
    const r = await cache.match('/__notif.json'); if (!r) return;
    const j = await r.json(), c = j.cfg || {}; if (!c.on) return;
    const agora = new Date(), d = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (agora.getHours() < (+c.hora || 7)) return;
    const st = j.st || {}; if (st.dia === d) return;
    const its = (c.dia && j.porDia && j.porDia[d]) || [];
    const opt = { icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' };
    if (its.length) await self.registration.showNotification('VetCamp · ' + its.length + ' para hoje', { ...opt, body: its.slice(0, 4).join('\n'), tag: 'vetcamp-dia' });
    else if (c.motiv) {
      const ontem = new Date(Date.parse(d + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10);
      if (st.motiv !== ontem && st.motiv !== d) { const m = j.msgs || []; if (m.length) await self.registration.showNotification('VetCamp', { ...opt, body: m[Math.floor(Math.random() * m.length)], tag: 'vetcamp-motiv' }); st.motiv = d; }
    }
    st.dia = d; j.st = st;
    await cache.put('/__notif.json', new Response(JSON.stringify(j), { headers: { 'content-type': 'application/json' } }));
  })());
});

/* notificação que chega do servidor (Firebase Cloud Messaging), mesmo com o VetCamp fechado */
self.addEventListener('push', e => {
  let j = {}; try { j = e.data ? e.data.json() : {}; } catch (x) { j = { data: { body: e.data && e.data.text() } }; }
  const n = j.notification || {}, d = j.data || {};
  const titulo = d.title || n.title || 'VetCamp', corpo = d.body || n.body || '';
  e.waitUntil(self.registration.showNotification(titulo, { body: corpo, tag: d.tag || 'vetcamp', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: d.url || './' } }));
});
