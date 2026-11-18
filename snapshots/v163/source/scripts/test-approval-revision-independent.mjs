import assert from 'node:assert/strict';import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export * from './vesper/site/ApprovalStudy';");const r=m.approvalReducer,s=m.initialApproval;
for(const decision of ['accept-change','reject-change']){
 const reviewed=r(s,{type:'review'});const changed=r(reviewed,{type:decision});assert.equal(changed.phase,'draft');assert.equal(changed.snapshot,null);assert.equal(changed.version,1);assert.equal(changed.text,decision==='accept-change'?m.revisionText:s.text);assert.equal(r(changed,{type:'approve',version:0}),changed);assert.equal(r(changed,{type:decision}),changed);
 const undo=r(changed,{type:'undo-change'});assert.equal(undo.text,s.text);assert.equal(undo.version,2);assert.equal(undo.revision.decision,'pending');assert.equal(undo.snapshot,null);
 const manual=r(changed,{type:'edit',text:'My version'});assert.equal(manual.revision,null);assert.equal(r(manual,{type:'undo-change'}),manual);
 const again=r(changed,{type:'review'});const busy=r(again,{type:'approve',version:again.version});for(const type of ['accept-change','reject-change','undo-change'])assert.equal(r(busy,{type}),busy);
 const receipt=r(busy,{type:'finish',run:busy.run,version:busy.version});assert.equal(receipt.receipt.text,changed.text);for(const type of ['accept-change','reject-change','undo-change'])assert.equal(r(receipt,{type}),receipt);
 const reset=r(receipt,{type:'another'});assert.equal(reset.revision,null);assert.equal(reset.snapshot,null);assert.equal(reset.receipt,null);assert.equal(reset.text,'');assert.equal(r(reset,{type:'finish',run:busy.run,version:busy.version}),reset);
 const cancelled=r(busy,{type:'cancel'});const revised=r(cancelled,{type:'undo-change'});assert.equal(r(revised,{type:'finish',run:busy.run,version:busy.version}),revised);
}
assert.equal(s.version,0);assert.equal(s.revision.decision,'pending');assert.equal(r({...s,text:'Different'}, {type:'accept-change'}).text,'Different');
console.log('Independent approval revision transitions pass: accept/reject/undo, manual-edit invalidation, stale approval/completion, recording/receipt guards, reset and baseline immutability. No browser.');
