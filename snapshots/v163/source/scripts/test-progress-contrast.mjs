import assert from 'node:assert/strict';import fs from 'node:fs';import {loadShowcaseModule} from './load-vesper-module.mjs';
const {dunesPalettes}=await loadShowcaseModule("export * from './themes/dunes-palettes';");
const lum=h=>h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);let min=100,n=0;
for(const [scene,modes]of Object.entries(dunesPalettes))for(const [mode,t]of Object.entries(modes)){
 assert.equal(t.components['circular-progress-track'].base.stroke,'var(--vesper-progress-track, var(--color-track))');assert.equal(t.components['circular-progress-fill']['variant:accent'].stroke,'var(--color-text-accent)');
 for(const status of ['accent','success','error','warning']){const a=lum(t.tokens[status==='accent'?'--color-text-accent':`--color-${status}`]),b=lum(t.localTokens['--vesper-progress-track']);const r=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(r>=3,`${scene}/${mode}/${status} ${r}`);min=Math.min(min,r);n++;}
}
const native=fs.readFileSync('packages/lab/src/CircularProgress/CircularProgress.tsx','utf8');assert(native.includes("themeProps('circular-progress-fill', {variant: fillVariant})"));assert(native.includes("themeProps('circular-progress-track')"));
console.log(`PASS ${n} active progress arc/track pairs(min${min.toFixed(2)}) and supported theme target contracts. Source only.`);
