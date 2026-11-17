// SPDX-License-Identifier: MIT
/** @input Vesper Timer/TimeInput compositions and shared success colors.
 * @output Responsive alignment, live timing, editable time and bright-status evidence.
 * @position Browser regression for focused time-control UI quality. */
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const origin = process.env.VESPER_PAGES_URL || 'http://127.0.0.1:4175';
const output = 'local-baseline/time-ui';
await mkdir(output, {recursive: true});
const browser = await chromium.launch({channel: 'chrome'});
const cases = [];
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const width of [390, 1440])
    for (const theme of ['light', 'dark', 'contrast']) {
      await page.setViewportSize({width, height: 1000});
      await page.goto(`${origin}/vesper/#/components/timer`);
      await page.getByLabel('Appearance', {exact: true}).selectOption(theme);
      const green = await page
        .locator('.preview-scroll .astryx-status-dot')
        .evaluate(e => {
          const probe = document.createElement('span');
          probe.style.backgroundColor = 'var(--vesper-notification-success)';
          e.append(probe);
          const expected = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return {actual: getComputedStyle(e).backgroundColor, expected};
        });
      assert.equal(
        green.actual,
        green.expected,
        'Status green still differs from the bright primary notification green',
      );
      assert.equal(
        await page.locator('.progress-summary').count(),
        1,
        'Timer needs an intentional summary layout',
      );
      const timer = page.locator('.preview-scroll .astryx-timer');
      const spinnerInk = await page
        .locator('.progress-activity .astryx-spinner circle')
        .last()
        .evaluate(e => getComputedStyle(e).stroke);
      assert.equal(
        spinnerInk,
        theme === 'contrast' ? 'rgb(8, 11, 13)' : 'rgb(255, 255, 255)',
        'Sync icon must use readable on-accent ink',
      );
      assert.ok(
        (await timer.evaluate(e => parseFloat(getComputedStyle(e).fontSize))) >=
          14,
        'Timer is undersized',
      );
      const before = await timer.innerText();
      await page.waitForTimeout(1100);
      assert.notEqual(await timer.innerText(), before, 'Timer does not tick');
      await page
        .getByRole('button', {name: 'Restart timer', exact: true})
        .click();
      await page
        .locator('.preview-scroll')
        .getByText('0:00', {exact: true})
        .waitFor();
      await page.screenshot({
        path: `${output}/timer-${width}-${theme}.png`,
        fullPage: true,
        animations: 'disabled',
      });
      const timerScan = await new AxeBuilder({page})
        .include('.preview-scroll')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        timerScan.violations.map(v => v.id),
        [],
      );
      await page.goto(`${origin}/vesper/#/components/time-input`);
      const field = page.getByRole('textbox', {
        name: 'Publication time',
        exact: true,
      });
      assert.equal(
        await field.inputValue(),
        '09:30',
        'Time example needs a meaningful initial value',
      );
      await field.fill('14:45');
      await field.press('Tab');
      assert.ok(
        (
          await page.locator('.preview-scroll .demo-result').innerText()
        ).includes('14:45'),
      );
      const geometry = await page.locator('.preview-scroll').evaluate(root => {
        const time = root.querySelector('.astryx-time-input');
        const selector = root.querySelector('.astryx-selector');
        const joined = root.querySelector(
          '.astryx-input-group .astryx-text-input',
        );
        return {
          time: time.getBoundingClientRect().height,
          selector: selector.getBoundingClientRect().height,
          left: getComputedStyle(joined).borderTopLeftRadius,
          right: getComputedStyle(joined).borderTopRightRadius,
        };
      });
      assert.ok(
        Math.abs(geometry.time - geometry.selector) <= 1,
        'Time and adjacent control heights differ',
      );
      assert.equal(
        geometry.left,
        '0px',
        'Grouped input must not have a separate rounded left edge',
      );
      assert.equal(geometry.right, '12px');
      await page.screenshot({
        path: `${output}/input-${width}-${theme}.png`,
        fullPage: true,
        animations: 'disabled',
      });
      const inputScan = await new AxeBuilder({page})
        .include('.preview-scroll')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        inputScan.violations.map(v => v.id),
        [],
      );
      cases.push({
        width,
        theme,
        green,
        geometry,
        timer: 'ticks and restarts',
        time: 'editable',
      });
    }
  await writeFile(`${output}/results.json`, JSON.stringify(cases, null, 2));
  console.log(
    JSON.stringify({
      passed: true,
      cases: cases.length,
      axeScans: cases.length * 2,
    }),
  );
} finally {
  await browser.close();
}
