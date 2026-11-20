// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ast.ts
 * @input Parsed Markdown structure and optional Astryx extension nodes
 * @output Canonical immutable MDAST-aligned Markdown node types and text projection
 * @position Public canonical Markdown tree shared by parsing, transforms, rendering, and Outline
 */

const markdownAstLegacyCodeLanguage = Symbol('MarkdownAstLegacyCodeLanguage');
/** @internal Preserves the released parser/renderer language projection. */
export function markMarkdownAstLegacyCodeLanguage(node, language) {
  if (language === node.lang) {
    return node;
  }
  Object.defineProperty(node, markdownAstLegacyCodeLanguage, {
    configurable: false,
    enumerable: true,
    value: language,
    writable: false
  });
  return node;
}

/** @internal Reads the released language projection for a canonical code node. */
export function getMarkdownAstLegacyCodeLanguage(node) {
  const legacyLanguage = node[markdownAstLegacyCodeLanguage];
  return legacyLanguage === undefined ? node.lang : legacyLanguage;
}
export function visitMarkdownNodes(root, type, visitor) {
  const visit = node => {
    if (node.type === type) {
      visitor(node);
    }
    if ('children' in node) {
      for (const child of node.children) {
        visit(child);
      }
    }
  };
  visit(root);
}
export function markdownAstText(nodes, extensionText = node => node.source ?? '') {
  let text = '';
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
      case 'inlineCode':
      case 'inlineMath':
        text += node.value;
        break;
      case 'strong':
      case 'emphasis':
      case 'delete':
      case 'link':
        text += markdownAstText(node.children, extensionText);
        break;
      case 'image':
        text += node.alt;
        break;
      case 'citation':
      case 'break':
        break;
      case 'extension':
        text += extensionText(node);
        break;
      default:
        {
          node;
        }
    }
  }
  return text;
}