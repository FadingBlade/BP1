import { value as staticModuleValue } from './modules/value.js';

const TESTS = [
 ['dom-js','DOM + module JavaScript'],
 ['css','CSS stylesheet'],
 ['svg','SVG image'],
 ['json-fetch','JSON fetch'],
 ['query-fetch','Query-string resource resolution'],
 ['fragment-fetch','Fragment resource resolution'],
 ['nested-file','Nested path fetch'],
 ['directory-index','Directory index resolution'],
 ['missing-404','Missing resource returns 404'],
 ['head','HEAD request'],
 ['static-module','Static ES module import'],
 ['dynamic-module','Dynamic import()'],
 ['import-meta','import.meta.url relative URL'],
 ['xhr','XMLHttpRequest'],
 ['blob-url','Blob/object URL'],
 ['classic-worker','Classic Web Worker'],
 ['module-worker','Module Web Worker'],
 ['wasm','WebAssembly fetch + instantiate'],
 ['binary','Binary resource integrity'],
 ['large-file','2 MiB resource fetch'],
 ['range','HTTP Range request'],
 ['history','History pushState/replaceState'],
 ['storage','localStorage + sessionStorage'],
 ['indexeddb','IndexedDB'],
 ['cache-api','Cache Storage API'],
 ['crypto','Web Crypto'],
 ['formdata','FormData encoding'],
 ['audio','Audio resource metadata'],
 ['video','Video resource metadata'],
 ['download','Download resource'],
 ['own-sw','BP1 site Service Worker registration'],
 ['external-fetch','External HTTPS fetch/CORS']
];

const results = new Map();
const $ = id => document.getElementById(id);

