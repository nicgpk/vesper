import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {DocumentReadingSheet,documentSectionState,documentSections,ToolLoadingPreview,readingTimings} from './vesper/site/LoadingStudies';export {createElement} from 'react';export {renderToStaticMarkup} from 'react-dom/server';export {LayerProvider} from '@astryxdesign/core/Layer';export {InternationalizationProvider} from '@astryxdesign/core/i18n';");
for(const phase of ['idle','cancelled','error'])for(let i=0;i<3;i++)assert.equal(m.documentSectionState(phase,2,i),'waiting');
for(let step=0;step<3;step++)for(let i=0;i<3;i++)assert.equal(m.documentSectionState('running',step,i),i<step?'read':i===step?'reading':'waiting');
for(let i=0;i<3;i++)assert.equal(m.documentSectionState('complete',2,i),'read');
for(const phase of ['idle','running','complete','cancelled']){
 const html=m.renderToStaticMarkup(m.createElement(m.DocumentReadingSheet,{phase,step:1}));
 for(const section of m.documentSections)assert(html.includes(section.text));
 assert.equal((html.match(/class="ls-document-section"/g)||[]).length,3);
 assert.equal((html.match(/data-state="reading"/g)||[]).length,phase==='running'?1:0);
}
const html=m.renderToStaticMarkup(m.createElement(m.InternationalizationProvider,{locale:'en',dir:'ltr'},m.createElement(m.LayerProvider,null,m.createElement(m.ToolLoadingPreview))));
assert(html.includes('Studio brief sections'));assert(html.includes('Read document'));assert(html.includes('Local only'));
const css=readFileSync('apps/storybook/vesper/site/loading-studies.css','utf8');
assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes('prefers-reduced-transparency:reduce'));assert(css.includes('forced-colors:active'));assert(css.includes('border-radius:var(--radius-element,8px)'));assert(css.includes('z-index:-1;pointer-events:none'));
console.log('Document reading: phase/step state, content-preserving SSR, default card SSR, radius and motion fallbacks pass. Rendered pixels not verified.');

assert(readFileSync('apps/storybook/vesper/site/LoadingStudies.tsx','utf8').includes("source==='archive'?'Checking source availability'"));
