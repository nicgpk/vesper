/* SPDX-License-Identifier: MIT — ordered editorial composition for Selected only. */
type Study = {id:string};
type Row = {band:'lead'|'material'|'reviews'|'signals'|'conversation'|'decisions'|'controls'; ids:readonly string[]; regular:readonly number[]; broad?:readonly number[]};
const rows:readonly Row[] = [
 {band:'lead',ids:['chat-generative-ui','chat-reasoning'],regular:[6,6],broad:[7,5]},
 {band:'material',ids:['chat-parallel-tools','image-material'],regular:[6,6]},
 {band:'reviews',ids:['chat-response-feedback','chat-token-usage'],regular:[7,5]},
 {band:'signals',ids:['loading-text','loading-tool','loading-cube'],regular:[4,4,4]},
 {band:'conversation',ids:['chat-layout','selector'],regular:[8,4]},
 {band:'decisions',ids:['chat-approval','chat-reactions'],regular:[6,6]},
 {band:'controls',ids:['native-selection-tools','form-field-family','popover','carousel'],regular:[6,6,6,6],broad:[3,3,3,3]},
];
export function selectedComposition(items:readonly Study[]) {
 const ordered=rows.flatMap(row=>row.ids);
 // A changed collection should use the existing safe packing, not a stale plan.
 if(items.length!==ordered.length||!items.every((item,index)=>item.id===ordered[index]))return null;
 return rows.flatMap(row=>row.ids.map((_,index)=>({band:row.band,regular:row.regular[index],broad:(row.broad??row.regular)[index]})));
}
