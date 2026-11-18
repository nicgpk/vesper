// Source-only cascade safeguards, not rendered animation verification.
import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const p='apps/storybook/vesper/site/',css=readFileSync(p+'loading-studies.css','utf8');let n=0;const ok=x=>{assert(x);n++};
const old=readFileSync('/tmp/vesper-v93-native/'+p+'loading-studies.css','utf8');ok(css.startsWith(old));
const added=css.slice(old.length);ok(added.includes('animation-name:ls-cube-form,ls-cube-white-sheen'));ok(added.includes('animation-duration:1.2s,2.4s'));ok(added.includes('animation-iteration-count:3,2'));ok(added.includes('#ffffffbf'));ok(!added.includes('width:'));ok(!added.includes('height:'));ok(!added.includes('position:absolute'));ok(!added.includes('background:#fff'));
const motion=added.indexOf('@media(prefers-reduced-motion:reduce)'),forced=added.indexOf('@media(forced-colors:active)');ok(motion>added.indexOf('@keyframes'));ok(forced>motion);ok(added.slice(motion,forced).includes('animation:none;background-image:none'));ok(added.slice(forced).includes('background-color:CanvasText'));
const src=readFileSync(p+'LoadingStudies.tsx','utf8');ok(src===readFileSync('/tmp/vesper-v93-native/'+p+'LoadingStudies.tsx','utf8'));ok(src.includes('animationDelay: `${index * 65}ms`'));ok(css.includes('width:19px;height:19px'));ok(css.includes('animation-fill-mode:both'));
console.log(n+' cube shimmer scope/cascade/source safeguards pass; no browser playback check.');
