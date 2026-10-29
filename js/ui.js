/* ui: title (live ragdoll attract), menus, HUD + action buttons, tally/result/pass/pause, main loop, controller, QA hooks */
'use strict';
const PLAY={aim:1,fly:1};
let uiScroll=0,selMode='pain',selStage='city',selPlayers=1,selCpu=false,lastNow=0,acc=0,screenT=0,newTrophiesSession=[];
function btn(id,x,y,w,h,label,cb,o){const b=Object.assign({id,x,y,w,h,label,cb},o||{});if(ptr.down&&ptr.btn&&ptr.btn.id===id){b.down=true;ptr.btn=b}menuBtns.push(b);return b}
function drawBtn(b,style){const s=style||b.style||'main';const dn=b.down?2:0;ctx.save();
 const col=b.dis?'#555':s==='main'?'#ffd23a':s==='alt'?'#3fb7ff':s==='pink'?'#ff5fa2':s==='green'?'#3ad17a':s==='ghost'?'rgba(10,15,40,.55)':s==='red'?'#ff5a4a':'#ffd23a';
 ctx.fillStyle='rgba(0,0,0,.35)';rr(b.x,b.y+4,b.w,b.h,Math.min(18,b.h/2));ctx.fill();ctx.fillStyle=col;rr(b.x,b.y+dn,b.w,b.h,Math.min(18,b.h/2));ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='rgba(10,10,30,.85)';ctx.stroke();
 if(s!=='ghost'){ctx.fillStyle='rgba(255,255,255,.35)';rr(b.x+6,b.y+dn+4,b.w-12,b.h*.3,Math.min(10,b.h/4));ctx.fill()}
 let fs=b.fs||clamp(b.h*.42,16,26);ctx.font='900 '+fs+'px '+FONT;const mw=ctx.measureText(b.label).width;if(mw>b.w-14)fs=Math.max(13,fs*(b.w-14)/mw);txt(b.label,b.x+b.w/2,b.y+b.h/2+dn+1,fs,s==='ghost'||s==='alt'||s==='pink'||s==='red'||s==='green'?'#fff':'#2a1600',s==='main'?false:undefined);
 if(b.sub)txt(b.sub,b.x+b.w/2,b.y+b.h-12+dn,14,'rgba(40,20,0,.8)','center',false,'700 ');ctx.restore()}
function panel(x,y,w,h,col){ctx.fillStyle='rgba(0,0,0,.4)';rr(x,y+6,w,h,22);ctx.fill();ctx.fillStyle=col||'rgba(18,22,48,.93)';rr(x,y,w,h,22);ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#ffd23a';ctx.stroke()}
function wrap(s,maxW,size,weight){ctx.font=(weight||'700 ')+size+'px '+FONT;const out=[];let line='';for(const w of s.split(' ')){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t}if(line)out.push(line);return out}
function para(s,x,y,maxW,size,col,lh,align){const L=wrap(s,maxW,size);L.forEach((l,i)=>txt(l,x,y+i*(lh||size*1.3),size,col||'#e8f0ff',align||'center',false,'700 '));return L.length*(lh||size*1.3)}
// ---------- title (attract mode: a real ragdoll keeps getting launched) ----------
function startTitle(){newSession('pain','city',{demo:true});G.demo=true;G.demoT=1.2;state='title';G.uiState='title';SND.music('title');screenT=0;CALL=[]}
function demoStep(dt){if(!G||!G.demo)return;if(state==='title'||state==='modes'||state==='mode'||state==='locker'||state==='help'){
 if(G.phase==='aim'){G.demoT-=dt;if(G.demoT<=0){G.aim.ang=rnd(-.75,-.25);G.aim.pow=rnd(.55,.95);launch()}}
 else if(G.phase==='fly'){if(P.touched&&Math.random()<dt*.6)doOoch(rnd(-1,1),-1);if(G.flyT>7||P.still>.8){G.recOn=false;const u=state;setupLaunch(false);G.demoT=1.5;state=u}}}}
function drawLogo(cx,cy,sc){ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.sin(frameT*1.3)*.02);ctx.scale(sc,sc);const sh=(shake>.3?rnd(-2,2):0);
 txt("PETE'S",0,-58+sh,52,'#fff','center','#1a0a2a');
 const g=ctx.createLinearGradient(0,-30,0,40);g.addColorStop(0,'#fff27a');g.addColorStop(.5,'#ffb020');g.addColorStop(1,'#ff4a1a');ctx.font='900 96px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=16;ctx.strokeStyle='#1a0a2a';ctx.strokeText('PAIN 2',0,10);ctx.fillStyle=g;ctx.fillText('PAIN 2',0,10);
 ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.7)';ctx.strokeText('PAIN 2',0,6);
 ctx.rotate(-.06);ctx.fillStyle='#ff2d7a';rr(-150,58,300,40,10);ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#1a0a2a';ctx.stroke();txt('EXTREME MAKEOVER',0,79,26,'#fff',false);ctx.restore()}
