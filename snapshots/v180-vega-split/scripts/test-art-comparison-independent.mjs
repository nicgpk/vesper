import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export * from './vesper/site/ArtBrightnessRefinement';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
for(const [input,expected] of [[-2,0],[0,0],[50,50],[100,100],[102,100],[NaN,50],[Infinity,50]]) assert.equal(m.boundedReveal(input),expected);
for(const w of [200,300,460]) for(const [xPart,pct] of [[-.2,0],[.234,23],[.5,50],[1.2,100]]) assert.equal(m.revealAt(35+w*xPart,35,w),pct);
assert.equal(m.revealAt(50,30,0),null);
for(const split of [0,50,100]) for(const value of [40,100,140]){
 const h=m.renderToString(m.createElement(m.ArtworkComparison,{value,reveal:split,onReveal:()=>{}}));
 assert(h.includes(`clip-path:inset(0 ${100-split}% 0 0)`));
 assert(h.includes(`left:clamp(22px, ${split}%, calc(100% - 22px))`));
 assert(h.includes(`left:${split}%`));
 assert.equal(h.includes('>Original</span>'),split>0);
 assert.equal(h.includes('>Adjusted</span>'),split<100);
 assert(h.includes(`filter:brightness(${value/100})`));
 assert.equal((h.match(/<img /g)||[]).length,2);
 assert.equal((h.match(/alt="Snow-covered alpine peaks at dusk"/g)||[]).length,1);
 assert.equal((h.match(/type="range"/g)||[]).length,1);
 assert(h.includes(split===0?'Adjusted photo only':split===100?'Original photo only':'50% original, 50% adjusted'));
}
const site = new URL('../apps/storybook/vesper/site/',import.meta.url);
for(const name of ['nature-alpine-384.webp','nature-alpine-768.webp','nature-alpine.webp']) await access(new URL('assets/'+name,site));
const css=await readFile(new URL('art-brightness.css',site),'utf8');
assert.match(css,/width:44px;height:44px/);
assert.match(css,/touch-action:pan-y pinch-zoom/);
assert.match(css,/\.ab-range:focus-visible\+\.ab-thumb/);
console.log('Comparison endpoints, responsive pointer mapping, photo sources, touch scrolling and focus CSS verified. No rendered CSS claims.');
