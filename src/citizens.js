// Ciudadanos autónomos: vivienda, trabajo, rutas por aceras, horarios y persistencia.
import { planTransit, busAtStop, busServesStop } from './transit.js';
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

export function createCitizenSystem({ npcs, graph, shops, buildings, spawn, swing, interiors: interiorApi, businesses: businessApi, traffic: trafficApi, leisureSpots = [] }) {
  const nodes = [...graph.nodes.values()];
  const byKey = new Map(nodes.map(n => [n.k, n]));
  const shopList = typeof shops === 'function' ? shops() : (shops || []);
  const homes = assignHomes();
  let interiors = interiorApi || null;
  let business = businessApi || null;
  let traffic = trafficApi || null;
  let weather = 0;
  const plazaSpots = Array.isArray(leisureSpots) ? leisureSpots : [];
  let works = assignWorks();
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
    return trimPath(repairPath(pts));
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

  const JOB_PREFERENCE = {
    cocinera: 'food', panadero: 'food', agricultora: 'goods', estudiante: 'food',
    barbero: 'service', estilista: 'service', mecánico: 'service', enfermera: 'food',
    maestra: 'goods', dependiente: 'food', repartidor: 'food', motoconchista: 'service',
    costurera: 'service', emprendedora: 'goods'
  };
  function preferenceFor(n, i) {
    return n.preference || JOB_PREFERENCE[n.occupation] || ['food', 'service', 'goods'][i % 3];
  }
  function chooseShop(n) {
    if (!business?.availableFor || !interiors) return null;
    const origin = n.citizen?.insideKind === 'home' || n.citizen?.inside?.startsWith('home-') ? n.home : n.g.position;
    const pick = (list) => {
      const pool = list.filter(s => {
        const d = Math.hypot(s.g.position.x - origin.x, s.g.position.z - origin.z);
        return d > 18 && d < 150 && s.data.id !== n.workShopId;
      });
      return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    };
    return pick(business.availableFor(n.preference)) || pick(business.availableFor('food')) || pick(business.availableFor('service')) || pick(business.availableFor('goods'));
  }
  function transitRoute(from, to) {
    if (!traffic?.stops?.length || !from || !to) return null;
    const plan = planTransit(traffic.stops, from, to, 65);
    return plan ? { from: plan.from, to: plan.to, final: to } : null;
  }
  function resetPose(n) {
    n.g.position.y = 0; n.g.rotation.x = 0;
    if (n.legL) n.legL.rotation.x = 0;
    if (n.legR) n.legR.rotation.x = 0;
    if (n.armL) n.armL.rotation.x = 0;
    if (n.armR) n.armR.rotation.x = 0;
  }

  function animate(n, t, moving) {
    const action = n.citizen?.action || 'walk';
    if (action === 'sleep') {
      n.g.position.y = .52; n.g.rotation.x = -Math.PI / 2;
      if (n.legL) n.legL.rotation.x = -.15;
      if (n.legR) n.legR.rotation.x = -.15;
      if (n.armL) n.armL.rotation.x = -.25;
      if (n.armR) n.armR.rotation.x = -.25;
      return;
    }
    if (action === 'sit' || action === 'eat') {
      n.g.position.y = .30; n.g.rotation.x = 0;
      if (n.legL) n.legL.rotation.x = -1.25;
      if (n.legR) n.legR.rotation.x = -1.25;
      const eat = action === 'eat' ? Math.sin((t + n.t) * 5) * .18 : 0;
      if (n.armL) n.armL.rotation.x = -1.15 + eat;
      if (n.armR) n.armR.rotation.x = -1.15 - eat;
      return;
    }
    if (action === 'serve') {
      n.g.position.y = 0; n.g.rotation.x = 0;
      if (n.legL) n.legL.rotation.x = 0;
      if (n.legR) n.legR.rotation.x = 0;
      if (n.armL) n.armL.rotation.x = -1.0;
      if (n.armR) n.armR.rotation.x = -.45;
      n.g.rotation.x = .06;
      return;
    }
    if (action === 'work') {
      n.g.position.y = 0; n.g.rotation.x = 0;
      const task = n.citizen?.task || 'cashier';
      const beat = Math.sin((t + n.t) * (task === 'cook' ? 6 : 3.5));
      if (n.legL) n.legL.rotation.x = 0;
      if (n.legR) n.legR.rotation.x = 0;
      if (task === 'cook') {
        if (n.armL) n.armL.rotation.x = -.85 + beat * .35;
        if (n.armR) n.armR.rotation.x = -.85 - beat * .35;
      } else if (task === 'barber' || task === 'mechanic') {
        if (n.armL) n.armL.rotation.x = -.75 + beat * .16;
        if (n.armR) n.armR.rotation.x = -.95 - beat * .16;
      } else {
        if (n.armL) n.armL.rotation.x = -.55 + beat * .10;
        if (n.armR) n.armR.rotation.x = -.55 - beat * .10;
      }
      return;
    }
    if (moving || action === 'walk' || action === 'enter') {
      resetPose(n);
      if (swing) swing(n, Math.sin((t + n.t) * 8) * .42);
      return;
    }
    resetPose(n);
  }

  function arrive(n, t) {
    const c = n.citizen, hour = t / 3600;
    if (c.pathKind === 'toWork') {
      if (interiors?.enterNpcWork(n)) {
        c.state = hour >= n.shiftStart ? 'working' : 'waiting';
        c.action = 'enter';
      } else {
        c.state = hour >= n.shiftStart ? 'working' : 'waiting';
        n.g.rotation.y = Math.atan2(n.work.x - n.g.position.x, n.work.z - n.g.position.z);
      }
    } else if (c.pathKind === 'toHome') {
      if (interiors?.enterNpcHome(n)) c.action = 'enter';
      c.state = 'home';
    } else if (c.pathKind === 'toShop') {
      const shop = c.shopId && business?.shopById(c.shopId);
      const spot = shop && business.joinQueue(shop, n);
      if (spot && interiors?.enterNpcCustomer(n, shop, spot.spot)) {
        c.state = 'shopping'; c.pathKind = null; c.shopWait = 0; c.shopServeT = 0; c.action = 'enter';
      } else {
        if (shop) business.leaveQueue(shop, n);
        c.state = 'leisureIdle'; c.idleT = 3 + Math.random() * 5; c.shopId = null; c.shopCooldown = 30;
      }
    } else if (c.pathKind === 'toStop') {
      c.state = 'waitingBus'; c.transitWait = 0; c.action = 'wait';
      const stop = c.transit?.from;
      if (stop) n.g.position.set(stop.x + (stop.ox || 0) * 1.2, 0, stop.z + (stop.oz || 0) * 1.2);
    } else if (c.pathKind === 'leisure') {
      c.state = 'leisureIdle'; c.idleT = 2 + Math.random() * 4;
      if (c.target?.kind === 'bench') c.plazaVisits = (c.plazaVisits || 0) + 1;
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
    c.shopCooldown = Math.max(0, (c.shopCooldown || 0) - dt);
    c.plazaCooldown = Math.max(0, (c.plazaCooldown || 0) - dt);
    const hour = worldClock / 3600;
    const sleeping = n.sleepStart > n.sleepEnd ? (hour >= n.sleepStart || hour < n.sleepEnd) : (hour >= n.sleepStart && hour < n.sleepEnd);
    if (c.inside) n.g.visible = interiors?.npcVisible(c.inside) ?? true;

    if (n.pause > 0) {
      n.pause = Math.max(0, n.pause - dt);
      n.routineState = 'libre';
      animate(n, t, false);
      return;
    }

    if (sleeping) {
      const insideHome = c.inside && (c.insideKind === 'home' || c.inside.startsWith('home-'));
      if (insideHome) {
        if (c.state !== 'sleeping') { c.state = 'sleeping'; c.action = 'sleep'; c.path = []; c.pathKind = null; }
        interiors.moveNpc(n, 'bed', dt, .7);
        animate(n, t, false);
      } else {
        if (c.inside) {
          interiors.exitNpc(n);
          c.state = 'toHome'; c.path = []; c.pathKind = null; c.action = 'walk';
        }
        if (c.state !== 'sleeping') {
          if (Math.hypot(n.g.position.x - n.home.x, n.g.position.z - n.home.z) < 2.2) {
            if (interiors?.enterNpcHome(n)) {
              c.state = 'sleeping'; c.action = 'sleep'; c.path = []; c.pathKind = null;
              animate(n, t, false);
            } else {
              c.state = 'sleeping'; n.g.visible = false; c.path = []; c.pathKind = null;
            }
          } else {
            if (c.pathKind !== 'toHome' || !c.path.length) routeTo(n, n.home, 'toHome');
            move(n, dt, t, .95);
          }
        } else n.g.visible = false;
      }
      n.routineState = 'durmiendo';
      return;
    }

    if (c.state === 'sleeping') {
      if (c.inside) interiors.exitNpc(n);
      else n.g.position.set(n.home.x, 0, n.home.z);
      n.g.visible = true;
      n.pause = 0; c.state = 'preparing'; c.action = 'walk'; c.path = []; c.pathKind = null; c.stateSince = 0; c.transitDone = false; c.transit = null;
    }

    const leave = n.shiftStart - .65, returnAt = n.shiftEnd + 1.35;

    if (c.state === 'home' || c.state === 'preparing') {
      if (hour < leave && n.usePlaza && n.plazaSpot && (c.plazaCooldown || 0) <= 0 && Math.random() < dt * .04) {
        if (c.inside) interiors.exitNpc(n);
        c.plazaCooldown = 180; c.action = 'walk';
        routeTo(n, n.plazaSpot, 'leisure');
        return;
      }
      if (hour < leave && c.shopCooldown <= 0 && Math.random() < dt * (c.inside ? .025 : .055)) {
        const shop = chooseShop(n);
        if (shop) {
          if (c.inside) interiors.exitNpc(n);
          c.shopId = shop.data.id; c.shopCooldown = 120;
          const rec = interiors.shopRecord(shop), target = rec?.door || { x: shop.g.position.x, z: shop.g.position.z };
          routeTo(n, target, 'toShop');
          return;
        }
      }
      if (hour >= leave && hour < n.shiftEnd) {
        if (c.inside) interiors.exitNpc(n);
        if (c.state !== 'toWork') routeTo(n, n.work, 'toWork');
        move(n, dt, t, 1.05);
      } else if (c.inside) {
        n.routineState = 'libre'; n.activity = hour < leave ? 'preparing' : 'rest';
        const key = hour < leave ? 'bath' : 'sofa';
        const done = interiors.moveNpc(n, key, dt, .8);
        c.action = done ? (hour < leave ? 'walk' : 'sit') : 'walk';
        animate(n, t, !done);
      } else {
        n.routineState = 'libre'; n.activity = hour < leave ? 'preparing' : 'rest';
        if (c.pathKind !== 'toHome' || !c.path.length) routeTo(n, n.home, 'toHome');
        move(n, dt, t, .95);
      }
      return;
    }

    if (c.state === 'toWork') { n.routineState = 'libre'; move(n, dt, t, 1.1); return; }

    if (c.state === 'waiting') {
      n.routineState = 'trabajando';
      if (c.inside) {
        interiors.moveNpc(n, c.stationKey || c.insideTarget || 'station', dt, .9);
        c.action = 'wait'; animate(n, t, false);
      }
      if (hour >= n.shiftStart) c.state = 'working';
      return;
    }

    if (c.state === 'working') {
      n.routineState = 'trabajando'; n.activity = 'work';
      if (!c.inside) {
        if (interiors?.enterNpcWork(n)) { c.state = 'working'; c.action = 'enter'; }
        animate(n, t, false);
        return;
      }
      if (hour >= 12 && hour < 13) {
        c.state = 'break'; c.stateSince = 0; c.action = 'eat';
        animate(n, t, false);
        return;
      }
      if (hour >= n.shiftEnd) {
        interiors.exitNpc(n);
        const leisure = randomLeisure(n);
        const tr = !c.transitDone && n.useTransit ? transitRoute(n.work, leisure) : null;
        if (tr) {
          c.transit = tr; c.transitWait = 0; c.transitDone = true; c.state = 'toStop';
          c.action = 'walk'; routeTo(n, { x: tr.from.x, z: tr.from.z }, 'toStop');
        } else {
          c.state = 'leisure'; c.action = 'walk'; routeTo(n, leisure, 'leisure');
        }
        move(n, dt, t, .9);
        return;
      }
      const done = interiors.moveNpc(n, c.stationKey || c.insideTarget || 'station', dt, .7);
      if (done && c.insideKind === 'shop' && n.work.shop) {
        const visits = n.work.shop.visits || 0;
        if (visits > (c.lastVisits || 0)) { c.lastVisits = visits; c.serveT = 2.2; }
        c.serveT = Math.max(0, (c.serveT || 0) - dt);
        if (c.serveT > 0) { c.action = 'serve'; animate(n, t, false); return; }
      }
      c.action = done ? 'work' : 'walk';
      animate(n, t, !done);
      return;
    }

    if (c.state === 'break') {
      n.routineState = 'descanso';
      c.action = 'eat'; animate(n, t, false);
      if (hour >= 13) c.state = 'working';
      return;
    }

    if (c.state === 'toStop') {
      n.routineState = 'transporte'; move(n, dt, t, 1.0); return;
    }

    if (c.state === 'waitingBus') {
      n.routineState = 'transporte';
      const stop = c.transit?.from;
      c.transitWait += dt; c.action = 'wait'; animate(n, t, false);
      if (!stop) { c.state = 'toWork'; routeTo(n, c.transit?.final || n.home, 'leisure'); return; }
      // Solo se aborda una guagua de la misma línea que está realmente en esta parada.
      const bus = traffic?.vehicles?.find(v => busAtStop(v, stop, 12));
      if (bus) {
        c.transit.bus = bus; c.state = 'ridingBus'; c.transitT = 0; c.action = 'ride'; n.g.visible = false;
      } else if (c.transitWait > 32) {
        const final = c.transit?.final || n.home; c.transit = null;
        c.state = 'leisure'; routeTo(n, final, 'leisure');
      }
      return;
    }

    if (c.state === 'ridingBus') {
      n.routineState = 'transporte';
      const bus = c.transit?.bus, stop = c.transit?.to, final = c.transit?.final || n.home;
      if (!bus || !stop || !busServesStop(bus, stop)) {
        c.transit = null; n.g.visible = true; c.state = 'leisure'; c.action = 'walk';
        routeTo(n, final, 'leisure'); return;
      }
      c.transitT = (c.transitT || 0) + dt;
      // El NPC permanece dentro hasta que el autobús llega a la parada destino.
      if (busAtStop(bus, stop, 14)) {
        n.g.position.set(stop.x + (stop.ox || 0) * 1.2, 0, stop.z + (stop.oz || 0) * 1.2);
        n.g.visible = true; c.transit = null; c.state = 'leisure'; c.action = 'walk';
        routeTo(n, final, 'leisure');
      } else if (c.transitT > 240) {
        // Si el servicio se interrumpe, se baja en la posición actual y continúa caminando.
        n.g.position.set(bus.g.position.x, 0, bus.g.position.z); n.g.visible = true;
        c.transit = null; c.state = 'leisure'; c.action = 'walk'; routeTo(n, final, 'leisure');
      }
      return;
    }

    if (c.state === 'toShop') {
      n.routineState = 'comprando';
      move(n, dt, t, .9);
      return;
    }

    if (c.state === 'shopping') {
      n.routineState = 'comprando';
      const shop = business?.shopById(c.shopId);
      if (!shop) { c.state = 'leisureIdle'; c.idleT = 2; return; }
      const atSpot = interiors.moveNpc(n, 'queue', dt, .75);
      c.action = atSpot ? 'wait' : 'walk';
      animate(n, t, !atSpot);
      if (atSpot) {
        c.shopWait += dt;
        if (business.isFirst(shop, n) && shop.actualStaff > 0) {
          c.action = 'buy'; c.shopServeT += dt;
          if (c.shopServeT > 2.1) {
            const bought = business.serveCustomer(shop, n);
            if (bought) c.lastPurchase = bought.name;
            interiors.leaveNpcCustomer(n); c.state = 'leavingShop'; c.action = 'walk';
          }
        } else if (c.shopWait > 18) {
          interiors.leaveNpcCustomer(n); c.state = 'leavingShop'; c.action = 'walk';
        }
      }
      return;
    }

    if (c.state === 'leavingShop') {
      n.routineState = 'comprando';
      const atDoor = interiors.moveNpc(n, 'exit', dt, .95);
      c.action = 'walk'; animate(n, t, !atDoor);
      if (atDoor) {
        const shop = business?.shopById(c.shopId);
        if (shop) business.leaveQueue(shop, n);
        interiors.exitNpc(n);
        c.shopId = null; c.shopCooldown = 90 + Math.random() * 60;
        c.pathKind = null; c.path = []; c.pathIndex = 0;
        if (hour >= n.shiftStart - .65 && hour < n.shiftEnd) {
          c.state = 'toWork'; routeTo(n, n.work, 'toWork');
        } else {
          c.state = 'leisureIdle'; c.idleT = 2 + Math.random() * 4;
        }
      }
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
      c.action = c.target?.kind === 'bench' && Math.hypot(n.g.position.x - c.target.x, n.g.position.z - c.target.z) < 1.6 ? 'sit' : 'walk';
      if (hour >= n.shiftStart - .65 && hour < n.shiftEnd) { c.state = 'toWork'; routeTo(n, n.work, 'toWork'); return; }
      if (weather === 2 && Math.random() < dt * .22) { routeTo(n, n.home, 'toHome'); return; }
      if (hour >= returnAt) { routeTo(n, n.home, 'toHome'); move(n, dt, t, .95); return; }
      c.idleT -= dt;
      if (c.idleT <= 0) {
        const shop = c.shopCooldown <= 0 && Math.random() < .62 ? chooseShop(n) : null;
        if (shop) {
          c.shopId = shop.data.id; c.shopCooldown = 120;
          const rec = interiors.shopRecord(shop), target = rec?.door || { x: shop.g.position.x, z: shop.g.position.z };
          routeTo(n, target, 'toShop');
        } else routeTo(n, randomLeisure(n), 'leisure');
      }
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
      const inst = interiors?.workFor(n.occupation);
      if (inst) {
        return { institution: inst.id.replace('inst-', ''), shop: null, shopId: null, x: inst.door.x, z: inst.door.z, node: nearestNode(inst.door.x, inst.door.z), label: inst.name, station: inst.station[n.occupation] };
      }
      const ids = JOB_SHOPS[n.occupation] || [];
      const shop = ids.map(id => shopList.find(s => s.data.id === id)).find(Boolean) || shopList[i % Math.max(1, shopList.length)];
      if (!shop) { const h = homes[i]; return { shop: null, shopId: null, x: h.x, z: h.z, node: h.node, label: 'casa' }; }
      const r = shop.g.rotation.y;
      const door = { x: shop.g.position.x + Math.sin(r) * 4.1, z: shop.g.position.z + Math.cos(r) * 4.1 };
      return { shop, shopId: shop.data.id, x: door.x, z: door.z, node: nearestNode(door.x, door.z), label: shop.data.name };
    });
  }

  function attachInteriors(api) {
    interiors = api;
    works = assignWorks();
  }

  function homeDoors() { return homes; }

  function initialize(worldClock = 8 * 3600) {
    clock = worldClock;
    npcs.forEach((n, i) => {
      n.home = homes[i] || { x: 0, z: 0, node: nearestNode(0, 0) };
      n.work = works[i] || { x: n.home.x, z: n.home.z, node: n.home.node, label: 'casa' };
      n.homeIndex = i;
      n.workShopId = n.work.shopId;
      n.workInstitution = n.work.institution || null;
      n.preference = preferenceFor(n, i);
      n.useTransit = i % 4 === 0;
      n.usePlaza = i % 3 === 0;
      const plaza = plazaSpots.reduce((best, spot) => {
        const d = Math.hypot(spot.x - n.home.x, spot.z - n.home.z);
        return !best || d < best.d ? { spot, d } : best;
      }, null);
      n.plazaSpot = plaza && plaza.d < 110 ? plaza.spot : null;
      n.citizen = { state: 'home', path: [], pathIndex: 0, pathKind: null, stateSince: 0, idleT: 0, target: null, activity: 'rest', maxStep: 0, inside: null, insideKind: null, insidePath: [], insideIndex: 0, insideTarget: null, stationKey: null, action: 'walk', task: null, serveT: 0, lastVisits: 0, shopId: null, shopCooldown: 20 + Math.random() * 50, shopWait: 0, shopServeT: 0, lastPurchase: null, lodAcc: 0, transit: null, transitWait: 0, transitDone: false, plazaVisits: 0 };
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
      idleT: n.citizen?.idleT || 0, inside: n.citizen?.inside || null, insideKind: n.citizen?.insideKind || null,
      insideTarget: n.citizen?.insideTarget || null, stationKey: n.citizen?.stationKey || null, serveT: n.citizen?.serveT || 0, lastVisits: n.citizen?.lastVisits || 0, task: n.citizen?.task || null,
      action: n.citizen?.action || 'walk', workInstitution: n.work?.institution || null, preference: n.preference, shopId: n.citizen?.shopId || null, shopCooldown: n.citizen?.shopCooldown || 0, shopWait: n.citizen?.shopWait || 0, shopServeT: n.citizen?.shopServeT || 0, lastPurchase: n.citizen?.lastPurchase || null, transitDone: !!n.citizen?.transitDone
    }));
  }

  function restore(data) {
    if (!Array.isArray(data)) return;
    for (const d of data) {
      const n = npcs[d.i];
      if (!n) continue;
      if (Number.isFinite(d.homeIndex) && homes[d.homeIndex]) n.home = homes[d.homeIndex];
      if (d.workInstitution) { const w = works.find(o => o.institution === d.workInstitution); if (w) n.work = w; }
      else if (d.workShopId) { const w = works.find(o => o.shopId === d.workShopId); if (w) n.work = w; }
      n.citizen.state = d.state || 'home';
      n.citizen.path = Array.isArray(d.path) ? d.path.map(([x, z]) => ({ x, z })) : [];
      n.citizen.pathIndex = Math.max(0, d.pathIndex | 0);
      n.citizen.pathKind = d.pathKind || null;
      n.citizen.idleT = Number(d.idleT) || 0;
      n.citizen.inside = d.inside || null;
      n.citizen.insideKind = d.insideKind || (d.inside?.startsWith('home-') ? 'home' : d.inside?.startsWith('inst-') ? 'institution' : d.inside?.startsWith('shop-') ? 'shop' : null);
      n.citizen.insideTarget = d.insideTarget || null;
      n.citizen.stationKey = d.stationKey || null;
      n.citizen.serveT = Number(d.serveT) || 0;
      n.citizen.lastVisits = Number(d.lastVisits) || 0;
      n.citizen.task = d.task || null;
      n.citizen.action = d.action || 'walk';
      n.preference = d.preference || preferenceFor(n, d.i || 0);
      n.citizen.shopId = d.shopId || null; n.citizen.shopCooldown = Number(d.shopCooldown) || 0;
      n.citizen.shopWait = Number(d.shopWait) || 0; n.citizen.shopServeT = Number(d.shopServeT) || 0; n.citizen.lastPurchase = d.lastPurchase || null; n.citizen.transitDone = !!d.transitDone;
      n.citizen.maxStep = 0;
      n.citizen.plazaVisits = 0;
      n.g.position.set(Number.isFinite(d.x) ? d.x : n.home.x, 0, Number.isFinite(d.z) ? d.z : n.home.z);
      if (['toStop', 'waitingBus', 'ridingBus'].includes(n.citizen.state)) {
        n.citizen.state = 'toWork'; n.citizen.transit = null; n.g.visible = true; routeTo(n, n.work, 'toWork');
      }
      if (n.citizen.inside) {
        if (n.citizen.insideKind === 'shopCustomer' && !business?.shopById(n.citizen.shopId)) {
          interiors?.exitNpc(n); n.citizen.state = 'leisureIdle'; n.citizen.shopId = null;
        } else interiors?.restoreNpc(n);
      } else n.g.visible = d.visible !== false;
    }
  }

  function trimPath(pts) {
    const out = [];
    for (const p of pts) {
      if (!outsideAll(p.x, p.z)) break;
      if (out.length && !segmentSafe(out[out.length - 1], p)) break;
      out.push(p);
    }
    return out;
  }

  function repairPath(pts) {
    if (!pts.length) return pts;
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const seg = repairSegment(out[out.length - 1], pts[i], 0);
      for (let k = 1; k < seg.length; k++) out.push(seg[k]);
    }
    return out;
  }

  function repairSegment(a, b, depth) {
    if (segmentSafe(a, b) || depth >= 4) return [a, b];
    const mid = avoidBuildings({ x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 });
    if (Math.hypot(mid.x - a.x, mid.z - a.z) < .05 || Math.hypot(mid.x - b.x, mid.z - b.z) < .05) return [a, b];
    const left = repairSegment(a, mid, depth + 1), right = repairSegment(mid, b, depth + 1);
    return [...left, ...right.slice(1)];
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

  function setWeather(v) { weather = Math.max(0, v | 0); }

  function updateAll(dt, worldClock, t, playerPos) {
    for (const n of npcs) {
      const c = n.citizen;
      if (!c) continue;
      const d = playerPos ? Math.hypot(n.g.position.x - playerPos.x, n.g.position.z - playerPos.z) : 0;
      if (playerPos && !c.inside) n.g.visible = d < 185;
      const interval = d > 160 ? .55 : d > 90 ? .25 : 0;
      if (interval) {
        c.lodAcc = (c.lodAcc || 0) + dt;
        if (c.lodAcc < interval) continue;
        const step = c.lodAcc; c.lodAcc = 0;
        updateNpc(n, step, worldClock, t);
      } else {
        c.lodAcc = 0;
        updateNpc(n, dt, worldClock, t);
      }
    }
  }

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
      clock, counts, weather,
      npcs: npcs.map(n => ({
        name: n.name, occupation: n.occupation, state: n.citizen?.state, routine: n.routineState,
        visible: n.g.visible, inside: n.citizen?.inside || null, insideKind: n.citizen?.insideKind || null, task: n.citizen?.task || null, action: n.citizen?.action || 'walk', preference: n.preference, shopId: n.citizen?.shopId || null, lastPurchase: n.citizen?.lastPurchase || null, useTransit: !!n.useTransit, usePlaza: !!n.usePlaza, plazaSpot: n.plazaSpot ? [+n.plazaSpot.x.toFixed(1), +n.plazaSpot.z.toFixed(1)] : null, transit: n.citizen?.transit ? { from: n.citizen.transit.from?.line, to: n.citizen.transit.to?.line, bus: n.citizen.transit.bus?.lineId ?? null, t: +(n.citizen.transitT || 0).toFixed(1) } : null, plazaVisits: n.citizen?.plazaVisits || 0, home: n.home && [+n.home.x.toFixed(1), +n.home.z.toFixed(1)],
        homePos: n.home && [n.home.x, n.home.z], work: n.work?.label, workPos: n.work && [n.work.x, n.work.z], path: n.citizen?.path.length || 0, index: n.citizen?.pathIndex || 0, maxStep: +(n.citizen?.maxStep || 0).toFixed(2),
        pos: [+n.g.position.x.toFixed(1), +n.g.position.z.toFixed(1)]
      })),
      unsafe: unsafePaths()
    };
  }

  function attachBusinesses(api) { business = api; }
  function attachTraffic(api) { traffic = api; }
  return { initialize, updateNpc, updateAll, serialize, restore, simulate, setClock, debug, attachInteriors, attachBusinesses, attachTraffic, setWeather, homeDoors, chooseShop, transitRoute };
}
