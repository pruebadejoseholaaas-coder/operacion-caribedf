// Trabajos por turnos y encargos. Reutiliza los comercios, el teléfono, el dinero
// y el marcador del minimapa. Un turno se compone de: viaje al lugar de trabajo,
// trabajo con una tarea interactiva y cobro en pesos dominicanos.
const SHIFT_DEFS = {
  colmado: {
    label: 'Turno en el colmado', where: ['colmado', 'ventorrillo'],
    duration: 110, base: 180, goal: 4, per: 45, verb: 'Atiende a los clientes'
  },
  reparto: {
    label: 'Turno de reparto', where: ['colmado'],
    duration: 150, base: 200, goal: 3, per: 85, verb: 'Entrega los paquetes'
  },
  taller: {
    label: 'Turno en el taller', where: ['taller-autos', 'taller-motos', 'repuestos-motos'],
    duration: 120, base: 220, goal: 4, per: 60, verb: 'Repara los vehículos'
  }
};

export function createJobSystem(T, scene, opts) {
  const shops = opts.shops;
  const player = opts.player;
  const addCash = opts.addCash;
  const save = opts.save;
  const ui = () => opts.ui();
  const missionEl = () => opts.mission();

  const mats = new Map();
  const mat = c => { if (!mats.has(c)) mats.set(c, new T.MeshLambertMaterial({ color: c })); return mats.get(c); };
  const box = (parent, w, h, d, c, x, y, z) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat(c));
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const person = (shirt) => {
    const g = new T.Group();
    const body = new T.Mesh(new T.BoxGeometry(.5, .8, .3), mat(shirt)); body.position.y = 1.12; g.add(body);
    const head = new T.Mesh(new T.SphereGeometry(.18, 8, 6), mat(0x9a684b)); head.position.y = 1.66; g.add(head);
    for (const x of [-.14, .14]) { const leg = new T.Mesh(new T.BoxGeometry(.18, .6, .2), mat(0x2b3a55)); leg.position.set(x, .37, 0); g.add(leg); }
    return g;
  };

  const marker = new T.Group();
  const ring = new T.Mesh(new T.TorusGeometry(1.25, .13, 8, 26), new T.MeshBasicMaterial({ color: 0xf4a261 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .2; marker.add(ring);
  const beam = new T.Mesh(new T.CylinderGeometry(.09, .09, 7, 8), new T.MeshBasicMaterial({ color: 0xf4a261, transparent: true, opacity: .45 }));
  beam.position.y = 3.5; marker.add(beam);
  marker.visible = false; scene.add(marker);

  const deliveryMark = new T.Group();
  const dRing = new T.Mesh(new T.TorusGeometry(2.2, .15, 8, 26), new T.MeshBasicMaterial({ color: 0x4fb3ff }));
  dRing.rotation.x = -Math.PI / 2; dRing.position.y = .2; deliveryMark.add(dRing);
  const dBeam = new T.Mesh(new T.CylinderGeometry(.08, .08, 6, 8), new T.MeshBasicMaterial({ color: 0x4fb3ff, transparent: true, opacity: .45 }));
  dBeam.position.y = 3; deliveryMark.add(dBeam);
  deliveryMark.visible = false; scene.add(deliveryMark);

  const customer = person(0x3b6e87); customer.visible = false; scene.add(customer);
  const car = new T.Group();
  box(car, 1.7, .5, 3.4, 0x2f5f8a, 0, .55, 0);
  box(car, 1.5, .45, 1.6, 0x244a6b, 0, .98, -.15);
  for (const [x, z] of [[-.85, 1.1], [.85, 1.1], [-.85, -1.1], [.85, -1.1]]) {
    const w = new T.Mesh(new T.CylinderGeometry(.3, .3, .22, 10), mat(0x1d1f22));
    w.rotation.z = Math.PI / 2; w.position.set(x, .3, z); car.add(w);
  }
  car.visible = false; scene.add(car);

  let delivery = null;
  let shift = null;
  const progress = { done: 0, rep: 0 };
  let clockTick = 0;

  function doorOf(shop) {
    const r = shop.g.rotation.y;
    return { x: shop.g.position.x + Math.sin(r) * 4.1, z: shop.g.position.z + Math.cos(r) * 4.1 };
  }
  function nearest(list, pos) {
    let best = null, bestD = Infinity;
    for (const s of list) {
      const d = doorOf(s), dist = Math.hypot(d.x - pos.x, d.z - pos.z);
      if (dist < bestD) { bestD = dist; best = s; }
    }
    return best;
  }
  function setMarker(x, z, color) {
    marker.position.set(x, 0, z);
    ring.material.color.setHex(color); beam.material.color.setHex(color);
    marker.visible = true;
  }
  function hideMarker() { marker.visible = false; }
  function setDeliveryMarker(x, z) { deliveryMark.position.set(x, 0, z); deliveryMark.visible = !!x; }
  const mmss = s => Math.max(0, Math.floor(s / 60)) + ':' + String(Math.max(0, Math.floor(s % 60))).padStart(2, '0');

  function cancelDelivery() {
    if (!delivery) return;
    delivery = null; setDeliveryMarker(0, 0); save(); ui()?.toast('Encargo cancelado');
  }

  function startDelivery() {
    if (shift) { ui()?.toast('Termina o cancela el turno antes de aceptar un encargo'); return; }
    if (delivery) { ui()?.toast('Ya tienes un encargo activo'); return; }
    const p = player().g.position;
    const options = shops().filter(s => {
      if (!s.open) return false;
      const d = doorOf(s), dist = Math.hypot(d.x - p.x, d.z - p.z);
      return dist > 70 && dist < 280;
    });
    if (!options.length) { ui()?.toast('No hay encargos disponibles ahora mismo'); return; }
    const shop = options[Math.floor(Math.random() * options.length)];
    const d = doorOf(shop);
    const dist = Math.hypot(d.x - p.x, d.z - p.z);
    delivery = { shop, x: d.x, z: d.z, reward: Math.round(180 + dist * .9) };
    setDeliveryMarker(d.x, d.z);
    save();
    ui()?.toast('Encargo aceptado: ' + shop.data.name + ' · Pago RD$ ' + delivery.reward, 3800);
  }

  function offers() {
    const p = player().g.position;
    return Object.entries(SHIFT_DEFS).map(([type, def]) => {
      const shop = nearest(shops().filter(s => def.where.includes(s.data.id)), p);
      const pay = Math.round(def.base + def.goal * def.per);
      return { type, label: def.label, verb: def.verb, pay, where: shop ? shop.data.name : '—', open: shop ? shop.open : false, distance: shop ? Math.round(Math.hypot(doorOf(shop).x - p.x, doorOf(shop).z - p.z)) : 0 };
    });
  }

  function startShift(type) {
    const def = SHIFT_DEFS[type];
    if (!def) return;
    if (shift) { ui()?.toast('Ya tienes un turno activo'); return; }
    if (delivery) cancelDelivery();
    const p = player().g.position;
    const shop = nearest(shops().filter(s => def.where.includes(s.data.id)), p);
    if (!shop) { ui()?.toast('No hay trabajo disponible de ese tipo'); return; }
    if (!shop.open) { ui()?.toast(shop.data.name + ' está cerrado ahora. Vuelve en su horario.'); return; }
    const d = doorOf(shop);
    shift = {
      type, def, shop, x: d.x, z: d.z, phase: 'travel',
      timeLeft: def.duration, duration: def.duration,
      served: 0, goal: def.goal, spawnT: 1.2, cool: 0,
      customer: false, targets: null, ti: 0
    };
    if (type === 'reparto') {
      const others = shops().filter(s => s !== shop && s.open);
      const pool = others.filter(s => {
        const q = doorOf(s), dist = Math.hypot(q.x - p.x, q.z - p.z);
        return dist > 45 && dist < 260;
      });
      const picked = [];
      const used = new Set();
      while (picked.length < 3 && pool.length) {
        const i = Math.floor(Math.random() * pool.length);
        const s = pool.splice(i, 1)[0];
        if (used.has(s)) continue;
        used.add(s); picked.push({ shop: s, ...doorOf(s) });
      }
      shift.targets = picked;
    }
    setMarker(shift.x, shift.z, 0xf4a261);
    save();
    ui()?.toast(def.label + ' · Ve a ' + shop.data.name + ' y pulsa E', 4200);
  }

  function spawnCustomer() {
    if (!shift) return;
    const r = shift.shop.g.rotation.y;
    const x = shift.x + Math.sin(r) * 1.5, z = shift.z + Math.cos(r) * 1.5;
    customer.position.set(x, 0, z);
    customer.rotation.y = r + Math.PI;
    customer.visible = true;
    shift.customer = true;
    shift.cx = x; shift.cz = z;
    setMarker(x, z, 0x7fe0a8);
  }

  function startWork() {
    shift.phase = 'work';
    shift.timeLeft = shift.duration;
    if (shift.type === 'colmado') { shift.spawnT = .8; }
    if (shift.type === 'taller') {
      const r = shift.shop.g.rotation.y;
      const x = shift.x + Math.sin(r) * 1.4, z = shift.z + Math.cos(r) * 1.4;
      car.position.set(x, 0, z); car.rotation.y = r + Math.PI / 2; car.visible = true;
      shift.task = { x, z };
      setMarker(x, z, 0x7fe0a8);
    }
    if (shift.type === 'reparto') {
      const t = shift.targets[0];
      if (!t) { finishShift(false); return; }
      setMarker(t.x, t.z, 0x7fe0a8);
    }
    ui()?.toast(shift.def.verb + ' · ' + mmss(shift.timeLeft), 3200);
  }

  function serveCustomer() {
    if (!shift || shift.type !== 'colmado' || !shift.customer) return;
    shift.customer = false; customer.visible = false;
    shift.served++;
    shift.spawnT = 2.2;
    ui()?.toast('Cliente atendido · ' + shift.served + '/' + shift.goal, 1800);
    if (shift.served >= shift.goal) finishShift(true);
    else hideMarker();
  }

  function repairCar() {
    if (!shift || shift.type !== 'taller' || shift.cool > 0) return;
    shift.cool = 1.1;
    shift.served++;
    ui()?.toast('Reparación ' + shift.served + '/' + shift.goal, 1600);
    if (shift.served >= shift.goal) finishShift(true);
  }

  function deliverPackage() {
    if (!shift || shift.type !== 'reparto') return;
    shift.served++;
    shift.ti++;
    ui()?.toast('Paquete entregado · ' + shift.served + '/' + shift.goal, 1800);
    if (shift.ti >= shift.targets.length || shift.served >= shift.goal) { finishShift(true); return; }
    const t = shift.targets[shift.ti];
    setMarker(t.x, t.z, 0x7fe0a8);
  }

  function clearShiftProps() {
    customer.visible = false; car.visible = false;
    if (shift) { shift.customer = false; }
  }

  function finishShift(completed) {
    if (!shift) return;
    const s = shift;
    const earned = s.served * s.def.per + Math.round(s.def.base * (completed ? 1 : Math.min(1, s.served / s.goal) * .6));
    const pay = Math.round(earned * (1 + progress.rep / 200));
    addCash(pay);
    progress.done++;
    progress.rep = Math.min(100, progress.rep + (completed ? 4 : 1));
    ui()?.toast((completed ? 'Turno completado' : 'Turno terminado') + ' · +RD$ ' + pay + ' · Reputación ' + progress.rep, 4200);
    shift = null;
    hideMarker(); clearShiftProps();
    save();
  }

  function cancelShift() {
    if (!shift) return;
    shift = null; hideMarker(); clearShiftProps();
    save();
    ui()?.toast('Turno cancelado sin pago');
  }

  function interact() {
    if (!shift) return false;
    const p = player().g.position;
    if (shift.phase === 'travel') {
      if (Math.hypot(p.x - shift.x, p.z - shift.z) < 8) { startWork(); return true; }
      return false;
    }
    if (shift.type === 'colmado' && shift.customer && Math.hypot(p.x - shift.cx, p.z - shift.cz) < 3.4) { serveCustomer(); return true; }
    if (shift.type === 'taller' && shift.task && Math.hypot(p.x - shift.task.x, p.z - shift.task.z) < 4.2) { repairCar(); return true; }
    if (shift.type === 'reparto') {
      const t = shift.targets[shift.ti];
      if (t && Math.hypot(p.x - t.x, p.z - t.z) < 7) { deliverPackage(); return true; }
    }
    return false;
  }

  function hint() {
    if (!shift) return null;
    const p = player().g.position;
    if (shift.phase === 'travel') {
      return Math.hypot(p.x - shift.x, p.z - shift.z) < 8 ? 'E para empezar el turno' : null;
    }
    if (shift.type === 'colmado' && shift.customer && Math.hypot(p.x - shift.cx, p.z - shift.cz) < 3.4) return 'E para atender al cliente';
    if (shift.type === 'taller' && shift.task && Math.hypot(p.x - shift.task.x, p.z - shift.task.z) < 4.2) return 'E para reparar el vehículo';
    if (shift.type === 'reparto') {
      const t = shift.targets[shift.ti];
      if (t && Math.hypot(p.x - t.x, p.z - t.z) < 7) return 'E para entregar el paquete';
    }
    return null;
  }

  function serialize() {
    if (delivery) return { kind: 'delivery', shopId: delivery.shop.data.id, reward: delivery.reward };
    if (shift) return {
      kind: 'shift', type: shift.type, shopId: shift.shop.data.id, phase: shift.phase,
      timeLeft: shift.timeLeft, duration: shift.duration, served: shift.served, goal: shift.goal,
      spawnT: shift.spawnT, cool: shift.cool, ti: shift.ti,
      targets: shift.targets ? shift.targets.map(t => t.shop.data.id) : null
    };
    return null;
  }

  function restore(state) {
    if (!state) return;
    if (state.kind === 'delivery') {
      const shop = shops().find(s => s.data.id === state.shopId);
      if (!shop) return;
      const d = doorOf(shop);
      delivery = { shop, x: d.x, z: d.z, reward: state.reward || 0 };
      setDeliveryMarker(d.x, d.z);
      return;
    }
    if (state.kind !== 'shift') return;
    const def = SHIFT_DEFS[state.type];
    const shop = shops().find(s => s.data.id === state.shopId);
    if (!def || !shop) return;
    const d = doorOf(shop);
    shift = {
      type: state.type, def, shop, x: d.x, z: d.z,
      phase: state.phase === 'work' ? 'work' : 'travel',
      timeLeft: Math.max(0, Number(state.timeLeft) || def.duration),
      duration: Number(state.duration) || def.duration,
      served: Math.max(0, state.served | 0), goal: Math.max(1, state.goal | 0 || def.goal),
      spawnT: Number.isFinite(state.spawnT) ? state.spawnT : 1.2,
      cool: Math.max(0, Number(state.cool) || 0),
      customer: false, targets: null, ti: Math.max(0, state.ti | 0)
    };
    if (Array.isArray(state.targets)) {
      shift.targets = state.targets.map(id => {
        const t = shops().find(x => x.data.id === id);
        return t ? { shop: t, ...doorOf(t) } : null;
      }).filter(Boolean);
    }
    if (shift.phase === 'work') {
      if (shift.type === 'taller') {
        const r = shift.shop.g.rotation.y;
        const x = shift.x + Math.sin(r) * 1.4, z = shift.z + Math.cos(r) * 1.4;
        car.position.set(x, 0, z); car.rotation.y = r + Math.PI / 2; car.visible = true;
        shift.task = { x, z }; setMarker(x, z, 0x7fe0a8);
      } else if (shift.type === 'reparto') {
        const t = shift.targets && shift.targets[shift.ti];
        if (t) setMarker(t.x, t.z, 0x7fe0a8);
      }
    } else setMarker(shift.x, shift.z, 0xf4a261);
  }

  function addRep(n) {
    progress.rep = Math.min(100, progress.rep + Math.max(0, n | 0));
    save();
    return progress.rep;
  }

  function missionText() {
    if (shift) {
      if (shift.phase === 'travel') {
        const p = player().g.position;
        return shift.def.label + ': ve a ' + shift.shop.data.name + ' · ' + Math.round(Math.hypot(p.x - shift.x, p.z - shift.z)) + ' m';
      }
      return shift.def.label + ' · ' + mmss(shift.timeLeft) + ' · ' + shift.served + '/' + shift.goal;
    }
    if (delivery) {
      const p = player().g.position;
      return 'Encargo: entrega en ' + delivery.shop.data.name + ' · ' + Math.round(Math.hypot(p.x - delivery.x, p.z - delivery.z)) + ' m';
    }
    return null;
  }

  function update(dt) {
    clockTick += dt;
    if (delivery) {
      const p = player().g.position;
      if (Math.hypot(p.x - delivery.x, p.z - delivery.z) < 7) {
        addCash(delivery.reward);
        progress.done++;
        progress.rep = Math.min(100, progress.rep + 1);
        ui()?.toast('Encargo entregado · +RD$ ' + delivery.reward, 3600);
        delivery = null; setDeliveryMarker(0, 0); save();
      }
    }
    if (shift) {
      if (shift.phase === 'work') {
        shift.timeLeft = Math.max(0, shift.timeLeft - dt);
        shift.cool = Math.max(0, shift.cool - dt);
        if (shift.type === 'colmado' && !shift.customer && shift.served < shift.goal) {
          shift.spawnT -= dt;
          if (shift.spawnT <= 0) spawnCustomer();
        }
        if (shift.timeLeft <= 0) finishShift(false);
      }
      if (shift) {
        ring.rotation.z += dt * 1.4;
        const pulse = 1 + .08 * Math.sin(clockTick * 3);
        marker.scale.setScalar(pulse);
      }
    }
    dRing.rotation.z += dt * .9;
  }

  function shiftSummary() {
    if (!shift) return null;
    return {
      kind: 'shift', type: shift.type, name: shift.def.label, detail: shift.def.verb,
      time: mmss(shift.timeLeft), served: shift.served, goal: shift.goal,
      phase: shift.phase, where: shift.shop.data.name, pay: shift.served * shift.def.per
    };
  }
  function deliverySummary() {
    return delivery ? { kind: 'delivery', name: delivery.shop.data.name, reward: delivery.reward } : null;
  }

  return {
    update, interact, hint, missionText, offers, startShift, cancelShift, startDelivery, cancelDelivery, serialize, restore, addRep,
    shiftSummary, deliverySummary, progress: () => ({ ...progress }),
    setProgress: (done, rep) => { progress.done = Math.max(0, done | 0); progress.rep = Math.max(0, Math.min(100, rep | 0)); },
    deliveryMarker: () => delivery ? { x: delivery.x, z: delivery.z } : null,
    shiftMarker: () => shift ? { x: marker.position.x, z: marker.position.z, color: shift.phase === 'travel' ? 0xf4a261 : 0x7fe0a8 } : null
  };
}
