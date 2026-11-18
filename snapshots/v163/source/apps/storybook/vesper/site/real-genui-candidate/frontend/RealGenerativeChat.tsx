import {useEffect,useRef,useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {ChatComposer,ChatMessageList,ChatMessage,ChatMessageBubble} from '@astryxdesign/core/Chat';
import {GeneratedUIRenderer,type GeneratedSpec} from './GeneratedUIRenderer';
import {createUIController} from './controller.mjs';
// Unregistered candidate. Live mode must not be enabled without server auth/quota/provider.
export function RealGenerativeChat({configured=false}:{configured?:boolean}){
 const [draft,setDraft]=useState('');const [state,setState]=useState<{phase:string;prompt:string;spec:GeneratedSpec|null;error:string}>({phase:'idle',prompt:'',spec:null,error:''});
 const controller=useRef<ReturnType<typeof createUIController>|null>(null);
 useEffect(()=>{const c=createUIController({onChange:setState});controller.current=c;return()=>{c.dispose();controller.current=null;};},[]);
 const busy=state.phase==='waiting';
 const submit=(value:string)=>{if(!configured||busy||!value.trim())return;setDraft('');void controller.current?.submit(value);};
 return <div className="gc-study"><header className="gc-heading"><strong>Generate an interface</strong><span>{configured?'AI-powered':'Not connected'}</span></header><p className="gc-disclosure">{configured?'Your request is sent to OpenAI. Generated content needs review.':'Real generation needs an approved model connection. No simulated response is substituted.'}</p>
 <ChatMessageList density="compact">{state.prompt&&<ChatMessage sender="user"><ChatMessageBubble name="You">{state.prompt}</ChatMessageBubble></ChatMessage>}{state.phase==='ready'&&state.spec&&<ChatMessage sender="assistant"><ChatMessageBubble name="AI response" variant="ghost" width="100%"><GeneratedUIRenderer key={state.prompt} spec={state.spec}/></ChatMessageBubble></ChatMessage>}</ChatMessageList>
 <div role="status" aria-live="polite" aria-atomic="true">{busy?<span className="gc-building">Generating your interface…</span>:state.phase==='error'?state.error:state.phase==='stopped'?'Stopped. Your request is kept.':state.phase==='ready'?'Interface ready to review.':null}</div>
 {(state.phase==='error'||state.phase==='stopped')&&<Button label="Retry request" isDisabled={!configured} onClick={()=>void controller.current?.submit(state.prompt)}/>}
 <ChatComposer value={draft} onChange={setDraft} onSubmit={submit} placeholder="Describe the interface you need…" isDisabled={!configured||busy} isStopShown={busy} onStop={()=>controller.current?.stop()}/>
 <p className="gc-disclosure">Generated controls only change this page. Nothing is published or submitted elsewhere.</p></div>;
}
