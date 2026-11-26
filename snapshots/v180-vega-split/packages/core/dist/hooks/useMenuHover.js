// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMenuHover.ts
 * @input Uses React hooks, useListFocus, useMediaQuery
 * @output Exports useMenuHover hook
 * @position Internal hook; used by nav heading components, TopNavMenu,
 *           TopNavMegaMenu and DropdownMenuSubMenu
 *
 * Hover as a progressive enhancement over standard popover behavior: click
 * toggles, Escape and outside-click close, arrows navigate; on top of that,
 * mouseenter opens after a delay and mouseleave closes one that hover opened.
 *
 * Three behaviors here are not obvious and are load-bearing:
 *
 * 1. Hover→click guard (#3121). A hover-opened menu is already open under the
 *    cursor when the pointer arrives, so the click that naturally follows would
 *    toggle it shut. Within `clickGuardMs` a click instead confirms it: the menu
 *    pins and behaves like a click-open from then on.
 *
 * 2. Focus moves synchronously. `useLayer.show()` calls `showPopover()` in the
 *    same tick and the layer's children are always mounted, so items are
 *    focusable the moment `show()` returns — a `requestAnimationFrame` here
 *    lands after paint and races anything else moving focus. Hover-opens are the
 *    exception: the pointer is driving, so focus stays on the trigger. The hook
 *    always passes `skipAutoFocus` and owns focus itself, because the popover's
 *    auto-focus targets the first *tabbable* node while a menu wants its first
 *    item — under roving tabindex those are different elements.
 *
 * 3. Native light dismiss. A `popover="auto"` is dismissed by the browser on
 *    pointer interaction outside the panel, and a trigger outside the panel
 *    counts — before React's click handler runs. `popoverId` makes the trigger
 *    the panel's invoker, which exempts it. jsdom implements neither light
 *    dismiss nor invokers, so that wiring is only verifiable in a browser.
 */
import { useCallback, useEffect, useRef } from 'react';
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";
import { useListFocus } from "./useListFocus.js";
import { useMediaQuery } from "./useMediaQuery.js";
const DEFAULT_CLICK_GUARD_MS = 500;

/**
 * How long after a close a mouseenter on the trigger is ignored.
 *
 * A panel positioned over its own trigger puts that trigger back under a
 * stationary pointer when it closes, and the browser fires a fresh mouseenter —
 * which reopened the menu the user had just dismissed. Time-bounded rather than
 * a one-shot flag, so a deliberate re-hover seconds later still opens; a real
 * mouseleave clears it early.
 */
const REOPEN_SUPPRESS_MS = 300;

/**
 * Slack added to the flyout's near edge when building the safe triangle, so a
 * pointer skimming the edge's corners still counts as heading for the flyout.
 */
const SAFE_TRIANGLE_PADDING_PX = 8;
function sign(p1, p2, p3) {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}
function isPointInTriangle(p, a, b, c) {
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);
  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNegative && hasPositive);
}

/**
 * Whether `point` lies inside the safe triangle from `origin` (where the
 * pointer left the trigger row) to the flyout's NEAR edge — the edge of
 * `flyout` facing the origin. A pointer travelling inside it is heading for
 * the flyout, so the flyout must stay open. Exported for unit tests.
 */
