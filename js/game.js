/* game: session, launch lifecycle, controls (slingshot, drift, poses, grab, ooch, super ooch, toot), scoring, camera, replay */
'use strict';
let G=null,state='title',prevState='title',CALL=[];
const cam={x:0,y:-8,z:20,tx:0,ty:-8,tz:20};
const PARTMULT=[1.4,1,2,.8,.8,.9,.9,.8,.8,.9,.9];
const BONES=[['TAILBONE','PELVIS','RIGHT IN THE PRIDE'],['RIBS','COLLARBONE','STERNUM','SPINE'],['SKULL','NOGGIN','JAW','BRAIN BUCKET'],['HUMERUS','SHOULDER'],['FUNNY BONE','WRIST','ELBOW'],['FEMUR','HIP'],['KNEECAP','SHIN','ANKLE'],['HUMERUS','SHOULDER'],['FUNNY BONE','WRIST','ELBOW'],['FEMUR','HIP'],['KNEECAP','SHIN','ANKLE']];
const SMALL=['OOF!','OUCH!','BONK!','WHACK!','THUD!','OW!','YOWCH!','SPLAT!'];
function call(text,sub,col,size){const l=CALL[CALL.length-1];if(l&&l.age<.35&&l.size>=1.2&&size>=1.2&&/CRUNCH/.test(l.text)&&/CRUNCH/.test(text)){l.text=text;l.sub=sub;l.age=.05;return}if(CALL.length>=3)CALL.shift();CALL.push({text,sub:sub||'',col:col||'#ffd23a',size:size||1,age:0,life:1.4});if(CALL.length>4)CALL.shift()}
function baseZoom(){return PORT?Math.min(W/12.5,H/24):Math.min(W/24,H/11)}
// ---------- session ----------
function newSession(modeId,stageId,opts){const M=MODES[modeId];G={modeId,M,stageId:stageId||M.stage,opts:opts||{},t:0,launch:0,scores:[],total:0,players:(opts&&opts.players)||1,cur:0,pscore:[0,0],letters:['',''],
 phase:'aim',aim:{ang:-.55,pow:.62},drag:null,launchPts:0,combo:1,chain:0,comboT:-9,first:null,log:[],flyT:0,rec:[],recOn:false,hits:{},stats:{},launchesBy:[0,0],
 touch(e,n){},firstTouch(o){if(!G.first)G.first=o;G.M.firstTouch&&G.M.firstTouch(o)},
 prop(e,pts,label,col){if(!flying()||!pts)return;addPts(pts,label,col,e.x,e.y-.6);G.M.prop&&G.M.prop(e)},
 glassBroken(g,o){G.M.glass&&G.M.glass(g,o)},boom(e){G.M.boomed&&G.M.boomed(e)},npcDown(e){G.M.npcDown&&G.M.npcDown(e)},raccoon(e){G.M.raccoon&&G.M.raccoon(e)},target(t,o){G.M.targetHit&&G.M.targetHit(t,o)},
 bounce(p,v){if(flying()){addPts(60,p.jet?'GEYSER!':'BOING!','#7dffea',p.x,p.y-.8);G.stats.bounces=(G.stats.bounces||0)+1}G.M.bounced&&G.M.bounced(p,v)},splash(){if(flying())addPts(150,'SPLASHDOWN!','#7fd3ff');G.M.splashed&&G.M.splashed()},
 grabbed(e){G.stats.grabs=(G.stats.grabs||0)+1;if(e.kind==='car'){trophy('hitch');addPts(300,'HITCHHIKER!','#7dffb0')}else addPts(50,null);if(G.stats.grabs>=3)trophy('swing');G.M.grabbed&&G.M.grabbed(e)},released(es){G.M.released&&G.M.released(es)},
 peteBoom(){G.stats.blasts=(G.stats.blasts||0)+1;if(G.stats.blasts>=3)trophy('kaboom');addPts(300,'HUMAN CANNONBALL!','#ff8a3a')}};
 if(M.init)M.init(G);setupLaunch(true);SND.music(G.stage.music)}
