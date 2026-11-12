/* Project commands are validated on a copy before one undoable commit. */
(function (root) {
  function plan(project, actions, env) {
    if (!Array.isArray(actions) || actions.length > 120) throw Error('В плане слишком много действий.');
    const work = JSON.parse(JSON.stringify(project)), changes = [], warnings = [], refs = new Map();
    const get = id => { const n = work.nodes.find(n => n.id === (refs.get(id) || id)); if (!n) throw Error('Прибор не найден: ' + id); return n; };
    const coord = v => { if (!Number.isFinite(v) || Math.abs(v) > 240000) throw Error('Координаты выходят за пределы схемы.'); return Math.round(v / 24) * 24; };
    const mount = (n, value) => { if (!['floor', 'ceiling', 'unset'].includes(value)) throw Error('Неизвестное размещение.'); if (value === 'unset') delete n.mountLevel; else n.mountLevel = value; };
    const free = (n, p) => !work.edges.some(e => !e.detached && (p.out ? e.from === n.id && e.port === p.id : e.to === n.id && e.toPort === p.id));
    const reachable = (from, target, type, seen = new Set()) => {
      if (from === target) return true;
      if (seen.has(from)) return false; seen.add(from);
      return work.edges.filter(e => !e.detached && e.type === type && e.from === from).some(e => reachable(e.to, target, type, seen));
    };
    function connect(a, b, out, input) {
      if (a.id === b.id || !out?.out || !input || input.out || !env.compatible(out, input)) throw Error('Несовместимые порты: ' + a.name + ' / ' + b.name);
      if (!free(a, out) || !free(b, input)) throw Error('Разъём уже занят: ' + a.name + ' / ' + b.name);
      if (reachable(b.id, a.id, input.type)) throw Error('Подключение образует петлю.');
      work.edges.push({ id: env.uid(), type: input.type, from: a.id, port: out.id, to: b.id, toPort: input.id, fromConnector: out.connector, toConnector: input.connector, points: [] });
    }
    function validPatch() {
      const rows = env.core.patch(work).rows.filter(r => r.root);
      for (const r of rows) {
        const source = get(r.root.source), capacity = source.spec?.outputChannels || 512;
        if (!Number.isInteger(r.channels) || r.channels < 1 || r.end > Math.min(512, capacity) || r.address < 1) return false;
      }
      return !rows.some((a, i) => rows.slice(i + 1).some(b => a.root.universe === b.root.universe && a.address <= b.end && b.address <= a.end));
    }
    function autoDmx(ids) {
      if (!Array.isArray(ids)) throw Error('Некорректный список DMX-приборов.');
      const targets = ids.length ? ids.map(get) : work.nodes.filter(n => n.dmx);
      let count = 0;
      for (const target of targets.slice().sort((a, b) => a.y - b.y || a.x - b.x)) {
        if (!target.dmx || env.core.root(work, target.id, 'dmx')) continue;
        if (!Number.isInteger(target.channels) || target.channels < 1) { warnings.push(target.name + ': сначала выбери DMX-режим.'); continue; }
        const input = env.ports(target).find(p => p.type === 'dmx' && !p.out && free(target, p));
        if (!input) { warnings.push(target.name + ': нет свободного физического DMX-входа.'); continue; }
        const candidates = [];
        for (const n of work.nodes) {
          if (n.id === target.id) continue;
          const source = ['node', 'console', 'interface'].includes(n.kind), rooted = env.core.root(work, n.id, 'dmx');
          if (!source && !rooted) continue;
          for (const out of env.ports(n).filter(p => p.type === 'dmx' && p.out && free(n, p) && env.compatible(p, input))) {
            const lineage = new Set(); let cur = n;
            while (cur && !lineage.has(cur.id)) { lineage.add(cur.id); const incoming = work.edges.find(e => !e.detached && e.type === 'dmx' && e.to === cur.id); cur = incoming && work.nodes.find(v => v.id === incoming.from); }
            if (lineage.has(target.id) || lineage.size >= 32) continue;
            candidates.push({ n, out, score: Math.hypot(n.x - target.x, n.y - target.y) + (source ? 120 : 0) + (n.kind === target.kind ? 0 : 80) });
          }
        }
        let done = false;
        for (const c of candidates.sort((a, b) => a.score - b.score)) {
          const before = work.edges.length;
          try { connect(c.n, target, c.out, input); if (validPatch()) { done = true; count++; break; } } catch {}
          work.edges.length = before;
        }
        if (!done) warnings.push(target.name + ': не найден совместимый свободный выход с местом в universe.');
      }
      changes.push('Добавить DMX-кабели: ' + count);
    }
    for (const a of actions) {
      if (!a || typeof a.op !== 'string') throw Error('Некорректное действие.');
      if (a.op === 'add_device') {
        const m = env.catalog.find(m => m.id === a.model);
        if (!m) throw Error('Модели нет в доступном каталоге: ' + a.model);
        if (typeof a.ref !== 'string' || !a.ref || refs.has(a.ref) || work.nodes.some(n => n.id === a.ref)) throw Error('Повторяется ссылка нового прибора.');
        if (work.nodes.length >= 1000) throw Error('Слишком много приборов.');
        const n = env.makeNode(m, coord(a.x), coord(a.y)); mount(n, a.mount); work.nodes.push(n); refs.set(a.ref, n.id); changes.push('Добавить ' + n.name);
      } else if (a.op === 'add_area') {
        if (!['room', 'stage', 'seating'].includes(a.type) || !Number.isFinite(a.w) || !Number.isFinite(a.h) || a.w < 96 || a.h < 96 || (work.areas || []).length >= 100) throw Error('Некорректная область.');
        (work.areas ??= []).push({ id: env.uid(), type: a.type, name: String(a.name).slice(0, 80), x: coord(a.x), y: coord(a.y), w: coord(a.w), h: coord(a.h) }); changes.push('Добавить область: ' + a.name);
      } else if (a.op === 'auto_dmx') autoDmx(a.nodeIds);
      else if (a.op === 'connect') { const from = get(a.from), to = get(a.to); connect(from, to, env.ports(from).find(p => p.id === a.port), env.ports(to).find(p => p.id === a.toPort)); changes.push('Соединить ' + from.name + ' / ' + to.name); }
      else if (a.op === 'disconnect') {
        if (!work.edges.some(e => e.id === a.edgeId)) throw Error('Кабель не найден.');
        work.edges = work.edges.filter(e => e.id !== a.edgeId); changes.push('Убрать кабель');
      } else {
        const n = get(a.id);
        switch (a.op) {
          case 'move_device': n.x = coord(a.x); n.y = coord(a.y); changes.push('Переместить ' + n.name); break;
          case 'rename_device': if (typeof a.name !== 'string' || !a.name.trim()) throw Error('Пустое имя.'); n.name = a.name.trim().slice(0, 80); n.nameChoice = 'user'; changes.push('Название: ' + n.name); break;
          case 'mount_device': mount(n, a.mount); changes.push(n.name + ': ' + ({ floor: 'пол', ceiling: 'потолок', unset: 'без назначения' }[a.mount])); break;
          case 'set_mode': { const mode = env.modes(env.catalog.find(m => m.id === n.model) || n.spec).find(m => m.id === a.modeId); if (!mode) throw Error('DMX-режим не найден.'); n.modeId = mode.id; n.channels = mode.channels; n.modeLabel = mode.label; n.modeChoice = 'user'; changes.push('Режим: ' + n.name); break; }
          case 'set_address': if (a.address !== null && (!Number.isInteger(a.address) || a.address < 1 || a.address > 512)) throw Error('Адрес должен быть от 1 до 512.'); n.manual = a.address; changes.push('Адрес: ' + n.name); break;
          case 'rotate_device': if (!['bar', 'pixel', 'strobe'].includes(n.kind) || ![0, 90, 180, 270].includes(a.degrees)) throw Error('Этот прибор нельзя повернуть таким способом.'); n.rotation = a.degrees; changes.push('Повернуть ' + n.name); break;
          case 'remove_device': work.nodes = work.nodes.filter(v => v.id !== n.id); work.edges = work.edges.filter(e => e.from !== n.id && e.to !== n.id); changes.push('Удалить ' + n.name); break;
          default: throw Error('Неизвестное действие: ' + a.op);
        }
      }
    }
    if (actions.some(a => ['connect', 'set_mode', 'set_address'].includes(a.op)) && !validPatch()) throw Error('План создаёт пересечение адресов или превышает ёмкость DMX-линии.');
    return { state: work, changes, warnings, changed: JSON.stringify(work) !== JSON.stringify(project) };
  }
  if (typeof module !== 'undefined') module.exports = { plan };
  else root.RigAssistantActions = { plan };
})(typeof globalThis !== 'undefined' ? globalThis : this);
