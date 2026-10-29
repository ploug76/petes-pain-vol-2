/* rendering: parallax backdrops, every prop, Pete's ragdoll + outfits, effects, callouts */
'use strict';
const IMG={};for(const k of ['really','oof']){const i=new Image();i.src=ART[k];IMG[k]=i}
let BG=null;
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function txt(s,x,y,size,col,align,stroke,font){ctx.font=(font||'900 ')+size+'px '+FONT;ctx.textAlign=align||'center';ctx.textBaseline='middle';if(stroke!==false){ctx.lineJoin='round';ctx.lineWidth=Math.max(3,size*.2);ctx.strokeStyle=stroke||'rgba(10,10,30,.9)';ctx.strokeText(s,x,y)}ctx.fillStyle=col||'#fff';ctx.fillText(s,x,y)}
function wtxt(s,x,y,size,col,stroke){ctx.save();ctx.translate(x,y);ctx.scale(1/40,1/40);txt(s,0,0,size*40,col,'center',stroke);ctx.restore()}
function setScreen(){ctx.setTransform(DPR,0,0,DPR,0,0)}
let SHX=0,SHY=0;
function setWorld(){const z=cam.z*(1+punch*.04);ctx.setTransform(DPR*z,0,0,DPR*z,DPR*(W/2-cam.x*z+SHX),DPR*(H/2-cam.y*z+SHY))}
function w2s(x,y){const z=cam.z;return [W/2+(x-cam.x)*z,H/2+(y-cam.y)*z]}
function shade(hex,k){let c=hex.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>clamp(Math.round(k<0?v*(1+k):v+(255-v)*k),0,255);return 'rgb('+f(r)+','+f(g)+','+f(b)+')'}
// ---------- backdrop ----------
function makeBG(st){const R=mulberry(st.id.length*99+7);const L=[];for(const [f,sc,col,n] of [[.15,.55,st.far,1],[.4,.8,st.near,2]]){const bs=[];let x=-120;while(x<520){const w=4+R()*8,h=(st.id==='pier'?3+R()*6:8+R()*(st.id==='vegas'?26:20))*(n===1?1.25:1);bs.push({x,w,h,win:R(),top:R()});x+=w+R()*1.5}L.push({f,sc,col,bs})}
 const clouds=[];for(let i=0;i<14;i++)clouds.push({x:R()*600-100,y:R()*.35,s:.6+R()*1.1});const stars=[];for(let i=0;i<120;i++)stars.push({x:R(),y:R()*.7,s:R()});BG={st:st.id,L,clouds,stars}}
function drawBackdrop(st){setScreen();if(!BG||BG.st!==st.id)makeBG(st);const z=cam.z;const gY=H/2+(0-cam.y)*z;
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,st.sky[0]);g.addColorStop(1,st.sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 if(st.night){for(const s of BG.stars){ctx.fillStyle='rgba(255,255,255,'+(.3+.7*Math.abs(Math.sin(frameT*1.5+s.s*20)))+')';ctx.fillRect(s.x*W,s.y*H,1.5+s.s,1.5+s.s)}
  ctx.fillStyle='#fff6d0';ctx.beginPath();ctx.arc(W*.82,H*.14,Math.min(W,H)*.06,0,TAU);ctx.fill();ctx.fillStyle=st.sky[0];ctx.beginPath();ctx.arc(W*.82+Math.min(W,H)*.025,H*.13,Math.min(W,H)*.055,0,TAU);ctx.fill()}
 else{const sx=W*.8,sy=H*.15,sr=Math.min(W,H)*.07;const sg=ctx.createRadialGradient(sx,sy,sr*.3,sx,sy,sr*3);sg.addColorStop(0,'rgba(255,250,210,.95)');sg.addColorStop(.3,'rgba(255,240,180,.35)');sg.addColorStop(1,'rgba(255,240,180,0)');ctx.fillStyle=sg;ctx.fillRect(sx-sr*3,sy-sr*3,sr*6,sr*6);ctx.fillStyle='#fffbe0';ctx.beginPath();ctx.arc(sx,sy,sr,0,TAU);ctx.fill()
  for(const c of BG.clouds){const x=((c.x*30-cam.x*z*.05+frameT*6)%(W+400)+W+400)%(W+400)-200,y=c.y*H;ctx.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(x+i*28*c.s,y+(i%2)*-10*c.s,34*c.s,20*c.s,0,0,TAU);ctx.fill()}}}
 for(const l of BG.L){const k=z*l.sc*.5,base=lerp(H*.92,gY,l.f*1.6);const ox=W/2-cam.x*l.f*z*.5;ctx.fillStyle=l.col;
  for(const b of l.bs){const x=ox+b.x*k,w=b.w*k;if(x>W||x+w<0)continue;const h=b.h*k;ctx.fillStyle=l.col;ctx.fillRect(x,base-h,w+1,h+2);
   if(b.top>.7){ctx.fillRect(x+w*.4,base-h-k*2,w*.2,k*2)}
   if(st.night||l.f>.3){ctx.fillStyle=st.night?'rgba(255,220,120,.55)':'rgba(255,255,255,.18)';const ws=Math.max(2,k*.7);for(let yy=base-h+k;yy<base-k;yy+=k*1.6)for(let xx=x+k*.6;xx<x+w-k*.6;xx+=k*1.3){if(((xx*7+yy*3)|0)%5<(st.night?2:3))ctx.fillRect(xx,yy,ws,ws)}}}}
 if(st.night){const ng=ctx.createLinearGradient(0,gY-H*.3,0,gY);ng.addColorStop(0,'rgba(255,60,200,0)');ng.addColorStop(1,'rgba(255,80,200,.18)');ctx.fillStyle=ng;ctx.fillRect(0,gY-H*.3,W,H*.3)}
 if(st.sea){ctx.fillStyle='#2b8fc7';ctx.fillRect(0,gY-z*1.2,W,H);ctx.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<20;i++){const x=((i*97-cam.x*z*.3+frameT*20)%W+W)%W;ctx.fillRect(x,gY-z*1.2+((i*13)%5)*4,30,2)}}}
