// Economía urbana dominicana: 40 comercios con interiores, clientes y personal real.
import { shopPreference, demandAt, queueWorld, saleCost, productIndexFor } from './economy.js';
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

// Coloca los comercios en solares libres junto a la vía, mirando hacia la calle.
// Antes había 40 coordenadas fijas y 16 caían dentro de edificios del mapa real.
function placeShops(world, count, avoid = []) {
  const roads = world.roads || [], buildings = world.buildings || [];
  const spawn = world.spawn || [0, 0];
  const W = 8.2, D = 6.6, MIN_GAP = 20;
  const insidePoly = (x, z, p) => {
    let ins = false;
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      const xi = p[i], zi = p[i + 1], xj = p[j], zj = p[j + 1];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / ((zj - zi) || 1e-6) + xi) ins = !ins;
    }
    return ins;
  };
  const segCross = (a, b, c, d) => {
    const rx = b[0] - a[0], rz = b[1] - a[1], sx = d[0] - c[0], sz = d[1] - c[1];
    const den = rx * sz - rz * sx;
    if (Math.abs(den) < 1e-9) return false;
    const t = ((c[0] - a[0]) * sz - (c[1] - a[1]) * sx) / den;
    const u = ((c[0] - a[0]) * rz - (c[1] - a[1]) * rx) / den;
    return t > 0 && t < 1 && u > 0 && u < 1;
  };
  const overlaps = (rect, poly) => {
    // Muestreo del interior del solar: un simple test de esquinas deja pasar
    // solares metidos en patios interiores de edificios con forma de U.
    let rx0 = Infinity, rx1 = -Infinity, rz0 = Infinity, rz1 = -Infinity;
    for (const p of rect) { rx0 = Math.min(rx0, p[0]); rx1 = Math.max(rx1, p[0]); rz0 = Math.min(rz0, p[1]); rz1 = Math.max(rz1, p[1]); }
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) {
      const x = rx0 + (rx1 - rx0) * i / 4, z = rz0 + (rz1 - rz0) * j / 4;
      if (insidePoly(x, z, poly)) return true;
    }
    for (let i = 0; i < poly.length; i += 2) {
      if (poly[i] > rx0 && poly[i] < rx1 && poly[i + 1] > rz0 && poly[i + 1] < rz1) return true;
    }
    for (let i = 0; i < rect.length; i++) {
      const a = rect[i], b = rect[(i + 1) % rect.length];
      for (let k = 0; k < poly.length - 2; k += 2) {
        if (segCross(a, b, [poly[k], poly[k + 1]], [poly[k + 2], poly[k + 3]])) return true;
      }
    }
    return false;
  };
  const pathClear = (x0, z0, x1, z1) => {
    for (let t = 0; t <= 1; t += .07) {
      const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      if (buildings.some(b => insidePoly(x, z, b.poly))) return false;
    }
    return true;
  };
  const slots = [];
  for (const r of roads) {
    if (r.width < 6) continue;
    const p = r.points;
    for (let i = 0; i + 3 < p.length; i += 2) {
      const ax = p[i], az = p[i + 1], bx = p[i + 2], bz = p[i + 3];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 10) continue;
      const dx = (bx - ax) / len, dz = (bz - az) / len, nx = -dz, nz = dx;
      for (let s = 5; s < len - 5; s += 7) {
        const px = ax + dx * s, pz = az + dz * s;
        for (const side of [1, -1]) {
          const off = r.width / 2 + 2.2 + D / 2;
          const cx = px + nx * side * off, cz = pz + nz * side * off;
          const dist = Math.hypot(cx - spawn[0], cz - spawn[1]);
          if (dist < 45 || dist > 340) continue;
          if (slots.some(o => Math.hypot(o.x - cx, o.z - cz) < MIN_GAP)) continue;
          if (avoid.some(o => Math.hypot(o.x - cx, o.z - cz) < 16)) continue;
          const rect = [[-1, -1], [-1, 1], [1, 1], [1, -1]].map(([a, b]) => [
            cx + dx * a * W / 2 + nx * side * b * D / 2,
            cz + dz * a * W / 2 + nz * side * b * D / 2
          ]);
          if (buildings.some(b => overlaps(rect, b.poly))) continue;
          const frontX = cx - nx * side * D / 2, frontZ = cz - nz * side * D / 2;
          if (!pathClear(frontX, frontZ, px, pz)) continue;
          slots.push({ x: cx, z: cz, rot: Math.atan2(dz * side, -dx * side), dist });
        }
      }
    }
  }
  slots.sort((a, b) => a.dist - b.dist);
  const near = slots.filter(s => s.dist < 180).slice(0, 16);
  const rest = slots.filter(s => s.dist >= 180);
  const step = Math.max(1, Math.floor(rest.length / Math.max(1, count - near.length)));
  const chosen = near.slice();
  for (let i = 0; i < rest.length && chosen.length < count; i += step) chosen.push(rest[i]);
  for (let i = 0; chosen.length < count && i < slots.length; i++) if (!chosen.includes(slots[i])) chosen.push(slots[i]);
  return chosen;
}

