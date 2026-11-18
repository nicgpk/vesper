import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {mobileWorkspaceInitial,mobileWorkspaceReducer,MobileWorkspaceContent,MobileNavigationPreview,navigationDemos} from './vesper/site/navigationDemos';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
const initial={...m.mobileWorkspaceInitial};
let s=m.mobileWorkspaceReducer(initial,{type:'open',value:true});
assert.equal(s.open,true);assert.deepEqual(initial,{open:false,destination:'Overview',compact:false});
s=m.mobileWorkspaceReducer(s,{type:'navigate',destination:'Settings'});assert.equal(s.open,false);assert.equal(s.destination,'Settings');
s=m.mobileWorkspaceReducer(s,{type:'density',value:true});
for(const destination of ['Collections','Overview','Overview','Settings']){
 s=m.mobileWorkspaceReducer(s,{type:'open',value:true});
 s=m.mobileWorkspaceReducer(s,{type:'navigate',destination});
 assert.equal(s.open,false);assert.equal(s.destination,destination);assert.equal(s.compact,true);
}
s=m.mobileWorkspaceReducer(s,{type:'open',value:true});s=m.mobileWorkspaceReducer(s,{type:'open',value:false});assert.deepEqual(s,{open:false,destination:'Settings',compact:true});
assert.equal(m.mobileWorkspaceReducer(s,{type:'navigate',destination:'Missing'}),s);assert.equal(m.mobileWorkspaceReducer(s,{type:'unknown'}),s);
s=m.mobileWorkspaceReducer(s,{type:'density',value:false});assert.equal(s.compact,false);
const markers={Overview:'09:00 · Brief prepared',Collections:'Review collection · 3 documents',Settings:'Content spacing'};
for(const destination of Object.keys(markers))for(const compact of [false,true]){
 const html=m.renderToString(m.createElement(m.MobileWorkspaceContent,{destination,compact,onDensity:()=>{}}));
 assert(html.includes(markers[destination]));assert(html.includes('aria-labelledby='));assert(html.includes('Local review content'));assert(html.includes(`data-density="${compact?'compact':'comfortable'}"`));assert.equal((html.match(/<li>/g)||[]).length,3);
 if(destination==='Settings'){assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);assert.equal((html.match(/aria-pressed="false"/g)||[]).length,1);}
}
const source=fs.readFileSync('apps/storybook/vesper/site/navigationDemos.tsx','utf8');
const section=source.slice(source.indexOf('export function MobileNavigationPreview'),source.indexOf('function TopNavigationPreview'));
for(const expected of ["useReducer(mobileWorkspaceReducer,mobileWorkspaceInitial)","isOpen:state.open","onOpenChange:value=>dispatch({type:'open',value})","dispatch({type:'navigate',destination:label})","aria-current={state.destination===label?'page':undefined}","compact={state.compact}","dispatch({type:'density',value})","breakpoint:'2xl'"])assert(section.includes(expected),expected);
assert(!section.includes('Current destination:'));assert(!section.includes('role="tablist"'));
assert(m.navigationDemos.some(x=>x.Preview===m.MobileNavigationPreview&&x.covers.includes('MobileNav')));
console.log('Independent mobile workspace reducer interruption/repeat/density, 6 SSR view-density cases, semantics and native wiring tests pass. No mounted/browser verification.');
