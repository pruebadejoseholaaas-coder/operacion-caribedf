// Plaza Los Almendros: espacio peatonal dentro de la ciudad, junto a viviendas
// de rutina y a una vía existente. No crea una zona duplicada ni ocupa la calle.
export const PLAZA_CENTER = { x: -72, z: -24 };
export const PLAZA_SIZE = { w: 28, d: 18 };
export const KIOSK = { x: -72, z: -24 };
const BENCHES = [
  [-8, -5, 0], [8, -5, Math.PI], [-8, 5, 0], [8, 5, Math.PI]
];

export function createBarrioSystem({ T, scene, colliders }) {
  const mats = new Map();
  const mat = (c) => { if (!mats.has(c)) mats.set(c, new T.MeshLambertMaterial({ color: c })); return mats.get(c); };
  const box = (w, h, d, c, x, y, z) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat(c));
    m.position.set(x, y, z); m.receiveShadow = true; m.castShadow = true; scene.add(m); return m;
  };
  const cylinder = (r, h, c, x, y, z) => {
    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 8), mat(c));
    m.position.set(x, y, z); m.castShadow = true; scene.add(m); return m;
  };
  const addCollider = (x, z, w, d) => colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });

  const cx = PLAZA_CENTER.x, cz = PLAZA_CENTER.z;
  box(PLAZA_SIZE.w, .07, PLAZA_SIZE.d, 0xb7a78c, cx, .035, cz);
  box(PLAZA_SIZE.w + .4, .18, .35, 0x8e7c63, cx, .09, cz - PLAZA_SIZE.d / 2 + .1);
  box(PLAZA_SIZE.w + .4, .18, .35, 0x8e7c63, cx, .09, cz + PLAZA_SIZE.d / 2 - .1);

  const spots = [];
  for (const [dx, dz, r] of BENCHES) {
    const x = cx + dx, z = cz + dz;
    const bench = new T.Group();
    const seat = new T.Mesh(new T.BoxGeometry(2.4, .12, .55), mat(0x8a5f3d)); seat.position.y = .48; bench.add(seat);
    const back = new T.Mesh(new T.BoxGeometry(2.4, .62, .12), mat(0x8a5f3d)); back.position.set(0, .78, -.24); bench.add(back);
    for (const bx of [-.9, .9]) { const leg = new T.Mesh(new T.BoxGeometry(.12, .46, .12), mat(0x444a4d)); leg.position.set(bx, .23, 0); bench.add(leg); }
    bench.position.set(x, 0, z); bench.rotation.y = r; scene.add(bench);
    addCollider(x, z, 2.5, .7);
    spots.push({ x: x + (r ? -1.2 : 1.2), z, node: null, kind: 'bench' });
  }

  for (const [dx, dz] of [[-11, -6], [11, -6], [-11, 6], [11, 6]]) {
    const x = cx + dx, z = cz + dz;
    cylinder(.55, .55, 0x9a6d4b, x, .27, z);
    cylinder(.05, 2.4, 0x6b4f37, x, 1.5, z);
    const crown = new T.Mesh(new T.SphereGeometry(1.8, 9, 7), mat(0x397a4d));
    crown.position.set(x, 3.5, z); crown.castShadow = true; scene.add(crown);
    addCollider(x, z, 1.1, 1.1);
  }

  for (const [dx, dz] of [[-10, -7], [10, -7], [-10, 7], [10, 7]]) {
    const x = cx + dx, z = cz + dz;
    cylinder(.07, 3.1, 0x4a5054, x, 1.55, z);
    const lamp = new T.Mesh(new T.SphereGeometry(.18, 7, 6), new T.MeshBasicMaterial({ color: 0xffe3a3 }));
    lamp.position.set(x, 3.15, z); scene.add(lamp);
  }

  // Kiosco de la plaza, con techo y mostrador; no es un comercio simulado.
  box(5.2, .16, 3.2, 0x8a6a4b, KIOSK.x, .08, KIOSK.z);
  box(5.2, 2.2, .16, 0x9b7650, KIOSK.x, 1.18, KIOSK.z - 1.6);
  box(5.2, .18, 3.5, 0x5c4433, KIOSK.x, 2.35, KIOSK.z);
  box(1.2, 1.0, .15, 0xf0d39a, KIOSK.x, 1.1, KIOSK.z + 1.55);
  addCollider(KIOSK.x, KIOSK.z, 5.4, 3.4);

  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
  const g = canvas.getContext('2d'); g.fillStyle = '#234b78'; g.fillRect(0, 0, 512, 96);
  g.fillStyle = '#fff'; g.font = 'bold 34px Trebuchet MS'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('PLAZA LOS ALMENDROS', 256, 48);
  const sign = new T.Mesh(new T.PlaneGeometry(3.8, .7), new T.MeshBasicMaterial({ map: new T.CanvasTexture(canvas) }));
  sign.position.set(cx, 2.2, cz + PLAZA_SIZE.d / 2 + .2); sign.rotation.y = Math.PI; scene.add(sign);

  return {
    center: PLAZA_CENTER, kiosk: KIOSK, spots, size: PLAZA_SIZE,
    avoid: [{ x: cx, z: cz, r: 20 }, { x: KIOSK.x, z: KIOSK.z, r: 8 }],
    near: (p, r = 25) => Math.hypot(p.x - cx, p.z - cz) < r
  };
}
