// SPDX-License-Identifier: MIT
// Deterministic local generative-UI demonstration. No model or service calls.
import {useEffect,useReducer,useState,useRef} from 'react';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {hasReviewerReference} from './ChatRefinements';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Selector} from '@astryxdesign/core/Selector';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {ChatComposer,ChatComposerInput,ChatComposerDrawer,ChatComposerTokenElement,type ChatComposerInputHandle,type ChatComposerToken,ChatMessage,ChatMessageBubble,ChatMessageList,ChatToolCalls} from '@astryxdesign/core/Chat';
import {InlineTokenUsage} from './TokenUsageStudy';
import {usageExamples} from './token-usage';
import type {Demo} from './demos';
import './generative-chat-study.css';
export type GeneratedKind='checklist'|'directions'|'metrics'|'brief'|'unsupported';
export function classifyLocalPrompt(prompt:string):GeneratedKind{
 if(/\b(checklist|tasks|launch|release)\b/i.test(prompt))return 'checklist';
 if(/\b(compare|directions|concepts|options)\b/i.test(prompt))return 'directions';
 if(/\b(metrics|chart|funnel|data)\b/i.test(prompt))return 'metrics';
 if(/\b(brief|form|review plan)\b/i.test(prompt))return 'brief';
 return 'unsupported';
}
export const generatedTasks=['Check the reading contrast','Review the mobile layout','Confirm keyboard navigation','Share the approved direction'] as const;
export type GeneratedState={prompt:string;kind:GeneratedKind;phase:'ready'|'building'|'stopped'|'error';run:number;simulateFailure:boolean;step:number;briefTitle:string;priority:string;kept:boolean;checked:boolean[];choice:string|null};
export const initialGeneratedState:GeneratedState={prompt:'Make a launch checklist',kind:'checklist',phase:'ready',run:0,simulateFailure:false,step:0,briefTitle:'Onboarding review',priority:'normal',kept:false,checked:[false,false,false,false],choice:null};
type Action={type:'submit';prompt:string;simulateFailure?:boolean}|{type:'retry'}|{type:'advance';run:number;step:number}|{type:'title';value:string}|{type:'priority';value:string}|{type:'keep'}|{type:'finish';run:number}|{type:'stop'}|{type:'check';index:number;value:boolean}|{type:'choose';choice:string};
export function generatedReducer(s:GeneratedState,a:Action):GeneratedState{
 if(a.type==='submit'){if(!a.prompt.trim()||s.phase==='building')return s;return {...initialGeneratedState,prompt:a.prompt.trim(),kind:classifyLocalPrompt(a.prompt),phase:'building',run:s.run+1,simulateFailure:a.simulateFailure===true};}
 if(a.type==='advance')return s.phase==='building'&&a.run===s.run&&a.step===s.step+1&&a.step<=2?{...s,step:a.step}:s;
 if(a.type==='finish')return s.phase==='building'&&a.run===s.run?{...s,phase:s.simulateFailure?'error':'ready'}:s;
 if(a.type==='stop')return s.phase==='building'?{...s,phase:'stopped',run:s.run+1}:s;
 if(a.type==='retry')return s.phase==='error'?{...s,phase:'building',run:s.run+1,simulateFailure:false,step:0}:s;
 if(s.phase!=='ready')return s;
 if(a.type==='title'&&s.kind==='brief')return {...s,briefTitle:a.value,kept:false};
 if(a.type==='priority'&&s.kind==='brief'&&['normal','high'].includes(a.value))return {...s,priority:a.value,kept:false};
 if(a.type==='keep'&&s.kind==='brief'&&s.briefTitle.trim())return {...s,kept:true};
 if(a.type==='check'&&s.kind==='checklist'&&Number.isInteger(a.index)&&a.index>=0&&a.index<generatedTasks.length)return {...s,checked:s.checked.map((v,i)=>i===a.index?a.value:v)};
 if(a.type==='choose'&&s.kind==='directions'&&['focus','canvas'].includes(a.choice))return {...s,choice:a.choice};
 return s;
}
export function GeneratedResult({state,send}:{state:GeneratedState;send:(a:Action)=>void}){
 const count=state.checked.filter(Boolean).length;
 if(state.kind==='checklist')return <section className="gc-result" aria-label="Editable launch checklist"><header><strong>Ready for release</strong><span role="status">{count} / {generatedTasks.length} done</span></header><div className="gc-progress" role="progressbar" aria-label="Checklist completion" aria-valuemin={0} aria-valuemax={generatedTasks.length} aria-valuenow={count}><i style={{width:`${count/generatedTasks.length*100}%`}}/></div><div className="gc-tasks">{generatedTasks.map((task,index)=><CheckboxInput key={task} label={task} value={state.checked[index]} onChange={value=>send({type:'check',index,value})}/>)}</div><p className="gc-outcome" role="status">{count===generatedTasks.length?'Checklist complete.':''}</p></section>;
 if(state.kind==='directions')return <section className="gc-result" aria-label="Choose a visual direction"><header><strong>Two ways forward</strong></header><div className="gc-directions">{[{id:'focus',name:'Quiet focus',image:'dunes-ridge',text:'Warm scenery. One clear reading column.'},{id:'canvas',name:'Open canvas',image:'nature-ocean',text:'Cool scenery. More room to explore.'}].map(item=><div className="gc-direction" key={item.id} data-selected={state.choice===item.id}><img src={`assets/${item.image}-384.webp`} srcSet={`assets/${item.image}-384.webp 384w, assets/${item.image}-768.webp 768w, assets/${item.image}.webp 1536w`} sizes="(max-width:480px) 30vw, 270px" decoding="async" alt="" width="1536" height="1024" loading="lazy"/><div><strong>{item.name}</strong><p>{item.text}</p><Button label={state.choice===item.id?'Selected':'Choose'} aria-label={`Choose ${item.name}`} size="sm" variant={state.choice===item.id?'primary':'secondary'} aria-pressed={state.choice===item.id} onClick={()=>send({type:'choose',choice:item.id})}/></div></div>)}</div><p className="gc-outcome" role="status">{state.choice?`${state.choice==='focus'?'Quiet focus':'Open canvas'} selected for review.`:''}</p></section>;
 if(state.kind==='metrics')return <section className="gc-result" aria-label="Review funnel"><header><strong>Where reviews slow down</strong></header><div className="gc-metric-layout"><div className="gc-metric-total"><strong>60<span>%</span></strong><span>reach the final step</span></div><div className="gc-bars">{[{label:'Started',value:120},{label:'Reached review',value:84},{label:'Finished',value:72}].map(row=><div key={row.label}><span>{row.label}<strong>{row.value}</strong></span><div aria-hidden="true"><i style={{width:`${row.value/120*100}%`}}/></div></div>)}</div></div><p className="gc-outcome">The largest drop is before review: 36 of 120 starts.</p></section>;
 if(state.kind==='brief')return <section className="gc-result" aria-label="Editable review brief"><header><strong>Shape the next review</strong></header><div className="gc-brief-fields"><TextInput label="Review title" value={state.briefTitle} onChange={value=>send({type:'title',value})}/><Selector label="Priority" value={state.priority} onChange={value=>send({type:'priority',value})} options={[{value:'normal',label:'Normal'},{value:'high',label:'High'}]}/></div><Button label={state.kept?'Brief kept':'Keep this brief'} variant="primary" isDisabled={!state.briefTitle.trim()||state.kept} onClick={()=>send({type:'keep'})}/><p className="gc-outcome" role="status">{state.kept?`${state.briefTitle.trim()} · ${state.priority==='high'?'High':'Normal'} priority.`:''}</p></section>;
 return <p className="gc-outcome">Ask for a checklist, compare directions, summarize data or draft a review brief.</p>;
}
export function ResponseSkeleton({kind}:{kind:GeneratedKind}){
 const line=(width='70%')=><i className="gc-bone" style={{width}}/>;
 return <section className="gc-result gc-sized-skeleton" aria-hidden="true"><header>{line('45%')}{line('20%')}</header>{kind==='checklist'?<><div className="gc-progress"/><div className="gc-tasks">{generatedTasks.map((task,index)=><div className="gc-skeleton-check" key={task}><i className="gc-bone gc-bone-check"/>{line(`${[78,65,84,70][index]}%`)}</div>)}</div>{line('75%')}</>:kind==='directions'?<><div className="gc-directions">{[0,1].map(index=><div className="gc-direction" key={index}><i className="gc-bone gc-bone-image"/><div>{line('65%')}<div className="gc-bone-copy">{line('100%')}{line('80%')}</div><i className="gc-bone gc-bone-button"/></div></div>)}</div>{line('85%')}</>:kind==='metrics'?<><div className="gc-metric-layout"><div className="gc-metric-total"><i className="gc-bone gc-bone-number"/>{line('42%')}</div><div className="gc-bars">{[100,70,60].map(width=><div key={width}><span>{line('40%')}{line('10%')}</span><div><i className="gc-bone" style={{width:`${width}%`}}/></div></div>)}</div></div><div className="gc-bone-copy">{line('100%')}{line('88%')}</div></>:<><div className="gc-brief-fields"><div className="gc-skeleton-field">{line('30%')}<i className="gc-bone gc-bone-field"/></div><div className="gc-skeleton-field">{line('20%')}<i className="gc-bone gc-bone-field"/></div></div><i className="gc-bone gc-bone-button"/>{line('90%')}</>}</section>;
}
export const generatedLabels:Record<GeneratedKind,string>={checklist:'Checklist',directions:'Visual directions',metrics:'Data summary',brief:'Review brief',unsupported:'Supported response'};
export const buildTimings=[850,1700,2800] as const;
export function GeneratedResponse({state,send}:{state:GeneratedState;send:(a:Action)=>void}){
 const name=`Build ${generatedLabels[state.kind].toLowerCase()}`;
 if(state.phase==='building')return <div className="gc-response gc-loading" aria-busy="true">
  <div className="gc-loading-meta">
   <div className="gc-stage-line"><span className="gc-building">{['Matching your request','Shaping the response','Preparing controls'][state.step]}</span><span className="gc-stage-count">{state.step+1} of 3</span></div>
   <div className="gc-stage-track" aria-hidden="true">{[0,1,2].map(index=><i key={index} data-state={index<state.step?'done':index===state.step?'active':'next'}/>)}</div>
  </div>
  <ResponseSkeleton kind={state.kind}/>
 </div>;
 if(state.phase==='error')return <div className="gc-response"><ChatToolCalls label="Response preparation" defaultIsExpanded calls={[{key:'build',name,status:'error',errorMessage:'Unable to prepare a response.'}]}/><div className="gc-recovery"><strong>Your request is still here.</strong><p>Retry to use the same request.</p><Button label="Retry response" variant="primary" onClick={()=>send({type:'retry'})}/></div></div>;
 if(state.phase==='stopped')return <p className="gc-outcome">Stopped. Choose a prompt to try again.</p>;
 return <div className="gc-response"><GeneratedResult state={state} send={send}/></div>;
}
const reviewer:ChatComposerToken={value:'@Riley',label:'Riley',variant:'neutral'};
const composerConfig={namespace:'GeneratedReviewComposer',onError(error:Error){throw error;}};
export function GenerativeChatStudy(){
 const input=useRef<ChatComposerInputHandle>(null);const [focused,setFocused]=useState(false);
 const [state,send]=useReducer(generatedReducer,initialGeneratedState);const [draft,setDraft]=useState('');const busy=state.phase==='building';
 useEffect(()=>{if(!busy)return;const run=state.run;const timers=[setTimeout(()=>send({type:'advance',run,step:1}),buildTimings[0]),setTimeout(()=>send({type:'advance',run,step:2}),buildTimings[1]),setTimeout(()=>send({type:'finish',run}),buildTimings[2])];return()=>timers.forEach(timer=>clearTimeout(timer));},[busy,state.run]);
 const submit=(prompt:string)=>{if(!prompt.trim()||busy)return;send({type:'submit',prompt});setDraft('');};
 return <LexicalComposer initialConfig={composerConfig}><div className="gc-study"><header className="gc-heading"><strong>A reply you can use</strong></header><span className="gc-announcement" role="status" aria-live="polite" aria-atomic="true">{busy?`Building ${generatedLabels[state.kind].toLowerCase()}, stage ${state.step+1} of 3`:state.phase==='stopped'?'Stopped':state.phase==='error'?'Response unavailable. You can retry.':state.kind==='unsupported'?'Try one of the suggested prompts':`${generatedLabels[state.kind]} ready to use`}</span><ChatMessageList className="gc-thread" density="compact" align="top"><ChatMessage sender="user"><ChatMessageBubble name="You">{state.prompt}</ChatMessageBubble></ChatMessage><ChatMessage sender="assistant" name="Assistant"><GeneratedResponse state={state} send={send}/></ChatMessage></ChatMessageList><div className="gc-prompts" aria-label="Suggested prompts"><Button label="Make a checklist" size="sm" variant="ghost" isDisabled={busy} onClick={()=>submit('Make a launch checklist')}/><Button label="Compare directions" size="sm" variant="ghost" isDisabled={busy} onClick={()=>submit('Compare two visual directions')}/><Button label="Show data summary" size="sm" variant="ghost" isDisabled={busy} onClick={()=>submit('Show the review funnel')}/><Button label="Draft a brief" size="sm" variant="ghost" isDisabled={busy} onClick={()=>submit('Draft a review brief')}/><Button label="Try again" size="sm" variant="ghost" isDisabled={busy} onClick={()=>submit(state.prompt)}/><Button label="Compare archived directions" size="sm" variant="ghost" isDisabled={busy} onClick={()=>{send({type:'submit',prompt:'Compare archived directions',simulateFailure:true});setDraft('');}}/></div><div onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false);}}><ChatComposer className="gc-composer" density={focused||draft.trim()?"balanced":"compact"} input={<ChatComposerInput label="Generate a response" handleRef={input} pasteAsToken={false}/>} drawer={hasReviewerReference(draft)?<ChatComposerDrawer count={1} label="Reviewer reference"><ChatComposerTokenElement token={reviewer}/></ChatComposerDrawer>:undefined} footerActions={focused||draft.trim()?<Button label="Mention Riley" variant="ghost" isDisabled={busy} onClick={()=>{input.current?.focus();input.current?.insertToken(reviewer);}}/>:undefined} value={draft} onChange={setDraft} placeholder="Ask for a checklist, directions, data or a brief…" onSubmit={submit} isStopShown={busy} onStop={()=>send({type:'stop'})} isDisabled={busy}/></div>{state.phase==='ready'&&state.kind!=='unsupported'&&<div className="gc-composer-meta"><InlineTokenUsage key={state.run} usage={state.run===0?usageExamples.first:usageExamples.followup}/></div>}</div></LexicalComposer>;
}
export const generativeChatDemo:Demo={id:'chat-generative-ui',name:'Generative UI in chat',category:'Chat',description:'Turn a request into a checklist, a comparison, a data summary or an editable brief.',material:'Interactive responses with progress, cancellation and retry.',code:"import {GenerativeChatStudy} from './GenerativeChatStudy';\n<GenerativeChatStudy />",Preview:GenerativeChatStudy};
