// SPDX-License-Identifier: MIT
/** @input Served public AvatarGroup and Schedule native examples.
 * @output Browser proofs for native geometry, visible presence, and readable headers.
 * @position Targeted visual regressions, not replacements for screenshot review. */
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const origin = process.env.VESPER_PAGES_URL || 'http://127.0.0.1:4175';
const output = 'local-baseline/visual-artifacts/component-regressions';
await mkdir(output, {recursive: true});
const browser = await chromium.launch({channel: 'chrome'});
const cases = [];
try {
  const page = await browser.newPage();
  for (const width of [1440, 390]) {
    await page.setViewportSize({width, height: 1000});
    for (const theme of ['light', 'dark', 'contrast']) {
      await page.goto(`${origin}/vesper/#/components/avatar-group`);
      await page.getByLabel('Appearance', {exact: true}).selectOption(theme);
      const group = page.locator('.preview-scroll .astryx-avatar-group');
      await group.scrollIntoViewIfNeeded();
      const avatar = await group.evaluate(group => {
        const member = group.querySelector('.astryx-avatar');
        const overflow = group.querySelector('.astryx-avatar-group-overflow');
        const dot = group.querySelector('.astryx-avatar-status-dot');
        const rect = dot.getBoundingClientRect();
        const hit = document.elementFromPoint(
          rect.right - 1,
          rect.top + rect.height / 2,
        );
        return {
          boxSizing: getComputedStyle(member).boxSizing,
          width: member.getBoundingClientRect().width,
          overflowWidth: overflow.getBoundingClientRect().width,
          overflowFont: parseFloat(getComputedStyle(overflow).fontSize),
          statusVisible: dot.contains(hit),
        };
      });
      assert.equal(
        avatar.boxSizing,
        'content-box',
        'Docs resets must not override native avatar geometry',
      );
      assert.equal(avatar.width, avatar.overflowWidth);
      assert.ok(
        Math.abs(avatar.overflowFont - 48 * 0.35) < 0.1,
        'Native proportional overflow font must win over docs font reset',
      );
      assert.ok(
        avatar.statusVisible,
        'Neighboring avatar occludes the presence dot',
      );
      await page.screenshot({
        path: `${output}/avatar-${theme}-${width}.png`,
        animations: 'disabled',
      });
      await page.goto(`${origin}/vesper/#/components/schedule`);
      const schedule = page.locator('.preview-scroll .astryx-schedule');
      await schedule.scrollIntoViewIfNeeded();
      const overlap = await schedule.evaluate(schedule => {
        const heading = schedule
          .querySelector('.astryx-heading.level-2')
          .getBoundingClientRect();
        const controls = schedule
          .querySelector('.astryx-button-group')
          .getBoundingClientRect();
        return (
          Math.min(heading.right, controls.right) >
            Math.max(heading.left, controls.left) &&
          Math.min(heading.bottom, controls.bottom) >
            Math.max(heading.top, controls.top)
        );
      });
      assert.equal(
        overlap,
        false,
        'Schedule heading intersects navigation controls',
      );
      await page.screenshot({
        path: `${output}/schedule-${theme}-${width}.png`,
        animations: 'disabled',
      });
      cases.push({theme, width, avatar, scheduleOverlap: overlap});
      await writeFile(`${output}/cases.json`, JSON.stringify(cases, null, 2));
    }
  }
  console.log(JSON.stringify({passed: true, cases: cases.length}));
} finally {
  await browser.close();
}
