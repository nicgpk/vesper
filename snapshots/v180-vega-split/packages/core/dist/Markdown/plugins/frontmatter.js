// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file frontmatter.ts
 * @input Document-start frontmatter delimiters and a typed metadata decoder
 * @output A Markdown plugin plus a typed metadata reader for later transforms
 * @position Optional first-party document metadata helper
 */

import { createMarkdownPlugin, freezeMarkdownPluginData, isMarkdownPluginData, markMarkdownTransformTrusted } from "./protocol.js";
const ENVELOPE_KEY = 'astryx:frontmatter';
const ENVELOPE_BRAND = 'astryx.markdown.frontmatter';
const ENVELOPE_VERSION = 1;
function asDataRecord(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function parseEnvelope(value) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return;
  }
  const candidate = value;
  return candidate.brand === ENVELOPE_BRAND && candidate.version === ENVELOPE_VERSION && candidate.values != null && typeof candidate.values === 'object' && !Array.isArray(candidate.values) ? candidate : undefined;
}
function readFrontmatter(source) {
  const openingLength = source.startsWith('---\r\n') ? 5 : source.startsWith('---\n') ? 4 : 0;
  if (openingLength === 0) {
    return {
      status: 'none'
    };
  }
  const body = source.slice(openingLength);
  const close = /(?:^|\r?\n)---(?=\r?\n|$)/.exec(body);
  if (close == null) {
    return {
      status: 'defer'
    };
  }
  const fields = Object.create(null);
  for (const line of body.slice(0, close.index).split(/\r?\n/)) {
    if (line.trim() === '') {
      continue;
    }
    const separator = line.indexOf(':');
    const key = line.slice(0, separator).trim();
    if (separator <= 0 || key === '' || Object.hasOwn(fields, key)) {
      return {
        status: 'none'
      };
    }
    fields[key] = line.slice(separator + 1).trim();
  }
  let end = openingLength + close.index + close[0].length;
  if (source.startsWith('\r\n', end)) {
    end += 2;
  } else if (source[end] === '\n') {
    end += 1;
  }
  return {
    status: 'match',
    end,
    fields: Object.freeze(fields)
  };
}
export function createMarkdownFrontmatter(options) {
  if (options.name.trim() === '') {
    throw new TypeError('Markdown frontmatter name must be non-empty');
  }
  const name = options.name;
  const parse = (source, isFinal = true) => {
    const parsed = readFrontmatter(source);
    if (parsed.status === 'defer') {
      return isFinal ? {
        status: 'none'
      } : parsed;
    }
    if (parsed.status === 'none') {
      return parsed;
    }
    const metadata = options.parse(parsed.fields);
    if (!isMarkdownPluginData(metadata)) {
      throw new TypeError('Markdown frontmatter metadata must be finite JSON-like data');
    }
    return {
      status: 'match',
      contentStart: parsed.end,
      metadata: freezeMarkdownPluginData(metadata)
    };
  };
  const transform = (document, context) => {
    const parsed = parse(context.source, context.isFinal);
    if (parsed.status === 'none') {
      return document;
    }
    if (parsed.status === 'defer') {
      return {
        ...document,
        children: []
      };
    }
    const documentData = asDataRecord(document.data);
    const prior = parseEnvelope(documentData[ENVELOPE_KEY]);
    const envelope = Object.freeze({
      brand: ENVELOPE_BRAND,
      version: ENVELOPE_VERSION,
      values: Object.freeze({
        ...prior?.values,
        [name]: parsed.metadata
      })
    });
    return {
      ...document,
      data: Object.freeze({
        ...documentData,
        [ENVELOPE_KEY]: envelope
      }),
      children: document.children.filter(node => (node.position?.end.offset ?? Infinity) > parsed.contentStart)
    };
  };
  const plugin = createMarkdownPlugin({
    name,
    apiVersion: 1,
    transform: markMarkdownTransformTrusted(transform)
  });
  return Object.freeze({
    plugin,
    parse,
    getMetadata(document) {
      const data = asDataRecord(document.data);
      return parseEnvelope(data[ENVELOPE_KEY])?.values[name];
    }
  });
}