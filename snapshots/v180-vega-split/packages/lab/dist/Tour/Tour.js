// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Tour.tsx
 * @input Uses React state/refs, TourContext
 * @output Exports Tour controller component and TourProps
 * @position Lab experiment (facebook/astryx#4239); controller consumed by index.ts
 *
 * Tour is the controller for a product-tour / NUX walkthrough. It renders no
 * visible chrome of its own — it owns the tour state (active step, advance /
 * retreat / complete / dismiss) and shares it with declaratively-nested
 * `<TourStep>` children through context. Steps register on mount, so the step
 * ORDER is taken from the children in document order (no step array to keep in
 * sync with the markup).
 *
 * The behavior (a controller plus spotlight feature steps, an `isActive`
 * switch, dismiss-with-reason, and step progress) is composed from Astryx
 * primitives. Each step anchors its callout via Popover and draws its own
 * highlight/backdrop (see TourStep) — the controller owns no chrome.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Tour/TourStep.tsx
 * - /packages/lab/src/Tour/TourContext.ts
 * - /packages/lab/src/Tour/useTour.ts
 * - /packages/lab/src/Tour/Tour.doc.mjs (props table, features)
 * - /packages/lab/src/Tour/Tour.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/Tour/index.ts (exports if types change)
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TourContext } from "./TourContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Controller for a guided product tour. Renders no chrome; coordinates the
 * active step among its `<TourStep>` children.
 *
 * @example
 * ```
 * const [isActive, setIsActive] = useState(true);
 * const saveRef = useRef(null);
 * const shareRef = useRef(null);
 * <Tour isActive={isActive} hasBackdrop isStepCountShown onDismiss={() => setIsActive(false)}>
 *   <TourStep targetRef={saveRef} heading="Save your work">
 *     Changes save automatically to the cloud.
 *   </TourStep>
 *   <TourStep targetRef={shareRef} heading="Share it">
 *     Invite teammates from here.
 *   </TourStep>
 * </Tour>
 * ```
 */
export function Tour({
  isActive,
  children,
  onDismiss,
  hasBackdrop = false,
  isStepCountShown = false
}) {
  // Steps register on mount; insertion order (document order) defines the
  // sequence. A plain array keeps registration order deterministic.
  const [stepIds, setStepIds] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const registerStep = useCallback(id => {
    setStepIds(prev => prev.includes(id) ? prev : [...prev, id]);
    return () => {
      setStepIds(prev => prev.filter(stepId => stepId !== id));
    };
  }, []);

  // Reset to the first step whenever the tour is (re)started, so a dismissed
  // tour begins from the top next time isActive flips back on.
  useEffect(() => {
    if (!isActive) {
      setActiveStepIndex(0);
    }
  }, [isActive]);
  const stepCount = stepIds.length;
  const onNext = useCallback(() => {
    // Runs from a click/imperative call (never during render), so branch on the
    // current index directly rather than inside a state updater — calling
    // onDismiss from within setState triggers a "setState while rendering"
    // warning.
    if (activeStepIndex < stepCount - 1) {
      setActiveStepIndex(activeStepIndex + 1);
      return;
    }
    // Past the last step → complete. onDismiss carries the reason so a
    // consumer can branch on 'complete' vs an early exit.
    onDismiss('complete');
  }, [activeStepIndex, stepCount, onDismiss]);
  const onPrevious = useCallback(() => {
    setActiveStepIndex(prev => prev > 0 ? prev - 1 : prev);
  }, []);
  const activeStepId = isActive ? stepIds[activeStepIndex] ?? null : null;
  const contextValue = useMemo(() => ({
    registerStep,
    activeStepId,
    activeStepIndex,
    stepCount,
    isStepCountShown,
    hasBackdrop,
    onNext,
    onPrevious,
    onDismiss
  }), [registerStep, activeStepId, activeStepIndex, stepCount, isStepCountShown, hasBackdrop, onNext, onPrevious, onDismiss]);
  return /*#__PURE__*/_jsx(TourContext.Provider, {
    value: contextValue,
    children: children
  });
}
Tour.displayName = 'Tour';