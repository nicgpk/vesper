// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {runSteps,workReducer,initialWorkState,ToolRunSummary} from './vesper/site/ChatRefinements';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
const state=m.initialWorkState;
const start=m.workReducer(state,{type:'start',offline:false});
const compare=m.workReducer(start,{type:'read',run:start.run});
const done=m.workReducer(compare,{type:'finish',run:compare.run});
const archived=m.workReducer(state,{type:'start',offline:true});
const failed=m.workReducer(archived,{type:'read',run:archived.run});
const cancelled=m.workReducer(start,{type:'cancel'});
const cancelledAfterRead=m.workReducer(compare,{type:'cancel'});
for(const [stepState,steps,count] of [
 [state,['Queued','Queued'],0],[start,['Running','Queued'],0],
 [compare,['Done','Running'],1],[done,['Done','Done'],2],
 [failed,['Failed','Not run'],0],[cancelled,['Stopped','Not run'],0],
 [cancelledAfterRead,['Done','Stopped'],1],
]) {
 assert.deepEqual(m.runSteps(stepState),steps);
 const html=m.renderToString(m.createElement(m.ToolRunSummary,{state:stepState}));
 assert.match(html,/role="status"/);
 assert.deepEqual([...html.matchAll(/data-status="([^"]+)"/g)].map(m=>m[1]),steps);
 assert.equal((html.match(/aria-current="step"/g)??[]).length,Number(steps.includes('Running')));
 assert.ok(html.replaceAll("<!-- -->","").includes(`${count} of 2 complete`));
}
assert.equal(m.workReducer(cancelled,{type:'read',run:start.run}),cancelled);
assert.equal(m.workReducer(cancelledAfterRead,{type:'finish',run:compare.run}),cancelledAfterRead);
console.log('Tool run: seven native status summaries, completed counts, step semantics and stale events passed.');
