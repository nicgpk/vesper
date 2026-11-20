// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenu.tsx
 * @input Uses React, StyleX, usePopover, MenuBottomSheet, Button, List,
 *   useListFocus, and the shared viewport-safe menu-width resolver
 * @output Exports DropdownMenu with caller-selected popover or bottom-sheet
 *   presentation
 * @position Core implementation; consumed by index.ts
 *
 * Supports two modes with a single keyboard/focus path:
 * - **Data-driven**: pass `items` array (converted to components internally)
 * - **Compound-component**: pass JSX children directly
 *
 * Both modes use useListFocus for DOM-based keyboard navigation.
 *
 * The trigger is the design system's Button (`button`) or any control the
 * caller renders (`renderTrigger`).
 *
 * A sub-menu drills in on a phone through the view stack useMenuDrillIn
 * keeps; the root shows the drilled view in place of its rows.
 *
 * Initial focus on open follows the input modality: a keyboard open
 * (Enter / Space / ArrowDown on the trigger) focuses the first enabled item
 * (APG menu-button); a pointer open focuses the menu container itself so no
 * item reads as pre-selected, and the first ArrowDown then moves to item 1.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DropdownMenu/DropdownMenu.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenu.test.tsx
 * - /packages/core/src/DropdownMenu/index.ts
 * - /apps/storybook/stories/DropdownMenu.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/DropdownMenu/ (showcase blocks)
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { usePopover } from "../Popover/usePopover.js";
import { Button } from "../Button/index.js";
import { Heading } from "../Heading/index.js";
import { Icon } from "../Icon/index.js";
import { renderDropdownItems } from "./renderDropdownItems.js";
import { MENU_ITEM_ROLES, MENU_ITEM_SELECTOR, MENU_BOUNDARY_SELECTOR, activateMenuItem } from "./menuItemRoles.js";
import { DropdownMenuContext } from "./DropdownMenuContext.js";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect.js";
import { useListFocus } from "../hooks/useListFocus.js";
import { useMenuPress } from "../hooks/useMenuPress.js";
import { useTypeahead } from "../hooks/useTypeahead.js";
import { useFocusReturnVisibility } from "../hooks/useFocusReturnVisibility.js";
import { useMenuOverflow } from "./useMenuOverflow.js";
import { useDevWarning } from "../hooks/useDevWarning.js";
import { useMenuDrillIn } from "./useMenuDrillIn.js";
import { resolveMenuWidth } from "./menuWidth.js";
import { useAdaptivePresentation } from "../hooks/useAdaptivePresentation.js";
import { MenuBottomSheet } from "./MenuBottomSheet.js";
import { MenuBottomSheetActionList } from "./MenuBottomSheetActionList.js";
import { layerAnimations } from "../Layer/layerAnimations.stylex.js";
import "../theme/tokens.stylex.js";
import { spacingVars, colorVars, radiusVars, durationVars, easeVars } from "../theme/tokens.stylex.js";
import { mergeProps, rtlStyles } from "../utils/index.js";
import { themeProps } from "../utils/themeProps.js";
import { useInteractionModalityTracking } from "../utils/interactionModality.js";
import { useTranslator } from "../i18n/index.js";
import { focusOutlineStyles } from "../utils/focusOutline.stylex.js";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const MENU_VIEWPORT_GUTTER = spacingVars['--spacing-4'];
const MENU_MAX_INLINE_SIZE = `calc(100vi - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px)) - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-right, 0px)))`;
const MENU_MAX_INLINE_SIZE_FALLBACK = `calc(100vw - ${MENU_VIEWPORT_GUTTER} - ${MENU_VIEWPORT_GUTTER})`;
const MENU_MAX_BLOCK_SIZE = `min(300px, calc(100dvb - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px)) - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px))))`;
const MENU_MAX_BLOCK_SIZE_FALLBACK = `min(300px, calc(100vh - ${MENU_VIEWPORT_GUTTER} - ${MENU_VIEWPORT_GUTTER}))`;
const MENU_POSITION_AREA_MAX_INLINE_SIZE = `calc(100% - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px)))`;
const MENU_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK = `calc(100% - ${MENU_VIEWPORT_GUTTER})`;
const MENU_INLINE_EDGE_GUTTER = `max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px))`;
const MENU_TRIGGER_OPEN_BACKGROUND = `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`;
const _temp = {
  kzqmXN: "x1uyokj7",
  "$$css": true
};
const styles = {
  triggerOpen: {
    kKwaWg: "xpl5ynk",
    $$css: true
  },
  triggerPressable: {
    k7VYTy: "xpdipgo",
    kfSwDN: "x87ps6o",
    $$css: true
  },
  dropdown: {
    kB7OPa: "x9f619",
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kOIVth: "x1lsbc85",
    kI3sdo: "x1a2a7pz",
    k7VYTy: "xpdipgo",
    kfSwDN: "x87ps6o",
    ks0D6T: "xs2v1xk",
    kskxy: "x1hkkhfe",
    "--_dropdown-menu-radius": "x1fcsqxe",
    "--_dropdown-menu-padding": "xgory14",
    kmVPX3: "x9epnlk",
    kaIpWk: "x1n97fys",
    kSiTet: "x1hc1fzr",
    k1ekBW: "x19991ni",
    kIyJzY: "xuedmi6",
    kAMwcw: "xlr8y92",
    $$css: true
  },
  scrollable: {
    kORKVm: "x1odjw0f",
    kXHlph: "x6ikm8r",
    kZeWKH: "xish69e",
    $$css: true
  },
  touchNone: {
    kFalU9: "x5ve5x3",
    $$css: true
  },
  touchPanY: {
    kFalU9: "xx69xxh",
    kZeWKH: "xish69e",
    $$css: true
  },
  popoverViewport: {
    kB7OPa: "x9f619",
    kskxy: "x1hkkhfe",
    $$css: true
  },
  popoverViewportAligned: {
    ks0D6T: "xbd96yr",
    $$css: true
  },
  popoverViewportStart: {
    k71WvV: "xxeicf8",
    $$css: true
  },
  popoverViewportEnd: {
    keTefX: "x47fqr9",
    $$css: true
  },
  popoverViewportBlockStart: {
    k1K539: "x1kps3mo",
    $$css: true
  },
  popoverViewportBlockEnd: {
    keoZOQ: "xsoubt3",
    $$css: true
  },
  popoverViewportCentered: {
    keTefX: "x47fqr9",
    k71WvV: "xxeicf8",
    ks0D6T: "xs2v1xk",
    $$css: true
  },
  popoverViewportBlockCentered: {
    keoZOQ: "xsoubt3",
    k1K539: "x1kps3mo",
    ks0D6T: "xs2v1xk",
    $$css: true
  },
  popoverAligned: {
    k7Eaqz: "x1ks9poc",
    $$css: true
  },
  popoverCentered: {
    k7Eaqz: "xagy28z",
    $$css: true
  },
  popoverCustomWidth: width => [{
    k7Eaqz: width != null ? "xkj4a21" : width,
    $$css: true
  }, {
    "--x-minWidth": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width)
  }],
  popoverCustomIntrinsicWidth: width => [_temp, {
    "--x-inlineSize": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width)
  }]
};
const MENU_VIEWPORT_BLOCK_GUTTERS = `max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px)) - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px))`;

