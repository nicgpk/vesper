// Restricted source-cascade contract for this small stylesheet, not a browser engine.
import fs from 'node:fs';import assert from 'node:assert/strict';
const css=fs.readFileSync('apps/storybook/vesper/site/dunes-theme.css','utf8').split('/* UI palettes')[0].replace(/\/\*[\s\S]*?\*\//g,'');
const declarations=s=>Object.fromEntries(s.split(';').filter(Boolean).map(x=>{const i=x.indexOf(':');return [x.slice(0,i).trim(),x.slice(i+1).trim()]}));
function specificity(s){assert(!/[#,]|:is\(|:where\(/.test(s),'extend model before using complex selectors');return [(s.match(/\.[\w-]+|\[[^\]]+\]|(?<!:):(?!:)[\w-]+/g)||[]).length,(s.match(/::[\w-]+/g)||[]).length];}
const rules=[];let order=0;
const noMedia=css.replace(/@media\(([^)]+)\)\{([^{}]+)\{([^{}]*)\}\}/g,(_,media,selector,body)=>{rules.push({media,selector:selector.trim(),values:declarations(body),order:css.indexOf(_)});return '';});
for(const m of noMedia.matchAll(/([^{}]+)\{([^{}]*)\}/g))rules.push({media:null,selector:m[1].trim(),values:declarations(m[2]),order:css.indexOf(m[0].trim())});
const dark=rules.find(r=>r.selector.startsWith('[data-theme=dark]'));
assert(dark);assert.equal(rules.length,5);
for(const media of ['prefers-reduced-transparency:reduce','forced-colors:active']){const r=rules.find(x=>x.media===media);assert(r);assert.deepEqual(specificity(r.selector),specificity(dark.selector));assert(r.order>dark.order);assert.equal(r.values['background-image'],'none');assert.equal(r.values.filter,'none');}
let checks=0;
for(const theme of ['light','dark','contrast'])for(const reduced of [false,true])for(const forced of [false,true]){
 const winners={};const active=rules.filter(r=>!r.media||(r.media==='prefers-reduced-transparency:reduce'?reduced:forced)).filter(r=>!r.selector.includes('[data-theme=')||r.selector.includes(`[data-theme=${theme}]`));
 for(const r of active){const score=specificity(r.selector);for(const [name,value]of Object.entries(r.values)){const old=winners[name];if(!old||score[0]>old.score[0]||score[0]===old.score[0]&&(score[1]>old.score[1]||score[1]===old.score[1]&&r.order>old.order))winners[name]={score,order:r.order,value};}}
 if(reduced||forced){assert.equal(winners.filter.value,'none');assert.equal(winners['background-image'].value,'none');assert.equal(winners['background-color'].value,forced?'Canvas':'var(--color-background-body)');}
 if(theme==='contrast')assert.equal(winners.display.value,'none');checks++;
}
console.log(`PASS ${checks} theme/preference source-cascade cases, including dark and combined fallbacks. Not browser verification.`);