function setupLaunch(first){const M=G.M;
 if(first||!M.persist){G.stage=buildStage(G.stageId,G.modeId,M.build?(st=>{G.stage=st;M.build(G,st)}):null)}else{if(P){for(const g of P.grab)try{world.destroyJoint(g.j)}catch(e){};P.parts.forEach(kill)}}
 const s=G.stage.sling;makePete(s.x,s.y-.6,0);P.parts.forEach(e=>e.body.setGravityScale(0));
 G.phase='aim';state='aim';G.launchPts=0;G.chain=0;G.combo=1;G.first=null;G.flyT=0;G.stats={};G.rec=[];G.endT=0;CALL=[];G.tallyT=0;G.replay=null;
 if(M.aimDefault)Object.assign(G.aim,M.aimDefault(G));
 cam.tz=baseZoom()*.95;const vw=W/cam.tz;cam.tx=s.x+vw*.32;cam.ty=s.y-H/cam.tz*.1+(PORT?6:2);if(first){cam.x=cam.tx;cam.y=cam.ty;cam.z=cam.tz}
 if(M.beforeLaunch)M.beforeLaunch(G)}
function pouch(){const s=G.stage.sling,a=G.aim.ang,p=G.aim.pow;return {x:s.x-Math.cos(a)*p*2.4,y:s.y-.6-Math.sin(a)*p*2.4}}
function aimVel(){const a=G.aim.ang,sp=9+G.aim.pow*25;return {x:Math.cos(a)*sp,y:Math.sin(a)*sp}}
function launch(){if((state!=='aim'&&!G.demo)||G.phase!=='aim'||G.aim.pow<.08)return;const ui=state;const v=aimVel();P.parts.forEach(e=>e.body.setGravityScale(1));peteSetVel(v.x,v.y);P.bodies[2].setAngularVelocity(rnd(-2,2));P.bodies[0].setAngularVelocity(rnd(-3,3));
 state='fly';G.phase='fly';G.flyT=0;G.launch++;G.launchesBy[G.cur]++;if(G.demo){state=ui}else{save.stats.launches++;trophy('first')}SND.twang();SND.voice(.5);addShake(.15);G.recOn=true;
 burst('dust',G.stage.sling.x,G.stage.sling.y,8,3,{life:.5,size:.3,g:0,col:'rgba(255,255,255,.7)'});if(G.M.launched)G.M.launched(G)}
// ---------- scoring ----------
function addPts(pts,label,col,x,y){if(!G)return;const m=G.combo*P.poseMult;const v=Math.round(pts*m);G.launchPts+=v;if(label){if(x!==undefined)pop(x,y,label+' +'+fmt(v),col,1);else call(label,'+'+fmt(v),col)}}
function painHit(i,dv,other){const t=G.t;if(t-G.comboT<1.5)G.chain++;else G.chain=1;G.comboT=t;const prev=G.combo;G.combo=Math.min(5,1+Math.floor(G.chain/3)*.5);if(Math.floor(G.combo)>Math.floor(prev)&&G.combo>=2){call('COMBO x'+G.combo,'','#ff6bd6',.8);SND.ding(G.combo*2)}
 const pts=(dv-2.2)*15*PARTMULT[i];const e=P.parts[i];
 if(i===2){save.stats.heads++;P.dizzy=Math.max(P.dizzy,dv>9?2.5:1)}
 P.faceT=.8;const big=dv>13,mid=dv>7.5;
 if(big){const b=pick(BONES[i]);addPts(pts,null);call(b+(i===0&&b==='RIGHT IN THE PRIDE'?'!':' CRUNCH!'),'+'+fmt(pts*G.combo*P.poseMult),'#ff5a4a',1.25);SND.crunch(1);SND.voice(1);SND.crowd(.8);slowmo(.32,.3);addShake(.5);punch=.6;burst('star',e.x,e.y,10,5,{life:.7,size:.22,g:0,col:'#fff59a'});G.stats.crunch=(G.stats.crunch||0)+1;if(G.stats.crunch>=5)trophy('crunch')}
 else if(mid&&G.t-(G.lastPop||0)>.25){G.lastPop=G.t;addPts(pts,pick(SMALL),'#ffd23a',e.x,e.y-.5);SND.thud(.8);SND.voice(.4);addShake(.22);burst('star',e.x,e.y,5,3,{life:.5,size:.16,g:0,col:'#fff59a'})}
 else{addPts(pts,null);SND.thud(clamp(dv/10,.15,.6));if(dv>4)burst('dust',e.x,e.y+.1,3,1.5,{life:.4,size:.2,g:0,col:'rgba(230,220,200,.6)'})}
 if(G.M.pain)G.M.pain(i,dv,other)}
