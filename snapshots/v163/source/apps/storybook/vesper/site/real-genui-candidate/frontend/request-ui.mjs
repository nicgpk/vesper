import {validateUISpec} from '../shared/schema.mjs';
export async function readBoundedResponse(response,limit=65536){
 const reader=response.body?.getReader();if(!reader)return '';let size=0;const chunks=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new Error('Response exceeded the safe size limit.');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
// Same-origin endpoint only. Validation is injected from the shared schema module.
export async function requestGeneratedUI(prompt,{signal,validate=validateUISpec,fetchImpl=fetch}={}){
 if(typeof prompt!=='string'||!prompt.trim())throw new Error('Enter a request.');
 if(typeof validate!=='function')throw new Error('UI validator unavailable.');
 const response=await fetchImpl('/api/generate-ui',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:prompt.trim()}),signal});
 const raw=await readBoundedResponse(response);
 let data;try{data=JSON.parse(raw);}catch{throw new Error('The response was not valid UI data.');}
 if(!response.ok){if(response.status===503)throw new Error('AI generation is not configured yet.');if(response.status===429)throw new Error('Generation limit reached. Please try later.');throw new Error('The request could not be completed. Your prompt is kept for retry.');}
 try{if(data?.source!=='model'||!validate(data.spec))throw new Error();}catch{throw new Error('The response did not match the supported UI format.');}
 return data.spec;
}
