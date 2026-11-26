import assert from 'node:assert/strict';
import path from 'node:path';
import {readFileSync, statSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const {paletteLabels,paletteNames,dunesPalettes,ScenePicker,createElement,renderToStaticMarkup}=await loadShowcaseModule(
  "export * from './themes/dunes-palettes'; export {ScenePicker} from './vesper/site/ScenePicker'; export {createElement} from 'react'; export {renderToStaticMarkup} from 'react-dom/server';"
);
const assets = process.argv[2] ? path.join(process.argv[2],'assets') : 'apps/storybook/vesper/site/assets';
const rgb=h=>h.slice(1,7).match(/../g).map(s=>parseInt(s,16)/255);
const lum=a=>a.map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
const composite=(foreground,bg)=>{const alpha=foreground.length===9?parseInt(foreground.slice(7),16)/255:1;return rgb(foreground).map((v,i)=>v*alpha+bg[i]*(1-alpha));};
let minText=100,minState=100, modeCount=0, total=0;
for(const scene of paletteNames) {
 const html=renderToStaticMarkup(createElement(ScenePicker,{value:scene,onChange:()=>{}}));
 const fields=[...html.matchAll(/<input[^>]+>/g)].map(m=>m[0]);
 assert.equal(fields.length,6);
 assert(fields.every(f=>f.includes('type="radio"')));
 assert.equal(new Set(fields.map(f=>/name="([^"]+)"/.exec(f)?.[1])).size,1);
 assert.deepEqual(fields.filter(f=>f.includes('checked=""')).map(f=>/value="([^"]+)"/.exec(f)?.[1]),[scene]);
 assert.match(html, /<fieldset[^>]*aria-label="Nature theme"/);
 assert.match(html, /<legend[^>]*>Nature theme<\/legend>/);
 assert(/<span class="scene-picker-mark" aria-hidden="true">/.test(html));
 for(const name of Object.values(paletteLabels))assert(html.includes('>'+name+'<'));
 const imgs=[...html.matchAll(/<img[^>]+src="assets\/([^"]+-112\.webp)"[^>]*>/g)];
 assert.equal(imgs.length,6);
 assert(imgs.every(m=>m[0].includes('alt=""')&&m[0].includes('width="112"')&&m[0].includes('height="75"')));
 const bytes=imgs.reduce((sum,m)=>sum+statSync(path.join(assets,m[1])).size,0);
 total=Math.max(total,bytes);
 for(const mode of ['light','dark','contrast']) {
  const t=dunesPalettes[scene][mode].tokens;
  const bg=rgb(t['--color-background-card']),text=rgb(t['--color-text-primary']),outline=rgb(t['--focus-outline-color']);
  const selected=composite(t['--color-accent-muted'],bg),hover=composite(t['--color-overlay-hover'],bg);
  for(const back of [bg,selected,hover]) {
   const r=ratio(text,back); assert(r>=4.5,`${scene}/${mode} name ${r}`);minText=Math.min(minText,r);
  }
  const label=ratio(rgb(t['--color-text-secondary']),bg);
  assert(label>=4.5,`${scene}/${mode} title ${label}`);minText=Math.min(minText,label);
  const edge=ratio(outline,bg);assert(edge>=3,`${scene}/${mode} state outline ${edge}`);minState=Math.min(minState,edge);
  const badge=ratio(rgb(t['--color-accent']),rgb(t['--color-on-accent']));
  assert(badge>=3,`${scene}/${mode} checkmark ${badge}`);minState=Math.min(minState,badge);modeCount++;
 }
}
assert(total<10_000);
const css=readFileSync('apps/storybook/vesper/site/scene-picker.css','utf8');
assert.match(css,/repeat\(6,minmax\(0,1fr\)\)/);
assert.match(css,/repeat\(3,minmax\(0,1fr\)\)/);
assert.match(css,/min-height:44px/);
assert.match(css,/input:focus-visible\+\.scene-picker-card/);
assert.match(css,/forced-colors:active/);
assert(!/animation:|transition:/.test(css),'Scene selector never animates selection');
console.log(`PASS: 6 native radios/SSR, ${modeCount} scene-mode combinations (minimum label ${minText.toFixed(2)}:1, state ${minState.toFixed(2)}:1), ${total} thumbnail bytes, 6-column and 3-column CSS rules. No rendered browser, keyboard, or handset claim.`);
