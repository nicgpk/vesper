import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const {featureImageSizes}=await loadShowcaseModule("export {featureImageSizes} from './vesper/site/feature-image-sizes';");
assert.match(featureImageSizes(true),/calc\(100vw - 32px\)/);
assert.match(featureImageSizes(false),/calc\(50vw - 21px\)/);
assert.equal(featureImageSizes(true).split(', ').slice(1).join(', '),featureImageSizes(false).split(', ').slice(1).join(', '));
const output=process.argv[2]??'../vesper-v180-build';
const scene=['dunes-ridge','nature-ocean','nature-forest'];
const renderWidth=390;
const oldSlot=renderWidth-32;
const newSlot=renderWidth/2-21;
const variant=(slot, dpr, widths) => widths.find(w=>w>=slot*dpr)??widths.at(-1);
const bytes=(name,width)=>stat(path.join(output,'assets',`${name}${width===1536?'':'-'+width}.webp`)).then(s=>s.size);
for (const name of scene) {
 const [small,mid,large]=await Promise.all([384,576,768].map(w=>bytes(name,w)));
 assert(small<mid&&mid<large,name+' versions are ordered by payload');
}
for(const dpr of [1,2,3]){
 const before=variant(oldSlot,dpr,[384,768,1536]);
 const after=variant(newSlot,dpr,[384,576,768,1536]);
 const beforeBytes=(await Promise.all(scene.slice(1).map(n=>bytes(n,before)))).reduce((s,n)=>s+n,0);
 const afterBytes=(await Promise.all(scene.slice(1).map(n=>bytes(n,after)))).reduce((s,n)=>s+n,0);
 assert(afterBytes<=beforeBytes);
 console.log(JSON.stringify({renderWidth,dpr,before,after,beforeBytes,afterBytes,savedBytes:beforeBytes-afterBytes}));
}
