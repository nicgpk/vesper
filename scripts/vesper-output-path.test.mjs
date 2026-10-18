// SPDX-License-Identifier: MIT
/**
 * @input Pure path strings, never cleanup targets.
 * @output Cross-platform output-boundary regression coverage.
 * @position Vesper build safety tests; no filesystem writes or CLI invocation.
 */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import path from 'node:path';
import {assertSafeOutputPath} from './vesper-output-path.mjs';

test('rejects filesystem roots before any cleanup (POSIX, drives, UNC)', () => {
  for (const [api, root, output] of [
    [path.posix, '/work/repo', '/'],
    [path.win32, 'C:/work/repo', 'C:/'],
    [path.win32, 'C:/work/repo', 'D:/'],
    [path.win32, '//server/share/work/repo', '//server/share/'],
    [path.win32, 'C:/work/repo', '//other/share/'],
  ]) {
    assert.throws(
      () => assertSafeOutputPath(root, output, api),
      undefined,
      output,
    );
  }
});

for (const [name, api, root, rejected, permitted] of [
  [
    'POSIX',
    path.posix,
    '/work/repo',
    [
      '/work/repo',
      '/work',
      '/work/repo/src',
      '/work/repo/local-baseline',
      '/work/repo/local-baseline-other/site',
      '/work/repo/local-baseline/../src',
    ],
    [
      '/work/repo/local-baseline/site',
      '/work/repo/local-baseline/..cache',
      '/work/site',
      '/work/repository/site',
      '/external/site',
    ],
  ],
  [
    'Windows',
    path.win32,
    'C:/Work/Repo',
    [
      'c:/work/repo',
      'c:/WORK',
      'C:/work/repo/src',
      'c:/work/repo/LOCAL-BASELINE',
      'c:/work/repo/local-baseline-other/site',
      'c:/work/repo/local-baseline/../src',
    ],
    [
      'c:/work/repo/LOCAL-BASELINE/site',
      'c:/work/site',
      'C:/Work/Repository/site',
      'D:/build/site',
      '//server/share/build',
    ],
  ],
  [
    'UNC',
    path.win32,
    '//Server/Share/work/repo',
    [
      '//server/SHARE/work/repo',
      '//server/share/WORK',
      '//server/share/work/repo/src',
      '//server/share/work/repo/local-baseline',
    ],
    [
      '//server/share/work/repo/local-baseline/site',
      '//server/share/work/site',
      '//server/other/build',
      '//other/share/build',
      'D:/build/site',
    ],
  ],
]) {
  test(`${name}: rejects repository ancestors and source outputs`, () => {
    for (const output of rejected) {
      assert.throws(
        () => assertSafeOutputPath(root, output, api),
        /Output must be outside source files/,
        output,
      );
    }
  });
  test(`${name}: permits baseline descendants and external build directories`, () => {
    for (const output of permitted) {
      assert.doesNotThrow(
        () => assertSafeOutputPath(root, output, api),
        output,
      );
    }
  });
}
