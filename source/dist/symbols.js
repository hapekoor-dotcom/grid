/* Schematic equipment silhouettes. No hardware port claims are inferred from artwork. */
function fixtureSymbol(kind, wide=false){
 const body='#202020', inset='#101010', metal='#484848', lit='#c4cbcd', line='#a4aaac';
 const rect=(x,y,w,h,r=3,fill=body,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
 const circle=(x,y,r,fill='none',extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
 const path=(d,extra='')=>`<path d="${d}" ${extra}/>`;
 const lens=(x,y,r)=>circle(x,y,r+2,inset)+circle(x,y,r,lit,'class="lens" stroke="#747d80"')+path(`M${x-r*.45} ${y-r*.55}q${r*.38} ${-r*.2} ${r*.72} 0`,'stroke="#E1E1D8" stroke-width="1" opacity=".65"');
 const sockets=(xs,y,r=4)=>xs.map(x=>circle(x,y,r,inset)+circle(x-1.5,y,0.65,line,'stroke="none"')+circle(x+1.5,y,0.65,line,'stroke="none"')).join('');
 const vents=(x,y,n=4,gap=4,length=17)=>Array.from({length:n},(_,i)=>path(`M${x} ${y+i*gap}h${length}`,'stroke="#61676a"')).join('');
 const rack=(content)=>rect(4,26,112,38,3)+path('M13 26v38m94-38v38','stroke="#606669"')+circle(8,34,1)+circle(8,56,1)+circle(112,34,1)+circle(112,56,1)+content;
 let c='';
 switch(kind){
 case 'panel':
  c=rect(13,14,94,57,4)+rect(19,20,82,45,1,inset)+Array.from({length:5},(_,y)=>Array.from({length:10},(_,x)=>circle(24+x*8,25+y*8,1.7,lit,'class="lens" stroke="none"')).join('')).join('')+path('M60 71v12m-17 0h34','stroke-width="3"');break;
 case 'flood':
  c=rect(17,16,86,57,6)+rect(24,23,72,43,3,inset)+circle(60,44,17,metal)+lens(60,44,11)+path('M11 34v35q0 11 12 11h74q12 0 12-11V34','stroke="#737b7e" stroke-width="3"');break;
 case 'effectlight':
  c=rect(10,23,100,50,6)+rect(16,29,88,37,2,inset)+[[31,47],[60,47],[89,47]].map(([x,y])=>lens(x,y,10)).join('')+path('M28 23V12h64v11M23 73v6m74-6v6');break;
 case 'interface':
  c=rect(23,12,74,65,6)+path('M35 12V5m50 7V5')+rect(33,24,54,14,2,inset)+sockets([43,77],55,8)+path('M51 68h18');break;

 case 'bar':
  c=rect(4,29,112,30,4)+rect(8,33,104,22,2,inset)+[17,34,51,68,85,102].map(x=>lens(x,44,7)).join('')+path('M19 59v8h12m58-8v8H77','stroke-width="2.4"');break;
 case 'pixel':
  c=rect(4,32,112,25,3)+rect(8,36,104,17,1,inset)+Array.from({length:16},(_,i)=>rect(10+i*6.35,38,4.5,13,.8,i%4===0?'#E1E1D8':i%2?'#889397':'#bcc5c8','stroke="none" class="lens"')).join('')+path('M19 57v7m82-7v7');break;
 case 'head':
  c=rect(35,73,50,12,3)+path('M24 31v29q0 10 12 10h48q12 0 12-10V31','fill="none" stroke="#757d80" stroke-width="7"')+circle(60,38,31,body)+circle(60,38,27,inset)+[[60,38],[60,20],[75.6,29],[75.6,47],[60,56],[44.4,47],[44.4,29]].map(([x,y])=>lens(x,y,6)).join('')+rect(48,76,24,5,1,inset)+circle(78,79,1,lit,'stroke="none"');break;
 case 'par':
  c=path('M23 38v25q0 9 10 9h54q10 0 10-9V38','stroke="#747b7e" stroke-width="5"')+circle(60,41,33,body)+circle(60,41,28,inset)+[[60,41],[60,22],[76.5,31.5],[76.5,50.5],[60,60],[43.5,50.5],[43.5,31.5]].map(([x,y])=>lens(x,y,6.5)).join('')+path('M52 73v7h16v-7');break;
 case 'spot':case 'beam':
  c=rect(34,74,52,11,3)+path('M24 30v31q0 9 12 9h48q12 0 12-9V30','stroke="#737b7e" stroke-width="7"')+rect(29,12,62,53,13)+circle(60,38,23,inset)+lens(60,38,kind==='beam'?18:15)+path('M37 17h46','stroke="#626b6e"');break;
 case 'strobe':
  c=rect(9,19,102,52,5)+rect(15,25,90,40,2,inset)+Array.from({length:10},(_,i)=>[31,57].map(y=>circle(21+i*8.6,y,2.1,lit,'stroke="none" class="lens"')).join('')).join('')+rect(17,39,86,10,2,lit,'class="lens"')+path('M20 71v7m80-7v7');break;
 case 'blinder':
  c=rect(8,16,104,58,5)+[35,85].map(x=>circle(x,45,23,inset)+circle(x,45,19,metal)+lens(x,45,14)).join('')+path('M17 74v6m86-6v6');break;
 case 'laser':
  c=rect(12,31,78,43,4)+path('M28 31V19h43v12')+rect(20,39,29,26,2,inset)+vents(25,44,4,5,19)+circle(69,52,12,inset)+circle(69,52,6,lit,'class="lens"')+path('M90 45l22-16M90 52h25M90 59l22 16','stroke="#c1cccf" stroke-width="1.3"')+path('M22 74v5m57-5v5');break;
 case 'mirrorball':
  c=path('M60 3v9')+circle(60,47,34,'#34383a')+path('M28 35h64M26 47h68M28 59h64M36 23h48M36 71h48M60 13v68M46 16q-12 31 0 62M74 16q12 31 0 62','stroke="#aab4b7" stroke-width="1.4"')+rect(48,25,10,8,0,'#bec7ca','stroke="none"')+rect(63,49,10,8,0,'#a5b0b4','stroke="none"')+rect(35,38,8,7,0,'#818d92','stroke="none"');break;
 case 'motor':
  c=rect(29,20,62,42,7)+circle(60,40,14,inset)+circle(60,40,7,metal)+path('M60 62v13q10 0 10 6t-10 6M40 20V10h40v10');break;
 case 'decor':
  c=circle(60,41,30,'#25282a')+path('M47 68v7h26v-7')+rect(37,75,46,8,3)+path('M60 13v56M33 28q27 12 54 0M31 45q29 12 58 0M42 17q-12 24 0 48m36-48q12 24 0 48','stroke="#828f94"');break;
 case 'fog':case 'haze':
  c=rect(10,39,72,35,5)+path('M28 39V27h34v12')+rect(17,46,28,20,2,inset)+vents(22,50,4,4,18)+circle(69,56,9,inset)+circle(69,56,4,metal)+path('M20 74v5m53-5v5');
  c+=kind==='haze'?path('M88 49q20-13 26-7M88 58q18-8 26-3M88 66q18-3 25 2','stroke="#a4b0b4" stroke-width="1.4"'):path('M85 51q14 0 13-9t-11-6 4-12 20-6M86 61q26 0 26-11t-11-7','stroke="#a4b0b4" stroke-width="2"');break;
 case 'bubble':
  c=rect(14,41,73,34,4)+path('M30 41V29h32v12')+circle(65,57,13,inset)+Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return circle(65+8*Math.cos(a),57+8*Math.sin(a),2.2,'#6a777c')}).join('')+circle(89,33,9)+circle(106,17,5)+circle(65,17,4)+path('M18 75v5m61-5v5');break;
 case 'snow':
  c=rect(10,43,73,32,4)+path('M29 43V30h32v13')+rect(19,50,35,16,2,inset)+vents(23,54,3,4,27)+circle(73,57,7,inset)+path('M92 17v18m-8-13 16 8m-16 0 16-8M107 41v14m-6-11 12 8m-12 0 12-8','stroke-width="1.5"');break;
 case 'confetti':case 'co2':
  c=rect(25,71,70,11,3)+path('M47 71 36 36l22-7 16 42z','fill="#25292b"')+path('m39 36 19-6','stroke-width="4"');
  c+=kind==='confetti'?path('m36 21-5-6m24 4 4-8m14 21 7-2m-63 3 5-4m24-20-2-6m37 14 5-6','stroke-width="3"'):path('M38 26q-17-4-12-12t15 2-1-12M57 23q18-13 15-19M46 23V3','stroke-width="2"');break;
 case 'flame':
  c=rect(27,68,66,15,3)+path('M60 7c-4 20-21 25-21 40a21 21 0 0 0 42 0c0-12-9-19-11-25 0 12-5 16-8 18 4-12 0-23-2-33z','fill="#444b4e"')+path('M60 39c-4 9-10 13-10 20a10 10 0 0 0 20 0c0-7-6-11-10-20z','fill="#b3bec2" stroke="none"');break;
 case 'fan':
  c=circle(60,42,32,body)+circle(60,42,27,inset)+[0,120,240].map(deg=>`<path transform="rotate(${deg} 60 42)" d="M60 38C40 8 29 27 45 39L55 44Z" fill="#616e74" stroke="#a2aeb3"/>`).join('')+circle(60,42,6,metal)+path('M35 68 25 81h70L85 68','stroke-width="3"')+circle(60,42,21,'none','stroke="#677379" stroke-width=".8"');break;
 case 'outlet':
  c=rect(25,10,70,70,8)+circle(60,45,26,inset)+circle(50,45,3.7,'#c0c7ca')+circle(70,45,3.7,'#c0c7ca')+path('M60 20v7m0 36v7','stroke-width="3"');break;
 case 'distro':
  c=rect(21,6,78,78,5)+rect(26,11,68,68,2,inset)+[23,45,67].map(y=>sockets([38,60,82],y,8)).join('');break;
 case 'battery':
  c=rect(38,14,44,69,5)+rect(49,6,22,8,2,metal)+rect(44,21,32,54,2,inset)+path('M52 35h16m-8-8v16m-8 19h16','stroke-width="2.4"');break;
 case 'battery-extension':case 'powerbank':
  c=rect(30,8,60,74,7)+rect(38,17,44,11,2,inset)+[44,54,64,74].map(x=>circle(x,22.5,1.4,lit,'stroke="none"')).join('')+rect(43,66,12,5,1,inset)+rect(66,66,9,5,2,inset)+path('M44 42h32m-32 8h22','stroke="#59656a"');break;
 case 'solar':
  c=rect(9,14,102,62,3,inset)+Array.from({length:3},(_,y)=>Array.from({length:5},(_,x)=>rect(14+x*19.5,19+y*18.5,15,14,1,'#343e43','stroke="#6f8088" stroke-width="1"')).join('')).join('')+path('M32 76v8m56-8v8');break;
 case 'generator':
  c=rect(11,28,98,50,6)+path('M34 28V16h52v12','stroke-width="4"')+rect(20,38,38,30,3,inset)+vents(25,44,4,6,28)+rect(68,39,30,28,2,inset)+circle(83,53,9)+path('M24 78v5m72-5v5');break;
 case 'generator-panel':
  return `<svg viewBox="10.25 27.25 99.5 51.5" aria-hidden="true" fill="none" stroke="#8c9390" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${rect(11,28,98,50,6)+rect(20,38,38,30,3,inset)+vents(25,44,4,6,28)+rect(68,39,30,28,2,inset)+circle(83,53,9)}</svg>`;
 case 'node':
  c=rack(rect(20,34,24,20,2,inset)+rect(24,38,16,8,1,'#707f85','stroke="none"')+Array.from({length:8},(_,i)=>rect(50+i*6.2,40,4.4,9,.6,inset)).join('')+circle(38,50,1.4,lit,'stroke="none"'));break;
 case 'splitter':
  c=rack(sockets([25],45,7)+path('M38 32v26','stroke="#59666b"')+sockets([49,65,81,97],45,5)+[49,65,81,97].map(x=>circle(x,55,1,lit,'stroke="none"')).join(''));break;
 case 'switch':
  c=rack(Array.from({length:8},(_,i)=>rect(20+i*10,39,7,10,1,inset)+path(`M${22+i*10} 42h3`,'stroke="#8b999f"')+circle(23.5+i*10,55,1,lit,'stroke="none"')).join(''));break;
 case 'receiver':case 'transmitter':
  c=rect(26,34,68,44,5)+path('M35 34V10m49 24V10','stroke-width="3"')+rect(39,43,42,19,2,inset)+circle(47,52,3,lit,'stroke="none"')+path(kind==='receiver'?'M72 48h-14m0 0 4-4m-4 4 4 4':'M58 48h14m0 0-4-4m4 4-4 4','stroke-width="1.5"')+path('M43 18q17-13 34 0M49 25q11-8 22 0','stroke="#7b8c94"');break;
 case 'phone':case 'tablet':
  c=rect(kind==='phone'?39:27,7,kind==='phone'?42:66,76,6)+rect(kind==='phone'?44:32,14,kind==='phone'?32:56,58,2,inset)+path(kind==='phone'?'M53 77h14':'M53 77h14','stroke-width="2"')+circle(60,10.5,1,'#818e94','stroke="none"');break;
 case 'laptop':
  c=rect(20,10,80,55,4)+rect(26,16,68,43,1,inset)+path('M19 65 8 78q0 4 7 4h90q7 0 7-4l-11-13Z','fill="#363d40"')+path('M27 69h66m-68 5h70M49 78h22','stroke="#69767c" stroke-width="1.2"');break;
 case 'computer':
  c=rect(6,17,77,50,3)+rect(12,23,65,37,1,inset)+path('M39 67v13m-17 0h36','stroke-width="3"')+rect(91,10,23,70,3)+rect(96,18,13,4,1,inset)+circle(102.5,32,2.5,lit,'stroke="none"')+vents(96,49,5,4,13);break;
 case 'console':
  return `<svg viewBox="0 0 144 72" aria-hidden="true" fill="none" stroke="#767c7c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
<rect x="1" y="1" width="62" height="42" rx="2" fill="#181b1b"/>
<path d="M8 12h35m-35 10h47m-47 10h27" stroke="#899493"/>
${[9,32,55].map(x=>`<circle cx="${x}" cy="63" r="7" fill="#303737"/>`).join('')}
${[80,95,110,125,140].map((x,i)=>`<path d="M${x} 2v68"/><rect x="${x-3}" y="${[20,35,48,23,38][i]}" width="6" height="9" rx="1" fill="#899493"/>`).join('')}
</svg>`;
 case 'mixer':
  c=rect(7,22,106,50,5)+rect(15,29,35,17,2,inset)+Array.from({length:6},(_,i)=>rect(15+i*15,54,11,10,1,i===1?'#bac5ca':'#3f4b50')).join('')+path('M66 31v14m17-14v14m17-14v14')+rect(62,33,8,4,1,'#8b989e')+rect(79,39,8,4,1,'#8b989e')+rect(96,34,8,4,1,'#8b989e');break;
 case 'tv':
  c=rect(5,10,110,65,3)+rect(11,16,98,53,1,inset)+path('M32 75 24 83m64-8 8 8','stroke-width="3"')+circle(107,72,1,lit,'stroke="none"');break;
 case 'ledwall':
  c=rect(6,8,108,73,2,inset)+path('M42 8v73m36-73v73M6 44h108','stroke="#969fa3" stroke-width="2"')+Array.from({length:4},(_,y)=>Array.from({length:8},(_,x)=>circle(14+x*13,17+y*18,1.3,'#697a82','stroke="none"')).join('')).join('');break;
 case 'projector':
  c=rect(8,25,104,47,7)+circle(84,48,18,inset)+lens(84,48,12)+vents(17,38,5,5,32)+rect(24,17,26,8,3)+path('M21 72v6m78-6v6');break;
 case 'camera':
  c=rect(12,28,96,44,6)+path('M35 28 40 18h33l6 10','fill="#282f32"')+circle(66,49,23,inset)+lens(66,49,16)+rect(20,35,14,5,1,'#717f85')+rect(21,20,15,8,2);break;
 case 'player':
  c=rect(13,27,94,38,7)+rect(21,37,37,17,2,inset)+circle(84,46,8)+path('M82 41v6','stroke-width="2"')+path('M24 66v5m72-5v5');break;
 case 'processor':default:
  c=rack(rect(21,34,37,21,2,inset)+path('M26 39h21m-21 6h14','stroke="#6c808a"')+rect(70,38,11,9,1,inset)+rect(88,38,11,9,1,inset)+[74,92].map(x=>circle(x,54,1.3,lit,'stroke="none"')).join(''));break;
 }
 return `<svg viewBox="${wide?'0 14 120 62':'0 0 120 90'}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${line}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${c}</svg>`;
}
const catalogDrawingBounds={"outlet":[23.5,8.5,73,73],"battery":[36.8,4.8,46.4,79.4],"node":[3.25,25.25,113.5,39.5],"splitter":[3.25,25.25,113.5,39.5],"receiver":[24.5,8.5,71,71],"transmitter":[24.5,8.5,71,71],"switch":[3.25,25.25,113.5,39.5],"par":[20.5,5.5,79,77],"spot":[20.5,8.5,79,80],"beam":[20.5,8.5,79,80],"pixel":[3.25,31.25,113.5,33.5],"strobe":[8.25,18.25,103.5,60.5],"blinder":[7.25,15.25,105.5,65.5],"haze":[9.25,26.25,105.5,53.5],"fog":[9,13.625,104,66.375],"confetti":[15,1,82,83],"snow":[9.25,16.25,104.5,59.5],"bubble":[13.25,11.25,98.5,69.5],"co2":[22.864,1,74.136,83],"laptop":[7.25,9.25,105.5,73.5],"computer":[4.5,8.5,111,73],"mixer":[6.25,21.25,107.5,51.5],"ledwall":[5,7,110,75],"tv":[3.5,8.5,113,76],"projector":[7.25,16.25,105.5,62.5],"processor":[3.25,25.25,113.5,39.5],"effectlight":[9.25,11.25,101.5,68.5],"bar":[2.8,27.8,114.4,40.4],"flood":[9.5,14.5,101,67],"head":[20.5,3.5,79,85],"decor":[29.25,10.25,61.5,73.5],"console":[0.25,0.25,143.5,70.5],"flame":[26.25,6.25,67.5,77.5],"laser":[11.25,18.25,104.5,61.5],"mirrorball":[25.25,2.25,69.5,79.5],"powerstation":[3.25,25.25,113.5,39.5],"battery-extension":[29.25,7.25,61.5,75.5],"generator":[9,14,102,71],"solar":[8.25,13.25,103.5,71.5],"panel":[11.5,12.5,97,72],"motor":[28.25,9.25,63.5,78.5],"fan":[23.5,8.5,73,74],"camera":[11.25,17.25,97.5,55.5],"interface":[22.25,4.25,75.5,73.5],"player":[12,26,96,46],"tablet":[26,6,68,78],"phone":[38,6,44,78],"powerbank":[29.25,7.25,61.5,75.5]};
function catalogPanelSymbol(kind,align='xMidYMid'){
 if(kind==='generator')return fixtureSymbol('generator-panel');
 const bounds=catalogDrawingBounds[kind]||catalogDrawingBounds.processor;
 return fixtureSymbol(kind).replace(/viewBox="[^"]+"/,`viewBox="${bounds.join(' ')}" preserveAspectRatio="${align} meet"`);
}
if(typeof module!=='undefined')module.exports={fixtureSymbol,catalogPanelSymbol};

