// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartGrid.tsx
 * @output Renders horizontal and/or vertical grid lines
 * @position Child of Chart; reads scales from context
 */

import { useMemo } from 'react';
import { useChart } from "./ChartContext.js";
import { isBandScale } from "./utils.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Grid lines behind chart marks.
 *
 * @example
 * ```
 * <ChartGrid horizontal />
 * <ChartGrid horizontal vertical />
 * ```
 */
export function ChartGrid({
  horizontal = true,
  vertical = false
}) {
  const {
    width,
    height,
    xScale,
    yScale
  } = useChart();
  const hLines = useMemo(() => {
    if (!horizontal) {
      return [];
    }
    return yScale.ticks(5).map(tick => yScale(tick));
  }, [horizontal, yScale]);
  const vLines = useMemo(() => {
    if (!vertical) {
      return [];
    }
    if (isBandScale(xScale)) {
      return xScale.domain().map(d => (xScale(d) ?? 0) + xScale.bandwidth() / 2);
    }
    const linear = xScale;
    return linear.ticks(5).map(d => linear(d));
  }, [vertical, xScale]);
  return /*#__PURE__*/_jsxs("g", {
    children: [hLines.map(y => /*#__PURE__*/_jsx("line", {
      x1: 0,
      x2: width,
      y1: y,
      y2: y,
      stroke: "var(--color-border)",
      strokeOpacity: 0.5,
      strokeDasharray: "4 4"
    }, `h-${y}`)), vLines.map(x => /*#__PURE__*/_jsx("line", {
      x1: x,
      x2: x,
      y1: 0,
      y2: height,
      stroke: "var(--color-border)",
      strokeOpacity: 0.5,
      strokeDasharray: "4 4"
    }, `v-${x}`))]
  });
}