import assert from 'node:assert/strict';import {loadShowcaseModule} from './load-vesper-module.mjs';
const {dunesPalettes,vesperLightTheme,vesperDarkTheme,vesperContrastTheme}=await loadShowcaseModule("export * from './themes/dunes-palettes';export * from './themes/vesper';");
const rgb=h=>h.slice(1,7).match(/../g).map(x=>parseInt(x,16)/255);
const lum=a=>{const l=a.map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return l[0]*.2126+l[1]*.7152+l[2]*.0722};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
let count=0,minText=100,minFocus=100;
for(const scene of ['sand','ocean','forest'])for(const mode of ['light','dark']){
 const t=dunesPalettes[scene][mode].tokens,base=(mode==='light'?vesperLightTheme:vesperDarkTheme).tokens;
 const action=contrast(rgb(t['--color-accent']),rgb(t['--color-on-accent']));assert(action>=4.5,`${scene}/${mode} action ${action}`);count++;minText=Math.min(minText,action);
 for(const state of ['--color-overlay-hover','--color-overlay-pressed']){
  const overlay=t[state];assert(/^#[\da-f]{8}$/i.test(overlay),`${state} expected explicit RGBA token`);
  const alpha=parseInt(overlay.slice(7,9),16)/255,fill=rgb(t['--color-accent']);
  const composite=rgb(overlay).map((v,i)=>v*alpha+fill[i]*(1-alpha));
  const stateContrast=contrast(rgb(t['--color-on-accent']),composite);assert(stateContrast>=4.5,`${scene}/${mode} ${state} ${stateContrast}`);minText=Math.min(minText,stateContrast);count++;
 }

 for(const key of ['--color-warning','--color-on-warning','--focus-outline-width','--focus-outline-offset'])assert.equal(t[key],base[key],key);
 for(const bg of ['--color-background-body','--color-background-surface','--color-background-card','--color-background-popover']){
  const background=rgb(t[bg]);const text=contrast(rgb(t['--color-text-accent']),background);assert(text>=4.5,`${scene}/${mode} ${bg} text ${text}`);minText=Math.min(minText,text);count++;
  const focus=contrast(rgb(t['--focus-outline-color']),background);assert(focus>=3);minFocus=Math.min(minFocus,focus);count++;
  const muted=t['--color-accent-muted'],alpha=parseInt(muted.slice(7,9),16)/255,blend=rgb(muted).map((v,i)=>v*alpha+background[i]*(1-alpha));const mutedText=contrast(rgb(t['--color-text-accent']),blend);assert(mutedText>=4.5,`${scene}/${mode} muted ${mutedText}`);count++;minText=Math.min(minText,mutedText);
 }
 assert.equal(t['--color-icon-accent'],t['--color-text-accent']);assert.strictEqual(dunesPalettes[scene].contrast,vesperContrastTheme);
}
console.log(`PASS ${count} accent contrasts; min text ${minText.toFixed(2)}, min focus ${minFocus.toFixed(2)}; semantic/Contrast/focus geometry preserved. Opaque and modeled hover/pressed/muted-fill only, not glass-rendered.`);
