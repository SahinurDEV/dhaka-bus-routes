// অতিরিক্ত ফিচার: সব বাস, বাসের বিস্তারিত, এক বদলের রুট, কাছের স্টপ, সংরক্ষণ, সাম্প্রতিক, শেয়ার, থিম, অফলাইন
const $=id=>document.getElementById(id);
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function segInfo(r,a,b){const i=r.s.indexOf(a),j=r.s.indexOf(b);const seg=i<j?r.s.slice(i,j+1):r.s.slice(j,i+1).reverse();
 const ch=chartDist(a,b,r.s);let d,src;if(ch){d=ch.d;src="বিআরটিএ চার্ট ("+ch.c.code+")";}else{d=0;for(let x=1;x<seg.length;x++)d+=km(seg[x-1],seg[x]);src="বিআরটিএ হার অনুযায়ী · আনুমানিক দূরত্ব";}
 return{seg,d,fare:fareOf(d),src};}
// ভিউ পরিবর্তন
const mapEl=$("map"),homeOfMap=mapEl.parentNode,mapNext=mapEl.nextSibling;
function show(v){document.querySelectorAll(".view").forEach(x=>x.hidden=x.id!=="v-"+v);
 document.querySelectorAll("#tabs button[data-v]").forEach(b=>b.classList.toggle("on",b.dataset.v===v||(v==="bus"&&b.dataset.v==="buses")));
 if(v==="search"&&mapEl.parentNode!==homeOfMap){homeOfMap.insertBefore(mapEl,mapNext);}
 setTimeout(()=>{if(typeof map!=="undefined"&&map)map.invalidateSize();},50);
 if(v==="saved")renderSaved();if(v==="near")renderNear();if(v==="buses")renderBuses();window.scrollTo(0,0);}
document.querySelectorAll("#tabs button[data-v]").forEach(b=>b.onclick=()=>{location.hash=b.dataset.v==="search"?"":b.dataset.v;show(b.dataset.v);});
// থিম
const applyTheme=()=>document.body.classList.toggle("dark",LS.get("dark",false));applyTheme();
$("theme").onclick=()=>{LS.set("dark",!LS.get("dark",false));applyTheme();};
// শেয়ার
function share(title,hash){const url=location.origin+location.pathname+"#"+hash;
 if(navigator.share)navigator.share({title,url}).catch(()=>{});
 else if(navigator.clipboard)navigator.clipboard.writeText(url).then(()=>alert("লিংক কপি হয়েছে"));else prompt("লিংকটি কপি করুন",url);}
// সংরক্ষণ
const toggle=(key,item)=>{let l=LS.get(key,[]);const s=JSON.stringify(item);l=l.some(x=>JSON.stringify(x)===s)?l.filter(x=>JSON.stringify(x)!==s):[item,...l];LS.set(key,l);return l.some(x=>JSON.stringify(x)===s);};
const has=(key,item)=>LS.get(key,[]).some(x=>JSON.stringify(x)===JSON.stringify(item));
// সব বাস
function renderBuses(){const q=norm($("bq").value);
 const list=ROUTES.map((r,i)=>[r,i]).filter(([r])=>!q||norm(r.bn+r.en).includes(q)||r.s.some(s=>norm(STOPS[s][0]+STOPS[s][1]).includes(q)));
 $("bcount").textContent=bnNum(list.length)+"টি বাস সার্ভিস";
 $("blist").innerHTML=list.map(([r,i])=>`<div class="card click" data-i="${i}"><h3>${r.bn}</h3><div class="stops">${STOPS[r.s[0]][0]} ↔ ${STOPS[r.s.at(-1)][0]} · ${bnNum(r.s.length)}টি স্টপ</div></div>`).join("");}
$("bq").oninput=renderBuses;
document.addEventListener("click",e=>{const c=e.target.closest("[data-i]");if(c){location.hash="bus="+c.dataset.i;}
 const t=e.target.closest("[data-trip]");if(t){const [a,b]=t.dataset.trip.split(",");location.hash="";show("search");F.value=STOPS[a][0];T.value=STOPS[b][0];search(a,b);}});
