// Solar tropical del borde este: hierba, cerca, zanja, árboles y postes.
// Es una zona vacía del mapa OSM, no una copia de la ciudad ni una isla aparte.
export const LOT_BOUNDS = { x0: 128, x1: 185, z0: -282, z1: -212 };
export const LOT_CENTER = { x: (LOT_BOUNDS.x0 + LOT_BOUNDS.x1) / 2, z: (LOT_BOUNDS.z0 + LOT_BOUNDS.z1) / 2 };
export const LOT_GATE = { x0: 150, x1: 162, z: LOT_BOUNDS.z1 };
export const LOT_FEATURES = {
  bigTree: { x: 145, z: -255 },
  palms: [[134, -226], [178, -232], [136, -270], [177, -272]],
  ditch: { x: 180, z: -250, w: 3.2, d: 48 },
  poles: [[130, -207], [155, -204], [182, -202]]
};

export function lotContains(x, z) {
  return x >= LOT_BOUNDS.x0 && x <= LOT_BOUNDS.x1 && z >= LOT_BOUNDS.z0 && z <= LOT_BOUNDS.z1;
}

// Alturas suaves, sin cambiar la lógica de colisiones del jugador.
export function lotHeightAt(x, z) {
  if (!lotContains(x, z)) return 0;
  const u = (x - LOT_BOUNDS.x0) / (LOT_BOUNDS.x1 - LOT_BOUNDS.x0);
  const v = (z - LOT_BOUNDS.z0) / (LOT_BOUNDS.z1 - LOT_BOUNDS.z0);
  const edge = Math.min(u, 1 - u, v, 1 - v);
  const fade = Math.min(1, edge / .18);
  const h = .16 * Math.sin(u * Math.PI * 2.4 + .7) * Math.cos(v * Math.PI * 2.1) +
    .09 * Math.sin(u * Math.PI * 5.3 + v * 3.1);
  return Math.max(0, h + .18) * fade;
}

