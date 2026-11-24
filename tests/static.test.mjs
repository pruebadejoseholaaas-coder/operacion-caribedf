import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('el catálogo de tráfico conserva al menos 50 vehículos', () => {
  const traffic = read('src/traffic.js');
  const match = traffic.match(/const CATALOG\s*=\s*\[([\s\S]*?)\n\]\.map/);
  assert.ok(match, 'No se encontró CATALOG');
  const count = (match[1].match(/\['[^']*','/g) || []).length;
  assert.ok(count >= 50, `Solo hay ${count} vehículos`);
});

test('los sistemas de interiores, comercios y transporte exponen sus APIs', () => {
  const interiors = read('src/interiors.js');
  const businesses = read('src/businesses.js');
  const citizens = read('src/citizens.js');
  for (const fn of ['enterNpcHome', 'enterNpcWork', 'enterNpcCustomer', 'leaveNpcCustomer', 'exitNpc']) assert.match(interiors, new RegExp(fn));
  for (const fn of ['joinQueue', 'leaveQueue', 'serveCustomer', 'recordSale', 'availableFor']) assert.match(businesses, new RegExp(fn));
  for (const fn of ['updateAll', 'transitRoute', 'chooseShop', 'setWeather']) assert.match(citizens, new RegExp(fn));
});

test('la documentación y la versión no contradicen el estado actual', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.version, '0.8.0');
  assert.match(read('README.md'), /prototipo 0\.8/);
  assert.match(read('OPERACION_CARIBE_PROGRESS.md'), /Séptimo bloque/);
});
