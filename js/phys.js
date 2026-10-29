/* physics: planck world, entities, Pete's ragdoll, props, contacts, explosions, particles */
'use strict';
const CAT={WORLD:1,PROP:2,DEBRIS:4,PETE:8,NPC:16};
const GRAV=12;
let world=null,ENTS=[],EID=1,Q=[],P=null,FX=[],POPS=[],SCORCH=[],JOINTS=[];
let shake=0,slowT=0,slowK=1,flash=0,punch=0;
function newWorld(){world=new pl.World({gravity:V2(0,GRAV)});world.on('pre-solve',preSolve);world.on('post-solve',postSolve);world.on('begin-contact',beginC);world.on('end-contact',endC);
 ENTS=[];Q=[];FX.length=0;POPS.length=0;SCORCH.length=0;JOINTS=[];P=null;EID=1}
function ent(kind,body,o){const e=Object.assign({id:EID++,kind,body,alive:true,x:0,y:0,a:0,born:0},o||{});if(body){body.setUserData(e);const p=body.getPosition();e.x=p.x;e.y=p.y;e.a=body.getAngle();e.x0=e.x;e.y0=e.y}ENTS.push(e);return e}
function body(type,x,y,o){return world.createBody(Object.assign({type,position:V2(x,y)},o||{}))}
function fix(b,shape,o){return b.createFixture(shape,Object.assign({density:1,friction:.6,restitution:.05},o||{}))}
const BOX=(hw,hh,cx,cy,a)=>new pl.Box(hw,hh,(cx||cy)?V2(cx||0,cy||0):undefined,a||0);
function kill(e){if(!e.alive)return;e.alive=false;e.deadT=G?G.t:0;if(e.body){try{world.destroyBody(e.body)}catch(x){}e.body=null}}
function syncAll(){for(const e of ENTS){if(!e.alive||!e.body)continue;const p=e.body.getPosition();e.x=p.x;e.y=p.y;e.a=e.body.getAngle()}}
// ---------- effects ----------
function fx(t,x,y,o){if(FX.length>700)FX.splice(0,60);const f=Object.assign({t,x,y,vx:0,vy:0,age:0,life:1,size:.15,rot:rnd(0,TAU),vr:rnd(-8,8),g:GRAV*.6,col:'#fff'},o||{});FX.push(f);return f}
function burst(t,x,y,n,sp,o){for(let i=0;i<n;i++){const a=rnd(0,TAU),s=rnd(.3,1)*sp;fx(t,x,y,Object.assign({vx:Math.cos(a)*s,vy:Math.sin(a)*s},typeof o==='function'?o(i):o))}}
function pop(x,y,text,col,size){POPS.push({x,y,text,col:col||'#ffd23a',size:size||1,age:0,life:1.2});if(POPS.length>40)POPS.shift()}
function addShake(k){shake=Math.min(1.4,shake+k)}
function slowmo(dur,k){if(QA&&QA.noSlow)return;slowT=Math.max(slowT,dur);slowK=Math.min(slowK,k||.25)}
// ---------- Pete's ragdoll ----------
// [name, kind, cx, cy, hw/r, hh] relative to pelvis center, standing, facing right (+x). y is down.
const RD=[['pelvis','box',0,0,.17,.13],['chest','box',0,-.41,.22,.27],['head','circ',0,-.87,.18],
 ['uarmB','box',-.03,-.45,.068,.16],['larmB','box',-.03,-.15,.058,.15],['thighB','box',-.03,.29,.088,.2],['shinB','box',-.03,.70,.078,.21],
 ['uarmF','box',.03,-.45,.068,.16],['larmF','box',.03,-.15,.058,.15],['thighF','box',.03,.29,.088,.2],['shinF','box',.03,.70,.078,.21]];
const PI={pelvis:0,chest:1,head:2,uarmB:3,larmB:4,thighB:5,shinB:6,uarmF:7,larmF:8,thighF:9,shinF:10};
// [a,b,ax,ay,lo,hi,name]
const RJ=[[0,1,0,-.14,-.65,.4,'spine'],[1,2,0,-.69,-.6,.6,'neck'],[1,3,-.03,-.6,-3.05,.9,'shoulder'],[3,4,-.03,-.3,-2.5,.02,'elbow'],[0,5,-.03,.08,-2.0,.6,'hip'],[5,6,-.03,.49,-.02,2.45,'knee'],
 [1,7,.03,-.6,-3.05,.9,'shoulder'],[7,8,.03,-.3,-2.5,.02,'elbow'],[0,9,.03,.08,-2.0,.6,'hip'],[9,10,.03,.49,-.02,2.45,'knee']];
