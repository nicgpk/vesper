// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerTextReset.stylex.ts
 * @input Uses StyleX and the active theme's body typography tokens
 * @output Shared text baseline for content-bearing layer roots
 * @position Private Core styling; AST-038 owns the accepted contract
 */

import * as stylex from '@stylexjs/stylex';
import "../theme/tokens.stylex.js";
import { typeScaleVars, typographyVars } from "../theme/tokens.stylex.js";

/**
 * Apply before component and consumer styles on the layer's content boundary.
 * Top-layer promotion does not stop DOM inheritance. Reset text formatting, not
 * writing context, theme variables, surface colors, geometry, or interaction.
 */
export const layerTextReset = {
  reset: {
    kMv6JI: "x9ynric",
    kGuDYH: "xjm74w1",
    k63SB2: "xxovm9e",
    kLWn49: "xw6l6zx",
    kKX8nH: "x1j61x8r",
    k9WMMc: "x1yc453h",
    kJI5tL: "x7ssn7h",
    kTHuQy: "xzugeeo",
    kP9fke: "x6mezaz",
    kb6lSQ: "x1i21sxh",
    k4JVr9: "xp3md9m",
    kKMj4B: "x19pm5ym",
    khDVqt: "xeaf4i8",
    kTgw9: "x1lldw8n",
    kHjlTd: "x1h4wwuj",
    kE4Cay: "xxydokm",
    $$css: true
  }
};