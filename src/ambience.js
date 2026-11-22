// Ambiente visual: farolas encendidas, ventanas iluminadas, charcos, nubes y viento.
export function createAmbience(T, scene, world, options = {}) {
  const mobile = !!options.mobile;
  const group = new T.Group(); scene.add(group);
  const nightColor = new T.Color(0xffd38a);

  const bulbMat = new T.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: .9 });
  const bulbs = Array.from({ length: mobile ? 4 : 8 }, () => {
    const m = new T.Mesh(new T.SphereGeometry(.16, 6, 6), bulbMat);
    m.visible = false; group.add(m); return m;
  });
  const lights = Array.from({ length: mobile ? 4 : 8 }, () => {
    const l = new T.PointLight(0xffd9a0, 0, 28, 2);
    scene.add(l); return l;
  });
  const fill = new T.PointLight(0xffe0b8, 0, 18, 2);
  scene.add(fill);

  const windowMat = new T.MeshBasicMaterial({ color: nightColor, transparent: true, opacity: .82, depthWrite: false, side: T.DoubleSide });
  const windows = Array.from({ length: mobile ? 18 : 36 }, () => {
    const m = new T.Mesh(new T.PlaneGeometry(.82, 1.02), windowMat);
    m.visible = false; group.add(m); return m;
  });

  const puddleMat = new T.MeshBasicMaterial({ color: 0x6c9bb4, transparent: true, opacity: .3, depthWrite: false });
  const puddles = Array.from({ length: mobile ? 12 : 28 }, () => {
    const m = new T.Mesh(new T.CircleGeometry(1.25, 12), puddleMat);
    m.rotation.x = -Math.PI / 2; m.visible = false; group.add(m); return m;
  });

  const cloudMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .22, depthWrite: false, fog: false });
  const clouds = [];
  for (let i = 0; i < (mobile ? 7 : 12); i++) {
    const g = new T.Group();
    const parts = 3 + (i % 3);
    for (let j = 0; j < parts; j++) {
      const s = new T.Mesh(new T.SphereGeometry(2.8 + Math.random() * 3.2, 6, 5), cloudMat);
      s.position.set((Math.random() - .5) * 11, Math.random() * 2, (Math.random() - .5) * 7);
      s.scale.y = .42; g.add(s);
    }
    g.position.set((Math.random() - .5) * 220, 36 + Math.random() * 18, (Math.random() - .5) * 220);
    scene.add(g); clouds.push(g);
  }

  let lampT = 0, windowT = 0, puddleT = 0, lastNight = null, lastRain = false, lastCandidates = 0;

  function updateStreetLights(pos, night) {
    const lamps = typeof world.lamps === 'function' ? world.lamps() : (world.lamps || []);
    const near = lamps
      .map(l => ({ l, d: Math.hypot(l[0] - pos.x, l[2] - pos.z) }))
      .filter(o => o.d < 120)
      .sort((a, b) => a.d - b.d)
      .slice(0, lights.length);
    lights.forEach((light, i) => {
      const o = near[i];
      if (!o || !night) { light.intensity = 0; bulbs[i].visible = false; return; }
      light.position.set(o.l[0], o.l[1], o.l[2]);
      light.intensity = 2.0;
      bulbs[i].position.copy(light.position);
      bulbs[i].visible = true;
    });
  }

  function updateWindows(pos, night) {
    let wi = 0;
    const buildings = (world.buildings || [])
      .map(b => ({ b, d: Math.hypot((b.x0 + b.x1) / 2 - pos.x, (b.z0 + b.z1) / 2 - pos.z) }))
      .filter(o => o.d < 85)
      .sort((a, b) => a.d - b.d)
      .slice(0, 10);
    for (const { b } of buildings) {
      if (b.height < 4.5) continue;
      const p = b.poly;
      let best = null, bestLen = 0;
      for (let i = 0; i + 3 < p.length; i += 2) {
        const ax = p[i], az = p[i + 1], bx = p[i + 2], bz = p[i + 3];
        const len = Math.hypot(bx - ax, bz - az);
        if (len > bestLen) { bestLen = len; best = [ax, az, bx, bz]; }
      }
      if (!best || bestLen < 3) continue;
      const [ax, az, bx, bz] = best;
      const mx = (ax + bx) / 2, mz = (az + bz) / 2;
      const ux = (bx - ax) / bestLen, uz = (bz - az) / bestLen;
      const nx = uz, nz = -ux;
      const levels = Math.min(3, Math.floor((b.height - 2.4) / 2.7));
      for (let level = 0; level < levels && wi < windows.length; level++) {
        for (const k of [-.28, 0, .28]) {
          if (wi >= windows.length) break;
          const w = windows[wi++];
          w.position.set(mx + ux * bestLen * k + nx * .08, 2.2 + level * 2.7, mz + uz * bestLen * k + nz * .08);
          w.rotation.y = Math.atan2(nx, nz);
          w.visible = night;
        }
      }
    }
    for (; wi < windows.length; wi++) windows[wi].visible = false;
  }

  function updatePuddles(pos, raining) {
    lastRain = raining;
    if (!raining) { for (const p of puddles) p.visible = false; return; }
    const roads = world.roads || [], candidates = [];
    for (const r of roads) {
      if (!r.points || r.points.length < 4) continue;
      const q = r.points;
      for (let j = 0; j + 3 < q.length; j += 2) {
        const x = (q[j] + q[j + 2]) / 2, z = (q[j + 1] + q[j + 3]) / 2;
        const d = Math.hypot(x - pos.x, z - pos.z);
        if (d > 4 && d < 90) candidates.push({ x, z, dx: q[j + 2] - q[j], dz: q[j + 3] - q[j + 1], w: r.width });
      }
    }
    lastCandidates = candidates.length;
    if (!candidates.length) { for (const p of puddles) p.visible = false; return; }
    for (const p of puddles) {
      const far = !p.userData.road || Math.hypot(p.position.x - pos.x, p.position.z - pos.z) > 95;
      if (far) {
        const road = candidates[Math.floor(Math.random() * candidates.length)];
        const len = Math.hypot(road.dx, road.dz) || 1;
        const nx = -road.dz / len, nz = road.dx / len;
        const off = (Math.random() - .5) * Math.max(1, road.w * .5);
        p.position.set(road.x + nx * off, .045, road.z + nz * off);
        p.userData.road = road;
        p.scale.setScalar(.6 + Math.random() * 1.1);
      }
      p.visible = true;
      p.material.opacity = .22 + Math.sin(performance.now() / 900 + p.position.x) * .05;
    }
  }

  function update(dt, pos, clock, weatherIndex, night) {
    const weather = weatherIndex | 0;
    if (night !== lastNight) { lastNight = night; lampT = 1; windowT = 1; }
    fill.position.set(pos.x, 2.4, pos.z);
    fill.intensity = night ? .55 : 0;
    // Nubes: deriva lenta y color según el clima.
    cloudMat.color.setHex(night ? 0x5c6b7a : weather === 2 ? 0x88949c : weather === 1 || weather === 3 ? 0xd7dde0 : 0xffffff);
    cloudMat.opacity = weather === 2 ? .46 : weather === 1 || weather === 3 ? .32 : night ? .16 : .22;
    for (const c of clouds) {
      c.position.x += dt * (1.1 + weather * .25);
      c.position.z += dt * .18;
      if (c.position.x - pos.x > 150) c.position.x = pos.x - 150;
      if (c.position.x - pos.x < -150) c.position.x = pos.x + 150;
      if (c.position.z - pos.z > 150) c.position.z = pos.z - 150;
      if (c.position.z - pos.z < -150) c.position.z = pos.z + 150;
    }
    if ((lampT += dt) > .25) { lampT = 0; updateStreetLights(pos, night); }
    if ((windowT += dt) > .6) { windowT = 0; updateWindows(pos, night); }
    if ((puddleT += dt) > .55) { puddleT = 0; updatePuddles(pos, weather === 2); }
  }

  return {
    update, group,
    stats: () => ({
      lights: lights.filter(l => l.intensity > 0).length,
      windows: windows.filter(w => w.visible).length,
      puddles: puddles.filter(p => p.visible).length,
      rain: lastRain, candidates: lastCandidates,
      clouds: clouds.length
    })
  };
}
