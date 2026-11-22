// Tráfico urbano real: grafo de calles con intersecciones, semáforos, carriles,
// separación entre vehículos, estacionados y reciclaje de vehículos lejanos.
const CATALOG = [
 ['Sedán compacto','car',3.5,1.72,.62,3.8],['Sedán familiar','car',4.2,1.8,.7,3.9],['Hatchback urbano','car',3.25,1.68,.66,4.1],['Coupé deportivo','car',3.9,1.82,.62,5.1],['Deportivo bajo','car',4.1,1.9,.58,5.5],
 ['Jeepeta pequeña','suv',3.9,1.85,.85,4.0],['Jeepeta mediana','suv',4.35,1.92,.92,3.8],['Jeepeta grande','suv',4.8,2.02,1.0,3.6],['Jeepeta de lujo','suv',4.65,2.0,.94,4.0],['Todoterreno cuadrado','suv',4.2,1.95,1.05,3.4],
 ['Pickup sencilla','pickup',4.6,1.9,.72,3.5],['Pickup doble cabina','pickup',5.0,1.95,.78,3.4],['Pickup de trabajo','pickup',4.8,1.9,.75,3.2],['Pickup todoterreno','pickup',4.9,2.0,.9,3.3],['Pickup de reparto','pickup',4.7,1.9,.76,3.1],
 ['Taxi compacto','taxi',3.5,1.72,.65,3.9],['Taxi sedán','taxi',4.1,1.8,.7,3.8],['Taxi blanco','taxi',4.0,1.8,.68,3.8],['Carro público','publico',3.8,1.78,.7,3.6],['Carro público clásico','publico',4.1,1.82,.72,3.4],
 ['Motoconcho','moto',1.45,.65,.4,5.2],['Motor de trabajo','moto',1.55,.68,.42,5.0],['Motor deportivo','moto',1.8,.72,.48,6.0],['Scooter urbano','moto',1.5,.68,.43,4.6],['Motor tipo pasola','moto',1.4,.65,.42,4.4],
 ['Guagua pequeña','guagua',4.8,1.9,1.35,2.8],['Minibús escolar','bus',5.8,2.0,1.5,2.7],['Autobús urbano','bus',7.2,2.35,1.65,2.4],['Guagua interurbana','bus',7.8,2.4,1.75,2.5],['Autobús turístico','bus',8.2,2.45,1.8,2.6],
 ['Furgoneta blanca','van',4.8,1.9,1.25,3.0],['Furgón de carga','van',5.2,2.0,1.45,2.8],['Minivan familiar','van',4.5,1.9,1.1,3.3],['Ambulancia','emergency',5.0,2.0,1.35,4.1],['Camioneta de bomberos','emergency',5.4,2.05,1.45,3.8],
 ['Camión pequeño','truck',5.8,2.15,1.25,2.5],['Camión de mudanza','truck',6.5,2.25,1.55,2.3],['Camión de caja','truck',7.0,2.35,1.65,2.2],['Camión plataforma','truck',6.8,2.3,1.3,2.1],['Camión cisterna','truck',7.2,2.3,1.55,2.0],
 ['Camión recolector','truck',6.5,2.3,1.65,2.0],['Camión refrigerado','truck',6.8,2.3,1.6,2.1],['Camión volteo','truck',6.1,2.3,1.5,2.0],['Camión de bebidas','truck',6.2,2.2,1.45,2.2],['Camión de materiales','truck',6.7,2.3,1.5,1.9],
 ['Carro de seguridad','emergency',4.2,1.85,.72,4.0],['Vehículo de mantenimiento','van',4.7,1.9,1.1,2.8],['Auto eléctrico','car',3.6,1.75,.62,4.2],['Carro clásico','car',4.0,1.8,.72,3.2],['Jeepeta de patrulla','suv',4.5,1.95,.9,4.0]
].map((v, i) => ({
  name: v[0], kind: v[1], length: v[2], width: v[3], height: v[4], speed: v[5],
  color: [0xe76f51, 0xf2c14e, 0x2a9d8f, 0xeeeeee, 0x334455, 0x9b5de5, 0xffffff, 0xce1126, 0x777777, 0x182b49][i % 10],
  index: i
}));

const SNAP = 2.5;
const nodeKey = (x, z) => Math.round(x / SNAP) + ',' + Math.round(z / SNAP);
const angleDelta = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

