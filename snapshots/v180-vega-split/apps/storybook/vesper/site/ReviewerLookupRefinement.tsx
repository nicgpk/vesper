// SPDX-License-Identifier: MIT
import {useEffect,useMemo,useRef,useState} from 'react';
import {Typeahead,TypeaheadItem} from '@astryxdesign/core/Typeahead';
import {Button} from '@astryxdesign/core/Button';
import {Selector} from '@astryxdesign/core/Selector';
import {createReviewerDirectory,idleDirectory,type DirectoryStatus,reviewers} from './reviewer-directory';
export function ReviewerLookupRefinement(){
 const [person,setPerson]=useState<(typeof reviewers)[number]|null>(null);
 const [mode,setMode]=useState('ready');const [revision,setRevision]=useState(0);
 const [status,setStatus]=useState<DirectoryStatus>(idleDirectory);
 const root=useRef<HTMLDivElement>(null);const retryFocus=useRef(false);
 const source=useMemo(()=>createReviewerDirectory(mode==='unavailable',setStatus),[mode,revision]);
 useEffect(()=>{source.activate();return()=>source.dispose();},[source]);
 useEffect(()=>{if(retryFocus.current){retryFocus.current=false;if(person){root.current?.querySelector<HTMLButtonElement>('button')?.focus();void source.bootstrap().catch(()=>{});}else{root.current?.querySelector<HTMLInputElement>('input[role="combobox"]')?.focus();}}},[source]);
 function resetDirectory(next:string){setMode(next);setRevision(value=>value+1);setStatus(idleDirectory);}
 const notice=status.phase==='loading'?'Finding reviewers…':status.phase==='error'?'Can’t reach the directory. Try again.':status.phase==='empty'?`No reviewers match “${status.query}”.`:status.phase==='ready'?`${status.count} reviewers available.`:'Search the reviewer directory.';
 return <div className="demo-stack">
  <Selector label="Directory state" value={mode} onChange={resetDirectory} options={[{value:'ready',label:'Available'},{value:'unavailable',label:'Unavailable'}]}/>
  <div ref={root}><Typeahead key={revision} label="Choose a reviewer" searchSource={source} value={person} onChange={setPerson} hasEntriesOnFocus hasClear debounceMs={150} placeholder="Riley, Kai or Alex" emptySearchText={status.phase==='error'?'Directory unavailable. Retry below.':'No matching reviewers.'} renderItem={item=><TypeaheadItem item={item} />}/></div>
  <p className="demo-result" role="status" aria-live="polite">{notice}</p>
  {status.phase==='error'&&<Button label="Retry directory" onClick={()=>{retryFocus.current=true;resetDirectory('ready');}}/>}
  <p className="demo-copy">{person?`Reviewer: ${person.label}`:'No reviewer chosen.'}</p>
  <small className="demo-copy">Your current reviewer stays selected if you retry.</small>
 </div>;
}