// ---------- deco ----------
function drawDeco(st,layer){for(const d of DECO){if(d.x>cam.x+W/cam.z*.6+20||d.x+(d.w||4)<cam.x-W/cam.z*.6-20)continue;ctx.save();
 switch(d.t){
 case 'office':if(layer!==0)break;{ctx.fillStyle=shade(d.col,-.45);ctx.fillRect(d.x,-d.h,d.w,d.h);for(let f=0;f<d.floors;f++){const y=-f*3.4-3.2;ctx.fillStyle=st.night?'rgba(255,230,150,.35)':'rgba(255,255,255,.12)';ctx.fillRect(d.x+.3,y+.4,d.w-.9,2.4);ctx.fillStyle='rgba(0,0,0,.25)';for(let x=d.x+1.2;x<d.x+d.w-.6;x+=1.6){ctx.fillRect(x,y+1.6,.9,.08)}
   ctx.fillStyle=shade(d.col,-.25);ctx.fillRect(d.x+d.w-1.2,y+.9,.5,1.1)}
  if(d.sign){ctx.fillStyle='#222';ctx.fillRect(d.x+.4,-d.h-1.3,d.w-.8,1.1);wtxt(d.sign,d.x+d.w/2,-d.h-.75,d.sign.length>12?.42:.55,st.night?'#ff6be6':'#ffd23a',false)}}break;
 case 'tree':if(layer!==0)break;ctx.fillStyle='#6b4a2b';ctx.fillRect(d.x-.12,-2.2,.24,2.2);ctx.fillStyle=st.night?'#1d4a3a':'#3f9b4a';ctx.beginPath();ctx.arc(d.x,-2.6,1,0,TAU);ctx.arc(d.x-.6,-2.1,.7,0,TAU);ctx.arc(d.x+.6,-2.1,.7,0,TAU);ctx.fill();break;
 case 'palm':if(layer!==0)break;ctx.strokeStyle='#8a6038';ctx.lineWidth=.3;ctx.beginPath();ctx.moveTo(d.x,0);ctx.quadraticCurveTo(d.x+.6,-2.5,d.x+.3,-5);ctx.stroke();ctx.strokeStyle='#2e9b4f';ctx.lineWidth=.25;for(let i=0;i<6;i++){const a=i/6*TAU+Math.sin(frameT+i)*.08;ctx.beginPath();ctx.moveTo(d.x+.3,-5);ctx.quadraticCurveTo(d.x+.3+Math.cos(a)*1.2,-5.6+Math.sin(a)*.5,d.x+.3+Math.cos(a)*2,-4.6+Math.sin(a)*.8);ctx.stroke()}break;
 case 'cafe':if(layer!==0)break;ctx.fillStyle='#c97b4a';ctx.fillRect(d.x,-4.2,d.w,4.2);ctx.fillStyle='#ffe9c9';ctx.fillRect(d.x+.4,-2.6,d.w-.8,1.9);ctx.fillStyle='#5a2d14';ctx.fillRect(d.x,-4.6,d.w,.5);wtxt('CAFÉ',d.x+d.w/2,-4.35,.4,'#fff',false);break;
 case 'bench':if(layer!==0)break;ctx.fillStyle='#7a4a2a';ctx.fillRect(d.x-1,-.6,2,.15);ctx.fillRect(d.x-.9,-.6,.1,.6);ctx.fillRect(d.x+.8,-.6,.1,.6);break;
 case 'bbpost':if(layer!==0)break;ctx.fillStyle='#555';ctx.fillRect(d.x-2.6,d.y-d.h,.3,d.h);ctx.fillRect(d.x+2.3,d.y-d.h,.3,d.h);break;
 case 'sling':break;
 case 'cranebg':if(layer!==0)break;break;
 case 'cranearm':if(layer!==0)break;ctx.strokeStyle='#e0a800';ctx.lineWidth=.25;ctx.strokeRect(d.x-d.len,d.y-.5,d.len+4,1);for(let x=d.x-d.len;x<d.x+4;x+=1){ctx.beginPath();ctx.moveTo(x,d.y-.5);ctx.lineTo(x+1,d.y+.5);ctx.stroke()}ctx.fillStyle='#555';ctx.fillRect(d.x+2,d.y-.2,2,1.6);break;
 case 'sea':break;
 case 'pierdeck':if(layer!==0)break;ctx.fillStyle='#7a5230';for(let x=d.x;x<st.x1-15;x+=3)ctx.fillRect(x,0,.3,6);break;
 case 'lifeguard':if(layer!==0)break;ctx.fillStyle='#e8e8e8';ctx.fillRect(d.x-.8,-4,1.6,1.4);ctx.fillStyle='#e74c3c';ctx.fillRect(d.x-1,-4.4,2,.4);ctx.strokeStyle='#ccc';ctx.lineWidth=.12;ctx.beginPath();ctx.moveTo(d.x-.7,-2.6);ctx.lineTo(d.x-1,0);ctx.moveTo(d.x+.7,-2.6);ctx.lineTo(d.x+1,0);ctx.stroke();break;
 case 'stand':if(layer!==0)break;ctx.fillStyle='#ffd9ef';ctx.fillRect(d.x-1.4,-2.5,2.8,2.5);ctx.fillStyle='#ff5fa2';ctx.fillRect(d.x-1.5,-2.8,3,.35);wtxt(d.t2||'',d.x,-1.6,.26,'#b3125f',false);break;
 case 'strip':break;
 case 'fountain':if(layer!==0)break;ctx.fillStyle='#bfb6d6';ctx.fillRect(d.x-d.w/2-.3,-1,.3,1);ctx.fillRect(d.x+d.w/2,-1,.3,1);break;
 case 'lane':if(layer!==0)break;break}
 ctx.restore()}}
// ---------- entities ----------
function drawGround(st){const x0=cam.x-W/cam.z,x1=cam.x+W/cam.z;ctx.fillStyle=st.ground;ctx.fillRect(x0,0,x1-x0,60);ctx.fillStyle=st.walk;ctx.fillRect(x0,0,x1-x0,.28);
 if(st.id==='city'||st.id==='vegas'){ctx.fillStyle=st.night?'#ffd84a':'#f4f4f4';for(let x=Math.floor(x0/4)*4;x<x1;x+=4)ctx.fillRect(x,1.1,2,.14)}
 if(st.id==='pier'){ctx.fillStyle='#b98654';ctx.fillRect(x0,0,x1-x0,.5);ctx.fillStyle='rgba(0,0,0,.18)';for(let x=Math.floor(x0);x<x1;x+=1)ctx.fillRect(x,0,.05,.5);ctx.fillStyle='#2b8fc7';ctx.fillRect(x0,.5,x1-x0,60)}
 if(st.id==='lane'){ctx.fillStyle='#d9a55d';ctx.fillRect(4,-.0,st.x1-14,.35);ctx.fillStyle='rgba(120,70,20,.25)';for(let x=4;x<st.x1-10;x+=.9)ctx.fillRect(x,0,.04,.35);ctx.fillStyle='#c0392b';for(let i=0;i<7;i++){const x=20+i*1.4;ctx.beginPath();ctx.moveTo(x,.1);ctx.lineTo(x+.35,.3);ctx.lineTo(x-.35,.3);ctx.fill()}}
 for(const s of SCORCH){if(s.y<-.7)continue;ctx.fillStyle='rgba(20,15,10,.35)';ctx.beginPath();ctx.ellipse(s.x,s.y>-.5?.05:s.y,s.r,.25,0,0,TAU);ctx.fill()}}
