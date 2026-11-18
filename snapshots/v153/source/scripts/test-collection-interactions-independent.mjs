import assert from 'node:assert/strict';import{loadShowcaseModule}from'./load-vesper-module.mjs';
const m=await loadShowcaseModule("export * from './vesper/site/collection-interaction-state';export {demos} from './vesper/site/demos';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
const f=m.filterReducer;const initial=m.initialFilter;
assert.equal(f(initial,{type:'change',value:false}),initial);assert.equal(f(initial,{type:'apply'}),initial);
const draft=f(f(initial,{type:'open'}),{type:'change',value:false});assert.equal(draft.applied,true);assert.equal(m.visibleCollections(draft.applied).length,2);
const dismissed=f(draft,{type:'dismiss'});assert.equal(dismissed.draft,true);assert.equal(dismissed.applied,true);
const applied=f(draft,{type:'apply'});assert.equal(applied.applied,false);assert.equal(m.visibleCollections(applied.applied).length,3);assert.equal(f(applied,{type:'dismiss'}).applied,false);assert.equal(f(applied,{type:'open'}).draft,false);
const r=m.setupReducer,s=m.initialSetup;assert.equal(r(s,{type:'confirm'}),s);assert.equal(r(s,{type:'navigate',sheet:'confirm'}),s);
const begun=r(s,{type:'start'});assert.equal(r(begun,{type:'confirm'}),begun);assert.equal(r(begun,{type:'navigate',sheet:'invalid'}),begun);
const confirmed=r(r(begun,{type:'navigate',sheet:'confirm'}),{type:'confirm'});assert.equal(confirmed.phase,'confirmed');assert.equal(r(confirmed,{type:'navigate',sheet:null}),confirmed);assert.equal(r(confirmed,{type:'navigate',sheet:'details'}),confirmed);
const restarted=r(confirmed,{type:'start'});assert.equal(restarted.phase,'active');assert.equal(restarted.sheet,'details');const cancelled=r(restarted,{type:'navigate',sheet:null});assert.equal(cancelled.phase,'cancelled');assert.equal(r(cancelled,{type:'confirm'}),cancelled);assert.deepEqual(r(cancelled,{type:'start'}),begun);
assert.equal(m.workspaceAction(false),'Add to workspace');assert.equal(m.workspaceAction(true),'Remove from workspace');
for(const [id,text] of [['bottom-sheet','Review notes'],['card','Add to workspace'],['bottom-sheet-switcher','Start collection setup']]){const demo=m.demos.find(d=>d.id===id);assert(demo,id);const h=m.renderToString(m.createElement(demo.Preview));assert(h.includes(text),id);}
console.log('Independent filter staging/apply/dismiss, setup confirm-close guard/reset/cancel, card action labels and initial native SSR checks pass. No browser modal race verification.');
