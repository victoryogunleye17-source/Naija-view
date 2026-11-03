// NaijaView service worker: offline app shell + cached map tiles
const VER = 'v8';
const SHELL = 'nv-shell-' + VER, TILES = 'nv-tiles-' + VER, MAX_TILES = 2500;
const SHELL_FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
const TILE_HOSTS = /(arcgisonline\.com|arcgis\.com|cartocdn\.com|gibs\.earthdata\.nasa\.gov)$/;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await Promise.allSettled(SHELL_FILES.map(u => c.add(u)));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL && k !== TILES) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === 'navigate') {            // network first so updates arrive; cache is the offline fallback
      e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(SHELL).then(c => c.put('./index.html', cp)); return r; })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
      return;
    }
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
    return;
  }
  if (TILE_HOSTS.test(url.hostname)) e.respondWith(tile(req, /gibs\./.test(url.hostname)));
});
async function tile(req, revalidate) {
  const c = await caches.open(TILES);
  const hit = await c.match(req);
  const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') { c.put(req, r.clone()); trim(c); } return r; }).catch(() => null);
  if (hit) { if (revalidate) net.catch(() => {}); return hit; }   // NASA tiles refresh in the background
  return (await net) || Response.error();
}
let trimming = false;
async function trim(c) {
  if (trimming) return; trimming = true;
  try { const keys = await c.keys(); if (keys.length > MAX_TILES) for (const k of keys.slice(0, keys.length - MAX_TILES + 60)) await c.delete(k); }
  finally { trimming = false; }
}
