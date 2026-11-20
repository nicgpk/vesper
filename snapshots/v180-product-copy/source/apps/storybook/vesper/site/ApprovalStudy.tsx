// SPDX-License-Identifier: MIT
// Authored local approval composition. No connector, model, or network delivery.
import {useEffect, useReducer, useRef} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {TextArea} from '@astryxdesign/core/TextArea';
import {ChatMessage, ChatMessageBubble, ChatMessageMetadata} from '@astryxdesign/core/Chat';
import type {Demo} from './demos';
import './approval-study.css';

export const approvalDestination='#design-review';
export const revisionText='Please review the approval step in the shorter onboarding flow. Flag any unclear actions before we proceed.';
type Revision={before:string;after:string;decision:'pending'|'accepted'|'rejected'};
type Snapshot={text:string;destination:string;version:number};
export type ApprovalState={
  phase:'draft'|'review'|'recording'|'cancelled'|'receipt';
  text:string;version:number;run:number;snapshot:Snapshot|null;receipt:Snapshot|null;revision?:Revision|null;
};
export const initialApproval:ApprovalState={phase:'draft',text:'The shorter onboarding flow is ready. Please review the approval step before we move ahead.',version:0,run:0,snapshot:null,receipt:null};
initialApproval.revision={before:initialApproval.text,after:revisionText,decision:'pending'};
export type ApprovalEvent=
  |{type:'edit';text:string}|{type:'review'}|{type:'approve';version:number}
  |{type:'cancel'}|{type:'finish';run:number;version:number}|{type:'another'}|{type:'accept-change'}|{type:'reject-change'}|{type:'undo-change'};
