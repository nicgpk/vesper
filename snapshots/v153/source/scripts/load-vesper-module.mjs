// SPDX-License-Identifier: MIT
/**
 * @input Authored showcase exports and installed public ESM packages.
 * @output Asynchronously loaded metadata/preview exports, including Vega's async graph.
 * @position Node-only build/test loader; avoids requiring ESM with top-level await.
 */
import {build} from 'esbuild';

import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const appRoot = path.join(root, 'apps/storybook');

export async function loadShowcaseModule(
  contents = "export {demos} from './vesper/site/demos';",
) {
  const compiled = await build({
    stdin: {contents, resolveDir: appRoot, loader: 'ts'},
    bundle: true,
    packages: 'external',
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    write: false,
    tsconfigRaw: {compilerOptions: {}},
    loader: {'.css': 'empty'},
  });
  // Native ESM resolution must run in the application's package context so
  // conditional exports choose import builds (Lexical) and allow async Vega.
  const cache = path.join(appRoot, 'node_modules/.cache/vesper');
  await mkdir(cache, {recursive: true});
  const directory = await mkdtemp(path.join(cache, 'showcase-'));
  const file = path.join(directory, 'exports.mjs');
  try {
    await writeFile(file, compiled.outputFiles[0].text);
    return await import(pathToFileURL(file).href);
  } finally {
    await rm(directory, {recursive: true, force: true});
  }
}
