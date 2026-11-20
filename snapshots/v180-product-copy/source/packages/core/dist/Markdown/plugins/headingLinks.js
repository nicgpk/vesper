// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file headingLinks.ts
 * @input Transformed Markdown headings plus optional namespace and URL base
 * @output First-party heading-links plugin and its deterministic projection
 * @position Public server-safe module built on the canonical Markdown plugin protocol
 */

import { markdownAstText, visitMarkdownNodes } from "../ast.js";
import { sanitizeMarkdownLinkUrl } from "../url.js";
import { createMarkdownPlugin, getMarkdownPluginDefinition, markdownExtensionText, markMarkdownTransformTrusted } from "./protocol.js";
const PLUGIN_NAME = 'heading-links';
const PORTABLE_CONFIG_KIND = '@astryxdesign/core/MarkdownHeadingLinksConfig';
const portableConfigKey = Symbol.for(PORTABLE_CONFIG_KIND);

/** @internal Module-owned projection consumed by Markdown and Outline. */

const identityTransform = markMarkdownTransformTrusted(root => root);
function fail(message) {
  throw new TypeError(`Markdown heading links: ${message}`);
}
function headingSlug(value) {
  return value.normalize('NFKC').trim().toLowerCase().replace(/['"]/gu, '').replace(/[^\p{Letter}\p{Number}]+/gu, '-').replace(/^-+|-+$/gu, '');
}
function uniqueHeadingSlug(baseSlug, counts) {
  const fallbackSlug = baseSlug || 'section';
  let count = counts.get(fallbackSlug) ?? 0;
  let candidate = count === 0 ? fallbackSlug : `${fallbackSlug}-${count}`;
  while (counts.has(candidate)) {
    count++;
    candidate = `${fallbackSlug}-${count}`;
  }
  counts.set(fallbackSlug, count + 1);
  counts.set(candidate, 0);
  return candidate;
}
function createPortableConfig(headingIdPrefix, permalinkBaseUrl) {
  return Object.freeze({
    kind: PORTABLE_CONFIG_KIND,
    apiVersion: 1,
    headingIdPrefix,
    permalinkBaseUrl
  });
}
const PERMALINK_VALIDATION_BASE = 'https://astryx.invalid/';
function isParsablePermalinkBaseUrl(url) {
  try {
    new URL(url, PERMALINK_VALIDATION_BASE);
    return true;
  } catch {
    return false;
  }
}
function readPortableConfig(entry) {
  const definition = getMarkdownPluginDefinition(entry);
  if (definition.name !== PLUGIN_NAME) {
    return undefined;
  }
  const config = definition[portableConfigKey];
  if (config == null || typeof config !== 'object' || Object.getPrototypeOf(config) !== Object.prototype || Reflect.ownKeys(config).length !== 4 || !Object.isFrozen(config) || config.kind !== PORTABLE_CONFIG_KIND || config.apiVersion !== 1 || config.headingIdPrefix !== undefined && typeof config.headingIdPrefix !== 'string' || typeof config.permalinkBaseUrl !== 'string' || config.permalinkBaseUrl.includes('#') || !isParsablePermalinkBaseUrl(config.permalinkBaseUrl) || config.permalinkBaseUrl !== '' && sanitizeMarkdownLinkUrl(config.permalinkBaseUrl) !== config.permalinkBaseUrl) {
    return undefined;
  }
  return config;
}

/**
 * Create the opt-in plugin that gives every rendered h1–h6 a stable identity
 * and an inline sibling copy button for each built-in heading. The entry is safe
 * to share between Markdown and Markdown-derived Outline, including compatible
 * Core package copies.
 */
export function createMarkdownHeadingLinks(options = {}) {
  if (options.headingIdPrefix !== undefined && typeof options.headingIdPrefix !== 'string') {
    fail('headingIdPrefix must be a string');
  }
  if (options.permalinkBaseUrl !== undefined && typeof options.permalinkBaseUrl !== 'string') {
    fail('permalinkBaseUrl must be a string');
  }
  const rawBaseUrl = options.permalinkBaseUrl ?? '';
  const sanitizedBaseUrl = rawBaseUrl === '' ? '' : sanitizeMarkdownLinkUrl(rawBaseUrl);
  if (sanitizedBaseUrl == null || !isParsablePermalinkBaseUrl(sanitizedBaseUrl)) {
    fail('permalinkBaseUrl must be a safe, parseable navigation URL');
  }
  const permalinkBaseUrl = sanitizedBaseUrl.replace(/#.*$/u, '');
  const definition = {
    name: PLUGIN_NAME,
    apiVersion: 1,
    transform: identityTransform
  };
  Object.defineProperty(definition, portableConfigKey, {
    configurable: false,
    enumerable: false,
    value: createPortableConfig(options.headingIdPrefix, permalinkBaseUrl),
    writable: false
  });
  return createMarkdownPlugin(definition);
}
function getHeadingLinksConfig(plugins) {
  if (plugins == null) {
    return undefined;
  }
  for (const entry of plugins.entries) {
    const config = readPortableConfig(entry);
    if (config != null) {
      return config;
    }
  }
  return undefined;
}

/** @internal Project the module's all-depth identity after transforms run. */
export function projectMarkdownHeadingLinks(root, preparedPlugins) {
  const config = getHeadingLinksConfig(preparedPlugins);
  if (config == null) {
    return undefined;
  }
  const ids = new Map();
  const labels = new Map();
  const permalinkUrls = new Map();
  const counts = new Map();
  visitMarkdownNodes(root, 'heading', heading => {
    const label = markdownAstText(heading.children, node => markdownExtensionText(preparedPlugins, node)).trim();
    const slug = uniqueHeadingSlug(headingSlug(label), counts);
    const id = config.headingIdPrefix != null && config.headingIdPrefix !== '' ? `${config.headingIdPrefix}--${slug}` : slug;
    ids.set(heading, id);
    labels.set(heading, label);
    permalinkUrls.set(heading, `${config.permalinkBaseUrl}#${id}`);
  });
  return {
    ids,
    labels,
    permalinkUrls
  };
}