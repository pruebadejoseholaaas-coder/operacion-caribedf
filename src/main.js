import * as THREE from 'three';
import './style.css';
import { loadWorld } from './world.js';
import { createBusinessSystem } from './businesses.js';
import { createTrafficSystem } from './traffic.js';
import { createMinimap } from './minimap.js';
import { createHouse } from './house.js';
import { createUI } from './ui.js';

const T=THREE,$=id=>document.getElementById(id);
const renderer=new T.WebGLRenderer({antialias:true});
const mobileDevice=matchMedia('(pointer:coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio,mobileDevice?1.25:1.75));
renderer.shadowMap.enabled=!mobileDevice;
document.body.prepend(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color(0x9cd3f0);scene.fog=new T.Fog(0x9cd3f0,45,150);
const cam=new T.PerspectiveCamera(60,1,.1,300);
const hemi=new T.HemisphereLight(0xffffff,0x998877,.95);scene.add(hemi);
const sun=new T.DirectionalLight(0xfff0d0,1.1);sun.position.set(30,50,20);sun.castShadow=true;sun.shadow.mapSize.set(mobileDevice?512:1024,mobileDevice?512:1024);
const sc=sun.shadow.camera;sc.left=sc.bottom=-40;sc.right=sc.top=40;sc.far=150;scene.add(sun,sun.target);

// Tiempo dinámico: un día completo dura 12 minutos reales.
const DAY_LENGTH=720;
let worldClock=8*3600,weatherIndex=0,weatherElapsed=0;
const weatherTypes=[
 {id:'soleado',label:'Soleado',fog:150,light:1,sky:0x9cd3f0},
 {id:'nublado',label:'Nublado',fog:125,light:.78,sky:0x899eae},
 {id:'lluvia',label:'Lluvia',fog:95,light:.62,sky:0x687b8b},
 {id:'niebla',label:'Niebla',fog:58,light:.68,sky:0x9aa7a9}
];
const skyDay=new T.Color(0x9cd3f0),skyNight=new T.Color(0x101a31),skyDawn=new T.Color(0xe9a078),skyNow=new T.Color();
const rainCount=mobileDevice?100:260,rainPositions=new Float32Array(rainCount*3);
for(let i=0;i<rainCount;i++){rainPositions[i*3]=(Math.random()-.5)*42;rainPositions[i*3+1]=Math.random()*24;rainPositions[i*3+2]=(Math.random()-.5)*42}
const rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.BufferAttribute(rainPositions,3));
const rain=new T.Points(rainGeo,new T.PointsMaterial({color:0xc9e5f5,size:mobileDevice?.075:.1,transparent:true,opacity:.7,depthWrite:false}));
rain.visible=false;scene.add(rain);
function formatClock(sec){const h=Math.floor(sec/3600)%24,m=Math.floor(sec%3600/60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')}
function updateEnvironment(dt,px,pz){
 worldClock=(worldClock+dt*86400/DAY_LENGTH)%86400;
 weatherElapsed+=dt;if(weatherElapsed>165){weatherElapsed=0;weatherIndex=(weatherIndex+1)%weatherTypes.length}
 const hour=worldClock/3600,phase=Math.max(0,Math.min(1,(Math.sin((hour-6)/12*Math.PI)+.08)/1.08));
 const dawn=Math.max(0,1-Math.abs(hour-6.5)/1.8,1-Math.abs(hour-18)/1.8);
 const weather=weatherTypes[weatherIndex],night=1-phase;
 skyNow.copy(skyNight).lerp(skyDay,phase);if(dawn>0)skyNow.lerp(skyDawn,dawn*.42);
 skyNow.lerp(new T.Color(weather.sky),weatherIndex===0?0:.48);
 scene.background.copy(skyNow);scene.fog.color.copy(skyNow);
 scene.fog.near=weatherIndex===3?8:weatherIndex===2?28:45;
 scene.fog.far=weather.fog;
 sun.intensity=(.12+phase*1.12)*weather.light;
 sun.color.setRGB(.72+.28*phase, .78+.22*phase, .95+.05*phase);
 hemi.intensity=.2+phase*.78;
 sun.position.set(px+Math.cos(worldClock/86400*Math.PI*2)*45,12+phase*65,pz+Math.sin(worldClock/86400*Math.PI*2)*45);
 rain.visible=weatherIndex===2;
 if(rain.visible){const a=rain.geometry.attributes.position;for(let i=0;i<rainCount;i++){let y=a.array[i*3+1]-.42*dt*60;if(y<0){y=18+Math.random()*6;a.array[i*3]=px+(Math.random()-.5)*42;a.array[i*3+2]=pz+(Math.random()-.5)*42}a.array[i*3+1]=y;a.array[i*3]+=.025*dt*60}a.needsUpdate=true;rain.position.set(0,0,0)}
 const state=$('world-state');if(state)state.textContent=formatClock(worldClock)+' · '+weather.label;
}

const mats={},mat=c=>mats[c]||(mats[c]=new T.MeshLambertMaterial({color:c}));
function box(w,h,l,c,x,y,z,sh=true,par=scene){const m=new T.Mesh(new T.BoxGeometry(w,h,l),mat(c));m.position.set(x,y,z);m.castShadow=sh;m.receiveShadow=true;par.add(m);return m}
const colliders=[];
let businessSystem=null,trafficSystem=null,minimap=null,house=null,ui=null;
const col=(x0,x1,z0,z1)=>colliders.push({x0,x1,z0,z1});

const legacyStart=scene.children.length;
// Suelo adoquinado
const cv=document.createElement('canvas');cv.width=cv.height=64;const cx=cv.getContext('2d');
cx.fillStyle='#7d7469';cx.fillRect(0,0,64,64);
for(let i=0;i<40;i++){cx.fillStyle=`hsl(30,8%,${40+Math.random()*18}%)`;cx.fillRect(Math.random()*60,Math.random()*60,10,8)}
const tex=new T.CanvasTexture(cv);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(70,70);
const ground=new T.Mesh(new T.PlaneGeometry(280,280),new T.MeshLambertMaterial({map:tex}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
[-1,1].forEach(s=>box(2,.18,160,0xc4b9a7,s*5,.09,0,false));
box(40,.12,28,0xd6cbb5,0,.06,0,false);

// Edificios coloniales
const pal=[0xf2c14e,0xe76f51,0x2a9d8f,0xf4a261,0xe9c46a,0xf1e9d8,0x6ec1e4,0xd97aa6,0xb7d968];
const signs=['COLMADO EL VECINO','CAFÉ Y CHIMICHURRI','FRITURAS DOÑA ROSA','COLMADO LA ESQUINA'];
const winPos=[];let nb=0;
function sign(text,s,z){const k=document.createElement('canvas');k.width=256;k.height=64;const g=k.getContext('2d');
 g.fillStyle='#c8372d';g.fillRect(0,0,256,64);g.strokeStyle='#ffd23f';g.lineWidth=5;g.strokeRect(4,4,248,56);
 g.fillStyle='#ffd23f';g.font='bold 22px Trebuchet MS,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,34);
 const m=new T.Mesh(new T.PlaneGeometry(3.4,.85),new T.MeshBasicMaterial({map:new T.CanvasTexture(k)}));
 m.position.set(s*5.8,3.2,z);m.rotation.y=-s*Math.PI/2;scene.add(m)}
function building(s,zc,w,h,c){
 const d=10,xc=s*(6+d/2);box(d,h,w,c,xc,h/2,zc);box(d+.6,.5,w+.4,0x8d4b32,xc,h+.25,zc);
 col(Math.min(s*6,s*16),Math.max(s*6,s*16),zc-w/2,zc+w/2);
 box(.25,2.4,1.5,0x4a2f1b,s*5.95,1.2,zc,false);
 const n=Math.max(2,Math.floor(w/3));
 for(let f=0;1.9+3.4*f<h-1;f++)for(let i=0;i<n;i++){const z=zc-w/2+(i+.5)*w/n;if(f===0&&Math.abs(z-zc)<1.7)continue;winPos.push([s,1.9+3.4*f,z])}
 if(nb%2===0)box(1,.15,w*.7,0x3d2b1f,s*5.5,4.2,zc,false);
 if(nb%5===3)sign(signs[(nb/5|0)%signs.length],s,zc);nb++}
[-1,1].forEach(s=>{let z=-72;while(z<72){const w=7+Math.floor(Math.random()*5),zc=z+w/2;
 if(Math.abs(zc)>16)building(s,zc,w,6.5+Math.random()*4,pal[Math.floor(Math.random()*pal.length)]);z+=w+.4}});
const gl=new T.InstancedMesh(new T.BoxGeometry(.1,1.6,1.1),mat(0x24384a),winPos.length);
const sh=new T.InstancedMesh(new T.BoxGeometry(.12,1.6,.45),mat(0x2a7f62),winPos.length*2);
const o=new T.Object3D();
winPos.forEach(([s,y,z],i)=>{o.position.set(s*5.95,y,z);o.updateMatrix();gl.setMatrixAt(i,o.matrix);
 [-.8,.8].forEach((dz,j)=>{o.position.set(s*5.93,y,z+dz);o.updateMatrix();sh.setMatrixAt(i*2+j,o.matrix)})});
scene.add(gl,sh);

// Catedral al fondo
box(26,18,10,0xd8ccb0,0,9,-84);[-9,9].forEach(x=>box(5,27,5,0xcfc2a3,x,13.5,-79.5));
box(5,8,.4,0x4a2f1b,0,4,-78.8,false);col(-14,14,-89,-79);
// Plaza: setos, estatua, banderas, palmas
[-1,1].forEach(s=>{box(1,1.2,28,0x2f7d3a,s*20,.6,0);col(s*20-.5,s*20+.5,-14,14)});
box(3,.6,3,0xb9ab8f,0,.3,0);box(1,3,1,0xcdbf9f,0,2,0);
const st=new T.Mesh(new T.SphereGeometry(.7,12,10),mat(0xd4a017));st.position.y=4.2;st.castShadow=true;scene.add(st);col(-1.6,1.6,-1.6,1.6);
function flag(x,z){box(.12,8,.12,0xdddddd,x,4,z);const g=new T.Group();g.position.set(x+1.6,7,z);scene.add(g);
 const p=(w,h,c,px,py)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshLambertMaterial({color:c,side:T.DoubleSide}));m.position.set(px,py,0);g.add(m)};
 p(1.4,.9,0x002d62,-.8,.5);p(1.4,.9,0xce1126,.8,.5);p(1.4,.9,0xce1126,-.8,-.5);p(1.4,.9,0x002d62,.8,-.5);
 p(3.2,.22,0xffffff,0,0);p(.22,2.2,0xffffff,0,0)}
flag(-5,10);flag(5,-10);
function palm(x,z){const g=new T.Group();g.position.set(x,0,z);scene.add(g);
 const tr=new T.Mesh(new T.CylinderGeometry(.2,.32,6,7),mat(0x8a6a43));tr.position.y=3;tr.rotation.z=.08;tr.castShadow=true;g.add(tr);
 const top=new T.Group();top.position.set(.25,6,0);g.add(top);
 for(let i=0;i<7;i++){const a=new T.Group();a.rotation.y=i*Math.PI*2/7;const l=new T.Mesh(new T.BoxGeometry(.5,.06,3.4),mat(0x2f8f3e));l.position.set(0,-.2,1.6);l.rotation.x=.4;l.castShadow=true;a.add(l);top.add(a)}}
[[-9,8],[9,8],[-9,-8],[9,-8],[-14,0],[14,0],[-3.2,-30],[3.2,30],[-3.2,52],[3.2,-52]].forEach(p=>palm(...p));

const legacyEnd=scene.children.length;
// Personas
function person(shirt,pants,skin,hair,mask){
 const g=new T.Group();
 const L=(w,h,l,c,x,y,z,piv)=>{const geo=new T.BoxGeometry(w,h,l);if(piv)geo.translate(0,-h/2,0);const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
 const legL=L(.3,.85,.32,pants,-.18,.85,0,1),legR=L(.3,.85,.32,pants,.18,.85,0,1);
 L(.78,.85,.44,shirt,0,1.27,0);
 const armL=L(.22,.78,.24,shirt,-.5,1.68,0,1),armR=L(.22,.78,.24,shirt,.5,1.68,0,1);
 const hd=new T.Mesh(new T.SphereGeometry(.26,12,10),mat(skin));hd.position.y=1.95;hd.castShadow=true;g.add(hd);
 L(.54,.16,.54,hair,0,2.12,-.02);
 if(mask){L(.44,.48,.08,0xf5f0e6,0,1.95,.24);L(.1,.07,.02,0x111111,-.1,2.0,.29);L(.1,.07,.02,0x111111,.1,2.0,.29);L(.3,.05,.02,0xc8372d,0,1.84,.29)}
 return{g,legL,legR,armL,armR,head:hd}}
function swing(p,a){p.legL.rotation.x=a;p.legR.rotation.x=-a;p.armL.rotation.x=-a;p.armR.rotation.x=a}
let player=person(0xc8372d,0xc8372d,0xc68a5e,0x111111,true);
player.g.position.set(0,0,32);scene.add(player.g);
const skins=[0xc68a5e,0x8d5a3b,0xe0b08a,0x5e3a24],sh2=[0xffffff,0x2a9d8f,0xf4a261,0x6ec1e4,0xd97aa6,0xf2c14e];
const residentNames=['Luis','María','José','Carla','Rafael','Yanelis','Pedro','Rosa','Miguel','Ana','Frank','Luz','Ramón','Diana','Joel','Carmen','Víctor','Altagracia','Darío','Nathalia','Manuel','Kiara'];
const residentJobs=['dependiente','maestra','motoconchista','enfermera','mecánico','estilista','estudiante','cocinera','repartidor','vendedora','electricista','costurera','panadero','contable','barbero','agricultora','taxista','secretaria','carpintero','diseñadora','guardia','emprendedora'];
const npcs=[];for(let i=0;i<(mobileDevice?12:22);i++){const p=person(sh2[i%6],0x2b3a55,skins[i%4],0x1a1a1a,false);
 const lane=(Math.random()<.5?-1:1)*(2.4+Math.random()*3);p.g.position.set(lane,0,-60+Math.random()*120);
 p.dir=Math.random()<.5?-1:1;p.sp=.65+Math.random()*.55;p.t=Math.random()*9;p.pause=Math.random()*3;p.activity='walk';p.name=residentNames[i];p.occupation=residentJobs[i];p.shiftStart=6+(i%5);p.shiftEnd=14+(i%5);p.sleepStart=22+(i%2);p.sleepEnd=5+(i%2);p.personality=['amable','reservado','alegre','tranquilo'][i%4];p.social=.35+(i%5)*.12;p.trust=0;p.mood='normal';p.routineState='libre';scene.add(p.g);npcs.push(p);
 p.mk=new T.Mesh(new T.SphereGeometry(.2,8,8),new T.MeshBasicMaterial({color:0x5fe0ff,depthTest:false}));p.mk.position.y=2.7;p.mk.renderOrder=9;p.mk.visible=false;p.g.add(p.mk)}
let pedestrianRoutes=[];
function roadSegments(roads,minWidth=0){const out=[];for(const r of roads||[]){if(r.width<minWidth)continue;const p=r.points;for(let i=0;i+3<p.length;i+=2){const ax=p[i],az=p[i+1],bx=p[i+2],bz=p[i+3],len=Math.hypot(bx-ax,bz-az);if(len>24)out.push({ax,az,bx,bz,len,width:r.width})}}return out}
function activateCityLife(roads,centerX=player.g.position.x,centerZ=player.g.position.z){
 const segments=roadSegments(roads,4),sidewalks=segments.filter(s=>s.width>=5&&s.width<=14);
 if(!segments.length)return;
 pedestrianRoutes=npcs.map((n,i)=>{const s=sidewalks[i%Math.max(1,sidewalks.length)]||segments[i%segments.length];const dx=(s.bx-s.ax)/s.len,dz=(s.bz-s.az)/s.len,nx=-dz,nz=dx,side=i%2?1:-1,off=s.width/2+1.35;const a={x:s.ax+dx*s.len*.18+nx*off*side,z:s.az+dz*s.len*.18+nz*off*side},b={x:s.bx-dx*s.len*.18+nx*off*side,z:s.bz-dz*s.len*.18+nz*off*side};return{a,b}});
 npcs.forEach((n,i)=>{const r=pedestrianRoutes[i];n.route=r;n.progress=Math.random();n.dir=Math.random()<.5?1:-1;n.sp=.65+Math.random()*.45;n.g.visible=true;n.g.position.set(r.a.x+(r.b.x-r.a.x)*n.progress,0,r.a.z+(r.b.z-r.a.z)*n.progress)});
}


let voiceUnlocked=false,voiceEnabled=true,voiceClock=8,talkRemaining=0;
const talkEl=$('npc-talk'),soundBtn=$('sound-toggle');
function speakNpc(line){
 if(!voiceEnabled||!voiceUnlocked||!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window))return;
 try{const synth=window.speechSynthesis;synth.cancel();const u=new SpeechSynthesisUtterance(line);u.lang='es-DO';u.rate=.96;u.pitch=.98;u.volume=.78;const voices=synth.getVoices(),v=voices.find(v=>/^es-DO/i.test(v.lang))||voices.find(v=>/^es[-_]/i.test(v.lang));if(v)u.voice=v;synth.speak(u)}catch{}
}
const localLines=['¡Dímelo! ¿Todo bien?','Voy al colmado y regreso ahora.','Ese tapón está fuerte hoy.','Buenas, ¿cómo va todo?','Parece que va a llover.','La guagua viene llena otra vez.','Nos vemos ahorita, cuídate.','¿Tú sabes dónde queda la parada?','Qué calor hace hoy, de verdad.','Voy a comprar algo de comer.','Con permiso, voy por aquí.','Hoy la calle está tranquila.','Déjame revisar un mensaje.','¡Qué lo qué! ¿Cómo está la cosa?'];
function cityTalkTick(dt){
 npcGreetingCooldown=Math.max(0,npcGreetingCooldown-dt);
 talkRemaining=Math.max(0,talkRemaining-dt);if(talkRemaining<=0&&talkEl)talkEl.style.display='none';else if(talkRemaining>0)return;voiceClock-=dt;if(voiceClock>0)return;voiceClock=10+Math.random()*9;
 const pp=player.g.position,nearby=npcs.filter(n=>n.g.visible&&n.g.position.distanceTo(pp)<19);if(!nearby.length)return;
 const n=nearby[Math.floor(Math.random()*nearby.length)],hour=worldClock/3600;
 const contextual=n.routineState==='trabajando'?['Estoy en mi turno, vuelvo a lo mío.','Hoy el negocio está movido.','Tengo que terminar unas cosas del trabajo.']:n.routineState==='descanso'?['Estoy tomando un pequeño descanso.','Voy a buscar algo de comer.']:n.occupation==='motoconchista'?['¿Necesitas un motoconcho?','La calle está activa a esta hora.']:n.occupation==='estudiante'?['Voy para clases.','Tengo tareas pendientes.']:n.occupation==='cocinera'||n.occupation==='panadero'?['Hoy hay mucho que preparar.','El olor de la comida abre el apetito.']:localLines;
 const line=contextual[Math.floor(Math.random()*contextual.length)];
 if(talkEl){talkEl.textContent=n.name+': «'+line+'»';talkEl.style.display='block';talkRemaining=4.5} speakNpc(line);
}


function addInstitution(x,z,w,d,floors,name,kind){
 const g=new T.Group();g.position.set(x,0,z);scene.add(g);const height=floors*3.4,wall=kind==='hospital'?0xe8eee9:0xf0d9a7,trim=kind==='hospital'?0x4a9b9a:0x2d5278;
 const add=(ww,hh,dd,c,px,py,pz)=>box(ww,hh,dd,c,px,py,pz,true,g);
 add(w,height,d,wall,0,height/2,0);add(w+.5,.45,d+.5,0x9b8061,0,height+.22,0);add(w+.8,.3,d+.8,trim,0,.15,0);
 for(let f=0;f<floors;f++)for(let i=0;i<Math.max(2,Math.floor(w/3));i++){const px=-w/2+1.5+i*(w-3)/Math.max(1,Math.floor(w/3)-1);for(const side of [-1,1])add(1.05,1.25,.12,0x47758b,px,1.35+f*3.4,side*(d/2+.07))}
 for(let i=0;i<Math.max(2,Math.floor(d/3));i++){const pz=-d/2+1.5+i*(d-3)/Math.max(1,Math.floor(d/3)-1);for(const side of [-1,1])add(.12,1.25,1.05,0x47758b,side*(w/2+.07),1.35,pz)}
 add(2.1,2.6,.18,0x68452f,0,1.3,d/2+.12);
 const board=document.createElement('canvas');board.width=512;board.height=96;const ctx=board.getContext('2d');ctx.fillStyle=kind==='hospital'?'#176c72':'#234b78';ctx.fillRect(0,0,512,96);ctx.fillStyle='#fff';ctx.font='bold 36px Trebuchet MS';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,256,48);
 const sign=new T.Mesh(new T.PlaneGeometry(Math.min(w-1,9),1.7),new T.MeshBasicMaterial({map:new T.CanvasTexture(board)}));sign.position.set(0,height*.72,d/2+.22);g.add(sign);
 if(kind==='hospital'){add(1.2,1.2,.2,0xce1126,0,height+.85,d/2+.25);add(.25,1.2,.2,0xce1126,0,height+.85,d/2+.26)}
 else for(let i=-1;i<=1;i++)add(.12,2,.12,0x234b78,i*1.8,1,d/2+.35);
 add(w+2,.18,2.5,0xbdb6a6,0,.09,d/2+2);colliders.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
}

// Motoconcho
const moto=new T.Group();scene.add(moto);moto.position.set(3,0,27);
[-.78,.78].forEach(z=>{const w=new T.Mesh(new T.CylinderGeometry(.36,.36,.15,14),mat(0x1a1a1a));w.rotation.z=Math.PI/2;w.position.set(0,.36,z);w.castShadow=true;moto.add(w)});
box(.44,.36,1.35,0xe76f51,0,.76,0,true,moto);box(.5,.14,.78,0x222222,0,1.0,-.18,true,moto);
box(.86,.05,.05,0x2b2b2b,0,1.24,.58,true,moto);
box(.08,.55,.08,0x555555,0,.95,.72,true,moto);
// Asiento trasero y caja de reparto, sin techo que tape la vista del jugador.
box(.46,.12,.66,0x222222,0,1.02,-.58,true,moto);
box(.52,.3,.42,0x333333,0,1.2,-.86,true,moto);
const shield=new T.Mesh(new T.PlaneGeometry(.92,.5),new T.MeshLambertMaterial({color:0xbfe3ee,transparent:true,opacity:.45,side:T.DoubleSide}));
shield.position.set(0,1.62,.62);shield.rotation.x=-.18;moto.add(shield);
box(.5,.34,.42,0x333333,0,1.05,-.62,true,moto);
const hl=new T.Mesh(new T.SphereGeometry(.11,8,8),new T.MeshBasicMaterial({color:0xffee88}));hl.position.set(0,1.02,.74);moto.add(hl);

// Estado y controles
let yaw=0,pitch=.38,vx=0,vz=0,rot=Math.PI,riding=false,t=0,spd=0,steerS=0,lastDrag=0;
const keys={};let run=false,jx=0,jy=0;
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code==='KeyE')interact();if(e.code==='KeyQ')useAbility();if(e.code==='KeyR')$('roles').style.display='flex';if(e.code==='KeyF')businessSystem?.interact(player.g.position);if(e.code==='KeyM')minimap?.toggle();if(e.code==='Escape'){minimap?.toggle(false);ui?.closeAll();}if(e.code==='KeyI')ui?.openInventory();if(e.code==='KeyP')ui?.openPhone();if(e.code==='KeyT'&&npcGreetingCooldown<=0){greetNearbyNpc();npcGreetingCooldown=1.2}});

