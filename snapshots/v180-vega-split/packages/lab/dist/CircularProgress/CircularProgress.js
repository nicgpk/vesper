// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CircularProgress.tsx
 * @input Uses React, useId, stylex, SVG, color/spacing/duration/ease tokens
 * @output Exports CircularProgress component, CircularProgressProps, CircularProgressSize, CircularProgressVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/CircularProgress/CircularProgress.doc.mjs (props table, features, implementation notes)
 * - /packages/lab/src/CircularProgress/CircularProgress.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/CircularProgress/index.ts (exports if types change)
 * - /apps/storybook/stories/CircularProgress.stories.tsx (storybook stories)
 */
import { useId } from 'react';
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, durationVars, easeVars, fontWeightVars, spacingVars, typeScaleVars } from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps } from '@astryxdesign/core/utils';
import { themeProps } from '@astryxdesign/core/utils';

/**
 * Extensible variant map for CircularProgress.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/lab' {
 *   interface CircularProgressVariantMap {
 *     'brand': true;
 *   }
 * }
 * ```
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SIZE_CONFIG = {
  sm: {
    diameter: 32,
    strokeWidth: 3
  },
  md: {
    diameter: 48,
    strokeWidth: 4
  },
  lg: {
    diameter: 64,
    strokeWidth: 5
  }
};
// =============================================================================
// Indeterminate animation
// =============================================================================

const indeterminateRotation = "xqng64z-B";

// SVG dash percentages scale with the square viewport. A 300% gap exceeds every
// ring circumference; shifting the 2% + 300% pattern by 302% closes the loop.
const indeterminateDash = "x9ppb3p-B";

// =============================================================================
// Styles
// =============================================================================

const styles = {
  root: {
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kVAEAm: "x1n2onr6",
    kmuXW: "x2lah0s",
    $$css: true
  },
  rootWithLabel: {
    kXwgrk: "xdt5ytf",
    kOIVth: "xzye2dw",
    $$css: true
  },
  track: {
    kDwRjp: "xbh8q5q",
    kjVXCG: "xpi25hw",
    $$css: true
  },
  fill: {
    kDwRjp: "xbh8q5q",
    kU5bRw: "x1owpc8m",
    k1ekBW: "xxnu56j",
    kIyJzY: "x80gvsz",
    kAMwcw: "xlr8y92",
    $$css: true
  },
  fillIndeterminate: {
    kDwRjp: "xbh8q5q",
    kU5bRw: "x1owpc8m",
    kKVMdj: "x16zax3f",
    k44tkh: "xmg6eyc xnh0sag",
    kyAemX: "x4hg4is",
    ko0y90: "xa4qsjk",
    $$css: true
  }
};
const variantStyles = {
  accent: {
    kjVXCG: "xjsr54c",
    $$css: true
  },
  success: {
    kjVXCG: "x8y33gb",
    $$css: true
  },
  warning: {
    kjVXCG: "x9ezeq1",
    $$css: true
  },
  error: {
    kjVXCG: "x1vco6zm",
    $$css: true
  },
  neutral: {
    kjVXCG: "xuxf9kk",
    $$css: true
  },
  disabled: {
    kjVXCG: "xuxf9kk",
    $$css: true
  }
};
const trackVariantStyles = {
  accent: {
    kjVXCG: "ximx5ud",
    $$css: true
  },
  success: {
    kjVXCG: "x1uro670",
    $$css: true
  },
  warning: {
    kjVXCG: "x1wjzxuj",
    $$css: true
  },
  error: {
    kjVXCG: "xjswp7v",
    $$css: true
  },
  neutral: {
    kjVXCG: "xpi25hw",
    $$css: true
  }
};
function defaultFormatValueLabel(value, max) {
  const pct = max > 0 ? Math.round(value / max * 100) : 0;
  return `${pct}%`;
}

/**
 * A circular/radial progress indicator that shows completion as a ring.
 *
 * In determinate mode, displays a known value as an arc fill.
 * In indeterminate mode, shows an animated spinning indicator.
 * Supports center content via children for labels, percentages, or icons,
 * or an automatic formatted value label via `hasValueLabel`.
 *
 * @example
 * ```
 * <CircularProgress value={75} label="Upload progress" hasValueLabel />
 * <CircularProgress isIndeterminate label="Loading..." />
 * <CircularProgress value={3.2} max={5} label="Disk usage" hasValueLabel
 *   formatValueLabel={(v, m) => `${v} GB / ${m} GB`} />
 * <CircularProgress value={30} label="Canceled" isDisabled hasValueLabel />
 * ```
 */
