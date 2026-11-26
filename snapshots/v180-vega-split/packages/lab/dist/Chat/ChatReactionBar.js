// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatReactionBar.tsx
 * @input Uses React, StyleX, theme tokens, Tooltip, ChatEmojiPicker
 * @output Exports ChatReactionBar component, ChatReactionBarProps, ChatReaction
 * @position Row of emoji reaction pills under a chat message
 *
 * Renders reaction pills (emoji + count) with a pressed state for the
 * current user's own reactions, optional tooltips listing reactors, and an
 * optional trailing add-reaction button that opens a ChatEmojiPicker
 * popover. Data flows in via `reactions`; toggles flow out via `onToggle`
 * and new reactions via `onAdd`.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Chat/index.ts (exports)
 * - /packages/lab/src/Chat/ChatReactionBar.doc.mjs
 * - /apps/storybook/stories/ChatAdditions.stories.tsx (examples)
 */
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, spacingVars, radiusVars, durationVars, easeVars, typographyVars, typeScaleVars, fontWeightVars } from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps } from '@astryxdesign/core/utils';
import { themeProps } from '@astryxdesign/core/utils';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { ChatEmojiPicker } from "./ChatEmojiPicker.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// =============================================================================
// Styles
// =============================================================================

const styles = {
  root: {
    k1xSpc: "x78zum5",
    kwnvtZ: "x1a02dak",
    kGNEyG: "x6s0dn4",
    kOIVth: "xzye2dw",
    $$css: true
  }
};
function pillLabel(reaction) {
  if (reaction.label != null) {
    return reaction.label;
  }
  const noun = reaction.count === 1 ? 'reaction' : 'reactions';
  return `${reaction.count} ${noun} with ${reaction.emoji}`;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Row of emoji reaction pills under a chat message.
 *
 * Each pill shows an emoji and count; the current user's own reactions get
 * an accent tint and `aria-pressed`. Provide `onAdd` to render a trailing
 * add-reaction button that opens a ChatEmojiPicker popover.
 *
 * @example
 * ```
 * <ChatReactionBar
 *   reactions={[
 *     {emoji: '🎉', count: 4, isSelected: true, label: 'You and Dana reacted with 🎉'},
 *     {emoji: '👀', count: 2},
 *   ]}
 *   onToggle={(emoji) => toggleReaction(emoji)}
 *   onAdd={(emoji) => addReaction(emoji)}
 * />
 * ```
 */
export function ChatReactionBar({
  reactions,
  onToggle,
  onAdd,
  emojis,
  addLabel = 'Add reaction',
  label = 'Reactions',
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref
}) {
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    role: "group",
    "aria-label": label,
    "data-testid": testId,
    ...mergeProps(themeProps('chat-reaction-bar'), stylex.props(styles.root, xstyle), className, styleProp),
    children: [reactions.map(reaction => {
      const isSelected = reaction.isSelected === true;
      const pill = /*#__PURE__*/_jsxs("button", {
        type: "button",
        "aria-pressed": isSelected,
        "aria-label": pillLabel(reaction),
        onClick: () => onToggle?.(reaction.emoji),
        ...{
          0: {
            className: "x3nfvp2 x6s0dn4 xzye2dw xxk0z11 xf314gf xjspbzw xmkeg23 x1y0btm7 x9r1u3d xs8to0k x1xwh4np xwmxj5m x1ypdohk x16khyan x9ynric x9f619 xq90yva xuedmi6 x12w9bfk xlr8y92"
          },
          1: {
            className: "x3nfvp2 x6s0dn4 xzye2dw xxk0z11 xf314gf xjspbzw xmkeg23 x1y0btm7 x1ypdohk x16khyan x9ynric x9f619 xq90yva xuedmi6 x12w9bfk xlr8y92 xgcxg3y xad5do xz7zccy xmhmdd9"
          }
        }[!!isSelected << 0],
        children: [/*#__PURE__*/_jsx("span", {
          "aria-hidden": "true",
          ...{
            className: "xjm74w1 xw6l6zx"
          },
          children: reaction.emoji
        }), /*#__PURE__*/_jsx("span", {
          ...{
            0: {
              className: "x141an7d x1e4wzip xv1l7n4 xss6m8b x1ltkj2j"
            },
            1: {
              className: "x141an7d xss6m8b x1ltkj2j xjse4m1 x2mo6ok"
            }
          }[!!isSelected << 0],
          children: reaction.count
        })]
      }, reaction.emoji);
      return reaction.label != null ? /*#__PURE__*/_jsx(Tooltip, {
        content: reaction.label,
        children: pill
      }, reaction.emoji) : pill;
    }), onAdd != null && /*#__PURE__*/_jsx(ChatEmojiPicker, {
      emojis: emojis,
      onSelect: onAdd,
      label: addLabel,
      children: /*#__PURE__*/_jsx(Tooltip, {
        content: addLabel,
        children: /*#__PURE__*/_jsx("button", {
          type: "button",
          "aria-label": addLabel,
          ...{
            className: "x3nfvp2 x6s0dn4 xl56j7k x1td3qas xxk0z11 xjspbzw xmkeg23 x1y0btm7 x9r1u3d xs8to0k x1xwh4np xwmxj5m xv9yike x1ypdohk x16khyan x9f619 x1jvydc1 x1ltkj2j x1717udv"
          },
          children: "+"
        })
      })
    })]
  });
}
ChatReactionBar.displayName = 'ChatReactionBar';