function uiTitle(){const s=Math.min(W/420,H/520,1.5);drawLogo(W/2,SAFE.t+Math.max(110,H*(PORT?.17:.24))*Math.min(1,s+.1),s*.95);
 const bw=Math.min(300,W-60),bh=58,x=W/2-bw/2;let y=PORT?H*.6:H*.5;if(!PORT){y=Math.max(SAFE.t+H*.48,190)}
 const list=[['play','PLAY','main',()=>{state='modes';G.uiState='modes';uiScroll=0}],['locker','OUTFITS & TROPHIES','alt',()=>{state='locker';G.uiState='locker';uiScroll=0}],['help','HOW TO PLAY','pink',()=>{state='help';G.uiState='help';uiScroll=0}]];
 if(!PORT){const w2=Math.min(250,(W-80)/3);list.forEach(([id,l,st,cb],i)=>{drawBtn(btn(id,W/2-(w2*1.5+20)+i*(w2+20),y,w2,bh,l,cb,{style:st}))})}else list.forEach(([id,l,st,cb],i)=>drawBtn(btn(id,x,y+i*(bh+16),bw,bh,l,cb,{style:st})));
 soundBtns(W-SAFE.r-112,SAFE.t+10);const tb=trophyCount();txt('🏆 '+tb+'/'+Object.keys(TROPHIES).length+'  ·  best Pain Mode: '+fmt(Math.max(0,...STAGE_ORDER.map(s=>save.best['pain:'+s]||0))),W/2,H-SAFE.b-(PORT?78:64),16,'#fff','center')}
function soundBtns(x,y){drawBtn(btn('mute',x,y,48,48,save.mute?'🔇':'🔊',()=>{save.mute=!save.mute;SND.apply();persist()},{style:'ghost',fs:22}));drawBtn(btn('music',x+56,y,48,48,save.music?'🎵':'🎵̸',()=>{save.music=!save.music;SND.apply();persist()},{style:save.music?'ghost':'red',fs:22}))}
function backBtn(cb){drawBtn(btn('back',SAFE.l+10,SAFE.t+10,96,48,'◀ BACK',cb||(()=>{state='title';G.uiState='title'}),{style:'ghost',fs:18}))}
// ---------- mode select ----------
function uiModes(){ctx.fillStyle='rgba(8,10,30,.55)';ctx.fillRect(0,0,W,H);backBtn();txt('PICK YOUR PAIN',W/2+(PORT?50:0),SAFE.t+34,PORT?24:30,'#ffd23a');
 const cols=PORT?2:3,pad=12,top=SAFE.t+70,cw=(Math.min(W-SAFE.l-SAFE.r,980)-pad*(cols+1))/cols,rows=Math.ceil(MODE_ORDER.length/cols);const ch=clamp((H-top-SAFE.b-16)/rows-pad,74,150);const x0=(W-(cw*cols+pad*(cols-1)))/2;
 MODE_ORDER.forEach((id,i)=>{const M=MODES[id],c=i%cols,r=Math.floor(i/cols),x=x0+c*(cw+pad),y=top+r*(ch+pad);const b=btn('m_'+id,x,y,cw,ch,'',()=>{selMode=id;selStage=M.stage;selPlayers=id==='ouch'?2:1;selCpu=false;state='mode';G.uiState='mode'});
  ctx.fillStyle=b.down?'rgba(255,210,58,.35)':'rgba(20,26,60,.9)';rr(x,y,cw,ch,16);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=id===selMode?'#ffd23a':'rgba(255,255,255,.25)';ctx.stroke();
  const big=ch>100;txt(M.icon,x+(big?cw/2:30),y+(big?ch*.3:ch/2),big?34:26,'#fff','center',false);txt(M.name,x+(big?cw/2:58),y+(big?ch*.62:ch/2-10),clamp(cw/11,16,22),'#fff',big?'center':'left');
  const bk=bestLabel(id);txt(bk,x+(big?cw/2:58),y+(big?ch*.84:ch/2+14),16,'#ffd23a',big?'center':'left',false,'700 ')})}
function bestLabel(id){const M=MODES[id];if(id==='ouch')return save.trophies.ouch?'champ 🏆':'2 players or vs CPU';if(id==='pain'){const b=Math.max(0,...STAGE_ORDER.map(s=>save.best['pain:'+s]||0));return b?'best '+fmt(b):'start here!'}const b=save.best[id];return b?'best '+(M.unit?b+' '+M.unit:fmt(b)):'not played yet'}
// ---------- mode detail ----------
function uiMode(){const M=MODES[selMode];ctx.fillStyle='rgba(8,10,30,.6)';ctx.fillRect(0,0,W,H);backBtn(()=>{state='modes';G.uiState='modes'});
 const pw=Math.min(W-24,640),px=W/2-pw/2,top=SAFE.t+66;let y=top;txt(M.icon+' '+M.name,W/2,y,PORT?28:30,'#ffd23a');y+=34;y+=para(M.desc,W/2,y,pw-20,PORT?17:18,'#e8f0ff');y+=10;
 if(M.stagePick){txt('STAGE',W/2,y+6,18,'#9fe6ff');y+=22;const n=STAGE_ORDER.length,cols=PORT?2:4,bw=(pw-(cols-1)*10)/cols,bh=PORT?62:58;
  STAGE_ORDER.forEach((s,i)=>{const c=i%cols,r=Math.floor(i/cols),x=px+c*(bw+10),yy=y+r*(bh+10);const un=stageUnlocked(s);const b=btn('s_'+s,x,yy,bw,bh,un?STAGES[s].name:'🔒 '+STAGES[s].name,()=>{if(un){selStage=s}else{call('LOCKED','score '+fmt(UNLOCK_AT)+' in Pain Mode on '+STAGES[STAGE_ORDER[i-1]].name,'#ff9e3a',.9)}},{style:selStage===s?'main':'ghost',fs:PORT?16:17});
   drawBtn(b);if(!un)b.sub=null});y+=Math.ceil(n/cols)*(bh+10)+4;
  if(selMode==='pain'&&!stageUnlocked(STAGE_ORDER[1])){txt('Score '+fmt(UNLOCK_AT)+' on a stage to unlock the next one',W/2,y+6,16,'#ffcf7a','center',false,'700 ');y+=26}
  const b=save.best['pain:'+selStage];if(selMode==='pain'&&b){txt('Best here: '+fmt(b),W/2,y+6,16,'#ffd23a','center',false,'700 ');y+=26}}
 if(selMode==='bowl'){y+=6;const bw=(Math.min(pw,420)-10)/2,x=W/2-bw-5;drawBtn(btn('p1',x,y,bw,52,'1 PLAYER',()=>{selPlayers=1},{style:selPlayers===1?'main':'ghost'}));drawBtn(btn('p2',x+bw+10,y,bw,52,'2 PLAYERS',()=>{selPlayers=2},{style:selPlayers===2?'main':'ghost'}));y+=64}
 if(selMode==='ouch'){y+=6;const bw=(Math.min(pw,420)-10)/2,x=W/2-bw-5;drawBtn(btn('vf',x,y,bw,52,'VS FRIEND',()=>{selCpu=false},{style:!selCpu?'main':'ghost'}));drawBtn(btn('vc',x+bw+10,y,bw,52,'VS CPU',()=>{selCpu=true},{style:selCpu?'main':'ghost'}));y+=64}
 const sb=Math.min(320,W-60);drawBtn(btn('go',W/2-sb/2,Math.min(H-SAFE.b-80,y+14),sb,64,'LET\'S GET HURT!',()=>startGame(selMode,selStage,{players:selPlayers,cpu:selCpu}),{style:'green',fs:24}))}
