// SPDX-License-Identifier: MIT
import {useState} from 'react';
import {Slider} from '@astryxdesign/core/Slider';
import {Button} from '@astryxdesign/core/Button';
import './art-brightness.css';
export function boundedBrightness(value:number){return Number.isFinite(value)?Math.max(40,Math.min(140,value)):100;}
export function brightnessFilter(value:number){return `brightness(${boundedBrightness(value)/100})`;}
export function ArtworkBrightness({value}:{value:number}){
 return <figure className="ab-art"><img src="assets/fine-art-pigment-current-960.webp" alt="Abstract pigment composition" width="960" height="640" style={{filter:brightnessFilter(value)}}/></figure>;
}
export function boundedReveal(value:number){return Number.isFinite(value)?Math.max(0,Math.min(100,value)):50;}
export function ArtworkComparison({value,reveal}:{value:number;reveal:number}){
 const split=boundedReveal(reveal);
 return <figure className="ab-art ab-comparison" aria-label={split===0 ? "Adjusted artwork only" : split===100 ? "Original artwork only" : `Original artwork on the left, brightness adjustment on the right. Original occupies ${split} percent.`}>
  <img src="assets/fine-art-pigment-current-960.webp" alt="Abstract pigment composition" width="960" height="640" style={{filter:brightnessFilter(value)}}/>
  <img className="ab-original" src="assets/fine-art-pigment-current-960.webp" alt="" aria-hidden="true" width="960" height="640" style={{clipPath:`inset(0 ${100-split}% 0 0)`}}/>
  {split>0 && split<100 && <span className="ab-divider" aria-hidden="true" style={{left:`${split}%`}}/>}
  <figcaption className="ab-labels">{split>0 && <span>Original</span>}{split<100 && <span className="ab-adjusted-label">Adjusted</span>}</figcaption>
 </figure>;
}
export function ArtBrightnessRefinement(){
 const [value,setValue]=useState(75);
 const [reveal,setReveal]=useState(50);
 return <div className="ab-study">
  <ArtworkComparison value={value} reveal={reveal}/>
  <Slider label="Comparison split" value={reveal} onChange={next=>setReveal(boundedReveal(next))} min={0} max={100} step={1}/>
  <Slider label="Artwork brightness" value={value} onChange={next=>setValue(boundedBrightness(next))} min={40} max={140} step={5}/>
  <div className="ab-footer"><span>{value}% brightness</span><Button label="Reset brightness" variant="ghost" isDisabled={value===100} onClick={()=>setValue(100)}/></div>
 </div>;
}
