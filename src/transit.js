// Datos y reglas puras del transporte público. Se separan del render para
// poder probar rutas, destinos y frecuencias sin WebGL.
export const LINE_NAMES = ['Ruta Colonial', 'Ruta Universitaria', 'Ruta Malecón'];
export const LINE_COLORS = [0x1f6f9c, 0x2a9d8f, 0xc8553d];
export const LINE_FREQUENCIES = [38, 46, 54];

export function lineIndexFor(stopIndex) {
  return ((stopIndex % LINE_NAMES.length) + LINE_NAMES.length) % LINE_NAMES.length;
}

export function buildLines(stops) {
  return LINE_NAMES.map((name, id) => ({
    id, name, color: LINE_COLORS[id], frequency: LINE_FREQUENCIES[id],
    stops: stops.filter(s => s.lineId === id)
  })).filter(line => line.stops.length > 0);
}

export function nextStopInLine(stops, stop) {
  if (!stop) return null;
  const line = stops.filter(s => s.line === stop.line);
  if (line.length < 2) return null;
  const i = line.indexOf(stop);
  return line[(i + 1) % line.length] || null;
}

export function pickDestination(stops, from, random = Math.random) {
  if (!from) return null;
  const options = stops.filter(s => s !== from && s.line === from.line);
  if (!options.length) return null;
  return options[Math.floor(random() * options.length) % options.length];
}

export function sameLine(a, b) {
  return !!a && !!b && a !== b && a.lineId != null && a.lineId === b.lineId && a.line === b.line;
}

// Elige un par de paradas de la misma línea para un viaje caminando + guagua.
// Si no existe un par compatible dentro de la distancia peatonal, devuelve null.
export function planTransit(stops, from, to, maxWalk = 60) {
  if (!Array.isArray(stops) || !from || !to) return null;
  let best = null;
  for (const a of stops) {
    const walkFrom = Math.hypot(a.x - from.x, a.z - from.z);
    if (walkFrom > maxWalk) continue;
    for (const b of stops) {
      if (!sameLine(a, b)) continue;
      const walkTo = Math.hypot(b.x - to.x, b.z - to.z);
      if (walkTo > maxWalk) continue;
      const score = walkFrom + walkTo;
      if (!best || score < best.score) best = { from: a, to: b, walkFrom, walkTo, score };
    }
  }
  return best;
}

export function busServesStop(bus, stop) {
  return !!bus && !!stop && bus.lineId != null && bus.lineId === stop.lineId && bus.line === stop.line;
}

export function busAtStop(bus, stop, radius = 12) {
  if (!busServesStop(bus, stop)) return false;
  // La distancia importa: lastStop puede quedar viejo después de que la guagua arrancó.
  return Math.hypot((bus.x ?? bus.g?.position.x ?? 1e9) - stop.x, (bus.z ?? bus.g?.position.z ?? 1e9) - stop.z) < radius;
}

export function firstEdgeToward(graph, from, to) {
  if (!graph || !from || !to) return null;
  if (from.k === to.k) return null;
  const queue = [from], seen = new Set([from.k]), parent = new Map();
  while (queue.length) {
    const cur = queue.shift();
    for (const edge of cur.edges) {
      const nb = graph.nodes.get(edge.b);
      if (!nb || seen.has(nb.k)) continue;
      seen.add(nb.k); parent.set(nb.k, { node: cur, edge });
      if (nb.k === to.k) {
        let k = nb.k, first = edge;
        while (parent.get(k)) { const p = parent.get(k); first = p.edge; k = p.node.k; }
        return first;
      }
      queue.push(nb);
    }
  }
  return null;
}

export function stopLabel(stop) {
  return stop ? stop.name + ' · ' + stop.line : '';
}
