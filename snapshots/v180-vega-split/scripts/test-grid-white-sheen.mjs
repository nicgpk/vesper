import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const css=readFileSync('apps/storybook/vesper/site/loading-studies.css','utf8');
for(const value of ['animation-name:ls-cube-form,ls-cube-white-sheen','animation-duration:1.2s,2.4s','#ffffffa6 48%,#ffffffbf 56%','background-size:240% 100%','@keyframes ls-cube-white-sheen','grid-template-columns:repeat(3,5px)','width:19px;height:19px'])assert(css.includes(value),value);
for(const mode of ['prefers-reduced-motion:reduce','forced-colors:active'])assert(css.includes(`@media(${mode}){.ls-cube-grid[data-active=true] i{animation:none;background-image:none`));
assert(css.indexOf('@keyframes ls-cube-white-sheen')<css.lastIndexOf('@media(prefers-reduced-motion:reduce)'));
console.log('10 grid white sheen contracts pass: dimensions/base sequence unchanged, active-only and static fallbacks. Not rendered playback.');
