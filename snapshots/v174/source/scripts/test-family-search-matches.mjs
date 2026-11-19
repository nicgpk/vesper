import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {libraryDemos} from './vesper/site/library-demos';export {discover,matchingFamilyVariants} from './vesper/site/gallery-model';");
for(const [term,family,id] of [['AvatarGroup','avatar','avatar-group'],['CheckboxList','checkbox','checkbox-list'],['IconButton','button','icon-button'],['CollapsibleGroup','collapsible','collapsible-group'],['BaseTypeahead','native-typeahead','base-typeahead']]){
 const result=m.discover(m.libraryDemos,'all','All',term).find(d=>d.id===family);assert(result,term);
 const matches=m.matchingFamilyVariants(result,term);assert(matches.some(d=>d.id===id),term);
 for(const match of matches)assert(m.libraryDemos.some(d=>d.id===match.id),'original route exists');
 assert.equal(m.discover(m.libraryDemos,'all','All',term).filter(d=>d.id===id).length,0,'no duplicate hidden card');
}
const avatar=m.libraryDemos.find(d=>d.id==='avatar');
assert(m.matchingFamilyVariants(avatar,'avatar group').some(d=>d.id==='avatar-group'));
assert.deepEqual(m.matchingFamilyVariants(avatar,''),[]);assert.deepEqual(m.matchingFamilyVariants(avatar,'  '),[]);assert.deepEqual(m.matchingFamilyVariants(avatar,'Data display'),[]);assert.deepEqual(m.matchingFamilyVariants(avatar,'unlikely missing'),[]);
assert.deepEqual(m.matchingFamilyVariants(m.libraryDemos.find(d=>d.id==='loading-tool'),'document'),[]);
const source=readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');
assert(source.includes('href={`#/components/${match.id}`}'));assert(source.includes('originRef(`match:${demo.id}:${match.id}`,element)'));assert(source.includes('rememberOrigin(`match:${demo.id}:${match.id}`,event)'));
console.log('Family search matches preserve original routes, compact/spaced symbols, empty/category behavior, hidden-card consolidation and return-origin wiring. Source checks, not mounted browser proof.');
