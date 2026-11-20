// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuItem.tsx
 * @output Exports DropdownMenuItem component
 * @position Sub-component; used inside DropdownMenu
 *
 * Interactive menu item with role="menuitem". Keyboard navigation
 * is handled by useListFocus on the parent menu container.
 *
 * Composes Item for the shared start content + label + description + end content layout.
 * Passes role="menuitem" so Item puts onClick on the root div instead of
 * creating an invisible button (keyboard access is provided by the parent menu).
 * With an `href` the root is a real anchor carrying the role.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DropdownMenu/DropdownMenu.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenuItem.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenu.test.tsx
 * - /packages/core/src/DropdownMenu/index.ts
 * - /apps/storybook/stories/DropdownMenu.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/DropdownMenu/ (showcase blocks)
 */
import { useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { renderIconSlot } from "../Icon/index.js";
import { Item } from "../Item/index.js";
import { useLinkComponent } from "../Link/useLinkComponent.js";
import "../theme/tokens.stylex.js";
import { colorVars, spacingVars, typographyVars, typeScaleVars } from "../theme/tokens.stylex.js";
import { mergeProps } from "../utils/index.js";
import { useDropdownMenuContext } from "./DropdownMenuContext.js";
import { focusMenuItemOnHover } from "./menuItemHover.js";
import { isModifiedClick } from "./menuItemRoles.js";
import { themeProps } from "../utils/themeProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
const menuItemStyles = {
  root: {
    kB7OPa: "x9f619",
    kzqmXN: "xh8yej3",
    k8WAf4: "xce4md1",
    kg3NbH: "xf314gf",
    kaIpWk: "x1ws5lxm",
    kMv6JI: "x9ynric",
    kGuDYH: "xcr08ib",
    kMwMTN: "x1tgivj0",
    kWkggS: "xjbqb8w x1c52tdz xprvw0a",
    kMzoRj: "xc342km",
    ksu8eU: "xng3xce",
    kkrTdU: "x1ypdohk x16khyan",
    k9WMMc: "x1yc453h",
    kI3sdo: "x1a2a7pz",
    $$css: true
  },
  disabled: {
    kSiTet: "xbyyjgo",
    kkrTdU: "xt0e3qv",
    $$css: true
  },
  destructive: {
    kMwMTN: "xjt36v0",
    "--_item-label-color": "xufyqxy",
    "--_item-description-color": "xqlix59",
    $$css: true
  }
};
const itemSizeStyles = {
  sm: {
    k8WAf4: "xu0wf1k",
    kg3NbH: "xf314gf",
    $$css: true
  },
  md: {
    k8WAf4: "x1vofgu7",
    $$css: true
  },
  lg: {
    $$css: true
  }
};
/**
 * An interactive dropdown menu item with icon, label, and optional description.
 *
 * Must be used inside DropdownMenu. Keyboard navigation is provided
 * automatically by the parent via useListFocus.
 *
 * @example
 * ```
 * <DropdownMenu button={{ label: 'Actions' }}>
 *   <DropdownMenuItem icon={PencilIcon} label="Edit" onClick={handleEdit} />
 *   <DropdownMenuItem label="Delete" variant="destructive" onClick={handleDelete} />
 * </DropdownMenu>
 * ```
 */
export function DropdownMenuItem({
  icon,
  label,
  description,
  onClick,
  href,
  target,
  rel,
  isDisabled = false,
  endContent,
  hasCloseOnSelect = true,
  variant = 'default',
  xstyle,
  className,
  style,
  ref
}) {
  const ctx = useDropdownMenuContext();
  const menuSize = ctx?.menuSize ?? 'md';
  const handleClick = useCallback(event => {
    if (isDisabled) {
      // A disabled link row has no href, but a stray click must still not
      // navigate anywhere.
      event.preventDefault();
      return;
    }
    // A modified click on a link row is the browser's: it opens the
    // address its own way, so the row's handler stays out of it.
    // The menu still closes: the row acted.
    const isBrowserNavigation = href != null && isModifiedClick(event);
    if (!isBrowserNavigation) {
      onClick?.(event);
    }
    if (hasCloseOnSelect) {
      ctx?.closeMenu();
    }
  }, [isDisabled, href, onClick, hasCloseOnSelect, ctx]);

  // A middle click fires `auxclick`, never `click`, so the row's own click
  // handler never sees it: the tab opened and the menu stayed open behind
  // it. The browser does the navigating; the row only has to close.
  const handleAuxClick = useCallback(event => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    // Button 1 is the middle button. A right click opens the context menu
    // and must leave the row's menu alone.
    if (href == null || event.button !== 1) {
      return;
    }
    if (hasCloseOnSelect) {
      ctx?.closeMenu();
    }
  }, [isDisabled, href, hasCloseOnSelect, ctx]);
  const handlePointerMove = useCallback(e => focusMenuItemOnHover(e, isDisabled), [isDisabled]);
  const isDestructive = variant === 'destructive';
  const LinkComponent = useLinkComponent();
  return /*#__PURE__*/_jsx(Item, {
    ref: ref
    // A row that navigates IS the link: its root is the application's
    // anchor, so a modified click, a middle click, copying the address and
    // the status bar all keep the browser's meaning. A row without an
    // address keeps the default root.
    ,
    as: href != null ? LinkComponent : undefined,
    role: "menuitem",
    tabIndex: isDisabled ? undefined : -1,
    onPointerMove: handlePointerMove,
    startContent: icon ? renderIconSlot(icon, {
      size: 'sm',
      color: isDestructive ? 'error' : 'secondary'
    }) : undefined,
    label: label,
    description: description,
    endContent: endContent,
    onClick: handleClick,
    onAuxClick: handleAuxClick,
    href: href,
    target: target,
    rel: rel,
    isDisabled: isDisabled,
    xstyle: [menuItemStyles.root, itemSizeStyles[menuSize], isDestructive && menuItemStyles.destructive, isDisabled && menuItemStyles.disabled, xstyle],
    ...mergeProps(themeProps('dropdown-menu-item', {
      size: menuSize,
      variant: isDestructive ? 'destructive' : null
    }), {
      className,
      style
    })
  });
}
DropdownMenuItem.displayName = 'DropdownMenuItem';