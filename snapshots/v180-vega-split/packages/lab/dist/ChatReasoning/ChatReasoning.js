// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatReasoning.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports ChatReasoning component
 * @position Chat component — compact collapsible reasoning/thinking display
 *
 * Renders model reasoning/thinking content as a compact single-line
 * collapsed element. Expanding reveals the full reasoning text.
 *
 * Design: extremely compact by default. One line with ellipsis overflow.
 * Expandable on click.
 */
import { useCallback, useId, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, spacingVars, typeScaleVars, typographyVars, fontWeightVars, durationVars, easeVars } from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps } from '@astryxdesign/core/utils';
import { themeProps } from '@astryxdesign/core/utils';

// =============================================================================
// Types
// =============================================================================
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// =============================================================================
// Animations
// =============================================================================

const shimmerKeyframes = "x1ofn8cw-B";

// =============================================================================
// Styles
// =============================================================================

const styles = {
  root: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    keoZOQ: "xtbrsbv",
    $$css: true
  }
};

// =============================================================================
// Icons
// =============================================================================

function ThinkingIcon() {
  return /*#__PURE__*/_jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    children: [/*#__PURE__*/_jsx("circle", {
      cx: "7",
      cy: "7",
      r: "5.5",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeDasharray: "3 2"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "5.5",
      cy: "7",
      r: "0.75",
      fill: "currentColor"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "8.5",
      cy: "7",
      r: "0.75",
      fill: "currentColor"
    })]
  });
}
function ChevronDownIcon() {
  return /*#__PURE__*/_jsx("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    children: /*#__PURE__*/_jsx("path", {
      d: "M3 4.5L6 7.5L9 4.5",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })
  });
}

// =============================================================================
// Component
// =============================================================================

/**
 * Compact collapsible display for model reasoning/thinking content.
 *
 * Renders as a single line: icon + label + duration + ellipsized preview.
 * Expands to show full reasoning on click.
 *
 * @example
 * ```
 * <ChatMessage sender="assistant">
 *   <ChatReasoning duration="12s">
 *     Let me work through the constraints on adjacent fields...
 *   </ChatReasoning>
 *   <Markdown>{response}</Markdown>
 * </ChatMessage>
 * ```
 */
export function ChatReasoning(props) {
  const {
    children,
    label = 'Thinking',
    duration,
    isStreaming = false,
    isExpanded: controlledExpanded,
    defaultIsExpanded = false,
    onExpandedChange,
    xstyle,
    className,
    style,
    ...rest
  } = props;
  const [internalExpanded, setInternalExpanded] = useState(defaultIsExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  const contentId = useId();
  const toggle = useCallback(() => {
    const next = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  }, [isExpanded, isControlled, onExpandedChange]);
  const previewText = typeof children === 'string' ? children : null;
  return /*#__PURE__*/_jsxs("div", {
    ...mergeProps(themeProps('chat-reasoning', {
      expanded: isExpanded ? 'expanded' : null,
      streaming: isStreaming ? 'streaming' : null
    }), stylex.props(styles.root, xstyle), className, style),
    ...rest,
    children: [/*#__PURE__*/_jsxs("div", {
      role: "button",
      tabIndex: 0,
      "aria-expanded": isExpanded,
      "aria-controls": contentId,
      onClick: toggle,
      onKeyDown: e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      },
      ...{
        className: "x78zum5 x6s0dn4 x1s4dlld x1ypdohk x16khyan x87ps6o xjwf9q1 x13f7esw"
      },
      children: [/*#__PURE__*/_jsx("span", {
        ...{
          className: "x3nfvp2 x6s0dn4 xl56j7k x2lah0s x1kky2od xlup9mm xv1l7n4"
        },
        children: /*#__PURE__*/_jsx(ThinkingIcon, {})
      }), /*#__PURE__*/_jsxs("div", {
        ...{
          className: "x78zum5 x6s0dn4 xzye2dw xeuugli xb3r6kr"
        },
        children: [/*#__PURE__*/_jsx("span", {
          ...{
            0: {
              className: "x141an7d x1ltkj2j x9ynric x1e4wzip xv1l7n4 xuxw1ft x2lah0s"
            },
            1: {
              className: "x141an7d x1ltkj2j x9ynric x1e4wzip xuxw1ft x2lah0s xct3ic7 xakli9p x1ta4xzc x19co3pv x3mlza6 xeaay5l x1esw782 xa4qsjk"
            }
          }[!!isStreaming << 0],
          children: label
        }), duration != null && !isStreaming && /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsx("span", {
            ...{
              className: "x141an7d xnbbluu x2lah0s"
            },
            children: "\xB7"
          }), /*#__PURE__*/_jsx("span", {
            ...{
              className: "x141an7d x1ltkj2j x9ynric xnbbluu xuxw1ft x2lah0s"
            },
            children: duration
          })]
        }), !isExpanded && previewText && !isStreaming && /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsx("span", {
            ...{
              className: "x141an7d xnbbluu x2lah0s"
            },
            children: "\u2014"
          }), /*#__PURE__*/_jsx("span", {
            ...{
              className: "x141an7d x1ltkj2j x9ynric xnbbluu xuxw1ft xb3r6kr xlyipyv xeuugli"
            },
            children: previewText
          })]
        })]
      }), /*#__PURE__*/_jsx("span", {
        ...{
          0: {
            className: "x3nfvp2 x6s0dn4 xl56j7k x2lah0s x6jxa94 x1v9usgg xnbbluu x1ob6yzd"
          },
          1: {
            className: "x3nfvp2 x6s0dn4 xl56j7k x2lah0s x6jxa94 x1v9usgg xnbbluu x1ob6yzd x19jd1h0"
          }
        }[!!isExpanded << 0],
        children: /*#__PURE__*/_jsx(ChevronDownIcon, {})
      })]
    }), /*#__PURE__*/_jsx("div", {
      id: contentId
      // Collapsed content is only clipped visually (0fr grid row + overflow
      // hidden), which leaves it in the accessibility tree. `inert` removes
      // it from AT and the tab order while keeping the element rendered, so
      // the grid-template-rows expand/collapse transition still runs.
      ,
      inert: !isExpanded,
      ...{
        0: {
          className: "xrvj5dj xihq33y xb0j27v"
        },
        1: {
          className: "xrvj5dj xb0j27v x1tu4anv"
        }
      }[!!isExpanded << 0],
      children: /*#__PURE__*/_jsx("div", {
        ...{
          className: "xb3r6kr x2lwn1j"
        },
        children: /*#__PURE__*/_jsx("div", {
          ...{
            className: "x1xye8es x1f43n9v x141an7d x1ltkj2j x9ynric xv1l7n4"
          },
          children: children
        })
      })
    })]
  });
}
ChatReasoning.displayName = 'ChatReasoning';