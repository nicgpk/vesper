// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file AvatarGroupContext.ts
 * @input Layer-scoped React context
 * @output Exports AvatarGroup context and useAvatarGroup hook
 * @position Shared context; consumed by children for group-aware styling
 */
import { use } from 'react';
import { createLayerScopedContext as createContext } from "../Layer/layerScopedContext.js";
export const AvatarGroupContext = createContext(null);
AvatarGroupContext.displayName = 'AvatarGroupContext';
export function useAvatarGroup() {
  return use(AvatarGroupContext);
}