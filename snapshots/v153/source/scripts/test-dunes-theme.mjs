import fs from 'node:fs';import assert from 'node:assert/strict';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const current=await loadShowcaseModule("export {vesperLightTheme,vesperDarkTheme,vesperContrastTheme} from './themes/vesper';");
const previous=await (await import('../../vesper-v139-native/scripts/load-vesper-module.mjs')).loadShowcaseModule("export {vesperLightTheme,vesperDarkTheme,vesperContrastTheme} from './themes/vesper';");
const source=fs.readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');
assert(source.includes('data-art="dunes"'));assert(!source.includes('MaterialChoices'));assert(!source.includes('setArt'));assert(source.includes('feature.art'));assert(source.includes('setAppearance'));
const luminance=h=>{const a=h.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2]};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
let checks=0;let results=[];
for(const mode of ['Light','Dark']){const t=current[`vesper${mode}Theme`].tokens;
 for(const fg of ['--color-text-primary','--color-text-secondary'])for(const bg of ['--color-background-body','--color-background-surface','--color-background-card','--color-background-popover']){const ratio=contrast(t[fg],t[bg]);assert(ratio>=4.5,`${mode} ${fg} on ${bg}: ${ratio}`);checks++;results.push({mode,fg,bg,ratio:+ratio.toFixed(2)});}
 for(const key of ['--color-accent','--color-success','--color-error','--color-warning','--focus-outline-color'])assert.equal(t[key],previous[`vesper${mode}Theme`].tokens[key]);
}
assert.deepEqual(current.vesperContrastTheme.tokens,previous.vesperContrastTheme.tokens);
const css=fs.readFileSync('apps/storybook/vesper/site/dunes-theme.css','utf8');
assert(css.includes('prefers-reduced-transparency:reduce'));assert(css.includes('forced-colors:active'));assert(css.includes('[data-theme=contrast]'));assert(!css.includes('.astryx-'));
assert(fs.readFileSync('.github/vesper-pages/theme-init.js','utf8').includes("localStorage.getItem('vesper-pages-theme')"));
console.log(JSON.stringify({checks,results,limits:'Nominal solid surfaces only; composited Dunes/glass not render verified; chooser removed; appearance preference bootstrap preserved.'},null,2));
