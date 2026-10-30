// অতিরিক্ত ফিচার: সব বাস, বাসের বিস্তারিত, এক বদলের রুট, কাছের স্টপ, সংরক্ষণ, সাম্প্রতিক, শেয়ার, থিম, অফলাইন
const $=id=>document.getElementById(id);
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function segInfo(r,a,b){const i=r.s.indexOf(a),j=r.s.indexOf(b);const seg=i<j?r.s.slice(i,j+1):r.s.slice(j,i+1).reverse();
 const ch=chartDist(a,b,r.s);let d,src;if(ch){d=ch.d;src="বিআরটিএ চার্ট ("+ch.c.code+")";}else{d=0;for(let x=1;x<seg.length;x++)d+=km(seg[x-1],seg[x]);src="বিআরটিএ হার অনুযায়ী · আনুমানিক দূরত্ব";}
 return{seg,d,fare:fareOf(d),src};}
// ভিউ পরিবর্তন
const mapEl=$("map"),homeOfMap=mapEl.parentNode,mapNext=mapEl.nextSibling;
function show(v){if(v!=="trip")stopTrip&&stopTrip();document.querySelectorAll(".view").forEach(x=>x.hidden=x.id!=="v-"+v);
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
 <p><button id="sv">${has("savedBuses",i)?"★ সংরক্ষিত":"☆ সংরক্ষণ করুন"}</button> <button id="sh">🔗 শেয়ার</button></p><div class="busgo">যাত্রা: <select id="jx">${r.s.map((s,k)=>`<option value="${s}">${STOPS[s][0]}</option>`).join("")}</select> → <select id="jy">${r.s.map((s,k)=>`<option value="${s}" ${k===r.s.length-1?"selected":""}>${STOPS[s][0]}</option>`).join("")}</select> <span id="jf" class="fare sm"></span><br><button id="jgo" class="go">▶ যাত্রা শুরু করুন</button></div><div id="bmap"></div>
 <h3>সব স্টপ (${bnNum(r.s.length)}টি) · ${STOPS[first][0]} থেকে ভাড়া</h3><ol class="stoplist">${r.s.map((s,k)=>`<li>${STOPS[s][0]} <small>${STOPS[s][1]}</small>${k?`<span class="fare sm" title="${segInfo(r,first,s).src}">৳${bnNum(segInfo(r,first,s).fare)}</span>`:""}</li>`).join("")}</ol>`;
 v.querySelector(".back").onclick=()=>{location.hash="buses";};
 $("sv").onclick=()=>{$("sv").textContent=toggle("savedBuses",i)?"★ সংরক্ষিত":"☆ সংরক্ষণ করুন";};
 $("sh").onclick=()=>share(r.bn,"bus="+i);
 const jf=()=>{const x=$("jx").value,y=$("jy").value;$("jf").textContent=x===y?"":"৳"+bnNum(segInfo(r,x,y).fare)+" · "+segInfo(r,x,y).src;};$("jx").onchange=$("jy").onchange=jf;jf();
 $("jgo").onclick=()=>{const x=$("jx").value,y=$("jy").value;if(x===y)return alert("ওঠা ও নামার স্টপ আলাদা বেছে নিন");tripOn(i,x,y);};
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
 <h3>২. ${ROUTES[o.j].bn} <small>৳${bnNum(o.s2.fare)}</small></h3><div class="stops">${o.s2.seg.map(s=>STOPS[s][0]).join(" → ")}</div><span class="src">ভাড়ার উৎস: ${o.s2.src}</span><p><button class="go" data-leg="${o.i},${a},${o.x}">▶ ১ম বাসে যাত্রা শুরু</button> <button class="go" data-leg="${o.j},${o.x},${b}">▶ ২য় বাসে যাত্রা শুরু</button></p></div>`).join("");
 out.querySelectorAll("[data-leg]").forEach(btn=>btn.onclick=()=>{const [i,x,y]=btn.dataset.leg.split(",");tripOn(+i,x,y);});
 afterSearch(a,b,[]);return true;};
// সাম্প্রতিক খোঁজ ও ট্রিপ সংরক্ষণ
window.afterSearch=function(a,b,res){(res||[]).forEach((o,k)=>{const c=out.querySelectorAll(".card")[k];if(!c)return;const btn=document.createElement("button");btn.className="go";btn.textContent="▶ যাত্রা শুরু করুন";btn.onclick=()=>startTrip(o);c.appendChild(btn);});let rc=LS.get("recent",[]).filter(x=>!(x[0]===a&&x[1]===b));rc.unshift([a,b]);LS.set("recent",rc.slice(0,6));renderRecent();
 const bar=document.createElement("p");const t=[a,b];
 bar.innerHTML=`<button id="st">${has("savedTrips",t)?"★ ট্রিপ সংরক্ষিত":"☆ ট্রিপ সংরক্ষণ"}</button> <button id="shr">🔗 শেয়ার</button>`;out.prepend(bar);
 $("st").onclick=()=>{$("st").textContent=toggle("savedTrips",t)?"★ ট্রিপ সংরক্ষিত":"☆ ট্রিপ সংরক্ষণ";};
 $("shr").onclick=()=>share(STOPS[a][0]+" → "+STOPS[b][0],"trip="+a+","+b);};