function deltaRackFace(){
 const batteries=[18,60].map(x=>`<rect x="${x+10}" y="17" width="14" height="5" rx="1"/><rect x="${x}" y="22" width="34" height="58" rx="4"/>${[0,1,2,3].map(i=>`<rect x="${x+6}" y="${29+i*12}" width="22" height="8" rx="1" fill="#899493" stroke="none"/>`).join('')}`).join('');
 return `<svg viewBox="0 0 192 96" aria-hidden="true" fill="none" stroke="#8c9390" stroke-width="1.5" stroke-linejoin="round"><rect x="1" y="1" width="190" height="94" rx="5" fill="#181d1d"/>${batteries}<text x="142" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" fill="#b4bfbc" stroke="none">100%</text></svg>`;
}

function effectSymbol(kind){
 let c='';
 if(kind==='snow'){
  c=Array.from({length:6},(_,i)=>`<path transform="rotate(${i*60} 48 48)" d="M48 48V9m0 13-10-7m10 7 10-7m-10 19-8-6m8 6 8-6"/>`).join('');
 }else if(kind==='flame'){
  c='<path d="M49 7c3 20-23 29-23 49 0 16 10 28 24 28s25-12 25-27c0-13-8-21-10-32-1 11-6 17-11 20 4-14 1-25-5-38Z" fill="#303737"/><path d="M49 45c0 13-11 18-11 27a12 12 0 0 0 24 0c0-10-8-15-9-24-1 6-3 10-5 12" fill="#899493"/>';
 }else if(['fog','co2'].includes(kind)){
  c='<path d="M34 85c-10-10-16-15-15-24 0-8 6-12 13-13-9-9-8-21 2-26 6-3 12-1 16 4-1-12 6-20 16-17 9 3 12 13 6 21 14 0 19 15 9 24-7 6-17 4-20 12-3 8 3 14 0 19" fill="#303737"/><path d="M43 82c-10-13 9-18 4-29m8-15c-7 1-11 6-9 12"/>';
 }else if(kind==='haze'||kind==='fan'){
  c='<path d="M12 27c14-17 29 17 44 0s24-6 28-1M8 48c16-17 32 17 48 0s25-6 32-1M12 69c14-17 29 17 44 0s24-6 28-1"/>';
 }else if(kind==='bubble'){
  c=[[29,65,17],[64,43,14],[30,25,10],[72,15,6],[74,76,8]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x-r*.5} ${y-r*.45}q${r*.35} ${-r*.35} ${r*.7} ${-r*.1}"/>`).join('');
 }else if(kind==='confetti'){
  c='<path d="M45 84 24 49m24 35 2-48m3 48 24-35M16 19l5 8m17-16-2 10m27-8 5 9m13 5-6 6M10 46l8-3m64 27 7-4m-59 9-7 3M61 39l5-5"/><path d="m25 33 7-3 3 7-7 3Zm28-20 6 3-3 6-6-3Zm20 30 7 3-3 7-7-3Z" fill="#899493"/>';
 }else if(['receiver','transmitter'].includes(kind)){
  c='<path d="M10 31q38-37 76 0M22 45q26-25 52 0M34 59q14-13 28 0"/><circle cx="48" cy="76" r="4" fill="#899493"/>';
 }else if(kind==='laser'){
  c='<path d="M15 76 33 15M15 76 56 11M15 76 78 21M15 76 87 43M15 76 89 67"/><circle cx="15" cy="76" r="4" fill="#899493"/>';
 }else{
  c='<path d="M36 68v-7c0-8-14-13-14-29a26 26 0 0 1 52 0c0 16-14 21-14 29v7ZM36 75h24m-20 7h16M42 65V43l6 5 6-5v22"/><path d="M48 2V0M12 12l-5-5m77 5 5-5M8 34H1m87 0h7M13 56l-6 5m76-5 6 5"/>';
 }
 return `<svg viewBox="0 0 96 96" aria-hidden="true" fill="none" stroke="#8c9390" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${c}</svg>`;
}

