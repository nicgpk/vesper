// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Stat.tsx
 * @input Uses React, StyleX, and Astryx core theme tokens/utilities
 * @output Exports Stat component, StatProps, StatDelta, StatDeltaDirection,
 *   StatDeltaSentiment, StatSize types
 * @position Lab implementation; consumed by packages/lab/src/index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Stat/Stat.doc.mjs (props table, features, implementation notes)
 * - /packages/lab/src/Stat/Stat.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/Stat/index.ts (exports if types change)
 * - /apps/storybook/stories/Stat.stories.tsx (examples)
 */
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, fontWeightVars, spacingVars, textSizeVars, typeScaleVars, typographyVars } from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps } from '@astryxdesign/core/utils';
import { themeProps } from '@astryxdesign/core/utils';

/**
 * Base styles
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const styles = {
  base: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kGNEyG: "x1cy8zhl",
    kOIVth: "xzye2dw",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  value: {
    kMv6JI: "x1g81bgm",
    k63SB2: "x2mo6ok",
    kLWn49: "x1cpk1wn",
    kMwMTN: "x1tgivj0",
    kcqcaj: "xss6m8b",
    $$css: true
  },
  delta: {
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kOIVth: "xzye2dw",
    kGuDYH: "x141an7d",
    kLWn49: "x1ltkj2j",
    k63SB2: "x1e4wzip",
    kcqcaj: "xss6m8b",
    khDVqt: "xuxw1ft",
    $$css: true
  }
};

/**
 * Value font-size per size variant
 */
const sizeStyles = {
  sm: {
    kGuDYH: "x1wqms48",
    $$css: true
  },
  md: {
    kGuDYH: "xhs0kqb",
    $$css: true
  },
  lg: {
    kGuDYH: "x10srzze",
    $$css: true
  }
};

/**
 * Delta color per resolved sentiment
 */
const sentimentStyles = {
  positive: {
    kMwMTN: "xtjic6",
    $$css: true
  },
  negative: {
    kMwMTN: "xjt36v0",
    $$css: true
  },
  neutral: {
    kMwMTN: "xv1l7n4",
    $$css: true
  }
};

/** Trend direction of a delta; picks the glyph (up/down arrow, flat dash). */

/** Color tone of a delta; overrides the default direction mapping. */

/** Size variant controlling the value's font size. */

/**
 * Change indicator rendered next to the value: a direction glyph plus
 * colored, pre-formatted change text.
 */

/** Default direction-to-sentiment mapping (up=good, down=bad). */
const DIRECTION_SENTIMENT = {
  up: 'positive',
  down: 'negative',
  flat: 'neutral'
};

/** Screen-reader text announced after the delta value. */
const DIRECTION_TEXT = {
  up: 'trending up',
  down: 'trending down',
  flat: 'flat'
};

/** Inline glyph paths (12x12 viewBox): up-right arrow, down-right arrow, dash. */
const DELTA_GLYPH_PATHS = {
  up: 'M3.5 8.5L8.5 3.5M8.5 3.5H4.75M8.5 3.5V7.25',
  down: 'M3.5 3.5L8.5 8.5M8.5 8.5H4.75M8.5 8.5V4.75',
  flat: 'M2.5 6H9.5'
};
/**
 * A KPI/metric display: label, large tabular-nums value, optional
 * sentiment-aware delta, supporting description, and a trend media slot.
 *
 * The delta's color follows its direction (up=success, down=error,
 * flat=secondary) unless `sentiment` overrides it — use that for inverted
 * metrics where a drop is good (error rate, latency, churn).
 *
 * Styles use Astryx theme tokens via StyleX.
 * Wrap your app in `<Theme>` to apply a theme.
 *
 * @example
 * ```
 * <Stat label="Total requests" value="2.4M" delta={{value: '+12.4%', direction: 'up'}} />
 * <Stat
 *   label="Error rate"
 *   value="0.42%"
 *   delta={{value: '-0.08%', direction: 'down', sentiment: 'positive'}}
 *   description="vs. previous 30 days"
 * />
 * <Stat label="Active users" value="18,204" size="lg" media={<Sparkline />} />
 * ```
 */
export function Stat({
  label,
  value,
  delta,
  description,
  media,
  size = 'md',
  xstyle,
  className,
  style,
  ref,
  ...props
}) {
  const sentiment = delta == null ? null : delta.sentiment ?? DIRECTION_SENTIMENT[delta.direction];
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    ...mergeProps(themeProps('stat', {
      size
    }), stylex.props(styles.base, xstyle), className, style),
    ...props,
    children: [/*#__PURE__*/_jsx("span", {
      ...{
        className: "x141an7d x1ltkj2j x1e4wzip xv1l7n4"
      },
      children: label
    }), /*#__PURE__*/_jsxs("span", {
      ...{
        className: "x78zum5 x1pha0wt x1txdalj xeuugli"
      },
      children: [/*#__PURE__*/_jsx("span", {
        ...stylex.props(styles.value, sizeStyles[size]),
        children: value
      }), delta != null && sentiment != null ? /*#__PURE__*/_jsxs("span", {
        "data-sentiment": sentiment,
        ...stylex.props(styles.delta, sentimentStyles[sentiment]),
        children: [/*#__PURE__*/_jsx("svg", {
          "aria-hidden": "true",
          viewBox: "0 0 12 12",
          width: 12,
          height: 12,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          ...{
            className: "x2lah0s"
          },
          children: /*#__PURE__*/_jsx("path", {
            d: DELTA_GLYPH_PATHS[delta.direction]
          })
        }), delta.value, /*#__PURE__*/_jsxs("span", {
          ...{
            className: "x10l6tqk x1i1rx1s xjm9jq1 x1717udv xkdpibf xb3r6kr xeh89do xuxw1ft xc342km"
          },
          children: ["(", DIRECTION_TEXT[delta.direction], ")"]
        })]
      }) : null]
    }), description != null ? /*#__PURE__*/_jsx("span", {
      ...{
        className: "x141an7d x1ltkj2j xv1l7n4"
      },
      children: description
    }) : null, media != null ? /*#__PURE__*/_jsx("div", {
      ...{
        className: "xcsaf9d xkh2ocl xeuugli"
      },
      children: media
    }) : null]
  });
}
Stat.displayName = 'Stat';