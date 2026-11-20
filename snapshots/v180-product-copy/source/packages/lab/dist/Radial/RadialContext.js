// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadialContext.ts
 * @output React context for radial chart components
 */

import { createContext, useContext } from 'react';
const RadialCtx = /*#__PURE__*/createContext(null);
export const RadialProvider = RadialCtx.Provider;

/** Access the radial chart context. Throws if used outside RadialChart. */
export function useRadial() {
  const ctx = useContext(RadialCtx);
  if (!ctx) {
    throw new Error('Radial components must be used inside <RadialChart>');
  }
  return ctx;
}