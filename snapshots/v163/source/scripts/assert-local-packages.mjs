// SPDX-License-Identifier: MIT
// Guard source/build provenance before metadata imports or output writes.
import {realpath} from 'node:fs/promises';
import path from 'node:path';
export const nativePackages=['core','lab','charts','richtext','vega'];
export async function assertLocalPackages(root,names=nativePackages){
 for(const name of names){
  const expected=await realpath(path.join(root,'packages',name));
  const candidates=['','apps','apps/storybook','apps/storybook/vesper','apps/storybook/vesper/site'];
  for(const base of candidates){
   let installed;
   try{installed=await realpath(path.join(root,base,'node_modules','@astryxdesign',name));}
   catch(error){if(base && error.code==='ENOENT')continue;throw error;}
   if(installed!==expected)throw new Error(`Refusing mixed-source build: @astryxdesign/${name} resolves outside this source tree. Restore the workspace package link before building.`);
  }
 }
}
