// Cargador del mundo real (OpenStreetMap): calles con aceras y marcas, edificios con fachada, árboles, carga por chunks.
const CS = 200;
const PAL = [0xf2c14e, 0xe76f51, 0x2a9d8f, 0xf4a261, 0xe9c46a, 0xf1e9d8, 0x6ec1e4, 0xd97aa6, 0xb7d968];

export async function loadWorld(T, scene, colliders) {
  let d;
  try {
    const r = await fetch(import.meta.env.BASE_URL + 'world/world.json');
    if (!r.ok) return null;
    d = await r.json();
  } catch { return null; }

  const cells = new Map(), loaded = new Map(), mats = {};
  const mat = (c, o = {}) => mats[c + JSON.stringify(o)] || (mats[c + JSON.stringify(o)] = new T.MeshLambertMaterial({ color: c, ...o }));

  // Textura de fachada: una ventana por cada módulo de 3.2 m (el color de cada edificio la tiñe)
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 64, 64);
  x.fillStyle = '#cfc6b8'; x.fillRect(0, 58, 64, 6);
  x.fillStyle = '#e8e2d6'; x.fillRect(15, 11, 34, 40);
  x.fillStyle = '#2f3f52'; x.fillRect(18, 14, 28, 34);
  x.fillStyle = '#6f98b8'; x.fillRect(20, 16, 11, 14); x.fillRect(33, 16, 11, 14);
  x.fillStyle = '#e8e2d6'; x.fillRect(31, 14, 2, 34);
  const tex = new T.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(1 / 3.2, 1 / 3.2); tex.anisotropy = 4;
  const wall = c => mat(c, { map: tex });
  const roof = mat(0x8d4b32);

  const trunkG = new T.CylinderGeometry(.15, .2, 2.4, 5); trunkG.translate(0, 1.2, 0);
  const crownG = new T.SphereGeometry(1.5, 6, 5); crownG.translate(0, 3.6, 0);

  const add = (kind, f, p) => {
    const k = Math.floor(p[0] / CS) + ',' + Math.floor(p[1] / CS);
    let c = cells.get(k); if (!c) cells.set(k, c = { r: [], b: [], w: [], g: [] });
    c[kind].push(f);
  };
  let m = 0;
  d.r.forEach(([w, p]) => {
  for (let i = 0; i + 3 < p.length; i += 2) {
    const segment = [p[i], p[i + 1], p[i + 2], p[i + 3]];
    const center = [
      (p[i] + p[i + 2]) / 2,
      (p[i + 1] + p[i + 3]) / 2
    ];

    add('r', [w, segment], center);

    segment.forEach(v => {
      m = Math.max(m, Math.abs(v));
    });
  }
});
  d.b.forEach(f => add('b', f, f[2]));
 d.w.forEach(f => add('w', f, f));
