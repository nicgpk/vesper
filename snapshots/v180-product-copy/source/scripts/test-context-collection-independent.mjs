import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {collectionChapters,contextCollectionInitial,contextCollectionReducer,ContextCollectionDetails,ContextMenuPreview} from './vesper/site/coreBasicDemos';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
const initial={...m.contextCollectionInitial};
let s=m.contextCollectionReducer(initial,{type:'open'});assert.equal(s.open,true);assert.equal(s.copied,false);assert.equal(m.contextCollectionReducer(s,{type:'open'}),s);
s=m.contextCollectionReducer(s,{type:'duplicate'});assert(s.open&&s.copied);assert.equal(m.contextCollectionReducer(s,{type:'duplicate'}),s);
s=m.contextCollectionReducer(s,{type:'toggle-details'});assert(!s.open&&s.copied);
s=m.contextCollectionReducer(s,{type:'toggle-copy'});assert(!s.open&&!s.copied);assert.equal(s.notice,'Local copy removed.');
s=m.contextCollectionReducer(s,{type:'duplicate'});assert(!s.open&&s.copied);assert.equal(s.notice,'A local copy was added.');
s=m.contextCollectionReducer(s,{type:'open'});assert(s.open&&s.copied);
s=m.contextCollectionReducer(s,{type:'toggle-copy'});s=m.contextCollectionReducer(s,{type:'toggle-copy'});assert(s.open&&s.copied);assert.equal(m.contextCollectionReducer(s,{type:'unknown'}),s);
assert.deepEqual(initial,{open:false,copied:false,notice:'Collection ready.'});
assert.equal(new Set(m.collectionChapters).size,6);
for(const copied of [false,true]){const html=m.renderToString(m.createElement(m.ContextCollectionDetails,{copied}));assert.equal((html.match(/<li>/g)||[]).length,6);for(const chapter of m.collectionChapters)assert(html.includes(chapter));assert(html.includes(copied?'Evening collection copy':'Evening collection details'));assert(html.includes('data-density="compact"'));}
const src=fs.readFileSync('apps/storybook/vesper/site/coreBasicDemos.tsx','utf8');const section=src.slice(src.indexOf('export function ContextMenuPreview'),src.indexOf('function DatesPreview'));
for(const expected of ["useReducer(contextCollectionReducer,contextCollectionInitial)","isDisabled={state.copied}","dispatch({type:'duplicate'})","dispatch({type:'toggle-copy'})","aria-expanded={state.open}","state.open&&<ContextCollectionDetails copied={false}","state.copied&&<ContextCollectionDetails copied","Copies stay on this page.","role=\"status\""])assert(section.includes(expected),expected);
assert.equal((section.match(/dispatch\(\{type:'open'\}\)/g)||[]).length,2);
console.log('Independent context collection repeat/open/duplicate/remove/recovery reducer, two detail SSR cases and native action wiring pass. No mounted/browser verification.');

const metadata=src.slice(src.indexOf("id: 'context-menu'"),src.indexOf("id: 'date-range-and-time'"));
assert(!metadata.includes('setAction'));assert(!metadata.includes('owner and chapter'));assert(metadata.includes('setCopy(true)'));assert(metadata.includes('no external collection is changed'));
