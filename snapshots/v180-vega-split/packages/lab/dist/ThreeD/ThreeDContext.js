// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThreeDContext.ts
 * @output React context for 3D chart components
 */

import { createContext, useContext } from 'react';
const ThreeDCtx = /*#__PURE__*/createContext(null);
export const ThreeDProvider = ThreeDCtx.Provider;

/** Access the 3D chart context. Throws if used outside ThreeDChart. */
export function use3D() {
  const ctx = useContext(ThreeDCtx);
  if (!ctx) {
    throw new Error('3D components must be used inside <ThreeDChart>');
  }
  return ctx;
}