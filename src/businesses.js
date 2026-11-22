// Primera fase de la economía urbana dominicana: 10 comercios con interiores y actividad.
const CATALOG = [
 {id:'colmado',name:'Colmado El Buen Vecino',kind:'COLMADO',open:6,close:23,wall:0x78b982,trim:0x176b43,task:'organiza productos',products:[['Arroz (libra)',35,0xe8dfc8],['Habichuelas',65,0x8b4a2d],['Aceite',95,0xe4b93c],['Jugo',45,0xe76f51]],detail:'Colmado de barrio con estantes surtidos, neveras, botellones de agua, sacos y sillas plásticas'},
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
 {id:'zapateria',name:'Zapatería El Buen Paso',kind:'ZAPATERÍA',open:8,close:19,wall:0xd9c3a5,trim:0x825735,task:'repara calzado',products:[['Reparación de suela',280,0x65483a],['Pegado de zapato',180,0x8a6047],['Cordones',75,0xc2a47b],['Plantillas',140,0x9d8a71]],detail:'Estantes de zapatos, hormas, herramientas y banco de reparación'},
{id:'talabarteria',name:'Talabartería Cuero Criollo',kind:'TALABARTERÍA',open:8,close:18,wall:0xc9a77c,trim:0x70452e,task:'corta y cose artículos de cuero',products:[['Cinturón artesanal',650,0x805033],['Cartera de cuero',1450,0x9a6746],['Correa',480,0x70452e],['Reparación de cartera',350,0xb28a62]],detail:'Pieles enrolladas, moldes, hebillas, mesa de corte y artículos terminados'},
 {id:'ebanisteria',name:'Ebanistería Los Hermanos',kind:'EBANISTERÍA',open:7,close:18,wall:0xd0b18a,trim:0x765034,task:'lija y ensambla muebles',products:[['Silla de madera',1850,0x9b6a3f],['Mesa pequeña',4200,0x805331],['Puerta',6800,0x9a714b],['Reparación de mueble',950,0xb58b61]],detail:'Bancos de trabajo, tablones, muebles en proceso y estantes de herramientas'},
 {id:'tapiceria',name:'Tapicería Nuevo Estilo',kind:'TAPICERÍA',open:8,close:18,wall:0xd6c4b4,trim:0x8b5d79,task:'corta tela y tapiza muebles',products:[['Tapizado de silla',850,0x9a7185],['Tapizado de sofá',4800,0x526b7d],['Cojín',450,0xd2a77d],['Cambio de espuma',1200,0xb9b2a7]],detail:'Sofás, espuma, rollos de tela, máquina de coser y muebles en reparación'},
 {id:'herreria',name:'Herrería El Martillo',kind:'HERRERÍA',open:7,close:17,wall:0xb8b9b6,trim:0x4c5961,task:'ensambla piezas metálicas',products:[['Reja sencilla',3800,0x59636a],['Portón',12500,0x414b52],['Protector de ventana',2900,0x6d777d],['Reparación metálica',900,0x8a9296]],detail:'Perfiles metálicos, rejas, banco de trabajo y área de ensamblaje'},
 {id:'aluminio',name:'Aluminios y Cristales del Caribe',kind:'ALUMINIO Y CRISTALERÍA',open:8,close:18,wall:0xc8d6dc,trim:0x397c91,task:'mide y prepara marcos',products:[['Ventana de aluminio',4200,0x9bb8c5],['Puerta corrediza',8900,0x7d9eaa],['Cristal a medida',2100,0xb9dce8],['Reparación de ventana',750,0x7796a2]],detail:'Perfiles de aluminio, cristales, marcos, muestras de ventanas y mesa de medición'},
 {id:'electrodomesticos',name:'Servicio Técnico El Hogar',kind:'REPARACIÓN DE ELECTRODOMÉSTICOS',open:8,close:18,wall:0xc8d0d4,trim:0x3d687c,task:'revisa aparatos eléctricos',products:[['Diagnóstico',350,0x7999a8],['Reparación de abanico',650,0x8c9ca3],['Servicio de lavadora',1250,0x627c8c],['Revisión de nevera',950,0x9fb8c0]],detail:'Abanicos, televisores, lavadoras, piezas y bancos de reparación'},
 {id:'celulares',name:'Móvil Express',kind:'TIENDA DE CELULARES',open:9,close:20,wall:0xc7c9dc,trim:0x535d9b,task:'muestra teléfonos y accesorios',products:[['Teléfono básico',4200,0x444b56],['Funda',350,0xd46e91],['Cargador',550,0xe0e0e0],['Audífonos',650,0x343a43]],detail:'Vitrinas iluminadas, teléfonos de muestra, fundas, cargadores y audífonos'},
 {id:'reparacion-celulares',name:'Tecno Soluciones RD',kind:'REPARACIÓN DE CELULARES',open:9,close:19,wall:0xcbd6dc,trim:0x267d8a,task:'diagnostica y prueba celulares',products:[['Diagnóstico móvil',250,0x8bb8c2],['Cambio de pantalla',1850,0x5e7580],['Cambio de batería',950,0x9cb2a0],['Limpieza de puerto',400,0x657b86]],detail:'Mesas de precisión, teléfonos en revisión, repuestos y vitrinas'},
 {id:'internet',name:'Centro Digital Conecta',kind:'INTERNET Y COPIADO',open:8,close:21,wall:0xd1d7e2,trim:0x3c6795,task:'imprime y escanea documentos',products:[['Una impresión',10,0xf2f2ee],['Fotocopia',5,0xe6e1d7],['Escaneo',25,0x9bb6c8],['Una hora de internet',40,0x4c789d]],detail:'Computadoras, impresoras, fotocopiadora, escáner y escritorios'},
 {id:'imprenta',name:'Imprenta La Nacional',kind:'IMPRENTA',open:8,close:18,wall:0xd9c9b7,trim:0x9a563d,task:'prepara e imprime pedidos',products:[['Tarjetas de presentación',650,0xe5d7c3],['Volantes',950,0xf0e6d5],['Afiches',450,0xc86a50],['Invitaciones',1200,0xd6a5a0]],detail:'Impresoras, resmas de papel, tintas, mesa de corte y pedidos empacados'},

 {id:'fotografia',name:'Estudio Fotográfico Luz Caribe',kind:'ESTUDIO FOTOGRÁFICO',open:9,close:19,wall:0xd9d5d0,trim:0x5a6578,task:'prepara sesiones y revisa fotografías',products:[['Foto tamaño carnet',150,0xd7dce0],['Foto impresa 8x10',250,0xc7d3df],['Sesión individual',1200,0x9b8b78],['Retrato familiar',2200,0xb99b83]],detail:'Fondo fotográfico, focos, trípodes, cámaras, computadora y mostrador de impresiones'},
 {id:'serigrafia',name:'Serigrafía Tinta Criolla',kind:'SERIGRAFÍA',open:8,close:18,wall:0xe0d4c4,trim:0x2a6d70,task:'estampa diseños en prendas',products:[['Estampado sencillo',180,0xeeeeee],['Camiseta personalizada',550,0xc8372d],['Gorra estampada',420,0x34495e],['Pedido de 12 camisetas',4800,0xe7b84b]],detail:'Pulpo de serigrafía, marcos de malla, tintas, raseros, camisetas y mesa de secado'},
 {id:'barberia',name:'Barbería El Corte Fino',kind:'BARBERÍA',open:9,close:21,wall:0xc8cbd0,trim:0x243b55,task:'corta y arregla el cabello',products:[['Corte clásico',250,0x293747],['Corte y barba',400,0x5b4035],['Afeitado',180,0xc6a27e],['Diseño de líneas',350,0x8b6a50]],detail:'Sillas de barbero, espejos grandes, máquinas, navajas, capas y área de espera'},
 {id:'salon-belleza',name:'Salón de Belleza Glamour RD',kind:'SALÓN DE BELLEZA',open:8,close:20,wall:0xe8cbd4,trim:0xa34f78,task:'peina y atiende a sus clientas',products:[['Lavado y secado',450,0x9d6c88],['Peinado',650,0xc88ca7],['Tratamiento capilar',850,0x805c48],['Tinte',1450,0x6d4254]],detail:'Espejos con luces, sillones de peluquería, lavacabezas, secadores y exhibidor de productos'},
 {id:'unas',name:'Nails Studio Manos Bonitas',kind:'CENTRO DE UÑAS',open:9,close:19,wall:0xf0d7df,trim:0xb45e85,task:'limpia y decora uñas',products:[['Manicura',350,0xe6b9c8],['Pedicura',500,0xd69bad],['Uñas acrílicas',950,0xb77b9a],['Diseño decorativo',250,0xe9c5a6]],detail:'Mesas de manicura, lámparas UV, sillones de pedicura, esmaltes y muestrarios de diseños'},
 {id:'bordado',name:'Bordados Yanelis',kind:'TALLER DE BORDADO',open:8,close:18,wall:0xd8d2c6,trim:0x536d83,task:'borda nombres y logotipos',products:[['Nombre bordado',180,0x536d83],['Logo pequeño',350,0xc8372d],['Gorra bordada',480,0x9b7654],['Uniforme personalizado',950,0x2a6d70]],detail:'Máquinas de bordado, bastidores, hilos de colores, prendas y computadora con diseños'},
 {id:'ferreteria',name:'Ferretería El Constructor',kind:'FERRETERÍA',open:7,close:19,wall:0xd8c8a8,trim:0x4e7045,task:'despacha herramientas y materiales',products:[['Martillo',350,0x6e7478],['Destornillador',180,0x9b7654],['Pintura galón',1250,0xc86a50],['Cemento',520,0x96938d]],detail:'Estanterías de herramientas, sacos de cemento, pinturas, tubos, tornillos y mostrador de despacho'},
 {id:'repuestos-motos',name:'Repuestos Motores del Cibao',kind:'REPUESTOS DE MOTOCICLETAS',open:8,close:19,wall:0xcbd1d4,trim:0x315b72,task:'busca y entrega piezas de motocicleta',products:[['Bujía',180,0xb4bec2],['Cadena',650,0x59636a],['Pastillas de freno',420,0x8a969b],['Casco',1450,0xd34b3f]],detail:'Vitrinas de piezas, neumáticos, cascos, cadenas, lubricantes y mostrador de repuestos'},
 {id:'taller-motos',name:'Taller de Motos El Pistón',kind:'TALLER DE MOTOCICLETAS',open:7,close:18,wall:0xbfc5c4,trim:0x53636b,task:'revisa y repara motocicletas',products:[['Cambio de aceite',450,0x98754b],['Ajuste de frenos',350,0x697780],['Reparación de goma',250,0x33383d],['Mantenimiento general',950,0x87969b]],detail:'Motocicletas en reparación, elevadores, herramientas, compresor y estantes de lubricantes'},
 {id:'taller-autos',name:'Auto Servicio La 27',kind:'TALLER MECÁNICO AUTOMOTRIZ',open:7,close:18,wall:0xc3c9cc,trim:0x3d596b,task:'diagnostica y repara vehículos',products:[['Diagnóstico básico',650,0x6d8794],['Cambio de aceite',1450,0x9b7654],['Revisión de frenos',1100,0x59636a],['Alineación',1250,0x8da0a8]],detail:'Bahía para vehículos, gato hidráulico, elevador, herramientas, compresor y mostrador de piezas'}
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
 [-94.7752,-219.3287,.2598,-.9657,-1],
 [-118.4,42.6,.98,.18,1],
 [-112.2,119.8,.12,.99,-1],
 [-8.5,154.2,.96,-.28,1],
 [132.4,72.6,.21,.98,-1],
 [165.2,12.8,.99,.1,1],
 [-184.3,22.5,.94,-.34,-1],
 [4.8,-142.5,.18,.98,1],
 [154.6,-112.2,.97,.22,-1],
 [-190.4,-92.7,.24,-.97,1],
 [12.6,214.3,.99,.05,-1],

 [-215.9,245.1,-8.2,-34.7,-1],
 [241.6,190.8,-5.1,-34.2,1],
 [-161,257.5,80.5,-22.4,1],
 [197,233.6,83.7,-32.9,1],
 [-225.8,201.3,-11.7,-52.7,-1],
 [237.1,161.1,-3.8,-25.3,1],
 [-241.6,135.2,-17.7,-69.7,-1],
 [136.3,257.6,37.7,-15.2,1],
 [254.5,-229.2,-12.2,24.1,-1],
 [52.6,-34.1,94.1,-13.9,-1]
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
 // Acabado interior compartido para que los comercios se distingan también por dentro.
 const floorCanvas=document.createElement('canvas');floorCanvas.width=floorCanvas.height=128;
 const floorCtx=floorCanvas.getContext('2d');
 floorCtx.fillStyle='#c8bca7';floorCtx.fillRect(0,0,128,128);
 for(let y=0;y<128;y+=32)for(let x=0;x<128;x+=32){
  floorCtx.fillStyle=((x+y)/32)%2?'#d8cdbb':'#b9ad99';floorCtx.fillRect(x+1,y+1,30,30);
  floorCtx.strokeStyle='#a79b88';floorCtx.lineWidth=1;floorCtx.strokeRect(x+1,y+1,30,30);
 }
 const floorTexture=new T.CanvasTexture(floorCanvas);floorTexture.wrapS=floorTexture.wrapT=T.RepeatWrapping;floorTexture.repeat.set(2,2);
 const floorMaterial=new T.MeshLambertMaterial({map:floorTexture});
 const lampMaterial=new T.MeshBasicMaterial({color:0xffe8ad});
 function signTexture(text,color){const c=document.createElement('canvas');c.width=512;c.height=112;const x=c.getContext('2d');x.fillStyle='#'+color.toString(16).padStart(6,'0');x.fillRect(0,0,512,112);x.strokeStyle='#fff0c9';x.lineWidth=7;x.strokeRect(6,6,500,100);x.fillStyle='#fff';x.font='bold 34px Trebuchet MS';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,56,470);return new T.CanvasTexture(c)}
 function person(parent,shirt,skin=0x9b684b){const g=new T.Group();parent.add(g);cube(g,.58,.82,.34,shirt,0,1.2,0);const head=new T.Mesh(new T.SphereGeometry(.22,10,8),material(skin));head.position.y=1.82;g.add(head);cube(g,.18,.55,.2,0x26364a,-.16,.5,0);cube(g,.18,.55,.2,0x26364a,.16,.5,0);const a=cube(g,.14,.62,.14,shirt,-.38,1.28,0),b=cube(g,.14,.62,.14,shirt,.38,1.28,0);return{g,a,b,phase:Math.random()*6}}
 function transformedBoxCollider(group,w,h,d,x,y,z){const c=Math.cos(group.rotation.y),s=Math.sin(group.rotation.y),corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([lx,lz])=>[group.position.x+lx*c+lz*s+x,group.position.z-lx*s+lz*c+z]);const xs=corners.map(p=>p[0]),zs=corners.map(p=>p[1]),poly=corners.flat();colliders.push({x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs),poly})}
 function build(data,index){
  const [x,z,dx,dz,side]=SITES[index],g=new T.Group();g.position.set(x,0,z);g.rotation.y=Math.atan2(-dx*side,-dz*side);scene.add(g);
  const W=8.2,D=6.6,wall=.22,front=D/2;
  cube(g,W,.16,D,0x9c8c78,0,.08,0);
  const tiledFloor=new T.Mesh(new T.PlaneGeometry(W-.3,D-.3),floorMaterial);
  tiledFloor.rotation.x=-Math.PI/2;tiledFloor.position.y=.171;tiledFloor.receiveShadow=true;g.add(tiledFloor);
  // Luminarias interiores visibles, sin crear luces dinámicas costosas por cada local.
  for(const lx of [-2.25,0,2.25]){
   const fixture=new T.Mesh(new T.BoxGeometry(1.05,.055,.22),lampMaterial);
   fixture.position.set(lx,2.67,-1.65);g.add(fixture);
  }
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
  const sign=new T.Mesh(new T.PlaneGeometry(6.5,1.12),new T.MeshBasicMaterial({map:signTexture(data.id==='colmado'?'COLMADO EL BUEN VECINO':data.kind,data.trim)}));sign.position.set(0,3.65,front+.06);g.add(sign);
  // Estanterías y productos visibles.
  for(let row=0;row<2;row++){cube(g,2.1,.16,.65,0x805b3d,-2.65,.7+row*1.0,-2.45);for(let k=0;k<5;k++)cube(g,.24,.38,.28,data.products[k%data.products.length][2],-3.42+k*.38,1+row*.95,-2.42)}
  for(let k=0;k<4;k++){const p=data.products[k];if(data.id==='jugos'||data.id==='carniceria'||data.id==='pescaderia'){const m=new T.Mesh(new T.SphereGeometry(.25,9,7),material(p[2]));m.position.set(-1.45+k*.55,.55, -2.25);g.add(m)}else cube(g,.34,.48,.34,p[2],-1.45+k*.55,.5,-2.25)}
  cube(g,2.3,1,.8,0x9b6743,0, .58,.75);
  cube(g,.42,.12,.38,0x282b2e,.62,1.14,.55);
  cube(g,.2,.1,.2,0x4b9b62,.62,1.22,.55);
  // Equipamiento particular por categoría.
  if(data.id==='colmado'){
    // Marquesina frontal de lona, típica de pequeños colmados de barrio.
    cube(g,7.15,.14,1.12,0x287b4c,0,3.12,front+.48);
    for(let i=0;i<9;i++){
     const stripe=new T.Mesh(new T.BoxGeometry(.78,.035,1.08),new T.MeshBasicMaterial({color:i%2===0?0x3b965e:0xe9e2c9}));
     stripe.position.set(-3.12+i*.78,3.205,front+.48);g.add(stripe);
    }
    cube(g,7.18,.12,.12,0x174f36,0,3.02,front+1.02);
    for(const px of [-3.25,3.25]){
     cube(g,.09,.12,1.05,0x4b4d42,px,2.94,front+.48);
     cube(g,.12,.12,.12,0x4b4d42,px,2.84,front+.98);
    }
    // Cartel pequeño de agua y refrescos junto a la entrada.
    cube(g,.72,.92,.045,0x1d6683,3.45,1.55,front+.035);
    cube(g,.58,.12,.055,0xe9f1e9,3.45,1.82,front+.07);
    cube(g,.42,.1,.055,0x9bcbd8,3.45,1.55,front+.07);
    // Neveras comerciales junto a la pared derecha.
    for(let i=0;i<2;i++){
     cube(g,.92,2.05,.78,0x3c8791,2.62,1.05,-1.35+i*1.12);
     cube(g,.78,1.82,.045,0x9ccbd0,2.62,1.08,-.94+i*1.12);
     cube(g,.82,.08,.08,0xe9f4ed,2.62,1.96,-.91+i*1.12);
    }
    // Estanterías altas y muy surtidas, como en un colmado de barrio.
    for(let row=0;row<3;row++){
     cube(g,2.25,.13,.58,0x805b3d,-2.65,.52+row*.72,-2.38);
     for(let k=0;k<7;k++){
      const colors=[0xd94a36,0xe5b83b,0x2f9b70,0x3d78ae,0xe9dfc5,0xb75d91,0x9b6743];
      cube(g,.22,.42,.3,colors[(k+row)%colors.length],-3.48+k*.28,.78+row*.72,-2.38);
     }
    }
    // Sacos de arroz y habichuelas cerca del mostrador.
    for(let i=0;i<3;i++){
     const sack=new T.Mesh(new T.CylinderGeometry(.28,.34,.78,10),material([0xd8c5a1,0xb58b61,0x9a7652][i]));     sack.position.set(-3.05+i*.68,.56,.45);g.add(sack);
     cube(g,.48,.08,.48,0xeee3c9,-3.05+i*.68,.98,.45);
    }
    // Botellones azules de agua en un pequeño anaquel metálico.
    for(let row=0;row<2;row++){
     cube(g,1.42,.08,.62,0x35464a,2.55,.48+row*1.05,1.62);
     for(let k=0;k<3;k++){
      const jug=new T.Mesh(new T.CylinderGeometry(.22,.27,.68,12),material(0x438caa));
      jug.position.set(2.12+k*.43,.86+row*1.05,1.62);g.add(jug);
      const cap=new T.Mesh(new T.CylinderGeometry(.09,.09,.09,8),material(0xd9e7dc));
      cap.position.set(2.12+k*.43,1.23+row*1.05,1.62);g.add(cap);
     }
    }
    // Reja de hierro y mostrador frontal de atención.
    for(let i=0;i<9;i++)cube(g,.055,1.9,.055,0x25292a,-3.45+i*.24,1.25,front+.08);
    cube(g,2.25,.09,.12,0x25292a,-2.49,2.18,front+.08);
    // Cajas de refrescos y mercancía apilada junto a la entrada.
    for(let row=0;row<2;row++)for(let k=0;k<3;k++)
     cube(g,.48,.42,.42,[0x286b9b,0xc83e35,0x2d8b57][k],-3.25+k*.52,.25+row*.43,1.72);
    // Bombillas y bandera dominicana sobre la entrada.
    const flag=new T.Mesh(new T.PlaneGeometry(.72,.42),new T.MeshBasicMaterial({color:0xf4f0e5}));
    flag.position.set(-.05,2.48,front+.13);g.add(flag);
    cube(g,.12,.12,.035,0x244b9a,-.2,2.48,front+.16);
    cube(g,.12,.12,.035,0xc83b42,.08,2.48,front+.16);
    // Dos sillas plásticas sencillas en el frente del colmado.
    for(let i=0;i<2;i++){
     const cx=-1.25+i*1.45,cz=front+.95;
     cube(g,.62,.12,.62,0xe8e8df,cx,.48,cz);
     cube(g,.62,.72,.12,0xe8e8df,cx,.86,cz+.25);
     for(const dx of [-.24,.24])for(const dz of [-.23,.23])cube(g,.07,.48,.07,0xe8e8df,cx+dx,.24,cz+dz);
    }
   }
   if(data.id==='ventorrillo'){for(let i=0;i<2;i++){cube(g,.9,1.9,.72,0x4c9db0,2.65,1,-1.2+i*1.15);cube(g,.92,.12,.74,0xd8e8ed,2.65,1.96,-1.2+i*1.15)}for(let i=0;i<3;i++)cube(g,.55,.65,.55,0xd8c5a1,-2.8,.45,1.8+i*.58)}
  if(data.id==='ventorrillo'){
   // Puesto pequeño de barrio con techo de zinc, madera y despacho hacia la acera.
   cube(g,5.7,.16,1.55,0x858b8b,0,2.82,front+.72);
   for(let i=0;i<7;i++)cube(g,.035,.035,1.48,0x62696a,-2.7+i*.9,2.91,front+.72);
   for(const px of [-2.65,2.65]){
    cube(g,.14,2.55,.14,0x76543b,px,1.28,front+.62);
    cube(g,.18,.12,.18,0x4b4f4d,px,2.62,front+.62);
   }
   cube(g,4.9,.12,.72,0x805b3d,0,.9,front+.18);
   cube(g,4.95,.1,.12,0x5c402e,0,1.02,front+.48);
   // Cajones de víveres, plátanos y huevos en la parte visible del puesto.
   for(let i=0;i<3;i++){
    cube(g,.92,.5,.72,0x9a7048,-2.25+i*.95,.3,front+1.12);
    for(let j=0;j<3;j++){
     const item=new T.Mesh(new T.SphereGeometry(.16,8,6),material(i===0?0x8da83c:i===1?0xe0d2b1:0xd8bd83));
     item.position.set(-2.52+i*.95+j*.25,.62,front+1.12);g.add(item);
    }
   }
   // Fundas de productos colgadas y un pequeño menú de precios.
   for(let i=0;i<6;i++)cube(g,.2,.32,.055,[0xd94a36,0xe5b83b,0x3d78ae,0x2f9b70][i%4],-1.15+i*.43,1.75,front+.04);
   cube(g,1.15,.78,.07,0x273f36,2.05,1.85,front+.05);
   cube(g,.94,.08,.08,0xf0d49a,2.05,2.2,front+.1);
   // Banco bajo para clientes y cajas apiladas al costado.
   cube(g,1.15,.18,.42,0x805b3d,2.15,.48,front+1.2);
   for(let i=0;i<2;i++)cube(g,.48,.42,.48,i?0x397b50:0x9a7048,-3.05,.23,front+.25+i*.52);
  }
  if(data.id==='comedor'||data.id==='frituras'||data.id==='empanadas'){for(let i=0;i<2;i++){cube(g,1.05,.12,.72,0x8b6348,-2.5,.65,.2+i*1.25);for(const xx of [-.4,.4])cube(g,.12,.55,.12,0x54463b,-2.5+xx,.32,.2+i*1.25)}}
  if(data.id==='comedor'){
   // Cocina de comedor dominicano: estufa, ollas y área de preparación.
   cube(g,2.45,.92,.92,0x9a9da0,2.45,.55,-2.12);
   cube(g,2.5,.12,.98,0x343a3d,2.45,1.08,-2.12);
   for(let i=0;i<4;i++){
    const burner=new T.Mesh(new T.CylinderGeometry(.22,.22,.055,12),material(0x17191b));
    burner.position.set(1.55+(i%2)*.82,1.17,-2.4+Math.floor(i/2)*.55);g.add(burner);
   }
   for(let i=0;i<3;i++){
    const pot=new T.Mesh(new T.CylinderGeometry(.25,.29,.3,12),material([0xb9c0c2,0x777f83,0xc4c9c9][i]));
    pot.position.set(1.65+i*.72,1.38,-2.12);g.add(pot);
    cube(g,.48,.045,.08,0x34383a,1.65+i*.72,1.55,-2.12);
   }
   // Mostrador de servicio y bandejas del menú del día.
   cube(g,2.75,.9,.72,0x8b6348,.05,.58,-.65);
   cube(g,2.82,.1,.78,0xd5d0c5,.05,1.08,-.65);
   for(let i=0;i<3;i++){
    cube(g,.68,.08,.5,0xb9c4c4,-.82+i*.88,1.19,-.65);
    const food=new T.Mesh(new T.SphereGeometry(.2,10,7),material([0xd8a044,0x8b4a2d,0x6e9b43][i]));
    food.position.set(-.82+i*.88,1.34,-.65);g.add(food);
   }
   // Menú mural y cartel de precios, sin texto pequeño ilegible.
   cube(g,1.65,1.12,.09,0x263b32,-2.75,2.05,-3.12);
   for(let i=0;i<4;i++)cube(g,1.18,.055,.035,[0xf0d28a,0xe7e1cc,0xe7e1cc,0xf0d28a][i],-2.75,2.42-i*.23,-3.055);
   // Nevera de bebidas y dispensador de agua junto al área de clientes.
   cube(g,.82,1.75,.78,0x5c9eaf,3.45,.92,.25);
   cube(g,.88,.12,.82,0xe5eeee,3.45,1.84,.25);
   for(let i=0;i<3;i++)cube(g,.13,.48,.035,[0xd84c3e,0xe7c34e,0x4388b5][i],3.2+i*.24,1.05,.66);
   const water=new T.Mesh(new T.CylinderGeometry(.22,.24,.58,10),material(0x66aeca));
   water.position.set(3.35,.48,1.55);g.add(water);
   // Sillas de comedor a la derecha de las mesas.
   for(let i=0;i<2;i++){
    const cx=1.55+i*1.25,cz=.95;
    cube(g,.58,.1,.58,0x397b55,cx,.48,cz);
    cube(g,.58,.65,.1,0x397b55,cx,.82,cz+.24);
    for(const dx of [-.22,.22])for(const dz of [-.22,.22])cube(g,.065,.45,.065,0x397b55,cx+dx,.23,cz+dz);
   }
  }
  if(data.id==='frituras'){
   // Puesto callejero nocturno: toldo, freidora, caldero y despacho rápido.
   cube(g,5.8,.14,1.75,0x8f342b,0,2.72,front+.72);
   for(const px of [-2.7,2.7]){
    cube(g,.13,2.55,.13,0x34383a,px,1.28,front+.68);
    cube(g,.16,.12,.16,0x555b5d,px,2.55,front+.68);
   }
   for(let i=0;i<6;i++)cube(g,.035,.035,1.65,0x555b5d,-2.5+i,2.82,front+.72);
   // Mostrador de acero con área de entrega al cliente.
   cube(g,4.65,.92,.82,0x76513a,0,.55,front+.18);
   cube(g,4.72,.12,.9,0xb9c0c2,0,1.08,front+.18);
   cube(g,1.18,.08,.72,0x343a3d,-1.25,1.19,front+.18);
   // Freidora doble con canastillas y asas.
   cube(g,1.72,.78,.88,0x555e62,2.55,.58,-1.62);
   cube(g,1.78,.12,.94,0x9ca5a8,2.55,1.03,-1.62);
   for(let i=0;i<2;i++){
    cube(g,.66,.09,.58,0x292e31,2.12+i*.86,1.13,-1.62);
    cube(g,.08,.48,.08,0x777f82,2.12+i*.86,1.37,-1.62);
    cube(g,.48,.055,.08,0x777f82,2.12+i*.86,1.61,-1.62);
   }
   // Caldero tapado y olla auxiliar.
   const pot=new T.Mesh(new T.CylinderGeometry(.48,.42,.62,12),material(0x343a3d));
   pot.position.set(.75,1.38,-1.72);g.add(pot);
   const lid=new T.Mesh(new T.CylinderGeometry(.49,.49,.07,12),material(0x9da5a8));
   lid.position.set(.75,1.72,-1.72);g.add(lid);
   cube(g,.22,.07,.12,0x343a3d,.75,1.8,-1.72);
   const smallPot=new T.Mesh(new T.CylinderGeometry(.28,.25,.42,10),material(0x777f82));
   smallPot.position.set(-.25,1.28,-1.72);g.add(smallPot);
   // Vitrina de frituras: base, cristal y bandejas con productos.
   cube(g,1.75,.78,.68,0x76513a,-2.35,.58,-1.35);
   cube(g,1.78,.07,.72,0xb9c0c2,-2.35,1.02,-1.35);
   for(const px of [-3.12,-1.58]){
    cube(g,.055,.72,.055,0x9ccbd0,px,1.38,-1.35);
    cube(g,.055,.72,.055,0x9ccbd0,px,1.38,-.68);
   }
   cube(g,1.6,.055,.055,0x9ccbd0,-2.35,1.73,-1.35);
   for(let i=0;i<4;i++){
    const snack=new T.Mesh(new T.SphereGeometry(.2,8,6),material(data.products[i][2]));
    snack.scale.set(1.25,.48,.8);
    snack.position.set(-2.92+i*.38,1.17,-1.35);g.add(snack);
   }
   // Bandejas de despacho, servilletas y menú de precios.
   for(let i=0;i<3;i++){
    cube(g,.72,.055,.48,0xd6d8d5,-1.48+i*.78,.16,front+1.05);
    cube(g,.55,.035,.32,data.products[i][2],-1.48+i*.78,.21,front+1.05);
   }
   cube(g,1.65,1.02,.08,0x273f36,2.55,2.02,front+.035);
   for(let i=0;i<4;i++)cube(g,1.2,.055,.035,i%2?0xf2d8a0:0xf3eee1,2.55,2.35-i*.22,front+.085);
   // Bombillas cálidas colgantes del toldo.
   for(let i=0;i<4;i++){
    cube(g,.035,.38,.035,0x34383a,-2.1+i*1.4,2.48,front+.55);
    const bulb=new T.Mesh(new T.SphereGeometry(.13,8,6),lampMaterial);
    bulb.position.set(-2.1+i*1.4,2.25,front+.55);g.add(bulb);
   }
   // Asientos plásticos bajos al costado del puesto.
   for(let i=0;i<2;i++){
    const sx=3.15,sz=front+1.05+i*.82;
    cube(g,.58,.12,.58,0xc83b42,sx,.48,sz);
    cube(g,.58,.58,.1,0xc83b42,sx,.78,sz+.23);
    for(const xx of [-.22,.22])for(const zz of [-.22,.22])cube(g,.06,.42,.06,0x34383a,sx+xx,.22,sz+zz);
   }
  }
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
  // Equipamiento artesanal y técnico propio de los negocios 21 al 30.
  if(data.id==='talabarteria'){
   for(let i=0;i<4;i++){cube(g,.62,.12,.9,0x805033,-3+i*1.1,.9,-1.8);cube(g,.5,.8,.08,0x9a6746,-3+i*1.1,1.35,-1.8)}
   for(let i=0;i<3;i++)cube(g,.18,.75,.18,0x6b4934,2.3+i*.55,.45,-2.1);
   cube(g,1.3,.12,.9,0x9b7654,-2.4,.75,.2);
  }
  if(data.id==='ebanisteria'){
   cube(g,2.5,.18,1.3,0x805331,-2.2,.85,-1.1);
   for(let i=0;i<4;i++)cube(g,.22,1.1,.22,0x9a714b,1.8+i*.48,.55,-2.1);
   for(let i=0;i<3;i++)cube(g,1.25,.22,.55,0xb58b61,2.3,.35,.25+i*.65);
   cube(g,.8,.65,.7,0x58636a,-2.6,.4,-2.15);
  }
  if(data.id==='tapiceria'){
   for(let i=0;i<2;i++){cube(g,1.7,.85,.8,i?0x526b7d:0x9a7185,-2.5,.55,-1.5+i*1.4);cube(g,1.8,.18,.9,0xb9b2a7,-2.5,1.05,-1.5+i*1.4)}
   for(let i=0;i<4;i++)cube(g,.32,.7,.32,data.products[i%4][2],2.1+i*.52,.45,-2.2);
   cube(g,1.5,.16,.8,0x9b7654,2.2,.75,.2);
  }
  if(data.id==='herreria'){
   cube(g,2.1,.16,1.1,0x4c5961,-2.3,.8,-1.2);
   for(let i=0;i<4;i++)cube(g,.16,1.8,.16,0x59636a,1.8+i*.55,.9,-2.2);
   cube(g,1.4,.12,.9,0x6d777d,2.25,.55,.25);
   const glow=new T.Mesh(new T.SphereGeometry(.12,8,6),new T.MeshBasicMaterial({color:0xffb347}));glow.position.set(-2.3,1.35,-1.1);g.add(glow);
  }
  if(data.id==='aluminio'){
   for(let i=0;i<4;i++)cube(g,.16,2.1,.16,0x9bb8c5,-3+i*.55,.95,-2.1);
   for(let i=0;i<2;i++){cube(g,1.5,1.65,.12,0x7d9eaa,2.2,1,-1.7+i*1.1);cube(g,1.25,1.35,.04,0xb9dce8,2.2,1,-1.62+i*1.1)}
   cube(g,2,.16,.85,0x8b9ca4,-2.2,.75,.15);
  }
  if(data.id==='electrodomesticos'){
   cube(g,1.05,1.7,.8,0x9fb8c0,-2.7,.9,-1.8);
   cube(g,.9,1.35,.8,0x7c8d96,-1.45,.7,-1.8);
   cube(g,.85,1.05,.72,0x586b78,2.4,.55,-1.8);
   cube(g,2,.14,.85,0x8c9ca3,2.1,.8,.1);
   for(let i=0;i<3;i++)cube(g,.28,.18,.28,0x46515a,-2.7+i*.55,1.85,-1.8);
  }
  if(data.id==='celulares'){
   for(let i=0;i<5;i++){cube(g,.42,.78,.08,0x343a43,-3.1+i*.72,1.1,-2.2);cube(g,.34,.62,.025,data.products[i%4][2],-3.1+i*.72,1.1,-2.13)}
   cube(g,2.2,.14,.65,0x777f91,2.25,.75,-1.8);
   for(let i=0;i<4;i++)cube(g,.28,.3,.25,data.products[i%4][2],1.5+i*.48,1.05,-1.8);
  }
  if(data.id==='reparacion-celulares'){
   cube(g,2.2,.16,1.05,0x6b7f88,-2.25,.8,-1.35);
   for(let i=0;i<3;i++){cube(g,.55,.08,.38,0x252a30,-2.9+i*.7,1,-1.3);cube(g,.38,.04,.24,0x8bb8c2,-2.9+i*.7,1.07,-1.3)}
   cube(g,.85,.95,.65,0x536a76,2.5,.5,-1.8);
   for(let i=0;i<3;i++)cube(g,.22,.22,.22,data.products[i+1][2],2.1+i*.4,1.05,-1.8);
  }
  if(data.id==='internet'){
   for(let i=0;i<3;i++){cube(g,1.05,.75,.65,0x4a5663,-2.7+i*2.35,.85,-1.65);cube(g,1,.68,.08,0x8eb4c8,-2.7+i*2.35,1.55,-1.9);cube(g,.72,.06,.42,0x303943,-2.7+i*2.35,.42,-1.35)}
   cube(g,1.4,1,.7,0x7e8990,2.5,.5,.25);
  }
  if(data.id==='imprenta'){
   for(let i=0;i<3;i++){cube(g,1.05,1.15,.9,0x626c72,-2.7+i*2.25,.65,-1.8);cube(g,.82,.12,.7,0x9aa6aa,-2.7+i*2.25,1.3,-1.8)}
   cube(g,2.1,.16,1.05,0x9b7654,-2.3,.8,.2);
   for(let i=0;i<4;i++)cube(g,.38,.55,.3,data.products[i][2],1.8+i*.5,.4,-2.15);
  }
  // Equipamiento específico de los negocios 31 al 40.
  if(data.id==='fotografia'){
   cube(g,1.5,2.1,.12,0x394653,-2.5,1.1,-2.1);cube(g,1.25,1.55,.05,0xd9d5d0,-2.5,1.1,-2.02);
   cube(g,.42,.85,.42,0x303941,.8,.45,-1.7);cube(g,.55,.12,.55,0x59636a,.8,1.05,-1.7);
   for(let i=0;i<2;i++)cube(g,.12,1.9,.12,0x687783,2.2+i*.65,.95,-2.1);
   cube(g,1.7,.14,.8,0x8b765f,-2.2,.75,.2);
  }
  if(data.id==='serigrafia'){
   cube(g,2.2,.16,1.2,0x805b3d,-2.3,.8,-1.4);
   for(let i=0;i<3;i++){cube(g,.12,1.35,.12,0x536d83,1.8+i*.55,.7,-2.1);cube(g,.65,.08,.08,0xb5c1c6,2.05+i*.55,1.35,-2.1)}
   cube(g,1.1,.18,.9,0x4b626c,2.35,.7,.15);
   for(let i=0;i<3;i++)cube(g,.45,.65,.08,data.products[i+1][2],-3+i*.65,.45,-2.2);
  }
  if(data.id==='barberia'){
   for(let i=0;i<2;i++){const px=-2.5+i*4.8;cube(g,.95,1.05,.85,0x293747,px,.65,-1.5);cube(g,.95,.16,.95,0x5b4035,px,1.25,-1.5);cube(g,.12,1.7,.08,0x9ca8ad,px,1.35,-2.05);cube(g,1.15,1.65,.06,0x6f8d9b,px,1.45,-2.0)}
   cube(g,1.8,.12,.7,0x805b3d,0,.65,.25);   for(let i=0;i<3;i++)cube(g,.2,.45,.2,data.products[i][2],-.5+i*.5,.95,.25);
  }
  if(data.id==='salon-belleza'){
   for(let i=0;i<3;i++){cube(g,1.05,1.65,.08,0x9aa9ad,-3+i*2.3,1.15,-2.25);cube(g,.95,.08,.08,0xd9e3e4,-3+i*2.3,2,-2.2);cube(g,.65,.75,.65,0x9b6c88,-3+i*2.3,.45,-1.1)}
   cube(g,1.1,.9,.85,0x6b8792,2.5,.5,.2);
  }
  if(data.id==='unas'){
   for(let i=0;i<2;i++){cube(g,1.6,.14,.85,0xf0e6e1,-2.2+i*4.2,.8,-1.35);cube(g,.55,.55,.55,0xd69bad,-2.2+i*4.2,.35,-1.35);cube(g,.35,.18,.35,0xf5e7ef,-2.2+i*4.2,1,-1.35)}
   for(let i=0;i<5;i++)cube(g,.16,.25,.16,data.products[i%4][2],-3+i*.48,1.05,-2.1);
  }
  if(data.id==='bordado'){
   for(let i=0;i<2;i++){cube(g,1.2,.95,.8,0x536d83,-2.3+i*4.5,.55,-1.5);cube(g,.85,.16,.65,0x9baeb8,-2.3+i*4.5,1.12,-1.5);const hoop=new T.Mesh(new T.TorusGeometry(.32,.045,6,16),material(0xb58b61));hoop.position.set(-2.3+i*4.5,1.3,-1.02);g.add(hoop)}
   for(let i=0;i<5;i++)cube(g,.18,.55,.18,data.products[i%4][2],-3+i*.48,.4,-2.25);
  }
  if(data.id==='ferreteria'){
   for(let row=0;row<3;row++){cube(g,2.2,.12,.55,0x76543b,-2.6,.55+row*.72,-2.1);for(let i=0;i<5;i++)cube(g,.28,.38,.28,data.products[(i+row)%4][2],-3.35+i*.38,.8+row*.72,-2.1)}
   for(let i=0;i<3;i++)cube(g,.55,.85,.55,0x96938d,2.4,.45,-1.9+i*.75);
  }
  if(data.id==='repuestos-motos'){
   for(let row=0;row<3;row++){cube(g,2.2,.12,.55,0x59636a,-2.55,.55+row*.72,-2.15);for(let i=0;i<4;i++)cube(g,.34,.34,.3,data.products[(i+row)%4][2],-3.2+i*.42,.8+row*.72,-2.15)}
   for(let i=0;i<2;i++){const tire=new T.Mesh(new T.TorusGeometry(.42,.13,7,16),material(0x25292d));tire.position.set(2.35,.55,-1.55+i*1.05);g.add(tire)}
  }
  if(data.id==='taller-motos'){
   cube(g,1.25,.22,2.2,0x53636b,-2.3,.55,-1.5);
   const wheel=new T.Mesh(new T.TorusGeometry(.38,.13,7,16),material(0x25292d));wheel.position.set(-2.3,.9,-1.5);g.add(wheel);
   cube(g,.9,.8,.65,0x59636a,2.4,.45,-1.8);
   for(let i=0;i<3;i++)cube(g,.18,.75,.18,0x8b969b,1.8+i*.45,.4,-2.2);
  }
  if(data.id==='taller-autos'){
   cube(g,3.3,.18,4.2,0x53636b,-2.1,.18,-1.3);
   cube(g,1.8,.72,3.4,0x315b72,-2.1,.8,-1.3);
   cube(g,1.55,.62,1.55,0x8bb5c9,-2.1,1.45,-1.3);
   for(const px of [-3.05,-1.15])for(const pz of [-2.45,-.15]){const tire=new T.Mesh(new T.TorusGeometry(.3,.12,7,14),material(0x24282b));tire.rotation.y=Math.PI/2;tire.position.set(px,.42,pz);g.add(tire)}
   for(let i=0;i<3;i++)cube(g,.22,.8,.22,0x6d777d,2+i*.42,.4,-2.1);
  }
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
  if(hud){hud.textContent='Comercios: '+shops.filter(s=>s.open).length+'/'+shops.length+' abiertos · '+money(economy.cash)+(nearbyShop?' · F: '+nearbyShop.data.kind:'')}
  if(active&&info){info.textContent=(active.open?'Abierto':'Cerrado')+' · '+active.data.detail+' · Empleado: '+active.data.task+' · Ventas simuladas: '+active.sales+' · '+money(economy.cash);if(!active.open)products.querySelectorAll('button').forEach(b=>b.disabled=true)}
 }
 return{update,interact,close:closePanel,shops};
}