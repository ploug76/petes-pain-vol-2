/* Pete's Pain 2: Extreme Makeover — core: canvas, save, utils, audio, input. Original game; no assets from any other game. */
'use strict';
const pl=planck,V2=(x,y)=>new pl.Vec2(x,y),TAU=Math.PI*2;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let W=400,H=800,DPR=1,SAFE={t:0,r:0,b:0,l:0},PORT=true,frameT=0;
const QA=window.__QA||null;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a),rint=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const hyp=Math.hypot,FONT='"Trebuchet MS","Segoe UI",system-ui,sans-serif';
const fmt=n=>Math.round(n).toLocaleString('en-US');
// ---------- save ----------
const SKEY='pp2_save_v1';
let save={best:{},trophies:{},outfit:'dummy',mute:false,music:true,stats:{launches:0,glass:0,heads:0,booms:0,npcs:0,strikes:0},seen:false};
try{const s=JSON.parse(localStorage.getItem(SKEY)||'null');if(s)save=Object.assign(save,s,{stats:Object.assign(save.stats,s.stats||{})})}catch(e){}
function persist(){try{localStorage.setItem(SKEY,JSON.stringify(save))}catch(e){}}
// ---------- layout ----------
function resize(){DPR=Math.min(window.devicePixelRatio||1,2.5);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';
 const sp=document.getElementById('sp');if(sp){const cs=getComputedStyle(sp);SAFE={t:parseFloat(cs.paddingTop)||0,r:parseFloat(cs.paddingRight)||0,b:parseFloat(cs.paddingBottom)||0,l:parseFloat(cs.paddingLeft)||0}}
 PORT=H>=W;if(window.onLayout)onLayout()}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,200));
