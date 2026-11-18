// SPDX-License-Identifier: MIT — independent source/reducer recovery check.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
const base='apps/storybook/vesper/site/';
const js=transformSync(readFileSync(base+'loading-machine.ts','utf8'),{loader:'ts',format:'esm'}).code;
const {loadingReducer:r,initialLoadingState:i}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
let failed=r(i,{type:'start',shouldFail:true});const old=failed.run;failed=r(failed,{type:'finish',run:old});assert.equal(failed.phase,'error');
const recovery=r(failed,{type:'start',shouldFail:false});assert.equal(recovery.phase,'running');assert.equal(recovery.shouldFail,false);assert(recovery.run>old);assert.equal(recovery.step,0);
assert.equal(r(recovery,{type:'finish',run:old}),recovery);assert.equal(r(recovery,{type:'advance',run:old,step:2}),recovery);
const done=r(recovery,{type:'finish',run:recovery.run});assert.equal(done.phase,'complete');
const stopped=r(recovery,{type:'cancel'});assert.equal(r(stopped,{type:'finish',run:recovery.run}),stopped);
const source=readFileSync(base+'LoadingStudies.tsx','utf8');assert(source.includes('label="Use Studio brief"'));assert(source.includes("setSource('brief');dispatch({type:'start',shouldFail:false})"));
console.log('11 independent loading recovery source/reducer assertions passed. No mounted interaction test.');