// Cruce de dos segmentos en su interior (sin contar extremos compartidos).
function segmentHit(a, b) {
  const rx = a.bx - a.ax, rz = a.bz - a.az, sx = b.bx - b.ax, sz = b.bz - b.az;
  const den = rx * sz - rz * sx;
  if (Math.abs(den) < 1e-6) return null;
  const qx = b.ax - a.ax, qz = b.az - a.az;
  const t = (qx * sz - qz * sx) / den;
  const u = (qx * rz - qz * rx) / den;
  if (t <= .04 || t >= .96 || u <= .04 || u >= .96) return null;
  return { t, u };
}

// Grafo planar: divide las vías en los cruces geométricos para que existan
// intersecciones reales aunque OSM no comparta nodos entre calles.
function buildGraph(roads) {
  const raw = [];
  for (const r of roads) {
    if (r.width < 5) continue;
    const p = r.points;
    for (let i = 0; i + 3 < p.length; i += 2) {
      const ax = p[i], az = p[i + 1], bx = p[i + 2], bz = p[i + 3];
      const len = Math.hypot(bx - ax, bz - az);
      if (len > 1) raw.push({ ax, az, bx, bz, width: r.width, len, cuts: [] });
    }
  }
  const GRID = 48, grid = new Map();
  raw.forEach((s, i) => {
    const x0 = Math.min(s.ax, s.bx), x1 = Math.max(s.ax, s.bx);
    const z0 = Math.min(s.az, s.bz), z1 = Math.max(s.az, s.bz);
    for (let gx = Math.floor(x0 / GRID); gx <= Math.floor(x1 / GRID); gx++) {
      for (let gz = Math.floor(z0 / GRID); gz <= Math.floor(z1 / GRID); gz++) {
        const k = gx + ',' + gz;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(i);
      }
    }
  });
  const checked = new Set();
  for (const list of grid.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const ia = list[i], ib = list[j], pair = ia + '-' + ib;
        if (checked.has(pair)) continue;
        checked.add(pair);
        const hit = segmentHit(raw[ia], raw[ib]);
        if (!hit) continue;
        raw[ia].cuts.push(hit.t);
        raw[ib].cuts.push(hit.u);
      }
    }
  }

  const nodes = new Map(), sum = new Map();
  const node = (x, z) => {
    const k = nodeKey(x, z);
    if (!nodes.has(k)) { nodes.set(k, { k, x: 0, z: 0, edges: [], degree: 0, light: false }); sum.set(k, [0, 0, 0]); }
    const s = sum.get(k);
    s[0] += x; s[1] += z; s[2]++;
    return nodes.get(k);
  };
  const addEdge = (ax, az, bx, bz, width) => {
    const a = node(ax, az), b = node(bx, bz);
    if (a.k === b.k) return;
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 1.5) return;
    const e = { a: a.k, b: b.k, ax, az, bx, bz, len, width, dx: (bx - ax) / len, dz: (bz - az) / len };
    a.edges.push(e);
    b.edges.push({ ...e, a: b.k, b: a.k, ax: bx, az: bz, bx: ax, bz: az, dx: -e.dx, dz: -e.dz });
  };
  for (const s of raw) {
    const cuts = [...new Set(s.cuts)].sort((a, b) => a - b);
    const pts = [0, ...cuts, 1];
    for (let i = 0; i + 1 < pts.length; i++) {
      const t0 = pts[i], t1 = pts[i + 1];
      if (t1 - t0 < .02) continue;
      addEdge(s.ax + (s.bx - s.ax) * t0, s.az + (s.bz - s.az) * t0,
              s.ax + (s.bx - s.ax) * t1, s.az + (s.bz - s.az) * t1, s.width);
    }
  }
  for (const n of nodes.values()) {
    const s = sum.get(n.k);
    n.x = s[0] / s[2]; n.z = s[1] / s[2];
    n.degree = new Set(n.edges.map(e => e.b)).size;
  }
  const all = [...nodes.values()];
  const lights = [];
  for (const n of all) {
    if (n.degree < 3) continue;
    const widest = Math.max(...n.edges.map(e => e.width));
    if (widest < 6) continue;
    if (lights.some(l => Math.hypot(l.x - n.x, l.z - n.z) < 11)) continue;
    n.light = true;
    n.lightOffset = ((Math.abs(Math.round(n.x * 7 + n.z * 13)) % 17) / 17) * 16;
    lights.push(n);
  }
  return { nodes, edges: all.flatMap(n => n.edges), lights };
}