let lastW=0,lastH=0;setInterval(()=>{if(innerWidth!==lastW||innerHeight!==lastH){lastW=innerWidth;lastH=innerHeight;resize()}},500);
// ---------- audio (all synthesized, original) ----------
const SND=(()=>{let ac=null,master,sfx,mus,noise,comp,windG=null,windF=null;const S={on:false};
 function init(){if(ac)return;try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}
  comp=ac.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(ac.destination);
  master=ac.createGain();master.connect(comp);sfx=ac.createGain();sfx.gain.value=.9;sfx.connect(master);mus=ac.createGain();mus.gain.value=.32;mus.connect(master);
  const n=ac.sampleRate*1.5|0,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;noise=b;S.on=true;apply();
  windG=ac.createGain();windG.gain.value=0;windF=ac.createBiquadFilter();windF.type='bandpass';windF.frequency.value=500;windF.Q.value=.8;const ws=ac.createBufferSource();ws.buffer=noise;ws.loop=true;ws.connect(windF);windF.connect(windG);windG.connect(sfx);ws.start()}
 function apply(){if(!ac)return;master.gain.value=save.mute?0:1;mus.gain.value=save.music?.3:0}
 function unlock(){init();if(ac&&ac.state==='suspended')ac.resume()}
 const T=()=>ac.currentTime;
 function env(g,t,a,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec)}
 function nz(t,dur,type,f,q,vol,dest,f2){const s=ac.createBufferSource();s.buffer=noise;s.playbackRate.value=rnd(.8,1.2);const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);fl.Q.value=q;const g=ac.createGain();env(g,t,.004,vol,dur);s.connect(fl);fl.connect(g);g.connect(dest||sfx);s.start(t,rnd(0,1));s.stop(t+dur+.05)}
 function tone(t,type,f,f2,dur,vol,dest,a){const o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);const g=ac.createGain();env(g,t,a||.005,vol,dur);o.connect(g);g.connect(dest||sfx);o.start(t);o.stop(t+dur+.05);return o}
 let lastHit=0;
 S.thud=(k)=>{if(!S.on)return;const t=T();if(t-lastHit<.035)return;lastHit=t;k=clamp(k,0,1);tone(t,'sine',140+60*k,45,.12+.2*k,.25+.55*k);nz(t,.06+.12*k,'lowpass',900+1500*k,1,.2+.5*k)};
 S.crunch=(k)=>{if(!S.on)return;const t=T();for(let i=0;i<4;i++)nz(t+i*.022,.03,'bandpass',rnd(1400,3200),6,.35*k+.1);tone(t,'square',220,70,.09,.12)};
 S.glass=()=>{if(!S.on)return;const t=T();nz(t,.35,'highpass',3500,1,.55);for(let i=0;i<7;i++)tone(t+rnd(0,.18),'sine',rnd(2200,5200),null,.12,.1)};
 S.boom=(k=1)=>{if(!S.on)return;const t=T();nz(t,1.1,'lowpass',2200,.7,.9*k,null,90);tone(t,'sine',90,28,.7,.9*k);tone(t,'sawtooth',60,30,.25,.2*k)};
 S.boing=(k=1)=>{if(!S.on)return;const t=T();const o=tone(t,'triangle',180,560*k,.32,.4);tone(t,'sine',90,300,.2,.25)};
 S.twang=()=>{if(!S.on)return;const t=T();tone(t,'sawtooth',110,55,.45,.3);tone(t,'triangle',330,160,.3,.25);nz(t,.25,'bandpass',600,2,.3,null,200)};
 S.stretch=(p)=>{if(!S.on)return;const t=T();tone(t,'triangle',120+p*260,null,.05,.06)};
 S.grab=()=>{if(!S.on)return;const t=T();tone(t,'square',520,780,.07,.12);nz(t,.05,'highpass',2000,1,.15)};
 S.ooch=(i)=>{if(!S.on)return;const t=T();tone(t,'sine',300-i*40,600-i*60,.12,.22);nz(t,.12,'bandpass',900,3,.2)};
 S.superOoch=()=>{if(!S.on)return;const t=T();tone(t,'sawtooth',200,1200,.35,.25);nz(t,.4,'bandpass',1200,2,.35,null,4000)};
 S.toot=()=>{if(!S.on)return;const t=T();const o=ac.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(95,t);for(let i=0;i<10;i++)o.frequency.linearRampToValueAtTime(rnd(70,120),t+i*.045);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=420;const g=ac.createGain();env(g,t,.01,.55,.5);o.connect(f);f.connect(g);g.connect(sfx);o.start(t);o.stop(t+.6)};
 S.voice=(k)=>{if(!S.on)return;const t=T();// cartoon "oof/ow" voice: saw + two formant filters
  const o=ac.createOscillator();o.type='sawtooth';const p=rnd(130,170)*(1+k*.3);o.frequency.setValueAtTime(p*1.3,t);o.frequency.exponentialRampToValueAtTime(p*.7,t+.28);
  const g=ac.createGain();env(g,t,.01,.22+.2*k,.3);[[650,8],[1100,10]].forEach(([f,q])=>{const b=ac.createBiquadFilter();b.type='bandpass';b.frequency.setValueAtTime(f*1.2,t);b.frequency.exponentialRampToValueAtTime(f*.8,t+.3);b.Q.value=q;o.connect(b);b.connect(g)});g.connect(sfx);o.start(t);o.stop(t+.4)};
 S.crowd=(k=1)=>{if(!S.on)return;const t=T();[500,900,1500].forEach((f,i)=>{const s=ac.createBufferSource();s.buffer=noise;const b=ac.createBiquadFilter();b.type='bandpass';b.frequency.setValueAtTime(f,t);b.frequency.linearRampToValueAtTime(f*1.25,t+.5);b.frequency.linearRampToValueAtTime(f*.8,t+1.3);b.Q.value=5;const g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.16*k,t+.25);g.gain.linearRampToValueAtTime(.0001,t+1.4);s.connect(b);b.connect(g);g.connect(sfx);s.start(t);s.stop(t+1.5)})};
 S.ding=(n=0)=>{if(!S.on)return;const t=T();tone(t,'square',660*Math.pow(1.06,n),null,.08,.08);tone(t+.06,'square',990*Math.pow(1.06,n),null,.12,.07)};
 S.blip=()=>{if(!S.on)return;tone(T(),'square',880,null,.05,.08)};
 S.horn=()=>{if(!S.on)return;const t=T();tone(t,'square',392,null,.35,.12);tone(t,'square',466,null,.35,.1)};
 S.alarm=()=>{if(!S.on)return;const t=T();const o=ac.createOscillator();o.type='square';o.frequency.setValueAtTime(700,t);for(let i=0;i<6;i++){o.frequency.linearRampToValueAtTime(1100,t+i*.25+.12);o.frequency.linearRampToValueAtTime(700,t+i*.25+.25)}const g=ac.createGain();g.gain.setValueAtTime(.05,t);g.gain.linearRampToValueAtTime(.0001,t+1.5);o.connect(g);g.connect(sfx);o.start(t);o.stop(t+1.55)};
 S.squeak=()=>{if(!S.on)return;const t=T();tone(t,'sine',1200,1800,.1,.15);tone(t+.1,'sine',1500,900,.1,.12)};
 S.honk=()=>{if(!S.on)return;const t=T();tone(t,'sawtooth',300,280,.18,.2);tone(t+.2,'sawtooth',300,260,.18,.2)};
 S.splash=()=>{if(!S.on)return;const t=T();nz(t,.8,'lowpass',3000,1,.6,null,300);nz(t+.1,.5,'highpass',2500,1,.2)};
 S.pin=()=>{if(!S.on)return;const t=T();tone(t,'triangle',900,500,.12,.2);nz(t,.06,'bandpass',2500,4,.3)};
 S.cheer=()=>{if(!S.on)return;S.crowd(1.6);const t=T();[523,659,784,1046].forEach((f,i)=>tone(t+i*.09,'square',f,null,.18,.08))};
 S.sad=()=>{if(!S.on)return;const t=T();[392,370,349,330].forEach((f,i)=>tone(t+i*.22,'triangle',f,f*.97,.25,.15))};
 S.wind=(v)=>{if(!windG)return;windG.gain.setTargetAtTime(clamp((v-8)/40,0,.28),ac.currentTime,.1);windF.frequency.setTargetAtTime(300+v*25,ac.currentTime,.1)};
 S.duck=(d=.6)=>{if(!ac||!save.music)return;const t=T();mus.gain.cancelScheduledValues(t);mus.gain.setValueAtTime(.08,t);mus.gain.linearRampToValueAtTime(.3,t+d)};
 // ---- music: original procedural loops ----
 const SONGS={
  title:{bpm:108,root:45,prog:[0,0,5,7],scale:[0,3,5,7,10],bass:'x.x.x..xx.x.x..x',kick:'x...x...x...x..x',snare:'....x.......x...',hat:'xxxxxxxxxxxxxxxx',lead:1,wave:'square'},
  city:{bpm:112,root:43,prog:[0,5,3,7],scale:[0,3,5,7,10],bass:'x..x..x.x.x..x..',kick:'x.....x.x...x...',snare:'....x.......x..x',hat:'x.x.x.x.x.x.x.xx',lead:1,wave:'square'},
  site:{bpm:128,root:40,prog:[0,0,3,5],scale:[0,3,5,6,7,10],bass:'xx.xx.x.xx.xx.x.',kick:'x...x...x...x...',snare:'....x.......x...',hat:'x.xxx.xxx.xxx.xx',lead:1,wave:'sawtooth'},
  pier:{bpm:140,root:47,prog:[0,5,7,5],scale:[0,2,4,7,9],bass:'x.xx..x.x.xx..x.',kick:'x..x..x...x..x..',snare:'....x.......x...',hat:'xxxxxxxxxxxxxxxx',lead:1,wave:'triangle'},
  vegas:{bpm:100,root:41,prog:[0,3,5,4],scale:[0,2,3,5,7,9,10],bass:'x..xx..xx..xx..x',kick:'x.......x.......',snare:'....x..x....x...',hat:'x.xx.xx.x.xx.xx.',lead:1,wave:'square',swing:.18},
  bowl:{bpm:118,root:44,prog:[0,7,5,3],scale:[0,2,4,5,7,9,11],bass:'x...x.x.x...x.x.',kick:'x...x...x...x...',snare:'....x.......x...',hat:'..x...x...x...x.',lead:1,wave:'square'}};
 let song=null,step=0,nextT=0,timer=0,mel=[];
 const mf=m=>440*Math.pow(2,(m-69)/12);
 function genMel(sg){const out=[];let n=2;for(let i=0;i<64;i++){if(Math.random()<.55){n=clamp(n+pick([-2,-1,1,1,2,0]),0,sg.scale.length*2-1);out.push(n)}else out.push(-1)}return out}
 function sched(){if(!song||!ac)return;const sg=SONGS[song],spb=60/sg.bpm/4;while(nextT<ac.currentTime+.15){const s=step%16,bar=(step>>4)%4,ch=sg.prog[bar],t=nextT+(s%2?(sg.swing||0)*spb:0);
   if(sg.kick[s]==='x'){tone(t,'sine',150,40,.18,.5,mus)}
   if(sg.snare[s]==='x'){nz(t,.13,'bandpass',1800,.8,.35,mus);tone(t,'triangle',220,140,.07,.15,mus)}
   if(sg.hat[s]==='x')nz(t,.03,'highpass',7000,1,s%4==2?.12:.06,mus);
   if(sg.bass[s]==='x'){const m=sg.root+ch+(s%8==6?12:0);const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=mf(m);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(160,t+spb*1.8);const g=ac.createGain();env(g,t,.005,.32,spb*1.8);o.connect(f);f.connect(g);g.connect(mus);o.start(t);o.stop(t+spb*2)}
   const li=step%64;if(sg.lead&&mel[li]>=0&&((step>>6)%2===1||s%2===0)){const d=mel[li],oct=Math.floor(d/sg.scale.length),m=sg.root+24+ch+sg.scale[d%sg.scale.length]+12*oct;tone(t,sg.wave,mf(m),null,spb*1.4,.07,mus,.01)}
   step++;nextT+=spb}}
 S.music=(name)=>{if(song===name)return;song=name;step=0;if(!ac)return;nextT=ac.currentTime+.08;mel=genMel(SONGS[name]||SONGS.title)};
 setInterval(()=>{if(ac&&song)sched()},50);
 S.unlock=()=>{unlock();if(song&&ac&&!mel.length){mel=genMel(SONGS[song]);nextT=ac.currentTime+.08}};S.apply=apply;S.ctx=()=>ac;
 return S})();
