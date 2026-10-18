// SPDX-License-Identifier: MIT
/**
 * @input A built native Vesper site served locally in installed Chrome.
 * @output Regression receipts for shadow breathing room and rounded preview clipping.
 * @position Showcase-only visual geometry checks, complementary to screenshot review.
 */
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const origin = process.env.VESPER_PAGES_URL || 'http://127.0.0.1:4175';
const output = 'local-baseline/visual-artifacts/geometry';
await mkdir(output, {recursive: true});
const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--enable-unsafe-swiftshader'],
});
const cases = [];
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({width, height: 1000});
    for (const theme of ['light', 'dark', 'contrast']) {
      for (const id of [
        'button',
        'text-input',
        'text-area',
        'card',
        'avatar',
        'avatar-group',
        'selector',
        'dropdown-menu',
        'switch',
        'checkbox',
        'tab-list',
      ]) {
        await page.goto(`${origin}/vesper/#/components/${id}`);
        await page.getByLabel('Appearance', {exact: true}).selectOption(theme);
        const backing = page.locator('.preview-backing');
        await backing.waitFor();
        const geometry = await backing.evaluate(card => {
          const viewport = card.querySelector('.preview-scroll');
          const style = getComputedStyle(viewport);
          const rect = viewport.getBoundingClientRect();
          const surfaces = [...viewport.querySelectorAll('*')].filter(
            element => {
              const box = element.getBoundingClientRect();
              return (
                box.width > 0 &&
                box.height > 0 &&
                getComputedStyle(element).boxShadow !== 'none'
              );
            },
          );
          return {
            overflow: getComputedStyle(card).overflow,
            radius: getComputedStyle(card).borderRadius,
            viewportRadius: style.borderRadius,
            inset: [
              style.paddingTop,
              style.paddingRight,
              style.paddingBottom,
              style.paddingLeft,
            ].map(Number.parseFloat),
            topClearance: surfaces.length
              ? Math.min(
                  ...surfaces.map(
                    element => element.getBoundingClientRect().top - rect.top,
                  ),
                )
              : null,
            bottomClearance: surfaces.length
              ? Math.min(
                  ...surfaces.map(
                    element =>
                      rect.bottom - element.getBoundingClientRect().bottom,
                  ),
                )
              : null,
          };
        });
        cases.push({id, theme, width, ...geometry});
        await writeFile(`${output}/cases.json`, JSON.stringify(cases, null, 2));
        assert.ok(
          geometry.inset.every(value => value >= 24),
          `${id}/${theme}/${width}: scroll viewport clips edge paint without internal breathing room: ${JSON.stringify(geometry)}`,
        );
        assert.equal(
          geometry.overflow,
          'visible',
          `${id}: backing must not clip escaping paint`,
        );
        assert.equal(
          geometry.viewportRadius,
          geometry.radius,
          `${id}: clipping viewport must follow the backing's rounded outline`,
        );
        if (geometry.topClearance !== null) {
          assert.ok(
            geometry.topClearance >= 16,
            `${id}: top shadow clipped (${geometry.topClearance}px)`,
          );
          assert.ok(
            geometry.bottomClearance >= 16,
            `${id}: bottom shadow clipped (${geometry.bottomClearance}px)`,
          );
        }
      }
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({passed: true, cases: cases.length, errors}, null, 2),
  );
  console.log(JSON.stringify({passed: true, cases: cases.length, errors}));
} finally {
  await browser.close();
}
