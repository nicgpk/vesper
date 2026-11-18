import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transformSync} from 'esbuild';
const root=process.env.SOURCE_ROOT||new URL('../',import.meta.url);
let n=0;const eq=(a,b,m)=>{assert.equal(a,b,m);n++};
function harness(name='useSpeechRecognition', options={}) {
 const effects=[],recognitions=[],requests=[],updates=[],events=[];
 class Recognition {constructor(){recognitions.push(this)}start(){}stop(){}abort(){}}
 const react={useRef:v=>({current:v}),useState:v=>[v,x=>updates.push(x)],useCallback:f=>f,useMemo:f=>f(),useEffect:f=>effects.push(f)};
 const audio={createMediaStreamSource:()=>({connect(){},disconnect(){}}),createAnalyser:()=>({frequencyBinCount:8,getByteFrequencyData(){}})};
 const common={window:{SpeechRecognition:Recognition},navigator:{userAgent:'synthetic',mediaDevices:{getUserMedia:()=>new Promise(resolve=>requests.push(resolve))}},requestAnimationFrame:()=>1,cancelAnimationFrame(){}};
 const load=name=>{const code=transformSync(fs.readFileSync(new URL(`packages/core/src/Chat/${name}.ts`,root),'utf8'),{loader:'ts',format:'cjs'}).code;const ctx={...common,module:{exports:{}},exports:{},require:path=>path==='react'?react:path.endsWith('useSpeechRecognition')?load('useSpeechRecognition'):{useLocale:()=> 'en',useTranslator:()=>x=>x}};vm.runInNewContext(code,ctx);return ctx.module.exports};
 const api=load(name)[name]({audioContext:audio,onResult:t=>events.push('result:'+t),onTranscript:(t,f)=>events.push('transcript:'+t+':'+f),onError:e=>events.push('error:'+e.error),onEnd:()=>events.push('end'),...options});let cleanups=effects.map(f=>f());
 return {api,events,updates,requests,recognitions,start(){api.start();recognitions.at(-1).onstart();return recognitions.at(-1)},cleanup(){cleanups.forEach(f=>f?.())},setup(){cleanups=effects.map(f=>f())}};
}
const result=(text='hello',isFinal=true)=>({resultIndex:0,results:[{0:{transcript:text},isFinal,length:1}]});
const fire=r=>{r.onresult(result());r.onerror({error:'network'});r.onnomatch();r.onspeechstart();r.onspeechend()};
for(const terminal of ['replace','abort','end','cleanup','replay']){
 const h=harness();const old=h.start();
 if(terminal==='replace')h.start();if(terminal==='abort')h.api.abort();if(terminal==='end')old.onend();if(terminal==='cleanup'||terminal==='replay')h.cleanup();if(terminal==='replay')h.setup();
 const e=h.events.length,u=h.updates.length;fire(old);eq(h.events.length,e,terminal+' suppresses obsolete callbacks');eq(h.updates.length,u,terminal+' suppresses obsolete state');
}
{
 const h=harness();const r=h.start();h.api.stop();r.onresult(result());eq(h.events.join('|'),'result:hello|transcript:hello:true','graceful stop retains final result');r.onend();r.onend();eq(h.events.filter(e=>e==='end').length,1,'end callback occurs once');
}
for(const boundary of ['transformTranscript','onResult','onTranscript']){
 let h;const events=[];h=harness('useSpeechRecognition',{[boundary]:(text)=>{events.push(boundary);h.api.abort();return text}});const r=h.start();r.onresult({resultIndex:0,results:[{0:{transcript:'one'},isFinal:true,length:1},{0:{transcript:'two'},isFinal:true,length:1}]});eq(events.length,1,boundary+' abort suppresses subsequent result');if(boundary==='transformTranscript')eq(h.events.length,0,'transform abort suppresses consumer results');if(boundary==='onResult')eq(h.events.length,0,'result abort suppresses transcript callback');
}
{
 let h;h=harness('useSpeechRecognition',{onStart:()=>h.api.abort()});h.start();eq(h.requests.length,0,'reentrant start abort avoids analyser acquisition');
}
{
 const h=harness('useChatDictation');h.start();eq(h.requests.length,1,'composed actual hooks acquire only one analyser stream');h.api.abort();let stopped=0;h.requests[0]({getTracks:()=>[{stop(){stopped++}}]});await new Promise(resolve=>setImmediate(resolve));eq(stopped,1,'wrapper late analyser disposed after abort');
}
{
 const h=harness();h.start();eq(h.requests.length,1,'standalone retains default analyser');const disabled=harness('useSpeechRecognition',{analyseAudio:false});disabled.start();eq(disabled.requests.length,0,'explicit disabled analyser makes no request');
}
console.log(`${n} independent speech event assertions passed (actual-source synthetic hooks, no browser/microphone).`);
