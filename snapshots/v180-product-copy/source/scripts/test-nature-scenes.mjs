import fs from 'node:fs';import assert from 'node:assert/strict';import vm from 'node:vm';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const {paletteNames,validPalette}=await loadShowcaseModule("export * from './themes/dunes-palettes';");
assert.deepEqual(paletteNames,['sand','ocean','forest','alpine','basalt','salt-flats']);
const init=fs.readFileSync('.github/vesper-pages/theme-init.js','utf8');
for(const old of ['sand','dusk','clay','ocean',null]){const document={documentElement:{dataset:{}}};vm.runInNewContext(init,{document,matchMedia:()=>({matches:false}),localStorage:{getItem:k=>k==='vesper-dunes-palette'?old:null}});assert.equal(document.documentElement.dataset.palette,'sand');}
for(const palette of paletteNames){const document={documentElement:{dataset:{}}};vm.runInNewContext(init,{document,matchMedia:()=>({matches:false}),localStorage:{getItem:k=>k==='vesper-nature-theme'?palette:'contrast'}});assert.equal(document.documentElement.dataset.palette,palette);assert.equal(document.documentElement.dataset.theme,'contrast');}
for(const palette of paletteNames){const document={documentElement:{dataset:{}}};vm.runInNewContext(init,{document,location:{search:'?scene='+palette},URLSearchParams,matchMedia:()=>({matches:false}),localStorage:{getItem:()=>null}});assert.equal(document.documentElement.dataset.palette,palette);}
const css=fs.readFileSync('apps/storybook/vesper/site/dunes-theme.css','utf8');
for(const scene of paletteNames.filter(name=>name!=='sand'))assert(css.includes(`[data-art=${scene}]{--nature-image:url('./assets/nature-${scene}.webp')}`));
assert(css.includes("var(--nature-image,url('../assets/dunes.jpg'))"));
const extra=css.split('/* UI palettes')[1];assert(!extra.includes('background-image:'),'theme-specific images must not override fallback background-image:none');
const source=fs.readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');assert(source.includes('<ScenePicker value={palette}'));assert(source.includes("localStorage.setItem('vesper-nature-theme',palette)"));assert(source.includes("url.searchParams.set('scene',name)"));assert(!source.includes("disabled={appearance==='contrast'}"));
const picker=fs.readFileSync('apps/storybook/vesper/site/ScenePicker.tsx','utf8');assert(picker.includes('aria-label="Nature theme"'));assert(picker.includes('paletteLabels[scene]'));
console.log('PASS nature-theme default, legacy preference migration, scene persistence, mapping and fallback ordering. Source/VM only.');
