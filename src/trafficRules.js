// Reglas puras de seguridad vial para poder probarlas sin WebGL.
export function pedestrianAhead(vx, vz, dx, dz, pedestrians = [], maxForward = 11, maxLateral = 2.5) {
  let best = null;
  for (const p of pedestrians) {
    if (!p?.g?.visible) continue;
    const px = p.g.position.x - vx, pz = p.g.position.z - vz;
    if (Math.hypot(px, pz) > 12) continue;
    const forward = px * dx + pz * dz;
    const lateral = Math.abs(px * dz - pz * dx);
    if (forward > 0 && forward < maxForward && lateral < maxLateral) {
      if (!best || forward < best.forward) best = { forward, lateral, pedestrian: p };
    }
  }
  return best;
}

export function pedestrianTarget(forward, minimumGap = 2.2) {
  return Math.max(0, (forward - minimumGap) * 1.1);
}
