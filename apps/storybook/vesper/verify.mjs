// SPDX-License-Identifier: MIT
/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
/**
 * @input A running Storybook URL, optionally passed as the first argument.
 * @output Browser assertions, screenshots, and a JSON receipt in local-baseline/glass.
 * @position Reproducible Vesper sample-page interaction and material verification.
 */
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const base = process.argv[2] || 'http://localhost:6006';
const out = 'local-baseline/glass';
await mkdir(out, {recursive: true});
const browser = await chromium.launch({channel: 'chrome', headless: true});
const results = [];
try {
  for (const theme of ['vesper-light', 'vesper-dark', 'vesper-contrast']) {
    const page = await browser.newPage({viewport: {width: 1440, height: 1050}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(
      `${base}/iframe.html?id=core-themes-vesper--overview&viewMode=story&globals=astryxTheme:${theme}`,
    );
    await page
      .getByRole('heading', {name: 'A lighter kind of interface.'})
      .waitFor();
    assert.equal(await page.locator('main section').count(), 18);
    assert.equal(
      await page
        .locator('main img')
        .evaluateAll(images =>
          images.every(i => i.complete && i.naturalWidth > 0),
        ),
      true,
    );
    await page
      .getByRole('checkbox', {name: 'Partially selected', exact: true})
      .click();
    assert.equal(
      await page
        .getByRole('checkbox', {name: 'Partially selected', exact: true})
        .isChecked(),
      true,
    );
    assert.equal(
      await page
        .getByRole('checkbox', {name: 'Partially selected', exact: true})
        .evaluate(e => e.indeterminate),
      false,
    );
    await page
      .getByRole('textbox', {name: 'Collection name', exact: true})
      .fill('Dune study');
    await page.getByRole('button', {name: 'Save changes', exact: true}).click();
    await page.getByRole('button', {name: 'Saved', exact: true}).waitFor();
    assert.match(await page.locator('footer').innerText(), /Dune study/);
    await page.getByRole('switch', {name: 'Bluetooth', exact: true}).click();
    assert.equal(
      await page
        .getByRole('switch', {name: 'Bluetooth', exact: true})
        .isChecked(),
      true,
    );
    const slider = page.getByRole('slider', {name: 'Volume', exact: true});
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await slider.getAttribute('aria-valuenow'), '63');
    await page.getByRole('tab', {name: 'Tint', exact: true}).click();
    assert.equal(
      await page
        .getByRole('tab', {name: 'Tint', exact: true})
        .getAttribute('aria-selected'),
      'true',
    );
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    assert.equal(
      await page
        .getByRole('tab', {name: 'Rim', exact: true})
        .getAttribute('aria-selected'),
      'true',
    );
    await page
      .getByRole('button', {name: 'What about accessibility?', exact: true})
      .click();
    await page
      .getByText('Keyboard controls stay native.', {exact: false})
      .waitFor();
    await page
      .getByRole('button', {name: 'Share collection', exact: true})
      .click();
    const dialog = page.getByRole('dialog', {
      name: 'Share collection',
      exact: true,
    });
    await dialog.waitFor();
    assert.match(await dialog.innerText(), /Dune study/);
    await page.keyboard.press('Escape');
    await dialog.waitFor({state: 'hidden'});
    assert.equal(
      await page
        .getByRole('button', {name: 'Share collection', exact: true})
        .evaluate(e => e === document.activeElement),
      true,
    );
    await page
      .getByRole('button', {name: 'Notifications', exact: true})
      .click();
    await page
      .getByRole('dialog', {name: 'Notifications', exact: true})
      .waitFor();
    await page.keyboard.press('Escape');
    await page
      .getByRole('dialog', {name: 'Notifications', exact: true})
      .waitFor({state: 'hidden'});
    await page
      .getByRole('combobox', {name: 'Surface profile', exact: true})
      .click();
    await page.getByRole('option', {name: 'Capsule', exact: true}).click();
    assert.match(
      await page
        .getByRole('combobox', {name: 'Surface profile', exact: true})
        .innerText(),
      /Capsule/,
    );
    const quantity = page.getByRole('spinbutton', {
      name: 'Edition size',
      exact: true,
    });
    await quantity.fill('18');
    await quantity.press('Enter');
    assert.equal(await quantity.inputValue(), '18');
    await page
      .getByRole('textbox', {name: 'Collection notes', exact: true})
      .fill('Verified glass controls.');
    await page.getByRole('radio', {name: 'List', exact: true}).click();
    assert.equal(
      await page.getByRole('radio', {name: 'List', exact: true}).isChecked(),
      true,
    );
    await page
      .getByRole('button', {name: 'Collection actions', exact: true})
      .click();
    await page
      .getByRole('menuitem', {name: 'Preview collection', exact: true})
      .click();
    await dialog.waitFor();
    await page.keyboard.press('Escape');
    for (const selector of [
      '.astryx-number-input',
      '.astryx-date-input',
      '.astryx-text-area',
      '.astryx-multi-selector',
    ]) {
      const blur = await page
        .locator(selector)
        .first()
        .evaluate(e => getComputedStyle(e).backdropFilter);
      assert.match(
        blur,
        /blur\(12px\)/,
        `${theme}: ${selector} must use the shared material`,
      );
    }
    const material = await page
      .locator('.astryx-button[data-variant="secondary"]')
      .first()
      .evaluate(e => ({
        background: getComputedStyle(e).backgroundColor,
        blur: getComputedStyle(e).backdropFilter,
        shadow: getComputedStyle(e).boxShadow,
        radius: getComputedStyle(e).borderRadius,
      }));
    assert.equal(material.radius, '12px');
    if (theme === 'vesper-contrast')
      assert.equal(material.background, 'rgb(17, 24, 29)');
    else assert.match(material.blur, /blur\(12px\)/);
    await page.screenshot({
      path: `${out}/${theme}-desktop.png`,
      fullPage: true,
    });
    for (const width of [390, 320]) {
      await page.setViewportSize({width, height: 844});
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
        `${theme}: horizontal overflow at ${width}`,
      );
      await page.screenshot({
        path: `${out}/${theme}-${width}.png`,
        fullPage: true,
      });
    }
    assert.deepEqual(errors, []);
    results.push({
      theme,
      material,
      desktop: 'pass',
      mobile390: 'pass',
      mobile320: 'pass',
      interactions: 'pass',
      pageErrors: errors,
    });
    await page.close();
  }
  await writeFile(
    `${out}/browser-results.json`,
    JSON.stringify(results, null, 2),
  );
  console.log(
    JSON.stringify(
      {status: 'passed', themes: results.length, results},
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
