// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useLinkComponent.ts
 * @input Per-component override, LinkProvider context, and navigation props
 * @output Stable link component with destination checks and custom-router `to` injection
 * @position Shared native and custom link boundary; rejected destinations render
 *   as destination-less anchors without invoking a router.
 *
 * SYNC: Link.doc.mjs and LinkProvider.doc.mjs describe this boundary.
 */
import { use, useMemo, createElement } from 'react';
import { LinkContext } from "./LinkContext.js";
import { isSafeDestination } from "../utils/safeUrl.js";
function createSafeLink(Component) {
  function SafeLink({
    href,
    to,
    ref,
    ...rest
  }) {
    // An undefined destination can crash a router or resolve to the current
    // route. Reject the whole handoff, not just one prop or a fallback value.
    if (!isSafeDestination(href) || !isSafeDestination(to)) {
      return /*#__PURE__*/createElement('a', {
        ref,
        ...rest
      });
    }
    if (Component === 'a') {
      return /*#__PURE__*/createElement('a', {
        ref,
        ...rest,
        href
      });
    }
    return /*#__PURE__*/createElement(Component, {
      ref,
      ...rest,
      href,
      to: to ?? href
    });
  }
  SafeLink.displayName = `SafeLink(${typeof Component === 'string' ? Component : Component.displayName || Component.name || 'Component'})`;
  return SafeLink;
}

/**
 * Resolve `as`, then LinkProvider, then a native anchor. Both destination props
 * are checked before rendering; accepted structured values retain identity.
 * Custom components receive `to={href}` unless an explicit `to` is supplied.
 *
 * @example
 * ```
 * const LinkComponent = useLinkComponent(as);
 * return <LinkComponent href="/docs">Documentation</LinkComponent>;
 * ```
 */
export function useLinkComponent(as) {
  const ctx = use(LinkContext);
  const resolved = as ?? ctx?.component ?? 'a';
  return useMemo(() => createSafeLink(resolved), [resolved]);
}