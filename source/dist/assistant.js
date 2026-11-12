/* Agent Chat layout adapted from serafimcloud on 21st.dev; plain-JS project integration. */
(function () {
  const svg = paths => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
  const sendIcon = svg('<path d="M12 19V5m-6 6 6-6 6 6"/>');
  const attachIcon = svg('<path d="m20 11-8 8a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/>');
  const closeIcon = svg('<path d="m6 6 12 12M6 18 18 6"/>');
  let images = [], conversation = [], controller = null, retry = null, imageBusy = false, connectionNotice = 'Фото и схема отправляются в OpenAI';
  const env = () => ({ catalog: catalog.filter(catalogAvailable), ports, makeNode, modes, uid, core: RigCore, compatible: portPairCompatible });
  const fingerprint = () => JSON.stringify(state);
  function context() {
    return {
      grid: G, selection: [...selection],
      nodes: state.nodes.map(n => ({ id: n.id, model: n.model, name: deviceLabel(n), kind: n.kind, x: n.x, y: n.y, ...size(n), mount: n.mountLevel || 'unset', channels: n.channels, modeId: n.modeId, manualAddress: n.manual || null, universes: n.universes, ports: ports(n).map(p => ({ id: p.id, type: p.type, out: p.out, connector: p.connector, label: p.label, available: portAvailable(n, p) })) })),
      edges: state.edges.map(({ id, type, from, port, to, toPort, detached }) => ({ id, type, from, port, to, toPort, detached: !!detached })),
      areas: state.areas || [], patch: RigCore.patch(state),
      catalog: catalog.filter(catalogAvailable).map(m => ({ id: m.id, name: m.name, kind: m.kind, category: m.category, modes: modes(m), dmx: m.dmx })),
    };
  }
  function status(text, error = false) { const el = $('#assistantStatus'); el.textContent = text; el.classList.toggle('error', error); }
  function refreshSend() {
    const b = $('#assistantSend'); b.disabled = imageBusy || (!controller && !$('#assistantInput').value.trim() && !images.length);
    b.innerHTML = controller ? svg('<rect x="6" y="6" width="12" height="12" rx="1"/>') : sendIcon;
    b.setAttribute('aria-label', controller ? 'Остановить ответ' : 'Отправить сообщение');
    $('#assistantAttach').disabled = !!controller || imageBusy; $('#assistantClear').disabled = !!controller || imageBusy;
  }
  function scrollBottom() { const el = $('#assistantMessages'); el.scrollTop = el.scrollHeight; }
  function message(role, text, attachments = []) {
    $('#assistantEmpty')?.remove();
    const el = document.createElement('div'); el.className = 'assistant-message ' + role;
    if (attachments.length) { const strip = document.createElement('div'); strip.className = 'assistant-message-images'; for (const image of attachments) { const img = document.createElement('img'); img.src = image.data; img.alt = image.name; img.width = 72; img.height = 54; strip.append(img); } el.append(strip); }
    const p = document.createElement('p'); p.textContent = text; el.append(p); $('#assistantMessages').append(el); scrollBottom(); return el;
  }
  function historyText() { return conversation.slice(-20).map(({ role, text }) => ({ role, text: text.slice(0, 16000) })); }
  function showPlan(el, actions, original) {
    const box = document.createElement('div'); box.className = 'assistant-plan'; el.append(box);
    let preview;
    try { preview = RigAssistantActions.plan(state, actions, env()); } catch (e) { box.textContent = 'План не применён: ' + e.message; box.classList.add('error'); conversation.push({ role: 'assistant', text: 'План отклонён редактором: ' + e.message }); return; }
    const title = document.createElement('strong'); title.textContent = 'Изменения в схеме'; box.append(title);
    const list = document.createElement('ul'); for (const change of preview.changes.slice(0, 8)) { const li = document.createElement('li'); li.textContent = change; list.append(li); }
    box.append(list);
    if (preview.changes.length > 8) {
      const details = document.createElement('details'), summary = document.createElement('summary'), rest = document.createElement('ul');
      summary.textContent = 'Ещё изменений: ' + (preview.changes.length - 8);
      for (const change of preview.changes.slice(8)) { const li = document.createElement('li'); li.textContent = change; rest.append(li); }
      details.append(summary, rest); box.append(details);
    }
    for (const warning of preview.warnings) { const p = document.createElement('p'); p.className = 'assistant-warning'; p.textContent = warning; box.append(p); }
    if (!preview.changed) { const p = document.createElement('p'); p.textContent = 'Схема не изменится.'; box.append(p); return; }
    const row = document.createElement('div'); row.className = 'assistant-plan-buttons';
    const apply = document.createElement('button'); apply.type = 'button'; apply.textContent = 'Применить'; apply.className = 'assistant-apply';
    const dismiss = document.createElement('button'); dismiss.type = 'button'; dismiss.textContent = 'Отклонить'; row.append(apply, dismiss); box.append(row);
    dismiss.onclick = () => { row.remove(); title.textContent = 'План отклонён'; conversation.push({ role: 'assistant', text: 'Пользователь отклонил этот план; изменения не применены.' }); };
    apply.onclick = () => {
      if (fingerprint() !== original) { apply.disabled = true; title.textContent = 'Схема изменилась. Повтори запрос.'; status('План устарел: отправь задачу ещё раз.', true); return; }
      try {
        const checked = RigAssistantActions.plan(state, actions, env());
        mutate(() => { state = checked.state; selection.clear(); selected = null; selectedEdge = null; selectedArea = null; pending = null; });
        row.remove(); title.textContent = 'Применено · Ctrl Z для отмены'; conversation.push({ role: 'assistant', text: 'Редактор применил план: ' + checked.changes.join('; ') }); status('Изменения сохранены. Ctrl Z отменит весь план.');
        if (actions.some(a => ['add_device', 'add_area', 'move_device'].includes(a.op))) fit();
      } catch (e) { status('Не применено: ' + e.message, true); }
    };
  }
  async function request(payload) {
    if (controller) return;
    controller = new AbortController(); const activeController = controller;
    status('Разбираю проект…'); refreshSend();
    const log = $('#assistantMessages');
    const typing = document.createElement('div');
    typing.className = 'assistant-typing';
    typing.setAttribute('aria-hidden', 'true');
    typing.innerHTML = '<i></i><i></i><i></i>';
    log.append(typing); log.setAttribute('aria-busy', 'true'); scrollBottom();
    const original = fingerprint();
    try {
      const res = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ message: payload.text, images: payload.images.map(i => i.data), history: payload.history, context: context() }) });
      const data = await res.json().catch(() => ({ error: 'Локальный сервер вернул непонятный ответ.' }));
      if (!res.ok) throw Error(data.error || 'Запрос не выполнен.');
      typing.remove();
      conversation.push({ role: 'assistant', text: data.message }); const el = message('assistant', data.message);
      if (data.actions?.length) showPlan(el, data.actions, original);
      retry = null; status(data.actions?.length ? 'Проверь предложенные изменения.' : 'Готово');
    } catch (e) {
      const cancelled = e.name === 'AbortError'; status(cancelled ? 'Ответ остановлен. Схема не изменена.' : e.message, !cancelled);
      if (!cancelled) { retry = payload; $('#assistantRetry').hidden = false; }
    } finally { if (controller === activeController) controller = null; typing.remove(); log.removeAttribute('aria-busy'); refreshSend(); scrollBottom(); }
  }
  async function submit() {
    if (controller) { controller.abort(); return; }
    const input = $('#assistantInput'), text = input.value.trim(); if ((!text && !images.length) || imageBusy) return;
    const payload = { text, images: [...images], history: historyText() };
    conversation.push({ role: 'user', text: text || '[Прикреплено фото]' }); message('user', text, images);
    input.value = ''; input.style.height = ''; images = []; renderImages(); $('#assistantRetry').hidden = true;
    await request(payload);
  }
  function renderImages() {
    const el = $('#assistantImages'); el.replaceChildren();
    for (const [i, image] of images.entries()) {
      const chip = document.createElement('div'); chip.className = 'assistant-image-chip';
      const img = document.createElement('img'); img.src = image.data; img.alt = image.name; img.width = 48; img.height = 48;
      const remove = document.createElement('button'); remove.type = 'button'; remove.innerHTML = closeIcon; remove.setAttribute('aria-label', 'Убрать ' + image.name); remove.onclick = () => { images.splice(i, 1); renderImages(); }; chip.append(img, remove); el.append(chip);
    }
    el.hidden = !images.length; refreshSend();
  }
  async function attach(files) {
    if (controller || imageBusy) return;
    if (files.length + images.length > 3) { status('Можно прикрепить до трёх фото.', true); return; }
    imageBusy = true; refreshSend();
    try {
      const added = [];
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw Error('Выбери PNG, JPEG или WebP.');
        if (file.size > 15 * 1024 * 1024) throw Error('Фото должно быть меньше 15 МБ.');
        const url = URL.createObjectURL(file), img = new Image();
        try {
          img.src = url; await img.decode();
          const scale = Math.min(1, 1600 / Math.max(img.width, img.height)); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale)); const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          added.push({ name: file.name, data: canvas.toDataURL('image/jpeg', .85) });
        } finally { URL.revokeObjectURL(url); }
      }
      images.push(...added); status('Фото прикреплено. Опиши, что перенести в схему.');
    } catch (e) { status(e.message || 'Не удалось открыть фото.', true); }
    finally { imageBusy = false; renderImages(); $('#assistantFiles').value = ''; }
  }
  function setup() {
    if (!state || !$('#rigDock-assistant') || !window.RigAssistantActions) { setTimeout(setup, 150); return; }
    const panel = document.createElement('section'); panel.id = 'assistant'; panel.setAttribute('aria-labelledby', 'assistantHeading');
    panel.innerHTML = `<div class="assistant-heading"><span class="assistant-avatar" aria-hidden="true">R</span><div><h2 id="assistantHeading">Помощник Rig Grid</h2><p>Схема, приборы и DMX-патч</p></div><button id="assistantClear" type="button" title="Новый диалог" aria-label="Новый диалог">${svg('<path d="M12 5v14M5 12h14"/>')}</button></div>
+<div id="assistantMessages" role="log" aria-label="Диалог с помощником" aria-live="polite"><div id="assistantEmpty"><p>Что сделаем со схемой?</p><button type="button" data-assistant-prompt="Соедини все DMX правильно, сохрани существующие подключения">Соединить DMX</button><button type="button" data-assistant-prompt="Проверь патч текущего проекта и объясни ошибки">Проверить патч</button><span>Или прикрепи фото сцены</span></div></div>
+<div class="assistant-compose"><div id="assistantImages" hidden></div><label class="assistant-input-label" for="assistantInput">Задача для помощника</label><textarea id="assistantInput" rows="2" maxlength="12000" placeholder="Что изменить в проекте?"></textarea><div class="assistant-compose-tools"><button id="assistantAttach" type="button" aria-label="Прикрепить фото" title="Прикрепить фото">${attachIcon}</button><span>Фото или план</span><button id="assistantSend" type="button" aria-label="Отправить сообщение" disabled>${sendIcon}</button></div></div>
+<input id="assistantFiles" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden><div class="assistant-status-row"><span id="assistantStatus" role="status">Фото и схема отправляются в OpenAI</span><button id="assistantRetry" type="button" hidden>Повторить</button></div>` .replace(/^\+/gm, '');
    $('#rigDock-assistant').append(panel);
    panel.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.target.tagName !== 'TEXTAREA') return;
      e.stopPropagation();
    });
    panel.addEventListener('contextmenu', e => e.stopPropagation());
    $('#assistantInput').addEventListener('input', e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; refreshSend(); });
    $('#assistantInput').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); } });
    $('#assistantSend').onclick = submit; $('#assistantAttach').onclick = () => $('#assistantFiles').click(); $('#assistantFiles').onchange = e => attach([...e.target.files]);
    $('#assistantRetry').onclick = () => { if (retry) { $('#assistantRetry').hidden = true; request(retry); } };
    $('#assistantClear').onclick = () => { conversation = []; retry = null; $('#assistantRetry').hidden = true; $('#assistantMessages').replaceChildren(); message('assistant', 'Новый диалог. Текущая схема сохранена.'); status(connectionNotice, connectionNotice !== 'Фото и схема отправляются в OpenAI'); };
    panel.addEventListener('paste', e => { const files = [...(e.clipboardData?.files || [])]; if (files.length) { e.preventDefault(); attach(files); } });
    panel.addEventListener('dragover', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { e.preventDefault(); panel.classList.add('dragging-image'); } });
    panel.addEventListener('dragleave', e => { if (!panel.contains(e.relatedTarget)) panel.classList.remove('dragging-image'); });
    panel.addEventListener('drop', e => { e.preventDefault(); panel.classList.remove('dragging-image'); attach([...e.dataTransfer.files]); });
    panel.querySelectorAll('[data-assistant-prompt]').forEach(b => b.onclick = () => { $('#assistantInput').value = b.dataset.assistantPrompt; submit(); });
    fetch('/api/assistant').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => { if (!data.ready) { connectionNotice = 'Нужен ключ помощника на локальном сервере.'; status(connectionNotice, true); } }).catch(() => { connectionNotice = 'Перезапусти локальный сервер для чата.'; status(connectionNotice, true); });
  }
  setup();
})();
