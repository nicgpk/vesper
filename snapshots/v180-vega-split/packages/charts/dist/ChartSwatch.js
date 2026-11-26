// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartSwatch.tsx
 * @input Caller-owned CSS color and optional square or line shape
 * @output Color swatch primitive for legends, tooltips, and standalone use
 * @position Composable primitive — used by ChartLegend and ChartTooltip, or
 *           independently anywhere a series indicator is needed.
 *
 * @example
 * ```
 * <ChartSwatch color="#3b82f6" variant="square" />
 * <ChartSwatch color="#f59e0b" variant="line" />
 * ```
 */

import { memo } from 'react';
import * as stylex from '@stylexjs/stylex';

/**
 * Visual variant — drives shape.
 * - `'square'` — square chip (bar series)
 * - `'line'` — short stroke (line, dot, area, and other non-bar series)
 */
import { jsx as _jsx } from "react/jsx-runtime";
const styles = {
  base: {
    kmuXW: "x2lah0s",
    $$css: true
  },
  square: {
    kzqmXN: "x1xc55vz",
    kZKoxP: "xdk7pt",
    kaIpWk: "x1cum3z5",
    kUOVxO: "xckhbgb",
    $$css: true
  },
  line: {
    kzqmXN: "x1fsd2vl",
    kZKoxP: "xuoj239",
    kaIpWk: "xbvija",
    $$css: true
  },
  fill: color => [{
    kWkggS: color != null ? "xl8spv7" : color,
    $$css: true
  }, {
    "--x-backgroundColor": color != null ? color : undefined
  }]
};

/**
 * Color swatch primitive.
 *
 * Used by ChartLegend (and ChartTooltip) to render the colored
 * indicator next to a series label. Exported as a primitive so consumers
 * can build their own custom legend/tooltip layouts while keeping visuals
 * consistent.
 */
function ChartSwatchImpl({
  color,
  variant = 'square'
}) {
  return /*#__PURE__*/_jsx("div", {
    "aria-hidden": true,
    ...stylex.props(styles.base, styles[variant], styles.fill(color))
  });
}

/**
 * Memoized — swatches are static for a given (color, variant) tuple
 * and can render many times in a tooltip/legend with several series.
 */
export const ChartSwatch = /*#__PURE__*/memo(ChartSwatchImpl);

/**
 * Map a SeriesDef.type string to its swatch variant.
 *
 * Bar series get a square chip; everything else (line, dot, area, and any
 * other non-bar mark) gets a short stroke. Centralized so legend, tooltip,
 * and any custom chrome stay consistent.
 */
export function swatchVariantForType(type) {
  return type === 'bar' ? 'square' : 'line';
}