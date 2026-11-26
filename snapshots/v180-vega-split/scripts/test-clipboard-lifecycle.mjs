import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transformSync} from 'esbuild';
const file=process.env.SOURCE_FILE||new URL('../packages/core/src/hooks/useClipboard.ts',import.meta.url);
const code=transformSync(fs.readFileSync(file,'utf8'),{loader:'ts',format:'cjs'}).code;
let checks=0;const eq=(a,b,msg)=>{assert.equal(a,b,msg);checks++};
function harness(){
 const effects=[], writes=[], updates=[], announcements=[], timers=new Map();let next=0;
 const react={useRef:v=>({current:v}),useState:v=>[v,x=>updates.push(x)],useCallback:f=>f,useEffect:f=>effects.push(f)};
 const ctx={module:{exports:{}},exports:{},require:n=>n==='react'?react:{useAnnounce:()=>v=>announcements.push(v)},navigator:{clipboard:{writeText:()=>new Promise((resolve,reject)=>writes.push({resolve,reject}))}},setTimeout:f=>{timers.set(++next,f);return next},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(code,ctx);const api=ctx.module.exports.useClipboard({announce:'Copied'});let cleanups=effects.map(f=>f());
 return {api,writes,updates,announcements,timers,cleanup(){cleanups.forEach(f=>f());},setup(){cleanups=effects.map(f=>f());},tick(){for(const [id,f]of [...timers]){timers.delete(id);f();}}};
}
let h=harness(),p=h.api.copy('a');h.cleanup();h.writes[0].resolve();eq(await p,true,'actual successful write result preserved');eq(h.updates.length,0,'late success must not update state');eq(h.announcements.length,0,'late success must not announce');eq(h.timers.size,0,'late success must not create orphan timer');
h=harness();p=h.api.copy('a');h.cleanup();h.setup();h.writes[0].resolve();eq(await p,true,'replay preserves result');eq(h.updates.length,0,'old lifecycle cannot update replayed consumer');eq(h.announcements.length,0,'old lifecycle cannot announce after replay');eq(h.timers.size,0,'old lifecycle cannot create timer after replay');
p=h.api.copy('b');h.writes[1].resolve();eq(await p,true,'new lifecycle succeeds');eq(h.updates.at(-1),true,'new lifecycle feedback');eq(h.announcements.length,1,'new lifecycle announces');eq(h.timers.size,1,'new lifecycle timer');h.tick();eq(h.updates.at(-1),false,'timer resets feedback');
h=harness();p=h.api.copy('a');h.writes[0].resolve();await p;const old=[...h.timers.values()][0];p=h.api.copy('b');h.writes[1].resolve();await p;eq(h.timers.size,1,'recopy replaces timer');h.cleanup();eq(h.timers.size,0,'cleanup clears timer');const count=h.updates.length;old();eq(h.updates.length,count,'obsolete timer cannot update unmounted consumer');
h=harness();p=h.api.copy('a');h.cleanup();h.writes[0].reject(new Error('denied'));eq(await p,false,'late rejection preserved');eq(h.updates.length,0,'rejection no update');eq(h.timers.size,0,'rejection no timer');
h=harness();h.cleanup();p=h.api.copy('a');h.setup();h.writes[0].resolve();eq(await p,true,'obsolete callback write retains result');eq(h.updates.length,0,'callback invoked while inactive cannot revive feedback');
console.log(checks+' clipboard lifecycle assertions passed; synthetic actual-source hook/timer harness, not mounted React/browser validation.');
