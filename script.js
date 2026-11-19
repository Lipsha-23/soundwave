const T=[
{t:"Glasshouse",a:"Mira Okoye",al:"Low Tide Radio",d:132,h:200,r:220,m:0,bpm:92,w:"sine"},
{t:"Night Bus to Cuttack",a:"Dev Patnaik",al:"Last Stop",d:158,h:265,r:196,m:0,bpm:104,w:"triangle"},
{t:"Paper Lanterns",a:"Haru & The Moths",al:"Small Fires",d:141,h:20,r:262,m:1,bpm:118,w:"triangle"},
{t:"Monsoon Static",a:"Mira Okoye",al:"Low Tide Radio",d:187,h:170,r:175,m:0,bpm:76,w:"sine"},
{t:"Orange Hour",a:"Sol Ferreira",al:"Daylight Savings",d:123,h:35,r:247,m:1,bpm:126,w:"square"},
{t:"Slow Signal",a:"Dev Patnaik",al:"Last Stop",d:171,h:320,r:208,m:0,bpm:84,w:"sine"},
{t:"Bright Static",a:"Haru & The Moths",al:"Small Fires",d:109,h:340,r:294,m:1,bpm:132,w:"square"},
{t:"Salt Air",a:"Sol Ferreira",al:"Daylight Savings",d:149,h:190,r:233,m:1,bpm:108,w:"triangle"}
].map((x,i)=>({...x,id:i}));
const P={all:{n:"All songs",ids:[0,1,2,3,4,5,6,7],h:150},chill:{n:"Slow evenings",ids:[0,3,5,1],h:230},up:{n:"Good mood",ids:[2,4,6,7],h:30},liked:{n:"Liked songs",ids:[],h:300},gen:{n:"Generated tracks",ids:[],h:160}};
const MIN=[0,2,3,5,7,8,10],MAJ=[0,2,4,5,7,9,11];
let view="home",q="",cur=-1,queue=[],playing=false,shuffle=false,repeat=false,el=0,liked=new Set();
try{liked=new Set(JSON.parse(localStorage.getItem("sw-liked")||"[]"))}catch(e){}
let PL=[],gm="calm",gb=96,gs=482,gfb="";
try{PL=JSON.parse(localStorage.getItem("sw-pl")||"[]")}catch(e){}
const savePL=()=>{try{localStorage.setItem("sw-pl",JSON.stringify(PL))}catch(e){}};
const $=id=>document.getElementById(id);
const fmt=s=>Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");
const art=x=>`background:linear-gradient(135deg,hsl(${x.h},70%,55%),hsl(${(x.h+60)%360},65%,30%))`;
const ids=()=>meta().ids;
const vis=()=>ids().map(i=>T[i]).filter(x=>(x.t+x.a+x.al).toLowerCase().includes(q));

/* audio engine */
let ctx,master,timer,step=0,next=0,pat=[],an;
function mk(x){let s=x.sd??x.id*7919+13;return Array.from({length:16},(_,i)=>{s=(s*1103515245+12345)&0x7fffffff;const v=s%10;return i%4===0?[0,2,4][v%3]:v<6?v%8:-1})}
function note(f,t,len,type,g){const o=ctx.createOscillator(),e=ctx.createGain();o.type=type;o.frequency.value=f;
e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(g,t+.02);e.gain.exponentialRampToValueAtTime(.001,t+len);
o.connect(e);e.connect(master);o.start(t);o.stop(t+len+.05)}
function sched(){const x=T[cur],sd=60/x.bpm/2,sc=x.m?MAJ:MIN;
while(next<ctx.currentTime+.3){const n=pat[step%16];
if(n>=0){const f=x.r*Math.pow(2,(sc[n%7]+12*Math.floor(n/7))/12);note(f,next,sd*1.8,x.w,x.w==="square"?.05:.12)}
if(step%4===0)note(x.r/2,next,sd*3.5,"sine",.2);
if(step%8===4&&x.bpm>100)note(60,next,.12,"sine",.25);
next+=sd;step++}}
function startAudio(){if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.connect(ctx.destination);an=ctx.createAnalyser();an.fftSize=128;an.smoothingTimeConstant=.8;master.connect(an);setVol()}
ctx.resume();clearInterval(timer);pat=mk(T[cur]);step=0;next=ctx.currentTime+.05;timer=setInterval(()=>{if(playing){sched();el+=.1;tick()}},100)}
function setVol(){if(master)master.gain.value=Math.pow($("vl").value/100,2)*.8;$("vl").style.setProperty("--p",$("vl").value+"%")}