addEventListener('keyup',e=>keys[e.code]=0);
let npcGreetingCooldown=0;
function greetNearbyNpc(){
 const pp=player.g.position,nearby=npcs.filter(n=>n.g.visible&&n.g.position.distanceTo(pp)<4.5).sort((a,b)=>a.g.position.distanceTo(pp)-b.g.position.distanceTo(pp));
 if(!nearby.length){if(talkEl){talkEl.textContent='No hay nadie suficientemente cerca para saludar.';talkEl.style.display='block';talkRemaining=2.2}return}
 const n=nearby[0],hour=worldClock/3600,first=n.trust<1;
 const answers={
  amable:['¡Buenas! ¿Cómo tú estás?','¡Qué bueno verte por aquí!'],
  reservado:['Buenas. Todo tranquilo.','Hola, ¿todo bien?'],
  alegre:['¡Eeeh, qué lo qué!','¡Activo! Que tengas buen día.'],
  tranquilo:['Hola, espero que todo marche bien.','Buenas, aquí estamos.']
 };
 const workTalk={
  dependiente:['Hoy han pasado muchos clientes por el negocio.','Estoy organizando la mercancía.'],
  maestra:['Los estudiantes siempre traen algo nuevo que contar.','Hoy toca preparar las clases.'],
  motoconchista:['La calle está movida; hay que conducir con calma.','Estoy esperando el próximo pasajero.'],
  enfermera:['Hoy ha sido una jornada bastante ocupada.','Lo importante es atender a las personas con paciencia.'],
  mecánico:['Tengo un vehículo pendiente en el taller.','Estoy revisando unas piezas.'],
  estilista:['Hoy tengo varios turnos en el salón.','Cada cliente llega con una idea diferente.'],
  estudiante:['Tengo algunas tareas que terminar.','Voy organizando mis apuntes para las clases.'],
  cocinera:['Ya casi está lista la comida.','Hoy estamos preparando algo bien criollo.'],
  repartidor:['Tengo que completar unas entregas.','Estoy pendiente de la próxima dirección.'],
  vendedora:['Estoy acomodando los productos.','Hoy hay variedad para los clientes.'],
  electricista:['Estoy revisando una instalación.','Siempre hay que trabajar con cuidado.'],
  costurera:['Tengo una prenda pendiente de terminar.','Estoy preparando un diseño nuevo.'],
  panadero:['El pan recién hecho siempre atrae clientes.','La jornada empieza temprano en la panadería.'],
  contable:['Estoy organizando unas cuentas.','Un negocio necesita llevar sus números al día.'],
  barbero:['Tengo que preparar el próximo turno.','Cada quien tiene su propio estilo.'],
  agricultora:['Hay que cuidar los cultivos todos los días.','La cosecha requiere paciencia.'],
  taxista:['Estoy esperando una carrera.','El tránsito cambia mucho según la hora.'],
  secretaria:['Tengo varios asuntos que organizar.','Estoy poniendo al día unos documentos.'],
  carpintero:['Estoy trabajando en un mueble.','La madera necesita buenas medidas.'],
  diseñadora:['Estoy pensando en una idea nueva.','A veces los mejores diseños empiezan con un boceto.'],
  guardia:['Estoy atento a lo que pasa por aquí.','Todo tranquilo por esta zona.'],
  emprendedora:['Siempre aparece algo nuevo que mejorar en el negocio.','Estoy pensando en nuevas ideas para mis clientes.']
 };
 n.trust=Math.min(5,(n.trust||0)+1);
 n.mood=n.trust>=3?'familiar':'amigable';
 n.greetingReact=1.35;n.greetingLevel=n.trust;
 n.g.rotation.y=Math.atan2(pp.x-n.g.position.x,pp.z-n.g.position.z);
 let options=answers[n.personality]||answers.tranquilo;
 if(n.routineState==='trabajando'&&workTalk[n.occupation])options=workTalk[n.occupation];
 if(hour<6)options=['A esta hora casi todo está tranquilo.','La ciudad todavía está despertando.'];
 else if(hour>=18)options=['Ya va cayendo la noche.','Que tengas buena noche.'];
 let line;
 if(first)line=options[Math.floor(Math.random()*options.length)];
 else if(n.trust>=5)line='¡Qué bueno verte otra vez! Ya eres conocido por aquí.';
 else if(n.trust>=3)line='¡Ya nos conocemos! ¿Cómo va todo?';
 else line=options[Math.floor(Math.random()*options.length)];
 const relation=n.trust>=5?'Conocido':n.trust>=3?'Amistoso':'Te reconoce';
 if(talkEl){talkEl.textContent=n.name+' ('+n.occupation+'): «'+line+'» · '+relation+' · Confianza '+n.trust+'/5';talkEl.style.display='block';talkRemaining=4.5}
 speakNpc(line);
}
let drag=null;const cvs=renderer.domElement;
cvs.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY}});
addEventListener('pointermove',e=>{if(drag&&e.pointerId===drag.id){lastDrag=performance.now();yaw-=(e.clientX-drag.x)*.006;pitch=Math.min(1.2,Math.max(.08,pitch+(e.clientY-drag.y)*.005));drag.x=e.clientX;drag.y=e.clientY}});
addEventListener('pointerup',e=>{if(drag&&e.pointerId===drag.id)drag=null});
const stick=$('stick'),knob=$('knob');let sid=null;
function sv(e){const r=stick.getBoundingClientRect();let dx=e.clientX-r.left-60,dy=e.clientY-r.top-60;const m=Math.hypot(dx,dy);if(m>50){dx*=50/m;dy*=50/m}
 knob.style.left=40+dx+'px';knob.style.top=40+dy+'px';jx=dx/50;jy=dy/50}
