import assert from 'node:assert/strict';import {requestGeneratedUI} from './request-ui.mjs';
const spec={version:1,result:{kind:'checklist',title:'Review',summary:'Next steps',items:[{id:'a',label:'Check'}]}};
let calls=0;const fake=async(url,options)=>{calls++;assert.equal(url,'/api/generate-ui');assert.equal(options.credentials,'same-origin');assert.deepEqual(JSON.parse(options.body),{prompt:'review'});return new Response(JSON.stringify({source:'model',spec}));};
assert.deepEqual(await requestGeneratedUI(' review ',{validate:s=>s===undefined?false:s.version===1,fetchImpl:fake}),spec);assert.equal(calls,1);
await assert.rejects(requestGeneratedUI('review',{validate:()=>false,fetchImpl:fake}),/supported UI/);
await assert.rejects(requestGeneratedUI('review',{validate:()=>true,fetchImpl:async()=>new Response('{}',{status:503})}),/not configured/);
await assert.rejects(requestGeneratedUI('review',{validate:()=>true,fetchImpl:async()=>new Response('not json')}),/valid UI/);
await assert.rejects(requestGeneratedUI('review',{validate:()=>true,fetchImpl:async()=>new Response(JSON.stringify({source:'mock',spec}))}),/supported UI/);
console.log('Same-origin request, validation, missing configuration, malformed payload and no mock fallback pass.');

let cancelled=false;const oversized=new Response(new ReadableStream({start(controller){controller.enqueue(new Uint8Array(65537));},cancel(){cancelled=true;}}));
await assert.rejects(requestGeneratedUI('review',{fetchImpl:async()=>oversized}),/safe size limit/);assert(cancelled);
console.log('Client streamed byte limit cancels oversized body before full allocation.');
