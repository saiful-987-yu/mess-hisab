var C="mess-v1";
var F=["./","index.html","manifest.webmanifest","src/style.css","src/data.js","src/sync.js","src/people.js","src/bill.js","src/app.js","assets/icon.svg","assets/icon-32.png","assets/icon-192.png","assets/icon-512.png","assets/apple-touch-icon.png"];
self.addEventListener("install",function(e){
e.waitUntil(caches.open(C).then(function(c){
return Promise.all(F.map(function(u){return c.add(u).catch(function(){});}));
}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
e.waitUntil(caches.keys().then(function(k){
return Promise.all(k.filter(function(n){return n!==C;}).map(function(n){return caches.delete(n);}));
}).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
var r=e.request,u=new URL(r.url);
if(r.method!=="GET"||u.origin!==location.origin)return;
e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(hit){
var net=fetch(r).then(function(res){
if(res&&res.status===200){
var cp=res.clone();
caches.open(C).then(function(c){return c.put(r,cp);}).catch(function(){});
}
return res;
}).catch(function(){
return hit||(r.mode==="navigate"?caches.match("index.html"):Response.error());
});
if(hit){e.waitUntil(net.catch(function(){}));return hit;}
return net;
}));
});
