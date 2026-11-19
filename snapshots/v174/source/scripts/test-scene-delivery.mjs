import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const output=path.resolve(process.argv[2]??'../../vesper-v163-build');
const source=path.resolve('apps/storybook/vesper/site/assets');
const scenes=['dunes-ridge','nature-ocean','nature-forest','nature-alpine','nature-basalt','nature-salt-flats'];
let full=0,small=0,medium=0;
for(const name of scenes){
 const original=await readFile(path.join(source,`${name}.webp`));
 assert(original.equals(await readFile(path.join(output,'assets',`${name}.webp`))),`${name}: original retained exactly`);full+=original.length;
 for(const width of [384,768]){const bytes=(await stat(path.join(output,'assets',`${name}-${width}.webp`))).size;assert(bytes>0&&bytes<original.length);if(width===384)small+=bytes;else medium+=bytes;}
}
for(const filename of await readdir(path.join(output,'assets'))){
 assert(!/^nature-(ocean|forest|alpine|basalt|salt-flats)(-768)?-[A-Z0-9]{8}\.webp$/.test(filename),'No duplicate hashed nature scene');assert(!/^dunes-[A-Z0-9]{8}\.jpg$/.test(filename),'No duplicate hashed dunes');
 if(!filename.endsWith('.css'))continue;
 const css=await readFile(path.join(output,'assets',filename),'utf8');
 for(const [,raw] of css.matchAll(/url\(([^)]+)\)/g)){
  const url=raw.replace(/^['"]|['"]$/g,'').trim();if(/^(?:data:|https?:|#|var\()/.test(url))continue;
  assert((await stat(path.resolve(output,'assets',url))).isFile(),`Resolved CSS image: ${url}`);
 }
}
const code=await readFile('apps/storybook/vesper/site/ExactGallery.tsx','utf8');
assert(code.includes('384.webp 384w'));assert(code.includes('768.webp 768w'));assert(code.includes('.webp 1536w'));assert(code.includes('fetchPriority='));assert(code.includes('decoding="async"'));
console.log(JSON.stringify({originalSceneBytes:full,scene384Bytes:small,scene768Bytes:medium,savingAt384Percent:Number((100*(1-small/full)).toFixed(1)),savingAt768Percent:Number((100*(1-medium/full)).toFixed(1)),verification:'Asset/URL/source only; no browser transfer or visual-performance measurement'}));
