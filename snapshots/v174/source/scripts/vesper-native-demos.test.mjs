/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/** @input Built public Astryx packages and the native demo registry.
 * @output Node regression coverage for demo metadata and public-package bundling.
 * @position Vesper Pages native demo contract tests. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const entry = 'apps/storybook/vesper/site/demos.tsx';
const appRequire = createRequire(
  new URL('../apps/storybook/package.json', import.meta.url),
);
test('native demo registry exposes complete, alphabetically sorted live previews', async () => {
  const module = {exports: await loadShowcaseModule()};
  const {demos} = module.exports;
  const React = appRequire('react');
  const {renderToStaticMarkup} = appRequire('react-dom/server');
  const {LayerProvider} = appRequire('@astryxdesign/core/Layer');
  const {InternationalizationProvider} = appRequire('@astryxdesign/core/i18n');
  for (const demo of demos) {
    const markup = renderToStaticMarkup(
      React.createElement(
        InternationalizationProvider,
        {locale: 'en-US'},
        React.createElement(
          LayerProvider,
          null,
          React.createElement(demo.Preview),
        ),
      ),
    );
    assert.ok(markup.length > 0, `${demo.id}: renders with real providers`);
    assert.doesNotMatch(markup, /<iframe/i);
  }
  assert.ok(demos.length >= 30);
  assert.equal(new Set(demos.map(demo => demo.id)).size, demos.length);
  assert.deepEqual(
    demos.map(demo => demo.name),
    demos.map(demo => demo.name).sort((a, b) => a.localeCompare(b)),
  );
  for (const demo of demos) {
    assert.match(demo.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const field of ['name', 'category', 'description', 'material', 'code'])
      assert.ok(demo[field]?.trim(), `${demo.id}: ${field}`);
    assert.equal(typeof demo.Preview, 'function', demo.id);
    assert.match(demo.code, /<[A-Z]/);
  }
  const source = readFileSync(entry, 'utf8');
  assert.doesNotMatch(
    source,
    /from ['"][^'"]*(?:storybook|stories)|<iframe|alert\(/i,
  );
});
test('native previews bundle real public browser component implementations', async () => {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    platform: 'browser',
    format: 'esm',
    jsx: 'automatic',
    tsconfigRaw: {compilerOptions: {}},
    write: false,
    metafile: true,
    outdir: 'local-baseline/catalog/browser-bundle-fixture',
  });
  const inputs = Object.keys(result.metafile.inputs);
  assert.ok(
    inputs.some(path => /core.*(?:dist|lib)/.test(path)),
    'built Astryx package inputs',
  );
  assert.ok(
    inputs.filter(path => /core.*(?:dist|lib)/.test(path)).length >= 30,
  );
});
