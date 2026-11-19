// SPDX-License-Identifier: MIT
// Local compositions. Native controls and permissions remain unchanged.
import {useEffect, useRef, useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {ChatComposer, ChatDictationButton, ChatMessage, ChatMessageBubble, type UseSpeechRecognitionReturn} from '@astryxdesign/core/Chat';
import {ChatEmojiPicker, ChatReactionBar, type ChatReaction} from '@astryxdesign/lab';
import './chat-feedback-refinements.css';

export function updateReaction(previous: ChatReaction[], emoji: string, action: 'add'|'toggle') {
  const existing = previous.find(item => item.emoji === emoji);
  if (!existing) return [...previous, {emoji, count:1, isSelected:true}];
  if (action === 'add' && existing.isSelected) return previous;
  return previous.map(item => item.emoji !== emoji ? item : {...item, isSelected:!item.isSelected, count:item.count+(item.isSelected?-1:1)}).filter(item => item.count>0);
}
export function ReactionsRefinement() {
  const [reactions,setReactions]=useState<ChatReaction[]>([]);
  const [notice,setNotice]=useState('Choose a reaction. Select it again to undo.');
  const apply=(emoji:string, action:'add'|'toggle')=>{
    setReactions(previous=>updateReaction(previous,emoji,action));
    setNotice(action==='add' ? 'Reaction applied locally.' : 'Reaction selection updated locally.');
  };
  return <div className="cf-feedback">
    <ChatMessage sender="assistant"><ChatMessageBubble name="Design review">The shorter onboarding flow is ready for review.</ChatMessageBubble></ChatMessage>
    <div className="cf-reactions">
      <ChatReactionBar reactions={reactions} onToggle={emoji=>apply(emoji,'toggle')} />
      <ChatEmojiPicker onSelect={emoji=>apply(emoji,'add')}><Button label="React" variant="ghost" /></ChatEmojiPicker>
    </div>
    <p className="cf-status" role="status">{notice}</p>
    <small className="cf-note">Local interaction · not sent</small>
  </div>;
}
type Recognition = {
  processLocally:boolean;lang:string;continuous:boolean;interimResults:boolean;
  start():void;stop():void;abort():void;
  onstart:(()=>void)|null;onend:(()=>void)|null;
  onerror:((event:{error:string})=>void)|null;
  onresult:((event:{resultIndex:number;results:ArrayLike<{isFinal:boolean;0:{transcript:string}}>})=>void)|null;
};
export type LocalConstructor = {
  new():Recognition;prototype:Recognition;
  available(options:{langs:string[];processLocally:true}):Promise<string>;
};
export function localConstructor():LocalConstructor|null {
  if(typeof window==='undefined')return null;
  const browser=window as unknown as {SpeechRecognition?:LocalConstructor;webkitSpeechRecognition?:LocalConstructor};
  const C=browser.SpeechRecognition??browser.webkitSpeechRecognition;
  return C && 'processLocally' in C.prototype && typeof C.available==='function'?C:null;
}
export type DictationPhase='idle'|'checking'|'starting'|'listening'|'ended'|'cancelled'|'error'|'unavailable';
export type DictationStatus={phase:DictationPhase;notice:string;interim:string};
export const initialDictation:DictationStatus={phase:'idle',notice:'On-device English only. Requires an installed language pack; no downloads or cloud fallback.',interim:''};
// Session IDs invalidate late availability results and callbacks before aborting.
export function createLocalSession(C:LocalConstructor|null, emit:(s:DictationStatus)=>void, append:(text:string)=>void) {
  let run=0,alive=true,busy=false,instance:Recognition|null=null;
  const state=(phase:DictationPhase,notice:string,interim='')=>emit({phase,notice,interim});
  const cancel=()=>{++run;busy=false;const old=instance;instance=null;old?.abort();if(alive)state('cancelled','Dictation cancelled. Your draft is kept.');};
  return {
    cancel,
    dispose(){alive=false;cancel();},
    async start(){
      if(!alive||busy)return;
      if(!C){state('unavailable','On-device speech is unavailable. Type instead.');return;}
      const id=++run;busy=true;
      const current=()=>alive&&id===run;
      state('checking','Checking the installed English language pack…');
      try {
        const availability=await C.available({langs:['en-US'],processLocally:true});
        if(!current())return;
        if(availability!=='available'){busy=false;state('unavailable','English language pack unavailable. Type instead; no download or cloud fallback.');return;}
        const recognition=new C();instance=recognition;
        recognition.processLocally=true;recognition.lang='en-US';recognition.continuous=false;recognition.interimResults=true;
        recognition.onstart=()=>{if(current())state('listening','Listening on device. Cancel to stop.');};
        recognition.onend=()=>{if(!current())return;instance=null;busy=false;++run;state('ended','Dictation ended. Review your draft before adding it.');};
        recognition.onerror=()=>{if(!current())return;instance=null;busy=false;++run;recognition.abort();state('error','Local dictation could not continue. Check microphone permissions or type instead.');};
        recognition.onresult=event=>{
          if(!current())return;
          let interim='';
          for(let i=event.resultIndex;i<event.results.length;i++){
            const result=event.results[i];if(result.isFinal)append(result[0].transcript);else interim+=result[0].transcript;
          }
          state('listening','Listening on device. Cancel to stop.',interim);
        };
        state('starting','Starting on-device dictation…');
        recognition.start();
      }catch{
        if(!current())return;
        const old=instance;instance=null;busy=false;++run;old?.abort();
        state('error','Local dictation could not start. Check permissions or type instead.');
      }
    },
  };
}
export function DictationRefinement() {
  const [draft,setDraft]=useState(''),[receipt,setReceipt]=useState('');
  const [status,setStatus]=useState(initialDictation);
  const controller=useRef<ReturnType<typeof createLocalSession>|null>(null);
  const C=localConstructor();
  useEffect(()=>{
    const session=createLocalSession(C,setStatus,text=>setDraft(previous=>previous+(previous?' ':'')+text));
    controller.current=session;
    return()=>{session.dispose();controller.current=null;};
  },[C]);
  const busy=['checking','starting','listening'].includes(status.phase);
  const dictation:UseSpeechRecognitionReturn={
    isSupported:C!==null,isListening:status.phase==='listening',isSpeaking:!!status.interim,
    interimTranscript:status.interim,volume:0,bands:[],rawBands:[],
    start:()=>{void controller.current?.start();},
    stop:()=>controller.current?.cancel(),abort:()=>controller.current?.cancel(),
    toggle:()=>{if(busy)controller.current?.cancel();else void controller.current?.start();},
  };
  return <div className="cf-feedback">
    <p className="cf-status" role="status">{C||receipt?status.notice:'On-device speech is unavailable in this browser. The microphone stays disabled; type instead.'}</p>
    <ChatComposer value={draft} onChange={setDraft}
      onSubmit={value=>{const text=value.trim();if(!text)return;if(busy)controller.current?.cancel();setReceipt(text);setDraft('');setStatus({phase:'idle',notice:'Message added locally. Not delivered.',interim:''});}}
      placeholder="Write a note…"
      sendActions={busy ? <Button label={status.phase==='checking'?'Cancel check':'Cancel dictation'} variant="ghost" onClick={()=>controller.current?.cancel()} /> : <ChatDictationButton dictation={dictation} isHiddenWhenUnsupported={false} label="Start local dictation" />} />
    {status.interim&&<p className="cf-status">Interim: {status.interim}</p>}
    {receipt&&<ChatMessage sender="user"><ChatMessageBubble name="Local draft">{receipt}</ChatMessageBubble></ChatMessage>}
    <small className="cf-note">Local only · no cloud recognition or language downloads. Microphone starts only when pressed; nothing is sent.</small>
  </div>;
}
export const chatFeedbackOverrides={'chat-reactions':ReactionsRefinement,'chat-dictation':DictationRefinement};
