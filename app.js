const RATE=2.70,MIN=10;
const bnNum=n=>String(n).replace(/\d/g,d=>"০১২৩৪৫৬৭৮৯"[d]);
const enNum=s=>s.replace(/[০-৯]/g,d=>"০১২৩৪৫৬৭৮৯".indexOf(d));
const norm=s=>enNum(s).toLowerCase().replace(/[\s\-()–.,/]/g,"");
const ids=Object.keys(STOPS);
const NAMES=[];ids.forEach(i=>{NAMES.push([STOPS[i][0],i,0]);NAMES.push([STOPS[i][1],i,0]);});
for(const a in ALIASES)NAMES.push([a,ALIASES[a],1]);
NAMES.forEach(x=>x.push(norm(x[0])));
function hav(la1,lo1,la2,lo2){const r=Math.PI/180,x=Math.sin((la2-la1)*r/2)**2+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin((lo2-lo1)*r/2)**2;return 6371*2*Math.asin(Math.sqrt(x));}
const km=(a,b)=>hav(STOPS[a][2],STOPS[a][3],STOPS[b][2],STOPS[b][3])*1.3;
const fareOf=d=>Math.max(MIN,Math.round(d*RATE));
function find(q){q=norm(q);if(!q)return[];const seen=new Map();
 for(const [t,i,al,nt] of NAMES){if(!nt.includes(q))continue;const sc=(nt.startsWith(q)?0:2)+al;
  if(!seen.has(i)||seen.get(i).sc>sc)seen.set(i,{i,sc,hint:al?t:""});}
 return [...seen.values()].sort((a,b)=>a.sc-b.sc).map(x=>x);}
function resolve(v){v=v.trim();const e=ids.find(i=>STOPS[i][0]===v);if(e)return e;const f=find(v)[0];return f&&f.i;}
function ac(inp){const ul=inp.nextElementSibling;let k=-1;
 const show=()=>{k=-1;ul.innerHTML=find(inp.value).slice(0,8).map(o=>`<li data-v="${STOPS[o.i][0]}">${STOPS[o.i][0]} <small>${o.hint?"("+o.hint+") ":""}${STOPS[o.i][1]}</small></li>`).join("");};
 inp.addEventListener("input",show);inp.addEventListener("focus",show);
 inp.addEventListener("blur",()=>setTimeout(()=>ul.innerHTML="",150));
 ul.addEventListener("mousedown",e=>{const li=e.target.closest("li");if(li){inp.value=li.dataset.v;ul.innerHTML="";}});
 inp.addEventListener("keydown",e=>{const li=[...ul.children];if(!li.length)return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();k=(k+(e.key==="ArrowDown"?1:-1)+li.length)%li.length;li.forEach((l,j)=>l.classList.toggle("on",j===k));}
  else if(e.key==="Enter"&&k>=0){e.preventDefault();inp.value=li[k].dataset.v;ul.innerHTML="";}});}
// চার্ট-ভিত্তিক ভাড়া: যে বিআরটিএ চার্টে দুটি স্টপই আছে (সার্ভিসের রুটের সাথে সবচেয়ে বেশি মিল)
function chartDist(a,b,routeStops){let best=null;const set=new Set(routeStops||[]);
 for(const c of CHARTS){const m=new Map(c.s);if(!m.has(a)||!m.has(b))continue;
  const ov=c.s.filter(([k])=>set.has(k)).length;if(!best||ov>best.ov)best={ov,d:Math.abs(m.get(a)-m.get(b)),c};}
 return best;}
const F=document.getElementById("from"),T=document.getElementById("to"),out=document.getElementById("out");
ac(F);ac(T);
document.getElementById("swap").onclick=()=>{[F.value,T.value]=[T.value,F.value];};
// মানচিত্র
let map,layer;
function drawMap(a,b,seg,elId){const el=document.getElementById("map"),road=document.getElementById("road");
 if(!window.L){road.textContent="মানচিত্র লোড করা যায়নি।";return;}
 el.style.display="block";if(!map){map=L.map(el);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);}
 if(layer)layer.remove();layer=L.layerGroup().addTo(map);
 const pts=(seg||[a,b]).map(s=>[STOPS[s][2],STOPS[s][3]]);
 L.marker(pts[0]).addTo(layer).bindTooltip("শুরু: "+STOPS[a][0],{permanent:true});
 L.marker(pts.at(-1)).addTo(layer).bindTooltip("গন্তব্য: "+STOPS[b][0],{permanent:true});
 const line=L.polyline(pts,{color:"#999",dashArray:"5 6"}).addTo(layer);map.fitBounds(line.getBounds(),{padding:[30,30]});
 const sl=hav(pts[0][0],pts[0][1],pts.at(-1)[0],pts.at(-1)[1]);
 road.textContent="সড়ক দূরত্ব খোঁজা হচ্ছে…";
 const wp=pts.length>20?pts.filter((_,i)=>i%Math.ceil(pts.length/20)===0||i===pts.length-1):pts;
 fetch("https://router.project-osrm.org/route/v1/driving/"+wp.map(p=>p[1]+","+p[0]).join(";")+"?overview=full&geometries=geojson")
 .then(r=>r.json()).then(j=>{if(!j.routes||!j.routes[0])throw 0;const g=j.routes[0];
  L.geoJSON(g.geometry,{style:{color:"#006a4e",weight:5}}).addTo(layer);
  road.textContent=`বাসের পথ ধরে সড়ক দূরত্ব (OSRM): ${bnNum((g.distance/1000).toFixed(1))} কিমি`;})
 .catch(()=>{road.textContent=`সড়ক দূরত্ব পাওয়া যায়নি; সরলরেখায় দূরত্ব: ${bnNum(sl.toFixed(1))} কিমি`;});}