function processHits(dt){if(!P)return;for(let i=0;i<11;i++){P.cool[i]-=dt;const I=P.hitAcc[i];if(I>0){const dv=I/P.bodies[i].getMass();if(dv>2.2&&P.cool[i]<=0&&flying()){painHit(i,dv,P.hitOther[i]);P.cool[i]=.14}P.hitAcc[i]=0}}}
// ---------- trophies ----------
const TROPHIES={first:['First Flight','Launch Pete for the first time'],k1:['Four Figures','Score 1,000 in one launch'],k5:['Pain Train','Score 5,000 in one launch'],k10:['Hall of Pain','Score 10,000 in one launch'],
 crunch:['Bone Collector','5 bone crunches in one launch'],kaboom:['Human Cannonball','Get blasted 3 times in one launch'],hitch:['Hitchhiker','Grab onto a moving car'],swing:['Monkey Bars','Grab 3 things in one launch'],
 ooch:['Ooch Master','Use all 4 ooches and the Super Ooch in one launch'],strike:['STRIKE!','Bowl a strike'],turkey:['Turkey','3 strikes in one game'],mime:['Mime Time','Finish Mime Toss'],raccoon:['Trash Panda Patrol','Finish Bonk the Raccoons'],
 moon:['To the Moon','Bounce 45 m high'],fragile:['Handle With Care','Land a perfect delivery'],ouch:['O-U-C-H Champ','Win a game of O-U-C-H'],pose:['Supermodel','Hold a pose for 6 seconds'],vegas:['Viva Las Pete','Unlock the Vegas Strip'],
 boom10:['Demolition Pete','Blow up 10 things in Kaboom Pinball'],glass:['Glass Act','Break 25 windows total']};
const OUTFITS=[['dummy','Crash Dummy',0],['elvis','Vegas Jumpsuit',3],['tux','Tuxedo',6],['hawaii','Hawaiian Shirt',9],['super','Super Pete',12]];
let trophyQ=[];
function trophy(k){if(G&&G.demo)return;if(save.trophies[k]||QA&&QA.noTrophy)return;save.trophies[k]=Date.now();persist();trophyQ.push({k,t:0});SND.cheer()}
function trophyCount(){return Object.keys(save.trophies).length}
// ---------- controls ----------
const ctl={drift:{x:0,y:0},poseHeld:false,poseSel:0,stick:{x:0,y:0},stickWas:0,rx:0,ry:0};
function doOoch(dx,dy){if(!flying()||!P||!P.touched||P.oochN<=0)return false;const n=hyp(dx,dy)||1;const used=4-P.oochN;const s=[8.5,6.5,5,3.6][used];peteAddVel(dx/n*s,dy/n*s-1.2);P.oochN--;P.oochT=0;G.stats.ooch=(G.stats.ooch||0)+1;
 const c=peteCenter();fx('ring',c.x,c.y,{life:.3,size:1.6,g:0,col:'#9ffcff'});burst('spark',c.x,c.y,8,6,{life:.35,size:.06,g:0,col:'#9ffcff'});SND.ooch(used);call('O-O-C-H'.split('-').slice(0,used+1).join(''),'ooch!','#9ffcff',.8);checkOochMaster();return true}
function superOoch(dx,dy){if(state!=='fly'||!P||!P.touched||P.superUsed)return false;let n=hyp(dx,dy);if(n<.1){const v=peteVel();dx=v.x>=0?1:-1;dy=-1;n=hyp(dx,dy)}P.superUsed=true;peteAddVel(dx/n*17,dy/n*17-2);
 const c=peteCenter();fx('ring',c.x,c.y,{life:.5,size:3,g:0,col:'#ff7af5'});burst('spark',c.x,c.y,24,12,{life:.5,size:.08,g:0,col:'#ff7af5'});SND.superOoch();addShake(.3);call('SUPER OOCH!','','#ff7af5',1.1);checkOochMaster();return true}
