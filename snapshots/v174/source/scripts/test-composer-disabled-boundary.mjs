import fs from 'node:fs';import assert from 'node:assert/strict';import {transformSync} from 'esbuild';
const source=fs.readFileSync(process.env.SOURCE_FILE||'packages/core/src/Chat/ChatComposerInput.tsx','utf8');
function handler(name,signature,env){const start=source.indexOf(signature,source.indexOf('const '+name));const end=source.indexOf('\n    },\n    [',start)+6;const code=transformSync('const handler='+source.slice(start,end),{loader:'ts'}).code;return new Function(...Object.keys(env),code+';return handler')(...Object.values(env));}
let n=0;
for(const disabled of [true,false]){
 const calls=[];const env={isDisabled:disabled,triggerMenu:{handleKeyDown(){calls.push('menu');return true}},isImeKeyEvent:()=>false,onKeyDownProp(){calls.push('consumer')}};
 const fn=handler('handleKeyDown','(e: KeyboardEvent<HTMLDivElement>) => {',env);
 for(const key of ['Enter','ArrowUp','ArrowDown','Backspace','Escape','Tab']){calls.length=0;fn({key,nativeEvent:{}});assert.deepEqual(calls,disabled?[]:['menu']);n++;}
 const pasteCalls=[];const p=handler('handlePaste','(e: ClipboardEvent<HTMLDivElement>) => {',{isDisabled:disabled,editableRef:{current:{}},ensureCaretInside(){pasteCalls.push('caret')},tokens:{handlePaste(){pasteCalls.push('token');return false}},onFiles(){pasteCalls.push('files')}});
 p({preventDefault(){pasteCalls.push('prevent')},clipboardData:{files:[{}]}});assert.deepEqual(pasteCalls,disabled?['prevent']:['caret','token','prevent','files']);n++;
}
const inputStart=source.indexOf('() => {',source.indexOf('const handleInput ='));const inputEnd=source.indexOf('\n  }, [',inputStart)+4;
for(const disabled of [true,false]){const calls=[];const fn=new Function('isDisabled','emitChange','triggerMenu','return '+source.slice(inputStart,inputEnd))(disabled,()=>calls.push('change'),{handleInput:()=>calls.push('trigger')});fn();assert.deepEqual(calls,disabled?[]:['change','trigger']);n++;}
for(const deps of ['[isDisabled, emitChange, triggerMenu]','[isDisabled, hasHistory, onSubmit','[isDisabled, onFiles, onPasteProp'])assert(source.includes(deps));
console.log(`PASS ${n} disabled/enabled actual-handler checks; source/synthetic only.`);
