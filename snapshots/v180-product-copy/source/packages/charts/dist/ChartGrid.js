// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartGrid.tsx (v2)
 * @input Chart context scales and dimensions, guide visibility, and tick density
 * @output Grid lines behind chart marks
 * @position Child of Chart v2; reads scales from chart context
 */

import { useMemo } from 'react';
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import { useChart } from "./ChartContext.js";
import { isBandScale } from "./utils.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Grid lines behind chart marks.
 *
 * Pair with `<ChartAxis>` so users always see an axis line beside the
 * grid — the components are designed to be used together.
 *
 * @example
 * ```
 * <ChartGrid />                 // horizontal grid lines (default)
 * <ChartGrid horizontal vertical />
 * ```
 */
export function ChartGrid({
  horizontal = true,
  vertical = false,
  tickCount = 5
}) {
  const {
    width,
    height,
    xScale,
    yScale
  } = useChart();

  // Sanitize the tick count before it reaches d3's `.ticks()`: it targets ~N
  // ticks and allocates an array that large, so a huge N throws `RangeError:
  // Invalid array length` and crashes the render, while a non-finite or
  // negative N would misbehave. Clamp to a sane integer (0 still means "no
  // lines") and fall back to the default for invalid input.
  const safeTickCount = Number.isFinite(tickCount) && tickCount >= 0 ? Math.min(Math.floor(tickCount), 1000) : 5;

  // Skip the y=0 line when emphasizing it via the axis. Without this we'd
  // double-draw on top of the axis line. Each line carries its tick `value`,
  // used as a stable React key — the pixel position can be NaN/duplicated for
  // degenerate (zero-range / unmeasured) scales and would collide as a key.
  const hLines = useMemo(() => {
    if (!horizontal) {
      return [];
    }
    return yScale.ticks(safeTickCount).filter(tick => tick !== 0).map(tick => ({
      value: tick,
      pos: yScale(tick)
    }));
  }, [horizontal, yScale, safeTickCount]);
  const vLines = useMemo(() => {
    if (!vertical) {
      return [];
    }
    if (isBandScale(xScale)) {
      return xScale.domain().map(d => ({
        value: d,
        pos: (xScale(d) ?? 0) + xScale.bandwidth() / 2
      }));
    }
    const linear = xScale;
    return linear.ticks(safeTickCount).map(d => ({
      value: String(d),
      pos: linear(d)
    }));
  }, [vertical, xScale, safeTickCount]);
  return /*#__PURE__*/_jsxs("g", {
    children: [hLines.map(({
      value,
      pos
    }) => /*#__PURE__*/_jsx("line", {
      x1: 0,
      x2: width,
      y1: pos,
      y2: pos,
      ...{
        className: "x113i6qz xnpr05h"
      }
    }, `h-${value}`)), vLines.map(({
      value,
      pos
    }) => /*#__PURE__*/_jsx("line", {
      x1: pos,
      x2: pos,
      y1: 0,
      y2: height,
      ...{
        className: "x113i6qz xnpr05h"
      }
    }, `v-${value}`))]
  });
}