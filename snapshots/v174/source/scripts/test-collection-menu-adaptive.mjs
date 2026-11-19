import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(path, 'utf8');
const site = 'apps/storybook/vesper/site/';
const core = 'packages/core/src/DropdownMenu/';
assert.match(read(site+'library-demos.ts'), /'dropdown-menu-family':CollectionMenuRefinement/);
assert.match(read(site+'CollectionMenuRefinement.tsx'), /label="Move collection to" presentation="adaptive"/);
assert.match(read(core+'DropdownMenuSubMenu.tsx'), /presentation === 'adaptive' && drillIn\.isCompactTouch/);
console.log('Active Collection menu opts into native compact-touch drill-in and desktop flyout (source only).');
