// SPDX-License-Identifier: MIT
import {useState,useEffect,useRef,type Ref} from 'react';
import {useTheme} from '@astryxdesign/core/theme';
import {Button} from '@astryxdesign/core/Button';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {ContextMenu,ContextMenuItem} from '@astryxdesign/core/ContextMenu';
import './local-collections-refinement.css';
export const collectionSections=[
 {title:'Direction',text:'Keep the scenery expressive and the controls quiet.'},
 {title:'Typography',text:'Use one clear hierarchy for headings, content and supporting labels.'},
 {title:'Review',text:'Check small screens, keyboard focus and reduced motion.'},
] as const;
export function LocalCollectionDetails({title}:{title:string}){return <section className="lc-details" aria-label={`${title} notes`}><h3>{title}</h3><dl>{collectionSections.map(section=><div key={section.title}><dt>{section.title}</dt><dd>{section.text}</dd></div>)}</dl></section>;}
export function collectionScene(themeName:string){
 if(themeName.startsWith('nature-ocean-'))return {src:'assets/nature-ocean.webp',label:'Ocean study'};
 if(themeName.startsWith('nature-forest-'))return {src:'assets/nature-forest.webp',label:'Forest study'};
 if(themeName.startsWith('nature-alpine-'))return {src:'assets/nature-alpine.webp',label:'Alpine study'};
 if(themeName.startsWith('nature-basalt-'))return {src:'assets/nature-basalt.webp',label:'Basalt study'};
 if(themeName.startsWith('nature-salt-flats-'))return {src:'assets/nature-salt-flats.webp',label:'Salt Flats study'};
 return {src:'assets/dunes-ridge.webp',label:'Dunes study'};
}
export function LocalCollectionCard({title,onOpen,cardRef}:{title:string;onOpen:()=>void;cardRef?:Ref<HTMLDivElement>}){
 const scene=collectionScene(useTheme().name);
 return <ClickableCard ref={cardRef} label={`Open ${title}`} padding={3} width="100%" onClick={onOpen}><div className="lc-card"><div className="lc-cover"><img src={scene.src.replace(".webp","-768.webp")} srcSet={`${scene.src.replace(".webp","-384.webp")} 384w, ${scene.src.replace(".webp","-768.webp")} 768w, ${scene.src} 1536w`} sizes="(max-width:480px) 80vw, 320px" decoding="async" width="1536" height="1024" alt="" loading="lazy"/><span>{scene.label}</span></div><div className="lc-card-caption"><div><strong>{title}</strong><span>3 review notes</span></div><span className="lc-open-mark" aria-hidden="true">↗</span></div></div></ClickableCard>;
}
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
 </div>;
}
