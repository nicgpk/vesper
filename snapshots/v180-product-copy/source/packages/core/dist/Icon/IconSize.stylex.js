// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file IconSize.stylex.ts
 * @input Defines the Icon size scale
 * @output Exports shared Icon size types and StyleX styles
 * @position Internal Icon sizing source; consumed by Icon and icon-slot owners
 */

import * as stylex from '@stylexjs/stylex';

/**
 * Icon sizes are expressed in `rem` so they scale with the root font-size.
 * Values are the px-equivalents at a 16px root: 12, 16, 20, and 24px.
 */
const iconSizeValues = {
  xsm: '0.75rem',
  sm: '1rem',
  md: '1.25rem',
  lg: '1.5rem'
};
/** Size styles for direct SVG icon components. */
export const iconSizeStyles = {
  xsm: {
    kzqmXN: "x1jw3ynk",
    kZKoxP: "xvle69y",
    $$css: true
  },
  sm: {
    kzqmXN: "xcdlrvm",
    kZKoxP: "x1l36t39",
    $$css: true
  },
  md: {
    kzqmXN: "xwqq7k2",
    kZKoxP: "xmll18r",
    $$css: true
  },
  lg: {
    kzqmXN: "xp8d6y2",
    kZKoxP: "xam5rvr",
    $$css: true
  }
};

/**
 * Size styles for icon boxes and string-based registry icons. `fontSize`
 * keeps 1em-based icons in step with the box.
 */
export const iconBoxSizeStyles = {
  xsm: {
    kzqmXN: "x1jw3ynk",
    kZKoxP: "xvle69y",
    kGuDYH: "xboafo0",
    $$css: true
  },
  sm: {
    kzqmXN: "xcdlrvm",
    kZKoxP: "x1l36t39",
    kGuDYH: "x1jchvi3",
    $$css: true
  },
  md: {
    kzqmXN: "xwqq7k2",
    kZKoxP: "xmll18r",
    kGuDYH: "x1603h9y",
    $$css: true
  },
  lg: {
    kzqmXN: "xp8d6y2",
    kZKoxP: "xam5rvr",
    kGuDYH: "xngnso2",
    $$css: true
  }
};