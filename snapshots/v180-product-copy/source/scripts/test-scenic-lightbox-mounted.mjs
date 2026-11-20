import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {pathToFileURL} from 'node:url';
import {readdirSync} from 'node:fs';
import path from 'node:path';
const output = process.argv[2] ?? 'local-baseline/v180-lightbox-fit';
const baseline = process.argv.includes('--baseline');
const win = new Window({url:'https://example.test/v180-scenic-media/#/components/native-media-viewer', width:390, height:844, settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableIframePageLoading:true}});
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
const scene = document.querySelector('.sm-study');
const button=[...scene.querySelectorAll('button')].find(b=>b.textContent?.includes('Open scenery'));
assert.ok(button);
assert.equal(document.querySelector('dialog'),null, 'full-resolution dialog not mounted initially');
const thumbs = [...scene.querySelectorAll('.sm-thumbnail button')];
assert.equal(thumbs.length,6);
const modal=()=>scene.querySelector('dialog');
const zoomTarget=()=>modal().querySelector('[role="button"][aria-pressed]');
const aria=label=>modal().querySelector('button[aria-label="'+label+'"]');
const source=()=>modal().querySelector('img').getAttribute('src');
const press=async key=>{
 modal().dispatchEvent(new win.KeyboardEvent('keydown',{bubbles:true,cancelable:true,key}));
 await tick();
};
const click=async button=>{
 button.focus();button.click();await tick();
};
await click(button);
assert.ok(modal()?.open);
assert.equal(source(),'./assets/nature-ocean.webp');
assert.equal(document.body.style.position,'fixed');
assert.equal(aria('Previous').disabled,true);
assert.equal(aria('Next').disabled,false);
if(!baseline) {
 assert.ok(modal().classList.contains('sm-lightbox'));
 assert.equal(scene.querySelectorAll('.sm-thumb-control').length,6);
 assert.equal(scene.querySelectorAll('.sm-thumb-control[popover]').length,0);
}
await press('+');
assert.equal(zoomTarget().getAttribute('aria-pressed'),'true');
await click(aria('Close'));
assert.equal(modal().open,false);
assert.equal(document.activeElement,button);
assert.equal(document.body.style.position,'');
await click(button);
assert.ok(modal().open);
assert.equal(zoomTarget().getAttribute('aria-pressed'),baseline?'true':'false');
if(baseline) await press('-');
await press('ArrowRight');
assert.equal(source(),'./assets/dunes-ridge.webp');
await click(aria('Next'));
assert.equal(source(),'./assets/nature-forest.webp');
await click(aria('Previous'));
assert.equal(source(),'./assets/dunes-ridge.webp');
await click(aria('Close'));
assert.match(scene.querySelector('.sm-caption').textContent,/Dune ridge2 of 6/);
await click(thumbs[5]);
assert.equal(source(),'./assets/nature-salt-flats.webp');
assert.equal(aria('Next').disabled,true);
await click(aria('Close'));
assert.equal(document.activeElement,thumbs[5]);
assert.match(scene.querySelector('.sm-caption').textContent,/Salt flats6 of 6/);
assert.equal(win.location.hash,'#/components/native-media-viewer');
await win.happyDOM.close();
console.log(baseline
  ? 'Prior bundle reproduced stale 2× zoom on reopen; full mounted open/navigation/close sequence also checked.'
  : 'Built bundle: opened, loaded full source, navigated, zoomed, closed, restored focus, reopened at 1×, and checked thumbnail opening.');
