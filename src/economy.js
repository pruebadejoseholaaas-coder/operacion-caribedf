// Reglas económicas compartidas por comercios y habitantes. Son funciones puras
// para poder probarlas sin WebGL ni el bucle del juego.
const FOOD_SHOPS = new Set(['colmado', 'ventorrillo', 'comedor', 'frituras', 'empanadas', 'jugos', 'panaderia', 'reposteria', 'carniceria', 'pescaderia', 'pollera', 'fruteria']);
const SERVICE_SHOPS = new Set(['barberia', 'salon-belleza', 'unas', 'taller-motos', 'taller-autos', 'reparacion-celulares', 'electrodomesticos', 'internet', 'imprenta', 'fotografia', 'sastreria', 'modisteria', 'zapateria', 'tapiceria', 'bordado']);

export function shopPreference(data) {
  if (FOOD_SHOPS.has(data.id)) return 'food';
  if (SERVICE_SHOPS.has(data.id)) return 'service';
  return 'goods';
}

export function demandAt(time, preference = 'goods') {
  const t = ((time % 24) + 24) % 24;
  if (preference === 'food') {
    if (t >= 6 && t < 9) return .72;
    if (t >= 11.5 && t < 14.5) return .7;
    if (t >= 17 && t < 21) return .78;
    if (t >= 21 || t < 2) return 1.15;
    return 1.35;
  }
  if (preference === 'service') {
    if (t >= 9 && t < 12) return .7;
    if (t >= 12 && t < 15) return .85;
    if (t >= 15 && t < 19) return .78;
    return 1.45;
  }
  if (t >= 10 && t < 13) return .8;
  if (t >= 15 && t < 19) return .75;
  return 1.15;
}

export function queueLocal(index) {
  const spots = [[-1.0, 1.55], [0, 1.55], [1.0, 1.55], [-1.0, 2.35], [0, 2.35], [1.0, 2.35]];
  return spots[Math.max(0, Math.min(spots.length - 1, index | 0))];
}

export function queueWorld(shop, index) {
  const [lx, lz] = queueLocal(index);
  const r = shop.g.rotation.y, c = Math.cos(r), s = Math.sin(r);
  return { x: shop.g.position.x + lx * c + lz * s, z: shop.g.position.z - lx * s + lz * c };
}

export function saleCost(price) {
  return Math.max(1, Math.round(Number(price) * .55));
}

export function productIndexFor(stock, preference, random = Math.random) {
  const available = [];
  for (let i = 0; i < stock.length; i++) if (stock[i] > 0) available.push(i);
  if (!available.length) return -1;
  return available[Math.floor(random() * available.length) % available.length];
}
