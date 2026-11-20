// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file layerScopedContext.tsx
 * @input Surface-scoped React contexts and layer content
 * @output Private context creation and whole-value content boundary
 * @position AST-038 surface membership; unrelated contexts retain their owners
 */
import { createContext, useState } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
const resets = [];

/** Create a surface-scoped context whose whole default applies in a new layer. */
export function createLayerScopedContext(defaultValue) {
  const Context = /*#__PURE__*/createContext(defaultValue);
  Context.displayName = 'LayerScopedContext';
  resets.push(children => /*#__PURE__*/_jsx(Context, {
    value: defaultValue,
    children: children
  }));
  return Context;
}
export function LayerContentBoundary({
  children
}) {
  // Keep the provider chain stable for this mount: lazy imports must not
  // remount existing content and discard its state or focus.
  const [resetChain] = useState(() => resets.slice());
  return resetChain.reduceRight((content, reset) => reset(content), children);
}