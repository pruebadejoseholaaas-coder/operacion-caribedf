// Audio procedural: ambiente, lluvia, motor, radio y música sin archivos externos.
export function createAudio() {
  let ctx = null, master = null, ambient = null, ambientFilter = null, rain = null, engine = null, engineOsc = null;
  let started = false, muted = false, volume = .55, radioTimer = null, radioStation = -1;
  const patterns = [
    [523, 659, 784, 659, 587, 698, 880, 698],
    [440, 523, 659, 523, 392, 494, 587, 494],
    [330, 392, 440, 494, 440, 392, 330, 294]
  ];

  function note(freq, dur, type = 'triangle', gain = .03) {
    if (!ctx || muted) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + .02);
    g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + dur);
    o.connect(g).connect(master);
    o.start(); o.stop(ctx.currentTime + dur + .02);
  }

  function start() {
    if (started) { ctx?.resume?.(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : volume; master.connect(ctx.destination);
      const len = Math.floor(ctx.sampleRate * 2), buf = ctx.createBuffer(1, len, ctx.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

      const wind = ctx.createBufferSource(); wind.buffer = buf; wind.loop = true;
      ambientFilter = ctx.createBiquadFilter(); ambientFilter.type = 'lowpass'; ambientFilter.frequency.value = 420;
      ambient = ctx.createGain(); ambient.gain.value = .035;
      wind.connect(ambientFilter).connect(ambient).connect(master); wind.start();

      const drops = ctx.createBufferSource(); drops.buffer = buf; drops.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400;
      rain = ctx.createGain(); rain.gain.value = 0;
      drops.connect(hp).connect(rain).connect(master); drops.start();

      const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 55;
      const humGain = ctx.createGain(); humGain.gain.value = .012;
      hum.connect(humGain).connect(master); hum.start();

      engineOsc = ctx.createOscillator(); engineOsc.type = 'sawtooth'; engineOsc.frequency.value = 55;
      const ef = ctx.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.value = 380;
      engine = ctx.createGain(); engine.gain.value = 0;
      engineOsc.connect(ef).connect(engine).connect(master); engineOsc.start();

      started = true; ctx.resume?.();
    } catch { started = false; }
  }

  function setMuted(value) {
    muted = !!value;
    if (master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, .08);
  }
  function setVolume(value) {
    volume = Math.max(0, Math.min(1, Number(value) || 0));
    if (master && !muted) master.gain.setTargetAtTime(volume, ctx.currentTime, .08);
  }
  function setWeather(index) {
    if (!started || !rain) return;
    rain.gain.setTargetAtTime(index === 2 ? .14 : 0, ctx.currentTime, .8);
    if (ambient) ambient.gain.setTargetAtTime(index === 2 ? .05 : .035, ctx.currentTime, .8);
  }
  function setNight(night) {
    if (!started || !ambientFilter) return;
    ambientFilter.frequency.setTargetAtTime(night ? 240 : 420, ctx.currentTime, .8);
  }
  function setEngine(amount) {
    if (!started || !engine || !engineOsc) return;
    const v = Math.max(0, Math.min(1, amount));
    engine.gain.setTargetAtTime(v * .075, ctx.currentTime, .12);
    engineOsc.frequency.setTargetAtTime(45 + v * 95, ctx.currentTime, .12);
  }
  function playRadio(station) {
    start();
    if (!started) return;
    stopRadio();
    radioStation = station | 0;
    const pattern = patterns[radioStation % patterns.length];
    let step = 0;
    radioTimer = setInterval(() => {
      if (!ctx || muted) return;
      const f = pattern[step % pattern.length];
      note(f, .42, 'triangle', .028);
      if (step % 4 === 0) note(f / 2, .8, 'sine', .035);
      step++;
    }, radioStation === 0 ? 240 : radioStation === 1 ? 420 : 340);
  }
  function stopRadio() {
    if (radioTimer) clearInterval(radioTimer);
    radioTimer = null; radioStation = -1;
  }
  function bell() {
    start();
    if (!started) return;
    note(880, .16, 'sine', .045);
    setTimeout(() => note(1320, .22, 'sine', .03), 90);
  }
  function status() {
    return { started, muted, volume, radioStation, state: ctx?.state || 'none' };
  }

  return { start, setMuted, setVolume, setWeather, setNight, setEngine, playRadio, stopRadio, bell, status, isMuted: () => muted };
}