function body2(e,fn){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.a);fn();ctx.restore()}
function drawEnt(e,st){if(!e.alive||e.rHide)return;const k=e.kind;switch(k){
 case 'ground':case 'water':case 'ferris':return;
 case 'tower':ctx.fillStyle='#8c4a3a';ctx.fillRect(e.x-e.hw,e.y-e.hh,e.hw*2,e.hh*2);ctx.fillStyle='rgba(0,0,0,.18)';for(let y=e.y-e.hh;y<e.y+e.hh;y+=.5)for(let x=e.x-e.hw+((y*2|0)%2)*.5;x<e.x+e.hw;x+=1)ctx.fillRect(x,y,.95,.45);ctx.fillStyle='#5a2f25';ctx.fillRect(e.x-e.hw-.2,e.y-e.hh-.3,e.hw*2+.4,.4);
  wtxt('PETE',e.x,e.y-e.hh*.4,.75,'#ffd23a');wtxt('LAUNCH CO.',e.x,e.y-e.hh*.4+.8,.35,'#fff');return;
 case 'building':drawBuilding(e,st);return;
 case 'glass':body2(e,()=>{ctx.fillStyle=e.gold?'rgba(255,240,170,.35)':'rgba(170,225,255,.42)';ctx.fillRect(-e.hw,-e.hh,e.hw*2,e.hh*2);ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=.04;ctx.beginPath();ctx.moveTo(-e.hw,-e.hh*.6);ctx.lineTo(e.hw,-e.hh*.9);ctx.stroke();
  if(e.gold){ctx.strokeStyle='#e7b416';ctx.lineWidth=.14;ctx.strokeRect(-e.hw-.07,-e.hh-.07,e.hw*2+.14,e.hh*2+.14);const p=1+Math.sin(frameT*5)*.15;ctx.strokeStyle='rgba(255,215,60,.5)';ctx.lineWidth=.06;ctx.strokeRect(-e.hw-.3*p,-e.hh-.3*p,e.hw*2+.6*p,e.hh*2+.6*p)}
  if(e.booth){ctx.fillStyle='#c0392b';ctx.fillRect(-e.hw,-e.hh,e.hw*2,.3);ctx.fillRect(-e.hw,e.hh-.2,e.hw*2,.2);ctx.fillRect(-e.hw,-e.hh,.08,e.hh*2);ctx.fillRect(e.hw-.08,-e.hh,.08,e.hh*2);wtxt('PHONE',0,-e.hh+.15,.18,'#fff',false)}});return;
 case 'crate':body2(e,()=>{const s=e.hw;if(e.style==='table'){ctx.fillStyle='#eee';ctx.fillRect(-s,-s,s*2,.12);ctx.fillRect(-.05,-s,.1,s*2);ctx.fillRect(-s*.6,s-.08,s*1.2,.08);return}
  ctx.fillStyle=e.confetti?e.col:e.style==='file'?'#d8c49a':'#c8914b';rr(-s,-s,s*2,s*2,.06);ctx.fill();ctx.strokeStyle='rgba(60,30,10,.6)';ctx.lineWidth=.06;ctx.stroke();
  if(e.confetti){wtxt('?',0,0,s*1.3,'#fff')}else if(e.style==='file'){ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-s*.4,-s*.6,s*.8,s*.18)}else{ctx.beginPath();ctx.moveTo(-s,-s);ctx.lineTo(s,s);ctx.moveTo(s,-s);ctx.lineTo(-s,s);ctx.stroke();ctx.strokeRect(-s*.85,-s*.85,s*1.7,s*1.7)}});return;
 case 'barrel':body2(e,()=>{const w=e.hw,h=e.hh;if(e.tnt||e.fuseBox){ctx.fillStyle=e.fuseBox?'#ff8a1a':'#c0392b';rr(-w,-h,w*2,h*2,.06);ctx.fill();ctx.strokeStyle='#4a1010';ctx.lineWidth=.06;ctx.stroke();wtxt(e.fuseBox?'FUSE':'BOOM',0,0,w*.62,'#fff');
   if(e.fuseBox&&e.fuse>0){ctx.strokeStyle='#333';ctx.lineWidth=.05;ctx.beginPath();ctx.moveTo(0,-h);ctx.quadraticCurveTo(.2,-h-.3,.1,-h-.45);ctx.stroke();if(Math.random()<.6)fx('spark',e.x+rnd(-.1,.1),e.y-h-.45,{vx:rnd(-2,2),vy:rnd(-3,0),life:.25,size:.05,g:0,col:'#ffe066'})}return}
  ctx.fillStyle=e.fireworks?'#7a2cff':'#d63a2a';rr(-w,-h,w*2,h*2,.12);ctx.fill();ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-w,-h*.55,w*2,.08);ctx.fillRect(-w,h*.45,w*2,.08);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(-w*.7,-h*.9,.12,h*1.8);
  ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.moveTo(0,-h*.32);ctx.lineTo(w*.42,h*.3);ctx.lineTo(-w*.42,h*.3);ctx.closePath();ctx.fill();wtxt('!',0,h*.06,.32,'#111',false)});return;
 case 'pad':body2(e,()=>{const w=e.hw,sq=e.squash;if(e.awning){ctx.fillStyle=e.col;ctx.beginPath();ctx.moveTo(-w,-.08+sq*.15);ctx.quadraticCurveTo(0,.25*sq-.08,w,-.08+sq*.15);ctx.lineTo(w,.1);ctx.lineTo(-w,.1);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';for(let x=-w;x<w;x+=.5)ctx.fillRect(x,-.08,.25,.18);
   ctx.fillStyle='#fff';for(let x=-w;x<w;x+=.5){ctx.beginPath();ctx.arc(x+.25,.1,.25,0,Math.PI);ctx.fill()}return}
  if(e.jet){ctx.fillStyle='#bfb6d6';ctx.fillRect(-w,-.1,w*2,.3);const hgt=1.5+Math.sin(frameT*6+e.x)*.3+sq*2;const g=ctx.createLinearGradient(0,-hgt,0,0);g.addColorStop(0,'rgba(200,240,255,0)');g.addColorStop(1,'rgba(200,240,255,.8)');ctx.fillStyle=g;ctx.fillRect(-.18,-hgt,.36,hgt);return}
  if(e.sand){ctx.fillStyle='#d9b26a';ctx.beginPath();ctx.ellipse(0,.4,w*1.1,.9-sq*.2,0,Math.PI,TAU);ctx.fill();return}
  ctx.fillStyle='#333';ctx.fillRect(-w,.05,.12,.55);ctx.fillRect(w-.12,.05,.12,.55);ctx.fillStyle='#2a7be0';ctx.fillRect(-w,-.05,w*2,.2);ctx.fillStyle='#111';ctx.beginPath();ctx.moveTo(-w+.1,0);ctx.quadraticCurveTo(0,sq*.5,w-.1,0);ctx.lineTo(w-.1,.08);ctx.quadraticCurveTo(0,sq*.5+.08,-w+.1,.08);ctx.fill();
  ctx.strokeStyle='#ffd23a';ctx.lineWidth=.05;for(let x=-w+.15;x<w;x+=.3){ctx.beginPath();ctx.moveTo(x,-.05);ctx.lineTo(x+.15,.1);ctx.stroke()}if(e.label)wtxt(e.label,0,.42,.22,'#fff')});return;
 case 'pole':ctx.fillStyle=e.col||'#4a4f57';ctx.fillRect(e.x-e.hw,e.y-e.hh,e.hw*2,e.hh*2);if(e.lamp){ctx.fillRect(e.x,e.y-e.hh,.9,.12);ctx.fillStyle=st.night?'#fff3b0':'#ddd';ctx.beginPath();ctx.ellipse(e.x+.85,e.y-e.hh+.15,.3,.14,0,0,TAU);ctx.fill();
  if(st.night){const g=ctx.createRadialGradient(e.x+.85,e.y-e.hh+.3,.1,e.x+.85,e.y-e.hh+2,3);g.addColorStop(0,'rgba(255,240,170,.35)');g.addColorStop(1,'rgba(255,240,170,0)');ctx.fillStyle=g;ctx.fillRect(e.x-2.5,e.y-e.hh,6.6,6)}}return;
 case 'sign':body2(e,()=>{const w=e.hw,h=e.hh;if(e.vegas){ctx.fillStyle=e.col;ctx.beginPath();ctx.moveTo(0,-h*1.2);ctx.lineTo(w*1.05,0);ctx.lineTo(0,h*1.2);ctx.lineTo(-w*1.05,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#d6286f';ctx.lineWidth=.08;ctx.stroke();
   for(let i=0;i<16;i++){const t=i/16;const on=((i+Math.floor(frameT*8))%3)===0;ctx.fillStyle=on?'#fff':'#ffcf3a';const pts=[[0,-h*1.2],[w*1.05,0],[0,h*1.2],[-w*1.05,0]];const s=Math.floor(t*4),f=t*4-s,a=pts[s],b=pts[(s+1)%4];ctx.beginPath();ctx.arc(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,.07,0,TAU);ctx.fill()}
   wtxt('WELCOME TO',0,-h*.45,.22,'#1c7ac9',false);wtxt("PETE'S",0,0,.42,e.fg,false);wtxt('VEGAS',0,h*.45,.36,e.fg,false);return}
  ctx.fillStyle=e.col;rr(-w,-h,w*2,h*2,.12);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=.07;ctx.stroke();if(st.night){ctx.shadowColor=e.col;ctx.shadowBlur=20}wtxt(e.text,0,0,Math.min(h*1.05,w*2.6/Math.max(4,e.text.length)*1.6),e.fg||'#fff',false);ctx.shadowBlur=0});return;
 case 'car':drawCar(e);return;
 case 'wheel':body2(e,()=>{ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(0,0,e.r,0,TAU);ctx.fill();ctx.fillStyle='#bbb';ctx.beginPath();ctx.arc(0,0,e.r*.5,0,TAU);ctx.fill();ctx.strokeStyle='#666';ctx.lineWidth=.05;ctx.beginPath();ctx.moveTo(-e.r*.5,0);ctx.lineTo(e.r*.5,0);ctx.moveTo(0,-e.r*.5);ctx.lineTo(0,e.r*.5);ctx.stroke()});return;
 case 'npc':drawNpc(e,st);return;
 case 'raccoon':body2(e,()=>{const b=e.bonked?0:Math.abs(Math.sin(e.taunt*6))*.12;ctx.translate(0,-b);ctx.scale(e.face,1);ctx.fillStyle='#7d7d85';ctx.beginPath();ctx.ellipse(-.05,0,.36,.3,0,0,TAU);ctx.fill();
  ctx.strokeStyle='#5a5a62';ctx.lineWidth=.16;ctx.beginPath();ctx.moveTo(-.3,.05);ctx.quadraticCurveTo(-.7,-.1+Math.sin(e.taunt*8)*.15,-.75,-.45);ctx.stroke();ctx.strokeStyle='#2a2a2e';ctx.lineWidth=.07;for(const t of [.3,.55,.8]){ctx.beginPath();ctx.arc(-.3-t*.45,-.1-t*.3,.08,0,TAU);ctx.stroke()}
  ctx.fillStyle='#8d8d95';ctx.beginPath();ctx.arc(.25,-.25,.22,0,TAU);ctx.fill();ctx.fillStyle='#222';ctx.fillRect(.08,-.32,.36,.1);ctx.fillStyle='#fff';ctx.fillRect(.17,-.31,.06,.06);ctx.fillRect(.33,-.31,.06,.06);ctx.fillStyle='#111';ctx.beginPath();ctx.arc(.46,-.2,.05,0,TAU);ctx.fill();
  ctx.fillStyle='#7d7d85';ctx.beginPath();ctx.moveTo(.12,-.42);ctx.lineTo(.18,-.56);ctx.lineTo(.26,-.43);ctx.fill();if(!e.bonked){ctx.fillStyle='#ff9ac1';ctx.beginPath();ctx.ellipse(.42,-.1,.05,.03+Math.abs(Math.sin(e.taunt*10))*.04,0,0,TAU);ctx.fill()}});
  if(!e.bonked&&Math.sin(e.taunt*1.3)>.6)wtxt('NYAH!',e.x,e.y-1.1,.3,'#fff');return;
 case 'pin':body2(e,()=>{ctx.fillStyle='#fafafa';ctx.beginPath();ctx.moveTo(-.13,-.85);ctx.quadraticCurveTo(-.22,-.6,-.14,-.25);ctx.quadraticCurveTo(-.34,.25,-.18,.85);ctx.lineTo(.18,.85);ctx.quadraticCurveTo(.34,.25,.14,-.25);ctx.quadraticCurveTo(.22,-.6,.13,-.85);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=.03;ctx.stroke();
  ctx.fillStyle='#d62c2c';ctx.fillRect(-.16,-.42,.32,.06);ctx.fillRect(-.17,-.33,.34,.06)});return;
 case 'donut':body2(e,()=>{const r=e.r;ctx.fillStyle='#d9a05b';ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.fillStyle='#ff8fc8';ctx.beginPath();for(let i=0;i<=24;i++){const a=i/24*TAU,rr2=r*(.9+Math.sin(i*2.3)*.05);ctx.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}ctx.fill();
  const col=['#fff','#ffe14d','#4dd2ff','#7dff7a','#ff4d4d'];for(let i=0;i<28;i++){const a=i*2.4,d=r*(.45+(i%5)*.09);ctx.fillStyle=col[i%5];ctx.save();ctx.translate(Math.cos(a)*d,Math.sin(a)*d);ctx.rotate(a*3);ctx.fillRect(-.09,-.025,.18,.05);ctx.restore()}
  ctx.fillStyle=st.sky[1];ctx.beginPath();ctx.arc(0,0,r*.32,0,TAU);ctx.fill();ctx.strokeStyle='rgba(120,60,20,.5)';ctx.lineWidth=.05;ctx.stroke()});
  if(e.joint){const a=e.joint.getAnchorA();ctx.strokeStyle='#555';ctx.lineWidth=.08;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x,a.y-.3);ctx.stroke()}return;
 case 'wball':ctx.strokeStyle='#444';ctx.lineWidth=.1;ctx.setLineDash([.25,.12]);ctx.beginPath();ctx.moveTo(e.ax,e.ay);ctx.lineTo(e.x,e.y);ctx.stroke();ctx.setLineDash([]);body2(e,()=>{const g=ctx.createRadialGradient(-.3,-.3,.1,0,0,e.r);g.addColorStop(0,'#777');g.addColorStop(1,'#1e1e1e');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,e.r,0,TAU);ctx.fill()});return;
 case 'gondola':body2(e,()=>{ctx.fillStyle=e.col;rr(-e.hw,-e.hh,e.hw*2,e.hh*2,.15);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(-e.hw*.7,-e.hh*.6,e.hw*1.4,e.hh*.6)});return;
 case 'girder':body2(e,()=>{ctx.fillStyle='#d35400';ctx.fillRect(-e.hw,-e.hh,e.hw*2,e.hh*2);ctx.fillStyle='#a04000';ctx.fillRect(-e.hw,-e.hh*.25,e.hw*2,e.hh*.5);ctx.fillStyle='#333';for(let x=-e.hw+.3;x<e.hw;x+=.8){ctx.beginPath();ctx.arc(x,0,.05,0,TAU);ctx.fill()}});return;
 case 'porta':body2(e,()=>{if(e.booth){ctx.fillStyle='#c0392b';ctx.fillRect(-e.hw,-e.hh,e.hw*2,e.hh*2);ctx.fillStyle='rgba(180,230,255,.7)';ctx.fillRect(-e.hw*.7,-e.hh*.75,e.hw*1.4,e.hh*1.3);wtxt('PHONE',0,-e.hh*.88,.18,'#fff',false);return}
  ctx.fillStyle='#2f80ed';rr(-e.hw,-e.hh,e.hw*2,e.hh*2,.15);ctx.fill();ctx.fillStyle='#1c5fbf';ctx.fillRect(-e.hw*.75,-e.hh*.75,e.hw*1.5,e.hh*1.65);ctx.fillStyle=e.occ?'#e74c3c':'#2ecc71';ctx.fillRect(-.3,-e.hh*.6,.6,.18);wtxt(e.occ?'BUSY':'FREE',0,-e.hh*.6+.09,.13,'#fff',false);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-e.hh*.85,.06,0,TAU);ctx.fill()});return;
 case 'dice':body2(e,()=>{ctx.fillStyle='#fff';rr(-e.hw,-e.hh,e.hw*2,e.hh*2,.12);ctx.fill();ctx.strokeStyle='#c00';ctx.lineWidth=.04;ctx.stroke();ctx.fillStyle='#c00';const P6={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};for(const [px,py] of P6[e.pips]){ctx.beginPath();ctx.arc(px*e.hw*.5,py*e.hw*.5,.08,0,TAU);ctx.fill()}});return;
 case 'slot':{const x=e.x,y=e.y,w=e.hw,h=e.hh;ctx.fillStyle='#b8860b';rr(x-w,y-h,w*2,h*2,.15);ctx.fill();ctx.fillStyle='#ffd700';ctx.fillRect(x-w+.08,y-h+.08,w*2-.16,.3);ctx.fillStyle='#fff';ctx.fillRect(x-w*.8,y-h*.45,w*1.6,h*.5);
  const sy=['7','🍒','★','BAR'];for(let i=0;i<3;i++){const s=sy[Math.floor(frameT*(e.cd>0?14:.4)+i*7+e.id)%4];wtxt(s,x-w*.55+i*w*.55,y-h*.2,.26,'#c00',false)}ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.arc(x+w+.15,y-h*.5,.14,0,TAU);ctx.fill();ctx.strokeStyle='#999';ctx.lineWidth=.06;ctx.beginPath();ctx.moveTo(x+w+.15,y-h*.5);ctx.lineTo(x+w+.15,y);ctx.stroke();
  for(let i=0;i<6;i++){ctx.fillStyle=((i+Math.floor(frameT*6))%2)?'#fff':'#ff3fa4';ctx.beginPath();ctx.arc(x-w+.15+i*(w*2-.3)/5,y-h-.05,.06,0,TAU);ctx.fill()}}return;
 case 'target':if(e.hit)return;{const p=1+Math.sin(frameT*4+e.id)*.06;ctx.save();ctx.translate(e.x,e.y);ctx.scale(p,p);for(let i=4;i>0;i--){ctx.fillStyle=i%2?'#e63946':'#fff';ctx.beginPath();ctx.arc(0,0,e.r*i/4,0,TAU);ctx.fill()}ctx.restore()}return;
 case 'cushion':{const x=e.x,y=e.y,w=e.hw;ctx.fillStyle='#ff6b6b';rr(x-w,y-e.hh-.2,w*2,e.hh*2+.2,.4);ctx.fill();ctx.fillStyle='#fff';for(let i=-2;i<=2;i++){ctx.fillRect(x+i*w*.4-.05,y-e.hh-.1,.1,e.hh*2)}wtxt('SOFT LANDING',x,y,.32,'#fff');const p=.5+.5*Math.sin(frameT*4);ctx.strokeStyle='rgba(255,255,255,'+p+')';ctx.lineWidth=.08;ctx.beginPath();ctx.moveTo(x,y-e.hh-3);ctx.lineTo(x,y-e.hh-1.2);ctx.lineTo(x-.4,y-e.hh-1.6);ctx.moveTo(x,y-e.hh-1.2);ctx.lineTo(x+.4,y-e.hh-1.6);ctx.stroke()}return;
 case 'debris':body2(e,()=>{ctx.globalAlpha=clamp(e.life,0,1);ctx.fillStyle=e.col;ctx.fillRect(-e.hw,-e.hh,e.hw*2,e.hh*2);ctx.globalAlpha=1});return;
 case 'pete':return;
 default:if(e.hw)body2(e,()=>{ctx.fillStyle=e.col||'#888';ctx.fillRect(-e.hw,-e.hh,e.hw*2,e.hh*2)})}}
