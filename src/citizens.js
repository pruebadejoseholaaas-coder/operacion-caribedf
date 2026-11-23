// Ciudadanos autónomos: vivienda, trabajo, rutas por aceras, horarios y persistencia.
// La navegación usa el grafo de calles ya construido por traffic.js. Cada arista se
// desplaza hacia la acera derecha para que el NPC no camine por el centro de la vía.
const JOB_SHOPS = {
  dependiente: ['colmado', 'ventorrillo', 'frituras', 'empanadas'],
  vendedora: ['ventorrillo', 'colmado', 'fruteria', 'empanadas'],
  maestra: ['panaderia', 'reposteria', 'internet'],
  estudiante: ['panaderia', 'internet', 'imprenta'],
  motoconchista: ['taller-motos', 'repuestos-motos', 'colmado'],
  taxista: ['taller-autos', 'colmado', 'ventorrillo'],
  repartidor: ['colmado', 'ventorrillo', 'taller-autos'],
  enfermera: ['agua', 'colmado', 'comedor'],
  mecánico: ['taller-autos', 'taller-motos', 'repuestos-motos'],
  estilista: ['salon-belleza', 'barberia', 'unas'],
  cocinera: ['comedor', 'frituras', 'empanadas'],
  electricista: ['ferreteria', 'electrodomesticos', 'aluminio'],
  costurera: ['sastreria', 'modisteria', 'bordado'],
  panadero: ['panaderia', 'reposteria'],
  contable: ['internet', 'imprenta', 'fotografia'],
  barbero: ['barberia', 'salon-belleza'],
  agricultora: ['vivero', 'agropecuaria', 'fruteria'],
  secretaria: ['internet', 'imprenta', 'fotografia'],
  carpintero: ['ebanisteria', 'tapiceria', 'herreria'],
  diseñadora: ['serigrafia', 'imprenta', 'fotografia'],
  guardia: ['hielo', 'agua', 'colmado'],
  emprendedora: ['ventorrillo', 'colmado', 'reposteria']
};