// ---------- input ----------
const keys={};let menuBtns=[];
const ptr={down:false,id:-1,x:0,y:0,sx:0,sy:0,t0:0,lx:0,ly:0,lt:0,btn:null,moved:0};
function hitBtn(x,y){for(let i=menuBtns.length-1;i>=0;i--){const b=menuBtns[i];if(!b.dis&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)return b}return null}
cv.addEventListener('pointerdown',e=>{try{SND.unlock()}catch(_){}e.preventDefault();if(ptr.down&&e.pointerId!==ptr.id){// second finger: treat as tap on buttons only
  const b=hitBtn(e.clientX,e.clientY);if(b){b.press&&b.press(true);if(b.cb&&!b.hold)b.cb()}return}
 Object.assign(ptr,{down:true,id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,lx:e.clientX,ly:e.clientY,t0:performance.now(),lt:performance.now(),moved:0});
 ptr.btn=hitBtn(e.clientX,e.clientY);if(ptr.btn){ptr.btn.down=true;if(ptr.btn.press)ptr.btn.press(true);if(ptr.btn.instant&&ptr.btn.cb)ptr.btn.cb();return}
 try{cv.setPointerCapture(e.pointerId)}catch(_){}if(window.onPtr)onPtr('down',ptr)},{passive:false});
