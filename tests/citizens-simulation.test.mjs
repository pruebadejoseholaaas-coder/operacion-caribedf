import test from 'node:test';
import assert from 'node:assert/strict';
import { createCitizenSystem } from '../src/citizens.js';

function vec(x, z) {
  return { x, y: 0, z, set(a, b, c) { this.x = a; this.y = b; this.z = c; } };
}

function fakeGraph() {
  const nodes = [0, 40, 80, 120].map((x, i) => ({ k: 'n' + i, x, z: 0, edges: [], degree: 2 }));
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i + 1];
    const len = b.x - a.x;
    a.edges.push({ a: a.k, b: b.k, ax: a.x, az: 0, bx: b.x, bz: 0, len, width: 6, dx: 1, dz: 0 });
    b.edges.push({ a: b.k, b: a.k, ax: b.x, az: 0, bx: a.x, bz: 0, len, width: 6, dx: -1, dz: 0 });
  }
  return { nodes: new Map(nodes.map(n => [n.k, n])) };
}

function fakeNpc(name, occupation) {
  return {
    name, occupation, shiftStart: 6, shiftEnd: 7, sleepStart: 22, sleepEnd: 6,
    personality: 'amable', social: .5, trust: 0, pause: 0, t: 0,
    g: { position: vec(20, 0), rotation: { x: 0, y: 0, z: 0 }, visible: true }
  };
}

function fakeShop(id, x, products) {
  return {
    data: { id, name: id, open: 6, close: 23, products },
    g: { position: { x, z: 0 }, rotation: { y: 0 } },
    stock: products.map(() => 3), sales: 0, visits: 0, actualStaff: 1, queue: [], preference: 'food'
  };
}

function fakeSystems(shop) {
  const interiors = {
    workFor: () => null,
    npcVisible: () => true,
    shopRecord: () => ({ door: { x: shop.g.position.x, z: 0 } }),
    enterNpcCustomer: (n) => { n.citizen.inside = 'shop-' + shop.data.id; n.citizen.insideKind = 'shopCustomer'; n.citizen.insideTarget = 'queue'; return true; },
    leaveNpcCustomer: (n) => { n.citizen.insideTarget = 'exit'; return true; },
    moveNpc: () => true,
    exitNpc: (n) => { n.citizen.inside = null; n.citizen.insideKind = null; return true; },
    enterNpcHome: (n) => { n.citizen.inside = 'home-0'; n.citizen.insideKind = 'home'; return true; },
    enterNpcWork: (n) => { n.citizen.inside = 'shop-' + shop.data.id; n.citizen.insideKind = 'shop'; return true; }
  };
  const business = {
    shopById: (id) => id === shop.data.id ? shop : null,
    availableFor: () => [shop],
    joinQueue: (s, npc) => { s.queue.push({ npc, index: 0 }); return { spot: { x: 40, z: 0 } }; },
    leaveQueue: (s, npc) => { s.queue = s.queue.filter(q => q.npc !== npc); },
    isFirst: (s, npc) => s.queue[0]?.npc === npc,
    serveCustomer: (s, npc) => {
      if (!s.queue[0] || s.queue[0].npc !== npc || !s.actualStaff || !s.stock[0]) return null;
      s.stock[0]--; s.sales++;
      return { name: s.data.products[0][0], price: s.data.products[0][1] };
    }
  };
  return { interiors, business };
}

test('un NPC simulado entra, hace cola, compra y sale', () => {
  const work = fakeShop('panaderia', 0, [['Pan', 20]]);
  const buy = fakeShop('colmado', 40, [['Arroz', 35], ['Habichuelas', 65]]);
  const npc = fakeNpc('Ana', 'estudiante'); npc.shiftStart = 20; npc.shiftEnd = 21;
  const { interiors, business } = fakeSystems(buy);
  const c = createCitizenSystem({ npcs: [npc], graph: fakeGraph(), shops: [work, buy], buildings: [], spawn: { x: 0, z: 0 }, interiors, businesses: business });
  c.initialize(14 * 3600);
  Object.assign(npc.citizen, { state: 'leisureIdle', idleT: .2, shopCooldown: 0, inside: null, insideKind: null });
  npc.g.position.set(20, 0, 0);
  const oldRandom = Math.random;
  Math.random = () => .1;
  try {
    for (let i = 0; i < 240; i++) c.simulate(.5);
  } finally {
    Math.random = oldRandom;
  }
  if (buy.sales !== 1) console.log(JSON.stringify({sales:buy.sales,state:{state:npc.citizen.state,pathIndex:npc.citizen.pathIndex,pathKind:npc.citizen.pathKind,pause:npc.pause,inside:npc.citizen.inside,shopId:npc.citizen.shopId},queue:buy.queue,pos:[npc.g.position.x,npc.g.position.z],inWork:npc.work,shopG:buy.g.position},null,1));
  assert.equal(buy.sales, 1, 'debe registrar una compra');
  assert.equal(npc.citizen.lastPurchase, 'Arroz');
  assert.equal(npc.citizen.inside, null, 'debe salir del comercio');
  assert.ok(!['toShop', 'shopping', 'leavingShop'].includes(npc.citizen.state), 'no debe quedar atrapado comprando');
});

