const D={
barber:{n:"Sharp & Sons Barbers",t:"Pick a service, choose a time, and you're booked. No calls, no waiting on hold.",
 staff:["Anyone available","Marcus","Dev","Liam"],
 s:[["Classic haircut","30 min",28],["Skin fade","45 min",35],["Beard trim","20 min",18],["Cut + beard","60 min",50],["Hot towel shave","30 min",32],["Kids cut (under 12)","30 min",22]]},
salon:{n:"Maison Lune Hair Studio",t:"Choose your treatment and a time that suits you. We'll text you a reminder the day before.",
 staff:["Anyone available","Priya","Sofia","Jade"],
 s:[["Cut & blow-dry","60 min",70],["Full colour","2 hr",120],["Balayage","3 hr",210],["Root touch-up","90 min",85],["Deep conditioning","45 min",45],["Event styling","60 min",65]]},
nails:{n:"Petal & Polish Studio",t:"Book your next appointment in under a minute. Easy rescheduling by text.",
 staff:["Anyone available","Amara","Chloe","Mei"],
 s:[["Gel manicure","45 min",40],["Gel pedicure","60 min",50],["Acrylic full set","90 min",65],["Nail art add-on","30 min",20],["Brow shape & tint","30 min",30],["Lash lift","60 min",55]]}};
const TIMES=["09:00","09:30","10:00","10:30","11:00","11:30","12:00","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];
const $=id=>document.getElementById(id);
let type="barber",svc=null,day=null,time=null;
const money=n=>"$"+n;
const fmtD=d=>d.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"});
function seed(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return()=>{h=(h*1103515245+12345)&0x7fffffff;return h/0x7fffffff}}
function dayList(){const out=[],d=new Date();d.setHours(0,0,0,0);while(out.length<14){d.setDate(d.getDate()+1);if(d.getDay()!==0)out.push(new Date(d))}return out}
const DAYS=dayList();
function load(){
  const c=D[type];$("shop").textContent=c.n;$("tag").textContent=c.t;document.title="Book at "+c.n;
  svc=null;time=null;
  $("services").innerHTML=c.s.map((s,i)=>`<label class="opt"><input type="radio" name="svc" value="${i}"><span class="b"><span>${s[0]}<small>${s[1]}</small></span><span class="price">${money(s[2])}</span></span></label>`).join("");
  $("staff").innerHTML=c.staff.map(s=>`<option>${s}</option>`).join("");
  if(!day)day=0;drawDays();drawSlots();sum();
}
function drawDays(){
  $("days").innerHTML=DAYS.map((d,i)=>`<label class="day"><input type="radio" name="day" value="${i}" ${i===day?"checked":""}><span class="t"><small>${d.toLocaleDateString(undefined,{weekday:"short"})}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString(undefined,{month:"short"})}</small></span></label>`).join("");
}
function drawSlots(){
  const r=seed(type+DAYS[day].toDateString()+$("staff").value);
  $("slots").innerHTML=TIMES.map(t=>{const off=r()<.35;return `<label class="slot"><input type="radio" name="time" value="${t}" ${off?"disabled":""} ${t===time&&!off?"checked":""}><span class="t">${t}</span></label>`}).join("");
  if(time&&$("slots").querySelector(`input[value="${time}"]`)?.disabled)time=null;
}
function sum(){
  const c=D[type];
  $("sS").textContent=svc!==null?`${c.s[svc][0]} (${c.s[svc][1]})`:"Not chosen yet";
  $("sT").textContent=svc!==null?money(c.s[svc][2]):"$0";
  $("sP").textContent=$("staff").value;
  $("sW").textContent=time?`${fmtD(DAYS[day])} at ${time}`:"Not chosen yet";
}
document.addEventListener("change",e=>{
  const n=e.target.name;
  if(n==="svc")svc=+e.target.value;
  if(n==="day"){day=+e.target.value;drawSlots()}
  if(n==="time")time=e.target.value;
  if(e.target.id==="staff")drawSlots();
  sum();
});
document.querySelectorAll(".types button").forEach(b=>b.onclick=()=>{
  type=b.dataset.t;document.querySelectorAll(".types button").forEach(x=>x.setAttribute("aria-pressed",x===b));
  reset();
});
function reset(){$("done").hidden=true;$("formBody").hidden=false;$("f").reset();time=null;load()}
$("f").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("name").value.trim(),ph=$("phone").value.trim(),em=$("email").value.trim();
  let m="";
  if(svc===null)m="Choose a service.";
  else if(!time)m="Choose an available time.";
  else if(!name)m="Enter your name.";
  else if(ph.replace(/\D/g,"").length<7)m="Enter a mobile number so we can send a reminder.";
  else if(!/^\S+@\S+\.\S+$/.test(em))m="Enter a valid email address.";
  $("err").textContent=m;
  if(m)return;
  const c=D[type],s=c.s[svc];
  $("formBody").hidden=true;
  $("done").hidden=false;
  $("done").innerHTML=`<div class="ck" aria-hidden="true">✓</div><h2>You're booked, ${name.split(" ")[0]}</h2>
  <p>${s[0]} with ${$("staff").value==="Anyone available"?"the next available team member":$("staff").value} on ${fmtD(DAYS[day])} at ${time}.</p>
  <p>A confirmation would be sent to ${em} and a reminder to ${ph}.</p>
  <button class="ghost" type="button" id="again">Make another booking</button>`;
  $("again").onclick=reset;
  window.scrollTo({top:0,behavior:"smooth"});
});
const ds=$("days");
const step=d=>ds.scrollBy({left:d*ds.clientWidth*.8,behavior:"smooth"});
$("prev").onclick=()=>step(-1);$("next").onclick=()=>step(1);
function edge(){
  $("prev").disabled=ds.scrollLeft<4;
  $("next").disabled=ds.scrollLeft+ds.clientWidth>=ds.scrollWidth-4;
  const w=ds.firstElementChild?ds.firstElementChild.offsetWidth+8:70;
  const i=Math.min(DAYS.length-1,Math.max(0,Math.round(ds.scrollLeft/w)));
  $("mon").textContent=DAYS[i].toLocaleDateString(undefined,{month:"long",year:"numeric"});
}
ds.addEventListener("scroll",edge,{passive:true});
window.addEventListener("resize",edge);
load();edge();