function chassisContents(kind,w,h){
 const box=(x,y,a,b,fill='#181b1b')=>`<rect x="${x}" y="${y}" width="${a}" height="${b}" rx="2" fill="${fill}"/>`;
 const line=d=>`<path d="${d}"/>`,circle=(x,y,r,fill='#181b1b',extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
 const lens=(x,y,r)=>circle(x,y,r)+circle(x,y,r-3,'#303737')+circle(x,y,r-6,'#899493','class="lens"')+line(`M${x-r*.4} ${y-r*.55}q${r*.4} ${-r*.2} ${r*.8} 0`);
 const vents=(x,y,a,b,count=5)=>Array.from({length:count},(_,i)=>line(`M${x} ${y+i*b/(count-1)}h${a}`)).join('');
 const cx=w/2,cy=h/2,r=Math.min(w,h)/2-3;let c='';
 if(['tv','tablet','phone','ledwall','panel','solar'].includes(kind)){
  c=box(1,1,w-2,h-2);
  if(['ledwall','panel','solar'].includes(kind)){
   const cols=kind==='panel'?8:4,rows=kind==='panel'?5:3,gap=4,cw=(w-12-(cols-1)*gap)/cols,ch=(h-12-(rows-1)*gap)/rows;
   c+=Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>box(6+x*(cw+gap),6+y*(ch+gap),cw,ch,kind==='panel'?'#899493':'#303737')).join('')).join('');
  }else c+=line(`M8 ${h-9}h${w-16}`);
 }else if(['fan','mirrorball','decor'].includes(kind)){
  c=circle(cx,cy,r,'#303737');
  if(kind==='fan'){c+=circle(cx,cy,r-4);c+=[0,120,240].map(a=>`<path transform="rotate(${a} ${cx} ${cy})" d="M${cx} ${cy-3}c${-r*.7} ${-r*1.2} ${-r*1.3} ${-r*.15} ${-r*.3} ${r*.1}L${cx} ${cy+3}Z" fill="#899493"/>`).join('')+circle(cx,cy,5,'#303737');}
  else c+=line(`M${cx-r} ${cy}h${r*2}M${cx} ${cy-r}v${r*2}M${cx-r*.85} ${cy-r*.5}h${r*1.7}M${cx-r*.85} ${cy+r*.5}h${r*1.7}M${cx-r*.5} ${cy-r*.85}q${-r*.3} ${r*.85} 0 ${r*1.7}M${cx+r*.5} ${cy-r*.85}q${r*.3} ${r*.85} 0 ${r*1.7}`);
 }else if(['strobe','effectlight','blinder','flood'].includes(kind)){
  if(kind==='flood')c=box(1,1,w-2,h-2)+lens(cx,cy,r-5);
  else if(kind==='strobe'){c=box(2,cy-10,w-4,20,'#899493');c+=vents(4,4,w-8,cy-22,3)+vents(4,cy+22,w-8,cy-26,3);}
  else {const count=kind==='blinder'?2:3,lr=Math.min(w/count/2-4,h/2-4);c=Array.from({length:count},(_,i)=>lens(w*(i+.5)/count,cy,lr)).join('');}
 }else if(['fog','haze','snow','bubble','laser','projector','generator'].includes(kind)){
  const split=w*.52,lr=Math.min(w*.22-3,h*.34);
  c=vents(3,8,split-10,h-16,6);
  c+=kind==='projector'||kind==='laser'?lens(w*.77,cy,lr):circle(w*.77,cy,lr)+circle(w*.77,cy,lr*.65,'#303737');
  if(kind==='bubble')c+=Array.from({length:8},(_,i)=>circle(w*.77+lr*.78*Math.cos(i*Math.PI/4),cy+lr*.78*Math.sin(i*Math.PI/4),2,'#899493')).join('');
  if(kind==='snow')c+=line(`M${w*.77} 3v14m-6-11 12 8m-12 0 12-8`);
 }else if(['receiver','transmitter'].includes(kind)){
  c=box(2,h*.4,w-4,h*.6-2)+circle(14,h*.7,3,'#899493')+line(`M${w*.35} ${h*.7}h${w*.45}`);
  c+=line(`M${cx-w*.35} ${h*.25}q${w*.35} ${-h*.4} ${w*.7} 0M${cx-w*.23} ${h*.32}q${w*.23} ${-h*.25} ${w*.46} 0`);
 }else if(['splitter','switch','node','interface','processor','player','powerbank','battery-extension'].includes(kind)){
  c=box(2,2,w-4,h*.48)+line(`M10 12h${w*.6}M10 21h${w*.38}`);
  if(['powerbank','battery-extension'].includes(kind))c+=Array.from({length:4},(_,i)=>box(8+i*(w-16)/4,h*.68,(w-24)/4,12,'#899493')).join('');
  else if(['splitter','switch'].includes(kind))c+=Array.from({length:Math.min(8,Math.floor(w/12))},(_,i)=>circle(8+i*12,h*.78,2,'#899493')).join('');
  else c+=circle(w-16,h*.77,10,'#303737')+vents(4,h*.69,w*.5,14,3);
 }else if(kind==='mixer'){
  c=box(2,2,w*.47,h*.52)+line(`M9 12h${w*.31}M9 22h${w*.24}`);
  c+=Array.from({length:5},(_,i)=>{const x=w*.57+i*w*.095;return line(`M${x} 3v${h-6}`)+box(x-3,h*[.23,.45,.64,.32,.5][i],6,8,'#899493')}).join('');
  c+=[.09,.24,.39].map(x=>circle(w*x,h*.8,6,'#303737')).join('');
 }else if(kind==='camera')c=lens(cx,cy,r-1)+box(2,2,16,8,'#899493');
 else if(kind==='motor')c=circle(cx,cy,r,'#303737')+circle(cx,cy,r*.5)+vents(cx-r*.6,cy-r*.65,r*1.2,8,3);
 else if(kind==='distro'){const count=Math.max(2,Math.floor(w/24));c=Array.from({length:count},(_,i)=>box(i*w/count+2,2,w/count-4,h-4)+box(i*w/count+7,h*.4,w/count-14,h*.3,'#899493')).join('');}
 else return catalogPanelSymbol(kind);
 return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" fill="none" stroke="#8c9390" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${c}</svg>`;
}

