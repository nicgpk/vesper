import {requestGeneratedUI} from './request-ui.mjs';
export function createUIController({request=requestGeneratedUI,onChange=()=>{}}={}){
 let sequence=0,active=null,state={phase:'idle',prompt:'',spec:null,error:''};
 const update=patch=>{state={...state,...patch};onChange(state);};
 return {
  getState:()=>state,
  async submit(prompt){if(typeof prompt!=='string'||!prompt.trim())return;active?.abort();const id=++sequence;const abort=new AbortController();active=abort;update({phase:'waiting',prompt:prompt.trim(),spec:null,error:''});try{const spec=await request(prompt,{signal:abort.signal});if(id!==sequence||abort.signal.aborted)return;update({phase:'ready',spec,error:''});}catch(error){if(id!==sequence||abort.signal.aborted)return;update({phase:'error',error:error instanceof Error?error.message:'Generation unavailable.'});}finally{if(id===sequence)active=null;}},
  stop(){sequence++;active?.abort();active=null;if(state.phase==='waiting')update({phase:'stopped',error:''});},
  dispose(){sequence++;active?.abort();active=null;onChange=()=>{};}
 };
}
