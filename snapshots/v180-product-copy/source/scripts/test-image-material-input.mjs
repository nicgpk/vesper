import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mount} from '../apps/storybook/vesper/site/image-material-engine.js';

class Node extends EventTarget {
  #attrs = new Map();
  setAttribute(key,value){this.#attrs.set(key,value)}
  getAttribute(key){return this.#attrs.get(key)}
  getBoundingClientRect(){return {width:300,height:180,left:5,top:12}}
}
const fire=(target,name,properties)=>{const event=new Event(name,{cancelable:true}); Object.assign(event,properties); target.dispatchEvent(event); return event;};
function setup(graphics, reduced=false) {
  const mockGL = new Proxy({}, {get: (_,key)=>key==='getShaderParameter'||key==='getProgramParameter'?()=>true: key.toUpperCase()===key?1:()=>({})});
  const surface=new Node(), canvas=new Node(), image=new Node(), status=new Node(), reset=new Node();
  canvas.getContext=()=>graphics?mockGL:null;
  image.naturalWidth=768; image.naturalHeight=512;
  const root={dataset:{},querySelector:selector=>({'[data-surface]':surface,canvas,img:image,'[role=status]':status,'[data-reset]':reset}[selector])};
  const doc=new Node(), media=new Node(); doc.hidden=false; media.matches=reduced;
  const frames=new Map(); let frame=0;
  let observer, intersection;
  Object.assign(globalThis,{document:doc,devicePixelRatio:1,matchMedia:()=>media,
    requestAnimationFrame:callback=>{frames.set(++frame,callback);return frame;},
    cancelAnimationFrame:id=>frames.delete(id),
    ResizeObserver:class{observe(){}disconnect(){observer=true}},
    IntersectionObserver:class{constructor(cb){intersection=cb}observe(){}disconnect(){}},
  });
  const cleanup=mount(root,{src:'./assets/nature-ocean-768.webp'});
  return {root,surface,canvas,image,status,reset,media,doc,frames,cleanup,
    intersect: visible=>intersection([{isIntersecting:visible}]),
    afterCleanup:()=>observer,
    tick(){const [id,cb]=frames.entries().next().value;frames.delete(id);cb(100)},
  };
}
const pointer=(pointerId, extra={})=>({pointerId,button:0,isPrimary:true,pointerType:'touch',clientX:95,clientY:85,...extra});
let x=setup(false);
x.image.onload();
assert.equal(x.status.textContent,'Still image · motion unavailable');
assert.equal(x.surface.tabIndex,-1);
assert.equal(x.reset.hidden,true);
assert.equal(fire(x.surface,'keydown',{key:'ArrowLeft'}).defaultPrevented,false);
assert.equal(x.frames.size,0);
x.cleanup();assert(x.afterCleanup());
x=setup(true,true);x.image.onload();
assert.equal(x.status.textContent,'Still image · reduced motion');
assert.equal(fire(x.surface,'keydown',{key:'ArrowLeft'}).defaultPrevented,false);
x.media.matches=false;fire(x.media,'change');
assert.equal(x.root.dataset.active,'true');assert.equal(x.reset.hidden,false);
assert.equal(fire(x.surface,'keydown',{key:'ArrowLeft',shiftKey:true}).defaultPrevented,false);
assert.equal(fire(x.surface,'keydown',{key:'ArrowLeft'}).defaultPrevented,true);
assert.equal(x.canvas.hidden,true);x.tick();assert.equal(x.canvas.hidden,false);
fire(x.reset,'click');assert.equal(x.canvas.hidden,true);assert.equal(x.frames.size,0);
fire(x.surface,'pointerdown',pointer(7));assert.equal(x.frames.size,0,'Touch start allows vertical page scrolling before consuming animation');
fire(x.surface,'pointerdown',pointer(8,{isPrimary:false}));
fire(x.surface,'pointermove',pointer(8,{isPrimary:false}));assert.equal(x.frames.size,0);
fire(x.surface,'pointercancel',pointer(8));fire(x.surface,'pointermove',pointer(7));assert.equal(x.frames.size,1);
fire(x.surface,'pointercancel',pointer(7));fire(x.reset,'click');fire(x.surface,'pointermove',pointer(7));assert.equal(x.frames.size,0);
x.intersect(false);assert.equal(fire(x.surface,'keydown',{key:'ArrowRight'}).defaultPrevented,false);
x.intersect(true);fire(x.canvas,'webglcontextlost');assert.equal(x.canvas.hidden,true);assert.equal(x.status.textContent,'Still image · motion unavailable');
assert.equal(fire(x.surface,'keydown',{key:'ArrowLeft'}).defaultPrevented,false);
x.cleanup();assert(x.afterCleanup());
x=setup(true);x.image.onerror();assert.equal(x.status.textContent,'The scene could not load.');
assert(!x.status.textContent.toLowerCase().includes('choose'));
assert.equal(x.root.dataset.loaded,'false');x.cleanup();assert.equal(x.image.onload,null);
assert.match(readFileSync(new URL('../apps/storybook/vesper/site/image-material-study.css',import.meta.url),'utf8'),/touch-action:pan-y pinch-zoom/);
console.log('PASS: static/error truthfulness, reduced mode, no inactive key interception, frame lifecycle, primary touch tracking/cancellation, vertical pan/pinch policy, and cleanup. Synthetic event harness; no handset/GPU proof.');
