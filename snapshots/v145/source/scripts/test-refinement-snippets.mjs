import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const {libraryDemos}=await loadShowcaseModule("export {libraryDemos} from './vesper/site/library-demos';");
let count=0;
for(const demo of libraryDemos){
 if(!demo.code.startsWith('// Included local composition'))continue;
 const match=demo.code.match(/import \{(\w+)\} from '\.\/(\w+)';/);assert(match, demo.id);
 const source=fs.readFileSync(`apps/storybook/vesper/site/${match[2]}.tsx`,'utf8');
 assert(source.includes(`export function ${match[1]}(`),demo.id);
 assert(demo.code.includes(`<${match[1]} />`),demo.id);count++;
}
assert(count>=7);console.log(`${count} local composition snippets verified against named source exports`);
