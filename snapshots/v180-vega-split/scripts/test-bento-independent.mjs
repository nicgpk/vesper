import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const {bentoSpans,getPreviewLayout,discover,demos}=await loadShowcaseModule("export {bentoSpans} from './vesper/site/bento-layout'; export {getPreviewLayout} from './vesper/site/study-preview-layout'; export {discover} from './vesper/site/gallery-model'; export {libraryDemos as demos} from './vesper/site/library-demos';");
let checks=0;
function check(items,cols){
 const snapshot=JSON.stringify(items), actual=bentoSpans(items,cols);
 const rows=[];let row=[];
 const wanted=items.map(x=>getPreviewLayout(x.id)==='workspace'?cols:getPreviewLayout(x.id)==='wide'?(cols===6?3:2):(cols===6?2:1));
 for(const width of wanted){if(row.reduce((a,b)=>a+b,0)+width>cols){rows.push(row);row=[];}row.push(width);}
 if(row.length)rows.push(row);
 const expected=rows.flatMap(row=>{
  const widths=[...row];let spare=cols-row.reduce((a,b)=>a+b,0);
  while(spare-- > 0){const smallest=cols===6?Math.min(...widths):widths.at(-1);const index=cols===6?widths.lastIndexOf(smallest):widths.length-1;widths[index]++;}
  return widths;
 });
 assert.deepEqual(actual,expected);assert.equal(JSON.stringify(items),snapshot);assert.equal(actual.length,items.length);
 let used=0;actual.forEach((s,i)=>{assert.ok(Number.isInteger(s)&&s>=wanted[i]&&s<=cols);used+=s;assert.ok(used<=cols);if(used===cols)used=0;});assert.equal(used,0);checks++;
}
const types=['selector','chat-composer','chat-layout'];
for(let length=0;length<=8;length++)for(let n=0;n<3**length;n++){let k=n;const seq=Array.from({length},()=>{const id=types[k%3];k=Math.floor(k/3);return Object.freeze({id});});Object.freeze(seq);check(seq,2);check(seq,3);check(seq,6);}
let combos=0;
for(const scope of ['featured','all','chat','loading'])for(const category of ['All',...new Set(demos.map(d=>d.category))])for(const query of ['', 'chat','loading','navigation','nonexistentzz']){const items=discover(demos,scope,category,query);check(items,2);check(items,3);check(items,6);combos++;}
assert.deepEqual(bentoSpans([{id:'chat-composer'},{id:'chat-reasoning'}],6),[3,3]);
assert.deepEqual(bentoSpans([{id:'chat-composer'},{id:'chat-reasoning'}],3),[3,3]);
const source=fs.readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');
assert.match(source,/const largeSpans=bentoSpans\(visible,3\), mediumSpans=bentoSpans\(visible,2\)/);
assert.match(source,/visible\.map\(\(demo,index\) => <article key=\{demo.id\}/);
assert.match(source,/data-span-large=\{largeSpans\[index\]\} data-span-medium=\{mediumSpans\[index\]\}/);
const css=fs.readFileSync('apps/storybook/vesper/site/exact-gallery.css','utf8');
const start=css.indexOf('/* Ordered bento:');assert.ok(start>0);const rules=css.slice(start,css.indexOf("/* Active editorial collections", start));
for(const n of [1,2,3])assert.ok(rules.includes(`.exact-grid>.exact-tile[data-span-large="${n}"]{grid-column:span ${n}}`));
for(const n of [1,2])assert.ok(rules.includes(`.exact-grid>.exact-tile[data-span-medium="${n}"]{grid-column:span ${n}}`));
assert.match(rules,/@media\(max-width:1040px\)/);assert.match(rules,/@media\(max-width:680px\)\{\.exact-grid>\.exact-tile\[data-span-large\]\{grid-column:1\/-1\}\}/);
// These selectors have the same specificity (0,3,0) as old layout selectors,
// and are later in source; medium and phone overrides follow large overrides.
assert.ok(start>css.lastIndexOf('[data-exact-layout='));assert.ok(rules.indexOf('max-width:680px')>rules.indexOf('max-width:1040px'));
assert.doesNotMatch(rules,/(?:^|[;{])\s*(?:grid-auto-flow|order|position)\s*:/m);
// Validate the stage insets and shape contract without reading a historical
// checkout or banning unrelated responsive improvements in the same stylesheet.
const spacing=fs.readFileSync('apps/storybook/vesper/site/gallery-spacing.css','utf8');
assert.match(spacing,/\.exact-gallery-shell \.exact-tile \.demo-stage\{padding:var\(--gallery-stage-inset\)\}/);
assert.match(spacing,/\.exact-gallery-shell \.exact-tile\[data-exact-layout=wide\] \.demo-content\{max-width:var\(--gallery-wide-content\)\}/);
assert.match(spacing,/@media \(max-width:360px\) \{\s*\.exact-gallery-shell \.exact-scopes \{grid-template-columns:repeat\(2,minmax\(0,1fr\)\);\}/);
assert.match(source,/const desktopSpans=bentoSpans\(visible,6\)/);
assert.match(source,/data-span-desktop=\{desktopSpans\[index\]\}/);
assert.match(css,/@media\(min-width:1360px\)/);
for(const n of [2,3,4,5,6])assert.ok(css.includes(`.exact-gallery-shell .exact-grid>.exact-tile[data-span-desktop="${n}"]{grid-column:span ${n}}`));
console.log(`PASS: ${checks} layout checks (all ternary sequences through length8, ${combos} registry discovery combinations), immutable order, breakpoint CSS and source wiring. No browser geometry verified.`);
