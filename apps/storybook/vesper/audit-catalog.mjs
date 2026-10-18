// SPDX-License-Identifier: MIT
/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
/**
 * @input Built Storybook index and a running preview URL.
 * @output Resumable per-group browser evidence and a counted catalog receipt.
 * @position Vesper material audit; checks every indexed story group, not every variant.
 */
import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile, appendFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const base = process.argv[2] || 'http://localhost:6006';
const theme = process.argv[3] || 'vesper-dark';
const label = process.argv[4] || 'current';
assert.match(theme, /^vesper-(dark|light|contrast)$/);
assert.match(label, /^[a-z0-9-]+$/);
const out = `local-baseline/catalog/${label}-${theme}`;
await mkdir(out, {recursive: true});
const response = await fetch(`${base}/index.json`);
assert.equal(response.ok, true, 'Storybook index must be available');
const index = await response.json();
const stories = Object.values(index.entries).filter(
  entry => entry.type === 'story',
);
const groups = Object.entries(
  Object.groupBy(stories, entry => entry.title),
).map(([title, entries]) => ({
  title,
  storyCount: entries.length,
  story:
    entries.find(entry =>
      /^(Default|Basic|Overview|Showcase)$/.test(entry.name),
    ) || entries[0],
}));
await writeFile(
  `${out}/inventory.json`,
  JSON.stringify(
    {storyCount: stories.length, groupCount: groups.length, groups},
    null,
    2,
  ),
);
let prior = [];
try {
  prior = (await readFile(`${out}/results.jsonl`, 'utf8'))
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const completed = new Set(
  [...new Map(prior.map(row => [row.title, row])).values()]
    .filter(row => row.status === 'rendered')
    .map(row => row.title),
);
const queue = groups.filter(group => !completed.has(group.title));
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
let cursor = 0;
try {
  await Promise.all(
    Array.from({length: 1}, async () => {
      const context = await browser.newContext({
        viewport: {width: 1200, height: 900},
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      while (cursor < queue.length) {
        const group = queue[cursor++];
        const errors = [];
        const onError = error => errors.push(error.message);
        page.on('pageerror', onError);
        const result = {
          title: group.title,
          storyId: group.story.id,
          storyCount: group.storyCount,
          theme,
          errors,
        };
        try {
          await page.goto(
            `${base}/iframe.html?id=${encodeURIComponent(group.story.id)}&viewMode=story&globals=astryxTheme:${theme}`,
            {waitUntil: 'domcontentloaded', timeout: 30000},
          );
          await page.waitForFunction(
            () =>
              document.querySelector('#storybook-root')?.childElementCount >
                0 ||
              (document
                .querySelector('.sb-errordisplay')
                ?.getBoundingClientRect().height > 0 &&
                document
                  .querySelector('.sb-errordisplay')
                  ?.textContent?.trim()),
            null,
            {timeout: 20000},
          );
          await page.waitForTimeout(180);
          result.renderError = await page
            .locator('.sb-errordisplay')
            .evaluateAll(elements =>
              elements
                .filter(e => getComputedStyle(e).display !== 'none')
                .map(e => e.innerText)
                .join('\n'),
            );
          result.targets = await page.evaluate(() => {
            const targets = new Map();
            for (const element of document.querySelectorAll(
              '#storybook-root [class*="astryx-"]',
            )) {
              const box = element.getBoundingClientRect();
              if (!box.width || !box.height) continue;
              const css = getComputedStyle(element);
              if (css.visibility === 'hidden' || css.display === 'none')
                continue;
              for (const name of element.classList) {
                if (!name.startsWith('astryx-') || targets.has(name)) continue;
                targets.set(name, {
                  target: name.slice(7),
                  background: css.backgroundColor,
                  image: css.backgroundImage,
                  blur: css.backdropFilter,
                  radius: css.borderRadius,
                  color: css.color,
                });
              }
            }
            return [...targets.values()];
          });
          result.rootText = (
            await page.locator('#storybook-root').innerText()
          ).slice(0, 500);
          result.horizontalOverflow = await page.evaluate(
            () => document.documentElement.scrollWidth > window.innerWidth,
          );
          result.screenshot = `${out}/${group.story.id}.png`;
          await page.screenshot({
            path: result.screenshot,
            animations: 'disabled',
            timeout: 15000,
          });
          result.status =
            errors.length || result.renderError ? 'issue' : 'rendered';
        } catch (error) {
          result.status = 'failed';
          result.failure = error.message;
        } finally {
          page.off('pageerror', onError);
        }
        await appendFile(`${out}/results.jsonl`, `${JSON.stringify(result)}\n`);
        console.log(
          `${completed.size + cursor}/${groups.length} ${result.status}: ${group.title}`,
        );
      }
      await context.close();
    }),
  );
} finally {
  await browser.close();
}
const rows = (await readFile(`${out}/results.jsonl`, 'utf8'))
  .trim()
  .split('\n')
  .filter(Boolean)
  .map(line => JSON.parse(line));
const unique = [...new Map(rows.map(row => [row.title, row])).values()];
assert.equal(
  unique.length,
  groups.length,
  'Every story group must have a receipt',
);
const summary = {
  theme,
  storyCount: stories.length,
  expectedGroups: groups.length,
  checkedGroups: unique.length,
  statusCounts: Object.fromEntries(
    Object.entries(Object.groupBy(unique, row => row.status)).map(
      ([key, values]) => [key, values.length],
    ),
  ),
  issues: unique
    .filter(row => row.status !== 'rendered')
    .map(({title, storyId, errors, renderError, failure}) => ({
      title,
      storyId,
      errors,
      renderError,
      failure,
    })),
};
await writeFile(`${out}/summary.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary));
if (
  summary.checkedGroups !== summary.expectedGroups ||
  summary.issues.length > 0
) {
  process.exitCode = 1;
}
