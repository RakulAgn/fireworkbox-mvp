const design = document.querySelector('#design');
const artboard = document.querySelector('#artboard');
const layerList = document.querySelector('#layerList');
const inspector = document.querySelector('#inspector');
const toastEl = document.querySelector('#toast');
let layers = [], assets = [], selectedId = null, z = 2, zoom = 1;

const templates = [
  { id:'paper-bomb', name:'Paper Bomb Carton', type:'Box', detail:'6-panel flattened carton', guide:`<rect x="45" y="45" width="1110" height="630"/><path class="fold" d="M45 170H1155M45 550H1155M230 45V675M490 45V675M710 45V675M970 45V675"/><text x="290" y="357">FRONT PANEL</text><text x="770" y="357">BACK PANEL</text><text x="70" y="105">TOP FLAP</text>` },
  { id:'tuck-carton', name:'Tuck End Carton', type:'Box', detail:'Retail carton with glue flap', guide:`<path d="M110 180H220V80H480V180H680V80H940V180H1090V540H940V640H680V540H480V640H220V540H110Z"/><path class="fold" d="M110 180H1090M110 540H1090M220 80V640M480 80V640M680 80V640M940 80V640"/><text x="290" y="370">FRONT</text><text x="750" y="370">BACK</text><text x="120" y="370">GLUE</text>` },
  { id:'matchbox', name:'Matchbox Sleeve', type:'Box', detail:'Outer sleeve for tray / inner box', guide:`<rect x="90" y="190" width="1020" height="340"/><path class="fold" d="M90 190V530M300 190V530M570 190V530M840 190V530M1050 190V530"/><path d="M90 190h-35v340h35"/><text x="355" y="370">FRONT PANEL</text><text x="635" y="370">BACK PANEL</text><text x="100" y="175">GLUE FLAP</text>` },
  { id:'bundle-wrap', name:'Firecracker Bundle Wrapper', type:'Wrapper', detail:'Full paper wrap with overlap seam', guide:`<rect x="60" y="90" width="1080" height="540"/><rect x="60" y="90" width="95" height="540" class="fold"/><path class="fold" d="M155 90V630M1045 90V630"/><text x="475" y="360">MAIN WRAP ARTWORK</text><text x="70" y="360">OVERLAP</text><text x="1000" y="360">SEAM</text>` },
  { id:'paper-strip', name:'Paper Strip / Brand Band', type:'Wrapper', detail:'Simple paper wrapper for small packs', guide:`<rect x="80" y="240" width="1040" height="240"/><rect x="80" y="240" width="80" height="240" class="fold"/><path class="fold" d="M160 240V480M1040 240V480"/><text x="470" y="370">BRAND WRAPPER</text><text x="93" y="370">GLUE</text>` },
  { id:'rocket-wrap', name:'Rocket / Tube Wrapper', type:'Wrapper', detail:'Label artwork with glue overlap', guide:`<rect x="115" y="95" width="970" height="530"/><rect x="115" y="95" width="85" height="530" class="fold"/><path class="fold" d="M200 95V625M1015 95V625"/><text x="470" y="370">TUBE WRAP DESIGN</text><text x="130" y="370">SEAM</text>` },
  { id:'belly-band', name:'Belly Band / Outer Sleeve', type:'Wrapper', detail:'Wrap around box or assortment pack', guide:`<rect x="55" y="235" width="1090" height="250"/><path class="fold" d="M265 235V485M530 235V485M795 235V485M1060 235V485"/><text x="325" y="375">FRONT</text><text x="845" y="375">BACK</text><text x="68" y="375">GLUE</text>` }
];
let currentTemplate = templates[0];

function renderDieline() { const guide = document.querySelector('#dieline'); guide.innerHTML = currentTemplate.guide; document.querySelector('#templateSummary').innerHTML = `${currentTemplate.name}<br><small>${currentTemplate.type} • ${currentTemplate.detail}</small>`; }
function renderTemplates(query = '') { const holder = document.querySelector('#templateResults'); const matching = templates.filter(t => `${t.name} ${t.type} ${t.detail}`.toLowerCase().includes(query.toLowerCase())); holder.innerHTML = matching.map(t => `<button class="template-result ${t.id === currentTemplate.id ? 'selected' : ''}" data-template="${t.id}"><strong>${t.name}</strong><small>${t.type} · ${t.detail}</small></button>`).join('') || '<p class="no-templates">No matching template. Upload your own dieline.</p>';
  holder.querySelectorAll('[data-template]').forEach(button => button.onclick = () => { currentTemplate = templates.find(t => t.id === button.dataset.template); renderDieline(); renderTemplates(document.querySelector('#templateSearch').value); document.querySelector('#templateLibrary').classList.remove('open'); toast(`${currentTemplate.name} selected. Confirm final dimensions with the manufacturer.`); }); }

const heroSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 430"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f9c690"/><stop offset="1" stop-color="#9b492f"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ef5a35"/><stop offset="1" stop-color="#46164e"/></linearGradient></defs><g stroke="#ffd173" stroke-width="7" stroke-linecap="round"><path d="M22 121L86 151M10 180l75 4M364 127l-66 27M372 186l-73-1" opacity=".8"/></g><circle cx="190" cy="111" r="65" fill="url(#a)"/><path fill="#201428" d="M129 96q8-70 66-66 61 7 59 80-39-24-125-14Z"/><path fill="#fff0d1" d="M163 112h15m28 0h15" stroke="#452034" stroke-width="5"/><path d="M173 151q18 13 36 0" fill="none" stroke="#682c37" stroke-width="5" stroke-linecap="round"/><path fill="url(#b)" d="M91 399q4-162 99-159 98-2 103 159Z"/><path fill="#2a1735" d="M143 242l47 75 48-75-32-23h-34Z"/><path fill="#e14839" d="M68 384q10-95 77-133l17 49-31 47Z M314 384q-10-95-77-133l-17 49 31 47Z"/><path fill="#ffd27b" d="M146 245h88l-12 30h-65Z"/><text x="190" y="418" font-family="Arial" font-weight="bold" text-anchor="middle" fill="#ffd578" font-size="18">FIRE ARENA</text></svg>`)}`;

