// SPDX-License-Identifier: MIT
// Fill rows without reordering interactive content; balance broad desktop rows.
import {getPreviewLayout} from './study-preview-layout';
export function bentoSpans(items:readonly {id:string}[], columns:2|3|6):number[]{
 const spans:number[]=[];let used=0;let rowStart=0;
 const fillRow=()=>{
  let remaining=columns-used;
  while(remaining>0){
   let target=spans.length-1;
   // On six-track rows, distribute spare tracks across the smaller tiles
   // rather than stretching a final compact control to three columns.
   if(columns===6)for(let i=spans.length-2;i>=rowStart;i--)if(spans[i]<spans[target])target=i;
   spans[target]++;remaining--;
  }
  rowStart=spans.length;
 };
 for(const item of items){
  const layout=getPreviewLayout(item.id);
  const wanted=layout==='workspace'?columns:layout==='wide'?(columns===6?3:2):(columns===6?2:1);
  if(used && used+wanted>columns){fillRow();used=0;}
  spans.push(wanted);used+=wanted;
  if(used===columns){used=0;rowStart=spans.length;}
 }
 if(used)fillRow();
 return spans;
}
