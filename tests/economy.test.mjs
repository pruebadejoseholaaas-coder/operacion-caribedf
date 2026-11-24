import test from 'node:test';
import assert from 'node:assert/strict';
import { shopPreference, demandAt, queueLocal, queueWorld, saleCost, productIndexFor } from '../src/economy.js';

test('clasifica los comercios por tipo de consumo', () => {
  assert.equal(shopPreference({ id: 'colmado' }), 'food');
  assert.equal(shopPreference({ id: 'barberia' }), 'service');
  assert.equal(shopPreference({ id: 'ferreteria' }), 'goods');
});

test('la demanda cambia por hora y tipo de comercio', () => {
  assert.ok(demandAt(7, 'food') < demandAt(15, 'food'));
  assert.ok(demandAt(10, 'service') < demandAt(21, 'service'));
  assert.ok(demandAt(10, 'goods') < demandAt(2, 'goods'));
});

test('las posiciones de cola son únicas y se transforman al mundo', () => {
  const seen = new Set();
  for (let i = 0; i < 6; i++) {
    const [x, z] = queueLocal(i);
    assert.ok(!seen.has(`${x},${z}`));
    seen.add(`${x},${z}`);
  }
  const shop = { g: { position: { x: 10, z: 20 }, rotation: { y: 0 } } };
  const p = queueWorld(shop, 0);
  assert.ok(Number.isFinite(p.x) && Number.isFinite(p.z));
  assert.ok(Math.abs(p.x - 9) < 1e-9);
});

test('las compras descuentan existencias y generan costo', () => {
  assert.equal(saleCost(100), 55);
  const stock = [0, 2, 0, 1];
  const picked = productIndexFor(stock, 'food', () => .99);
  assert.ok([1, 3].includes(picked));
  assert.equal(productIndexFor([0, 0], 'food', () => 0), -1);
});
