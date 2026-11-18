import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export * from './vesper/site/FieldsRefinement';export {createElement} from 'react';export {renderToString} from 'react-dom/server';");
let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++};
eq(m.prepareReview(' ','question',null),null);eq(m.prepareReview('title','\n',null),null);
eq(m.prepareReview(' Title ',' Question ',null),{title:'Title',question:'Question',attachment:null});
for(const name of ['A.PDF','note.txt','review.md'])eq(m.reviewErrors('t','q',{name,size:5000000}).file,'');
for(const file of [{name:'x.png',size:1},{name:'x.pdf',size:5000001},{name:'x.txt',size:-1},{name:'x.md',size:NaN}])eq(m.prepareReview('t','q',file),null);
const file={name:'brief.pdf',size:3000,content:'never include'},snapshot=m.prepareReview('t','q',file);eq(snapshot.attachment,{name:'brief.pdf',size:3000});file.name='changed.pdf';eq(snapshot.attachment.name,'brief.pdf');
eq(m.reviewFileSize(0),'0 B');eq(m.reviewFileSize(1500),'1.5 KB');eq(m.reviewFileSize(5000000),'5.0 MB');
const html=m.renderToString(m.createElement(m.FieldsRefinement));
for(const text of ['Review title','Review question','Reference file','Prepare review','Clear form','type="file"','<form','aria-label="Review brief"','type="submit"','novalidate=""','textarea','.pdf,.txt,.md']){assert(html.toLowerCase().includes(text.toLowerCase()),text);n++;}
const source=readFileSync('apps/storybook/vesper/site/FieldsRefinement.tsx','utf8');
for(const text of ['if(files)captureSelection(files)','if(event.dataTransfer.files.length)captureSelection(event.dataTransfer.files)','isMultiple={false}','maxSize={reviewFileLimit}','setAttempted(false);setResult(null)','setGeneration(value=>value+1)','FieldStatus type="success"']){assert(source.includes(text),text);n++;}
assert(!/fetch\(|FileReader|\.text\(|createObjectURL|localStorage|sessionStorage/.test(source));n++;
console.log(n+' field validation, metadata snapshot, native SSR and no-read/no-upload safeguards passed. No browser/file picker verification.');