function integratedPanel(kind,w,h){
 const rect=(x,y,width,height,fill='#181b1b')=>`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="2" fill="${fill}"/>`;
 const line=(x,y,length)=>`<path d="M${x} ${y}h${length}"/>`;
 let c='';
 if(kind==='battery-extension'){
  c=rect(2,2,w-4,26)+Array.from({length:4},(_,i)=>rect(10+i*(w-20)/4,10,(w-28)/4,9,'#899493')).join('');
  c+=line(8,h*.48,w-16)+line(8,h*.6,(w-16)*.65);
  c+=rect(10,h-17,14,7)+rect(w-24,h-17,14,7);
 }else if(['generator','powerstation'].includes(kind)){
  const split=Math.round(w*.56),right=w-split-6,r=Math.min(right/2-6,h*.38);
  c=rect(2,2,split-8,h-4)+Array.from({length:4},(_,i)=>line(8,12+i*(h-24)/3,split-20)).join('');
  c+=rect(split+4,2,right,h-4);
  c+=`<circle cx="${split+4+right/2}" cy="${h/2}" r="${r}" fill="#181b1b"/>`;
 }else{
  const ventW=w*.44,cx=w*.76,r=Math.min(w*.22,h*.33);
  c=rect(2,2,ventW,h-4)+Array.from({length:6},(_,i)=>line(8,12+i*(h-24)/5,ventW-12)).join('');
  c+=`<circle cx="${cx}" cy="${h/2}" r="${r}" fill="#181b1b"/><circle cx="${cx}" cy="${h/2}" r="${r*.68}" fill="#303737"/>`;
 }
 return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" fill="none" stroke="#8c9390" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${c}</svg>`;
}

