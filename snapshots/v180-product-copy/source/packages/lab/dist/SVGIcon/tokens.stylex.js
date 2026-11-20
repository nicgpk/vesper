// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokens.stylex.ts
 * @input Astryx design token system
 * @output CSS custom properties for SVG icon rendering
 * @position Token definitions consumed by SVGIcon and variation presets
 *
 * Two-layer system (primary/secondary) with per-role rendering (fill vs stroke).
 * Bold mode uses mask-based gap subtraction controlled by --icon-gap tokens.
 */

import * as stylex from '@stylexjs/stylex';
export const iconVars = {
  "--icon-layer-primary-fill": "var(--icon-layer-primary-fill)",
  "--icon-layer-primary-stroke": "var(--icon-layer-primary-stroke)",
  "--icon-layer-primary-opacity": "var(--icon-layer-primary-opacity)",
  "--icon-layer-primary-stroke-role-fill": "var(--icon-layer-primary-stroke-role-fill)",
  "--icon-layer-primary-stroke-role-stroke": "var(--icon-layer-primary-stroke-role-stroke)",
  "--icon-layer-primary-stroke-role-opacity": "var(--icon-layer-primary-stroke-role-opacity)",
  "--icon-layer-primary-stroke-role-width": "var(--icon-layer-primary-stroke-role-width)",
  "--icon-layer-secondary-fill": "var(--icon-layer-secondary-fill)",
  "--icon-layer-secondary-stroke": "var(--icon-layer-secondary-stroke)",
  "--icon-layer-secondary-opacity": "var(--icon-layer-secondary-opacity)",
  "--icon-layer-secondary-stroke-role-fill": "var(--icon-layer-secondary-stroke-role-fill)",
  "--icon-layer-secondary-stroke-role-stroke": "var(--icon-layer-secondary-stroke-role-stroke)",
  "--icon-layer-secondary-stroke-role-opacity": "var(--icon-layer-secondary-stroke-role-opacity)",
  "--icon-layer-secondary-stroke-role-width": "var(--icon-layer-secondary-stroke-role-width)",
  "--icon-size": "var(--icon-size)",
  "--icon-stroke-width": "var(--icon-stroke-width)",
  "--icon-stroke-linecap": "var(--icon-stroke-linecap)",
  "--icon-stroke-linejoin": "var(--icon-stroke-linejoin)",
  "--icon-padding": "var(--icon-padding)",
  "--icon-inline-offset": "var(--icon-inline-offset)",
  "--icon-block-offset": "var(--icon-block-offset)",
  "--icon-bold-stroke-boost": "var(--icon-bold-stroke-boost)",
  "--icon-gap": "var(--icon-gap)",
  "--icon-gap-linejoin": "var(--icon-gap-linejoin)",
  __varGroupHash__: "x1ucsbpz"
};