function drawBuilding(e,st){const x=e.x-e.hw,y=e.y-e.hh,w=e.hw*2,h=e.hh*2;const s=e.style;
 if(s==='slab'){ctx.fillStyle='#9a9a9a';ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(x,y+h*.6,w,h*.4);return}
 if(s==='wall'){ctx.fillStyle=e.col;ctx.fillRect(x,y,w,h);return}
 if(s==='billboard'){ctx.fillStyle='#444';ctx.fillRect(x-.15,y-.15,w+.3,h+.3);ctx.fillStyle=e.col;ctx.fillRect(x,y,w,h);wtxt(e.text,e.x,e.y-.25,.62,'#c2185b',false);wtxt('ALWAYS FRESH, NEVER STALE',e.x,e.y+.55,.26,'#7a4a2a',false);return}
 if(s==='shelter'){ctx.fillStyle=e.col;ctx.fillRect(x,y,w,h);ctx.fillRect(x+.1,y,.08,2.65);ctx.fillRect(x+w-.18,y,.08,2.65);return}
 if(s==='beam'||s==='crane'){ctx.fillStyle=e.col;ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=.05;if(h>w){for(let yy=y;yy<y+h;yy+=.8){ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy+.8);ctx.stroke()}}return}
 if(s==='scaff'){ctx.fillStyle='#8b8b8b';ctx.fillRect(x,y,w,h);return}
 if(s==='plank'){ctx.fillStyle=e.col;ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(0,0,0,.2)';for(let xx=x;xx<x+w;xx+=1.2)ctx.fillRect(xx,y,.04,h);return}
 if(s==='lane'){return}
 ctx.fillStyle=e.col;ctx.fillRect(x,y,w,h);
 if(s==='trailer'){ctx.fillStyle='#6fa8dc';ctx.fillRect(x+.5,y+.5,1.2,.8);ctx.fillRect(x+2.4,y+.5,1.2,.8);ctx.fillStyle='#555';ctx.fillRect(x+3.9,y+.6,.7,h-.6);wtxt('SITE OFFICE',e.x,y+.25,.28,'#333',false);return}
 if(s==='tank'){ctx.fillStyle='#fff';wtxt('DUNK TANK',e.x,e.y,.32,'#fff');return}
 if(s==='chapel'){ctx.fillStyle='#ffb3d1';ctx.beginPath();ctx.moveTo(x-.2,y);ctx.lineTo(e.x,y-1.4);ctx.lineTo(x+w+.2,y);ctx.fill();ctx.fillStyle='#ffd23a';ctx.fillRect(e.x-.05,y-2.2,.1,.8);ctx.fillRect(e.x-.25,y-1.95,.5,.1);ctx.fillStyle='#7a3b5a';ctx.fillRect(e.x-.4,y+h-1.4,.8,1.4);return}
 if(s==='ferrispost'){ctx.fillStyle='#ccc';ctx.beginPath();ctx.moveTo(e.x,y);ctx.lineTo(e.x-3,y+h);ctx.lineTo(e.x-2.6,y+h);ctx.lineTo(e.x,y+.6);ctx.lineTo(e.x+2.6,y+h);ctx.lineTo(e.x+3,y+h);ctx.closePath();ctx.fill();return}
 if(s==='pinback'){ctx.fillStyle='#222';ctx.fillRect(x-6,y-3,w+6,h+3);return}
 // windows
 if(e.win){const night=st.night;for(let yy=y+.6;yy<y+h-.8;yy+=1.6)for(let xx=x+.45;xx<x+w-.6;xx+=1.2){const lit=night?(((xx*13+yy*7)|0)%3!==0):false;ctx.fillStyle=lit?'#ffe9a0':night?'#2a2340':'rgba(220,240,255,.75)';ctx.fillRect(xx,yy,.7,.9);if(!night){ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(xx,yy,.15,.9)}}}
 ctx.fillStyle=shade(e.col,-.3);ctx.fillRect(x-.12,y-.25,w+.24,.3);ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(x+w-.35,y,.35,h)}