const tripBtn=([a,b])=>STOPS[a]&&STOPS[b]?`<button class="chip" data-trip="${a},${b}">${STOPS[a][0]} → ${STOPS[b][0]}</button>`:"";
function renderRecent(){const rc=LS.get("recent",[]);$("recent").innerHTML=rc.length?`<p class="note">সাম্প্রতিক খোঁজ:</p>`+rc.map(tripBtn).join(""):"";}
function renderSaved(){const t=LS.get("savedTrips",[]),b=LS.get("savedBuses",[]).filter(i=>ROUTES[i]);
 $("v-saved").innerHTML=`<h2>সংরক্ষিত ট্রিপ</h2>${t.length?t.map(tripBtn).join(""):'<p class="note">কোনো ট্রিপ সংরক্ষণ করা হয়নি।</p>'}
 <h2>সংরক্ষিত বাস</h2>${b.length?b.map(i=>`<div class="card click" data-i="${i}"><h3>${ROUTES[i].bn}</h3><div class="stops">${STOPS[ROUTES[i].s[0]][0]} ↔ ${STOPS[ROUTES[i].s.at(-1)][0]}</div></div>`).join(""):'<p class="note">কোনো বাস সংরক্ষণ করা হয়নি।</p>'}
 <h2>যাত্রার ইতিহাস</h2>${(()=>{const h=LS.get("tripHistory",[]);return h.length?h.map((r,i)=>`<div class="card click" data-h="${i}"><span class="fare">৳${bnNum(r.fare)}</span><h3>${STOPS[r.from]?STOPS[r.from][0]:""} → ${STOPS[r.to]?STOPS[r.to][0]:""}</h3><div class="stops">${r.name} · ${bnNum(r.dist.toFixed(1))} কিমি · ${fmtT(r.dur)} · ${new Date(r.date).toLocaleDateString("bn-BD",{timeZone:"Asia/Dhaka"})}</div></div>`).join(""):'<p class="note">এখনো কোনো যাত্রা সম্পন্ন হয়নি।</p>'})()}`;
 $("v-saved").querySelectorAll("[data-h]").forEach(c=>c.onclick=()=>showSummary(LS.get("tripHistory",[])[+c.dataset.h]));}
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
function tripOn(i,x,y){const r=ROUTES[i],s=segInfo(r,x,y);startTrip({name:r.bn,seg:s.seg,d:s.d,fare:s.fare,src:s.src});}
// যাত্রা চলাকালীন ভিউ
let watchId=null,tmap=null,clockT=null;
function stopTrip(){if(watchId!==null&&navigator.geolocation)navigator.geolocation.clearWatch(watchId);watchId=null;clearInterval(clockT);}
function legFare(seg,k){if(k<=0)return null;return segInfo({s:seg},seg[0],seg[k]);}
const spCol=v=>v<10?"#d62828":v<25?"#f4a100":"#2a9d55";
const spTxt=v=>v<10?"🔴 ধীরগতি / যানজট":v<25?"🟡 মাঝারি গতি":"🟢 স্বাভাবিক গতি";
const fmtT=ms=>{const m=Math.round(ms/60000);return m<60?bnNum(m)+" মিনিট":bnNum(Math.floor(m/60))+" ঘণ্টা "+bnNum(m%60)+" মিনিট";};
function newMap(el){if(!window.L)return null;const mp=L.map(el);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(mp);return mp;}
function startTrip(o){stopTrip();show("trip");const v=$("v-trip"),seg=o.seg,a=seg[0],b=seg.at(-1);
 v.innerHTML=`<button class="back">← ফিরুন</button><h2>${o.name}</h2>
 <div class="farebox"><div>মোট ভাড়া · ${STOPS[a][0]} → ${STOPS[b][0]}</div><b>৳${bnNum(o.fare)}</b><small>ভাড়ার উৎস: ${o.src} · ${bnNum(o.d.toFixed(1))} কিমি</small></div>
 <div class="live"><div><small>বর্তমান গতি</small><b id="tsp">—</b><small>কিমি/ঘণ্টা</small></div><div><small>অতিক্রান্ত দূরত্ব</small><b id="tdist">০.০</b><small>কিমি</small></div><div><small>সময়</small><b id="ttime">০ মিনিট</b></div></div>
 <p id="tcong" class="cong">গতি মাপা শুরু হয়নি</p>
 <div id="tmap" class="tmap"></div><p class="note">মানচিত্রে আপনার চলার পথ আপনার নিজের মাপা গতি অনুযায়ী রঙ করা: সবুজ ≥২৫, হলুদ ১০–২৫, লাল &lt;১০ কিমি/ঘণ্টা। এটি শুধু আপনার বাসের গতি থেকে হিসাব — শহরের প্রকৃত যানজটের তথ্য নয়।</p>
 <p id="tstat" class="note">আপনার অবস্থান খোঁজা হচ্ছে… (না পেলে নিচের স্টপে চাপ দিয়ে বর্তমান স্টপ বেছে নিন)</p><p id="tsofar" class="sofar" hidden></p>
 <button id="tend" class="go">■ যাত্রা শেষ করুন</button><ol class="stoplist trip" id="tlist"></ol>`;
 v.querySelector(".back").onclick=()=>{stopTrip();history.back();};
 const T={start:Date.now(),pts:[],dist:0,max:0,slow:0,sp:null,k:0,maxK:0,last:null};
 tmap=newMap($("tmap"));let me=null;
 if(tmap){const ll=seg.map(s=>[STOPS[s][2],STOPS[s][3]]);const pl=L.polyline(ll,{color:"#888",dashArray:"5 6"}).addTo(tmap);
  L.marker(ll[0]).addTo(tmap).bindTooltip("ওঠা: "+STOPS[a][0]);L.marker(ll.at(-1)).addTo(tmap).bindTooltip("নামা: "+STOPS[b][0]);tmap.fitBounds(pl.getBounds(),{padding:[20,20]});}
 const paint=k=>{T.k=k;T.maxK=Math.max(T.maxK,k);const f=legFare(seg,k),nxt=seg[Math.min(k+1,seg.length-1)];
  $("tstat").innerHTML=`বর্তমান স্টপ: <b>${STOPS[seg[k]][0]}</b>${k<seg.length-1?` · পরের স্টপ: <b>${STOPS[nxt][0]}</b>`:" · আপনি গন্তব্যে পৌঁছেছেন"}`;
  const sf=$("tsofar");sf.hidden=!f;if(f)sf.innerHTML=`এ পর্যন্ত ভাড়া (${STOPS[a][0]} → ${STOPS[seg[k]][0]}): <b>৳${bnNum(f.fare)}</b> <small>${f.src}</small>`;
  $("tlist").innerHTML=seg.map((s,i)=>{const lf=legFare(seg,i);return `<li data-k="${i}" class="${i===k?"cur":i<k?"done":""}">${STOPS[s][0]}<span class="fare sm">${lf?"৳"+bnNum(lf.fare):"ওঠার স্টপ"}</span></li>`}).join("");
  $("tlist").querySelectorAll("li").forEach(li=>li.onclick=()=>{manual=true;paint(+li.dataset.k);});};
 let manual=false;paint(0);
 clockT=setInterval(()=>{$("ttime").textContent=fmtT(Date.now()-T.start);},10000);
 $("tend").onclick=()=>endTrip(o,T);
 if(!navigator.geolocation){$("tstat").textContent="এই ব্রাউজারে অবস্থান সুবিধা নেই; গতি মাপা যাবে না। স্টপে চাপ দিয়ে বর্তমান স্টপ বেছে নিন।";return;}
 watchId=navigator.geolocation.watchPosition(p=>{const {latitude:la,longitude:lo,accuracy:acc,speed}=p.coords,t=p.timestamp||Date.now();
  if(acc&&acc>100)return; // অনির্ভরযোগ্য অবস্থান বাদ
  const cur=[la,lo];
  if(T.last){const dk=hav(T.last.p[0],T.last.p[1],la,lo),dt=(t-T.last.t)/3600000;if(dt<=0)return;
   let raw=(speed!=null&&speed>=0)?speed*3.6:dk/dt;if(raw>120)return; // GPS লাফ বাদ
   T.sp=T.sp==null?raw:0.3*raw+0.7*T.sp; // মসৃণ গতি
   T.dist+=dk;T.max=Math.max(T.max,T.sp);if(T.sp<10)T.slow+=t-T.last.t;
   const col=spCol(T.sp);T.pts.push([la,lo,Math.round(T.sp)]);
   if(tmap)L.polyline([T.last.p,cur],{color:col,weight:6}).addTo(tmap);
   $("tsp").textContent=bnNum(Math.round(T.sp));$("tdist").textContent=bnNum(T.dist.toFixed(1));
   const c=$("tcong");c.textContent=spTxt(T.sp)+" (আপনার নিজের গতি অনুযায়ী)";c.style.borderColor=col;}
  else{T.pts.push([la,lo,0]);T.t0=t;}
  T.last={p:cur,t};
  if(tmap){if(!me)me=L.circleMarker(cur,{radius:8,color:"#fff",weight:3,fillColor:"#1565c0",fillOpacity:1}).addTo(tmap).bindTooltip("আপনি এখানে");else me.setLatLng(cur);}
  if(manual)return;let k=0,bd=1e9;seg.forEach((s,i)=>{const d=hav(la,lo,STOPS[s][2],STOPS[s][3]);if(d<bd){bd=d;k=i;}});
  if(bd>3){$("tstat").textContent="আপনি এই রুট থেকে দূরে আছেন বলে মনে হচ্ছে; স্টপে চাপ দিয়ে বর্তমান স্টপ বেছে নিন।";return;}
  if(k!==T.k)paint(k);if(k===seg.length-1)$("tstat").innerHTML+=" — যাত্রা শেষ করতে নিচের বোতাম চাপুন।";},
 ()=>{$("tstat").textContent="অবস্থান পাওয়া যায়নি; গতি মাপা যাচ্ছে না। স্টপে চাপ দিয়ে বর্তমান স্টপ বেছে নিন।";},{enableHighAccuracy:true,maximumAge:2000,timeout:20000});}
