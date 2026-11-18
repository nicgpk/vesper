import assert from 'node:assert/strict';import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export * from './vesper/site/LocalCollectionsRefinement'; export {demos} from './vesper/site/demos'; export {libraryDemos} from './vesper/site/library-demos'; export {createElement} from 'react'; export {renderToString} from 'react-dom/server';");
const warnings=[];const old=console.error;console.error=(...x)=>warnings.push(x.join(' '));
let baseline,current;
try{baseline=m.renderToString(m.createElement(m.demos.find(d=>d.id==='context-menu').Preview));current=m.renderToString(m.createElement(m.ContextCollectionRefinement));}finally{console.error=old;}
assert(!warnings.some(x=>x.includes('moveTo')||x.includes('Invalid values for props')));
assert(!/\s(?:moveTo|start|cancel)=/.test(baseline));assert(!/\s(?:moveTo|start|cancel)=/.test(current));
for(const name of ['Evening collection','Evening collection copy']){const h=m.renderToString(m.createElement(m.LocalCollectionDetails,{title:name}));assert(h.includes(`aria-label="${name} notes"`));assert.equal((h.match(/<dt>/g)||[]).length,3);assert.equal((h.match(/<dd>/g)||[]).length,3);}
const empty=m.renderToString(m.createElement(m.EmptyCollectionRefinement));assert(empty.includes('Create collection'));assert(!empty.includes('Remove collection'));
for(const id of ['context-menu','empty-collection']){const d=m.libraryDemos.find(x=>x.id===id);assert(d);assert(d.code.includes('Refinement'));}
console.log('Independent local collection semantic SSR/registry checks pass; both original and new composition SSR omit invalid attributes without warnings after explicit native touch-handler forwarding. No browser checks.');
