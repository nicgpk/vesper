import fs from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';
const compile=p=>ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let ro; globalThis.ResizeObserver=class {constructor(cb){this.cb=cb;ro=this} observe(){} unobserve(){} disconnect(){} };
const ob={};new Function('exports',compile('packages/core/src/utils/sharedResizeObserver.ts'))(ob);
let state=false,refs=[],cursor=0,effect,resize=0;
const react={useState:()=>[state,v=>state=v],useRef:v=>refs[cursor++]??(refs[cursor-1]={current:v}),useCallback:f=>f,useEffect:f=>effect=f};
const ex={};new Function('exports','require',compile(process.argv[2] || 'packages/core/src/Chat/useChatNewMessages.ts'))(ex,id=>id==='react'?react:ob);
const render=()=>{cursor=0;return ex.useChatNewMessages({isLocked:false,onResize:()=>resize++})};
let h=render();const elem=()=>({messages:[{}],getElementsByClassName(){return this.messages}});const a=elem(),b=elem();const fire=e=>ro.cb([{target:e}]);let n=0;const check=(v,w,msg)=>{assert.equal(v,w,msg);n++};
h.contentRef(a);check(state,false,'baseline before synchronous callback');check(resize,1,'initial callback retained');
a.messages.push({});fire(a);check(state,true,'append');h.contentRef(b);check(state,false,'new element resets');
a.messages.push({});fire(a);check(state,false,'old observer removed');b.messages.push({});fire(b);check(state,true,'new observer works');
h.contentRef(b);check(state,true,'same-element ref preserves unread');h.contentRef(null);fire(b);check(state,true,'detach prevents stale callback');h.contentRef(b);check(state,false,'reattach rebaselines');b.messages.push({});fire(b);check(state,true,'reattach keeps append detection');h.dismiss();check(state,false,'dismiss');
const cleanup=effect();cleanup();b.messages.push({});fire(b);check(state,false,'cleanup unsubscribes');
// Synthetic effect replay; not mounted React/StrictMode verification.
effect();b.messages.push({});fire(b);check(state,true,'effect replay restores observer');
h.dismiss();
b.messages.push({});fire(b);check(state,true,'unread before cleanup');
const cleanup2=effect();cleanup2();effect();check(state,true,'replay preserves existing unread');
h.dismiss();fire(b);check(state,false,'replay does not reannounce dismissed content');
let beforeResize=resize;effect();fire(b);check(resize,beforeResize+1,'setup while attached does not double subscribe');
h.contentRef(null);const cleanup3=effect();cleanup3();effect();b.messages.push({});fire(b);check(state,false,'detached content not resurrected');
const c=elem();h.contentRef(c);check(state,false,'late mount baseline');c.messages.push({});fire(c);check(state,true,'late mount detection');
// Independent extra cases: catch up changes during unsubscribed interval.
h.dismiss();
const stop=effect();stop();c.messages.push({});effect();
check(state,true,'setup immediately detects message arriving during cleanup gap');
h.dismiss();const stop2=effect();stop2();effect();check(state,false,'unchanged content remains dismissed after replay');
// Swap during cleanup: callback ref owns fresh subscription, setup must not duplicate it.
const stop3=effect();stop3();const d=elem();h.contentRef(d);
const before=resize;effect();fire(d);check(resize,before+1,'swap during cleanup has exactly one callback');
d.messages.push({});fire(d);check(state,true,'replacement remains observed');
h.dismiss();h.contentRef(null);const beforeDetach=resize;fire(d);check(resize,beforeDetach,'final ref detach silences replacement');
effect();check(resize,beforeDetach,'effect setup with null element remains silent');
console.log(`${n} independent replay checks pass using actual shared observer; no mounted React/browser`);