const FOOD = /plato|empanada|yaniqueque|tostones|quipe|pastelito|jugo|chinola|lechosa|tamarindo|limón|pan|bizcocho|galleta|dulce|leche|huevo|plátano|aguacate|yuca|tomate|pollo|carne|cerdo|chuleta|longaniza|pescado|camarón|filete|calamar|arroz|habichuela|queso|agua|fruta|vegetal/i;

export function createBusinessSystem(T, scene, colliders, world, avoid = []) {
 const shops=[], matCache=new Map();
 const W=8.2,D=6.6;
 const material=c=>{if(!matCache.has(c))matCache.set(c,new T.MeshLambertMaterial({color:c}));return matCache.get(c)};
 const cube=(parent,w,h,d,color,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const panel=document.getElementById('business-panel');
 const title=document.getElementById('business-title');
 const info=document.getElementById('business-info');
 const products=document.getElementById('business-products');
 const close=document.getElementById('business-close');
 const hud=document.getElementById('business-hud');
 let active=null,insideShop=null;
 let economy={cash:2500,inventory:{}},savedShops=null;
 try{const old=JSON.parse(localStorage.getItem('operacion-caribe-economy-v1')||'null');if(old&&Number.isFinite(old.cash)){economy={cash:old.cash,inventory:old.inventory||{}};savedShops=old.shops||null}}catch{}
 const save=()=>{try{const data={...economy,shops:Object.fromEntries(shops.map(s=>[s.data.id,{stock:s.stock,sales:s.sales,visits:s.visits,revenue:s.revenue,costs:s.costs,profit:s.profit,citizenSales:s.citizenSales}]))};localStorage.setItem('operacion-caribe-economy-v1',JSON.stringify(data))}catch{}};
 const money=n=>'RD$ '+Math.round(n).toLocaleString('es-DO');
 const shopLight=new T.PointLight(0xffe0a8,0,15,2);scene.add(shopLight);
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
 function person(parent,shirt,skin=0x9b684b){const g=new T.Group();parent.add(g);cube(g,.58,.82,.34,shirt,0,1.2,0);const head=new T.Mesh(new T.SphereGeometry(.22,10,8),material(skin));head.position.y=1.82;g.add(head);const l=cube(g,.18,.55,.2,0x26364a,-.16,.5,0),r=cube(g,.18,.55,.2,0x26364a,.16,.5,0);const a=cube(g,.14,.62,.14,shirt,-.38,1.28,0),b=cube(g,.14,.62,.14,shirt,.38,1.28,0);return{g,a,b,l,r,phase:Math.random()*6}}
 function transformedBoxCollider(group,w,h,d,x,y,z){const c=Math.cos(group.rotation.y),s=Math.sin(group.rotation.y),corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([lx,lz])=>{const ax=lx+x,az=lz+z;return[group.position.x+ax*c+az*s,group.position.z-ax*s+az*c]});const xs=corners.map(p=>p[0]),zs=corners.map(p=>p[1]),poly=corners.flat();colliders.push({x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs),poly})}
 function build(data,site,index){
  const {x,z,rot}=site,g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
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
    // Bombillas y bandera dominicana sobre la entrada.    const flag=new T.Mesh(new T.PlaneGeometry(.72,.42),new T.MeshBasicMaterial({color:0xf4f0e5}));    flag.position.set(-.05,2.48,front+.13);g.add(flag);
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
  if(data.id==='empanadas'){
   // Empanadería de barrio: horno, mesa de masa y vitrina de productos recién hechos.
   cube(g,5.2,.14,1.45,0xd9a15c,0,2.72,front+.58);
   for(const px of [-2.42,2.42]){
    cube(g,.12,2.55,.12,0x76513a,px,1.28,front+.55);
    cube(g,.16,.12,.16,0x9a7048,px,2.55,front+.55);
   }
   // Horno compacto de acero con puerta y controles frontales.
   cube(g,1.72,1.55,1.05,0x777f82,2.45,.88,-2.05);
   cube(g,1.48,.92,.055,0x343a3d,2.45,.88,-1.505);
   cube(g,1.22,.68,.035,0x9ca5a8,2.45,.9,-1.46);
   for(let i=0;i<3;i++){
    const knob=new T.Mesh(new T.SphereGeometry(.065,8,6),material(0x25292a));
    knob.position.set(2.05+i*.36,1.62,-1.45);g.add(knob);
   }
   // Bandejas metálicas y empanadas doradas sobre el área de exhibición.
   cube(g,1.92,.1,.78,0xb9c0c2,-2.35,.98,-1.65);
   for(let row=0;row<2;row++)for(let i=0;i<4;i++){
    const pastry=new T.Mesh(new T.SphereGeometry(.2,10,7),material([0xdca34c,0xc88742,0xe5b85c,0xb8793e][i]));
    pastry.scale.set(1.25,.48,.72);
    pastry.position.set(-3.05+i*.46,1.13+row*.27,-1.82+row*.34);g.add(pastry);
   }
   // Mesa de preparación con masa, rodillo y recipientes.
   cube(g,2.25,.82,.88,0x8b6348,.05,.52,-2.2);
   cube(g,2.3,.1,.92,0xe6dfcf,.05,.98,-2.2);
   cube(g,.95,.035,.62,0xd8c9a9,-.28,1.06,-2.2);
   const dough=new T.Mesh(new T.CylinderGeometry(.24,.24,.12,16),material(0xe8d6ad));
   dough.rotation.x=Math.PI/2;dough.position.set(-.28,1.18,-2.2);g.add(dough);
   const roller=new T.Mesh(new T.CylinderGeometry(.055,.055,.58,10),material(0x9c754f));
   roller.rotation.z=Math.PI/2;roller.position.set(.55,1.14,-2.2);g.add(roller);
   for(let i=0;i<2;i++){
    const bowl=new T.Mesh(new T.CylinderGeometry(.18,.14,.16,12),material(i?0x9da6a8:0xc1c7c8));
    bowl.position.set(.72+i*.48,1.13,-2.2);g.add(bowl);
   }
   // Vitrina frontal con paneles transparentes y estantes.
   cube(g,1.95,.72,.62,0x76513a,2.35,.55,.05);
   cube(g,1.98,.07,.68,0xb9c0c2,2.35,.95,.05);
   for(const px of [1.38,3.32]){
    cube(g,.045,.72,.045,0x9ccbd0,px,1.34,.05);
   }
   for(const zz of [-.25,.35]){
    cube(g,1.9,.045,.045,0x9ccbd0,2.35,1.34,zz);
   }
   for(let i=0;i<4;i++){
    const display=new T.Mesh(new T.SphereGeometry(.17,10,7),material(data.products[i][2]));
    display.scale.set(1.25,.55,.8);
    display.position.set(1.62+i*.48,1.13,.05);g.add(display);
   }
   // Cartel de especialidades y lámparas sobre el mostrador.
   cube(g,1.8,.95,.08,0x8b342b,-2.45,2.05,front+.035);
   for(let i=0;i<4;i++)cube(g,1.35,.055,.035,i%2?0xf0d9aa:0xf4eee1,-2.45,2.35-i*.2,front+.085);
   for(let i=0;i<3;i++){
    cube(g,.035,.32,.035,0x34383a,-1.7+i*1.7,2.48,front+.38);
    const bulb=new T.Mesh(new T.SphereGeometry(.11,8,6),lampMaterial);
    bulb.position.set(-1.7+i*1.7,2.27,front+.38);g.add(bulb);
   }
   // Cajas de empaques y servilletas junto al área de entrega.
   for(let i=0;i<3;i++){
    cube(g,.42,.24,.42,0xd7c6a3,-3.05+i*.48,.18,front+.85);
    cube(g,.32,.045,.32,0xf0eee7,-3.05+i*.48,.32,front+.85);
   }  }
  if(data.id==='jugos'){
   // Puesto de jugos naturales: frutas frescas, licuadoras y barra de preparación.
   cube(g,5.35,.14,1.5,0x2e8b62,0,2.72,front+.62);
   for(const px of [-2.5,2.5])cube(g,.12,2.55,.12,0x76513a,px,1.28,front+.58);
   cube(g,4.35,.88,.82,0x805b3d,0,.55,front+.18);
   cube(g,4.42,.1,.88,0xd8d2c2,0,1.05,front+.18);
   // Licuadoras con bases, vasos transparentes y tapas.
   for(let i=0;i<3;i++){
    const x=-1.35+i*1.35;
    cube(g,.48,.28,.42,0x65747a,x,1.22,-1.75);
    const jar=new T.Mesh(new T.CylinderGeometry(.2,.15,.58,10,1,true),new T.MeshStandardMaterial({color:0x9ccbd0,transparent:true,opacity:.58,roughness:.2}));
    jar.position.set(x,1.62,-1.75);g.add(jar);
    cube(g,.42,.06,.42,0x343a3d,x,1.94,-1.75);
    const juice=new T.Mesh(new T.CylinderGeometry(.145,.13,.22,10),material(data.products[i%data.products.length][2]));
    juice.position.set(x,1.48,-1.75);g.add(juice);
   }
   // Cajones de frutas variadas para preparar los jugos.
   for(let i=0;i<3;i++){
    const x=-2.7+i*1.05;
    cube(g,.92,.42,.72,0x9a7048,x,.28,-2.65);
    for(let j=0;j<4;j++){
     const fruit=new T.Mesh(new T.SphereGeometry(.17,8,7),material(data.products[(i+j)%data.products.length][2]));
     fruit.position.set(x-.27+(j%2)*.38,.58,-2.8+Math.floor(j/2)*.3);g.add(fruit);
    }
   }
   // Neverita para hielo, vasos apilados y dispensador.
   cube(g,1.05,1.25,.82,0x6ca9b8,2.75,.68,-1.65);
   cube(g,1.1,.1,.86,0xe3f0ee,2.75,1.35,-1.65);
   for(let i=0;i<4;i++){
    const cup=new T.Mesh(new T.CylinderGeometry(.11,.085,.22,10),material(0xf1eee5));
    cup.position.set(1.95+i*.22,1.2,-.55);g.add(cup);
   }
   const dispenser=new T.Mesh(new T.CylinderGeometry(.22,.24,.58,12),material(0x70b9d1));
   dispenser.position.set(2.85,.55,.55);g.add(dispenser);
   // Pizarra de sabores y bombillas cálidas.
   cube(g,1.75,1.02,.08,0x263b32,-2.55,2.02,front+.04);
   for(let i=0;i<4;i++)cube(g,1.2,.055,.035,i%2?0xf0d28a:0xf3eee1,-2.55,2.3-i*.2,front+.085);
   for(let i=0;i<3;i++){
    cube(g,.035,.34,.035,0x34383a,-1.65+i*1.65,2.48,front+.4);
    const bulb=new T.Mesh(new T.SphereGeometry(.11,8,6),lampMaterial);
    bulb.position.set(-1.65+i*1.65,2.25,front+.4);g.add(bulb);
   }
   // Dos taburetes para clientes que esperan su pedido.
   for(let i=0;i<2;i++){
    const x=1.65+i*1.05,z=front+1.05;
    cube(g,.48,.12,.48,0x39865b,x,.55,z);
    cube(g,.07,.48,.07,0x34383a,x-.16,.28,z-.16);
    cube(g,.07,.48,.07,0x34383a,x+.16,.28,z-.16);
    cube(g,.07,.48,.07,0x34383a,x-.16,.28,z+.16);
    cube(g,.07,.48,.07,0x34383a,x+.16,.28,z+.16);
   }
  }
  if(data.id==='jugos'){for(let i=0;i<2;i++){const m=new T.Mesh(new T.CylinderGeometry(.13,.16,.38,10),material(0x7eb8c7));m.position.set(2.4,.55,-1+i*.65);g.add(m)}}
  if(data.id==='panaderia'){
   // Panadería tradicional: horno de mampostería, bandejas y pan recién horneado.
   cube(g,1.9,1.65,1.35,0x9b7654,2.45,.92,-1.85);
   cube(g,1.55,1.05,.08,0x4a3428,2.45,.92,-1.14);
   cube(g,1.32,.82,.045,0x242321,2.45,.98,-1.085);
   cube(g,1.72,.12,.12,0xb5a18a,2.45,1.55,-1.08);
   // Chimenea corta y salida superior del horno.
   cube(g,.48,1.15,.5,0x805b45,3.05,2.28,-2.15);
   cube(g,.62,.12,.62,0x51433a,3.05,2.88,-2.15);
   // Estantería de madera con panes de agua y panes sobaos.
   for(let row=0;row<3;row++){
    cube(g,2.05,.12,.62,0x805b3d,-2.65,.58+row*.68,-2.15);
    for(let i=0;i<5;i++){
     const loaf=new T.Mesh(new T.SphereGeometry(.19,10,7),material(data.products[(i+row)%data.products.length][2]));
     loaf.scale.set(1.45,.62,.82);
     loaf.position.set(-3.42+i*.38,.78+row*.68,-2.15);
     g.add(loaf);
    }
   }
   // Bandejas metálicas con panecillos listos para despacho.
   for(let row=0;row<2;row++){
    cube(g,1.65,.07,.78,0xb9c0c2,-.25,1.02+row*.42,-1.48);
    for(let i=0;i<4;i++){
     const bread=new T.Mesh(new T.SphereGeometry(.17,9,7),material(data.products[(i+row)%data.products.length][2]));
     bread.scale.set(1.25,.62,.8);
     bread.position.set(-.82+i*.38,1.16+row*.42,-1.48);
     g.add(bread);
    }
   }
   // Mesa de amasado, masa y rodillo.
   cube(g,1.85,.78,.92,0x8b6348,.05,.52,-2.75);
   cube(g,1.92,.1,.98,0xe4dfd2,.05,.96,-2.75);
   const dough=new T.Mesh(new T.SphereGeometry(.25,12,9),material(0xe8d6ad));
   dough.scale.set(1.35,.38,1);
   dough.position.set(-.25,1.08,-2.75);
   g.add(dough);
   const rollingPin=new T.Mesh(new T.CylinderGeometry(.055,.055,.62,10),material(0x9c754f));
   rollingPin.rotation.z=Math.PI/2;
   rollingPin.position.set(.48,1.1,-2.75);
   g.add(rollingPin);
   // Sacos de harina junto a la mesa de trabajo.
   for(let i=0;i<3;i++){
    const sack=new T.Mesh(new T.CylinderGeometry(.27,.34,.72,10),material(i===1?0xd6c8a8:0xb9a783));
    sack.position.set(-3.15+i*.62,.55,.55);
    g.add(sack);
    cube(g,.38,.07,.38,0xe8dfc9,-3.15+i*.62,.94,.55);
   }
   // Vitrina de panes y cartel de especialidades en el frente.
   cube(g,1.9,.72,.62,0x76513a,2.25,.55,.18);
   cube(g,1.94,.07,.68,0xb9c0c2,2.25,.95,.18);
   for(let i=0;i<4;i++){
    const display=new T.Mesh(new T.SphereGeometry(.16,9,7),material(data.products[i][2]));
    display.scale.set(1.3,.65,.85);
    display.position.set(1.55+i*.46,1.13,.18);
    g.add(display);
   }
   cube(g,1.85,.9,.08,0x704b35,-2.45,2.05,front+.035);
   for(let i=0;i<4;i++)cube(g,1.3,.055,.035,i%2?0xf0d9aa:0xf4eee1,-2.45,2.34-i*.19,front+.085);
  }
  if(data.id==='reposteria'){
   // Dulcería y repostería: vitrinas, bizcochos decorados y bandejas de dulces.
   cube(g,1.25,1.35,.9,0x51433a,2.55,.8,-1.55);
   cube(g,.9,.7,.08,0xe4b66d,2.55,.85,-1.05);
   // Vitrina principal con paneles de cristal y dos niveles de exhibición.
   cube(g,2.25,.78,.72,0x76513a,-2.25,.58,-1.35);
   cube(g,2.3,.07,.76,0xb9c0c2,-2.25,1.02,-1.35);
   for(const px of [-3.35,-1.15])cube(g,.045,.78,.045,0x9ccbd0,px,1.42,-1.35);
   cube(g,2.2,.045,.045,0x9ccbd0,-2.25,1.82,-1.35);
   for(let i=0;i<4;i++){
    const cake=new T.Mesh(new T.CylinderGeometry(.22,.24,.22,12),material([0xf0d4b5,0xe7a6b4,0x8d5a48,0xf1e6d1][i]));
    cake.position.set(-3.05+i*.52,1.17,-1.35);g.add(cake);
    const icing=new T.Mesh(new T.SphereGeometry(.12,10,7),material([0xfff0df,0xf5d8e1,0xf4e5bd,0xfff7e8][i]));
    icing.scale.set(1.25,.45,1.1);icing.position.set(-3.05+i*.52,1.32,-1.35);g.add(icing);
   }
   // Mesa de decoración con manga pastelera, recipientes y bizcocho.
   cube(g,2.05,.82,.92,0x8b6348,.05,.52,-2.35);
   cube(g,2.12,.1,.98,0xe8dfd2,.05,.98,-2.35);
   const cakeBase=new T.Mesh(new T.CylinderGeometry(.36,.36,.2,16),material(0xf0d4b5));
   cakeBase.position.set(-.45,1.14,-2.35);g.add(cakeBase);
   const cakeTop=new T.Mesh(new T.CylinderGeometry(.32,.34,.12,16),material(0xf5e8db));
   cakeTop.position.set(-.45,1.3,-2.35);g.add(cakeTop);
   for(let i=0;i<3;i++){
    const bowl=new T.Mesh(new T.CylinderGeometry(.15,.12,.14,10),material([0xe7a6b4,0xf0d4b5,0x9bc3d0][i]));
    bowl.position.set(.25+i*.42,1.12,-2.35);g.add(bowl);
   }
   // Bandejas con dulces criollos y pequeños pastelitos.
   for(let row=0;row<2;row++){
    cube(g,1.55,.06,.62,0xb9c0c2,-.1,.65+row*.5,.65);
    for(let i=0;i<4;i++){
     const sweet=new T.Mesh(new T.SphereGeometry(.13,9,7),material([0xc98b52,0xe6c36b,0x8b4c35,0xe8d7bd][i]));
     sweet.scale.set(1.2,.7,1);
     sweet.position.set(-.65+i*.36,.78+row*.5,.65);
     g.add(sweet);
    }
   }
   // Estantería de cajas de repostería y envases.
   for(let row=0;row<2;row++){
    cube(g,1.45,.1,.58,0x805b3d,2.75,.55+row*.82,-2.45);
    for(let i=0;i<3;i++)cube(g,.36,.32,.38,[0xf0e5d2,0xe8c9a8,0xf6eee2][i],2.25+i*.48,.78+row*.82,-2.45);
   }
   // Letrero mural de especialidades y lámparas cálidas.
   cube(g,1.85,.92,.08,0x754b55,-2.45,2.05,front+.035);
   for(let i=0;i<4;i++)cube(g,1.28,.055,.035,i%2?0xf3d8b7:0xfff1df,-2.45,2.34-i*.19,front+.085);
   for(let i=0;i<3;i++){
    cube(g,.035,.3,.035,0x34383a,-1.6+i*1.6,2.48,front+.38);
    const bulb=new T.Mesh(new T.SphereGeometry(.1,8,6),lampMaterial);
    bulb.position.set(-1.6+i*1.6,2.28,front+.38);g.add(bulb);
   }
  }
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
   cube(g,1.4,1,.7,0x7e8990,2.5,.5,.25);  }
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
  cube(g,W+.2,.18,D+.2,data.trim,0,2.9,0);
  cube(g,1.6,.03,1.1,0xb04a3a,0,.19,front+.25);
  const worker=person(g,data.trim);
  const visitors=[];
  for(let i=0;i<2;i++){
   const v=person(g,[0x3b6e87,0xc85a4a,0x4f8b6a,0x9b6a3f][i]);
   v.g.position.set(0,0,front+2.6);v.g.visible=false;
   v.state='idle';v.t=0;v.tx=0;v.tz=0;v.sx=0;v.walk=0;
   visitors.push(v);
  }
  transformedBoxCollider(g,W,.2,.22,0,0,-D/2);
  transformedBoxCollider(g,.22,.2,D,-W/2,0,0);transformedBoxCollider(g,.22,.2,D,W/2,0,0);
  // Mostrador, estantería y neveras sólidos; la entrada central queda libre.
  transformedBoxCollider(g,2.3,.9,.8,0,0,.75);
  transformedBoxCollider(g,2.2,.9,.9,-2.65,0,-2.4);
  transformedBoxCollider(g,1.0,.9,2.4,2.6,0,-1.3);
  transformedBoxCollider(g,1.75,.2,.15,-2.45,0,front-.12);
  transformedBoxCollider(g,1.75,.2,.15,2.45,0,front-.12);
  // El mostrador divide el área, pero deja un paso frontal para entrar.
  const hours={open:data.open,close:data.close};
  const register=cube(g,.55,.3,.38,0x252b2e,.55,1.33,.75);
  cube(g,.42,.15,.02,0x8ff0c2,.55,1.38,.56);
  return{data,g,worker,visitors,phase:index*.8,visitorT:2+Math.random()*10,open:true,hours,stock:data.products.map(p=>12),sales:0,visits:0,revenue:0,costs:0,profit:0,citizenSales:0,preference:shopPreference(data),queue:[],actualStaff:0,register,registerPulse:0,restockT:28+Math.random()*35};
 }
 const sites=placeShops(world,CATALOG.length,avoid);
 CATALOG.forEach((d,i)=>shops.push(build(d,sites[i]||sites[sites.length-1],i)));
 if(savedShops)for(const s of shops){const st=savedShops[s.data.id];if(!st)continue;if(Array.isArray(st.stock))s.stock=st.stock.map(v=>Math.max(0,v|0)).slice(0,s.data.products.length);s.sales=Math.max(0,st.sales|0);s.visits=Math.max(0,st.visits|0);s.revenue=Math.max(0,Number(st.revenue)||0);s.costs=Math.max(0,Number(st.costs)||0);s.profit=Math.max(0,Number(st.profit)||0);s.citizenSales=Math.max(0,st.citizenSales|0)}
 function recordSale(shop,index,buyer='visitor'){
  if(!shop||!shop.data.products[index]||shop.stock[index]<=0)return null;
  const product=shop.data.products[index];
  shop.stock[index]--;
  shop.sales++;shop.visits++;shop.revenue+=product[1];shop.costs+=saleCost(product[1]);shop.profit=shop.revenue-shop.costs;shop.registerPulse=1;shop.lastBuyer=buyer;if(buyer==='citizen')shop.citizenSales=(shop.citizenSales||0)+1;
  save();return {name:product[0],price:product[1],index};
 }
 function joinQueue(shop,npc){
  if(!shop||!shop.open||!npc)return null;
  if(shop.queue.some(q=>q.npc===npc)){const q=shop.queue.find(q=>q.npc===npc);return {index:shop.queue.indexOf(q),spot:queueWorld(shop,shop.queue.indexOf(q))}}
  if(shop.queue.length>=6)return null;
  const index=shop.queue.length;shop.queue.push({npc,index,t:0});
  return {index,spot:queueWorld(shop,index)};
 }
 function leaveQueue(shop,npc){if(!shop)return;const i=shop.queue.findIndex(q=>q.npc===npc);if(i>=0)shop.queue.splice(i,1)}
 function queueIndex(shop,npc){return shop?shop.queue.findIndex(q=>q.npc===npc):-1}
 function isFirst(shop,npc){return !!shop&&shop.queue[0]?.npc===npc}
 function serveCustomer(shop,npc){
  if(!shop||!shop.open||!isFirst(shop,npc))return null;
  const index=productIndexFor(shop.stock);
  if(index<0)return null;
  return recordSale(shop,index,'citizen');
 }
 function shopById(id){return shops.find(s=>s.data.id===id)||null}
 function availableFor(preference){
  return shops.filter(s=>s.open&&s.preference===preference&&s.stock.some(v=>v>0));
 }
 function setPanel(shop){active=shop;if(!panel)return;title.textContent=shop.data.name;info.textContent=shop.open?shop.data.detail+' · Abierto · '+money(economy.cash):'Este negocio está cerrado ahora.';products.replaceChildren();shop.data.products.forEach((p,i)=>{const b=document.createElement('button');b.className='business-buy';b.textContent=p[0]+' · '+money(p[1])+' · '+shop.stock[i]+' disp.';b.disabled=!shop.open||shop.stock[i]<=0||economy.cash<p[1];b.addEventListener('click',()=>{if(!active||!active.open||active.stock[i]<=0||economy.cash<p[1])return;economy.cash-=p[1];recordSale(active,i,'player');economy.inventory[p[0]]=(economy.inventory[p[0]]||0)+1;save();setPanel(active)});products.appendChild(b)});panel.style.display='flex'}
 function closePanel(){active=null;if(panel)panel.style.display='none'}
 close?.addEventListener('click',closePanel);
 function interact(pos){let nearest=null,best=9;for(const s of shops){const d=Math.hypot(pos.x-s.g.position.x,pos.z-s.g.position.z);if(d<best){best=d;nearest=s}}if(nearest){setPanel(nearest);return true}return false}
 function update(dt,pos,clock){
  insideShop=null;
  const hour=Math.floor(clock/3600),minute=Math.floor(clock%3600/60),time=hour+minute/60;
  let nearbyShop=null,nearDistance=9;
  const demand=demandAt(time);
  for(const s of shops){const {data}=s;const distance=Math.hypot(pos.x-s.g.position.x,pos.z-s.g.position.z);if(distance<nearDistance){nearDistance=distance;nearbyShop=s}s.open=data.close<data.open?(time>=data.open||time<data.close):(time>=data.open&&time<data.close);s.phase+=dt;
   s.restockT-=dt;
   if(s.restockT<=0){s.restockT=50+Math.random()*45;let restocked=false;for(let i=0;i<s.stock.length;i++)if(s.stock[i]<12){s.stock[i]++;s.costs+=Math.round(s.data.products[i][1]*.18);restocked=true}if(restocked){s.profit=s.revenue-s.costs;save()}}
   if(s.registerPulse>0){s.registerPulse=Math.max(0,s.registerPulse-dt*2);s.register.scale.setScalar(1+s.registerPulse*.22)}
   s.g.visible=distance<260;s.worker.g.visible=s.open&&distance<85&&!s.actualStaff;
   const stations=[[-2.4,-.65],[0,-.65],[2.3,-.65]],target=stations[Math.floor(s.phase/5)%stations.length];s.worker.g.position.x+=(target[0]-s.worker.g.position.x)*(1-Math.exp(-dt*1.7));s.worker.g.position.z+=(target[1]-s.worker.g.position.z)*(1-Math.exp(-dt*1.7));s.worker.a.rotation.x=Math.sin(s.phase*3)*.55;s.worker.b.rotation.x=-Math.sin(s.phase*3)*.55;
   // Clientes: entran desde la acera, compran en el mostrador y salen.
   if(distance<120){
    s.visitorT-=dt;
    if(s.open&&!s.actualStaff&&!s.queue.length&&s.visitorT<=0&&s.visitors.some(v=>v.state==='idle')){
     const v=s.visitors.find(v=>v.state==='idle');
     v.state='entering';v.sx=(Math.random()*2-1)*1.2;v.tx=(Math.random()*2-1)*1.0;v.tz=1.55;v.t=0;v.walk=0;
     v.g.position.set(v.sx,0,D/2+2.6);v.g.rotation.y=Math.PI;v.g.visible=true;
     s.visitorT=(8+Math.random()*12)*demandAt(time,s.preference);
    }
    for(const v of s.visitors){
     if(v.state==='idle'){v.g.visible=false;continue}
     if(s.queue.length&&v.state==='entering'){v.state='leaving';}
     v.g.visible=true;
     const tx=v.state==='leaving'?v.sx:v.tx,tz=v.state==='leaving'?D/2+2.8:v.tz;
     const dx=tx-v.g.position.x,dz=tz-v.g.position.z,dist=Math.hypot(dx,dz);
     if(v.state==='buying'){
      v.t-=dt;
      v.a.rotation.x=-.95+Math.sin(s.phase*8)*.15;v.b.rotation.x=-.35;
      if(v.t<=0){
       const i=productIndexFor(s.stock);
       if(i>=0)recordSale(s,i,'visitor');
       v.state='leaving';v.g.rotation.y=0;
      }
     } else if(dist>.08){
      const step=Math.min(dist,1.15*dt);
      v.g.position.x+=dx/dist*step;v.g.position.z+=dz/dist*step;
      v.g.rotation.y=Math.atan2(dx,dz);
      v.walk+=dt*7;
      v.a.rotation.x=Math.sin(v.walk)*.45;v.b.rotation.x=-Math.sin(v.walk)*.45;
      v.l.rotation.x=Math.sin(v.walk)*.5;v.r.rotation.x=-Math.sin(v.walk)*.5;
     } else if(v.state==='entering'){
      v.state='buying';v.t=1.8+Math.random()*1.5;v.g.rotation.y=Math.PI;
      v.a.rotation.x=v.b.rotation.x=0;v.l.rotation.x=v.r.rotation.x=0;
     } else if(v.state==='leaving'){
      v.state='idle';v.g.visible=false;
     }
    }
   } else for(const v of s.visitors)v.g.visible=false;
   // Una sola luz dinámica para el comercio en el que está el jugador.
   const c=Math.cos(s.g.rotation.y),sn=Math.sin(s.g.rotation.y),dx=pos.x-s.g.position.x,dz=pos.z-s.g.position.z;
   const lx=dx*c-dz*sn,lz=dx*sn+dz*c;
   if(Math.abs(lx)<3.75&&Math.abs(lz)<2.95&&distance<9){insideShop=s;shopLight.position.set(s.g.position.x,2.25,s.g.position.z);shopLight.intensity=1.25}
   s.g.visible=distance<260;
  }
  if(!insideShop)shopLight.intensity=0;
  if(hud){hud.textContent='Comercios: '+shops.filter(s=>s.open).length+'/'+shops.length+' abiertos · '+money(economy.cash)+(nearbyShop?' · F: '+nearbyShop.data.kind:'')}
  if(active&&info){info.textContent=(active.open?'Abierto':'Cerrado')+' · '+active.data.detail+' · Empleado: '+active.data.task+' · Clientes: '+active.visits+' · Ventas: '+active.sales+' · Ingresos: '+money(active.revenue)+' · Costos: '+money(active.costs)+' · Ganancia: '+money(active.profit)+' · Cola: '+active.queue.length+' · Ciudadanos: '+(active.citizenSales||0)+' · '+money(economy.cash);if(!active.open)products.querySelectorAll('button').forEach(b=>b.disabled=true)}
 }
 function addCash(n){economy.cash=Math.max(0,economy.cash+n);save()}
 function inventory(){return economy.inventory}
 function consumeItem(name,n=1){const q=economy.inventory[name]||0;if(q<n)return false;if(q===n)delete economy.inventory[name];else economy.inventory[name]=q-n;save();return true}
 function consume(name){
  if(!economy.inventory[name]||economy.inventory[name]<=0)return false;
  economy.inventory[name]--;if(economy.inventory[name]<=0)delete economy.inventory[name];save();return true;
 }
 function consumeFood(){
  const name=Object.keys(economy.inventory).find(n=>FOOD.test(n));
  if(!name)return null;consume(name);return name;
 }
 return{update,interact,close:closePanel,shops,shopById,joinQueue,leaveQueue,queueIndex,isFirst,serveCustomer,recordSale,availableFor,getInventory:()=>economy.inventory,getCash:()=>economy.cash,addCash,consume,consumeFood,consumeItem,inventory,isFood:n=>FOOD.test(n),insideShop:()=>insideShop};
}