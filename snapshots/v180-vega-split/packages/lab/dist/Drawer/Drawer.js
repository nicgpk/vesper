// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Drawer.tsx
 * @input Uses React, StyleX, theme tokens and text defaults, the Dialog purpose type, shared focus/dismissal/depth primitives, scroll locking/dialog presence, BaseProps, merged refs/props, themeProps
 * @output Exports Drawer component and DrawerProps
 * @position Lab implementation; consumed by index.ts, tested by Drawer.test.tsx, demonstrated in Storybook
 *
 * Overlay panel for inspectors and detail views — the "click a table row,
 * see its details" pattern. Slides in from the inline start or end edge and
 * floats above the page content: unlike a docked panel it never reflows the
 * layout underneath, it overlays it (with or without a scrim).
 *
 * Inline axis only (start/end). Block-axis sheets are BottomSheet's job;
 * a drawer is always a full-height side panel.
 *
 * Sizing is viewport-aware: `width` is the desktop budget, and below
 * the mobile breakpoint it preserves a 56px reveal of the page behind, capped
 * by the requested width (or fills the viewport with `isFullWidthOnMobile`).
 *
 * Uses the native `<dialog>` element (same precedent as Dialog/MobileNav):
 * - `showModal()` when `hasScrim` (default) — top-layer rendering, focus
 *   trapping, `::backdrop`, no z-index management.
 * - `showPopover()` when `hasScrim={false}` — non-modal top-layer overlay;
 *   the page behind stays interactive (e.g. master-detail inspectors).
 *
 * Entry animation uses `@starting-style`; exit slides out before the active
 * modal-dialog or manual-popover host releases the top layer and focus returns
 * to the element that opened the drawer. React owns `display` for both legs
 * rather than a discrete `display` transition, so the panel stops painting in
 * the same commit as the host closes — see the `rendered` style for why.
 *
 * Sibling drawers use the shared layer dismissal stack for topmost-only Escape
 * handling and the browser top layer's chronological paint order.
 *
 * Dismissal follows Dialog: `purpose` decides whether Escape and a scrim click
 * request close, and Drawer renders no close button of its own. Compose
 * `DrawerHeader` with `onOpenChange` for a visible close action, as with
 * `DialogHeader`.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Drawer/Drawer.doc.mjs (props table, features, usage)
 * - /packages/lab/src/Drawer/Drawer.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/Drawer/Drawer.spec.md (component contract)
 * - /packages/lab/src/Drawer/index.ts (exports if types change)
 * - /apps/storybook/stories/Drawer.stories.tsx (examples and visual coverage)
 */
