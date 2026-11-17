// SPDX-License-Identifier: MIT
/**
 * @input Built public Astryx packages, native React demos, and authored Vesper themes.
 * @output A standalone interactive browser in a guarded, non-source output directory.
 * @position Vesper-only static site builder; upstream compatibility pages stay untouched.
 */
import {cp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parseArgs} from 'node:util';
import {build} from 'esbuild';
import {assertCompleteCoverage} from './vesper-component-inventory.mjs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
import {assertSafeOutputPath} from './vesper-output-path.mjs';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const {values} = parseArgs({
  options: {out: {type: 'string'}},
});
const output = path.resolve(
  values.out || path.join(root, 'local-baseline/vesper-pages'),
);
assertSafeOutputPath(root, output);

// Ignore repository TS path aliases: resolve the built public package exports,
// not raw StyleX source. defineTheme is the same inheritance compiler as Storybook.
const module = {
  exports: await loadShowcaseModule(
    "export * from './themes/vesper'; export {demos} from './vesper/site/demos'; export {getComponentPages} from './vesper/site/catalog';",
  ),
};
const themes = [
  ['light', module.exports.vesperLightTheme],
  ['dark', module.exports.vesperDarkTheme],
  ['contrast', module.exports.vesperContrastTheme],
];
const themeCSS = themes
  .map(
    ([name, theme]) =>
      `:root[data-theme="${name}"]{color-scheme:${name === 'light' ? 'light' : 'dark'};${Object.entries(
        {...theme.tokens, ...theme.localTokens},
      )
        .map(([key, value]) => `${key}:${value};`)
        .join('')}}`,
  )
  .join('\n');
const catalog = module.exports.demos.map(({Preview, ...metadata}) => metadata);
const coverage = assertCompleteCoverage(module.exports.demos);
const pages = module.exports
  .getComponentPages(module.exports.demos)
  .map(({id, symbol, label, demo}) => ({
    id,
    symbol,
    label,
    name: demo.id === id ? demo.name : label,
    demoId: demo.id,
  }));
if (
  !catalog.length ||
  new Set(catalog.map(demo => demo.id)).size !== catalog.length
)
  throw new Error('Native demos must have unique, nonempty ids.');
await mkdir(output, {recursive: true});
// Remove only known generated artifacts when upgrading the previous site.
for (const legacy of ['storybook', 'site.js', 'site.css', 'assets']) {
  await rm(path.join(output, legacy), {recursive: true, force: true});
}
const client = await build({
  entryPoints: [path.join(root, 'apps/storybook/vesper/site/main-exact.tsx')],
  bundle: true,
  outdir: output,
  entryNames: 'assets/components-[hash]',
  assetNames: 'assets/[name]-[hash]',
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  minify: true,
  metafile: true,
  target: ['chrome123', 'firefox120', 'safari17.5'],
  define: {'process.env.NODE_ENV': '"production"'},
  tsconfigRaw: {compilerOptions: {}},
  loader: {'.woff2': 'file', '.woff': 'file', '.svg': 'file', '.png': 'file'},
});
const [clientPath, clientInfo] = Object.entries(client.metafile.outputs).find(
  ([name, info]) => name.endsWith('.js') && info.entryPoint,
);
const relativeAsset = file =>
  path.relative(output, path.resolve(file)).split(path.sep).join('/');
const html = (
  await readFile(path.join(root, '.github/vesper-pages/index.html'), 'utf8')
)
  .replaceAll('{{APP_JS}}', relativeAsset(clientPath))
  .replaceAll('{{APP_CSS}}', relativeAsset(clientInfo.cssBundle));
for (const file of ['docs.css', 'preview.css', 'theme-init.js', '404.html']) {
  await cp(
    path.join(root, '.github/vesper-pages', file),
    path.join(output, file),
  );
}
await cp(
  path.join(root, 'apps/storybook/vesper/assets/dunes.jpg'),
  path.join(output, 'dunes.jpg'),
);
await writeFile(path.join(output, 'index.html'), html.replaceAll('Components — Vesper', 'Interaction library').replaceAll("Explore Vesper's real components", 'Explore original interactive components').replaceAll('explore Vesper.', 'explore the library.'));
await writeFile(path.join(output, 'theme.css'), themeCSS);
await writeFile(
  path.join(output, 'catalog.json'),
  JSON.stringify(catalog, null, 2) + '\n',
);
await writeFile(path.join(output, '.nojekyll'), '');
await writeFile(
  path.join(output, 'coverage.json'),
  JSON.stringify(coverage, null, 2),
);
await writeFile(
  path.join(output, 'component-pages.json'),
  JSON.stringify(pages, null, 2),
);
console.log(
  JSON.stringify({
    output,
    components: catalog.length,
    documentedComponents: coverage.documentedComponents,
    coveredComponents: coverage.coveredComponents,
    standalone: true,
  }),
);
