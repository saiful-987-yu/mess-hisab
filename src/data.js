var CONFIG={API_URL:"https://script.google.com/macros/s/AKfycbxEh2vK_TnuzwpZDnNUkUuyAwaQEeroPc_U5yrh3GzBZI218v9IG9k6PBUwg3xfmB36rA/exec"};
var Store={
key:"mess_data_v1",
data:null,
seed:function(){
return{
settings:{mealRate:60,cutDay:10,pin:"1234"},
off:{},
pay:[],
groups:[
{id:"unico-day",bn:"ইউনিকো শিফট ১",en:"Unico Shift 1"},
{id:"unico-night",bn:"ইউনিকো শিফট ২",en:"Unico Shift 2"},
{id:"zahir",bn:"জহির টাওয়ার",en:"Zahir Tower"},
{id:"other",bn:"অন্যান্য",en:"Others"}
],
people:[]
};
},
load:function(){
if(this.data)return this.data;
try{var s=localStorage.getItem(this.key);this.data=s?JSON.parse(s):null;}catch(e){}
if(!this.data){this.data=this.seed();this.persist();}
if(!this.data.off)this.data.off={};
if(!this.data.pay)this.data.pay=[];
if(!this.data.settings.pin)this.data.settings.pin="1234";
return this.data;
},
isOff:function(date,pid,meal){
var o=this.load().off[date];
return !!(o&&o[pid]&&o[pid].indexOf(meal)>-1);
},
toggleOff:function(date,pid,meal){
var d=this.load(),o=d.off[date]||(d.off[date]={}),a=o[pid]||(o[pid]=[]),i=a.indexOf(meal);
if(i<0)a.push(meal);else a.splice(i,1);
if(!a.length)delete o[pid];
if(!Object.keys(o).length)delete d.off[date];
this.save();
},
cut:function(){
return parseInt(this.load().settings.cutDay,10)||10;
},
cur:function(){
var n=new Date(),f=new Date(n.getFullYear(),n.getMonth()-(n.getDate()<=this.cut()?1:0),1);
return{y:f.getFullYear(),m:f.getMonth()};
},
span:function(y,m){
var c=this.cut();
return{s:new Date(y,m,c+1),e:new Date(y,m+1,c)};
},
passed:function(key,meal){
var n=new Date(),t=n.getFullYear()+"-"+("0"+(n.getMonth()+1)).slice(-2)+"-"+("0"+n.getDate()).slice(-2);
if(key<t)return true;
if(key>t)return false;
return n.getHours()>=(meal==="noon"?13:20);
},
active:function(p,key){
return(!p.join||key>=p.join)&&(!p.leave||key<=p.leave);
},
week:function(key){
var q=key.split("-"),d=new Date(+q[0],+q[1]-1,+q[2]),f=new Date(d.getFullYear(),d.getMonth(),d.getDate()+(12-d.getDay())%7);
var u=Date.UTC(f.getFullYear(),f.getMonth(),f.getDate()),t=new Date(u),i=Math.round((u-Date.UTC(2026,10,13))/604800000);
t.setUTCDate(t.getUTCDate()-1);
return{n:Math.ceil(((t-Date.UTC(t.getUTCFullYear(),0,1))/86400000+1)/7),dg:i%2===0?"unico-day":"unico-night"};
},
duty:function(p,key){
if(p.group!=="unico-day"&&p.group!=="unico-night")return null;
var w=this.week(key);
return{n:w.n,day:w.dg===p.group};
},
groups:function(){
var o=["unico-day","unico-night","zahir","other"];
return this.load().groups.map(function(g,i){return[g,i];}).sort(function(a,b){
var x=o.indexOf(a[0].id),y=o.indexOf(b[0].id);
return(x<0?9:x)-(y<0?9:y)||a[1]-b[1];
}).map(function(a){return a[0];});
},
idcmp:function(a,b){
return(parseInt(a.id,10)||0)-(parseInt(b.id,10)||0)||(a.id<b.id?-1:a.id>b.id?1:0);
},
gn:function(g,l){
var n={"unico-day":["ইউনিকো শিফট ১","Unico Shift 1"],"unico-night":["ইউনিকো শিফট ২","Unico Shift 2"]}[g.id];
return n?n[l==="en"?1:0]:g[l];
},
shift:function(gid,key){
if(gid!=="unico-day"&&gid!=="unico-night")return null;
if(new Date(key+"T00:00:00").getDay()===5)return"night";
return this.week(key).dg===gid?"day":"night";
},
person:function(id){
var a=this.load().people;
for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];
return null;
},
newId:function(){
var u={},m=1000,i;
this.load().people.forEach(function(p){
u[p.id]=1;
if(/^\d{4}$/.test(p.id)&&+p.id>m)m=+p.id;
});
if(m<9999)return String(m+1);
for(i=1001;i<=9999;i++)if(!u[i])return String(i);
return String(Date.now());
},
renameId:function(a,b){
var d=this.load();
d.people.forEach(function(p){if(p.id===a)p.id=b;});
Object.keys(d.off).forEach(function(k){
if(d.off[k][a]){d.off[k][b]=d.off[k][a];delete d.off[k][a];}
});
d.pay.forEach(function(x){if(x.pid===a)x.pid=b;});
},
fixIds:function(){
var self=this,ch=false;
this.load().people.slice().forEach(function(p){
if(/^\d{4}$/.test(p.id))return;
self.renameId(p.id,self.newId());
ch=true;
});
if(ch)this.save();
return ch;
},
savePerson:function(p){
var a=this.load().people,i;
for(i=0;i<a.length;i++)if(a[i].id===p.id){a[i]=p;this.save();return;}
a.push(p);this.save();
},
delPerson:function(id){
var d=this.load();
d.people=d.people.filter(function(p){return p.id!==id;});
Object.keys(d.off).forEach(function(k){
delete d.off[k][id];
if(!Object.keys(d.off[k]).length)delete d.off[k];
});
d.pay=d.pay.filter(function(x){return x.pid!==id;});
this.save();
},
addPay:function(pid,date,amt,dep){
this.load().pay.push({id:(dep?"d":"y")+Date.now(),pid:pid,date:date,amt:amt});
this.save();
},
addWaive:function(pid,date,amt){
this.load().pay.push({id:"w"+Date.now(),pid:pid,date:date,amt:amt});
this.save();
},
delPay:function(id){
var d=this.load();
d.pay=d.pay.filter(function(x){return x.id!==id;});
this.save();
},
persist:function(){
try{localStorage.setItem(this.key,JSON.stringify(this.data));}catch(e){}
},
save:function(){
this.persist();
if(this.onSave)this.onSave();
},
blank:function(){
var d=this.seed();
d.people=[];
return d;
},
replace:function(d){
this.data=d;
this.persist();
}
};
