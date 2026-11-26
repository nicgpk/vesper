import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {EvidencePreview,EvidenceSource,sourceFunnel,batchReducer,sourceState,initialBatch} from './vesper/site/ToolFeedbackStudies';export {createElement} from 'react';export {renderToStaticMarkup} from 'react-dom/server';");
const render=(kind,state)=>m.renderToStaticMarkup(m.createElement(m.EvidencePreview,{kind,state}));
for(const kind of ['Research','Analytics'])for(const state of ['waiting','reading','stopped','unavailable','ready']){const html=render(kind,state);assert(!html.includes('undefined'));assert(!html.includes('<svg'));if(state==='ready'){assert(!html.includes('tf-evidence-placeholder'));assert(!html.includes('aria-hidden="true"')||kind==='Analytics');}else if(state==='unavailable'){assert(html.includes('Source unavailable'));assert(!html.includes('tf-evidence-placeholder'));}else{assert(html.includes('aria-hidden="true"'));assert(html.includes(`data-reading="${state==='reading'}"`));}}
assert(render('Research','ready').includes('2 of 6 observations'));
assert(render('Analytics','ready').includes('120 started, 84 reached review, 72 finished'));
assert.deepEqual(m.sourceFunnel.map(r=>r.value),[120,84,72]);assert(render('Analytics','ready').includes('width:70%'));assert(render('Analytics','ready').includes('width:60%'));
let s=m.batchReducer(m.initialBatch,{type:'start'});s=m.batchReducer(s,{type:'notes',run:s.run});assert.equal(m.sourceState(s,'notes'),'ready');assert.equal(m.sourceState(s,'metrics'),'reading');s=m.batchReducer(s,{type:'finish',run:s.run});assert.equal(m.sourceState(s,'notes'),'ready');assert.equal(m.sourceState(s,'metrics'),'unavailable');s=m.batchReducer(s,{type:'retry'});assert.equal(m.sourceState(s,'notes'),'ready');assert.equal(m.sourceState(s,'metrics'),'reading');
const css=readFileSync('apps/storybook/vesper/site/tool-feedback-studies.css','utf8');assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes('forced-colors:active'));assert(css.includes('.tf-source-grid{grid-template-columns:minmax(0,1fr)}'));
console.log('Source-specific evidence: all state SSR, retained research on retry, truthful figures, no decorative chart, narrow layout and motion fallback contracts pass. Browser not tested.');