function drawCar(e){body2(e,()=>{const hw=e.hw,hh=e.hh;ctx.fillStyle=e.col;ctx.beginPath();ctx.moveTo(-hw,hh*.2);ctx.lineTo(-hw,-hh*.6);ctx.lineTo(-hw*.45,-hh*.7);ctx.lineTo(-hw*.25,-hh*1.9);ctx.lineTo(hw*.35,-hh*1.9);ctx.lineTo(hw*.6,-hh*.7);ctx.lineTo(hw,-hh*.5);ctx.lineTo(hw,hh*.2);ctx.closePath();ctx.fill();
 ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=.06;ctx.stroke();ctx.fillStyle='rgba(180,225,255,.85)';ctx.beginPath();ctx.moveTo(-hw*.38,-hh*.75);ctx.lineTo(-hw*.2,-hh*1.7);ctx.lineTo(hw*.05,-hh*1.7);ctx.lineTo(hw*.05,-hh*.75);ctx.fill();ctx.beginPath();ctx.moveTo(hw*.12,-hh*.75);ctx.lineTo(hw*.12,-hh*1.7);ctx.lineTo(hw*.32,-hh*1.7);ctx.lineTo(hw*.52,-hh*.75);ctx.fill();
 if(e.truck==='mixer'){ctx.fillStyle='#bbb';ctx.beginPath();ctx.ellipse(-hw*.2,-hh*1.6,hw*.7,hh*1.1,-.2,0,TAU);ctx.fill();ctx.strokeStyle='#888';ctx.lineWidth=.08;for(let i=0;i<4;i++){const o=((frameT*.8+i*.25)%1)*hw*1.2-hw*.8;ctx.beginPath();ctx.moveTo(o,-hh*2.5);ctx.lineTo(o+.4,-hh*.7);ctx.stroke()}}
 const fwd=e.dir>0?1:-1;ctx.fillStyle='#fff7b0';ctx.fillRect(fwd>0?hw-.12:-hw,-hh*.4,.12,.22);ctx.fillStyle='#ff4040';ctx.fillRect(fwd>0?-hw:hw-.12,-hh*.4,.12,.2);
 if(e.alarm>0&&Math.floor(frameT*6)%2){ctx.fillStyle='rgba(255,200,0,.8)';ctx.beginPath();ctx.arc(fwd*hw,-hh*.3,.35,0,TAU);ctx.fill()}});}
