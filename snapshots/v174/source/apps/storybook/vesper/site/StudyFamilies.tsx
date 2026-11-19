import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import type {Demo} from './demos';
import './study-families.css';
export const studyFamilies=[
 {id:'dropdown-menu-family',name:'Collection menus',description:'Organize documents or try focused actions, with real local state.',variants:[{id:'dropdown-menu-family',label:'Organize'},{id:'more-actions',label:'Actions'},{id:'dropdown-menu',label:'Basic menu'}]},
 {id:'checkbox',name:'Selection controls',description:'Individual, grouped and decorative selection patterns in one place.',variants:[{id:'checkbox',label:'Checkboxes'},{id:'checkbox-list',label:'Grouped choices'},{id:'selection-indicators',label:'Indicators'}]},
 {id:'native-typeahead',name:'Reviewer lookup',description:'Search with loading, failure and retry, or compare a simpler local lookup.',variants:[{id:'native-typeahead',label:'Async lookup'},{id:'base-typeahead',label:'Basic lookup'}]},
 {id:'button',name:'Action buttons',description:'Compare text, icon, grouped and persistent actions in one focused study.',variants:[{id:'button',label:'Button'},{id:'icon-button',label:'Icon action'},{id:'button-group',label:'Grouped actions'},{id:'toggle-button',label:'Toggle'}]},
 {id:'avatar',name:'People and presence',description:'Individual identity and overlapping team presence, together.',variants:[{id:'avatar',label:'Person'},{id:'avatar-group',label:'Team presence'}]},
 {id:'collapsible',name:'Disclosure patterns',description:'Reveal one section or compare an accordion with multiple sections.',variants:[{id:'collapsible',label:'Single section'},{id:'collapsible-group',label:'Accordion'}]},
] as const;
export function combineStudyFamilies(demos:Demo[]):Demo[]{
 return demos.map(demo=>{const family=studyFamilies.find(item=>item.id===demo.id);if(!family)return demo;
 const variants=family.variants.map(variant=>({...variant,demo:demos.find(item=>item.id===variant.id)!}));
 if(variants.some(variant=>!variant.demo))throw new Error(`Missing variant for ${family.id}`);
 function FamilyPreview(){const [selected,setSelected]=useState<string>(family!.id);const current=variants.find(item=>item.id===selected)!;const Component=current.demo.Preview;return <div className="sf-study"><div className="sf-variants" role="group" aria-label={`${family!.name} variants`}>{variants.map(item=><Button key={item.id} label={item.label} size="sm" variant={selected===item.id?'primary':'ghost'} aria-pressed={selected===item.id} onClick={()=>setSelected(item.id)}/>)}</div><p className="sf-note">Switching variants resets changes.</p><div className="sf-preview" key={selected}><Component/></div></div>;}
 return {...demo,familyVariants:variants.map(item=>({id:item.id,name:item.demo.name,covers:item.demo.covers})),name:family.name,description:family.description,categories:[...new Set(variants.map(item=>item.demo.category))],searchTerms:[...new Set(variants.flatMap(item=>[item.demo.name,...item.demo.covers??[]]))],Preview:FamilyPreview};
 });
}