function checkOochMaster(){if(P.superUsed&&(G.stats.ooch||0)>=4)trophy('ooch')}
function toot(){if(state!=='fly'||!P||P.tooted)return false;P.tooted=true;const v=peteVel();let n=hyp(v.x,v.y)||1;peteAddVel(v.x/n*6,v.y/n*6-3);const p=P.parts[0];for(let i=0;i<14;i++)fx('toot',p.x,p.y+.1,{vx:-v.x/n*rnd(2,5)+rnd(-1,1),vy:-v.y/n*rnd(2,5)+rnd(-1,1),life:rnd(.8,1.4),size:rnd(.3,.6),g:-.5,col:'rgba(140,200,60,.55)'});SND.toot();addPts(100,'TOOT BOOST!','#a6e05a',p.x,p.y-.8);return true}
function grabBtn(){if(state==='aim'){launch();return}if(state!=='fly')return;if(G.M.noGrab)return;if(P.grab.length){const d=ctl.drift;releaseGrab({x:d.x*5+(peteVel().x>=0?3:-3),y:d.y*5-2});return}if(!tryGrab()){pop(P.parts[8].x,P.parts[8].y-.6,'nothing to grab','rgba(255,255,255,.7)',.7)}}
function controlStep(dt){if(!P||!G)return;
 if(G.phase==='aim'){let ax=0,ay=0;if(keys.ArrowLeft||keys.KeyA)ax-=1;if(keys.ArrowRight||keys.KeyD)ax+=1;if(keys.ArrowUp||keys.KeyW)ay-=1;if(keys.ArrowDown||keys.KeyS)ay+=1;
  if(ax||ay){G.aim.ang=clamp(G.aim.ang+(ay*1.1-ax*0)*dt,-1.45,.6);G.aim.pow=clamp(G.aim.pow+ax*.7*dt,.08,1)}
  if(Math.abs(ctl.ry)>.2)G.aim.pow=clamp(G.aim.pow-ctl.ry*.8*dt,.08,1);
  const p=pouch();petePlace(p.x,p.y,-.2);return}
 if(!flying())return;
 // drift (flight steering) — touch drag, keys or stick
 let dx=ctl.drift.x,dy=ctl.drift.y;if(!P.touched||P.grab.length){let kx=0,ky=0;if(keys.ArrowLeft||keys.KeyA)kx-=1;if(keys.ArrowRight||keys.KeyD)kx+=1;if(keys.ArrowUp||keys.KeyW)ky-=1;if(keys.ArrowDown||keys.KeyS)ky+=1;if(kx||ky){dx=kx;dy=ky}
  if(hyp(ctl.stick.x,ctl.stick.y)>.2){dx=ctl.stick.x;dy=ctl.stick.y}}
 const dm=Math.min(1,hyp(dx,dy));if(dm>.05&&(!P.touched||P.grab.length)){const n=hyp(dx,dy);const acc=P.grab.length?9:5.5;for(const b of P.bodies){const m=b.getMass();b.applyForceToCenter(V2(dx/n*dm*acc*m,dy/n*dm*acc*m*.8),true)}}
 // poses
 const want=ctl.poseHeld||keys.ShiftLeft||keys.ShiftRight||keys.KeyZ;const pk=POSE_ORDER[ctl.poseSel];
 if(want&&!G.M.noPose){if(P.pose!==pk){P.pose=pk;P.poseT=0;call(POSES[pk].name,'hold it for a bonus','#7fd3ff',.9);SND.blip()}P.poseT+=dt;setMotors(POSES[pk].t,260);
  const v=peteVel(),sp=hyp(v.x,v.y)||1;
  if(pk==='superman'){for(const b of P.bodies){const m=b.getMass();b.applyForceToCenter(V2(v.x/sp*4*m,v.y/sp*4*m-GRAV*.25*m),true)}const ch=P.bodies[1];const ta=Math.atan2(v.y,v.x)+Math.PI/2;ch.setAngularVelocity(clamp(angDiff(ta,ch.getAngle())*6,-8,8))}
  else if(pk==='heli'){P.bodies[0].setAngularVelocity(14);for(const b of P.bodies){b.applyForceToCenter(V2(0,-GRAV*.3*b.getMass()),true)}}
  else if(pk==='cannon'){P.bodies[1].setAngularVelocity(P.bodies[1].getAngularVelocity()*.98+.25)}
  else if(pk==='starfish'){for(const b of P.bodies){const vv=b.getLinearVelocity();b.applyForceToCenter(V2(-vv.x*.25*b.getMass(),-vv.y*.35*b.getMass()),true)}}
  if(P.poseT>2*P.poseMult&&P.poseMult<4){P.poseMult++;call('POSE BONUS x'+P.poseMult,POSES[pk].name,'#7fd3ff',1);SND.ding(P.poseMult*3)}if(P.poseT>6)trophy('pose')}
 else if(P.pose){P.pose=null;P.poseT=0;setMotors(null)}
 // ooch recharge (keep moving 2 s)
 if(P.touched){P.oochT+=dt;const v=peteVel();if(P.oochN<4&&P.oochT>2&&hyp(v.x,v.y)>1.5){P.oochN++;P.oochT=0;SND.blip()}}}
