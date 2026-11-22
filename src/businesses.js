// Primera fase de la economía urbana dominicana: 10 comercios con interiores y actividad.
const CATALOG = [
 {id:'colmado',name:'Colmado El Buen Vecino',kind:'COLMADO',open:6,close:23,wall:0xe9b75e,trim:0xc8372d,task:'organiza productos',products:[['Arroz (libra)',35,0xe8dfc8],['Habichuelas',65,0x8b4a2d],['Aceite',95,0xe4b93c],['Jugo',45,0xe76f51]],detail:'Neveras, sacos, latas, bebidas y sillas plásticas'},
 {id:'ventorrillo',name:'Ventorrillo Doña Nena',kind:'VENTORRILLO',open:6,close:21,wall:0xf0c9a0,trim:0x2a9d8f,task:'atiende el mostrador',products:[['Plátanos',20,0x8da83c],['Huevos',12,0xf0e5ca],['Leche',75,0xf1f1e9],['Galletas',25,0xc99b62]],detail:'Mostrador frontal, zinc, cajas y mercancía básica'},
 {id:'comedor',name:'Comedor Sazón de Casa',kind:'COMEDOR',open:7,close:16,wall:0xf0dfbf,trim:0x2a7f62,task:'prepara el almuerzo',products:[['Plato del día',220,0xd59b3d],['Habichuelas',80,0x8b4a2d],['Jugo natural',90,0xe9a52e],['Agua',30,0x6ec1e4]],detail:'Mesas, cocina, menú y platos preparados'},
 {id:'frituras',name:'Frituras La Esquina',kind:'FRITURAS',open:16,close:2,wall:0xf4bd63,trim:0xc8372d,task:'prepara frituras',products:[['Yaniqueque',35,0xe5b34a],['Empanada',60,0xc88742],['Tostones',75,0x9fbd48],['Quipe',65,0x98634a]],detail:'Freidora, carrito, vitrina y bombillas'},
 {id:'empanadas',name:'Empanadas Doña Rosa',kind:'EMPANADAS',open:7,close:21,wall:0xf2d6a7,trim:0xb64a2e,task:'rellena empanadas',products:[['Empanada de pollo',65,0xc88d48],['Pastelito',55,0xd9ad62],['Empanada de queso',60,0xe5c879],['Jugo',70,0xe79d32]],detail:'Vitrina caliente, bandejas y freidora'},
 {id:'jugos',name:'Jugos Tropicales',kind:'JUGOS',open:8,close:20,wall:0xd8e8b5,trim:0x2a9d8f,task:'prepara jugos',products:[['Chinola',100,0xe4b63c],['Lechosa',90,0xe98c66],['Tamarindo',85,0x8b5939],['Limón',75,0x9dbb42]],detail:'Frutas frescas, licuadoras y nevera'},
 {id:'panaderia',name:'Panadería La Madrugada',kind:'PANADERÍA',open:5,close:20,wall:0xe7c59b,trim:0x8b4a2d,task:'hornea pan',products:[['Pan sobao',15,0xc99a5d],['Pan de agua',12,0xd8b47a],['Telera',35,0xc69a61],['Bizcocho',95,0xe6c7a0]],detail:'Horno, bandejas, sacos de harina y vitrinas'},
 {id:'reposteria',name:'Dulces y Bizcochos Maribel',kind:'REPOSTERÍA',open:8,close:19,wall:0xf0c7d4,trim:0xb34f78,task:'decora bizcochos',products:[['Bizcocho porción',110,0xe9c6a2],['Dulce de leche',70,0xb67b45],['Galletas',45,0xd8b47a],['Habichuelas con dulce',100,0x9c6c48]],detail:'Vitrinas, bandejas, pasteles y mesa de decoración'},
 {id:'carniceria',name:'Carnicería El Ganadero',kind:'CARNICERÍA',open:7,close:18,wall:0xe7d5c9,trim:0xa63832,task:'pesa los pedidos',products:[['Carne de res',260,0xa8463b],['Cerdo',220,0xc16b60],['Chuleta',240,0xb75c52],['Longaniza',180,0x9b4d35]],detail:'Mostrador refrigerado, báscula y ganchos de exhibición'},
 {id:'pescaderia',name:'Pescadería Costa Azul',kind:'PESCADERÍA',open:7,close:17,wall:0xc5e0e4,trim:0x176c85,task:'organiza pescado',products:[['Pescado fresco',280,0x7e9ca2],['Camarones',390,0xd58b79],['Filete',320,0xb6c7c8],['Calamar',300,0x9daeb0]],detail:'Hielo, cajas, báscula y mostrador frío'},
 {id:'pollera',name:'Pollera El Pollo Criollo',kind:'POLLERA',open:7,close:19,wall:0xf0d6c9,trim:0xb94a3b,task:'pesa piezas de pollo',products:[['Pollo entero',190,0xe5c8a8],['Muslos',145,0xd6aa88],['Pechuga',220,0xe8d1b7],['Alitas',135,0xc99475]],detail:'Vitrinas refrigeradas, bandejas y báscula'},
 {id:'fruteria',name:'Frutas y Vegetales La Cosecha',kind:'FRUTERÍA',open:6,close:20,wall:0xe8d49b,trim:0x4f8b43,task:'acomoda frutas',products:[['Plátano',20,0x8da83c],['Aguacate',55,0x497a42],['Yuca',35,0xc7b28b],['Tomate',45,0xd85c42]],detail:'Cajas de madera, sacos y frutas frescas a la acera'},
 {id:'vivero',name:'Vivero Verde Vida',kind:'VIVERO',open:7,close:18,wall:0xc5d9b2,trim:0x397b50,task:'riega las plantas',products:[['Planta ornamental',180,0x4f9b58],['Árbol frutal',350,0x357b43],['Maceta',90,0xb98258],['Tierra abonada',120,0x76513a]],detail:'Malla de sombra, macetas, plantas y herramientas'},
 {id:'floristeria',name:'Floristería Flor de Quisqueya',kind:'FLORISTERÍA',open:8,close:19,wall:0xf0d0df,trim:0xb34f78,task:'prepara arreglos',products:[['Ramo mixto',450,0xe99bb5],['Rosas',180,0xd94d65],['Girasoles',160,0xe7bd39],['Arreglo especial',850,0xb45b8d]],detail:'Cubetas florales, mesa de arreglos y exhibidor refrigerado'},
 {id:'agropecuaria',name:'Agropecuaria El Campo',kind:'AGROPECUARIA',open:7,close:18,wall:0xd8c59e,trim:0x5d7740,task:'organiza sacos',products:[['Semillas',85,0x9a824d],['Alimento animal',240,0x98704a],['Herramienta agrícola',390,0x6e7b50],['Maceta de vivero',110,0x9c6b47]],detail:'Sacos, semillas, herramientas y suministros agrícolas'},
 {id:'hielo',name:'Hielo Polar Distribuidora',kind:'FÁBRICA DE HIELO',open:5,close:21,wall:0xc9e3ed,trim:0x347c9c,task:'acomoda bolsas de hielo',products:[['Bolsa pequeña',25,0xb9e4f0],['Bolsa grande',50,0x9ed4e6],['Hielo para eventos',180,0x82c1dc],['Neverita',350,0x6b9db7]],detail:'Congeladores, bolsas de hielo y zona de despacho'},
 {id:'agua',name:'Agua Clara Purificada',kind:'AGUA PURIFICADA',open:6,close:20,wall:0xc6e2e4,trim:0x267d8a,task:'llena botellones',products:[['Botellón lleno',65,0x67b6ca],['Botella pequeña',20,0x8dcfe0],['Dispensador',1250,0xe1ecee],['Botellón vacío',250,0x70b9cb]],detail:'Filtros, depósitos, botellones y mostrador de llenado'},
 {id:'sastreria',name:'Sastrería Don Ramón',kind:'SASTRERÍA',open:8,close:19,wall:0xd8c9b6,trim:0x536b80,task:'cose una prenda',products:[['Ajuste de pantalón',250,0x59616b],['Camisa a medida',950,0x9eb6c4],['Dobladillo',120,0xb29b79],['Reparación de ropa',180,0x8b6d55]],detail:'Máquinas de coser, telas, maniquíes y prendas'},
 {id:'modisteria',name:'Modistería Yanelis',kind:'MODISTERÍA',open:8,close:18,wall:0xe5c6b5,trim:0x9a5674,task:'corta patrones de tela',products:[['Vestido personalizado',1450,0xc77d9a],['Uniforme escolar',850,0x637b9b],['Blusa',650,0xd3a5ae],['Arreglo de vestido',300,0x9a7890]],detail:'Mesa de corte, patrones, telas y máquinas de coser'},
 {id:'zapateria',name:'Zapatería El Buen Paso',kind:'ZAPATERÍA',open:8,close:19,wall:0xd9c3a5,trim:0x825735,task:'repara calzado',products:[['Reparación de suela',280,0x65483a],['Pegado de zapato',180,0x8a6047],['Cordones',75,0xc2a47b],['Plantillas',140,0x9d8a71]],detail:'Estantes de zapatos, hormas, herramientas y banco de reparación'}
];

