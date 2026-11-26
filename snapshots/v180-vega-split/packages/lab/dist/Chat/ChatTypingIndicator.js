// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatTypingIndicator.tsx
 * @input Uses React, i18n (useTranslator/useLocale), StyleX (keyframes), theme tokens
 * @output Exports ChatTypingIndicator component and ChatTypingIndicatorProps
 * @position Animated "X is typing…" hint above a chat composer
 *
 * Three staggered bouncing dots (stylex.keyframes, reduced-motion safe)
 * with a grammar-aware label: "Ana is typing…", "Ana and Ben are typing…",
 * or "Ana and 2 others are typing…". Announced politely via role="status".
 * Renders dots only when no names are provided.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Chat/index.ts (exports)
 * - /packages/lab/src/Chat/ChatTypingIndicator.doc.mjs
 * - /apps/storybook/stories/ChatAdditions.stories.tsx (examples)
 */
import { useMemo } from 'react';
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, spacingVars, radiusVars, durationVars, typographyVars, typeScaleVars } from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps } from '@astryxdesign/core/utils';
import { themeProps } from '@astryxdesign/core/utils';
import { useLocale, useTranslator } from '@astryxdesign/core/i18n';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// =============================================================================
// Styles
// =============================================================================

const bounceKeyframes = "x17t2jll-B";
const styles = {
  root: {
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    kOIVth: "x1txdalj",
    kAzted: "xisnujt",
    $$css: true
  }
};

/**
 * Builds the status sentence for the people currently typing.
 *
 * Every phrase comes from the translation catalog, and the names themselves are
 * joined by `Intl.ListFormat` for the active locale rather than an English
 * "and". Three or more people collapse to the first name plus a translated
 * overflow phrase, which is then joined the same way — so the conjunction, the
 * separator, and their order all follow the locale instead of this file.
 */
function typingLabel(names, t, listFormat) {
  if (names == null || names.length === 0) {
    return null;
  }
  if (names.length === 1) {
    return t('@astryx.chatTypingIndicator.one', {
      name: names[0]
    });
  }
  const parts = names.length === 2 ? [names[0], names[1]] : [names[0], t('@astryx.chatTypingIndicator.others', {
    count: names.length - 1
  })];
  return t('@astryx.chatTypingIndicator.many', {
    names: listFormat.format(parts)
  });
}

// =============================================================================
// Component
// =============================================================================

/**
 * Animated three-dot typing hint with a name-aware label.
 *
 * The dots bounce with staggered delays (disabled under
 * prefers-reduced-motion) and the label is announced politely to
 * screen readers via role="status".
 *
 * @example
 * ```
 * <ChatTypingIndicator names={['Ana']} />
 * <ChatTypingIndicator names={['Ana', 'Ben', 'Casey']} />
 * ```
 */
export function ChatTypingIndicator({
  names,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref
}) {
  const t = useTranslator();
  const locale = useLocale();
  const listFormat = useMemo(() => new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction'
  }), [locale]);
  const label = typingLabel(names, t, listFormat);
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    role: "status",
    "aria-live": "polite",
    "data-testid": testId,
    ...mergeProps(themeProps('chat-typing-indicator'), stylex.props(styles.root, xstyle), className, styleProp),
    children: [/*#__PURE__*/_jsxs("span", {
      "aria-hidden": "true",
      ...{
        className: "x3nfvp2 x6s0dn4 x1lsbc85"
      },
      children: [/*#__PURE__*/_jsx("span", {
        ...{
          className: "x1ftt334 x1ycjhwn xjspbzw x1q5y3ey x17u5aw1 xxprybm xa4qsjk x4hg4is x1aquc0h"
        }
      }), /*#__PURE__*/_jsx("span", {
        ...{
          className: "x1ftt334 x1ycjhwn xjspbzw x1q5y3ey x17u5aw1 xxprybm xa4qsjk x4hg4is x1aquc0h x1jksiw5"
        }
      }), /*#__PURE__*/_jsx("span", {
        ...{
          className: "x1ftt334 x1ycjhwn xjspbzw x1q5y3ey x17u5aw1 xxprybm xa4qsjk x4hg4is x1aquc0h xtmkasn"
        }
      })]
    }), label != null && /*#__PURE__*/_jsx("span", {
      ...{
        className: "x9ynric x141an7d xv1l7n4"
      },
      children: label
    })]
  });
}
ChatTypingIndicator.displayName = 'ChatTypingIndicator';