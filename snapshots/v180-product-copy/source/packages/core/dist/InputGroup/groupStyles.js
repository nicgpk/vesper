// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file groupStyles.ts
 * @input Uses StyleX, theme tokens, and layer-aware group end-cap selectors
 * @output Exports shared group-aware styles for input components
 * @position Shared styles consumed by InputGroup-compatible controls
 */

import * as stylex from '@stylexjs/stylex';
import "../theme/tokens.stylex.js";
import { radiusVars, borderVars } from "../theme/tokens.stylex.js";

// A grouped control may be followed by context-layer infrastructure rather
// than another control. Popovers, inert markers, and native dialog surfaces
// are not visual group members; skip them when finding the trailing edge.
const IS_LAST_ITEM = ':not(:has(~ *:not([popover]):not(template):not(dialog)))';
export const groupStyles = {
  inGroup: {
    kUk6DE: "x98rzlu",
    k7Eaqz: "xeuugli",
    kZKoxP: "x5yr21d",
    keTefX: "xd10s4z x1pwwqoy",
    krdFHd: "x15mokao x8eehn2",
    kVL7Gh: "xbiv7yw x1xrp5p4",
    kfmiAY: "x1ga7v0g x149bkfe",
    kT0f0o: "x16uus16 x1ursds5",
    kXnDq0: "x1rm9qnc",
    $$css: true
  }
};