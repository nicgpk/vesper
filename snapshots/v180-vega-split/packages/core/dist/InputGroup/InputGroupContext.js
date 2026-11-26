// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InputGroupContext.ts
 * @input Layer-scoped React context/use
 * @output Exports InputGroup context and useInputGroup hook
 * @position Shared context; consumed by input components for group-aware styling and ARIA associations
 */
import { use } from 'react';
import { createLayerScopedContext as createContext } from "../Layer/layerScopedContext.js";
export const InputGroupContext = createContext(null);
InputGroupContext.displayName = 'InputGroupContext';

/**
 * Hook for input components to detect when inside an InputGroup.
 * Returns null when used outside a group.
 */
export function useInputGroup() {
  return use(InputGroupContext);
}