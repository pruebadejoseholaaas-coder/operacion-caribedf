// Cadena de misión urbana: comprar el recado, entregarlo y cocinarlo en casa.
const KEY = 'operacion-caribe-mission-v1';
const TEXT = [
  'Compra 2 libras de arroz y 1 aceite en Colmado El Buen Vecino.',
  'Lleva el recado a Empanadas Doña Rosa y pulsa E para entregarlo.',
  'Vuelve a casa y cocina la comida en la cocina.',
  'Completada. Doña Rosa te agradece el favor.'
];

export function createMissionSystem(T, scene, opts) {
  let state = { step: 0, completed: false };
  try {
    const old = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (old && Number.isFinite(old.step)) state = { step: Math.max(0, Math.min(3, old.step | 0)), completed: !!old.completed };
  } catch {}
  const marker = new T.Group();
  const ring = new T.Mesh(new T.TorusGeometry(1.5, .14, 8, 26), new T.MeshBasicMaterial({ color: 0xffc857 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .2; marker.add(ring);
  const beam = new T.Mesh(new T.CylinderGeometry(.09, .09, 7, 8), new T.MeshBasicMaterial({ color: 0xffc857, transparent: true, opacity: .42 }));
  beam.position.y = 3.5; marker.add(beam);
  marker.visible = false; scene.add(marker);

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
  const shop = id => (opts.shops() || []).find(s => s.data.id === id);
  const door = s => {
    const r = s.g.rotation.y;
    return { x: s.g.position.x + Math.sin(r) * 4.1, z: s.g.position.z + Math.cos(r) * 4.1 };
  };
  function refresh() {
    if (state.completed || state.step >= 3) { marker.visible = false; return; }
    let x = 0, z = 0;
    if (state.step === 0) { const s = shop('colmado'); if (!s) return; const d = door(s); x = d.x; z = d.z; }
    else if (state.step === 1) { const s = shop('empanadas'); if (!s) return; const d = door(s); x = d.x; z = d.z; }
    else { const h = opts.home(); if (!h) return; x = h.x; z = h.z; }
    marker.position.set(x, 0, z); marker.visible = true;
  }
  function advance(step, text) {
    state.step = step; save(); refresh(); opts.toast(text, 4200);
  }
  function update(dt, pos, inv) {
    if (state.completed || state.step !== 0) return;
    if ((inv['Arroz (libra)'] || 0) >= 2 && (inv['Aceite'] || 0) >= 1) {
      advance(1, 'Recado listo. Llévalo a Empanadas Doña Rosa.');
    }
  }
  function interact(pos) {
    if (state.completed || state.step !== 1) return false;
    const s = shop('empanadas'); if (!s) return false;
    const d = door(s);
    if (Math.hypot(pos.x - d.x, pos.z - d.z) > 8) return false;
    const inv = opts.inventory();
    if ((inv['Arroz (libra)'] || 0) < 2 || (inv['Aceite'] || 0) < 1) {
      opts.toast('Te falta el recado: 2 arroz y 1 aceite.', 3200);
      return true;
    }
    opts.consume('Arroz (libra)', 2); opts.consume('Aceite', 1);
    advance(2, 'Recado entregado. Vuelve a casa y cocina la comida.');
    return true;
  }
  function cookDone() {
    if (state.completed || state.step !== 2) return false;
    state.step = 3; state.completed = true; save(); marker.visible = false;
    opts.addCash(650); opts.addRep(8);
    opts.toast('Misión completada: El recado de Doña Rosa · +RD$ 650 · Reputación +8', 5200);
    return true;
  }
  function info() {
    return {
      title: 'El recado de Doña Rosa',
      text: TEXT[Math.min(3, state.step)],
      step: state.step,
      completed: state.completed,
      reward: 650
    };
  }
  function markerPos() {
    if (!marker.visible) return null;
    return { x: marker.position.x, z: marker.position.z, color: 0xffc857 };
  }
  refresh();
  if (!state.completed && state.step === 0) setTimeout(() => opts.toast('Nuevo encargo: El recado de Doña Rosa. Revisa el teléfono (P).', 4600), 1600);
  return { update, interact, cookDone, info, marker: markerPos, state: () => ({ ...state }) };
}
