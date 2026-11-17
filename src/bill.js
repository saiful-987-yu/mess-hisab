var Bill=(function(){
var T={
bn:{due:"বাকি",adv:"অ্যাডভান্স",clear:"ঠিক আছে",eatenN:"খাওয়া",offN:"বন্ধ",prevDue:"আগের বাকি",prevAdv:"আগের অ্যাডভান্স",charge:"এই মাসের হিসাব",paidM:"এই মাসে জমা",addPay:"+ জমা",askAmt:"কত টাকা জমা?",delAsk:"এই জমা মুছবেন?",sumCharge:"মোট হিসাব",sumPaid:"মোট জমা",sumDue:"মোট বাকি",
mealRate:"প্রতি বেলার টাকা",newPin:"নতুন পিন",pinHint:"পিন না বদলাতে চাইলে খালি রাখুন",save:"সেভ",saved:"সেভ হয়েছে",bad:"সংখ্যা ঠিক দিন",pinShort:"পিন কমপক্ষে ৪ অক্ষর",
ateN:"খেয়েছে",skipN:"খায়নি",mealsW:"বেলা",cutDay:"মাসের শেষ তারিখ",cutHint:"মাস শুরু {s} তারিখে, শেষ পরের মাসের {e} তারিখে",cutBad:"তারিখ ১ থেকে ২৭ এর মধ্যে দিন",cutAsk:"মাসের শেষ তারিখ বদলালে সব মাসের হিসাব ও ক্যালেন্ডার বদলে যাবে। নিশ্চিত?",
waiveDue:"{a} বাকি কাটা হবে, নতুন মাসে যাবে না। নিশ্চিত?",waiveAdv:"{a} অ্যাডভান্স কাটা হবে, নতুন মাসে যাবে না। নিশ্চিত?",unwaive:"{a} কাটা তুলে দেবেন?",cutDue:"বাকি কাটা",cutAdv:"অ্যাডভান্স কাটা",
rule:"মাসের হিসাব = খাওয়া বেলা × প্রতি বেলার টাকা।",
isDep:"অ্যাডভান্স জমা (হিসাবে ধরা হবে না)",depChip:"অ্যাডভান্স",depNote:"অ্যাডভান্স জমা আছে {a} (হিসাবে ধরা নেই)",depCut:"অ্যাডভান্স থেকে কাটা",delDep:"এই অ্যাডভান্স জমা মুছবেন?",cancel:"বাতিল",
sheet:"হাজিরা খাতা",shPrint:"প্রিন্ট / PDF",shCol1:"আইডি",shCol2:"নাম",shCol3:"এই মাসে জমা",shPage:"পৃষ্ঠা",shTot:"মোট মিল"},
en:{due:"Due",adv:"Advance",clear:"Settled",eatenN:"Ate",offN:"Off",prevDue:"Previous due",prevAdv:"Previous advance",charge:"This month's bill",paidM:"Paid this month",addPay:"+ Payment",askAmt:"Amount paid?",delAsk:"Delete this payment?",sumCharge:"Total bill",sumPaid:"Total paid",sumDue:"Total due",
mealRate:"Per meal amount",newPin:"New PIN",pinHint:"Leave PIN empty to keep it",save:"Save",saved:"Saved",bad:"Enter valid numbers",pinShort:"PIN must be at least 4 characters",
ateN:"Ate",skipN:"Skipped",mealsW:"meals",cutDay:"Month end day",cutHint:"Month starts on day {s}, ends on day {e} of the next month",cutBad:"Enter a day from 1 to 27",cutAsk:"Changing the month end day changes every month's bill and calendar. Sure?",
waiveDue:"{a} due will be cut and will not carry to the new month. Sure?",waiveAdv:"{a} advance will be cut and will not carry to the new month. Sure?",unwaive:"Remove the cut of {a}?",cutDue:"Due cut",cutAdv:"Advance cut",
rule:"Monthly bill = meals eaten × per meal amount.",
isDep:"Advance deposit (not counted in bill)",depChip:"Advance",depNote:"Advance deposit held {a} (not counted)",depCut:"Deducted from advance",delDep:"Delete this advance deposit?",cancel:"Cancel",
sheet:"Attendance sheet",shPrint:"Print / PDF",shCol1:"ID",shCol2:"Name",shCol3:"Paid this month",shPage:"Page",shTot:"Total meals"}
};
var LIM_DUE=200,LIM_ADV=50;
function isW(x){return String(x.id).charAt(0)==="w";}
function isD(x){return String(x.id).charAt(0)==="d";}
function loc(){return App.lang()==="bn"?"bn-BD":"en-GB";}
function money(x){return "৳"+App.num(Math.round(x));}
function stat(p,y,m){
var S=Store.load().settings,sp=Store.span(y,m),act=0,eaten=0,missed=0,done=0,d,k;
for(d=new Date(sp.s);d<=sp.e;d.setDate(d.getDate()+1)){
k=App.dayKey(d);
if(!Store.active(p,k))continue;
act++;
["noon","night"].forEach(function(ml){if(Store.isOff(k,p.id,ml)){if(Store.passed(k,ml))missed++;}else{eaten++;if(Store.passed(k,ml))done++;}});
}
var cm=Store.cur(),c;
c=(y*12+m>=cm.y*12+cm.m?done:eaten)*S.mealRate;
return{charge:Math.max(0,c),eaten:eaten,missed:missed,done:done,act:act};
}
function ym(s){var q=s.split("-"),i=+q[0]*12+(+q[1]-1);return +q[2]>Store.cut()?i:i-1;}
function cum(p,y,m){
var d=Store.load(),sel=y*12+m,st=sel,ch=0,paid=0,pm=0,pw=0,dep=0,dm=0,cur=stat(p,y,m),i;
if(p.join)st=ym(p.join);
else d.pay.forEach(function(x){if(x.pid===p.id&&ym(x.date)<st)st=ym(x.date);});
for(i=st;i<=sel;i++)ch+=i===sel?cur.charge:stat(p,Math.floor(i/12),i%12).charge;
d.pay.forEach(function(x){
if(x.pid!==p.id||ym(x.date)>sel)return;
if(isD(x)){dep+=x.amt;if(ym(x.date)===sel)dm+=x.amt;return;}
paid+=x.amt;
if(ym(x.date)===sel){pm+=x.amt;if(isW(x))pw+=x.amt;}
});
var lv=p.leave?ym(p.leave):0,net=p.leave&&sel>=lv?dep:0,np=p.leave&&sel-1>=lv?dep-dm:0;
return{cur:cur,ch:ch,paid:paid,pm:pm,pw:pw,dep:dep,dm:dm,net:net-np,held:net?0:dep,bal:ch-paid-net,prev:ch-cur.charge-(paid-pm)-np};
}
function line(label,val){
var r=App.el("div","sc");
r.appendChild(App.el("span","mute",label));
r.appendChild(App.el("b","",val));
return r;
}
function payBox(done){
App.dlg({input:{type:"number",mode:"numeric",ph:App.tr("askAmt")},ticks:[{label:App.tr("isDep")}],btns:[{label:App.tr("cancel")},{label:App.tr("save"),primary:1,fn:function(a){
var v=parseFloat(a.input.value);
if(!(v>0)){a.input.focus();return false;}
done(v,a.ticks[0].checked);
}}]});
}
function card(p,r,y,m,again,cur){
var c=App.el("div","card"),h=App.el("div","row"),due=r.bal>0.5,adv=r.bal<-0.5;
h.appendChild(App.el("b","",new Date(y,m,1).toLocaleDateString(loc(),{month:"long",year:"numeric"})));
var cc=Store.cur(),can=y*12+m<cc.y*12+cc.m&&((due&&r.bal<=LIM_DUE)||(adv&&-r.bal<=LIM_ADV));
var bd=App.el(can?"button":"span","badge"+(due?" due":""),due?App.tr("due")+" "+money(r.bal):adv?App.tr("adv")+" "+money(-r.bal):App.tr("clear"));
if(can){
bd.type="button";
App.hold(bd,function(){
App.unlock(function(){
App.ask(App.tr(due?"waiveDue":"waiveAdv").replace("{a}",money(Math.abs(r.bal))),function(){Store.addWaive(p.id,App.dayKey(Store.span(y,m).e),r.bal);again();});
});
});
}
h.appendChild(bd);
c.appendChild(h);
var hl=App.cnt("hl",r.cur.done,r.cur.missed,App.tr("ateN")+" "+App.num(r.cur.done)+" "+App.tr("mealsW")+" · "+App.tr("skipN")+" "+App.num(r.cur.missed)+" "+App.tr("mealsW"));
c.appendChild(hl);
var sm=App.el("div","sums");
if(Math.abs(r.prev)>=0.5)sm.appendChild(line(App.tr(r.prev>0?"prevDue":"prevAdv"),money(Math.abs(r.prev))));
sm.appendChild(line(App.tr("charge"),money(r.cur.charge)));
var pc=line(App.tr("paidM"),money(r.pm-r.pw));
App.hold(pc,function(){
App.unlock(function(){
payBox(function(a,dp){
Store.addPay(p.id,cur?App.dayKey(new Date()):App.dayKey(Store.span(y,m).e),a,dp);
again();
});
});
});
sm.appendChild(pc);
if(r.net>0.5)sm.appendChild(line(App.tr("depCut"),money(r.net)));
c.appendChild(sm);
if(r.held>0.5){
var dn=App.el("div","mute dn2"),dq=App.tr("depNote").split("{a}");
dn.appendChild(document.createTextNode(dq[0]));
dn.appendChild(App.el("b","dnum",money(r.held)));
dn.appendChild(document.createTextNode(dq[1]||""));
c.appendChild(dn);
}
var chips=App.el("div","chips"),key=y*12+m;
Store.load().pay.forEach(function(x){
if(x.pid!==p.id||ym(x.date)!==key)return;
var w=isW(x),dp=isD(x);
var b=App.el("button","chip"+(w?" off":dp?" dep":""),w?App.tr(x.amt>0?"cutDue":"cutAdv")+" "+money(Math.abs(x.amt)):(dp?App.tr("depChip")+" · ":"")+new Date(x.date+"T00:00:00").toLocaleDateString(loc(),{day:"numeric",month:"short"})+" · "+money(x.amt));
App.hold(b,function(){
App.unlock(function(){
App.ask(w?App.tr("unwaive").replace("{a}",money(Math.abs(x.amt))):App.tr(dp?"delDep":"delAsk")+" "+money(x.amt),function(){Store.delPay(x.id);again();});
});
});
chips.appendChild(b);
});
if(chips.firstChild)c.appendChild(chips);
return c;
}
function counts(p,y,m){
var s=stat(p,y,m);
return{done:s.done,missed:s.missed};
}
function account(p,y,m,again,cur){
return card(p,cum(p,y,m),y,m,again,cur);
}
var sm=0,PW=1123,PH=794,RP=18;
function bnum(n){return App.lang()==="bn"?String(n).replace(/\d/g,function(x){return"০১২৩৪৫৬৭৮৯".charAt(+x);}):String(n);}
function fit(){
[].forEach.call(document.querySelectorAll(".shw"),function(w){
var k=w.clientWidth/PW;
w.style.height=Math.round(PH*k)+"px";
w.firstChild.style.transform="scale("+k+")";
});
}
function cellOf(p,k){
if(!Store.active(p,k)||!Store.passed(k,"noon"))return"";
var n=0;
["noon","night"].forEach(function(ml){if(Store.passed(k,ml)&&!Store.isOff(k,p.id,ml))n++;});
return n;
}
function sheetRows(y,m){
var d=Store.load(),sp=Store.span(y,m),days=[],k,t=new Date(sp.s),key=y*12+m,gr={};
Store.groups().forEach(function(g,i){gr[g.id]=i;});
for(;t<=sp.e;t.setDate(t.getDate()+1))days.push({k:App.dayKey(t),n:t.getDate()});
var rows=d.people.filter(function(p){return days.some(function(x){return Store.active(p,x.k);});}).sort(function(a,b){return(gr[a.group]===undefined?99:gr[a.group])-(gr[b.group]===undefined?99:gr[b.group])||Store.idcmp(a,b);}).map(function(p){
var paid=0;
d.pay.forEach(function(x){if(x.pid===p.id&&!isW(x)&&!isD(x)&&ym(x.date)===key)paid+=x.amt;});
var nums=days.map(function(x){return cellOf(p,x.k);}),tot=0;
nums.forEach(function(n){tot+=n||0;});
return{p:p,paid:paid,tot:tot,c:nums.map(function(n){return n===""?"":n?bnum(n):"✕";})};
});
return{days:days,rows:rows};
}
function sheetPage(info,part,no,total,title){
var w=App.el("div","shw"),pg=App.el("div","sheet");
var hd=App.el("div","sh-t");
hd.appendChild(App.el("b","",App.tr("app")+" — "+App.tr("sheet")));
hd.appendChild(App.el("span","",title));
hd.appendChild(App.el("span","",total>1?App.tr("shPage")+" "+bnum(no)+"/"+bnum(total):""));
pg.appendChild(hd);
var tb=document.createElement("table"),tr=document.createElement("tr"),th;
tb.className="st";
var cg=document.createElement("colgroup");
[54,178,98].forEach(function(x){var c=document.createElement("col");c.style.width=x+"px";cg.appendChild(c);});
info.days.forEach(function(){cg.appendChild(document.createElement("col"));});
var tc=document.createElement("col");tc.style.width="58px";cg.appendChild(tc);
tb.appendChild(cg);
[App.tr("shCol1"),App.tr("shCol2"),App.tr("shCol3")].forEach(function(x){th=document.createElement("th");th.textContent=x;tr.appendChild(th);});
info.days.forEach(function(x){th=document.createElement("th");th.textContent=bnum(x.n);tr.appendChild(th);});
th=document.createElement("th");th.className="tt";th.textContent=App.tr("shTot");tr.appendChild(th);
tb.appendChild(tr);
for(var i=0;i<RP;i++){
var r=part[i],row=document.createElement("tr"),td;
var v=r?[bnum(r.p.id),r.p.name,r.paid?bnum(Math.round(r.paid)):""].concat(r.c,[bnum(r.tot)]):[];
for(var j=0;j<4+info.days.length;j++){
td=document.createElement("td");
if(r&&j>2&&j<3+info.days.length&&v[j]===bnum(1)){var o=document.createElement("span");o.className="one";o.textContent=v[j];td.appendChild(o);}
else td.textContent=r?v[j]:"";
if(j===1)td.className="nm";
if(j===3+info.days.length)td.className="tt";
row.appendChild(td);
}
tb.appendChild(row);
}
pg.appendChild(tb);
w.appendChild(pg);
return w;
}
function sheet(){
var v=App.view,cm=Store.cur(),f=new Date(cm.y,cm.m+sm,1),y=f.getFullYear(),m=f.getMonth(),sp=Store.span(y,m);
v.className="wd";
var top=App.el("div","row shbar");
var bk=App.el("button","","←");bk.setAttribute("aria-label",App.tr("back"));bk.onclick=function(){App.back("people");};
var pv=App.el("button","","‹");pv.onclick=function(){sm--;App.render();};
var nx=App.el("button","","›");nx.onclick=function(){sm++;App.render();};
var mid=App.el("div","dnav");
var o={day:"numeric",month:"short"};
var title=f.toLocaleDateString(loc(),{month:"long",year:"numeric"});
mid.appendChild(App.el("div","dd",title));
mid.appendChild(App.el("div","mute",sp.s.toLocaleDateString(loc(),o)+" – "+sp.e.toLocaleDateString(loc(),o)));
var pr=App.el("button","");pr.setAttribute("aria-label",App.tr("shPrint"));pr.title=App.tr("shPrint");
var pri=App.el("span","ic");
pri.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/></svg>';
pr.appendChild(pri);
pr.onclick=function(){printSheet(title);};
top.appendChild(bk);top.appendChild(pv);top.appendChild(mid);top.appendChild(nx);top.appendChild(pr);
top.style.marginBottom="12px";
v.appendChild(top);
var info=sheetRows(y,m),total=Math.max(1,Math.ceil(info.rows.length/RP)),i;
for(i=0;i<total;i++){
var w=sheetPage(info,info.rows.slice(i*RP,(i+1)*RP),i+1,total,title);
v.appendChild(w);
}
fit();
if(!sheet.on){sheet.on=1;window.addEventListener("resize",fit);}
}
function printSheet(title){
var st=document.createElement("style"),t=document.title,done=false;
st.textContent="@page{size:A4 landscape;margin:0}";
document.head.appendChild(st);
document.title=App.tr("sheet")+" - "+title;
function end(){
if(done)return;
done=true;
window.removeEventListener("afterprint",end);
if(st.parentNode)st.parentNode.removeChild(st);
document.title=t;
}
window.addEventListener("afterprint",end);
window.print();
setTimeout(end,60000);
}
function openSheet(){sm=0;location.hash="people/sheet";}
function field(label,input){
var w=App.el("label","fld");
w.appendChild(App.el("span","mute",label));
w.appendChild(input);
return w;
}
function inp(type,val,mode){
var i=document.createElement("input");
i.type=type;i.value=val;
if(mode)i.inputMode=mode;
return i;
}
function settings(){
var v=App.view,S=Store.load().settings;
var rate=inp("number",S.mealRate,"numeric"),pin=inp("text","","numeric");
var box=App.el("div","card"),sg=App.el("div","sg");
var cut=inp("number",Store.cut(),"numeric"),hint=App.el("div","mute");
sg.appendChild(field(App.tr("mealRate"),rate));
sg.appendChild(field(App.tr("cutDay"),cut));
sg.appendChild(field(App.tr("newPin"),pin));
box.appendChild(sg);
function hintText(){var c=parseInt(cut.value,10);hint.textContent=c>=1&&c<=27?App.tr("cutHint").replace("{s}",App.num(c+1)).replace("{e}",App.num(c)):"";}
cut.oninput=hintText;
hintText();
hint.className+=" sh";
box.appendChild(hint);
box.appendChild(App.el("div","mute sh",App.tr("pinHint")));
box.appendChild(App.el("div","mute sh",App.tr("rule")));
var sb=App.el("button","wide",App.tr("save"));
sb.style.marginTop="14px";
sb.style.marginBottom="0";
sb.onclick=function(){
App.unlock(function(){
var b=parseFloat(rate.value),p=pin.value.trim();
if(!(b>0)){App.msg(App.tr("bad"));return;}
if(p&&p.length<4){App.msg(App.tr("pinShort"));return;}
var cd=parseInt(cut.value,10);
if(!(cd>=1&&cd<=27)){App.msg(App.tr("cutBad"));return;}
function done(){
S.mealRate=b;S.cutDay=cd;
if(p){S.pin=p;Sync.newPin=p;}
Store.save();
pin.value="";
sb.textContent=App.tr("saved");
setTimeout(function(){sb.textContent=App.tr("save");},1500);
}
if(cd!==Store.cut())App.ask(App.tr("cutAsk"),done,null,null,function(){cut.value=Store.cut();hintText();});
else done();
});
};
box.appendChild(sb);
v.appendChild(box);
}
function signed(p){
var c=Store.cur(),b=cum(p,c.y,c.m).bal;
if(b>0.5)return"−"+money(b);
if(b<-0.5)return"+"+money(-b);
return money(0);
}
function balance(p){
var c=Store.cur();
return cum(p,c.y,c.m).bal;
}
return{T:T,sheet:sheet,openSheet:openSheet,account:account,counts:counts,settings:settings,signed:signed,balance:balance};
})();
