/* SPDX-License-Identifier: MIT
 * Original compositions of the pinned native Chat components. The original
 * chatDemos.tsx is preserved. No network, model reasoning, or delivery occurs.
 */
import {useEffect, useReducer, useRef, useState, type ComponentType} from 'react';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Selector} from '@astryxdesign/core/Selector';
import {ChatComposer, ChatComposerDrawer, ChatComposerInput, ChatComposerTokenElement, ChatSendButton, ChatMessageList, ChatMessage, ChatMessageBubble, ChatMessageMetadata, ChatTokenizedText, ChatToolCalls, type ChatComposerInputHandle, type ChatComposerToken, type ChatToolCallItem} from '@astryxdesign/core/Chat';
import {ChatReasoning} from '@astryxdesign/lab';
import './chat-refinements.css';

const mention: ChatComposerToken = {value: '@Riley', label: 'Riley', variant: 'neutral'};
const lexicalConfig = {namespace: 'NativeReviewComposer', onError(error: Error) {throw error;}};
export function hasReviewerReference(value:string){return /(^|[\s.,!?;:])@Riley(?=$|[\s.,!?;:])/.test(value);}
export function ComposerRefinement() {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const expanded = focused || Boolean(draft.trim());
  const [sent, setSent] = useState('');
  const input = useRef<ChatComposerInputHandle>(null);
  return <LexicalComposer initialConfig={lexicalConfig}><div className="cr-composition cr-compose-study">
    <header className="cr-compose-heading"><strong>What are we working on?</strong></header>
    <div className="cr-compose-surface" data-expanded={expanded} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node | null))setFocused(false);}}>
    <ChatComposer density={expanded ? "balanced" : "compact"} placeholder="Ask, explore, or start a review…" value={draft} onChange={setDraft} onSubmit={value => {if (!value.trim()) return;setSent(value);setDraft('');}}
      drawer={hasReviewerReference(draft) ? <ChatComposerDrawer count={1} label="Reviewer reference"><div className="cr-context"><ChatComposerTokenElement token={mention}/><span>In this draft</span></div></ChatComposerDrawer> : undefined}
      input={<ChatComposerInput label="Review message" handleRef={input} pasteAsToken={false}/>}
      footerActions={expanded ? <Button label="Mention Riley" size="md" variant="ghost" onClick={() => {input.current?.focus();input.current?.insertToken(mention);}}/> : undefined}
      sendButton={<ChatSendButton aria-label="Add draft"/>}/>
    </div>
    {!draft.trim() && <div className="cr-starters" aria-label="Start a draft">{[{label:"Review onboarding",text:"Please review the onboarding flow."},{label:"Explore directions",text:"Help me explore three directions for this collection."}].map(item=><Button key={item.label} label={item.label} size="sm" variant="ghost" onClick={()=>{setDraft(item.text);input.current?.focus();}}/>)}</div>}
    <div className="cr-receipt" aria-live="polite" aria-atomic="true">
      {sent ? <ChatMessageList density="compact"><ChatMessage sender="user"><ChatMessageBubble name="You" metadata={<ChatMessageMetadata footer="Draft"/>}><ChatTokenizedText tokens={[mention]}>{sent}</ChatTokenizedText></ChatMessageBubble></ChatMessage></ChatMessageList> : <p className="cr-hint">Mention a reviewer to add context to your draft.</p>}
    </div>
  </div></LexicalComposer>;
}

export type WorkPhase = 'idle' | 'reading' | 'comparing' | 'complete' | 'error' | 'cancelled';
export type WorkState = {phase: WorkPhase; run: number; offline: boolean; readComplete: boolean};
export const initialWorkState: WorkState = {phase: 'idle', run: 0, offline: false, readComplete: false};
export type WorkEvent = {type: 'start'; offline: boolean} | {type: 'source'; offline: boolean} | {type: 'cancel'} | {type: 'read'; run: number} | {type: 'finish'; run: number};
export function workReducer(state: WorkState, event: WorkEvent): WorkState {
  if (event.type === 'source') return {...initialWorkState, run: state.run + 1, offline: event.offline, readComplete: false};
  if (event.type === 'start') return state.phase === 'reading' || state.phase === 'comparing' ? state : {phase: 'reading', run: state.run + 1, offline: event.offline, readComplete: false};
  if (event.type === 'cancel') return state.phase === 'reading' || state.phase === 'comparing' ? {...state, phase: 'cancelled'} : state;
  if (event.run !== state.run) return state;
  if (event.type === 'read' && state.phase === 'reading') return {...state, phase: state.offline ? 'error' : 'comparing', readComplete: !state.offline};
  if (event.type === 'finish' && state.phase === 'comparing') return {...state, phase: 'complete'};
  return state;
}
export function workCalls(state: WorkState): ChatToolCallItem[] {
  const readDone = state.readComplete;
  const calls: ChatToolCallItem[] = [
    {key: 'read', name: 'Read notes', target: state.offline ? 'Archived notes' : 'Research notes', status: readDone ? 'complete' : state.phase === 'reading' ? 'running' : state.phase === 'error' ? 'error' : 'pending', errorMessage: state.phase === 'error' ? 'Archived notes are unavailable.' : undefined, resultDetail: readDone ? researchNotes : 'Pulls key points from the selected notes.'},
    {key: 'compare', name: 'Compare with brief', status: state.phase === 'comparing' ? 'running' : state.phase === 'complete' ? 'complete' : 'pending', resultDetail: state.phase === 'complete' ? comparison : 'Waits for the notes.'},
  ];
  // The native component has no cancelled/skipped status. Do not portray stopped
  // or blocked work as queued: preserve completed evidence, explain the rest.
  if (state.phase === 'idle') return [];
  if (state.phase === 'reading') return [calls[0]];
  if (state.phase === 'cancelled') return readDone ? [calls[0]] : [];
  if (state.phase === 'error') return [calls[0]];
  return calls;
}
export function sourceDescription(source:string){return source==='archive'?{title:'Archived notes',text:'This source is unavailable. Choose Research notes to continue.'}:{title:'Research notes',text:researchNotes};}
export const researchNotes = 'People want to preview the draft before approval and undo their last action.';
export const onboardingBrief = 'Simplify onboarding. Keep a review step before publishing and make changes reversible.';
export const comparison = 'Add a review step before publishing, and keep undo within reach.';