/* The drawing is the equipment face itself, sized in world pixels.
   The HTML shell supplies its outer chassis, title and live connectors. */
function deviceFace(kind,w,h,rotation=0,outputs=6){
 const rect=(x,y,a,b,r=3,fill='#151515')=>`<rect x="${x}" y="${y}" width="${a}" height="${b}" rx="${r}" fill="${fill}"/>`;
 const circle=(x,y,r,fill='#151515',extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
 const path=d=>`<path d="${d}" fill="none"/>`;
 const lens=(x,y,r)=>circle(x,y,r+3,'#303030')+circle(x,y,r,'#9aa2a4','class="lens"')+path(`M${x-r*.55} ${y-r*.6}q${r*.55} ${-r*.35} ${r*1.1} 0`);
 const screw=(x,y)=>circle(x,y,2,'#777','stroke="none"');
 const vents=(x,y,n,len)=>Array.from({length:n},(_,i)=>path(`M${x} ${y+i*6}h${len}`)).join('');
 const socket=(x,y,r)=>circle(x,y,r)+circle(x-r*.33,y,2,'#b9b9b9')+circle(x+r*.33,y,2,'#b9b9b9');
 const cx=w/2,cy=h/2;let c='';
 if(['node','splitter','switch','processor','interface'].includes(kind)){
  const display=['node','processor','interface'].includes(kind);
  if(display)c=rect(6,12,w*.6,h-24,2,'#181b1b')+path(`M14 24h${w*.4}M14 34h${w*.3}`)+circle(w*.83,cy,10,'#303737');
  else c=Array.from({length:Math.min(8,outputs||8)},(_,i)=>{const x=12+(w-24)*(i+.5)/Math.min(8,outputs||8);return circle(x,cy-12,3,'#899493')+path(`M${x} ${cy+2}v16`)}).join('');
 }else if(kind==='outlet'){
  const count=Math.max(1,Math.round(w/48));c=Array.from({length:count},(_,i)=>(i?path(`M${i*48} 0v${h}`):'')+screw(i*48+5,5)+screw(i*48+43,5)).join('');
 }else if(kind==='distro'){
  const count=Math.max(1,outputs),step=(w-48)/count,bw=Math.min(32,step-3),bh=h-72;
  c=rect(8,6,w-16,h-44,4,'#34393b')+rect(18,14,w-36,h-60,2,'#171b1d')+path(`M18 32h${w-36}M18 ${h-62}h${w-36}`);
  c+=Array.from({length:count},(_,i)=>{const x=24+i*step+(step-bw)/2;return rect(x,22,bw,bh,2,'#b0b5b4')+rect(x+bw*.22,42,bw*.56,bh*.44,1,'#252a2c')+rect(x+bw*.2,29,bw*.6,4,0,'#d6ae52')+path(`M${x+3} ${bh+15}h${bw-6}`)}).join('');
  c+=path(`M12 ${h-38}h${w-24}`)+[12,w-12].map(x=>screw(x,11)+screw(x,h-46)).join('');
 }else if(['bar','pixel'].includes(kind)){
  const vertical=rotation%180!==0,n=kind==='pixel'?16:3,length=(vertical?h:w)-24,step=length/n;
  c=Array.from({length:n},(_,i)=>{const x=vertical?cx:12+step*(i+.5),y=vertical?12+step*(i+.5):cy;return kind==='bar'?lens(x,y,Math.min(step*.35,(vertical?w:h)*.28)):rect(vertical?20:x-step*.37,vertical?y-step*.37:20,vertical?w-40:step*.74,vertical?step*.74:h-40,2,i%2?'#727b7d':'#abb3b5').replace('/>',' class="lens"/>')}).join('');
 }else if(['par','head','spot','beam','flood','fan','mirrorball','decor'].includes(kind)){
  const r=Math.min(w,h)*.38;c=circle(cx,cy,r+5,'#303030');
  if(['head','par'].includes(kind))c+=lens(cx,cy,r*.25)+Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return lens(cx+Math.cos(a)*r*.63,cy+Math.sin(a)*r*.63,r*.24)}).join('');
  else if(['mirrorball','decor'].includes(kind))c+=circle(cx,cy,r,'#54595a')+[-.5,0,.5].map(f=>path(`M${cx-r*.85} ${cy+r*f}h${r*1.7}M${cx+r*f} ${cy-r*.85}v${r*1.7}`)).join('');
  else if(kind==='fan')c+=circle(cx,cy,r)+[0,120,240].map(a=>`<path transform="rotate(${a} ${cx} ${cy})" d="M${cx} ${cy}q${-r} ${-r} ${-r*.8} 0Z" fill="#858c8e"/>`).join('');
  else c+=lens(cx,cy,r*.85);
 }else if(['battery','battery-extension','powerbank'].includes(kind)){
  c=rect(18,18,w-36,17,3)+[0,1,2,3].map(i=>rect(26+i*(w-58)/4,24,(w-68)/4,5,1,'#9ca5a6')).join('')+path(`M${cx-14} ${cy}h28M${cx} ${cy-14}v28M${cx-14} ${h-25}h28`);
 }else if(['console','mixer'].includes(kind)){
  c=rect(18,18,w*.4,h*.35,4)+vents(25,29,3,w*.28)+Array.from({length:5},(_,i)=>{const x=w*.57+i*w*.075;return path(`M${x} 20v${h-48}`)+rect(x-4,35+i%3*18,8,8,1,'#a8afb0')}).join('')+[0,1,2].map(i=>circle(27+i*24,h-28,7,'#697477')).join('');
 }else if(['laptop','computer'].includes(kind)){
  const tw=60,screenW=w-tw-18;c=rect(tw+10,10,screenW,h-28,3,'#101415')+path(`M${tw+18} ${h-26}h${screenW-16}`)+rect(0,0,tw,h,3,'#292c2d')+path(`M${tw-7} 9v${h-18}`)+[8,h-8].map(y=>screw(7,y)).join('')+vents(tw-27,h-26,3,13);
 }else if(['tv','ledwall','phone','tablet','panel','solar'].includes(kind)){
  c=rect(9,9,w-18,h-18,2,'#101415');
  if(['ledwall','panel','solar'].includes(kind))c+=Array.from({length:4},(_,x)=>Array.from({length:3},(_,y)=>rect(15+x*(w-26)/4,15+y*(h-26)/3,(w-36)/4-4,(h-36)/3-4,1,'#344043')).join('')).join('');
  else c+=path(`M18 ${h-19}h${w-36}`);
 }else if(['strobe','blinder','effectlight'].includes(kind)){
  const n=kind==='blinder'?2:3;c=Array.from({length:n},(_,i)=>lens(w*(i+.5)/n,cy,Math.min(w/n*.36,h*.35))).join('');if(kind==='strobe')c=rect(14,cy-12,w-28,24,4,'#bec5c7').replace('/>',' class="lens"/>')+vents(18,15,3,w-36)+vents(18,h-27,3,w-36);
 }else if(['receiver','transmitter'].includes(kind)){
  c=rect(20,25,w-40,h-50,5)+circle(38,cy,5,'#a5b5ad')+path(`M${cx} ${cy}h${w*.2}M${cx} ${cy}l8-8M${cx} ${cy}l8 8`);
 }else if(['generator','powerstation'].includes(kind)){
  c=rect(4,4,w*.5-8,h-8,2,'#181b1b')+vents(12,14,Math.max(2,Math.floor((h-24)/8)),w*.5-24)+rect(w*.58,6,w*.36,22,2,'#181b1b')+path(`M${w*.62} 14h${w*.22}M${w*.62} 21h${w*.13}`)+circle(w*.76,h*.7,Math.min(14,h*.18),'#303737')+path(`M${w*.76} ${h*.7-8}v8`);
 }else if(['fog','haze','snow','bubble'].includes(kind)){
  c=rect(12,12,w*.42,h-24,4)+vents(20,23,Math.max(3,Math.floor((h-55)/8)),w*.3)+circle(w*.75,cy,Math.min(w*.16,h*.25));
  if(kind==='bubble')c+=Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return circle(w*.75+20*Math.cos(a),cy+20*Math.sin(a),5)}).join('');
  else c+=circle(w*.75,cy,10,'#62696b');
  if(kind==='snow')c+=path(`M${w*.75} 5v18m-8-14 16 10m-16 0 16-10`);
  if(kind==='haze')c+=path(`M${w*.61} ${h-12}q${w*.12} -8 ${w*.25} 0M${w*.61} ${h-5}q${w*.12} -8 ${w*.25} 0`);
 }else if(['confetti','co2','flame'].includes(kind)){
  const r=Math.min(w,h)*.26;c=circle(cx,cy+8,r+4,'#181b1b')+circle(cx,cy+8,r,'#303737');
  if(kind==='flame')c+=`<path d="M${cx} 3c0 13 -12 16 -12 27a12 12 0 0 0 24 0c0-7 -5-11 -5-16 -2 8-8 9-7-11Z" fill="#899493"/>`;
  else if(kind==='confetti')c+=path(`M${cx-6} ${cy+8}l-9-22 12-5 10 27ZM${cx-19} 8l-4-5m23 7 4-7m12 18 7-3m-47 1-6-3`);
  else c+=path(`M${cx-8} ${cy+8}v-15h16v15ZM${cx} ${cy-7}V5m-7 11q-15-8-8-13m22 13q15-8 8-13`);
 }else if(kind==='laser'){
  c=vents(18,22,6,w*.38)+rect(w*.58,20,w*.3,h-40,5)+circle(w*.73,cy,13,'#bcc6c8','class="lens"');
 }else if(kind==='camera'){
  c=rect(12,14,30,15,3,'#718084')+lens(cx+15,cy,Math.min(w,h)*.36);
 }else if(kind==='motor'){
  c=circle(cx,cy,Math.min(w,h)*.32)+circle(cx,cy,12,'#707779')+vents(15,15,3,25)+vents(w-40,h-30,3,25);
 }else if(kind==='player'){
  c=rect(18,22,w*.45,h-44,4)+circle(w*.77,cy,18)+path(`M${w*.77} ${cy-12}v12`);
 }else{
  c=vents(18,22,Math.max(3,Math.floor((h-50)/9)),w*.35)+lens(w*.73,cy,Math.min(w*.17,h*.28));
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true" fill="none" stroke="#979d9f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${c}</svg>`;
}
if(typeof module!=='undefined')module.exports.deviceFace=deviceFace;

