import assert from 'node:assert/strict';import{readFileSync,readdirSync}from'node:fs';import{parse}from'@babel/parser';
const dir='apps/storybook/vesper/site',offenders=[];let files=0;
for(const file of readdirSync(dir).filter(x=>x.endsWith('.tsx')&&x!=='App.tsx')){
 files++;const ast=parse(readFileSync(`${dir}/${file}`,'utf8'),{sourceType:'module',plugins:['jsx','typescript']});
 function walk(node,parent){if(!node||typeof node!=='object')return;
 if(['StringLiteral','JSXText'].includes(node.type)&&/\b(demo|sample|simulation|example|test)\b/i.test(node.value||'')){
 const technical=parent?.type==='JSXAttribute'&&['className','id','data-testid'].includes(parent.name?.name);
 // Code examples retain real classes and identifiers; not the interface copy.
 if(!technical&&!node.value.startsWith('demo-')&&!node.value.includes('<'))offenders.push(file+':'+node.loc.start.line+' '+node.value.trim());
 }
 for(const[key,value]of Object.entries(node)){if(key==='loc')continue;if(Array.isArray(value))value.forEach(x=>walk(x,node));else if(value&&typeof value==='object')walk(value,node);}}
 walk(ast);
}
assert.deepEqual(offenders,[]);
const approval=readFileSync(`${dir}/ApprovalStudy.tsx`,'utf8'),fields=readFileSync(`${dir}/FieldsRefinement.tsx`,'utf8'),charts=readFileSync(`${dir}/chartDemos.tsx`,'utf8');
assert(approval.includes('Nothing is sent.'));assert(fields.includes('Files are not read or uploaded.'));assert(charts.includes('not real market data'));
console.log(`${files} active TSX source files checked for filler copy; technical identifiers/snippets excluded; local/file/market disclosures retained. Not rendered QA.`);
