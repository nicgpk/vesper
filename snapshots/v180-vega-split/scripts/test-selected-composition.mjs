import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const {selectedComposition,bentoSpans,discover,demos}=await loadShowcaseModule(
 "export {selectedComposition} from './vesper/site/selected-composition'; export {bentoSpans} from './vesper/site/bento-layout'; export {discover} from './vesper/site/gallery-model'; export {libraryDemos as demos} from './vesper/site/library-demos';"
);
const items = Object.freeze(discover(demos,'featured','All','').map(({id})=>Object.freeze({id})));
const order = items.map(x=>x.id);
const planned=selectedComposition(items);
assert.equal(planned.length,17);
assert.deepEqual(items.map(x=>x.id),order);
const groups=(spans,tracks)=>{
 let taken=0;const rows=[];let row=[];
 spans.forEach((span,i)=>{assert(span>0&&Number.isInteger(span));taken+=span;assert(taken<=tracks);row.push([order[i],span]);if(taken===tracks){rows.push(row);row=[];taken=0}});
 assert.equal(taken,0);assert.deepEqual(rows.flat().map(([id])=>id),order);return rows;
};
const regular=groups(planned.map(x=>x.regular),12), broad=groups(planned.map(x=>x.broad),12);
assert.deepEqual(regular.map(row=>row.map(([,n])=>n)),[[6,6],[6,6],[6,6],[7,5],[4,4,4],[7,5],[6,6],[6,6]]);
assert.deepEqual(broad.map(row=>row.map(([,n])=>n)),[[7,5],[6,6],[6,6],[7,5],[4,4,4],[7,5],[3,3,3,3]]);
assert.deepEqual(regular[1].map(([id])=>id),['chat-parallel-tools','chat-approval']);
assert.deepEqual(regular[2].map(([id])=>id),['image-material','native-media-viewer']);
assert.deepEqual(regular[4].map(([id])=>id),['loading-text','loading-tool','loading-cube']);
assert.deepEqual(regular[5].map(([id])=>id),['chat-layout','chat-reactions']);
assert(!order.includes('selector'), 'The lower-depth Selector yields its Selected slot, not its catalog entry');
assert(discover(demos,'all','All','').some(x=>x.id==='selector'));
assert(discover(demos,'chat','All','').some(x=>x.id==='chat-parallel-tools'));
assert(discover(demos,'featured','All','lightbox').some(x=>x.id==='native-media-viewer'));

assert.equal(selectedComposition(items.slice(1)),null);
assert.equal(selectedComposition([...items].reverse()),null);
assert.equal(selectedComposition([...items.slice(0,-1),{id:'new-study'}]),null);

const css=fs.readFileSync('apps/storybook/vesper/site/selected-composition.css','utf8');
assert.match(css,/@media \(min-width:1041px\)/);
assert.match(css,/@media \(min-width:1240px\)/);
assert.match(css,/grid-template-columns:repeat\(12,minmax\(0,1fr\)\)/);
assert.match(css,/block-size:auto;min-block-size:/);
assert.doesNotMatch(css,/(?:^|[;{])\s*(?:height|max-height|max-block-size|overflow|order|grid-auto-flow|display|visibility)\s*:/m);
const shell=fs.readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');
assert.match(shell,/scope==='featured'&&!query\.trim\(\)&&!featureSelection\?selectedComposition\(visible\):null/);
assert.match(shell,/visible\.map\(\(demo,index\) => <article key=\{demo.id\}/);
assert.match(shell,/href=\{`#\/components\/\$\{demo.id\}`\}/);
const spacing=fs.readFileSync('apps/storybook/vesper/site/gallery-spacing.css','utf8');
assert.match(spacing,/--gallery-wide-content:620px;/);
assert.match(spacing,/\.demo-stage\[data-study="chat-layout"\] \.demo-content\{\s*width:100%;max-width:var\(--gallery-wide-content\)/);
for(const screen of [1100,1280,1440]){
 const width=Math.min(1320,screen-64),oldCols=screen>=1360?6:3, old=groups(bentoSpans(items,oldCols),oldCols);
 const updated=screen>=1240?broad:regular;
 const pixels = (cols, n) => Math.round((width-(cols-1)*20)/cols*n+(n-1)*20);
 const format=(rows,cols)=>rows.map(row=>row.map(([id,n])=>id+' '+n+'/'+cols+' ('+pixels(cols,n)+'px)').join('  +  ')).join('\n');
 console.log(`${screen}px, ${width}px content: ${old.length}→${updated.length} rows\nBEFORE\n${format(old,oldCols)}\nAFTER\n${format(updated,12)}`);
 assert(updated.length<=old.length);
}
console.log('PASS: ordered spans, density tiers, guarded fallback, independent chat reading width, direct routes, auto-growing stages and no new overflow clipping. Model/source assurance only; no rendered geometry claim.');
