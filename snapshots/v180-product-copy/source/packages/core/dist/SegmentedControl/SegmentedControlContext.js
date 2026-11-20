// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SegmentedControlContext.ts
 * @input Layer-scoped React context, use
 * @output Exports SegmentedControlContext, useSegmentedControlContext
 * @position Context provider; consumed by SegmentedControlItem.tsx
 *
 * SYNC: When modified, update /packages/core/src/SegmentedControl/SegmentedControl.doc.mjs
 */
import { use } from 'react';
import { createLayerScopedContext as createContext } from "../Layer/layerScopedContext.js";
export const SegmentedControlContext = createContext(null);
SegmentedControlContext.displayName = 'SegmentedControlContext';
export function useSegmentedControlContext() {
  const ctx = use(SegmentedControlContext);
  if (ctx == null) {
    throw new Error('useSegmentedControlContext must be used within SegmentedControl. ' + 'Wrap your SegmentedControlItem in <SegmentedControl>.');
  }
  return ctx;
}