stick.addEventListener('pointerdown',e=>{sid=e.pointerId;stick.setPointerCapture(sid);sv(e)});
stick.addEventListener('pointermove',e=>{if(e.pointerId===sid)sv(e)});
const end=e=>{if(e.pointerId===sid){sid=null;jx=jy=0;knob.style.left=knob.style.top='40px'}};
stick.addEventListener('pointerup',end);stick.addEventListener('pointercancel',end);
$('bE').addEventListener('click',toggle);
$('bF').addEventListener('click',()=>businessSystem?.interact(player.g.position));
$('bR').addEventListener('click',()=>{run=!run;$('bR').style.opacity=run?1:.7});
const near=()=>Math.hypot(player.g.position.x-moto.position.x,player.g.position.z-moto.position.z)<3.5;
function toggle(){const p=player.g.position;
 if(riding){riding=false;p.set(moto.position.x+1.6,0,moto.position.z);player.legL.rotation.x=player.legR.rotation.x=0;vx=vz=0;spd=0;steerS=0;moto.rotation.z=0}
 else if(near()){riding=true;rot=moto.rotation.y;spd=0;steerS=0;vx=vz=0}}
const lim={x:60,z:76};
function polyPush(p,r,P){let best=1e9,bx=0,bz=0,ins=false;
 for(let i=0,n=P.length;i<n;i+=2){const q=(i+2)%n,x1=P[i],z1=P[i+1],x2=P[q],z2=P[q+1],dx=x2-x1,dz=z2-z1,l2=dx*dx+dz*dz;
  let u=l2?((p.x-x1)*dx+(p.z-z1)*dz)/l2:0;u=Math.max(0,Math.min(1,u));
  const cx=x1+dx*u,cz=z1+dz*u,d=(p.x-cx)**2+(p.z-cz)**2;if(d<best){best=d;bx=cx;bz=cz}
  if((z1>p.z)!==(z2>p.z)&&p.x<(x2-x1)*(p.z-z1)/(z2-z1)+x1)ins=!ins}
 const d=Math.sqrt(best)||1e-6,ux=(p.x-bx)/d,uz=(p.z-bz)/d;
 if(ins){p.x=bx-ux*r;p.z=bz-uz*r}else if(d<r){p.x=bx+ux*r;p.z=bz+uz*r}}
