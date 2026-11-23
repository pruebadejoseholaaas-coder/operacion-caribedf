// Interiores funcionales reutilizables: viviendas de NPC, hospital, escuela y
// puestos de trabajo dentro de los comercios existentes. Los interiores de
// vivienda e institución viven en una zona apartada del mapa urbano, igual que
// la casa del jugador, para no ocupar solares ni atravesar la ciudad.
const HOME_BASE = { x: 900, z: 1250, cols: 4, dx: 28, dz: 26 };
const INST_BASE = { hospital: { x: 1180, z: 1000 }, school: { x: 1180, z: 1220 } };

export function createInteriorSystem({ T, scene, colliders, shops, npcs = [], homes = [], institutions = [] }) {
  const matCache = new Map();
  const material = c => { if (!matCache.has(c)) matCache.set(c, new T.MeshLambertMaterial({ color: c })); return matCache.get(c); };
  const box = (parent, w, h, d, c, x, y, z) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), material(c));
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const cyl = (parent, r1, r2, h, c, x, y, z, seg = 10) => {
    const m = new T.Mesh(new T.CylinderGeometry(r1, r2, h, seg), material(c));
    m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
  };
  const sign = (parent, text, color, w, h, x, y, z) => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 112;
    const g = c.getContext('2d'); g.fillStyle = '#' + color.toString(16).padStart(6, '0');
    g.fillRect(0, 0, 512, 112); g.fillStyle = '#fff'; g.font = 'bold 36px Trebuchet MS';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 56, 470);
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c) }));
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const addCollider = (x0, x1, z0, z1) => colliders.push({ x0, x1, z0, z1 });
  const world = (g, x, z) => ({ x: g.position.x + x, z: g.position.z + z });

  const homesById = new Map();
  const institutionsById = new Map();
  const shopData = new Map();
  const active = { id: null, record: null, returnPos: null, returnLim: null };
  const light = new T.PointLight(0xffe0a8, 0, 22, 2); scene.add(light);

  function shell(g, W, D, wallColor, floorColor, doorWidth = 2.4) {
    box(g, W, .16, D, floorColor, 0, .08, 0);
    box(g, W, 3.0, .24, wallColor, 0, 1.58, -D / 2);
    box(g, .24, 3.0, D, wallColor, -W / 2, 1.58, 0);
    box(g, .24, 3.0, D, wallColor, W / 2, 1.58, 0);
    const seg = (W - doorWidth) / 2;
    box(g, seg, 3.0, .24, wallColor, -W / 2 + seg / 2, 1.58, D / 2);
    box(g, seg, 3.0, .24, wallColor, W / 2 - seg / 2, 1.58, D / 2);
    box(g, doorWidth, .42, .24, wallColor, 0, 2.79, D / 2);
    box(g, W + .2, .16, D + .2, 0x9b8061, 0, 3.16, 0);
    addCollider(g.position.x - W / 2 - .15, g.position.x - W / 2 + .15, g.position.z - D / 2, g.position.z + D / 2);
    addCollider(g.position.x + W / 2 - .15, g.position.x + W / 2 + .15, g.position.z - D / 2, g.position.z + D / 2);
    addCollider(g.position.x - W / 2, g.position.x + W / 2, g.position.z - D / 2 - .15, g.position.z - D / 2 + .15);
    addCollider(g.position.x - W / 2, g.position.x - doorWidth / 2, g.position.z + D / 2 - .15, g.position.z + D / 2 + .15);
    addCollider(g.position.x + doorWidth / 2, g.position.x + W / 2, g.position.z + D / 2 - .15, g.position.z + D / 2 + .15);
    const lamp = new T.Mesh(new T.BoxGeometry(1.2, .06, .26), new T.MeshBasicMaterial({ color: 0xffe8ad }));
    lamp.position.set(0, 2.86, 0); g.add(lamp);
  }

  function buildHome(index, door) {
    const g = new T.Group();
    const x = HOME_BASE.x + (index % HOME_BASE.cols) * HOME_BASE.dx;
    const z = HOME_BASE.z + Math.floor(index / HOME_BASE.cols) * HOME_BASE.dz;
    g.position.set(x, 0, z); scene.add(g);
    const W = 12, D = 10;
    const walls = [0xeadcc4, 0xf0d9a7, 0xe8eee9, 0xf4e3c8, 0xdce9e4];
    const floors = [0xc8bca7, 0xd8cdbb, 0xc8d7d1, 0xd9c3a5, 0xc5d2c8];
    shell(g, W, D, walls[index % walls.length], floors[index % floors.length], 2.2);
    // Sala, comedor, cocina, dormitorio y baño.
    box(g, 3.1, .55, 1.15, 0x8f5a3c, -2.2, .4, 2.6); // sofá
    box(g, 2.2, .18, .9, 0x9b6a43, 0, .38, 1.6); // mesa de centro
    box(g, 2.5, 1.5, .16, 0x263b4a, 0, 1.35, 4.1); // televisor
    box(g, 2.1, .12, 1.05, 0x8a5a36, 2.4, .78, 2.2); // comedor
    for (const [cx, cz] of [[1.6, 2.2], [3.2, 2.2], [2.4, 1.55], [2.4, 2.85]]) box(g, .45, .55, .45, 0x6b4226, cx, .35, cz);
    box(g, 3.6, .9, .7, 0x6b4226, -3.6, .55, -1.5); // cocina
    box(g, .75, .12, .7, 0x2b2b2b, -4.3, 1.05, -1.5);
    cyl(g, .22, .22, .1, 0x444, -3.2, 1.06, -1.5, 8);
    box(g, 1.05, 1.85, .8, 0xcfd8dc, -4.7, .93, -3.6); // nevera
    box(g, 2.4, .48, 1.35, 0x8a5a36, 3.2, .34, -2.8); // cama
    box(g, 2.5, .22, .45, 0xf1e6d2, 3.2, .78, -3.35);
    box(g, .7, .55, .5, 0x6b4226, 4.4, .34, -2.3); // mesita
    box(g, .6, 1.7, 1.4, 0x76543b, 5.0, .9, -1.0); // armario
    box(g, 1.3, .75, 1.15, 0xdcebef, -3.9, .48, -3.7); // baño
    cyl(g, .25, .28, .45, 0xf5f5f5, -4.6, .28, -3.7, 10);
    box(g, .8, .18, .55, 0xf5f5f5, -3.3, .7, -4.1);
    // Particiones bajas que dejan pasillos libres.
    box(g, .18, 1.6, 2.6, 0xd8cdbb, 2.0, .85, -3.7);
    box(g, .18, 1.6, 2.2, 0xd8cdbb, -2.7, .85, -3.9);
    addCollider(g.position.x + 1.9, g.position.x + 2.1, g.position.z - 5.0, g.position.z - 2.4);
    addCollider(g.position.x - 2.8, g.position.x - 2.6, g.position.z - 5.0, g.position.z - 2.8);
    box(g, 1.4, .06, 1.0, 0xb04a3a, 0, .18, 3.9); // felpudo
    // Colisiones de muebles principales; las rutas internas pasan por los pasillos.
    addCollider(g.position.x - 3.75, g.position.x - .65, g.position.z + 2.02, g.position.z + 3.18); // sofá
    addCollider(g.position.x - 1.1, g.position.x + 1.1, g.position.z + 1.15, g.position.z + 2.05); // mesa centro
    addCollider(g.position.x + 1.35, g.position.x + 3.45, g.position.z + 1.68, g.position.z + 2.73); // comedor
    addCollider(g.position.x - 5.4, g.position.x - 1.8, g.position.z - 1.85, g.position.z - 1.15); // cocina
    addCollider(g.position.x - 5.23, g.position.x - 4.18, g.position.z - 4.0, g.position.z - 3.2); // nevera
    addCollider(g.position.x + 2.0, g.position.x + 4.4, g.position.z - 3.48, g.position.z - 2.13); // cama
    addCollider(g.position.x + 4.7, g.position.x + 5.3, g.position.z - 1.7, g.position.z - .3); // armario
    addCollider(g.position.x - 4.55, g.position.x - 3.25, g.position.z - 4.28, g.position.z - 3.13); // baño
    box(g, 1.5, .1, .25, 0x76543b, 0, 2.35, D / 2 + .05); // dintel
    sign(g, 'CASA DE ' + (npcs[index]?.name || 'HABITANTE').toUpperCase(), 0x234b78, 3.2, .5, 0, 2.55, D / 2 + .16);
    // Plantas dominicanas.
    for (const [px, pz] of [[-5.0, 4.0], [5.0, 4.0]]) {
      cyl(g, .22, .28, .42, 0xa86f4c, px, .22, pz, 8);
      const leaf = new T.Mesh(new T.SphereGeometry(.38, 8, 6), material(0x39864b));
      leaf.position.set(px, .65, pz); g.add(leaf);
    }
    const p = (lx, lz) => world(g, lx, lz);
    const doorP = p(0, 4.1), living = p(0, 2.4), kitchen = p(-3.6, .2), bed = p(3.2, -2.05), bath = p(-3.8, -3.0), sofa = p(-2.2, 3.55), dining = p(2.4, 3.4);
    const paths = {
      living: [doorP, p(0, 3.3), living],
      kitchen: [living, p(-.5, 3.5), p(-4.2, 3.5), p(-4.2, 1.0), kitchen],
      bed: [living, p(1.0, 3.5), p(3.8, 3.5), p(3.8, -1.0), bed],
      bath: [living, p(-.5, 3.5), p(-4.2, 3.5), p(-4.2, .5), p(-1.5, .5), p(-1.5, -2.5), bath],
      sofa: [living, p(-.5, 3.4), sofa],
      dining: [living, p(1.7, 3.4), dining]
    };
    const rec = {
      id: 'home-' + index, kind: 'home', index, name: npcs[index]?.name || 'Habitante', g,
      door: { x: door.x, z: door.z }, playerSpawn: p(0, 4.0), exit: p(0, 4.0),
      center: p(0, 0), lim: { x: W / 2 - 1, z: D / 2 - 1 },
      points: { door: doorP, living, kitchen, bed, bath, sofa, dining }, paths
    };
    g.visible = false;
    homesById.set(rec.id, rec);
    return rec;
  }

  function buildInstitution(def) {
    const base = INST_BASE[def.id] || { x: 1300, z: 1100 };
    const g = new T.Group(); g.position.set(base.x, 0, base.z); scene.add(g);
    const isHospital = def.kind === 'hospital';
    const W = isHospital ? 24 : 26, D = 18;
    shell(g, W, D, isHospital ? 0xe8eee9 : 0xf0d9a7, isHospital ? 0xc8d7d1 : 0xc8bca7, 3.0);
    sign(g, def.name, isHospital ? 0x176c72 : 0x234b78, 5.5, 1.0, 0, 2.6, D / 2 + .16);
    const p = (lx, lz) => world(g, lx, lz);
    let points, paths, station = {};
    if (isHospital) {
      box(g, 4.6, .95, 1.2, 0x4a9b9a, 0, .55, 5.2); // recepción
      box(g, 4.8, .12, 1.3, 0xf1e6d2, 0, 1.08, 5.2);
      for (let i = 0; i < 5; i++) box(g, .75, .55, .7, 0x4f8b6a, -8 + i * 1.05, .35, 6.0); // espera
      for (const [bx, bz] of [[-7.5, -4.4], [-3.8, -4.4], [4.0, -4.4], [7.7, -4.4]]) {
        box(g, 2.0, .5, 1.05, 0xf5f5f5, bx, .38, bz); box(g, 2.1, .18, .35, 0x4a9b9a, bx, .75, bz - .45);
      }
      box(g, 3.2, 1.8, .18, 0x4a9b9a, 0, 1.1, -D / 2 + .2); // vitrina
      box(g, .2, 1.4, 6.0, 0xd8cdbb, -3.0, .8, -4.0); // pasillo
      box(g, .2, 1.4, 6.0, 0xd8cdbb, 3.0, .8, -4.0);
      addCollider(g.position.x - 3.1, g.position.x - 2.9, g.position.z - 7.0, g.position.z - 1.0);
      addCollider(g.position.x + 2.9, g.position.x + 3.1, g.position.z - 7.0, g.position.z - 1.0);
      addCollider(g.position.x - 2.3, g.position.x + 2.3, g.position.z + 4.6, g.position.z + 5.8); // recepción
      addCollider(g.position.x - 8.5, g.position.x - 3.4, g.position.z + 5.65, g.position.z + 6.35); // espera
      for (const bx of [-7.5, -3.8, 4.0, 7.7]) addCollider(g.position.x + bx - 1.05, g.position.x + bx + 1.05, g.position.z - 4.95, g.position.z - 3.85);
      points = { door: p(0, 7.4), reception: p(0, 4.0), waiting: p(-6.0, 5.3), corridor: p(0, 0), consult1: p(-6.0, -2.8), consult2: p(6.0, -2.8), nurse: p(0, -1.0) };
      paths = {
        reception: [points.door, p(0, 6.2), points.reception],
        waiting: [points.door, p(-2.5, 6.0), points.waiting],
        nurse: [points.door, p(0, 6.2), points.reception, p(0, 1.5), points.nurse],
        consult1: [points.door, p(0, 6.2), p(0, 1.0), p(-3.5, 0), p(-3.5, -2.8), points.consult1],
        consult2: [points.door, p(0, 6.2), p(0, 1.0), p(3.5, 0), p(3.5, -2.8), points.consult2]
      };
      station = { enfermera: 'nurse' };
    } else {
      for (const side of [-1, 1]) {
        box(g, 8.5, 1.7, .18, 0x234b78, side * 7.0, 1.2, -D / 2 + .25); // pizarra
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) box(g, .75, .55, .55, 0x9b6a43, side * 7.0 + (c - 1) * 1.3, .35, -2.4 + r * 1.3);
        box(g, 1.7, .85, .9, 0x76543b, side * 8.6, .5, 1.2); // escritorio
      }
      box(g, 4.0, 1.0, 1.1, 0x76543b, 0, .55, 5.2); // dirección
      box(g, 2.0, .12, 1.0, 0xf1e6d2, 0, 1.1, 5.2);
      box(g, 2.6, .8, .5, 0x4f8b6a, 0, .4, -6.5); // jardinería
      for (const side of [-1, 1]) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) addCollider(g.position.x + side * 7.0 + (c - 1) * 1.3 - .38, g.position.x + side * 7.0 + (c - 1) * 1.3 + .38, g.position.z - 2.4 + r * 1.3 - .28, g.position.z - 2.4 + r * 1.3 + .28);
      points = { door: p(0, 7.4), hall: p(0, 2.5), teacher: p(-9.4, 1.5), student: p(-7.0, 2.2), office: p(0, 4.6), patio: p(7.0, 5.5) };
      paths = {
        hall: [points.door, p(0, 6.2), points.hall],
        teacher: [points.door, p(0, 6.2), p(0, 3.0), p(-4.0, 3.0), p(-9.4, 2.0), points.teacher],
        student: [points.door, p(0, 6.2), p(0, 3.0), p(-4.0, 3.0), points.student],
        office: [points.door, p(0, 6.2), points.office],
        patio: [points.door, p(2.0, 6.0), points.patio]
      };
      station = { maestra: 'teacher', estudiante: 'student' };
    }
    const rec = {
      id: 'inst-' + def.id, kind: 'institution', name: def.name, g,
      door: { x: def.door.x, z: def.door.z }, playerSpawn: points.door, exit: points.door,
      center: p(0, 0), lim: { x: W / 2 - 1.2, z: D / 2 - 1.2 },
      points, paths, station, occupation: def.id === 'hospital' ? ['enfermera'] : ['maestra', 'estudiante']
    };
    g.visible = false;
    institutionsById.set(rec.id, rec);
    return rec;
  }

  // ---------- Viviendas ----------
  homes.forEach((h, i) => { if (h) buildHome(i, h); });
  // ---------- Hospital y escuela ----------
  institutions.forEach(def => buildInstitution(def));

  // ---------- Puestos dentro de comercios existentes ----------
  function shopTask(occupation) {
    if (['cocinera', 'panadero'].includes(occupation)) return 'cook';
    if (['barbero', 'estilista'].includes(occupation)) return 'barber';
    if (['mecánico', 'electricista', 'carpintero', 'agricultora'].includes(occupation)) return 'mechanic';
    if (['repartidor', 'emprendedora'].includes(occupation)) return 'stock';
    return 'cashier';
  }
  function shopStation(task) {
    return { cashier: [0, -.65], cook: [-2.4, -.65], barber: [1.7, 1.7], mechanic: [-1.8, -1.4], stock: [-2.4, -1.0] }[task] || [0, -.65];
  }
  function shopRecord(shop) {
    if (!shop) return null;
    if (shopData.has(shop.data.id)) return shopData.get(shop.data.id);
    const r = shop.g.rotation.y, c = Math.cos(r), s = Math.sin(r);
    const toWorld = (lx, lz) => ({ x: shop.g.position.x + lx * c + lz * s, z: shop.g.position.z - lx * s + lz * c });
    const door = toWorld(0, 3.3), aisle = toWorld(0, 2.1), sideL = toWorld(-1.8, 1.0), sideR = toWorld(1.8, 1.0);
    const rec = { id: 'shop-' + shop.data.id, kind: 'shop', shop, name: shop.data.name, door, center: toWorld(0, 0), lim: null, points: { door, aisle, sideL, sideR }, paths: {}, actualStaff: 0 };
    shop.actualStaff = 0;
    shopData.set(rec.id, rec);
    return rec;
  }
  function shopPath(rec, task) {
    const [lx, lz] = shopStation(task), c = Math.cos(rec.shop.g.rotation.y), s = Math.sin(rec.shop.g.rotation.y);
    const toWorld = (x, z) => ({ x: rec.shop.g.position.x + x * c + z * s, z: rec.shop.g.position.z - x * s + z * c });
    const station = toWorld(lx, lz), side = lx < 0 ? rec.points.sideL : rec.points.sideR;
    const behind = toWorld(lx < 0 ? -1.8 : 1.8, -.65);
    return [rec.points.door, rec.points.aisle, side, behind, station];
  }

  function npcVisible(id) {
    if (!id) return true;
    if (id.startsWith('shop-')) return true;
    return active.id === id;
  }

  function enterPlayer(id, player, lim) {
    const rec = homesById.get(id) || institutionsById.get(id);
    if (!rec) return null;
    active.id = id; active.record = rec;
    active.returnPos = { x: player.g.position.x, z: player.g.position.z };
    active.returnLim = { x: lim.x, z: lim.z };
    rec.g.visible = true;
    player.g.position.set(rec.playerSpawn.x, 0, rec.playerSpawn.z);
    lim.x = rec.lim.x; lim.z = rec.lim.z;
    light.position.set(rec.center.x, 2.6, rec.center.z); light.intensity = 2.0;
    return rec;
  }
  function exitPlayer(player, lim) {
    if (!active.record) return null;
    const p = active.returnPos;
    if (active.record?.g) active.record.g.visible = false;
    player.g.position.set(p.x, 0, p.z);
    if (active.returnLim) { lim.x = active.returnLim.x; lim.z = active.returnLim.z; }
    active.id = null; active.record = null; active.returnPos = null; active.returnLim = null;
    light.intensity = 0;
    return p;
  }
  function playerInside() { return active.id; }
  function nearExit(pos) {
    const rec = active.record;
    return !!rec && Math.hypot(pos.x - rec.exit.x, pos.z - rec.exit.z) < 2.2;
  }
  function nearDoor(pos) {
    let best = null, bestD = 2.7;
    for (const rec of homesById.values()) {
      const d = Math.hypot(pos.x - rec.door.x, pos.z - rec.door.z);
      if (d < bestD) { bestD = d; best = { ...rec, label: 'Casa de ' + rec.name }; }
    }
    for (const rec of institutionsById.values()) {
      const d = Math.hypot(pos.x - rec.door.x, pos.z - rec.door.z);
      if (d < bestD) { bestD = d; best = { ...rec, label: rec.name }; }
    }
    return best;
  }

  function enterNpcHome(n) {
    const c = n.citizen, rec = homesById.get('home-' + n.homeIndex);
    if (!c || !rec) return false;
    c.inside = rec.id; c.insideKind = 'home'; c.insideTarget = 'living';
    c.insidePath = rec.paths.living.map(q => ({ x: q.x, z: q.z })); c.insideIndex = 0;
    c.action = 'enter'; c.task = 'rest';
    n.g.position.set(rec.points.door.x, 0, rec.points.door.z);
    n.g.rotation.x = 0; n.g.position.y = 0;
    n.g.visible = npcVisible(rec.id);
    return true;
  }
  function enterNpcWork(n) {
    const c = n.citizen;
    if (!c) return false;
    if (n.work?.institution) {
      const rec = institutionsById.get('inst-' + n.work.institution);
      if (!rec) return false;
      const key = rec.station[n.occupation] || 'reception';
      c.inside = rec.id; c.insideKind = 'institution'; c.insideTarget = key; c.stationKey = key;
      c.insidePath = (rec.paths[key] || [rec.points[key]]).map(q => ({ x: q.x, z: q.z })); c.insideIndex = 0;
      c.action = 'enter'; c.task = n.occupation;
      n.g.position.set(rec.points.door.x, 0, rec.points.door.z);
      n.g.rotation.x = 0; n.g.position.y = 0;
      n.g.visible = npcVisible(rec.id);
      return true;
    }
    if (n.work?.shop) {
      const rec = shopRecord(n.work.shop);
      if (!rec) return false;
      const task = shopTask(n.occupation);
      c.inside = rec.id; c.insideKind = 'shop'; c.insideTarget = 'station'; c.stationKey = 'station';
      c.insidePath = shopPath(rec, task); c.insideIndex = 0;
      c.action = 'enter'; c.task = task;
      n.g.position.set(rec.door.x, 0, rec.door.z);
      n.g.rotation.x = 0; n.g.position.y = 0;
      n.g.visible = true;
      rec.actualStaff = (rec.actualStaff || 0) + 1;
      rec.shop.actualStaff = rec.actualStaff;
      return true;
    }
    return false;
  }
  function exitNpc(n) {
    const c = n.citizen;
    if (!c?.inside) return false;
    const rec = homesById.get(c.inside) || institutionsById.get(c.inside) || shopData.get(c.inside);
    if (rec?.kind === 'shop') { rec.actualStaff = Math.max(0, (rec.actualStaff || 0) - 1); rec.shop.actualStaff = rec.actualStaff; }
    const door = rec?.door || n.home || n.work;
    if (door) n.g.position.set(door.x, 0, door.z);
    n.g.position.y = 0; n.g.rotation.x = 0; n.g.visible = true;
    c.inside = null; c.insideKind = null; c.insideTarget = null; c.insidePath = []; c.insideIndex = 0;
    c.action = 'walk';
    return true;
  }
  function moveNpc(n, key, dt, speed = .9) {
    const c = n.citizen;
    if (!c?.inside) return true;
    const rec = homesById.get(c.inside) || institutionsById.get(c.inside) || shopData.get(c.inside);
    if (!rec) return true;
    if (c.insideTarget !== key) {
      c.insideTarget = key;
      const path = rec.paths?.[key] || (rec.points?.[key] ? [rec.points[key]] : null);
      c.insidePath = path ? path.map(q => ({ x: q.x, z: q.z })) : [];
      c.insideIndex = 0;
    }
    if (!c.insidePath?.length || c.insideIndex >= c.insidePath.length) return true;
    const p = c.insidePath[c.insideIndex];
    const dx = p.x - n.g.position.x, dz = p.z - n.g.position.z, d = Math.hypot(dx, dz);
    if (d < .22) {
      c.insideIndex++;
      if (c.insideIndex >= c.insidePath.length) return true;
      return false;
    }
    const step = Math.min(d, speed * dt);
    n.g.position.x += dx / d * step; n.g.position.z += dz / d * step;
    n.g.rotation.y = Math.atan2(dx, dz);
    return false;
  }
  function restoreNpc(n) {
    const c = n.citizen;
    if (!c?.inside) return;
    if (c.inside.startsWith('shop-')) {
      const shop = shops.find(s => 'shop-' + s.data.id === c.inside);
      const rec = shop ? shopRecord(shop) : shopData.get(c.inside);
      if (rec) { rec.actualStaff = (rec.actualStaff || 0) + 1; rec.shop.actualStaff = rec.actualStaff; }
    }
    n.g.visible = npcVisible(c.inside);
  }
  function workFor(occupation) {
    for (const rec of institutionsById.values()) {
      if (rec.occupation.includes(occupation)) return rec;
    }
    return null;
  }
  function homeDoor(index) { return homesById.get('home-' + index)?.door || null; }
  function inPoly(x, z, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
      const xi = poly[i], zi = poly[i + 1], xj = poly[j], zj = poly[j + 1];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / ((zj - zi) || 1e-6) + xi) inside = !inside;
    }
    return inside;
  }
  function blockedAt(x, z) {
    for (const c of colliders) {
      if ((c.x1 - c.x0) * (c.z1 - c.z0) > 30) continue;
      if (c.poly ? inPoly(x, z, c.poly) : (x > c.x0 && x < c.x1 && z > c.z0 && z < c.z1)) return true;
    }
    return false;
  }
  function debug() {
    const inside = npcs.filter(n => n.citizen?.inside);
    return {
      active: active.id, homes: homesById.size, institutions: [...institutionsById.keys()],
      shops: shopData.size,
      insideNpcs: inside.map(n => ({ name: n.name, inside: n.citizen.inside, task: n.citizen.task, action: n.citizen.action })),
      blockedNpcs: inside.filter(n => blockedAt(n.g.position.x, n.g.position.z)).map(n => n.name),
      blockedPaths: inside.filter(n => (n.citizen.insidePath || []).some(p => blockedAt(p.x, p.z))).map(n => n.name)
    };
  }

  return {
    homesById, institutionsById, shopData,
    enterPlayer, exitPlayer, playerInside, nearExit, nearDoor,
    enterNpcHome, enterNpcWork, exitNpc, moveNpc, npcVisible, restoreNpc,
    workFor, homeDoor, shopTask, shopStation, shopRecord, debug
  };
}