function flying(){return G&&G.phase==='fly'&&(state==='fly'||G.demo)}
function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d}
// pointer handling for gameplay
window.onPtr=function(kind,p){if(state==='aim'){const full=Math.min(W,H)*.36;
  if(kind==='down'){G.drag={sx:p.x,sy:p.y}}
  else if(kind==='move'&&G.drag){const dx=p.x-G.drag.sx,dy=p.y-G.drag.sy,d=hyp(dx,dy);if(d>8){G.aim.ang=clamp(Math.atan2(-dy,-dx),-1.45,.6);const np=clamp(d/full,.08,1);if(Math.abs(np-G.aim.pow)>.04)SND.stretch(np);G.aim.pow=np}}
  else if(kind==='up'&&G.drag){const moved=hyp(p.x-G.drag.sx,p.y-G.drag.sy);G.drag=null;if(moved>14&&G.aim.pow>.1)launch()}
  else if(kind==='cancel')G.drag=null;return}
 if(state==='fly'){if(kind==='down'){ctl.drift={x:0,y:0};ctl.tch={sx:p.x,sy:p.y,t:performance.now()}}
  else if(kind==='move'&&ctl.tch){const dx=p.x-ctl.tch.sx,dy=p.y-ctl.tch.sy,d=hyp(dx,dy);const R=Math.min(W,H)*.16;if(!P.touched||P.grab.length)ctl.drift=d>10?{x:dx/R,y:dy/R}:{x:0,y:0};
   else if(d>30&&!ctl.tch.used){ctl.tch.used=true;doOoch(dx,dy)}}
  else if(kind==='up'||kind==='cancel'){if(ctl.tch&&!ctl.tch.used&&P.touched&&!P.grab.length){const dx=p.x-ctl.tch.sx,dy=p.y-ctl.tch.sy;if(hyp(dx,dy)>26)doOoch(dx,dy)}ctl.tch=null;ctl.drift={x:0,y:0}}return}
 if(state==='tally'&&kind==='up'&&p.moved<10){if(G.tallyT>.6)nextAfterTally()}
 if(state==='replay'&&kind==='up'&&p.moved<10)endReplay()};
window.onKey=function(code,down){if(!down){return false}
 if(state==='aim'&&(code==='Space'||code==='Enter')){launch();return true}
 if(state==='fly'){if(code==='Space'||code==='KeyE'||code==='KeyX'&&!keys.ShiftLeft){grabBtn();return true}
  if(code==='KeyC'||code==='KeyB'){const d=keyDir();superOoch(d.x,d.y);return true}if(code==='KeyT'||code==='KeyY'){toot();return true}
  if(code==='KeyQ'||code==='KeyR'&&false){ctl.poseSel=(ctl.poseSel+1)%4;SND.blip();return true}
  if(/^Digit[1-4]$/.test(code)){ctl.poseSel=+code[5]-1;return true}
  if(P&&P.touched&&!P.grab.length&&/^(Arrow|Key[WASD]$)/.test(code)){const d=keyDir(code);if(d.x||d.y)doOoch(d.x,d.y);return true}}
 if((code==='Escape'||code==='KeyP')&&(state==='aim'||state==='fly')){pauseGame();return true}
 if(code==='Escape'&&state==='pause'){resumeGame();return true}
 if(state==='tally'&&(code==='Space'||code==='Enter')){nextAfterTally();return true}
 if(state==='tally'&&code==='KeyR'){startReplay();return true}
 if(state==='replay'&&(code==='Space'||code==='Enter'||code==='Escape'||code==='KeyR')){endReplay();return true}
 return false};