function pointInPoly(x,z,p){let ins=false;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2){const xi=p[i],zi=p[i+1],xj=p[j],zj=p[j+1];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/((zj-zi)||1e-6)+xi)ins=!ins}return ins}
// Evita que la cámara entre en edificios: devuelve la distancia horizontal libre.
function cameraClearance(px,pz,maxDist){
 let best=maxDist;const ux=Math.sin(yaw)*Math.cos(pitch),uz=Math.cos(yaw)*Math.cos(pitch);
 for(const c of colliders){
  if(px<c.x0-maxDist||px>c.x1+maxDist||pz<c.z0-maxDist||pz>c.z1+maxDist)continue;
  for(let d=1.1;d<best;d+=.45){
   const x=px+ux*d,z=pz+uz*d,hit=c.poly?pointInPoly(x,z,c.poly):(x>c.x0&&x<c.x1&&z>c.z0&&z<c.z1);
   if(hit){best=Math.max(1.5,d-.55);break}
  }
 }
 return best}
let camDist=6.5;
function resolve(p,r){for(const c of colliders){
 if(c.poly){if(p.x<c.x0-r||p.x>c.x1+r||p.z<c.z0-r||p.z>c.z1+r)continue;polyPush(p,r,c.poly);continue}
 const cx=Math.max(c.x0,Math.min(p.x,c.x1)),cz=Math.max(c.z0,Math.min(p.z,c.z1));
 let dx=p.x-cx,dz=p.z-cz,d=Math.hypot(dx,dz);
 if(d<r){if(d<.001){dx=1;dz=0;d=1}p.x=cx+dx/d*r;p.z=cz+dz/d*r}}
 if(!house?.inside()){p.x=Math.max(-lim.x,Math.min(lim.x,p.x));p.z=Math.max(-lim.z,Math.min(lim.z,p.z))}}