document.getElementById("f").onsubmit=e=>{e.preventDefault();search(resolve(F.value),resolve(T.value));};
function search(a,b){
 if(!a||!b){out.innerHTML=`<div class="none">দুঃখিত, ${!a?"যাত্রা শুরুর":"গন্তব্যের"} স্থানটি খুঁজে পাওয়া যায়নি। তালিকা থেকে একটি স্থান বাছাই করুন।</div>`;return;}
 if(a===b){out.innerHTML=`<div class="none">যাত্রা শুরু ও গন্তব্য একই স্থান।</div>`;return;}
 F.value=STOPS[a][0];T.value=STOPS[b][0];
 const res=[];
 for(const r of ROUTES){const i=r.s.indexOf(a),j=r.s.indexOf(b);if(i<0||j<0)continue;
  const seg=i<j?r.s.slice(i,j+1):r.s.slice(j,i+1).reverse();const ch=chartDist(a,b,r.s);let d,src;
  if(ch){d=ch.d;src=`বিআরটিএ চার্ট (${ch.c.code})`;}else{d=0;for(let x=1;x<seg.length;x++)d+=km(seg[x-1],seg[x]);src="বিআরটিএ হার অনুযায়ী · আনুমানিক দূরত্ব";}
  res.push({name:r.bn,seg,d,fare:fareOf(d),src,full:[r.s[0],r.s.at(-1)],ch:!!ch});}
 for(const c of CHARTS){const ks=c.s.map(x=>x[0]),i=ks.indexOf(a),j=ks.indexOf(b);if(i<0||j<0)continue;
  const seg=i<j?ks.slice(i,j+1):ks.slice(j,i+1).reverse(),d=Math.abs(c.s[i][1]-c.s[j][1]);
  res.push({name:`বিআরটিএ অনুমোদিত রুট ${c.code}: ${c.name}`,seg,d,fare:fareOf(d),src:`বিআরটিএ চার্ট (${c.code})`,full:[ks[0],ks.at(-1)],ch:true,brta:true});}
 res.sort((x,y)=>(x.brta-y.brta)||(x.d-y.d));
 drawMap(a,b,res[0]&&res[0].seg);
 if(!res.length){if(window.noDirect&&noDirect(a,b))return;out.innerHTML=`<div class="none">🚫 <b>${STOPS[a][0]}</b> থেকে <b>${STOPS[b][0]}</b> পর্যন্ত কোনো সরাসরি বাস পাওয়া যায়নি। কাছাকাছি কোনো বড় স্টপে (যেমন ফার্মগেট, গুলিস্তান, মহাখালী) নেমে বাস বদলানোর চেষ্টা করুন।</div>`;return;}
 const nb=res.filter(x=>!x.brta).length;
 out.innerHTML=`<h2>${STOPS[a][0]} → ${STOPS[b][0]}: ${bnNum(nb)}টি সরাসরি বাস সার্ভিস</h2>`+res.map(o=>`<div class="card"><span class="fare">৳${bnNum(o.fare)}</span><h3>${o.name}</h3>
 <div>দূরত্ব: ${bnNum(o.d.toFixed(1))} কিমি · ${bnNum(o.seg.length-1)}টি স্টপ পর</div>
 <div class="stops">পথ: ${o.seg.map(s=>STOPS[s][0]).join(" → ")}</div><div class="stops">পূর্ণ রুট: ${STOPS[o.full[0]][0]} ↔ ${STOPS[o.full[1]][0]}</div><span class="src">ভাড়ার উৎস: ${o.src}</span></div>`).join("");if(window.afterSearch)afterSearch(a,b,res);}
// বর্তমান অবস্থান
const geo=document.getElementById("geo");
if(navigator.geolocation){geo.textContent="আপনার বর্তমান অবস্থান খোঁজা হচ্ছে…";
 navigator.geolocation.getCurrentPosition(p=>{const {latitude:la,longitude:lo}=p.coords;let best=null,bd=1e9;
  for(const i of ids){const d=hav(la,lo,STOPS[i][2],STOPS[i][3]);if(d<bd){bd=d;best=i;}}
  if(bd>30){geo.textContent="আপনার অবস্থান ঢাকার বাইরে মনে হচ্ছে; যাত্রা শুরুর স্থান নিজে লিখুন।";return;}
  if(!F.value)F.value=STOPS[best][0];geo.textContent=`আপনার নিকটতম স্টপ: ${STOPS[best][0]} (প্রায় ${bnNum(bd.toFixed(1))} কিমি দূরে)। চাইলে পরিবর্তন করুন।`;},
 ()=>{geo.textContent="অবস্থান পাওয়া যায়নি বা অনুমতি দেওয়া হয়নি; যাত্রা শুরুর স্থান নিজে লিখুন।";},{timeout:10000});}
else geo.textContent="আপনার ব্রাউজারে অবস্থান সুবিধা নেই; যাত্রা শুরুর স্থান নিজে লিখুন।";
document.getElementById("stats").textContent=`ডাটাবেসে ${bnNum(ROUTES.length)}টি বাস সার্ভিস, ${bnNum(CHARTS.length)}টি বিআরটিএ রুট চার্ট ও ${bnNum(ids.length)}টি স্টপ রয়েছে।`;