function id() { return `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function toast(message) { toastEl.textContent = message; toastEl.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => toastEl.classList.remove('show'), 2600); }
function titleCase(value) { return value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function addLayer(type, props = {}) {
  const layer = { id:id(), type, name:props.name || titleCase(type), x:props.x ?? 35, y:props.y ?? 30, w:props.w ?? 20, h:props.h ?? 20, text:props.text || '', src:props.src || '', fontSize:props.fontSize || 7, rotation:props.rotation || 0, glow:props.glow || 0, locked:false, z:++z };
  layers.push(layer); selectedId = layer.id; render(); return layer;
}
function selected() { return layers.find(l => l.id === selectedId); }
function render() { design.innerHTML = ''; layers.sort((a,b) => a.z-b.z).forEach(renderObject); renderLayers(); renderInspector(); }
function renderObject(l) {
  const el = document.createElement('div'); el.className = `object ${l.type} glow-${l.glow}${l.id === selectedId ? ' selected' : ''}`; el.dataset.id = l.id;
  el.style.cssText = `left:${l.x}%;top:${l.y}%;width:${l.w}%;height:${l.h}%;transform:rotate(${l.rotation}deg);z-index:${l.z};`;
  if (l.type === 'text') { el.textContent = l.text; el.style.fontSize = `${l.fontSize}px`; }
  else if (l.type === 'image') { const img = document.createElement('img'); img.src = l.src; img.alt = l.name; el.append(img); }
  else if (l.type === 'badge') el.textContent = 'PREMIUM';
  else if (l.type === 'flare') el.textContent = '✦';
  const handle = document.createElement('span'); handle.className = 'resize-handle'; el.append(handle);
  el.addEventListener('pointerdown', startMove); el.addEventListener('dblclick', () => { if(l.type === 'text') editText(l); });
  design.append(el);
}
function renderLayers() { layerList.innerHTML = ''; [...layers].sort((a,b)=>b.z-a.z).forEach(l => { const row = document.createElement('button'); row.className = `layer-item ${l.type} ${l.id === selectedId ? 'active':''}`; row.innerHTML = `<span class="layer-icon">${l.type === 'text' ? 'T' : l.type === 'image' ? '▧' : l.type === 'badge' ? '✦' : '☄'}</span><span class="layer-name">${escapeHtml(l.name)}</span><span class="lock">${l.locked ? '🔒' : ''}</span>`; row.onclick = () => { selectedId = l.id; render(); }; layerList.append(row); }); }
function renderInspector() { const l = selected(); if (!l) { inspector.innerHTML = '<p class="eyebrow">SELECT AN OBJECT</p><p class="empty">Choose an object on the design to edit its placement and style.</p>'; return; }
  inspector.innerHTML = `<p class="eyebrow">${escapeHtml(l.name).toUpperCase()}</p><div class="control-grid"><label>X<input data-key="x" type="number" value="${Math.round(l.x)}"></label><label>Y<input data-key="y" type="number" value="${Math.round(l.y)}"></label><label>WIDTH<input data-key="w" type="number" min="1" value="${Math.round(l.w)}"></label><label>HEIGHT<input data-key="h" type="number" min="1" value="${Math.round(l.h)}"></label><label>ROTATE<input data-key="rotation" type="number" value="${Math.round(l.rotation)}"></label>${l.type === 'text' ? `<label>FONT SIZE<input data-key="fontSize" type="number" value="${l.fontSize}"></label>` : '<label>ORDER<select data-key="z"><option>Layer</option></select></label>'}</div><div class="effect-row"><label class="effect-label">GLOW EFFECT</label><input data-key="glow" type="range" min="0" max="3" value="${l.glow}"></div><button class="delete-object" id="deleteObject">Delete this object</button>`;
  inspector.querySelectorAll('[data-key]').forEach(input => input.addEventListener('input', () => { l[input.dataset.key] = Number(input.value); render(); }));
  inspector.querySelector('#deleteObject').onclick = deleteSelected;
}
function escapeHtml(v){ const d=document.createElement('div');d.textContent=v;return d.innerHTML; }
function startMove(event) { const target = event.currentTarget, l = layers.find(x => x.id === target.dataset.id); if (!l || l.locked) return; selectedId=l.id;
  design.querySelectorAll('.object.selected').forEach(el => el.classList.remove('selected')); target.classList.add('selected'); renderLayers(); renderInspector();
  const startX=event.clientX,startY=event.clientY, original={x:l.x,y:l.y,w:l.w,h:l.h}; const box=artboard.getBoundingClientRect(), resizing=event.target.classList.contains('resize-handle'); target.setPointerCapture(event.pointerId);
  const move=e=> { const dx=(e.clientX-startX)/box.width*100,dy=(e.clientY-startY)/box.height*100; if(resizing){l.w=Math.max(3,original.w+dx);l.h=Math.max(3,original.h+dy)}else{l.x=Math.max(-10,Math.min(100-l.w+10,original.x+dx));l.y=Math.max(-10,Math.min(100-l.h+10,original.y+dy))} target.style.left=`${l.x}%`;target.style.top=`${l.y}%`;target.style.width=`${l.w}%`;target.style.height=`${l.h}%`; };
  target.addEventListener('pointermove',move); target.addEventListener('pointerup',()=>{target.removeEventListener('pointermove',move);render();},{once:true}); }
function editText(l) { const value = prompt('Edit text',l.text); if(value !== null){ l.text=value; l.name=value.slice(0,22)||'Text'; render(); } }
function deleteSelected(){ if(!selectedId)return;layers=layers.filter(l=>l.id!==selectedId);selectedId=layers.at(-1)?.id||null;render(); }
function addText(){addLayer('text',{name:'Text — editable',text:'NEW PRODUCT',x:34,y:39,w:32,h:13,fontSize:42});}
function addArtwork(src=heroSvg,name='Wrestling hero artwork'){addLayer('image',{name,src,x:42,y:19,w:18,h:55});}
function addAsset(src, name = 'Generated artwork') { assets.unshift({ id: id(), src, name }); renderAssets(); }
function renderAssets() { const shelf = document.querySelector('#assetShelf'); if (!assets.length) { shelf.innerHTML = '<p class="shelf-empty">Your generated artwork will appear here. Select an asset to place it on the box.</p>'; return; }
  shelf.innerHTML = ''; assets.forEach((asset, index) => { const card = document.createElement('button'); card.className = 'asset-card'; card.title = 'Add this artwork as an editable layer'; card.innerHTML = `<img src="${asset.src}" alt="${escapeHtml(asset.name)}"><span>${escapeHtml(asset.name)}</span>`; card.onclick = () => { addArtwork(asset.src, asset.name); toast('Artwork placed as a new movable layer.'); }; shelf.append(card); }); }
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{ const type=b.dataset.add;if(type==='text')addText();else if(type==='image')addArtwork();else addLayer(type,{x:type==='badge'?72:25,y:type==='badge'?13:13,w:type==='badge'?12:11,h:type==='badge'?15:18,name:titleCase(type)}); });
document.querySelector('#openTemplates').onclick = () => document.querySelector('#templateLibrary').classList.toggle('open');
document.querySelector('#templateSearch').oninput = e => renderTemplates(e.target.value);
document.querySelector('#deleteLayer').onclick=deleteSelected;
document.querySelector('#guideToggle').onclick=e=>{document.querySelector('#dieline').classList.toggle('hidden');e.currentTarget.classList.toggle('active');};
document.querySelector('#layoutUpload').onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{artboard.style.backgroundImage=`url(${r.result})`;artboard.style.backgroundSize='100% 100%';document.querySelector('#templateSummary').innerHTML=`Custom dieline<br><small>${escapeHtml(file.name)}</small>`;toast('Custom dieline uploaded. Check its panels before exporting.');};r.readAsDataURL(file)};
document.querySelector('#productName').oninput=e=>{const product=layers.find(l=>l.name==='Product name');if(product){product.text=e.target.value.toUpperCase();render();}};
document.querySelector('#brandName').oninput=e=>{const brand=layers.find(l=>l.name==='Brand name');if(brand){brand.text=e.target.value;render();}};
document.querySelector('#generate').onclick=generate;
async function generate(){
  const button=document.querySelector('#generate'), direction=document.querySelector('#designPrompt').value.trim(), type=document.querySelector('#assetType').value;
  if(!direction)return toast('Describe the artwork you want to create.');
  const prompt=`Create one standalone ${type} for a premium Indian fireworks package. Art direction: ${direction}. This is an original commercial illustration. Do not include any words, letters, numbers, brand logos, watermarks, real people, or copyrighted characters. Keep the subject fully in frame and visually bold for packaging.`;
  button.textContent='Generating…';button.disabled=true;
  try{
    const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,count:document.querySelector('#variantCount').value,quality:document.querySelector('#quality').value,background:document.querySelector('#transparent').checked?'transparent':'opaque',size:'1024x1024'})});
    const data=await r.json();if(!r.ok)throw Error(data.error);data.images.forEach((image,index)=>addAsset(image,`AI ${type} ${index+1}`));toast(`${data.images.length} AI asset${data.images.length>1?'s':''} ready. Click one to add it.`);
  }catch(e){addAsset(heroSvg,'Demo original hero');toast(`${e.message} A demo asset was added instead.`)}finally{button.textContent='✦ Generate assets';button.disabled=false;}
}
document.querySelector('#saveProject').onclick=()=>{const data=JSON.stringify({version:1,product:document.querySelector('#productName').value,brand:document.querySelector('#brandName').value,layers},null,2);download('adiyal-fireworkbox-project.json',data,'application/json');toast('Project saved. Reopening project files is planned for the next MVP pass.');};
document.querySelector('#exportSvg').onclick=exportSvg; document.querySelector('#printPdf').onclick=()=>window.print();
function exportSvg(){const objects=layers.sort((a,b)=>a.z-b.z).map(l=>{const x=l.x*12,y=l.y*7.2,w=l.w*12,h=l.h*7.2,transform=`rotate(${l.rotation} ${x+w/2} ${y+h/2})`; if(l.type==='text')return `<text x="${x+w/2}" y="${y+h*.72}" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="${l.fontSize*1.8}" font-weight="800" letter-spacing="3" transform="${transform}">${escapeXml(l.text)}</text>`;if(l.type==='image')return `<image href="${l.src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" transform="${transform}"/>`;if(l.type==='badge')return `<g transform="${transform}"><circle cx="${x+w/2}" cy="${y+h/2}" r="${Math.min(w,h)/2}" fill="#ffcf4a" stroke="#fff0b2" stroke-width="5"/><text x="${x+w/2}" y="${y+h/2+5}" text-anchor="middle" font-family="Arial" font-size="14" font-weight="700" fill="#48214d">PREMIUM</text></g>`;return `<text x="${x}" y="${y+h}" font-size="${h}" fill="#ffc738" transform="${transform}">✦</text>`;}).join('');const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="#2c1837"/>${objects}</svg>`;download('adiyal-magiccrackers-coreldraw-ready.svg',svg,'image/svg+xml');toast('SVG exported. Open it in CorelDRAW for final print setup.');}
function escapeXml(v){return v.replace(/[<>&'\"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;','&':'&amp;'}[c]));}function download(name,body,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href);}
function changeZoom(amount){zoom=Math.max(.6,Math.min(1.3,zoom+amount));artboard.style.transform=`scale(${zoom})`;document.querySelector('#zoomText').textContent=`${Math.round(zoom*100)}%`;}
document.querySelector('#zoomIn').onclick=()=>changeZoom(.1);document.querySelector('#zoomOut').onclick=()=>changeZoom(-.1);
renderDieline();renderTemplates();addLayer('text',{name:'Product name',text:'ADIYAL',x:29,y:38,w:36,h:15,fontSize:62,glow:1});addLayer('text',{name:'Brand name',text:'MagicCrackers',x:35,y:26,w:25,h:9,fontSize:20});addArtwork();addLayer('badge',{name:'Premium badge',x:65,y:18,w:11,h:18});addLayer('flare',{name:'Gold flare',x:23,y:61,w:9,h:13,glow:2});addAsset(heroSvg,'Demo original hero');render();

