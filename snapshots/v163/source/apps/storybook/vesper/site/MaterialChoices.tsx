/* SPDX-License-Identifier: MIT
 * Gallery-only art selection. Native component paint and behavior are unchanged.
 */
import './material-choices.css';
export type MaterialChoice = 'pigment' | 'paper' | 'print' | 'original';
const choices: {id:MaterialChoice;name:string;image:string}[] = [
 {id:'pigment',name:'Pigment',image:'assets/fine-art-pigment-current-160.webp'},
 {id:'paper',name:'Paper',image:'assets/fine-art-paper-relief-160.webp'},
 {id:'print',name:'Print',image:'assets/fine-art-chromatic-overprint-160.webp'},
 {id:'original',name:'Dunes',image:'dunes.jpg'},
];
export function MaterialChoices({value,onChange}:{value:MaterialChoice;onChange:(value:MaterialChoice)=>void}) {
 return <div className="material-choices" role="group" aria-label="Gallery backdrop">
  <span className="material-choices-label">Backdrop</span>
  {choices.map(item=><button key={item.id} type="button" aria-pressed={value===item.id} onClick={()=>onChange(item.id)}><img src={item.image} alt="" width="24" height="24" loading="lazy"/><span>{item.name}</span></button>)}
 </div>;
}
