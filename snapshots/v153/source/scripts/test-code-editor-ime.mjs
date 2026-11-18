import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync('packages/lab/src/CodeEditor/CodeEditor.tsx','utf8');
const start=source.indexOf('(e: React.KeyboardEvent<HTMLDivElement>) => {',source.indexOf('const handleKeyDown'));
const end=source.indexOf('\n    },\n    [',start)+6;
assert(start>=0&&end>start);
const code=source.slice(start,end).replace(': React.KeyboardEvent<HTMLDivElement>','');
const ime=fs.readFileSync('packages/core/src/utils/ime.ts','utf8');
assert(ime.includes('event.isComposing === true || event.keyCode === IME_PROCESSING_KEY_CODE'));
let checks=0;
for(const key of ['Enter','Tab','Escape','(', '"']) for(const signal of ['ref','native','legacy']) {
 const events=[];
 const env={isReadOnly:false,isComposingRef:{current:signal==='ref'},isImeKeyEvent:e=>e.isComposing===true||e.keyCode===229,tabMovesFocusRef:{current:false},window:{getSelection(){events.push('selection');return null}},MODE_NEUTRAL_KEYS:new Set(),AUTO_CLOSE_PAIRS:{'(':')','"':'"'},editorRef:{current:null},onChange:()=>events.push('change')};
 const fn=new Function(...Object.keys(env),'return ('+code+');')(...Object.values(env));
 fn({key,nativeEvent:{isComposing:signal==='native',keyCode:signal==='legacy'?229:0},preventDefault:()=>events.push('preventDefault')});
 assert.deepEqual(events,[],`${key}/${signal}`);assert.equal(env.tabMovesFocusRef.current,false);checks++;
}
const tabMovesFocusRef={current:false};
const fn=new Function('isReadOnly','isComposingRef','isImeKeyEvent','tabMovesFocusRef','return ('+code+');')(false,{current:false},()=>false,tabMovesFocusRef);
fn({key:'Escape',nativeEvent:{},defaultPrevented:false});assert.equal(tabMovesFocusRef.current,true);checks++;
console.log(`${checks} extracted-handler IME checks pass; no mounted/browser verification`);
