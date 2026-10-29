/* stages: Downtown, Construction Zone, Boardwalk Pier, Vegas Strip, Bowling Alley Street (+ mode variants) */
'use strict';
const STAGES={
 city:{name:'Downtown Mayhem',sub:'Office towers, traffic, a café and a giant donut',music:'city',sky:['#5fb4ee','#cdeeff'],far:'#9cc3df',near:'#7aa6c9',ground:'#5d6670',walk:'#b9b2a6',night:false,len:150},
 site:{name:'Construction Zone',sub:'Wrecking ball, girders, TNT and porta-potties',music:'site',sky:['#f6a95b','#ffe3b0'],far:'#d79a6c',near:'#b9805a',ground:'#7a5a3a',walk:'#a88a60',night:false,len:140},
 pier:{name:'Boardwalk Pier',sub:'Ferris wheel, trampolines, balloons and the ocean',music:'pier',sky:['#3fc0e8','#bff3ff'],far:'#7fd0e0',near:'#e8d3a0',ground:'#d9c08a',walk:'#a8774a',night:false,len:150,sea:true},
 vegas:{name:'Vegas Strip',sub:'Neon, slots, fountains and Elvis. Pete\'s home turf',music:'vegas',sky:['#0b0726','#3a1660'],far:'#2a1850',near:'#3b2470',ground:'#2a2733',walk:'#4a4552',night:true,len:150},
 lane:{name:'Main Street Lanes',sub:'Ten giant pins at the end of the street',music:'bowl',sky:['#7ac6f5','#e1f6ff'],far:'#a3c7e0',near:'#86aecb',ground:'#6a5a4a',walk:'#c99b5c',night:false,len:95}};
const STAGE_ORDER=['city','site','pier','vegas'];
let DECO=[];
function deco(t,x,y,o){DECO.push(Object.assign({t,x,y},o||{}))}
function baseStage(id){const st=Object.assign({id,x0:-14,x1:STAGES[id].len,sling:{x:0,y:-10.2}},STAGES[id]);DECO=[];
 const g=body('static',0,0);fix(g,new pl.Edge(V2(-80,0),V2(st.x1+80,0)),{friction:.85,filterCategoryBits:CAT.WORLD});ent('ground',g,{});
 // launch tower (Pete's slingshot overlooks the street)
 staticBox('tower',-1.2,-4.6,2.2,4.6,{});deco('sling',0,-9.2);
 // end wall (a tall building closes the stage)
 staticBox('building',st.x1+3,-20,3,20,{style:'end',col:id==='vegas'?'#41306e':'#8a96a8',win:true});
 return st}
function officeTower(x,w,floors,o){o=o||{};const fh=3.4,top=-floors*fh;const col=o.col||pick(['#8ea4bd','#a7b6c6','#7f93ad','#b0a597']);
 const parts=[];// roof + floor slabs, solid right wall, glass windows on the left face of every floor
 for(let f=0;f<=floors;f++){const y=-f*fh;if(f>0)parts.push(staticBox('building',x+w/2,y+.2,w/2+.15,.2,{style:'slab',col,ledge:true}))}
 staticBox('building',x+w-.25,top/2,.25,-top/2,{style:'wall',col});
 for(let f=0;f<floors;f++){const y0=-f*fh;glass(x+.08,y0-fh/2+.2,.08,fh/2-.2,{brk:6});
  if(o.fill!==false){const r=Math.random();if(r<.4)crate(x+w*.55,y0-.5,.45,{style:'file',col:'#d8c49a'});else if(r<.7)npc(x+w*.5,y0,o.npc||'ped');else{barrel(x+w*.6,y0-.5)}}}
 deco('office',x,top,{w,h:-top,floors,col,sign:o.sign});return parts}
