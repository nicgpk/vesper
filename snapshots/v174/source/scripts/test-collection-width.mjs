import assert from 'node:assert/strict';
import fs from 'node:fs';
const native=fs.readFileSync('apps/storybook/vesper/site/preview-layout.ts','utf8');
const authored=fs.readFileSync('apps/storybook/vesper/site/study-preview-layout.ts','utf8');
assert(authored.includes("id==='segmented-control'"));
assert(authored.includes("id==='chat-approval'"));
assert(authored.includes(':nativeLayout(id)'));
assert(!native.includes("'segmented-control': 'wide'"),'native layout map untouched');
const css=fs.readFileSync('apps/storybook/vesper/site/exact-gallery.css','utf8');
assert(css.includes('[data-exact-layout=wide]{grid-column:span 2}'));
assert(css.includes('[data-exact-layout=wide]{grid-column:auto}'));
const rows=[];
for(const viewport of [320,375,680,681,1040,1041,1440]){
 const shell=Math.min(1320,viewport-(viewport<=680?32:64));
 const columns=viewport<=680?1:viewport<=1040?2:3;
 const column=(shell-(columns-1)*20)/columns;
 const tile=columns===1?column:2*column+20;
 const inner=Math.min(620,tile-26)-32;
 const gridColumns=Math.max(1,Math.floor((inner+12)/(140+12)));
 assert(inner>=230-0.01);
 assert(gridColumns>=1);
 if(viewport>680)assert(gridColumns>=3,'desktop wide host can fit three document cards');
 rows.push({viewport,inner:+inner.toFixed(2),gridColumns});
}
console.log(JSON.stringify({scope:'source and box-budget arithmetic, not rendered geometry',rows},null,2));
