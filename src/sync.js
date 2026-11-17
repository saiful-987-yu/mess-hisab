var Sync=(function(){
var url=CONFIG.API_URL,t=0,busy=false,again=false,last=0;
var T={
bn:{wrongPin:"ভুল পিন, আপনার পরিবর্তন সেভ হয়নি",conflict:"অন্য ফোনে নতুন তথ্য ছিল, পরিবর্তনটা আবার করুন",seedAsk:"সার্ভার খালি। 'হ্যাঁ' দিলে এই ফোনের ডাটা সার্ভারে উঠবে, 'না' দিলে খালি শুরু হবে।"},
en:{wrongPin:"Wrong PIN, your change was not saved",conflict:"Newer data came from another phone, please redo the change",seedAsk:"Server is empty. Yes uploads this phone's data, No starts empty."}
};
function get(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function set(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function rev(){return +(get("mess_rev")||0);}
function refresh(){if(!/\/(new|edit)/.test(location.hash))App.render();}
function take(data){
data.settings.pin=Store.load().settings.pin;
Store.replace(data);
Store.fixIds();
}
function curPin(){return api.pin||(get("mess_pinok")?Store.load().settings.pin:"");}
function flush(){
if(busy){again=true;return;}
busy=true;
var d=Store.load();
fetch(url,{method:"POST",body:JSON.stringify({action:"save",pin:curPin(),newPin:api.newPin,baseRev:rev(),data:{settings:{mealRate:d.settings.mealRate,cutDay:Store.cut()},groups:d.groups,people:d.people,off:d.off,pay:d.pay}})}).then(function(r){return r.json();}).then(function(r){
busy=false;
if(r.ok){
set("mess_rev",String(r.rev));
var p=api.newPin||curPin();
if(p){d.settings.pin=p;api.pin=p;Store.persist();}
api.newPin="";
set("mess_pinok","1");
if(again){again=false;flush();}else set("mess_dirty","");
}else if(r.error==="pin"){
set("mess_pinok","");set("mess_dirty","");api.newPin="";api.pin="";again=false;
App.relock();
App.msg(App.tr("wrongPin"));
load(true);
}else if(r.error==="conflict"){
set("mess_dirty","");api.newPin="";again=false;
if(r.data){set("mess_rev",String(r.rev));take(r.data);refresh();App.msg(App.tr("conflict"));}
else{set("mess_rev","0");flush();}
}
}).catch(function(){busy=false;again=false;});
}
function load(force){
if(!url)return;
if(!force&&get("mess_dirty")){api.ready=true;flush();return;}
fetch(url+"?action=load").then(function(r){return r.json();}).then(function(r){
last=Date.now();
var first=!api.ready;
api.ready=true;
if(!r.ok){if(first)refresh();return;}
var changed=force||r.rev!==rev();
set("mess_rev",String(r.rev||0));
if(r.empty){
function fin(){
set("mess_dirty","1");
flush();
refresh();
}
if(!Store.load().people.length){Store.replace(Store.blank());fin();}
else App.ask(App.tr("seedAsk"),fin,null,null,function(){Store.replace(Store.blank());fin();},true);
return;
}
if(changed){take(r.data);refresh();}else if(first)refresh();
}).catch(function(){if(!api.ready){api.ready=true;refresh();}});
}
var api={on:!!url,ready:!url,pin:"",newPin:"",T:T,load:load,pinOk:function(){return !!get("mess_pinok");}};
if(url){
Store.onSave=function(){
set("mess_dirty","1");
clearTimeout(t);
t=setTimeout(flush,1200);
};
document.addEventListener("visibilitychange",function(){if(!document.hidden&&Date.now()-last>30000)load();});
window.addEventListener("online",function(){load();});
}
return api;
})();
