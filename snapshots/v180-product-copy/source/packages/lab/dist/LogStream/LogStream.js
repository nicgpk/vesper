// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LogStream.tsx
 * @input Uses React, StyleX, theme tokens (color/spacing/radius/typography vars)
 * @output Exports LogStream component, LogStreamProps, LogEntry, LogStreamLevel
 * @position Lab implementation; experimental streaming log viewer
 *
 * Mono grid rows (timestamp | level | source? | message) with level color
 * accents, expandable detail panels, a follow-scroll live-tail mode, and an
 * always-dark "terminal" variant.
 *
 * Known limit: rows are plain DOM (content-visibility: auto for offscreen
 * skip) — there is NO virtualization. Streams beyond a few thousand rows
 * should be windowed by the caller.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/LogStream/LogStream.doc.mjs (props table, notes)
 * - /packages/lab/src/LogStream/LogStream.test.tsx (behavior tests)
 * - /packages/lab/src/LogStream/index.ts (exports if types change)
 * - /apps/storybook/stories/LogStream.stories.tsx (examples and visual coverage)
 */

'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { focusOutlineStyles, mergeProps, themeProps } from '@astryxdesign/core/utils';
import '@astryxdesign/core/theme/tokens.stylex';
import { borderVars, colorVars, durationVars, fontWeightVars, radiusVars, shadowVars, spacingVars, textSizeVars, typographyVars } from '@astryxdesign/core/theme/tokens.stylex';

/** Severity of one log entry. */

/** One row in the stream; all strings are pre-formatted by the caller. */
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/** User counts as "scrolled away" beyond this distance from the bottom. */
const FOLLOW_THRESHOLD_PX = 24;
const REDUCE = '@media (prefers-reduced-motion: reduce)';
const HOVER = '@media (hover: hover)';

