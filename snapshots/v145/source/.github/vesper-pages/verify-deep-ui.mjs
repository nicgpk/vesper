// SPDX-License-Identifier: MIT
/** @input First-load native previews, not a pre-warmed theme-switching session.
 * @output Real HoverCard, sheet, clipboard and Toast ink evidence.
 * @position Deep interaction regressions complementary to catalog route sweeps. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir, writeFile} from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const base = process.env.VESPER_PAGES_URL || 'http://127.0.0.1:4175';
const output = 'local-baseline/deep-ui/final-interactions';
await mkdir(output, {recursive: true});
const browser = await chromium.launch({channel: 'chrome'});
const receipts = [];
try {
  for (const theme of ['light', 'dark', 'contrast']) {
    const context = await browser.newContext({
      viewport: {width: 390, height: 1000},
      colorScheme: theme === 'light' ? 'light' : 'dark',
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    await context.addInitScript(
      value => localStorage.setItem('vesper-pages-theme', value),
      theme,
    );
    const page = await context.newPage();
    await page.goto(`${base}/vesper/#/components/toast`);
    for (const type of ['info', 'error']) {
      if (type === 'error')
        await page
          .getByRole('button', {name: 'Show error toast', exact: true})
          .click();
      const toast = page.locator('.astryx-toast');
      await toast.waitFor();
      await page.waitForTimeout(350);
      const body = toast.getByText(
        type === 'info'
          ? 'Collection saved. This preview keeps the notification until dismissed.'
          : 'Collection could not be saved. Try again.',
        {exact: true},
      );
      const ink = await body.evaluate(e => getComputedStyle(e).color);
      assert.equal(
        ink,
        theme === 'contrast' ? 'rgb(8, 11, 13)' : 'rgb(255, 255, 255)',
        `${theme}/${type}: first-route Toast body has wrong ink`,
      );
      const scan = await new AxeBuilder({page})
        .include('.preview-scroll')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        scan.violations.map(v => v.id),
        [],
      );
      await page.screenshot({
        path: `${output}/toast-${theme}-${type}.png`,
        animations: 'disabled',
      });
      receipts.push({theme, type, ink});
    }
    for (const width of [1440, 390]) {
      await page.setViewportSize({width, height: 1000});
      await page.goto(`${base}/vesper/#/components/hover-card`);
      await page
        .getByRole('button', {name: 'Riley Morgan', exact: true})
        .focus();
      await page
        .getByRole('dialog', {name: 'Riley Morgan profile', exact: true})
        .waitFor({timeout: 4000});
      await page.reload();
      await page
        .getByRole('button', {name: 'Riley Morgan', exact: true})
        .hover();
      await page
        .getByRole('dialog', {name: 'Riley Morgan profile', exact: true})
        .waitFor({timeout: 4000});
      await page.screenshot({
        path: `${output}/hover-${theme}-${width}.png`,
        animations: 'disabled',
      });
      await page.goto(`${base}/vesper/#/components/bottom-sheet`);
      await page
        .getByRole('button', {name: 'Collection filters', exact: true})
        .click();
      const sheet = page.getByRole('dialog', {
        name: 'Collection filters',
        exact: true,
      });
      const title = sheet.getByRole('heading', {
        name: 'Collection filters',
        exact: true,
      });
      const frame = await sheet.boundingBox();
      const heading = await title.boundingBox();
      assert.ok(
        heading.y - frame.y >= 24,
        'Sheet title is under the grab-handle band',
      );
      await page.screenshot({
        path: `${output}/sheet-${theme}-${width}.png`,
        animations: 'disabled',
      });
      receipts.push({
        theme,
        width,
        hover: 'open',
        keyboard: 'open',
        sheetTitleInset: heading.y - frame.y,
      });
    }
    await page.goto(`${base}/vesper/#/components/icon-button`);
    await page
      .getByRole('button', {name: 'Copy collection link', exact: true})
      .click();
    await page.getByText('Collection link copied.', {exact: true}).waitFor();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(new URL(copied).hash, '#/components/card');
    await context.close();
    await writeFile(
      `${output}/results.json`,
      JSON.stringify(receipts, null, 2),
    );
  }
  for (const theme of ['light', 'dark', 'contrast']) {
    const context = await browser.newContext({
      viewport: {width: 390, height: 1000},
      hasTouch: true,
      isMobile: true,
    });
    await context.addInitScript(
      value => localStorage.setItem('vesper-pages-theme', value),
      theme,
    );
    const page = await context.newPage();
    await page.goto(`${base}/vesper/#/components/hover-card`);
    await page.getByRole('button', {name: 'Riley Morgan', exact: true}).tap();
    await page
      .getByRole('dialog', {name: 'Riley Morgan profile', exact: true})
      .waitFor({timeout: 4000});
    await page.screenshot({
      path: `${output}/hover-touch-${theme}.png`,
      animations: 'disabled',
    });
    receipts.push({theme, touch: 'open'});
    await context.close();
  }
  await writeFile(`${output}/results.json`, JSON.stringify(receipts, null, 2));
  console.log(
    JSON.stringify({
      passed: true,
      freshToastStates: receipts.filter(r => r.type).length,
      hoverAndSheetCases: receipts.filter(r => r.hover).length,
      touchCases: receipts.filter(r => r.touch).length,
      clipboardCases: 3,
    }),
  );
} finally {
  await browser.close();
}
