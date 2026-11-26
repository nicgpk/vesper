// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file IconDefaultSizeContext.ts
 * @input Uses layer-scoped React context and an optional Icon size prop
 * @output Supplies a component-owned default size to descendant Icon instances
 * @position Internal Icon sizing context; consumed by Icon and icon-slot owners
 */
import { use } from 'react';
import { createLayerScopedContext as createContext } from "../Layer/layerScopedContext.js";
const IconDefaultSizeContext = createContext(null);
IconDefaultSizeContext.displayName = 'IconDefaultSizeContext';
export const IconDefaultSizeProvider = IconDefaultSizeContext.Provider;
export function useIconSize(size) {
  const contextualSize = use(IconDefaultSizeContext);
  return size ?? contextualSize ?? 'md';
}