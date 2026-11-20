import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=process.cwd();
const {isImeKeyEvent}=await import(root+'/packages/core/dist/utils/ime.js');
const src=fs.readFileSync('packages/lab/src/CodeEditor/CodeEditor.tsx','utf8');
const start=src.indexOf('(e: React.KeyboardEvent<HTMLDivElement>) => {',src.indexOf('const handleKeyDown'));
const end=src.indexOf('\n    },\n    [',start)+6;
const body=src.slice(start,end).replace(': React.KeyboardEvent<HTMLDivElement>','');
let n=0;
function setup({readOnly=false,composing=false}={}){
 const calls=[]; const tab={current:false}; const comp={current:composing};
 const env={isReadOnly:readOnly,isComposingRef:comp,isImeKeyEvent,tabMovesFocusRef:tab,window:{getSelection(){calls.push('selection');return null}},MODE_NEUTRAL_KEYS:new Set(['Shift','Control','Alt','Meta','CapsLock']),AUTO_CLOSE_PAIRS:{'(':')','[':']','{':'}','"':'"',"'":"'",'`':'`'}};
 const fn=new Function(...Object.keys(env),'return ('+body+')')(...Object.values(env));
 const key=(k,extra={})=>fn({key:k,nativeEvent:{},preventDefault(){calls.push('preventDefault')},...extra});
 return {calls,tab,comp,key};
}
for(const signal of ['ref','native','legacy'])for(const k of ['Enter','Tab','Escape','(','[','{','"',"'",'`','ArrowDown']){
 const s=setup({composing:signal==='ref'});s.tab.current=true;
 s.key(k,{nativeEvent:{isComposing:signal==='native',keyCode:signal==='legacy'?229:0}});
 assert.deepEqual(s.calls,[]);assert.equal(s.tab.current,true);n++;
}
for(const shift of [false,true]){const s=setup();s.key('Escape');s.key('Shift');s.key('Tab',{shiftKey:shift});assert.equal(s.tab.current,false);assert.deepEqual(s.calls,[]);n++;}
{const s=setup();s.key('Escape',{defaultPrevented:true});assert.equal(s.tab.current,false);n++;}
{const s=setup();s.key('Escape');s.key('x');s.key('Tab');assert.deepEqual(s.calls,['preventDefault','selection']);n++;}
for(const k of ['Enter','Tab','Escape','(']){const s=setup({readOnly:true});s.key(k);assert.deepEqual(s.calls,[]);assert.equal(s.tab.current,false);n++;}
for(const k of ['Enter','Tab']){const s=setup({composing:true});s.key(k);s.comp.current=false;s.key(k);assert.deepEqual(s.calls,['preventDefault','selection']);n++;}
console.log(`${n} independent extracted-handler checks passed using compiled canonical IME helper; no mounted/DOM/browser verification`);
