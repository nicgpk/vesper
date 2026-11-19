import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transformSync} from 'esbuild';
let checks=0;const eq=(a,b,m)=>{assert.equal(a,b,m);checks++};
const flush=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve()};
export function harness(name, sourceRoot=process.env.SOURCE_ROOT||new URL('../',import.meta.url)){
 const file=new URL(`packages/core/src/Chat/${name}.ts`,sourceRoot);
 const code=transformSync(fs.readFileSync(file,'utf8'),{loader:'ts',format:'cjs'}).code;
 const effects=[],requests=[],frames=new Map(),updates=[],recognitions=[];let next=0,speechOptions;
 class Recognition {constructor(){recognitions.push(this)}start(){}stop(){}abort(){}}
 const audio={createMediaStreamSource:()=>({connect(){},disconnect(){}}),createAnalyser:()=>({frequencyBinCount:8,getByteFrequencyData(){}})};
 const react={useRef:v=>({current:v}),useState:v=>[v,x=>updates.push(x)],useCallback:f=>f,useMemo:f=>f(),useEffect:f=>effects.push(f)};
 const ctx={module:{exports:{}},exports:{},require:n=>n==='react'?react:n.endsWith('useSpeechRecognition')?{useSpeechRecognition:o=>{speechOptions=o;return {abort(){},start(){},stop(){},toggle(){}}}}:{useLocale:()=> 'en',useTranslator:()=>x=>x},window:{SpeechRecognition:Recognition},navigator:{userAgent:'test',mediaDevices:{getUserMedia:()=>new Promise((resolve,reject)=>requests.push({resolve,reject}))}},requestAnimationFrame:f=>{frames.set(++next,f);return next},cancelAnimationFrame:i=>frames.delete(i)};
 vm.runInNewContext(code,ctx);const api=ctx.module.exports[name]({audioContext:audio});let cleanups=effects.map(f=>f());
 return {api,requests,frames,updates,audio,recognitions,start(){if(name==='useChatDictation')speechOptions.onStart();else {api.start();recognitions.at(-1).onstart()}},end(){if(name==='useChatDictation')speechOptions.onEnd();else recognitions.at(-1).onend()},cleanup(){cleanups.forEach(f=>f?.())},setup(){cleanups=effects.map(f=>f())},resolve(i){let stopped=0;requests[i].resolve({getTracks:()=>[{stop(){stopped++}}]});return ()=>stopped}};
}
for(const name of ['useChatDictation','useSpeechRecognition']){
 let h=harness(name);h.start();h.end();let stopped=h.resolve(0);await flush();eq(stopped(),1,name+' late end stops track');eq(h.frames.size,0,name+' late end no polling');
 h=harness(name);h.start();h.api.abort();stopped=h.resolve(0);await flush();eq(stopped(),1,name+' late abort stops track');eq(h.frames.size,0,name+' late abort no polling');
 h=harness(name);h.start();h.cleanup();h.setup();stopped=h.resolve(0);await flush();eq(stopped(),1,name+' cleanup replay invalidates media');eq(h.frames.size,0,name+' cleanup replay no polling');
 h=harness(name);h.start();stopped=h.resolve(0);await flush();eq(h.frames.size,1,name+' active polling');const frame=[...h.frames.values()][0];h.end();eq(stopped(),1,name+' active end releases');eq(h.frames.size,0,name+' end cancels frame');const n=h.updates.length;frame();eq(h.updates.length,n,name+' stale queued frame no state');eq(h.frames.size,0,name+' stale frame no restart');
 h=harness(name);h.start();h.start();const old=h.resolve(0);await flush();eq(old(),1,name+' earlier start cleaned');eq(h.frames.size,0,name+' earlier start no loop');const current=h.resolve(1);await flush();eq(h.frames.size,1,name+' new start owns loop');h.cleanup();eq(current(),1,name+' current start cleanup');
 h=harness(name);h.audio.createAnalyser=()=>{throw Error('setup failure')};h.start();stopped=h.resolve(0);await flush();eq(stopped(),1,name+' setup failure releases tracks');eq(h.frames.size,0,name+' setup failure no loop');
 h=harness(name);h.start();h.requests[0].reject(Error('permission denied'));await flush();eq(h.frames.size,0,name+' denied media no loop');
}
console.log(`${checks} dictation lifecycle assertions passed (synthetic actual-source, no browser or microphone access).`);
