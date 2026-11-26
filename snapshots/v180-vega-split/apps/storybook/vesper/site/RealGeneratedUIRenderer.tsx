import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {TextInput} from '@astryxdesign/core/TextInput';
export type GeneratedSpec={version:1;result:{title:string;summary:string}&(
 {kind:'checklist';items:{id:string;label:string}[]}|
 {kind:'directions';cards:{id:string;title:string;description:string;imageKey:'dunes-ridge'|'nature-ocean'|'nature-forest'}[]}|
 {kind:'metrics';items:{label:string;value:number}[]}|
 {kind:'brief';fields:{id:string;label:string;value:string}[]})};
// Caller must validate the spec and key this component by request ID.
export function GeneratedUIRenderer({spec}:{spec:GeneratedSpec}){
 const r=spec.result;const [checked,setChecked]=useState<Record<string,boolean>>({});const [choice,setChoice]=useState('');const [fields,setFields]=useState<Record<string,string>>({});const [kept,setKept]=useState(false);
 const max=r.kind==='metrics'?Math.max(...r.items.map(item=>item.value),1):1;
 return <section className="gc-result" aria-label={r.title}><header><strong>{r.title}</strong><span>AI-generated</span></header><p className="gc-summary">{r.summary}</p>
 {r.kind==='checklist'&&<div className="gc-tasks">{r.items.map(item=><CheckboxInput key={item.id} label={item.label} value={Object.hasOwn(checked,item.id)&&!!checked[item.id]} onChange={value=>setChecked(old=>({...old,[item.id]:value}))}/>)}</div>}
 {r.kind==='directions'&&<div className="gc-directions">{r.cards.map(card=><div className="gc-direction" key={card.id} data-selected={choice===card.id}><img src={`assets/${card.imageKey}.webp`} alt=""/><div><strong>{card.title}</strong><p>{card.description}</p><Button label={choice===card.id?'Selected':'Choose direction'} aria-pressed={choice===card.id} onClick={()=>setChoice(card.id)}/></div></div>)}</div>}
 {r.kind==='metrics'&&<><div className="gc-bars">{r.items.map((item,index)=><div key={index}><span>{item.label}<strong>{item.value.toLocaleString()}</strong></span><div aria-hidden="true"><i style={{width:`${item.value/max*100}%`}}/></div></div>)}</div><p className="gc-outcome">AI-generated values, not verified analytics. Review before using.</p></>}
 {r.kind==='brief'&&<>{r.fields.map(field=><TextInput key={field.id} label={field.label} value={Object.hasOwn(fields,field.id)?fields[field.id]:field.value} onChange={value=>{setFields(old=>({...old,[field.id]:value}));setKept(false);}}/>)}<Button label={kept?'Kept here':'Keep this brief'} onClick={()=>setKept(true)} isDisabled={kept}/></>}
 <p className="gc-outcome" role="status">{r.kind==='directions'&&choice?'Direction selected. ':r.kind==='checklist'?`${Object.values(checked).filter(Boolean).length} of ${r.items.length} checked. `:kept?'Brief ready. ':''}</p></section>;
}
