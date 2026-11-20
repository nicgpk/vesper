// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file context.tsx
 * @input Resolved Schedule events, range, timezone, locale, and active date
 * @output Schedule context object and hook used by view components
 * @position Internal context bridge between generic Schedule and concrete views
 */
import { createContext, useContext } from 'react';
export const ScheduleContext = /*#__PURE__*/createContext(null);
export function useScheduleContext() {
  const context = useContext(ScheduleContext);
  if (context == null) {
    throw new Error('Schedule views must be rendered inside Schedule.');
  }
  return context;
}