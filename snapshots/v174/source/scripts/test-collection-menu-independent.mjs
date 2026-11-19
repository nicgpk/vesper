import assert from 'node:assert/strict';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {collectionDocuments,sortedCollection,CollectionMenuContents,CollectionMenuRefinement} from './vesper/site/CollectionMenuRefinement'; export {libraryDemos} from './vesper/site/library-demos'; export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
const original=m.collectionDocuments.map(x=>x.id);
assert.deepEqual(m.sortedCollection('newest').map(x=>x.id),['notes','flow','brief']);
assert.deepEqual(m.sortedCollection('oldest').map(x=>x.id),['brief','flow','notes']);
assert.deepEqual(m.collectionDocuments.map(x=>x.id),original);
for(const order of ['newest','oldest']) for(const showDates of [true,false]){
 const h=m.renderToString(m.createElement(m.CollectionMenuContents,{order,showDates}));
 assert.equal((h.match(/<li>/g)||[]).length,3);assert.equal((h.match(/<time /g)||[]).length,showDates?3:0);
 const ids=m.sortedCollection(order).map(x=>x.title);assert(h.indexOf(ids[0])<h.indexOf(ids[1])&&h.indexOf(ids[1])<h.indexOf(ids[2]));
}
const h=m.renderToString(m.createElement(m.CollectionMenuRefinement));assert(h.includes('Changes stay on this page.'));assert(h.includes('Options'));
const demo=m.libraryDemos.find(x=>x.id==='dropdown-menu-family');const family=m.renderToString(m.createElement(demo.Preview));assert(family.includes('Organize'));assert(family.includes('Onboarding'));assert(family.includes('Options'));assert.equal(demo.name,'Collection menus');assert.equal(demo.covers.length,6);assert(!demo.code.includes('setAction'));assert(!demo.description.includes('notifications'));
console.log('Independent Collection menu sorting/nonmutation/four SSR presentations/registry coverage checks pass. No browser interaction verification.');
