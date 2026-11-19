// SPDX-License-Identifier: MIT
/**
 * @input The built native Vesper component site at root and a project prefix.
 * @output Browser evidence for real previews, native routes, themes, search and accessibility.
 * @position End-to-end contract for the public component browser, independent of Storybook.
 */
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.VESPER_PAGES_URL || 'http://127.0.0.1:4175';
const output = 'local-baseline/vesper-native-evidence';
await mkdir(output, {recursive: true});
const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--enable-unsafe-swiftshader'],
});
const results = [];
try {
  for (const prefix of ['', '/vesper']) {
    const context = await browser.newContext({
      viewport: {width: 1440, height: 1000},
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    const failedRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400)
        failedRequests.push(`${response.status()} ${response.url()}`);
    });
    const url = `${base}${prefix}/`;
    await page.goto(url);
    await page
      .getByRole('heading', {level: 1, name: 'Components', exact: true})
      .waitFor();
    const catalogResponse = await page.request.get(`${url}catalog.json`);
    assert.equal(catalogResponse.status(), 200);
    const catalog = await catalogResponse.json();
    const coverage = await (
      await page.request.get(`${url}coverage.json`)
    ).json();
    const componentPages = await (
      await page.request.get(`${url}component-pages.json`)
    ).json();
    assert.equal(coverage.coveredComponents, coverage.documentedComponents);
    assert.deepEqual(coverage.missing, []);
    assert.deepEqual(coverage.unknown, []);
    assert.deepEqual(coverage.duplicates, []);
    assert.equal(componentPages.length, coverage.documentedComponents);
    assert.equal(
      await page.locator('.sidebar .nav-list a').count(),
      coverage.documentedComponents,
    );
    assert.ok(Array.isArray(catalog) && catalog.length >= 30);
    assert.equal(await page.locator('.component-tile').count(), catalog.length);
    assert.equal(
      await page
        .locator('.component-tile .astryx-card.preview-backing')
        .count(),
      catalog.length,
      'Every preview needs a readable card backing.',
    );
    assert.equal(await page.locator('iframe, a[href*="storybook"]').count(), 0);
    async function assertPreviewsFit() {
      const clipped = await page.locator('.demo-stage').evaluateAll(stages =>
        stages
          .filter(stage => {
            const outer = stage.getBoundingClientRect();
            const inner = stage
              .querySelector('.demo-content')
              .getBoundingClientRect();
            return (
              inner.top < outer.top - 1 ||
              inner.bottom > outer.bottom + 1 ||
              inner.left < outer.left - 1 ||
              inner.right > outer.right + 1
            );
          })
          .map(stage => stage.getAttribute('aria-label')),
      );
      assert.deepEqual(
        clipped,
        [],
        'Interactive previews must not be clipped.',
      );
    }
    await assertPreviewsFit();

    for (const theme of ['light', 'dark', 'contrast']) {
      await page.goto(`${url}#/components`);
      await page.getByLabel('Appearance', {exact: true}).selectOption(theme);
      assert.equal(
        await page.locator('html').getAttribute('data-theme'),
        theme,
      );
      const expected = {
        light: {
          color: 'rgb(24, 24, 27)',
          background: 'rgba(255, 255, 255, 0.27)',
        },
        dark: {
          color: 'rgb(244, 244, 245)',
          background: 'rgba(32, 37, 45, 0.4)',
        },
        contrast: {color: 'rgb(255, 255, 255)', background: 'rgb(17, 24, 29)'},
      }[theme];
      await page.waitForFunction(({color, background}) => {
        const button = document.querySelector(
          '[data-demo-id="alert-dialog"] .astryx-button',
        );
        const style = button && getComputedStyle(button);
        return style?.color === color && style?.backgroundColor === background;
      }, expected);
      await assertPreviewsFit();
      const backing = await page
        .locator('[data-demo-id="alert-dialog"] .preview-backing')
        .evaluate(element => getComputedStyle(element).backgroundColor);
      if (theme === 'contrast') {
        assert.equal(backing, 'rgb(17, 24, 29)');
      } else {
        assert.equal(
          backing,
          'rgba(0, 0, 0, 0)',
          'Backing paint must not flatten nested glass',
        );
        const plane = await page
          .locator('[data-demo-id="alert-dialog"] .preview-backing')
          .evaluate(element => {
            const surface = getComputedStyle(element, '::before');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = surface.backgroundColor;
            ctx.fillRect(0, 0, 1, 1);
            return {
              filter: getComputedStyle(element).backdropFilter,
              frost: surface.backdropFilter,
              alpha: ctx.getImageData(0, 0, 1, 1).data[3],
            };
          });
        assert.equal(
          plane.filter,
          'none',
          'Nested controls must not be trapped in an ancestor backdrop root',
        );
        assert.match(plane.frost, /blur\(8px\)/);
        assert.ok(plane.alpha > 0 && plane.alpha < 255);
      }
      assert.equal(
        await page
          .locator('.demo-stage')
          .first()
          .evaluate(element => getComputedStyle(element).borderRadius),
        '24px',
      );
      await page.screenshot({
        path: `${output}/${prefix ? 'project' : 'root'}-${theme}.png`,
        animations: 'disabled',
      });
      const scan = await new AxeBuilder({page})
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        scan.violations.map(v => ({
          id: v.id,
          nodes: v.nodes.map(n => n.target),
        })),
        [],
      );
      for (const demo of catalog) {
        await page.goto(`${url}#/components/${demo.id}`);
        await page
          .getByRole('heading', {level: 1, name: demo.name, exact: true})
          .waitFor();
        assert.equal(
          await page.locator('.detail-preview .demo-stage').count(),
          1,
        );
        assert.equal(
          await page.locator('.source-code code').textContent(),
          demo.code,
        );
        assert.equal(await page.locator('iframe').count(), 0);
        await assertPreviewsFit();
      }
      for (const [id, text, destination] of [
        ['markdown', 'linked context', 'markdown'],
        ['link-provider', 'Explore the layout composition', 'layout'],
        ['outline', 'Materials', 'outline'],
        ['app-shell', 'Skip to content', 'app-shell'],
        ['mobile-nav', 'Skip to content', 'mobile-nav'],
      ]) {
        await page.goto(`${url}#/components/${id}`);
        const link = page
          .locator('.preview-scroll')
          .getByRole('link', {name: text, exact: true});
        await link.focus();
        await link.click();
        assert.equal(new URL(page.url()).hash, `#/components/${destination}`);
        if (id === 'outline') {
          assert.match(
            await page
              .locator('.preview-scroll a[aria-current="location"]')
              .innerText(),
            /Materials/,
          );
          await page
            .locator('.preview-scroll')
            .getByRole('link', {name: 'Overview', exact: true})
            .focus();
          await page.keyboard.press('Space');
          assert.equal(new URL(page.url()).hash, '#/components/outline');
          assert.match(
            await page
              .locator('.preview-scroll a[aria-current="location"]')
              .innerText(),
            /Overview/,
          );
        }
        await page.reload();
        await page.locator('.detail-preview .preview-backing').waitFor();
        assert.notEqual(
          await page.locator('.page-heading h1').innerText(),
          'Component not found',
        );
      }
      await page.goto(`${url}#/components/dialog`);
      const edit = page.getByRole('button', {
        name: 'Edit collection',
        exact: true,
      });
      await edit.click();
      const dialog = page.getByRole('dialog', {
        name: 'Edit collection',
        exact: true,
      });
      await dialog.waitFor();
      await dialog
        .getByRole('textbox', {name: 'Collection name', exact: true})
        .fill('Studio notes');
      await page.keyboard.press('Escape');
      await dialog.waitFor({state: 'hidden'});
      await page.getByText('Studio notes', {exact: true}).waitFor();
      assert.equal(
        await edit.evaluate(element => document.activeElement === element),
        true,
      );
      await page.goto(`${url}#/components/dropdown-menu`);
      await page
        .getByRole('button', {name: 'Collection actions', exact: true})
        .click();
      await page
        .getByRole('menuitem', {name: 'Save collection', exact: true})
        .click();
      await page.getByText('Collection saved locally', {exact: true}).waitFor();
    }

    for (const component of componentPages) {
      await page.goto(`${url}#/components/${component.id}`);
      await page
        .getByRole('heading', {level: 1, name: component.name, exact: true})
        .waitFor();
      assert.equal(
        await page.locator('.detail-preview .preview-backing').count(),
        1,
      );
    }
    await page.goto(`${url}#/components/switch`);
    const control = page.getByRole('switch').first();
    const checked = await control.isChecked();
    await control.click();
    assert.notEqual(await control.isChecked(), checked);
    await page.reload();
    await page
      .getByRole('heading', {level: 1, name: 'Switch', exact: true})
      .waitFor();
    assert.equal(
      await page.getByLabel('Appearance', {exact: true}).inputValue(),
      'contrast',
    );
    await page.goto(`${url}#/components`);
    const search = page.getByRole('searchbox', {
      name: 'Search components',
      exact: true,
    });
    await search.fill('button');
    assert.ok((await page.locator('.component-tile').count()) > 0);
    assert.ok((await page.locator('.component-tile').count()) < catalog.length);
    await search.fill('zzzz-no-component');
    assert.equal(await page.locator('.component-tile').count(), 0);
    await page.getByText('No components found.', {exact: true}).waitFor();
    await page.getByRole('button', {name: 'Clear search', exact: true}).click();
    assert.equal(await page.locator('.component-tile').count(), catalog.length);
    await page.getByRole('link', {name: 'View Button', exact: true}).click();
    await page
      .getByRole('heading', {level: 1, name: 'Button', exact: true})
      .waitFor();
    await page.getByRole('button', {name: 'Save changes', exact: true}).click();
    await page.getByText('Changes saved locally.', {exact: true}).waitFor();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', {name: 'Copy source', exact: true}).click();
    await page
      .getByRole('status')
      .filter({hasText: /^Copied$/})
      .waitFor();
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      catalog.find(demo => demo.id === 'button').code,
    );
    await page.goBack();
    await page
      .getByRole('heading', {level: 1, name: 'Components', exact: true})
      .waitFor();
    await page.goto(`${url}#/components/not-a-component`);
    await page
      .getByRole('heading', {
        level: 1,
        name: 'Component not found',
        exact: true,
      })
      .waitFor();
    await page
      .getByRole('link', {name: 'All components', exact: true})
      .last()
      .click();
    await page.setViewportSize({width: 390, height: 844});
    await page.screenshot({
      path: `${output}/${prefix ? 'project' : 'root'}-mobile.png`,
    });
    for (const width of [390, 320]) {
      await page.setViewportSize({width, height: 844});
      await assertPreviewsFit();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.locator('.mobile-navigation summary').click();
      await page
        .locator('.mobile-navigation')
        .getByRole('link', {name: 'Dialog', exact: true})
        .click();
      await page
        .getByRole('heading', {level: 1, name: 'Dialog', exact: true})
        .waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.goto(`${url}#/components`);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(failedRequests, []);
    results.push({
      prefix: prefix || '/',
      themes: 3,
      demos: catalog.length,
      documentedComponents: coverage.documentedComponents,
      coveredComponents: coverage.coveredComponents,
      nativeComponentRoutes: componentPages.length,
      axeScans: 3,
      pageErrors: errors,
      failedRequests,
    });
    await context.close();
  }
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage blocked');
      },
    });
  });
  const page = await context.newPage();
  await page.goto(`${base}/#/components/button`);
  await page
    .getByRole('heading', {level: 1, name: 'Button', exact: true})
    .waitFor();
  await page.getByLabel('Appearance', {exact: true}).selectOption('dark');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await context.close();
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({passed: true, results, blockedStorage: 'pass'}, null, 2),
  );
  console.log(JSON.stringify({passed: true, results, blockedStorage: 'pass'}));
} finally {
  await browser.close();
}
