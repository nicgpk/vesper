import fs from 'node:fs';import assert from 'node:assert/strict';import {transformSync} from 'esbuild';
import {isImeKeyEvent} from '../packages/core/dist/utils/ime.js';
const source=fs.readFileSync(process.env.SOURCE_FILE||'packages/core/src/Chat/ChatComposerInput.tsx','utf8');
const start=source.indexOf('(e: KeyboardEvent<HTMLDivElement>) => {',source.indexOf('const handleKeyDown'));
const end=source.indexOf('\n    },\n    [',start)+6;assert(start>=0&&end>start);
const code=transformSync('const handler='+source.slice(start,end),{loader:'ts'}).code;
let checks=0;
function setup({consume=false,prevent=false,token=false}={}){
 const calls=[];class Element{hasAttribute(){return true}};const tokenNode=new Element();const textNode={nodeType:3,textContent:' ',previousSibling:tokenNode,parentNode:{removeChild(){calls.push('remove')}}};
 const env={isDisabled:false,isImeKeyEvent,triggerMenu:{handleKeyDown(){calls.push('menu');return consume}},onKeyDownProp(e){calls.push('consumer');if(prevent)e.defaultPrevented=true;},Node:{TEXT_NODE:3},HTMLElement:Element,emitChange(){calls.push('emit')},window:{getSelection(){calls.push('selection');return token?{isCollapsed:true,rangeCount:1,getRangeAt:()=>({startContainer:textNode,startOffset:1})}:null}},editableRef:{current:{textContent:'draft'}},serialize:()=> 'draft',hasHistory:false,onSubmit:x=>calls.push('submit:'+x),setIsEmpty:()=>calls.push('empty'),onChange:x=>calls.push('change:'+x)};
 const handler=new Function(...Object.keys(env),code+';return handler')(...Object.values(env));
 return {calls,env,run(key,signal={}){handler({key,nativeEvent:signal,defaultPrevented:false,preventDefault(){calls.push('prevent')}})}};
}
for(const signal of [{isComposing:true},{keyCode:229}]){const h=setup({token:true});h.run('Backspace',signal);assert.deepEqual(h.calls,['consumer'],'IME must not remove adjacent token');checks++;}
{const h=setup({token:true});h.run('Backspace');assert.deepEqual(h.calls,['menu','consumer','selection','prevent','remove','remove','emit']);checks++;}
for(const signal of [{isComposing:true},{keyCode:229}])for(const consume of [false,true])for(const key of ['Enter','ArrowUp','ArrowDown','Backspace','Escape','Tab']){
 const h=setup({consume});h.run(key,signal);assert.deepEqual(h.calls,['consumer'],key);assert.equal(h.env.editableRef.current.textContent,'draft');checks++;
}
{const h=setup({consume:true});h.run('Enter');assert.deepEqual(h.calls,['menu']);checks++;}
{const h=setup({prevent:true});h.run('Enter');assert.deepEqual(h.calls,['menu','consumer']);checks++;}
{const h=setup();h.run('Backspace');assert.deepEqual(h.calls,['menu','consumer','selection']);checks++;}
{const h=setup();h.run('Enter');assert.deepEqual(h.calls,['menu','consumer','prevent','submit:draft','empty','change:']);assert.equal(h.env.editableRef.current.textContent,'');checks++;}
console.log(`PASS ${checks} actual-handler IME/ordinary command checks; synthetic source only.`);
