import assert from 'node:assert/strict';import fs from 'node:fs';import {loadShowcaseModule} from './load-vesper-module.mjs';
const {dunesPalettes}=await loadShowcaseModule("export * from './themes/dunes-palettes';");
const rgb=h=>h.slice(1,7).match(/../g).map(x=>parseInt(x,16)/255),lum=a=>a.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
let checks=0;const fail=[];const ck=(a,b,n,label)=>{const r=ratio(rgb(a),rgb(b));checks++;if(r<n)fail.push(`${label}: ${r.toFixed(2)}`)};
for(const [scene,modes]of Object.entries(dunesPalettes))for(const [mode,theme]of Object.entries(modes)){
 const t=theme.tokens;
 for(const color of ['blue','cyan','gray','green','orange','pink','purple','red','teal','yellow']){ck(t[`--color-text-${color}`],t[`--color-background-${color}`],4.5,`${scene}/${mode}/${color} text`);ck(t[`--color-icon-${color}`],t[`--color-background-${color}`],3,`${scene}/${mode}/${color} icon`);}
 for(const surface of ['body','surface','card','popover']){
  for(const tier of ['primary','secondary'])ck(t[`--color-text-${tier}`],t[`--color-background-${surface}`],4.5,`${scene}/${mode}/${surface}/${tier}`);
  for(const tier of ['primary','secondary'])ck(t[`--color-icon-${tier}`],t[`--color-background-${surface}`],3,`${scene}/${mode}/${surface}/icon-${tier}`);
  ck(mode==='light'?'#52525b':'#b0b6c2',t[`--color-background-${surface}`],4.5,`${scene}/${mode}/${surface}/reading-base`);
 }
}
assert.equal(fail.length,0,fail.join('\n'));
const source=fs.readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');assert(source.includes('aria-label="Studies home"'));assert(source.includes('<span>Studies</span>'));assert(!source.includes('<span>Interactions</span>'));assert(source.includes('viewBox="0 0 32 32" aria-hidden="true" focusable="false"'));assert(!source.includes('<i/>'));
console.log(`PASS ${checks} categorical, shared foreground/icon, reading-shimmer source pairs plus new Studies logo/header contract. Disabled/decorative and photographic composite not certified.`);
