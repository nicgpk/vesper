import assert from 'node:assert/strict';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {libraryDemos} from './vesper/site/library-demos';export {discover} from './vesper/site/gallery-model';export {studyFamilies} from './vesper/site/StudyFamilies';export {getComponentPages} from './vesper/site/catalog';");
assert.equal(m.libraryDemos.length,107);assert.equal(m.discover(m.libraryDemos,'all','All','').length,95);
for(const [category,id] of [['Overlays','dropdown-menu-family'],['Navigation','dropdown-menu-family'],['Actions','button'],['Display','avatar'],['Data display','avatar'],['Layout','collapsible'],['Disclosure','collapsible']])assert(m.discover(m.libraryDemos,'all',category,'').some(d=>d.id===id),`${category} contains ${id}`);
for(const [term,id] of [['IconButton','button'],['ButtonGroup','button'],['ToggleButton','button'],['AvatarGroup','avatar'],['CollapsibleGroup','collapsible']])assert(m.discover(m.libraryDemos,'all','All',term).some(d=>d.id===id),`${term} discoverable`);
for(const f of m.studyFamilies)for(const variant of f.variants){assert(m.libraryDemos.some(d=>d.id===variant.id));const original=m.libraryDemos.find(d=>d.id===variant.id);assert(m.discover(m.libraryDemos,'all',original.category,'').some(d=>d.id===f.id));}
const pages=m.getComponentPages(m.libraryDemos);assert.equal(pages.length,228);assert.equal(new Set(pages.map(p=>p.id)).size,228);
console.log('95 visible studies, 107 routes, 228 native pages; original categories and component search retained across 6 families.');
