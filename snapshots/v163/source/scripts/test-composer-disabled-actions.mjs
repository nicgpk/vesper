import fs from 'node:fs';
import assert from 'node:assert/strict';
import {parse} from '@babel/parser';
import {transformSync} from 'esbuild';
const root=process.env.SOURCE_ROOT||'packages/core/src/Chat';
const input=fs.readFileSync(`${root}/ChatComposerInput.tsx`,'utf8');
const menu=fs.readFileSync(`${root}/useTriggerMenu.tsx`,'utf8');
function find(source,predicate){let found;function walk(n){if(!n||typeof n!=='object'||found)return;if(predicate(n)){found=n;return;}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else walk(v);}walk(parse(source,{sourceType:'module',plugins:['typescript','jsx']}));assert(found);return found;}
function compile(source,node,env){const code=transformSync('const fn='+source.slice(node.start,node.end),{loader:'tsx'}).code;return new Function(...Object.keys(env),code+';return fn')(...Object.values(env));}
function callback(source,name,env){return compile(source,find(source,n=>n.type==='VariableDeclarator'&&n.id.name===name).init.arguments[0],env);}
let checks=0;
const disabledRef={current:true};let calls=[];
const env={disabledRef,editableRef:{current:{}},state:{activeTrigger:{onSelect(){calls.push('select');return 'text'}}},removeAnchorSpan(){calls.push('remove-anchor')},deleteTriggerText(){calls.push('delete')},triggerStartRef:{current:0},onInsertText(){calls.push('text')},onInsertToken(){calls.push('token')},onEmitChange(){calls.push('change')},reset(){calls.push('reset')}};
const select=callback(menu,'selectItem',env);
select({});assert.deepEqual(calls,[]);checks++;
disabledRef.current=false;select({});assert.deepEqual(calls,['remove-anchor','delete','select','text','change','reset']);checks++;
disabledRef.current=true;calls=[];select({});assert.deepEqual(calls,[]);checks++;
for(const name of ['handleInput','handleKeyDown','renderMenu']){const fn=callback(menu,name,{disabledRef});assert.equal(fn({}),name==='handleKeyDown'?false:name==='renderMenu'?null:undefined);checks++;}
const insertToken=compile(input,find(input,n=>n.type==='AssignmentExpression'&&n.left.type==='MemberExpression'&&n.left.object.name==='insertTokenRef').right,{disabledRef,tokens:{insertToken(){calls.push('insert');return 'id'}},emitChange(){calls.push('emit')}});
const insertText=callback(input,'insertText',{disabledRef,insertTextWithoutEmit(){calls.push('text')},emitChange(){calls.push('emit')}});
const handle=find(input,n=>n.type==='VariableDeclarator'&&n.id.name==='handle').init;
const expand=compile(input,handle.properties.find(p=>p.key.name==='expandToken').value,{disabledRef,tokens:{expandToken(){calls.push('expand')}}});
for(const [fn,enabled] of [[insertToken,['insert','emit']],[insertText,['text','emit']],[expand,['expand']]]){for(const disabled of [true,false,true]){disabledRef.current=disabled;calls=[];fn('x');assert.deepEqual(calls,disabled?[]:enabled);checks++;}}
for(const name of ['focusEditable','focusEditableAtEnd']){disabledRef.current=true;callback(input,name,{disabledRef})();checks++;}
// Effect's transition fence prevents repeated reset when callback identity changes.
const effect=find(menu,n=>n.type==='CallExpression'&&n.callee.name==='useEffect'&&menu.slice(n.start,n.end).includes('wasDisabledRef.current'));
const previous={current:false};calls=[];
for(const disabled of [false,true,true,false,true])compile(menu,effect.arguments[0],{isDisabled:disabled,wasDisabledRef:previous,reset(){calls.push('reset')}})();
assert.deepEqual(calls,['reset','reset']);checks++;
assert(input.includes('onExpand={isDisabled ? undefined : () => handle.expandToken(id)}'));
assert(menu.includes('!isDisabled && state.isActive && popover.isOpen'));
console.log(`PASS ${checks} source-extracted disabled action/transition checks; not mounted React.`);
