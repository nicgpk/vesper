// SPDX-License-Identifier: MIT
// Metadata-only local form: selected files are never read, uploaded or persisted.
import {useEffect, useRef, useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {FileInput} from '@astryxdesign/core/FileInput';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {FieldStatus} from '@astryxdesign/core/Field';
import './fields-refinement.css';

export const reviewFileLimit=5000000;
export type ReviewFile={name:string;size:number};
export function reviewErrors(title:string,question:string,file:ReviewFile|null) {
  return {
    title:title.trim()?'':'Give this review a title.',
    question:question.trim()?'':'Add the question you want reviewed.',
    file:!file?'':!Number.isFinite(file.size)||file.size<0||file.size>reviewFileLimit?'Choose a file no larger than 5 MB.':!/\.(pdf|txt|md)$/i.test(file.name)?'Choose a PDF, TXT or Markdown file.':'',
  };
}
export function prepareReview(title:string,question:string,file:ReviewFile|null) {
  const errors=reviewErrors(title,question,file);
  if(Object.values(errors).some(Boolean))return null;
  return {title:title.trim(),question:question.trim(),attachment:file?{name:file.name,size:file.size}:null};
}
export function reviewFileSize(bytes:number){return bytes<1000?bytes+' B':bytes<1000000?(bytes/1000).toFixed(1)+' KB':(bytes/1000000).toFixed(1)+' MB';}
export function firstReviewError(errors: ReturnType<typeof reviewErrors>) {
  return errors.title ? 'title' : errors.question ? 'question' : errors.file ? 'file' : null;
}
export function referenceRejection(files: readonly ReviewFile[]) {
  return files.map(file=>reviewErrors('Review','Question',file).file).find(Boolean) || '';
}
export function FieldsRefinement(){
  const [rejection,setRejection]=useState('');
  const capturedSelection=useRef(false);
  const captureSelection=(files: ArrayLike<ReviewFile>)=>{
    capturedSelection.current=true;
    setRejection(referenceRejection(Array.from(files)));
    setResult(null);
  };
  const titleRef=useRef<HTMLInputElement>(null);
  const questionRef=useRef<HTMLTextAreaElement>(null);
  const fileRegionRef=useRef<HTMLDivElement>(null);
  const focusRequest=useRef<ReturnType<typeof firstReviewError>>(null);
  const [submission,setSubmission]=useState(0);
  useEffect(()=>{
    const target=focusRequest.current;
    focusRequest.current=null;
    if(target==='title')titleRef.current?.focus();
    else if(target==='question')questionRef.current?.focus();
    // FileInput forwards its ref to an aria-hidden native input. Its accessible
    // trigger is the first named button; never open the picker here.
    else if(target==='file')fileRegionRef.current?.querySelector<HTMLButtonElement>('button[aria-label]')?.focus();
  },[submission]);
  const [title,setTitle]=useState('');
  const [question,setQuestion]=useState('');
  const [file,setFile]=useState<File|null>(null);
  const [attempted,setAttempted]=useState(false);
  const [result,setResult]=useState<ReturnType<typeof prepareReview>>(null);
  const [generation,setGeneration]=useState(0);
  const errors={...reviewErrors(title,question,file),file:rejection || reviewErrors(title,question,file).file};
  const invalidate=()=>setResult(null);
  return <div className="fr-study">
    <header><strong>Prepare a review</strong><p>Set the question. Add a reference if it helps.</p></header>
    <form aria-label="Review brief" noValidate onSubmit={event=>{event.preventDefault();setAttempted(true);setResult(rejection ? null : prepareReview(title,question,file));focusRequest.current=firstReviewError(errors);setSubmission(value=>value+1);}}>
    <FormLayout direction="vertical">
      <TextInput ref={titleRef} label="Review title" value={title} isRequired onChange={value=>{setTitle(value);invalidate();}} placeholder="Onboarding approval step"
        statusVariant="detached" status={attempted&&errors.title?{type:'error',message:errors.title}:undefined}/>
      <TextArea ref={questionRef} label="Review question" rows={3} value={question} isRequired onChange={value=>{setQuestion(value);invalidate();}} placeholder="What should the reviewer check?"
        statusVariant="detached" status={attempted&&errors.question?{type:'error',message:errors.question}:undefined}/>
      <div ref={fileRegionRef} onChangeCapture={event=>{
        const files=(event.target as HTMLInputElement).files;
        if(files)captureSelection(files);
      }} onDropCapture={event=>{
        if(event.dataTransfer.files.length)captureSelection(event.dataTransfer.files);
      }}>
        <FileInput key={generation} label="Reference file" isOptional value={file} onChange={value=>{
            setFile(Array.isArray(value)?value[0]??null:value);
            if(!capturedSelection.current)setRejection('');
            capturedSelection.current=false;
            invalidate();
          }}
          isMultiple={false} accept=".pdf,.txt,.md" maxSize={reviewFileLimit} mode="dropzone"
          description="One PDF, TXT or Markdown file, up to 5 MB. Only its name and size appear in the review."
          statusVariant="detached" status={attempted&&errors.file?{type:'error',message:errors.file}:undefined}/>
      </div>
      {rejection && <Button label="Continue without reference" type="button" variant="ghost" onClick={()=>{
        setFile(null);setRejection('');capturedSelection.current=false;invalidate();setGeneration(value=>value+1);
        focusRequest.current='file';setSubmission(value=>value+1);
      }} />}
      <div className="fr-actions">
        <Button label="Prepare review" variant="primary" type="submit"/>
        <Button label="Clear form" type="button" variant="ghost" onClick={()=>{focusRequest.current=null;setRejection('');capturedSelection.current=false;setTitle('');setQuestion('');setFile(null);setAttempted(false);setResult(null);setGeneration(value=>value+1);}}/>
      </div>
    </FormLayout>
    </form>
    {result?<section className="fr-summary" aria-label="Prepared review">
      <FieldStatus type="success" message="Review prepared locally. Not sent." variant="detached"/>
      <h3>{result.title}</h3><p>{result.question}</p>
      <dl><dt>Reference</dt><dd>{result.attachment?result.attachment.name+' · '+reviewFileSize(result.attachment.size):'No reference attached'}</dd></dl>
    </section>:null}
    <small className="fr-note">Files are not read or uploaded. Nothing is saved beyond this page.</small>
  </div>;
}
