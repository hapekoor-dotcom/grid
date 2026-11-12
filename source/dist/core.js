/* Pure planning engine. No hardware traffic. */
const RigCore=(()=>{
const G=24,CELL_MM=200,snap=n=>Math.round(n/G)*G;
const pixelsToMillimeters=pixels=>pixels/G*CELL_MM;
const millimetersToPixels=millimeters=>millimeters/CELL_MM*G;
const areaToMeters=area=>({x:pixelsToMillimeters(area.x+area.w/2)/1000,z:pixelsToMillimeters(area.y+area.h/2)/1000,width:pixelsToMillimeters(area.w)/1000,depth:pixelsToMillimeters(area.h)/1000});
function supplyPorts(n){return [...(n.spec?.powerPortDefinitions||[]),...(n.spec?.signalPorts||[]).filter(p=>p.type==='usb'&&p.powerOnly)].map(p=>({...p,out:p.configurableDirection&&typeof n.portDirections?.[p.id]==='boolean'?n.portDirections[p.id]:p.out}))}
function sourcePhases(n){const outputs=supplyPorts(n).filter(p=>p.out);if(outputs.length){const phases=new Set(outputs.map(p=>p.powerDomain==='dc'||p.type==='usb'?'DC':'L1'));if(n.threePhase&&phases.has('L1')){phases.delete('L1');['L1','L2','L3'].forEach(v=>phases.add(v))}return [...phases]}return n.kind==='battery'?['DC']:n.threePhase?['L1','L2','L3']:['L1']}
function sourceRef(n,port){const p=[...(n.spec?.powerPortDefinitions||[]),...(n.spec?.signalPorts||[])].find(p=>p.id===port),dc=p?(p.powerDomain==='dc'||p.type==='usb'):n.kind==='battery';return{source:n.id,port,phase:dc?'DC':n.threePhase?(n.phases?.[port]||'L1'):'L1'}}
const powerSource=n=>n&&(['outlet','battery'].includes(n.kind)||n.powerRole==='source');
function powerInput(state,id,input=null){const matches=e=>!e.detached&&e.to===id&&(!input||e.toPort===input),direct=state.edges.find(e=>matches(e)&&e.type==='power');if(direct)return direct;return state.nodes.find(n=>n.id===id)?.usbPowered?state.edges.find(e=>matches(e)&&e.type==='usb'):null}
function root(state,id,type,seen=new Set(),input=null){
 const visit=id+':'+type+':'+input;if(seen.has(visit))return null;seen.add(visit);
 const target=state.nodes.find(n=>n.id===id);
 if(type==='dmx'&&target?.spec?.dmxPhysical===false){const radio=state.edges.find(e=>!e.detached&&e.to===id&&e.type==='wireless');if(radio)return root(state,radio.from,'dmx',seen);}
 const edge=type==='power'?powerInput(state,id,input):state.edges.find(e=>!e.detached&&e.to===id&&e.type===type&&(!input||e.toPort===input));if(!edge)return null;
 const parent=state.nodes.find(n=>n.id===edge.from);if(!parent)return null;if(type==='power'&&parent.powerOff)return null;
 if(type==='dmx'&&['node','console','interface'].includes(parent.kind))return{source:parent.id,port:edge.port,universe:parent.universes?.[(parent.dmxSourceUniverses?.[edge.port]??(Number(edge.port.replace(/\D/g,''))-1))]||1};
 if(type==='power'&&(['outlet','battery'].includes(parent.kind)||parent.powerRole==='source'))return sourceRef(parent,edge.port);
 if(type==='dmx'&&parent.kind==='receiver'){const radio=state.edges.find(e=>!e.detached&&e.to===parent.id&&e.type==='wireless');return radio?root(state,radio.from,'dmx',seen):null}
 if(type==='dmx'&&parent.kind==='splitter'){const b=parent.splitRouting?.[edge.port]==='B',inputs=(parent.spec?.signalPorts||[]).filter(p=>p.type==='dmx'&&!p.out);return root(state,parent.id,type,seen,inputs[b?1:0]?.id||(b?'dmxB':'dmxIn'))}
 return root(state,parent.id,type,seen);
}
function patch(state){
 const rows=state.nodes.filter(n=>n.dmx).map(n=>({...n,root:root(state,n.id,'dmx'),power:root(state,n.id,'power')})),issues=[...state.nodes.filter(n=>n.spec?.variantRequired&&!n.hardwareVariant).map(n=>n.name+': выбери версию прибора'),...state.nodes.filter(n=>n.spec?.dmx===null&&['light','effect'].includes(n.category)).map(n=>n.name+': наличие DMX и режимы требуют проверки'),...state.edges.filter(e=>e.needsReview).map(e=>'Сохранённый кабель требует сверки с разъёмами прибора: '+(state.nodes.find(n=>n.id===e.to)?.name||e.to))],used={};
 for(const r of rows){if(!r.channels||!Number.isInteger(r.channels)||r.channels<1||r.channels>512){issues.push(r.name+': выбери подтверждённый DMX-режим');continue}if(!r.root){issues.push(r.name+': нет DMX-линии');continue}const key=r.root.universe;used[key]??=new Set();if(r.manual){r.address=r.manual;for(let a=r.address;a<r.address+r.channels;a++)used[key].add(a)}}
 for(const r of rows){if(!r.root||!r.channels)continue;const set=used[r.root.universe];if(!r.address){let a=1;while(a<=512&&Array.from({length:r.channels},(_,i)=>a+i).some(v=>set.has(v)))a++;r.address=a;for(let c=a;c<a+r.channels;c++)set.add(c)}r.end=r.address+r.channels-1;if(r.end>512)issues.push(r.name+': превышено 512 каналов в U'+r.root.universe)}
 for(const r of rows){if(!r.root||!r.end)continue;const source=state.nodes.find(n=>n.id===r.root.source),capacity=source?.spec?.outputChannels??source?.outputChannels;if(Number.isInteger(capacity)&&capacity>0&&capacity<512&&r.end>capacity)issues.push(r.name+': адреса '+r.address+'–'+r.end+' превышают '+capacity+' каналов '+source.name)}
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){const a=rows[i],b=rows[j];if(a.root&&b.root&&a.root.universe===b.root.universe&&a.address<=b.end&&b.address<=a.end)issues.push('Пересечение: '+a.name+' / '+b.name)}
 return{rows,issues};
}
function powerEdge(state,e){return !e.detached&&(e.type==='power'||(e.type==='usb'&&powerInput(state,e.to)===e))}
function downstream(state,id,seen=new Set()) {if(seen.has(id))return[];const first=seen.size===0;seen.add(id);const n=state.nodes.find(n=>n.id===id);if(!n)return[];if(!first&&powerSource(n))return[n];return[n,...state.edges.filter(e=>e.from===id&&powerEdge(state,e)).flatMap(e=>downstream(state,e.to,seen))]}
function load(nodes){return{watts:nodes.reduce((s,n)=>s+(Number.isFinite(n.watts)?n.watts:0),0),unknown:nodes.filter(n=>n.consumes&&!Number.isFinite(n.watts)).length,typical:nodes.filter(n=>/typical/.test(n.wattsBasis)).length}}
const positiveLimit=value=>Number.isFinite(Number(value))&&Number(value)>0?Number(value):null;
const lowestLimit=values=>{const valid=values.filter(v=>v!==null);return valid.length?Math.min(...valid):null};
function sourceGroups(n){return(n.spec?.sourceLimits||[]).filter(g=>Array.isArray(g.ports)&&g.ports.length&&positiveLimit(g.watts)!==null).map((g,i)=>({...g,id:g.id||'group'+(i+1),ports:[...new Set(g.ports)],watts:Number(g.watts)}))}
function power(state){
 const sources=state.nodes.filter(powerSource),issues=[],branches=[],groups=[],roots=new Map(state.nodes.map(n=>[n.id,root(state,n.id,'power')]));
 for(const s of sources){const phases=sourcePhases(s),ports=supplyPorts(s).filter(p=>p.out),limits=sourceGroups(s),sourceMembers=state.nodes.filter(n=>roots.get(n.id)?.source===s.id);
  for(const phase of phases){const members=sourceMembers.filter(n=>roots.get(n.id).phase===phase),phasePorts=ports.filter(p=>sourceRef(s,p.id).phase===phase).map(p=>p.id),l=load(members),userLimit=positiveLimit(s.limits?.[phase]);
   // A group can provide a phase default only when it covers every output on that phase.
   // A smaller DC group must never become a cap on unrelated USB outputs.
   const hardwareLimit=lowestLimit(limits.filter(g=>phasePorts.length&&phasePorts.every(id=>g.ports.includes(id))).map(g=>g.watts)),limit=lowestLimit([userLimit,hardwareLimit]);
   const covered=id=>limits.some(g=>g.ports.includes(id))||positiveLimit(ports.find(p=>p.id===id)?.maxOutputWatts)!==null;
   const needsBudget=members.length&&!limit&&members.some(n=>!covered(roots.get(n.id).port)),overload=limit!==null&&l.watts>limit;
   branches.push({source:s.id,name:s.name,phase,...l,limit,userLimit,hardwareLimit,overload});if(overload)issues.push(s.name+' / '+phase+': '+l.watts+' W > '+limit+' W');if(l.unknown)issues.push(s.name+' / '+phase+': неизвестна мощность: '+members.filter(n=>n.consumes&&!Number.isFinite(n.watts)).map(n=>(n.name||n.id)+(n.number!=null?' №'+String(n.number).padStart(2,'0'):'')).join(', '));if(members.some(n=>n.wattsBasis==='lamp-rating'))issues.push(s.name+' / '+phase+': учтена мощность ламп, полное потребление приборов не подтверждено');if(l.typical)issues.push(s.name+' / '+phase+': используется типичная мощность, максимум не подтверждён');if(needsBudget)issues.push(s.name+' / '+phase+': задай допустимую мощность')
  }
  // Shared hardware caps are independent of user budgets and may span AC and DC.
  for(const g of limits){const members=sourceMembers.filter(n=>g.ports.includes(roots.get(n.id).port)),l=load(members),overload=l.watts>g.watts;groups.push({source:s.id,id:g.id,name:s.name,ports:g.ports,basis:g.basis||'',...l,limit:g.watts,overload});if(overload){issues.push(s.name+' / '+(g.label||g.ports.join(', '))+': превышен общий лимит выходов '+l.watts+' W > '+g.watts+' W');for(const b of branches)if(b.source===s.id&&members.some(n=>roots.get(n.id).phase===b.phase))b.overload=true}}
 }
 const links=[];for(const e of state.edges.filter(e=>powerEdge(state,e))){const from=state.nodes.find(n=>n.id===e.from),target=state.nodes.find(n=>n.id===e.to),members=powerSource(target)?[target]:downstream(state,e.to),l=load(members),port=supplyPorts(from||{}).find(p=>p.id===e.port),userLimit=positiveLimit(from?.outputLimits?.[e.port]),hardwareLimit=positiveLimit(port?.maxOutputWatts),wLimit=lowestLimit([userLimit,hardwareLimit]);const overload=wLimit!==null&&l.watts>wLimit;links.push({id:e.id,...l,limit:wLimit,userLimit,hardwareLimit,overload});if(overload)issues.push(from.name+' / '+e.port+': перегруз выхода '+l.watts+' W > '+wLimit+' W')}
 for(const n of state.nodes.filter(n=>n.kind==='distro'&&n.totalLimit)){const l=load(downstream(state,n.id));if(l.watts>n.totalLimit)issues.push(n.name+': превышен лимит распределителя '+l.watts+' W > '+n.totalLimit+' W')}
 const grouped=new Map();for(const b of branches){const source=state.nodes.find(n=>n.id===b.source);if(source.kind==='outlet'&&!source.circuit){issues.push(source.name+': не указан ID электрической линии');continue}if(source.kind!=='outlet')continue;const k=source.circuit+':'+b.phase;if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(b)}for(const [key,items]of grouped){if(items.length<2)continue;const sum=items.reduce((s,b)=>s+b.watts,0),limits=items.map(b=>b.limit).filter(Boolean),limit=limits.length?Math.min(...limits):null;if(new Set(limits).size>1)issues.push(key+': разные лимиты одной линии, использован меньший');for(const b of items){b.circuitWatts=sum;b.overload=b.overload||(limit!==null&&sum>limit)}if(limit&&sum>limit)issues.push('Общая линия '+key+': '+sum+' W > '+limit+' W')}
 for(const n of state.nodes.filter(n=>n.consumes))if(!root(state,n.id,'power')&&!n.internalBattery)issues.push(n.name+': нет питания');
 return{branches,links,groups,issues};
}
// Draw horizontal crossing segments as small jump arcs, never electrical junctions.
function bridged(points,others,r=7,jump=5){
 if(points.length<2)return '';
 let current=points[0],d=`M${current.x},${current.y}`;
 const line=end=>{
  if(current.y===end.y&&current.x!==end.x){
   const direction=Math.sign(end.x-current.x),lo=Math.min(current.x,end.x),hi=Math.max(current.x,end.x),hits=[];
   for(const path of others)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];if(a.x!==b.x||a.y===b.y)continue;
    if(a.x>lo+jump&&a.x<hi-jump&&current.y>Math.min(a.y,b.y)+1&&current.y<Math.max(a.y,b.y)-1)hits.push(a.x)}
   const sorted=[...new Set(hits)].sort((a,b)=>direction*(a-b));let last=null;
   for(const x of sorted){if(last!==null&&Math.abs(x-last)<jump*2+2)continue;d+=` L${x-direction*jump},${end.y} Q${x},${end.y-jump*2} ${x+direction*jump},${end.y}`;last=x}
  }
  d+=` L${end.x},${end.y}`;current=end;
 };
 for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1],l1=Math.hypot(b.x-a.x,b.y-a.y),l2=Math.hypot(c.x-b.x,c.y-b.y);if(!l1||!l2)continue;const q=Math.min(r,l1/2,l2/2),p={x:b.x+(a.x-b.x)*q/l1,y:b.y+(a.y-b.y)*q/l1},t={x:b.x+(c.x-b.x)*q/l2,y:b.y+(c.y-b.y)*q/l2};line(p);d+=` Q${b.x},${b.y} ${t.x},${t.y}`;current=t}
 line(points.at(-1));return d;
}
function rounded(points,r=7){if(points.length<2)return'';let d=`M${points[0].x},${points[0].y}`;for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1],l1=Math.hypot(b.x-a.x,b.y-a.y),l2=Math.hypot(c.x-b.x,c.y-b.y),q=Math.min(r,l1/2,l2/2);if(!l1||!l2)continue;const p={x:b.x+(a.x-b.x)*q/l1,y:b.y+(a.y-b.y)*q/l1},t={x:b.x+(c.x-b.x)*q/l2,y:b.y+(c.y-b.y)*q/l2};d+=` L${p.x},${p.y} Q${b.x},${b.y} ${t.x},${t.y}`}return d+` L${points.at(-1).x},${points.at(-1).y}`}
function simplify(points){return points.filter((p,i)=>!i||i===points.length-1||((points[i-1].x!==p.x||p.x!==points[i+1].x)&&(points[i-1].y!==p.y||p.y!==points[i+1].y)))}
const key=p=>p.x+','+p.y,segmentKey=(a,b)=>[key(a),key(b)].sort().join('|');
function route(a,b,rects,occupied=new Map()){
 const start={x:snap(a.x+a.dx*G),y:snap(a.y+a.dy*G)},end={x:snap(b.x+b.dx*G),y:snap(b.y+b.dy*G)};
 const minX=Math.min(start.x,end.x,...rects.map(r=>r.x))-G*5,maxX=Math.max(start.x,end.x,...rects.map(r=>r.x+r.w))+G*5,minY=Math.min(start.y,end.y,...rects.map(r=>r.y))-G*5,maxY=Math.max(start.y,end.y,...rects.map(r=>r.y+r.h))+G*5;
 const blocked=p=>rects.some(r=>p.x>r.x-1&&p.x<r.x+r.w+1&&p.y>r.y-1&&p.y<r.y+r.h+1);
 const open=[{...start,g:0,f:0,dir:-1,prev:null}],best=new Map();let found,steps=0;
 while(open.length&&steps++<15000){open.sort((a,b)=>b.f-a.f);const cur=open.pop();if(cur.x===end.x&&cur.y===end.y){found=cur;break}for(const [dir,[dx,dy]]of [[1,0],[0,1],[-1,0],[0,-1]].entries()){const p={x:cur.x+dx*G,y:cur.y+dy*G};if(p.x<minX||p.x>maxX||p.y<minY||p.y>maxY||(blocked(p)&&key(p)!==key(end)))continue;const cost=cur.g+1+(cur.dir!==dir&&cur.dir!==-1?2:0);const k=key(p)+':'+dir;if((best.get(k)??Infinity)<=cost)continue;best.set(k,cost);open.push({...p,g:cost,f:cost+(Math.abs(p.x-end.x)+Math.abs(p.y-end.y))/G,dir,prev:cur})}}
 let result=[];if(found){while(found){result.unshift({x:found.x,y:found.y});found=found.prev}}else result=[start,{x:start.x,y:end.y},end];return[{x:a.x,y:a.y},a.dy?{x:a.x,y:start.y}:{x:start.x,y:a.y},...result,b.dy?{x:b.x,y:end.y}:{x:end.x,y:b.y},{x:b.x,y:b.y}];
}
return{G,CELL_MM,snap,pixelsToMillimeters,millimetersToPixels,areaToMeters,root,patch,power,sourcePhases,load,downstream,route,rounded,bridged,simplify,segmentKey};
})();
if(typeof module!=='undefined')module.exports=RigCore;
