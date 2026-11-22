// Casa del jugador: fachada en la ciudad e interior explorable en una zona apartada
// del mapa. La puerta teletransporta entre ambos mundos y las colisiones se activan
// solo mientras estás dentro.
const IX = 1000, IZ = 1000; // centro del interior, lejos del mapa urbano

export function createHouse(T, scene, colliders, world) {
  const matCache = new Map();
  const material = c => { if (!matCache.has(c)) matCache.set(c, new T.MeshLambertMaterial({ color: c })); return matCache.get(c); };
  const box = (parent, w, h, d, c, x, y, z, cast = true) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), material(c));
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  };

  const insidePoly = (x, z, p) => {
    let ins = false;
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      const xi = p[i], zi = p[i + 1], xj = p[j], zj = p[j + 1];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / ((zj - zi) || 1e-6) + xi) ins = !ins;
    }
    return ins;
  };
  const segCross = (a, b, c, d) => {
    const rx = b[0] - a[0], rz = b[1] - a[1], sx = d[0] - c[0], sz = d[1] - c[1];
    const den = rx * sz - rz * sx;
    if (Math.abs(den) < 1e-9) return false;
    const t = ((c[0] - a[0]) * sz - (c[1] - a[1]) * sx) / den;
    const u = ((c[0] - a[0]) * rz - (c[1] - a[1]) * rx) / den;
    return t > 0 && t < 1 && u > 0 && u < 1;
  };
  const overlaps = (rect, poly) => {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const p of rect) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); }
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) {
      if (insidePoly(x0 + (x1 - x0) * i / 4, z0 + (z1 - z0) * j / 4, poly)) return true;
    }
    for (let i = 0; i < poly.length; i += 2) if (poly[i] > x0 && poly[i] < x1 && poly[i + 1] > z0 && poly[i + 1] < z1) return true;
    for (let i = 0; i < rect.length; i++) {
      const a = rect[i], b = rect[(i + 1) % rect.length];
      for (let k = 0; k < poly.length - 2; k += 2) if (segCross(a, b, [poly[k], poly[k + 1]], [poly[k + 2], poly[k + 3]])) return true;
    }
    return false;
  };
  const pathClear = (x0, z0, x1, z1) => {
    for (let t = 0; t <= 1; t += .07) {
      const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      if ((world.buildings || []).some(b => insidePoly(x, z, b.poly))) return false;
    }
    return true;
  };

  // Busca un solar libre junto a una calle, cerca del punto de aparición.
  const W = 10, D = 9, spawn = world.spawn;
  const candidates = [];
  for (const r of world.roads || []) {
    if (r.width < 6) continue;
    const p = r.points;
    for (let i = 0; i + 3 < p.length; i += 2) {
      const ax = p[i], az = p[i + 1], bx = p[i + 2], bz = p[i + 3];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 12) continue;
      const dx = (bx - ax) / len, dz = (bz - az) / len, nx = -dz, nz = dx;
      for (let s = 6; s < len - 6; s += 6) {
        const px = ax + dx * s, pz = az + dz * s;
        for (const side of [1, -1]) {
          const off = r.width / 2 + 2.2 + D / 2;
          const cx = px + nx * side * off, cz = pz + nz * side * off;
          const dist = Math.hypot(cx - spawn[0], cz - spawn[1]);
          if (dist < 26 || dist > 300) continue;
          const rect = [[-1, -1], [-1, 1], [1, 1], [1, -1]].map(([a, b]) => [
            cx + dx * a * W / 2 + nx * side * b * D / 2,
            cz + dz * a * W / 2 + nz * side * b * D / 2
          ]);
          if ((world.buildings || []).some(b => overlaps(rect, b.poly))) continue;
          const frontX = cx - nx * side * D / 2, frontZ = cz - nz * side * D / 2;
          if (!pathClear(frontX, frontZ, px, pz)) continue;
          candidates.push({ x: cx, z: cz, rot: Math.atan2(dz * side, -dx * side), dist });
        }
      }
    }
  }
  candidates.sort((a, b) => a.dist - b.dist);
  const site = candidates[0] || { x: spawn[0] + 24, z: spawn[1], rot: 0, dist: 24 };
  const front = D / 2;

  // ---------- Exterior ----------
  const outside = new T.Group();
  outside.position.set(site.x, 0, site.z); outside.rotation.y = site.rot; scene.add(outside);
  box(outside, W, .3, D, 0xb7ab96, 0, .15, 0, false);
  box(outside, W, 3.0, D, 0xf1e6d2, 0, 1.65, 0);
  box(outside, W + .3, 3.0, D + .3, 0xeadcc4, 0, 4.65, 0);
  box(outside, W + .5, .4, D + .5, 0x9b8061, 0, 6.25, 0);
  box(outside, W + .2, .55, .2, 0x8a5736, 0, 3.15, front + .02, false);
  box(outside, W + .2, .25, .2, 0x8a5736, 0, 6.45, front + .02, false);
  // Puerta, escalón y porche.
  box(outside, 1.25, 2.25, .12, 0x6b4226, 0, 1.15, front + .06);
  box(outside, .28, .1, .08, 0xe2c36b, .38, 1.15, front + .14, false);
  box(outside, 2.4, .18, 1.2, 0xc4b7a0, 0, .09, front + .55, false);
  box(outside, 3.4, .12, 1.9, 0xc8372d, 0, 2.75, front + .85);
  for (const x of [-1.55, 1.55]) box(outside, .09, 2.6, .09, 0x7b3a2c, x, 1.35, front + 1.65);
  // Ventanas con rejas.
  for (const [wx, wy, ww] of [[-3.1, 2.0, 1.5], [3.1, 2.0, 1.5], [-3.1, 5.0, 1.4], [3.1, 5.0, 1.4]]) {
    box(outside, ww, 1.15, .1, 0x47758b, wx, wy, front + .04, false);
    for (let i = -1; i <= 1; i++) box(outside, .05, 1.2, .05, 0x3a3f42, wx + i * ww / 3, wy, front + .12, false);
  }
  // Tinaco y plantas dominicanas.
  const tank = new T.Mesh(new T.CylinderGeometry(.5, .55, 1.1, 9), material(0x303b42));
  tank.position.set(2.6, 7.0, -1.6); tank.castShadow = true; outside.add(tank);
  const lid = new T.Mesh(new T.CylinderGeometry(.52, .52, .08, 9), material(0x59656b));
  lid.position.set(2.6, 7.58, -1.6); outside.add(lid);
  for (const [px, pz] of [[-4.2, front + 1.2], [4.2, front + 1.2]]) {
    const pot = new T.Mesh(new T.CylinderGeometry(.24, .3, .45, 8), material(0xa86f4c));
    pot.position.set(px, .24, pz); outside.add(pot);
    const plant = new T.Mesh(new T.SphereGeometry(.42, 8, 7), material(0x39864b));
    plant.position.set(px, .72, pz); outside.add(plant);
  }
  // Letrero y felpudo junto a la puerta.
  const sign = document.createElement('canvas'); sign.width = 256; sign.height = 64;
  const sx = sign.getContext('2d'); sx.fillStyle = '#234b78'; sx.fillRect(0, 0, 256, 64);
  sx.fillStyle = '#fff'; sx.font = 'bold 26px Trebuchet MS'; sx.textAlign = 'center'; sx.textBaseline = 'middle';
  sx.fillText('MI CASA', 128, 34);
  const signMesh = new T.Mesh(new T.PlaneGeometry(1.5, .38), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sign) }));
  signMesh.position.set(0, 3.55, front + .08); outside.add(signMesh);
  box(outside, 1.5, .03, .8, 0x9c4a3c, 0, .17, front + .45, false);

  // Colisión de la fachada y anillo de entrada.
  const c = Math.cos(site.rot), s = Math.sin(site.rot);
  const poly = [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2]].map(([lx, lz]) => [site.x + lx * c + lz * s, site.z - lx * s + lz * c]).flat();
  const homeCol = { x0: Math.min(poly[0], poly[2], poly[4], poly[6]), x1: Math.max(poly[0], poly[2], poly[4], poly[6]), z0: Math.min(poly[1], poly[3], poly[5], poly[7]), z1: Math.max(poly[1], poly[3], poly[5], poly[7]), poly, tag: 'home' };
  colliders.push(homeCol);
  const doorLocal = [0, front + .7];
  const door = { x: site.x + doorLocal[0] * c + doorLocal[1] * s, z: site.z - doorLocal[0] * s + doorLocal[1] * c };
  const ring = new T.Mesh(new T.RingGeometry(1.1, 1.45, 28), new T.MeshBasicMaterial({ color: 0x7fe0a8, transparent: true, opacity: .7, side: T.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(door.x, .05, door.z); scene.add(ring);

  // ---------- Interior ----------
  const interior = new T.Group();
  interior.position.set(IX, 0, IZ); interior.visible = false; scene.add(interior);
  const IW = 14, ID = 12, WH = 3.2;
  box(interior, IW, .2, ID, 0xb9ad99, 0, .1, 0, false);
  const tiles = new T.Mesh(new T.PlaneGeometry(IW - .4, ID - .4), new T.MeshLambertMaterial({ color: 0xd8cdbb }));
  tiles.rotation.x = -Math.PI / 2; tiles.position.y = .21; interior.add(tiles);
  box(interior, IW, WH, .24, 0xe9ddc9, 0, WH / 2, -ID / 2);
  box(interior, IW, WH, .24, 0xe9ddc9, 0, WH / 2, ID / 2);
  box(interior, .24, WH, ID, 0xe4d7c1, -IW / 2, WH / 2, 0);
  box(interior, .24, WH, ID, 0xe4d7c1, IW / 2, WH / 2, 0);
  box(interior, IW + .2, .2, ID + .2, 0xf4ead8, 0, WH + .1, 0, false);
  // Puerta interior y ventanas con luz.
  box(interior, 1.3, 2.3, .1, 0x6b4226, 0, 1.15, ID / 2 - .14);
  for (const [wx, wz] of [[-4.6, ID / 2 - .13], [4.6, ID / 2 - .13]]) {
    box(interior, 1.5, 1.2, .08, 0xbfe3ee, wx, 1.9, wz, false);
  }
  // Baño separado con tabiques y hueco de puerta.
  box(interior, .2, 2.7, 4, 0xefe4d0, -2.6, 1.35, -4);
  box(interior, 1.7, WH, .2, 0xe0d3bd, -6.05, WH / 2, -2);
  box(interior, 1.6, WH, .2, 0xe0d3bd, -1.8, WH / 2, -2);
  const inCols = [];
  const col = (w, d, x, z) => {
    const x0 = IX + x - w / 2, x1 = IX + x + w / 2, z0 = IZ + z - d / 2, z1 = IZ + z + d / 2;
    const c2 = { x0, x1, z0, z1, tag: 'house' };
    inCols.push(c2); return c2;
  };
  col(IW, .24, 0, -ID / 2); col(IW, .24, 0, ID / 2); col(.24, ID, -IW / 2, 0); col(.24, ID, IW / 2, 0);
  col(.2, 4, -2.6, -4); col(1.7, .2, -6.05, -2); col(1.6, .2, -1.8, -2);

  // Muebles de sala y comedor.
  const sofa = box(interior, 2.7, .8, .95, 0x2f7d6d, -4.2, .55, 3.6);
  box(interior, 2.7, .55, .25, 0x276b5e, -4.2, 1.05, 4.0);
  box(interior, 2.7, .2, .95, 0x3a8f7e, -4.2, .95, 3.6, false);
  box(interior, 1.5, .42, .8, 0x8a603d, -4.2, .32, 1.75);
  box(interior, 2.6, .06, 1.6, 0x8f3b4a, -4.2, .24, 2.65, false);
  box(interior, .5, 1.05, 1.9, 0x6b4a33, -6.35, .6, 3.5);
  box(interior, .1, 1.1, 1.7, 0x1b2229, -6.06, 1.75, 3.5, false);
  // Abanico de techo.
  const fan = new T.Group(); fan.position.set(-4.2, 2.95, 2.6); interior.add(fan);
  box(fan, .1, .3, .1, 0x8a8f92, 0, 0, 0, false);
  for (let i = 0; i < 3; i++) {
    const blade = new T.Mesh(new T.BoxGeometry(1.5, .04, .28), material(0xd9d2c3));
    blade.position.set(Math.cos(i * 2.09) * .8, 0, Math.sin(i * 2.09) * .8);
    blade.rotation.y = -i * 2.09; fan.add(blade);
  }
  // Comedor.
  box(interior, 2.1, .12, 1.1, 0x9b6a3f, 3.7, .8, 3.2);
  for (const [cx, cz] of [[2.9, 2.4], [4.5, 2.4], [2.9, 4.0], [4.5, 4.0]]) {
    box(interior, .5, .5, .5, 0x2a9d8f, cx, .45, cz);
    box(interior, .5, .6, .1, 0x2a9d8f, cx, .85, cz + .2);
  }
  box(interior, 1.3, 1.7, .5, 0x7a5236, 6.4, .95, 3.2);
  // Cocina.
  box(interior, 5.4, .95, .75, 0xd9cbb5, .6, .55, -5.5);
  box(interior, 5.5, .1, .85, 0xb7a68c, .6, 1.08, -5.5);
  box(interior, 1.1, .1, .6, 0x8f9497, -1.2, 1.12, -5.5, false);
  for (const bx of [-1.9, -.4]) {
    const burner = new T.Mesh(new T.CylinderGeometry(.16, .16, .05, 10), material(0x1b1f22));
    burner.position.set(bx, 1.14, -5.5); interior.add(burner);
  }
  const pot = new T.Mesh(new T.CylinderGeometry(.22, .25, .26, 10), material(0x9aa2a5));
  pot.position.set(-1.6, 1.3, -5.5); interior.add(pot);
  box(interior, 1.7, 1.05, .75, 0xc9c3b6, 4.9, .6, -5.45);
  box(interior, 1.5, 2.1, .8, 0x5c9eaf, 4.9, 1.1, -5.4);
  box(interior, 5.4, .75, .45, 0xd9cbb5, .6, 2.35, -5.72);
  // Dormitorio.
  box(interior, 2.2, .55, 2.5, 0x8b4a2d, 3.9, .45, -1.1);
  box(interior, 2.1, .28, 2.35, 0xf1e9d8, 3.9, .82, -1.1, false);
  box(interior, 2.1, .16, .7, 0xf7f1e4, 3.9, .95, -2.1, false);
  box(interior, 2.3, .95, .18, 0x6b4226, 3.9, .6, -2.4);
  box(interior, 1.7, 1.95, .72, 0x7a5236, 6.0, 1.0, -3.7);
  box(interior, .08, 1.7, .55, 0x9b7654, 5.62, 1.0, -3.7, false);
  box(interior, .6, .55, .5, 0x8a603d, 2.5, .3, -3.5);
  const lamp = new T.Mesh(new T.CylinderGeometry(.18, .26, .35, 8), material(0xf3d9a2));
  lamp.position.set(2.5, .85, -3.5); interior.add(lamp);
  // Baño.
  box(interior, .55, .45, .65, 0xf2f2ec, -6.2, .3, -4.9);
  box(interior, .55, .7, .2, 0xf2f2ec, -6.2, .7, -5.2);
  box(interior, .9, .15, .55, 0xdfe8e8, -3.8, .95, -5.5);
  box(interior, .12, .8, .12, 0x9aa2a5, -3.8, .5, -5.5);
  box(interior, 1.1, .1, 1.1, 0x9cc3cc, -6.1, .1, -3.0, false);
  box(interior, .08, 2.0, 1.1, 0xbfe3ee, -6.35, 1.1, -3.0, false);
  // Caja de almacenamiento y plantas.
  box(interior, .95, .7, .7, 0x8a603d, -1.5, .45, 4.6);
  box(interior, .98, .08, .73, 0x6b4226, -1.5, .82, 4.6, false);
  for (const [px, pz] of [[6.2, 4.8], [-6.2, 1.2]]) {
    const p = new T.Mesh(new T.CylinderGeometry(.2, .26, .4, 8), material(0xa86f4c));
    p.position.set(px, .3, pz); interior.add(p);
    const leaf = new T.Mesh(new T.SphereGeometry(.38, 8, 6), material(0x39864b));
    leaf.position.set(px, .8, pz); interior.add(leaf);
  }
  col(2.7, .95, -4.2, 3.6); col(1.5, .8, -4.2, 1.75); col(.5, 1.9, -6.35, 3.5);
  col(2.1, 1.1, 3.7, 3.2); col(1.3, .5, 6.4, 3.2);
  col(5.4, .75, .6, -5.5); col(1.5, .8, 4.9, -5.4);
  col(2.2, 2.5, 3.9, -1.1); col(1.7, .72, 6.0, -3.7); col(.6, .5, 2.5, -3.5);
  col(.55, .65, -6.2, -4.9); col(.95, .7, -1.5, 4.6);
  // Luces interiores.
  const bulbMat = new T.MeshBasicMaterial({ color: 0x555555 });
  const bulbs = [];
  for (const [bx, bz] of [[0, 2.4], [3.8, -3.2], [-4.4, -3.4]]) {
    box(interior, .05, .35, .05, 0x6b6b6b, bx, WH - .2, bz, false);
    const b = new T.Mesh(new T.SphereGeometry(.11, 8, 6), bulbMat);
    b.position.set(bx, WH - .42, bz); interior.add(b); bulbs.push(b);
  }
  const light = new T.PointLight(0xffe2a8, 0, 18, 2);
  light.position.set(IX, WH - .3, IZ + .5); scene.add(light);
  const light2 = new T.PointLight(0xffe2a8, 0, 12, 2);
  light2.position.set(IX + 3.5, WH - .4, IZ - 4); scene.add(light2);
  // Luz de ventana tenue: permite ver el interior aunque las bombillas estén apagadas.
  const ambientIn = new T.PointLight(0xcfe0f0, 1.0, 30, 2);
  ambientIn.position.set(IX, 2.6, IZ); scene.add(ambientIn);

  let inside = false, lightsOn = true, outsidePos = null, outsideRot = 0;
  const actions = [
    { id: 'door', x: 0, z: 5.2, label: 'Salir a la calle' },
    { id: 'sleep', x: 3.9, z: -1.1, label: 'Dormir hasta las 6:30' },
    { id: 'lights', x: 1.2, z: 5.3, label: 'Encender o apagar la luz' },
    { id: 'wardrobe', x: 6.0, z: -3.7, label: 'Cambiar de ropa' },
    { id: 'eat', x: 4.9, z: -5.4, label: 'Comer algo de la nevera' },
    { id: 'cook', x: -1.2, z: -5.5, label: 'Cocinar comida casera' },
    { id: 'storage', x: -1.5, z: 4.6, label: 'Abrir el inventario' }
  ];

  function setLights(on) {
    lightsOn = on;
    bulbMat.color.setHex(on ? 0xfff3c4 : 0x4a4a4a);
    light.intensity = on ? 1.5 : 0;
    light2.intensity = on ? 1.0 : 0;
    ambientIn.intensity = inside ? 1.0 : 0;
  }
  setLights(true);

  function enter(player) {
    if (inside) return false;
    outsidePos = player.g.position.clone(); outsideRot = player.g.rotation.y;
    inside = true; interior.visible = true; ambientIn.intensity = 1.0;
    for (const cc of inCols) colliders.push(cc);
    player.g.position.set(IX, 0, IZ);
    player.g.rotation.y = Math.PI;
    return true;
  }
  function exit(player) {
    if (!inside) return false;
    inside = false; interior.visible = false; ambientIn.intensity = 0;
    for (const cc of inCols) { const i = colliders.indexOf(cc); if (i >= 0) colliders.splice(i, 1); }
    if (outsidePos) player.g.position.copy(outsidePos);
    player.g.rotation.y = outsideRot;
    return true;
  }
  function actionAt(pos) {
    if (!inside) return null;
    let best = null, bestD = 2.0;
    for (const a of actions) {
      const d = Math.hypot(pos.x - (IX + a.x), pos.z - (IZ + a.z));
      if (d < bestD) { bestD = d; best = a; }
    }
    return best;
  }
  function nearDoor(pos) {
    return !inside && Math.hypot(pos.x - door.x, pos.z - door.z) < 2.6;
  }
  function update(dt, now) {
    ring.material.opacity = .45 + .25 * (.5 + .5 * Math.sin(now / 320));
    ring.visible = !inside;
    fan.rotation.y += dt * (lightsOn ? 6 : 0);
  }
  return {
    home: { x: site.x, z: site.z }, door, interior: { x: IX, z: IZ },
    enter, exit, actionAt, nearDoor, update, setLights, inside: () => inside,
    lightsOn: () => lightsOn, actions
  };
}
