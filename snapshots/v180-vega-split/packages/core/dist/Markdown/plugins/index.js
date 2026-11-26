// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @output Public Markdown plugin protocol, factory, and types
 * @position Subpath entry point: `@astryxdesign/core/Markdown/plugins`
 */

export { createMarkdownPlugin, isMarkdownExtensionNode } from "./protocol.js";
export { createMarkdownTextTransform } from "./textTransform.js";
export { createMarkdownFenceTransform } from "./semanticFence.js";
export { createMarkdownSourceDecoration, getMarkdownSourceDecorations } from "./sourceDecoration.js";
export { createMarkdownFrontmatter } from "./frontmatter.js";
export { markdownSoftBreaksPlugin } from "./softBreaks.js";
export { createMarkdownHeadingLinks } from "./headingLinks.js";