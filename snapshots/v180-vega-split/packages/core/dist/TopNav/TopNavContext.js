// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavContext.ts
 * @input Layer-scoped React context
 * @output TopNavSlotContext and useTopNavSlot
 * @position Navigation slot presentation defaults
 */
import { use } from 'react';
import { createLayerScopedContext as createContext } from "../Layer/layerScopedContext.js";
export const TopNavSlotContext = createContext('start');
TopNavSlotContext.displayName = 'TopNavSlotContext';
export function useTopNavSlot() {
  return use(TopNavSlotContext);
}