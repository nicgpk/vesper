import assert from 'node:assert/strict';
import {harness} from './test-dictation-lifecycle.mjs';
const flush=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve()};
let h=harness('useSpeechRecognition');
h.api.start();const old=h.recognitions[0];h.api.abort();old.onstart();
console.log('abort-before-start pending media requests:',h.requests.length);
assert.equal(h.requests.length,0,'aborted recognition must not begin media polling from a late onstart');
let assertions=1;
const eq=(a,b,m)=>{assert.equal(a,b,m);assertions++};
for(const name of ['useChatDictation','useSpeechRecognition']){
 h=harness(name);h.start();h.start();const latest=h.resolve(1);await flush();eq(h.frames.size,1,name+' latest acquisition accepted first');const stale=h.resolve(0);await flush();eq(stale(),1,name+' out of order acquisition discarded');eq(latest(),0,name+' current stream not discarded');eq(h.frames.size,1,name+' only current polling chain');
 if(name==='useSpeechRecognition'){h.recognitions[0].onend();eq(h.frames.size,1,'obsolete recognizer end must not stop current polling');eq(latest(),0,'obsolete recognizer end preserves current track');}
 h.cleanup();eq(latest(),1,name+' current stream released on cleanup');
 h=harness(name);h.start();const released=h.resolve(0);await flush();const oldFrame=[...h.frames.values()][0];h.cleanup();h.setup();const count=h.updates.length;oldFrame();eq(h.frames.size,0,name+' replay cannot restart obsolete frame');eq(h.updates.length,count,name+' replay old frame cannot set state');eq(released(),1,name+' cleanup release once');
 h=harness(name);h.audio.createMediaStreamSource=()=>{throw Error('unavailable context')};h.start();const setupFailure=h.resolve(0);await flush();eq(setupFailure(),1,name+' source creation failure releases track');eq(h.frames.size,0,name+' source failure no polling');
}
h=harness('useSpeechRecognition');h.api.start();const stoppedBeforeStart=h.recognitions[0];h.api.stop();stoppedBeforeStart.onstart();eq(h.requests.length,0,'stop before onstart prevents media acquisition');stoppedBeforeStart.onend();eq(h.updates.at(-1).length,5,'stopped session still processes onend cleanup');h.start();eq(h.requests.length,1,'fresh recognition works after stop');const afterStop=h.resolve(0);await flush();eq(h.frames.size,1,'fresh recognition polls after stop');h.cleanup();eq(afterStop(),1,'fresh recognition cleans up');
console.log(`${assertions} independent dictation assertions passed; synthetic source-only checks.`);
