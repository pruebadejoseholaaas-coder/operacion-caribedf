import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAZA_CENTER, PLAZA_SIZE, KIOSK } from '../src/barrio.js';

test('la plaza está en un solar urbano accesible, no en el antiguo borde aislado', () => {
  assert.ok(PLAZA_CENTER.x > -200 && PLAZA_CENTER.x < 200);
  assert.ok(PLAZA_CENTER.z > -200 && PLAZA_CENTER.z < 200);
  assert.ok(PLAZA_SIZE.w >= 20 && PLAZA_SIZE.d >= 12);
  assert.ok(Math.hypot(KIOSK.x - PLAZA_CENTER.x, KIOSK.z - PLAZA_CENTER.z) < 40);
});
