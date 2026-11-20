// SPDX-License-Identifier: MIT
/** @input Served native documentation examples at real desktop/mobile widths.
 * @output Usable workspace widths, bounded shells, and separated inspector copy.
 * @position Visual composition regression beyond route/axe checks. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser = await chromium.launch({channel: 'chrome'});
try {
  const page = await browser.newPage({viewport: {width: 1440, height: 1050}});
  for (const id of [
    'native-layout',
    'app-shell',
    'code-editor',
    'chat-conversation',
    'rich-text-editor',
    'native-table-composition',
  ]) {
    await page.goto(`http://127.0.0.1:4175/vesper/#/components/${id}`);
    const width = await page
      .locator('.demo-content')
      .evaluate(e => e.getBoundingClientRect().width);
    assert.ok(
      width >= 600,
      `${id}: dense composition squeezed to ${width}px while desktop stage has room`,
    );
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({width, height: 1050});
    for (const id of ['app-shell', 'mobile-navigation']) {
      await page.goto(`http://127.0.0.1:4175/vesper/#/components/${id}`);
      const shell = page.locator('.preview-scroll .astryx-app-shell');
      await shell.waitFor();
      assert.equal(
        await shell.evaluate(e => getComputedStyle(e).borderRadius),
        '12px',
        'Bounded app previews need a coherent window silhouette',
      );
      const height = await shell.evaluate(
        e => e.getBoundingClientRect().height,
      );
      assert.ok(
        height <= 420,
        `${id}: full-viewport shell creates ${height}px of empty demo`,
      );
    }
  }
  await page.setViewportSize({width: 1440, height: 1050});
  await page.goto('http://127.0.0.1:4175/vesper/#/components/native-layout');
  const inspector = page
    .locator('.preview-scroll')
    .getByText('Inspector', {exact: true});
  const description = page
    .locator('.preview-scroll')
    .getByText('Drag the handle to resize this panel.', {exact: true});
  const label = await inspector.boundingBox();
  const body = await description.boundingBox();
  assert.ok(
    body.y >= label.y + label.height + 7,
    'Inspector title and body need deliberate vertical spacing',
  );
  console.log(
    JSON.stringify({
      passed: true,
      denseWidths: 6,
      boundedShells: 4,
      inspectorSpacing: 'pass',
    }),
  );
} finally {
  await browser.close();
}
