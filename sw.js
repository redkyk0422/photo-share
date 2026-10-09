// 앱 화면은 캐시해 두고, 사진 목록(photos.json)은 늘 새로 받아온다
const CACHE = 'photo-share-v1';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest', './jszip.min.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.includes('/photos/thumb/')) { // 썸네일은 캐시 우선
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return res; })));
    return;
  }
  if (u.pathname.includes('/photos/full/')) return; // 원본은 그냥 네트워크
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
