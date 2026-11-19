/* SPDX-License-Identifier: MIT
 * Original loading studies, separate from the unchanged native catalog.
 * Results are deterministic local compositions, not AI or network requests.
 */
import {useEffect, useId, useReducer, useRef} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Selector} from '@astryxdesign/core/Selector';
import {useState} from 'react';
import type {Demo} from './demos';
import {initialLoadingState, loadingReducer} from './loading-machine';
import './loading-studies.css';

function useLoadingStudy(timings = [950, 1900, 3100]) {
  const [first, second, finish] = timings;
  const [state, dispatch] = useReducer(loadingReducer, initialLoadingState);
  useEffect(() => {
    if (state.phase !== 'running') return;
    const run = state.run;
    const timers = [
      window.setTimeout(() => dispatch({type: 'advance', run, step: 1}), first),
      window.setTimeout(() => dispatch({type: 'advance', run, step: 2}), second),
      window.setTimeout(() => dispatch({type: 'finish', run}), finish),
    ];
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [state.phase, state.run, first, second, finish]);
  return {state, dispatch};
}
function LocalLabel() { return <span className="ls-local">Local only</span>; }

export type ReadingEligibility = {ratio:number;documentVisible:boolean;reducedMotion:boolean};
export function shouldStartReading(state:ReadingEligibility) {
  return state.documentVisible && !state.reducedMotion && state.ratio >= .35;
}
// A manual action permanently consumes automatic playback for this mount.
export function createReadingAutoStart(start:()=>void) {
  let consumed=false,disposed=false;
  return {
    check(state:ReadingEligibility){
      if(disposed||consumed||!shouldStartReading(state))return false;
      consumed=true;start();return true;
    },
    manual(){consumed=true;},
    dispose(){disposed=true;},
  };
}
export const readingTimings=[1800,3600,6000];
export function TextLoadingPreview() {
  const {state, dispatch} = useLoadingStudy(readingTimings);
  const root=useRef<HTMLDivElement>(null);
  const manualUsed=useRef(false);
  const auto=useRef<ReturnType<typeof createReadingAutoStart>|null>(null);
  useEffect(()=>{
    const element=root.current;
    // Unsupported observers/preferences leave the meaningful manual action intact.
    if(!element || typeof IntersectionObserver==='undefined' || typeof window.matchMedia!=='function')return;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const gate=createReadingAutoStart(()=>dispatch({type:'start'}));
    auto.current=gate;
    if(manualUsed.current)gate.manual();
    let ratio=0;
    const check=()=>gate.check({ratio,documentVisible:document.visibilityState==='visible',reducedMotion:motion.matches});
    const observer=new IntersectionObserver(entries=>{
      const entry=entries.find(item=>item.target===element);
      if(entry){ratio=entry.isIntersecting?entry.intersectionRatio:0;check();}
    },{threshold:[0,.35,1]});
    const visibility=()=>{
      // Request a fresh intersection after background layout/scroll changes.
      ratio=0;observer.unobserve(element);observer.observe(element);
    };
    observer.observe(element);
    document.addEventListener('visibilitychange',visibility);
    motion.addEventListener('change',check);
    return()=>{
      gate.dispose();auto.current=null;observer.disconnect();
      document.removeEventListener('visibilitychange',visibility);
      motion.removeEventListener('change',check);
    };
  },[]);
  const manual=(type:'start'|'cancel')=>{
    manualUsed.current=true;auto.current?.manual();dispatch({type});
  };
  const busy = state.phase === 'running';
  const status = busy ? ['Reading your notes', 'Finding the common thread', 'Writing the summary'][state.step]
    : state.phase === 'complete' ? 'Summary ready' : state.phase === 'cancelled' ? 'Stopped. Your notes are unchanged.' : 'Three notes. One clear direction.';
  return <div ref={root} className="ls-study ls-text" data-phase={state.phase}>
    <header className="ls-heading"><span>Review notes</span><LocalLabel/></header>
    <div className="ls-notes ls-reading-deck" data-active={busy} aria-label="Notes to summarize">{['Show the draft before sending.', 'Keep the next step obvious.', 'Let people undo their last action.'].map((note,index)=><div className="ls-note-sheet" key={note}><span aria-hidden="true">0{index+1}</span><p>{note}</p><i aria-hidden="true"/></div>)}</div>
    <div className="ls-status" role="status" aria-live="polite" aria-atomic="true"><span className={busy ? 'ls-text-shimmer' : ''}>{status}</span></div>
    {state.phase === 'complete' ? <div className="ls-result"><span className="ls-result-label">THE TAKEAWAY</span><p>Make every action clear, reviewable, and reversible.</p></div> : null}
    <div className="ls-actions">{busy ? <Button label="Stop summarizing" onClick={() => manual('cancel')}/> : <Button label={state.phase === 'cancelled' ? 'Try again' : state.phase === 'complete' ? 'Summarize again' : 'Summarize notes'} variant="primary" onClick={() => manual('start')}/>}</div>
  </div>;
}

function FileMark({active}: {active: boolean}) {
  const mask = `ls-file-${useId().replace(/:/g, '')}`;
  const shape = 'M8 3a3 3 0 0 0-3 3v20a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V12L18 3H8zm9 2.5V13h7.5L17 5.5zM10 17h12v2H10v-2zm0 5h9v2h-9v-2z';
  return <svg className="ls-file-mark" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false" data-active={active}>
    <defs><clipPath id={mask}><path d={shape} clipRule="evenodd"/></clipPath><linearGradient id={`${mask}-light`}><stop offset="0" stopColor="white" stopOpacity="0"/><stop offset=".5" stopColor="white" stopOpacity=".95"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient></defs>
    <path fill="currentColor" fillRule="evenodd" d={shape}/>
    {active ? <g clipPath={`url(#${mask})`}><rect className="ls-file-sheen" x="-26" y="0" width="26" height="32" fill={`url(#${mask}-light)`}/></g> : null}
  </svg>;
}
export const documentSections = [
  {label:'Goal', text:'Make the first review clear and easy to complete.'},
  {label:'Approach', text:'Show the draft before asking for approval.'},
  {label:'Next step', text:'Keep the decision and a way to undo it together.'},
] as const;
export function documentSectionState(phase:string, step:number, index:number) {
  if(phase==='complete') return 'read';
  if(phase!=='running') return 'waiting';
  return index<step?'read':index===step?'reading':'waiting';
}
export function DocumentReadingSheet({phase,step}:{phase:string;step:number}) {
 return <div className="ls-document-sheet" aria-label="Studio brief sections">
   <div className="ls-document-caption"><span>STUDIO BRIEF</span><span>{phase==='complete'?'3 / 3 sections':phase==='running'?`${step} / 3 sections`:'3 sections'}</span></div>
   {documentSections.map((section,index)=><div className="ls-document-section" data-state={documentSectionState(phase,step,index)} key={section.label}>
     <div className="ls-document-section-label"><span>{section.label}</span><span aria-hidden="true">{documentSectionState(phase,step,index)==='read'?'✓':`0${index+1}`}</span></div>
     <p>{section.text}</p>
   </div>)}
 </div>;
}
export function ToolLoadingPreview() {
  const [source, setSource] = useState('brief');
  const {state, dispatch} = useLoadingStudy(readingTimings);
  const busy = state.phase === 'running';
  const status = busy ? source==='archive'?'Checking source availability':['Reading the goal', 'Reviewing the approach', 'Collecting the next step'][state.step]
    : state.phase === 'complete' ? 'Document ready' : state.phase === 'error' ? 'Archived note is unavailable.' : state.phase === 'cancelled' ? 'Read cancelled' : 'Ready to read';
  return <div className="ls-study ls-tool" data-phase={state.phase}>
    <header className="ls-heading"><span>Read a document</span><LocalLabel/></header>
    <Selector label="Document" value={source} onChange={value => {setSource(value);dispatch({type: 'clear'});}} isDisabled={busy} options={[{value: 'brief', label: 'Studio brief'}, {value: 'archive', label: 'Archived note · unavailable'}]}/>
    <div className="ls-tool-stage"><FileMark active={busy}/><div><span className="ls-file-name">{source === 'brief' ? 'studio-brief.md' : 'archived-note.md'}</span><span className="ls-tool-status" role="status" aria-live="polite" aria-atomic="true">{status}</span></div></div>
    {source==='brief'?<DocumentReadingSheet phase={state.phase} step={state.step}/>:<div className="ls-document-unavailable"><FileMark active={false}/><strong>Archived note</strong><p>This source is unavailable. Choose Studio brief to see the reading sequence.</p></div>}
    {state.phase === 'complete' ? <div className="ls-result"><span className="ls-result-label">FROM THE BRIEF</span><p>A simpler onboarding flow, with a review step before publishing.</p></div> : null}
    {state.phase === 'error' ? <p className="ls-recovery">Use the available Studio brief instead. Nothing was changed.</p> : null}
    <div className="ls-actions">{state.phase === 'error' ? <Button label="Use Studio brief" variant="primary" onClick={() => {setSource('brief');dispatch({type:'start',shouldFail:false});}}/> : busy ? <Button label="Cancel read" onClick={() => dispatch({type: 'cancel'})}/> : <Button label={state.phase === 'cancelled' ? 'Retry read' : state.phase === 'complete' ? 'Read again' : 'Read document'} variant="primary" onClick={() => dispatch({type: 'start', shouldFail: source === 'archive'})}/>}</div>
  </div>;
}
export function CubeLoadingPreview() {
  const {state, dispatch} = useLoadingStudy();
  const busy = state.phase === 'running';
  const status = busy ? ['Understanding the request', 'Organizing the reply', 'Finishing the draft'][state.step]
    : state.phase === 'complete' ? 'Draft ready' : state.phase === 'cancelled' ? 'Draft cancelled' : 'Ready when you are';
  return <div className="ls-study ls-cube" data-phase={state.phase}>
    <header className="ls-heading"><span>A thoughtful reply</span><LocalLabel/></header>
    <p className="ls-request">“Can we review the new onboarding flow tomorrow?”</p>
    <div className="ls-compose-status"><span className="ls-cube-grid" aria-hidden="true" data-active={busy}>{Array.from({length: 9}, (_, index) => <i key={index} style={{animationDelay: `${index * 65}ms`}}/>)}</span><span role="status" aria-live="polite" aria-atomic="true">{status}</span></div>
    {state.phase === 'complete' ? <div className="ls-result"><span className="ls-result-label">DRAFT · NOT SENT</span><p>Yes, let’s review it tomorrow. I’ll bring the updated flow and the key decisions for us to discuss.</p></div> : null}
    <div className="ls-actions">{busy ? <Button label="Stop drafting" onClick={() => dispatch({type: 'cancel'})}/> : <Button label={state.phase === 'cancelled' ? 'Try again' : state.phase === 'complete' ? 'Draft again' : 'Draft a reply'} variant="primary" onClick={() => dispatch({type: 'start'})}/>}</div>
  </div>;
}
export const loadingDemos: Demo[] = [
  {id: 'loading-text', name: 'Reading shimmer', category: 'Loading', description: 'Text carries the progress while notes become a concise summary.', material: 'A moving highlight within text; readable without motion.', code: "// Included local composition, not a package export.\nimport {TextLoadingPreview} from './LoadingStudies';\n<TextLoadingPreview />", Preview: TextLoadingPreview},
  {id: 'loading-tool', name: 'Document shimmer', category: 'Loading', description: 'A compact document reveals its reading sequence, with cancellation and recovery.', material: 'A broad white sheen marks the active section; completed sections remain readable.', code: "// Included local composition, not a package export.\nimport {ToolLoadingPreview} from './LoadingStudies';\n<ToolLoadingPreview />", Preview: ToolLoadingPreview},
  {id: 'loading-cube', name: 'Composing grid', category: 'Loading', description: 'A small sequential grid accompanies a local reply draft.', material: 'A compact 3 × 3 indicator leaves the content in focus.', code: "// Included local composition, not a package export.\nimport {CubeLoadingPreview} from './LoadingStudies';\n<CubeLoadingPreview />", Preview: CubeLoadingPreview},
];