/* playback */
function play(id,list){const l=list||vis().map(x=>x.id);if(!l.includes(id))return;
queue=l;cur=id;el=0;playing=true;startAudio();draw()}
function toggle(){if(cur<0||!ctx){const l=vis();if(cur>=0)play(cur,queue);else if(l.length)play(l[0].id);return}
playing=!playing;if(playing){ctx.resume();next=ctx.currentTime+.05}else if(ctx)ctx.suspend();draw()}
function go(d){if(!queue.length)return;let i=queue.indexOf(cur);
if(shuffle&&d>0&&queue.length>1){let j;do{j=Math.floor(Math.random()*queue.length)}while(j===i);i=j}
else i=(i+d+queue.length)%queue.length;play(queue[i],queue)}
function tick(){const d=T[cur].d;if(el>=d){repeat?play(cur,queue):go(1);return}
$("sk").value=el/d*1000;$("sk").style.setProperty("--p",el/d*100+"%");$("cur").textContent=fmt(el)}

const A=[...new Set(T.map(x=>x.a))];
const gr=h=>`background:linear-gradient(135deg,hsl(${h},70%,55%),hsl(${(h+60)%360},65%,30%))`;
function meta(){if(view.startsWith("a:")){const n=view.slice(2),i=T.filter(x=>x.a===n).map(x=>x.id);return{n,h:T[i[0]].h,ids:i}}
if(view==="gen")return{...P.gen,ids:T.filter(x=>x.gen).map(x=>x.id)};
if(view.startsWith("u:")){const p=PL.find(x=>x.id===view.slice(2));if(p)return{n:p.n,h:(p.n.length*47)%360,ids:p.ids};view="home"}
if(view==="liked")return{...P.liked,ids:[...liked].sort()};
if(view==="home"||view==="search")return P.all;return P[view]}
const card=(a,b,c,k,r)=>`<button class="card${r?" r":""}" ${k}><div class="cv" style="${c}"></div><b>${a}</b><span>${b}</span></button>`;
const shelf=(h,c)=>`<h2>${h}</h2><div class="cards">${c}</div>`;
function home(){const g=new Date().getHours();return{t:g<12?"Good morning":g<18?"Good afternoon":"Good evening",
h:shelf("Your playlists",["chill","up","all"].map(k=>card(P[k].n,P[k].ids.length+" songs",gr(P[k].h),`data-v="${k}"`)).join(""))+shelf("Artists",A.map(n=>card(n,"Artist",art(T.find(x=>x.a===n)),`data-v="a:${n}"`,1)).join(""))+shelf("Jump back in",T.slice(0,6).map(x=>card(x.t,x.a,art(x),`data-play="${x.id}"`)).join(""))}}
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const MOODS={calm:{m:0,w:"sine"},bright:{m:1,w:"triangle"},dark:{m:0,w:"square"},dreamy:{m:1,w:"sine"}};
const W1=["Amber","Velvet","Paper","Neon","Quiet","Glass","Copper","Hollow","Static","Silver","Wild","Slow"],W2=["Harbor","Signal","Garden","Engine","Lantern","Weather","Orbit","River","Echo","Bloom","Drift","Season"];
function gen(seed,mood,bpm){let t=T.find(x=>x.gen&&x.seed===seed&&x.mood===mood&&x.bpm===bpm);if(t)return t;
const M=MOODS[mood],R=[196,208,220,233,247,262,277,294];
t={id:T.length,t:W1[seed%12]+" "+W2[(seed>>3)%12],a:"Generated",al:"Seed "+seed,d:120,h:(seed*37)%360,r:R[seed%8],m:M.m,bpm,w:M.w,gen:1,sd:seed*131+7,seed,mood};T.push(t);return t}
const code=t=>`g-${t.seed}-${t.mood}-${t.bpm}`;
function fromHash(){const m=/^#g-(\d{1,6})-(calm|bright|dark|dreamy)-(\d{2,3})$/.exec(location.hash);if(!m)return;
const t=gen(+m[1],m[2],Math.min(160,Math.max(60,+m[3])));view="gen";q="";cur=t.id;queue=T.filter(x=>x.gen).map(x=>x.id);gm=m[2];gb=t.bpm;gs=t.seed;draw()}
function share(t){gfb=location.href.split("#")[0]+"#"+code(t);try{navigator.clipboard.writeText(gfb).then(()=>toast("Link copied"),()=>0)}catch(e){}draw()}
function genForm(){const t=T[cur];return `<div style="width:100%"><p>Generator</p><h1>Make a track</h1><div class="gf">
<div class="chips">${Object.keys(MOODS).map(k=>`<button class="chip${k===gm?" on":""}" data-mood="${k}">${k}</button>`).join("")}</div>
<label>Tempo <input type="range" id="gb" min="60" max="160" value="${gb}"><b id="gbv">${gb} bpm</b></label>
<label>Seed <input type="number" id="gs" min="1" max="999999" value="${gs}"><button class="chip" data-dice>Random</button></label>
<div class="chips"><button class="chip on" data-gen>Generate and play</button>${t&&t.gen?`<button class="chip" data-share>Copy share link</button>`:""}</div>
${gfb?`<input class="lnk" readonly value="${gfb}" onfocus="this.select()" aria-label="Share link">`:""}</div></div>`}
function side(){$("pl").innerHTML=["all","chill","up","gen"].map(k=>`<button class="${view===k?"on":""}" data-v="${k}">${k==="gen"?"✦ Make a track":P[k].n}</button>`).join("")
+PL.map(p=>`<button class="${view==="u:"+p.id?"on":""}" data-v="u:${p.id}" data-u="${p.id}">♫ ${esc(p.n)}</button>`).join("")+`<button data-newpl>＋ New playlist</button>`}
function toast(s){const t=$("toast");t.textContent=s;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,1800)}
function newPL(){const p={id:Date.now().toString(36),n:"My playlist "+(PL.length+1),ids:[]};PL.push(p);savePL();view="u:"+p.id;q="";draw();return p}
function addTo(pid,id){const p=pid==="new"?newPL():PL.find(x=>x.id===pid);if(p&&!p.ids.includes(id)){p.ids.push(id);savePL();toast("Added to "+p.n)}else if(p)toast("Already in "+p.n);draw()}
function openMenu(id,b){const m=$("menu"),r=b.getBoundingClientRect();m.dataset.id=id;
m.innerHTML=PL.map(p=>`<button data-to="${p.id}">${esc(p.n)}</button>`).join("")+`<button data-to="new">＋ New playlist</button>`;
m.hidden=false;m.style.top=Math.max(8,Math.min(r.bottom+4,innerHeight-m.offsetHeight-8))+"px";m.style.left=Math.max(8,Math.min(r.left-120,innerWidth-m.offsetWidth-8))+"px"}
/* ui */
function draw(){
const p=meta(),L=vis();
$("hero").style.setProperty("--h",`hsl(${p.h},55%,32%)`);
$("hero").innerHTML=`<div class="art" style="background:linear-gradient(135deg,hsl(${p.h},70%,55%),hsl(${p.h+60},60%,28%))"></div><div><p>${view.startsWith("a:")?"Artist":"Playlist"}</p><h1>${p.n}</h1><p>${ids().length} songs</p></div>`;
$("list").innerHTML=L.length?L.map((x,i)=>`<div class="row ${x.id===cur?"cur":""}" data-id="${x.id}" draggable="true" tabindex="0" role="button" aria-label="Play ${x.t}">
<span class="n">${x.id===cur&&playing?"♫":i+1}</span>
<div class="t"><div class="cv" style="${art(x)}"></div><div style="min-width:0"><b>${x.t}</b><span>${x.a}</span></div></div>
<span class="al">${x.al}</span>
<button class="like ${liked.has(x.id)?"on":""}" data-like="${x.id}" aria-label="Like ${x.t}">${liked.has(x.id)?"♥":"♡"}</button>
${view.startsWith("u:")?`<button class="like" data-rm="${x.id}" aria-label="Remove ${x.t} from playlist">✕</button>`:`<button class="like" data-add="${x.id}" aria-label="Add ${x.t} to a playlist">＋</button>`}
<span>${fmt(x.d)}</span></div>`).join(""):`<div class="empty">${q?"No songs match that search. Try a different name.":"Nothing here yet. Tap ♡ on any song to add it."}</div>`;
if(!q&&view==="home"){const o=home();$("hero").innerHTML=`<div><p>Soundwave</p><h1>${o.t}</h1><p>Pick something and press play</p></div>`;$("list").innerHTML=`<div class="shelf">${o.h}</div>`}
if(!q&&view==="search"){$("hero").innerHTML=`<div><p>Find something</p><h1>Browse</h1></div>`;$("list").innerHTML=`<div class="shelf">${shelf("Browse all",[...Object.keys(P),...A.map(n=>"a:"+n)].map(k=>{const m=k.startsWith("a:")?{n:k.slice(2),h:T.find(x=>x.a===k.slice(2)).h}:P[k];return`<button class="tile" data-v="${k}" style="background:hsl(${m.h},55%,36%)">${m.n}</button>`}).join(""))}</div>`}
if(view==="gen"){$("hero").innerHTML=genForm();if(!L.length&&!q)$("list").innerHTML=`<div class="empty">Choose a mood, then press Generate and play to compose your first track.</div>`}
if(view.startsWith("u:")){const pl=PL.find(z=>z.id===view.slice(2));if(pl){$("hero").innerHTML=`<div class="art" style="${gr(p.h)}"></div><div style="min-width:0;flex:1"><p>Your playlist</p><input class="plname" id="plname" value="${esc(pl.n)}" aria-label="Playlist name"><p>${pl.ids.length} songs <button class="chip" data-delpl>Delete playlist</button></p></div>`;if(!L.length&&!q)$("list").innerHTML=`<div class="empty">Empty so far. Drag songs here, or use ＋ on any song.</div>`}}
const x=T[cur];
$("now").innerHTML=x?`<div class="cv" style="${art(x)}"></div><div style="min-width:0"><b>${x.t}</b><span>${x.a}</span></div>`:`<span>Pick a song to start</span>`;
$("tot").textContent=x?fmt(x.d):"0:00";
const ic=playing?"❚❚":"▶";$("pp").textContent=ic;$("bigplay").textContent=ic;
$("pp").setAttribute("aria-label",playing?"Pause":"Play");
$("shuf").classList.toggle("on",shuffle);$("rep").classList.toggle("on",repeat);
$("nav").innerHTML=`<button class="${view==="home"&&!q?"on":""}" data-v="home">Home</button><button class="${view==="search"&&!q?"on":""}" data-v="search">Search</button><button class="${view==="liked"?"on":""}" data-v="liked">Liked songs (${liked.size})</button>`;
side();
document.title=x&&playing?`${x.t} – ${x.a}`:"Soundwave – music player"}
document.addEventListener("click",e=>{
const mn=$("menu");if(!e.target.closest("[data-add],#menu"))mn.hidden=true;
const ad=e.target.closest("[data-add]");if(ad){openMenu(+ad.dataset.add,ad);return}
const mi=e.target.closest("[data-to]");if(mi){mn.hidden=true;addTo(mi.dataset.to,+mn.dataset.id);return}
const rm=e.target.closest("[data-rm]");if(rm){const p=PL.find(z=>z.id===view.slice(2));if(p){p.ids=p.ids.filter(i=>i!==+rm.dataset.rm);savePL();draw()}return}
if(e.target.closest("[data-newpl]")){newPL();return}
if(e.target.closest("[data-delpl]")){PL=PL.filter(z=>z.id!==view.slice(2));savePL();view="home";draw();return}
const mo=e.target.closest("[data-mood]");if(mo){gm=mo.dataset.mood;draw();return}
if(e.target.closest("[data-dice]")){gs=1+Math.floor(Math.random()*99999);gfb="";draw();return}
if(e.target.closest("[data-gen]")){const t=gen(gs,gm,gb);gfb="";play(t.id,T.filter(z=>z.gen).map(z=>z.id));return}
if(e.target.closest("[data-share]")){share(T[cur]);return}
const lk=e.target.closest("[data-like]");
if(lk){const id=+lk.dataset.like;liked.has(id)?liked.delete(id):liked.add(id);try{localStorage.setItem("sw-liked",JSON.stringify([...liked]))}catch(_){}draw();return}
const r=e.target.closest(".row");if(r){play(+r.dataset.id);return}
const pl=e.target.closest("[data-play]");if(pl){play(+pl.dataset.play,T.map(x=>x.id));return}
const v=e.target.closest("[data-v]");if(v){view=v.dataset.v;q="";$("q").value="";draw()}});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList.contains("row"))play(+e.target.dataset.id);
if(e.key===" "&&e.target===document.body){e.preventDefault();toggle()}});
$("q").oninput=e=>{q=e.target.value.toLowerCase().trim();if(q)view="all";draw()};
$("pp").onclick=$("bigplay").onclick=toggle;
$("next").onclick=()=>go(1);$("prev").onclick=()=>el>3?play(cur,queue):go(-1);
$("shuf").onclick=()=>{shuffle=!shuffle;draw()};$("rep").onclick=()=>{repeat=!repeat;draw()};
$("sk").oninput=e=>{if(cur<0)return;el=e.target.value/1000*T[cur].d;tick()};
$("vl").oninput=setVol;
document.addEventListener("input",e=>{const i=e.target.id;
if(i==="gb"){gb=+e.target.value;$("gbv").textContent=gb+" bpm"}
if(i==="gs")gs=Math.max(1,Math.min(999999,Math.floor(+e.target.value)||1));
if(i==="plname"){const p=PL.find(z=>z.id===view.slice(2));if(p){p.n=e.target.value.trim()||"Untitled";savePL();side()}}});
let dragId=null;const clr=()=>document.querySelectorAll(".drop").forEach(n=>n.classList.remove("drop"));
document.addEventListener("dragstart",e=>{const r=e.target.closest&&e.target.closest(".row");if(r){dragId=+r.dataset.id;e.dataTransfer.effectAllowed="copyMove";e.dataTransfer.setData("text/plain",String(dragId))}});
document.addEventListener("dragover",e=>{if(dragId===null)return;const t=e.target.closest("[data-u],.row");if(t&&(t.dataset.u||view.startsWith("u:"))){e.preventDefault();clr();t.classList.add("drop")}});
document.addEventListener("drop",e=>{if(dragId===null)return;const t=e.target.closest("[data-u],.row");if(!t)return;e.preventDefault();
if(t.dataset.u)addTo(t.dataset.u,dragId);
else if(view.startsWith("u:")){const p=PL.find(z=>z.id===view.slice(2)),to=+t.dataset.id;if(p&&to!==dragId){p.ids=p.ids.filter(i=>i!==dragId);const k=p.ids.indexOf(to);p.ids.splice(k<0?p.ids.length:k,0,dragId);savePL()}draw()}
dragId=null;clr()});
document.addEventListener("dragend",()=>{dragId=null;clr()});
/* visualizer */
const cv=$("viz"),cx=cv.getContext("2d"),bins=new Uint8Array(64),still=matchMedia("(prefers-reduced-motion:reduce)").matches;
function fit(){const d=devicePixelRatio||1;cv.width=$("main").clientWidth*d;cv.height=240*d}
function viz(){requestAnimationFrame(viz);const W=cv.width,H=cv.height;cx.clearRect(0,0,W,H);if(cur<0)return;
if(an&&playing&&!still)an.getByteFrequencyData(bins);else bins.fill(0);
const n=48,w=W/n,hue=T[cur].h;for(let i=0;i<n;i++){const v=bins[i+1]/255,h=Math.max(4,v*H*.9);cx.fillStyle=`hsla(${(hue+i*2)%360},75%,60%,.55)`;cx.fillRect(i*w+2,H-h,w-4,h)}}
addEventListener("resize",fit);fit();viz();
setVol();draw();fromHash();addEventListener("hashchange",fromHash);
