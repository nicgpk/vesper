// Independent source-token contrast audit, not mounted/rendered verification.
// Consumers: Button/Badge, ChatToolCalls, ChatMessageMetadata, TextArea,
// DropdownMenuItem, FieldStatus/ChatComposer, StatusDot and notification themes.
import assert from 'node:assert/strict';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const {dunesPalettes}=await loadShowcaseModule("export * from './themes/dunes-palettes';");
const rgb=h=>{assert(/^#[a-f\d]{6}([a-f\d]{2})?$/i.test(h),`Expected explicit hex: ${h}`);return h.slice(1,7).match(/../g).map(x=>parseInt(x,16)/255)};
const lum=a=>{const v=a.map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const composite=(over,bg)=>{const alpha=over.length===9?parseInt(over.slice(7),16)/255:1;return rgb(over).map((v,i)=>v*alpha+bg[i]*(1-alpha))};
let checks=0,minText=Infinity,minGraphic=Infinity;const failures=[];
const check=(fg,bg,minimum,label)=>{const r=contrast(fg,bg);checks++;if(minimum===4.5)minText=Math.min(minText,r);else minGraphic=Math.min(minGraphic,r);if(r<minimum)failures.push(`${label}: ${r.toFixed(3)} < ${minimum}`)};
for(const [scene,modes] of Object.entries(dunesPalettes))for(const [mode,theme]of Object.entries(modes)){
 const t=theme.tokens;const resolve=value=>value.startsWith('var(')?resolve(t[value.slice(4,-1)]??theme.localTokens[value.slice(4,-1)]):value;
 for(const [status,category]of [['success','green'],['error','red'],['warning','yellow']]){
  const fill=rgb(t[`--color-${status}`]),on=rgb(t[`--color-on-${status}`]);
  check(on,fill,4.5,`${scene}/${mode} ${status} filled label`);
  for(const state of ['hover','pressed'])check(on,composite(t[`--color-overlay-${state}`],fill),4.5,`${scene}/${mode} ${status} filled ${state}`);
  for(const surface of ['body','surface','card','popover']){
   const bg=rgb(t[`--color-background-${surface}`]);
   check(fill,bg,4.5,`${scene}/${mode} ${status} direct text on ${surface}`);
   check(fill,bg,3,`${scene}/${mode} ${status} icon/status dot/focus on ${surface}`);
   // Destructive menu labels share neutral hover, not the filled-action overlay.
   if(status==='error')for(const state of ['hover','pressed'])check(fill,composite(t[`--color-overlay-${state}`],bg),4.5,`${scene}/${mode} destructive menu ${state} on ${surface}`);
  }
  check(rgb(t[`--color-text-${category}`]),rgb(t[`--color-${status}-muted`]),4.5,`${scene}/${mode} ${status} field/composer paired categorical text`);
  // Local banner/toast colors override semantic token fill in light/dark.
  const local=theme.localTokens;
  check(rgb(resolve(local['--vesper-notification-ink'])),rgb(resolve(local[`--vesper-notification-${status}`])),4.5,`${scene}/${mode} ${status} notification`);
 }
}
assert.equal(failures.length,0,failures.join('\n'));
console.log(`PASS ${checks} semantic label/state/direct-text/icon/focus/muted/notification contrasts across nine scene/appearance combinations. Minimum text ${minText.toFixed(2)}, graphic ${minGraphic.toFixed(2)}. Opaque/modelled composites only; glass/image/browser rendering unverified.`);