function rackFace(w,h){
 // Equal 16px rail clearance, 24px column gutter and 24px vertical spacing.
 const margin=32,gap=24,col=(w-margin*2-gap)/2,top=24,screenH=60,right=margin+col+gap;
 const screws=[8,w-8].map(x=>[12,h-12].map(y=>`<circle cx="${x}" cy="${y}" r="2" fill="#777" stroke="none"/>`).join('')).join('');
 const button=16,buttonGap=(col-4*button)/3;
 const ventY=top+screenH+24,ventH=12,ventCount=25,ventStep=(w-2*margin-4)/(ventCount-1);
 return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" fill="none" stroke="#747a7c" stroke-width="1.2"><path d="M16 0v${h}M${w-16} 0v${h}"/>${screws}<rect x="${margin}" y="${top}" width="${col}" height="${screenH}" rx="5" fill="#171717"/><rect class="rack-screen" x="${margin+6}" y="${top+6}" width="${col-12}" height="${screenH-12}" rx="3"/><g class="rack-screen-content" stroke="none" fill="#31423e">${Array.from({length:8},(_,i)=>`<rect x="${margin+14+i*8}" y="${top+36-i*2}" width="5" height="${5+i*2}" rx=".5"/>`).join('')}<path d="M${margin+14} ${top+46}h60" stroke="#31423e"/></g>${[0,1,2].map(i=>`<circle class="rack-led rack-led-${i}" cx="${right+col/2+(i-1)*24}" cy="${top+12}" r="2.5"/>`).join('')}${[0,1,2,3].map(i=>`<rect x="${right+i*(button+buttonGap)}" y="${top+36}" width="${button}" height="${button}" rx="3" fill="#1b1b1b"/>`).join('')}${Array.from({length:ventCount},(_,i)=>`<path d="M${margin+2+i*ventStep} ${ventY}v${ventH}" stroke="#151515" stroke-width="3" stroke-linecap="round"/>`).join('')}</svg>`;
}
function rackConnector(type,out,connector=''){
 let c='';
 if(type==='power')c=out?'<circle cx="12" cy="12" r="7"/><path d="M8 8h6l3 4-3 4H8v-4h5"/>':'<path d="M6 5h12l2 3v11H4V8Z"/><path d="M8 10v4m8-4v4m-4-6v4"/>';
 else if(type==='ethernet')c='<path d="M4 5h16v12h-4v3H8v-3H4Z"/><path d="M7 5v5m3-5v5m4-5v5m3-5v5"/>';
 else {const pins=/3.pin/i.test(connector)?[[8,11],[16,11],[12,16]]:[[7,10],[17,10],[8,15],[16,15],[12,17]];c='<circle cx="12" cy="12" r="8"/><path d="M10 4V2h4v2"/>'+pins.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1" fill="currentColor" stroke="none"/>`).join('');}
 return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${c}</svg>`;
}

// Socket centre is x=0. The housing covers it; cable tail stays at x=24.
function cablePlug(type,connector=''){
 const round=type==='dmx'||/XLR|powerCON/i.test(connector),ether=type==='ethernet';
 const silhouette=round?'M-8-4Q-8-7-5-7H10Q15-7 17-3V3Q15 7 10 7H-5Q-8 7-8 4Z':'M-8-4-5-7H10L17-3V3L10 7H-5L-8 4Z';
 const detail=ether?'<path d="M-5-5H6L10-2H-3Z" fill="#b6bec0" stroke="#E1E1D8" stroke-width=".5"/><path d="M-3-4H5" stroke="#6c7477"/>':round?'<path d="M-4-5V5M0-6V6" stroke="#929a9d" stroke-width=".8"/><rect x="5" y="-6" width="6" height="2" rx="1" fill="currentColor"/>':'<path d="M-3-4V4M1-4V4M5-4V4" stroke="#697174" stroke-width=".8"/>';
 return `<svg viewBox="-9 -10 34 20" aria-hidden="true" stroke-linejoin="round"><path d="${silhouette}" transform="translate(1 2)" fill="#000" opacity=".45"/><path d="${silhouette}" fill="#24282b" stroke="currentColor" stroke-width=".9"/><path d="M-7-4-4-6H10L15-3H-3Z" fill="#737d82"/><path d="M-7-3H14V2H-7Z" fill="currentColor" opacity=".16"/><path d="M-7 3H14L10 6H-4Z" fill="#111416"/><path d="M-4-6H9" stroke="#E1E1D8" stroke-width=".65" opacity=".7"/>${detail}<path d="M16-3H21L24-1V1L21 3H16Z" fill="#303638" stroke="currentColor" stroke-width=".7"/><path d="M18-2V2M20-2V2M22-1V1" stroke="#788185" stroke-width=".7"/></svg>`;
}

function pcConnector(type){if(type==='power'||type==='ethernet')return rackConnector(type,false);const shape=type==='video'?'<path d="M3 7h18v7l-3 3H6l-3-3Z"/><path d="M7 10h10"/>':'<rect x="3" y="7" width="18" height="10" rx="1"/><path d="M7 10h10v3H7Z"/>';return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3">${shape}</svg>`}
