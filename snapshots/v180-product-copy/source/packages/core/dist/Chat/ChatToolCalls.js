// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatToolCalls.tsx
 * @input Uses React, StyleX, semantic icon registry, theme tokens
 * @output Exports ChatToolCalls component
 * @position Chat component — displays tool/function call invocations
 *
 * Single component that handles both individual and grouped tool calls.
 * Accepts an array of call data matching the shape LLM APIs already return.
 * Single call renders inline; multiple calls get a collapsible summary.
 *
 * Design rationale: every LLM API (Vercel AI SDK, Anthropic, OpenAI)
 * returns tool calls as an array on the message. One component with a
 * data prop matches that shape directly — no nested compound components
 * for builders to wire up.
 */
import React, { useState, useCallback, useId } from 'react';
import * as stylex from '@stylexjs/stylex';
import "../theme/tokens.stylex.js";
import { colorVars, spacingVars, typeScaleVars, typographyVars, fontWeightVars, radiusVars, durationVars, easeVars, focusVars } from "../theme/tokens.stylex.js";
import { mergeProps } from "../utils/index.js";
import { Badge } from "../Badge/index.js";
import { Icon } from "../Icon/index.js";
import { Spinner } from "../Spinner/index.js";
import { VisuallyHidden } from "../VisuallyHidden/index.js";
import { themeProps } from "../utils/themeProps.js";
import { focusOutlineProps } from "../utils/focusOutline.stylex.js";
import { useTranslator } from "../i18n/index.js";

// =============================================================================
// Types
// =============================================================================
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// =============================================================================
// =============================================================================
// Styles
// =============================================================================

const styles = {
  root: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    keoZOQ: "xtbrsbv",
    $$css: true
  },
  chevronTransition: {
    kmkexE: "x1ob6yzd x9kvfbb",
    $$css: true
  },
  chevronExpanded: {
    k3aq6I: "x19jd1h0",
    $$css: true
  },
  callRow: {
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    kOIVth: "x1s4dlld",
    kAzted: "xjwf9q1",
    k8WAf4: "x13f7esw",
    $$css: true
  },
  callRowFocusInset: {
    kInvED: "x1nw7mhf",
    $$css: true
  },
  callRowClickable: {
    kkrTdU: "x1ypdohk x16khyan",
    kaIpWk: "xh6dtrn",
    kg3NbH: "x7a5moj",
    kUOVxO: "xtedp8i",
    k9dgf8: "xoevpu5",
    $$css: true
  },
  callRowToggle: {
    kkrTdU: "x1ypdohk x16khyan",
    $$css: true
  },
  statusIcon: {
    kVAEAm: "x1n2onr6",
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kmuXW: "x2lah0s",
    kzqmXN: "x1kky2od",
    kZKoxP: "xlup9mm",
    kaIpWk: "xjspbzw",
    $$css: true
  },
  nodePill: {
    kmuXW: "x2lah0s",
    $$css: true
  },
  colorPending: {
    kMwMTN: "xnbbluu",
    $$css: true
  },
  colorRunning: {
    kMwMTN: "xqwr325",
    $$css: true
  },
  colorComplete: {
    kMwMTN: "xtjic6",
    $$css: true
  },
  colorError: {
    kMwMTN: "xjt36v0",
    $$css: true
  }
};

// =============================================================================
// Status Icons
// =============================================================================

const STATUS_ICON_NAMES = {
  pending: 'clock',
  running: null,
  complete: 'success',
  error: 'error'
};
const STATUS_STYLES = {
  pending: styles.colorPending,
  running: styles.colorRunning,
  complete: styles.colorComplete,
  error: styles.colorError
};
function getStatusAnnouncement(t, status, errorMessage) {
  if (status === 'error' && errorMessage != null) {
    return t('@astryx.chatToolCalls.error', {
      message: errorMessage
    });
  }
  switch (status) {
    case 'pending':
      return t('@astryx.chatToolCalls.status.pending');
    case 'running':
      return t('@astryx.chatToolCalls.status.running');
    case 'complete':
      return t('@astryx.chatToolCalls.status.complete');
    case 'error':
      return t('@astryx.chatToolCalls.status.error');
  }
}
function getToolCallKeys(calls) {
  const occurrences = new Map();
  return calls.map(call => {
    if (call.key != null) return JSON.stringify(['explicit', call.key]);
    const metadata = JSON.stringify([call.name, call.target ?? '', call.node ?? '']);
    const occurrence = occurrences.get(metadata) ?? 0;
    occurrences.set(metadata, occurrence + 1);
    return JSON.stringify(['derived', metadata, occurrence]);
  });
}

// =============================================================================
// Internal: single call row
// =============================================================================

