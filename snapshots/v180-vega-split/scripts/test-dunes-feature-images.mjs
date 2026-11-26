import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const {featureLinks}=await loadShowcaseModule("export {featureLinks} from './vesper/site/gallery-model';");
assert.deepEqual(featureLinks.map(x=>x.id),['chat-composer','chat-reasoning','loading-text']);
assert.deepEqual(featureLinks.map(x=>x.art),['dunes-ridge','nature-ocean','nature-forest']);
const hashes=[];
for(const {art} of featureLinks){const file=`${art.startsWith('nature-')?'artwork/nature-scenes':'artwork/dunes-photographic'}/${art}.png`,b=fs.readFileSync(file);assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),1536);assert.equal(b.readUInt32BE(20),1024);hashes.push(createHash('sha256').update(b).digest('hex'));}
assert.equal(new Set(hashes).size,3);
const src=fs.readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');assert(src.includes('assets/${feature.art}.webp'));for(const {art} of featureLinks){const b=fs.readFileSync(`apps/storybook/vesper/site/assets/${art}.webp`);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert(b.length<500000);};assert(src.includes('href={`#/components/${feature.id}`}'));assert(src.includes("data-art={palette==='sand'?'dunes':palette}"));assert(!src.includes('fine-art-'));
for(const f of ['library-demos.ts','ArtBrightnessRefinement.tsx','LocalCollectionsRefinement.tsx','gallery-spacing.css'])assert.equal(fs.readFileSync(`apps/storybook/vesper/site/${f}`,'utf8'),fs.readFileSync(`../vesper-v144-native/apps/storybook/vesper/site/${f}`,'utf8'));
console.log('PASS: 3 distinct 1536×1024 generated assets, exact feature destinations, fixed Dunes, unchanged studies/art/spacing. Asset inspection only; no rendered QA.');
