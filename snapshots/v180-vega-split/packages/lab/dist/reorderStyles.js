// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file reorderStyles.ts
 * @input StyleX and Astryx semantic color, motion, radius, and spacing tokens
 * @output Shared internal visual states for reorderable Lab components
 * @position Lab-internal drag-and-drop style contract; API arbitration required before public export
 */

import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, durationVars, easeVars, radiusVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
const indicatorBase = {
  content: '""',
  position: 'absolute',
  insetInline: 0,
  height: spacingVars['--spacing-0-5'],
  borderRadius: radiusVars['--radius-full'],
  backgroundColor: colorVars['--color-accent'],
  pointerEvents: 'none',
  zIndex: 2
};

/**
 * Default Lab reorder visuals. Keep interaction behavior component-owned until
 * vertical, horizontal, grid, and cross-list reorder APIs are reconciled.
 */
export const reorderStyles = {
  source: {
    kSiTet: "xbyyjgo",
    kfSwDN: "x87ps6o",
    $$css: true
  },
  preview: {
    kSiTet: "xbyyjgo",
    kfzvcC: "x47corl",
    kfSwDN: "x87ps6o",
    k6sLGO: "x1so62im",
    $$css: true
  },
  viewTransitionRoot: {
    kZKGdl: "x1iibmkh xt9y79",
    kqNkEK: "x1fnez61",
    $$css: true
  },
  dropBefore: {
    kVAEAm: "x1n2onr6",
    kgeoSG: "x1cpjm7i",
    kEoFBp: "x1hmns74",
    kpsdNU: "xm4btww",
    kgzTxl: "xiiru4q",
    kPB484: "xmwhqxd",
    kLkRvE: "x1tzqye7",
    km8f2m: "xkk1bqk",
    kxmVGU: "xvi4grz",
    k96MEf: "xucr3ah",
    $$css: true
  },
  dropAfter: {
    kVAEAm: "x1n2onr6",
    k5JduY: "x1s928wv",
    kwXMNM: "x1j6awrg",
    kcktkL: "xb7ltuz",
    k4zj60: "x1a9plwg",
    kUfP38: "xq94oqs",
    ks3ayO: "xs88s87",
    kloYau: "x2q1x1w",
    kDVEDD: "x1jg531d",
    k8Iv0R: "x1mprab4",
    $$css: true
  },
  handle: {
    kkrTdU: "x1jm3nie x16khyan",
    kFalU9: "x5ve5x3",
    $$css: true
  },
  handleActive: {
    kkrTdU: "xi9pz9s x16khyan",
    kFalU9: "x5ve5x3",
    $$css: true
  }
};