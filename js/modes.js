/* modes: Pain Mode, Mime Toss, Bonk the Raccoons, Kaboom Pinball, Pete Bowling, O-U-C-H, Highest Bounce, Target Smash, Handle With Care */
'use strict';
const MODE_ORDER=['pain','mime','raccoon','kaboom','bowl','ouch','bounce','target','fragile'];
const RACCOON_PERCH={city:[[24,-13.6],[34,-7.5],[33,-14],[42,-2.75],[86,-4],[96,-10],[66,-23.8],[119,-17],[140,-6],[16,0],[55,0],[105,0],[131,0],[25,-6.8],[67,-10.2]]};
function bowlScore(rolls,frames){let s=0,i=0;const fs=[];for(let f=0;f<frames;f++){if(i>=rolls.length)break;if(rolls[i]===10){if(rolls[i+2]===undefined){fs.push(null);break}s+=10+rolls[i+1]+rolls[i+2];i+=1}
 else{if(rolls[i+1]===undefined){fs.push(null);break}if(rolls[i]+rolls[i+1]===10){if(rolls[i+2]===undefined){fs.push(null);break}s+=10+rolls[i+2]}else s+=rolls[i]+rolls[i+1];i+=2}fs.push(s)}return {total:s,frames:fs}}
const MODES={
 pain:{name:'Pain Mode',icon:'💥',desc:'Score attack. 5 launches into a smashable stage: hit hard, chain combos, grab, pose and ooch for points.',stage:'city',stagePick:true,launches:5,perStage:true},
 mime:{name:'Mime Toss',icon:'🤡',stage:'city',launches:12,persist:true,maxFly:20,
  desc:'Grab Marcel the mime off his balloons in mid-air, then throw him through the 5 gold-framed windows. Fewer launches and less time = more points.',
  init(G){G.mt=0;G.mBroke=0},
  build(G,st){G.mpanes=[[27,-19.5],[41,-17.5],[50,-12],[57,-21],[80,-15]].map(([x,y])=>{const g=glass(x,y,.12,1.5,{mimeOnly:true,brk:1.5,pts:1000,gold:true});return g});spawnMime(st)},
  beforeLaunch(G){if(G.launch>0){const m=ENTS.find(e=>e.type==='mime'&&e.alive);if(m)kill(m);spawnMime(G.stage)}},
  flyStep(G,dt){G.mt+=dt},
  glass(g,o){if(g.gold){G.mBroke++;call('MIME THROUGH GLASS!',G.mBroke+' of 5','#fff',1.2);SND.cheer()}},
  isEnd(G){return G.mBroke>=5&&!P.grab.length&&G.flyT>1.2},
  tally(G,pts){G.scores.push(pts)},
  next(G){return G.mBroke>=5||G.launch>=12?'result':'again'},
  final(G){if(G.mBroke<5)return G.mBroke*1000;trophy('mime');return Math.max(5000,Math.round(25000-G.mt*150-G.launch*900))},
  hud(G){return 'Windows '+G.mBroke+'/5 · '+G.mt.toFixed(1)+'s'}},
 raccoon:{name:'Bonk the Raccoons',icon:'🦝',stage:'city',launches:10,maxFly:20,
  desc:'Trash pandas have taken over downtown. Bonk every raccoon in a wave in ONE launch. Waves get bigger: 1, 2, 3, then 4.',
  init(G){G.wave=0;G.waves=[1,2,3,4];G.left=[];G.rc=0},
  build(G,st){const per=RACCOON_PERCH.city.slice();const n=G.waves[Math.min(G.wave,3)];
   // the same spots for a wave until it's cleared
   if(!G.spots||G.spotWave!==G.wave){G.spotWave=G.wave;G.spots=[];const pool=per.slice();for(let i=0;i<n;i++){G.spots.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0])}}
   G.rcs=G.spots.map(([x,y])=>raccoon(x,y));G.rc=0},
  raccoon(e){G.rc++;if(G.rc>=G.rcs.length){call('WAVE CLEARED!','','#c3ff6b',1.3);SND.cheer()}},
  isEnd(G){return G.rc>=G.rcs.length&&G.flyT>1.5},
  tally(G,pts){G.scores.push(pts);G.total+=pts;if(G.rc>=G.rcs.length){G.wave++;G.spots=null}},
  next(G){return G.wave>=4||G.launch>=10?'result':'again'},
  final(G){if(G.wave>=4)trophy('raccoon');return G.wave*2500+(G.wave>=4?(10-G.launch)*1500:0)+Math.round(G.total*.1)},
  hud(G){return 'Wave '+Math.min(G.wave+1,4)+'/4 · bonked '+G.rc+'/'+(G.rcs?G.rcs.length:0)}},
 kaboom:{name:'Kaboom Pinball',icon:'🧨',stage:'site',launches:3,
  desc:'Human pinball. The site is packed with TNT. Bounce from crate to crate and chain the blasts — the bonus grows with every boom.',
  build(G,st){const spots=[[12,-6],[18,-9],[25,-5],[28,-13],[40,-7],[44,-14],[56,-6],[62,-10],[68,-15],[72,-7],[88,-6],[92,-11],[100,-15],[104,-8],[112,-12],[128,-9]];
   for(const [x,y] of spots){staticBox('building',x,y+.55,.9,.1,{style:'plank',col:'#8a6a3a'});tnt(x,y,{})}},
  launched(G){G.kb=0},boomed(e){G.kb=(G.kb||0)+1;if(G.kb>1)call(G.kb+' BOOM CHAIN','+'+fmt(G.kb*150),'#ff8a3a',1)},
  tally(G,pts){const bonus=(G.kb||0)*(G.kb||0)*150;G.lastBonus=bonus;if((G.kb||0)>=10)trophy('boom10');pts+=bonus;G.lastPts=pts;G.scores.push(pts);G.total+=pts},
  hud(G){return 'Booms this launch: '+(G.kb||0)}},
 bowl:{name:'Pete Bowling',icon:'🎳',stage:'lane',persist:true,maxFly:16,players:[1,2],
  desc:'Bowl Pete down Main Street into 10 giant pins. 5 frames, real bowling scoring. In 2-player, the waiting player gets 3 booby traps to set off during your roll!',
  aimDefault(){return {ang:-.18,pow:.75}},
  init(G){G.rolls=[[],[]];G.frames=5;G.cur=0;G.traps=null;G.rackBalls=0;G.strikes=[0,0]},
  build(G,st){const surf=staticBox('ground',st.x1/2-6,-.06,st.x1/2-4,.06,{style:'lane'});surf.body.getFixtureList().setFriction(.18);resetPins(G,st)},
  beforeLaunch(G){if(G.needRack){resetPins(G,G.stage);G.needRack=false;G.rackBalls=0}G.traps=G.players>1?{manhole:1,ball:1,booth:1}:null},
  tally(G,pts){const r=G.rolls[G.cur],before=bowlState(r,G.frames);const down=G.pins.filter(p=>p.alive&&isPinDown(p));const n=down.length;down.forEach(kill);r.push(n);G.rackBalls++;
   const after=bowlState(r,G.frames),allDown=G.pins.every(p=>!p.alive);
   G.bowlMsg=allDown?(G.rackBalls===1?'STRIKE!':'SPARE!'):n===0?'GUTTER PETE':n+(n===1?' pin':' pins');
   if(G.bowlMsg==='STRIKE!'){trophy('strike');G.strikes[G.cur]++;if(G.strikes[G.cur]>=3)trophy('turkey');SND.cheer()}else if(allDown)SND.cheer();
   G.lastPts=n;G.turnOver=after.f>before.f||after.done;G.needRack=allDown||G.turnOver},
  next(G){const dn=i=>bowlState(G.rolls[i],G.frames).done;if(!G.turnOver)return 'again';
   if(G.players>1){const o=1-G.cur;if(!dn(o)){G.cur=o;return 'pass'}if(!dn(G.cur))return 'again';return 'result'}return dn(0)?'result':'again'},
  final(G){const a=bowlScore(G.rolls[0],G.frames).total,b=bowlScore(G.rolls[1],G.frames).total;G.winner=G.players>1?(a>b?0:b>a?1:-1):0;return a},
  hud(G){const p=G.players>1?'P'+(G.cur+1)+' · ':'';const f=bowlState(G.rolls[G.cur],G.frames);return p+'Frame '+Math.min(f.f+1,G.frames)+'/'+G.frames+' · ball '+(f.b+1)+' · '+bowlScore(G.rolls[G.cur],G.frames).total}},
 ouch:{name:'O-U-C-H',icon:'🅾️',stagePick:true,stage:'city',players:[2],maxFly:22,
  desc:'Pass-the-phone copycat (like H-O-R-S-E). The setter launches; the other player must hit the SAME thing first AND beat the score, or they get a letter. Spell O-U-C-H and you lose. Play a friend or the computer.',
  init(G){G.round=0;G.setter=0;G.cur=0;G.set=null;G.letters=['',''];G.msg=''},
  beforeLaunch(G){if(G.cpu&&G.cur===1){G.cpuT=1.2;G.aim.ang=rnd(-.9,-.2);G.aim.pow=rnd(.55,.95);if(G.set&&G.set.aim){G.aim.ang=G.set.aim.ang+rnd(-.05,.05);G.aim.pow=clamp(G.set.aim.pow+rnd(-.05,.05),.1,1)}}},
  firstTouch(o){},
  tally(G,pts){const f=G.first&&G.first.kind!=='ground'&&G.first.kind!=='tower'?G.first:null;const name=f?thingName(f):'the ground';
   if(G.cur===G.setter){if(!f||pts<=0){G.msg='No shot set (hit '+name+' first). Turn passes.';G.set=null;G.swap=true}else{G.set={id:f.id,name,pts,aim:{...G.aim}};G.msg='Shot set: hit '+name.toUpperCase()+' first and beat '+fmt(pts);G.swap=false}}
   else{const ok=G.set&&f&&f.id===G.set.id&&pts>G.set.pts;if(ok){G.msg='MATCHED! No letter.';SND.cheer()}else{const L='OUCH'[G.letters[G.cur].length];G.letters[G.cur]+=L;G.msg=(f&&G.set&&f.id===G.set.id?'Hit it but only '+fmt(pts)+'. ':'Missed '+(G.set?G.set.name:'it')+'. ')+'Letter '+L+'!';SND.sad()}G.set=null;G.swap=true;G.round++}},
  next(G){if(G.letters.some(l=>l.length>=4)||G.round>=14)return 'result';if(G.swap){G.setter=1-G.setter}G.cur=G.set?1-G.setter:G.setter;return (G.cpu&&G.cur===1)||(G.cpu&&G.cur===0&&false)?'again':'pass'},
  final(G){const w=G.letters[0].length<G.letters[1].length?0:G.letters[1].length<G.letters[0].length?1:-1;G.winner=w;if(w===0)trophy('ouch');return w===0?1:0},best:false,
  hud(G){return (G.cur===0?'P1':(G.cpu?'CPU':'P2'))+(G.cur===G.setter?' sets':' copies')+' · P1 '+(G.letters[0]||'-')+' · '+(G.cpu?'CPU ':'P2 ')+(G.letters[1]||'-')}},
 bounce:{name:'Highest Bounce',icon:'🚀',stage:'pier',launches:3,
  desc:'The boardwalk\'s super trampolines. Chain bounces and poses to go as high as you can. Best height of 3 launches counts.',
  build(G,st){pad(16,-.3,2,{min:24,k:1.15});pad(28,-6,1.6,{min:27,k:1.1,ang:.25});pad(40,-.3,2,{min:30,k:1.15});pad(86,-.3,2,{min:31,k:1.15})},
  tally(G,pts){const h=Math.max(0,P.peakH);G.scores.push(h);G.lastPts=pts;G.lastH=h;if(h>=45)trophy('moon')},
  final(G){return Math.round(Math.max(...G.scores)*10)/10},unit:'m',
  hud(G){return 'Height '+(P?Math.max(0,P.peakH).toFixed(1):'0')+' m · best '+(G.scores.length?Math.max(...G.scores).toFixed(1):'0')+' m'}},
 target:{name:'Target Smash',icon:'🎯',stage:'city',launches:3,persist:true,
  desc:'12 bullseyes are hidden around downtown. Fly through them — or throw crates and mimes at them. 3 launches.',
  build(G,st){G.tg=[[14,-8],[26,-16],[36,-17],[45,-6],[52,-13],[60,-8],[66,-26],[76,-9],[88,-7],[97,-13],[112,-6],[124,-20]].map(([x,y])=>target(x,y,.9))},
  tally(G,pts){G.scores.push(pts);G.total+=pts},
  isEnd(G){return G.tg.every(t=>t.hit)&&G.flyT>1},
  next(G){return G.tg.every(t=>t.hit)||G.launch>=3?'result':'again'},
  final(G){return G.tg.filter(t=>t.hit).length*1000+Math.round(G.total*.25)},
  hud(G){return 'Targets '+G.tg.filter(t=>t.hit).length+'/12'}},
 fragile:{name:'Handle With Care',icon:'📦',stage:'city',launches:3,noPose:false,
  desc:'Pete is wrapped in bubble wrap and marked FRAGILE. Land him on the giant air cushion without breaking him. Every hard hit cracks the wrap.',
  init(G){G.dels=[];G.spots=[46,88,128]},
  build(G,st){const x=G.spots[Math.min(G.launch,2)];G.cush=cushion(x,-.6,3.2,{});G.dmg=0;const cl=ENTS.filter(e=>e.alive&&Math.abs(e.x-x)<4.5&&e.body&&e.kind!=='ground'&&e.kind!=='cushion'&&e.kind!=='car'&&e.kind!=='wheel');cl.forEach(kill)},
  beforeLaunch(G){G.dmg=0},
  pain(i,dv,o){if(o&&o.kind==='cushion')return;G.dmg=Math.min(100,G.dmg+(dv-2)*(i===2?7:4));if(G.dmg>=100&&!G.broke){G.broke=true;call('FRAGILE: BROKEN!','the bubble wrap popped','#ff5a4a',1.2);SND.sad();for(let k=0;k<20;k++)fx('spark',P.parts[1].x,P.parts[1].y,{vx:rnd(-6,6),vy:rnd(-6,2),life:.5,size:.1,g:0,col:'#fff'})}},
  cushion(o,part){const v=peteVel();if(hyp(v.x,v.y)>2){peteSetVel(v.x*.25,Math.min(v.y*.1,1),true);SND.boing(.5);burst('dust',o.x,o.y-.6,10,3,{life:.5,size:.3,g:0,col:'rgba(255,255,255,.7)'})}},
  launched(G){G.broke=false},
  tally(G,pts){const c=peteCenter(),x=G.cush.x;const on=Math.abs(c.x-x)<3.4&&c.y>-3.5;let s=0;if(on&&!G.broke){const acc=1-Math.min(1,Math.abs(c.x-x)/3.4);s=Math.round(1000+acc*1500+(100-G.dmg)*25);G.dmsg=(acc>.75&&G.dmg<35?'PERFECT DELIVERY!':'DELIVERED!');if(G.dmsg[0]==='P')trophy('fragile')}else G.dmsg=G.broke?'BROKEN IN TRANSIT':'MISSED THE CUSHION';G.scores.push(s);G.total+=s;G.lastPts=s},
  hud(G){return 'Delivery '+Math.min(G.launch+(state==='aim'?1:0),3)+'/3 · wrap damage '+Math.round(G.dmg||0)+'%'}}
};
function bowlState(r,F){let i=0;for(let f=0;f<F;f++){if(f<F-1){if(i>=r.length)return {f,b:0,done:false};if(r[i]===10){i++;continue}if(i+1>=r.length)return {f,b:1,done:false};i+=2;continue}
 const t=r.slice(i);if(t.length<2)return {f,b:t.length,done:false};if(t.length===2)return (t[0]===10||t[0]+t[1]===10)?{f,b:2,done:false}:{f,b:2,done:true};return {f,b:3,done:true}}return {f:F,b:0,done:true}}