const angD=(a,b)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d};
function resize(){renderer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',resize);resize();

// Roles
const OUTFITS=[0xc8372d,0x2a9d8f,0x4361ee,0xf2c14e,0xd97aa6,0xf1e9d8];
const ROLES=[
{id:'prog',name:'Programador',ic:'💻',col:0x2ec4d6,cd:14,dur:6,ab:'Hackear cámaras',desc:'Controla la tecnología del atraco: ve a todos los peatones por las cámaras de la ciudad y recibe la radio y las interferencias.'},
{id:'cond',name:'Conductor',ic:'🏍️',col:0xf2c14e,cd:10,dur:3,ab:'Turbo',desc:'Rey de las calles. Su turbo le da un 70% más de velocidad durante unos segundos.'},
{id:'plan',name:'Planificador',ic:'🗺️',col:0x4361ee,cd:12,dur:8,ab:'Plano del golpe',desc:'La mente del plan. Marca el objetivo y calcula la distancia hasta la Casa de Moneda.'},
{id:'inf',name:'Infiltrado',ic:'🎭',col:0xc8372d,cd:12,dur:4,ab:'Distracción',desc:'Maestro del engaño. Paraliza a la gente cercana unos segundos con una distracción.'}];
let role=null,abT=0,cdT=0,feedT=0,energy=100,shirtColor=0xc8372d,job=null,uiClock=0;
const rEl=$('roles');
rEl.querySelector('.cards').innerHTML=ROLES.map((r,i)=>`<button class="card" data-i="${i}" style="--c:#${r.col.toString(16).padStart(6,'0')}"><span class="ic">${r.ic}</span><b>${r.name}</b><small>${r.desc}</small><em>[Q] ${r.ab}</em></button>`).join('');
rEl.addEventListener('click',e=>{const b=e.target.closest('.card');if(b)pick(ROLES[+b.dataset.i])});
$('t').addEventListener('click',()=>rEl.style.display='flex');
$('bQ').addEventListener('click',()=>useAbility());
$('bI').addEventListener('click',()=>ui?.openInventory());
$('bP').addEventListener('click',()=>ui?.openPhone());
const GOAL=new T.Vector3(0,0,-79);
const goalMark=new T.Group();
const goalRing=new T.Mesh(new T.TorusGeometry(2.2,.16,8,32),new T.MeshBasicMaterial({color:0xffd166}));
goalRing.rotation.x=-Math.PI/2;goalRing.position.y=.18;goalMark.add(goalRing);
const jobMark=new T.Group();
const jobRing=new T.Mesh(new T.TorusGeometry(2.4,.16,8,28),new T.MeshBasicMaterial({color:0x4fb3ff}));
jobRing.rotation.x=-Math.PI/2;jobRing.position.y=.2;jobMark.add(jobRing);
const jobBeam=new T.Mesh(new T.CylinderGeometry(.1,.1,6,8),new T.MeshBasicMaterial({color:0x4fb3ff,transparent:true,opacity:.5}));
jobBeam.position.y=3;jobMark.add(jobBeam);jobMark.visible=false;scene.add(jobMark);
const goalBeacon=new T.Mesh(new T.CylinderGeometry(.12,.12,5,8),new T.MeshBasicMaterial({color:0xffd166,transparent:true,opacity:.55}));
goalBeacon.position.y=2.7;goalMark.add(goalBeacon);goalMark.visible=false;scene.add(goalMark);
const SAVE_KEY='operacion-caribe-save-v1';
function readSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch{return null}}
let saved=readSave(),missionDone=!!saved?.missionDone;
if(Array.isArray(saved?.npcTrust))npcs.forEach((n,i)=>{const value=saved.npcTrust[i];if(Number.isFinite(value))n.trust=Math.max(0,Math.min(5,value));n.mood=n.trust>=3?'familiar':n.trust>0?'amigable':'normal'});
if(saved&&Number.isFinite(saved.worldClock))worldClock=((saved.worldClock%86400)+86400)%86400;
if(saved&&Number.isInteger(saved.weatherIndex))weatherIndex=Math.max(0,Math.min(weatherTypes.length-1,saved.weatherIndex));
if(saved&&Number.isFinite(saved.weatherElapsed))weatherElapsed=Math.max(0,saved.weatherElapsed);
if(saved&&Number.isFinite(saved.energy))energy=Math.max(0,Math.min(100,saved.energy));
if(saved&&Number.isFinite(saved.shirt))shirtColor=saved.shirt;
function saveGame(){try{const p=player.g.position;localStorage.setItem(SAVE_KEY,JSON.stringify({x:p.x,z:p.z,mx:moto.position.x,mz:moto.position.z,rot,yaw,pitch,roleId:role?.id||null,missionDone,worldClock,weatherIndex,weatherElapsed,npcTrust:npcs.map(n=>n.trust||0),energy,shirt:shirtColor,houseLights:house?house.lightsOn():true}))}catch{}}
let saveClock=0;
const beam=new T.Mesh(new T.CylinderGeometry(.7,.7,80,10,1,true),new T.MeshBasicMaterial({color:0x4361ee,transparent:true,opacity:.45,side:T.DoubleSide}));
beam.position.set(0,40,-72);beam.visible=false;scene.add(beam);
const FEED=['Radio: la policía cambió de canal.','Cámara 3 sin señal en la calle principal.','Interferencia detectada… alguien escucha.','Alerta: un dron sobrevuela la plaza.','Mensaje cifrado recibido del Planificador.'];
function pick(r){voiceUnlocked=true;if(soundBtn)soundBtn.textContent=voiceEnabled?'Voces: activas':'Voces: apagadas';const old=player.g.position.clone(),ro=player.g.rotation.y;
 if(riding){riding=false;old.set(moto.position.x+1.6,0,moto.position.z)}
 old.y=0;scene.remove(player.g);
 player=person(r.col,r.col,0xc68a5e,0x111111,true);player.g.position.copy(old);player.g.rotation.y=ro;scene.add(player.g);shirtColor=r.col;
 role=r;abT=0;cdT=0;rEl.style.display='none';
 $('t').querySelector('small').textContent=r.ic+' '+r.name+' · Zona Colonial';
 $('feed').innerHTML='';$('feed').style.display=r.id==='prog'?'block':'none';$('ab').style.display='block'}
