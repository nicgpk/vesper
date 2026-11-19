import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {discover,featureLinks} from './vesper/site/gallery-model';export {libraryDemos} from './vesper/site/library-demos';");
const source=readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');
const handler=source.match(/onChange=\{event => \{setQuery\(event.target.value\);(.*?)\}\} placeholder="Find a component…"/s)?.[1];assert(handler,'search handler is identifiable');
// Execute the actual search transition body with setter spies, not a parallel implementation.
for(const feature of m.featureLinks){
 let group=feature.id,scope='all',category='All';
 const apply=new Function('event','setFeatureGroup','setScope','setCategory',handler);
 apply({target:{value:'calendar'}},v=>group=v,v=>scope=v,v=>category=v);
 assert.equal(group,null);assert.equal(scope,'all');assert.equal(category,'All');
 const results=m.discover(m.libraryDemos,scope,category,'calendar').filter(d=>!group||m.featureLinks.find(f=>f.id===group).ids.includes(d.id));assert(results.some(d=>d.id==='calendar'));
}
assert(source.includes('className="exact-active-collection"'));assert(source.includes('Show all studies'));
const reset=source.match(/className="exact-active-collection".*?onClick=\{\(\)=>\{(.*?)\}\}/s)?.[1];assert(reset);
let focused=false;const document={getElementById:id=>id==='collection-heading'?{focus:()=>{focused=true;}}:null};
const state={featureGroup:'x',scope:'featured',category:'Chat',query:'old'};new Function('setFeatureGroup','setScope','setCategory','setQuery','document',reset)(v=>state.featureGroup=v,v=>state.scope=v,v=>state.category=v,v=>state.query=v,document);assert(focused);assert.deepEqual(state,{featureGroup:null,scope:'all',category:'All',query:''});
console.log('Actual search/reset handler transitions pass; global search escapes every featured collection and explicit reset clears filters. Mounted focus/layout not verified.');
