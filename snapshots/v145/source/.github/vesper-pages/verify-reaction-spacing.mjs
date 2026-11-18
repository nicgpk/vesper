// SPDX-License-Identifier: MIT
/** @input Served native chat reaction example in each appearance and viewport.
 * @output Actual bubble-to-pill clearance and working reaction interactions.
 * @position Regression for reaction spacing, not a blanket metadata gap. */
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const origin = process.env.VESPER_PAGES_URL || 'http://127.0.0.1:4175';
const output = 'local-baseline/reaction-spacing';
await mkdir(output, {recursive: true});
const browser = await chromium.launch({channel: 'chrome'});
const cases = [];
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const width of [390, 1440])
    for (const theme of ['light', 'dark', 'contrast']) {
      await page.setViewportSize({width, height: 1000});
      await page.goto(`${origin}/vesper/#/components/chat-reactions`);
      await page.getByLabel('Appearance', {exact: true}).selectOption(theme);
      const bubble = page.locator(
        '.preview-scroll .astryx-chat-message-bubble',
      );
      const reactions = page.locator(
        '.preview-scroll .astryx-chat-reaction-bar',
      );
      await reactions.scrollIntoViewIfNeeded();
      const b = await bubble.boundingBox();
      const pill = await reactions.getByRole('button').first().boundingBox();
      const gap = pill.y - (b.y + b.height);
      assert.ok(
        gap >= 6 && gap <= 8,
        `${width}/${theme}: expected a compact 6–8px reaction gap, got ${gap}px`,
      );
      const button = reactions.getByRole('button').first();
      const before = await button.getAttribute('aria-pressed');
      await button.click();
      assert.notEqual(
        await button.getAttribute('aria-pressed'),
        before,
        'Reaction toggle no longer works',
      );
      await page.screenshot({
        path: `${output}/${width}-${theme}.png`,
        fullPage: true,
        animations: 'disabled',
      });
      cases.push({width, theme, gap, toggle: 'pass'});
    }
  await writeFile(`${output}/results.json`, JSON.stringify(cases, null, 2));
  console.log(
    JSON.stringify({
      passed: true,
      cases: cases.length,
      gaps: cases.map(c => c.gap),
    }),
  );
} finally {
  await browser.close();
}