// The terminal variant is intentionally always-dark (terminal chrome is a
// brand surface, mirroring real shells), so it uses fixed near-black grays
// rather than light-dark() theme tokens, which would flip with the scheme.
const TERM = {
  surface: '#0a0a0a',
  surfaceRaised: '#141417',
  border: '#26262a',
  textDim: '#8b8b94',
  text: '#b9b9c0',
  textBright: '#e8e8ea',
  warn: '#f2c00b',
  error: '#ff6166'
};
const _temp = {
  kORKVm: "x1odjw0f",
  k5wCbM: "x1597r2g",
  kZeWKH: "xish69e",
  "$$css": true
};
const styles = {
  root: {
    kVAEAm: "x1n2onr6",
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kaIpWk: "xh6dtrn",
    kMzoRj: "x1litavf",
    ksu8eU: "x1y0btm7",
    kVAM5u: "x14i3s5s",
    kWkggS: "x10xzikg",
    kVQacm: "xb3r6kr",
    kMv6JI: "x9m5x89",
    kGuDYH: "x1eqnyfr",
    $$css: true
  },
  rootTerminal: {
    kVAM5u: "x70o2i5",
    kWkggS: "x2kq1z0",
    $$css: true
  },
  scroller: maxHeight => [_temp, {
    kskxy: maxHeight != null ? "x1jols5v" : maxHeight,
    $$css: true
  }, {
    "--x-maxHeight": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(maxHeight)
  }],
  row: {
    k1xSpc: "xrvj5dj",
    kGNEyG: "x1pha0wt",
    k1C7PZ: "xewh9hi",
    k8WAf4: "xu0wf1k",
    kg3NbH: "xrrkdod",
    kLWn49: "xa7kkou",
    kMwMTN: "x1tgivj0",
    kt9PQ7: "x92x3c3 x1t1lzn6",
    kfdmCh: "x1q0q8m5",
    kL6WhQ: "xw8gpjh",
    kCygrm: "xb5mbof",
    kM8eXF: "x1w36mze",
    kSiTet: "x1hc1fzr",
    k1ekBW: "x19991ni",
    kIyJzY: "xkvfbh3 xsagj69",
    kAMwcw: "x9lcvmn",
    kamtoy: "x4itv7f",
    $$css: true
  },
  rowTerminal: {
    kMwMTN: "x45uw2j",
    kt9PQ7: "x1qhh985",
    k8WAf4: "xsplgde",
    $$css: true
  },
  colsFull: {
    kumcoG: "xgunjtk",
    $$css: true
  },
  colsNoSource: {
    kumcoG: "x1dl91lv",
    $$css: true
  },
  colsNoTimestamp: {
    kumcoG: "x1s6oqvn",
    $$css: true
  },
  colsMessageOnly: {
    kumcoG: "xl3z6kh",
    $$css: true
  },
  rowButton: {
    kzqmXN: "xh8yej3",
    k9WMMc: "xdpxx8g",
    kEafiO: "x972fbf",
    kjGldf: "xuxrje7",
    kMv6JI: "x9m5x89",
    kGuDYH: "x1eqnyfr",
    kkrTdU: "x1ypdohk x16khyan",
    kWkggS: "xjbqb8w xoevpu5",
    $$css: true
  },
  rowButtonTerminal: {
    kWkggS: "xjbqb8w xyys8i",
    $$css: true
  },
  rowError: {
    kWkggS: "x179w1ng",
    $$css: true
  },
  rowWarn: {
    kWkggS: "x1b8r0zp",
    $$css: true
  },
  level: {
    kGuDYH: "x51wmvv",
    k63SB2: "x2mo6ok",
    kb6lSQ: "x9pfba7",
    kP9fke: "xtvhhri",
    $$css: true
  },
  levelInfo: {
    kMwMTN: "xv1l7n4",
    $$css: true
  },
  levelDebug: {
    kMwMTN: "xnbbluu",
    $$css: true
  },
  levelWarn: {
    kMwMTN: "xuj0v0c",
    $$css: true
  },
  levelError: {
    kMwMTN: "x1lenag",
    $$css: true
  },
  levelInfoTerminal: {
    kMwMTN: "x45uw2j",
    $$css: true
  },
  levelDebugTerminal: {
    kMwMTN: "x8qbvqa",
    $$css: true
  },
  levelWarnTerminal: {
    kMwMTN: "x1gnejgv",
    $$css: true
  },
  levelErrorTerminal: {
    kMwMTN: "xbz8ry5",
    $$css: true
  },
  jumpToLatest: {
    kVAEAm: "x10l6tqk",
    krVfgx: "x1hmuevu",
    kt4wiu: "x1mcfs9z",
    k8WAf4: "xu0wf1k",
    kg3NbH: "xrrkdod",
    kaIpWk: "xjspbzw",
    kMzoRj: "x1litavf",
    ksu8eU: "x1y0btm7",
    kVAM5u: "xvy26l8",
    kWkggS: "x10xzikg xkqrm7g",
    kMwMTN: "x1tgivj0",
    kMv6JI: "x9m5x89",
    kGuDYH: "x1eqnyfr",
    k63SB2: "x1e4wzip",
    kkrTdU: "x1ypdohk x16khyan",
    kGVxlE: "x14hfi27",
    $$css: true
  },
  jumpToLatestTerminal: {
    kVAM5u: "x70o2i5",
    kWkggS: "x1my5jcs x1fkayqs",
    kMwMTN: "x1tu4bv5",
    $$css: true
  }
};
const LEVEL_STYLE = {
  info: styles.levelInfo,
  warn: styles.levelWarn,
  error: styles.levelError,
  debug: styles.levelDebug
};
const LEVEL_STYLE_TERMINAL = {
  info: styles.levelInfoTerminal,
  warn: styles.levelWarnTerminal,
  error: styles.levelErrorTerminal,
  debug: styles.levelDebugTerminal
};

