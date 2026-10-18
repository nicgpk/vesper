// SPDX-License-Identifier: MIT
/** @input Native React source and shared Vesper themes. @output Standalone Pages contracts. @position Vesper site verification. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {JSDOM} from 'jsdom';
import {parse} from 'yaml';

const script = path.resolve('scripts/build-vesper-pages.mjs');
test('404 recovery stays in the native component collection', async () => {
  const html = await readFile('.github/vesper-pages/404.html', 'utf8');
  assert.doesNotMatch(html, /storybook/i);
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'https://example.com/vesper/missing?from=old#/components/button',
  });
  const recovery = new URL(
    dom.window.document.querySelector('#collection').href,
  );
  assert.equal(recovery.pathname, '/vesper/');
  assert.equal(recovery.search, '?from=old');
  assert.equal(recovery.hash, '#/components/button');
  dom.window.close();
});
test('native component browser mounts in the page instead of linking to Storybook', async () => {
  const html = await readFile('.github/vesper-pages/index.html', 'utf8');
  const dom = new JSDOM(html);
  assert.ok(dom.window.document.querySelector('#app'));
  assert.ok(dom.window.document.querySelector('script[type="module"]'));
  assert.doesNotMatch(html, /storybook|iframe/i);
  dom.window.close();
});
test('builds real React previews without reading or bundling Storybook', async () => {
  const temp = await mkdtemp(
    path.join(process.env.TMPDIR || tmpdir(), 'vesper-pages-'),
  );
  try {
    const output = path.join(temp, 'site');
    const result = spawnSync(process.execPath, [script, '--out', output], {
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    const catalog = JSON.parse(
      await readFile(path.join(output, 'catalog.json'), 'utf8'),
    );
    assert.ok(Array.isArray(catalog));
    assert.ok(catalog.length >= 30);
    assert.equal(new Set(catalog.map(demo => demo.id)).size, catalog.length);
    const coverage = JSON.parse(
      await readFile(path.join(output, 'coverage.json'), 'utf8'),
    );
    assert.equal(coverage.coveredComponents, coverage.documentedComponents);
    assert.deepEqual(coverage.missing, []);
    assert.deepEqual(coverage.unknown, []);
    assert.deepEqual(coverage.duplicates, []);
    const pages = JSON.parse(
      await readFile(path.join(output, 'component-pages.json'), 'utf8'),
    );
    assert.equal(pages.length, coverage.documentedComponents);
    for (const demo of catalog) {
      assert.ok(demo.name && demo.description && demo.material && demo.code);
      assert.ok(
        demo.covers?.length,
        `${demo.id} needs explicit public component coverage`,
      );
      assert.equal(demo.Preview, undefined);
    }
    const html = await readFile(path.join(output, 'index.html'), 'utf8');
    assert.doesNotMatch(html, /storybook|iframe|\{\{/i);
    const themeCSS = await readFile(path.join(output, 'theme.css'), 'utf8');
    assert.match(
      themeCSS,
      /^:root\[data-theme="contrast"\]/m,
      'Shell tokens must not override nested Theme mode wrappers.',
    );
    const dom = new JSDOM(html);
    for (const element of dom.window.document.querySelectorAll(
      'script[src], link[rel="stylesheet"]',
    )) {
      const asset = element.getAttribute('src') || element.getAttribute('href');
      assert.ok(
        !asset.startsWith('/'),
        'Assets must resolve under a GitHub Pages project prefix.',
      );
      await access(path.join(output, asset));
    }
    dom.window.close();
    assert.equal(await readFile(path.join(output, '.nojekyll'), 'utf8'), '');
    await assert.rejects(access(path.join(output, 'verify.mjs')));
    await assert.rejects(access(path.join(output, 'storybook')));
  } finally {
    await rm(temp, {recursive: true, force: true});
  }
});

test('initial theme handles blocked storage without preventing native app startup', async () => {
  const dom = new JSDOM(
    '<html data-theme="light"><div id="app"></div></html>',
    {runScripts: 'outside-only', url: 'https://example.com/vesper/'},
  );
  const {window} = dom;
  window.matchMedia = () => ({matches: false});
  Object.defineProperty(window, 'localStorage', {
    get() {
      throw new Error('blocked');
    },
  });
  window.eval(await readFile('.github/vesper-pages/theme-init.js', 'utf8'));
  assert.equal(window.document.documentElement.dataset.theme, 'light');
  assert.ok(window.document.querySelector('#app'));
  dom.window.close();
});

test('Vesper alone owns its Pages deploy while upstream compatibility stays excluded', async () => {
  const workflow = parse(
    await readFile('.github/workflows/vesper-pages.yml', 'utf8'),
  );
  assert.match(workflow.jobs.build.if, /github.repository == 'nicgpk\/vesper'/);
  assert.match(
    workflow.jobs.deploy.if,
    /github.repository == 'nicgpk\/vesper'/,
  );
  assert.equal(workflow.jobs.deploy.permissions.pages, 'write');
  assert.equal(workflow.jobs.deploy.permissions['id-token'], 'write');
  assert.equal(workflow.jobs.deploy.environment.name, 'github-pages');
  for (const suite of [
    'vesper-output-path.test.mjs',
    'vesper-power-search.test.mjs',
  ]) {
    assert.ok(
      workflow.jobs.build.steps.some(step => step.run?.includes(suite)),
      `${suite} must run in Pages CI`,
    );
  }
  assert.equal(
    workflow.jobs.build.steps.some(s =>
      s.run?.includes('pnpm storybook:build'),
    ),
    false,
  );
  assert.ok(
    workflow.jobs.build.steps.some(s =>
      s.run?.includes('node scripts/build-vesper-pages.mjs'),
    ),
  );
  const old = parse(
    await readFile('.github/workflows/pages-deploy.yml', 'utf8'),
  );
  assert.match(old.jobs.deploy.if, /github.repository != 'nicgpk\/vesper'/);
});
