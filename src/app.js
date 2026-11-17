(function(){
var T={
bn:{app:"মেস হিসাব",today:"আজ",people:"সদস্য",bill:"হিসাব",settings:"সেটিং",
members:"জন",total:"মোট",
noon:"দুপুর",night:"রাত",eating:"খাচ্ছে",off:"বন্ধ",
hospital:"হাসপাতালে নিতে হবে",home:"বাসায় দিয়ে আসবে",pickup:"নিজে নিয়ে যাবে",zahir:"জহির টাওয়ার",other:"অন্যান্য জায়গা",
pin:"পিন দিন",wrong:"ভুল পিন",tap:"নামে চাপ দিলে খাওয়া বন্ধ/চালু হবে",
shDay:"দিন",shNight:"রাত",
hospS:"হাসপাতাল",othersS:"অন্যান্য",others:"অন্যান্য (নিজে নিয়ে যাবে)",mealU:"মিল",activeM:"সক্রিয় সদস্য",yes:"হ্যাঁ",no:"না",noonG:"দুপুরের",nightG:"রাতের",
askOff:"{n} — {m} খাবার বন্ধ করবেন?",askOn:"{n} — {m} খাবার আবার চালু করবেন?"},
en:{app:"Mess Hisab",today:"Today",people:"People",bill:"Bill",settings:"Settings",
members:"people",total:"Total",
noon:"Noon",night:"Night",eating:"Eating",off:"Off",
hospital:"Bring to hospital",home:"Deliver to home",pickup:"Self pickup",zahir:"Zahir Tower",other:"Other places",
pin:"Enter PIN",wrong:"Wrong PIN",tap:"Tap a name to turn meal off/on",
shDay:"Day",shNight:"Night",
hospS:"Hospital",othersS:"Others",others:"Others (self pickup)",mealU:"meals",activeM:"Active members",yes:"Yes",no:"No",noonG:"noon",nightG:"night",
askOff:"Turn off {m} meal for {n}?",askOn:"Turn {m} meal back on for {n}?"}
};
["bn","en"].forEach(function(l){[People,Bill,Sync].forEach(function(M){for(var k in M.T[l])T[l][k]=M.T[l][k];});});
var TABS=[["today",'<svg viewBox="0 0 24 24"><path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Zm0 0v7"/></svg>'],["people",'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>'],["settings",'<svg viewBox="0 0 24 24"><path d="M6 3v6M6 13v8M12 3v10M12 17v4M18 3v3M18 10v11"/><circle cx="6" cy="11" r="2"/><circle cx="12" cy="15" r="2"/><circle cx="18" cy="8" r="2"/></svg>']];
var PLACES=["hospital","zahir","others"];
var root=document.documentElement,view=document.getElementById("view"),tabs=document.getElementById("tabs"),title=document.getElementById("title");
var dayOff=0,unlocked=false,ord="";
function lang(){return root.lang==="en"?"en":"bn";}
function tr(k){return T[lang()][k];}
function num(n){return lang()==="bn"?n.toLocaleString("bn-BD"):String(n);}
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function cnt(cls,a,b,tip){
var d=el("div",cls);
d.title=tip;
d.appendChild(el("span","mi on"));
d.appendChild(el("b","",num(a)));
d.appendChild(el("span","sep","·"));
d.appendChild(el("span","mi off"));
d.appendChild(el("b","",num(b)));
return d;
}
function parts(){return location.hash.slice(1).split("/");}
function route(){var h=parts()[0];return TABS.some(function(t){return t[0]===h;})?h:"today";}
function dayDate(){var d=new Date();d.setDate(d.getDate()+dayOff);return d;}
function dayKey(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);}
function placeOf(p,meal,key){
var u=Store.duty(p,key);
if(u){
var fri=new Date(key+"T00:00:00").getDay()===5;
if(u.day)return meal==="noon"||fri?"hospital":"pickup";
return meal==="noon"&&!fri?"zahir":"pickup";
}
return p.group==="zahir"&&meal==="noon"?"zahir":"pickup";
}
function dlg(o){
var ov=el("div","ov"),bx=el("div","dlg"),row=el("div","row"),api={},prim=null;
function close(){if(ov.parentNode)ov.parentNode.removeChild(ov);}
api.close=close;
if(!o.lock)ov.onclick=function(e){if(e.target===ov&&Date.now()>window.App.blk)close();};
if(o.title)bx.appendChild(el("h2","",o.title));
(o.lines||[]).forEach(function(t,k){bx.appendChild(el("div","al"+(k===0&&o.bold?" b":""),t));});
if(o.input){
var i=document.createElement("input");
i.type=o.input.type||"text";
i.value=o.input.value||"";
i.placeholder=o.input.ph||"";
i.readOnly=!!o.input.ro;
i.autocomplete="off";
if(o.input.mode)i.inputMode=o.input.mode;
i.onkeydown=function(e){if(e.key==="Enter"&&prim)prim.click();};
bx.appendChild(i);
api.input=i;
}
if(o.ticks){
var tk=el("div","tks");
api.ticks=o.ticks.map(function(t){
var lb=el("label","tk"),cb=document.createElement("input");
cb.type="checkbox";cb.checked=!!t.checked;
if(t.on)cb.onchange=function(){t.on(cb.checked);};
lb.appendChild(cb);lb.appendChild(el("span","",t.label));
tk.appendChild(lb);
return cb;
});
bx.appendChild(tk);
}
o.btns.forEach(function(b){
var bt=el("button",b.primary?"yes":"",b.label);
bt.onclick=function(){
if((b.fn?b.fn(api):0)===false)return;
close();
};
if(b.primary)prim=bt;
row.appendChild(bt);
});
bx.appendChild(row);
ov.appendChild(bx);
document.body.appendChild(ov);
if(api.input){api.input.focus();if(o.input.ro)api.input.select();}
return api;
}
function msg(text,done){
dlg({title:text,btns:[{label:tr("ok"),primary:1,fn:function(){if(done)done();}}]});
}
function ask(text,yes,lines,yl,no,lock){
dlg({title:text,lines:lines,bold:1,lock:lock,btns:[{label:tr("no"),fn:function(){if(no)no();}},{label:yl||tr("yes"),primary:1,fn:function(){yes();}}]});
}
function unlock(cb){
if(unlocked){cb();return;}
dlg({title:tr("pin"),input:{type:"password"},btns:[{label:tr("cancel")},{label:tr("ok"),primary:1,fn:function(a){
var v=a.input.value;
if(!v)return false;
if(v===String(Store.load().settings.pin)||(Sync.on&&!Sync.pinOk())){unlocked=true;Sync.pin=v;cb();return;}
msg(tr("wrong"));
}}]});
}
function toggle(key,p,meal,o){
unlock(function(){
ask(tr(o?"askOn":"askOff").replace("{m}",tr(meal+"G")).replace("{n}",function(){return p.name;}),function(){
var y=window.scrollY,sl=[].map.call(view.querySelectorAll(".rows2"),function(e){return e.scrollLeft;});
Store.toggleOff(key,p.id,meal);
render();
window.scrollTo(0,y);
[].forEach.call(view.querySelectorAll(".rows2"),function(e,i){e.scrollLeft=sl[i]||0;});
});
});
}
function order(){
var n=new Date(),m=n.getHours()*60+n.getMinutes();
return dayOff===0&&m>=930&&m<1350?["night","noon"]:["noon","night"];
}
function calc(d,key,meal){
var eat=0,offc=0,by={};
d.people.forEach(function(p){
if(!Store.active(p,key))return;
var pl=placeOf(p,meal,key),o=Store.isOff(key,p.id,meal);
if(pl==="pickup"||pl==="other")pl="others";
if(o)offc++;else eat++;
(by[pl]||(by[pl]=[])).push({p:p,o:o});
});
return{eat:eat,off:offc,by:by};
}
function got(r,pl){return(r.by[pl]||[]).filter(function(x){return !x.o;}).length;}
function mini(p){
var a=el("span","ca");
if(p.photo){var i=document.createElement("img");i.src=p.photo;i.alt="";a.appendChild(i);}
else a.textContent=p.name.charAt(0);
return a;
}
function sline(meal,a){
var l=el("div","sl");
l.appendChild(el("span","mute",tr(meal)+": "));
a.forEach(function(x,i){
if(i)l.appendChild(el("span","sep","·"));
l.appendChild(el("span","",tr(x[0])+" "));
l.appendChild(el("b","",num(x[1])));
});
return l;
}
function renderTabs(){
tabs.textContent="";
var r=route();
TABS.forEach(function(t){
if(t[0]==="settings")return;
var b=el("button",t[0]===r?"on":"");
var ic=el("span","ic");
ic.innerHTML=t[1];
b.appendChild(ic);
b.appendChild(el("span","",tr(t[0])));
b.onclick=function(){location.hash=t[0];};
tabs.appendChild(b);
});
}
function renderToday(){
var d=Store.load(),dt=dayDate(),key=dayKey(dt);
var nav=el("div","card row");
var prev=el("button","","‹");prev.onclick=function(){dayOff--;render();};
var next=el("button","","›");next.onclick=function(){dayOff++;render();};
var mid=el("div","dnav");
var ds=dt.toLocaleDateString(lang()==="bn"?"bn-BD":"en-GB",{weekday:"long",day:"numeric",month:"long"});
mid.appendChild(el("div","dd",ds));
if(dayOff===0)mid.appendChild(el("div","mute",tr("today")));
nav.appendChild(prev);nav.appendChild(mid);nav.appendChild(next);
view.appendChild(nav);
var R={noon:calc(d,key,"noon"),night:calc(d,key,"night")};
var sc=el("div","card");
var r1=el("div","row sum");
["noon","night"].forEach(function(m){r1.appendChild(el("b","",tr(m)+" "+num(R[m].eat)+" "+tr("mealU")));});
sc.appendChild(r1);
var hz=got(R.noon,"hospital"),zz=got(R.noon,"zahir");
sc.appendChild(sline("noon",[["hospS",hz],["zahir",zz],["othersS",R.noon.eat-hz-zz]]));
if(dt.getDay()===5)sc.appendChild(sline("night",[["hospS",got(R.night,"hospital")]]));
var ac=d.people.filter(function(p){return Store.active(p,key);}).length;
sc.appendChild(el("div","mute sl",tr("activeM")+" "+num(ac)+" "+tr("members")));
view.appendChild(sc);
ord=order().join();
order().forEach(function(meal){
var r=R[meal],c=el("div","card");
var h=el("div","row mh");
h.appendChild(el("h2","",tr(meal)));
h.appendChild(el("div","mid mute",tr("eating")+" "+num(r.eat)+" · "+tr("off")+" "+num(r.off)));
h.appendChild(el("div","big",num(r.eat)));
c.appendChild(h);
PLACES.forEach(function(pl){
var list=r.by[pl];
if(!list)return;
var g=el("div","place");
var gh=el("div","row ph");
gh.appendChild(el("span","",tr(pl)));
gh.appendChild(el("b","",num(got(r,pl))));
g.appendChild(gh);
var chips=el("div","chips rows2");
list.forEach(function(x){
var b=el("button","chip pc"+(x.o?" off":""));
b.appendChild(mini(x.p));
b.appendChild(el("span","nm",x.p.name));
hold(b,function(){toggle(key,x.p,meal,x.o);});
chips.appendChild(b);
});
g.appendChild(chips);
c.appendChild(g);
});
view.appendChild(c);
});
}
function render(){
title.textContent=tr("app");
document.getElementById("btnLang").textContent=lang()==="bn"?"EN":"বাং";
view.textContent="";
view.className="";
var r=route();
if(r==="today")renderToday();else if(r==="people")People.render(parts());else Bill.settings();
renderTabs();
}
function hold(e,fn,ms){
var tm=0,x=0,y=0;
function stop(){clearTimeout(tm);}
e.classList.add("hold");
e.addEventListener("pointerdown",function(ev){
stop();x=ev.clientX;y=ev.clientY;
tm=setTimeout(function(){window.App.blk=Date.now()+700;fn();},ms||600);
});
e.addEventListener("pointermove",function(ev){if(Math.abs(ev.clientX-x)>10||Math.abs(ev.clientY-y)>10)stop();});
["pointerup","pointerleave","pointercancel"].forEach(function(n){e.addEventListener(n,stop);});
e.addEventListener("contextmenu",function(ev){ev.preventDefault();});
}
(function(){
var lg=document.querySelector(".logo");
lg.draggable=false;
hold(lg,function(){location.hash="settings";},700);
})();
document.getElementById("btnLang").onclick=function(){
root.lang=lang()==="bn"?"en":"bn";
try{localStorage.setItem("mess_lang",root.lang);}catch(e){}
render();
};
document.getElementById("btnTheme").onclick=function(){
root.dataset.theme=root.dataset.theme==="dark"?"light":"dark";
try{localStorage.setItem("mess_theme",root.dataset.theme);}catch(e){}
};
window.App={dlg:dlg,msg:msg,hold:hold,blk:0,back:back,ask:ask,cnt:cnt,tr:tr,num:num,el:el,lang:lang,unlock:unlock,dayKey:dayKey,view:view,render:render,relock:function(){unlocked=false;}};
var cur=location.hash.slice(1),prev="",pos={};
function tabLevel(h){var a=h.split("/");return a.length===1&&(a[0]===""||TABS.some(function(t){return t[0]===a[0];}));}
function pk(h){return h===""?"today":h;}
function back(h){if(prev===h)history.back();else location.replace("#"+h);}
if("scrollRestoration" in history)history.scrollRestoration="manual";
window.addEventListener("hashchange",function(){
if(tabLevel(cur))pos[pk(cur)]=window.scrollY;
prev=cur;cur=location.hash.slice(1);
render();
window.scrollTo(0,tabLevel(cur)?pos[pk(cur)]||0:0);
});
setInterval(function(){
if(route()!=="today"||document.querySelector(".ov")||order().join()===ord)return;
var y=window.scrollY;
render();
window.scrollTo(0,y);
},60000);
if(!Sync.on)Store.fixIds();
render();
Sync.load();
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register("sw.js").catch(function(){});
})();
