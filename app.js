const bnNum=n=>String(n).replace(/\d/g,d=>"০১২৩৪৫৬৭৮৯"[d]);
const enNum=s=>s.replace(/[০-৯]/g,d=>"০১২৩৪৫৬৭৮৯".indexOf(d));
const norm=s=>enNum(s).toLowerCase().replace(/[\s\-()–.,]/g,"");
const ids=Object.keys(STOPS);
function km(a,b){const[,,la1,lo1]=STOPS[a],[,,la2,lo2]=STOPS[b],r=Math.PI/180,
 x=Math.sin((la2-la1)*r/2)**2+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin((lo2-lo1)*r/2)**2;
 return 6371*2*Math.asin(Math.sqrt(x))*1.3;} // সড়ক-দূরত্ব গুণক ১.৩
function find(q){q=norm(q);if(!q)return[];return ids.filter(i=>norm(STOPS[i][0]).includes(q)||norm(STOPS[i][1]).includes(q))
 .sort((a,b)=>(norm(STOPS[b][0]).startsWith(q)||norm(STOPS[b][1]).startsWith(q))-(norm(STOPS[a][0]).startsWith(q)||norm(STOPS[a][1]).startsWith(q)));}
function resolve(v){const e=ids.find(i=>STOPS[i][0]===v.trim());return e||find(v)[0];}
function ac(inp){const ul=inp.nextElementSibling;let k=-1;
 const show=()=>{k=-1;ul.innerHTML=find(inp.value).slice(0,8).map(i=>`<li data-v="${STOPS[i][0]}">${STOPS[i][0]} <small>${STOPS[i][1]}</small></li>`).join("");};
 inp.addEventListener("input",show);inp.addEventListener("focus",show);
 inp.addEventListener("blur",()=>setTimeout(()=>ul.innerHTML="",150));
 ul.addEventListener("mousedown",e=>{const li=e.target.closest("li");if(li){inp.value=li.dataset.v;ul.innerHTML="";}});
 inp.addEventListener("keydown",e=>{const li=[...ul.children];if(!li.length)return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();k=(k+(e.key==="ArrowDown"?1:-1)+li.length)%li.length;li.forEach((l,j)=>l.classList.toggle("on",j===k));}
  else if(e.key==="Enter"&&k>=0){e.preventDefault();inp.value=li[k].dataset.v;ul.innerHTML="";}});}
const F=document.getElementById("from"),T=document.getElementById("to"),out=document.getElementById("out");
ac(F);ac(T);
document.getElementById("swap").onclick=()=>{[F.value,T.value]=[T.value,F.value];};
document.getElementById("f").onsubmit=e=>{e.preventDefault();const a=resolve(F.value),b=resolve(T.value);
 if(!a||!b){out.innerHTML=`<div class="none">দুঃখিত, ${!a?"যাত্রা শুরুর":"গন্তব্যের"} স্থানটি খুঁজে পাওয়া যায়নি। তালিকা থেকে একটি স্থান বাছাই করুন।</div>`;return;}
 if(a===b){out.innerHTML=`<div class="none">যাত্রা শুরু ও গন্তব্য একই স্থান।</div>`;return;}
 F.value=STOPS[a][0];T.value=STOPS[b][0];
 const res=[];for(const r of ROUTES){const i=r.s.indexOf(a),j=r.s.indexOf(b);if(i<0||j<0)continue;
  const seg=i<j?r.s.slice(i,j+1):r.s.slice(j,i+1).reverse();let d=0;for(let x=1;x<seg.length;x++)d+=km(seg[x-1],seg[x]);
  res.push({r,seg,d,fare:Math.max(10,Math.round(d*2.45))});}
 res.sort((x,y)=>x.d-y.d);
 if(!res.length){out.innerHTML=`<div class="none">🚫 <b>${STOPS[a][0]}</b> থেকে <b>${STOPS[b][0]}</b> পর্যন্ত কোনো সরাসরি বাস পাওয়া যায়নি। কাছাকাছি কোনো বড় স্টপে (যেমন ফার্মগেট, গুলিস্তান, মহাখালী) নেমে বাস বদলানোর চেষ্টা করুন।</div>`;return;}
 out.innerHTML=`<h2>${STOPS[a][0]} → ${STOPS[b][0]}: ${bnNum(res.length)}টি সরাসরি বাস</h2>`+res.map(o=>`<div class="card"><span class="fare">৳${bnNum(o.fare)}*</span><h3>${o.r.bn}</h3>
 <div>আনুমানিক দূরত্ব: ${bnNum(o.d.toFixed(1))} কিমি · ${bnNum(o.seg.length-1)}টি স্টপ পর</div>
 <div class="stops">পথ: ${o.seg.map(s=>STOPS[s][0]).join(" → ")}</div><div class="stops">পূর্ণ রুট: ${STOPS[o.r.s[0]][0]} ↔ ${STOPS[o.r.s.at(-1)][0]}</div></div>`).join("")+`<p class="note">* আনুমানিক ভাড়া</p>`;};
document.getElementById("stats").textContent=`ডাটাবেসে ${bnNum(ROUTES.length)}টি বাস সার্ভিস ও ${bnNum(ids.length)}টি স্টপ রয়েছে।`;
