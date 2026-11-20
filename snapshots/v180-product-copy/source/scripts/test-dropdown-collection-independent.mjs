import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {dropdownCollectionInitial,dropdownCollectionReducer,dropdownChapters,orderedDropdownChapters,DropdownCollectionRows,DropdownFamilyPreview,coreBasicDemos} from './vesper/site/coreBasicDemos';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
const pristine=JSON.stringify(m.dropdownChapters);
assert.deepEqual(m.orderedDropdownChapters('newest').map(x=>x.order),[3,2,1]);assert.deepEqual(m.orderedDropdownChapters('oldest').map(x=>x.order),[1,2,3]);assert.equal(JSON.stringify(m.dropdownChapters),pristine);assert.notEqual(m.orderedDropdownChapters('newest'),m.dropdownChapters);
const initial={...m.dropdownCollectionInitial};const reduce=m.dropdownCollectionReducer;
let s=reduce(initial,{type:'dates',value:false});assert.equal(s.showDates,false);s=reduce(s,{type:'sort',value:'oldest'});assert.equal(s.sort,'oldest');
for(const action of [{type:'dates',value:'false'},{type:'sort',value:'wrong'},{type:'move',value:'Elsewhere'},{type:'unknown'},{type:'undo'}])assert.equal(reduce(s,action),s);
s=reduce(s,{type:'move',value:'Favorites'});assert.equal(s.location,'Favorites');assert.equal(s.previousLocation,'Workspace');assert.equal(reduce(s,{type:'move',value:'Favorites'}),s);
s=reduce(s,{type:'move',value:'Archive'});assert.equal(s.location,'Archive');assert.equal(s.previousLocation,'Favorites');s=reduce(s,{type:'undo'});assert.equal(s.location,'Favorites');assert.equal(s.previousLocation,null);assert.equal(reduce(s,{type:'undo'}),s);
s=reduce(s,{type:'move',value:'Workspace'});s=reduce(s,{type:'undo'});assert.equal(s.location,'Favorites');assert.equal(s.sort,'oldest');assert.equal(s.showDates,false);
for(const type of ['open','open','close','close','open']){s=reduce(s,{type});assert.equal(s.open,type==='open');assert.equal(s.location,'Favorites');}
assert.deepEqual(initial,m.dropdownCollectionInitial);
for(const sort of ['oldest','newest'])for(const showDates of [false,true]){const html=m.renderToString(m.createElement(m.DropdownCollectionRows,{sort,showDates}));assert.equal((html.match(/<li>/g)||[]).length,3);const names=m.orderedDropdownChapters(sort).map(x=>x.name);assert(html.indexOf(names[0])<html.indexOf(names[1]));assert(html.indexOf(names[1])<html.indexOf(names[2]));for(const row of m.dropdownChapters)assert.equal(html.includes(row.date),showDates);}
const src=fs.readFileSync('apps/storybook/vesper/site/coreBasicDemos.tsx','utf8');const section=src.slice(src.indexOf('export function DropdownFamilyPreview'),src.indexOf('function FieldsPreview'));
for(const text of ["useReducer(dropdownCollectionReducer,dropdownCollectionInitial)","value={state.showDates}","dispatch({type:'dates',value})","value={state.sort}","dispatch({type:'sort',value})","isDisabled={state.location===location}","dispatch({type:'move',value:location})","isDisabled={!state.previousLocation}","dispatch({type:'undo'})","state.open&&","aria-expanded={state.open}","sort={state.sort} showDates={state.showDates}","Dates {state.showDates?"])assert(section.includes(text),text);
assert.equal((section.match(/hasCloseOnSelect=\{false\}/g)||[]).length,2);
const demo=m.coreBasicDemos.find(x=>x.Preview===m.DropdownFamilyPreview);assert(demo.description.includes('undo'));assert(demo.code.includes('setShowDates'));assert(!demo.code.includes('setAction'));
console.log('Independent dropdown ordering/immutability, dates, multi-move/undo/repeat, notes, four SSR combinations, native wiring and metadata checks pass. No browser/mounted verification.');
