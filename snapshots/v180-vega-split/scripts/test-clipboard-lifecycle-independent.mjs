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
let h=harness(); const old=h.api.copy('old'); h.cleanup();h.setup();const fresh=h.api.copy('new');h.writes[1].resolve();eq(await fresh,true,'new write succeeds first');eq(h.timers.size,1,'new feedback timer pending');h.writes[0].resolve();eq(await old,true,'old write actual result remains true');eq(h.updates.length,1,'late old result cannot add update');eq(h.announcements.length,1,'late old result cannot announce');eq(h.timers.size,1,'late old result preserves new timer');h.tick();eq(h.updates.at(-1),false,'new timer still resets');
h=harness();const success=h.api.copy('success'),failure=h.api.copy('failure');h.writes[0].resolve();await success;h.writes[1].reject(new Error('denied'));eq(await failure,false,'rejection remains false');eq(h.updates.length,1,'rejection does not clear successful feedback');eq(h.timers.size,1,'rejection preserves successful timer');h.cleanup();eq(h.timers.size,0,'cleanup cancels surviving timer');
console.log(checks+' independent clipboard assertions passed; synthetic source harness, no mounted React/browser verification.');
