import fs from 'node:fs';import assert from 'node:assert/strict';import{loadShowcaseModule}from'./load-vesper-module.mjs';
const css=fs.readFileSync('.github/vesper-pages/docs.css','utf8'),before=fs.readFileSync('../vesper-v123-native/.github/vesper-pages/docs.css','utf8');
assert.equal(css,before.replace('\nh2 {','\n.docs-section-heading {'));assert(!/(^|})\s*h2\s*\{/m.test(css));assert(css.includes('.docs-section-heading {\n  font-size: 19px;'));
let authored=0;for(const file of ['App.tsx','ExactGallery.tsx']){const src=fs.readFileSync('apps/storybook/vesper/site/'+file,'utf8');const headings=[...src.matchAll(/<h2\b[^>]*>/g)];for(const h of headings)assert(h[0].includes('className="docs-section-heading"'));authored+=headings.length;}
assert.equal(authored,7);
for(const path of ['Heading/Heading.tsx','Dialog/DialogHeader.tsx','AlertDialog/AlertDialog.tsx'])assert.equal(fs.readFileSync('packages/core/src/'+path,'utf8'),fs.readFileSync('../vesper-v123-native/packages/core/src/'+path,'utf8'));
const m=await loadShowcaseModule("export {Heading} from '@astryxdesign/core/Heading';export {DialogHeader} from '@astryxdesign/core/Dialog';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
const heading=m.renderToString(m.createElement(m.Heading,{level:2},'Native title'));assert(heading.includes('<h2'));assert(heading.includes('Native title'));assert(!heading.includes('docs-section-heading'));
const dialog=m.renderToString(m.createElement(m.DialogHeader,{title:'Native dialog',subtitle:'Context'}));assert(dialog.includes('<h2'));assert(dialog.includes('Native dialog'));assert(!dialog.includes('docs-section-heading'));
// Existing documentation-specific overrides stay more specific than the new single class.
const exact=fs.readFileSync('apps/storybook/vesper/site/exact-gallery.css','utf8');assert(exact.includes('.exact-collection-bar h2{'));assert(exact.includes('.exact-empty h2{'));assert(css.includes('.section-line h2 {'));
console.log('Independent heading isolation: exact CSS selector-only change,7 authored opt-ins, native Heading/DialogHeader SSR, unchanged native source and retained documentation overrides pass. No modal geometry/browser verification.');
