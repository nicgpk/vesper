import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transformSync} from 'esbuild';
let checks=0;const eq=(a,b,m)=>{assert.equal(a,b,m);checks++};
const flush=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve()};
export function harness(name, sourceRoot=process.env.SOURCE_ROOT||new URL('../',import.meta.url), options={}){
 const file=new URL(`packages/core/src/Chat/${name}.ts`,sourceRoot);
 const code=transformSync(fs.readFileSync(file,'utf8'),{loader:'ts',format:'cjs'}).code;
 const effects=[],requests=[],frames=new Map(),updates=[],recognitions=[];let next=0,speechOptions;
 class Recognition {constructor(){recognitions.push(this)}start(){}stop(){}abort(){}}
 const audio={createMediaStreamSource:()=>({connect(){},disconnect(){}}),createAnalyser:()=>({frequencyBinCount:8,getByteFrequencyData(){}})};
 const react={useRef:v=>({current:v}),useState:v=>[v,x=>updates.push(x)],useCallback:f=>f,useMemo:f=>f(),useEffect:f=>effects.push(f)};
 const ctx={module:{exports:{}},exports:{},require:n=>n==='react'?react:n.endsWith('useSpeechRecognition')?{useSpeechRecognition:o=>{speechOptions=o;return {abort(){},start(){},stop(){},toggle(){}}}}:{useLocale:()=> 'en',useTranslator:()=>x=>x},window:{SpeechRecognition:Recognition},navigator:{userAgent:'test',mediaDevices:{getUserMedia:()=>new Promise((resolve,reject)=>requests.push({resolve,reject}))}},requestAnimationFrame:f=>{frames.set(++next,f);return next},cancelAnimationFrame:i=>frames.delete(i)};
 vm.runInNewContext(code,ctx);const api=ctx.module.exports[name]({audioContext:audio,...options});let cleanups=effects.map(f=>f());
 return {speechOptions,api,requests,frames,updates,audio,recognitions,start(){if(name==='useChatDictation')speechOptions.onStart();else {api.start();recognitions.at(-1).onstart()}},end(){if(name==='useChatDictation')speechOptions.onEnd();else recognitions.at(-1).onend()},cleanup(){cleanups.forEach(f=>f?.())},setup(){cleanups=effects.map(f=>f())},resolve(i){let stopped=0;requests[i].resolve({getTracks:()=>[{stop(){stopped++}}]});return ()=>stopped}};
}

const event={resultIndex:0,results:[{0:{transcript:'hello'},isFinal:true}]};
for(const boundary of ['restart','abort','end','cleanup','replay']){
 const calls=[];const h=harness('useSpeechRecognition',undefined,{onResult:x=>calls.push(x),onTranscript:x=>calls.push(x),onError:x=>calls.push(x)});
 h.start();const old=h.recognitions[0];
 if(boundary==='restart')h.start();
 if(boundary==='abort')h.api.abort();
 if(boundary==='end')h.end();
 if(boundary==='cleanup'||boundary==='replay')h.cleanup();
 if(boundary==='replay')h.setup();
 const updates=h.updates.length;
 old.onresult(event);old.onerror({error:'network'});old.onnomatch();old.onspeechstart();old.onspeechend();
 eq(calls.length,0,boundary+' ignores old callbacks');eq(h.updates.length,updates,boundary+' ignores old state events');
}
{
 const calls=[];const h=harness('useSpeechRecognition',undefined,{onResult:x=>calls.push(x)});h.start();h.api.stop();h.recognitions[0].onresult(event);eq(calls.length,1,'graceful stop retains final result');
}
{
 let h;const calls=[];h=harness('useSpeechRecognition',undefined,{onResult:()=>h.api.abort(),onTranscript:()=>calls.push(1)});
 h.start();h.recognitions[0].onresult(event);eq(calls.length,0,'onResult abort suppresses transcript');
}
{
 const h=harness('useSpeechRecognition',undefined,{analyseAudio:false});h.start();eq(h.requests.length,0,'disabled analyser acquires no media');
 const wrapper=harness('useChatDictation');eq(wrapper.speechOptions.analyseAudio,false,'wrapper disables duplicate analyser');wrapper.start();eq(wrapper.requests.length,1,'wrapper owns one analyser');
}
console.log(checks+' speech event assertions passed (synthetic source only).');