function startGame(m,s,o){SND.unlock();newSession(m,MODES[m].stagePick?s:MODES[m].stage,o);G.cpu=!!(o&&o.cpu);G.players=(m==='ouch')?2:(o&&o.players)||1;newTrophiesSession=[];if(G.players>1&&m!=='bowl'&&!G.cpu)state='pass';else if(m==='bowl'&&G.players>1)state='pass'}
// ---------- locker (outfits + trophies) ----------
function uiLocker(){ctx.fillStyle='rgba(8,10,30,.7)';ctx.fillRect(0,0,W,H);backBtn();txt(PORT?'LOCKER':'OUTFITS & TROPHIES',W/2,SAFE.t+34,PORT?24:28,'#ffd23a');const tc=trophyCount();
 const pw=Math.min(W-24,900),px=W/2-pw/2;let y=SAFE.t+70;const cols=PORT?2:5,bw=(pw-(cols-1)*10)/cols,bh=54;
 OUTFITS.forEach(([id,name,need],i)=>{const c=i%cols,r=Math.floor(i/cols),x=px+c*(bw+10),yy=y+r*(bh+10);const un=tc>=need;drawBtn(btn('o_'+id,x,yy,bw,bh,un?name:'🔒 '+name+' ('+need+'🏆)',()=>{if(un){save.outfit=id;persist();SND.ding(2)}},{style:save.outfit===id?'main':'ghost',fs:16}))});
 y+=Math.ceil(OUTFITS.length/cols)*(bh+10)+10;txt('TROPHIES '+tc+'/'+Object.keys(TROPHIES).length,W/2,y,20,'#9fe6ff');y+=20;
 const keys=Object.keys(TROPHIES),tcols=PORT?1:2,tw=(pw-(tcols-1)*10)/tcols,th=PORT?44:46;const maxRows=Math.floor((H-y-SAFE.b-10)/(th+6));const per=maxRows*tcols;const pages=Math.ceil(keys.length/per);uiScroll=clamp(uiScroll,0,pages-1);
 keys.slice(uiScroll*per,uiScroll*per+per).forEach((k,i)=>{const c=i%tcols,r=Math.floor(i/tcols),x=px+c*(tw+10),yy=y+r*(th+6);const got=save.trophies[k];ctx.fillStyle=got?'rgba(255,210,58,.22)':'rgba(255,255,255,.07)';rr(x,yy,tw,th,12);ctx.fill();
  txt((got?'🏆 ':'⬜ ')+TROPHIES[k][0],x+12,yy+th*.33,16,got?'#ffd23a':'#bbb','left',false);txt(TROPHIES[k][1],x+12,yy+th*.73,14,'#dde','left',false,'600 ')});
 if(pages>1){drawBtn(btn('pg',W-SAFE.r-110,SAFE.t+10,100,48,'MORE ▶',()=>{uiScroll=(uiScroll+1)%pages},{style:'alt',fs:18}))}}
// ---------- help ----------
function uiHelp(){ctx.fillStyle='rgba(8,10,30,.8)';ctx.fillRect(0,0,W,H);backBtn();txt('HOW TO HURT PETE',W/2+(PORT?50:0),SAFE.t+34,PORT?20:28,'#ffd23a');
 const pw=Math.min(W-28,820);const pages=[
 ['👆 TOUCH','Drag back anywhere and let go to fire the slingshot (the dots show the path). In the air, drag to steer. Tap GRAB near a glowing ring to grab ledges, poles, cars, crates or the mime; tap again to let go and throw. Hold POSE for a pose (the ⟳ button picks Super Pete, Cannonball, Heli-Kick or Starfish); hold it 2 seconds for a bonus multiplier. TOOT gives one gassy boost per launch. After Pete hits something, SWIPE to OOCH him (4 nudges, O-O-C-H, they refill if he keeps moving) and tap SUPER once per launch for a big shove.'],
 ['🎮 CONTROLLER','Left stick aims, right stick sets power, A fires. In the air: left stick steers, A or X grabs/lets go, hold LB or LT to pose, RB changes the pose, Y toots, D-pad ooches, B is the Super Ooch. Start pauses, Back watches the replay. Unplugging the controller pauses the game.'],
 ['⌨️ KEYBOARD','Arrows/WASD aim (up/down = angle, left/right = power), Space fires. In the air: arrows steer, Space/E grabs, hold Shift or Z to pose, Q or 1-4 picks the pose, T toots, C super ooch. After impact the arrows ooch. P/Esc pause, R replay.'],
 ['💥 SCORING','Every hard hit is pain points (head hits count double). Hits close together build a COMBO up to x5. Smash windows, crates, signs and cars, knock over bystanders, set off explosions, bounce, flip and grab for more. Big hits slow time down so you can enjoy it.']];
 let y=SAFE.t+72;const fs=PORT?16:17;for(const [h,b] of pages){txt(h,W/2,y,19,'#9fe6ff');y+=24;y+=para(b,W/2,y,pw,fs,'#e8f0ff',fs*1.32)+12}}
