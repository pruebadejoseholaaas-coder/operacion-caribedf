// Cargador del mundo real (datos de OpenStreetMap) con carga y descarga por chunks.
const CS = 200; // tamaño de chunk en metros
const PAL = [0xf2c14e, 0xe76f51, 0x2a9d8f, 0xf4a261, 0xe9c46a, 0xf1e9d8, 0x6ec1e4, 0xd97aa6, 0xb7d968];

export async function loadWorld(T, scene, colliders) {
  let d;
  try {
    const r = await fetch(import.meta.env.BASE_URL + 'world/world.json');
    if (!r.ok) return null;
    d = await r.json();
  } catch { return null; }

  const cells = new Map(), loaded = new Map(), mats = {};
  const mat = (c, o = {}) => mats[c] || (mats[c] = new T.MeshLambertMaterial({ color: c, ...o }));
  const add = (kind, f, p) => {
    const k = Math.floor(p[0] / CS) + ',' + Math.floor(p[1] / CS);
    let c = cells.get(k); if (!c) cells.set(k, c = { r: [], b: [], w: [], g: [] });
    c[kind].push(f);
  };
  let m = 0;
  d.r.forEach(f => { add('r', f, f[1]); f[1].forEach(v => m = Math.max(m, Math.abs(v))); });
  d.b.forEach(f => add('b', f, f[2]));
  d.w.forEach(f => add('w', f, f[0]));
  d.g.forEach(f => add('g', f, f[0]));

  const shape = p => { const s = new T.Shape(); for (let i = 0; i < p.length; i += 2) i ? s.lineTo(p[i], -p[i + 1]) : s.moveTo(p[i], -p[i + 1]); return s; };
  const flat = (p, c, y, grp) => {
    try {
      const g = new T.ShapeGeometry(shape(p)); g.rotateX(-Math.PI / 2);
      const me = new T.Mesh(g, mat(c)); me.position.y = y; me.receiveShadow = true; grp.add(me);
    } catch {}
  };

  function build(k, c) {
    const grp = new T.Group();
    // Calles: una cinta por tramo, todo en una sola geometría
    const pos = [];
    c.r.forEach(([w, p]) => {
      for (let i = 0; i + 3 < p.length; i += 2) {
        const x1 = p[i], z1 = p[i + 1], x2 = p[i + 2], z2 = p[i + 3], dx = x2 - x1, dz = z2 - z1, l = Math.hypot(dx, dz);
        if (l < .01) continue;
        const nx = -dz / l * w / 2, nz = dx / l * w / 2;
        const A = [x1 + nx, 0, z1 + nz], B = [x1 - nx, 0, z1 - nz], C = [x2 + nx, 0, z2 + nz], D = [x2 - nx, 0, z2 - nz];
        pos.push(...A, ...C, ...B, ...B, ...C, ...D);
      }
    });
    if (pos.length) {
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new T.Float32BufferAttribute(pos.map((_, i) => i % 3 === 1 ? 1 : 0), 3));
      const me = new T.Mesh(g, mat(0x3b3b40, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      me.position.y = .03; me.receiveShadow = true; grp.add(me);
    }
    c.w.forEach(p => flat(p, 0x2b8fd6, .02, grp));
    c.g.forEach(p => flat(p, 0x4a9a4a, .02, grp));
    // Edificios
    c.b.forEach(([h, id, p]) => {
      try {
        const hh = h || 6.4 + (id % 3) * 3.2;
        const g = new T.ExtrudeGeometry(shape(p), { depth: hh, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
        const me = new T.Mesh(g, mat(PAL[id % PAL.length])); me.castShadow = me.receiveShadow = true; grp.add(me);
        let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
        for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 1]); z1 = Math.max(z1, p[i + 1]); }
        colliders.push({ x0: x0 + .3, x1: x1 - .3, z0: z0 + .3, z1: z1 - .3, k });
      } catch {}
    });
    scene.add(grp);
    loaded.set(k, grp);
  }

  function unload(k) {
    const g = loaded.get(k); scene.remove(g);
    g.traverse(o => o.geometry && o.geometry.dispose());
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