const PDENS=80;
function makePete(x,y,ang){const parts=[],bodies=[];const c=Math.cos(ang||0),s=Math.sin(ang||0);
 for(let i=0;i<RD.length;i++){const [n,k,cx,cy,a,b]=RD[i];const px=x+cx*c-cy*s,py=y+cx*s+cy*c;
  const bd=body('dynamic',px,py,{angle:ang||0,bullet:true,angularDamping:.6,linearDamping:.02});
  fix(bd,k==='circ'?new pl.Circle(a):BOX(a,b),{density:n==='chest'||n==='pelvis'?PDENS*1.15:PDENS,friction:.7,restitution:.12,filterGroupIndex:-1,filterCategoryBits:CAT.PETE});
  const e=ent('pete',bd,{part:i,pname:n,hw:a,hh:b});parts.push(e);bodies.push(bd)}
 const joints=RJ.map(([a,b,ax,ay,lo,hi,nm])=>{const px=x+ax*c-ay*s,py=y+ax*s+ay*c;const j=world.createJoint(new pl.RevoluteJoint({enableLimit:true,lowerAngle:lo,upperAngle:hi,enableMotor:true,maxMotorTorque:4,motorSpeed:0},bodies[a],bodies[b],V2(px,py)));j.nm=nm;return j});
 let mass=0;bodies.forEach(b=>mass+=b.getMass());
 P={parts,bodies,joints,mass,grab:[],pose:null,poseT:0,poseHeld:0,poseMult:1,tooted:false,oochN:4,oochT:0,superUsed:false,hitAcc:new Float32Array(11),hitOther:new Array(11),cool:new Float32Array(11),
  faceT:0,dizzy:0,still:0,touched:false,padCd:0,water:0,maxY:y,minY:y,peakH:0,launched:false,flips:0,lastAng:ang||0,angAcc:0,cape:[]};
 return P}
