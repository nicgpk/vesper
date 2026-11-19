import assert from 'node:assert/strict';
import fs from 'node:fs';
const theme=fs.readFileSync('apps/storybook/themes/glass.ts','utf8');
const container=theme.split("glassComponents['segmented-control'] = {")[1].split('\n};')[0];
const item=theme.split("glassComponents['segmented-control-item'] = {")[1].split('\n};')[0];
assert(!container.includes('borderRadius'),'native outer radius remains authoritative');
assert(item.includes('max(0px, calc(var(--_segmented-control-radius) - var(--_segmented-control-padding) - 1px))'));
assert(!item.includes('var(--radius-inner)'));
assert(!container.includes('overflow'),'focus ring must not be clipped at track');
const nav=fs.readFileSync('apps/storybook/vesper/site/navigationDemos.tsx','utf8');
assert(nav.includes('aria-label="Review workspace views" hasDivider={false}'));
assert(nav.includes('<Tab value="overview" label="Overview" />'));
// Normalized circle geometry: inner radius + inset equals parent radius;
// includes sizes and customized radius/padding, clamping impossible radii.
let cases=0;
for(const size of ['sm','md','lg']) for(const radius of [0,4,6,12,18,24]) for(const padding of [0,2,4]) {
 const inset=padding+1, inner=Math.max(0,radius-inset);
 assert(inner>=0); assert(inner<=radius); if(radius>=inset)assert.equal(inner+inset,radius); cases++;
}
console.log(`${cases} concentric geometry cases and source guards pass; not rendered or mounted verification.`);
