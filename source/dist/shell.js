(() => {
  const header = document.querySelector('header');
  const app = document.querySelector('.app');
  if (!header || !app) return;

  const shell = document.createElement('div');
  shell.className = 'rig-shell-main';
  header.before(shell);
  shell.append(header, app);

  const icons = {
    inbox:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 14h5l2 3h4l2-3h5"/>',
    folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
  };
  const dock = document.createElement('nav');
  dock.id = 'rigDock';
  dock.setAttribute('aria-label', 'Инструменты схемы');
  const dockItems = [
    ['assistant', 'Помощник', 'inbox'],
    ['settings', 'Настройки', 'settings'],
    ['project', 'Проект', 'folder']
  ];
  dock.innerHTML = `
    <div class="rig-dock-drawer"><div class="rig-dock-content">
      <section id="rigDock-assistant" hidden></section>
      <section id="rigDock-settings" hidden></section>
      <section id="rigDock-project" hidden></section>
    </div></div>
    <div class="rig-dock-bar">${dockItems.map(([id,label,icon]) => `
      <button type="button" data-dock-tab="${id}" aria-label="${label}" aria-expanded="false" aria-controls="rigDock-${id}" title="${label}">
        <span class="rig-icon" data-icon="${icon}"></span><span class="rig-dock-label">${label}</span>
      </button>`).join('')}</div>`;
  const dockTabs = [...dock.querySelectorAll('[data-dock-tab]')];
  let activeDockTab = null;
  function setDockTab(tab) {
    activeDockTab = tab;
    dock.classList.toggle('is-open', Boolean(tab));
    for (const button of dockTabs) {
      const active = button === tab;
      button.setAttribute('aria-expanded', String(active));
      dock.querySelector('#' + button.getAttribute('aria-controls')).hidden = !active;
    }
  }
  dockTabs.forEach(button => button.onclick = () => setDockTab(activeDockTab === button ? null : button));
  document.addEventListener('pointerdown', event => {
    if (activeDockTab && !dock.contains(event.target)) setDockTab(null);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !activeDockTab) return;
    const button = activeDockTab;
    setDockTab(null);
    if (dock.contains(document.activeElement) || document.activeElement === document.body) button.focus();
  }, true);
  shell.append(dock);
  dock.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[el.dataset.icon]}</svg>`);
})();
