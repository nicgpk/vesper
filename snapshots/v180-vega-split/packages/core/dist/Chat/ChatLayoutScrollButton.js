// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatLayoutScrollButton.tsx
 * @input Uses React, StyleX, Button, Icon, theme tokens
 * @output Exports ChatLayoutScrollButton component
 * @position Composable scroll-to-bottom button for use inside ChatLayout
 *
 * Renders inside the layout's dock container. Fades in when visible,
 * expands to show a label when provided (e.g. "New messages").
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/cli/assets/templates/blocks/components/ChatLayoutScrollButton/ (block examples)
 */
import React from 'react';
import * as stylex from '@stylexjs/stylex';
import "../theme/tokens.stylex.js";
import { colorVars, spacingVars, radiusVars, shadowVars, sizeVars, durationVars, easeVars } from "../theme/tokens.stylex.js";
import { Icon } from "../Icon/index.js";
import { Button } from "../Button/index.js";
import { mergeProps } from "../utils/index.js";
import { themeProps } from "../utils/themeProps.js";
import { useTranslator } from "../i18n/index.js";

// =============================================================================
// Types
// =============================================================================
import { jsx as _jsx } from "react/jsx-runtime";
// =============================================================================
// Styles
// =============================================================================

const styles = {
  wrapper: {
    k1xSpc: "x78zum5",
    kjj79g: "xl56j7k",
    kGO01o: "xvmdzux",
    $$css: true
  },
  button: {
    "--radius-element": "xnpej1e",
    khDVqt: "xuxw1ft",
    kg3NbH: "xf314gf",
    $$css: true
  },
  buttonWithLabel: {
    kwRFfy: "x1t818jl",
    $$css: true
  }
};

// =============================================================================
// Component
// =============================================================================

/**
 * Floating scroll-to-bottom button for use inside ChatLayout.
 *
 * @example
 * ```
 * <ChatLayoutScrollButton isVisible={!isAtBottom} onClick={scrollToBottom} />
 * ```
 */
export function ChatLayoutScrollButton({
  ref,
  isVisible,
  label,
  onClick,
  xstyle,
  className,
  style,
  ...rest
}) {
  const t = useTranslator();
  return (
    /*#__PURE__*/
    // Two elements, two responsibilities. The outer one centres the pill and
    // holds the gap above the composer — spacing outside the pill's border
    // box, which the pill cannot own itself. The inner one is the pill: it is
    // what a reader sees, so it carries the painted surface AND the public
    // theming target. Keeping the target on the outer element would satisfy
    // every automated check while leaving a theme styling an invisible
    // full-width row (architecture:component-theming-surface INV4).
    _jsx("div", {
      ref: ref,
      ...mergeProps(stylex.props(styles.wrapper, xstyle), className, style),
      ...rest,
      children: /*#__PURE__*/_jsx("div", {
        ...mergeProps(themeProps('chat-layout-scroll-button'), {
          0: {
            className: "xawy1a7 xb3r6kr xjspbzw x1prclbq x14hfi27 x1ueg155 xrgg2z9 xlr8y92 x2rcmwa x12w9bfk xg01cxk x47corl xlshs6z x1jys5uj"
          },
          2: {
            className: "xawy1a7 xb3r6kr xjspbzw x1prclbq x14hfi27 x1ueg155 xrgg2z9 xlr8y92 x2rcmwa x12w9bfk x1hc1fzr x67bb7w xnpuxes x1jys5uj"
          },
          1: {
            className: "xawy1a7 xb3r6kr xjspbzw x1prclbq x14hfi27 x1ueg155 xrgg2z9 xlr8y92 x2rcmwa x12w9bfk xg01cxk x47corl xlshs6z x1ncir08"
          },
          3: {
            className: "xawy1a7 xb3r6kr xjspbzw x1prclbq x14hfi27 x1ueg155 xrgg2z9 xlr8y92 x2rcmwa x12w9bfk x1hc1fzr x67bb7w xnpuxes x1ncir08"
          }
        }[!!isVisible << 1 | !!label << 0]),
        children: /*#__PURE__*/_jsx(Button, {
          label: label ?? t('@astryx.chatLayoutScrollButton.scrollToBottom'),
          "aria-label": label ?? t('@astryx.chatLayoutScrollButton.scrollToBottom'),
          icon: /*#__PURE__*/_jsx(Icon, {
            icon: "chevronDown",
            size: "md"
          }),
          variant: "ghost",
          size: "md",
          isIconOnly: !label,
          onClick: onClick,
          xstyle: [styles.button, label ? styles.buttonWithLabel : null],
          children: label ?? undefined
        })
      })
    })
  );
}
ChatLayoutScrollButton.displayName = 'ChatLayoutScrollButton';