// SPDX-License-Identifier: MIT
/** @input Real media, dense content, and compact-control previews.
 * @output Image/scrim alignment and mobile layout receipts.
 * @position Scoped regressions for authored composition, not private styling. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base = process.env.VESPER_PAGES_URL || 'http://127.0.0.1:4175';
const browser = await chromium.launch({channel: 'chrome'});
try {
  const context = await browser.newContext({
    viewport: {width: 1440, height: 1000},
  });
  const page = await context.newPage();
  await page.goto(`${base}/vesper/#/components/native-media-viewer`);
  const widths = await page.locator('.astryx-overlay').evaluate(e => ({
    overlay: e.getBoundingClientRect().width,
    image: e.querySelector('img').getBoundingClientRect().width,
  }));
  assert.ok(
    Math.abs(widths.overlay - widths.image) < 1,
    `Scrim overhang: ${JSON.stringify(widths)}`,
  );
  await page.setViewportSize({width: 390, height: 1000});
  await page.goto(`${base}/vesper/#/components/chat-reasoning`);
  for (const text of ['contrast_check', 'keyboard_check']) {
    const name = page.locator('.preview-scroll').getByText(text, {exact: true});
    const bounds = await name.evaluate(e => ({
      scroll: e.scrollWidth,
      width: e.clientWidth,
    }));
    assert.ok(
      bounds.scroll <= bounds.width + 1,
      `${text} truncated: ${JSON.stringify(bounds)}`,
    );
  }
  await page.goto(`${base}/vesper/#/components/native-table-composition`);
  const toolbar = page.getByRole('toolbar', {
    name: 'Bulk actions',
    exact: true,
  });
  const toolbarWidth = await toolbar.evaluate(
    e => e.getBoundingClientRect().width,
  );
  assert.ok(
    toolbarWidth >= 440,
    `Toolbar is squeezed independently of table: ${toolbarWidth}`,
  );
  await page
    .locator('.table-preview-scroll')
    .evaluate(e => (e.scrollLeft = 180));
  assert.equal(
    await page.locator('.preview-scroll').evaluate(e => e.scrollLeft),
    0,
    'Only the table pane should scroll',
  );
  await page.goto(`${base}/vesper/#/components/transfer-list`);
  const trigger = page
    .getByRole('button')
    .filter({hasText: '2 visible fields'})
    .first();
  const triggerWidth = await trigger.evaluate(
    e => e.getBoundingClientRect().width,
  );
  const available = await page
    .locator('.transfer-list-preview')
    .evaluate(e => e.getBoundingClientRect().width);
  assert.ok(triggerWidth <= available + 1, 'Picker trigger overflows its host');
  await trigger.click();
  const alpha = await page
    .locator('.astryx-complex-selector-popup:visible')
    .evaluate(e => {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      const ctx = c.getContext('2d');
      ctx.fillStyle = getComputedStyle(e).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      return ctx.getImageData(0, 0, 1, 1).data[3];
    });
  assert.equal(
    alpha,
    255,
    'Dense picker options must not show crisp page text behind them',
  );
  await page.goto(`${base}/vesper/#/components/button`);
  await page.goto(`${base}/vesper/#/components/button-group`);
  const corners = await page
    .locator('.preview-review-actions > .astryx-button')
    .evaluateAll(elements =>
      elements.map(e => {
        const s = getComputedStyle(e);
        return [
          s.borderTopLeftRadius,
          s.borderTopRightRadius,
          s.borderBottomRightRadius,
          s.borderBottomLeftRadius,
        ];
      }),
    );
  assert.deepEqual(
    corners,
    [
      ['12px', '12px', '0px', '0px'],
      ['0px', '0px', '0px', '0px'],
      ['0px', '0px', '12px', '12px'],
    ],
    'Connected buttons must share outer corners rather than individual pills',
  );
  await page.goto(`${base}/vesper/#/components/button`);
  const height = await page
    .locator('.detail-preview .demo-stage')
    .evaluate(e => e.getBoundingClientRect().height);
  assert.ok(
    height <= 280,
    `Compact control has a uniform oversized stage: ${height}`,
  );
  console.log(
    JSON.stringify({
      passed: true,
      mediaWidths: widths,
      chatToolNames: 2,
      compactStageHeight: height,
    }),
  );
} finally {
  await browser.close();
}
