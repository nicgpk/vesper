// SPDX-License-Identifier: MIT
import {Window} from 'happy-dom';
import {pathToFileURL} from 'node:url';
import {readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const output=process.argv[2] ?? 'local-baseline/v180-provider-glass';
const w=new Window({url:'https://example.test/v180-provider-glass/#/components/native-content-providers',width:390,height:844,settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableIframePageLoading:true}});
for(const key of ['window','document','navigator','location','history','localStorage','sessionStorage','HTMLElement','HTMLDialogElement','HTMLInputElement','SVGElement','Element','Node','Event','MouseEvent','PointerEvent','KeyboardEvent','MutationObserver','ResizeObserver','IntersectionObserver','Image','CSS','DOMRect','getComputedStyle','matchMedia','requestAnimationFrame','cancelAnimationFrame']) {
 const value=key==='window'?w:key==='getComputedStyle'||key==='matchMedia'||key.endsWith('AnimationFrame')?w[key].bind(w):w[key];
 Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
}
const D=w.document;
D.documentElement.dataset.palette='ocean';D.documentElement.dataset.theme='dark';
D.body.innerHTML='<div id="app"></div>';
const js=readdirSync(output+'/assets').find(p=>p.startsWith('components-')&&p.endsWith('.js'));
await import(pathToFileURL(path.resolve(output,'assets',js)).href);
const tick=()=>new Promise(r=>setTimeout(r,70));
await tick();
const region=()=>D.querySelector('.provider-region');
const button=label=>[...D.querySelectorAll('button')].find(b=>b.textContent?.trim()===label);
const theme=(appearance,name)=>{
 assert.equal(region().getAttribute('data-local-appearance'),appearance);
 assert.equal(region().closest('[data-astryx-theme]').getAttribute('data-astryx-theme'),name);
};
const click=async label=>{const b=button(label);assert.ok(b,label);b.click();await tick();};
const ambient=()=>D.querySelector('.exact-gallery-shell').dataset.appearance;
assert.equal(ambient(),'dark');
theme(null,'nature-ocean-dark-accent');
assert.equal(button('Follow page appearance'),undefined);
await click('Use light region');
theme('light','nature-ocean-light-accent');
assert.equal(ambient(),'dark');
await click('Follow page appearance');
theme(null,'nature-ocean-dark-accent');
await click('Light');
theme(null,'nature-ocean-light-accent');
assert.equal(ambient(),'light');
await click('Use dark region');
theme('dark','nature-ocean-dark-accent');
assert.equal(ambient(),'light');
await click('Contrast');
theme('dark','nature-ocean-dark-accent');
assert.equal(ambient(),'contrast');
await click('Follow page appearance');
theme(null,'nature-ocean-contrast');
assert.equal(region().querySelector('a').getAttribute('href'),'#/components/layout');
await w.happyDOM.close();
console.log('Mounted Ocean default, Light/Dark local changes, Contrast inheritance, Follow reset and layout link passed. Geometry not tested by this script.');
