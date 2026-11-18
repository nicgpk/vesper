// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export * from './vesper/site/gallery-navigation'; export {ExactGallery} from './vesper/site/ExactGallery'; export {createElement} from 'react'; export {renderToString} from 'react-dom/server';");
const {routeFocus:f,isPlainActivation:p}=m;
assert.equal(f('','',false,false),'none');assert.equal(f('button','button',false,false),'none');assert.equal(f('','button',false,true),'heading');assert.equal(f('button','selector',false,true),'heading');assert.equal(f('button','',false,true),'origin');assert.equal(f('button','',false,false),'heading');assert.equal(f('button','',true,true),'search');assert.equal(f('button','',true,false),'search');
const plain={button:0,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false};assert(p(plain));for(const key of ['metaKey','ctrlKey','shiftKey','altKey'])assert(!p({...plain,[key]:true}));assert(!p({...plain,button:1}));
const source=fs.readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');const original=fs.readFileSync('apps/storybook/vesper/site/App.tsx','utf8');const preview=s=>s.slice(s.indexOf('function Preview('),s.indexOf('\n}',s.indexOf('function Preview('))+2);assert.equal(preview(source),preview(original));assert(source.includes('event.preventDefault();main.current?.focus()'));assert(source.includes('const previousRoute = useRef(active)'));assert(source.includes("window.location.hash = '#/components'"));assert(source.includes('originLinks.current.get(originKey.current)'));assert(source.includes('ref={heading} tabIndex={-1}'));assert(source.includes('rememberOrigin(`feature:'));assert(source.includes('rememberOrigin(`tile:'));
// Effects do not run on SSR. A direct detail load must expose a focusable main
// and heading without redirecting the route or forcing focus at initialization.
const priorWindow=globalThis.window,priorDocument=globalThis.document;
try {globalThis.window={location:{hash:'#/components/button'}};globalThis.document={documentElement:{dataset:{theme:'dark'}}};const html=m.renderToString(m.createElement(m.ExactGallery));assert(html.includes('Skip to content'));assert(html.includes('id="exact-main"'));assert(/<h1[^>]*tabindex="-1"/i.test(html));assert.equal(window.location.hash,'#/components/button');} finally {if(priorWindow===undefined)delete globalThis.window;else globalThis.window=priorWindow;if(priorDocument===undefined)delete globalThis.document;else globalThis.document=priorDocument;}
console.log('26 navigation pure/source/SSR assertions passed; original Preview unchanged. No rendered focus verification.');
