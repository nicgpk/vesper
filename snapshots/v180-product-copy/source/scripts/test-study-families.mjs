import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {libraryDemos} from './vesper/site/library-demos';export {studyFamilies,combineStudyFamilies} from './vesper/site/StudyFamilies';export {discover} from './vesper/site/gallery-model';export {createElement} from 'react';export {renderToStaticMarkup} from 'react-dom/server';export {LayerProvider} from '@astryxdesign/core/Layer';export {InternationalizationProvider} from '@astryxdesign/core/i18n';");
assert.equal(m.libraryDemos.length,107);assert.equal(new Set(m.libraryDemos.map(d=>d.id)).size,107);assert.equal(m.discover(m.libraryDemos,'all','All','').length,95);
const render=Preview=>m.renderToStaticMarkup(m.createElement(m.InternationalizationProvider,{locale:'en',dir:'ltr'},m.createElement(m.LayerProvider,null,m.createElement(Preview))));
for(const family of m.studyFamilies){
 const lead=m.libraryDemos.find(d=>d.id===family.id);assert(lead);const html=render(lead.Preview);assert(html.includes('sf-study'));assert(html.includes(`${family.name} variants`));
 for(const variant of family.variants){assert(html.includes(variant.label));const original=m.libraryDemos.find(d=>d.id===variant.id);assert(original);assert(render(original.Preview).length>0);}
}
for(const [term,id] of [['MoreMenu','dropdown-menu-family'],['BaseTypeahead','native-typeahead'],['CheckboxList','checkbox'],['CheckboxIndicator','checkbox']])assert(m.discover(m.libraryDemos,'all','All',term).some(d=>d.id===id),`${term} discoverability preserved`);
// Fake originals demonstrate closure captures input previews instead of recursive family previews.
const ids=[...new Set(m.studyFamilies.flatMap(f=>f.variants.map(v=>v.id)))];
const originals=ids.map(id=>({id,name:id,category:'Inputs',covers:[id],Preview:()=>m.createElement('div',null,`ORIGINAL:${id}`)}));
const grouped=m.combineStudyFamilies(originals);
for(const f of m.studyFamilies){const lead=grouped.find(d=>d.id===f.id);const html=render(lead.Preview);assert(html.includes(`ORIGINAL:${f.id}`));assert.deepEqual(lead.covers,originals.find(d=>d.id===f.id).covers);assert(f.variants.every(v=>lead.searchTerms.includes(v.id)));for(const v of f.variants.filter(v=>v.id!==f.id))assert.equal(grouped.find(d=>d.id===v.id),originals.find(d=>d.id===v.id));}
assert.throws(()=>m.combineStudyFamilies(originals.filter(d=>d.id!=='base-typeahead')),/Missing variant/);
const source=readFileSync('apps/storybook/vesper/site/StudyFamilies.tsx','utf8');assert(source.includes('const Component=current.demo.Preview'));assert(source.includes('aria-pressed={selected===item.id}'));assert(source.includes('key={selected}'));
console.log('Study families: 107 routes/95 visible, 6 family SSR, original Preview references, no recursion and component search coverage pass. Variant switching is source-reviewed, not browser tested.');
