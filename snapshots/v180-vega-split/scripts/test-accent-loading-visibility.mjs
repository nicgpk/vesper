import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const {dunesPalettes}=await loadShowcaseModule("export * from './themes/dunes-palettes';");
const rgb=h=>h.slice(1,7).match(/../g).map(x=>parseInt(x,16)/255);
const lum=c=>c.map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
const contrast=(x,y)=>(Math.max(lum(x),lum(y))+.05)/(Math.min(lum(x),lum(y))+.05);
let count=0,min=100;
for(const [scene,modes] of Object.entries(dunesPalettes))for(const [mode,theme] of Object.entries(modes)){
 const t=theme.tokens,accent=rgb(t['--color-accent']);
 for(const bg of ['--color-background-body','--color-background-surface','--color-background-card','--color-background-popover']){
 const background=rgb(t[bg]);
 const direct=contrast(accent,background);assert(direct>=4.5,`${scene}/${mode}/${bg} running text ${direct}`);count++;
 const low=accent.map((v,i)=>v*.8+background[i]*.2),r=contrast(low,background);
 assert(r>=3,`${scene}/${mode} cube low phase ${r}`);min=Math.min(min,r);count++;
 }
}
const css=fs.readFileSync('apps/storybook/vesper/site/loading-studies.css','utf8');
assert(css.includes('opacity:.8;transform:scale(.85)'));
assert(css.includes('ls-cube-white-sheen'));assert(css.includes('prefers-reduced-motion:reduce'));
for(const file of ['packages/core/src/Spinner/Spinner.tsx','packages/core/src/Chat/ChatToolCalls.tsx','packages/core/src/ProgressBar/ProgressBar.tsx','packages/core/src/StatusDot/StatusDot.tsx','packages/core/src/Chat/ChatDictationButton.tsx']) assert(fs.readFileSync(file,'utf8').includes("colorVars['--color-accent']"),file);
console.log(`PASS ${count} direct running/indicator and cube alpha contrasts, minimum low-phase ${min.toFixed(2)}; actual native token consumers confirmed. Not rendered/glass verification.`);
