// SPDX-License-Identifier: MIT
import {useReducer,useEffect,useRef} from 'react';
import './table-review.css';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Table,TableBody,TableCell,TableFooter,TableHeader,TableHeaderCell,TableRow,TableSelectionToolbar} from '@astryxdesign/core/Table';
export type ReviewRow={id:string;name:string;status:string};
type ReviewState={rows:ReviewRow[];selected:string[];history:{rows:ReviewRow[];selected:string[]}[];message:string};
export const initialTableReview:ReviewState={rows:[{id:'release',name:'Release notes',status:'Ready'},{id:'guide',name:'Usage guide',status:'In review'}],selected:['release'],history:[],message:'Select documents to review.'};
type Event={type:'select';id:string;checked:boolean}|{type:'clear'}|{type:'review'}|{type:'undo'};
export function pendingReviewCount(state:ReviewState){return state.rows.filter(row=>state.selected.includes(row.id)&&row.status!=='Reviewed').length;}
export function tableReviewReducer(state:ReviewState,event:Event):ReviewState{
 switch(event.type){
  case 'select':{
   if(!state.rows.some(row=>row.id===event.id))return state;
   const selected=event.checked?[...new Set([...state.selected,event.id])]:state.selected.filter(id=>id!==event.id);
   return {...state,selected};
  }
  case 'clear':return {...state,selected:[]};
  case 'review':{
   const count=pendingReviewCount(state);if(!count)return state;
   return {...state,rows:state.rows.map(row=>state.selected.includes(row.id)?{...row,status:'Reviewed'}:row),selected:[],history:[...state.history,{rows:state.rows,selected:state.selected}],message:`${count} ${count===1?'document':'documents'} marked reviewed.`};
  }
  case 'undo':{
   const previous=state.history.at(-1);if(!previous)return state;
   return {...state,rows:previous.rows,selected:previous.selected,history:state.history.slice(0,-1),message:'Review undone. Previous statuses restored.'};
  }
 }
}
export function TableReviewRefinement(){
 const [state,dispatch]=useReducer(tableReviewReducer,initialTableReview);
 const keys=new Set(state.selected);
 const reviewButton=useRef<HTMLButtonElement>(null),undoButton=useRef<HTMLButtonElement>(null),firstCheckbox=useRef<HTMLInputElement>(null);
 const focusRequest=useRef<'review'|'undo'|'row'|null>(null);
 useEffect(()=>{const target=focusRequest.current;focusRequest.current=null;if(target==='review')reviewButton.current?.focus();if(target==='undo')undoButton.current?.focus();if(target==='row')firstCheckbox.current?.focus();},[state]);
 return <div className="demo-stack">
  <div className="table-preview-scroll" role="region" aria-label="Documents and bulk actions" tabIndex={0}>
   <div className="demo-stack table-preview-canvas">
    <TableSelectionToolbar selection={{selectedKeys:keys,selectedCount:keys.size,hasSelection:keys.size>0,clearSelection:()=>{focusRequest.current='row';dispatch({type:'clear'});}}} startContent={<Button ref={reviewButton} label="Mark reviewed" isDisabled={pendingReviewCount(state)===0} onClick={()=>{focusRequest.current='undo';dispatch({type:'review'});}}/>}/>
    <Table aria-label="Collection documents" hasHover>
     <TableHeader><TableRow><TableHeaderCell>Select</TableHeaderCell><TableHeaderCell>Document</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHeader>
     <TableBody>{state.rows.map(row=><TableRow key={row.id}><TableCell><CheckboxInput ref={row.id===state.rows[0].id?firstCheckbox:undefined} label={`Select ${row.name}`} isLabelHidden value={keys.has(row.id)} onChange={checked=>dispatch({type:'select',id:row.id,checked})}/></TableCell><TableCell>{row.name}</TableCell><TableCell>{row.status}</TableCell></TableRow>)}</TableBody>
     <TableFooter><TableRow><TableCell colSpan={3}>{state.rows.filter(row=>row.status==='Reviewed').length} of {state.rows.length} reviewed</TableCell></TableRow></TableFooter>
    </Table>
   </div>
  </div>
  <div className="table-review-actions"><p className="demo-result" role="status">{state.message}</p>{state.history.length>0&&<Button ref={undoButton} label="Undo review" variant="ghost" onClick={()=>{focusRequest.current='review';dispatch({type:'undo'});}}/>}</div>
 </div>;
}
