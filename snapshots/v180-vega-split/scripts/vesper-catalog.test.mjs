// SPDX-License-Identifier: MIT
/** @input Documented public exports and native demo declarations.
 * @output Exact inventory, complete coverage, and readable-backing regressions.
 * @position Prevents a curated subset from being called the full Vesper catalog. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const requireApp = createRequire(
  new URL('../apps/storybook/package.json', import.meta.url),
);

test('every composition member has its own native page without duplicating the live family', async () => {
  const result = await build({
    entryPoints: ['apps/storybook/vesper/site/catalog.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
  });
  const module = {exports: {}};
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(
    requireApp,
    module,
    module.exports,
  );
  const family = {id: 'tabs', name: 'Tabs', covers: ['TabList', 'Tab']};
  const pages = module.exports.getComponentPages([family]);
  assert.deepEqual(
    pages.map(p => p.id),
    ['tab', 'tab-list'],
  );
  assert.deepEqual(
    pages.map(p => p.symbol),
    ['Tab', 'TabList'],
  );
  assert.ok(pages.every(page => page.demo === family));
});

test('inventory includes every registered package and lowercase-directory providers', async () => {
  const {getComponentInventory} =
    await import('./vesper-component-inventory.mjs');
  const inventory = getComponentInventory();
  assert.ok(inventory.length > 200);
  assert.deepEqual([...new Set(inventory.map(c => c.package))].sort(), [
    'charts',
    'core',
    'lab',
    'richtext',
    'vega',
  ]);
  for (const name of [
    'Theme',
    'MediaTheme',
    'SyntaxTheme',
    'InternationalizationProvider',
    'DropdownMenuSubMenu',
    'ChatComposerTokenElement',
    'RichTextEditorAutoLinkPlugin',
    'ThreeDScatterGL',
    'VegaChart',
  ]) {
    assert.ok(
      inventory.some(component => component.name === name),
      name,
    );
  }
  assert.equal(new Set(inventory.map(c => c.name)).size, inventory.length);
});

test('preview scale profiles belong to real examples and keep simple controls compact', async () => {
  const {demos, previewLayouts, getPreviewLayout} = await loadShowcaseModule(
    "export {libraryDemos as demos} from './vesper/site/library-demos'; export {previewLayouts, getPreviewLayout} from './vesper/site/preview-layout';",
  );
  const ids = new Set(demos.map(demo => demo.id));
  assert.ok(Object.keys(previewLayouts).every(id => ids.has(id)));
  assert.equal(getPreviewLayout('app-shell'), 'workspace');
  assert.equal(getPreviewLayout('code-editor'), 'wide');
  assert.equal(getPreviewLayout('button'), 'control');
});

test('coverage reports missing, unknown and duplicate claims instead of accepting plausible totals', async () => {
  const {getCoverage} = await import('./vesper-component-inventory.mjs');
  const inventory = [
    {name: 'Button', package: 'core'},
    {name: 'Card', package: 'core'},
  ];
  const coverage = getCoverage(
    [
      {id: 'a', covers: ['Button', 'Imaginary']},
      {id: 'b', covers: ['Button']},
    ],
    inventory,
  );
  assert.deepEqual(coverage.missing, [{name: 'Card', package: 'core'}]);
  assert.deepEqual(coverage.unknown, [{name: 'Imaginary', demoId: 'a'}]);
  assert.deepEqual(coverage.duplicates, [
    {name: 'Button', demoIds: ['a', 'b']},
  ]);
  assert.equal(coverage.coveredComponents, 1);
});

test('native previews cover the exact documented public component inventory', async () => {
  const {assertCompleteCoverage} =
    await import('./vesper-component-inventory.mjs');
  const module = {exports: await loadShowcaseModule()};
  const coverage = assertCompleteCoverage(module.exports.demos);
  assert.equal(coverage.coveredComponents, coverage.documentedComponents);
  assert.ok(coverage.liveExamples > 30);
});
