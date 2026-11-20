import assert from 'node:assert/strict';
import {mkdtemp,mkdir,symlink,rm,readFile} from 'node:fs/promises';
import path from 'node:path';
import {assertLocalPackages} from './assert-local-packages.mjs';
const root=await mkdtemp(path.resolve('../provenance-check-'));
try{
 await mkdir(path.join(root,'packages/core'),{recursive:true});
 await mkdir(path.join(root,'node_modules/@astryxdesign'),{recursive:true});
 const link=path.join(root,'node_modules/@astryxdesign/core');
 await symlink(path.join(root,'packages/core'),link);
 await assertLocalPackages(root,['core']);
 await rm(link);
 await mkdir(path.join(root,'older/packages/core'),{recursive:true});
 await symlink(path.join(root,'older/packages/core'),link);
 await assert.rejects(assertLocalPackages(root,['core']),/Refusing mixed-source build/);
 await rm(link);
 await assert.rejects(assertLocalPackages(root,['core']),{code:'ENOENT'});
 await symlink(path.join(root,'packages/core'),link);
 const nested=path.join(root,'apps/storybook/node_modules/@astryxdesign');
 await mkdir(nested,{recursive:true});
 await symlink(path.join(root,'older/packages/core'),path.join(nested,'core'));
 await assert.rejects(assertLocalPackages(root,['core']),/Refusing mixed-source build/);
 const source=await readFile('scripts/build-exact-gallery.mjs','utf8');
 assert(source.indexOf('await assertLocalPackages(root)')<source.indexOf('exports: await loadShowcaseModule'));
 assert(source.indexOf('await assertLocalPackages(root)')<source.indexOf('await mkdir(output'));
 console.log('PASS: local links accepted; stale/missing links rejected; guard precedes imports/output writes.');
}finally{await rm(root,{recursive:true,force:true});}