export function approvalReducer(state:ApprovalState,event:ApprovalEvent):ApprovalState {
  switch(event.type){
    case 'accept-change':
    case 'reject-change': {
      const change=state.revision;
      if(state.phase==='recording'||state.phase==='receipt'||!change||change.decision!=='pending'||state.text!==change.before)return state;
      const accepted=event.type==='accept-change';
      return {...state,phase:'draft',text:accepted?change.after:change.before,version:state.version+1,snapshot:null,revision:{...change,decision:accepted?'accepted':'rejected'}};
    }
    case 'undo-change': {
      const change=state.revision;
      if(state.phase==='recording'||state.phase==='receipt'||!change||change.decision==='pending'||state.text!==(change.decision==='accepted'?change.after:change.before))return state;
      return {...state,phase:'draft',text:change.before,version:state.version+1,snapshot:null,revision:{...change,decision:'pending'}};
    }
    case 'edit':
      if(state.phase==='recording'||state.phase==='receipt'||event.text===state.text)return state;
      return {...state,phase:'draft',text:event.text,version:state.version+1,snapshot:null,revision:null};
    case 'review':
      if(!['draft','cancelled'].includes(state.phase)||!state.text.trim())return state;
      return {...state,phase:'review',snapshot:{text:state.text,destination:approvalDestination,version:state.version}};
    case 'approve':
      if(state.phase!=='review'||!state.snapshot||event.version!==state.version||state.snapshot.version!==state.version||state.snapshot.text!==state.text)return state;
      return {...state,phase:'recording',run:state.run+1};
    case 'cancel':
      if(state.phase!=='review'&&state.phase!=='recording')return state;
      return {...state,phase:'cancelled',run:state.run+1,snapshot:null};
    case 'finish':
      if(state.phase!=='recording'||event.run!==state.run||event.version!==state.version||!state.snapshot||state.snapshot.version!==event.version)return state;
      return {...state,phase:'receipt',receipt:{...state.snapshot}};
    case 'another':
      if(state.phase!=='receipt')return state;
      return {...state,phase:'draft',text:'',version:state.version+1,run:state.run+1,snapshot:null,receipt:null,revision:null};
  }
}
export function ApprovalStudy(){
  const [state,dispatch]=useReducer(approvalReducer,initialApproval);
  const acceptButton=useRef<HTMLButtonElement>(null);
  const undoButton=useRef<HTMLButtonElement>(null);
  const requestedFocus=useRef<'accept'|'undo'|null>(null);
  const revisionDecision=state.revision?.decision;
  useEffect(()=>{
    const target=requestedFocus.current;requestedFocus.current=null;
    if(target==='accept'&&revisionDecision==='pending')acceptButton.current?.focus();
    if(target==='undo'&&(revisionDecision==='accepted'||revisionDecision==='rejected'))undoButton.current?.focus();
  },[revisionDecision]);
  const busy=state.phase==='recording';
  useEffect(()=>{
    if(state.phase!=='recording')return;
    const {run,version}=state;
    const timer=window.setTimeout(()=>dispatch({type:'finish',run,version}),1800);
    return()=>window.clearTimeout(timer);
  },[state.phase,state.run,state.version]);
  const notice={
    draft:'Check the note and destination.',
    review:'Ready to approve. Edits need another review.',
    recording:'Recording approval…',
    cancelled:'Approval cancelled. Review the draft again when ready.',
    receipt:'Draft approved.',
  }[state.phase];
  return <div className="ap-study" data-phase={state.phase}>
    <div className="ap-intro"><header className="ap-heading"><strong>Review a draft</strong></header>
    <dl className="ap-destination"><dt>Destination</dt><dd>{approvalDestination}<span>Not connected</span></dd></dl></div>
    {state.phase==='receipt'&&state.receipt ?
      <ChatMessage sender="user"><ChatMessageBubble name="Approved note" metadata={<ChatMessageMetadata footer={state.receipt.destination+' · Not sent'}/>}>{state.receipt.text}</ChatMessageBubble></ChatMessage>
      : <TextArea label="Current draft" rows={4} value={state.text} onChange={text=>dispatch({type:'edit',text})} isReadOnly={busy}/>}
    {state.revision && !busy && state.phase!=='receipt' && <section className="ap-revision" aria-label="Draft revision">
      {state.revision.decision==='pending' ? <>
        <strong>Suggested replacement</strong>
        <p className="ap-change"><ins>{state.revision.after}</ins></p>
        <div className="ap-actions"><Button ref={acceptButton} label="Accept change" onClick={()=>{requestedFocus.current='undo';dispatch({type:'accept-change'});}}/><Button label="Keep original" variant="ghost" onClick={()=>{requestedFocus.current='undo';dispatch({type:'reject-change'});}}/></div>
      </> : <div className="ap-actions"><span role="status">{state.revision.decision==='accepted'?'Revision accepted.':'Original kept.'}</span><Button ref={undoButton} label="Undo decision" variant="ghost" onClick={()=>{requestedFocus.current='accept';dispatch({type:'undo-change'});}}/></div>}
    </section>}
    <footer className="ap-footer"><p className="ap-status" role="status" aria-live="polite" aria-atomic="true"><span className={busy?'ap-shimmer':undefined}>{notice}</span></p>
    <div className="ap-actions">
      {state.phase==='review'?<><Button label="Approve draft" variant="primary" onClick={()=>dispatch({type:'approve',version:state.version})}/><Button label="Cancel" variant="ghost" onClick={()=>dispatch({type:'cancel'})}/></>:
       busy?<Button label="Cancel approval" onClick={()=>dispatch({type:'cancel'})}/>:
       state.phase==='receipt'?<Button label="Prepare another note" onClick={()=>dispatch({type:'another'})}/>:
       <Button label={state.phase==='cancelled'?'Review again':'Review note'} variant="primary" isDisabled={!state.text.trim()} onClick={()=>dispatch({type:'review'})}/>}
    </div>
    </footer>
  </div>;
}
export const approvalDemos:Demo[]=[{
  id:'chat-approval',name:'Review before action',category:'Chat',
  description:'Inspect a draft revision, accept or keep the original, undo, then record approval without sending.',
  material:'Native controls with a finite, text-carried approval state.',
  code:"// Included local composition, not a package export.\nimport {ApprovalStudy} from './ApprovalStudy';\n<ApprovalStudy />",
  Preview:ApprovalStudy,
}];

export const approvalDemo=approvalDemos[0];