// ---------- HUD ----------
const actBtns={};
function hudButtons(){const big=clamp(Math.min(W,H)*.2,76,96),sm=clamp(big*.64,50,62),m=12;const bx=W-SAFE.r-m-big,by=H-SAFE.b-m-big;
 const fly=state==='fly',aim=state==='aim';const t=P&&P.touched;const human=!(G.cpu&&G.cur===1);
 if(aim&&human){roundBtn('launch',bx,by,big,'LAUNCH','#3ad17a',()=>launch(),G.aim.pow<.1)}
 if(fly&&!G.M.noGrab&&human){roundBtn('grab',bx,by,big,P.grab.length?'LET GO':'GRAB',P.grab.length?'#ff9e3a':G.grabNear?'#7dffb0':'#ffd23a',()=>grabBtn())}
 if((fly||aim)&&!G.M.noPose&&human){const px=bx-sm-m,py=by+big-sm;const b=roundBtn('pose',px,py,sm,POSES[POSE_ORDER[ctl.poseSel]].em,ctl.poseHeld?'#7fd3ff':'#3fb7ff',null,false,true,24);b.press=(d)=>{ctl.poseHeld=d};b.hold=true;txt('POSE',px+sm/2,py-10,14,'#fff','center');
  const cs=Math.max(44,sm*.72);roundBtn('cyc',px+(sm-cs)/2,py-cs-24,cs,'⟳','#6a7bd8',()=>{ctl.poseSel=(ctl.poseSel+1)%4;SND.blip();call(POSES[POSE_ORDER[ctl.poseSel]].name,'hold POSE','#7fd3ff',.7)},false,false,22)}
 if(fly&&human){const tx=SAFE.l+m,ty=H-SAFE.b-m-sm;if(!P.tooted)roundBtn('toot',tx,ty,sm,'TOOT','#8bd448',()=>toot(),false,false,16);
  if(t&&!P.superUsed)roundBtn('super',tx+(P.tooted?0:sm+m),ty,sm,'SUPER','#ff5fd2',()=>{const d=ctl.lastSwipe||{x:peteVel().x>=0?1:-1,y:-1};superOoch(d.x,d.y)},false,false,15)}
 if(fly&&G.traps&&G.players>1){const tw=Math.min(130,W*.3);let y=SAFE.t+(PORT?150:80);txt('P'+(2-G.cur)+' TRAPS',SAFE.l+12+tw/2,y-14,15,'#ff9e3a');for(const [k,l] of [['manhole','MANHOLE'],['ball','WRECK BALL'],['booth','PHONE BOOTH']]){drawBtn(btn('t_'+k,SAFE.l+12,y,tw,46,l,()=>trap(k),{style:G.traps[k]?'red':'ghost',dis:!G.traps[k],fs:15,instant:true}));y+=54}}
 drawBtn(btn('pause',W-SAFE.r-58,SAFE.t+10,48,48,'II',()=>pauseGame(),{style:'ghost',fs:18}))}
