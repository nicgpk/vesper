// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartErrorBar.tsx
 * @output Renders error bars (whiskers) at each data point
 * @position Child of Chart; reads scales from context
 */

import { useChart } from "./ChartContext.js";
import { xPixel } from "./utils.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Error bars with whisker caps. Pair with ChartBar or ChartDot.
 *
 * @example
 * ```
 * <ChartBar dataKey="mean" color={colors[0]} />
 * <ChartErrorBar yUpper="upper95" yLower="lower95" />
 * ```
 */
export function ChartErrorBar({
  yUpper,
  yLower,
  color = 'var(--color-text-primary)',
  strokeWidth = 1.5,
  capWidth = 8
}) {
  const {
    data,
    xKey,
    xScale,
    yScale
  } = useChart();
  return /*#__PURE__*/_jsx("g", {
    children: data.map((d, i) => {
      const x = xPixel(d, xKey, xScale);
      const upper = typeof d[yUpper] === 'number' ? d[yUpper] : 0;
      const lower = typeof d[yLower] === 'number' ? d[yLower] : 0;
      const yTop = yScale(upper);
      const yBot = yScale(lower);
      const half = capWidth / 2;
      return /*#__PURE__*/_jsxs("g", {
        children: [/*#__PURE__*/_jsx("line", {
          x1: x,
          x2: x,
          y1: yTop,
          y2: yBot,
          stroke: color,
          strokeWidth: strokeWidth
        }), /*#__PURE__*/_jsx("line", {
          x1: x - half,
          x2: x + half,
          y1: yTop,
          y2: yTop,
          stroke: color,
          strokeWidth: strokeWidth
        }), /*#__PURE__*/_jsx("line", {
          x1: x - half,
          x2: x + half,
          y1: yBot,
          y2: yBot,
          stroke: color,
          strokeWidth: strokeWidth
        })]
      }, i);
    })
  });
}