export function createTropicalLot({ T, scene, colliders }) {
  const mats = new Map();
  const mat = (c, o = {}) => {
    const key = c + JSON.stringify(o);
    if (!mats.has(key)) mats.set(key, new T.MeshLambertMaterial({ color: c, ...o }));
    return mats.get(key);
  };
  const box = (w, h, d, c, x, y, z, o = {}) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat(c, o));
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
  };
  const cylinder = (r, h, c, x, y, z, seg = 8) => {
    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, seg), mat(c));
    m.position.set(x, y + h / 2, z); m.castShadow = true; scene.add(m); return m;
  };
  const addCollider = (x, z, w, d) => colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });

  const { x0, x1, z0, z1 } = LOT_BOUNDS;
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;

  // Terreno de hierba con pequeños desniveles; el jugador ajusta su altura con lotHeightAt.
  const g = new T.PlaneGeometry(w, d, 22, 26);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = cx + pos.getX(i), z = cz + pos.getZ(i);
    pos.setY(i, lotHeightAt(x, z) + .018);
  }
  pos.needsUpdate = true; g.computeVertexNormals();
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = cx + pos.getX(i), z = cz + pos.getZ(i);
    const shade = .82 + .18 * Math.sin(x * .17 + z * .11) + .04 * Math.sin(z * .43);
    colors[i * 3] = .35 * shade; colors[i * 3 + 1] = .48 * shade; colors[i * 3 + 2] = .24 * shade;
  }
  g.setAttribute('color', new T.BufferAttribute(colors, 3));
  const grass = new T.Mesh(g, new T.MeshLambertMaterial({ vertexColors: true }));
  grass.position.set(cx, 0, cz); grass.receiveShadow = true; scene.add(grass);
  // Sendero de tierra que une la puerta con el árbol grande.
  for (const [px, pz, pw, pd] of [[155, -221, 3.4, 10], [151, -232, 3.1, 12], [147, -244, 2.7, 12]]) {
    const path = new T.Mesh(new T.PlaneGeometry(pw, pd), mat(0x8b7654));
    path.rotation.x = -Math.PI / 2; path.position.set(px, lotHeightAt(px, pz) + .035, pz); path.receiveShadow = true; scene.add(path);
  }

  // Acera de concreto en el borde de la carretera existente.
  const sidewalk = new T.Mesh(new T.BoxGeometry(64, .09, 3.4), mat(0xb9b4a5));
  sidewalk.position.set(155, .055, -203.5); sidewalk.rotation.y = -.16; sidewalk.receiveShadow = true; scene.add(sidewalk);
  box(64, .13, .22, 0x8f8a7e, 155, .12, -205.2).rotation.y = -.16;

  // Cerca metálica perimetral con puerta de acceso al norte.
  const postMat = mat(0x465257), railMat = mat(0x59676b);
  const fenceSegment = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < .2) return;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    const base = (lotHeightAt(ax, az) + lotHeightAt(bx, bz)) / 2;
    const angle = Math.atan2(bx - ax, bz - az);
    for (const yy of [.55, 1.55]) {
      const rail = new T.Mesh(new T.BoxGeometry(len, .07, .07), railMat);
      rail.position.set(mx, base + yy, mz); rail.rotation.y = angle; scene.add(rail);
    }
    for (let k = 0; k <= Math.ceil(len / 3); k++) {
      const t = k / Math.ceil(len / 3);
      const px = ax + (bx - ax) * t, pz = az + (bz - az) * t;
      const post = new T.Mesh(new T.BoxGeometry(.12, 2.1, .12), postMat);
      post.position.set(px, lotHeightAt(px, pz) + 1.05, pz); scene.add(post);
    }
    addCollider(mx, mz, Math.abs(bx - ax) + .25, Math.abs(bz - az) + .25);
  };
  fenceSegment(x0, z1, LOT_GATE.x0, z1);
  fenceSegment(LOT_GATE.x1, z1, x1, z1);
  fenceSegment(x0, z1, x0, z0);
  fenceSegment(x1, z1, x1, z0);
  fenceSegment(x0, z0, x1, z0);
  for (const gx of [LOT_GATE.x0, LOT_GATE.x1]) {
    const post = new T.Mesh(new T.BoxGeometry(.2, 2.5, .2), postMat);
    post.position.set(gx, lotHeightAt(gx, z1) + 1.25, z1); scene.add(post);
    addCollider(gx, z1, .35, .35);
  }

  // Zanja de drenaje con agua estancada y bordes de concreto.
  const ditch = LOT_FEATURES.ditch;
  box(ditch.w + 1.2, .12, ditch.d + 1.2, 0x77766d, ditch.x, .05, ditch.z);
  const water = box(ditch.w, .025, ditch.d, 0x315e5a, ditch.x, .13, ditch.z, { transparent: true, opacity: .9 });
  water.castShadow = false;
  box(.25, .18, ditch.d, 0x9c9a8d, ditch.x - ditch.w / 2 - .35, .16, ditch.z);
  box(.25, .18, ditch.d, 0x9c9a8d, ditch.x + ditch.w / 2 + .35, .16, ditch.z);

  // Árbol grande de copa ancha, palmeras y arbustos.
  const tree = LOT_FEATURES.bigTree;
  const treeBase = lotHeightAt(tree.x, tree.z);
  cylinder(1.05, 6.5, 0x6b4a30, tree.x, treeBase, tree.z, 8);
  for (const [ox, oz, oy, r] of [[0, 0, 6.6, 3.3], [-2.2, .6, 6.1, 2.2], [2.1, -.8, 6.2, 2.4], [.4, 2.0, 6.8, 2.0], [-1.0, -2.1, 6.3, 2.1]]) {
    const crown = new T.Mesh(new T.SphereGeometry(r, 8, 6), mat(0x356b42));
    crown.position.set(tree.x + ox, treeBase + oy, tree.z + oz); crown.castShadow = true; scene.add(crown);
  }
  addCollider(tree.x, tree.z, 1.5, 1.5);
  for (const [px, pz] of LOT_FEATURES.palms) {
    const base = lotHeightAt(px, pz);
    const trunk = cylinder(.16, 7.5, 0x8a6847, px, base, pz, 7);
    trunk.rotation.z = .05;
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * Math.PI * 2;
      const frond = new T.Mesh(new T.BoxGeometry(3.6, .06, .35), mat(0x2f7a45));
      frond.position.set(px + Math.sin(a) * 1.5, base + 7.4, pz + Math.cos(a) * 1.5);
      frond.rotation.y = -a; frond.rotation.z = -.22; frond.castShadow = true; scene.add(frond);
    }
    addCollider(px, pz, .55, .55);
  }
  for (let i = 0; i < 26; i++) {
    const a = i * 2.4, r = 7 + (i * 13 % 19);
    const px = cx + Math.cos(a) * r, pz = cz + Math.sin(a) * r;
    if (px < x0 + 1 || px > x1 - 1 || pz < z0 + 1 || pz > z1 - 1) continue;
    const bush = new T.Mesh(new T.SphereGeometry(.35 + (i % 4) * .12, 6, 5), mat(i % 2 ? 0x3f7540 : 0x527f45));
    bush.position.set(px, lotHeightAt(px, pz) + .3, pz); bush.castShadow = true; scene.add(bush);
  }

  // Matas de hierba y piedras pequeñas para romper la planitud.
  for (let i = 0; i < 54; i++) {
    const px = x0 + 3 + (i * 37 % Math.max(1, Math.floor(w - 6)));
    const pz = z0 + 3 + (i * 53 % Math.max(1, Math.floor(d - 6)));
    const tuft = new T.Mesh(new T.ConeGeometry(.10 + (i % 3) * .04, .38 + (i % 4) * .07, 4), mat(i % 2 ? 0x416f36 : 0x5a8145));
    tuft.position.set(px, lotHeightAt(px, pz) + .2, pz); tuft.castShadow = false; scene.add(tuft);
  }
  for (const [rx, rz] of [[139, -236], [168, -247], [153, -271], [174, -222]]) {
    const rock = new T.Mesh(new T.DodecahedronGeometry(.55 + (rx % 3) * .12, 0), mat(0x77796e));
    rock.position.set(rx, lotHeightAt(rx, rz) + .2, rz); rock.rotation.set(.2, rx, .1); rock.castShadow = true; scene.add(rock);
  }

  // Postes de luz y cables a lo largo de la carretera.
  const poleTop = [];
  for (const [px, pz] of LOT_FEATURES.poles) {
    const base = .05;
    cylinder(.12, 7.4, 0x4b4d49, px, base, pz, 7);
    box(1.5, .1, .1, 0x4b4d49, px, base + 6.9, pz);
    poleTop.push(new T.Vector3(px, base + 7.0, pz));
    addCollider(px, pz, .45, .45);
  }
  for (let i = 0; i + 1 < poleTop.length; i++) {
    const a = poleTop[i], b = poleTop[i + 1];
    const pts = [];
    for (let k = 0; k <= 10; k++) {
      const t = k / 10;
      pts.push(new T.Vector3(a.x + (b.x - a.x) * t, a.y - Math.sin(t * Math.PI) * .55, a.z + (b.z - a.z) * t));
    }
    const cable = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x292d2c }));
    scene.add(cable);
  }

  // Edificios residenciales de fondo y montañas tropicales del horizonte.
  const blocks = [[112, -337, 10, 7, 12], [148, -347, 12, 8, 16], [194, -337, 11, 7, 14]];
  for (const [bx, bz, bw, bd, bh] of blocks) {
    box(bw, bh, bd, 0xd8c9ad, bx, bh / 2, bz);
    for (let y = 2.2; y < bh - 1; y += 2.4) {
      for (let x = -bw / 2 + 1.3; x < bw / 2 - .8; x += 2.2) box(.7, .8, .06, 0x304c5b, bx + x, y, bz + bd / 2 + .04);
    }
    addCollider(bx, bz, bw, bd);
  }
  for (const [mx, mz, mh, mr] of [[70, -410, 30, 34], [125, -425, 38, 42], [190, -415, 32, 38], [250, -430, 26, 30]]) {
    const mountain = new T.Mesh(new T.ConeGeometry(mr, mh, 7), mat(0x496b5a));
    mountain.position.set(mx, mh / 2 - 1, mz); mountain.castShadow = false; scene.add(mountain);
  }

  // Letrero rústico de acceso.
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
  const c2 = cv.getContext('2d'); c2.fillStyle = '#6b4d32'; c2.fillRect(0, 0, 512, 128);
  c2.fillStyle = '#f2dfb5'; c2.font = 'bold 34px Trebuchet MS'; c2.textAlign = 'center'; c2.textBaseline = 'middle';
  c2.fillText('SOLAR LA LOMA', 256, 64);
  const sign = new T.Mesh(new T.PlaneGeometry(4.2, 1.05), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv) }));
  sign.position.set((LOT_GATE.x0 + LOT_GATE.x1) / 2, 2.35, z1 - .15); sign.rotation.y = Math.PI; scene.add(sign);
  for (const sx of [LOT_GATE.x0 - .6, LOT_GATE.x1 + .6]) box(.15, 2.3, .15, 0x5a412e, sx, 1.15, z1 - .2);

  return {
    bounds: LOT_BOUNDS, center: LOT_CENTER, gate: LOT_GATE, features: LOT_FEATURES,
    heightAt: lotHeightAt, near: (p, r = 45) => Math.hypot(p.x - cx, p.z - cz) < r
  };
}