function roundBtn(id,x,y,s,label,col,cb,dis,hold,fs){const b=btn(id,x,y,s,s,label,cb,{dis,instant:!!cb&&!hold});const dn=b.down||(id==='pose'&&ctl.poseHeld);ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(x+s/2,y+s/2+4,s/2,0,TAU);ctx.fill();ctx.fillStyle=dis?'#666':col;ctx.globalAlpha=dis?.6:.95;ctx.beginPath();ctx.arc(x+s/2,y+s/2+(dn?3:0),s/2*(dn?.94:1),0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=3;ctx.strokeStyle='rgba(10,10,30,.85)';ctx.stroke();
 ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(x+s/2,y+s*.32,s*.3,s*.12,0,0,TAU);ctx.fill();txt(label,x+s/2,y+s/2+(dn?3:0),fs||clamp(s*.22,15,22),'#fff');ctx.restore();return b}
function drawHUD(){setScreen();const M=G.M;const t=SAFE.t+10,l=SAFE.l+10;
 const total=M.final&&G.modeId!=='pain'?null:G.total;ctx.fillStyle='rgba(10,12,35,.72)';rr(l,t,Math.min(W*.62,330),58,14);ctx.fill();txt(M.icon+' '+M.name,l+12,t+18,17,'#ffd23a','left',false);
 const sub=M.hud?M.hud(G):('Launch '+Math.min(G.launch+(state==='aim'?1:0),M.launches)+' of '+M.launches+' · total '+fmt(G.total));txt(sub,l+12,t+42,15,'#fff','left',false,'700 ');
 // launch score
 if(state==='fly'||state==='tally'){const y=t+(PORT?92:30),x=PORT?W/2:W-SAFE.r-150;txt(fmt(G.launchPts),x,y,PORT?38:34,'#fff');if(G.combo>1)txt('COMBO x'+G.combo,x,y+30,18,'#ff6bd6');if(P&&P.poseMult>1)txt('POSE x'+P.poseMult,x,y+(G.combo>1?52:30),16,'#7fd3ff')}
 // OOCH meter
 if(state==='fly'&&P&&P.touched){const s='OOCH';const cx=PORT?W/2:W/2-40,y=PORT?H-SAFE.b-200:H-SAFE.b-28;for(let i=0;i<4;i++){const on=i>=4-P.oochN;txt(s[i],cx-54+i*36,y,30,on?'#9ffcff':'rgba(255,255,255,.25)')}if(P.oochN>0&&!G.M.noOochHint&&G.flyT<20)txt('swipe to ooch',cx,y-28,14,'rgba(255,255,255,.75)','center',false,'700 ')}
 if(state==='aim'&&!(G.cpu&&G.cur===1)){const y=PORT?H*.24:H-SAFE.b-26;txt(G.drag?'power '+Math.round(G.aim.pow*100)+'%':'drag back & let go to launch',PORT?W/2:W/2-60,y,PORT?19:17,'#fff')}
 if(state==='aim'&&G.cpu&&G.cur===1)txt('CPU is aiming…',W/2,H*.3,22,'#ffd23a');
 if(G.modeId==='ouch'&&G.set&&state!=='result'){txt('TARGET: '+G.set.name.toUpperCase()+' · beat '+fmt(G.set.pts),W/2,t+(PORT?130:70),17,'#ff9e3a')}
 hudButtons()}
function drawCalls(dt){setScreen();let y=H*(PORT?.27:.24);const base=Math.min(34,H*.075,W*.08);for(const c of CALL){c.age+=dt;const a=c.age<.12?c.age/.12:c.age>c.life-.3?(c.life-c.age)/.3:1;const sc=c.size*(1+Math.max(0,.18-c.age)*2.2)*(PORT?.9:1);ctx.globalAlpha=clamp(a,0,1);ctx.save();ctx.translate(W/2,y);ctx.rotate(Math.sin(c.age*20)*.02);const fs=Math.min(base*sc,W/c.text.length*1.45);txt(c.text,0,0,fs,c.col);if(c.sub)txt(c.sub,0,fs*.85,16,'#fff');ctx.restore();ctx.globalAlpha=1;y+=fs+(c.sub?24:10)}
 for(let i=CALL.length-1;i>=0;i--)if(CALL[i].age>CALL[i].life)CALL.splice(i,1)}
function drawTrophyToast(dt){if(!trophyQ.length)return;const q=trophyQ[0];q.t+=dt;if(q.t>2.6){trophyQ.shift();newTrophiesSession.push(q.k);return}const a=q.t<.3?q.t/.3:q.t>2.2?(2.6-q.t)/.4:1;setScreen();const w=Math.min(W-30,360),x=W/2-w/2,y=SAFE.t+74-(1-a)*40;ctx.globalAlpha=a;panel(x,y,w,62,'rgba(40,30,0,.93)');txt('🏆 '+TROPHIES[q.k][0],W/2,y+22,19,'#ffd23a');txt(TROPHIES[q.k][1],W/2,y+46,14,'#fff','center',false,'600 ');ctx.globalAlpha=1}
// ---------- tally / pass / result / pause ----------
function uiTally(){const M=G.M;const pw=Math.min(W-30,380),ph=PORT?250:230,px=W/2-pw/2,py=PORT?H*.36:Math.max(SAFE.t+70,H/2-ph/2);const a=Math.min(1,G.tallyT*4);ctx.globalAlpha=a;panel(px,py,pw,ph);let y=py+34;
 let head='LAUNCH SCORE',big=fmt(G.lastPts),sub='';
 if(G.modeId==='bowl'){head=G.players>1?'PLAYER '+(G.cur+1):'ROLL';big=G.bowlMsg;sub='Score '+bowlScore(G.rolls[G.cur],G.frames).total}
 else if(G.modeId==='bounce'){head='HEIGHT';big=G.lastH.toFixed(1)+' m';sub=fmt(G.lastPts)+' pain points'}
 else if(G.modeId==='fragile'){head=G.dmsg;big=fmt(G.lastPts);sub='wrap damage '+Math.round(G.dmg)+'%'}
 else if(G.modeId==='ouch'){head=(G.cur===0?'PLAYER 1':(G.cpu?'CPU':'PLAYER 2'))+': '+fmt(G.lastPts);big='';sub=G.msg}
 else if(G.modeId==='kaboom'&&G.lastBonus){sub='incl. chain bonus +'+fmt(G.lastBonus)}
 else if(G.modeId==='pain'){const t=G.stats;sub=[t.crunch?t.crunch+' crunches':'',t.grabs?t.grabs+' grabs':'',t.bounces?t.bounces+' bounces':'',t.ooch?t.ooch+' ooches':'',t.blasts?t.blasts+' blasts':''].filter(Boolean).join(' · ')||'Try grabbing, posing and ooching!'}
 else if(G.modeId==='mime'){sub=G.mBroke+'/5 windows · '+G.mt.toFixed(1)+'s'}
 else if(G.modeId==='raccoon'){sub='raccoons '+G.rc+'/'+G.rcs.length+(G.rc>=G.rcs.length?' · wave cleared!':' · not all of them')}
 else if(G.modeId==='target'){sub=G.tg.filter(t=>t.hit).length+'/12 targets'}
 const bigS=big.length>9?30:44;txt(head,W/2,y,head.length>16?18:22,'#ffd23a');y+=big?44:24;if(big){txt(big,W/2,y,bigS,'#fff');y+=36}if(sub){y+=para(sub,W/2,y,pw-30,17,'#e8f0ff')}
 const bw=(pw-36)/2,by=py+ph-66;drawBtn(btn('replay',px+12,by,bw,52,'▶ REPLAY',()=>startReplay(),{style:'alt',dis:!G.rec.length,fs:18}));drawBtn(btn('next',px+24+bw,by,bw,52,'NEXT',()=>nextAfterTally(),{style:'main',fs:20}));ctx.globalAlpha=1}
function uiPass(){ctx.fillStyle='rgba(8,10,30,.82)';ctx.fillRect(0,0,W,H);const n=G.cur+1;txt('📱',W/2,H*.3,60,'#fff',false);txt('HAND THE PHONE TO',W/2,H*.42,22,'#fff');txt('PLAYER '+n,W/2,H*.42+42,44,n===1?'#ffd23a':'#3fb7ff');
 if(G.modeId==='ouch'){const s=G.set?'Copy the shot: hit '+G.set.name.toUpperCase()+' first and beat '+fmt(G.set.pts):'You set the shot. Hit something cool first!';para(s,W/2,H*.42+92,Math.min(W-40,520),18,'#ffcf7a');para('P1: '+(G.letters[0]||'-')+'   ·   P2: '+(G.letters[1]||'-'),W/2,H*.42+150,W-40,20,'#fff')}
 if(G.modeId==='bowl'){para('P1 '+bowlScore(G.rolls[0],G.frames).total+'  ·  P2 '+bowlScore(G.rolls[1],G.frames).total+'. The other player gets the trap buttons!',W/2,H*.42+92,Math.min(W-40,520),18,'#ffcf7a')}
 const bw=Math.min(280,W-60);drawBtn(btn('ready',W/2-bw/2,Math.min(H-SAFE.b-90,H*.78),bw,62,"I'M READY",()=>{if(G.launch===0&&G.phase==='aim'){state='aim'}else setupLaunch(false)},{style:'green',fs:24}))}
function uiResult(){ctx.fillStyle='rgba(8,10,30,.7)';ctx.fillRect(0,0,W,H);const M=G.M;const pw=Math.min(W-24,440),ph=Math.min(H-SAFE.t-SAFE.b-20,PORT?470:360),px=W/2-pw/2,py=Math.max(SAFE.t+10,H/2-ph/2);panel(px,py,pw,ph);let y=py+40;
 txt(M.icon+' '+M.name,W/2,y,22,'#ffd23a');y+=46;
 if(G.modeId==='ouch'){txt(G.winner===0?'PLAYER 1 WINS!':G.winner===1?(G.cpu?'CPU WINS!':'PLAYER 2 WINS!'):'TIE GAME!',W/2,y,32,'#fff');y+=40;txt('P1: '+(G.letters[0]||'-')+'   P2: '+(G.letters[1]||'-'),W/2,y,22,'#ff9e3a');y+=30}
 else if(G.modeId==='bowl'){const a=bowlScore(G.rolls[0],G.frames),b=bowlScore(G.rolls[1],G.frames);if(G.players>1){txt(G.winner===0?'PLAYER 1 WINS!':G.winner===1?'PLAYER 2 WINS!':'TIE!',W/2,y,30,'#fff');y+=38;txt('P1 '+a.total+'  ·  P2 '+b.total,W/2,y,24,'#ffd23a');y+=30}else{txt(a.total+' / 150',W/2,y,44,'#fff');y+=40;txt(a.frames.map(f=>f==null?'-':f).join('  '),W/2,y,17,'#9fe6ff','center',false,'700 ');y+=24}}
 else{const v=M.unit?G.final+' '+M.unit:fmt(G.final);txt(v,W/2,y,44,'#fff');y+=40;if(G.scores.length&&G.modeId!=='bounce')txt(G.scores.map(s=>fmt(s)).join(' · '),W/2,y,15,'#9fe6ff','center',false,'700 ');else if(G.modeId==='bounce')txt(G.scores.map(s=>s.toFixed(1)+'m').join(' · '),W/2,y,15,'#9fe6ff','center',false,'700 ');y+=26}
 if(G.newBest&&G.modeId!=='ouch'){txt('★ NEW BEST! ★',W/2,y,24,'#ffd23a');y+=32}
 if(G.unlockedNow&&G.unlockedNow.length){txt('🔓 New stage: '+G.unlockedNow.map(s=>STAGES[s].name).join(', '),W/2,y,16,'#7dffb0','center',false,'800 ');y+=26}
 const nt=newTrophiesSession.concat(trophyQ.map(q=>q.k));if(nt.length){txt('Trophies: '+nt.map(k=>TROPHIES[k][0]).join(', '),W/2,y,15,'#ffcf7a','center',false,'700 ');y+=24}
 const bw=pw-40,bh=52;let by=py+ph-3*(bh+10)-6;drawBtn(btn('again',px+20,by,bw,bh,'PLAY AGAIN',()=>startGame(G.modeId,G.stageId,{players:G.players,cpu:G.cpu}),{style:'green'}));by+=bh+10;
 drawBtn(btn('modes',px+20,by,bw,bh,'OTHER MODES',()=>{startTitle();state='modes';G.uiState='modes'},{style:'alt'}));by+=bh+10;drawBtn(btn('menu',px+20,by,bw,bh,'MAIN MENU',()=>startTitle(),{style:'ghost'}))}
function uiPause(){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);const pw=Math.min(W-40,340),ph=330,px=W/2-pw/2,py=H/2-ph/2;panel(px,py,pw,ph);txt('PAUSED',W/2,py+36,28,'#ffd23a');const bw=pw-40;let y=py+64;
 drawBtn(btn('resume',px+20,y,bw,52,'RESUME',()=>resumeGame(),{style:'green'}));y+=62;drawBtn(btn('restart',px+20,y,bw,52,'RESTART',()=>startGame(G.modeId,G.stageId,{players:G.players,cpu:G.cpu}),{style:'alt'}));y+=62;
 drawBtn(btn('quit',px+20,y,bw,52,'QUIT TO MENU',()=>startTitle(),{style:'red'}));y+=66;soundBtns(W/2-52,y)}
