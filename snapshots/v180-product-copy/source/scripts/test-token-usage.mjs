// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import {tokenBreakdown, usageExamples} from '../apps/storybook/vesper/site/token-usage.ts';
const first = tokenBreakdown(usageExamples.first);
const followup = tokenBreakdown(usageExamples.followup);
assert.equal(first.total, 3840);
assert.equal(first.cachedInput, 0);
assert.equal(followup.total, 4480);
assert.equal(followup.uncachedInput + followup.cachedInput, followup.input);
assert.equal(followup.otherOutput + followup.reasoningOutput, followup.output);
assert.equal(tokenBreakdown({input:0, output:0}).total, 0);
assert.equal(tokenBreakdown({input:10, output:5}).cachedInput, undefined);
assert.equal(tokenBreakdown({input:1, cachedInput:2, output:0}), null);
assert.equal(tokenBreakdown({input:1, output:1, reasoningOutput:2}), null);
assert.equal(tokenBreakdown({input:1, output:-1}), null);
assert.equal(tokenBreakdown({input:Infinity, output:1}), null);
assert.equal(tokenBreakdown({input:1.5, output:1}), null);
assert.equal(tokenBreakdown({input:Number.MAX_SAFE_INTEGER, output:1}), null);
console.log('Token usage assertions passed');
