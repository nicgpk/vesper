import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export * from './vesper/site/ToolFeedbackStudies';export {createElement} from 'react';export {renderToString} from 'react-dom/server';export {libraryDemos} from './vesper/site/library-demos';export {discover} from './vesper/site/gallery-model';");
let s=m.batchReducer(m.initialBatch,{type:'start'});const first=s.run;
assert.equal(m.batchReducer(s,{type:'start'}),s);
s=m.batchReducer(s,{type:'notes',run:first});assert(s.notes);s=m.batchReducer(s,{type:'finish',run:first});assert.equal(s.phase,'partial');assert(!s.metrics);
s=m.batchReducer(s,{type:'retry'});assert(s.notes);assert(s.retry);assert.equal(m.batchReducer(s,{type:'finish',run:first}),s);s=m.batchReducer(s,{type:'finish',run:s.run});assert.equal(s.phase,'complete');assert(s.metrics);
s=m.batchReducer(s,{type:'start'});const stopped=m.batchReducer(s,{type:'stop'});assert.equal(stopped.phase,'stopped');assert.equal(m.batchReducer(stopped,{type:'finish',run:s.run}),stopped);assert.equal(m.batchReducer(stopped,{type:'notes',run:s.run}),stopped);assert.equal(m.batchReducer(stopped,{type:'retry'}),stopped);
for(const [C,text] of [[m.ParallelToolsStudy,'Gather sources'],[m.ResponseFeedbackStudy,'Needs work']]){const html=m.renderToString(m.createElement(C));assert(html.includes(text));assert(!html.includes('undefined'));}
for(const id of ['chat-parallel-tools','chat-response-feedback'])assert(m.discover(m.libraryDemos,'featured','All','').some(d=>d.id===id));
const src=fs.readFileSync('apps/storybook/vesper/site/ToolFeedbackStudies.tsx','utf8');assert(!/fetch\(|localStorage|sessionStorage/.test(src));assert(src.includes('clearTimeout(a);clearTimeout(b)'));assert(src.includes('name={reasonGroup}'));assert(src.includes('aria-pressed'));
const css=fs.readFileSync('apps/storybook/vesper/site/field-insets.css','utf8');assert(css.includes('--_textarea-inline-padding:12px'));assert(css.includes('padding-bottom:28px'));
console.log('Tool partial/retry/cancel/stale-event, SSR, discovery, disclosure and shared field-inset source checks pass. Browser unverified.');