export function isPointInSafeTriangle(point, origin, flyout) {
  const pad = SAFE_TRIANGLE_PADDING_PX;
  let edgeStart;
  let edgeEnd;
  if (origin.x <= flyout.left) {
    edgeStart = {
      x: flyout.left,
      y: flyout.top - pad
    };
    edgeEnd = {
      x: flyout.left,
      y: flyout.bottom + pad
    };
  } else if (origin.x >= flyout.right) {
    edgeStart = {
      x: flyout.right,
      y: flyout.top - pad
    };
    edgeEnd = {
      x: flyout.right,
      y: flyout.bottom + pad
    };
  } else if (origin.y <= flyout.top) {
    edgeStart = {
      x: flyout.left - pad,
      y: flyout.top
    };
    edgeEnd = {
      x: flyout.right + pad,
      y: flyout.top
    };
  } else if (origin.y >= flyout.bottom) {
    edgeStart = {
      x: flyout.left - pad,
      y: flyout.bottom
    };
    edgeEnd = {
      x: flyout.right + pad,
      y: flyout.bottom
    };
  } else {
    // The origin is over the flyout itself: nothing to travel toward.
    return false;
  }
  return isPointInTriangle(point, origin, edgeStart, edgeEnd);
}
export function useMenuHover(options) {
  const {
    show,
    hide,
    isOpen,
    isEnabled,
    showDelay = 150,
    hideDelay = 200,
    clickGuardMs = DEFAULT_CLICK_GUARD_MS,
    itemSelector,
    popoverId,
    ownsFocus = true,
    flyoutRef
  } = options;
  const hasHover = useMediaQuery('(hover: hover)');
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const triggerElRef = useRef(null);
  /** Removes the document pointer listener that watches the safe triangle. */
  const safeTriangleCleanupRef = useRef(null);
  /** Menu was hover-opened, so mouseleave may close it. */
  const hoverModeRef = useRef(false);
  const closedAtRef = useRef(0);
  /** When the current open began as a hover-open; 0 once confirmed or closed. */
  const hoverOpenedAtRef = useRef(0);
  const prevIsOpenRef = useRef(isOpen);

  // Catches every close, whatever caused it. A layout effect, not render: it
  // must land before the browser hit-tests the vanished panel and fires the
  // mouseenter REOPEN_SUPPRESS_MS exists to swallow.
  useIsomorphicLayoutEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (wasOpen && !isOpen) {
      hoverModeRef.current = false;
      hoverOpenedAtRef.current = 0;
      closedAtRef.current = Date.now();
    }
  }, [isOpen]);
  const clearTimeouts = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    safeTriangleCleanupRef.current?.();
    safeTriangleCleanupRef.current = null;
  }, []);

  // useListFocus needs an onEscape that is defined in terms of its own listRef;
  // the indirection avoids the use-before-declare.
  const escapeHandlerRef = useRef(() => {});
  const {
    listRef: menuRef,
    handleKeyDown: handleListKeyDown,
    focusFirst
  } = useListFocus({
    itemSelector,
    onEscape: () => escapeHandlerRef.current()
  });
  const hideAndRestoreFocus = useCallback(() => {
    // Read before hiding: closing the layer moves focus itself.
    const menuHadFocus = menuRef.current?.contains(document.activeElement) ?? false;
    hide();
    if (menuHadFocus) {
      triggerElRef.current?.focus();
    }
  }, [hide, menuRef]);
  useEffect(() => {
    escapeHandlerRef.current = () => {
      clearTimeouts();
      hideAndRestoreFocus();
    };
  }, [clearTimeouts, hideAndRestoreFocus]);
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  // A trigger disabled while a hover is in flight must stay closed. Returning
  // inert handlers below is not enough on its own: the open this hover already
  // scheduled would still fire, and it would open a surface whose handlers can
  // no longer close it.
  useEffect(() => {
    if (!isEnabled) {
      clearTimeouts();
    }
  }, [isEnabled, clearTimeouts]);
  const focusMenu = useCallback(() => {
    // An empty or still-loading menu has no focusable item; focus the container
    // so keyboard ownership still transfers off the trigger's list.
    if (!focusFirst()) {
      menuRef.current?.focus();
    }
  }, [focusFirst, menuRef]);
  const openAndFocus = useCallback(() => {
    if (!ownsFocus) {
      show();
      return;
    }
    show({
      skipAutoFocus: true
    });
    focusMenu();
  }, [ownsFocus, show, focusMenu]);
  const confirmHoverOpen = useCallback(() => {
    const isConfirming = clickGuardMs > 0 && hoverOpenedAtRef.current > 0 && Date.now() - hoverOpenedAtRef.current < clickGuardMs;
    if (!isConfirming) {
      return false;
    }
    hoverModeRef.current = false;
    hoverOpenedAtRef.current = 0;
    return true;
  }, [clickGuardMs]);
  const handleClick = useCallback(event => {
    // Cancel the invoker's default toggle so this handler stays the single
    // source of truth; popoverTarget still exempts the trigger from dismissal.
    if (popoverId) {
      event?.preventDefault();
    }
    clearTimeouts();

    // Enter/Space arrive as a click with detail 0, and always open. A keyboard
    // user reaches the trigger of an open menu only because a hover-open left
    // focus behind; closing there would stranded them outside a visible menu.
    const isKeyboardActivation = event != null && event.detail === 0;
    if (isKeyboardActivation) {
      closedAtRef.current = 0;
      hoverModeRef.current = false;
      hoverOpenedAtRef.current = 0;
      if (isOpen) {
        if (ownsFocus) {
          focusMenu();
        }
      } else {
        openAndFocus();
      }
      return;
    }
    if (!isOpen) {
      closedAtRef.current = 0;
      hoverModeRef.current = false;
      hoverOpenedAtRef.current = 0;
      openAndFocus();
      return;
    }
    if (confirmHoverOpen()) {
      if (ownsFocus) {
        focusMenu();
      }
      return;
    }
    hideAndRestoreFocus();
  }, [popoverId, clearTimeouts, isOpen, ownsFocus, confirmHoverOpen, openAndFocus, focusMenu, hideAndRestoreFocus]);
  const handleMouseEnter = useCallback(() => {
    if (!hasHover) {
      return;
    }
    if (closedAtRef.current > 0 && Date.now() - closedAtRef.current < REOPEN_SUPPRESS_MS) {
      return;
    }
    // Re-entering an open menu's trigger must not un-pin it or re-arm the
    // guard, which would make the next deliberate click another "confirm" and
    // leave the menu undismissable.
    if (isOpen) {
      clearTimeouts();
      return;
    }
    hoverModeRef.current = true;
    clearTimeouts();
    const openByHover = () => {
      hoverOpenedAtRef.current = Date.now();
      show({
        skipAutoFocus: true
      });
    };
    if (showDelay > 0) {
      showTimerRef.current = setTimeout(openByHover, showDelay);
    } else {
      openByHover();
    }
  }, [hasHover, isOpen, clearTimeouts, show, showDelay]);
  const handleMouseLeave = useCallback(event => {
    // A real leave ends the stationary-pointer case the suppression window
    // exists for, so the next enter is deliberate whenever it arrives.
    closedAtRef.current = 0;
    if (!hoverModeRef.current) {
      return;
    }
    clearTimeouts();
    // Where the pointer was last seen, so the delay can ask whether it is
    // still heading for the flyout rather than only reacting to movement.
    let lastPoint = null;
    let isTracking = false;
    let isInside = () => false;
    const scheduleHide = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => {
        // A pointer that stopped mid-diagonal, aiming at a row, is still
        // heading for the flyout: pausing is not leaving, and that pause
        // is the exact moment the triangle exists to protect. Re-arm
        // instead of closing underneath it. A pointer parked here holds
        // the flyout open the same way a pointer parked on the row does;
        // the first move outside the triangle ends it.
        if (isTracking && lastPoint != null && isInside(lastPoint)) {
          scheduleHide();
          return;
        }
        hide();
      }, hideDelay);
    };
    scheduleHide();

    // The safe triangle: while the pointer travels from where it left
    // the trigger toward the flyout's near edge, it is heading for the
    // flyout, and every move inside the triangle restarts the hide delay.
    // The first move outside it lets the delay run out.
    const menu = flyoutRef?.current ?? menuRef.current;
    const apex = event != null ? {
      x: event.clientX,
      y: event.clientY
    } : null;
    if (menu == null || apex == null || !isOpen) {
      return;
    }
    const rect = menu.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const doc = menu.ownerDocument;
    isInside = point => isPointInSafeTriangle(point, apex, rect);
    isTracking = true;
    lastPoint = apex;
    const onPointerMove = move => {
      const point = {
        x: move.clientX,
        y: move.clientY
      };
      lastPoint = point;
      if (isInside(point)) {
        scheduleHide();
        return;
      }
      isTracking = false;
      safeTriangleCleanupRef.current?.();
      safeTriangleCleanupRef.current = null;
    };
    doc.addEventListener('pointermove', onPointerMove, true);
    safeTriangleCleanupRef.current = () => {
      doc.removeEventListener('pointermove', onPointerMove, true);
    };
  }, [clearTimeouts, hide, hideDelay, isOpen, menuRef, flyoutRef]);
  const handleContentMouseEnter = useCallback(() => {
    clearTimeouts();
  }, [clearTimeouts]);
  const setTriggerRef = useCallback(el => {
    triggerElRef.current = el;
  }, []);
  const noop = useCallback(() => {}, []);
  const noopRef = useCallback(_el => {}, []);
  const noopKeyDown = useCallback(_e => {}, []);
  if (!isEnabled) {
    return {
      triggerProps: {
        onClick: noop,
        onMouseEnter: noop,
        onMouseLeave: noop
      },
      contentProps: {
        onMouseEnter: noop,
        onMouseLeave: noop,
        onKeyDown: noopKeyDown
      },
      menuRef,
      focusFirst,
      focusMenu,
      confirmHoverOpen,
      close: hideAndRestoreFocus,
      setTriggerEl: noopRef
    };
  }
  return {
    triggerProps: {
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      ...(popoverId ? {
        popoverTarget: popoverId
      } : null)
    },
    contentProps: {
      onMouseEnter: handleContentMouseEnter,
      onMouseLeave: handleMouseLeave,
      onKeyDown: handleListKeyDown
    },
    menuRef,
    focusFirst,
    focusMenu,
    confirmHoverOpen,
    close: hideAndRestoreFocus,
    setTriggerEl: setTriggerRef
  };
}