type RunStep = 'Queued' | 'Running' | 'Done' | 'Failed' | 'Not run' | 'Stopped';

export function runSteps(state: WorkState): readonly [RunStep, RunStep] {
  if (state.phase === 'idle') return ['Queued', 'Queued'];
  if (state.phase === 'reading') return ['Running', 'Queued'];
  if (state.phase === 'comparing') return ['Done', 'Running'];
  if (state.phase === 'complete') return ['Done', 'Done'];
  if (state.phase === 'error') return ['Failed', 'Not run'];
  return state.readComplete ? ['Done', 'Stopped'] : ['Stopped', 'Not run'];
}
const stepTone = {
  Queued:'neutral', Running:'accent', Done:'success', Failed:'error',
  'Not run':'neutral', Stopped:'warning',
} as const;

export function ToolRunSummary({state}: {state: WorkState}) {
  const steps=runSteps(state);
  const done=steps.filter(step=>step==='Done').length;
  const status = {idle:'Ready to compare',reading:'Reading notes',comparing:'Comparing with the brief',complete:'Comparison ready',error:'Source unavailable',cancelled:'Comparison stopped'}[state.phase];
  const current=steps.indexOf('Running');
  return <section className="cr-run" aria-label="Comparison progress">
    <div className="cr-run-header" role="status" aria-live="polite" aria-atomic="true">
      <strong>{status}</strong><span>{done} of 2 complete</span>
    </div>
    <ol className="cr-run-steps">
      {steps.map((step,index)=><li key={index} data-status={step} aria-current={index===current?'step':undefined}>
        <span className="cr-run-mark" aria-hidden="true"><StatusDot label={step} variant={stepTone[step]} isPulsing={step==='Running'} icon={step==='Done'?<Icon icon="check" size="xsm" color="inherit"/>:step==='Failed'?<Icon icon="close" size="xsm" color="inherit"/>:undefined}/></span>
        <span className="cr-run-title">{index===0?'Read notes':'Compare with brief'}</span>
        <span className="cr-run-step-status">{step}</span>
      </li>)}
    </ol>
  </section>;
}

export function ReasoningRefinement() {
  const [source, setSource] = useState('research');
  const [state, dispatch] = useReducer(workReducer, initialWorkState);
  const busy = state.phase === 'reading' || state.phase === 'comparing';
  useEffect(() => {
    if (state.phase !== 'reading' && state.phase !== 'comparing') return;
    const run = state.run;
    const timer = window.setTimeout(() => dispatch({type: state.phase === 'reading' ? 'read' : 'finish', run}), state.phase === 'reading' ? 1400 : 1400);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.run]);
  const calls=workCalls(state);
  return <div className="cr-composition cr-tool-run" data-phase={state.phase}>
    <header className="cr-heading"><strong>Review the direction</strong></header>
    <Selector label="Notes" value={source} onChange={value => {setSource(value);dispatch({type:'source',offline:value === 'archive'});}} isDisabled={busy} options={[{value:'research',label:'Research notes'},{value:'archive',label:'Archived notes · unavailable'}]}/>
    <ChatReasoning label="Sources"><div className="cr-sources"><p><strong>{sourceDescription(source).title}</strong>{sourceDescription(source).text}</p><p><strong>Onboarding brief</strong>{onboardingBrief}</p></div></ChatReasoning>
    <ToolRunSummary state={state}/>
    {state.phase === 'complete' ? <ChatMessageList density="compact"><ChatMessage sender="assistant"><ChatMessageBubble name="Comparison" variant="ghost" >{comparison}</ChatMessageBubble></ChatMessage></ChatMessageList> : null}
    
    <div className="cr-actions">{state.phase === 'error' ? <Button label="Use Research notes" variant="primary" onClick={() => {setSource('research');dispatch({type:'start',offline:false});}}/> : busy ? <Button label="Stop comparison" onClick={() => dispatch({type:'cancel'})}/> : <Button label={state.phase === 'cancelled' ? 'Retry comparison' : state.phase === 'complete' ? 'Compare again' : 'Compare sources'} variant="primary" onClick={() => dispatch({type:'start',offline:source === 'archive'})}/>}</div>
    {calls.length>0&&<details className="cr-run-trace" key={state.run}><summary>Tool details</summary><ChatToolCalls label="Tool activity" defaultIsExpanded calls={calls}/></details>}
  </div>;
}
export const chatOverrides: Record<string, ComponentType> = {'chat-composer': ComposerRefinement, 'chat-reasoning': ReasoningRefinement};
