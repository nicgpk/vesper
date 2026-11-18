import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export * from './vesper/site/ApprovalStudy';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
const r=m.approvalReducer,s=m.initialApproval;let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++};
eq(r(s,{type:'approve',version:0}),s);
eq(r({...s,text:' \n'},{type:'review'}).phase,'draft');
const reviewed=r(s,{type:'review'});eq(reviewed.snapshot.text,s.text);eq(reviewed.snapshot.destination,'#design-review');
eq(r(reviewed,{type:'approve',version:99}),reviewed);
const edited=r(reviewed,{type:'edit',text:'A changed note'});eq(edited.phase,'draft');eq(edited.snapshot,null);eq(edited.version,1);eq(r(edited,{type:'approve',version:0}),edited);
const second=r(edited,{type:'review'});const busy=r(second,{type:'approve',version:1});eq(busy.phase,'recording');eq(r(busy,{type:'approve',version:1}),busy);eq(r(busy,{type:'edit',text:'late'}),busy);
eq(r(busy,{type:'finish',run:busy.run-1,version:1}),busy);eq(r(busy,{type:'finish',run:busy.run,version:0}),busy);
const cancel=r(busy,{type:'cancel'});eq(cancel.phase,'cancelled');eq(cancel.text,'A changed note');eq(r(cancel,{type:'finish',run:busy.run,version:1}),cancel);
const retry=r(r(cancel,{type:'review'}),{type:'approve',version:1});eq(r(retry,{type:'finish',run:busy.run,version:1}),retry);
const receipt=r(retry,{type:'finish',run:retry.run,version:1});eq(receipt.phase,'receipt');eq(receipt.receipt.text,'A changed note');eq(r(receipt,{type:'approve',version:1}),receipt);
const another=r(receipt,{type:'another'});eq(another.phase,'draft');eq(another.text,'');eq(another.receipt,null);eq(r(another,{type:'finish',run:retry.run,version:1}),another);
eq(m.approvalDemos[0].id,'chat-approval');eq(m.approvalDemos[0].covers,undefined);
const html=m.renderToString(m.createElement(m.ApprovalStudy));for(const text of ['textarea','Review note','#design-review','Not connected','Nothing is sent.','role="status"']){assert(html.includes(text));n++;}
const src=readFileSync('apps/storybook/vesper/site/ApprovalStudy.tsx','utf8'),css=readFileSync('apps/storybook/vesper/site/approval-study.css','utf8');
for(const text of ['window.clearTimeout(timer)','isReadOnly={busy}','isDisabled={!state.text.trim()}']){assert(src.includes(text));n++;}
for(const text of ['--study-shimmer-gradient','prefers-reduced-motion','forced-colors']){assert(css.includes(text));n++;}
assert(!/fetch\(|XMLHttpRequest|WebSocket/.test(src));n++;
console.log(n+' approval reducer, source safeguards, native SSR and fallback assertions passed; no browser or delivery.');
