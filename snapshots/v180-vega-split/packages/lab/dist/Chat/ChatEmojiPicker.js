// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatEmojiPicker.tsx
 * @input Uses React, StyleX, theme tokens, Popover, TextInput, useGridFocus
 * @output Exports ChatEmojiPicker component, ChatEmojiPickerProps,
 *   ChatEmojiOption, and DEFAULT_CHAT_EMOJIS
 * @position Popover emoji grid for chat reactions; wraps a trigger button
 *
 * Renders a Popover around a trigger element: a shortname filter input over
 * a fixed 8-column emoji grid. Arrow keys move focus through the grid
 * (left/right by one, up/down by a row) via useGridFocus; picking an emoji
 * calls onSelect and closes the popover, which restores focus to the
 * trigger. Ships with a small default emoji set; pass `emojis` to override.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Chat/index.ts (exports)
 * - /packages/lab/src/Chat/ChatEmojiPicker.doc.mjs
 * - /apps/storybook/stories/ChatAdditions.stories.tsx (examples)
 */
import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, spacingVars, radiusVars, durationVars, easeVars, typographyVars, typeScaleVars } from '@astryxdesign/core/theme/tokens.stylex';
import { focusOutlineStyles, mergeProps } from '@astryxdesign/core/utils';
import { themeProps } from '@astryxdesign/core/utils';
import { Popover } from '@astryxdesign/core/Popover';
import { TextInput } from '@astryxdesign/core/TextInput';
import { useGridFocus } from '@astryxdesign/core/hooks';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Small default emoji set (two grid rows) covering the common
 * reaction vocabulary. Override via the `emojis` prop.
 */
export const DEFAULT_CHAT_EMOJIS = [{
  emoji: '👍',
  name: 'thumbs up'
}, {
  emoji: '❤️',
  name: 'heart'
}, {
  emoji: '😂',
  name: 'joy'
}, {
  emoji: '🎉',
  name: 'tada'
}, {
  emoji: '😮',
  name: 'wow'
}, {
  emoji: '😢',
  name: 'cry'
}, {
  emoji: '🔥',
  name: 'fire'
}, {
  emoji: '👀',
  name: 'eyes'
}, {
  emoji: '✅',
  name: 'check'
}, {
  emoji: '🙏',
  name: 'pray'
}, {
  emoji: '💯',
  name: 'hundred'
}, {
  emoji: '🚀',
  name: 'rocket'
}, {
  emoji: '😍',
  name: 'heart eyes'
}, {
  emoji: '🤔',
  name: 'thinking'
}, {
  emoji: '👋',
  name: 'wave'
}, {
  emoji: '⭐',
  name: 'star'
}];
const GRID_COLUMNS = 8;
// =============================================================================
// Styles
// =============================================================================

const styles = {
  panel: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kOIVth: "x1txdalj",
    kzqmXN: "x1dz1jew",
    kB7OPa: "x9f619",
    $$css: true
  },
  cell: {
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kzqmXN: "x1td3qas",
    kZKoxP: "x10w6t97",
    kaIpWk: "xx3sua9",
    ksu8eU: "xng3xce",
    kmVPX3: "x1717udv",
    kWkggS: "xjbqb8w x1iutq3a xoevpu5",
    kkrTdU: "x1ypdohk x16khyan",
    kGuDYH: "xosj86m",
    kLWn49: "xw6l6zx",
    kInvED: "x1wfwxd8 x1bqaal",
    k1ekBW: "x15406qy",
    kIyJzY: "xuedmi6 x12w9bfk",
    kAMwcw: "xlr8y92",
    $$css: true
  }
};

// =============================================================================
// Component
// =============================================================================

/**
 * Popover emoji grid with shortname filtering and arrow-key navigation.
 *
 * Wraps its trigger button in a Popover. Typing in the filter input narrows
 * the grid by shortname; arrow keys move focus between emoji; picking one
 * calls `onSelect` and closes the popover (focus returns to the trigger).
 *
 * @example
 * ```
 * <ChatEmojiPicker onSelect={(emoji) => addReaction(emoji)}>
 *   <button type="button" aria-label="Add reaction">🙂</button>
 * </ChatEmojiPicker>
 * ```
 */
export function ChatEmojiPicker({
  onSelect,
  emojis = DEFAULT_CHAT_EMOJIS,
  label = 'Pick an emoji',
  searchLabel = 'Search emoji',
  children,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const {
    gridRef,
    handleKeyDown
  } = useGridFocus({
    columns: GRID_COLUMNS
  });
  const trimmed = query.trim().toLowerCase();
  const visible = trimmed === '' ? emojis : emojis.filter(option => option.name.toLowerCase().includes(trimmed) || option.emoji === trimmed);
  const handleOpenChange = open => {
    setIsOpen(open);
    if (!open) {
      setQuery('');
    }
  };
  const handleSelect = emoji => {
    onSelect(emoji);
    handleOpenChange(false);
  };
  return /*#__PURE__*/_jsx(Popover, {
    isOpen: isOpen,
    onOpenChange: handleOpenChange,
    label: label,
    placement: "below",
    alignment: "start",
    "data-testid": testId,
    content: /*#__PURE__*/_jsxs("div", {
      ref: ref,
      ...mergeProps(themeProps('chat-emoji-picker'), stylex.props(styles.panel, xstyle), className, styleProp),
      children: [/*#__PURE__*/_jsx(TextInput, {
        label: searchLabel,
        isLabelHidden: true,
        size: "sm",
        placeholder: searchLabel,
        value: query,
        onChange: setQuery,
        hasClear: true
      }), visible.length === 0 ? /*#__PURE__*/_jsxs("div", {
        ...{
          className: "xce4md1 x7a5moj x9ynric x141an7d xv1l7n4"
        },
        children: ["No emoji match \u201C", query.trim(), "\u201D."]
      }) : /*#__PURE__*/_jsx("div", {
        ref: gridRef,
        role: "group",
        "aria-label": "Emoji",
        onKeyDown: handleKeyDown,
        ...{
          className: "xrvj5dj x12m0uhf x1lsbc85"
        },
        children: visible.map(option => /*#__PURE__*/_jsx("button", {
          type: "button",
          "data-emoji": option.emoji,
          "aria-label": `React with ${option.name}`,
          onClick: () => handleSelect(option.emoji),
          ...stylex.props(focusOutlineStyles.focusVisible, styles.cell),
          children: /*#__PURE__*/_jsx("span", {
            "aria-hidden": "true",
            children: option.emoji
          })
        }, option.emoji))
      })]
    }),
    children: children
  });
}
ChatEmojiPicker.displayName = 'ChatEmojiPicker';