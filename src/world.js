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

  // Fachadas con estilos distintos. La clasificación se calcula por geometría del sector,
  // porque el archivo cartográfico no contiene etiquetas de uso del suelo.
  const facadeTexture = style => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const x = cv.getContext('2d');
    if (style === 'commercial') {
      x.fillStyle = '#d9e0e2'; x.fillRect(0, 0, 64, 64);
      x.fillStyle = '#253d50'; x.fillRect(5, 8, 54, 48);
      x.fillStyle = '#80b8ca'; x.fillRect(8, 11, 22, 42); x.fillRect(34, 11, 22, 42);
      x.fillStyle = '#d5e0dc'; x.fillRect(30, 8, 4, 48);
      x.fillStyle = '#b8c5c8'; x.fillRect(0, 57, 64, 7);
    } else if (style === 'industrial') {
      x.fillStyle = '#aeb5b2'; x.fillRect(0, 0, 64, 64);
      x.fillStyle = '#858f91'; for (let y = 5; y < 64; y += 8) x.fillRect(0, y, 64, 2);
      x.fillStyle = '#34444a'; x.fillRect(8, 23, 48, 32);
      x.fillStyle = '#71878c'; x.fillRect(11, 26, 42, 26);
      x.fillStyle = '#c6c9c3'; x.fillRect(0, 57, 64, 7);
    } else {
      x.fillStyle = '#eee6d7'; x.fillRect(0, 0, 64, 64);
      x.fillStyle = '#cfc6b8'; x.fillRect(0, 58, 64, 6);
      x.fillStyle = '#e8e2d6'; x.fillRect(15, 11, 34, 40);
      x.fillStyle = '#2f3f52'; x.fillRect(18, 14, 28, 34);
      x.fillStyle = '#6f98b8'; x.fillRect(20, 16, 11, 14); x.fillRect(33, 16, 11, 14);
      x.fillStyle = '#e8e2d6'; x.fillRect(31, 14, 2, 34);
    }
    const texture = new T.CanvasTexture(cv);
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    texture.repeat.set(1 / 3.2, 1 / 3.2); texture.anisotropy = 4;
    return texture;
  };
  const facadeTextures = {
    residential: facadeTexture('residential'),
    commercial: facadeTexture('commercial'),
    industrial: facadeTexture('industrial')
  };
  const facadeMats = {};
  const wall = (c, style) => {
    const key = style + ':' + c;
    return facadeMats[key] || (facadeMats[key] = new T.MeshLambertMaterial({ color: c, map: facadeTextures[style] }));
  };
  const roofMats = {
    residential: mat(0x8d4b32),
    commercial: mat(0x65757b),
    industrial: mat(0x777b78)
  };
  const districtPalettes = {
    residential: [0xf2c14e, 0xe76f51, 0x2a9d8f, 0xf4a261, 0xe9c46a, 0xf1e9d8, 0xd97aa6],
    commercial: [0xb8c9d4, 0xd9d3c5, 0x8fb6c5, 0xc7b9a4, 0xe3d8c6],
    industrial: [0x9b9b91, 0xb1aaa0, 0x8e9b9e, 0xb5b1a5],
    green: [0xd5c7a7, 0xb8c9a5, 0xe0d1b5, 0xc7bda7]
  };

  const trunkG = new T.CylinderGeometry(.15, .2, 2.4, 5); trunkG.translate(0, 1.2, 0);
  const crownG = new T.SphereGeometry(1.5, 6, 5); crownG.translate(0, 3.6, 0);

  const add = (kind, f, p) => {
    const k = Math.floor(p[0] / CS) + ',' + Math.floor(p[1] / CS);
    let c = cells.get(k); if (!c) cells.set(k, c = { r: [], b: [], w: [], g: [] });
    c[kind].push(f);
  };
  let maxX = 0, maxZ = 0;
  const roads = [];
  const track = p => {
    for (let i = 0; i + 1 < p.length; i += 2) {
      maxX = Math.max(maxX, Math.abs(p[i]));
      maxZ = Math.max(maxZ, Math.abs(p[i + 1]));
    }
  };

  d.r.forEach(([w, p]) => {
    roads.push({ width: w, points: p });
    for (let i = 0; i + 3 < p.length; i += 2) {
      const segment = [p[i], p[i + 1], p[i + 2], p[i + 3]];
      const center = [(p[i] + p[i + 2]) / 2, (p[i + 1] + p[i + 3]) / 2];
      add('r', [w, segment], center);
      track(segment);
    }
  });

  d.b.forEach(f => { add('b', f, f[2]); track(f[2]); });
  d.w.forEach(f => { add('w', f, f); track(f); });
  d.g.forEach(f => { add('g', f, f); track(f); });

  // Suelo continuo para que el jugador nunca salga del terreno del mapa.
  const ground = new T.Mesh(
    new T.PlaneGeometry((maxX + 40) * 2, (maxZ + 40) * 2),
    new T.MeshLambertMaterial({ color: 0x8f8a7e })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  scene.add(ground);

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

  function districtProfile(c) {
    const avgWidth = c.r.length ? c.r.reduce((sum, item) => sum + item[0], 0) / c.r.length : 0;
    const avgFootprint = c.b.length ? c.b.reduce((sum, item) => {
      const p = item[2]; let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 1]); z1 = Math.max(z1, p[i + 1]); }
      return sum + Math.max(0, x1 - x0) * Math.max(0, z1 - z0);
    }, 0) / c.b.length : 0;
    if (avgFootprint > 700 && avgWidth >= 7) return 'industrial';
    if (c.b.length >= 55 && c.r.length >= 12) return 'commercial';
    if (c.g.length && c.b.length < 45) return 'green';
    return 'residential';
  }

  const lampPoleG = new T.CylinderGeometry(.075, .11, 5.5, 6);
  const lampHeadG = new T.BoxGeometry(.72, .14, .28);
  const utilityPoleG = new T.CylinderGeometry(.09, .14, 7.4, 6);
  const binG = new T.BoxGeometry(.48, .72, .48);
  const benchSeatG = new T.BoxGeometry(1.35, .12, .42);
  const benchBackG = new T.BoxGeometry(1.35, .55, .1);
  const benchLegG = new T.BoxGeometry(.1, .42, .1);
  const addInstances = (grp, geometry, color, items, castShadow = false) => {
    if (!items.length) return;
    const mesh = new T.InstancedMesh(geometry, mat(color), items.length);
    const dummy = new T.Object3D();
    items.forEach((item, i) => {
      dummy.position.set(item[0], item[1], item[2]);
      dummy.rotation.y = item[3] || 0;
      dummy.scale.set(item[4] || 1, item[5] || 1, item[6] || 1);
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true; mesh.castShadow = castShadow; mesh.receiveShadow = true;
    grp.add(mesh);
  };

  function build(k, c) {
    const grp = new T.Group();
    const district = districtProfile(c);
    const palette = districtPalettes[district] || districtPalettes.residential;
    const boxes = c.b.map(([, , p]) => {
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 1]); z1 = Math.max(z1, p[i + 1]); }
      return [x0, x1, z0, z1];
    });
    const road = [], walk = [], mark = [], curb = [], trees = [];
    const lamps = [], utilityPoles = [], bins = [], benches = [];
    let tacc = 0, side = 1, lampDistance = 0, poleDistance = 0, lampIndex = 0, poleIndex = 0;
    const clearFurniture = (x, z, radius = 2.2) =>
      !boxes.some(b => x > b[0] - radius && x < b[1] + radius && z > b[2] - radius && z < b[3] + radius) &&
      !trees.some((v, i) => i % 2 === 0 && Math.hypot(x - v, z - trees[i + 1]) < radius + 1);
    c.r.forEach(([w, p]) => {
      let acc = 0;
      for (let i = 0; i + 3 < p.length; i += 2) {
        const x1 = p[i], z1 = p[i + 1], x2 = p[i + 2], z2 = p[i + 3], dx = x2 - x1, dz = z2 - z1, l = Math.hypot(dx, dz);
        if (l < .01) continue;
        const nx = -dz / l, nz = dx / l;
        seg(road, x1, z1, x2, z2, nx, nz, -w / 2, w / 2);
        if (w >= 5 && w <= 14) {
          seg(walk, x1, z1, x2, z2, nx, nz, w / 2, w / 2 + 3.1);
          seg(walk, x1, z1, x2, z2, nx, nz, -w / 2 - 3.1, -w / 2);
          seg(curb, x1, z1, x2, z2, nx, nz, w / 2 + 2.95, w / 2 + 3.1);
          seg(curb, x1, z1, x2, z2, nx, nz, -w / 2 - 3.1, -w / 2 - 2.95);
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
        if (w >= 6 && w <= 12) {
          const lampStart = 52 - (lampDistance % 52);
          for (let d = lampStart; d < l; d += 52) {
            const along = d / l, lx = x1 + dx * along, lz = z1 + dz * along;
            const lampSide = lampIndex++ % 2 ? 1 : -1;
            const px = lx + nx * lampSide * (w / 2 + 2.45), pz = lz + nz * lampSide * (w / 2 + 2.45);
            if (clearFurniture(px, pz, 1.35)) {
              const angle = Math.atan2(dx, dz);
              lamps.push([px, 2.75, pz, angle]);
              if (lampIndex % 3 === 0) bins.push([px + dx / l * 2.4, .38, pz + dz / l * 2.4]);
            }
          }
          lampDistance += l;
          const poleStart = 96 - (poleDistance % 96);
          for (let d = poleStart; d < l; d += 96) {
            const along = d / l, px0 = x1 + dx * along, pz0 = z1 + dz * along;
            const poleSide = poleIndex++ % 2 ? -1 : 1;
            const px = px0 + nx * poleSide * (w / 2 + 2.7), pz = pz0 + nz * poleSide * (w / 2 + 2.7);
            if (clearFurniture(px, pz, 1.5)) utilityPoles.push([px, 3.7, pz]);
          }
          poleDistance += l;
        }
      }
    });
    strip(road, 0x3b3b40, .03, -1, grp);
    strip(walk, 0xb9b2a5, .1, -2, grp);
    strip(mark, 0xf2c14e, .06, -4, grp);
    strip(curb, 0x77766f, .12, -3, grp);
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
    const parkTrees = [];
    const insidePolygon = (x, z, p) => {
      let inside = false;
      for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
        const xi = p[i], zi = p[i + 1], xj = p[j], zj = p[j + 1];
        if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / ((zj - zi) || .0001) + xi) inside = !inside;
      }
      return inside;
    };
    c.g.forEach(p => {
      flat(p, 0x4a9a4a, .02, grp);
      let sx = 0, sz = 0, count = 0, minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (let i = 0; i < p.length; i += 2) {
        sx += p[i]; sz += p[i + 1]; count++;
        minX = Math.min(minX, p[i]); maxX = Math.max(maxX, p[i]);
        minZ = Math.min(minZ, p[i + 1]); maxZ = Math.max(maxZ, p[i + 1]);
      }
      if (count >= 4) {
        const bx = sx / count, bz = sz / count;
        benches.push([bx, .64, bz], [bx, .64, bz + 2.1]);
        bins.push([bx + 2.1, .38, bz]);
        // Vegetación de parques: puntos comprobados dentro del polígono, sin invadir calles.
        let planted = 0;
        for (let x = minX + 5; x < maxX - 3 && planted < 6; x += 11) {
          for (let z = minZ + 5; z < maxZ - 3 && planted < 6; z += 11) {
            if (insidePolygon(x, z, p) && Math.hypot(x - bx, z - bz) > 5) {
              parkTrees.push([x, z, .85 + (planted % 3) * .12]);
              planted++;
            }
          }
        }
      }
    });
    if (parkTrees.length) {
      const tr = new T.InstancedMesh(trunkG, mat(0x765238), parkTrees.length);
      const cr = new T.InstancedMesh(crownG, mat(0x397d37), parkTrees.length);
      const obj = new T.Object3D();
      parkTrees.forEach(([x, z, scale], i) => {
        obj.position.set(x, 0, z); obj.scale.setScalar(scale); obj.updateMatrix();
        tr.setMatrixAt(i, obj.matrix); cr.setMatrixAt(i, obj.matrix);
      });
      tr.instanceMatrix.needsUpdate = cr.instanceMatrix.needsUpdate = true;
      grp.add(tr, cr);
    }
    addInstances(grp, lampPoleG, 0x424b4d, lamps, true);
    addInstances(grp, lampHeadG, 0xe6d8a6, lamps.map(([x, y, z, a]) => [x + Math.sin(a) * .3, 5.45, z + Math.cos(a) * .3, a]), false);
    addInstances(grp, utilityPoleG, 0x6e5b45, utilityPoles, true);
    addInstances(grp, binG, 0x3e5550, bins, false);
    addInstances(grp, benchSeatG, 0x876b4e, benches, false);
    addInstances(grp, benchBackG, 0x6f5b45, benches.map(([x, y, z]) => [x, 1.02, z + .18]), false);
    addInstances(grp, benchLegG, 0x42413d, benches.flatMap(([x, y, z]) => [[x - .52, .25, z], [x + .52, .25, z]]), false);
    c.b.forEach(([h, id, p], bi) => {
      try {
        const hh = h || 6.4 + (id % 3) * 3.2;
        const g = new T.ExtrudeGeometry(shape(p), { depth: hh, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
        const style = district === 'green' ? 'residential' : district;
        const colors = palette;
        const facadeColor = colors[(Math.abs(id) + bi * 3) % colors.length];
        const me = new T.Mesh(g, [roofMats[style] || roofMats.residential, wall(facadeColor, style)]); me.castShadow = me.receiveShadow = true; grp.add(me);
        const b = boxes[bi], bw=b[1]-b[0], bd=b[3]-b[2], cx=(b[0]+b[1])/2, cz=(b[2]+b[3])/2;
        // Detalles habituales de viviendas dominicanas: tinacos y balcones sencillos.
        if (bw>3.5 && bd>3.5 && bi%4===0) {
          const tank = new T.Mesh(new T.CylinderGeometry(.42,.48,1.05,7),mat(0x303b42));
          tank.position.set(cx,hh+.53,cz); tank.castShadow=true; grp.add(tank);
          const lid = new T.Mesh(new T.CylinderGeometry(.43,.43,.08,7),mat(0x59656b));
          lid.position.set(cx,hh+1.08,cz); grp.add(lid);
        }
        if (bw>5 && bd>5 && bi%7===0) {
          const balconyW=Math.min(3.8,bw*.55), front=cz-bd/2-.34, by=Math.min(hh-1.2,3.1);
          const deck=new T.Mesh(new T.BoxGeometry(balconyW,.12,.72),mat(0x9c9387));
          deck.position.set(cx,by,front); grp.add(deck);
          const rail=new T.Mesh(new T.BoxGeometry(balconyW,.12,.08),mat(0x333b40));
          rail.position.set(cx,by+.55,front-.3); grp.add(rail);
          for(let post=-1;post<=1;post++){const bar=new T.Mesh(new T.BoxGeometry(.07,.55,.07),mat(0x333b40));bar.position.set(cx+post*balconyW/2,by+.28,front-.3);grp.add(bar)}
        }
        // Obras pequeñas en edificios seleccionados: andamios, tablones y materiales.
        // Son detalles visuales; no alteran el acceso ni la colisión del edificio.
        if (bw > 7 && bd > 7 && bi % 19 === 6) {
          const span = Math.min(4.8, bw * .62), front = b[2] - .72;
          const left = cx - span / 2, right = cx + span / 2;
          const poleMat = mat(0x68777a), plankMat = mat(0xb58b58);
          for (const x of [left, right]) {
            const pole = new T.Mesh(new T.BoxGeometry(.12, hh + .8, .12), poleMat);
            pole.position.set(x, (hh + .8) / 2, front); pole.castShadow = true; grp.add(pole);
            for (let y = 1.8; y < hh; y += 2.1) {
              const brace = new T.Mesh(new T.BoxGeometry(.1, .1, 1.35), poleMat);
              brace.position.set(x, y, front + .55); grp.add(brace);
            }
          }
          for (let y = 1.7; y < hh; y += 2.1) {
            const rail = new T.Mesh(new T.BoxGeometry(span + .18, .1, .1), poleMat);
            rail.position.set(cx, y, front); grp.add(rail);
            const deck = new T.Mesh(new T.BoxGeometry(span + .28, .12, .72), plankMat);
            deck.position.set(cx, y + .18, front + .3); deck.castShadow = true; grp.add(deck);
          }
          for (let i = 0; i < 3; i++) {
            const bag = new T.Mesh(new T.BoxGeometry(.62, .42, .48), mat(i % 2 ? 0xc7bda7 : 0xb9b0a0));
            bag.position.set(right + .55 + (i % 2) * .12, .22 + Math.floor(i / 2) * .43, front + .25);
            grp.add(bag);
          }
          const warning = new T.Mesh(new T.BoxGeometry(1.35, .72, .08), mat(0xe0ad35));
          warning.position.set(cx, .72, front - .38); grp.add(warning);
        }
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

  // Huellas de edificios para colocar comercios y puntos de interés sin invadirlos.
  const insidePoly = (x, z, p) => {
    let ins = false;
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      const xi = p[i], zi = p[i + 1], xj = p[j], zj = p[j + 1];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / ((zj - zi) || 1e-6) + xi) ins = !ins;
    }
    return ins;
  };
  const buildings = d.b.map(f => {
    const p = f[2];
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < p.length; i += 2) {
      x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]);
      z0 = Math.min(z0, p[i + 1]); z1 = Math.max(z1, p[i + 1]);
    }
    return { poly: p, x0, x1, z0, z1 };
  });
  const freeAt = (x, z, pad = .6) => !buildings.some(b =>
    x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad && insidePoly(x, z, b.poly));

  // El punto de aparición del generador cae en el eje de la calle: lo movemos a la acera.
  const nearestRoad = (x, z, minWidth = 5) => {
    let best = null, bestD = Infinity;
    for (const r of roads) {
      if (r.width < minWidth) continue;
      const p = r.points;
      for (let i = 0; i + 3 < p.length; i += 2) {
        const ax = p[i], az = p[i + 1], bx = p[i + 2], bz = p[i + 3];
        const l2 = (bx - ax) ** 2 + (bz - az) ** 2;
        let u = l2 ? ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / l2 : 0;
        u = Math.max(0, Math.min(1, u));
        const px = ax + (bx - ax) * u, pz = az + (bz - az) * u;
        const d2 = (x - px) ** 2 + (z - pz) ** 2;
        if (d2 < bestD) { bestD = d2; best = { x: px, z: pz, width: r.width, dx: (bx - ax) / Math.sqrt(l2 || 1), dz: (bz - az) / Math.sqrt(l2 || 1) }; }
      }
    }
    return best;
  };
  let spawn = d.spawn.slice();
  const spawnRoad = nearestRoad(spawn[0], spawn[1]);
  let moto = [spawn[0] + 2.2, spawn[1], 0];
  if (spawnRoad) {
    const nx = -spawnRoad.dz, nz = spawnRoad.dx;
    let spawnSide = 1;
    for (const [side, extra] of [[1, 2.3], [-1, 2.3], [1, 1.6], [-1, 1.6]]) {
      const x = spawnRoad.x + nx * side * (spawnRoad.width / 2 + extra), z = spawnRoad.z + nz * side * (spawnRoad.width / 2 + extra);
      if (freeAt(x, z, 1)) { spawn = [x, z]; spawnSide = side; break; }
    }
    // La moto se aparca en el contención, a un lado del jugador, no delante de la cámara.
    for (const d of [-2.6, 2.6, -3.8, 3.8]) {
      const x = spawn[0] + spawnRoad.dx * d - nx * spawnSide * 1.5;
      const z = spawn[1] + spawnRoad.dz * d - nz * spawnSide * 1.5;
      if (freeAt(x, z, .8)) { moto = [x, z, Math.atan2(spawnRoad.dx, spawnRoad.dz)]; break; }
    }
  }
  // El objetivo debe ser alcanzable: si cae dentro de un edificio, se lleva a la vía más cercana.
  let goal = d.goal.slice();
  if (!freeAt(goal[0], goal[1], 0)) {
    const g = nearestRoad(goal[0], goal[1]);
    if (g) goal = [g.x, g.z];
  }
  return { spawn, goal, moto, roads, buildings, greens: d.g, lim: { x: maxX + 40, z: maxZ + 40 }, update };
}