function useAbility(){if(!role||abT>0||cdT>0)return;abT=role.dur;cdT=role.cd}
function roleTick(dt){if(!role)return;
 abT=Math.max(0,abT-dt);cdT=Math.max(0,cdT-dt);const on=abT>0;
 npcs.forEach(n=>n.mk.visible=on&&role.id==='prog');beam.visible=on&&role.id==='plan';
 let s=on?'activo '+Math.ceil(abT)+'s':cdT>0?'recarga '+Math.ceil(cdT)+'s':'¡listo!';
 if(on&&role.id==='plan')s+=' · Objetivo a '+Math.round(Math.hypot(player.g.position.x-GOAL.x,player.g.position.z-GOAL.z))+' m';
 $('ab').textContent='[Q] '+role.ab+': '+s;
 if(role.id==='prog'){feedT-=dt;if(feedT<=0){feedT=5+Math.random()*5;const f=$('feed'),d=document.createElement('div');
  d.textContent='📡 '+FEED[Math.floor(Math.random()*FEED.length)];f.prepend(d);while(f.children.length>3)f.lastChild.remove()}}}

function redress(){
 const old=player.g.position.clone(),ro=player.g.rotation.y;
 scene.remove(player.g);
 player=person(shirtColor,0x2b3a55,0xc68a5e,0x111111,true);
 player.g.position.copy(old);player.g.rotation.y=ro;scene.add(player.g);
 if(riding){player.g.rotation.order='YXZ';player.legL.rotation.x=player.legR.rotation.x=-1.2;player.armL.rotation.x=player.armR.rotation.x=-1.1}
}
function enterHouse(){
 if(!house)return;
 if(house.enter(player)){
  rot=Math.PI;yaw=0;pitch=.2;camDist=5.0;vx=vz=spd=0;player.g.rotation.y=Math.PI;
  talkRemaining=0;if(talkEl)talkEl.style.display='none';
  minimap?.setVisible(false);
  ui?.toast('Tu casa · E para interactuar · P teléfono',3800);
 }
}
function exitHouse(){
 if(!house)return;
 house.exit(player);
 const dx=house.door.x-house.home.x,dz=house.door.z-house.home.z,out=Math.atan2(dx,dz);
 rot=out;player.g.rotation.y=out;yaw=out;camDist=6.5;vx=vz=spd=0;
 minimap?.setVisible(true);
 ui?.toast('Has salido a la calle');
}
function houseAction(){
 const a=house?.actionAt(player.g.position);if(!a)return false;
 if(a.id==='door'){exitHouse();return true}
 if(a.id==='lights'){house.setLights(!house.lightsOn());ui?.toast(house.lightsOn()?'Luces encendidas':'Luces apagadas');saveGame();return true}
 if(a.id==='sleep'){
  ui?.fade(()=>{const h=worldClock/3600;worldClock=((h<6.5?6.5:30.5)*3600)%86400;energy=100;saveGame();ui?.toast('Has dormido hasta las 6:30 · Energía restaurada',3600)});
  return true}
 if(a.id==='wardrobe'){shirtColor=OUTFITS[(OUTFITS.indexOf(shirtColor)+1)%OUTFITS.length];redress();saveGame();ui?.toast('Has cambiado de ropa');return true}
 if(a.id==='eat'){
  const eaten=businessSystem?.consumeFood();
  if(eaten){energy=Math.min(100,energy+30);saveGame();ui?.toast('Has comido '+eaten+' · Energía +30')}
  else ui?.toast('No tienes comida. Compra en un colmado o comedor (F).',3200);
  return true}
 if(a.id==='storage'){ui?.openInventory();return true}
 return false}
function interact(){
 if(house?.inside()){if(!houseAction())ui?.toast('Acércate a la puerta, la cama, la nevera, el armario o la caja');return}
 if(house?.nearDoor(player.g.position)){enterHouse();return}
 toggle();
}
function startJob(){
 if(job){ui?.toast('Ya tienes un encargo activo');return}
 if(!businessSystem)return;
 const p=player.g.position;
 const options=businessSystem.shops.filter(s=>{const d=Math.hypot(s.g.position.x-p.x,s.g.position.z-p.z);return d>70&&d<280});
 if(!options.length){ui?.toast('No hay encargos disponibles ahora mismo');return}
 const shop=options[Math.floor(Math.random()*options.length)];
 const rot=shop.g.rotation.y,fx=shop.g.position.x+Math.sin(rot)*3.6,fz=shop.g.position.z+Math.cos(rot)*3.6;
 const d=Math.hypot(fx-p.x,fz-p.z);
 job={name:shop.data.name,reward:Math.round(180+d*.9),x:fx,z:fz};
 jobMark.position.set(job.x,0,job.z);jobMark.visible=true;
 $('mission').textContent='Encargo: entrega en '+job.name+' · '+Math.round(d)+' m';
 ui?.toast('Encargo aceptado: '+job.name+' · Pago RD$ '+job.reward,3800);
}
function cancelJob(){if(!job)return;job=null;jobMark.visible=false;$('mission').textContent='Encargo cancelado';ui?.toast('Encargo cancelado')}