// বাসের বিস্তারিত
function renderBus(i){const r=ROUTES[i];if(!r)return show("buses");show("bus");const v=$("v-bus"),first=r.s[0];
 v.innerHTML=`<button class="back">← সব বাস</button><h2>${r.bn}</h2><p class="note">${r.en}${r.type?" · "+r.type:""}</p>
 <p><button id="sv">${has("savedBuses",i)?"★ সংরক্ষিত":"☆ সংরক্ষণ করুন"}</button> <button id="sh">🔗 শেয়ার</button></p><div id="bmap"></div>
 <h3>সব স্টপ (${bnNum(r.s.length)}টি) · ${STOPS[first][0]} থেকে ভাড়া</h3><ol class="stoplist">${r.s.map((s,k)=>`<li>${STOPS[s][0]} <small>${STOPS[s][1]}</small>${k?`<span class="fare sm" title="${segInfo(r,first,s).src}">৳${bnNum(segInfo(r,first,s).fare)}</span>`:""}</li>`).join("")}</ol>`;
 v.querySelector(".back").onclick=()=>{location.hash="buses";};
 $("sv").onclick=()=>{$("sv").textContent=toggle("savedBuses",i)?"★ সংরক্ষিত":"☆ সংরক্ষণ করুন";};
 $("sh").onclick=()=>share(r.bn,"bus="+i);
 $("bmap").appendChild(mapEl);drawMap(first,r.s.at(-1),r.s);}
// এক বদলে যাওয়া
window.noDirect=function(a,b){const fromA=new Map(),toB=new Map();
 ROUTES.forEach((r,i)=>{if(r.s.includes(a))r.s.forEach(s=>{if(s!==a)(fromA.get(s)||fromA.set(s,[]).get(s)).push(i)});
  if(r.s.includes(b))r.s.forEach(s=>{if(s!==b)(toB.get(s)||toB.set(s,[]).get(s)).push(i)});});
 const opts=[];for(const [x,l1] of fromA){const l2=toB.get(x);if(!l2)continue;
  for(const i of l1)for(const j of l2){if(i===j)continue;const s1=segInfo(ROUTES[i],a,x),s2=segInfo(ROUTES[j],x,b);opts.push({i,j,x,s1,s2,d:s1.d+s2.d});}}
 if(!opts.length)return false;opts.sort((p,q)=>p.d-q.d);const seen=new Set(),top=[];
 for(const o of opts){const k=o.i+"-"+o.j;if(seen.has(k))continue;seen.add(k);top.push(o);if(top.length>=8)break;}
 drawMap(a,b,[...top[0].s1.seg,...top[0].s2.seg.slice(1)]);
 out.innerHTML=`<h2>${STOPS[a][0]} → ${STOPS[b][0]}: সরাসরি বাস নেই, একবার বাস বদলে যাওয়ার উপায়</h2>`+top.map(o=>`<div class="card"><span class="fare">মোট ৳${bnNum(o.s1.fare+o.s2.fare)}</span>
 <h3>১. ${ROUTES[o.i].bn} <small>৳${bnNum(o.s1.fare)}</small></h3><div class="stops">${o.s1.seg.map(s=>STOPS[s][0]).join(" → ")}</div><span class="src">ভাড়ার উৎস: ${o.s1.src}</span>
 <div class="change">🔁 <b>${STOPS[o.x][0]}</b>-এ নেমে বাস বদলান</div>
 <h3>২. ${ROUTES[o.j].bn} <small>৳${bnNum(o.s2.fare)}</small></h3><div class="stops">${o.s2.seg.map(s=>STOPS[s][0]).join(" → ")}</div><span class="src">ভাড়ার উৎস: ${o.s2.src}</span></div>`).join("");
 afterSearch(a,b,[]);return true;};