function renderRows(){
  const host=$('results'); host.innerHTML='';
  for(const [id,name] of TESTS){
    const el=document.createElement('article'); el.className='test'; el.id='test-'+id;
    el.innerHTML=`<div class="test-head"><h3>${name}</h3><span class="status pending">PENDING</span></div><div class="detail">Not run yet.</div>`;
    host.appendChild(el);
  }
  updateSummary();
}
function setResult(id,status,detail=''){
  results.set(id,{status,detail});
  const el=$('test-'+id); if(!el)return;
  const s=el.querySelector('.status'); s.className='status '+status.toLowerCase(); s.textContent=status;
  el.querySelector('.detail').textContent=detail;
  updateSummary();
}
function updateSummary(){
  const c={PASS:0,PARTIAL:0,FAIL:0,PENDING:0};
  for(const [id] of TESTS)c[(results.get(id)?.status)||'PENDING']++;
  $('passCount').textContent=`${c.PASS} PASS`; $('partialCount').textContent=`${c.PARTIAL} PARTIAL`;
  $('failCount').textContent=`${c.FAIL} FAIL`; $('pendingCount').textContent=`${c.PENDING} PENDING`;
}
async function timed(name,fn){
  try{const v=await Promise.race([fn(),new Promise((_,r)=>setTimeout(()=>r(new Error('Timed out after 8 seconds')),8000))]);return v}
  catch(e){throw e}
}
async function run(id,fn){
  setResult(id,'PENDING','Running...');
  try{
    const r=await timed(id,fn);
    if(r && typeof r==='object' && r.status)setResult(id,r.status,r.detail||'');
    else setResult(id,'PASS',String(r??'OK'));
  }catch(e){setResult(id,'FAIL',e?.message||String(e))}
}
async function testImage(img){
  if(img.complete && img.naturalWidth>0)return `${img.naturalWidth}×${img.naturalHeight}`;
  await new Promise((res,rej)=>{img.onload=res; img.onerror=()=>rej(new Error('Image failed to load'));});
  return `${img.naturalWidth}×${img.naturalHeight}`;
}
function openIDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open('bp1-compat-test',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('s');
    req.onerror=()=>reject(req.error);
    req.onsuccess=()=>{
      const db=req.result, tx=db.transaction('s','readwrite'), s=tx.objectStore('s');
      s.put('ok','k');
      tx.oncomplete=()=>{
        const tx2=db.transaction('s'),g=tx2.objectStore('s').get('k');
        g.onsuccess=()=>{const v=g.result; db.close(); resolve(v);};
        g.onerror=()=>reject(g.error);
      };
    };
  });
}
async function mediaMetadata(tag,src){
  return new Promise((resolve,reject)=>{
    const m=document.createElement(tag); m.preload='metadata'; m.src=src;
    const done=()=>resolve({duration:m.duration,readyState:m.readyState});
    m.onloadedmetadata=done; m.onerror=()=>reject(new Error(`${tag} failed to load (${m.error?.code||'unknown'})`));
    document.body.appendChild(m);
    setTimeout(()=>m.remove(),7000);
  });
}
async function runAll(){
  $('runAll').disabled=true;
  await run('dom-js',async()=>document.title.includes('BP1')?'Module script executed':'Unexpected title');
  await run('css',async()=>getComputedStyle($('cssSentinel')).width==='173px'?'External CSS applied':Promise.reject(new Error('CSS sentinel style missing')));
  await run('svg',async()=>`SVG loaded: ${await testImage($('svgSentinel'))}`);
  await run('json-fetch',async()=>{const r=await fetch('data/test.json');if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();if(j.protocol!=='BP1')throw new Error('Unexpected JSON');return 'Fetched and parsed JSON';});
  await run('query-fetch',async()=>{const r=await fetch('data/test.json?cacheBust=123');if(!r.ok)throw new Error(`HTTP ${r.status}`);return 'Query string ignored for BP1 lookup as expected';});
  await run('fragment-fetch',async()=>{const r=await fetch('data/test.json#fragment');if(!r.ok)throw new Error(`HTTP ${r.status}`);return 'Fragment did not break lookup';});
  await run('nested-file',async()=>{const r=await fetch('nested/index.html');const t=await r.text();if(!r.ok||!t.includes('NESTED_BP1_OK'))throw new Error(`HTTP ${r.status}`);return 'Nested file resolved';});
  await run('directory-index',async()=>{const r=await fetch('nested/');const t=await r.text();if(!r.ok||!t.includes('NESTED_BP1_OK'))throw new Error(`HTTP ${r.status}`);return 'nested/ -> nested/index.html';});
  await run('missing-404',async()=>{const r=await fetch('does-not-exist.xyz');if(r.status!==404)throw new Error(`Expected 404, got ${r.status}`);return '404 returned correctly';});
  await run('head',async()=>{const g=await fetch('data/test.json');if(!g.ok)throw new Error(`GET HTTP ${g.status}`);const expectedLength=(await g.arrayBuffer()).byteLength;const expectedType=(g.headers.get('content-type')||'').split(';')[0];const r=await fetch('data/test.json',{method:'HEAD'});if(!r.ok)throw new Error(`HEAD HTTP ${r.status}`);const body=await r.arrayBuffer();if(body.byteLength!==0)throw new Error(`HEAD returned a ${body.byteLength}-byte body`);const len=Number(r.headers.get('content-length'));if(len!==expectedLength)throw new Error(`Content-Length mismatch: expected ${expectedLength}, got ${r.headers.get('content-length')}`);const type=(r.headers.get('content-type')||'').split(';')[0];if(type!==expectedType)throw new Error(`Content-Type mismatch: expected ${expectedType}, got ${type||'(missing)'}`);return `HEAD 200, empty body, Content-Length ${len}, matching Content-Type`;});
  await run('static-module',async()=>{if(staticModuleValue!==42)throw new Error('Imported value mismatch');return 'Static import resolved';});
  await run('dynamic-module',async()=>{const m=await import('./modules/dynamic.js');if(m.default!=='DYNAMIC_BP1_OK')throw new Error('Dynamic module mismatch');return 'Dynamic import resolved';});
  await run('import-meta',async()=>{const u=new URL('../assets/pixel.svg',import.meta.url);const r=await fetch(u);if(!r.ok)throw new Error(`HTTP ${r.status}`);return `Resolved ${u.pathname.split('/').slice(-2).join('/')}`;});
  await run('xhr',()=>new Promise((resolve,reject)=>{const x=new XMLHttpRequest();x.open('GET','data/test.json');x.onload=()=>x.status===200?resolve('XHR loaded local resource'):reject(new Error(`XHR ${x.status}`));x.onerror=()=>reject(new Error('XHR network error'));x.send();}));
  await run('blob-url',async()=>{const u=URL.createObjectURL(new Blob(['BP1_BLOB_OK'],{type:'text/plain'}));try{const r=await fetch(u),t=await r.text();if(t!=='BP1_BLOB_OK')throw new Error('Blob mismatch');return 'Blob URL fetch works';}finally{URL.revokeObjectURL(u);}});
  await run('classic-worker',()=>new Promise((resolve,reject)=>{const w=new Worker('workers/classic-worker.js');const tm=setTimeout(()=>{w.terminate();reject(new Error('Worker timeout'));},5000);w.onmessage=e=>{clearTimeout(tm);w.terminate();e.data?.ok?resolve('Classic worker loaded and messaged'):reject(new Error('Unexpected worker reply'));};w.onerror=e=>{clearTimeout(tm);w.terminate();reject(new Error(e.message||'Worker error'));};w.postMessage(41);}));
  await run('module-worker',()=>new Promise((resolve,reject)=>{const w=new Worker('workers/module-worker.js',{type:'module'});const tm=setTimeout(()=>{w.terminate();reject(new Error('Module worker timeout'));},5000);w.onmessage=e=>{clearTimeout(tm);w.terminate();e.data?.ok?resolve('Module worker imported module'):reject(new Error('Unexpected module worker reply'));};w.onerror=e=>{clearTimeout(tm);w.terminate();reject(new Error(e.message||'Module worker error'));};}));
  await run('wasm',async()=>{const r=await fetch('wasm/add.wasm');if(!r.ok)throw new Error(`HTTP ${r.status}`);let inst;try{inst=await WebAssembly.instantiateStreaming(Promise.resolve(r.clone()));}catch{const b=await r.arrayBuffer();inst=await WebAssembly.instantiate(b);}if(inst.instance.exports.add(20,22)!==42)throw new Error('WASM result mismatch');return 'WASM fetched, instantiated, and executed';});
  await run('binary',async()=>{const r=await fetch('downloads/sample.bin');const b=new Uint8Array(await r.arrayBuffer());if(b.length!==2048||b[0]!==0||b[255]!==255)throw new Error(`Unexpected binary data (${b.length} bytes)`);return 'Binary bytes preserved';});
  await run('large-file',async()=>{const r=await fetch('assets/large.bin');const b=await r.arrayBuffer();if(b.byteLength!==2097152)throw new Error(`Expected 2097152 bytes, got ${b.byteLength}`);return '2 MiB resource fetched intact';});
  await run('range',async()=>{const r=await fetch('assets/large.bin',{headers:{Range:'bytes=100-199'}});const b=await r.arrayBuffer();if(r.status===206&&b.byteLength===100)return '206 Partial Content + correct byte count';if(r.status===200)return {status:'FAIL',detail:`Range header was ignored: HTTP 200, ${b.byteLength} bytes returned. BP1 needs Range/206 support for efficient media seeking.`};throw new Error(`HTTP ${r.status}, ${b.byteLength} bytes`);});
  await run('history',async()=>{const old=location.href;history.pushState({bp1:1},'',location.pathname+'?historyTest=1#bp1');if(!location.href.includes('historyTest=1'))throw new Error('pushState failed');history.replaceState({},'',old);return 'pushState and replaceState executed';});
  await run('storage',async()=>{localStorage.setItem('bp1-ls','ok');sessionStorage.setItem('bp1-ss','ok');if(localStorage.getItem('bp1-ls')!=='ok'||sessionStorage.getItem('bp1-ss')!=='ok')throw new Error('Storage mismatch');return 'localStorage + sessionStorage available';});
  await run('indexeddb',async()=>{const v=await openIDB();if(v!=='ok')throw new Error('IndexedDB mismatch');return 'IndexedDB read/write works';});
  await run('cache-api',async()=>{if(!('caches' in window))throw new Error('Cache API unavailable');const c=await caches.open('bp1-site-self-test');await c.put(new Request(location.origin+'/bp1-compat-cache-sentinel'),new Response('ok'));const r=await c.match(location.origin+'/bp1-compat-cache-sentinel');await caches.delete('bp1-site-self-test');if(!r||await r.text()!=='ok')throw new Error('Cache mismatch');return 'Cache Storage read/write works';});
  await run('crypto',async()=>{const d=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('BP1')));if(d.length!==32)throw new Error('Digest length mismatch');return 'Web Crypto SHA-256 works';});
  await run('formdata',async()=>{const f=new FormData();f.set('protocol','BP1');f.set('value','42');if(f.get('protocol')!=='BP1')throw new Error('FormData mismatch');const r=new Response(f);const type=r.headers.get('content-type')||'';const body=new TextDecoder().decode(await r.arrayBuffer());if(!type.startsWith('multipart/form-data; boundary='))throw new Error('Multipart Content-Type was not generated');if(!body.includes('name=\"protocol\"')||!body.includes('BP1')||!body.includes('name=\"value\"')||!body.includes('42'))throw new Error('Multipart encoding mismatch');return 'FormData multipart encoding works';});
  await run('audio',async()=>{const m=await mediaMetadata('audio','assets/test.wav');return {status:'PARTIAL',detail:`Audio resource metadata loaded (duration ${Number.isFinite(m.duration)?m.duration.toFixed(2):'?'}s). Playback requires a user gesture and is available below.`};});
  await run('video',async()=>{const m=await mediaMetadata('video','assets/test.mp4');return {status:'PARTIAL',detail:`Video metadata loaded (duration ${Number.isFinite(m.duration)?m.duration.toFixed(2):'?'}s). Playback/seeking still requires manual validation; Range support is tested separately.`};});
  await run('download',async()=>{const r=await fetch('downloads/sample.bin');if(!r.ok)throw new Error(`HTTP ${r.status}`);return {status:'PARTIAL',detail:'Download resource is reachable. Browser download UI requires a user click; use the Download test file link below.'};});
  await run('own-sw',async()=>{if(!('serviceWorker' in navigator))return {status:'PARTIAL',detail:'Known limitation: packaged sites cannot rely on registering their own Service Worker.'};try{const reg=await navigator.serviceWorker.register('workers/test-sw.js',{scope:'./bp1-site-sw-test/'});await reg.unregister();return {status:'PARTIAL',detail:'Unexpectedly registered in this browser. BP1 does not guarantee packaged-site Service Worker support.'};}catch(e){return {status:'PARTIAL',detail:'Known limitation confirmed: packaged-site Service Worker registration is unsupported by the static virtual-filesystem architecture.'};}});
  await run('external-fetch',async()=>{const r=await fetch('https://jsonplaceholder.typicode.com/todos/1',{mode:'cors',cache:'no-store'});if(!r.ok)throw new Error(`External HTTP ${r.status}`);const j=await r.json();if(j.id!==1)throw new Error('Unexpected external JSON payload');return 'External CORS-enabled HTTPS fetch completed';});
  $('runAll').disabled=false;
}
$('runAll').addEventListener('click',runAll);
$('reset').addEventListener('click',()=>{results.clear();renderRows();});
$('copyResults').addEventListener('click',async()=>{
  const lines=['BP1 Compatibility Test Results',`URL: ${location.href}`,`UA: ${navigator.userAgent}`,''];
  for(const [id,name] of TESTS){const r=results.get(id)||{status:'PENDING',detail:''};lines.push(`${r.status.padEnd(7)} ${name}${r.detail?' — '+r.detail:''}`);}
  await navigator.clipboard.writeText(lines.join('\n'));
  $('copyResults').textContent='Copied';setTimeout(()=>$('copyResults').textContent='Copy results',1200);
});
$('manualAudio').addEventListener('click',async()=>{const a=new Audio('assets/test.wav');try{await a.play();$('manualStatus').textContent='Audio playback started successfully.';}catch(e){$('manualStatus').textContent='Audio playback failed: '+e.message;}});
$('manualVideo').addEventListener('click',async()=>{let v=document.getElementById('manualVideoEl');if(!v){v=document.createElement('video');v.id='manualVideoEl';v.controls=true;v.width=320;v.src='assets/test.mp4';document.querySelector('.manual').appendChild(v);}try{await v.play();$('manualStatus').textContent='Video playback started successfully.';}catch(e){$('manualStatus').textContent='Video playback failed: '+e.message;}});
$('environment').textContent=JSON.stringify({
  href:location.href,
  origin:location.origin,
  secureContext:window.isSecureContext,
  serviceWorker:'serviceWorker' in navigator,
  cacheStorage:'caches' in window,
  indexedDB:'indexedDB' in window,
  webAssembly:'WebAssembly' in window,
  userAgent:navigator.userAgent
},null,2);
renderRows();
