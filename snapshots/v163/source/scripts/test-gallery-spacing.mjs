import assert from 'node:assert/strict';import fs from 'node:fs';
const css=fs.readFileSync('apps/storybook/vesper/site/gallery-spacing.css','utf8');const gallery=fs.readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');let n=0;
const check=(condition,message)=>{assert(condition,message);n++};
check(gallery.indexOf("import './gallery-spacing.css'")>gallery.indexOf("import './exact-gallery.css'"),'final host spacing imported');
for(const rule of ['--gallery-stage-inset:12px','--gallery-card-inset:16px','--gallery-wide-content:620px','--study-section-gap:16px','--study-control-gap:8px','[data-exact-layout=wide] .demo-content{max-width:var(--gallery-wide-content)}','flex-wrap:wrap;gap:8px 12px','grid-template-columns:minmax(0,1fr)','min-height:44px'])check(css.includes(rule),rule);
check(!css.includes('.astryx-'),'native control selectors untouched');
check(!css.includes('ls-cube-grid'),'19px loader geometry untouched');
check(css.includes('.cf-feedback'),'feedback uses shared rhythm');
check(css.includes('.cr-context{flex-wrap:wrap'),'context can wrap');
// Arithmetic model, not rendered overflow QA. Read current CSS contracts first.
const shellCss=fs.readFileSync('apps/storybook/vesper/site/exact-gallery.css','utf8');
check(shellCss.includes('width:min(1320px,calc(100% - 64px))'),'1320px capped shell');
check(shellCss.includes('@media(min-width:1360px)'),'desktop boundary');
check(shellCss.includes('grid-template-columns:repeat(6,minmax(0,1fr))'),'six-track desktop');
check(css.includes('.exact-grid{gap:28px 16px}'),'mobile16px column gaps');
const widths=[320,375,680,681,1040,1041,1359,1360,1440,1920];const rows=[];
for(const viewport of widths){
 const shell=Math.min(1320,viewport-(viewport<=680?32:64));
 const previousColumns=viewport<=680?1:viewport<=1040?2:3;
 const columns=viewport>=1360?6:previousColumns;
 const gap=viewport<=680?16:20;
 const span=columns===6?2:1;
 const track=(shell-(columns-1)*gap)/columns;
 const tile=track*span+gap*(span-1);
 const previousTile=(shell-(previousColumns-1)*gap)/previousColumns;
 // Stage2px borders+24px inset, panel2px border+32px inset.
 const contentWidth=Math.min(364,tile-26)-34;
 const previousContentWidth=Math.min(364,previousTile-26)-34;
 check(Math.abs(contentWidth-previousContentWidth)<0.001,`compact content not narrowed at ${viewport}`);
 const wideSpan=columns===6?3:Math.min(2,columns);
 const wideTile=track*wideSpan+gap*(wideSpan-1);
 const wideContent=Math.min(620,wideTile-26)-34;
 if(columns===6)check(wideContent>=566,`wide minimum source width at ${viewport}`);
 rows.push({viewport,columns,compactSpan:span,tileWidth:+tile.toFixed(2),contentWidth:+contentWidth.toFixed(2),previousContentWidth:+previousContentWidth.toFixed(2),wideContentWidth:+wideContent.toFixed(2)});
}
console.log(JSON.stringify({assertions:n,scope:'CSS contracts and arithmetic only; native wrap/overflow still needs rendered QA',widths:rows},null,2));
