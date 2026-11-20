// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file url.ts
 * @input Untrusted Markdown link or image destination
 * @output Parser-compatible acceptance and normalized render-safe destinations
 * @position Shared URL policy for parser, transforms, and renderer
 */

import { isSafeUrl, sanitizeUrl } from "../utils/safeUrl.js";
const RENDER_DANGEROUS_URL_PATTERN = /^(?:javascript:|data:|vbscript:)/i;
function normalizeMarkdownUrl(url) {
  // Browsers ignore embedded controls in schemes, so normalize before checking.
  // eslint-disable-next-line no-control-regex -- control chars are the bypass
  return url.replace(/[\x00-\x1f\x7f]/g, '').trim();
}

/** Preserve the released parser policy for no-plugin output compatibility. */
export function isSafeMarkdownParserUrl(url) {
  return isSafeUrl(url);
}

/** Navigation and image rendering deliberately have different policies. */
export function sanitizeMarkdownLinkUrl(url) {
  const normalized = sanitizeUrl(url);
  return normalized === '' ? null : normalized;
}
export function sanitizeMarkdownUrl(url) {
  const normalized = normalizeMarkdownUrl(url);
  return normalized !== '' && !RENDER_DANGEROUS_URL_PATTERN.test(normalized) ? normalized : null;
}