function drawNpc(e,st){body2(e,()=>{ctx.scale(e.face,1);const cower=e.look&&!e.down;const bob=e.down?0:Math.sin(frameT*3+e.id)*.02;
 if(e.balloon&&!e.down){ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=.03;const cols=['#ff4d6d','#ffd23a','#4dd2ff','#7dff7a','#c77dff'];for(let i=0;i<5;i++){const bx=(i-2)*.35,by=-2.6-Math.abs(i-2)*.2;ctx.beginPath();ctx.moveTo(0,-.4);ctx.lineTo(bx,by+.35);ctx.stroke();ctx.fillStyle=cols[i];ctx.beginPath();ctx.ellipse(bx,by,.3,.38,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(bx-.1,by-.12,.07,0,TAU);ctx.fill()}}
 // legs
 const pants=e.mime?'#111':e.elvis?'#fff':e.type==='worker'?'#3b5998':'#34495e';ctx.fillStyle=pants;const lk=e.down?0:Math.sin(frameT*2+e.id)*.03;ctx.fillRect(-.2,.25,.17,.45+lk);ctx.fillRect(.03,.25,.17,.45-lk);ctx.fillStyle='#222';ctx.fillRect(-.22,.66,.22,.1);ctx.fillRect(.03,.66,.24,.1);
 // torso
 ctx.fillStyle=e.shirt;rr(-.25,-.4+bob,.5,.7,.12);ctx.fill();if(e.mime){ctx.fillStyle='#111';for(let y=-.32;y<.28;y+=.16)ctx.fillRect(-.25,y+bob,.5,.07)}
 if(e.elvis){ctx.fillStyle='#ffd23a';ctx.fillRect(-.25,.12,.5,.08);ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.moveTo(-.25,-.4);ctx.lineTo(0,-.1);ctx.lineTo(.25,-.4);ctx.stroke()}
 if(e.type==='worker'){ctx.fillStyle='#d9ff3a';ctx.fillRect(-.25,-.1,.5,.07)}
 // arms
 ctx.strokeStyle=e.mime?'#fff':e.skin;ctx.lineWidth=.11;ctx.lineCap='round';ctx.beginPath();if(cower){ctx.moveTo(.15,-.3);ctx.lineTo(.3,-.75);ctx.moveTo(-.15,-.3);ctx.lineTo(-.05,-.8)}else if(e.mime&&!e.down){const t=frameT*2;ctx.moveTo(.15,-.3);ctx.lineTo(.45,-.45+Math.sin(t)*.1);ctx.moveTo(-.15,-.3);ctx.lineTo(.4,-.25+Math.cos(t)*.1)}else{ctx.moveTo(.18,-.3);ctx.lineTo(.26,.15);ctx.moveTo(-.18,-.3);ctx.lineTo(-.26,.15)}ctx.stroke();
 if(e.mime){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(.45,-.45,.07,0,TAU);ctx.fill()}
 // head
 const hy=-.58+bob;ctx.fillStyle=e.mime?'#f8f8f8':e.skin;ctx.beginPath();ctx.arc(0,hy,.21,0,TAU);ctx.fill();
 ctx.fillStyle='#111';if(e.down){ctx.lineWidth=.03;ctx.strokeStyle='#111';for(const ex of [.03,.12]){ctx.beginPath();ctx.moveTo(ex-.03,hy-.06);ctx.lineTo(ex+.03,hy);ctx.moveTo(ex+.03,hy-.06);ctx.lineTo(ex-.03,hy);ctx.stroke()}}else{ctx.beginPath();ctx.arc(.06,hy-.04,.03,0,TAU);ctx.arc(.15,hy-.04,.03,0,TAU);ctx.fill()}
 if(cower||e.down){ctx.beginPath();ctx.ellipse(.12,hy+.09,.04,.05,0,0,TAU);ctx.fill()}else{ctx.lineWidth=.025;ctx.strokeStyle='#111';ctx.beginPath();ctx.arc(.1,hy+.05,.06,.2,Math.PI-.2);ctx.stroke()}
 if(e.mime){ctx.fillStyle='#e63946';ctx.beginPath();ctx.arc(.1,hy+.08,.035,0,TAU);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(-.02,hy-.22,.24,.07,-.2,0,TAU);ctx.fill();ctx.fillRect(-.02,hy-.33,.04,.1)}
 else if(e.elvis){ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(.02,hy-.17,.25,.12,-.2,0,TAU);ctx.fill();ctx.fillRect(-.21,hy-.15,.08,.28);ctx.fillRect(.02,hy-.08,.18,.07)}
 else if(e.hat==='hard'){ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(0,hy-.06,.23,Math.PI,TAU);ctx.fill();ctx.fillRect(-.26,hy-.08,.56,.05)}
 else if(e.hat==='sun'){ctx.fillStyle='#f5deb3';ctx.beginPath();ctx.ellipse(0,hy-.15,.36,.07,0,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(0,hy-.15,.18,Math.PI,TAU);ctx.fill()}
 else if(e.hat==='granny'){ctx.fillStyle='#ddd';ctx.beginPath();ctx.arc(-.02,hy-.12,.2,Math.PI*.9,TAU*1.02);ctx.fill();ctx.beginPath();ctx.arc(-.18,hy-.2,.1,0,TAU);ctx.fill();ctx.strokeStyle='#333';ctx.lineWidth=.02;ctx.strokeRect(.02,hy-.08,.08,.07);ctx.strokeRect(.12,hy-.08,.08,.07)}
 else if(e.hat==='chef'){ctx.fillStyle='#fff';ctx.fillRect(-.16,hy-.42,.32,.24);ctx.beginPath();ctx.arc(0,hy-.42,.2,0,TAU);ctx.fill()}
 else{ctx.fillStyle=e.hair;ctx.beginPath();ctx.arc(-.02,hy-.07,.21,Math.PI*1.05,TAU*.99);ctx.fill()}});
 if(e.bubble){const [bx,by]=[e.x,e.y-1.4];ctx.save();ctx.translate(bx,by);const w=Math.min(4,.2+e.bubble.text.length*.16);ctx.fillStyle='rgba(255,255,255,.95)';rr(-w/2,-.3,w,.6,.2);ctx.fill();ctx.beginPath();ctx.moveTo(-.1,.28);ctx.lineTo(.05,.55);ctx.lineTo(.15,.28);ctx.fill();ctx.restore();wtxt(e.bubble.text,bx,by,.26,'#222',false)}}
// ---------- Pete ----------
const OUT={dummy:{suit:'#ffd23a',trim:'#1b1b1b',arm:'#ffd23a',leg:'#ffd23a',shin:'#ffd23a',glove:'#222',shoe:'#222'},
 elvis:{suit:'#fbfbfb',trim:'#e5b80b',arm:'#fbfbfb',leg:'#fbfbfb',shin:'#fbfbfb',glove:'#f1c9a0',shoe:'#fff',cape:'#fbfbfb',capeIn:'#e5b80b'},
 tux:{suit:'#1d1d24',trim:'#fff',arm:'#1d1d24',leg:'#1d1d24',shin:'#1d1d24',glove:'#f1c9a0',shoe:'#111'},
 hawaii:{suit:'#ff6f3c',trim:'#ffe066',arm:'#f1c9a0',leg:'#c8b27a',shin:'#f1c9a0',glove:'#f1c9a0',shoe:'#8b5a2b',flowers:true},
 super:{suit:'#2c62d9',trim:'#e63946',arm:'#2c62d9',leg:'#2c62d9',shin:'#e63946',glove:'#e63946',shoe:'#e63946',cape:'#e63946',capeIn:'#b3202c',emblem:true}};
function seg(e,col,wmul,end){const L=e.hh,w=e.hw*2*(wmul||1.18);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.a);ctx.fillStyle=col;rr(-w/2,-L-.02,w,L*2+.04,w/2);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=.035;ctx.stroke();if(end){ctx.fillStyle=end;ctx.beginPath();ctx.ellipse(0,L,w*.62,w*.55,0,0,TAU);ctx.fill()}ctx.restore()}
function drawPete(alpha){if(!P)return;const p=P.parts,o=OUT[save.outfit]||OUT.dummy;ctx.globalAlpha=alpha||1;
 const [pel,ch,hd,uaB,laB,thB,shB,uaF,laF,thF,shF]=p;
 // cape
 if(o.cape){const n=P.cape;const top=ch.body?{x:ch.x+Math.sin(ch.a)*.22,y:ch.y-Math.cos(ch.a)*.22}:{x:ch.x,y:ch.y};n.unshift({x:top.x,y:top.y});if(n.length>9)n.length=9;if(n.length>2){ctx.fillStyle=o.cape;ctx.beginPath();ctx.moveTo(n[0].x-.2,n[0].y);for(let i=1;i<n.length;i++){const q=n[i],w=.25+i*.06;ctx.lineTo(q.x-w*.3,q.y+.35+i*.04)}for(let i=n.length-1;i>=1;i--){const q=n[i],w=.25+i*.06;ctx.lineTo(q.x+w,q.y+.5+i*.05)}ctx.lineTo(n[0].x+.2,n[0].y);ctx.closePath();ctx.fill()}}
 seg(uaB,shade(o.arm,-.25),1.15);seg(laB,shade(o.arm,-.25),1.1,o.glove);seg(thB,shade(o.leg,-.25),1.15);seg(shB,shade(o.shin,-.25),1.1);foot(shB,shade(o.shoe,-.2));
 // torso
 ctx.save();ctx.translate(pel.x,pel.y);ctx.rotate(pel.a);ctx.fillStyle=o.leg;rr(-.2,-.17,.4,.32,.12);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=.035;ctx.stroke();ctx.restore();
 ctx.save();ctx.translate(ch.x,ch.y);ctx.rotate(ch.a);ctx.fillStyle=o.suit;rr(-.26,-.3,.52,.62,.2);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=.035;ctx.stroke();
 if(save.outfit==='dummy'){ctx.fillStyle=o.trim;ctx.fillRect(-.26,.12,.52,.06);ctx.beginPath();ctx.arc(.02,-.06,.11,0,TAU);ctx.fill();ctx.fillStyle=o.suit;ctx.beginPath();ctx.moveTo(.02,-.06);ctx.arc(.02,-.06,.085,0,Math.PI/2);ctx.fill();ctx.beginPath();ctx.moveTo(.02,-.06);ctx.arc(.02,-.06,.085,Math.PI,Math.PI*1.5);ctx.fill()}
 else if(save.outfit==='elvis'){ctx.fillStyle=o.trim;ctx.fillRect(-.26,.16,.52,.09);ctx.beginPath();ctx.moveTo(-.18,-.3);ctx.lineTo(.02,0);ctx.lineTo(.22,-.3);ctx.lineWidth=.05;ctx.strokeStyle=o.trim;ctx.stroke();for(let i=0;i<5;i++){ctx.fillStyle=(i+Math.floor(frameT*5))%2?'#fff':'#e5b80b';ctx.beginPath();ctx.arc(-.15+i*.08,.21,.025,0,TAU);ctx.fill()}}
 else if(save.outfit==='tux'){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-.08,-.3);ctx.lineTo(.12,-.3);ctx.lineTo(.04,.2);ctx.fill();ctx.fillStyle='#c0392b';ctx.fillRect(-.06,-.3,.18,.07)}
 else if(o.flowers){for(let i=0;i<9;i++){ctx.fillStyle=['#ffe066','#fff','#7ae582'][i%3];ctx.beginPath();ctx.arc(-.18+(i%3)*.17,-.2+Math.floor(i/3)*.19,.04,0,TAU);ctx.fill()}}
 else if(o.emblem){ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.moveTo(.02,-.22);ctx.lineTo(.18,-.1);ctx.lineTo(.02,.1);ctx.lineTo(-.14,-.1);ctx.closePath();ctx.fill();wtxt('P',.02,-.07,.17,'#e63946',false)}
 if(G&&G.modeId==='fragile'&&!G.broke){ctx.fillStyle='rgba(255,255,255,.25)';rr(-.34,-.38,.68,1.2,.25);ctx.fill();ctx.fillStyle='rgba(255,255,255,.45)';for(let i=0;i<10;i++){ctx.beginPath();ctx.arc(-.22+(i%3)*.2,-.25+Math.floor(i/3)*.25,.06,0,TAU);ctx.fill()}wtxt('FRAGILE',0,.1,.13,'#e63946',false)}
 ctx.restore();
 seg(thF,o.leg,1.18);seg(shF,o.shin,1.12);foot(shF,o.shoe);seg(uaF,o.arm,1.18);seg(laF,o.arm,1.12,o.glove);
 // head: drawn pixel likeness (bobble-head)
 const im=P.faceT>0?IMG.oof:IMG.really;ctx.save();ctx.translate(hd.x,hd.y);ctx.rotate(hd.a);
 if(im.complete&&im.naturalWidth){const w=.66,h=w*im.naturalHeight/im.naturalWidth;ctx.imageSmoothingEnabled=false;ctx.drawImage(im,-w/2,-h*.6,w,h)}else{ctx.fillStyle='#f2b48a';ctx.beginPath();ctx.arc(0,0,.25,0,TAU);ctx.fill()}
 if(save.outfit==='elvis'){ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.ellipse(.02,-.36,.3,.13,-.15,0,TAU);ctx.fill()}
 if(save.outfit==='super'){ctx.fillStyle='rgba(20,20,60,.85)';ctx.fillRect(-.24,-.12,.48,.09)}
 ctx.restore();
 if(P.dizzy>0){for(let i=0;i<3;i++){const a=frameT*6+i*TAU/3;wtxt('★',hd.x+Math.cos(a)*.38,hd.y-.45+Math.sin(a)*.1,.2,'#ffe14d',false)}}
 ctx.globalAlpha=1}