function endTrip(o,T){stopTrip();const dur=T.last&&T.t0!=null&&T.last.t>T.t0?T.last.t-T.t0:Date.now()-T.start,hrs=dur/3600000;
 const rec={date:new Date().toISOString(),name:o.name,from:o.seg[0],to:o.seg.at(-1),fare:o.fare,src:o.src,dist:+T.dist.toFixed(2),dur,avg:hrs>0&&T.dist>0?T.dist/hrs:0,max:T.max,slow:T.slow,stops:T.maxK,pts:T.pts.filter((_,i)=>i%Math.ceil(T.pts.length/300||1)===0)};
 const h=LS.get("tripHistory",[]);h.unshift(rec);LS.set("tripHistory",h.slice(0,30));showSummary(rec);}
function showSummary(r){show("trip");const v=$("v-trip");
 v.innerHTML=`<button class="back">← ফিরুন</button><h2>যাত্রার সারসংক্ষেপ</h2><p>${r.name}<br><b>${STOPS[r.from]?STOPS[r.from][0]:""} → ${STOPS[r.to]?STOPS[r.to][0]:""}</b> · ${new Date(r.date).toLocaleString("bn-BD",{timeZone:"Asia/Dhaka"})}</p>
 <div class="farebox"><div>ভাড়া</div><b>৳${bnNum(r.fare)}</b><small>${r.src}</small></div>
 <table class="sum"><tr><td>অতিক্রান্ত দূরত্ব (জিপিএস)</td><td>${bnNum(r.dist.toFixed(1))} কিমি</td></tr><tr><td>সময়</td><td>${fmtT(r.dur)}</td></tr>
 <tr><td>গড় গতি</td><td>${bnNum(Math.round(r.avg))} কিমি/ঘণ্টা</td></tr><tr><td>সর্বোচ্চ গতি</td><td>${bnNum(Math.round(r.max))} কিমি/ঘণ্টা</td></tr>
 <tr><td>ধীরগতিতে (&lt;১০ কিমি/ঘণ্টা) কাটানো সময়</td><td>${fmtT(r.slow)}</td></tr><tr><td>অতিক্রান্ত স্টপ</td><td>${bnNum(r.stops)}টি</td></tr></table>
 <div id="smap" class="tmap"></div>${r.pts.length<2?'<p class="note">জিপিএস পথ রেকর্ড হয়নি।</p>':'<p class="note">পথের রঙ আপনার নিজের মাপা গতি অনুযায়ী।</p>'}`;
 v.querySelector(".back").onclick=()=>show("saved");
 const mp=newMap($("smap"));if(mp){const ll=r.pts.map(p=>[p[0],p[1]]);
  if(ll.length>1){for(let i=1;i<ll.length;i++)L.polyline([ll[i-1],ll[i]],{color:spCol(r.pts[i][2]),weight:6}).addTo(mp);mp.fitBounds(L.latLngBounds(ll),{padding:[20,20]});}
  else if(STOPS[r.from]&&STOPS[r.to])mp.fitBounds([[STOPS[r.from][2],STOPS[r.from][3]],[STOPS[r.to][2],STOPS[r.to][3]]]);}}
// লিংক/হ্যাশ রাউটিং
function route(){const h=decodeURIComponent(location.hash.slice(1));
 if(h.startsWith("bus="))return renderBus(+h.slice(4));
 if(h.startsWith("trip=")){const [a,b]=h.slice(5).split(",");show("search");if(STOPS[a]&&STOPS[b]){F.value=STOPS[a][0];T.value=STOPS[b][0];search(a,b);}return;}
 if(["buses","near","saved"].includes(h))return show(h);show("search");}
window.addEventListener("hashchange",route);renderRecent();route();
// অফলাইন
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