// সাম্প্রতিক খোঁজ ও ট্রিপ সংরক্ষণ
window.afterSearch=function(a,b){let rc=LS.get("recent",[]).filter(x=>!(x[0]===a&&x[1]===b));rc.unshift([a,b]);LS.set("recent",rc.slice(0,6));renderRecent();
 const bar=document.createElement("p");const t=[a,b];
 bar.innerHTML=`<button id="st">${has("savedTrips",t)?"★ ট্রিপ সংরক্ষিত":"☆ ট্রিপ সংরক্ষণ"}</button> <button id="shr">🔗 শেয়ার</button>`;out.prepend(bar);
 $("st").onclick=()=>{$("st").textContent=toggle("savedTrips",t)?"★ ট্রিপ সংরক্ষিত":"☆ ট্রিপ সংরক্ষণ";};
 $("shr").onclick=()=>share(STOPS[a][0]+" → "+STOPS[b][0],"trip="+a+","+b);};
const tripBtn=([a,b])=>STOPS[a]&&STOPS[b]?`<button class="chip" data-trip="${a},${b}">${STOPS[a][0]} → ${STOPS[b][0]}</button>`:"";
function renderRecent(){const rc=LS.get("recent",[]);$("recent").innerHTML=rc.length?`<p class="note">সাম্প্রতিক খোঁজ:</p>`+rc.map(tripBtn).join(""):"";}
function renderSaved(){const t=LS.get("savedTrips",[]),b=LS.get("savedBuses",[]).filter(i=>ROUTES[i]);
 $("v-saved").innerHTML=`<h2>সংরক্ষিত ট্রিপ</h2>${t.length?t.map(tripBtn).join(""):'<p class="note">কোনো ট্রিপ সংরক্ষণ করা হয়নি।</p>'}
 <h2>সংরক্ষিত বাস</h2>${b.length?b.map(i=>`<div class="card click" data-i="${i}"><h3>${ROUTES[i].bn}</h3><div class="stops">${STOPS[ROUTES[i].s[0]][0]} ↔ ${STOPS[ROUTES[i].s.at(-1)][0]}</div></div>`).join(""):'<p class="note">কোনো বাস সংরক্ষণ করা হয়নি।</p>'}`;}
// কাছের স্টপ
function renderNear(){const st=$("nstat");if(!navigator.geolocation){st.textContent="আপনার ব্রাউজারে অবস্থান সুবিধা নেই।";return;}
 st.textContent="আপনার অবস্থান খোঁজা হচ্ছে…";
 navigator.geolocation.getCurrentPosition(p=>{const {latitude:la,longitude:lo}=p.coords;
  const near=ids.map(i=>[i,hav(la,lo,STOPS[i][2],STOPS[i][3])]).sort((x,y)=>x[1]-y[1]).slice(0,10);
  if(near[0][1]>30){st.textContent="আপনার অবস্থান ঢাকার বাইরে মনে হচ্ছে।";$("nlist").innerHTML="";return;}
  st.textContent="আপনার সবচেয়ে কাছের ১০টি স্টপ (সরলরেখায় দূরত্ব; স্টপের অবস্থান আনুমানিক):";
  $("nlist").innerHTML=near.map(([s,d])=>{const rs=ROUTES.map((r,i)=>[r,i]).filter(([r])=>r.s.includes(s));
   return `<div class="card"><h3>${STOPS[s][0]} <small>${bnNum(d.toFixed(1))} কিমি</small></h3><div class="stops">${bnNum(rs.length)}টি বাস: ${rs.map(([r,i])=>`<a href="#bus=${i}">${r.bn}</a>`).join(", ")||"—"}</div></div>`;}).join("");},
 ()=>{st.textContent="অবস্থান পাওয়া যায়নি বা অনুমতি দেওয়া হয়নি।";},{timeout:10000});}
// লিংক/হ্যাশ রাউটিং
function route(){const h=decodeURIComponent(location.hash.slice(1));
 if(h.startsWith("bus="))return renderBus(+h.slice(4));
 if(h.startsWith("trip=")){const [a,b]=h.slice(5).split(",");show("search");if(STOPS[a]&&STOPS[b]){F.value=STOPS[a][0];T.value=STOPS[b][0];search(a,b);}return;}
 if(["buses","near","saved"].includes(h))return show(h);show("search");}
window.addEventListener("hashchange",route);renderRecent();route();
// অফলাইন
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
