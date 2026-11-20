// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CheckboxListContext.tsx
 * @input Uses the private layer-scoped context factory
 * @output Exports CheckboxListContext for parent-child communication
 * @position Internal context; consumed by CheckboxList.tsx and CheckboxListItem.tsx
 */
import { createLayerScopedContext } from "../Layer/layerScopedContext.js";
export const CheckboxListContext = createLayerScopedContext(null);
CheckboxListContext.displayName = 'CheckboxListContext';