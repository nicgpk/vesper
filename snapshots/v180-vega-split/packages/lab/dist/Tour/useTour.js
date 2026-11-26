// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTour.ts
 * @input Uses React useContext, TourContext
 * @output Exports useTour hook and UseTourReturn type
 * @position Public hook; reads the nearest Tour controller's state
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Tour/TourContext.ts
 * - /packages/lab/src/Tour/Tour.doc.mjs
 */
import { useContext } from 'react';
import { TourContext } from "./TourContext.js";

/**
 * Read-only view of the active Tour's state, for custom step UIs or
 * instrumentation. Returns `null` when called outside a `<Tour>`.
 */

/**
 * Access the current Tour controller state. Must be used inside a `<Tour>`;
 * returns `null` otherwise so callers can guard.
 */
export function useTour() {
  const ctx = useContext(TourContext);
  if (ctx == null) {
    return null;
  }
  return {
    activeStepIndex: ctx.activeStepIndex,
    stepCount: ctx.stepCount,
    isFirstStep: ctx.activeStepIndex <= 0,
    isLastStep: ctx.stepCount > 0 && ctx.activeStepIndex === ctx.stepCount - 1,
    next: ctx.onNext,
    previous: ctx.onPrevious,
    dismiss: ctx.onDismiss
  };
}