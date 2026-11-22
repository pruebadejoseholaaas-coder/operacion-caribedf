// Interfaz: estadísticas del jugador, inventario, teléfono, avisos y fundido.
export function createUI(src) {
  const $ = id => document.getElementById(id);
  const stats = $('player-stats'), inv = $('inventory-panel'), invList = $('inv-list'), invCash = $('inv-cash');
  const phone = $('phone'), phoneBody = $('phone-body'), toastEl = $('toast'), fadeEl = $('fade');
  const money = n => 'RD$ ' + Math.round(n).toLocaleString('es-DO');
  let toastTimer = 0;

  function toast(text, ms = 2800) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
  }

  function update() {
    const cash = src.cash(), energy = Math.round(src.energy()), clock = src.clock();
    if (stats) stats.textContent = money(cash) + ' · Energía ' + energy + '% · ' + clock;
    // Los paneles se redibujan al abrirse o tras una acción: redibujarlos cada
    // fracción de segundo destruiría los botones mientras el jugador los pulsa.
    const head = phone?.querySelector('.phone-head');
    if (head) head.innerHTML = '<b>' + clock + '</b><span>' + money(cash) + '</span><span>Energía ' + energy + '%</span>';
  }

  function renderInventory() {
    if (!invList) return;
    const items = src.inventory();
    invCash.textContent = money(src.cash()) + ' · ' + src.clock() + ' · Energía ' + Math.round(src.energy()) + '%';
    invList.replaceChildren();
    const entries = Object.entries(items);
    if (!entries.length) {
      const p = document.createElement('p');
      p.className = 'sheet-empty';
      p.textContent = 'La mochila está vacía. Compra en los comercios de la ciudad (tecla F).';
      invList.appendChild(p);
      return;
    }
    for (const [name, qty] of entries) {
      const row = document.createElement('div');
      row.className = 'inv-row';
      const label = document.createElement('span');
      label.textContent = name + ' × ' + qty;
      row.appendChild(label);
      if (src.isFood(name)) {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = 'Comer';
        b.addEventListener('click', () => { src.useItem(name); renderInventory(); });
        row.appendChild(b);
      }
      invList.appendChild(row);
    }
  }

  function renderPhone() {
    if (!phoneBody) return;
    const job = src.job();
    phoneBody.replaceChildren();
    const head = document.createElement('div');
    head.className = 'phone-head';
    head.innerHTML = '<b>' + src.clock() + '</b><span>' + money(src.cash()) + '</span><span>Energía ' + Math.round(src.energy()) + '%</span>';
    phoneBody.appendChild(head);

    const msg = document.createElement('div');
    msg.className = 'phone-msg';
    msg.textContent = job
      ? 'Encargo activo: entrega en ' + job.name + '. Pago: ' + money(job.reward) + '. Sigue el marcador azul.'
      : 'Tienes un encargo disponible: lleva un paquete a un comercio del barrio. Pago según la distancia.';
    phoneBody.appendChild(msg);

    const jobBtn = document.createElement('button');
    jobBtn.type = 'button'; jobBtn.className = 'phone-action';
    jobBtn.textContent = job ? 'Cancelar encargo' : 'Aceptar encargo de entrega';
    jobBtn.addEventListener('click', () => { job ? src.cancelJob() : src.startJob(); renderPhone(); });
    phoneBody.appendChild(jobBtn);

    const mapBtn = document.createElement('button');
    mapBtn.type = 'button'; mapBtn.className = 'phone-action';
    mapBtn.textContent = 'Abrir mapa de la ciudad';
    mapBtn.addEventListener('click', () => { closeAll(); src.openMap(); });
    phoneBody.appendChild(mapBtn);

    const contacts = document.createElement('div');
    contacts.className = 'phone-contacts';
    for (const c of src.contacts()) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'phone-contact';
      b.innerHTML = '<b>' + c.name + '</b><small>' + c.role + '</small>';
      b.addEventListener('click', () => toast('Llamando a ' + c.name + '… «' + c.line + '»', 3600));
      contacts.appendChild(b);
    }
    phoneBody.appendChild(contacts);

    const msgs = document.createElement('div');
    msgs.className = 'phone-messages';
    for (const m of src.messages()) {
      const d = document.createElement('div');
      d.textContent = m;
      msgs.appendChild(d);
    }
    phoneBody.appendChild(msgs);
  }

  function openInventory() { renderInventory(); if (inv) inv.style.display = 'flex'; }
  function openPhone() { renderPhone(); if (phone) phone.style.display = 'flex'; }
  function closeAll() {
    if (inv) inv.style.display = 'none';
    if (phone) phone.style.display = 'none';
  }
  function isOpen() {
    return (inv && inv.style.display === 'flex') || (phone && phone.style.display === 'flex');
  }

  function fade(callback) {
    if (!fadeEl) { callback(); return; }
    fadeEl.classList.add('show');
    setTimeout(() => {
      callback();
      setTimeout(() => fadeEl.classList.remove('show'), 260);
    }, 420);
  }

  $('inv-close')?.addEventListener('click', () => { if (inv) inv.style.display = 'none'; });
  $('phone-close')?.addEventListener('click', () => { if (phone) phone.style.display = 'none'; });
  return { update, toast, openInventory, openPhone, closeAll, isOpen, fade, renderPhone };
}
