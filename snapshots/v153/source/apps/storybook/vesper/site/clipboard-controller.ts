// SPDX-License-Identifier: MIT
export type CopyState={copied:boolean;busy:boolean;message:string};
export const initialCopy:CopyState={copied:false,busy:false,message:'Ready to copy a collection link.'};
export function createClipboardController(commit:(state:CopyState)=>void){
 let generation=0,active=false,alive=true;
 return {
  async copy(write:()=>Promise<void>){
   if(active||!alive)return;
   active=true;const run=++generation;
   commit({copied:false,busy:true,message:'Copying collection link…'});
   let ok=false;try{await write();ok=true;}catch{}
   active=false;
   if(!alive)return;
   if(run!==generation){commit({...initialCopy});return;}
   commit({copied:ok,busy:false,message:ok?'Collection link copied.':'Copy unavailable. Open the collection link below.'});
  },
  reset(){if(!alive)return;generation++;commit({...initialCopy,busy:active,message:active?'Status cleared. The clipboard request is still pending.':initialCopy.message});},
  dispose(){alive=false;generation++;},
 };
}