export function createCitizenSystem({ npcs, graph, shops, buildings, spawn, swing }) {
  const nodes = [...graph.nodes.values()];
  const byKey = new Map(nodes.map(n => [n.k, n]));
  const shopList = typeof shops === 'function' ? shops() : (shops || []);
  const homes = assignHomes();
  const works = assignWorks();
  let clock = 8 * 3600;

  function nearestNode(x, z) {
    let best = null, bestD = Infinity;
    for (const n of nodes) {
      const d = (n.x - x) ** 2 + (n.z - z) ** 2;
      if (d < bestD) { bestD = d; best = n; }
    }
    return best;
  }

  function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

  function findPath(start, goal) {
    if (!start || !goal) return null;
    if (start.k === goal.k) return [start];
    const open = [start], g = new Map([[start.k, 0]]), f = new Map([[start.k, dist(start, goal)]]);
    const prev = new Map(), closed = new Set();
    while (open.length) {
      let bi = 0;
      for (let i = 1; i < open.length; i++) {
        if ((f.get(open[i].k) ?? 1e9) < (f.get(open[bi].k) ?? 1e9)) bi = i;
      }
      const cur = open.splice(bi, 1)[0];
      if (cur.k === goal.k) {
        const out = [];
        let p = cur;
        while (p) { out.push(p); if (p.k === start.k) break; p = prev.get(p.k); }
        return out.reverse();
      }
      closed.add(cur.k);
      for (const e of cur.edges) {
        const nb = byKey.get(e.b);
        if (!nb || closed.has(nb.k)) continue;
        const ng = (g.get(cur.k) || 0) + e.len;
        if (ng < (g.get(nb.k) ?? Infinity)) {
          prev.set(nb.k, cur); g.set(nb.k, ng); f.set(nb.k, ng + dist(nb, goal));
          if (!open.includes(nb)) open.push(nb);
        }
      }
    }
    return null;
  }

  function offsetPath(nodePath, start, end) {
    const pts = [];
    if (start) pts.push(avoidBuildings({ x: start.x, z: start.z }));
    for (let i = 0; i + 1 < nodePath.length; i++) {
      const a = nodePath[i], b = nodePath[i + 1];
      const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1;
      const edge = a.edges.find(e => e.b === b.k);
      const off = Math.min(2.4, Math.max(1.2, (edge?.width || 6) * .3 + 1.0));
      const nx = -dz / len, nz = dx / len;
      let p1 = safeOffset(a, nx, nz, off);
      let p2 = safeOffset(b, nx, nz, off);
      if (!segmentSafe(p1, p2)) {
        p1 = { x: a.x, z: a.z }; p2 = { x: b.x, z: b.z };
        if (!segmentSafe(p1, p2)) { p1 = avoidBuildings(p1); p2 = avoidBuildings(p2); }
      }
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(last.x - p1.x, last.z - p1.z) > .35) pts.push(p1);
      const last2 = pts[pts.length - 1];
      if (!last2 || Math.hypot(last2.x - p2.x, last2.z - p2.z) > .35) pts.push(p2);
    }
    if (end) pts.push(avoidBuildings({ x: end.x, z: end.z }));
    return pts;
  }

  function routeTo(n, target, kind) {
    if (!target) return false;
    const c = n.citizen;
    const from = nearestNode(n.g.position.x, n.g.position.z);
    const to = target.node || nearestNode(target.x, target.z);
    const nodePath = findPath(from, to);
    if (!nodePath) return false;
    c.path = offsetPath(nodePath, { x: n.g.position.x, z: n.g.position.z }, { x: target.x, z: target.z });
    c.pathIndex = 0; c.pathKind = kind; c.state = kind; c.stateSince = 0; c.target = target;
    n.g.visible = true;
    return true;
  }

  function randomLeisure(n) {
    const near = nodes.filter(o => Math.hypot(o.x - n.work.x, o.z - n.work.z) < 70);
    const node = near[Math.floor(Math.random() * near.length)] || n.work.node;
    if (!node) return n.work;
    const e = node.edges[0];
    if (!e) return { x: node.x, z: node.z, node };
    const off = Math.min(2.2, Math.max(1.2, e.width * .3 + 1));
    return { x: node.x - e.dz * off, z: node.z + e.dx * off, node };
  }

  function animate(n, t, moving) {
    if (swing) swing(n, moving ? Math.sin((t + n.t) * 8) * .42 : 0);
  }

  function arrive(n, t) {
    const c = n.citizen, hour = t / 3600;
    if (c.pathKind === 'toWork') {
      c.state = hour >= n.shiftStart ? 'working' : 'waiting';
      n.g.rotation.y = Math.atan2(n.work.x - n.g.position.x, n.work.z - n.g.position.z);
    } else if (c.pathKind === 'toHome') {
      c.state = 'home';
    } else if (c.pathKind === 'leisure') {
      c.state = 'leisureIdle'; c.idleT = 2 + Math.random() * 4;
    }
    c.path = []; c.pathKind = null; c.pathIndex = 0;
  }

  function move(n, dt, t, speed) {
    const c = n.citizen;
    if (!c.path.length || c.pathIndex >= c.path.length) { arrive(n, t); return; }
    const p = c.path[c.pathIndex];
    const dx = p.x - n.g.position.x, dz = p.z - n.g.position.z, d = Math.hypot(dx, dz);
    if (d < .55) {
      c.pathIndex++;
      if (c.pathIndex >= c.path.length) arrive(n, t);
      return;
    }
    const step = Math.min(d, speed * dt);
    c.maxStep = Math.max(c.maxStep || 0, step);
    n.g.position.x += dx / d * step;
    n.g.position.z += dz / d * step;
    n.g.rotation.y = Math.atan2(dx, dz);
    animate(n, t, true);
  }

  function updateNpc(n, dt, worldClock, t) {
    const c = n.citizen;
    if (!c) return;
    clock = worldClock;
    const hour = worldClock / 3600;
    const sleeping = n.sleepStart > n.sleepEnd ? (hour >= n.sleepStart || hour < n.sleepEnd) : (hour >= n.sleepStart && hour < n.sleepEnd);

    if (n.pause > 0) {
      n.pause = Math.max(0, n.pause - dt);
      n.routineState = 'libre';
      animate(n, t, false);
      return;
    }

    if (sleeping) {
      if (c.state !== 'sleeping') {
        if (Math.hypot(n.g.position.x - n.home.x, n.g.position.z - n.home.z) < 1.2) {
          c.state = 'sleeping'; n.g.visible = false; c.path = []; c.pathKind = null;
        } else {
          if (c.pathKind !== 'toHome' || !c.path.length) routeTo(n, n.home, 'toHome');
          move(n, dt, t, .95);
        }
      } else n.g.visible = false;
      n.routineState = 'durmiendo';
      return;
    }

    if (c.state === 'sleeping') {
      n.g.position.set(n.home.x, 0, n.home.z);
      n.g.visible = true;
      n.pause = 0; c.state = 'preparing'; c.path = []; c.pathKind = null; c.stateSince = 0;
    }

    const leave = n.shiftStart - .65, returnAt = n.shiftEnd + 1.35;

    if (c.state === 'home' || c.state === 'preparing') {
      if (hour >= leave && hour < n.shiftEnd) {
        if (c.state !== 'toWork') routeTo(n, n.work, 'toWork');
        move(n, dt, t, 1.05);
      } else {
        n.routineState = 'libre'; n.activity = hour < leave ? 'preparing' : 'rest';
        animate(n, t, false);
      }
      return;
    }

    if (c.state === 'toWork') { n.routineState = 'libre'; move(n, dt, t, 1.1); return; }

    if (c.state === 'waiting') {
      n.routineState = 'trabajando';
      if (hour >= n.shiftStart) c.state = 'working';
      animate(n, t, false);
      return;
    }

    if (c.state === 'working') {
      n.routineState = 'trabajando'; n.activity = 'work';
      if (hour >= 12 && hour < 13) { c.state = 'break'; c.stateSince = 0; animate(n, t, false); return; }
      if (hour >= n.shiftEnd) {
        c.state = 'leisure'; routeTo(n, randomLeisure(n), 'leisure'); move(n, dt, t, .9);
        return;
      }
      animate(n, t, Math.sin(t * 4) * .12);
      return;
    }

    if (c.state === 'break') {
      n.routineState = 'descanso';
      if (hour >= 13) c.state = 'working';
      animate(n, t, false);
      return;
    }

    if (c.state === 'leisure') {
      n.routineState = 'libre';
      if (hour >= returnAt) routeTo(n, n.home, 'toHome');
      move(n, dt, t, .9);
      return;
    }

    if (c.state === 'leisureIdle') {
      n.routineState = 'libre';
      if (hour >= returnAt) { routeTo(n, n.home, 'toHome'); move(n, dt, t, .95); return; }
      c.idleT -= dt;
      if (c.idleT <= 0) routeTo(n, randomLeisure(n), 'leisure');
      animate(n, t, false);
      return;
    }

    if (c.state === 'toHome') { n.routineState = 'libre'; move(n, dt, t, 1.0); return; }

    if (hour >= leave && hour < n.shiftEnd) routeTo(n, n.work, 'toWork');
    else routeTo(n, n.home, 'toHome');
  }

  function assignHomes() {
    const cands = [];
    for (const b of buildings || []) {
      if (!b.poly || b.poly.length < 6 || (b.height || 0) < 4) continue;
      const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
      const node = nearestNode(cx, cz);
      if (!node) continue;
      const dn = Math.hypot(node.x - cx, node.z - cz);
      if (dn < 5 || dn > 38) continue;
      let best = null, bestD = Infinity;
      for (let i = 0; i + 3 < b.poly.length; i += 2) {
        const ax = b.poly[i], az = b.poly[i + 1], bx = b.poly[i + 2], bz = b.poly[i + 3];
        const vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz || 1;
        let u = ((node.x - ax) * vx + (node.z - az) * vz) / l2;
        u = Math.max(0, Math.min(1, u));
        const px = ax + vx * u, pz = az + vz * u, d = Math.hypot(node.x - px, node.z - pz);
        if (d < bestD) { bestD = d; best = { x: px, z: pz }; }
      }
      if (!best) continue;
      let nx = best.x - cx, nz = best.z - cz;
      const l = Math.hypot(nx, nz) || 1;
      let door = null;
      for (let k = 1.8; k <= 12; k += .8) {
        const test = { x: best.x + nx / l * k, z: best.z + nz / l * k };
        if (outsideAll(test.x, test.z)) { door = test; break; }
      }
      if (door) cands.push({ ...door, node });
    }
    const sx = spawn?.x || 0, sz = spawn?.z || 0;
    let pool = cands.filter(c => Math.hypot(c.x - sx, c.z - sz) < 200).sort((a, b) => Math.hypot(a.x - sx, a.z - sz) - Math.hypot(b.x - sx, b.z - sz));
    if (!pool.length) pool = cands.slice().sort((a, b) => Math.hypot(a.x - sx, a.z - sz) - Math.hypot(b.x - sx, b.z - sz));
    if (pool.length > 80) pool = pool.slice(0, 80);
    if (!cands.length) {
      const cx = spawn?.x || 0, cz = spawn?.z || 0;
      for (const n of nodes) {
        if (Math.hypot(n.x - cx, n.z - cz) < 180) cands.push({ x: n.x, z: n.z, node: n });
      }
    }
    if (!cands.length) for (let i = 0; i < npcs.length; i++) { const n = nodes[i % nodes.length]; cands.push({ x: n.x, z: n.z, node: n }); }
    return npcs.map((_, i) => pool[Math.floor(i * pool.length / Math.max(1, npcs.length))] || pool[i % pool.length] || cands[i % cands.length]);
  }

  function assignWorks() {
    return npcs.map((n, i) => {
      const ids = JOB_SHOPS[n.occupation] || [];
      const shop = shopList.find(s => ids.includes(s.data.id)) || shopList[i % Math.max(1, shopList.length)];
      if (!shop) { const h = homes[i]; return { shop: null, shopId: null, x: h.x, z: h.z, node: h.node, label: 'casa' }; }
      const r = shop.g.rotation.y;
      const door = { x: shop.g.position.x + Math.sin(r) * 4.1, z: shop.g.position.z + Math.cos(r) * 4.1 };
      return { shop, shopId: shop.data.id, x: door.x, z: door.z, node: nearestNode(door.x, door.z), label: shop.data.name };
    });
  }

  function initialize(worldClock = 8 * 3600) {
    clock = worldClock;
    npcs.forEach((n, i) => {
      n.home = homes[i] || { x: 0, z: 0, node: nearestNode(0, 0) };
      n.work = works[i] || { x: n.home.x, z: n.home.z, node: n.home.node, label: 'casa' };
      n.homeIndex = i;
      n.workShopId = n.work.shopId;
      n.citizen = { state: 'home', path: [], pathIndex: 0, pathKind: null, stateSince: 0, idleT: 0, target: null, activity: 'rest', maxStep: 0 };
      n.g.position.set(n.home.x, 0, n.home.z);
      n.g.visible = true;
      n.pause = 0;
    });
    npcs.forEach(n => updateNpc(n, 0, worldClock, 0));
  }

  function serialize() {
    return npcs.map((n, i) => ({
      i, state: n.citizen?.state || 'home', pathKind: n.citizen?.pathKind || null,
      path: (n.citizen?.path || []).map(p => [+p.x.toFixed(2), +p.z.toFixed(2)]),
      pathIndex: n.citizen?.pathIndex || 0, x: +n.g.position.x.toFixed(2), z: +n.g.position.z.toFixed(2),
      visible: n.g.visible !== false, homeIndex: n.homeIndex, workShopId: n.workShopId,
      idleT: n.citizen?.idleT || 0
    }));
  }

  function restore(data) {
    if (!Array.isArray(data)) return;
    for (const d of data) {
      const n = npcs[d.i];
      if (!n) continue;
      if (Number.isFinite(d.homeIndex) && homes[d.homeIndex]) n.home = homes[d.homeIndex];
      if (d.workShopId) { const w = works.find(o => o.shopId === d.workShopId); if (w) n.work = w; }
      n.citizen.state = d.state || 'home';
      n.citizen.path = Array.isArray(d.path) ? d.path.map(([x, z]) => ({ x, z })) : [];
      n.citizen.pathIndex = Math.max(0, d.pathIndex | 0);
      n.citizen.pathKind = d.pathKind || null;
      n.citizen.idleT = Number(d.idleT) || 0;
      n.citizen.maxStep = 0;
      n.g.position.set(Number.isFinite(d.x) ? d.x : n.home.x, 0, Number.isFinite(d.z) ? d.z : n.home.z);
      n.g.visible = d.visible !== false && n.citizen.state !== 'sleeping';
    }
  }

  function segmentSafe(a, b) {
    for (let k = 0; k <= 10; k++) {
      const x = a.x + (b.x - a.x) * k / 10, z = a.z + (b.z - a.z) * k / 10;
      if (!outsideAll(x, z)) return false;
    }
    return true;
  }

  function safeOffset(a, nx, nz, off) {
    for (const k of [off, off * .65, 0, -off]) {
      const p = { x: a.x + nx * k, z: a.z + nz * k };
      if (outsideAll(p.x, p.z)) return p;
    }
    return { x: a.x, z: a.z };
  }

  function outsideAll(x, z) {
    for (const b of buildings || []) if (b.poly && pointInPoly(x, z, b.poly)) return false;
    return true;
  }

  function avoidBuildings(p) {
    for (let k = 0; k < 20; k++) {
      let moved = false;
      for (const b of buildings || []) {
        if (!b.poly || !pointInPoly(p.x, p.z, b.poly)) continue;
        const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
        let dx = p.x - cx, dz = p.z - cz;
        const l = Math.hypot(dx, dz) || 1;
        p.x += dx / l * 1.5; p.z += dz / l * 1.5; moved = true;
      }
      if (!moved) break;
    }
    return p;
  }

  function pointInPoly(x, z, p) {
    let inside = false;
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      const xi = p[i], zi = p[i + 1], xj = p[j], zj = p[j + 1];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / ((zj - zi) || .0001) + xi) inside = !inside;
    }
    return inside;
  }

  function unsafePaths() {
    const out = [];
    for (const n of npcs) {
      const path = n.citizen?.path || [];
      const samples = [];
      for (let i = 0; i < path.length; i++) {
        samples.push(path[i]);
        if (i + 1 < path.length) {
          const a = path[i], b = path[i + 1];
          for (let k = 1; k < 8; k++) samples.push({ x: a.x + (b.x - a.x) * k / 8, z: a.z + (b.z - a.z) * k / 8 });
        }
      }
      for (const p of samples) {
        for (const b of buildings || []) {
          if (b.poly && pointInPoly(p.x, p.z, b.poly)) {
            out.push({ npc: n.name, state: n.citizen.state, x: +p.x.toFixed(1), z: +p.z.toFixed(1) });
            break;
          }
        }
        if (out.length >= 20) return out;
      }
    }
    return out;
  }

  function setClock(v) { clock = v; }

  function simulate(seconds, step = .5) {
    let s = clock;
    const end = s + seconds;
    while (s < end) {
      s += step;
      for (const n of npcs) updateNpc(n, step, s, s);
    }
    clock = s;
    return debug();
  }

  function debug() {
    const counts = {};
    for (const n of npcs) counts[n.citizen?.state || 'none'] = (counts[n.citizen?.state || 'none'] || 0) + 1;
    return {
      clock, counts,
      npcs: npcs.map(n => ({
        name: n.name, occupation: n.occupation, state: n.citizen?.state, routine: n.routineState,
        visible: n.g.visible, home: n.home && [+n.home.x.toFixed(1), +n.home.z.toFixed(1)],
        homePos: n.home && [n.home.x, n.home.z], work: n.work?.label, workPos: n.work && [n.work.x, n.work.z], path: n.citizen?.path.length || 0, index: n.citizen?.pathIndex || 0, maxStep: +(n.citizen?.maxStep || 0).toFixed(2),
        pos: [+n.g.position.x.toFixed(1), +n.g.position.z.toFixed(1)]
      })),
      unsafe: unsafePaths()
    };
  }

  return { initialize, updateNpc, serialize, restore, simulate, setClock, debug };
}
