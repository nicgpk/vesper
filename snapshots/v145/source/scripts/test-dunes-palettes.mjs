import fs from 'node:fs';import assert from 'node:assert/strict';import vm from 'node:vm';import {loadShowcaseModule} from './load-vesper-module.mjs';
const {dunesPalettes,validPalette}=await loadShowcaseModule("export * from './themes/dunes-palettes';");
const lum=h=>{const a=h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2]};
let checks=0,min=100;
for(const palette of Object.keys(dunesPalettes))for(const mode of ['light','dark']){const theme=dunesPalettes[palette][mode],t=theme.tokens;
 for(const fg of ['--color-text-primary','--color-text-secondary'])for(const bg of ['--color-background-body','--color-background-surface','--color-background-card','--color-background-popover']){const a=lum(t[fg]),b=lum(t[bg]),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5);min=Math.min(min,ratio);checks++;}
 for(const key of ['--color-accent','--color-on-accent','--color-success','--color-error','--focus-outline-color'])assert.equal(t[key],dunesPalettes.sand[mode].tokens[key]);
 assert.strictEqual(dunesPalettes[palette].contrast,dunesPalettes.sand.contrast);
}
for(const v of [null,undefined,'','pigment','garbage'])assert.equal(validPalette(v),'sand');
const init=fs.readFileSync('.github/vesper-pages/theme-init.js','utf8');
for(const value of ['sand','ocean','forest','dusk','clay','pigment',null]){const document={documentElement:{dataset:{}}};vm.runInNewContext(init,{document,matchMedia:()=>({matches:false}),localStorage:{getItem:k=>k==='vesper-nature-theme'?value:'dark'}});assert.equal(document.documentElement.dataset.palette,validPalette(value));assert.equal(document.documentElement.dataset.theme,'dark');}
const document={documentElement:{dataset:{}}};vm.runInNewContext(init,{document,matchMedia:()=>({matches:false}),localStorage:{getItem(){throw Error('blocked')}}});assert.equal(document.documentElement.dataset.palette,'sand');
const source=fs.readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');assert(!source.includes('MaterialChoices'));assert(source.includes("data-art={palette==='sand'?'dunes':palette}"));assert(source.includes('dunesPalettes[palette][appearance]'));assert(source.includes('feature.art'));assert(source.includes("disabled={appearance==='contrast'}"));
console.log(`PASS ${checks} opaque color pairs, minimum ${min.toFixed(2)}:1; palette validation/bootstrap and fixed Dunes/art/Contrast contracts. No rendered verification.`);