function foot(sh,col){ctx.save();ctx.translate(sh.x,sh.y);ctx.rotate(sh.a);ctx.fillStyle=col;rr(-.08,sh.hh-.06,.3,.14,.06);ctx.fill();ctx.restore()}
// ---------- slingshot + aim ----------
function drawSling(front){if(!G)return;const s=G.stage.sling;const pp=state==='aim'?pouch():{x:s.x,y:s.y-.6};const L={x:s.x-.55,y:s.y-1.9},R={x:s.x+.55,y:s.y-1.9};
 if(!front){ctx.strokeStyle='#5a3a1f';ctx.lineWidth=.32;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(s.x,s.y+.9);ctx.lineTo(s.x,s.y-.5);ctx.lineTo(L.x,L.y);ctx.moveTo(s.x,s.y-.5);ctx.lineTo(R.x,R.y);ctx.stroke();ctx.strokeStyle='#8b5a2b';ctx.lineWidth=.18;ctx.stroke();
  ctx.strokeStyle='#7a1f1f';ctx.lineWidth=.12;ctx.beginPath();ctx.moveTo(L.x,L.y);ctx.lineTo(pp.x,pp.y);ctx.stroke()}
 else{ctx.strokeStyle='#a32626';ctx.lineWidth=.13;ctx.beginPath();ctx.moveTo(R.x,R.y);ctx.lineTo(pp.x,pp.y);ctx.stroke();if(state==='aim'){ctx.fillStyle='#4a2a14';ctx.beginPath();ctx.ellipse(pp.x,pp.y,.25,.4,G.aim.ang,0,TAU);ctx.fill()}}}