function CallRow({
  call,
  hasClippedFocusRing = false
}) {
  const t = useTranslator();
  const status = call.status ?? 'complete';
  const hasDetail = call.resultDetail != null;
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const detailId = useId();
  const statusAnnouncement = getStatusAnnouncement(t, status, call.errorMessage);
  const toggleDetail = hasDetail ? () => setIsDetailOpen(prev => !prev) : undefined;
  const row = /*#__PURE__*/_jsxs("div", {
    role: hasDetail ? 'button' : undefined,
    tabIndex: hasDetail ? 0 : undefined,
    "aria-expanded": hasDetail ? isDetailOpen : undefined,
    "aria-controls": hasDetail && isDetailOpen ? detailId : undefined,
    onClick: toggleDetail,
    onKeyDown: hasDetail ? e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDetail?.();
      }
    } : undefined,
    ...focusOutlineProps.focusVisible(styles.callRow, hasDetail && styles.callRowClickable, hasDetail && hasClippedFocusRing && styles.callRowFocusInset),
    children: [/*#__PURE__*/_jsxs("span", {
      title: status === 'error' ? call.errorMessage : undefined,
      ...stylex.props(styles.statusIcon, STATUS_STYLES[status]),
      children: [status === 'running' ? /*#__PURE__*/_jsx(Spinner, {
        size: "sm",
        shade: "subtle",
        "aria-hidden": "true"
      }) : /*#__PURE__*/_jsx(Icon, {
        icon: STATUS_ICON_NAMES[status] ?? 'success',
        size: "xsm",
        color: "inherit"
      }), /*#__PURE__*/_jsx(VisuallyHidden, {
        children: statusAnnouncement
      })]
    }), /*#__PURE__*/_jsx("span", {
      ...{
        className: "x141an7d x1ltkj2j x9m5x89 x1e4wzip xv1l7n4 xuxw1ft xb3r6kr xlyipyv xs83m0k x13n9wmd"
      },
      children: call.name
    }), call.node != null && /*#__PURE__*/_jsx(Badge, {
      label: call.node,
      variant: "neutral",
      xstyle: styles.nodePill
    }), call.target != null && /*#__PURE__*/_jsx("span", {
      ...{
        className: "x141an7d x1ltkj2j x9ynric xv1l7n4 xuxw1ft xb3r6kr xlyipyv x1g3ib7 xeuugli"
      },
      children: call.target
    }), (call.additions != null || call.deletions != null || call.stats != null) && /*#__PURE__*/_jsxs("span", {
      ...{
        className: "x78zum5 x6s0dn4 xzye2dw x141an7d x1ltkj2j x9ynric xv1l7n4 x2lah0s"
      },
      children: [call.additions != null && /*#__PURE__*/_jsxs("span", {
        ...{
          className: "xtjic6"
        },
        children: ["+", call.additions]
      }), call.deletions != null && /*#__PURE__*/_jsxs("span", {
        ...{
          className: "xjt36v0"
        },
        children: ["-", call.deletions]
      }), call.stats]
    }), call.duration != null && status === 'complete' && /*#__PURE__*/_jsx("span", {
      ...{
        className: "x141an7d x1ltkj2j x9ynric xv1l7n4 xuxw1ft x2lah0s"
      },
      children: call.duration
    }), hasDetail && /*#__PURE__*/_jsx("span", {
      ...{
        className: "x3nfvp2 x6s0dn4 xl56j7k x2lah0s x6jxa94 x1v9usgg xv1l7n4 xvc5jky"
      },
      children: /*#__PURE__*/_jsx(Icon, {
        icon: "chevronDown",
        size: "xsm",
        color: "inherit",
        xstyle: [styles.chevronTransition, isDetailOpen && styles.chevronExpanded]
      })
    })]
  });
  if (!hasDetail) {
    return row;
  }
  return /*#__PURE__*/_jsxs("div", {
    children: [row, isDetailOpen && /*#__PURE__*/_jsx("div", {
      id: detailId,
      ...{
        className: "x1f43n9v x1wesfrj"
      },
      children: call.resultDetail
    })]
  });
}

// =============================================================================
// Component
// =============================================================================

/**
 * Displays tool/function call invocations from an LLM response.
 *
 * Accepts a `calls` array matching the shape LLM APIs return. Single call
 * renders inline without group chrome. Multiple calls get a collapsible
 * summary header.
 *
 * @example
 * ```
 * <ChatToolCalls
 *   calls={message.toolCalls.map(tc => ({
 *     name: tc.toolName,
 *     status: tc.state,
 *     duration: tc.duration,
 *     resultDetail: <CodeBlock code={tc.args} language="json" />,
 *   }))}
 * />
 * ```
 */
