// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports RichTextEditor and RichTextView components and their types
 * @output Public API surface for @astryxdesign/richtext
 * @position Package entry point (barrel) for @astryxdesign/richtext — the
 *   Lexical-based rich text editor and viewer, promoted out of
 *   @astryxdesign/lab so it can be canaried independently.
 *
 * SYNC: When modified, update this header, /packages/richtext/README.md, and
 *   the editor component doc files.
 */
export { RichTextEditor } from "./RichTextEditor.js";
export { RichTextView } from "./RichTextView.js";
export { sharedEditorTheme } from "./editorTheme.js";
export { markdownToEditorStateJSON, editorStateJSONToMarkdown } from "./markdownSerializers.js";
export { RichTextEditorToolbar, RICHTEXT_ICON_KEYS } from "./RichTextEditorToolbar.js";
export { RichTextEditorAutoLinkPlugin, DEFAULT_LINK_MATCHERS, NEW_TAB_LINK_ATTRIBUTES } from "./RichTextEditorAutoLinkPlugin.js";
export { sanitizeUrl, validateUrl, URL_MATCHER, EMAIL_MATCHER } from "./linkUtils.js";