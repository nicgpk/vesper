import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export * from './vesper/site/ChatFeedbackRefinements';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};
let r=m.updateReaction([],'👍','add');eq(r.length,1);eq(r[0].count,1);eq(m.updateReaction(r,'👍','add'),r);eq(m.updateReaction(r,'👍','toggle'),[]);
eq(m.updateReaction([{emoji:'👍',count:2,isSelected:true}],'👍','toggle')[0].count,1);
let resolve,instances=[],states=[],words=[];
class Fake {
 static available(o){eq(o,{langs:['en-US'],processLocally:true});return new Promise(r=>resolve=r);}
 start(){eq(this.processLocally,true);this.onstart?.();}
 abort(){this.onend?.();}
 stop(){this.onend?.();}
}
Fake.prototype.processLocally=false;
const Wrap=class extends Fake {constructor(){super();instances.push(this);}};
let s=m.createLocalSession(Wrap,x=>states.push(x),x=>words.push(x));
const pending=s.start();eq(states.at(-1).phase,'checking');s.cancel();resolve('available');await pending;eq(instances.length,0);eq(states.at(-1).phase,'cancelled');
const p=s.start();resolve('available');await p;eq(states.at(-1).phase,'listening');instances[0].onresult({resultIndex:0,results:[{isFinal:true,0:{transcript:'hello'}}]});eq(words,['hello']);instances[0].onend();eq(states.at(-1).phase,'ended');instances[0].onstart();eq(states.at(-1).phase,'ended');
const q=s.start();resolve('available');await q;instances[1].onerror({error:'denied'});eq(states.at(-1).phase,'error');instances[1].onend();eq(states.at(-1).phase,'error');
const n=s.start();resolve('downloadable');await n;eq(states.at(-1).phase,'unavailable');eq(instances.length,2);
const d=s.start();s.dispose();const before=states.length;resolve('available');await d;eq(states.length,before);eq(instances.length,2);
for(const [id,C] of Object.entries(m.chatFeedbackOverrides)){const html=m.renderToString(m.createElement(C));assert(html.includes(id==='chat-reactions'?'Choose a reaction':'Dictation stays on your device'));count++;assert(html.length>400);count++;}
const source=readFileSync('apps/storybook/vesper/site/ChatFeedbackRefinements.tsx','utf8');
for(const text of ["'processLocally' in C.prototype","availability!=='available'","recognition.processLocally=true","session.dispose()","const text=value.trim();if(!text)return","<ChatEmojiPicker onSelect="]){assert(source.includes(text),text);count++;}
assert(!/\.install\(/.test(source));count++;assert(!source.includes('onAdd='));count++;
eq(m.localConstructor(),null);
assert(source.includes("if(busy)controller.current?.cancel();setReceipt(text);setDraft('');setStatus({phase:'idle',notice:'Draft added.',interim:''})"));count++;
assert(source.includes("C||receipt?status.notice"));count++;
console.log(count+' feedback assertions passed: fake on-device adapter lifecycle, no actual microphone, reactions, source safeguards, two SSR compositions.');
