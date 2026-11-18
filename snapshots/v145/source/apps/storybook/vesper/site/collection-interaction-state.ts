// SPDX-License-Identifier: MIT
export const filterCollections=[{id:'review',name:'Review notes',recent:true},{id:'direction',name:'Art direction',recent:true},{id:'archive',name:'Past projects',recent:false}];
export type FilterState={open:boolean;applied:boolean;draft:boolean};
export const initialFilter:FilterState={open:false,applied:true,draft:true};
export function filterReducer(s:FilterState,e:{type:'open'|'dismiss'|'apply'}|{type:'change';value:boolean}):FilterState{
 switch(e.type){
  case 'open':return {...s,open:true,draft:s.applied};
  case 'dismiss':return {...s,open:false,draft:s.applied};
  case 'change':return s.open?{...s,draft:e.value}:s;
  case 'apply':return s.open?{...s,open:false,applied:s.draft}:s;
 }
}
export const visibleCollections=(recent:boolean)=>filterCollections.filter(row=>!recent||row.recent);
export const workspaceAction=(saved:boolean)=>saved?'Remove from workspace':'Add to workspace';
export type SetupState={sheet:string|null;phase:'idle'|'active'|'cancelled'|'confirmed'};
export const initialSetup:SetupState={sheet:null,phase:'idle'};
export function setupReducer(s:SetupState,e:{type:'start'|'confirm'}|{type:'navigate';sheet:string|null}):SetupState{
 if(e.type==='start')return {sheet:'details',phase:'active'};
 if(e.type==='confirm')return s.phase==='active'&&s.sheet==='confirm'?{sheet:null,phase:'confirmed'}:s;
 if(s.phase!=='active')return s;
 return e.sheet===null?{sheet:null,phase:'cancelled'}:['details','confirm'].includes(e.sheet)?{sheet:e.sheet,phase:'active'}:s;
}
