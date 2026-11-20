// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports Markdown component, canonical and compatibility parser functions, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */
export { visitMarkdownNodes } from "./ast.js";
export { Markdown } from "./Markdown.js";
export { parseMarkdown, parseMarkdownAst, parseMarkdownIncremental, createIncrementalState, parseInline, parseInlineAst } from "./parser.js";