d.g.forEach(f => add('g', f, f));

  const shape = p => { const s = new T.Shape(); for (let i = 0; i < p.length; i += 2) i ? s.lineTo(p[i], -p[i + 1]) : s.moveTo(p[i], -p[i + 1]); return s; };
  const flat = (p, c, y, grp) => {
    try {
      const g = new T.ShapeGeometry(shape(p)); g.rotateX(-Math.PI / 2);
      const me = new T.Mesh(g, mat(c)); me.position.y = y; me.receiveShadow = true; grp.add(me);
    } catch {}
  };
  const seg = (a, x1, z1, x2, z2, nx, nz, o1, o2) => {
    const A = [x1 + nx * o2, 0, z1 + nz * o2], B = [x1 + nx * o1, 0, z1 + nz * o1], C = [x2 + nx * o2, 0, z2 + nz * o2], D = [x2 + nx * o1, 0, z2 + nz * o1];
    a.push(...A, ...C, ...B, ...B, ...C, ...D);
  };
  const strip = (arr, color, y, off, grp) => {
    if (!arr.length) return;
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(arr, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(arr.map((_, i) => i % 3 === 1 ? 1 : 0), 3));
    const me = new T.Mesh(g, mat(color, { polygonOffset: true, polygonOffsetFactor: off, polygonOffsetUnits: off }));
    me.position.y = y; me.receiveShadow = true; grp.add(me);
  };

  function build(k, c) {
    const grp = new T.Group();
    const boxes = c.b.map(([, , p]) => {
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 1]); z1 = Math.max(z1, p[i + 1]); }
      return [x0, x1, z0, z1];
    });
    const road = [], walk = [], mark = [], trees = [];
    let tacc = 0, side = 1;
    c.r.forEach(([w, p]) => {
      let acc = 0;
      for (let i = 0; i + 3 < p.length; i += 2) {
        const x1 = p[i], z1 = p[i + 1], x2 = p[i + 2], z2 = p[i + 3], dx = x2 - x1, dz = z2 - z1, l = Math.hypot(dx, dz);
        if (l < .01) continue;
        const nx = -dz / l, nz = dx / l;
        seg(road, x1, z1, x2, z2, nx, nz, -w / 2, w / 2);
        if (w >= 5 && w <= 14) {
          seg(walk, x1, z1, x2, z2, nx, nz, w / 2, w / 2 + 2.2);
          seg(walk, x1, z1, x2, z2, nx, nz, -w / 2 - 2.2, -w / 2);
        }
        if (w >= 6) {
          for (let s = -(acc % 7); s < l; s += 7) {
            const a0 = Math.max(0, s), a1 = Math.min(l, s + 3);
            if (a1 > a0) seg(mark, x1 + dx / l * a0, z1 + dz / l * a0, x1 + dx / l * a1, z1 + dz / l * a1, nx, nz, -.08, .08);
          }
        }
        acc += l; tacc += l;
        if (w >= 6 && w <= 12 && tacc >= 16) {
          tacc = 0; side = -side;
          const tx = x1 + nx * side * (w / 2 + 1.1), tz = z1 + nz * side * (w / 2 + 1.1);
          if (!boxes.some(b => tx > b[0] - 1 && tx < b[1] + 1 && tz > b[2] - 1 && tz < b[3] + 1)) trees.push(tx, tz);
        }
      }
    });
    strip(road, 0x3b3b40, .03, -1, grp);
    strip(walk, 0xb9b2a5, .1, -2, grp);
    strip(mark, 0xf2c14e, .06, -4, grp);
    if (trees.length) {
      const n = trees.length / 2, o = new T.Object3D();
      const tr = new T.InstancedMesh(trunkG, mat(0x7a5a3a), n), cr = new T.InstancedMesh(crownG, mat(0x3f8f3a), n);
      for (let i = 0; i < n; i++) {
        o.position.set(trees[i * 2], 0, trees[i * 2 + 1]); o.scale.setScalar(.8 + ((i * 37) % 5) / 10); o.updateMatrix();
        tr.setMatrixAt(i, o.matrix); cr.setMatrixAt(i, o.matrix);
      }
      grp.add(tr, cr);
    }
    c.w.forEach(p => flat(p, 0x2b8fd6, .02, grp));
    c.g.forEach(p => flat(p, 0x4a9a4a, .02, grp));
    c.b.forEach(([h, id, p], bi) => {
      try {
        const hh = h || 6.4 + (id % 3) * 3.2;
        const g = new T.ExtrudeGeometry(shape(p), { depth: hh, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
        const me = new T.Mesh(g, [roof, wall(PAL[id % PAL.length])]); me.castShadow = me.receiveShadow = true; grp.add(me);
        const b = boxes[bi];
        colliders.push({ x0: b[0], x1: b[1], z0: b[2], z1: b[3], k, poly: p });
      } catch {}
    });
    scene.add(grp);
    loaded.set(k, grp);
  }

  function unload(k) {
    const g = loaded.get(k); scene.remove(g);
    g.traverse(o => o.geometry && !o.isInstancedMesh && o.geometry.dispose());
    for (let i = colliders.length - 1; i >= 0; i--) if (colliders[i].k === k) colliders.splice(i, 1);
    loaded.delete(k);
  }

  function update(px, pz) {
    const cx = Math.floor(px / CS), cz = Math.floor(pz / CS);
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      const k = (cx + i) + ',' + (cz + j);
      if (!loaded.has(k) && cells.has(k)) build(k, cells.get(k));
    }
    for (const k of [...loaded.keys()]) {
      const [a, b] = k.split(',').map(Number);
      if (Math.abs(a - cx) > 3 || Math.abs(b - cz) > 3) unload(k);
    }
  }

  return { spawn: d.spawn, goal: d.goal, lim: { x: m + 40, z: m + 40 }, update };
}
