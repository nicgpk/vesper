import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {libraryDemos} from './vesper/site/library-demos';export {createElement} from 'react';export {renderToStaticMarkup} from 'react-dom/server';export {LayerProvider} from '@astryxdesign/core/Layer';export {InternationalizationProvider} from '@astryxdesign/core/i18n';");
const output=new Map();
for(const demo of m.libraryDemos){const html=m.renderToStaticMarkup(m.createElement(m.InternationalizationProvider,{locale:'en',dir:'ltr'},m.createElement(m.LayerProvider,null,m.createElement(demo.Preview))));assert(html.length>0,demo.id);output.set(demo.id,html);}
const composer=output.get('chat-composer');assert(composer.includes('What are we working on?'));assert(composer.includes('data-expanded="false"'));assert(composer.includes('Review onboarding'));assert(!composer.includes('Mention Riley'));
const reading=output.get('loading-text');assert.equal((reading.match(/class="ls-note-sheet"/g)||[]).length,3);assert(reading.includes('Show the draft before sending.'));
const tools=output.get('chat-parallel-tools');assert(tools.includes('Waiting'));
for(const file of ['chat-refinements.css','loading-studies.css','tool-feedback-studies.css']){const css=readFileSync(`apps/storybook/vesper/site/${file}`,'utf8');assert(css.includes('prefers-reduced-motion'));assert(css.includes('forced-colors'));}
console.log(`${output.size} native previews SSR passed; v154 initial composer, note-deck and source-card contracts passed. No mounted/rendered geometry verification.`);
