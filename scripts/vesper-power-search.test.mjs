// SPDX-License-Identifier: MIT
/**
 * @input Native PowerSearch preview exports and configured status filters.
 * @output Regression coverage for actual local result records and feedback.
 * @position Vesper PowerSearch demo tests, independent of any generated site.
 */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {loadShowcaseModule} from './load-vesper-module.mjs';

const demoModule = await loadShowcaseModule(
  "export * from './vesper/site/coreContentDemos';",
);
const status = value => ({
  field: 'status',
  operator: 'is',
  value: {type: 'enum', value},
});

test('In review returns the usage guide, not ready release notes', () => {
  assert.equal(
    typeof demoModule.getPowerSearchResults,
    'function',
    'preview must derive actual result records',
  );
  assert.deepEqual(demoModule.getPowerSearchResults([status('review')]), [
    {title: 'Usage guide', status: 'review'},
  ]);
});

test('ready returns only ready release notes', () => {
  assert.deepEqual(demoModule.getPowerSearchResults([status('ready')]), [
    {title: 'Release notes', status: 'ready'},
  ]);
});

test('clearing filters returns both original records', () => {
  assert.deepEqual(demoModule.getPowerSearchResults([]), [
    {title: 'Release notes', status: 'ready'},
    {title: 'Usage guide', status: 'review'},
  ]);
});

test('multiple status filters use AND, including contradictory filters', () => {
  assert.deepEqual(
    demoModule.getPowerSearchResults([status('review'), status('review')]),
    [{title: 'Usage guide', status: 'review'}],
  );
  assert.deepEqual(
    demoModule.getPowerSearchResults([status('ready'), status('review')]),
    [],
  );
  assert.deepEqual(
    demoModule.getPowerSearchResults([status('review'), status('ready')]),
    [],
  );
});

test('unknown values, fields, operators and value types produce zero results', () => {
  const unknowns = [
    status('unknown'),
    {...status('ready'), field: 'unknown'},
    {...status('ready'), operator: 'unknown'},
    {...status('ready'), value: {type: 'string', value: 'ready'}},
  ];
  for (const filter of unknowns) {
    assert.deepEqual(demoModule.getPowerSearchResults([filter]), []);
    assert.deepEqual(
      demoModule.getPowerSearchResults([status('ready'), filter]),
      [],
    );
  }
});

test('usage snippet counts actual results instead of active filters', () => {
  const demo = demoModule.coreContentDemos.find(
    demo => demo.id === 'native-power-search',
  );
  assert.match(demo.code, /const results = getPowerSearchResults\(filters\)/);
  assert.match(demo.code, /resultCount=\{results.length\}/);
  assert.doesNotMatch(demo.code, /filters.length/);
});
