// SPDX-License-Identifier: MIT — finite local data, never a network request.
export const reviewers=[{id:'riley',label:'Riley Morgan'},{id:'kai',label:'Kai Ortiz'},{id:'alex',label:'Alex Chen'}];
export type DirectoryStatus={phase:'idle'|'loading'|'ready'|'empty'|'error';query:string;count:number};
export const idleDirectory:DirectoryStatus={phase:'idle',query:'',count:0};
export function matchReviewers(query:string){const q=query.trim().toLowerCase();return reviewers.filter(person=>person.label.toLowerCase().includes(q));}
export function createReviewerDirectory(unavailable:boolean,notify:(status:DirectoryStatus)=>void,delay=650){
 let timer:ReturnType<typeof setTimeout>|null=null,rejectPending:((reason:Error)=>void)|null=null,alive=true,generation=0;
 function cancel(){generation++;if(timer!==null){clearTimeout(timer);timer=null;}if(rejectPending){const reject=rejectPending;rejectPending=null;reject(new Error('Lookup cancelled'));if(alive)notify(idleDirectory);}}
 function search(query:string):Promise<typeof reviewers>{
  cancel();if(!alive)return Promise.resolve([]);
  const run=generation;notify({phase:'loading',query,count:0});
  return new Promise((resolve,reject)=>{rejectPending=reject;timer=setTimeout(()=>{
   timer=null;rejectPending=null;if(!alive||run!==generation){resolve([]);return;}
   if(unavailable){notify({phase:'error',query,count:0});reject(new Error('Local directory unavailable'));return;}
   const result=matchReviewers(query);notify({phase:result.length?'ready':'empty',query,count:result.length});resolve(result);
  },delay);});
 }
 return {search,bootstrap:()=>search(''),cancel,activate(){alive=true;},dispose(){alive=false;cancel();}};
}
