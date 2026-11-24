import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLines, firstEdgeToward, lineIndexFor, nextStopInLine, pickDestination, stopLabel } from '../src/transit.js';

const stops = [
  { name: 'Parada 1', line: 'Ruta Colonial', lineId: 0, node: 'a' },
  { name: 'Parada 2', line: 'Ruta Colonial', lineId: 0, node: 'b' },
  { name: 'Parada 3', line: 'Ruta Colonial', lineId: 0, node: 'c' },
  { name: 'Parada 4', line: 'Ruta Universitaria', lineId: 1, node: 'd' }
];

test('agrupa paradas en rutas con frecuencia y color', () => {
  const lines = buildLines(stops);
  assert.equal(lines.length, 2);
  assert.equal(lines[0].name, 'Ruta Colonial');
  assert.equal(lines[0].stops.length, 3);
  assert.ok(lines[0].frequency > 0);
  assert.ok(lines[0].color > 0);
  assert.equal(lineIndexFor(5), 2);
});

test('la parada siguiente pertenece a la misma ruta y no se repite', () => {
  const next = nextStopInLine(stops, stops[0]);
  assert.equal(next, stops[1]);
  assert.equal(next.line, stops[0].line);
  assert.notEqual(next, stops[0]);
  assert.equal(nextStopInLine(stops, stops[2]), stops[0], 'la ruta vuelve al inicio');
});

test('el destino de un pasajero es otra parada de su misma ruta', () => {
  const dest = pickDestination(stops, stops[0], () => .99);
  assert.ok(dest);
  assert.notEqual(dest, stops[0]);
  assert.equal(dest.line, 'Ruta Colonial');
  assert.equal(pickDestination([stops[3]], stops[3]), null, 'sin otra parada no hay destino');
  assert.match(stopLabel(stops[0]), /Parada 1 · Ruta Colonial/);
});

test('encuentra la primera arista hacia una parada en el grafo', () => {
  const a = { k: 'a', edges: [{ b: 'b' }, { b: 'x' }] };
  const b = { k: 'b', edges: [{ b: 'a' }, { b: 'c' }] };
  const c = { k: 'c', edges: [{ b: 'b' }] };
  const x = { k: 'x', edges: [{ b: 'a' }] };
  const graph = { nodes: new Map([['a', a], ['b', b], ['c', c], ['x', x]]) };
  assert.equal(firstEdgeToward(graph, a, c), a.edges[0]);
  assert.equal(firstEdgeToward(graph, a, a), null);
  const y = { k: 'y', edges: [] };
  graph.nodes.set('y', y);
  assert.equal(firstEdgeToward(graph, y, c), null);
});