function lightState(node, axis, time) {
  const t = (time + node.lightOffset) % 16;
  if (axis === 'x') return t < 6.5 ? 'green' : t < 7.5 ? 'amber' : 'red';
  return t >= 8 && t < 14.5 ? 'green' : t >= 14.5 && t < 15.5 ? 'amber' : 'red';
}

export function createTrafficSystem(T, scene, colliders, world, options = {}) {
  const mobile = !!options.mobile;
  const graph = buildGraph(world.roads || []);
  const matCache = new Map();
  const material = c => { if (!matCache.has(c)) matCache.set(c, new T.MeshLambertMaterial({ color: c })); return matCache.get(c); };
  const glow = c => new T.MeshBasicMaterial({ color: c });

  function makeVehicle(model, withRider = false) {
    const g = new T.Group(), wheels = [];
    const { kind, length, width, height, color } = model;
    if (kind === 'moto') {
      const frame = new T.Mesh(new T.BoxGeometry(.28, .38, length), material(color)); frame.position.y = .82; g.add(frame);
      const seat = new T.Mesh(new T.BoxGeometry(.55, .16, .62), material(0x222222)); seat.position.set(0, 1.08, -.15); g.add(seat);
      for (const z of [-length * .48, length * .48]) {
        const wh = new T.Mesh(new T.CylinderGeometry(.3, .3, .14, 10), material(0x171717));
        wh.rotation.z = Math.PI / 2; wh.position.set(0, .36, z); g.add(wh); wheels.push(wh);
      }
      if (withRider) {
        const rider = new T.Group();
        const body = new T.Mesh(new T.BoxGeometry(.42, .62, .3), material(0x2a9d8f)); body.position.y = 1.25; rider.add(body);
        const head = new T.Mesh(new T.SphereGeometry(.17, 8, 7), material(0x9a684b)); head.position.y = 1.72; rider.add(head);
        const helmet = new T.Mesh(new T.SphereGeometry(.2, 8, 6), material(0x1b1b1b)); helmet.position.y = 1.77; helmet.scale.y = .8; rider.add(helmet);
        rider.position.z = -.2; g.add(rider);
      }
    } else {
      const tall = ['suv', 'van', 'bus', 'guagua', 'truck', 'emergency'].includes(kind);
      const bodyH = height, bodyY = kind === 'truck' ? 1.0 : .48 + bodyH * .42;
      const body = new T.Mesh(new T.BoxGeometry(width, bodyH, length), material(color));
      body.position.y = bodyY; g.add(body);
      const cabLen = kind === 'truck' ? length * .38 : kind === 'pickup' ? length * .43 : kind === 'bus' || kind === 'guagua' ? length * .82 : length * .52;
      const cabH = kind === 'bus' || kind === 'guagua' ? height * .8 : kind === 'van' ? height * .72 : tall ? height * .66 : .62;
      const cabW = width * .88;
      const cab = new T.Mesh(new T.BoxGeometry(cabW, cabH, cabLen), material(0x8bb5c9));
      cab.position.set(0, bodyY + bodyH * .48 + cabH * .38, -length * .06); g.add(cab);
      if (kind === 'pickup' || kind === 'truck') {
        for (const x of [-width * .46, width * .46]) {
          const rail = new T.Mesh(new T.BoxGeometry(.1, .42, length * .42), material(0x555b60));
          rail.position.set(x, bodyY + bodyH * .55, length * .25); g.add(rail);
        }
      }
      if (kind === 'taxi' || kind === 'publico') {
        const top = new T.Mesh(new T.BoxGeometry(.62, .2, .34), material(0xffd166));
        top.position.set(0, bodyY + bodyH * .5 + cabH + .1, -.2); g.add(top);
      }
      for (const x of [-width * .44, width * .44]) {
        for (const z of [-length * .31, length * .31]) {
          const wh = new T.Mesh(new T.CylinderGeometry(.33, .33, .2, 10), material(0x171717));
          wh.rotation.z = Math.PI / 2; wh.position.set(x, .34, z); g.add(wh); wheels.push(wh);
        }
      }
      for (const x of [-width * .32, width * .32]) {
        const lamp = new T.Mesh(new T.BoxGeometry(.2, .12, .06), glow(0xfff2c0));
        lamp.position.set(x, bodyY + .05, length * .5); g.add(lamp);
      }
    }
    g.userData.wheels = wheels;
    return g;
  }

  const randModel = () => CATALOG[Math.floor(Math.random() * CATALOG.length)];

  function randomEdgeNear(px, pz, min = 55, max = 150) {
    let fallback = null, fallbackD = Infinity;
    for (let i = 0; i < 80; i++) {
      const e = graph.edges[Math.floor(Math.random() * graph.edges.length)];
      const mx = (e.ax + e.bx) / 2, mz = (e.az + e.bz) / 2, d = Math.hypot(mx - px, mz - pz);
      if (d >= min && d <= max) return e;
      if (d > 30 && d < fallbackD) { fallbackD = d; fallback = e; }
    }
    return fallback;
  }

  const vehicles = [];
  const targetCount = mobile ? 9 : 16;
  const PARKED = mobile ? 10 : 22;
  const parked = [];

  function spawnVehicle(px, pz, edge) {
    const e = edge || randomEdgeNear(px, pz);
    if (!e) return null;
    const model = randModel();
    const g = makeVehicle(model, model.kind === 'moto');
    scene.add(g);
    return {
      g, model, edge: { ...e, a: e.a, b: e.b }, t: .15 + Math.random() * .7,
      speed: model.speed * .5, yaw: Math.atan2(e.dx, e.dz),
      wait: 0, lastStop: null, lane: Math.max(1, Math.min(2.1, e.width * .22))
    };
  }

  for (let i = 0; i < targetCount; i++) {
    const v = spawnVehicle(world.spawn[0], world.spawn[1], null);
    if (v) vehicles.push(v);
  }

  // Estacionados junto al contención, con colisión propia.
  function parkAt(px, pz, slot) {
    const e = randomEdgeNear(px, pz, 18, 120);
    if (!e) return;
    const model = randModel();
    const g = makeVehicle(model, false);
    const t = .2 + Math.random() * .6;
    const x = e.ax + (e.bx - e.ax) * t, z = e.az + (e.bz - e.az) * t;
    const off = e.width * .5 - 1.15;
    g.position.set(x - e.dz * off, 0, z + e.dx * off);
    g.rotation.y = Math.atan2(e.dx, e.dz) + (Math.random() < .5 ? Math.PI : 0);
    scene.add(g);
    const half = model.length * .5, w = model.width * .5, c = Math.abs(Math.cos(g.rotation.y)), sn = Math.abs(Math.sin(g.rotation.y));
    const ex = c * w + sn * half, ez = sn * w + c * half;
    const col = { x0: g.position.x - ex, x1: g.position.x + ex, z0: g.position.z - ez, z1: g.position.z + ez, tag: 'parked' };
    colliders.push(col);
    parked.push({ g, model, col, x: g.position.x, z: g.position.z });
  }
  for (let i = 0; i < PARKED; i++) parkAt(world.spawn[0], world.spawn[1]);

  // Paradas de transporte en las vías anchas cercanas al jugador.
  const stops = [];
  const stopNodes = graph.nodes.values();
  for (const n of stopNodes) {
    if (stops.length >= 10) break;
    if (n.degree < 2) continue;
    const widest = Math.max(...n.edges.map(e => e.width));
    if (widest < 6) continue;
    if (Math.hypot(n.x - world.spawn[0], n.z - world.spawn[1]) > 210) continue;
    if (stops.some(s => Math.hypot(s.x - n.x, s.z - n.z) < 45)) continue;
    const e = n.edges[0], off = e.width * .5 - .6;
    const sx = n.x - e.dz * off, sz = n.z + e.dx * off;
    const g = new T.Group();
    const post = new T.Mesh(new T.CylinderGeometry(.06, .07, 2.6, 6), material(0x4d5b60)); post.position.y = 1.3; g.add(post);
    const sign = new T.Mesh(new T.BoxGeometry(.9, .5, .07), material(0x1f6f9c)); sign.position.set(0, 2.35, 0); g.add(sign);
    const bench = new T.Mesh(new T.BoxGeometry(1.2, .1, .38), material(0x876b4e)); bench.position.set(0, .55, .55); g.add(bench);
    g.position.set(sx, 0, sz); g.rotation.y = Math.atan2(e.dx, e.dz); scene.add(g);
    stops.push({ x: sx, z: sz, g, node: n.k });
  }

  // Semáforos: se construyen solo cerca del jugador para no cargar la escena.
  const lightVisuals = new Map();
  const bulbGeo = new T.SphereGeometry(.115, 8, 6);
  const poleGeo = new T.CylinderGeometry(.08, .1, 3.9, 6);
  function buildLight(n) {
    const g = new T.Group();
    const pole = new T.Mesh(poleGeo, material(0x3a4448)); pole.position.y = 1.95; g.add(pole);
    const heads = {};
    for (const axis of ['x', 'z']) {
      const head = new T.Mesh(new T.BoxGeometry(.34, 1.0, .22), material(0x242c2f));
      const a = axis === 'x' ? 0 : Math.PI / 2;
      head.position.set(Math.sin(a) * .3, 3.65, Math.cos(a) * .3); head.rotation.y = a; g.add(head);
      const bulbs = [0, 1, 2].map(i => {
        const b = new T.Mesh(bulbGeo, glow(0x552222));
        b.position.set(head.position.x + Math.sin(a) * .13, 4.0 - i * .33, head.position.z + Math.cos(a) * .13);
        g.add(b); return b;
      });
      heads[axis] = bulbs;
    }
    g.position.set(n.x, 0, n.z); scene.add(g);
    lightVisuals.set(n.k, { g, heads });
  }
  function updateLightVisual(n, time) {
    let v = lightVisuals.get(n.k);
    if (!v) { buildLight(n); v = lightVisuals.get(n.k); }
    for (const axis of ['x', 'z']) {
      const state = lightState(n, axis, time), bulbs = v.heads[axis];
      const colors = state === 'green' ? [0x2b1a1a, 0x2b1a1a, 0x37e07a] : state === 'amber' ? [0x2b1a1a, 0xe0b437, 0x2b1a1a] : [0xe04545, 0x2b1a1a, 0x2b1a1a];
      bulbs.forEach((b, i) => b.material.color.setHex(colors[i]));
    }
    v.g.visible = true;
  }

  let clock = 0;

  function respawn(v, px, pz) {
    const e = randomEdgeNear(px, pz, 65, 150);
    if (!e) { v.g.visible = false; return; }
    const old = v.g;
    scene.remove(old);
    old.traverse(o => { if (o.geometry && o.geometry !== bulbGeo && o.geometry !== poleGeo) o.geometry.dispose(); });
    v.model = randModel();
    v.g = makeVehicle(v.model, v.model.kind === 'moto');
    scene.add(v.g);
    v.edge = { ...e }; v.t = Math.random() * .8; v.speed = v.model.speed * .4;
    v.lane = Math.max(1, Math.min(2.1, e.width * .22));
    v.wait = 0; v.lastStop = null; v.g.visible = true;
  }

  function chooseNext(v, node) {
    const options = node.edges.filter(e => e.b !== v.edge.a);
    if (!options.length) return node.edges[0];
    let total = 0;
    const weights = options.map(e => {
      const align = e.dx * v.edge.dx + e.dz * v.edge.dz;
      const w = Math.pow(Math.max(.02, (align + 1) / 2), 3);
      total += w; return w;
    });
    let r = Math.random() * total;
    for (let i = 0; i < options.length; i++) { r -= weights[i]; if (r <= 0) return options[i]; }
    return options[options.length - 1];
  }

  function update(dt, player, yaw) {
    clock += dt;
    const px = player.x, pz = player.z;

    // Semáforos visibles cerca del jugador.
    const activeLights = new Set();
    for (const n of graph.lights) {
      const d = Math.hypot(n.x - px, n.z - pz);
      if (d < 170) { updateLightVisual(n, clock); activeLights.add(n.k); }
    }
    for (const [k, v] of lightVisuals) if (!activeLights.has(k)) { v.g.visible = false; }

    // Rejilla espacial para separación entre vehículos.
    const grid = new Map();
    const cell = 18;
    for (const v of vehicles) {
      if (!v.g.visible) continue;
      const x = v.edge.ax + (v.edge.bx - v.edge.ax) * v.t, z = v.edge.az + (v.edge.bz - v.edge.az) * v.t;
      v.x = x; v.z = z;
      const k = Math.floor(x / cell) + ',' + Math.floor(z / cell);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(v);
    }
    const neighbors = (x, z) => {
      const out = [], cx = Math.floor(x / cell), cz = Math.floor(z / cell);
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        const a = grid.get((cx + i) + ',' + (cz + j));
        if (a) out.push(...a);
      }
      return out;
    };

    for (const v of vehicles) {
      const e = v.edge;
      const remaining = (1 - v.t) * e.len;
      const toNode = graph.nodes.get(e.b);
      let target = v.model.speed;

      if (v.wait > 0) { v.wait -= dt; target = 0; }

      if (toNode && toNode.light && remaining < 20) {
        const axis = Math.abs(e.dx) > Math.abs(e.dz) ? 'x' : 'z';
        if (lightState(toNode, axis, clock) === 'red' && remaining > 4.5) target = Math.min(target, Math.max(0, (remaining - 5) * .9));
      }

      // Frenar por el jugador si está delante en la vía.
      const pdx = px - v.x, pdz = pz - v.z, pdist = Math.hypot(pdx, pdz);
      if (pdist < 14 && pdist > .1) {
        const fwd = (pdx * e.dx + pdz * e.dz), lat = Math.abs(pdx * e.dz - pdz * e.dx);
        if (fwd > 0 && lat < 2.8) target = Math.min(target, Math.max(0, (fwd - 3.5) * 1.1));
      }

      // Separación con el vehículo de delante.
      let ahead = null, aheadDist = 1e9;
      for (const o of neighbors(v.x, v.z)) {
        if (o === v) continue;
        const dx = o.x - v.x, dz = o.z - v.z, fwd = dx * e.dx + dz * e.dz, lat = Math.abs(dx * e.dz - dz * e.dx);
        if (fwd > 0 && fwd < 14 && lat < 2.6 && fwd < aheadDist) { ahead = o; aheadDist = fwd; }
      }
      if (ahead) {
        const gap = aheadDist - (ahead.model.length + v.model.length) * .5 - .6;
        target = Math.min(target, ahead.speed * .92, Math.max(0, gap * 1.15));
      }

      // Autobuses y guaguas se detienen en las paradas cercanas.
      if (['bus', 'guagua', 'publico'].includes(v.model.kind)) {
        const stop = stops.find(s => s.node === e.b);
        if (stop && v.lastStop !== stop && remaining < 9) { v.wait = 3.2; v.lastStop = stop; }
      }

      const accel = target > v.speed ? 4.5 : 9.5;
      v.speed += Math.max(-accel * dt, Math.min(accel * dt, target - v.speed));
      if (v.speed < .02 && target === 0) v.speed = 0;

      v.t += v.speed * dt / e.len;
      if (v.t >= 1) {
        const node = graph.nodes.get(e.b);
        const next = chooseNext(v, node);
        if (!next) { respawn(v, px, pz); continue; }
        v.edge = next; v.t = 0;
      }

      const e2 = v.edge;
      const x = e2.ax + (e2.bx - e2.ax) * v.t, z = e2.az + (e2.bz - e2.az) * v.t;
      const lane = v.model.kind === 'moto' ? v.lane * .7 : v.lane;
      v.g.position.set(x - e2.dz * lane, 0, z + e2.dx * lane);
      const targetYaw = Math.atan2(e2.dx, e2.dz);
      v.yaw += angleDelta(v.yaw, targetYaw) * Math.min(1, dt * 7);
      v.g.rotation.y = v.yaw;
      v.g.userData.wheels.forEach(w => { w.rotation.x += v.speed * dt * 1.7; });

      const dist = Math.hypot(x - px, z - pz);
      if (dist > 175) respawn(v, px, pz);
      else if (dist > 135) v.g.visible = false;
      else v.g.visible = true;
    }

    // Reciclar estacionados lejanos.
    for (let i = parked.length - 1; i >= 0; i--) {
      const p = parked[i];
      if (Math.hypot(p.x - px, p.z - pz) < 165) continue;
      const idx = colliders.indexOf(p.col);
      if (idx >= 0) colliders.splice(idx, 1);
      scene.remove(p.g);
      p.g.traverse(o => { if (o.geometry && o.geometry !== bulbGeo && o.geometry !== poleGeo) o.geometry.dispose(); });
      parked.splice(i, 1);
    }
    while (parked.length < PARKED) {
      const before = parked.length;
      parkAt(px, pz);
      if (parked.length === before) break;
    }
  }

  return {
    update, vehicles, stops, graph,
    stats: () => ({ vehicles: vehicles.length, parked: parked.length, nodes: graph.nodes.size, lights: graph.lights.length, stops: stops.length })
  };
}
