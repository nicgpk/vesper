// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MetadataListContext.tsx
 * @input Layer-scoped React context
 * @output Exports MetadataListContext for sharing config between MetadataList and MetadataListItem
 * @position Internal context; consumed by MetadataList.tsx and MetadataListItem.tsx
 */
import { createLayerScopedContext as createContext } from "../Layer/layerScopedContext.js";
export const MetadataListContext = createContext(null);
MetadataListContext.displayName = 'MetadataListContext';