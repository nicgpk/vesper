// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TourStep.tsx
 * @input Uses React, Popover/Button/Text/Heading/Stack from @astryxdesign/core, TourContext
 * @output Exports TourStep component and TourStepProps
 * @position Lab experiment (facebook/astryx#4239); a single spotlight step in a Tour
 *
 * A TourStep highlights a target element and renders a callout anchored to it,
 * with a heading, body, optional step progress ("2 of 5"), and back / next /
 * close controls. It registers with the parent `<Tour>` on mount (so step
 * order follows the children) and only renders its callout while it is the
 * active step. Anchoring + the callout surface reuse the core `Popover`
 * (`anchorRef` → the step's target), so positioning, top-layer rendering, and
 * dismiss semantics come from the existing layer system rather than a bespoke
 * implementation.
 *
 * The highlight is drawn as a separate overlay tracking the target's box — the
 * consumer's element is never restyled, so there is no cascade fight with the
 * target's own styles. That overlay is promoted into the browser TOP LAYER
 * (via the popover API, like the rest of the layer system) so it sits above
 * page content without any hardcoded z-index; the callout is promoted after
 * it, so the callout stays above the highlight. Because it is promoted in
 * place (not portaled out of the tree), it stays inside the consumer's Theme
 * subtree and inherits theme tokens — including a scoped/nested theme's accent
 * for the ring. Dimming is an opt-in spotlight cutout (dims around the target,
 * not over it) rather than a flat scrim.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Tour/Tour.tsx
 * - /packages/lab/src/Tour/TourContext.ts
 * - /packages/lab/src/Tour/Tour.doc.mjs (props table, features)
 * - /packages/lab/src/Tour/Tour.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/Tour/index.ts (exports if types change)
 */
import { useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Popover } from '@astryxdesign/core/Popover';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, spacingVars, durationVars, easeVars } from '@astryxdesign/core/theme/tokens.stylex';
import { TourContext } from "./TourContext.js";

// Client-only layout effect (SSR renders no overlay, so this only runs on the
// client). Kept local since core does not export its isomorphic variant.
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const useClientLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Gap between the target's edge and the highlight ring, in px.
const HIGHLIGHT_PADDING = 4;
const styles = {
  footer: {
    kGNEyG: "x6s0dn4",
    kjj79g: "x1qughib",
    $$css: true
  },
  calloutGapBelow: {
    keoZOQ: "xtbrsbv",
    $$css: true
  },
  calloutGapAbove: {
    k1K539: "x1p37lm5",
    $$css: true
  },
  calloutGapStart: {
    k71WvV: "x1pezmd8",
    $$css: true
  },
  calloutGapEnd: {
    keTefX: "x1cmpsy9",
    $$css: true
  }
};
const calloutGapStyles = {
  below: styles.calloutGapBelow,
  above: styles.calloutGapAbove,
  start: styles.calloutGapStart,
  end: styles.calloutGapEnd
};

/**
 * The highlight overlay: a top-layer box sized to the target, plus an optional
 * spotlight-cutout dim. Rendered inline (not portaled) so it stays inside the
 * consumer's Theme subtree and inherits theme tokens — the popover API promotes
 * it into the top layer in place. Rendered before the callout so the callout
 * promotes on top of it; promoted once (never re-promoted) so that ordering
 * holds across re-measures.
 */
function TourHighlight({
  rect,
  hasBackdrop,
  onBackdropClick
}) {
  const ref = useRef(null);
  useClientLayoutEffect(() => {
    const el = ref.current;
    if (el == null || typeof el.showPopover !== 'function') {
      return;
    }
    el.showPopover();
    return () => {
      if (el.isConnected && typeof el.hidePopover === 'function') {
        el.hidePopover();
      }
    };
  }, []);
  return /*#__PURE__*/_jsx("div", {
    ref: ref,
    popover: "manual",
    "data-testid": hasBackdrop ? 'tour-backdrop' : undefined,
    "aria-hidden": "true",
    onClick: hasBackdrop ? onBackdropClick : undefined,
    ...{
      0: {
        className: "xixxii4 x10a8y8t x1ghz6dp x1717udv xc342km xng3xce xjbqb8w x1rea2x4 x47corl"
      },
      1: {
        className: "xixxii4 x10a8y8t x1ghz6dp x1717udv xc342km xng3xce xjbqb8w x1rea2x4 x67bb7w"
      }
    }[!!hasBackdrop << 0],
    children: /*#__PURE__*/_jsx("div", {
      "data-testid": "tour-highlight",
      ...{
        0: {
          className: "x10l6tqk x47corl xr5mita x1gfj591 xuedmi6 xlr8y92"
        },
        2: {
          className: "x10l6tqk x47corl x1gfj591 xuedmi6 xlr8y92 xefcaua"
        },
        1: {
          className: "x10l6tqk x47corl xr5mita x1gfj591 xuedmi6 xlr8y92 xg01cxk"
        },
        3: {
          className: "x10l6tqk x47corl x1gfj591 xuedmi6 xlr8y92 xefcaua xg01cxk"
        }
      }[!!hasBackdrop << 1 | !!(rect == null) << 0],
      style: rect != null ? {
        top: rect.top - HIGHLIGHT_PADDING,
        left: rect.left - HIGHLIGHT_PADDING,
        width: rect.width + HIGHLIGHT_PADDING * 2,
        height: rect.height + HIGHLIGHT_PADDING * 2,
        borderRadius: rect.radius
      } : undefined
    })
  });
}
/**
 * A single spotlight step within a `<Tour>`. Renders its callout only while
 * active.
 *
 * @example
 * ```
 * <TourStep targetRef={saveRef} heading="Save your work">
 *   Changes save automatically.
 * </TourStep>
 * ```
 */
export function TourStep({
  targetRef,
  heading,
  children,
  placement = 'below',
  alignment = 'start',
  'data-testid': testId
}) {
  const tour = useContext(TourContext);
  const id = useId();
  const isActiveStep = tour != null && tour.activeStepId === id;

  // The active target's viewport box, tracked so the highlight overlay can sit
  // exactly over it. null until measured (or when inactive).
  const [rect, setRect] = useState(null);

  // Register with the controller on mount so the tour learns this step (and
  // its position among siblings). Unregister on unmount.
  useEffect(() => {
    if (tour == null) {
      return;
    }
    return tour.registerStep(id);
  }, [tour, id]);

  // Track the target's box while this step is active. Re-measure on
  // scroll/resize so the highlight stays glued to the target.
  useEffect(() => {
    const el = targetRef.current;
    if (el == null || !isActiveStep) {
      setRect(null);
      return;
    }
    const measure = () => {
      const box = el.getBoundingClientRect();
      setRect({
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
        radius: getComputedStyle(el).borderRadius || '0px'
      });
    };
    measure();
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
      setRect(null);
    };
  }, [targetRef, isActiveStep]);

  // Outside a <Tour>, or when this isn't the active step, render nothing.
  if (tour == null || !isActiveStep) {
    return null;
  }
  const {
    activeStepIndex,
    stepCount,
    isStepCountShown,
    hasBackdrop,
    onNext,
    onPrevious,
    onDismiss
  } = tour;
  const isFirstStep = activeStepIndex <= 0;
  const isLastStep = stepCount > 0 && activeStepIndex === stepCount - 1;
  const content = /*#__PURE__*/_jsxs("div", {
    ...{
      className: "x78zum5 xdt5ytf xjcht0a x1va8c73"
    },
    "data-testid": testId,
    children: [/*#__PURE__*/_jsxs(VStack, {
      gap: 1,
      children: [/*#__PURE__*/_jsx(Heading, {
        level: 4,
        children: heading
      }), children != null && /*#__PURE__*/_jsx(Text, {
        type: "body",
        children: children
      })]
    }), /*#__PURE__*/_jsxs(HStack, {
      gap: 2,
      xstyle: styles.footer,
      children: [isStepCountShown && stepCount > 0 ? /*#__PURE__*/_jsx(Text, {
        type: "supporting",
        color: "secondary",
        children: `${activeStepIndex + 1} of ${stepCount}`
      }) : /*#__PURE__*/_jsx("span", {}), /*#__PURE__*/_jsxs(HStack, {
        gap: 2,
        children: [!isFirstStep && /*#__PURE__*/_jsx(Button, {
          variant: "ghost",
          size: "sm",
          label: "Back",
          onClick: onPrevious
        }), /*#__PURE__*/_jsx(Button, {
          variant: "primary",
          size: "sm",
          label: isLastStep ? 'Done' : 'Next',
          onClick: onNext
        })]
      })]
    })]
  });
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(TourHighlight, {
      rect: rect,
      hasBackdrop: hasBackdrop,
      onBackdropClick: () => onDismiss('backdrop')
    }), /*#__PURE__*/_jsx(Popover
    // Popover types anchorRef as RefObject<HTMLElement>; TourStep accepts a
    // nullable ref for ergonomics (useRef<HTMLButtonElement>(null)). Popover
    // guards a null `.current` internally, so this widening is safe.
    , {
      anchorRef: targetRef,
      isOpen: true,
      onOpenChange: open => {
        // Popover reports close from light-dismiss (backdrop) or Escape.
        // Route it to the tour as a dismissal so the whole tour ends, not
        // just this step's popover. Escape and outside-click both surface
        // here.
        if (!open) {
          onDismiss('close');
        }
      },
      placement: placement,
      alignment: alignment
      // Size the callout to its content instead of matching the target's
      // width (Popover's default minWidth: anchor-size(width) makes it span a
      // wide target); the content's own maxWidth caps it.
      ,
      width: "fit-content"
      // Push the callout clear of the highlight ring so the ring is never
      // covered (placement-aware; adds to Popover's own anchor gap).
      ,
      xstyle: calloutGapStyles[placement],
      label: typeof heading === 'string' ? heading : 'Tour step',
      hasCloseButton: true,
      closeButtonLabel: "Close tour",
      content: content
    })]
  });
}
TourStep.displayName = 'TourStep';