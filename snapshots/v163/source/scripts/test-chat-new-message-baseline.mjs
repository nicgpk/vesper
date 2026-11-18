import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const file=process.argv[2] || 'packages/core/src/Chat/useChatNewMessages.ts';
const source=fs.readFileSync(file,'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
function setup(locked=false){
 const refs=[]; let cursor=0,state=false,resizeCount=0,active=null;
 const React={useRef:value=>refs[cursor++] || (refs[cursor-1]={current:value}), useState:()=>[state,v=>{state=v}],useCallback:f=>f,useEffect:()=>{}};
 const observer={observeResize(el,fn){active=fn;fn();return ()=>{active=null}}};
 const exports={};new Function('exports','require',js)(exports,id=>id==='react'?React:observer);
 const render=(isLocked=locked)=>{cursor=0;return exports.useChatNewMessages({isLocked,onResize:()=>resizeCount++})};
 const hook=render();return {hook,render,get flagged(){return state},get resizeCount(){return resizeCount},resize(){active?.()}};
}
const el=messages=>({messages,getElementsByClassName(){return this.messages}});
let checks=0;
const verify=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++};
const a={},b={},c={};
const h=setup(),content=el([a]);h.hook.contentRef(content);
verify(h.flagged,false,'existing conversation must not be announced as new');verify(h.resizeCount,1,'initial scroll measurement preserved');
h.resize();verify(h.flagged,false,'same content resize');content.messages.push(b);h.resize();verify(h.flagged,true,'unlocked append');
h.hook.dismiss();h.resize();verify(h.flagged,false,'dismissed append stays dismissed');
content.messages.push(c);h.resize();verify(h.flagged,true,'later append');
const other=el([{}]);h.hook.contentRef(other);verify(h.flagged,false,'swapping conversation clears stale flag');other.messages.push({});h.resize();verify(h.flagged,true,'new conversation append');
const empty=setup(),e=el([]);empty.hook.contentRef(e);verify(empty.flagged,false,'empty initial');e.messages.push({});empty.resize();verify(empty.flagged,true,'first actual message');
const locked=setup(true),l=el([{}]);locked.hook.contentRef(l);l.messages.push({});locked.resize();verify(locked.flagged,false,'locked append');locked.render(false);locked.resize();verify(locked.flagged,false,'unlock does not reannounce old append');l.messages.push({});locked.resize();verify(locked.flagged,true,'append after unlocking');
console.log(`${checks} hook/observer harness checks pass; no mounted React/browser verification`);
