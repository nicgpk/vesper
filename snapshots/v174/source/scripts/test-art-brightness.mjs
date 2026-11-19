import assert from 'node:assert/strict';import{loadShowcaseModule}from'./load-vesper-module.mjs';
const m=await loadShowcaseModule("export {boundedBrightness,brightnessFilter,ArtworkBrightness,ArtBrightnessRefinement} from './vesper/site/ArtBrightnessRefinement';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
for(const[v,expected]of[[-20,40],[200,140],[100,100],[NaN,100],[Infinity,100]])assert.equal(m.boundedBrightness(v),expected);
assert.equal(m.brightnessFilter(40),'brightness(0.4)');assert.equal(m.brightnessFilter(140),'brightness(1.4)');
for(const value of[40,100,140])assert(m.renderToString(m.createElement(m.ArtworkBrightness,{value})).includes(m.brightnessFilter(value)));
const html=m.renderToString(m.createElement(m.ArtBrightnessRefinement)).replace(/<!--.*?-->/g,'');assert(html.includes('Artwork brightness'));assert(html.includes('Abstract pigment composition'));assert(!html.includes('volume'));assert(html.includes('75% brightness'));assert(html.includes('Original'));
console.log('15 art brightness mapping/native SSR checks pass. No browser image effect verification.');
