// SPDX-License-Identifier: MIT
import {useRef, useState, type KeyboardEvent, type PointerEvent} from 'react';
import {Slider} from '@astryxdesign/core/Slider';
import {Button} from '@astryxdesign/core/Button';
import './art-brightness.css';

const photo = 'assets/nature-alpine-768.webp';
const photoSources = 'assets/nature-alpine-384.webp 384w, assets/nature-alpine-768.webp 768w, assets/nature-alpine.webp 1536w';
const photoSizes = '(max-width: 500px) calc(100vw - 64px), 360px';
const photoDescription = 'Snow-covered alpine peaks at dusk';
const touchThreshold = 7;

export function boundedBrightness(value:number){return Number.isFinite(value)?Math.max(40,Math.min(140,value)):100;}
export function brightnessFilter(value:number){return `brightness(${boundedBrightness(value)/100})`;}
export function boundedReveal(value:number){return Number.isFinite(value)?Math.max(0,Math.min(100,value)):50;}
export function revealAt(x:number,left:number,width:number){
 return width>0 ? Math.round(boundedReveal((x-left)/width*100)) : null;
}

type Gesture={id:number;x:number;y:number;phase:'pending'|'horizontal'|'vertical'};
export function ArtworkComparison({value,reveal,onReveal}:{value:number;reveal:number;onReveal:(next:number)=>void}){
 const split=boundedReveal(reveal);
 const thumb=useRef<HTMLInputElement>(null);
 const gesture=useRef<Gesture|null>(null);
 const updateFrom=(event:PointerEvent<HTMLElement>)=>{
  const {left,width}=event.currentTarget.getBoundingClientRect();
  const next=revealAt(event.clientX,left,width);
  if(next!==null) onReveal(next);
 };
 const start=(event:PointerEvent<HTMLElement>)=>{
  if(event.button!==0||!event.isPrimary||gesture.current) return;
  const mouseLike=event.pointerType!=='touch';
  gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,phase:mouseLike?'horizontal':'pending'};
  event.currentTarget.setPointerCapture?.(event.pointerId);
  if(mouseLike){
   // Suppress the synthetic mouse press that would otherwise blur the range.
   event.preventDefault();
   thumb.current?.focus({preventScroll:true});
   updateFrom(event);
  }
 };
 const move=(event:PointerEvent<HTMLElement>)=>{
  const active=gesture.current;
  if(active?.id!==event.pointerId) return;
  if(active.phase==='pending'){
   const x=Math.abs(event.clientX-active.x),y=Math.abs(event.clientY-active.y);
   if(Math.max(x,y)<touchThreshold) return;
   active.phase=x>y?'horizontal':'vertical';
  }
  if(active.phase==='horizontal') updateFrom(event);
 };
 const end=(event:PointerEvent<HTMLElement>)=>{
  const active=gesture.current;
  if(active?.id!==event.pointerId) return;
  if(active.phase==='horizontal' || (active.phase==='pending'&&Math.hypot(event.clientX-active.x,event.clientY-active.y)<touchThreshold)){
   updateFrom(event);
  }
  gesture.current=null;
 };
 const cancel=(event:PointerEvent<HTMLElement>)=>{
  if(gesture.current?.id===event.pointerId) gesture.current=null;
 };
 const keyDown=(event:KeyboardEvent<HTMLInputElement>)=>{
  const next=({ArrowLeft:split-1,ArrowDown:split-1,ArrowRight:split+1,ArrowUp:split+1,PageDown:split-10,PageUp:split+10,Home:0,End:100} as Record<string,number>)[event.key];
  if(typeof next!=='number') return;
  event.preventDefault();
  onReveal(boundedReveal(next));
 };
 return <figure className="ab-art ab-comparison" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={cancel} onLostPointerCapture={cancel}>
  <img src={photo} srcSet={photoSources} sizes={photoSizes} alt={photoDescription} width="768" height="512" draggable={false} style={{filter:brightnessFilter(value)}}/>
  <img className="ab-original" src={photo} srcSet={photoSources} sizes={photoSizes} alt="" aria-hidden="true" width="768" height="512" draggable={false} style={{clipPath:`inset(0 ${100-split}% 0 0)`}}/>
  <span className="ab-divider" aria-hidden="true" style={{left:`${split}%`}}/>
  <div className="ab-handle" style={{left:`clamp(22px, ${split}%, calc(100% - 22px))`}}>
   <input className="ab-range" ref={thumb} type="range" aria-label="Comparison split" aria-valuetext={split===0?'Adjusted photo only':split===100?'Original photo only':`${split}% original, ${100-split}% adjusted`} min={0} max={100} step={1} value={split} onChange={event=>onReveal(boundedReveal(event.currentTarget.valueAsNumber))} onKeyDown={keyDown}/>
   <span className="ab-thumb" aria-hidden="true">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" focusable="false"><path d="m7 6-4 4 4 4m6-8 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
   </span>
  </div>
  <figcaption className="ab-labels" aria-hidden="true">{split>=28&&<span>Original</span>}{split<=72&&<span className="ab-adjusted-label">Adjusted</span>}</figcaption>
 </figure>;
}
export function ArtBrightnessRefinement(){
 const [value,setValue]=useState(75);
 const [reveal,setReveal]=useState(50);
 return <div className="ab-study">
  <ArtworkComparison value={value} reveal={reveal} onReveal={setReveal}/>
  <Slider label="Photo brightness" value={value} onChange={next=>setValue(boundedBrightness(next))} min={40} max={140} step={5}/>
  <div className="ab-footer"><span>{value}% brightness</span><Button label="Reset brightness" variant="ghost" isDisabled={value===100} onClick={()=>setValue(100)}/></div>
 </div>;
}
