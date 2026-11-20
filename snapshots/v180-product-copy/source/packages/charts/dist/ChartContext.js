// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import { createContext, useContext } from 'react';
const Ctx = /*#__PURE__*/createContext(null);
Ctx.displayName = 'ChartContext';
export const ChartProvider = Ctx.Provider;
export function useChart() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('Must be used inside <Chart>');
  }
  return ctx;
}