test('un NPC aborda solo la guagua de su línea y baja en la parada destino', () => {
  const shop = fakeShop('panaderia', 0, [['Pan', 20]]);
  const npc = fakeNpc('Luis', 'estudiante');
  const { interiors, business } = fakeSystems(shop);
  const stops = [
    { name: 'Origen', x: 20, z: 0, lineId: 0, line: 'Ruta 1', node: 'n0', nextBus: 2, ox: 0, oz: 1, busy: null },
    { name: 'Destino', x: 80, z: 0, lineId: 0, line: 'Ruta 1', node: 'n2', nextBus: 2, ox: 0, oz: 1, busy: null }
  ];
  const wrongBus = { lineId: 1, line: 'Ruta 2', lastStop: stops[0], x: 20, z: 0, g: { position: vec(20, 0), visible: true }, model: { kind: 'bus' } };
  const rightBus = { lineId: 0, line: 'Ruta 1', lastStop: stops[0], x: 20, z: 0, g: { position: vec(20, 0), visible: true }, model: { kind: 'bus' } };
  const traffic = { stops, vehicles: [wrongBus] };
  const c = createCitizenSystem({ npcs: [npc], graph: fakeGraph(), shops: [shop], buildings: [], spawn: { x: 0, z: 0 }, interiors, businesses: business, traffic });
  c.initialize(14 * 3600);
  const route = c.transitRoute({ x: 20, z: 0 }, { x: 80, z: 0 });
  assert.ok(route && route.from !== route.to, 'debe encontrar dos paradas distintas de la misma línea');
  Object.assign(npc.citizen, { state: 'waitingBus', transit: route, transitWait: 2, transitT: 0, path: [], pathKind: null });
  c.simulate(.5);
  assert.equal(npc.citizen.state, 'waitingBus', 'no debe abordar una guagua de otra línea');

  traffic.vehicles = [rightBus];
  c.simulate(.5);
  assert.equal(npc.citizen.state, 'ridingBus', 'debe abordar la guagua de su línea');
  assert.equal(npc.g.visible, false, 'el pasajero viaja oculto dentro de la guagua');

  rightBus.lastStop = stops[1]; rightBus.x = 80; rightBus.g.position.set(80, 0, 0);
  c.simulate(.5);
  assert.notEqual(npc.citizen.state, 'ridingBus', 'debe bajar al llegar a su parada');
  assert.equal(npc.g.visible, true, 'debe reaparecer en la parada destino');
  assert.equal(npc.citizen.transit, null);
});

test('sin ruta compatible el NPC vuelve a caminar en lugar de simular un viaje', () => {
  const shop = fakeShop('panaderia', 0, [['Pan', 20]]);
  const npc = fakeNpc('Ana', 'estudiante');
  const { interiors, business } = fakeSystems(shop);
  const stops = [
    { name: 'A', x: 20, z: 0, lineId: 0, line: 'Ruta 1', node: 'n0', ox: 0, oz: 1 },
    { name: 'B', x: 80, z: 0, lineId: 1, line: 'Ruta 2', node: 'n2', ox: 0, oz: 1 }
  ];
  const c = createCitizenSystem({ npcs: [npc], graph: fakeGraph(), shops: [shop], buildings: [], spawn: { x: 0, z: 0 }, interiors, businesses: business, traffic: { stops, vehicles: [] } });
  c.initialize(14 * 3600);
  assert.equal(c.transitRoute({ x: 20, z: 0 }, { x: 80, z: 0 }), null, 'paradas de líneas distintas no forman ruta');
});

test('sin guagua el NPC espera y luego camina, sin teletransportarse al destino', () => {
  const shop = fakeShop('panaderia', 0, [['Pan', 20]]);
  const npc = fakeNpc('Rosa', 'estudiante');
  const { interiors, business } = fakeSystems(shop);
  const stops = [
    { name: 'Origen', x: 20, z: 0, lineId: 0, line: 'Ruta 1', node: 'n0', ox: 0, oz: 1 },
    { name: 'Destino', x: 80, z: 0, lineId: 0, line: 'Ruta 1', node: 'n2', ox: 0, oz: 1 }
  ];
  const c = createCitizenSystem({ npcs: [npc], graph: fakeGraph(), shops: [shop], buildings: [], spawn: { x: 0, z: 0 }, interiors, businesses: business, traffic: { stops, vehicles: [] } });
  c.initialize(14 * 3600);
  const route = c.transitRoute({ x: 20, z: 0 }, { x: 80, z: 0 });
  Object.assign(npc.citizen, { state: 'waitingBus', transit: route, transitWait: 2, transitT: 0, path: [], pathKind: null });
  c.simulate(40);
  assert.notEqual(npc.citizen.state, 'ridingBus');
  assert.ok(Math.abs(npc.g.position.x - 80) > 40, 'no debe aparecer en el destino sin una guagua real');
});