// `menuMaxHeight` lifts the 300px cap for a menu that must fit its rows; the
// viewport still bounds it.
const _temp2 = {
  kskxy: "x1jols5v",
  "$$css": true
};
const _temp3 = {
  kskxy: "xbmfmqd",
  "$$css": true
};
const dynamicStyles = {
  menuMaxHeight: maxHeight => [_temp2, {
    "--x-maxHeight": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`min(${maxHeight}, calc(100dvb - ${MENU_VIEWPORT_BLOCK_GUTTERS}))`)
  }],
  popoverViewportMaxBlockSize: maxHeight => [_temp3, {
    "--x-maxBlockSize": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`min(${maxHeight}, calc(100dvb - ${MENU_VIEWPORT_BLOCK_GUTTERS}))`)
  }]
};
const bottomSheetStyles = {
  content: {
    kzqmXN: "xh8yej3",
    $$css: true
  },
  rootHeading: {
    keTefX: "x6i7dpz",
    $$css: true
  },
  viewHeading: {
    kI3sdo: "x1a2a7pz",
    $$css: true
  }
};

// =============================================================================
// Types
// =============================================================================

/**
 * Data-mode shape for one menu row.
 *
 * The item fields are sourced from `DropdownMenuItemProps` — data mode renders
 * through `DropdownMenuItem`, so the two APIs describe the same thing and must
 * not drift. Only the fields listed here are part of the data API; add a key to
 * the `Pick` to expose more of the item's props to `items`.
 */

/**
 * Data-mode shape for a divider row. The compound-mode peer is the
 * `DropdownMenuDivider` component, which both modes render.
 */

// =============================================================================
// Props
// =============================================================================

/**
 * The props a custom `trigger` spreads onto the control that opens the menu.
 * They carry the press model — a mouse opens on press-down, a held finger
 * opens with the finger down — the keyboard opens (Enter, Space, ArrowDown,
 * ArrowUp), the toggle click, and the ARIA wiring that names the menu after
 * the control. Spread them all; add your own handlers beside them.
 */

// =============================================================================
// DropdownMenu
// =============================================================================