// ---------- main loop ----------
function frame(now){requestAnimationFrame(frame);const rdt=Math.min(.05,((now-(lastNow||now))/1000));lastNow=now;frameT+=rdt;screenT+=rdt;menuBtns=[];
 try{
 let sdt=rdt*(window.__SPEED||1);if(slowT>0){slowT-=rdt;sdt*=slowK;if(slowT<=0)slowK=1}
 const run=state!=='pause'&&state!=='replay'&&state!=='pass';
 if(run&&world){acc+=sdt;let n=0;while(acc>=1/60&&n<(window.__SPEED>1?12:4)){physStep(1/60);acc-=1/60;n++}if(n>=4)acc=0}
 if(G&&G.cpu&&G.cur===1&&state==='aim'&&G.cpuT>0){G.cpuT-=rdt;if(G.cpuT<=0)launch()}
 if(state==='tally')G.tallyT+=rdt;if(state==='replay')replayStep(rdt);
 demoStep(sdt);camStep(rdt*Math.min(3,window.__SPEED||1));
 shake=Math.max(0,shake-rdt*2.2);punch=Math.max(0,punch-rdt*3);flash=Math.max(0,flash-rdt*2.5);const sm=Math.min(W,H)*.03*shake;SHX=rnd(-1,1)*sm;SHY=rnd(-1,1)*sm;
 if(G&&G.stage)drawWorld();
 setScreen();
 if(flash>0){ctx.fillStyle='rgba(255,240,200,'+flash*.7+')';ctx.fillRect(0,0,W,H)}
 if(slowT>0){const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(30,0,40,.45)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
 if(state==='replay'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H*.08);ctx.fillRect(0,H*.92,W,H*.08);if(Math.floor(frameT*2)%2)txt('● REPLAY',SAFE.l+70,H*.04+SAFE.t*.5,20,'#ff4040','center',false);txt('slow-mo · tap to skip',W/2,H*.96-SAFE.b*.3,16,'#fff','center',false,'700 ')}
 if(state==='title')uiTitle();else if(state==='modes')uiModes();else if(state==='mode')uiMode();else if(state==='locker')uiLocker();else if(state==='help')uiHelp();
 else if(G&&!G.demo&&state!=='replay'){if(state!=='pass')drawHUD();if(state==='tally')uiTally();if(state==='pass')uiPass();if(state==='result')uiResult();if(state==='pause')uiPause()}
 if(!(G&&G.demo)&&state!=='result'&&state!=='pass'&&state!=='pause')drawCalls(rdt);else if(G&&G.demo)CALL.length=0;drawTrophyToast(rdt);drawKbFocus();
 }catch(e){console.error(e);(window.__ERR=window.__ERR||[]).push(String(e&&e.stack||e))}}
