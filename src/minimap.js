// Minimapa circular estilo GTA y mapa completo. El callejero se pre-renderiza una vez
// y luego solo se recorta y gira alrededor del jugador.
export function createMinimap(world, sources, options = {}) {
  const small = document.getElementById('minimap');
  const wrap = document.getElementById('bigmap');
  const big = document.getElementById('bigmap-canvas');
  if (!small || !big) return { update() {}, toggle() {} };
  const mobile = !!options.mobile;
  const radius = mobile ? 64 : 100;
  const scale = mobile ? 1.05 : 1.45;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  small.width = small.height = radius * 2 * dpr;
  small.style.width = small.style.height = radius * 2 + 'px';
  const ctx = small.getContext('2d');
  ctx.scale(dpr, dpr);

  const roads = world.roads || [];
  const buildings = world.buildings || [];
  const spawn = world.spawn || [0, 0];
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const r of roads) for (let i = 0; i < r.points.length; i += 2) {
    minX = Math.min(minX, r.points[i]); maxX = Math.max(maxX, r.points[i]);
    minZ = Math.min(minZ, r.points[i + 1]); maxZ = Math.max(maxZ, r.points[i + 1]);
  }
  const PAD = 30;
  minX -= PAD; maxX += PAD; minZ -= PAD; maxZ += PAD;
  const MAP_PPM = 2; // píxeles del mapa estático por metro
  const map = document.createElement('canvas');
  map.width = Math.ceil((maxX - minX) * MAP_PPM);
  map.height = Math.ceil((maxZ - minZ) * MAP_PPM);
  const mctx = map.getContext('2d');
  const toMap = (x, z) => [(x - minX) * MAP_PPM, (z - minZ) * MAP_PPM];

  mctx.fillStyle = '#20242a'; mctx.fillRect(0, 0, map.width, map.height);
  mctx.fillStyle = '#2f4a35';
  for (const g of world.greens || []) {
    mctx.beginPath();
    for (let i = 0; i < g.length; i += 2) {
      const [x, y] = toMap(g[i], g[i + 1]);
      i ? mctx.lineTo(x, y) : mctx.moveTo(x, y);
    }
    mctx.closePath(); mctx.fill();
  }
  mctx.fillStyle = '#3b3f46';
  for (const b of buildings) {
    mctx.beginPath();
    for (let i = 0; i < b.poly.length; i += 2) {
      const [x, y] = toMap(b.poly[i], b.poly[i + 1]);
      i ? mctx.lineTo(x, y) : mctx.moveTo(x, y);
    }
    mctx.closePath(); mctx.fill();
  }
  mctx.lineCap = 'round'; mctx.lineJoin = 'round';
  for (const pass of [{ color: '#5a5e66', extra: 1.6 }, { color: '#9aa0a8', extra: 0 }]) {
    mctx.strokeStyle = pass.color;
    for (const r of roads) {
      if (r.width < 4) continue;
      mctx.lineWidth = Math.max(1, (r.width + pass.extra) * MAP_PPM);
      mctx.beginPath();
      for (let i = 0; i < r.points.length; i += 2) {
        const [x, y] = toMap(r.points[i], r.points[i + 1]);
        i ? mctx.lineTo(x, y) : mctx.moveTo(x, y);
      }
      mctx.stroke();
    }
  }

  const openColor = '#e8b04b', closedColor = '#6d727a';
  let last = 0, showBig = false;

  function drawSmall(now, player, yaw, rot) {
    const cx = radius, cy = radius;
    ctx.clearRect(0, 0, radius * 2, radius * 2);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#20242a'; ctx.fillRect(0, 0, radius * 2, radius * 2);
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(yaw); ctx.scale(scale, scale); ctx.translate(-player.x, -player.z);
    ctx.drawImage(map, minX, minZ, maxX - minX, maxZ - minZ);
    const shops = sources.shops ? sources.shops() : [];
    for (const s of shops) {
      const dx = s.g.position.x - player.x, dz = s.g.position.z - player.z;
      if (dx * dx + dz * dz > 4200) continue;
      ctx.fillStyle = s.open ? openColor : closedColor;
      ctx.beginPath(); ctx.arc(s.g.position.x, s.g.position.z, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    const stops = sources.stops ? sources.stops() : [];
    ctx.fillStyle = '#4fb3ff';
    for (const st of stops) {
      const dx = st.x - player.x, dz = st.z - player.z;
      if (dx * dx + dz * dz > 8100) continue;
      ctx.fillRect(st.x - 1.6, st.z - 1.6, 3.2, 3.2);
    }
    const cars = sources.vehicles ? sources.vehicles() : [];
    ctx.fillStyle = '#f3ead8';
    for (const v of cars) {
      if (!v.g.visible) continue;
      const dx = v.g.position.x - player.x, dz = v.g.position.z - player.z;
      if (dx * dx + dz * dz > 8100) continue;
      ctx.beginPath(); ctx.arc(v.g.position.x, v.g.position.z, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    const npcs = sources.npcs ? sources.npcs() : [];
    ctx.fillStyle = '#d9e6ef';
    for (const n of npcs) {
      if (!n.g.visible) continue;
      const dx = n.g.position.x - player.x, dz = n.g.position.z - player.z;
      if (dx * dx + dz * dz > 2600) continue;
      ctx.beginPath(); ctx.arc(n.g.position.x, n.g.position.z, 1.1, 0, Math.PI * 2); ctx.fill();
    }
    const home = sources.home ? sources.home() : null;
    if (home) {
      ctx.fillStyle = '#7fe0a8';
      ctx.beginPath(); ctx.arc(home.x, home.z, 2.8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#10241a'; ctx.lineWidth = .8; ctx.stroke();
    }
    const job = sources.job ? sources.job() : null;
    if (job) {
      ctx.strokeStyle = '#4fb3ff'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(job.x, job.z, 4.2 + Math.sin(now / 240) * .8, 0, Math.PI * 2); ctx.stroke();
    }
    const shift = sources.shift ? sources.shift() : null;
    if (shift) {
      const color = '#' + (shift.color || 0xf4a261).toString(16).padStart(6, '0');
      ctx.strokeStyle = color; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(shift.x, shift.z, 4.2 + Math.sin(now / 240) * .8, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(shift.x, shift.z, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    const mission = sources.mission ? sources.mission() : null;
    if (mission) {
      const color = '#' + (mission.color || 0xffc857).toString(16).padStart(6, '0');
      ctx.strokeStyle = color; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(mission.x, mission.z, 4.6 + Math.sin(now / 220) * .8, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(mission.x, mission.z, 1.7, 0, Math.PI * 2); ctx.fill();
    }
    const goal = sources.goal ? sources.goal() : null;
    if (goal) {
      const pulse = 3.4 + Math.sin(now / 260) * 1.1;
      ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(goal.x, goal.z, pulse, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(goal.x, goal.z, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // Borde, norte y flecha del jugador (en espacio de pantalla).
    ctx.strokeStyle = 'rgba(255,240,210,.75)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2); ctx.stroke();
    const nx = Math.sin(-yaw) * (radius - 12), ny = -Math.cos(-yaw) * (radius - 12);
    ctx.fillStyle = '#ff6b5a'; ctx.font = 'bold 10px Trebuchet MS'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('N', cx + nx, cy + ny);

    const a = Math.atan2(Math.sin(rot - yaw), -Math.cos(rot - yaw));
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(0, 3.4); ctx.lineTo(-5, 6); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  function drawBig(player, rot) {
    const box = big.getBoundingClientRect();
    big.width = box.width * dpr; big.height = box.height * dpr;
    const b = big.getContext('2d');
    b.setTransform(dpr, 0, 0, dpr, 0, 0);
    b.fillStyle = '#14171b'; b.fillRect(0, 0, box.width, box.height);
    // Mapa de la ciudad alrededor del jugador (300 m por lado), no todo el término municipal.
    const R = 300, side = Math.min(box.width, box.height);
    const ox = (box.width - side) / 2, oy = (box.height - side) / 2;
    const sx = (player.x - R - minX) * MAP_PPM, sy = (player.z - R - minZ) * MAP_PPM;
    b.drawImage(map, sx, sy, 2 * R * MAP_PPM, 2 * R * MAP_PPM, ox, oy, side, side);
    const P = (x, z) => [ox + (x - (player.x - R)) / (2 * R) * side, oy + (z - (player.z - R)) / (2 * R) * side];
    for (const shop of sources.shops ? sources.shops() : []) {
      const [x, y] = P(shop.g.position.x, shop.g.position.z);
      b.fillStyle = shop.open ? openColor : closedColor;
      b.beginPath(); b.arc(x, y, 3, 0, Math.PI * 2); b.fill();
    }
    const stops = sources.stops ? sources.stops() : [];
    b.fillStyle = '#4fb3ff';
    for (const st of stops) { const [x, y] = P(st.x, st.z); b.fillRect(x - 2, y - 2, 4, 4); }
    const cars = sources.vehicles ? sources.vehicles() : [];
    b.fillStyle = '#f3ead8';
    for (const v of cars) {
      if (!v.g.visible) continue;
      const [x, y] = P(v.g.position.x, v.g.position.z);
      b.beginPath(); b.arc(x, y, 2, 0, Math.PI * 2); b.fill();
    }
    const home = sources.home ? sources.home() : null;
    if (home) {
      const [x, y] = P(home.x, home.z);
      b.fillStyle = '#7fe0a8'; b.beginPath(); b.arc(x, y, 4, 0, Math.PI * 2); b.fill();
      b.fillStyle = '#c9f5dc'; b.font = 'bold 11px Trebuchet MS'; b.textAlign = 'center';
      b.fillText('Casa', x, y + 16);
    }
    const job = sources.job ? sources.job() : null;
    if (job) {
      const [x, y] = P(job.x, job.z);
      b.strokeStyle = '#4fb3ff'; b.lineWidth = 2.5;
      b.beginPath(); b.arc(x, y, 7, 0, Math.PI * 2); b.stroke();
    }
    const shift = sources.shift ? sources.shift() : null;
    if (shift) {
      const [x, y] = P(shift.x, shift.z);
      const color = '#' + (shift.color || 0xf4a261).toString(16).padStart(6, '0');
      b.strokeStyle = color; b.lineWidth = 2.5;
      b.beginPath(); b.arc(x, y, 7, 0, Math.PI * 2); b.stroke();
      b.fillStyle = color; b.beginPath(); b.arc(x, y, 3, 0, Math.PI * 2); b.fill();
      b.font = 'bold 11px Trebuchet MS'; b.textAlign = 'center';
      b.fillText('Trabajo', x, y + 18);
    }
    const mission = sources.mission ? sources.mission() : null;
    if (mission) {
      const [x, y] = P(mission.x, mission.z);
      const color = '#' + (mission.color || 0xffc857).toString(16).padStart(6, '0');
      b.strokeStyle = color; b.lineWidth = 2.5;
      b.beginPath(); b.arc(x, y, 7, 0, Math.PI * 2); b.stroke();
      b.fillStyle = color; b.beginPath(); b.arc(x, y, 3, 0, Math.PI * 2); b.fill();
      b.font = 'bold 11px Trebuchet MS'; b.textAlign = 'center';
      b.fillText('Encargo', x, y + 18);
    }
    const goal = sources.goal ? sources.goal() : null;
    if (goal) {
      const [x, y] = P(goal.x, goal.z);
      b.strokeStyle = '#ffd166'; b.lineWidth = 2.5;
      b.beginPath(); b.arc(x, y, 8, 0, Math.PI * 2); b.stroke();
      b.fillStyle = '#ffd166'; b.beginPath(); b.arc(x, y, 3, 0, Math.PI * 2); b.fill();
      b.fillStyle = '#ffe9b0'; b.font = 'bold 12px Trebuchet MS'; b.textAlign = 'center';
      b.fillText('Encuentro', x, y + 20);
    }
    const [px, py] = P(player.x, player.z);
    b.save(); b.translate(px, py); b.rotate(Math.atan2(Math.sin(rot), -Math.cos(rot)));
    b.fillStyle = '#fff'; b.strokeStyle = '#111'; b.lineWidth = 2;
    b.beginPath(); b.moveTo(0, -11); b.lineTo(7, 9); b.lineTo(0, 5); b.lineTo(-7, 9); b.closePath(); b.fill(); b.stroke();
    b.restore();
  }

  function update(player, yaw, rot, now) {
    if (now - last < (mobile ? 80 : 50)) return;
    last = now;
    drawSmall(now, player, yaw, rot);
    if (showBig) drawBig(player, rot);
  }

  function toggle(force) {
    showBig = force === undefined ? !showBig : force;
    wrap.style.display = showBig ? 'flex' : 'none';
  }
  document.getElementById('bigmap-close')?.addEventListener('click', () => toggle(false));
  function setVisible(v) { small.style.display = v ? 'block' : 'none'; }
  return { update, toggle, setVisible, isOpen: () => showBig };
}