export function ChatToolCalls(props) {
  const t = useTranslator();
  const {
    calls,
    label: customLabel,
    isExpanded: controlledExpanded,
    defaultIsExpanded,
    onExpandedChange,
    xstyle,
    className,
    style,
    ref,
    ...rest
  } = props;
  const autoDefault = defaultIsExpanded ?? false;
  const [internalExpanded, setInternalExpanded] = useState(autoDefault);
  const contentId = useId();
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  const toggle = useCallback(() => {
    const next = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  }, [isExpanded, isControlled, onExpandedChange]);
  if (calls.length === 0) {
    return null;
  }

  // Keep the row ancestor tree stable as calls stream from one to many.
  // Single calls use the same structural containers without group chrome.
  const isGroup = calls.length > 1;
  const showContent = !isGroup || isExpanded;
  const callKeys = getToolCallKeys(calls);

  // Multiple calls: latest call at surface with chevron to expand all
  const latestCall = calls[calls.length - 1];
  const latestStatus = latestCall.status ?? 'complete';
  const latestStatusAnnouncement = getStatusAnnouncement(t, latestStatus, latestCall.errorMessage);
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    ...mergeProps(themeProps('chat-tool-calls'), stylex.props(styles.root, xstyle), className, style),
    ...rest,
    children: [isGroup && /*#__PURE__*/_jsxs("div", {
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
      ...focusOutlineProps.focusVisible(styles.callRow, styles.callRowToggle),
      children: [isExpanded ? /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsx("span", {
          ...{
            className: "x3nfvp2 x6s0dn4 xl56j7k x2lah0s x1kky2od xlup9mm xv1l7n4"
          },
          children: /*#__PURE__*/_jsx(Icon, {
            icon: "wrench",
            size: "sm",
            color: "inherit"
          })
        }), /*#__PURE__*/_jsx("span", {
          ...{
            className: "x141an7d x1ltkj2j x9ynric x1e4wzip xv1l7n4"
          },
          children: customLabel ?? t('@astryx.chatToolCalls.groupLabel', {
            count: calls.length
          })
        })]
      }) : /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsxs("span", {
          ...stylex.props(styles.statusIcon, STATUS_STYLES[latestStatus]),
          children: [latestStatus === 'running' ? /*#__PURE__*/_jsx(Spinner, {
            size: "sm",
            shade: "subtle",
            "aria-hidden": "true"
          }) : /*#__PURE__*/_jsx(Icon, {
            icon: STATUS_ICON_NAMES[latestStatus] ?? 'success',
            size: "xsm",
            color: "inherit"
          }), /*#__PURE__*/_jsx(VisuallyHidden, {
            children: latestStatusAnnouncement
          })]
        }), /*#__PURE__*/_jsx("span", {
          ...{
            className: "x141an7d x1ltkj2j x9m5x89 x1e4wzip xv1l7n4 xuxw1ft xb3r6kr xlyipyv xs83m0k x13n9wmd"
          },
          children: latestCall.name
        }), latestCall.target != null && /*#__PURE__*/_jsx("span", {
          ...{
            className: "x141an7d x1ltkj2j x9ynric xv1l7n4 xuxw1ft xb3r6kr xlyipyv x1g3ib7 xeuugli"
          },
          children: latestCall.target
        })]
      }), /*#__PURE__*/_jsx("span", {
        ...{
          className: "x3nfvp2 x6s0dn4 x1lsbc85 x141an7d x1ltkj2j x9ynric xv1l7n4 x2lah0s"
        },
        children: !isExpanded && /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsx(Icon, {
            icon: "wrench",
            size: "xsm",
            color: "inherit"
          }), calls.length]
        })
      }), /*#__PURE__*/_jsx("span", {
        ...{
          className: "x3nfvp2 x6s0dn4 xl56j7k x2lah0s x6jxa94 x1v9usgg xv1l7n4"
        },
        children: /*#__PURE__*/_jsx(Icon, {
          icon: "chevronDown",
          size: "xsm",
          color: "inherit",
          xstyle: [styles.chevronTransition, isExpanded && styles.chevronExpanded]
        })
      })]
    }), /*#__PURE__*/_jsx("div", {
      id: contentId,
      inert: showContent ? undefined : true,
      ...{
        0: {},
        2: {
          className: "xrvj5dj xihq33y xb0j27v x9kvfbb"
        },
        1: {
          className: "x1tu4anv"
        },
        3: {
          className: "xrvj5dj xb0j27v x9kvfbb x1tu4anv"
        }
      }[!!isGroup << 1 | !!(isGroup && showContent) << 0],
      children: /*#__PURE__*/_jsx("div", {
        ...{
          0: {},
          1: {
            className: "xb3r6kr x2lwn1j x7a5moj xtedp8i"
          }
        }[!!isGroup << 0],
        children: /*#__PURE__*/_jsx("div", {
          ...{
            0: {},
            1: {
              className: "x78zum5 xdt5ytf x7a5moj xtedp8i"
            }
          }[!!isGroup << 0],
          children: calls.map((call, index) => /*#__PURE__*/_jsx(CallRow, {
            call: call,
            hasClippedFocusRing: isGroup
          }, callKeys[index]))
        })
      })
    }, "tool-call-content")]
  });
}
ChatToolCalls.displayName = 'ChatToolCalls';