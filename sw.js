// KKB AJANDA - arka plan bildirimleri (service worker)
const WORKER = "https://kkb-bildirim.KULLANICI.workers.dev"; // Worker adresiniz
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
async function idOf(endpoint){
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
  return b64u(d).slice(0,32);
}
self.addEventListener("install", ()=>self.skipWaiting());
self.addEventListener("activate", e=>e.waitUntil(self.clients.claim()));
self.addEventListener("push", e=>e.waitUntil((async()=>{
  try {
    const sub = await self.registration.pushManager.getSubscription();
    if (sub){
      const r = await fetch(WORKER + "/pending?id=" + await idOf(sub.endpoint));
      const j = await r.json();
      if (j.items && j.items.length){
        for (const it of j.items){
          await self.registration.showNotification(it.b, {body: it.m, tag: it.b + it.t, icon: "apple-touch-icon.png"});
        }
        return;
      }
    }
  } catch(err){}
  await self.registration.showNotification("KKB AJANDA", {body: "Yeni bir uyarı var. Uygulamayı açıp kontrol et.", icon: "apple-touch-icon.png"});
})()));
self.addEventListener("notificationclick", e=>{
  e.notification.close();
  e.waitUntil(clients.openWindow("./"));
});
