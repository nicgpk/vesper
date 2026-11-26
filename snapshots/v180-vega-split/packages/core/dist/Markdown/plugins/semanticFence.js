// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file semanticFence.ts
 * @input Declared fenced-code languages and typed extension-node factories
 * @output Immutable Markdown transform that annotates eligible canonical code nodes
 * @position Optional helper layer compiled onto the core transform protocol
 */

import { getMarkdownHelperOwnership, markMarkdownTransformClaim, markMarkdownTransformTrusted } from "./protocol.js";
const markdownFenceProposal = Symbol('MarkdownFenceProposal');
/** @internal Returns the first transform-owned proposal attached to a code node. */
export function getMarkdownFenceProposal(node) {
  return node[markdownFenceProposal];
}
function cloneNestedPluginData(value, parent, ancestors) {
  if (value == null || typeof value !== 'object') {
    return clonePluginData(value, ancestors);
  }
  const nestedAncestors = new Set(ancestors);
  nestedAncestors.add(parent);
  return clonePluginData(value, nestedAncestors);
}
function clonePluginData(value, ancestors) {
  if (value == null || typeof value === 'boolean' || typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError('invalid plugin data');
    }
    return value;
  }
  if (typeof value !== 'object' || ancestors?.has(value) === true || !Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype) {
    throw new TypeError('invalid plugin data');
  }
  let clone;
  if (Array.isArray(value)) {
    const items = new Array(value.length);
    for (let index = 0; index < value.length; index++) {
      if (index in value) {
        items[index] = cloneNestedPluginData(value[index], value, ancestors);
      }
    }
    clone = Object.freeze(items);
  } else {
    const record = {};
    for (const key in value) {
      const nested = cloneNestedPluginData(value[key], value, ancestors);
      if (key === '__proto__') {
        Object.defineProperty(record, key, {
          configurable: true,
          enumerable: true,
          value: nested,
          writable: true
        });
      } else {
        record[key] = nested;
      }
    }
    clone = Object.freeze(record);
  }
  return clone;
}
function createProposal(node, pluginName, hasRenderer) {
  if (node == null || typeof node !== 'object' || node.type !== 'extension' || node.plugin !== pluginName || typeof node.name !== 'string' || node.name.trim() === '' ||
  // Every extension node must have a renderer and a text projection
  // (FR14). Checking it here is what lets Core run this helper on its
  // trusted path: the node is fully validated before it is inserted.
  !hasRenderer(node.name) || node.display !== 'block' || 'source' in node || 'position' in node) {
    throw new TypeError('Markdown fence createNode must return an owned block extension node with finite data and a registered renderer');
  }
  let data;
  try {
    data = clonePluginData(node.data);
  } catch {
    throw new TypeError('Markdown fence createNode must return an owned block extension node with finite data and a registered renderer');
  }
  return Object.freeze({
    node: Object.freeze({
      type: 'extension',
      plugin: node.plugin,
      name: node.name,
      display: 'block',
      data
    })
  });
}
function isPromiseLike(value) {
  return value != null && typeof value === 'object' && 'then' in value && typeof value.then === 'function';
}
function consumeInvalidAsyncNode(value, report) {
  void Promise.resolve(value).then(() => report('Markdown fence createNode returned a Promise'), () => report('Markdown fence createNode Promise rejected'));
}
function annotateCode(node, languages, pluginName, hasRenderer, createNode, report) {
  if (node.lang == null || !languages.has(node.lang) || getMarkdownFenceProposal(node) != null) {
    return node;
  }
  const proposalNode = createNode(Object.freeze({
    code: node.value,
    language: node.lang,
    ...(node.meta == null ? {} : {
      meta: node.meta
    })
  }));
  if (isPromiseLike(proposalNode)) {
    consumeInvalidAsyncNode(proposalNode, report);
    throw new TypeError('Markdown fence createNode must be synchronous');
  }
  if (proposalNode == null) {
    return node;
  }
  const annotated = {
    ...node
  };
  Object.defineProperty(annotated, markdownFenceProposal, {
    configurable: false,
    enumerable: true,
    value: createProposal(proposalNode, pluginName, hasRenderer),
    writable: false
  });
  return annotated;
}
function transformBlocks(blocks, languages, pluginName, hasRenderer, createNode, report) {
  let next;
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    let replacement;
    switch (block.type) {
      case 'code':
        replacement = annotateCode(block, languages, pluginName, hasRenderer, createNode, report);
        break;
      case 'blockquote':
        {
          const children = transformBlocks(block.children, languages, pluginName, hasRenderer, createNode, report);
          replacement = children === block.children ? block : {
            ...block,
            children
          };
          break;
        }
      case 'list':
        {
          let items;
          for (let itemIndex = 0; itemIndex < block.children.length; itemIndex++) {
            const item = block.children[itemIndex];
            const itemChildren = transformBlocks(item.children, languages, pluginName, hasRenderer, createNode, report);
            if (itemChildren === item.children) {
              items?.push(item);
              continue;
            }
            items ??= block.children.slice(0, itemIndex);
            items.push({
              ...item,
              children: itemChildren
            });
          }
          replacement = items == null ? block : {
            ...block,
            children: items
          };
          break;
        }
      case 'heading':
      case 'paragraph':
      case 'math':
      case 'table':
      case 'thematicBreak':
      case 'image':
      case 'extension':
        replacement = block;
        break;
    }
    if (next === undefined && replacement !== block) {
      next = blocks.slice(0, index);
    }
    next?.push(replacement);
  }
  return next ?? blocks;
}
export function createMarkdownFenceTransform(options) {
  if (!Array.isArray(options.languages) || options.languages.length === 0 || options.languages.some(language => typeof language !== 'string' || language.trim() === '')) {
    throw new TypeError('Markdown fence languages must be non-empty strings');
  }
  if (new Set(options.languages).size !== options.languages.length) {
    throw new TypeError('Markdown fence languages must be unique');
  }
  if (typeof options.createNode !== 'function') {
    throw new TypeError('Markdown fence createNode must be a function');
  }
  const declaredLanguages = Object.freeze([...options.languages]);
  const languages = new Set(declaredLanguages);
  const sourceNeedles = Object.freeze(declaredLanguages.flatMap(language => [`\`\`\`${language}`, `~~~${language}`]));
  const createNode = options.createNode;
  const transform = (root, context) => {
    const ownership = getMarkdownHelperOwnership(context);
    if (ownership == null) {
      throw new TypeError('Markdown fence transforms must run through createMarkdownPlugin');
    }
    const children = transformBlocks(root.children, languages, ownership.pluginName, ownership.hasRenderer, createNode, context.report);
    return children === root.children ? root : {
      ...root,
      children
    };
  };

  // Every node this helper inserts is validated above against the same
  // rules Core applies to plugin-authored output — owned plugin name,
  // registered renderer, representable frozen data, no authored provenance
  // — and nothing else in the tree is touched. Core may therefore skip
  // revalidating the whole document after it runs.
  return markMarkdownTransformTrusted(markMarkdownTransformClaim(transform, source => sourceNeedles.some(needle => source.includes(needle))));
}