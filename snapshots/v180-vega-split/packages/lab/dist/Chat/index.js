// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Chat lab component barrel export
 * @input Imports experimental chat affordances
 * @output Exports lab chat components and related types
 * @position Lab Chat entry point; re-exported by packages/lab/src/index.ts
 */
export { ChatReactionBar } from "./ChatReactionBar.js";
export { ChatEmojiPicker, DEFAULT_CHAT_EMOJIS } from "./ChatEmojiPicker.js";
export { ChatUnreadDivider } from "./ChatUnreadDivider.js";
export { ChatTypingIndicator } from "./ChatTypingIndicator.js";