function drawTraj(){if(state!=='aim'||G.cpuT>0)return;const v=aimVel(),p=pouch();let x=p.x,y=p.y,vx=v.x,vy=v.y;const dt=.06;ctx.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<26;i++){vy+=GRAV*dt;x+=vx*dt;y+=vy*dt;if(y>0)break;if(i%2===0){ctx.globalAlpha=1-i/28;ctx.beginPath();ctx.arc(x,y,.13,0,TAU);ctx.fill()}}ctx.globalAlpha=1}
function drawGrabHint(){if(state!=='fly'||!P||G.M.noGrab)return;if(P.grab.length){const ge=P.grab[0].e;if(G.M.throwAssist){const as=G.M.throwAssist(ge);if(as){ctx.strokeStyle='rgba(255,230,120,.85)';ctx.lineWidth=.08;ctx.setLineDash([.3,.25]);ctx.beginPath();ctx.moveTo(ge.x,ge.y);ctx.lineTo(as.target.x,as.target.y);ctx.stroke();ctx.setLineDash([]);wtxt('LET GO TO THROW!',ge.x,ge.y-1.4,.3,'#ffe066')}}for(const g of P.grab){const a=g.j.getAnchorA(),b=g.j.getAnchorB();ctx.strokeStyle='rgba(125,255,176,.7)';ctx.lineWidth=.06;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}return}
 let best=null;for(const hi of [PI.larmF,PI.larmB]){const c=nearestGrab(P.parts[hi],1.5);if(c&&(!best||c.d<best.d))best=c}G.grabNear=!!best;if(!best)return;const pul=1+Math.sin(frameT*14)*.15;ctx.strokeStyle='#7dffb0';ctx.lineWidth=.08;ctx.beginPath();ctx.arc(best.pt.x,best.pt.y,.45*pul,0,TAU);ctx.stroke();wtxt('GRAB!',best.pt.x,best.pt.y-.8,.32,'#7dffb0')}
// ---------- effects ----------
function drawFx(){for(const f of FX){const a=1-f.age/f.life;switch(f.t){
 case 'ring':ctx.strokeStyle=f.col==='#fff'?'rgba(255,255,255,'+a+')':(f.col||'#ffd23a');ctx.globalAlpha=a;ctx.lineWidth=.25*a+.05;ctx.beginPath();ctx.arc(f.x,f.y,f.size*(1-a*.7)+.2,0,TAU);ctx.stroke();ctx.globalAlpha=1;break;
 case 'fire':{const s=f.size*(.5+a);const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,s);g.addColorStop(0,'rgba(255,250,200,'+a+')');g.addColorStop(.4,'rgba(255,160,40,'+a*.9+')');g.addColorStop(1,'rgba(200,40,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y,s,0,TAU);ctx.fill()}break;
 case 'smoke':case 'toot':ctx.fillStyle=f.t==='toot'?f.col:'rgba(70,70,70,'+a*.5+')';ctx.globalAlpha=f.t==='toot'?a:1;ctx.beginPath();ctx.arc(f.x,f.y,f.size*(1.6-a),0,TAU);ctx.fill();ctx.globalAlpha=1;break;
 case 'shard':ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot);ctx.globalAlpha=a;ctx.fillStyle=f.col;ctx.beginPath();ctx.moveTo(0,-f.size);ctx.lineTo(f.size*.6,f.size*.5);ctx.lineTo(-f.size*.5,f.size*.3);ctx.fill();ctx.restore();ctx.globalAlpha=1;break;
 case 'confetti':ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot);ctx.fillStyle=f.col;ctx.globalAlpha=a;ctx.fillRect(-f.size,-f.size*.4,f.size*2,f.size*.8);ctx.restore();ctx.globalAlpha=1;break;
 case 'star':ctx.globalAlpha=a;wtxt('✦',f.x,f.y,f.size*2,f.col,false);ctx.globalAlpha=1;break;
 case 'coin':ctx.fillStyle='#ffd700';ctx.globalAlpha=a;ctx.beginPath();ctx.ellipse(f.x,f.y,f.size*Math.abs(Math.cos(f.rot)),f.size,0,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
 default:ctx.globalAlpha=a;ctx.fillStyle=f.col;ctx.beginPath();ctx.arc(f.x,f.y,f.size,0,TAU);ctx.fill();ctx.globalAlpha=1}}}
function drawPops(){for(const p of POPS){const a=p.age<.15?p.age/.15:1-Math.max(0,(p.age-p.life*.6)/(p.life*.4));ctx.globalAlpha=clamp(a,0,1);const s=p.size*(.42+Math.max(0,.15-p.age)*1.5);wtxt(p.text,p.x,p.y,s,p.col);ctx.globalAlpha=1}}
function drawWorld(){const st=G.stage;drawBackdrop(st);setWorld();drawDeco(st,0);
 for(const e of ENTS)if(e.kind==='ferris'&&e.alive){const hub=e;ctx.strokeStyle='#e8e8e8';ctx.lineWidth=.18;ctx.beginPath();ctx.arc(hub.x,hub.y,hub.R,0,TAU);ctx.stroke();for(let i=0;i<hub.n;i++){const a=hub.a+i/hub.n*TAU;ctx.beginPath();ctx.moveTo(hub.x,hub.y);ctx.lineTo(hub.x+Math.cos(a)*hub.R,hub.y+Math.sin(a)*hub.R);ctx.stroke();if(st.night||true){ctx.fillStyle=((i+Math.floor(frameT*4))%2)?'#ffe14d':'#ff5fa2';ctx.beginPath();ctx.arc(hub.x+Math.cos(a)*hub.R,hub.y+Math.sin(a)*hub.R,.18,0,TAU);ctx.fill()}}ctx.fillStyle='#999';ctx.beginPath();ctx.arc(hub.x,hub.y,.5,0,TAU);ctx.fill()}
 drawGround(st);
 for(const e of ENTS)if(e.kind==='building'||e.kind==='tower')drawEnt(e,st);
 for(const e of ENTS)if(e.kind==='water'&&e.alive){ctx.fillStyle=e.fountain?'rgba(120,200,255,.55)':'rgba(40,140,200,.75)';ctx.fillRect(e.x-e.hw,e.top,e.hw*2,e.hh*2);ctx.fillStyle='rgba(255,255,255,.5)';for(let x=e.x-e.hw;x<e.x+e.hw;x+=.8)ctx.fillRect(x,e.top+Math.sin(frameT*3+x)*.06,.4,.06)}
 drawSling(false);
 for(const e of ENTS)if(e.kind!=='building'&&e.kind!=='tower'&&e.kind!=='pete')drawEnt(e,st);
 drawTraj();drawPete();drawSling(true);drawGrabHint();drawFx();drawPops()}