function keyDir(code){let x=0,y=0;const k=Object.assign({},keys);if(code)k[code]=true;if(k.ArrowLeft||k.KeyA)x-=1;if(k.ArrowRight||k.KeyD)x+=1;if(k.ArrowUp||k.KeyW)y-=1;if(k.ArrowDown||k.KeyS)y+=1;return {x,y}}
function pauseGame(){if(state==='pause')return;prevState=state;state='pause';SND.blip()}
function resumeGame(){if(state!=='pause')return;state=prevState}
// ---------- per-frame game step ----------
function physStep(dt){if(!world)return;controlStep(dt);world.step(dt/2,8,5);world.step(dt/2,8,5);
 while(Q.length){const f=Q.shift();try{f()}catch(e){console.warn(e)}}
 physUpkeep(dt);syncAll();processHits(dt);if(P&&P.padCd>0)P.padCd-=dt;
 if(G){G.t+=dt;if(flying())flyStep(dt)}
 for(const f of FX){f.age+=dt;f.vy+=f.g*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.rot+=f.vr*dt;if(f.t==='smoke'||f.t==='toot'){f.vx*=.97;f.vy*=.97}}
 for(let i=FX.length-1;i>=0;i--)if(FX[i].age>=FX[i].life)FX.splice(i,1);
 for(const p of POPS){p.age+=dt;p.y-=dt*1.2}for(let i=POPS.length-1;i>=0;i--)if(POPS[i].age>POPS[i].life)POPS.splice(i,1)}
function flyStep(dt){G.flyT+=dt;const c=peteCenter(),v=peteVel(),sp=hyp(v.x,v.y);SND.wind(sp);
 if(-c.y>P.peakH)P.peakH=-c.y;
 // flips: accumulate chest rotation
 const a=P.bodies[1].getAngle();P.angAcc+=angDiff(a,P.lastAng);P.lastAng=a;if(Math.abs(P.angAcc)>TAU){P.angAcc-=Math.sign(P.angAcc)*TAU;if(!P.touched||sp>4)addPts(120,'FLIP!','#c9a0ff',c.x,c.y-1.2)}
 if(P.dizzy>0)P.dizzy-=dt;if(P.faceT>0)P.faceT-=dt;
 // fuse crate / grab upkeep
 for(const g of P.grab){g.t+=dt}
 if(!G.demo&&G.recOn&&(Math.round(G.flyT*60)%2===0))recordFrame();
 if(G.M.flyStep)G.M.flyStep(G,dt);
 const done=G.M.isEnd?G.M.isEnd(G):null;
 if(P.touched&&!P.grab.length&&sp<.8){P.still+=dt}else P.still=0;
 if(done||P.still>1.1||G.flyT>(G.M.maxFly||24)||(P.water>2.2)||c.x>G.stage.x1+6||c.y>8)endLaunch()}
function endLaunch(){if(state!=='fly')return;SND.wind(0);if(P.grab.length)releaseGrab();if(P.pose){P.pose=null;setMotors(null)}
 G.recOn=false;state='tally';G.phase='tally';G.tallyT=0;const pts=Math.round(G.launchPts);G.lastPts=pts;
 if(pts>=1000)trophy('k1');if(pts>=5000)trophy('k5');if(pts>=10000)trophy('k10');if(save.stats.glass>=25)trophy('glass');
 if(G.M.tally)G.M.tally(G,pts);else{G.scores.push(pts);G.total+=pts}
 if(pts>2500)SND.cheer();else if(pts<200)SND.sad();persist()}
function nextAfterTally(){if(state!=='tally')return;const M=G.M;const r=M.next?M.next(G):(G.launch>=M.launches?'result':'again');
 if(r==='result')finishMode();else if(r==='pass'){state='pass'}else setupLaunch(false)}
function finishMode(){const M=G.M;G.final=M.final?M.final(G):G.total;const key=G.modeId+(M.perStage?':'+G.stageId:'');G.bestKey=key;G.newBest=false;
 if(M.best!==false&&G.final>(save.best[key]||0)&&(!M.lowBetter)){save.best[key]=G.final;G.newBest=true}
 if(M.lowBetter&&G.final>0&&(!save.best[key]||G.final<save.best[key])){save.best[key]=G.final;G.newBest=true}
 checkUnlocks();persist();state='result';if(G.newBest)SND.cheer()}
