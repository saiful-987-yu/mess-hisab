var People=(function(){
var T={
bn:{add:"+ নতুন সদস্য",name:"নাম",phone:"ফোন নম্বর",place:"কোন গ্রুপ",join:"জয়েন তারিখ",leave:"শেষ তারিখ (ঐচ্ছিক)",photo:"ছবি",save:"সেভ",cancel:"বাতিল",edit:"এডিট",ate:"খাওয়া বেলা",offm:"বন্ধ বেলা",joined:"জয়েন",ended:"শেষ",ok:"ঠিক আছে",tickHint:"টিক থাকলে খাবে, টিক তুললে ওই বেলা বন্ধ",nameReq:"নাম দিন",back:"‹ পেছনে",
del:"সদস্য মুছে ফেলুন",delQ:"{n} — মুছে ফেলবেন?",delDue:"বাকি আছে (সদস্যের কাছে মেসের পাওনা): {a}",delAdv:"অ্যাডভান্স জমা আছে (সদস্যকে ফেরত দিতে হবে): {a}",delClear:"কোনো পাওনা-দেনা নেই",delWarn:"এই সদস্যের সব তথ্য ও হিস্ট্রি (খাওয়া, জমা, ছবি) স্থায়ীভাবে মুছে যাবে। ফেরানো যাবে না।",delYes:"হ্যাঁ, মুছে দিন",
idL:"আইডি",idF:"আইডি (৪ সংখ্যা)",idBad:"আইডি ঠিক ৪ সংখ্যার হতে হবে",idDup:"এই আইডি আরেকজনের আছে",share:"শেয়ার",copied:"লিংক কপি হয়েছে",loading:"লোড হচ্ছে…",pick:"ছবি বাছুন"},
en:{add:"+ New member",name:"Name",phone:"Phone",place:"Group",join:"Join date",leave:"End date (optional)",photo:"Photo",save:"Save",cancel:"Cancel",edit:"Edit",ate:"Meals eaten",offm:"Meals off",joined:"Joined",ended:"End",ok:"OK",tickHint:"Ticked = eats, untick = meal off",nameReq:"Enter a name",back:"‹ Back",
del:"Delete member",delQ:"{n} — delete?",delDue:"Due (owed to the mess): {a}",delAdv:"Advance paid (to be returned to the member): {a}",delClear:"No dues or advance",delWarn:"All data and history of this member (meals, payments, photo) will be permanently deleted. This cannot be undone.",delYes:"Yes, delete",
idL:"ID",idF:"ID (4 digits)",idBad:"ID must be exactly 4 digits",idDup:"This ID is already used",share:"Share",copied:"Link copied",loading:"Loading…",pick:"Choose photo"}
};
var WK={bn:["শনি","রবি","সোম","মঙ্গল","বুধ","বৃহ","শুক্র"],en:["Sa","Su","Mo","Tu","We","Th","Fr"]};
var mo=0;
function A(){return App;}
function loc(){return App.lang()==="bn"?"bn-BD":"en-GB";}
function avatar(p){
var a=App.el("div","av");
if(p.photo){var i=document.createElement("img");i.src=p.photo;i.alt="";a.appendChild(i);}
else a.textContent=p.name.charAt(0);
return a;
}
function gname(id){
var g=Store.load().groups;
for(var i=0;i<g.length;i++)if(g[i].id===id)return Store.gn(g[i],App.lang());
return "";
}
function shf(id){
var s=Store.shift(id,App.dayKey(new Date()));
return s?" ("+App.tr(s==="day"?"shDay":"shNight")+")":"";
}
function go(h){location.hash=h;}
function rp(h){location.replace("#"+h);}
function list(){
var v=App.view,d=Store.load();
var tb=App.el("div","tbar"),add=App.el("button","wide",App.tr("add")),sh=App.el("button","wide");
add.onclick=function(){App.unlock(function(){go("people/new");});};
var shi=App.el("span","ic");
shi.innerHTML='<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>';
sh.className="wide shb";
sh.appendChild(shi);
sh.appendChild(App.el("span","",App.tr("sheet")));
sh.onclick=function(){Bill.openSheet();};
tb.appendChild(add);tb.appendChild(sh);
v.appendChild(tb);
Store.groups().forEach(function(g){
var ps=d.people.filter(function(p){return p.group===g.id;}).sort(Store.idcmp);
if(!ps.length)return;
v.appendChild(App.el("div","gh",Store.gn(g,App.lang())+shf(g.id)+" · "+App.num(ps.length)));
var gr=App.el("div","pgrid");
ps.forEach(function(p){
var b=App.el("button","pcard");
b.appendChild(avatar(p));
b.appendChild(App.el("div","pn",p.name));
b.appendChild(App.el("div","amt",Bill.signed(p)));
b.onclick=function(){mo=0;go("people/"+p.id);};
gr.appendChild(b);
});
v.appendChild(gr);
});
}
function bigPhoto(src){
var ov=App.el("div","ov"),i=document.createElement("img");
i.src=src;i.alt="";i.className="pz";
ov.onclick=function(){if(ov.parentNode)ov.parentNode.removeChild(ov);};
ov.appendChild(i);
document.body.appendChild(ov);
}
function shareBox(u){
App.dlg({title:App.tr("share"),input:{value:u,ro:1},btns:[{label:App.tr("ok"),primary:1}]});
}
function popup(p,key,again){
App.unlock(function(){
App.dlg({title:new Date(key+"T00:00:00").toLocaleDateString(loc(),{weekday:"long",day:"numeric",month:"long"}),lines:[App.tr("tickHint")],ticks:["noon","night"].map(function(meal){
return{label:App.tr(meal),checked:!Store.isOff(key,p.id,meal),on:function(c){
if(Store.isOff(key,p.id,meal)===c)Store.toggleOff(key,p.id,meal);
again();
}};
}),btns:[{label:App.tr("ok"),primary:1}]});
});
}
function detail(id){
var v=App.view,p=Store.person(id);
if(!p){
if(!Sync.ready){v.appendChild(App.el("div","mute",App.tr("loading")));return;}
rp("people");
return;
}
var top=App.el("div","row");
var bk=App.el("button","","←");bk.setAttribute("aria-label",App.tr("back"));bk.onclick=function(){App.back("people");};
var sh=App.el("button","sbtn");
sh.innerHTML='<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
sh.setAttribute("aria-label",App.tr("share"));
sh.onclick=function(){
var u=location.href.split("#")[0]+"#people/"+p.id;
function cp(){
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(function(){App.msg(App.tr("copied"));},function(){shareBox(u);});
else shareBox(u);
}
if(navigator.share)navigator.share({title:document.title,text:p.name+" — "+document.title,url:u}).catch(function(e){if(!e||e.name!=="AbortError")cp();});
else cp();
};
top.appendChild(bk);
top.appendChild(sh);
v.appendChild(top);
var c=App.el("div","card prof");
var pd=App.el("div","pid");
pd.appendChild(App.el("span","",App.tr("idL")));
pd.appendChild(App.el("b","",/^\d{4}$/.test(p.id)?(App.lang()==="bn"?p.id.replace(/\d/g,function(x){return"০১২৩৪৫৬৭৮৯".charAt(+x);}):p.id):"—"));
c.appendChild(pd);
var av=avatar(p);
if(p.photo){av.style.cursor="pointer";av.onclick=function(){bigPhoto(p.photo);};}
c.appendChild(av);
var t=App.el("div","");
var nm=App.el("div","big",p.name);
App.hold(nm,function(){App.unlock(function(){go("people/edit/"+id);});});
t.appendChild(nm);
t.appendChild(App.el("div","mute",gname(p.group)+shf(p.group)));
if(p.phone){var a=App.el("a","tel");var ti=App.el("span","ti");ti.innerHTML='<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';a.appendChild(ti);a.appendChild(document.createTextNode(p.phone));a.href="tel:"+p.phone;t.appendChild(a);}
if(p.join||p.leave){
var jd=App.el("div","mute"),jt=[];
if(p.join){jd.appendChild(App.el("span","jg","●"));jd.appendChild(document.createTextNode(" "+new Date(p.join+"T00:00:00").toLocaleDateString(loc(),{day:"numeric",month:"short",year:"numeric"})));jt.push(App.tr("joined"));}
if(p.leave){var same=p.join&&p.join.slice(0,4)===p.leave.slice(0,4),lo={day:"numeric",month:"short"};if(!same)lo.year="numeric";if(p.join)jd.appendChild(document.createTextNode(" · "));jd.appendChild(App.el("span","","○"));jd.appendChild(document.createTextNode(" "+new Date(p.leave+"T00:00:00").toLocaleDateString(loc(),lo)));jt.push(App.tr("ended"));}
jd.title=jt.join(" · ");
t.appendChild(jd);
}
c.appendChild(t);
v.appendChild(c);
var n=new Date(),cp=Store.cur(),f=new Date(cp.y,cp.m+mo,1),y=f.getFullYear(),m=f.getMonth(),sp=Store.span(y,m);
var lead=(sp.s.getDay()+1)%7,today=App.dayKey(n);
function again(){
if(location.hash.slice(1)!=="people/"+id)return;
var sy=window.scrollY;
App.view.textContent="";
detail(id);
window.scrollTo(0,sy);
}
v.appendChild(Bill.account(p,y,m,again,mo===0));
var cal=App.el("div","cal");
WK[App.lang()].forEach(function(w){cal.appendChild(App.el("div","wk",w));});
for(var i=0;i<lead;i++)cal.appendChild(App.el("div",""));
for(var dt=new Date(sp.s);dt<=sp.e;dt.setDate(dt.getDate()+1)){
var key=App.dayKey(dt),act=Store.active(p,key);
var cell=App.el("div","cell"+(key===today?" td":""));
cell.appendChild(App.el("div","dn",App.num(dt.getDate())));
var ms=App.el("div","ms");
["noon","night"].forEach(function(meal){
var st="na";
if(act)st=Store.isOff(key,p.id,meal)?"off":Store.passed(key,meal)?"on":"pend";
ms.appendChild(App.el("span","m "+st));
});
cell.appendChild(ms);
if(act)(function(k){App.hold(cell,function(){popup(p,k,again);});})(key);
cal.appendChild(cell);
}
var box=App.el("div","card"),nav=App.el("div","row");
var pv=App.el("button","","‹");pv.onclick=function(){mo--;App.view.textContent="";detail(id);};
var nx=App.el("button","","›");nx.onclick=function(){mo++;App.view.textContent="";detail(id);};
nav.appendChild(pv);
var mid=App.el("div","dnav");
mid.appendChild(App.el("div","dd mt",f.toLocaleDateString(loc(),{month:"long",year:"numeric"})));
mid.appendChild(App.el("div","mute",sp.s.toLocaleDateString(loc(),{day:"numeric",month:"long"})+" – "+sp.e.toLocaleDateString(loc(),{day:"numeric",month:"long"})));
nav.appendChild(mid);
nav.appendChild(nx);
box.appendChild(nav);
box.appendChild(cal);
v.appendChild(box);
}
function field(label,input){
var w=App.el("label","fld");
w.appendChild(App.el("span","mute",label));
w.appendChild(input);
return w;
}
function inp(type,val){var i=document.createElement("input");i.type=type;i.value=val||"";return i;}
function sel(opts,val){
var s=document.createElement("select");
opts.forEach(function(o){var e=document.createElement("option");e.value=o[0];e.textContent=o[1];s.appendChild(e);});
s.value=val||opts[0][0];
return s;
}
function shrink(file,cb){
var r=new FileReader();
r.onload=function(){
var im=new Image();
im.onload=function(){
var s=Math.min(im.width,im.height),c=document.createElement("canvas"),x=c.getContext("2d"),Z=[320,280,240,200,160,128],Q=[0.8,0.7,0.6,0.5],o="",u="",i,j;
for(i=0;i<Z.length&&!o;i++){
c.width=c.height=Z[i];
x.imageSmoothingQuality="high";
x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,Z[i],Z[i]);
for(j=0;j<Q.length;j++){
u=c.toDataURL("image/jpeg",Q[j]);
if(u.length<=30000){o=u;break;}
}
}
cb(o||u);
};
im.src=r.result;
};
r.readAsDataURL(file);
}
function form(id){
var v=App.view,d=Store.load(),old=id?Store.person(id):null;
var p=old||{id:Store.newId(),name:"",group:d.groups[0].id,join:App.dayKey(new Date())},nid;
var name=inp("text",p.name),phone=inp("tel",p.phone);phone.inputMode="tel";
var idf=inp("text",App.lang()==="bn"?p.id.replace(/\d/g,function(x){return"০১২৩৪৫৬৭৮৯".charAt(+x);}):p.id);idf.readOnly=true;idf.tabIndex=-1;idf.className="idro";
var grp=sel(d.groups.map(function(g){return[g.id,Store.gn(g,App.lang())];}),p.group);
var jn=inp("date",p.join),lv=inp("date",p.leave);
var ph=inp("file");ph.accept="image/*";
function pair(a,b,cls){
var r=App.el("div","frow"+(cls?" "+cls:""));
r.appendChild(field(a[0],a[1]));
r.appendChild(field(b[0],b[1]));
v.appendChild(r);
}
pair([App.tr("name"),name],[App.tr("idL"),idf],"idr");
pair([App.tr("phone"),phone],[App.tr("place"),grp]);
pair([App.tr("join"),jn],[App.tr("leave"),lv]);
var pl=App.el("label","fpick"),pi=App.el("span","ic"),pt=App.el("span","",App.tr("pick"));
pi.innerHTML='<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.7"/><path d="M21 16l-5-5-9 9"/></svg>';
pl.appendChild(pi);pl.appendChild(pt);pl.appendChild(ph);
ph.onchange=function(){pt.textContent=ph.files&&ph.files[0]?ph.files[0].name:App.tr("pick");};
v.appendChild(pl);
var row=App.el("div","row fbtn");
var cn=App.el("button","",App.tr("cancel"));
cn.onclick=function(){App.back(old?"people/"+id:"people");};
var sb=App.el("button","",App.tr("save"));
function done(photo){
var q={id:nid,name:name.value.trim(),phone:phone.value.trim(),group:grp.value,join:jn.value,leave:lv.value};
if(photo)q.photo=photo;
Store.savePerson(q);
App.back("people/"+q.id);
}
sb.onclick=function(){
if(!name.value.trim()){App.msg(App.tr("nameReq"));return;}
nid=old?old.id:Store.person(p.id)?Store.newId():p.id;
if(ph.files&&ph.files[0])shrink(ph.files[0],done);else done(p.photo);
};
row.appendChild(cn);row.appendChild(sb);
v.appendChild(row);
if(old){
var dl=App.el("button","wide dl",App.tr("del"));
dl.onclick=function(){
var b=Bill.balance(old),a="৳"+App.num(Math.round(Math.abs(b)));
var bl=b>0.5?App.tr("delDue").replace("{a}",a):b<-0.5?App.tr("delAdv").replace("{a}",a):App.tr("delClear");
App.ask(App.tr("delQ").replace("{n}",function(){return old.name;}),function(){Store.delPerson(old.id);rp("people");},[bl,App.tr("delWarn")],App.tr("delYes"));
};
v.appendChild(dl);
}
}
function render(parts){
var a=parts[1];
if(a==="sheet")Bill.sheet();
else if(a==="new")form(null);
else if(a==="edit"&&parts[2])form(parts[2]);
else if(a)detail(a);
else list();
}
return{T:T,render:render};
})();
