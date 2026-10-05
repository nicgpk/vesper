// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @input Upstream stories, Vesper/Gothic themes, and direction toolbar state.
 * @output Stories render inside original providers in the selected theme's mode.
 * @position Standalone local baseline preview; components and stories stay upstream.
 */

import type {Preview, Decorator} from '@storybook/react';
import * as React from 'react';
import {
  Theme,
  LayerProvider,
  InternationalizationProvider,
} from '@astryxdesign/core';
import {butterTheme} from '@astryxdesign/theme-butter';
import {chocolateTheme} from '@astryxdesign/theme-chocolate';
import {gothicTheme} from '@astryxdesign/theme-gothic';
import {matchaTheme} from '@astryxdesign/theme-matcha';
import {neutralTheme} from '@astryxdesign/theme-neutral';
import {probeTheme} from '@astryxdesign/theme-probe';
import {stoneTheme} from '@astryxdesign/theme-stone';
import {y2kTheme} from '@astryxdesign/theme-y2k';
import {
  vesperDarkTheme,
  vesperLightTheme,
  vesperContrastTheme,
} from '../themes/vesper';
// Import the base reset stylesheet
import '@astryxdesign/core/reset.css';

/**
 * Every shipped theme, so the toolbar can reach them and the visual gate can
 * photograph a component under each theme that overrides it. A theme missing
 * here is a theme nothing renders and nothing verifies.
 */
const themes = {
  'vesper-dark': vesperDarkTheme,
  'vesper-light': vesperLightTheme,
  'vesper-contrast': vesperContrastTheme,
  butter: butterTheme,
  chocolate: chocolateTheme,
  gothic: gothicTheme,
  matcha: matchaTheme,
  neutral: neutralTheme,
  // A generated test fixture, not a design: it styles every declared theming
  // target so the visual gate can prove each one still paints. See
  // packages/themes/probe/README.md.
  probe: probeTheme,
  stone: stoneTheme,
  y2k: y2kTheme,
};

/**
 * Decorator that wraps all stories in the Astryx Theme provider.
 *
 * Sets `color-scheme` on the document root so that CSS `light-dark()`
 * resolves correctly at every level of the page — not just inside the
 * Theme wrapper div.  Without this, the iframe's `<html>` and
 * `<body>` keep the browser-default `color-scheme` (typically "light")
 * and the baseline can briefly paint native controls in light mode.
 */
const withTheme: Decorator = (Story, context) => {
  const themeKey = (context.globals?.astryxTheme || 'vesper-dark') as string;
  const mode = themeKey === 'vesper-light' ? 'light' : 'dark';
  const direction = context.globals?.direction === 'rtl' ? 'rtl' : 'ltr';

  // Sync color-scheme to the document root so light-dark() works
  // everywhere, including on <html>/<body> backgrounds and any
  // elements rendered outside the Theme wrapper.
  React.useEffect(() => {
    document.documentElement.style.setProperty('color-scheme', mode);
  }, [mode]);

  // No theme — render with just base defineVars defaults
  if (themeKey === 'none') {
    return (
      <InternationalizationProvider locale="en" dir={direction}>
        <div
          dir={direction}
          style={{
            colorScheme: mode,
            padding: 16,
          }}>
          <Story />
        </div>
      </InternationalizationProvider>
    );
  }

  const theme = themes[themeKey as keyof typeof themes] || neutralTheme;

  return (
    <Theme theme={theme} mode={mode}>
      <LayerProvider>
        <InternationalizationProvider locale="en" dir={direction}>
          <div
            dir={direction}
            style={{
              backgroundColor: 'var(--color-background-surface)',
              minHeight: '100vh',
              padding: 16,
            }}>
            <Story />
          </div>
        </InternationalizationProvider>
      </LayerProvider>
    </Theme>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true, // Disable backgrounds addon, use theme instead
    },
    layout: 'fullscreen',
  },
  globalTypes: {
    astryxTheme: {
      description: 'Vesper theme or original Gothic',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          {value: 'vesper-dark', title: 'Vesper Dark', icon: 'moon'},
          {value: 'vesper-light', title: 'Vesper Light', icon: 'sun'},
          {
            value: 'vesper-contrast',
            title: 'Vesper Contrast',
            icon: 'contrast',
          },
          {value: 'gothic', title: 'Original Gothic', icon: 'moon'},
        ],
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'Text direction',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          {value: 'ltr', title: 'LTR'},
          {value: 'rtl', title: 'RTL'},
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    astryxTheme: 'vesper-dark',
    direction: 'ltr',
  },
  decorators: [withTheme],
};

export default preview;
