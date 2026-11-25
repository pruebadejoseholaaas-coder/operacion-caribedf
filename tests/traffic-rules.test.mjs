import test from 'node:test';
import assert from 'node:assert/strict';
import { pedestrianAhead, pedestrianTarget } from '../src/trafficRules.js';

const npc = (x, z, visible = true) => ({ g: { visible, position: { x, z } } });

test('detecta un peatón delante y dentro del ancho de la vía', () => {
  const hit = pedestrianAhead(0, 0, 1, 0, [npc(5, 0)]);
  assert.ok(hit);
  assert.equal(hit.forward, 5);
  assert.equal(pedestrianTarget(hit.forward), (5 - 2.2) * 1.1);
});

test('ignora peatones detrás, ocultos o fuera del carril', () => {
  assert.equal(pedestrianAhead(0, 0, 1, 0, [npc(-5, 0)]), null);
  assert.equal(pedestrianAhead(0, 0, 1, 0, [npc(5, 0, false)]), null);
  assert.equal(pedestrianAhead(0, 0, 1, 0, [npc(5, 4)]), null);
});

test('elige el peatón más cercano que está delante', () => {
  const hit = pedestrianAhead(0, 0, 1, 0, [npc(8, 0), npc(4, .5), npc(2, 0)]);
  assert.equal(hit.forward, 2);
  assert.equal(pedestrianTarget(1), 0);
});
