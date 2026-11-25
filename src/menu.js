// Menú principal, ajustes y créditos. Guarda las preferencias en localStorage.
export function createMenu(opts) {
  const $ = id => document.getElementById(id);
  const menu = $('mainmenu'), settings = $('settings'), credits = $('credits'), roles = $('roles');
  const KEY = 'operacion-caribe-settings-v1';
  const data = { quality: 'medium', shadows: true, volume: 55, voices: true, fps: false };
  try { Object.assign(data, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} };
  const apply = () => {
    opts.applyQuality(data.quality, data.shadows);
    opts.setVolume(data.volume / 100);
    opts.setVoices(data.voices);
  };
  const open = () => { if (menu) menu.style.display = 'flex'; };
  const close = () => { if (menu) menu.style.display = 'none'; };
  const showRoles = () => { close(); if (roles) roles.style.display = 'flex'; };
  const openSettings = () => { sync(); if (settings) settings.style.display = 'flex'; };
  const closeSettings = () => { if (settings) settings.style.display = 'none'; };
  const openCredits = () => { if (credits) credits.style.display = 'flex'; };
  const closeCredits = () => { if (credits) credits.style.display = 'none'; };

  const quality = $('set-quality'), shadows = $('set-shadows'), volume = $('set-volume');
  const voices = $('set-voices'), fps = $('set-fps'), cont = $('menu-continue');
  function sync() {
    if (quality) quality.value = data.quality;
    if (shadows) shadows.checked = data.shadows;
    if (volume) volume.value = data.volume;
    if (voices) voices.checked = data.voices;
    if (fps) fps.checked = data.fps;
  }
  sync();

  $('menu-continue')?.addEventListener('click', () => {
    if (opts.hasSave()) close(); else showRoles();
  });
  $('menu-new')?.addEventListener('click', () => {
    if (!confirm('¿Empezar una partida nueva? Se borrará la partida guardada.')) return;
    opts.onNew();
  });
  $('menu-settings')?.addEventListener('click', openSettings);
  $('menu-credits')?.addEventListener('click', openCredits);
  $('settings-close')?.addEventListener('click', closeSettings);
  $('credits-close')?.addEventListener('click', closeCredits);
  $('settings-save')?.addEventListener('click', () => { opts.onSave(); });
  $('settings-load')?.addEventListener('click', () => { opts.onLoad(); });
  $('settings-delete')?.addEventListener('click', () => {
    if (confirm('¿Borrar la partida guardada?')) opts.onDelete();
  });
  quality?.addEventListener('change', () => { data.quality = quality.value; persist(); apply(); });
  shadows?.addEventListener('change', () => { data.shadows = shadows.checked; persist(); apply(); });
  volume?.addEventListener('input', () => { data.volume = Number(volume.value) || 0; persist(); opts.setVolume(data.volume / 100); });
  voices?.addEventListener('change', () => { data.voices = voices.checked; persist(); opts.setVoices(data.voices); });
  fps?.addEventListener('change', () => { data.fps = fps.checked; persist(); const fe = document.getElementById('fps'); if (fe) fe.style.display = data.fps ? 'block' : 'none'; });

  apply();
  if (cont) cont.disabled = !opts.hasSave();
  if (localStorage.getItem('oc-new') === '1') { localStorage.removeItem('oc-new'); showRoles(); }
  else open();

  return {
    open, close, showRoles, openSettings, openCredits,
    isOpen: () => !!menu && menu.style.display !== 'none',
    settings: data,
    apply
  };
}
