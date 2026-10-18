// SPDX-License-Identifier: MIT
/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
/**
 * @input A running Storybook with Vesper themes.
 * @output Evidence that glass preserves semantic colors, ghost variants and overlays.
 * @position Focused browser regressions complementing the catalog render sweep.
 */
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base = process.argv[2] || 'http://localhost:6006';
const out = 'local-baseline/catalog/semantics';
await mkdir(out, {recursive: true});
const browser = await chromium.launch({channel: 'chrome'});
const context = await browser.newContext({
  viewport: {width: 1200, height: 900},
  reducedMotion: 'reduce',
});
const results = [];
try {
  for (const theme of ['vesper-light', 'vesper-dark', 'vesper-contrast']) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    async function open(id) {
      await page.goto(
        `${base}/iframe.html?id=${id}&viewMode=story&globals=astryxTheme:${theme}`,
      );
      await page.locator('#storybook-root > *').first().waitFor();
    }
    for (const component of ['textinput', 'numberinput', 'dateinput']) {
      await open(
        `core-${component}--${component === 'dateinput' ? 'with-' : ''}error-status`,
      );
      const target = page
        .locator(
          `.astryx-${component.replace('input', '-input')}[data-status="error"]`,
        )
        .first();
      await target.waitFor();
      assert.equal(
        await target.evaluate(e => {
          const probe = document.createElement('span');
          probe.style.color = 'var(--color-error)';
          e.append(probe);
          const matches =
            getComputedStyle(e).borderTopColor ===
            getComputedStyle(probe).color;
          probe.remove();
          return matches;
        }),
        true,
        `${theme}: ${component} must keep its error border`,
      );
    }
    await open('core-card--color-variants');

    for (const color of ['blue', 'red', 'green']) {
      const card = page
        .locator(`.astryx-card[data-variant="${color}"]`)
        .first();
      assert.equal(
        await card.evaluate((e, color) => {
          const probe = document.createElement('span');
          probe.style.backgroundColor = `var(--color-background-${color})`;
          e.append(probe);
          const matches =
            getComputedStyle(e).backgroundColor ===
            getComputedStyle(probe).backgroundColor;
          probe.remove();
          return matches;
        }, color),
        true,
        `${theme}: ${color} categorical fill`,
      );
    }
    await open('core-selector--ghost-variant');
    assert.equal(
      await page
        .locator('.astryx-selector[data-variant="ghost"]')
        .first()
        .evaluate(e => getComputedStyle(e).backdropFilter),
      'none',
    );
    for (const {id, target, trigger, hover} of [
      {
        id: 'core-dropdownmenu--default',
        target: 'dropdown-menu',
        trigger: 'Actions',
      },
      {
        id: 'core-hovercard--default',
        target: 'hover-card',
        trigger: 'Hover me',
        hover: true,
      },
      {
        id: 'core-tooltip--default',
        target: 'tooltip',
        trigger: 'Hover me',
        hover: true,
      },
      {
        id: 'core-bottomsheet--showcase',
        target: 'bottom-sheet',
        trigger: 'Open sheet',
      },
    ]) {
      await open(id);
      const control = page.getByRole('button', {name: trigger, exact: true});
      if (hover) await control.hover();
      else await control.click();
      const surface = page
        .locator(`.astryx-${target}`)
        .filter({visible: true})
        .first();
      await surface.waitFor();
      assert.match(
        await surface.evaluate(e => getComputedStyle(e).backdropFilter),
        /blur\(24px\)/,
      );
      await page.screenshot({
        path: `${out}/${theme}-${target}.png`,
        animations: 'disabled',
      });
      await page.keyboard.press('Escape');
    }
    await open('core-togglebutton--with-label');
    const toggle = page.getByRole('button', {pressed: false}).first();
    await toggle.click();
    const pressed = page.getByRole('button', {pressed: true}).first();
    assert.equal(
      await pressed.evaluate(e => getComputedStyle(e).backdropFilter),
      'none',
    );
    assert.equal(
      await pressed.evaluate(e => getComputedStyle(e).backgroundImage),
      'none',
    );
    assert.deepEqual(errors, []);
    results.push({
      theme,
      validation: 'pass',
      categoricalCards: 'pass',
      ghostSelectors: 'pass',
      solidToggles: 'pass',
      overlays: 'pass',
      errors,
    });
    await page.close();
  }
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
