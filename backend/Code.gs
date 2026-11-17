var SHEETS={Settings:["key","value"],Groups:["id","bn","en"],People:["id","name","phone","group","join","leave","noonServe","nightServe","photo"],Off:["date","pid","meal"],Pay:["id","pid","date","amt"]};
function out(o){
return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function sheet(n){
var ss=SpreadsheetApp.getActiveSpreadsheet();
var s=ss.getSheetByName(n);
if(!s){
s=ss.insertSheet(n);
s.appendRow(SHEETS[n]);
s.setFrozenRows(1);
}
return s;
}
function read(n){
var s=sheet(n);
var last=s.getLastRow();
if(last<2)return[];
return s.getRange(2,1,last-1,SHEETS[n].length).getValues();
}
function write(n,rows){
var s=sheet(n);
var w=SHEETS[n].length;
var last=s.getLastRow();
if(last>1)s.getRange(2,1,last-1,w).clearContent();
if(!rows.length)return;
var need=rows.length+1;
if(s.getMaxRows()<need)s.insertRowsAfter(s.getMaxRows(),need-s.getMaxRows());
var r=s.getRange(2,1,rows.length,w);
r.setNumberFormat("@");
r.setValues(rows);
}
function settingsMap(){
var m={};
read("Settings").forEach(function(r){m[r[0]]=r[1];});
return m;
}
function getData(){
var st=settingsMap();
var groups=read("Groups").map(function(r){
return{id:String(r[0]),bn:String(r[1]),en:String(r[2])};
});
if(!groups.length)return null;
var people=read("People").map(function(r){
var p={id:String(r[0]),name:String(r[1]),phone:String(r[2]),group:String(r[3]),join:String(r[4]),leave:String(r[5])};
if(r[6]||r[7]){
p.serve={};
if(r[6])p.serve.noon=String(r[6]);
if(r[7])p.serve.night=String(r[7]);
}
if(r[8])p.photo=String(r[8]);
return p;
});
var off={};
read("Off").forEach(function(r){
var d=String(r[0]);
var p=String(r[1]);
if(!off[d])off[d]={};
if(!off[d][p])off[d][p]=[];
off[d][p].push(String(r[2]));
});
var pay=read("Pay").map(function(r){
return{id:String(r[0]),pid:String(r[1]),date:String(r[2]),amt:parseFloat(r[3])};
});
return{settings:{mealRate:parseFloat(st.mealRate)||60,cutDay:parseInt(st.cutDay,10)||10},groups:groups,people:people,off:off,pay:pay};
}
function doGet(e){
var rev=Number(settingsMap().rev||0);
var d=getData();
if(!d)return out({ok:true,empty:true,rev:rev});
return out({ok:true,rev:rev,data:d});
}
function doPost(e){
var lock=LockService.getScriptLock();
lock.waitLock(20000);
try{
var q=JSON.parse(e.postData.contents);
var st=settingsMap();
var stored=String(st.pin||"");
var rev=Number(st.rev||0);
if(stored&&String(q.pin||"")!==stored)return out({ok:false,error:"pin"});
if(Number(q.baseRev||0)!==rev)return out({ok:false,error:"conflict",rev:rev,data:getData()});
var d=q.data;
if(!d||!d.settings||!Array.isArray(d.groups)||!Array.isArray(d.people)||!Array.isArray(d.pay)||typeof d.off!=="object")return out({ok:false,error:"bad"});
var pin=String(q.newPin||"")||stored||String(q.pin||"")||"1234";
var newRev=Date.now();
var off=[];
Object.keys(d.off).forEach(function(date){
Object.keys(d.off[date]).forEach(function(pid){
d.off[date][pid].forEach(function(meal){off.push([date,pid,meal]);});
});
});
write("Settings",[["mealRate",d.settings.mealRate],["cutDay",parseInt(d.settings.cutDay,10)||10],["pin",pin],["rev",newRev]]);
write("Groups",d.groups.map(function(g){return[g.id,g.bn,g.en];}));
write("People",d.people.map(function(p){
var s=p.serve||{};
return[p.id,p.name,p.phone||"",p.group,p.join||"",p.leave||"",s.noon||"",s.night||"",p.photo||""];
}));
write("Off",off);
write("Pay",d.pay.map(function(x){return[x.id,x.pid,x.date,x.amt];}));
return out({ok:true,rev:newRev});
}catch(err){
return out({ok:false,error:"server"});
}finally{
lock.releaseLock();
}
}