function resetPins(G,st){if(G.pins)G.pins.forEach(kill);const X=[[78],[80.3,80.95],[83,83.65,84.3],[86,86.65,87.3,87.95]];G.pins=[];X.forEach(row=>row.forEach(x=>G.pins.push(pin(x,0))))}
function isPinDown(p){return Math.abs(angDiff(p.a,0))>.55||hyp(p.x-p.x0,p.y-p.y0)>.9}
function spawnMime(st){const m=npc(17,-14.5,'mime',{pts:200});m.body.setGravityScale(0);m.float=true;m.fy=m.y;m.balloon=true;return m}
function thingName(e){const n={car:'the car',wheel:'the car',npc:e.type==='mime'?'the mime':e.type==='elvis'?'Elvis':'the bystander',sign:'the '+(e.text||'sign')+' sign',crate:'a crate',barrel:'a barrel',glass:'a window',building:'a building',pole:'the lamp post',pad:'a trampoline',donut:'the giant donut',wball:'the wrecking ball',gondola:'a Ferris wheel car',porta:'a porta-potty',girder:'a girder',dice:'the giant dice',slot:'a slot machine',water:'the water',target:'a target',raccoon:'a raccoon',pin:'a pin'}[e.kind];return n||('the '+e.kind)}
// bowling booby traps (2-player: the waiting player sets them off)
function trap(kind){if(!G||!G.traps||!G.traps[kind]||state!=='fly')return;G.traps[kind]=0;const c=peteCenter();SND.blip();
 if(kind==='manhole'){const x=c.x+rnd(1,3);fx('ring',x,0,{life:.4,size:2,g:0,col:'#fff'});burst('smoke',x,0,14,4,{life:1.2,size:.6,g:-3,col:'rgba(220,220,220,.7)'});SND.boom(.6);if(Math.abs(c.x-x)<3.5&&c.y>-4){peteAddVel(0,-17);call('MANHOLE GEYSER!','sabotage!','#ff9e3a')}}
 if(kind==='ball'){const b=body('dynamic',c.x+5,c.y-7,{linearVelocity:V2(-12,8)});fix(b,new pl.Circle(.9),{density:20,friction:.4,filterCategoryBits:CAT.PROP});ent('wball',b,{r:.9,ax:c.x+5,ay:c.y-14});call('WRECKING BALL!','sabotage!','#ff9e3a')}
 if(kind==='booth'){const b=body('dynamic',c.x+12,c.y-2,{linearVelocity:V2(-24,-4),angularVelocity:3});fix(b,BOX(.6,1.3),{density:5,friction:.5,filterCategoryBits:CAT.PROP});ent('porta',b,{hw:.6,hh:1.3,booth:true});call('FLYING PHONE BOOTH!','sabotage!','#ff9e3a')}}
