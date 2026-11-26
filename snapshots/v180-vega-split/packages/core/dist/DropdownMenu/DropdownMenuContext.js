// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuContext.tsx
 * @input Layer-scoped React context
 * @output Exports context and hook for compound-component menu coordination
 * @position Internal; used by DropdownMenu, DropdownMenuItem and the
 *   drill-in stack (useMenuDrillIn, DropdownMenuSubMenu)
 *
 * Provides menu state (close callback, size) to compound children.
 * Keyboard navigation is handled by useListFocus on the menu container —
 * items don't need to register themselves.
 */
import { createContext, use } from 'react';
import { createLayerScopedContext } from "../Layer/layerScopedContext.js";

/** Menu size, derived from the trigger button size. */

/**
 * The drill-in view stack a menu root keeps for its sub-menus.
 * On a phone a sub-menu row pushes its view and the root shows that view in
 * place of its own rows; Back, Escape and ArrowLeft pop it. Sibling rows and
 * dividers need no knowledge of it: they are simply hidden while a view shows.
 *
 * Internal. The public surface for this behavior is `presentation` alone;
 * this is a view-stack controller, and exporting it would make internal
 * machinery permanent API that nothing requires a caller to touch. A product
 * that later needs to drive the stack earns a deliberate component or hook
 * then, with its own contract.
 * @internal
 */

export const DropdownMenuContext = createLayerScopedContext(null);
DropdownMenuContext.displayName = 'DropdownMenuContext';

/**
 * Hook for compound menu items to access menu state.
 * Returns null outside of a DropdownMenu.
 */
export function useDropdownMenuContext() {
  return use(DropdownMenuContext);
}

// =============================================================================
// Radio group coordination
// =============================================================================

export const DropdownMenuRadioGroupContext = /*#__PURE__*/createContext(null);
DropdownMenuRadioGroupContext.displayName = 'DropdownMenuRadioGroupContext';

/**
 * Read the enclosing radio group's selection state.
 * Returns null when used outside a DropdownMenuRadioGroup.
 */
export function useDropdownMenuRadioGroupContext() {
  return use(DropdownMenuRadioGroupContext);
}