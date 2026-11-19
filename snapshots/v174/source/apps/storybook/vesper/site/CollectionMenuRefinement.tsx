// SPDX-License-Identifier: MIT
import {useState} from 'react';
import {DropdownMenu,DropdownMenuItem,DropdownMenuCheckboxItem,DropdownMenuDivider,DropdownMenuRadioGroup,DropdownMenuRadioItem,DropdownMenuSubMenu} from '@astryxdesign/core/DropdownMenu';
import './collection-menu-refinement.css';
export const collectionDocuments=[
 {id:'brief',title:'Design brief',date:'2026-10-12',label:'12 Oct'},
 {id:'flow',title:'Onboarding flow',date:'2026-10-15',label:'15 Oct'},
 {id:'notes',title:'Review notes',date:'2026-10-18',label:'18 Oct'},
] as const;
export function sortedCollection(order:string){return [...collectionDocuments].sort((a,b)=>order==='oldest'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));}
export function CollectionMenuContents({order,showDates}:{order:string;showDates:boolean}){
 return <ul className="cm-documents" aria-label="Onboarding documents">{sortedCollection(order).map(item=><li key={item.id}><span>{item.title}</span>{showDates?<time dateTime={item.date}>{item.label}</time>:null}</li>)}</ul>;
}
export function CollectionMenuRefinement(){
 const [order,setOrder]=useState('newest');const [showDates,setShowDates]=useState(true);const [isOpen,setOpen]=useState(true);const [folder,setFolder]=useState('Workspace');
 return <div className="cm-study">
  <header className="cm-header"><div className="cm-heading-copy"><strong>Onboarding</strong><span role="status">{folder} · 3 documents</span></div>
   <DropdownMenu button={{label:'Options'}} menuWidth={260} alignment="end">
    <DropdownMenuItem label={isOpen?'Hide documents':'Show documents'} onClick={()=>setOpen(value=>!value)}/>
    <DropdownMenuCheckboxItem label="Show dates" value={showDates} onChange={setShowDates} hasCloseOnSelect={false}/>
    <DropdownMenuDivider/>
    <DropdownMenuRadioGroup label="Sort documents" value={order} onChange={setOrder} hasCloseOnSelect={false}>
     <DropdownMenuRadioItem value="newest" label="Newest first"/><DropdownMenuRadioItem value="oldest" label="Oldest first"/>
    </DropdownMenuRadioGroup>
    <DropdownMenuDivider/>
    <DropdownMenuSubMenu label="Move collection to" presentation="adaptive">
     {['Workspace','Favorites','Archive'].map(location=><DropdownMenuItem key={location} label={location} onClick={()=>setFolder(location)}/>)}
    </DropdownMenuSubMenu>
   </DropdownMenu>
  </header>
  {isOpen?<CollectionMenuContents order={order} showDates={showDates}/>:<p className="cm-closed">Documents hidden</p>}
  <span className="cm-announcement" role="status">{order==='oldest'?'Oldest':'Newest'} first. Dates {showDates?'shown':'hidden'}. Documents {isOpen?'shown':'hidden'}.</span>
  <small>Changes stay on this page.</small>
 </div>;
}