/**
 * A dropdown menu component that displays a list of actionable items.
 *
 * Supports two modes:
 * - **Data-driven**: pass `items` and choose either the default anchored
 *   popover or the modal bottom-sheet presentation.
 * - **Compound-component**: pass JSX children for dynamic, stateful, or
 *   lazy-loaded anchored popover menus.
 *
 * @example
 * ```
 * <DropdownMenu
 *   button={{ label: 'Actions' }}
 *   presentation={useBottomSheet ? 'bottom-sheet' : 'popover'}
 *   items={[
 *     { label: 'Edit', onClick: () => handleEdit() },
 *     { label: 'Delete', onClick: () => handleDelete() },
 *   ]}
 * />
 * ```
 */
// When the consumer doesn't pass `button`, the default label is looked up
// at render time so it respects the active InternationalizationProvider
// locale.
const DEFAULT_BUTTON_I18N_KEY = '@astryx.dropdownMenu.label';

/**
 * Keep `control` the invoker of popover `popoverId` for the rest of the press
 * in flight, so the native light dismiss of a `popover="auto"` does not read
 * the release over the trigger as a dismissal. The attribute is dropped a
 * task after the release, once light dismiss has run.
 */
function holdInvokerThroughPress(control, popoverId) {
  if (control == null) {
    return;
  }
  const doc = control.ownerDocument;
  control.setAttribute('popovertarget', popoverId);
  const onPressEnd = () => {
    doc.removeEventListener('pointerup', onPressEnd, true);
    doc.removeEventListener('pointercancel', onPressEnd, true);
    // Light dismiss runs as the pointerup default action after listeners.
    doc.defaultView?.setTimeout(() => {
      control.removeAttribute('popovertarget');
    }, 0);
  };
  doc.addEventListener('pointerup', onPressEnd, true);
  doc.addEventListener('pointercancel', onPressEnd, true);
}
function DropdownMenuBottomSheet({
  button: buttonFromProps,
  renderTrigger,
  isMenuOpen: controlledIsOpen,
  onOpenChange,
  onClick,
  hasChevron = true,
  items,
  presentation: _presentation,
  menuWidth: _menuWidth,
  menuMaxHeight: _menuMaxHeight,
  placement: _placement,
  alignment: _alignment,
  className,
  style,
  xstyle,
  'data-testid': testId,
  ...rest
}) {
  const t = useTranslator();
  const button = buttonFromProps ?? {
    label: t(DEFAULT_BUTTON_I18N_KEY)
  };
  const backLabel = t('@astryx.dropdownMenu.back');
  const buttonRef = useRef(null);
  const triggerId = useId();
  const sheetId = useId();
  const actionListRef = useRef(null);
  const openModalityRef = useRef('pointer');
  const {
    isFocusRingSuppressed,
    onFocusReturnTargetFocus,
    prepareFocusReturn,
    resetFocusReturn
  } = useFocusReturnVisibility();
  const viewHeadingRef = useRef(null);
  const previousSubmenuDepthRef = useRef(0);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [submenuPath, setSubmenuPath] = useState([]);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);
  if (previousIsOpen !== isOpen) {
    setPreviousIsOpen(isOpen);
    if (!isOpen && submenuPath.length > 0) {
      setSubmenuPath([]);
    }
  }
  const currentSubmenu = submenuPath.at(-1);
  const currentItems = currentSubmenu?.items ?? items;
  const currentTitle = currentSubmenu?.label ?? button.label;
  const sheetLabel = typeof currentTitle === 'string' ? currentTitle : button.label;
  const setOpen = useCallback(nextIsOpen => {
    if (!nextIsOpen) {
      setSubmenuPath([]);
      prepareFocusReturn();
    } else {
      resetFocusReturn();
    }
    onOpenChange?.(nextIsOpen);
    if (!isControlled) {
      setInternalIsOpen(nextIsOpen);
    }
  }, [isControlled, onOpenChange, prepareFocusReturn, resetFocusReturn]);
  const handleSelect = useCallback((item, event) => {
    if (item.isDisabled) {
      return;
    }
    item.onClick?.(event);
    if (item.hasCloseOnSelect !== false) {
      setOpen(false);
    }
  }, [setOpen]);
  const isIconOnly = button.isIconOnly === true;
  const resolvedEndContent = button.endContent ?? (hasChevron && !isIconOnly ? /*#__PURE__*/_jsx(Icon, {
    icon: "chevronDown",
    size: "sm",
    color: "inherit"
  }) : undefined);
  useEffect(() => {
    if (!isOpen || openModalityRef.current !== 'keyboard') {
      return;
    }
    const frame = requestAnimationFrame(() => {
      actionListRef.current?.querySelector('button:not(:disabled), a[href]')?.focus({
        preventScroll: true
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [currentItems, isOpen]);
  useEffect(() => {
    if (!isOpen) {
      previousSubmenuDepthRef.current = 0;
      return;
    }
    if (submenuPath.length === previousSubmenuDepthRef.current) {
      return;
    }
    previousSubmenuDepthRef.current = submenuPath.length;
    const frame = requestAnimationFrame(() => {
      viewHeadingRef.current?.focus({
        preventScroll: true
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, submenuPath.length]);
  const handleSheetTriggerPointerDown = () => {
    openModalityRef.current = 'pointer';
  };
  const handleSheetTriggerKeyDown = event => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      openModalityRef.current = 'keyboard';
    }
  };
  const handleSheetTriggerClick = () => {
    onClick?.();
    setOpen(!isOpen);
  };
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [renderTrigger != null ? renderTrigger({
      ref: el => {
        buttonRef.current = el;
      },
      id: triggerId,
      onClick: handleSheetTriggerClick,
      onClickCapture: () => {},
      onPointerDown: handleSheetTriggerPointerDown,
      onContextMenu: () => {},
      onKeyDown: handleSheetTriggerKeyDown,
      onFocus: onFocusReturnTargetFocus,
      'aria-haspopup': 'dialog',
      'aria-expanded': isOpen,
      'aria-controls': sheetId
    }) : /*#__PURE__*/_jsx(Button, {
      ...button,
      ref: buttonRef,
      xstyle: [isOpen && styles.triggerOpen, button.xstyle, isFocusRingSuppressed && focusOutlineStyles.suppressed],
      tooltip: isOpen ? undefined : button.tooltip,
      endContent: resolvedEndContent,
      onPointerDown: event => {
        button.onPointerDown?.(event);
        handleSheetTriggerPointerDown();
      },
      onKeyDown: event => {
        button.onKeyDown?.(event);
        handleSheetTriggerKeyDown(event);
      },
      onFocus: event => {
        button.onFocus?.(event);
        onFocusReturnTargetFocus();
      },
      onClick: handleSheetTriggerClick,
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "data-testid": testId
    }), /*#__PURE__*/_jsx(MenuBottomSheet, {
      isOpen: isOpen,
      onOpenChange: setOpen,
      finalFocusRef: buttonRef,
      label: sheetLabel,
      children: /*#__PURE__*/_jsxs("div", {
        ref: actionListRef,
        id: sheetId,
        ...rest,
        ...mergeProps(themeProps('dropdown-menu', {
          presentation: 'bottom-sheet'
        }), stylex.props(bottomSheetStyles.content, xstyle), className, style),
        children: [/*#__PURE__*/_jsxs("div", {
          ...{
            className: "x78zum5 x1q0g3np x6s0dn4 xzye2dw x1p37lm5"
          },
          children: [submenuPath.length > 0 && /*#__PURE__*/_jsx(Button, {
            label: backLabel,
            variant: "ghost",
            size: "sm",
            icon: /*#__PURE__*/_jsx(Icon, {
              icon: "chevronLeft",
              size: "sm",
              xstyle: rtlStyles.mirror
            }),
            isIconOnly: true,
            onClick: () => setSubmenuPath(path => path.slice(0, -1))
          }), /*#__PURE__*/_jsx(Heading, {
            ref: viewHeadingRef,
            level: 3,
            tabIndex: -1,
            xstyle: [bottomSheetStyles.viewHeading, submenuPath.length === 0 && bottomSheetStyles.rootHeading],
            children: currentTitle
          })]
        }), /*#__PURE__*/_jsx(MenuBottomSheetActionList, {
          items: currentItems,
          onSelect: handleSelect,
          onOpenSubmenu: item => setSubmenuPath(path => [...path, item])
        })]
      })
    })]
  });
}
function DropdownMenuPopover({
  button: buttonFromProps,
  renderTrigger,
  isMenuOpen: controlledIsOpen,
  onOpenChange,
  menuWidth,
  menuMaxHeight,
  onClick,
  hasChevron = true,
  placement = 'below',
  alignment = 'start',
  presentation: _presentation,
  className,
  style,
  xstyle,
  'data-testid': testId,
  ...props
}) {
  const t = useTranslator();
  const button = buttonFromProps ?? {
    label: t(DEFAULT_BUTTON_I18N_KEY)
  };
  const items = ('items' in props ? props.items : undefined) ?? [];
  const children = props.children;

  // Extract BaseProps pass-throughs (aria-*, id, event handlers) from the
  // discriminated-union rest bag so they can be forwarded to the menu element.
  const {
    items: _items,
    children: _children,
    ...rest
  } = props;
  const menuId = useId();
  const triggerId = useId();
  const menuSize = button.size ?? 'md';
  const buttonRef = useRef(null);

  // Open state
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const acceptedOpenRef = useRef(false);
  const notifyClickOnShowRef = useRef(false);
  const pendingControlledOpenRef = useRef(false);
  const suppressControlledRollbackHideRef = useRef(false);
  useInteractionModalityTracking();
  const {
    isFocusRingSuppressed,
    onFocusReturnTargetFocus,
    prepareFocusReturn,
    resetFocusReturn
  } = useFocusReturnVisibility();
  const contentRef = useRef(null);
  // The press model is mounted below (it needs the popover); the hide path
  // above it ends the gesture in flight through this ref.
  const cancelMenuPressRef = useRef(() => {});

  // Focus lands somewhere stated when the menu closes. A press outside that
  // landed on a focusable control has already moved focus there; leave it.
  // Otherwise — a row acted, Escape, a press on nothing — focus returns to
  // the trigger, with a visible ring only when the menu was driven by
  // keyboard (the modality tracker decides; the suppressed style hides the
  // pointer case, which Safari would otherwise paint after a touch pick).
  const handleLayerHide = useCallback(() => {
    if (suppressControlledRollbackHideRef.current) {
      suppressControlledRollbackHideRef.current = false;
      return;
    }
    cancelMenuPressRef.current();
    pendingControlledOpenRef.current = false;
    onOpenChange?.(false);
    if (!isControlled) {
      setInternalIsOpen(false);
    }
    const trigger = buttonRef.current;
    if (!trigger) {
      return;
    }
    const active = document.activeElement;
    const focusLandedElsewhere = active instanceof HTMLElement && active !== document.body && active !== trigger && !contentRef.current?.contains(active);
    if (focusLandedElsewhere) {
      return;
    }
    prepareFocusReturn();
    trigger.focus({
      preventScroll: true
    });
  }, [isControlled, onOpenChange, prepareFocusReturn]);

  // Defer item focus until the layer has committed open, so focus restore
  // captures the trigger instead of the first menu item.
  const shouldFocusOnOpenRef = useRef(false);

  // How the next open was initiated. Keyboard (and programmatic) opens focus
  // the first enabled item per the APG menu-button pattern; pointer opens
  // focus the menu container instead, so no item is visually highlighted as
  // if pre-selected (#4477). Reset to 'keyboard' after every open so
  // programmatic controlled opens keep the item-focus behavior.
  const openModalityRef = useRef('keyboard');
  // ArrowUp opens with the LAST enabled row highlighted.
  const focusLastOnOpenRef = useRef(false);
  const handleLayerShow = useCallback(() => {
    acceptedOpenRef.current = true;
    resetFocusReturn();
    if (notifyClickOnShowRef.current) {
      notifyClickOnShowRef.current = false;
      onClick?.();
    }
    onOpenChange?.(true);
    if (!isControlled) {
      setInternalIsOpen(true);
    }
  }, [isControlled, onClick, onOpenChange, resetFocusReturn]);
  const popover = usePopover({
    onHide: handleLayerHide,
    onShow: handleLayerShow,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
    // The popup's own role="menu" is the exposed semantics; wrapping it in a
    // modal dialog would announce an unnamed dialog around the menu.
    role: 'none'
  });
  const closeMenu = useCallback(() => {
    popover.hide();
  }, [popover]);

  // Single keyboard navigation path for both modes.
  // The selector matches plain items plus selectable items
  // (menuitemradio/menuitemcheckbox) so lab checkbox/radio rows are reachable
  // and roved to alongside plain items — not just role="menuitem".
  const {
    listRef,
    handleKeyDown: listNavKeyDown,
    focusFirst,
    focusLast,
    focusItem,
    ownsEvent,
    getItems: getMenuItems
  } = useListFocus({
    itemSelector: MENU_ITEM_SELECTOR,
    boundarySelector: MENU_BOUNDARY_SELECTOR,
    // Menus wrap from the last row to the first and back, as macOS menus do;
    // a picker's list clamps instead.
    wrap: true,
    hasPaging: true,
    onEscape: closeMenu
  });

  // Typeahead over the (enabled) menu items — jump to the next item whose
  // LABEL starts with the typed text, never its description, shortcut or
  // badge. Reuses the hook's scoped item collection so an inline submenu
  // flyout's items aren't swept in.
  const typeahead = useTypeahead({
    getItemLabels: () => getMenuItems().map(el => el.textContent),
    onMatch: focusItem,
    getCurrentIndex: () => getMenuItems().findIndex(el => el === document.activeElement || el.contains(document.activeElement))
  });

  // Mounting already open (`isMenuOpen` true on the first render) is not an
  // open anyone asked for, so it must not move focus into the menu — that
  // drops keyboard users mid-page (#5976). The flag is decided once at mount
  // rather than per effect run, because the layer may defer the first show
  // until its popover element mounts; it clears once the consumer closes the
  // menu, so every later open follows the modality rules above.
  const isMountedOpenRef = useRef(isControlled && controlledIsOpen === true);

  // Sync controlled open state → popover. A trigger open is committed first so
  // Popover can reject the dismissing gesture before notifying the controller.
  // If the controller has not accepted by the next layout pass, roll the DOM
  // state back before paint without emitting a second change request.
  useIsomorphicLayoutEffect(() => {
    if (!isControlled) {
      return;
    }
    if (controlledIsOpen) {
      pendingControlledOpenRef.current = false;
      if (!popover.isOpen) {
        shouldFocusOnOpenRef.current = !isMountedOpenRef.current;
        popover.show();
      }
    } else {
      isMountedOpenRef.current = false;
      if (popover.isOpen) {
        suppressControlledRollbackHideRef.current = pendingControlledOpenRef.current;
        pendingControlledOpenRef.current = false;
        popover.hide();
      }
    }
  }, [controlledIsOpen, isControlled, popover]);

  // Move focus into the menu only after the layer has committed open,
  // honoring the input modality: keyboard (and programmatic) opens land on
  // the first enabled item per the APG menu-button pattern; pointer opens
  // focus the menu container itself (tabIndex={-1}) so no item is
  // highlighted as if pre-selected (#4477). Container focus keeps arrows,
  // typeahead, Escape and Tab in the menu's onKeyDown, and is also the
  // fallback when no item is focusable (e.g. all disabled), mirroring the
  // submenu flyout fallback.
  useEffect(() => {
    if (!popover.isOpen || !shouldFocusOnOpenRef.current) {
      return;
    }
    shouldFocusOnOpenRef.current = false;
    requestAnimationFrame(() => {
      const focusEnd = focusLastOnOpenRef.current ? focusLast : focusFirst;
      focusLastOnOpenRef.current = false;
      if (openModalityRef.current === 'pointer' || !focusEnd()) {
        listRef.current?.focus();
      }
      openModalityRef.current = 'keyboard';
    });
  }, [popover.isOpen, focusFirst, focusLast, listRef]);

  // Extend useListFocus with Enter/Space activation + typeahead
  const listKeyDown = useCallback(e => {
    // A submenu flyout renders inline inside this menu; its key events bubble
    // up here. Let that level own them — only handle events from this level.
    if (!ownsEvent(e)) {
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // The key that opened the menu, held down, auto-repeats into the menu
      // once focus has moved there; a repeat is never an activation.
      if (e.repeat) {
        return;
      }
      const focused = document.activeElement;
      if (focused && MENU_ITEM_ROLES.has(focused.getAttribute('role') ?? '')) {
        // The synthesized click keeps the key's modifiers, so a modified
        // Enter on a link row opens the way a modified click would.
        activateMenuItem(focused, e);
      }
      return;
    }
    // APG menu-button pattern: Tab closes the menu. Menu items are
    // tabIndex={-1} so the focus trap has nothing trappable and Tab would
    // otherwise leak into the page while the menu stayed open (menus-5).
    // Do NOT preventDefault — closing restores focus to the trigger, and the
    // browser's default Tab then continues from there to the next element.
    if (e.key === 'Tab') {
      closeMenu();
      return;
    }
    // Type-to-focus next; if it consumed a printable key, stop here.
    if (typeahead.onKeyDown(e)) {
      e.preventDefault();
      return;
    }
    listNavKeyDown(e);
  }, [listNavKeyDown, closeMenu, typeahead, ownsEvent]);
  const openAndFocus = useCallback((modality = 'keyboard', notifyClick = false) => {
    acceptedOpenRef.current = false;
    notifyClickOnShowRef.current = notifyClick;
    pendingControlledOpenRef.current = isControlled;
    openModalityRef.current = modality;
    shouldFocusOnOpenRef.current = true;
    popover.show();
    if (!acceptedOpenRef.current) {
      notifyClickOnShowRef.current = false;
      pendingControlledOpenRef.current = false;
      openModalityRef.current = 'keyboard';
      shouldFocusOnOpenRef.current = false;
      return false;
    }
    return true;
  }, [isControlled, popover]);
  const isMenuOpenNow = isControlled ? controlledIsOpen === true : popover.isOpen;

  // A mouse opens on press-down; a finger held on the trigger opens after
  // the long-press delay. Pressing the trigger of an open menu closes it, and
  // the click of that same gesture — reported by `isTriggerClickFromPress` —
  // neither toggles nor reopens.
  const handleTriggerPress = useCallback(pointerType => {
    if (isMenuOpenNow) {
      if (pointerType !== 'mouse') {
        // A finger's tap toggles through its click, as it always did.
        return false;
      }
      onClick?.();
      if (isControlled) {
        onOpenChange?.(false);
      } else {
        popover.hide();
      }
      return false;
    }
    const didOpen = openAndFocus('pointer', true);
    if (didOpen && pointerType === 'mouse') {
      // The menu is `popover="auto"`: the browser's light dismiss would
      // read the release of this very press, on the trigger outside the
      // popover, as a dismissal. Holding the invoker relationship through
      // the press exempts the trigger, the way useKeepLayerOpenProps does
      // for controls beside an open layer.
      holdInvokerThroughPress(buttonRef.current, popover.id);
    }
    return didOpen;
  }, [isMenuOpenNow, isControlled, onClick, onOpenChange, openAndFocus, popover]);

  // The press model: the row under a release acts, the highlight follows a
  // held pointer. A mouse released outside the menu dismisses it; a finger
  // released outside leaves it open, so the hook never calls onDismiss then.
  const menuPress = useMenuPress({
    menuRef: listRef,
    triggerRef: buttonRef,
    itemSelector: MENU_ITEM_SELECTOR,
    onTriggerPress: handleTriggerPress,
    onDismiss: closeMenu
  });
  cancelMenuPressRef.current = menuPress.cancel;
  const handleButtonClick = useCallback(e => {
    // The press already opened or closed the menu; its click is spent.
    if (menuPress.isTriggerClickFromPress()) {
      return;
    }
    // detail === 0 marks a synthesized click (screen reader / AT
    // activation): treat it as keyboard so those users still land on the
    // first item. Real pointer clicks report detail >= 1.
    const modality = e.detail === 0 ? 'keyboard' : 'pointer';
    if (isControlled) {
      if (controlledIsOpen) {
        onClick?.();
        onOpenChange?.(false);
      } else {
        openAndFocus(modality, true);
      }
    } else if (popover.isOpen) {
      onClick?.();
      popover.hide();
    } else {
      openAndFocus(modality, true);
    }
  }, [menuPress, onClick, isControlled, onOpenChange, controlledIsOpen, popover, openAndFocus]);
  const handleTriggerClickCapture = useCallback(e => {
    const control = e.currentTarget;
    if (control.hasAttribute('popovertarget')) {
      // Still the invoker from a press-open: the browser would toggle the
      // menu shut on this click.
      e.preventDefault();
      control.removeAttribute('popovertarget');
    }
  }, []);
  const handleButtonKeyDown = useCallback(e => {
    if (!popover.isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (e.repeat) {
          return;
        }
        focusLastOnOpenRef.current = e.key === 'ArrowUp';
        openAndFocus();
      }
      return;
    }
    // Open with focus still on the trigger — a menu that mounted open, or
    // a pointer open followed by Shift+Tab — has nothing in the tab order
    // to reach its items, so ArrowDown walks in the way a keyboard open
    // would land (#5976). Enter/Space keep toggling the menu closed, and
    // once focus is inside, key events go to the menu container instead.
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!focusFirst()) {
        listRef.current?.focus();
      }
    }
  }, [popover.isOpen, openAndFocus, focusFirst, listRef]);

  // Icon-only
  const isIconOnly = button.isIconOnly === true;
  const resolvedEndContent = button.endContent ?? (hasChevron && !isIconOnly ? /*#__PURE__*/_jsx(Icon, {
    icon: "chevronDown",
    size: "sm",
    color: "inherit"
  }) : undefined);
  const requestedWidthLimit = alignment === 'center' ? MENU_MAX_INLINE_SIZE_FALLBACK : MENU_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK;
  const resolvedMenuWidth = menuWidth ? resolveMenuWidth(menuWidth, requestedWidthLimit) : null;
  const popoverXstyle = resolvedMenuWidth ? resolvedMenuWidth.property === 'inlineSize' ? styles.popoverCustomIntrinsicWidth(resolvedMenuWidth.value) : styles.popoverCustomWidth(resolvedMenuWidth.value) : alignment === 'center' ? styles.popoverCentered : styles.popoverAligned;
  const isSidePlacement = placement === 'start' || placement === 'end';

  // The drill-in view stack for sub-menus on a phone.
  const {
    drillIn,
    wrapContent
  } = useMenuDrillIn(isOpen);
  // The name a drilled-in view's Back row returns to.
  const menuLabel = typeof button.label === 'string' ? button.label : undefined;
  const resolvedMaxHeight = menuMaxHeight == null ? null : `${menuMaxHeight}px`;
  // Context for compound items
  const contextValue = useMemo(() => ({
    closeMenu,
    menuSize,
    drillIn,
    menuLabel
  }), [closeMenu, menuSize, drillIn, menuLabel]);

  // Resolve menu content: data-driven items become components
  const menuContent = wrapContent(props.items !== undefined ? renderDropdownItems(items) : children);
  const hasOverflow = useMenuOverflow(listRef, menuContent, popover.isOpen);
  const triggerProps = {
    ref: el => {
      buttonRef.current = el;
      popover.triggerRef(el);
    },
    id: triggerId,
    onClick: handleButtonClick,
    onClickCapture: handleTriggerClickCapture,
    onPointerDown: menuPress.triggerProps.onPointerDown,
    onContextMenu: menuPress.triggerProps.onContextMenu,
    onKeyDown: handleButtonKeyDown,
    // The popover's focus-return hook is a separate change; until it lands
    // the control's focus needs no bookkeeping here.
    onFocus: () => {},
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    'aria-controls': menuId
  };
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [renderTrigger != null ? renderTrigger(triggerProps) : /*#__PURE__*/_jsx(Button, {
      ...button,
      ref: el => {
        buttonRef.current = el;
        popover.triggerRef(el);
        const consumerRef = button.ref;
        if (typeof consumerRef === 'function') {
          consumerRef(el);
        } else if (consumerRef) {
          /* eslint-disable react-compiler/react-compiler -- ref callback: forwarding consumer ref object */
          consumerRef.current = el;
          /* eslint-enable react-compiler/react-compiler */
        }
      },
      xstyle: [styles.triggerPressable, isOpen && styles.triggerOpen, button.xstyle, isFocusRingSuppressed && focusOutlineStyles.suppressed],
      tooltip: isOpen ? undefined : button.tooltip,
      endContent: resolvedEndContent,
      onClick: handleButtonClick,
      onClickCapture: event => {
        button.onClickCapture?.(event);
        handleTriggerClickCapture(event);
      },
      onKeyDown: handleButtonKeyDown,
      onPointerDown: event => {
        button.onPointerDown?.(event);
        menuPress.triggerProps.onPointerDown(event);
      },
      onContextMenu: event => {
        button.onContextMenu?.(event);
        menuPress.triggerProps.onContextMenu(event);
      },
      onFocus: event => {
        button.onFocus?.(event);
        onFocusReturnTargetFocus();
      },
      "aria-haspopup": "menu",
      "aria-expanded": isOpen,
      "aria-controls": menuId,
      "data-testid": testId
    }), popover.render(/*#__PURE__*/_jsx("div", {
      ...rest,
      ref: el => {
        listRef.current = el;
        contentRef.current = el?.closest('[popover]') ?? null;
      },
      id: menuId,
      role: "menu"
      // Pointer opens focus the container so arrows, typeahead, Escape and
      // Tab remain owned by the menu without pre-highlighting an item.
      // An overflowing menu joins the Tab order so its scrollable region is
      // keyboard-accessible; Tab still dismisses through listKeyDown.
      ,
      tabIndex: hasOverflow ? 0 : -1
      // Give the menu an accessible name from its trigger's label, so
      // screen readers announce e.g. "Actions menu" rather than an unnamed
      // menu (menus-13). A custom trigger names it by reference.
      ,
      "aria-label": renderTrigger != null ? rest['aria-label'] : button.label,
      "aria-labelledby": renderTrigger != null && rest['aria-label'] == null ? triggerId : rest['aria-labelledby'],
      onKeyDown: listKeyDown,
      ...menuPress.menuProps,
      ...mergeProps(themeProps('dropdown-menu'), stylex.props(styles.dropdown, resolvedMaxHeight != null && dynamicStyles.menuMaxHeight(resolvedMaxHeight), hasOverflow ? styles.touchPanY : styles.touchNone, hasOverflow && styles.scrollable, xstyle), className, style),
      children: /*#__PURE__*/_jsx(DropdownMenuContext, {
        value: contextValue,
        children: menuContent
      })
    }), {
      placement,
      alignment,
      offset: spacingVars['--spacing-1'],
      xstyle: [styles.popoverViewport, resolvedMaxHeight != null && dynamicStyles.popoverViewportMaxBlockSize(resolvedMaxHeight), alignment === 'center' ? isSidePlacement ? styles.popoverViewportBlockCentered : styles.popoverViewportCentered : [styles.popoverViewportAligned, isSidePlacement ? alignment === 'start' ? styles.popoverViewportBlockStart : styles.popoverViewportBlockEnd : alignment === 'start' ? styles.popoverViewportStart : styles.popoverViewportEnd], popoverXstyle, layerAnimations[placement]]
    })]
  });
}
export function DropdownMenu(props) {
  const {
    onOpenChange
  } = props;
  // Both presentations hang the menu off ONE control.
  useDevWarning('DropdownMenu', '`button` and `trigger` are mutually exclusive: the menu hangs off one ' + 'control. `trigger` wins; drop `button`.', props.button != null && props.renderTrigger != null);
  const requestedPresentation = 'items' in props ? props.presentation ?? 'popover' : 'popover';
  const resolvedPresentation = useAdaptivePresentation(requestedPresentation);
  const isControlled = props.isMenuOpen !== undefined;
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isControlled ? props.isMenuOpen : internalIsOpen;
  const handleOpenChange = useCallback(nextIsOpen => {
    onOpenChange?.(nextIsOpen);
    if (!isControlled) {
      setInternalIsOpen(nextIsOpen);
    }
  }, [isControlled, onOpenChange]);
  const sharedProps = {
    ...props,
    isMenuOpen: isOpen,
    onOpenChange: handleOpenChange
  };
  if (resolvedPresentation === 'bottom-sheet' && 'items' in props && props.items !== undefined) {
    return /*#__PURE__*/_jsx(DropdownMenuBottomSheet, {
      ...sharedProps,
      presentation: "bottom-sheet"
    });
  }
  return /*#__PURE__*/_jsx(DropdownMenuPopover, {
    ...sharedProps,
    presentation: "popover"
  });
}
DropdownMenu.displayName = 'DropdownMenu';