window.onLayout=function(){BG=null};
// ---------- keyboard menu navigation (arrows/Tab move, Enter/Space select, Esc back) ----------
let kbFocus=null,kbT=-9;const PRI=['play','go','ready','again','next','resume'];
function kbDefault(L){return PRI.map(i=>L.find(b=>b.id===i)).find(Boolean)||L.find(b=>!/^(back|menu|mute|music|pause)$/.test(b.id))||L[0]}
function kbList(){return menuBtns.filter(b=>!b.dis&&b.cb)}
function drawKbFocus(){if(!kbFocus||frameT-kbT>8||PLAY[state])return;const b=menuBtns.find(q=>q.id===kbFocus);if(!b)return;setScreen();ctx.save();ctx.lineWidth=4;ctx.strokeStyle='#fff';ctx.shadowColor='#ffd23a';ctx.shadowBlur=12;rr(b.x-5,b.y-5,b.w+10,b.h+10,14);ctx.stroke();ctx.restore()}
function kbNav(code,e){const L=kbList();if(!L.length)return false;let cur=L.find(b=>b.id===kbFocus);
 if(code==='Enter'||code==='Space'||code==='NumpadEnter'){if(cur&&frameT-kbT<=8){SND.blip();cur.cb();kbT=frameT;return true}const pri=PRI.map(i=>L.find(b=>b.id===i)).find(Boolean);if(pri){SND.blip();pri.cb();return true}kbFocus=kbDefault(L).id;kbT=frameT;return true}
 const dir={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],KeyA:[-1,0],KeyD:[1,0],KeyW:[0,-1],KeyS:[0,1]}[code];
 if(code==='Tab'){const i=cur?L.indexOf(cur):-1;const n=L[(i+(e&&e.shiftKey?-1:1)+L.length)%L.length];kbFocus=n.id;kbT=frameT;return true}
 if(dir){if(!cur||frameT-kbT>8){kbFocus=kbDefault(L).id;kbT=frameT;return true}const cx=cur.x+cur.w/2,cy=cur.y+cur.h/2;let best=null,bd=1e9;
  for(const b of L){if(b===cur)continue;const dx=b.x+b.w/2-cx,dy=b.y+b.h/2-cy;const along=dx*dir[0]+dy*dir[1];if(along<=4)continue;const perp=Math.abs(dx*dir[1]-dy*dir[0]);const d=along+perp*2;if(d<bd){bd=d;best=b}}
  if(best){kbFocus=best.id;kbT=frameT;SND.blip()}return true}
 if(code==='Escape'||code==='Backspace'){const b=menuBtns.find(q=>q.id==='back'||q.id==='menu');if(b){b.cb();return true}if(state==='modes'||state==='locker'||state==='help'){state='title';G.uiState='title';return true}}
 return false}
{const _ok=window.onKey;window.onKey=function(code,down,e){if(_ok(code,down,e))return true;if(!down)return false;if(PLAY[state]||state==='tally'||state==='replay')return false;return kbNav(code,e)}}
// ---------- controller ----------
function initPad(){if(!window.GamepadSupport)return;let dpPrev={},stickPrev=0;
 GamepadSupport.init({
  keys:{a:function(p){if(!p)return;if(state==='aim')launch();else if(state==='fly')grabBtn();else if(state==='tally')nextAfterTally();else if(state==='replay')endReplay()},
   x:function(p){if(p&&state==='fly')grabBtn()},y:function(p){if(p&&state==='fly')toot()},b:function(p){if(p&&state==='fly'){const s=ctl.stick;superOoch(s.x,s.y)}else if(p&&state==='replay')endReplay()},
   lb:function(p){ctl.poseHeld=!!p},lt:function(p){ctl.poseHeld=!!p},rb:function(p){if(p&&(state==='fly'||state==='aim')){ctl.poseSel=(ctl.poseSel+1)%4;call(POSES[POSE_ORDER[ctl.poseSel]].name,'hold LB to pose','#7fd3ff',.7)}},
   up:function(){},down:function(){},left:function(){},right:function(){},
   start:function(p){if(!p)return;if(PLAY[state])pauseGame();else if(state==='pause')resumeGame()},back:function(p){if(p&&state==='tally')startReplay()}},
  noRepeat:['a','b','x','y','start','back','rb'],repeat:false,
  menu:function(){return !PLAY[state]&&state!=='replay'},
  items:GamepadSupport.list(function(){const L=menuBtns.filter(b=>!b.dis&&b.id!=='pose'&&b.id!=='cyc');const pr=L.filter(b=>PRI.includes(b.id));return pr.concat(L.filter(b=>!PRI.includes(b.id)))},{scale:1}),
  isPaused:function(){return state==='pause'},
  pause:function(){if(PLAY[state])pauseGame()},
  back:function(){if(state==='pause'){resumeGame();return true}const b=menuBtns.find(q=>q.id==='back'||q.id==='menu');if(b){b.cb();return true}if(state==='modes'||state==='locker'||state==='help'){state='title';G.uiState='title';return true}return true},
  onFrame:function(r,mode){ctl.stick={x:Math.abs(r.ax.x)>.18?r.ax.x:0,y:Math.abs(r.ax.y)>.18?r.ax.y:0};ctl.ry=Math.abs(r.ry)>.2?r.ry:0;
   if(mode!=='play')return;
   if(state==='aim'&&!(G.cpu&&G.cur===1)){const m=hyp(r.ax.x,r.ax.y);if(m>.35){G.aim.ang=clamp(Math.atan2(r.ax.y,r.ax.x),-1.45,.6);if(Math.abs(r.ry)<.2&&m>.5)G.aim.pow=clamp(m,.1,1)}}
   if(state==='fly'&&P&&P.touched&&!P.grab.length){const dp=r.dp;for(const [k,dx,dy] of [['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]]){if(dp[k]&&!dpPrev[k])doOoch(dx+(ctl.stick.x*.5),dy+(ctl.stick.y*.5))}
    const m=hyp(r.ax.x,r.ax.y);if(m>.85&&stickPrev<.4)doOoch(r.ax.x,r.ax.y);stickPrev=m}
   dpPrev=Object.assign({},r.dp)},
  hint:{text:'🎮 Controller: stick aims, A fires/grabs, LB pose, D-pad ooch, Start pause',when:function(){return state==='title'}}})}
// track swipe direction for SUPER button
const _op=window.onPtr;window.onPtr=function(k,p){if(k==='move'&&state==='fly'){const dx=p.x-p.sx,dy=p.y-p.sy;if(hyp(dx,dy)>20)ctl.lastSwipe={x:dx,y:dy}}_op(k,p)};
// ---------- QA hooks ----------
window.__PP={get state(){return state},get G(){return G},get P(){return P},start:(m,s,o)=>{startGame(m,s||MODES[m].stage,o||{});if(state==='pass'){state='aim'}},launch:(deg,pow)=>{if(state!=='aim')return false;G.aim.ang=-deg*Math.PI/180;G.aim.pow=pow;launch();return true},
 grab:()=>grabBtn(),ooch:(x,y)=>doOoch(x,y),superOoch:(x,y)=>superOoch(x,y),toot:()=>toot(),pose:(on,i)=>{if(i!=null)ctl.poseSel=i;ctl.poseHeld=!!on},next:()=>nextAfterTally(),ready:()=>{const b=menuBtns.find(q=>q.id==='ready');if(b)b.cb()},
 replay:()=>startReplay(),endReplay:()=>endReplay(),title:()=>startTitle(),menu:(s)=>{state=s;if(G)G.uiState=s},btns:()=>menuBtns.map(b=>({id:b.id,x:b.x,y:b.y,w:b.w,h:b.h,label:b.label})),
 near:()=>{if(!P)return false;for(const hi of [PI.larmF,PI.larmB])if(nearestGrab(P.parts[hi],1.5))return true;return false},grabbing:()=>!!(P&&P.grab.length),ents:()=>ENTS.filter(e=>e.alive).length,trap:k=>trap(k),
 peteStats:()=>{if(!P)return null;let maxJ=0;for(const j of P.joints){const a=j.getAnchorA(),b=j.getAnchorB();maxJ=Math.max(maxJ,hyp(a.x-b.x,a.y-b.y))}const c=peteCenter(),v=peteVel();return {x:c.x,y:c.y,vx:v.x,vy:v.y,maxJ,touched:P.touched,grab:P.grab.length,ooch:P.oochN}}};
// ---------- boot ----------
resize();startTitle();initPad();requestAnimationFrame(frame);
if(!save.seen){save.seen=true;persist()}
