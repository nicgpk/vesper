// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatUnreadDivider.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports ChatUnreadDivider component and ChatUnreadDividerProps
 * @position Error-colored rule marking where unread messages begin
 *
 * Thin error-colored rule with a trailing label ("New" by default),
 * rendered as an aria separator between read and unread messages in a
 * chat thread.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Chat/index.ts (exports)
 * - /packages/lab/src/Chat/ChatUnreadDivider.doc.mjs
 * - /apps/storybook/stories/ChatAdditions.stories.tsx (examples)
 */
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, spacingVars, typographyVars, typeScaleVars, fontWeightVars } from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps } from '@astryxdesign/core/utils';
import { themeProps } from '@astryxdesign/core/utils';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// =============================================================================
// Styles
// =============================================================================

const styles = {
  root: {
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    kOIVth: "x1txdalj",
    kzqmXN: "xh8yej3",
    k8WAf4: "xu0wf1k",
    $$css: true
  }
};

// =============================================================================
// Component
// =============================================================================

/**
 * Error-colored rule marking the first unread message in a chat thread.
 *
 * Renders as a separator with an accessible label describing where
 * unread messages begin.
 *
 * @example
 * ```
 * <ChatUnreadDivider />
 * <ChatUnreadDivider label="Unread" />
 * ```
 */
export function ChatUnreadDivider({
  label = 'New',
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref
}) {
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    role: "separator",
    "aria-label": `${label} messages below`,
    "data-testid": testId,
    ...mergeProps(themeProps('chat-unread-divider'), stylex.props(styles.root, xstyle), className, styleProp),
    children: [/*#__PURE__*/_jsx("span", {
      ...{
        className: "x1iyjqo2 xjm9jq1 x1pjz0fi"
      }
    }), /*#__PURE__*/_jsx("span", {
      ...{
        className: "x2lah0s x9ynric x141an7d x1lvx875 xjt36v0 x1ltkj2j"
      },
      children: label
    })]
  });
}
ChatUnreadDivider.displayName = 'ChatUnreadDivider';