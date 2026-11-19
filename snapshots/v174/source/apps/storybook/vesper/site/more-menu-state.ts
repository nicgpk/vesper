// SPDX-License-Identifier: MIT
export type MoreState={copied:boolean;pinned:boolean;archived:boolean;notice:string};
export const initialMore:MoreState={copied:false,pinned:false,archived:false,notice:'Material collection is in the workspace.'};
export function moreReducer(s:MoreState,e:{type:'duplicate'|'remove-copy'|'pin'|'archive'}):MoreState{
 switch(e.type){
  case 'duplicate':return s.copied?s:{...s,copied:true,notice:'A copy was added to the workspace.'};
  case 'remove-copy':return !s.copied?s:{...s,copied:false,notice:'Copy removed.'};
  case 'pin':return s.archived?s:{...s,pinned:!s.pinned,notice:s.pinned?'Collection unpinned.':'Collection pinned.'};
  case 'archive':return {...s,archived:!s.archived,pinned:false,notice:s.archived?'Collection restored to the workspace.':'Collection moved to archive.'};
 }
}
