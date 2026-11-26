// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListContext.tsx
 * @input Layer-scoped React context
 * @output Exports ListContext for sharing density, dividers, marker style,
 *   and optional inline edge compensation between List and ListItem
 * @position Internal context; consumed by List.tsx and ListItem.tsx
 */
import { createLayerScopedContext as createContext } from "../Layer/layerScopedContext.js";
export const ListContext = createContext(null);
ListContext.displayName = 'ListContext';