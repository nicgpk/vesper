const str = (maxLength, extra = {}) => ({type:'string', minLength:1, maxLength, ...extra});
const obj = properties => ({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const array = (items,maxItems) => ({type:'array',items,minItems:1,maxItems});
const id = str(32,{pattern:'^[a-zA-Z0-9_-]+$'});
const common = kind => ({kind:{type:'string',enum:[kind]},title:str(80),summary:str(240)});
export const UI_SCHEMA = obj({version:{type:'integer',enum:[1]},result:{anyOf:[
 obj({...common('checklist'),items:array(obj({id,label:str(160)}),8)}),
 obj({...common('directions'),cards:array(obj({id,title:str(64),description:str(180),imageKey:{type:'string',enum:['dunes-ridge','nature-ocean','nature-forest']}}),3)}),
 obj({...common('metrics'),items:array(obj({label:str(64),value:{type:'number',minimum:0,maximum:1000000000}}),6)}),
 obj({...common('brief'),fields:array(obj({id,label:str(64),value:str(300)}),6)})
]}});
function check(value,schema,path='$') {
 if(schema.anyOf) { if(!schema.anyOf.some(s=>{try{check(value,s,path);return true;}catch{return false;}})) throw new Error(`Invalid variant at ${path}`); return; }
 if(schema.type==='object') {
  if(!value || typeof value!=='object' || Array.isArray(value)) throw new Error(`Expected object at ${path}`);
  const keys=Object.keys(value); if(keys.length!==schema.required.length || keys.some(k=>!Object.hasOwn(schema.properties,k))) throw new Error(`Unexpected keys at ${path}`);
  for(const k of schema.required) check(value[k],schema.properties[k],`${path}.${k}`);
 } else if(schema.type==='array') {
  if(!Array.isArray(value)||value.length<schema.minItems||value.length>schema.maxItems)throw new Error(`Invalid array at ${path}`);
  value.forEach((v,i)=>check(v,schema.items,`${path}[${i}]`));
  const ids=value.map(v=>v?.id).filter(Boolean);if(new Set(ids).size!==ids.length)throw new Error(`Duplicate ids at ${path}`);
 } else if(schema.type==='string') {
  if(typeof value!=='string'||(schema.minLength&&value.trim().length<schema.minLength)||(schema.maxLength&&value.length>schema.maxLength)||/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)||/(?:https?:\/\/|javascript:|data:)/i.test(value)) throw new Error(`Invalid text at ${path}`);
  if(schema.pattern&&!new RegExp(schema.pattern).test(value)) throw new Error(`Invalid identifier at ${path}`);
 } else if(schema.type==='number'||schema.type==='integer') {
  if(typeof value!=='number'||!Number.isFinite(value)||(schema.type==='integer'&&!Number.isInteger(value))||(schema.minimum!==undefined&&value<schema.minimum)||(schema.maximum!==undefined&&value>schema.maximum))throw new Error(`Invalid number at ${path}`);
 }
 if(schema.enum&&!schema.enum.includes(value))throw new Error(`Invalid enum at ${path}`);
}
export function validateUISpec(value){check(value,UI_SCHEMA);return value;}
