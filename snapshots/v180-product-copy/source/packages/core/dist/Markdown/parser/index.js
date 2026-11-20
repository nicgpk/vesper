// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Markdown source and public parser options
 * @output Server-safe legacy and canonical Markdown parser entry points and types
 * @position Public subpath entry point: `@astryxdesign/core/Markdown/parser`
 */

export { createIncrementalState, parseInline, parseInlineAst, parseMarkdown, parseMarkdownAst, parseMarkdownIncremental } from "../parser.js";