cv.addEventListener('pointermove',e=>{if(!ptr.down||e.pointerId!==ptr.id)return;ptr.lx=ptr.x;ptr.ly=ptr.y;ptr.x=e.clientX;ptr.y=e.clientY;ptr.moved=Math.max(ptr.moved,hyp(ptr.x-ptr.sx,ptr.y-ptr.sy));if(!ptr.btn&&window.onPtr)onPtr('move',ptr);ptr.lt=performance.now()},{passive:false});
function ptrUp(e){if(e.pointerId!==ptr.id){const b=hitBtn(e.clientX,e.clientY);if(b&&b.press)b.press(false);return}if(!ptr.down)return;ptr.down=false;ptr.x=e.clientX;ptr.y=e.clientY;
 if(ptr.btn){const b=ptr.btn;b.down=false;ptr.btn=null;if(b.press)b.press(false);const h=hitBtn(e.clientX,e.clientY);if(!b.instant&&e.type!=='pointercancel'&&h&&h.id===b.id&&h.cb){SND.blip();h.cb()}return}
 if(window.onPtr)onPtr(e.type==='pointercancel'?'cancel':'up',ptr)}
cv.addEventListener('pointerup',ptrUp);cv.addEventListener('pointercancel',ptrUp);
addEventListener('keydown',e=>{try{SND.unlock()}catch(_){}if(e.repeat&&keys[e.code])return;keys[e.code]=true;if(window.onKey&&onKey(e.code,true,e))e.preventDefault()});
addEventListener('keyup',e=>{keys[e.code]=false;if(window.onKey)onKey(e.code,false,e)});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
document.addEventListener('contextmenu',e=>e.preventDefault());
