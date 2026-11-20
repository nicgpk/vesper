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
console.log(`${n} source-transpiled scroll cleanup checks passed; synthetic hooks/RAF, no mounted React/browser`);