let world=null,wt=0;
loadWorld(T,scene,colliders).then(w=>{if(!w)return;world=w;
 scene.children.slice(legacyStart+1,legacyEnd).forEach(o=>o.visible=false);
 ground.material.map=null;ground.material.color.set(0x8f8a7e);ground.material.needsUpdate=true;
 colliders.length=0;lim.x=w.lim.x;lim.z=w.lim.z;
 house=createHouse(T,scene,colliders,w);
 businessSystem=createBusinessSystem(T,scene,colliders,w,[house.home]);
 player.g.position.set(w.spawn[0],0,w.spawn[1]);moto.position.set(w.moto[0],0,w.moto[1]);moto.rotation.y=w.moto[2];
 GOAL.set(w.goal[0],0,w.goal[1]);beam.position.set(w.goal[0],40,w.goal[1]);
 w.update(w.spawn[0],w.spawn[1]);
 addInstitution(-33.2,6.3,12,16,3,'HOSPITAL MUNICIPAL','hospital');
 addInstitution(-18.2,-38.7,12,16,2,'ESCUELA PÚBLICA','school');
 goalMark.position.set(GOAL.x,0,GOAL.z);goalMark.visible=true;
 if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.z)){
   player.g.position.set(saved.x,0,saved.z);
   if(Number.isFinite(saved.mx)&&Number.isFinite(saved.mz))moto.position.set(saved.mx,0,saved.mz);
   if(Number.isFinite(saved.rot))rot=saved.rot;
   if(Number.isFinite(saved.yaw))yaw=saved.yaw;
   if(Number.isFinite(saved.pitch))pitch=Math.max(.08,Math.min(1.2,saved.pitch));
 }
 activateCityLife(w.roads||[],player.g.position.x,player.g.position.z);
 trafficSystem=createTrafficSystem(T,scene,colliders,w,{mobile:mobileDevice});
 if(saved&&saved.houseLights===false)house.setLights(false);
 ui=createUI({
  cash:()=>businessSystem.getCash(),energy:()=>energy,clock:()=>formatClock(worldClock),
  inventory:()=>businessSystem.getInventory(),isFood:n=>businessSystem.isFood(n),
  useItem:n=>{if(businessSystem.consume(n)){energy=Math.min(100,energy+26);saveGame();ui.toast('Has comido '+n+' · Energía +26')}},
  job:()=>job?{name:job.name,reward:job.reward}:null,
  startJob,cancelJob,openMap:()=>minimap?.toggle(true),
  contacts:()=>[{name:'Mamá',role:'Familia',line:'¿Ya comiste, mi amor?'},{name:'Don Ramón',role:'Mecánico',line:'La moto está lista cuando pases.'},{name:'Doña Rosa',role:'Frituras',line:'Hoy hay yaniqueque calentito.'},{name:'Central de repartos',role:'Trabajo',line:'Hay un paquete esperando por ti.'}],
  messages:()=>['Mamá: pasa por la casa cuando puedas.','Central: hay encargos de entrega disponibles.','Barrio: el tráfico está pesado por la avenida.']
 });
 minimap=createMinimap(w,{shops:()=>businessSystem?.shops||[],npcs:()=>npcs,goal:()=>GOAL,home:()=>house?house.home:null,job:()=>job?{x:job.x,z:job.z}:null,stops:()=>trafficSystem?.stops||[],vehicles:()=>trafficSystem?.vehicles||[]},{mobile:mobileDevice});
 document.getElementById('minimap')?.addEventListener('click',()=>minimap.toggle());
 const savedRole=ROLES.find(r=>r.id===saved?.roleId);if(savedRole)pick(savedRole);
 if(saved&&Number.isFinite(saved.shirt)){shirtColor=saved.shirt;redress()}
 ui.update();
 $('mission').textContent=missionDone?'Objetivo completado · Explora la ciudad':'Objetivo: llega al punto de encuentro';
 saveGame();
});
if(import.meta.env.DEV)window.__oc={scene,renderer,cam,colliders,world:()=>world,traffic:()=>trafficSystem,business:()=>businessSystem,house:()=>house,ui:()=>ui,npcs,player:()=>player,moto,view:()=>({yaw,rot}),state:()=>({energy,job,shirtColor,worldClock,inside:!!house?.inside()}),setClock:v=>{worldClock=v}};
const clock=new T.Clock(),hint=$('h');
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);t+=dt;
 let ix=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+jx;
 let iz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+jy;
 const mag=role?Math.min(1,Math.hypot(ix,iz)):0;
 const mx=(-Math.sin(yaw))*(-iz)+Math.cos(yaw)*ix,mz=(-Math.cos(yaw))*(-iz)+(-Math.sin(yaw))*ix;
 const ml=Math.hypot(mx,mz)||1;
 const fatigue=energy<12?.7:1,turbo=(abT>0&&role&&role.id==='cond')?1.5:1,obj=riding?moto.position:player.g.position,en=role?1:0;
 if(riding){
  const thr=en*Math.max(-1,Math.min(1,-iz)),st=en*Math.max(-1,Math.min(1,ix)),vmax=22*turbo*((keys.ShiftLeft||keys.ShiftRight)?1.3:1);
  if(thr>0)spd+=(spd<vmax?16*turbo:0)*thr*dt;
  else if(thr<0)spd+=(spd>.5?-32:-12)*(-thr)*dt;
  const dr=(thr===0?5:1.2)*dt+.003*spd*spd*dt;
  spd-=Math.sign(spd)*Math.min(Math.abs(spd),dr);
  if(keys.Space)spd*=Math.exp(-1.2*dt);
  spd=Math.max(-7,Math.min(vmax*1.1,spd));
  steerS+=(st-steerS)*(1-Math.exp(-7*dt));
  rot-=steerS*Math.min(1,Math.abs(spd)/5)*Math.sign(spd)*(2.6/(1+Math.abs(spd)*.06))*dt;
  const gr=1-Math.exp(-(keys.Space?1.6:8)*dt);
  vx+=(Math.sin(rot)*spd-vx)*gr;vz+=(Math.cos(rot)*spd-vz)*gr;
 }else{
  const speed=fatigue*turbo*((keys.ShiftLeft||keys.ShiftRight||run)?8.5:6.0),k=1-Math.exp(-10*dt);
  vx+=(mx/ml*mag*speed-vx)*k;vz+=(mz/ml*mag*speed-vz)*k;
 }
 const bx=obj.x+vx*dt,bz=obj.z+vz*dt;obj.x=bx;obj.z=bz;resolve(obj,riding?.7:.45);
 const cor=Math.hypot(obj.x-bx,obj.z-bz);
 if(riding&&cor>.001){spd*=Math.max(.15,1-cor*5);vx*=.85;vz*=.85}
 const sp=Math.hypot(vx,vz);
 if(!house?.inside())energy=Math.max(0,Math.min(100,energy-dt*(riding?.01:sp>6?.22:sp>.6?.05:0)));
 if(!riding&&sp>.4)rot+=angD(rot,Math.atan2(vx,vz))*Math.min(1,dt*12);
 if(riding){player.g.rotation.order=moto.rotation.order='YXZ';moto.rotation.y=rot;moto.rotation.z=steerS*Math.min(1,Math.abs(spd)/12)*.35;
  player.g.position.set(moto.position.x,.3,moto.position.z);player.g.rotation.y=rot;player.g.rotation.z=moto.rotation.z;
  player.legL.rotation.x=player.legR.rotation.x=-1.2;player.armL.rotation.x=player.armR.rotation.x=-1.1}
 else{player.g.rotation.y=rot;player.g.rotation.z=0;swing(player,Math.sin(t*(sp>6?13:9))*Math.min(1,sp/5)*.9)}
 npcs.forEach(n=>{if(!n.route)return;const hour=worldClock/3600,sleeping=n.sleepStart>n.sleepEnd?(hour>=n.sleepStart||hour<n.sleepEnd):(hour>=n.sleepStart&&hour<n.sleepEnd);n.routineState=sleeping?'durmiendo':hour>=n.shiftStart&&hour<n.shiftEnd?'trabajando':hour>=12&&hour<14?'descanso':'libre';n.g.visible=!sleeping;if(sleeping)return;const fr=abT>0&&role&&role.id==='inf'&&n.g.position.distanceTo(player.g.position)<25;n.pause=Math.max(0,n.pause-dt);const routineSpeed=n.routineState==='trabajando'?1.18:n.routineState==='descanso'?.72:.9;if(!fr&&n.pause<=0){n.progress+=n.dir*n.sp*routineSpeed*dt/Math.max(1,Math.hypot(n.route.b.x-n.route.a.x,n.route.b.z-n.route.a.z));if(n.progress>1){n.progress=1;n.dir=-1;n.pause=1+Math.random()*2}else if(n.progress<0){n.progress=0;n.dir=1;n.pause=1+Math.random()*2}if(Math.random()<.0015){n.pause=2+Math.random()*3;n.activity=Math.random()<.5?'phone':'rest'}}const r=n.route;n.g.position.x=r.a.x+(r.b.x-r.a.x)*n.progress;n.g.position.z=r.a.z+(r.b.z-r.a.z)*n.progress;n.g.rotation.y=Math.atan2((r.b.x-r.a.x)*n.dir,(r.b.z-r.a.z)*n.dir);const idle=n.pause>0||n.routineState==='descanso';swing(n,idle?(n.activity==='phone'?.65:0):Math.sin((t+n.t)*8)*.42);if(n.greetingReact>0){n.greetingReact=Math.max(0,n.greetingReact-dt);const wave=Math.sin((1.35-n.greetingReact)*13)*.22;n.armR.rotation.z=-(n.greetingLevel>=3?1.05:.72)+wave;n.armR.rotation.x=-.35;n.armL.rotation.z=(n.greetingLevel>=3?.48:.18)+wave*.55}else{n.armR.rotation.z=0;n.armL.rotation.z=0}if(idle&&n.activity==='phone'&&n.greetingReact<=0)n.armR.rotation.x=-1.35;const dx=player.g.position.x-n.g.position.x,dz=player.g.position.z-n.g.position.z,playerDistance=Math.hypot(dx,dz),nearPlayer=playerDistance<5.5;const look=nearPlayer?Math.max(-.85,Math.min(.85,Math.atan2(dx,dz)-n.g.rotation.y)):0;n.head.rotation.y+=(look-n.head.rotation.y)*(1-Math.exp(-5*dt));const nod=(n.greetingReact>0?Math.sin((1.35-n.greetingReact)*10)*.08:0)+(idle&&n.activity==='phone'&&n.greetingReact<=0?.2:0);n.head.rotation.x+=(nod-n.head.rotation.x)*(1-Math.exp(7*dt));if(nearPlayer&&playerDistance<2.8&&n.pause<=0&&n.routineState!=='trabajando'){n.pause=.7+Math.random()*.5;n.activity='rest';n.g.rotation.y+=(Math.atan2(dx,dz)-n.g.rotation.y)*(1-Math.exp(5*dt));}});
 for(let i=0;i<npcs.length;i++){const a=npcs[i];a.socialCooldown=Math.max(0,(a.socialCooldown||0)-dt);if(!a.g.visible||a.socialCooldown>0)continue;for(let j=i+1;j<npcs.length;j++){const b=npcs[j];if(!b.g.visible||b.socialCooldown>0)continue;const dx=b.g.position.x-a.g.position.x,dz=b.g.position.z-a.g.position.z;if(dx*dx+dz*dz<7.84){a.socialCooldown=b.socialCooldown=7+Math.random()*5;a.greetingReact=b.greetingReact=1.15;a.greetingLevel=b.greetingLevel=2;a.pause=b.pause=1.15;a.activity=b.activity='rest';a.g.rotation.y=Math.atan2(dx,dz);b.g.rotation.y=Math.atan2(-dx,-dz);const socialByJob={maestra:['¿Cómo van las clases hoy?','Los muchachos vienen con mucha energía.'],estudiante:['¿Ya terminaste las tareas?','Mañana toca levantarse temprano para clases.'],cocinera:['¿Qué se está preparando hoy?','La comida de aquí siempre reúne a la gente.'],panadero:['¿Ya salió el pan caliente?','Desde temprano hay movimiento en la panadería.'],motoconchista:['¿Cómo está la calle por tu ruta?','Hoy hay bastante movimiento en el barrio.'],mecánico:['¿Cómo va ese trabajo del taller?','Poco a poco se resuelven los arreglos.'],agricultora:['¿Cómo va la cosecha esta semana?','Con este sol hay que cuidar los cultivos.'],barbero:['¿Está lleno el negocio hoy?','Cada cliente trae su propio estilo.'],costurera:['¿Cómo va ese encargo?','Ese diseño va quedando muy bien.'],dependiente:['¿Cómo van las ventas hoy?','Hay que mantener la mercancía organizada.'],repartidor:['¿Terminaste las entregas?','Hoy toca recorrer varias calles.'],enfermera:['¿Cómo estuvo el turno?','Ojalá hoy sea una jornada tranquila.']};const jobLines=socialByJob[a.occupation]||socialByJob[b.occupation]||[];const personalityLines=a.personality==='alegre'?['¡Qué bueno encontrarte por aquí!','¡El barrio está activo hoy!']:a.personality==='reservado'?['Buenas, ¿todo en orden?','Que tengas una jornada tranquila.']:['¿Cómo te ha ido hoy?','Nos encontramos por el barrio.'];const pairMood=Math.random(),friendly=Math.min(1,((a.social||.5)+(b.social||.5))/2),exchange=pairMood<friendly*.55?(a.personality==='alegre'||b.personality==='alegre'?'¡Qué bueno verte! ¿Cómo va todo?':'¡Buenas! ¿Cómo va el día?'):pairMood<.82?(a.routineState==='trabajando'||b.routineState==='trabajando'?'Estoy en medio del turno, luego hablamos.':'Nos vemos por el barrio.'):'¡Cuídate, que tengas buen día!';const line=jobLines.length&&Math.random()<.58?jobLines[Math.floor(Math.random()*jobLines.length)]:personalityLines[Math.floor(Math.random()*personalityLines.length)];const finalExchange=Math.random()<.62?line:exchange;if(talkEl){talkEl.textContent=a.name+' y '+b.name+': «'+finalExchange+'»';talkEl.style.display='block';talkRemaining=3.2}break}}}
 trafficSystem?.update(dt,player.g.position,yaw);
 minimap?.update(player.g.position,yaw,rot,performance.now());
 house?.update(dt,performance.now());
 if((uiClock+=dt)>.3){uiClock=0;ui?.update()}
 if(!house?.inside())cityTalkTick(dt);
 businessSystem?.update(dt,player.g.position,worldClock);
 if(role&&performance.now()-lastDrag>1200&&(riding?Math.abs(spd)>1:(sp>.8&&iz<.5)))yaw+=angD(yaw,rot+Math.PI)*(1-Math.exp(-(riding?3:1.2)*dt));
 cam.fov+=((60+(riding?Math.min(18,Math.abs(spd)*.7):0))-cam.fov)*(1-Math.exp(-4*dt));cam.updateProjectionMatrix();
 const pp=player.g.position,baseDist=house?.inside()?6.2:(riding?9:6.5);
 const horizontal=baseDist*Math.max(.4,Math.cos(pitch));
 const free=cameraClearance(pp.x,pp.z,horizontal)/Math.max(.4,Math.cos(pitch));
 camDist+=(Math.min(baseDist,free)-camDist)*(1-Math.exp(-(free<camDist?22:5)*dt));
 let tx=pp.x+Math.sin(yaw)*Math.cos(pitch)*camDist,ty=pp.y+1.7+Math.sin(pitch)*camDist,tz=pp.z+Math.cos(yaw)*Math.cos(pitch)*camDist;
 if(house?.inside())ty=Math.min(ty,2.9);
 cam.position.lerp(new T.Vector3(tx,ty,tz),1-Math.exp(-12*dt));cam.lookAt(pp.x,pp.y+1.6,pp.z);
 updateEnvironment(dt,pp.x,pp.z);sun.target.position.copy(pp);
 if(house?.inside()){hemi.intensity*=.55;sun.intensity*=.3;}
 let msg=riding?'E para bajar · '+Math.round(Math.abs(spd)*3.6)+' km/h':(near()?'E para subir al motoconcho':'');
 if(house?.inside()){const a=house.actionAt(pp);msg=a?'E: '+a.label:'E para interactuar'}
 else if(house?.nearDoor(pp))msg='E para entrar en tu casa';
 roleTick(dt);
 const missionDistance=Math.hypot(pp.x-GOAL.x,pp.z-GOAL.z);
 if(house?.inside())$('mission').textContent='Estás en tu casa · E para interactuar';
 else if(job){
  const jd=Math.hypot(pp.x-job.x,pp.z-job.z);
  if(jd<7){
   businessSystem?.addCash(job.reward);
   ui?.toast('Encargo entregado · +RD$ '+job.reward,3600);
   $('mission').textContent='Encargo entregado. Pide otro en el teléfono (P).';
   job=null;jobMark.visible=false;saveGame();
  }else $('mission').textContent='Encargo: entrega en '+job.name+' · '+Math.round(jd)+' m';
 }else{
  if(!missionDone&&world&&missionDistance<5){missionDone=true;$('mission').textContent='¡Punto de encuentro alcanzado!';saveGame()}
  if(!missionDone&&world)$('mission').textContent='Objetivo: llega al punto de encuentro · '+Math.round(missionDistance)+' m';
 }
 jobRing.scale.setScalar(1+.1*Math.sin(t*3));
 jobBeam.material.opacity=.35+.2*(.5+.5*Math.sin(t*2));
 goalRing.scale.setScalar(1+.12*Math.sin(t*3));
 goalBeacon.material.opacity=.35+.2*(.5+.5*Math.sin(t*2));
 if(world&&(wt+=dt)>.4){wt=0;world.update(pp.x,pp.z)}
 if((saveClock+=dt)>10){saveClock=0;saveGame()}hint.style.display=msg?'block':'none';hint.textContent=msg;$('bE').textContent=riding?'Bajar':'Subir';
 renderer.render(scene,cam)}
addEventListener('pagehide',saveGame);
loop();
