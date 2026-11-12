function deviceLabel(n){
 if(!n)return 'Прибор';
 const number=n.kind==='outlet'?(n.circuit||({L1:'A',L2:'B',L3:'C'}[n.phases?.power1]||'A'))+n.number:String(n.number||1).padStart(2,'0');
 return `${shortModelName(model(n))} ${number}`;
}
function catalogAvailable(m){
 return !m.catalogHidden&&!['flood','decor','motor','pixel'].includes(m.kind)&&!(m.category==='input'&&['camera','player','tablet','phone'].includes(m.kind))&&(m.kind!=='laser'||m.id==='snl-240')&&!(m.category==='node'&&['receiver','interface'].includes(m.kind))&&(m.category==='power'?m.id==='outlet':!m.generic);
}
function selectCable(id){
 if(!state.edges.some(e=>e.id===id))return;
 pending=null;waypointMode=false;selectedArea=null;selection.clear();selected=null;selectedEdge=id;
 renderNodes();renderInspector();updateCableHint();
}
function activatePort(pt){
 if(pt.disabled)return;
 const n=node(pt.dataset.node);if(!n)return;
 if(pt.dataset.route){
  const used=state.edges.some(e=>!e.detached&&e.from===n.id&&e.port===pt.dataset.port);
  if(used&&(n.splitRouting?.[pt.dataset.port]||'A')!==pt.dataset.route)return;
  if((n.splitRouting?.[pt.dataset.port]||'A')!==pt.dataset.route)mutate(()=>{n.splitRouting??={};n.splitRouting[pt.dataset.port]=pt.dataset.route});
 }
 const p=ports(n).find(p=>p.id===pt.dataset.port);if(!p)return;
 selectedEdge=null;
 if(pending)finishCable(n,p);else beginCable(n,p);
 enhanceNodeAccess();
}
function updateViewUI(){
 const zoom=$('#zoomValue');if(!zoom)return;
 zoom.textContent=Math.round(view.z*100)+'%';
 $('#zoomOut').disabled=view.z<=.2;$('#zoomIn').disabled=view.z>=2.5;
 $('#world').classList.toggle('overview',view.z<.65);
 $('#world').style.setProperty('--port-hit',Math.min(G,Math.max(24,24/view.z))+'px');
 zoom.setAttribute('aria-label',`Масштаб ${Math.round(view.z*100)} процентов. Нажми для 100 процентов`);
 const label=$('#selectionLabel'),n=node(selected);
 label.hidden=!n;
 if(n){const r=RigCore.patch(state).rows.find(r=>r.id===n.id);label.textContent=deviceLabel(n)+(r?` · ${r.root&&r.address?'U'+r.root.universe+' / '+r.address:'Нет DMX'}`:'');}
}
function enhanceNodeAccess(){
 const named={...state,nodes:state.nodes.map(n=>({...n,name:deviceLabel(n)}))};
 const conflicts=RigCore.patch(named).issues.filter(issue=>/Пересечение|превыш/.test(issue));
 for(const card of $$('#nodes .module'))card.classList.toggle('patch-conflict',conflicts.some(issue=>issue.includes(deviceLabel(node(card.dataset.id)))));
 for(const pt of $$('#nodes .port')){
  const n=node(pt.dataset.node),p=ports(n).find(p=>p.id===pt.dataset.port);if(!p)continue;
  const route=pt.dataset.route||(['snl-508','snl-517'].includes(n.model)?(p.id==='dmxIn2'?'B':p.id==='dmxIn'?'A':''):'');
  const label=`${deviceLabel(n)} · ${names[p.type]} ${p.out?'OUT':'IN'}${p.label?' '+p.label:''}${route?' · '+route:''}`;
  pt.setAttribute('aria-label',label);pt.title=label+(pt.classList.contains('connected')?' · Нажми, чтобы отсоединить':' · Нажми, чтобы подключить');
  const origin=pending&&node(pending.node),start=origin&&ports(origin).find(v=>v.id===pending.port);
  const compatible=!!start&&origin.id!==n.id&&start.out!==p.out&&portPairCompatible(start.out?start:p,start.out?p:start);
  pt.classList.toggle('compatible-target',compatible&&!pt.disabled);
 }
}
function renderCatalogEmptyState(q){
 if(!q||$('#catalogTree [data-add]'))return;
 const tree=$('#catalogTree');tree.insertAdjacentHTML('afterbegin',`<div class="search-empty" role="status"><strong>Ничего не найдено</strong><p>По запросу «${esc(q)}» нет приборов.</p><button id="clearCatalogSearch">Очистить поиск</button></div>`);
 $('#clearCatalogSearch').onclick=()=>{$('#search').value='';renderCatalog();$('#catalogTree button')?.focus()};
}
function updatePlacementCounts(){
 const el=$('#placementCounts');if(!el||!state)return;
 const items=state.nodes.filter(n=>['light','effect'].includes(n.category)||['projector','ledwall'].includes(n.kind));
 const floor=items.filter(n=>n.mountLevel==='floor').length,ceiling=items.filter(n=>n.mountLevel==='ceiling').length;
 el.textContent=`Пол: ${floor} · Потолок: ${ceiling} · Не назначено: ${items.length-floor-ceiling}`;
}
function focusDevice(id){
 if(!node(id))return;
 $('#patchPanel').hidden=true;select(id);
 const n=node(id),s=size(n);
 requestAnimationFrame(()=>{const r=$('#canvas').getBoundingClientRect();view.z=Math.max(view.z,Math.min(1,(r.width-80)/s.w,(r.height-120)/s.h));view.x=r.width/2-(n.x+s.w/2)*view.z;view.y=r.height/2-(n.y+s.h/2)*view.z;applyView();$(`#nodes [data-id="${id}"]`)?.focus({preventScroll:true})});
}
function setupPanelResize(key){
 const panel=$('#'+key+'Panel'),handle=document.createElement('div');
 handle.className='panel-resizer';handle.tabIndex=0;handle.setAttribute('role','separator');handle.setAttribute('aria-orientation','vertical');handle.setAttribute('aria-label','Ширина '+(key==='library'?'каталога':'свойств'));handle.setAttribute('aria-valuemin','240');handle.setAttribute('aria-valuemax','420');
 panel.append(handle);
 const resize=(width,save=true)=>{width=Math.round(Math.max(240,Math.min(420,width)));panel.style.setProperty('--panel-width',width+'px');handle.setAttribute('aria-valuenow',width);if(save)try{localStorage.setItem('rig-width-'+key,width)}catch{}applyView()};
 resize(240,false);
 handle.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();resize(e.key==='Home'?240:e.key==='End'?420:Number(handle.getAttribute('aria-valuenow'))+(e.key==='ArrowRight'?1:-1)*(key==='library'?1:-1)*16)};
 handle.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();handle.setPointerCapture(e.pointerId);const x=e.clientX,start=panel.getBoundingClientRect().width;panel.classList.add('resizing');handle.onpointermove=v=>resize(start+(v.clientX-x)*(key==='library'?1:-1));handle.onpointerup=handle.onpointercancel=()=>{panel.classList.remove('resizing');handle.onpointermove=null;handle.onpointerup=null;handle.onpointercancel=null;};};
}
function setupWorkspaceUI(){
 const project=$('#rigDock-project');
 for(const id of ['importProject','saveProject']){
  const button=$('#'+id);
  button.hidden=false;
  project.append(button);
 }
 $('#saveProject').textContent='Скачать JSON';
 for(const id of ['toggleDetails','toggleRulers'])$('#rigDock-settings').append($('#'+id).closest('label'));
 $('#visualizer').hidden=true;$('#visualizer').insertAdjacentHTML('afterend','<button id="previewDirect">3D-превью</button>');$('#previewDirect').onclick=()=>openScenePreview();
 $('.canvas-tools').insertAdjacentHTML('beforeend','<div class="viewport-zoom" role="group" aria-label="Масштаб"><button id="zoomOut" aria-label="Уменьшить масштаб">−</button><button id="zoomValue" aria-label="Масштаб 100 процентов" title="Вернуть 100%">100%</button><button id="zoomIn" aria-label="Увеличить масштаб">+</button><button id="zoomFit" title="Вписать всю схему · F">Вписать</button></div>');
 $('#zoomOut').onclick=()=>zoomBy(1/1.2);$('#zoomIn').onclick=()=>zoomBy(1.2);$('#zoomValue').onclick=()=>zoomBy(1/view.z);$('#zoomFit').onclick=fit;
 $('#canvas').insertAdjacentHTML('beforeend','<div id="selectionLabel" hidden role="status"></div>');
 $('#undo').setAttribute('aria-label','Отменить · Ctrl Z');$('#redo').setAttribute('aria-label','Повторить · Ctrl Shift Z');
 setupPanelResize('library');setupPanelResize('inspector');
 if(matchMedia('(max-width: 760px)').matches){
  setInspectorOpen(false);
  if(!$('#libraryPanel').classList.contains('collapsed'))$('#toggleLibrary').click();
 }
 new ResizeObserver(()=>applyView()).observe($('#canvas'));
 const mobile=matchMedia('(max-width: 760px)');mobile.addEventListener('change',e=>{if(e.matches)setInspectorOpen(false)});
 $('#canvas').addEventListener('keydown',e=>{
  const pt=e.target.closest('.port'),card=e.target.closest('.module');
  if(!['Enter',' '].includes(e.key)||(!pt&&e.target!==card))return;
  e.preventDefault();e.stopPropagation();
  if(pt){const n=pt.dataset.node,p=pt.dataset.port,route=pt.dataset.route;activatePort(pt);$$('#nodes .port').find(v=>v.dataset.node===n&&v.dataset.port===p&&v.dataset.route===route)?.focus({preventScroll:true});}
  else if(placementMode){const ids=selection.has(card.dataset.id)?[...selection]:[card.dataset.id];mutate(()=>{for(const id of ids)node(id).mountLevel=placementLevel});$(`#nodes [data-id="${card.dataset.id}"]`)?.focus({preventScroll:true});}
  else focusDevice(card.dataset.id);
 });
 $('#canvas').addEventListener('focusin',e=>{const card=e.target.closest('.module');if(!card)return;const n=node(card.dataset.id);const label=$('#selectionLabel');label.hidden=false;label.textContent=deviceLabel(n)+(e.target.matches('.port')?' · '+e.target.title:'');});
 setupCommandMenu();
}
function setupCommandMenu(){
 const dialog=document.createElement('dialog');dialog.id='commandDialog';dialog.setAttribute('aria-labelledby','commandTitle');dialog.innerHTML='<div class="panel-title"><strong id="commandTitle">Приборы и команды</strong><button id="commandClose" aria-label="Закрыть поиск">×</button></div><input id="commandQuery" type="search" aria-label="Поиск по схеме, каталогу и командам" placeholder="Название, номер прибора или действие…"><div id="commandResults"></div><p class="help">↑ ↓ выбрать · Enter открыть · Esc закрыть</p>';
 document.body.append(dialog);let origin=null;
 const open=()=>{if(!state)return;origin=document.activeElement;$('#commandQuery').value='';renderCommands();dialog.showModal();$('#commandQuery').focus()};
 $('#commandClose').onclick=()=>dialog.close();dialog.addEventListener('close',()=>origin?.focus({preventScroll:true}));
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 $('#commandQuery').oninput=renderCommands;
 dialog.addEventListener('keydown',e=>{e.stopPropagation();const buttons=[...dialog.querySelectorAll('[data-command]')],i=buttons.indexOf(document.activeElement);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus()}else if(e.key==='Enter'&&e.target.id==='commandQuery'){e.preventDefault();buttons[0]?.click()}});
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();if(dialog.open)dialog.close();else open()}},true);
 function renderCommands(){
  const q=$('#commandQuery').value.trim().toLowerCase();
  const actions=[['Вписать схему',fit],['Открыть патч и проверки',renderPatch],['Размещение: пол и потолок',()=>{if(!placementMode)togglePlacementMode()}],['Открыть 3D-превью',openScenePreview],['Скачать JSON',()=>$('#saveProject').click()]];
  const found=state.nodes.filter(n=>deviceLabel(n).toLowerCase().includes(q)).map(n=>({label:deviceLabel(n),kind:'На схеме',run:()=>focusDevice(n.id)}));
  const commands=actions.filter(([label])=>!q||label.toLowerCase().includes(q)).map(([label,run])=>({label,kind:'Команда',run}));
  const models=q?catalog.filter(m=>catalogAvailable(m)&&shortModelName(m).toLowerCase().includes(q)).slice(0,20).map(m=>({label:shortModelName(m),kind:'Найти в каталоге',run:()=>{if(placementMode)togglePlacementMode();if($('#libraryPanel').classList.contains('collapsed'))$('#toggleLibrary').click();$('#search').value=shortModelName(m);renderCatalog();$('#catalogTree button')?.focus()}})):[];
  const results=[...commands,...found,...models].slice(0,60);
  $('#commandResults').innerHTML=results.map((r,i)=>`<button data-command="${i}"><span>${esc(r.label)}</span><small>${r.kind}</small></button>`).join('')||'<p role="status">Ничего не найдено. Попробуй название прибора.</p>';
  for(const button of dialog.querySelectorAll('[data-command]'))button.onclick=()=>{dialog.close();results[Number(button.dataset.command)].run()};
 }
}

for(const [selector,preference,hiddenClass] of [
 ['#toggleRulers','rig-grid-rulers','rulers-hidden'],
 ['#toggleDetails','rig-grid-details','details-hidden']
]){
 const toggle=document.querySelector(selector);
 if(!toggle)continue;
 try{toggle.checked=localStorage.getItem(preference)!=='off'}catch{}
 const update=()=>document.querySelector("body").classList.toggle(hiddenClass,!toggle.checked);
 update();
 toggle.addEventListener('change',()=>{
  update();
  try{localStorage.setItem(preference,toggle.checked?'on':'off')}catch{}
 });
}
