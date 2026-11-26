import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {createDeferredPreviewGate} from './vesper/site/deferred-preview-gate';export {DeferredStudy} from './vesper/site/DeferredStudy';export {libraryDemos} from './vesper/site/library-demos';export {createElement} from 'react';export {renderToStaticMarkup} from 'react-dom/server';");
let loads=0;const gate=m.createDeferredPreviewGate(()=>loads++);assert.equal(gate.intersect(false),false);assert.equal(loads,0);gate.focus(true);assert.equal(gate.intersect(true),false);assert.equal(loads,0);assert.equal(gate.manual(),true);assert.equal(loads,1);assert.equal(gate.intersect(false),false);assert.equal(gate.intersect(true),false);assert.equal(gate.manual(),false);gate.dispose();assert.equal(gate.manual(),false);assert.equal(loads,1);
let blurred=0;const b=m.createDeferredPreviewGate(()=>blurred++);b.focus(true);b.intersect(true);assert.equal(blurred,0);b.focus(false);assert.equal(blurred,1);
let late=0;const disposed=m.createDeferredPreviewGate(()=>late++);disposed.dispose();disposed.intersect(true);disposed.focus(false);disposed.manual();assert.equal(late,0);
let replay=0;const first=m.createDeferredPreviewGate(()=>replay++);first.dispose();const next=m.createDeferredPreviewGate(()=>replay++);first.intersect(true);next.intersect(true);assert.equal(replay,1);
function Bomb(){throw new Error('Heavy child must not mount in deferred SSR');}
const html=m.renderToStaticMarkup(m.createElement(m.DeferredStudy,{id:'chart-dot-gl',name:'WebGL scatter'},m.createElement(Bomb)));assert(html.includes('Load preview'));assert(html.includes('WebGL scatter'));assert(html.includes('data-loaded="false"'));assert(html.includes('preview not loaded'));assert(!html.includes('aria-busy'));
assert.equal(m.libraryDemos.filter(d=>d.heavy).length,8);
const src=readFileSync('apps/storybook/vesper/site/DeferredStudy.tsx','utf8');assert(src.includes("typeof IntersectionObserver==='undefined'"));assert(src.includes('controller.manual();return'));assert(src.includes("rootMargin:'400px 0px'"));assert(src.includes('observer.disconnect()'));assert(src.includes("querySelector<HTMLElement>('.preview-scroll')?.focus()"));assert(src.includes('element.contains(document.activeElement)'));assert(src.includes('if(loaded)return'));
const gallery=readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');assert(gallery.includes('demo.heavy?<DeferredStudy'));assert(gallery.includes('<Preview demo={selected} detail/>'));
console.log('Deferred heavy previews: once-only gate, visibility/focus/manual/disposal/replay states, SSR no child mount, 8-heavy scope, immediate no-observer fallback and detail bypass contracts pass. No browser/performance benchmark.');

assert(src.includes("if(typeof IntersectionObserver==='undefined'){focusAfterLoad.current=element.contains(document.activeElement);controller.manual();"));
