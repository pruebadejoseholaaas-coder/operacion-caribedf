// Plaza comunitaria junto al conjunto residencial. No ocupa solares del mapa:
// crea un espacio peatonal nuevo entre las viviendas y el colmado de la loma.
const CENTER = { x: 834, z: 1230 };
const KIOSK = { x: 870, z: 1230 };

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

  box(32, .07, 22, 0xb7a78c, CENTER.x, .035, CENTER.z);
  box(32.4, .18, .35, 0x8e7c63, CENTER.x, .09, CENTER.z - 11.1);
  box(32.4, .18, .35, 0x8e7c63, CENTER.x, .09, CENTER.z + 11.1);
  // Bancos y jardineras.
  const spots = [];
  for (const [x, z, r] of [[824, 1221, 0], [824, 1239, Math.PI], [844, 1221, 0], [844, 1239, Math.PI]]) {
    const bench = new T.Group();
    const seat = new T.Mesh(new T.BoxGeometry(2.4, .12, .55), mat(0x8a5f3d)); seat.position.y = .48; bench.add(seat);
    const back = new T.Mesh(new T.BoxGeometry(2.4, .62, .12), mat(0x8a5f3d)); back.position.set(0, .78, -.24); bench.add(back);
    for (const bx of [-.9, .9]) { const leg = new T.Mesh(new T.BoxGeometry(.12, .46, .12), mat(0x444a4d)); leg.position.set(bx, .23, 0); bench.add(leg); }
    bench.position.set(x, 0, z); bench.rotation.y = r; scene.add(bench);
    addCollider(x, z, 2.5, .7);
    spots.push({ x: x + (r ? -1.2 : 1.2), z, node: null, kind: 'bench' });
  }
  for (const [x, z] of [[820, 1220], [848, 1220], [820, 1240], [848, 1240]]) {
    cylinder(.55, .55, 0x9a6d4b, x, .27, z);
    cylinder(.05, 2.4, 0x6b4f37, x, 1.5, z);
    const crown = new T.Mesh(new T.SphereGeometry(1.8, 9, 7), mat(0x397a4d));
    crown.position.set(x, 3.5, z); crown.castShadow = true; scene.add(crown);
    addCollider(x, z, 1.1, 1.1);
  }
  // Farolas de la plaza.
  for (const [x, z] of [[826, 1217], [842, 1217], [826, 1243], [842, 1243]]) {
    cylinder(.07, 3.1, 0x4a5054, x, 1.55, z);
    const lamp = new T.Mesh(new T.SphereGeometry(.18, 7, 6), new T.MeshBasicMaterial({ color: 0xffe3a3 }));
    lamp.position.set(x, 3.15, z); scene.add(lamp);
  }
  // Letrero de la plaza.
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
  const g = canvas.getContext('2d'); g.fillStyle = '#234b78'; g.fillRect(0, 0, 512, 96);
  g.fillStyle = '#fff'; g.font = 'bold 34px Trebuchet MS'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('PLAZA LOS ALMENDROS', 256, 48);
  const sign = new T.Mesh(new T.PlaneGeometry(3.8, .7), new T.MeshBasicMaterial({ map: new T.CanvasTexture(canvas) }));
  sign.position.set(CENTER.x, 2.2, CENTER.z + 11.15); sign.rotation.y = Math.PI; scene.add(sign);

  return {
    center: CENTER, kiosk: KIOSK, spots,
    avoid: [{ x: CENTER.x, z: CENTER.z, r: 22 }, { x: KIOSK.x, z: KIOSK.z, r: 12 }],
    near: (p, r = 25) => Math.hypot(p.x - CENTER.x, p.z - CENTER.z) < r
  };
}
