// Independent source/geometry checks; not computed browser styles or rendered QA.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base='apps/storybook/vesper/site/';
const css=readFileSync(base+'gallery-spacing.css','utf8');
const host=readFileSync(base+'ExactGallery.tsx','utf8');
let n=0;const ok=x=>{assert(x);n++};
ok(host.indexOf("import './gallery-spacing.css'")>host.indexOf("import './exact-gallery.css'"));
for(const rule of ['.exact-tile[data-exact-layout=wide] .demo-content{max-width:var(--gallery-wide-content)}','--gallery-wide-content:620px','--gallery-stage-inset:12px','--gallery-card-inset:16px','flex-wrap:wrap;gap:8px 12px','grid-template-columns:minmax(0,1fr)','min-height:44px'])ok(css.includes(rule));
ok(!css.includes('.astryx-'));
ok(!css.includes('.ls-cube-grid'));
// Host box budget excludes any native Card border. Global border-box is inherited.
for(const v of [320,375,680,681,1040,1041]){
 const main=v-(v<=680?32:64),cols=v<=680?1:v<=1040?2:3,gap=v<=680?16:20;
 const tile=(main-(cols-1)*gap)/cols,wide=cols===1?tile:tile*2+gap;
 const ordinary=Math.min(364,tile-26)-32,wideInner=Math.min(620,wide-26)-32;
 ok(ordinary>=230);ok(wideInner>=ordinary);
 const old=Math.min(364,tile-30)-48;ok(ordinary>old);
}
console.log(n+' independent host-spacing source/box-budget checks passed. No rendered layout or native border measurement.');
