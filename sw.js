/* Service Worker — Emilia Tengil Batu
 * Naikkan VERSION setiap kali index.html / aset berubah agar pengguna dapat pembaruan. */
const VERSION = 'v1.1.0';
const SHELL_CACHE = `etb-shell-${VERSION}`;
const RUNTIME_CACHE = 'etb-runtime-v1';

const SCOPE = self.registration.scope;
const INDEX_URL = new URL('./index.html', SCOPE).href;
const SHELL = [
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

// Sumber eksternal yang dipakai index.html (di-cache agar bisa dibuka offline)
const CDN_PRECACHE = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];
const CDN_HOSTS = ['cdn.tailwindcss.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })));

    // Best-effort: gagal salah satu CDN tidak menggagalkan instalasi
    const runtime = await caches.open(RUNTIME_CACHE);
    await Promise.all(CDN_PRECACHE.map(async (url) => {
      try {
        const res = await fetch(new Request(url, { mode: 'no-cors' }));
        if (res && (res.ok || res.type === 'opaque')) await runtime.put(url, res);
      } catch (_) { /* offline saat install: akan di-cache saat pemakaian pertama */ }
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith('etb-shell-') && k !== SHELL_CACHE).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// stale-while-revalidate
async function swr(event, request, cacheName, matchOpts) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, matchOpts);
  const update = fetch(request)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  if (cached) { event.waitUntil(update); return cached; }
  return (await update) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigasi → selalu sajikan app shell (cepat & offline), perbarui di latar
  if (req.mode === 'navigate' && url.origin === location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(INDEX_URL);
      const update = fetch(INDEX_URL, { cache: 'no-cache' })
        .then((res) => { if (res && res.ok) cache.put(INDEX_URL, res.clone()); return res; })
        .catch(() => null);
      if (cached) { event.waitUntil(update); return cached; }
      return (await update) || new Response('Offline — buka sekali saat online dulu.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    })());
    return;
  }

  // Aset satu origin
  if (url.origin === location.origin) {
    event.respondWith(swr(event, req, SHELL_CACHE));
    return;
  }

  // CDN yang dikenal
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(swr(event, req, RUNTIME_CACHE));
  }
});
