// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useLongPress.ts
 * @input Long-press options: onLongPress callback, disabled, delayMs, moveCancelPx
 * @output Touch handlers to spread onto an element, plus the same detection
 *   driven by hand for a caller already observing pointer events
 * @position Core hook for long-press invocation; used by ContextMenu and by
 *   `useMenuPress` for the held-finger menu open
 *
 * SYNC: When modified, update the hooks barrel /packages/core/src/hooks/index.ts
 *
 * Detects a single-finger long-press: fires `onLongPress` with the press
 * start point after `delayMs`. Cancels if the finger moves past
 * `moveCancelPx` (treated as a scroll/drag), lifts, or the touch is
 * cancelled. The pending timer is also cleared on unmount.
 *
 * Two ways in, one detector. Spread the touch handlers onto an element, or —
 * when the caller already runs its own pointer-event machine, as
 * `useMenuPress` does — call `start`, `moveTo` and `cancel` from it. Either
 * way the hold duration, the movement tolerance and the timer are this
 * hook's, so a long press cannot come to mean one thing on a context menu
 * and another on a menu trigger.
 *
 * Motivation: iOS Safari never synthesizes a `contextmenu` event on
 * long-press, so long-press is the only touch affordance for opening
 * cursor-positioned surfaces.
 */
import { useCallback, useEffect, useRef } from 'react';

// Default long-press tuning.
const DEFAULT_DELAY_MS = 500;
const DEFAULT_MOVE_CANCEL_PX = 10;
export function useLongPress(options) {
  const {
    onLongPress,
    disabled = false,
    delayMs = DEFAULT_DELAY_MS,
    moveCancelPx = DEFAULT_MOVE_CANCEL_PX
  } = options;
  const timerRef = useRef(null);
  const startRef = useRef(null);
  // Keep the latest callback without re-creating handlers on every render.
  const onLongPressRef = useRef(onLongPress);
  onLongPressRef.current = onLongPress;
  const clear = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
  }, []);
  const start = useCallback(point => {
    if (disabled) {
      return;
    }
    // Clear any stale timer first, THEN record the start point — clearing
    // also nulls startRef, so order matters.
    clear();
    startRef.current = {
      x: point.x,
      y: point.y
    };
    timerRef.current = setTimeout(() => {
      const from = startRef.current;
      if (from == null) {
        return;
      }
      onLongPressRef.current({
        x: from.x,
        y: from.y
      });
    }, delayMs);
  }, [disabled, delayMs, clear]);
  const moveTo = useCallback(point => {
    const from = startRef.current;
    if (from == null) {
      return false;
    }
    if (Math.abs(point.x - from.x) > moveCancelPx || Math.abs(point.y - from.y) > moveCancelPx) {
      // Treat as a scroll/drag, not a long-press.
      clear();
      return false;
    }
    return true;
  }, [moveCancelPx, clear]);
  const onTouchStart = useCallback(e => {
    if (disabled) {
      return;
    }
    if (e.touches.length !== 1) {
      // Multi-touch cancels any pending long-press.
      clear();
      return;
    }
    const touch = e.touches[0];
    start({
      x: touch.clientX,
      y: touch.clientY
    });
  }, [disabled, clear, start]);
  const onTouchMove = useCallback(e => {
    if (startRef.current == null) {
      return;
    }
    if (e.touches.length !== 1) {
      // Multi-touch cancels the pending long-press.
      clear();
      return;
    }
    const touch = e.touches[0];
    moveTo({
      x: touch.clientX,
      y: touch.clientY
    });
  }, [clear, moveTo]);

  // Cancel any pending long-press timer on unmount.
  useEffect(() => clear, [clear]);
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd: clear,
    onTouchCancel: clear,
    start,
    moveTo,
    cancel: clear
  };
}