import fs from 'node:fs';import ts from 'typescript';import assert from 'node:assert/strict';
const source=fs.readFileSync(process.argv[2]||'packages/core/src/Chat/useChatStreamScroll.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let n=0;const check=(a,b,label)=>{assert.equal(a,b,label);n++};
function setup(){
 const frames=new Map();let id=0;globalThis.requestAnimationFrame=f=>{frames.set(++id,f);return id};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 const listeners=new Map(),attrs=new Set();const el={scrollTop:0,scrollHeight:800,clientHeight:200,offsetHeight:200,toggleAttribute:(a,v)=>v?attrs.add(a):attrs.delete(a),removeAttribute:a=>attrs.delete(a),addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:(k)=>listeners.delete(k)};
 let effect;const react={useRef:v=>({current:v}),useState:v=>[v,()=>{}],useCallback:f=>f,useEffect:f=>effect=f};
 const ex={};new Function('exports','require',js)(ex,id=>id==='react'?react:{useMediaQuery:()=>false});
 const hook=ex.useChatStreamScroll({scrollRef:{current:el}});const flush=()=>{const batch=[...frames.values()];frames.clear();batch.forEach(f=>f())};
 return {hook,el,frames,listeners,attrs,flush,start:()=>effect()};
}
let h=setup(),cleanup=h.start();check(h.frames.size,1,'initial positioning queued');cleanup();check(h.frames.size,0,'cleanup cancels initial positioning');h.flush();check(h.el.scrollTop,0,'no jump after cleanup');check(h.listeners.size,0,'listeners removed');check(h.attrs.size,0,'following attribute removed');
h=setup();cleanup=h.start();h.flush();check(h.el.scrollTop,600,'normal initial jump retained');h.el.scrollHeight=1000;h.hook.scrollIfLocked();check(h.frames.size,1,'growth spring queued');cleanup();check(h.frames.size,0,'cleanup cancels spring');const top=h.el.scrollTop;h.flush();check(h.el.scrollTop,top,'no movement after cleanup');
cleanup=h.start();h.flush();h.el.scrollHeight=1200;h.hook.scrollIfLocked();check(h.frames.size,1,'spring can restart after setup replay');h.flush();check(h.el.scrollTop>800,true,'restarted spring moves');cleanup();check(h.frames.size,0,'active spring chain cancelled');cleanup();check(h.frames.size,0,'repeated cleanup safe');
h=setup();cleanup=h.start();h.hook.scrollToBottom();check(h.frames.size,2,'initial and spring both queued');cleanup();check(h.frames.size,0,'both owned frames cancelled');
h=setup();cleanup=h.start();h.flush();h.el.scrollHeight=1000;h.hook.scrollIfLocked();check(h.frames.size,1,'race setup has one spring');
h.hook.unlock();check(h.frames.size,0,'unlock cancels queued frame');h.hook.lock();check(h.frames.size,1,'relock starts only one chain');h.flush();check(h.frames.size,1,'one chain remains after tick');cleanup();check(h.frames.size,0,'cleanup cancels relocked chain');
h=setup();cleanup=h.start();h.flush();h.el.scrollHeight=1000;h.hook.scrollIfLocked();h.el.scrollTop=500;h.listeners.get('scroll')();check(h.frames.size,0,'upward reader scroll cancels spring');h.hook.lock();check(h.frames.size,1,'relock after reader scroll has one chain');h.flush();check(h.frames.size,1,'reader relock stays one chain');cleanup();check(h.frames.size,0,'reader relock cleanup leaves no frames');

h=setup();cleanup=h.start();h.flush();
for(let i=0;i<8;i++){
 h.el.scrollHeight+=200;h.hook.lock();h.flush();check(h.frames.size,1,'active chain before repeated unlock');
 if(i%2){h.el.scrollTop-=30;h.listeners.get('scroll')();}else h.hook.unlock();
 check(h.frames.size,0,'both unlock paths cancel after real tick');
 const parked=h.el.scrollTop;h.flush();check(h.el.scrollTop,parked,'canceled frame cannot move reader');
 h.hook.lock();h.hook.lock();check(h.frames.size,1,'repeated lock remains single chain');
}
cleanup();check(h.frames.size,0,'repeated cycles final cleanup');
h=setup();cleanup=h.start();h.flush();h.el.scrollHeight=1000;h.hook.scrollIfLocked();h.flush();h.hook.unlock();
h.el.scrollTop=800;h.listeners.get('scrollend')();check(h.frames.size,0,'scrollend relock does not create spring immediately');h.el.scrollHeight=1200;h.hook.scrollIfLocked();check(h.frames.size,1,'growth after scrollend relock single chain');cleanup();check(h.frames.size,0,'auto relock cleanup cancels');
h=setup();cleanup=h.start();h.flush();h.el.scrollHeight=1000;h.hook.scrollIfLocked();h.el.scrollHeight=700;h.el.scrollTop=500;h.listeners.get('scroll')();check(h.frames.size,1,'browser clamp onto bottom does not unlock');h.flush();check(h.frames.size,0,'clamped bottom spring settles');cleanup();
console.log(`${n} independent race checks passed; synthetic hooks/RAF, not mounted React/browser`);