/**
 * Experimental streaming log viewer: mono grid rows
 * (timestamp | level | source | message) with token-derived level accents,
 * expandable per-row detail panels, follow-scroll live tailing with a
 * "Jump to latest" affordance, and an always-dark terminal variant.
 *
 * Appended rows fade in via `@starting-style` (instant under
 * prefers-reduced-motion). Follow pinning uses a scroll listener — no
 * polling; rows use `content-visibility: auto` for offscreen skip but are
 * NOT virtualized (window large streams in the caller).
 *
 * Live announcements are tied to follow pinning: the `role="log"` region is
 * `aria-live="polite"` only while following the tail and `aria-live="off"`
 * while unfollowed, so appends never flood assistive tech.
 *
 * @example
 * ```
 * <LogStream
 *   entries={entries}
 *   maxHeight={480}
 *   isFollowing={isFollowing}
 *   onFollowChange={setIsFollowing}
 * />
 * ```
 */
export function LogStream({
  entries,
  variant = 'default',
  isFollowing,
  onFollowChange,
  maxHeight,
  hasTimestamps = true,
  label = 'Log stream',
  renderEntry,
  xstyle,
  className,
  style,
  ref,
  ...rest
}) {
  const isTerminal = variant === 'terminal';
  const scrollerRef = useRef(null);

  // Follow pinning: controlled when the prop is provided, else internal.
  const [internalFollowing, setInternalFollowing] = useState(isFollowing ?? false);
  const following = isFollowing ?? internalFollowing;
  const setFollowing = next => {
    if (next === following) {
      return;
    }
    if (isFollowing == null) {
      setInternalFollowing(next);
    }
    onFollowChange?.(next);
  };

  // Whether the viewport currently sits at the bottom; drives the
  // "Jump to latest" affordance. Updated from scroll events only.
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const toggleExpanded = id => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const hasSource = useMemo(() => entries.some(entry => entry.source != null), [entries]);

  // Pin to the newest row while following. Direct scrollTop assignment (not
  // smooth scrollTo) so rapid appends never queue competing animations.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!following || el == null) {
      return;
    }
    el.scrollTop = el.scrollHeight;
    setIsAtBottom(true);
  }, [following, entries.length]);

  // No programmatic-scroll guard is needed: pinning always lands the
  // viewport at the bottom, and the unpin branch below only fires when the
  // viewport is AWAY from the bottom — a programmatic echo is a no-op.
  const handleScroll = event => {
    const el = event.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom <= FOLLOW_THRESHOLD_PX;
    setIsAtBottom(atBottom);
    // User scrolled away from the tail: unpin. Re-pinning is explicit via
    // the "Jump to latest" affordance (never implicit on scroll-down).
    if (following && !atBottom) {
      setFollowing(false);
    }
  };
  const handleJumpToLatest = () => {
    setFollowing(true);
    const el = scrollerRef.current;
    if (el != null) {
      el.scrollTop = el.scrollHeight;
      setIsAtBottom(true);
    }
  };
  const colsStyle = hasTimestamps ? hasSource ? styles.colsFull : styles.colsNoSource : hasSource ? styles.colsNoTimestamp : styles.colsMessageOnly;
  const renderDefaultRow = entry => {
    const isExpandable = entry.detail != null;
    const isExpanded = isExpandable && expandedIds.has(entry.id);
    const cells = /*#__PURE__*/_jsxs(_Fragment, {
      children: [hasTimestamps && /*#__PURE__*/_jsx("span", {
        ...{
          0: {
            className: "xv1l7n4 xuxw1ft xss6m8b"
          },
          1: {
            className: "xuxw1ft xss6m8b x8qbvqa"
          }
        }[!!isTerminal << 0],
        children: entry.timestamp
      }), /*#__PURE__*/_jsx("span", {
        ...stylex.props(styles.level, (isTerminal ? LEVEL_STYLE_TERMINAL : LEVEL_STYLE)[entry.level]),
        children: entry.level
      }), hasSource && /*#__PURE__*/_jsx("span", {
        ...{
          0: {
            className: "xv1l7n4 xb3r6kr xlyipyv xuxw1ft xeuugli"
          },
          1: {
            className: "xb3r6kr xlyipyv xuxw1ft xeuugli x8qbvqa"
          }
        }[!!isTerminal << 0],
        title: entry.source,
        children: entry.source
      }), /*#__PURE__*/_jsx("span", {
        ...{
          0: {
            className: "xeuugli xj0a0fe x126k92a"
          },
          4: {
            className: "xeuugli xj0a0fe x126k92a x45uw2j"
          },
          2: {
            className: "xeuugli xj0a0fe x126k92a xbz8ry5"
          },
          6: {
            className: "xeuugli xj0a0fe x126k92a xbz8ry5"
          },
          1: {
            className: "xeuugli xj0a0fe x126k92a x1gnejgv"
          },
          5: {
            className: "xeuugli xj0a0fe x126k92a x1gnejgv"
          },
          3: {
            className: "xeuugli xj0a0fe x126k92a x1gnejgv"
          },
          7: {
            className: "xeuugli xj0a0fe x126k92a x1gnejgv"
          }
        }[!!isTerminal << 2 | !!(isTerminal && entry.level === 'error') << 1 | !!(isTerminal && entry.level === 'warn') << 0],
        children: entry.message
      })]
    });
    const rowStyles = [styles.row, colsStyle, isTerminal && styles.rowTerminal, !isTerminal && entry.level === 'error' && styles.rowError, !isTerminal && entry.level === 'warn' && styles.rowWarn];
    if (!isExpandable) {
      return /*#__PURE__*/_jsx("div", {
        "data-level": entry.level,
        ...stylex.props(...rowStyles),
        children: cells
      });
    }
    return /*#__PURE__*/_jsxs(_Fragment, {
      children: [/*#__PURE__*/_jsx("button", {
        type: "button",
        "aria-expanded": isExpanded,
        "data-level": entry.level,
        onClick: () => toggleExpanded(entry.id),
        ...stylex.props(...rowStyles, styles.rowButton, isTerminal && styles.rowButtonTerminal),
        children: cells
      }), isExpanded && /*#__PURE__*/_jsx("div", {
        ...{
          0: {
            className: "x8o8v82 xrrkdod xwmxj5m x92x3c3 x1q0q8m5 xw8gpjh"
          },
          1: {
            className: "x8o8v82 xrrkdod x92x3c3 x1q0q8m5 x4lxhut x1s39gqd x45uw2j"
          }
        }[!!isTerminal << 0],
        children: entry.detail
      })]
    });
  };
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    ...rest,
    ...mergeProps(themeProps('log-stream', {
      variant
    }), stylex.props(styles.root, isTerminal && styles.rootTerminal, xstyle), className, style),
    children: [/*#__PURE__*/_jsx("div", {
      ref: scrollerRef,
      role: "log",
      "aria-label": label
      // role="log" is implicitly aria-live="polite" — on a busy stream that
      // floods assistive tech with every appended row (WCAG 2.2.2 / 4.1.3).
      // Follow-pinning doubles as the mute switch: while the user is away
      // from the tail (unfollowed), the region is aria-live="off"; resuming
      // follow ("Jump to latest") restores polite announcements.
      ,
      "aria-live": following ? 'polite' : 'off',
      onScroll: handleScroll,
      ...stylex.props(styles.scroller(maxHeight ?? null)),
      children: entries.map(entry => /*#__PURE__*/_jsx(Fragment, {
        children: renderEntry != null ? renderEntry(entry) : renderDefaultRow(entry)
      }, entry.id))
    }), !following && !isAtBottom && entries.length > 0 && /*#__PURE__*/_jsx("button", {
      type: "button",
      onClick: handleJumpToLatest,
      ...stylex.props(focusOutlineStyles.focusVisible, styles.jumpToLatest, isTerminal && styles.jumpToLatestTerminal),
      children: "Jump to latest \u2193"
    })]
  });
}
LogStream.displayName = 'LogStream';