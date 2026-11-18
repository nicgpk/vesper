import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{loadShowcaseModule}from'./load-vesper-module.mjs';
const m=await loadShowcaseModule("export {readingDensity,SelectionReadingCard} from './vesper/site/coreContentDemos';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
assert.deepEqual(m.readingDensity('compact'),{padding:2,gap:1});assert.deepEqual(m.readingDensity('comfortable'),{padding:4,gap:3});
const render=d=>m.renderToString(m.createElement(m.SelectionReadingCard,{selected:true,onChange:()=>{},density:d})),compact=render('compact'),comfortable=render('comfortable');
assert.notEqual(compact,comfortable);for(const html of[compact,comfortable]){assert(html.includes('Editorial review'));assert(html.includes('Show the draft before approval'));assert(html.includes('checked=""'));}
const source=readFileSync('apps/storybook/vesper/site/coreContentDemos.tsx','utf8');assert(source.includes('density={view}'));assert(source.includes('if(value)setView(value)'));
console.log('11 density configuration, native SSR and wiring checks pass. No rendered spacing/keyboard verification.');
