import assert from 'node:assert/strict';import fs from 'node:fs';import{loadShowcaseModule}from'./load-vesper-module.mjs';
const m=await loadShowcaseModule("export * from './vesper/site/CollectionMenuRefinement';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
const original=m.collectionDocuments.map(x=>x.id);assert.deepEqual(m.sortedCollection('newest').map(x=>x.id),['notes','flow','brief']);assert.deepEqual(m.sortedCollection('oldest').map(x=>x.id),['brief','flow','notes']);assert.deepEqual(m.collectionDocuments.map(x=>x.id),original);assert.equal(new Set(original).size,3);
for(const order of ['newest','oldest'])for(const showDates of [true,false]){
 const html=m.renderToString(m.createElement(m.CollectionMenuContents,{order,showDates}));assert.equal((html.match(/<li>/g)||[]).length,3);assert.equal((html.match(/<time /g)||[]).length,showDates?3:0);for(const d of m.collectionDocuments)assert(html.includes(d.title));const expected=m.sortedCollection(order);assert(html.indexOf(expected[0].title)<html.indexOf(expected[2].title));
}
const html=m.renderToString(m.createElement(m.CollectionMenuRefinement));assert(html.includes('Onboarding'));assert(html.includes('Options'));assert(html.includes('Changes stay on this page'));assert(html.includes('Workspace'));assert(html.includes('role="status"'));
const source=fs.readFileSync('apps/storybook/vesper/site/CollectionMenuRefinement.tsx','utf8');for(const name of ['DropdownMenuItem','DropdownMenuCheckboxItem','DropdownMenuDivider','DropdownMenuRadioGroup','DropdownMenuRadioItem','DropdownMenuSubMenu'])assert(source.includes('<'+name));
for(const event of ['setOpen(value=>!value)','onChange={setShowDates}','onChange={setOrder}','setFolder(location)','isOpen?<CollectionMenuContents'])assert(source.includes(event));
assert(!source.includes('Notify'));assert(!source.includes('fetch('));assert(!source.includes('localStorage'));
const css=fs.readFileSync('apps/storybook/vesper/site/collection-menu-refinement.css','utf8');for(const rule of ['min-width:0','flex-wrap:wrap','overflow-wrap:anywhere','forced-colors'])assert(css.includes(rule));
console.log('Collection menu: real sorting, immutable source data, date visibility, semantic3item list, native menu coverage, local-only disclosure and action wiring/source+SSR checks pass. No mounted menu/browser QA.');
