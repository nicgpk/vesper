// SPDX-License-Identifier: MIT
// Local, deterministic interaction studies. No service calls or data submission.
import {useEffect, useId, useReducer, useRef, useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {TextArea} from '@astryxdesign/core/TextArea';
import {ChatToolCalls} from '@astryxdesign/core/Chat';
import type {Demo} from './demos';
import './tool-feedback-studies.css';

type Phase='ready'|'running'|'partial'|'complete'|'stopped';
export type Batch={phase:Phase;run:number;notes:boolean;metrics:boolean;retry:boolean};
export const initialBatch:Batch={phase:'ready',run:0,notes:false,metrics:false,retry:false};
export type BatchEvent={type:'start'|'retry'|'stop'}|{type:'notes'|'finish';run:number};
export function batchReducer(s:Batch,e:BatchEvent):Batch {
 if(e.type==='start')return s.phase==='running'?s:{...initialBatch,phase:'running',run:s.run+1};
 if(e.type==='retry')return s.phase==='partial'?{...s,phase:'running',run:s.run+1,retry:true}:s;
 if(e.type==='stop')return s.phase==='running'?{...s,phase:'stopped',run:s.run+1}:s;
 if(e.run!==s.run||s.phase!=='running')return s;
 if(e.type==='notes')return {...s,notes:true};
 return s.retry?{...s,metrics:true,phase:'complete'}:{...s,notes:true,phase:'partial'};
}
export type SourceState = 'waiting' | 'reading' | 'ready' | 'unavailable' | 'stopped';
export function sourceState(batch:Batch, source:'notes'|'metrics'):SourceState {
 if(batch[source])return 'ready';
 if(batch.phase==='running')return 'reading';
 if(source==='metrics'&&batch.phase==='partial')return 'unavailable';
 if(batch.phase==='stopped')return 'stopped';
 return 'waiting';
}
export const sourceFunnel=[{label:'Started',value:120},{label:'Review',value:84},{label:'Finished',value:72}] as const;
export function EvidencePreview({kind,state}:{kind:string;state:SourceState}){
 const research=kind==='Research';
 if(state==='unavailable')return <div className="tf-evidence-preview tf-evidence-empty"><span>Source unavailable</span><p>Retry metrics to complete the comparison.</p></div>;
 if(state!=='ready')return <div className="tf-evidence-preview tf-evidence-placeholder" data-reading={state==='reading'} aria-hidden="true">{research?<div className="tf-note-placeholders">{[0,1].map(i=><div key={i}><i/><i/></div>)}</div>:<div className="tf-funnel-placeholders">{[100,70,60].map(width=><div key={width}><i/><b style={{width:`${width}%`}}/></div>)}</div>}</div>;
 return research?<div className="tf-evidence-preview tf-note-excerpts"><p>“Let me review it before publishing.”</p><p>“I want a way to undo the change.”</p><small>2 of 6 observations</small></div>:<div className="tf-evidence-preview tf-mini-funnel" aria-label="Review funnel: 120 started, 84 reached review, 72 finished">{sourceFunnel.map(row=><div key={row.label}><span>{row.label}<strong>{row.value}</strong></span><i aria-hidden="true" style={{width:`${row.value/120*100}%`}}/></div>)}</div>;
}
export function EvidenceSource({kind,title,detail,state}:{kind:string;title:string;detail:string;state:SourceState}) {
 const label={waiting:'Waiting',reading:'Reading',ready:'Ready',unavailable:'Retry needed',stopped:'Stopped'}[state];
 return <div className="tf-source" data-state={state}>
  <div className="tf-source-heading"><small>{kind}</small><span className="tf-source-indicator" aria-hidden="true">{state==='ready'?'✓':state==='unavailable'?'!':''}</span></div>
  <strong>{title}</strong><span>{detail}</span>
  <EvidencePreview kind={kind} state={state}/>
  <span className="tf-source-state">{label}</span>
 </div>;
}
export function ParallelToolsStudy(){
 const [s,send]=useReducer(batchReducer,initialBatch);
 useEffect(()=>{if(s.phase!=='running')return;const run=s.run;const a=window.setTimeout(()=>send({type:'notes',run}),900);const b=window.setTimeout(()=>send({type:'finish',run}),1900);return()=>{clearTimeout(a);clearTimeout(b);};},[s.phase,s.run]);
 const busy=s.phase==='running';
 const status={ready:'Two sources, one review.',running:s.retry?'Retrying metrics. Notes retained.':'Reading both sources…',partial:'Notes ready. Metrics unavailable.',complete:'Both sources ready.',stopped:'Stopped. Completed results are kept.'}[s.phase];
 return <div className="tf-study">
  <header><strong>Gather the evidence</strong><span className="tf-completion">{Number(s.notes)+Number(s.metrics)} / 2 ready</span></header>
  <div className="tf-source-grid"><EvidenceSource kind="Research" title="Review notes" detail="6 observations" state={sourceState(s,'notes')}/><EvidenceSource kind="Analytics" title="Funnel metrics" detail="3 steps" state={sourceState(s,'metrics')}/></div>
  <p role="status" className="tf-status">{status}</p>
  {s.phase!=='ready'&&<ChatToolCalls defaultIsExpanded label="Source activity" calls={[
   ...(s.notes?[{key:'notes',name:'Read notes',status:'complete' as const,resultDetail:'People want a review step before publishing and a way to undo changes.'}]:busy?[{key:'notes',name:'Read notes',status:'running' as const}]:[]),
   ...(s.metrics?[{key:'metrics',name:'Read metrics',status:'complete' as const,resultDetail:'Of 120 starts, 84 reach review and 72 finish. The largest drop is before review.'}]:busy?[{key:'metrics',name:'Read metrics',status:'running' as const}]:s.phase==='partial'?[{key:'metrics',name:'Read metrics',status:'error' as const,errorMessage:'The metrics source did not respond. Retry only this step.'}]:[]),
  ]}/>}
  {s.phase==='complete'&&<section className="tf-result"><small>REVIEW DIRECTION</small><p>Keep the review step. Clarify the action that leads into it.</p><span>Supported by notes + funnel metrics</span></section>}
  <div className="tf-actions">{busy?<Button label="Stop gathering" onClick={()=>send({type:'stop'})}/>:<Button variant="primary" label={s.phase==='partial'?'Retry metrics':s.phase==='ready'?'Gather sources':'Gather again'} onClick={()=>send({type:s.phase==='partial'?'retry':'start'})}/>}</div>
 </div>;
}
const reasons=['Not accurate','Missing detail','Hard to follow'] as const;
type Rating='helpful'|'needs-work'|null;
export function ResponseFeedbackStudy(){
 const reasonGroup=useId();
 const helpfulRef=useRef<HTMLButtonElement>(null),editRef=useRef<HTMLButtonElement>(null),noteRef=useRef<HTMLTextAreaElement>(null);
 const focusTarget=useRef<'rating'|'receipt'|'note'|null>(null);
 const [rating,setRating]=useState<Rating>(null),[reason,setReason]=useState(''),[note,setNote]=useState(''),[saved,setSaved]=useState(false);
 useEffect(()=>{const target=focusTarget.current;focusTarget.current=null;if(target==='rating')helpfulRef.current?.focus();if(target==='receipt')editRef.current?.focus();if(target==='note')noteRef.current?.focus();},[saved,rating]);
 const choose=(v:Rating)=>{setRating(v);setSaved(false);setReason('');};
 return <div className="tf-study">
  <header><strong>Improve the response</strong><span>Feedback</span></header>
  <blockquote>Keep the review step, clarify its purpose, and offer undo after publishing.</blockquote>
  <div className="tf-actions" role="group" aria-label="Rate this response"><Button ref={helpfulRef} label="Helpful" variant={rating==='helpful'?'primary':'secondary'} aria-pressed={rating==='helpful'} onClick={()=>choose(rating==='helpful'?null:'helpful')}/><Button label="Needs work" variant={rating==='needs-work'?'primary':'secondary'} aria-pressed={rating==='needs-work'} onClick={()=>choose(rating==='needs-work'?null:'needs-work')}/></div>
  {rating&&!saved&&<><div className="tf-feedback-form">{rating==='needs-work'&&<fieldset><legend>What could be better?</legend><div className="tf-reasons">{reasons.map(item=><label key={item}><input type="radio" name={reasonGroup} value={item} checked={reason===item} onChange={()=>setReason(item)}/>{item}</label>)}</div></fieldset>}<TextArea ref={noteRef} label="Add a note (optional)" placeholder="What should change?" rows={3} value={note} onChange={setNote}/></div><div className="tf-actions"><Button label="Save feedback" variant="primary" isDisabled={rating==='needs-work'&&!reason} onClick={()=>{focusTarget.current='receipt';setSaved(true);}}/><Button label="Cancel" variant="ghost" onClick={()=>{focusTarget.current='rating';setRating(null);setReason('');setNote('');}}/></div></>}
  {saved&&<section className="tf-result"><p role="status">Feedback recorded.</p><strong>{rating==='helpful'?'Helpful':reason}</strong>{note&&<p>{note}</p>}<Button ref={editRef} label="Edit feedback" variant="ghost" onClick={()=>{focusTarget.current='note';setSaved(false);}}/><Button label="Remove feedback" variant="ghost" onClick={()=>{focusTarget.current='rating';setSaved(false);setRating(null);setReason('');setNote('');}}/></section>}
  <small className="tf-disclosure">Feedback is cleared when you leave.</small>
 </div>;
}
export const toolFeedbackDemos:Demo[]=[
 {id:'chat-parallel-tools',name:'Parallel tool recovery',category:'Chat',description:'Gather two sources, inspect results, recover a failed step without rerunning completed work, or stop safely.',material:'Native tool-call rows with partial completion and targeted retry.',code:"import {ParallelToolsStudy} from './ToolFeedbackStudies';\n<ParallelToolsStudy />",Preview:ParallelToolsStudy},
 {id:'chat-response-feedback',name:'Response feedback',category:'Chat',description:'Rate a response, explain what should improve, then edit or remove your feedback.',material:'A reversible feedback loop with a reason and optional note.',code:"import {ResponseFeedbackStudy} from './ToolFeedbackStudies';\n<ResponseFeedbackStudy />",Preview:ResponseFeedbackStudy},
];
