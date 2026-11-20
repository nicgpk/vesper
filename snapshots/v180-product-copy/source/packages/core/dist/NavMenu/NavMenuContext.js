// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NavMenuContext.tsx
 * @input Layer-scoped React context/use
 * @output Exports NavHeadingCloseContext, NavHeadingMenuContext, and hooks
 * @position Context providers; consumed by NavHeadingMenu and NavHeadingMenuItem
 *
 * SYNC: When modified, update:
 * - /packages/core/src/NavMenu/index.ts
 */
import { createContext, use } from 'react';
import { createLayerScopedContext } from "../Layer/layerScopedContext.js";

/**
 * Close callback provided by the nav heading popover.
 * NavHeadingMenu reads this to dismiss the popover on item selection
 * and on Escape.
 */

export const NavHeadingCloseContext = /*#__PURE__*/createContext(null);
NavHeadingCloseContext.displayName = 'NavHeadingCloseContext';
export function useNavHeadingCloseContext() {
  return use(NavHeadingCloseContext);
}

/**
 * Size and close context provided by NavHeadingMenu to its children.
 * Items read this for consistent padding and dismiss-on-click.
 */

export const NavHeadingMenuContext = createLayerScopedContext(null);
NavHeadingMenuContext.displayName = 'NavHeadingMenuContext';
export function useNavHeadingMenuContext() {
  return use(NavHeadingMenuContext);
}