export function CircularProgress({
  value = 0,
  max = 100,
  label,
  isLabelHidden = true,
  hasValueLabel = false,
  formatValueLabel = defaultFormatValueLabel,
  children,
  size = 'md',
  variant = 'accent',
  isIndeterminate = false,
  isDisabled = false,
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
  ref,
  ...rest
}) {
  const labelId = useId();
  const {
    diameter,
    strokeWidth
  } = SIZE_CONFIG[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // A non-finite value or max (e.g. a NaN from an upstream `loaded / total`
  // with total 0) would otherwise leak into aria-valuenow, the value label,
  // and the arc geometry as the string "NaN". Treat it as empty progress,
  // matching the max=0 handling below.
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Number.isFinite(max) ? max : 0;
  const clampedValue = Math.min(Math.max(0, safeValue), safeMax);
  const percentage = safeMax > 0 ? clampedValue / safeMax : 0;
  const dashoffset = circumference * (1 - percentage);
  const valueText = formatValueLabel(clampedValue, safeMax);
  const center = diameter / 2;
  const showLabel = !isLabelHidden;
  const showValueLabel = hasValueLabel && !isIndeterminate;
  const centerContent = children != null ? children : showValueLabel ? valueText : null;
  const fillVariant = isDisabled ? 'disabled' : variant;
  const trackVariant = isDisabled ? 'neutral' : variant;
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    ...mergeProps(themeProps('circular-progress', {
      variant,
      size
    }), stylex.props(styles.root, showLabel && styles.rootWithLabel, xstyle), className, style),
    "data-testid": dataTestId,
    ...rest,
    children: [/*#__PURE__*/_jsx("span", {
      id: labelId,
      ...{
        0: {
          className: "x10l6tqk x1i1rx1s xjm9jq1 x1717udv xkdpibf xb3r6kr xzpqnlu xuxw1ft xc342km"
        },
        2: {
          className: "x141an7d x1ltkj2j x1e4wzip xv1l7n4"
        },
        1: {
          className: "x10l6tqk x1i1rx1s xjm9jq1 x1717udv xkdpibf xb3r6kr xzpqnlu xuxw1ft xc342km xnbbluu"
        },
        3: {
          className: "x141an7d x1ltkj2j x1e4wzip xnbbluu"
        }
      }[!!showLabel << 1 | !!(showLabel && isDisabled) << 0],
      children: label
    }), /*#__PURE__*/_jsxs("div", {
      ...{
        className: "x1n2onr6 x3nfvp2"
      },
      children: [/*#__PURE__*/_jsxs("svg", {
        role: "progressbar",
        "aria-labelledby": labelId,
        "aria-valuenow": isIndeterminate ? undefined : clampedValue,
        "aria-valuemin": isIndeterminate ? undefined : 0,
        "aria-valuemax": isIndeterminate ? undefined : safeMax,
        "aria-valuetext": isIndeterminate ? undefined : valueText,
        width: diameter,
        height: diameter,
        viewBox: `0 0 ${diameter} ${diameter}`,
        ...{
          0: {
            className: "x1lliihq x9tu13d"
          },
          1: {
            className: "x1lliihq x1ka1v4i x1c74tu6 xy02sl2 x1esw782 xa4qsjk"
          }
        }[!!isIndeterminate << 0],
        children: [/*#__PURE__*/_jsx("circle", {
          ...mergeProps(themeProps('circular-progress-track'), stylex.props(styles.track, trackVariantStyles[trackVariant])),
          cx: center,
          cy: center,
          r: radius,
          strokeWidth: strokeWidth
        }), isIndeterminate ? /*#__PURE__*/_jsx("circle", {
          ...mergeProps(themeProps('circular-progress-fill', {
            variant: fillVariant
          }), stylex.props(styles.fillIndeterminate, variantStyles[fillVariant])),
          cx: center,
          cy: center,
          r: radius,
          strokeWidth: strokeWidth
        }) : /*#__PURE__*/_jsx("circle", {
          ...mergeProps(themeProps('circular-progress-fill', {
            variant: fillVariant
          }), stylex.props(styles.fill, variantStyles[fillVariant])),
          cx: center,
          cy: center,
          r: radius,
          strokeWidth: strokeWidth,
          strokeDasharray: circumference,
          strokeDashoffset: dashoffset
        })]
      }), centerContent != null && /*#__PURE__*/_jsx("div", {
        ...{
          className: "x10l6tqk x10a8y8t x78zum5 x6s0dn4 xl56j7k x47corl"
        },
        children: children != null ? children : /*#__PURE__*/_jsx("span", {
          ...{
            0: {
              className: "x141an7d x1ltkj2j x1sodnla xv1l7n4"
            },
            1: {
              className: "x141an7d x1ltkj2j x1sodnla xnbbluu"
            }
          }[!!isDisabled << 0],
          children: valueText
        })
      })]
    })]
  });
}
CircularProgress.displayName = 'CircularProgress';