const SITES = [
 [-77.7133,-35.8843,-.1739,-.9848,1],
 [66.6292,91.1581,.1306,.9914,1],
 [49.5823,97.6675,.9454,-.3260,1],
 [81.9965,89.1337,.1306,.9914,-1],
 [98.3043,81.1439,.9491,-.3149,1],
 [36.1573,125.1037,.1823,.9832,-1],
 [-137.0011,-58.1944,-.8687,.4954,-1],
 [109.086,102.4743,-.1624,-.9867,-1],
 [55.199,134.8665,.9757,-.2193,-1],
 [75.2938,132.1746,.1756,.9845,1],
 [-21.4617,-182.5441,.0948,.9955,1],
 [90.5529,129.4523,.1756,.9845,-1],
 [104.8089,124.3409,.9815,-.1916,-1],
 [188.2442,-44.9655,.9945,-.1049,-1],
 [40.5545,175.1721,.1033,.9947,-1],
 [-73.5309,-213.6123,.2598,-.9657,1],
 [-43.9319,-225.6039,.9997,.0237,1],
 [140.4154,-188.3196,.9901,.1407,1],
 [-150.3262,-173.2323,.962,-.2731,1],
 [-94.7752,-219.3287,.2598,-.9657,-1]
];

export function createBusinessSystem(T, scene, colliders) {
 const shops=[], matCache=new Map();
 const material=c=>{if(!matCache.has(c))matCache.set(c,new T.MeshLambertMaterial({color:c}));return matCache.get(c)};
 const cube=(parent,w,h,d,color,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const panel=document.getElementById('business-panel');
 const title=document.getElementById('business-title');
 const info=document.getElementById('business-info');
 const products=document.getElementById('business-products');
 const close=document.getElementById('business-close');
 const hud=document.getElementById('business-hud');
 let active=null;
 let economy={cash:2500,inventory:{}};
 try{const old=JSON.parse(localStorage.getItem('operacion-caribe-economy-v1')||'null');if(old&&Number.isFinite(old.cash))economy={cash:old.cash,inventory:old.inventory||{}}}catch{}
 const save=()=>{try{localStorage.setItem('operacion-caribe-economy-v1',JSON.stringify(economy))}catch{}};
 const money=n=>'RD$ '+Math.round(n).toLocaleString('es-DO');
 function signTexture(text,color){const c=document.createElement('canvas');c.width=512;c.height=112;const x=c.getContext('2d');x.fillStyle='#'+color.toString(16).padStart(6,'0');x.fillRect(0,0,512,112);x.strokeStyle='#fff0c9';x.lineWidth=7;x.strokeRect(6,6,500,100);x.fillStyle='#fff';x.font='bold 34px Trebuchet MS';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,56,470);return new T.CanvasTexture(c)}
 function person(parent,shirt,skin=0x9b684b){const g=new T.Group();parent.add(g);cube(g,.58,.82,.34,shirt,0,1.2,0);const head=new T.Mesh(new T.SphereGeometry(.22,10,8),material(skin));head.position.y=1.82;g.add(head);cube(g,.18,.55,.2,0x26364a,-.16,.5,0);cube(g,.18,.55,.2,0x26364a,.16,.5,0);const a=cube(g,.14,.62,.14,shirt,-.38,1.28,0),b=cube(g,.14,.62,.14,shirt,.38,1.28,0);return{g,a,b,phase:Math.random()*6}}
 function transformedBoxCollider(group,w,h,d,x,y,z){const c=Math.cos(group.rotation.y),s=Math.sin(group.rotation.y),corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([lx,lz])=>[group.position.x+lx*c+lz*s+x,group.position.z-lx*s+lz*c+z]);const xs=corners.map(p=>p[0]),zs=corners.map(p=>p[1]),poly=corners.flat();colliders.push({x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs),poly})}
 function build(data,index){
  const [x,z,dx,dz,side]=SITES[index],g=new T.Group();g.position.set(x,0,z);g.rotation.y=Math.atan2(-dx*side,-dz*side);scene.add(g);
  const W=8.2,D=6.6,wall=.22,front=D/2;
  cube(g,W,.16,D,0x9c8c78,0,.08,0);
  cube(g,W,2.8,wall,data.wall,0,1.48,-D/2);
  cube(g,wall,2.8,D,data.wall,-W/2,1.48,0);
  cube(g,wall,2.8,D,data.wall,W/2,1.48,0);
  cube(g,W,.22,.35,data.trim,0,2.86,0);
  cube(g,W,.18,.4,0x76543b,0,2.98,front-.05);
  // Fachada abierta: entrada central y vitrinas laterales.
  cube(g,2.5,.18,.18,data.trim,0,2.55,front);
  for(const px of [-W/2+.12,W/2-.12])cube(g,.22,2.8,.22,data.trim,px,1.42,front);
  cube(g,2.25,1.05,.1,0x5c4637,0,.55,front-.25);
  for(const px of [-2.45,2.45]){cube(g,1.75,1.25,.08,0x8bc3d2,px,1.45,front-.12);cube(g,1.85,.08,.12,0xf3e6c9,px,2.12,front-.12)}
  const sign=new T.Mesh(new T.PlaneGeometry(6.5,1.12),new T.MeshBasicMaterial({map:signTexture(data.kind,data.trim)}));sign.position.set(0,3.65,front+.06);g.add(sign);
  // Estanterías y productos visibles.
  for(let row=0;row<2;row++){cube(g,2.1,.16,.65,0x805b3d,-2.65,.7+row*1.0,-2.45);for(let k=0;k<5;k++)cube(g,.24,.38,.28,data.products[k%data.products.length][2],-3.42+k*.38,1+row*.95,-2.42)}
  for(let k=0;k<4;k++){const p=data.products[k];if(data.id==='jugos'||data.id==='carniceria'||data.id==='pescaderia'){const m=new T.Mesh(new T.SphereGeometry(.25,9,7),material(p[2]));m.position.set(-1.45+k*.55,.55, -2.25);g.add(m)}else cube(g,.34,.48,.34,p[2],-1.45+k*.55,.5,-2.25)}
  cube(g,2.3,1,.8,0x9b6743,0, .58,.75);
  cube(g,.42,.12,.38,0x282b2e,.62,1.14,.55);
  cube(g,.2,.1,.2,0x4b9b62,.62,1.22,.55);
  // Equipamiento particular por categoría.
  if(data.id==='colmado'||data.id==='ventorrillo'){for(let i=0;i<2;i++){cube(g,.9,1.9,.72,0x4c9db0,2.65,1,-1.2+i*1.15);cube(g,.92,.12,.74,0xd8e8ed,2.65,1.96,-1.2+i*1.15)}for(let i=0;i<3;i++)cube(g,.55,.65,.55,0xd8c5a1,-2.8,.45,1.8+i*.58)}
  if(data.id==='comedor'||data.id==='frituras'||data.id==='empanadas'){for(let i=0;i<2;i++){cube(g,1.05,.12,.72,0x8b6348,-2.5,.65,.2+i*1.25);for(const xx of [-.4,.4])cube(g,.12,.55,.12,0x54463b,-2.5+xx,.32,.2+i*1.25)}}
  if(data.id==='jugos'){for(let i=0;i<2;i++){const m=new T.Mesh(new T.CylinderGeometry(.13,.16,.38,10),material(0x7eb8c7));m.position.set(2.4,.55,-1+i*.65);g.add(m)}}
  if(data.id==='panaderia'||data.id==='reposteria'){cube(g,1.25,1.35,.9,0x51433a,2.55,.8,-1.55);cube(g,.9,.7,.08,0xe4b66d,2.55,.85,-1.05);for(let i=0;i<3;i++)cube(g,.9,.1,.5,0xb18a5b,-2.7,.5+i*.42,-1.2)}
  if(data.id==='carniceria'||data.id==='pescaderia'){cube(g,1.65,.9,.9,0x9bbbc1,2.5,.55,-1.4);cube(g,1.7,.12,.94,0xeaf4f4,2.5,1.03,-1.4);for(let i=0;i<3;i++){const m=new T.Mesh(new T.SphereGeometry(.2,8,6),material(data.products[i][2]));m.position.set(2.15+i*.35,1.13,-1.4);g.add(m)}}
  // Equipos propios de los diez comercios de esta ampliación.
  if(data.id==='pollera'){cube(g,1.7,1.05,.9,0xb9d5d8,2.55,.6,-1.35);cube(g,1.72,.1,.92,0xf4f5ed,2.55,1.18,-1.35);for(let i=0;i<3;i++)cube(g,.42,.28,.42,0xe4cdb2,2.1+i*.45,1.38,-1.35)}
  if(data.id==='fruteria'){for(let i=0;i<3;i++){cube(g,.95,.48,.72,0x8a603d,-2.65,.35,.2+i*.9);for(let j=0;j<4;j++){const m=new T.Mesh(new T.SphereGeometry(.18,8,6),material(data.products[(i+j)%4][2]));m.position.set(-3+j*.22,.68,.2+i*.9);g.add(m)}}}
  if(data.id==='vivero'||data.id==='floristeria'){for(let i=0;i<5;i++){const pot=new T.Mesh(new T.CylinderGeometry(.16,.21,.28,8),material(0xa86f4c));pot.position.set(-3.1+i*1.25,.3,-2.45);g.add(pot);const plant=new T.Mesh(new T.SphereGeometry(.32,8,7),material(data.id==='vivero'?0x39864b:data.products[i%4][2]));plant.position.set(-3.1+i*1.25,.72,-2.45);g.add(plant)}}
  if(data.id==='agropecuaria'){for(let i=0;i<4;i++){cube(g,.72,.8,.62,0xa88b5c,-3+i*.8,.45,-1.65);cube(g,.76,.08,.66,0x6b573e,-3+i*.8,.88,-1.65)}cube(g,.65,.9,.55,0x6d7c4b,2.8,.48,-1.7)}
  if(data.id==='hielo'||data.id==='agua'){for(let i=0;i<2;i++){cube(g,1.1,1.9,.9,data.id==='hielo'?0x9ed8e8:0x6cb9c9,2.65,1,-1.65+i*1.2);cube(g,1.12,.12,.94,0xe7f4f4,2.65,1.98,-1.65+i*1.2)}if(data.id==='agua'){const tank=new T.Mesh(new T.CylinderGeometry(.48,.48,1.5,12),material(0x91c6d0));tank.position.set(-2.5,.85,-1.7);g.add(tank)}}
  if(data.id==='sastreria'||data.id==='modisteria'){cube(g,2.1,.18,1.15,0x9b7654,-2.4,.78,-.8);for(let i=0;i<3;i++){cube(g,.5,.95,.08,data.products[i][2],2.35,.95,-2.2+i*.5)}cube(g,.75,.72,.6,0x485363,.9,.45,-1.75);cube(g,.18,.9,.18,0x777777,.9,1,-1.75)}
  if(data.id==='zapateria'){cube(g,2.1,.16,.8,0x8c6748,2.5,.65,-1.5);for(let row=0;row<2;row++)for(let i=0;i<3;i++)cube(g,.48,.22,.22,data.products[(row+i)%4][2],1.8+i*.55,.85+row*.4,-1.5);cube(g,.8,.55,.65,0x76543b,-2.6,.35,-1.3)}
  // Pequeñas diferencias de fachada: toldos, aleros y marquesinas de barrio.
  if(['fruteria','vivero','floristeria','agropecuaria'].includes(data.id)){cube(g,W+.25,.16,.9,data.trim,0,2.45,front+.38);for(let i=0;i<5;i++)cube(g,1.62,.025,.92,i%2?0xf4e8d2:data.trim,-3.3+i*1.65,2.55,front+.38)}
  if(['hielo','agua','pollera'].includes(data.id)){cube(g,W,.18,.55,0xdcebef,0,2.98,front+.18);cube(g,.18,2.5,.18,data.trim,-W/2+.2,1.35,front+.2);cube(g,.18,2.5,.18,data.trim,W/2-.2,1.35,front+.2)}
  const worker=person(g,data.trim),customer=person(g,0x3b6e87,0xb57b58);customer.g.position.set(0,0,2.35);
  transformedBoxCollider(g,W,.2,.22,0,0,-D/2);
  transformedBoxCollider(g,.22,.2,D,-W/2,0,0);transformedBoxCollider(g,.22,.2,D,W/2,0,0);
  // El mostrador divide el área, pero deja un paso frontal para entrar.
  const hours={open:data.open,close:data.close};
  return{data,g,worker,customer,phase:index*.8,clientPhase:index*.37,open:true,hours,stock:data.products.map(p=>12),sales:0};
 }
 CATALOG.forEach((d,i)=>shops.push(build(d,i)));
 function setPanel(shop){active=shop;if(!panel)return;title.textContent=shop.data.name;info.textContent=shop.open?shop.data.detail+' · Abierto · '+money(economy.cash):'Este negocio está cerrado ahora.';products.replaceChildren();shop.data.products.forEach((p,i)=>{const b=document.createElement('button');b.className='business-buy';b.textContent=p[0]+' · '+money(p[1])+' · '+shop.stock[i]+' disp.';b.disabled=!shop.open||shop.stock[i]<=0||economy.cash<p[1];b.addEventListener('click',()=>{if(!active||!active.open||active.stock[i]<=0||economy.cash<p[1])return;economy.cash-=p[1];active.stock[i]--;economy.inventory[p[0]]=(economy.inventory[p[0]]||0)+1;active.sales++;save();setPanel(active)});products.appendChild(b)});panel.style.display='flex'}
 function closePanel(){active=null;if(panel)panel.style.display='none'}
 close?.addEventListener('click',closePanel);
 function interact(pos){let nearest=null,best=9;for(const s of shops){const d=Math.hypot(pos.x-s.g.position.x,pos.z-s.g.position.z);if(d<best){best=d;nearest=s}}if(nearest){setPanel(nearest);return true}return false}
 function update(dt,pos,clock){
  const hour=Math.floor(clock/3600),minute=Math.floor(clock%3600/60),time=hour+minute/60;
  let nearbyShop=null,nearDistance=9;
  for(const s of shops){const {data}=s;const distance=Math.hypot(pos.x-s.g.position.x,pos.z-s.g.position.z);if(distance<nearDistance){nearDistance=distance;nearbyShop=s}s.open=data.close<data.open?(time>=data.open||time<data.close):(time>=data.open&&time<data.close);s.phase+=dt;
   s.g.visible=distance<260;s.worker.g.visible=s.open&&distance<85;s.customer.g.visible=s.open&&distance<85&&Math.sin(s.phase*.23)>.15;
   const stations=[[-2.4,-.65],[0,-.65],[2.3,-.65]],target=stations[Math.floor(s.phase/5)%stations.length];s.worker.g.position.x+=(target[0]-s.worker.g.position.x)*(1-Math.exp(-dt*1.7));s.worker.g.position.z+=(target[1]-s.worker.g.position.z)*(1-Math.exp(-dt*1.7));s.worker.a.rotation.x=Math.sin(s.phase*3)*.55;s.worker.b.rotation.x=-Math.sin(s.phase*3)*.55;
   const walk=(s.clientPhase+=dt*.12)%1;s.customer.g.position.x=Math.sin(walk*Math.PI*2)*.8;s.customer.g.position.z=2.35-Math.sin(walk*Math.PI)*.8;s.customer.a.rotation.x=Math.sin(s.phase*2)*.3;s.customer.b.rotation.x=-s.customer.a.rotation.x;
   s.g.visible=distance<260;
  }
  if(hud){hud.textContent='Comercios: '+shops.filter(s=>s.open).length+'/20 abiertos · '+money(economy.cash)+(nearbyShop?' · F: '+nearbyShop.data.kind:'')}
  if(active&&info){info.textContent=(active.open?'Abierto':'Cerrado')+' · '+active.data.detail+' · Empleado: '+active.data.task+' · Ventas simuladas: '+active.sales+' · '+money(economy.cash);if(!active.open)products.querySelectorAll('button').forEach(b=>b.disabled=true)}
 }
 return{update,interact,close:closePanel,shops};
}
