/* 暗礁行动 service worker — offline play */
const CACHE='reef-5486dc57';
const ASSETS=["./","index.html","manifest.webmanifest","icons/apple-touch-icon.png","icons/favicon-32.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","fonts/ibm-plex-mono-latin-400-normal.woff2","fonts/ibm-plex-mono-latin-600-normal.woff2","fonts/saira-condensed-latin-500-normal.woff2","fonts/saira-condensed-latin-700-normal.woff2","fonts/saira-condensed-latin-800-normal.woff2"];
// 预缓存和页面导航都去服务器核对（cache:'no-cache'，没变时只回 304）：Pages 给所有文件 max-age=600，走 HTTP 缓存的话刚发布的十分钟里拿到的还是旧页
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'no-cache'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==='navigate'){
    // network first so a new deploy shows up; cached copy when offline
    let q=r;try{q=new Request(r,{cache:'no-cache'});}catch(_){}
    e.respondWith(fetch(q).then(res=>{const c=res.clone();caches.open(CACHE).then(ca=>ca.put('index.html',c));return res;}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(ca=>ca.put(r,c));}return res;})));
});
