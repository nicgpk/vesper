// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file variations.stylex.ts
 * @input Icon token vars
 * @output StyleX styles for each icon variation preset
 * @position Consumed by SVGIcon to apply variation-specific token overrides
 *
 * Each variation sets tokens for both fill-role and stroke-role elements
 * per the path role system. Stroke-role elements (lines, detail strokes)
 * never become fills — they stay as strokes across all variations.
 */

import * as stylex from '@stylexjs/stylex';
import "./tokens.stylex.js";
import { iconVars } from "./tokens.stylex.js";
export const variations = {
  linear: {
    "--icon-layer-primary-fill": "xawlqpt",
    "--icon-layer-primary-stroke": "xo1qp05",
    "--icon-layer-primary-opacity": "xgmpc9a",
    "--icon-layer-primary-stroke-role-fill": "x1behde",
    "--icon-layer-primary-stroke-role-stroke": "x12z8fwv",
    "--icon-layer-primary-stroke-role-opacity": "x1ixq0ah",
    "--icon-layer-secondary-fill": "x14svsep",
    "--icon-layer-secondary-stroke": "xjilf3y",
    "--icon-layer-secondary-opacity": "xin2e9c",
    "--icon-layer-secondary-stroke-role-fill": "x1q3b5jp",
    "--icon-layer-secondary-stroke-role-stroke": "xvx4rvh",
    "--icon-layer-secondary-stroke-role-opacity": "x1ddoxvq",
    $$css: true
  },
  bold: {
    "--icon-layer-primary-fill": "x1eijsz",
    "--icon-layer-primary-stroke": "xxn8g3f",
    "--icon-layer-primary-opacity": "xgmpc9a",
    "--icon-layer-primary-stroke-role-fill": "x1behde",
    "--icon-layer-primary-stroke-role-stroke": "x12z8fwv",
    "--icon-layer-primary-stroke-role-opacity": "x1ixq0ah",
    "--icon-layer-primary-stroke-role-width": "x1lampxp",
    "--icon-layer-secondary-fill": "x1a7uvwd",
    "--icon-layer-secondary-stroke": "xqw5mls",
    "--icon-layer-secondary-opacity": "xin2e9c",
    "--icon-layer-secondary-stroke-role-fill": "x1q3b5jp",
    "--icon-layer-secondary-stroke-role-stroke": "xvx4rvh",
    "--icon-layer-secondary-stroke-role-opacity": "x1ddoxvq",
    "--icon-layer-secondary-stroke-role-width": "x1l94yqg",
    $$css: true
  },
  twotone: {
    "--icon-layer-primary-fill": "xawlqpt",
    "--icon-layer-primary-stroke": "xo1qp05",
    "--icon-layer-primary-opacity": "xgmpc9a",
    "--icon-layer-primary-stroke-role-fill": "x1behde",
    "--icon-layer-primary-stroke-role-stroke": "x12z8fwv",
    "--icon-layer-primary-stroke-role-opacity": "x167zosf",
    "--icon-layer-secondary-fill": "x14svsep",
    "--icon-layer-secondary-stroke": "xjilf3y",
    "--icon-layer-secondary-opacity": "x1pm3eyu",
    "--icon-layer-secondary-stroke-role-fill": "x1q3b5jp",
    "--icon-layer-secondary-stroke-role-stroke": "xvx4rvh",
    "--icon-layer-secondary-stroke-role-opacity": "x1grmq33",
    $$css: true
  },
  bulk: {
    "--icon-layer-primary-fill": "x1eijsz",
    "--icon-layer-primary-stroke": "xxn8g3f",
    "--icon-layer-primary-opacity": "xgmpc9a",
    "--icon-layer-primary-stroke-role-fill": "x1behde",
    "--icon-layer-primary-stroke-role-stroke": "x12z8fwv",
    "--icon-layer-primary-stroke-role-opacity": "x167zosf",
    "--icon-layer-secondary-fill": "x1a7uvwd",
    "--icon-layer-secondary-stroke": "xqw5mls",
    "--icon-layer-secondary-opacity": "x1pm3eyu",
    "--icon-layer-secondary-stroke-role-fill": "x1q3b5jp",
    "--icon-layer-secondary-stroke-role-stroke": "xvx4rvh",
    "--icon-layer-secondary-stroke-role-opacity": "x1grmq33",
    $$css: true
  },
  broken: {
    "--icon-layer-primary-fill": "xawlqpt",
    "--icon-layer-primary-stroke": "xo1qp05",
    "--icon-layer-primary-opacity": "xgmpc9a",
    "--icon-layer-primary-stroke-role-fill": "x1behde",
    "--icon-layer-primary-stroke-role-stroke": "x12z8fwv",
    "--icon-layer-primary-stroke-role-opacity": "x1ixq0ah",
    "--icon-layer-secondary-fill": "x14svsep",
    "--icon-layer-secondary-stroke": "xjilf3y",
    "--icon-layer-secondary-opacity": "xontptu",
    "--icon-layer-secondary-stroke-role-fill": "x1q3b5jp",
    "--icon-layer-secondary-stroke-role-stroke": "xvx4rvh",
    "--icon-layer-secondary-stroke-role-opacity": "x1m4cuqp",
    $$css: true
  }
};

/** Optical size compensation — thicker strokes at smaller sizes */
export const opticalSize = {
  xsm: {
    "--icon-stroke-width": "x1uhwwbp",
    "--icon-size": "x1x62q30",
    $$css: true
  },
  sm: {
    "--icon-stroke-width": "x5m04n3",
    "--icon-size": "x1ddsvy1",
    $$css: true
  },
  md: {
    "--icon-stroke-width": "x1mdqp0b",
    "--icon-size": "xhxmg62",
    $$css: true
  },
  lg: {
    "--icon-stroke-width": "x1mdqp0b",
    "--icon-size": "xu3j10d",
    $$css: true
  }
};