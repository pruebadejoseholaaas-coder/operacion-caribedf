import test from 'node:test';
import assert from 'node:assert/strict';
import { LOT_BOUNDS, LOT_CENTER, LOT_GATE, LOT_FEATURES, lotContains, lotHeightAt } from '../src/tropicalLot.js';

test('el solar está dentro del mapa y tiene una puerta en el borde norte', () => {
  assert.ok(LOT_BOUNDS.x0 < LOT_BOUNDS.x1);
  assert.ok(LOT_BOUNDS.z0 < LOT_BOUNDS.z1);
  assert.ok(LOT_CENTER.x > LOT_BOUNDS.x0 && LOT_CENTER.x < LOT_BOUNDS.x1);
  assert.equal(LOT_GATE.z, LOT_BOUNDS.z1);
  assert.ok(LOT_GATE.x0 > LOT_BOUNDS.x0 && LOT_GATE.x1 < LOT_BOUNDS.x1);
});

test('el terreno tiene alturas suaves y devuelve cero fuera del solar', () => {
  assert.equal(lotHeightAt(0, 0), 0);
  assert.equal(lotHeightAt(LOT_BOUNDS.x0 - 1, LOT_CENTER.z), 0);
  assert.ok(lotContains(LOT_CENTER.x, LOT_CENTER.z));
  let max = 0, min = Infinity;
  for (let x = LOT_BOUNDS.x0 + 2; x < LOT_BOUNDS.x1 - 2; x += 5) {
    for (let z = LOT_BOUNDS.z0 + 2; z < LOT_BOUNDS.z1 - 2; z += 5) {
      const h = lotHeightAt(x, z); max = Math.max(max, h); min = Math.min(min, h);
    }
  }
  assert.ok(max > .05, 'debe haber desniveles');
  assert.ok(max < .6, 'los desniveles deben ser pequeños');
  assert.ok(min >= 0);
});

test('la zanja, el árbol y las palmeras están dentro del solar', () => {
  assert.ok(lotContains(LOT_FEATURES.bigTree.x, LOT_FEATURES.bigTree.z));
  assert.ok(lotContains(LOT_FEATURES.ditch.x, LOT_FEATURES.ditch.z));
  for (const [x, z] of LOT_FEATURES.palms) assert.ok(lotContains(x, z));
});
