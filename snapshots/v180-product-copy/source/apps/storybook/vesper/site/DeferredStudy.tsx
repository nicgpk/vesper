import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {createDeferredPreviewGate} from './deferred-preview-gate';
import {getPreviewLayout} from './study-preview-layout';
import './deferred-study.css';
/** Defer only gallery heavy previews; component detail routes mount normally. */
export function DeferredStudy({id,name,children}:{id:string;name:string;children:ReactNode}){
 const [loaded,setLoaded]=useState(false);
 const root=useRef<HTMLDivElement>(null);
 const gate=useRef<ReturnType<typeof createDeferredPreviewGate>|null>(null);
 const focusAfterLoad=useRef(false);
 useEffect(()=>{
  if(loaded)return;
  const element=root.current;if(!element)return;
  const controller=createDeferredPreviewGate(()=>setLoaded(true));gate.current=controller;
  controller.focus(element.contains(document.activeElement));
  if(typeof IntersectionObserver==='undefined'){focusAfterLoad.current=element.contains(document.activeElement);controller.manual();return()=>{controller.dispose();gate.current=null;};}
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.target===element)controller.intersect(entry.isIntersecting);},{rootMargin:'400px 0px',threshold:0});
  observer.observe(element);
  return()=>{controller.dispose();gate.current=null;observer.disconnect();};
 },[loaded]);
 useEffect(()=>{if(loaded&&focusAfterLoad.current){focusAfterLoad.current=false;root.current?.querySelector<HTMLElement>('.preview-scroll')?.focus();}},[loaded]);
 const open=()=>{focusAfterLoad.current=true;if(!gate.current?.manual())setLoaded(true);};
 return <div ref={root} className="exact-deferred" data-loaded={loaded} onFocusCapture={()=>gate.current?.focus(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))gate.current?.focus(false);}}>
  {loaded?children:<div className="demo-stage exact-deferred-stage" data-layout={getPreviewLayout(id)} data-study={id} aria-label={`${name} preview not loaded`}><div className="exact-deferred-prompt"><span aria-hidden="true">↗</span><strong>{name}</strong><p>Open to use the controls.</p><Button label="Load preview" onClick={open}/></div></div>}
 </div>;
}
