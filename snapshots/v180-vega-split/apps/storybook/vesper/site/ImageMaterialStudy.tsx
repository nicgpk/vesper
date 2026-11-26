/* SPDX-License-Identifier: MIT — original local image displacement study. */
import {useEffect,useRef} from 'react';
import {Button} from '@astryxdesign/core/Button';
import type {Demo} from './demos';
import {mount} from './image-material-engine.js';
import './image-material-study.css';
export function ImageMaterialStudy(){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(root.current)return mount(root.current,{src:'./assets/nature-ocean-768.webp'});},[]);
 return <div ref={root} className="im-study" data-loaded="false">
  <div className="im-surface" data-surface tabIndex={0} role="group" aria-label="Image material. Drag across the scene or use arrow keys. Escape resets.">
   <img alt="Golden coastal cliffs above blue sea and foaming waves" decoding="async"/><canvas hidden aria-hidden="true"/>
  </div>
  <div className="im-controls"><span role="status">Loading image</span><span data-reset hidden><Button label="Reset" variant="ghost" size="sm"/></span></div>
 </div>;
}
export const imageMaterialDemo:Demo={id:'image-material',name:'Image material',category:'Visual',description:'Drag across the coast to make a ripple.',material:'The scene responds to drag or arrow keys and settles when you stop. A still image is shown when motion is off or graphics are unavailable.',code:"// Local composition, not a package export.\nimport {ImageMaterialStudy} from './ImageMaterialStudy';\n<ImageMaterialStudy />",Preview:ImageMaterialStudy,heavy:true,searchTerms:['image','material','water','shader','drag','scene']};
