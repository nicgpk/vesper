import assert from 'node:assert/strict';import fs from 'node:fs';import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {ChatToolCalls} from '@astryxdesign/core/Chat';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");let n=0;
for(const status of ['pending','running','complete','error'])for(const mode of ['single','open','closed']){
 const calls=[{key:'a',name:'Read notes',status}];if(mode!=='single')calls.unshift({key:'previous',name:'Previous',status:'complete'});
 const html=m.renderToString(m.createElement(m.ChatToolCalls,{calls,...(mode==='open'?{isExpanded:true}:{})}));
 assert.equal(html.includes('astryx-spinner'),status==='running',`${status}/${mode}`);n++;
 assert(html.includes(({pending:'Pending',running:'Running',complete:'Complete',error:'Failed'})[status]),`${status}/${mode} announcement`);n++;
}
const source=fs.readFileSync('packages/core/src/Chat/ChatToolCalls.tsx','utf8');
assert(source.includes("pending: 'clock'"));n++;
assert(source.includes("export type ChatToolCallStatus = 'pending' | 'running' | 'complete' | 'error';"));n++;
assert(!source.includes("status === 'pending' ?"));n++;
assert(!source.includes("latestStatus === 'pending' ?"));n++;
assert(fs.readFileSync('packages/core/src/Chat/ChatToolCalls.doc.mjs','utf8').includes('spinner only while running'));n++;
console.log(`${n} tool presentation source/SSR assertions passed; no rendered motion verification`);
