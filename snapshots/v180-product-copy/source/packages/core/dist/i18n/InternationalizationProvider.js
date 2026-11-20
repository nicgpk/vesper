// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InternationalizationProvider.tsx
 * @input React, InternationalizationContext, i18n types
 * @output Exports InternationalizationProvider component and props type
 * @position Provider component for astryx i18n locale + messages
 *
 * Wraps a subtree with a locale and (optional) additional message catalogs +
 * overrides. Astryx components inside the subtree resolve their strings via
 * this context. If a consumer never renders a provider, astryx components
 * still work — they use the shipped en catalog directly.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/i18n/InternationalizationContext.ts
 * - /packages/core/src/i18n/index.ts
 * - /packages/core/src/i18n/InternationalizationProvider.doc.mjs
 */
import { useMemo } from 'react';
import { InternationalizationContext } from "./InternationalizationContext.js";
import { getLocaleDirection } from "./getLocaleDirection.js";
import { getResolve } from "./resolve.js";
import { jsx as _jsx } from "react/jsx-runtime";
function normalizeMessages(messages) {
  const hasRuntimeCatalog = Object.values(messages).some(catalog => Object.values(catalog).some(entry => typeof entry === 'string'));
  if (!hasRuntimeCatalog) {
    return messages;
  }
  return Object.fromEntries(Object.entries(messages).map(([locale, catalog]) => [locale, Object.fromEntries(Object.entries(catalog).map(([key, entry]) => [key, typeof entry === 'string' ? {
    defaultMessage: entry
  } : entry]))]));
}
/**
 * Provides locale + additional messages + overrides to all astryx
 * components in the subtree.
 */
export function InternationalizationProvider({
  locale,
  messages,
  overrides,
  dir,
  children
}) {
  const direction = dir ?? getLocaleDirection(locale);
  const value = useMemo(() => {
    const providedMessages = messages ?? {};
    return {
      locale,
      direction,
      messages: normalizeMessages(providedMessages),
      overrides,
      translate: getResolve(locale, providedMessages, overrides)
    };
  }, [locale, direction, messages, overrides]);
  return /*#__PURE__*/_jsx(InternationalizationContext, {
    value: value,
    children: children
  });
}
InternationalizationProvider.displayName = 'InternationalizationProvider';