function checkUnlocks(){G.unlockedNow=[];for(let i=1;i<STAGE_ORDER.length;i++){const id=STAGE_ORDER[i];if(!save.best['unl:'+id]&&(save.best['pain:'+STAGE_ORDER[i-1]]||0)>=UNLOCK_AT){save.best['unl:'+id]=1;if(id==='vegas')trophy('vegas');G.unlockedNow.push(id)}}}
const UNLOCK_AT=20000;
function stageUnlocked(id){const i=STAGE_ORDER.indexOf(id);if(i<=0)return true;if(QA&&QA.unlockAll)return true;const prev=STAGE_ORDER[i-1];return (save.best['pain:'+prev]||0)>=UNLOCK_AT||!!save.best['unl:'+id]}
// ---------- replay ----------
const RKINDS=new Set(['pete','crate','barrel','glass','sign','car','wheel','npc','raccoon','pin','donut','wball','gondola','debris','girder','porta','dice','target']);
function recordFrame(){if(G.rec.length>900)return;const a=[];for(const e of ENTS){if(!e.alive||!RKINDS.has(e.kind))continue;a.push(e.id,e.x,e.y,e.a)}G.rec.push({d:Float32Array.from(a),cx:0})}
function startReplay(){if(!G||!G.rec.length)return;G.replay={i:0,t:0,speed:.5,saved:ENTS.map(e=>[e,e.x,e.y,e.a,e.alive])};state='replay';SND.blip()}
function replayStep(dt){const R=G.replay;R.t+=dt*R.speed*30;R.i=Math.floor(R.t);if(R.i>=G.rec.length){endReplay();return}
 const f=G.rec[R.i].d;const map=new Map();for(let k=0;k<f.length;k+=4)map.set(f[k],k);
 for(const [e] of R.saved){if(!RKINDS.has(e.kind)){continue}const k=map.get(e.id);if(k===undefined){e.rHide=true;continue}e.rHide=false;e.x=f[k+1];e.y=f[k+2];e.a=f[k+3]}}
function endReplay(){if(!G.replay)return;for(const [e,x,y,a] of G.replay.saved){e.x=x;e.y=y;e.a=a;e.rHide=false}G.replay=null;state='tally';G.tallyT=1}
// ---------- camera ----------
function camStep(dt){const bz=baseZoom();const S=G&&G.demo?(G.phase==='fly'?'fly':'aim'):state;let tx=cam.tx,ty=cam.ty,tz=cam.tz;
 if((S==='fly'||S==='replay'||S==='tally')&&P){const rp=S!=='fly';const c=rp?{x:(P.parts[0].x+P.parts[1].x)/2,y:(P.parts[0].y+P.parts[1].y)/2}:peteCenter();const v=rp?{x:0,y:0}:peteVel(),sp=hyp(v.x,v.y);
  tz=bz*clamp(1.25-sp/60,.84,1.25)*(S==='replay'?1.2:1);let hi=false;if(S==='fly'){const need=(-c.y)*1.25+5;if(H/need<tz){tz=Math.max(bz*.5,H/need);hi=true}}const vw=W/tz,vh=H/tz;tx=c.x+clamp(v.x*.3,-vw*.22,vw*.22);const gl=-vh*(PORT?.36:.33);ty=hi?Math.min(gl,c.y+.38*vh):Math.min(c.y+clamp(v.y*.2,-vh*.2,vh*.2),gl)}
 else if(S==='aim'&&G){tz=bz*.92;const vw=W/tz,vh=H/tz;tx=G.stage.sling.x+vw*.3;ty=Math.min(G.stage.sling.y+vh*.06,-vh*(PORT?.36:.33))}
 const k=1-Math.exp(-dt*(S==='fly'?5:3));cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;cam.z+=(tz-cam.z)*(1-Math.exp(-dt*2.2));
 const vw=W/cam.z;if(G&&G.stage){cam.x=clamp(cam.x,G.stage.x0+vw*.5,Math.max(G.stage.x0+vw*.5,G.stage.x1+8-vw*.5))}}
