// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import {loadShowcaseModule} from '../../../../scripts/load-vesper-module.mjs';
const m = await loadShowcaseModule("export * from './vesper/site/ConversationRefinements'; export {createElement} from 'react'; export {renderToString} from 'react-dom/server';");
const {replyReducer:r, initialReply:s, cleanMessage, isAboveLatest, preferredScrollBehavior, reviewTranscript, conversationOverrides} = m;
let a=r(s,{type:'start'});assert.equal(a.phase,'drafting');assert.equal(r(a,{type:'start'}),a);assert.equal(r(a,{type:'finish',run:0}),a);let stopped=r(a,{type:'stop'});assert.equal(stopped.phase,'cancelled');assert.equal(r(stopped,{type:'finish',run:a.run}),stopped);let retry=r(stopped,{type:'start'});assert.equal(retry.run,2);assert.equal(r(retry,{type:'finish',run:1}),retry);assert.equal(r(retry,{type:'finish',run:2}).phase,'ready');assert.equal(r(s,{type:'stop'}),s);
assert.equal(cleanMessage(' \n '),null);assert.equal(cleanMessage(' A decision '),'A decision');assert.equal(isAboveLatest(500,400,60),false);assert.equal(isAboveLatest(500,400,59),true);assert.equal(preferredScrollBehavior(true),'instant');assert.equal(preferredScrollBehavior(false),'smooth');assert.equal(new Set(reviewTranscript.map(x=>x.text)).size,reviewTranscript.length);assert.equal(reviewTranscript.length,7);
assert.deepEqual(Object.keys(conversationOverrides),['chat-conversation','chat-layout']);
for (const [id,Component] of Object.entries(conversationOverrides)) {
 const html=m.renderToString(m.createElement(Component));assert(html.includes('Local conversation'),id);assert(!html.includes('I shared'),id);assert(!html.includes('Hide typing indicator'),id);assert(html.length>500,id);
}
console.log('Conversation lifecycle, whitespace, scroll preference/boundary, transcript uniqueness, override registry and two SSR compositions passed.');