function building(x,w,h,o){o=o||{};const col=o.col||pick(['#a2b3c6','#c0a993','#9aa9b9','#b9b0c9','#8fa3b8']);return staticBox('building',x+w/2,-h/2,w/2,h/2,Object.assign({style:'block',col,win:true,ledge:true},o))}
function pyramid(x,rows,s,o){for(let r=0;r<rows;r++)for(let i=0;i<rows-r;i++)crate(x+(i-(rows-r-1)/2)*s*2.02,-s-r*s*2.01,s,o)}
function traffic(st,n){for(let i=0;i<n;i++){const d=i%2?-1:1;car(rnd(st.x0+10,st.x1-10),-.97,d,rnd(5,8))}}
const BUILD={
 city(st,m){deco('skyline',0,0,{});
  for(let x=4;x<st.x1;x+=7)deco('tree',x+rnd(-1,1),0);
  awning(9,-3.2,1.8,{});awning(13,-3.2,1.8,{});deco('cafe',7,0,{w:8});npc(10,0,'ped');npc(12.5,0,'tourist');crate(14.5,-.45,.45,{style:'table'});
  pole(18,0,6.5);
  officeTower(21,7,4,{sign:'ACME INSURANCE'});
  building(31,6,7.5,{col:'#c4a480'});const bb=staticBox('building',34,-12.4,4.2,1.6,{style:'billboard',text:"DOUGH-NUTTY'S",col:'#fff3d6'});deco('bbpost',34,-7.5,{h:3.3});donutProp(37,-8.5,1.5,{anchor:bb});
  glass(40.5,-1.3,.07,1.25,{brk:4});glass(43.5,-1.3,.07,1.25,{brk:4});staticBox('building',42,-2.65,1.7,.1,{style:'shelter',col:'#4a6a8a'});deco('bench',42,0);
  for(let i=0;i<3;i++)barrel(47+i*.85,-.5);barrel(47.4,-1.5);barrel(48.25,-1.5);
  pyramid(52,4,.5);
  pad(58,-.3,1.7,{min:19,k:1.1,label:'BOUNCE HOUSE'});
  officeTower(63,8,7,{sign:'PETECORP',col:'#7f93ad'});
  wobSign(74,0,1.6,.75,'PIZZA',{ph:6,col:'#e23b3b'});wobSign(78,0,1.5,.7,'HOT DOGS',{ph:4.5,col:'#f4b400',fg:'#5a2a00'});
  npc(76,0,'granny');npc(80,0,'chef');pole(82,0,6.5);
  building(84,5,4,{col:'#b98f74'});pyramid(86.5,3,.45,{confetti:true,col:'#ff6fae'});
  awning(91,-3,1.6);building(93,6,10,{col:'#9db0c3'});
  glass(101,-1.6,.6,1.6,{dyn:true,booth:true,brk:4});npc(104,0,'ped');
  pad(108,-.3,1.5,{min:15});for(let i=0;i<4;i++)crate(112,-.5-i*1.01,.5);
  officeTower(116,7,5,{sign:'FIRST BANK OF PETE',col:'#c9b48a'});barrel(126,-.5);barrel(127,-.5);tnt(126.5,-1.5);npc(130,0,'tourist');
  pole(134,0,6.5);building(137,7,6,{col:'#a7b6c6'});
  traffic(st,4)},
 site(st,m){deco('cranebg',60,0,{});
  staticBox('building',14,-1.3,2.5,1.3,{style:'trailer',col:'#e9e3d0'});npc(10,0,'worker');
  for(let i=0;i<5;i++){const b=body('dynamic',22,-.3-i*.62);fix(b,BOX(3,.3),{density:6,friction:.7,filterCategoryBits:CAT.PROP});ent('girder',b,{hw:3,hh:.3})}
  // unfinished frame
  for(let f=1;f<=5;f++)staticBox('building',34,-f*3.6+.2,4.5,.2,{style:'beam',col:'#c0392b',ledge:true});for(const cx of [29.7,38.3])staticBox('building',cx,-9,.2,9,{style:'beam',col:'#c0392b'});
  for(let f=0;f<5;f++){tnt(33+rnd(-2,2),-f*3.6-.85,{});if(f%2)npc(36,-f*3.6-.4,'worker')}
  wreckingBall(48,-20,12);staticBox('building',52,-11,.4,11,{style:'crane',col:'#f2b705'});deco('cranearm',52,-22,{len:14});
  for(let i=0;i<3;i++){const b=body('dynamic',58+i*1.6,-1.25);fix(b,BOX(.65,1.25),{density:5,friction:.6,filterCategoryBits:CAT.PROP});ent('porta',b,{hw:.65,hh:1.25,grab:true,occ:i===1})}
  pad(66,-.5,2.2,{min:18,label:'SAND PILE',sand:true,k:.9});
  for(let x=72;x<84;x+=1.4){staticBox('building',x,-4.5,.12,4.5,{style:'scaff',col:'#8b8b8b'})}
  for(let f=1;f<=3;f++){staticBox('building',78,-f*3+.1,6,.1,{style:'plank',col:'#b5853f',ledge:true});for(let i=0;i<2;i++)barrel(74+i*3+f,-f*3-.32-.5*0)}
  car(95,-.97,-1,3,{truck:'mixer',col:'#e8e8e8'});car(110,-.97,1,4,{col:'#f2b705'});
  pyramid(100,4,.5);for(let i=0;i<6;i++)barrel(108+i*.85,-.5);tnt(110,-1.5);
  officeTower(116,7,6,{fill:false,col:'#9c9c9c'});for(let f=0;f<6;f++)tnt(120,-f*3.4-.65);
  npc(126,0,'worker');pole(130,0,7)},
 pier(st,m){st.deckY=0;deco('sea',0,0,{});deco('pierdeck',20,0,{});
  water(st.x1-15,st.x1+60,0,{});
  for(let x=4;x<18;x+=4)deco('palm',x,0);deco('lifeguard',16,0);
  awning(24,-3,1.7,{col:'#ff8fd1'});deco('stand',22,0,{t2:'COTTON CANDY'});npc(26,0,'tourist');
  pad(31,-.3,1.6,{min:20});pad(36,-.3,1.6,{min:24});
  ferris(50,-12,9,8,{});staticBox('building',50,-5.8,.35,5.8,{style:'ferrispost',col:'#ddd'});
  for(let i=0;i<4;i++){const n=npc(62+i*2.4,-rnd(9,16),'ped');n.body.setGravityScale(0);n.float=true;n.fy=n.y;n.balloon=true;n.pts=350}
  glass(70,-2.2,.09,2.2,{brk:4,tank:true});staticBox('building',72.5,-.6,2.3,.6,{style:'tank',col:'#2f7fbf'});npc(72.5,-1.2,'ped');
  pad(78,-.3,1.6,{min:22});awning(84,-3,1.6,{col:'#7fe0ff'});deco('stand',82,0,{t2:'RING TOSS'});
  pyramid(90,4,.45,{confetti:true,col:'#ffcf3a'});
  for(let i=0;i<3;i++)barrel(97+i*.85,-.5);building(102,5,6,{col:'#f2e6c9',style:'block'});
  pad(110,-.3,1.8,{min:26});wobSign(116,0,1.6,.8,'SURF SHOP',{ph:5,col:'#00a0c6'});npc(120,0,'tourist');crate(125,-.5,.5);crate(126.1,-.5,.5);crate(125.5,-1.51,.5);
  staticBox('building',st.x1-15.5,-.4,.5,.4,{style:'pierend',col:'#a8774a'})},
 vegas(st,m){deco('strip',0,0,{});
  wobSign(8,0,2.4,1.5,'WELCOME',{ph:5,col:'#fff2cc',fg:'#d6286f',vegas:true});
  for(let i=0;i<3;i++)slot(14+i*1.8,0);npc(19,0,'elvis');
  officeTower(22,7,5,{sign:'PETE\'S PALACE',col:'#563b8c',npc:'elvis'});
  for(let i=0;i<4;i++){const b=body('dynamic',32+i*1.2,-.5-(i%2)*1.1);fix(b,BOX(.55,.55),{density:6,friction:.5,restitution:.2,filterCategoryBits:CAT.PROP});ent('dice',b,{hw:.55,hh:.55,pips:rint(1,6),grab:true})}
  water(37,49,-.1,{fountain:true});for(let x=38;x<49;x+=2.6)pad(x,-.25,.6,{min:21,k:1,jet:true});deco('fountain',43,0,{w:12});
  wobSign(52,0,1.8,.9,'CHAPEL',{ph:5,col:'#ffd1e8',fg:'#b3125f'});glass(55,-1.5,.08,1.5,{brk:4});staticBox('building',57.5,-1.6,2.3,1.6,{style:'chapel',col:'#fff0f6'});npc(58,-3.2,'elvis');
  for(let i=0;i<4;i++)slot(62+i*1.8,0);
  officeTower(70,8,8,{sign:'HIGH ROLLER',col:'#2c2a5a'});
  car(85,-.97,1,6,{limo:true,col:'#111'});car(100,-.97,-1,7,{col:'#ff3fa4'});
  for(let i=0;i<5;i++)barrel(84+i*.85,-.5,{fireworks:true});pyramid(92,4,.45,{confetti:true,col:'#ffd700'});
  pad(98,-.3,1.6,{min:20});npc(102,0,'elvis');npc(104,0,'tourist');
  wobSign(107,0,1.5,.9,'BUFFET',{ph:6,col:'#ffcc00',fg:'#7a0000'});
  officeTower(112,7,6,{sign:'GOLDEN PETE',col:'#7a5b10'});for(let i=0;i<3;i++)slot(123+i*1.8,0);npc(130,0,'granny');building(134,6,9,{col:'#5a3b8a'})},
 lane(st,m){deco('lane',0,0,{});
  staticBox('building',st.x1-4,-1.5,.5,1.5,{style:'pinback',col:'#5a3a2a'});
  for(let x=6;x<st.x1-10;x+=6){deco('tree',x,0)}}
};
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function buildStage(id,mode,extra){newWorld();const R=Math.random;let seed=7;for(const ch of id+(mode||''))seed=seed*31+ch.charCodeAt(0)|0;Math.random=mulberry(seed);
 try{const st=baseStage(id);BUILD[id](st,mode);if(extra)extra(st);return st}finally{Math.random=R}}
