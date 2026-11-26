// SPDX-License-Identifier: MIT
/** @input Native notification examples in each Vesper appearance.
 * @output Solid primary semantic-fill, contrast, and inherited-theme receipts.
 * @position Browser regression for notification emphasis, not a new variant API. */
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const origin = process.env.VESPER_PAGES_URL || 'http://127.0.0.1:4175';
const output = 'local-baseline/visual-artifacts/notifications';
await mkdir(output, {recursive: true});
const browser = await chromium.launch({channel: 'chrome'});
const results = [];
try {
  const context = await browser.newContext({
    viewport: {width: 1440, height: 1100},
  });
  const page = await context.newPage();
  for (const theme of ['light', 'dark', 'contrast']) {
    await page.goto(`${origin}/vesper/#/components/banner`);
    await page.getByLabel('Appearance', {exact: true}).selectOption(theme);
    for (const status of ['info', 'success', 'warning', 'error']) {
      await page
        .getByRole('button', {name: `Show ${status} notification`, exact: true})
        .click();
      await page.waitForTimeout(250);
      const banner = page.locator(`.astryx-banner[data-status="${status}"]`);
      await banner.waitFor();
      const paint = await banner.evaluate((element, status) => {
        const style = getComputedStyle(element);
        const tone = status === 'info' ? 'accent' : status;
        const probe = document.createElement('span');
        probe.style.backgroundColor = `var(--color-${tone})`;
        element.append(probe);
        const expected = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return {background: style.backgroundColor, expected};
      }, status);
      assert.equal(paint.background, paint.expected);
      await banner.getByRole('button').first().hover();
      await page
        .locator('.astryx-banner .astryx-tooltip:popover-open')
        .waitFor();
      const scan = await new AxeBuilder({page})
        .include('.preview-scroll')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        scan.violations.map(v => ({
          id: v.id,
          nodes: v.nodes.map(n => n.target),
        })),
        [],
        `${theme}/${status}`,
      );
      await page.screenshot({
        path: `${output}/banner-${theme}-${status}.png`,
        animations: 'disabled',
      });
      results.push({theme, kind: 'banner', status, ...paint});
    }
    await page.goto(`${origin}/vesper/#/components/toast`);
    for (const type of ['info', 'error']) {
      await page
        .getByRole('button', {name: `Show ${type} toast`, exact: true})
        .click();
      await page.waitForTimeout(300);
      const toast = page.locator(`.astryx-toast[data-type="${type}"]`);
      await toast.waitFor();
      const scan = await new AxeBuilder({page})
        .include('.preview-scroll')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        scan.violations.map(v => ({
          id: v.id,
          nodes: v.nodes.map(n => n.target),
        })),
        [],
        `${theme}/toast/${type}`,
      );
      await page.screenshot({
        path: `${output}/toast-${theme}-${type}.png`,
        animations: 'disabled',
      });
      results.push({
        theme,
        kind: 'toast',
        type,
        background: await toast.evaluate(
          e => getComputedStyle(e).backgroundColor,
        ),
      });
    }
    await page.goto(`${origin}/vesper/#/components/theme`);
    const region = page.locator('.preview-scroll .astryx-section');
    await region.waitFor();
    const mode = await region.evaluate(
      element => getComputedStyle(element).colorScheme,
    );
    assert.equal(
      mode,
      theme === 'light' ? 'light' : 'dark',
      'Nested provider must follow page appearance by default',
    );
    await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  }
  console.log(
    JSON.stringify({
      passed: true,
      states: results.length,
      axeScans: results.length,
    }),
  );
} finally {
  await browser.close();
}