function peteCenter(){const b=P.bodies[1].getWorldCenter(),a=P.bodies[0].getWorldCenter();return {x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
function peteVel(){let vx=0,vy=0,m=0;for(const b of P.bodies){const v=b.getLinearVelocity(),k=b.getMass();vx+=v.x*k;vy+=v.y*k;m+=k}return {x:vx/m,y:vy/m}}
function peteSetVel(vx,vy,keepSpin){for(const b of P.bodies){b.setLinearVelocity(V2(vx,vy));if(!keepSpin)b.setAngularVelocity(0);b.setAwake(true)}}
function peteAddVel(dx,dy){for(const b of P.bodies){const v=b.getLinearVelocity();b.setLinearVelocity(V2(v.x+dx,v.y+dy));b.setAwake(true)}}
function petePlace(x,y,ang){const c=Math.cos(ang),s=Math.sin(ang);for(let i=0;i<RD.length;i++){const [n,k,cx,cy]=RD[i];P.bodies[i].setTransform(V2(x+cx*c-cy*s,y+cx*s+cy*c),ang);P.bodies[i].setLinearVelocity(V2(0,0));P.bodies[i].setAngularVelocity(0)}}
// poses: target joint angles per joint index (RJ order) — null = limp
const POSES={
 superman:{name:'SUPER PETE',t:[-.15,-.25,-2.9,-.1,.15,.15,-2.75,-.1,.05,.3],em:'🦸'},
 cannon:{name:'CANNONBALL',t:[-.6,-.4,-1.3,-2.3,-1.95,2.4,-1.4,-2.3,-1.95,2.4],em:'💣'},
 heli:{name:'HELI-KICK',t:[.1,0,-1.6,-.2,-1.5,0,-1.6,-.2,.5,0],em:'🌀'},
 starfish:{name:'STARFISH',t:[0,0,-2.2,0,-.9,0,-.8,0,.5,0],em:'⭐'}};
const POSE_ORDER=['superman','cannon','heli','starfish'];
function setMotors(target,torque){P.joints.forEach((j,i)=>{if(target){const a=j.getJointAngle();j.setMaxMotorTorque(torque);j.setMotorSpeed(clamp((target[i]-a)*10,-16,16))}else{j.setMaxMotorTorque(4);j.setMotorSpeed(0)}})}
// ---------- props ----------
function staticBox(kind,x,y,hw,hh,o){const b=body('static',x,y,{angle:(o&&o.ang)||0});fix(b,BOX(hw,hh),{friction:.7,filterCategoryBits:CAT.WORLD});return ent(kind,b,Object.assign({hw,hh},o))}
function crate(x,y,s,o){const b=body('dynamic',x,y,{angularDamping:.1});fix(b,BOX(s,s),{density:10,friction:.6,filterCategoryBits:CAT.PROP});return ent('crate',b,Object.assign({hw:s,hh:s,hp:0,brk:120*s*s*4,pts:100,moved:false},o))}
function barrel(x,y,o){const b=body('dynamic',x,y);fix(b,BOX(.38,.5),{density:9,friction:.6,filterCategoryBits:CAT.PROP});return ent('barrel',b,Object.assign({hw:.38,hh:.5,brk:20,fuse:-1,pow:1},o))}
function tnt(x,y,o){const b=body('dynamic',x,y);fix(b,BOX(.45,.45),{density:8,friction:.6,filterCategoryBits:CAT.PROP});return ent('barrel',b,Object.assign({hw:.45,hh:.45,brk:16,fuse:-1,pow:1,tnt:true},o))}
function fuseCrate(x,y){const b=body('dynamic',x,y);fix(b,BOX(.42,.42),{density:7,friction:.6,filterCategoryBits:CAT.PROP});return ent('barrel',b,{hw:.42,hh:.42,brk:1e9,fuse:-1,pow:.9,fuseBox:true,grab:true})}
function glass(x,y,hw,hh,o){const b=body(o&&o.dyn?'dynamic':'static',x,y,{angle:(o&&o.ang)||0});fix(b,BOX(hw,hh),{density:3,friction:.2,filterCategoryBits:o&&o.dyn?CAT.PROP:CAT.WORLD});return ent('glass',b,Object.assign({hw,hh,brk:5,pts:150},o))}
function pad(x,y,hw,o){const b=body('static',x,y,{angle:(o&&o.ang)||0});fix(b,BOX(hw,.18),{friction:.3,filterCategoryBits:CAT.WORLD});return ent('pad',b,Object.assign({hw,hh:.18,k:1.05,min:16,cd:0,squash:0},o))}
function awning(x,y,hw,o){const b=body('static',x,y,{angle:(o&&o.ang)||-.12});fix(b,BOX(hw,.08),{friction:.3,filterCategoryBits:CAT.WORLD});return ent('pad',b,Object.assign({hw,hh:.08,k:.75,min:7,cd:0,awning:true,squash:0,col:pick(['#e84a4a','#2f8fd8','#3cb371','#f2a33a'])},o))}
function pole(x,y,h,o){const b=body('static',x,y-h/2);fix(b,BOX(.09,h/2),{friction:.5,filterCategoryBits:CAT.WORLD});return ent('pole',b,Object.assign({hw:.09,hh:h/2,grab:true,lamp:true},o))}
function wobSign(x,y,hw,hh,text,o){// sign on a pole, springy weld; breaks off on big hits
 const pe=pole(x,y,(o&&o.ph)||5,{lamp:false,col:'#555'});const top=y-((o&&o.ph)||5);
 const b=body('dynamic',x,top-hh,{angularDamping:.3});fix(b,BOX(hw,hh),{density:4,friction:.5,filterCategoryBits:CAT.PROP});
 const j=world.createJoint(new pl.WeldJoint({frequencyHz:2.2,dampingRatio:.12},pe.body,b,V2(x,top)));
 const e=ent('sign',b,Object.assign({hw,hh,text,joint:j,jmax:1800,grab:true,pts:250,col:'#1d6fd1',fg:'#fff'},o));JOINTS.push(e);return e}
function car(x,y,dir,speed,o){const hw=2.1,hh=.55;const b=body('dynamic',x,y,{angularDamping:.4});
 fix(b,new pl.Polygon([V2(-hw,hh*.2),V2(-hw,-hh*.6),V2(-hw*.45,-hh*.7),V2(-hw*.25,-hh*1.9),V2(hw*.35,-hh*1.9),V2(hw*.6,-hh*.7),V2(hw,-hh*.5),V2(hw,hh*.2)]),{density:22,friction:.5,filterCategoryBits:CAT.PROP});
 const wh=[];for(const wx of [-hw*.62,hw*.62]){const w=body('dynamic',x+wx,y+hh*.55);fix(w,new pl.Circle(.42),{density:12,friction:1.2,filterCategoryBits:CAT.PROP});
  const j=world.createJoint(new pl.WheelJoint({enableMotor:true,motorSpeed:dir*speed/.42,maxMotorTorque:900,frequencyHz:4,dampingRatio:.7},b,w,w.getPosition(),V2(0,1)));const we=ent('wheel',w,{r:.42});wh.push({b:w,j,e:we,dx:wx})}
 return ent('car',b,Object.assign({hw,hh,dir,speed,wh,grab:true,col:pick(['#e03b3b','#2d7be0','#f2c230','#38b26b','#8e44ad','#f07d2a']),hitPts:0,alarm:0,startX:x,startY:y},o))}
function npc(x,y,type,o){const b=body('dynamic',x,y-.85,{fixedRotation:true});
 fix(b,BOX(.24,.55,0,.15),{density:22,friction:.9,filterCategoryBits:CAT.NPC});fix(b,new pl.Circle(.2,V2(0,-.58)),{density:10,friction:.6,filterCategoryBits:CAT.NPC});
 const T=NPCT[type]||NPCT.ped;return ent('npc',b,Object.assign({type,down:false,face:rnd(0,1)<.5?-1:1,shirt:pick(T.shirts),hair:pick(['#3b2a1a','#111','#c9a13b','#888','#a0522d','#eee']),skin:pick(['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac']),look:0,bubble:null,knockI:30,pts:300,grab:true},T,o))}
const NPCT={ped:{shirts:['#e74c3c','#3498db','#2ecc71','#9b59b6','#f39c12','#1abc9c']},mime:{shirts:['#fff'],mime:true},worker:{shirts:['#ff8c1a'],hat:'hard'},tourist:{shirts:['#ff5fa2','#33d6ff','#ffe14d'],hat:'sun'},
 elvis:{shirts:['#fff'],elvis:true},granny:{shirts:['#b48ed8','#8ec7d8'],hat:'granny'},chef:{shirts:['#fff'],hat:'chef'}};
function raccoon(x,y,o){const b=body('dynamic',x,y-.35,{fixedRotation:true});fix(b,BOX(.32,.3),{density:6,friction:.9,filterCategoryBits:CAT.NPC});fix(b,new pl.Circle(.22,V2(.22,-.25)),{density:4,filterCategoryBits:CAT.NPC});
 return ent('raccoon',b,Object.assign({bonked:false,face:-1,taunt:rnd(0,3)},o))}
function pin(x,y,o){const b=body('dynamic',x,y-.85,{angularDamping:.2});
 fix(b,new pl.Polygon([V2(-.13,-.85),V2(.13,-.85),V2(.2,-.55),V2(.14,-.25),V2(.3,.25),V2(.26,.75),V2(.18,.85),V2(-.18,.85),V2(-.26,.75),V2(-.3,.25),V2(-.14,-.25),V2(-.2,-.55)]),{density:4,friction:.45,restitution:.2,filterCategoryBits:CAT.PROP});
 return ent('pin',b,Object.assign({hw:.3,hh:.85,down:false},o))}
function donutProp(bx,by,r,o){// giant donut hanging from a billboard on a hinge; grab it or knock it loose and it rolls
 const anchor=o.anchor;const b=body('dynamic',bx,by,{angularDamping:.05});fix(b,new pl.Circle(r),{density:3,friction:.9,restitution:.15,filterCategoryBits:CAT.PROP});
 const j=world.createJoint(new pl.RevoluteJoint({},anchor.body,b,V2(bx,by-r*.9)));const e=ent('donut',b,Object.assign({r,joint:j,jmax:2600,grab:true,pts:400},o));JOINTS.push(e);return e}
function wreckingBall(px,py,len,o){const anc=body('static',px,py);const b=body('dynamic',px+len*.7,py+len*.7,{angularDamping:.02,linearDamping:0});fix(b,new pl.Circle(1),{density:30,friction:.4,restitution:.1,filterCategoryBits:CAT.PROP});
 world.createJoint(new pl.RopeJoint({maxLength:len,localAnchorA:V2(0,0),localAnchorB:V2(0,0)},anc,b,V2(px,py)));world.createJoint(new pl.DistanceJoint({length:len,frequencyHz:0,dampingRatio:0},anc,b,V2(px,py),b.getPosition()));
 return ent('wball',b,Object.assign({r:1,ax:px,ay:py,grab:true,pts:150},o))}
function ferris(cx,cy,R,n,o){const hub=body('kinematic',cx,cy);hub.setAngularVelocity(.22);fix(hub,new pl.Circle(.5),{filterCategoryBits:CAT.WORLD,isSensor:true});
 const he=ent('ferris',hub,Object.assign({R,n,gond:[]},o));
 for(let i=0;i<n;i++){const a=i/n*TAU,x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;const g=body('dynamic',x,y+.9,{angularDamping:.8});fix(g,BOX(.8,.55),{density:4,friction:.6,filterCategoryBits:CAT.PROP});
  world.createJoint(new pl.RevoluteJoint({},hub,g,V2(x,y)));he.gond.push(ent('gondola',g,{hw:.8,hh:.55,grab:true,col:pick(['#ff5a5a','#ffd23a','#4fc3f7','#8bd448','#c77dff'])}))}
 return he}
function slot(x,y,o){return staticBox('slot',x,y-1.25,.8,1.25,Object.assign({pts:500,cd:0},o))}
function water(x0,x1,y,o){const b=body('static',(x0+x1)/2,y+4);fix(b,BOX((x1-x0)/2,4),{isSensor:true,filterCategoryBits:CAT.WORLD});return ent('water',b,Object.assign({hw:(x1-x0)/2,hh:4,top:y},o))}
function target(x,y,r,o){const b=body('static',x,y);fix(b,new pl.Circle(r),{isSensor:true,filterCategoryBits:CAT.WORLD});return ent('target',b,Object.assign({r,hit:false,pts:500},o))}
function cushion(x,y,hw,o){const b=body('static',x,y);fix(b,BOX(hw,.6),{friction:1.5,restitution:0,filterCategoryBits:CAT.WORLD});return ent('cushion',b,Object.assign({hw,hh:.6},o))}
function debris(x,y,hw,hh,vx,vy,col,kind){let n=0;for(const e of ENTS)if(e.kind==='debris'&&e.alive)n++;if(n>70){const o=ENTS.find(e=>e.kind==='debris'&&e.alive);if(o)kill(o)}
 const b=body('dynamic',x,y,{angle:rnd(0,TAU),angularVelocity:rnd(-10,10),linearVelocity:V2(vx,vy)});fix(b,BOX(hw,hh),{density:4,friction:.6,restitution:.2,filterCategoryBits:CAT.DEBRIS,filterMaskBits:CAT.WORLD|CAT.PROP});
 return ent('debris',b,{hw,hh,col,dk:kind||'wood',life:5+rnd(0,2)})}
// ---------- contacts ----------
const EA=c=>c.getFixtureA().getBody().getUserData(),EB=c=>c.getFixtureB().getBody().getUserData();
function cPoint(c){try{const m=c.getWorldManifold(null);if(m&&m.points&&m.points.length&&m.pointCount!==0)return m.points[0]}catch(e){}const a=c.getFixtureA().getBody().getPosition();return a}
function relSpeed(a,b){const va=a.body?a.body.getLinearVelocity():{x:0,y:0},vb=b.body?b.body.getLinearVelocity():{x:0,y:0};return hyp(va.x-vb.x,va.y-vb.y)}
function preSolve(c){const a=EA(c),b=EB(c);if(!a||!b)return;
 for(const [g,o] of [[a,b],[b,a]]){
  if(g.kind==='glass'&&o.kind!=='debris'&&!(g.mimeOnly&&o.type!=='mime')){const s=relSpeed(g,o);if(g.broken||s>(o.kind==='pete'?3.2:o.kind==='mime'||o.type==='mime'?1.5:g.brk)){c.setEnabled(false);if(!g.broken){g.broken=true;const v=o.body.getLinearVelocity();Q.push(()=>breakGlass(g,o,v))}}}
  if(g.kind==='water'){c.setEnabled(false)}
  if(g.kind==='npc'&&g.down&&o.kind==='pete'&&false)c.setEnabled(false);
 }}
function postSolve(c,imp){const a=EA(c),b=EB(c);if(!a||!b)return;let n=imp.normalImpulses[0]||0;if(imp.normalImpulses[1])n+=imp.normalImpulses[1];if(n<.4)return;hitE(a,b,n,c);hitE(b,a,n,c)}
function hitE(e,o,n,c){if(!e.alive)return;
 if(e.kind==='pete'){if(n>P.hitAcc[e.part]){P.hitAcc[e.part]=n;P.hitOther[e.part]=o;P.hitPt=c}return}
 if(o.kind==='debris'&&n<40)return;
 if(e.kind==='barrel'&&!e.fuseBox&&n>e.brk*(e.tnt?1:1)&&e.fuse<0)e.fuse=.02;
 else if(e.kind==='crate'&&n>e.brk&&!e.breaking){e.breaking=true;Q.push(()=>breakCrate(e,o))}
 else if(e.kind==='npc'&&!e.down&&n>e.knockI)Q.push(()=>knockNpc(e,o,n));
 else if(e.kind==='raccoon'&&!e.bonked&&(o.kind==='pete'||n>6))Q.push(()=>bonkRaccoon(e,o));
 else if(e.kind==='car'&&o.kind==='pete'&&n>25){if(e.alarm<=0){e.alarm=3;SND.alarm();scoreProp(e,200,'CAR ALARM!')}}
 else if(e.kind==='slot'&&o.kind==='pete'&&n>15&&e.cd<=0){e.cd=1.2;jackpot(e)}
 if(e.kind!=='pete'&&o.kind==='pete'&&G)G.touch(e,n)}
function beginC(c){const a=EA(c),b=EB(c);if(!a||!b)return;for(const [e,o] of [[a,b],[b,a]]){
 if(e.kind==='pete'&&o.kind!=='pete'){if(!P.touched&&o.kind!=='tower'){P.touched=true;if(G)G.firstTouch(o)}
  if(o.kind==='pad'&&P.padCd<=0){P.padCd=.2;Q.push(()=>bouncePete(o))}
  if(o.kind==='water')Q.push(()=>enterWater(o,e));
  if(o.kind==='target'&&!o.hit)Q.push(()=>hitTarget(o,e));
  if(o.kind==='cushion'&&G&&G.M.cushion)G.M.cushion(o,e)}
 if(e.kind==='pad'&&o.body&&o.body.isDynamic()&&o.kind!=='pete'&&o.kind!=='debris'){const ob=o;Q.push(()=>bounceBody(e,ob))}
 if(e.kind==='water'&&o.kind!=='pete'&&o.body&&o.body.isDynamic()){o.inWater=e}
 if(e.kind==='target'&&!e.hit&&o.kind!=='pete'&&o.body&&o.body.isDynamic()&&o.kind!=='debris'&&relSpeed(e,o)>3)Q.push(()=>hitTarget(e,o))}}
function endC(c){}
// ---------- reactions ----------
function scoreProp(e,pts,label,col){if(G&&G.prop)G.prop(e,pts,label,col)}
function breakGlass(g,o,v){if(!g.alive)return;const x=g.x,y=g.y,hw=g.hw,hh=g.hh,ang=g.a;kill(g);SND.glass();addShake(.15);save.stats.glass++;
 for(let i=0;i<26;i++){const t=rnd(-1,1),u=rnd(-1,1);const lx=t*hw,ly=u*hh;fx('shard',x+lx*Math.cos(ang)-ly*Math.sin(ang),y+lx*Math.sin(ang)+ly*Math.cos(ang),{vx:v.x*rnd(.2,.7)+rnd(-3,3),vy:v.y*rnd(.2,.7)+rnd(-4,1),life:rnd(.8,1.6),size:rnd(.08,.25),g:GRAV,col:'rgba(200,240,255,.85)'})}
 if(o.kind==='pete'){const k=.86;peteSetVel(peteVel().x*k,peteVel().y*k,true)}
 scoreProp(g,g.pts,pick(['SMASH!','SHATTER!','WINDOW SHOPPING!','CRASH!']),'#9fe6ff');if(G&&G.glassBroken)G.glassBroken(g,o)}
function breakCrate(e,o){if(!e.alive)return;const {x,y,hw}=e,v=e.body.getLinearVelocity(),a=e.a;kill(e);SND.crunch(.6);addShake(.1);
 for(let i=0;i<4;i++){const ang=a+i*Math.PI/2;debris(x+Math.cos(ang)*hw*.5,y+Math.sin(ang)*hw*.5,hw*.95,.07,v.x*.5+Math.cos(ang)*4,v.y*.5+Math.sin(ang)*4-2,e.col||'#c8914b')}
 burst('dust',x,y,10,3,{life:.7,size:.4,g:-1,col:'rgba(220,190,140,.7)'});if(e.confetti){burst('confetti',x,y,40,9,()=>({life:rnd(1.2,2),size:.12,g:3,col:pick(['#ff4d4d','#ffd23a','#4dd2ff','#7dff7a','#ff7ae6'])}));SND.ding(3)}
 scoreProp(e,e.pts,pick(['SPLINTERS!','CRATE-TASTROPHE!','KA-RACK!']),'#ffcf7a')}
function explode(e){if(!e.alive)return;const x=e.x,y=e.y,R=4.6*(e.pow||1);kill(e);SND.boom(1);addShake(.9);flash=Math.max(flash,.55);save.stats.booms++;
 SCORCH.push({x,y:y+e.hh,r:R*.45});if(SCORCH.length>20)SCORCH.shift();
 for(let i=0;i<46;i++){const a=rnd(0,TAU),s=rnd(2,13);fx('fire',x,y,{vx:Math.cos(a)*s,vy:Math.sin(a)*s-3,life:rnd(.35,.8),size:rnd(.35,.9),g:-2})}
 for(let i=0;i<20;i++){const a=rnd(0,TAU),s=rnd(1,4);fx('smoke',x,y,{vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:rnd(1.2,2.4),size:rnd(.6,1.4),g:-1.5})}
 burst('spark',x,y,30,16,{life:.6,size:.08,g:GRAV});fx('ring',x,y,{life:.45,size:R,g:0});
 for(let i=0;i<5;i++)debris(x,y,rnd(.15,.4),.06,rnd(-12,12),rnd(-16,-4),e.tnt?'#c0392b':'#b33',"metal");
 let peteHit=false;
 for(const o of ENTS){if(!o.alive||!o.body||o===e)continue;const dx=o.x-x,dy=o.y-y,d=hyp(dx,dy);if(d>R)continue;const k=1-d/R,ux=d>.01?dx/d:0,uy=d>.01?dy/d:-1;
  if(o.kind==='barrel'&&o.fuse<0&&!o.fuseBox){o.fuse=.12+d*.04;continue}if(o.kind==='barrel'&&o.fuseBox&&o.fuse<0){o.fuse=.3;continue}
  if(o.kind==='glass'&&!o.broken){o.broken=true;Q.push(()=>breakGlass(o,e,{x:ux*8,y:uy*8}));continue}
  if(o.kind==='npc'&&!o.down)Q.push(()=>knockNpc(o,e,200));
  if(o.kind==='raccoon'&&!o.bonked)Q.push(()=>bonkRaccoon(o,e));
  if(!o.body.isDynamic())continue;const dv=(o.kind==='pete'?17:15)*k;
  if(o.kind==='pete')peteHit=true;
  const m=o.body.getMass();o.body.applyLinearImpulse(V2(ux*dv*m,(uy-.6)*dv*m),o.body.getWorldCenter(),true);o.body.applyAngularImpulse(rnd(-1,1)*m*k*.3,true)}
 if(peteHit){slowmo(.45,.3);if(G)G.peteBoom()}
 scoreProp(e,400,pick(['KABOOM!','BLAMMO!','KA-BLOOEY!','FIREWORKS!']),'#ff8a3a');if(G&&G.boom)G.boom(e)}
function knockNpc(e,o,n){if(!e.alive||e.down)return;e.down=true;e.body.setFixedRotation(false);e.body.setGravityScale(1);e.float=false;const v=o.body?o.body.getLinearVelocity():{x:0,y:-5};e.body.applyAngularImpulse((v.x>0?1:-1)*8,true);
 e.bubble={t:1.6,text:e.type==='mime'?'...!':e.type==='elvis'?'THANK YOU VERY MUCH!':pick(['HEY!','MY LATTE!','RUDE!','WATCH IT!','OH NO!','I JUST GOT THESE SHOES!','OUCH!','SIR!'])};save.stats.npcs++;
 if(e.type==='mime')SND.honk();else SND.voice(.2);scoreProp(e,e.pts,e.type==='mime'?'MIME BOWLED!':pick(['BYSTANDER BONK!','NEIGHBORLY!','PEOPLE PIN!']),'#ff9ee6');if(G&&G.npcDown)G.npcDown(e)}
function bonkRaccoon(e,o){if(!e.alive||e.bonked)return;e.bonked=true;e.body.setFixedRotation(false);const v=o.body?o.body.getLinearVelocity():{x:3,y:-3};e.body.setLinearVelocity(V2(v.x*.6+rnd(-2,2),-8));e.body.setAngularVelocity(rnd(-15,15));
 SND.squeak();burst('star',e.x,e.y-.4,8,4,{life:.8,size:.2,g:0,col:'#ffe066'});scoreProp(e,500,'RACCOON BONKED!','#c3ff6b');if(G&&G.raccoon)G.raccoon(e)}
function jackpot(e){SND.ding(0);SND.ding(5);for(let i=0;i<30;i++)fx('coin',e.x,e.y-1,{vx:rnd(-6,6),vy:rnd(-12,-5),life:rnd(1,1.8),size:.18,g:GRAV});scoreProp(e,e.pts,'JACKPOT!','#ffe14d')}
function hitTarget(t,o){if(t.hit)return;t.hit=true;SND.ding(4);fx('ring',t.x,t.y,{life:.5,size:t.r*2.5,g:0,col:'#ffd23a'});burst('confetti',t.x,t.y,24,7,()=>({life:1.2,size:.12,g:3,col:pick(['#ff4d4d','#ffd23a','#fff'])}));scoreProp(t,t.pts,'BULLSEYE!','#ffd23a');if(G&&G.target)G.target(t,o)}
function bouncePete(p){const n=V2(Math.sin(p.a),-Math.cos(p.a));const v=peteVel();const vn=v.x*n.x+v.y*n.y;const nv=Math.max(-vn*p.k,p.min);const d=nv-vn;peteAddVel(n.x*d,n.y*d);p.squash=1;SND.boing(p.awning?.7:1.2);
 burst('dust',p.x,p.y,6,2,{life:.4,size:.25,g:0,col:'rgba(255,255,255,.6)'});if(G&&G.bounce)G.bounce(p,nv)}
function bounceBody(p,o){if(!o.alive||!o.body)return;const n=V2(Math.sin(p.a),-Math.cos(p.a)),v=o.body.getLinearVelocity(),vn=v.x*n.x+v.y*n.y;const nv=Math.max(-vn*p.k,p.min*.7);o.body.setLinearVelocity(V2(v.x+n.x*(nv-vn),v.y+n.y*(nv-vn)));p.squash=1}
function enterWater(w,part){if(P.water>0)return;P.water=.01;SND.splash();const c=peteCenter();for(let i=0;i<30;i++)fx('splash',c.x+rnd(-1,1),w.top,{vx:rnd(-4,4),vy:rnd(-10,-3),life:rnd(.6,1.1),size:rnd(.12,.3),g:GRAV,col:'rgba(180,230,255,.9)'});if(G&&G.splash)G.splash()}
// ---------- per-step upkeep ----------
function physUpkeep(dt){
 for(const e of JOINTS){if(!e.alive||!e.joint)continue;const f=e.joint.getReactionForce(1/dt).length();if(f>e.jmax*(e.body.getMass()/4+1)){world.destroyJoint(e.joint);e.joint=null;SND.crunch(.8);scoreProp(e,e.pts,e.kind==='donut'?'DONUT DROP!':'SIGN-OFF!','#7fd3ff')}}
 for(const e of ENTS){if(!e.alive)continue;
  if(e.kind==='barrel'&&e.fuse>=0){e.fuse-=dt;if(e.fuse<=0){e.fuse=-2;Q.push(()=>explode(e))}}
  else if(e.kind==='car'){if(e.alarm>0)e.alarm-=dt;const up=Math.cos(e.body.getAngle());for(const w of e.wh){if(up<.3)w.j.enableMotor(false)}
   if(e.x>G.stage.x1+8||e.x<G.stage.x0-8){if(!isGrabbed(e)){const dx=(e.dir>0?G.stage.x0-4:G.stage.x1+4)-e.x;e.body.setTransform(V2(e.x+dx,e.startY),0);e.body.setLinearVelocity(V2(e.dir*e.speed,0));e.body.setAngularVelocity(0);for(const w of e.wh){w.b.setTransform(V2(w.b.getPosition().x+dx,e.startY+e.hh*.55),0);w.b.setLinearVelocity(V2(e.dir*e.speed,0));w.j.enableMotor(true)}}}}
  else if(e.kind==='slot'&&e.cd>0)e.cd-=dt;
  else if(e.kind==='debris'){e.life-=dt;if(e.life<=0)kill(e)}
  else if(e.kind==='pad'&&e.squash>0)e.squash=Math.max(0,e.squash-dt*4);
  else if(e.kind==='crate'&&!e.moved&&e.body&&hyp(e.x-e.x0,e.y-e.y0)>.6){e.moved=true;scoreProp(e,25,null)}
  else if(e.kind==='npc'){if(e.bubble){e.bubble.t-=dt;if(e.bubble.t<=0)e.bubble=null}if(!e.down&&P){const c=P.parts[1];const d=hyp(c.x-e.x,c.y-e.y);e.look=d<10?1:0;if(d<10)e.face=c.x>e.x?1:-1}
   if(e.float&&!e.down&&!isGrabbed(e)){e.body.setLinearVelocity(V2(Math.sin(frameT*.7+e.id)*.6,Math.sin(frameT*1.3+e.id)*.5+(e.fy-e.y)*1.5))}}
  else if(e.kind==='raccoon'&&!e.bonked){e.taunt+=dt}
  if(e.inWater&&e.body){const v=e.body.getLinearVelocity();e.body.applyForceToCenter(V2(-v.x*e.body.getMass()*3,(-GRAV*1.1-v.y*3)*e.body.getMass()),true)}}
 if(P&&P.water>0){P.water+=dt;for(const b of P.bodies){const v=b.getLinearVelocity(),m=b.getMass();b.applyForceToCenter(V2(-v.x*m*4,(-GRAV*1.08-v.y*4)*m),true)}}}
function isGrabbed(e){return P&&P.grab.some(g=>g.e===e)}
// ---------- grab ----------
function grabCandidates(){const out=[];for(const e of ENTS){if(!e.alive||!e.body)continue;
 if(e.grab||e.kind==='building'||e.kind==='crate'||e.kind==='barrel'||e.kind==='gondola'||e.kind==='npc'){out.push(e)}}return out}
function nearestGrab(hand,maxD){let best=null,bd=maxD;const hp=hand.body.getWorldPoint(V2(0,.14));
 for(const e of grabCandidates()){if(isGrabbed(e))continue;let pt=null,d=1e9;
  if(e.kind==='pole'){const y=clamp(hp.y,e.y-e.hh,e.y+e.hh);pt={x:e.x,y};d=hyp(hp.x-pt.x,hp.y-pt.y)}
  else if(e.kind==='building'||e.kind==='ledge'){for(const c of [[e.x-e.hw,e.y-e.hh],[e.x+e.hw,e.y-e.hh]]){const dd=hyp(hp.x-c[0],hp.y-c[1]);if(dd<d){d=dd;pt={x:c[0],y:c[1]}}}}
  else{const r=e.r||Math.max(e.hw||.5,e.hh||.5);const dx=hp.x-e.x,dy=hp.y-e.y,dd=hyp(dx,dy);d=Math.max(0,dd-r);pt=dd>r?{x:e.x+dx/dd*r,y:e.y+dy/dd*r}:{x:hp.x,y:hp.y}}
  if(d<bd){bd=d;best={e,pt,d}}}
 return best}
function tryGrab(){if(!P)return false;if(P.grab.length){releaseGrab();return true}
 let best=null;for(const hi of [PI.larmF,PI.larmB]){const c=nearestGrab(P.parts[hi],1.5);if(c&&(!best||c.d<best.d)){best=c;best.hand=hi}}
 if(!best)return false;const hb=P.bodies[best.hand],e=best.e;
 const j=world.createJoint(new pl.DistanceJoint({length:.05,frequencyHz:5,dampingRatio:.6},hb,e.body,hb.getWorldPoint(V2(0,.14)),V2(best.pt.x,best.pt.y)));
 const g={j,e,hand:best.hand,t:0};P.grab.push(g);
 // second hand too if close, for a two-handed hold
 const oh=best.hand===PI.larmF?PI.larmB:PI.larmF;const ob=P.bodies[oh];const op=ob.getWorldPoint(V2(0,.14));if(hyp(op.x-best.pt.x,op.y-best.pt.y)<1.2){P.grab.push({j:world.createJoint(new pl.DistanceJoint({length:.08,frequencyHz:4,dampingRatio:.6},ob,e.body,op,V2(best.pt.x,best.pt.y))),e,hand:oh,t:0})}
 if(e.body.isDynamic()&&e.float){e.body.setGravityScale(1)}
 if(e.kind==='barrel'&&e.fuseBox&&e.fuse<0)e.fuse=2.6;
 SND.grab();pop(best.pt.x,best.pt.y-.4,'GRAB!','#7dffb0',.8);if(G&&G.grabbed)G.grabbed(e);return true}
function releaseGrab(throwBoost){if(!P||!P.grab.length)return;const es=new Set();for(const g of P.grab){try{world.destroyJoint(g.j)}catch(e){}es.add(g.e)}P.grab=[];
 const v=peteVel();for(const e of es){if(e.alive&&e.body&&e.body.isDynamic()&&e.body.getMass()<200){const bx=throwBoost?throwBoost.x:0,by=throwBoost?throwBoost.y:0;const ev=e.body.getLinearVelocity();e.body.setLinearVelocity(V2(lerp(ev.x,v.x,.5)+bx,lerp(ev.y,v.y,.5)+by));e.thrown=1.5;if(e.float)e.float=false}}
 SND.blip();if(G&&G.released)G.released([...es])}