import { useCallback, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { borderVars, colorVars, durationVars, easeVars, shadowVars, typeScaleVars, typographyVars } from '@astryxdesign/core/theme/tokens.stylex';
import { useFocusTrap, useMergedRefs, useScrollLock } from '@astryxdesign/core/hooks';
import { LayerDepthProvider, useLayerDismissal } from '@astryxdesign/core/Layer';
import { composeEventHandlers, mergeProps, themeProps } from '@astryxdesign/core/utils';
import { overlayPaddingReset } from '@astryxdesign/core/Layout';
import { useDrawerDialogPresence } from "./useDrawerDialogPresence.js";

// =============================================================================
// Styles
// =============================================================================

// Below this viewport width the drawer preserves a fixed reveal of the page
// behind instead of growing proportionally with the viewport. 640px is the
// repo's mobile breakpoint.
import { jsx as _jsx } from "react/jsx-runtime";
const MOBILE_BREAKPOINT = 640;

// Material's established mobile drawer pattern leaves a 56dp reveal. Using
// the same value in CSS pixels gives the overlay a stable visual relationship
// to the page behind while the requested width remains an upper bound.
const MOBILE_PAGE_REVEAL = 56;
const MOBILE_WIDTH_FULL = '100dvw';
const styles = {
  dialog: {
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
    kVAEAm: "xixxii4",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kaIpWk: "x2u8bby",
    ks0D6T: "x1x1rfll",
    kskxy: "x7ab17h",
    kB7OPa: "x9f619",
    kXwgrk: "xdt5ytf",
    kWkggS: "x10xzikg",
    kGVxlE: "x1kcpxr7",
    kVQacm: "xb3r6kr",
    kZeWKH: "xish69e",
    kI3sdo: "x1a2a7pz",
    k87sOh: "x13vifvy",
    krVfgx: "x1ey2m1c",
    kZKoxP: "xtdtrs8",
    k1xSpc: "x1s85apg",
    k1ekBW: "x11xpdln",
    kIyJzY: "x80gvsz",
    kAMwcw: "xlr8y92",
    k6CgDc: "xzg1mie",
    $$css: true
  },
  rendered: {
    k1xSpc: "x78zum5",
    $$css: true
  },
  end: {
    kt4wiu: "xtijo5x",
    kLqNvP: "xhi6v0a",
    k2ei4v: "xgbv0en",
    kVhnKS: "x1t7ytsu",
    kGJrpR: "x1j92z86",
    k3aq6I: "xumwmo6 x1df3fe5",
    $$css: true
  },
  endOpen: {
    k3aq6I: "xbryuvx x1yqmsfc x1lymnkk",
    $$css: true
  },
  start: {
    kLqNvP: "x1o0tod",
    kt4wiu: "x1woyocn",
    ke9TFa: "xw8tdv1",
    k8ry5P: "x18b5jzi",
    kBCPoo: "x1gejf6u",
    k3aq6I: "x5i6ehr xttggg",
    $$css: true
  },
  startOpen: {
    k3aq6I: "xbryuvx x6mt36l x14gflnl",
    $$css: true
  },
  scrim: {
    kGyWv1: "xnixb3f",
    kba3nw: "x1abwkk1",
    k5sjJv: "xph5o2a",
    kND0Po: "x167zut7",
    k9an0g: "xft5bk6",
    kb4ib: "x15h3t91",
    kA5Tbj: "x1viac0w",
    $$css: true
  },
  scrimOpen: {
    k5sjJv: "xb3n6bw xxiuuzi",
    $$css: true
  }
};
const _temp = {
  ks0D6T: "xlbgzzq",
  "$$css": true
};
const dynamicStyles = {
  inlineSize: (desktopWidth, mobileWidth) => [_temp, {
    kzqmXN: (desktopWidth != null ? "x11ymkkh " : desktopWidth) + (mobileWidth != null ? "xci7e5a" : mobileWidth),
    $$css: true
  }, {
    "--x-1xmrurk": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(desktopWidth),
    "--x-fqzwsx": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(mobileWidth)
  }]
};

// =============================================================================
// Types
// =============================================================================

// =============================================================================
// Component
// =============================================================================

/**
 * An overlay panel for inspectors and detail views.
 *
 * Slides in from the logical start or end edge and floats above the page
 * using the native `<dialog>` element: modal with a scrim by default, or a
 * non-modal overlay with `hasScrim={false}` that leaves the page behind
 * interactive. `width` is the desktop budget; below 640px the panel preserves
 * a 56px page reveal without exceeding that budget (or fills the viewport
 * with `isFullWidthOnMobile`). Escape
 * closes the top-most open drawer; focus returns to the element that
 * opened it.
 *
 * Dismissal matches Dialog: `purpose` decides whether Escape and a scrim click
 * close the drawer, and `DrawerHeader` renders a close button when given
 * `onOpenChange`.
 *
 * @example
 * ```
 * const [selected, setSelected] = useState(null);
 * const handleOpenChange = isOpen => !isOpen && setSelected(null);
 * <Drawer
 *   isOpen={selected != null}
 *   onOpenChange={handleOpenChange}
 *   label={`Details: ${selected?.name}`}>
 *   <DrawerHeader title={selected?.name} onOpenChange={handleOpenChange} />
 *   <HostDetails host={selected} />
 * </Drawer>
 * ```
 */
export function Drawer({
  isOpen,
  onOpenChange,
  side = 'end',
  width = 400,
  isFullWidthOnMobile = false,
  label,
  hasScrim = true,
  purpose = 'info',
  children,
  xstyle,
  className,
  style,
  onClick: onClickProp,
  onKeyDown: onKeyDownProp,
  ref,
  ...props
}) {
  const dialogRef = useRef(null);
  const {
    containerRef: focusTrapRef
  } = useFocusTrap({
    isActive: isOpen && hasScrim
  });
  const mergedDialogRef = useMergedRefs(ref, dialogRef, focusTrapRef);
  // Derive dismissal behavior from purpose, as Dialog does.
  const allowEscape = purpose !== 'required';
  const allowScrimClick = purpose === 'info';
  // Whether the panel paints: true while open and for the whole slide-out.
  const [isRendered, setIsRendered] = useState(isOpen);

  // Adjusted during render, not in an effect: the panel has to be rendered in
  // the same commit that targets the open transform, or @starting-style has
  // nothing to animate from.
  if (isOpen && !isRendered) {
    setIsRendered(true);
  }
  useDrawerDialogPresence({
    dialogRef,
    isOpen,
    isModal: hasScrim,
    setIsRendered
  });
  const handleDismiss = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // The shared stack owns Escape delivery across every overlay family. The
  // provider below gives layers opened from Drawer content a greater logical
  // depth even when they render elsewhere in the DOM or browser top layer.
  const {
    shouldDismissOnCloseRequest
  } = useLayerDismissal({
    // The native host stays present through the slide-out. Keep this entry on
    // the stack until the same commit that hides the host, so a second Escape
    // cannot fall through to a lower layer during the exit animation.
    isActive: isRendered,
    // A `required` drawer consumes Escape without closing, so the press cannot
    // fall through and dismiss a layer behind it either.
    escapeBehavior: allowEscape ? 'close' : 'block',
    onDismiss: handleDismiss,
    getContainer: () => dialogRef.current
  });

  // Lock body scroll while a modal drawer is open (iOS Safari workaround).
  useScrollLock(isOpen && hasScrim);

  // A modal dialog's native cancel event is a platform close request (for
  // example Android Back). Keep controlled state authoritative and apply the
  // same top-most/IME rules as the shared Escape listener.
  const handleCancel = useCallback(event => {
    event.preventDefault();
    if (shouldDismissOnCloseRequest() && allowEscape) {
      handleDismiss();
    }
  }, [allowEscape, handleDismiss, shouldDismissOnCloseRequest]);

  // Clicks on the ::backdrop target the <dialog> element itself; clicks on
  // drawer content always target a child (the content area fills the panel).
  const handleClick = useCallback(event => {
    if (event.target === event.currentTarget && hasScrim && allowScrimClick) {
      onOpenChange(false);
    }
  }, [allowScrimClick, hasScrim, onOpenChange]);
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const mobileWidth = isFullWidthOnMobile ? MOBILE_WIDTH_FULL : `min(${widthValue}, calc(100dvw - ${MOBILE_PAGE_REVEAL}px))`;

  // The side the panel is ANCHORED to, which is the side it must slide back
  // out to. Latched at open, because a consumer commonly derives `side` from
  // the same state that drives `isOpen` (`side={selected?.side ?? 'end'}`):
  // that state clears on close, so the live prop flips mid-exit and the panel
  // teleports to the other edge and slides out the wrong way. Children stay
  // mounted for the exit for the same reason; so does the anchor.
  const exitSideRef = useRef(side);
  if (isOpen) {
    exitSideRef.current = side;
  }
  const anchoredSide = isOpen ? side : exitSideRef.current;
  const sideStyle = anchoredSide === 'start' ? styles.start : styles.end;
  const sideOpenStyle = anchoredSide === 'start' ? styles.startOpen : styles.endOpen;

  // Filter out native `open` to prevent InvalidStateError when passed
  const {
    open: _open,
    ...safeProps
  } = props;
  return /*#__PURE__*/_jsx("dialog", {
    ref: mergedDialogRef,
    ...mergeProps(themeProps('drawer', {
      side: anchoredSide
    }), stylex.props(styles.dialog, overlayPaddingReset.reset, sideStyle, dynamicStyles.inlineSize(widthValue, mobileWidth), isRendered && styles.rendered, isOpen && sideOpenStyle, hasScrim && styles.scrim, hasScrim && isOpen && styles.scrimOpen, xstyle), className, style),
    ...safeProps,
    popover: hasScrim ? undefined : 'manual',
    "aria-label": label,
    "aria-modal": hasScrim ? 'true' : undefined,
    ...(purpose === 'required' && hasScrim ? {
      role: 'alertdialog'
    } : undefined),
    onClick: composeEventHandlers(onClickProp, handleClick),
    onKeyDown: onKeyDownProp,
    onCancel: handleCancel,
    children: /*#__PURE__*/_jsx(LayerDepthProvider, {
      children: /*#__PURE__*/_jsx("div", {
        tabIndex: -1,
        ...{
          className: "x1iyjqo2 x2lwn1j xh8yej3 x1odjw0f x6ikm8r xish69e xx69xxh x1a148e8 x1a2a7pz"
        },
        children: children
      })
    })
  });
}
Drawer.displayName = 'Drawer';