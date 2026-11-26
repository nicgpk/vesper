import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const {dunesPalettes}=await loadShowcaseModule("export * from './themes/dunes-palettes';");
const rgb=h=>h.slice(1,7).match(/../g).map(s=>parseInt(s,16)/255);
const lum=t=>t.map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
let minText=100,minEdge=100;const accents=new Set;
for(const [name,modes] of Object.entries(dunesPalettes)){
 const t=modes.contrast.tokens,l=modes.contrast.localTokens,glass=l['--vesper-glass-fill'],alpha=parseInt(glass.slice(7),16)/255;
 const max=rgb(glass).map(c=>c*alpha+1-alpha);
 assert(alpha>.8&&alpha<.9,'Stage stays frosted, with a bounded upper luminance');
 for(const key of ['--color-text-primary','--color-text-secondary','--color-text-accent']){
  const r=ratio(rgb(t[key]),max);assert(r>=7,`${name} ${key} ${r}`);minText=Math.min(minText,r);
 }
 for(const key of ['--color-border','--focus-outline-color']){
  const r=ratio(rgb(t[key]),max);assert(r>=3,`${name} ${key} ${r}`);minEdge=Math.min(minEdge,r);
 }
 assert(ratio(rgb(t['--color-accent']),rgb(t['--color-on-accent']))>=7);
 assert.equal(t['--focus-outline-width'],'3px');accents.add(t['--color-accent']);
}
assert.equal(accents.size,6);
const css=fs.readFileSync('apps/storybook/vesper/site/dunes-theme.css','utf8');
assert(css.includes('.exact-gallery-shell[data-appearance=contrast][data-art] .demo-stage::before{display:block;'));
assert(css.includes('backdrop-filter:blur(14px)'));
assert(css.includes('prefers-reduced-transparency:reduce),(forced-colors:active)'));
console.log(`6 scenes, modeled minimum text ${minText.toFixed(2)}:1 and edge ${minEdge.toFixed(2)}:1 on glass over a white backdrop; not an accessibility certification.`);
