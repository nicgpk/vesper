import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {pathToFileURL} from 'node:url';
import {readdirSync} from 'node:fs';
import path from 'node:path';
const output = process.argv[2] ?? 'local-baseline/v180-vega-split';
const win = new Window({url:`https://example.test/${path.basename(output)}/#/components/vega-chart`, width:390, height:844, settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableIframePageLoading:true}});
for (const key of ['window','document','navigator','location','history','localStorage','sessionStorage','HTMLElement','HTMLDialogElement','HTMLInputElement','SVGElement','Element','Node','Event','MouseEvent','PointerEvent','KeyboardEvent','MutationObserver','ResizeObserver','IntersectionObserver','Image','CSS','DOMRect','getComputedStyle','matchMedia','requestAnimationFrame','cancelAnimationFrame']) {
 const value = key==='window'?win:key==='getComputedStyle'||key==='matchMedia'||key.endsWith('AnimationFrame')?win[key].bind(win):win[key];
 Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
}
win.document.body.innerHTML='<div id="app"></div>';
const js=readdirSync(output+'/assets').find(p=>p.startsWith('components-')&&p.endsWith('.js'));
await import(pathToFileURL(path.resolve(output,'assets',js)).href);
const tick=async()=>{await new Promise(r=>setTimeout(r,60))};
await tick();
const document=win.document;
const summary = 'Completed: Mon 24, Tue 38, Wed 31, Thu 48, Fri 42.';
const fail = process.argv.includes('--expect-missing-chunk');
const root = document.querySelector('#app');
for (let attempts=0; attempts<30; attempts++) {
  if (fail ? root.textContent.includes('Reload to try again.') : root.querySelector('svg.marks')) break;
  await tick();
}
assert.ok(root.textContent.includes(summary), 'Summary survives optional chart load');
if (fail) {
  assert.ok([...root.querySelectorAll('[role=alert]')].some(el => el.textContent.includes('Reload to try again.')));
  assert.ok(root.textContent.includes('Vega chart'), 'Route stays mounted on a missing chunk');
} else {
  const chart = root.querySelector('svg.marks');
  assert.ok(chart, 'Deep link mounts the deferred Vega SVG');
  assert.match(chart.textContent, /Mon.*Fri/);
}
await win.happyDOM.close();
console.log(fail ? 'Vega missing-chunk fallback passed' : 'Deferred Vega chart mounted and drew SVG');
