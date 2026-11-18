// SPDX-License-Identifier: MIT
import {useState,useEffect,useRef,type Ref} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {ContextMenu,ContextMenuItem} from '@astryxdesign/core/ContextMenu';
import './local-collections-refinement.css';
export const collectionSections=[
 {title:'Direction',text:'Keep the artwork expressive and the controls quiet.'},
 {title:'Typography',text:'Use one clear hierarchy for headings, content and supporting labels.'},
 {title:'Review',text:'Check small screens, keyboard focus and reduced motion.'},
] as const;
export function LocalCollectionDetails({title}:{title:string}){return <section className="lc-details" aria-label={`${title} notes`}><h3>{title}</h3><dl>{collectionSections.map(section=><div key={section.title}><dt>{section.title}</dt><dd>{section.text}</dd></div>)}</dl></section>;}
export function LocalCollectionCard({title,onOpen,cardRef}:{title:string;onOpen:()=>void;cardRef?:Ref<HTMLDivElement>}){return <ClickableCard ref={cardRef} label={`Open ${title}`} padding={3} width="100%" onClick={onOpen}><div className="lc-card"><img src="assets/fine-art-pigment-current-960.webp" width="960" height="640" alt=""/><div><strong>{title}</strong><span>3 review notes</span></div></div></ClickableCard>;}
export function EmptyCollectionRefinement(){
 const [created,setCreated]=useState(false);const [opened,setOpened]=useState(false);
 const createButton=useRef<HTMLButtonElement>(null),collectionCard=useRef<HTMLDivElement>(null);
 const focusRequest=useRef<'create'|'card'|null>(null);
 useEffect(()=>{const target=focusRequest.current;focusRequest.current=null;if(target==='create')createButton.current?.focus();if(target==='card')collectionCard.current?.querySelector<HTMLButtonElement>('button')?.focus();},[created,opened]);
 return <div className="lc-study">
  {!created?<EmptyState title="No collections yet" description="Keep your review notes together." actions={<Button ref={createButton} label="Create collection" variant="primary" onClick={()=>{focusRequest.current='card';setCreated(true);}}/>}/>:<>
   <LocalCollectionCard cardRef={collectionCard} title="Evening collection" onOpen={()=>setOpened(true)}/>
   {opened?<><LocalCollectionDetails title="Evening collection"/><Button label="Close notes" variant="ghost" onClick={()=>{focusRequest.current='card';setOpened(false);}}/></>:null}
   <Button label="Remove collection" variant="ghost" onClick={()=>{focusRequest.current='create';setCreated(false);setOpened(false);}}/>
  </>}
  <span className="lc-announcement" role="status">{!created?'No collections.':opened?'Evening collection notes shown.':'Evening collection created. Select it to read the notes.'}</span>
  <small>Changes stay on this page.</small>
 </div>;
}
export function ContextCollectionRefinement(){
 const [copied,setCopied]=useState(false);const [opened,setOpened]=useState('');
 const originalCard=useRef<HTMLDivElement>(null),copyCard=useRef<HTMLDivElement>(null);
 const focusRequest=useRef<'original'|'copy'|null>(null);
 useEffect(()=>{const target=focusRequest.current;focusRequest.current=null;if(target==='original')originalCard.current?.querySelector<HTMLButtonElement>('button')?.focus();if(target==='copy')copyCard.current?.querySelector<HTMLButtonElement>('button')?.focus();},[copied,opened]);
 return <div className="lc-study">
  <ContextMenu label="Evening collection actions" menuContent={<>
   <ContextMenuItem label="Open collection" onClick={()=>setOpened('Evening collection')}/>
   <ContextMenuItem label="Duplicate collection" isDisabled={copied} onClick={()=>setCopied(true)}/>
  </>}><LocalCollectionCard cardRef={originalCard} title="Evening collection" onOpen={()=>setOpened('Evening collection')}/></ContextMenu>
  {copied?<div className="lc-copy"><LocalCollectionCard cardRef={copyCard} title="Evening collection copy" onOpen={()=>setOpened('Evening collection copy')}/><Button label="Remove copy" variant="ghost" onClick={()=>{focusRequest.current='original';setCopied(false);if(opened==='Evening collection copy')setOpened('');}}/></div>:null}
  {opened?<><LocalCollectionDetails title={opened}/><Button label="Close notes" variant="ghost" onClick={()=>{focusRequest.current=opened==='Evening collection copy'?'copy':'original';setOpened('');}}/></>:null}
  <p className="lc-instruction">Right-click or long-press for actions. With the card focused, press Shift+F10.</p>
  <span className="lc-announcement" role="status">{copied?'2 collections.':'1 collection.'} {opened?`${opened} notes shown.`:''}</span>
  <small>Changes stay on this page.</small>
 </div>;
}
