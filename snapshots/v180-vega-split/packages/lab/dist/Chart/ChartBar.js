// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartBar.tsx
 * @output Renders vertical bars for a data key
 * @position Child of Chart; reads scales from context
 */

import { useChart } from "./ChartContext.js";
import { isBandScale } from "./utils.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Bar marks. Requires a band xScale (categorical x-axis).
 * Bars grow from the zero line — handles both positive and negative values.
 *
 * @example
 * ```
 * <ChartBar dataKey="revenue" color={useChartColors().categorical(1)[0]} />
 * ```
 */
export function ChartBar({
  dataKey,
  color,
  radius = 4
}) {
  const {
    data,
    xKey,
    xScale,
    yScale
  } = useChart();
  if (!isBandScale(xScale)) {
    return null;
  }

  // Zero line position — bars grow from here
  const zeroY = yScale(0);
  return /*#__PURE__*/_jsx("g", {
    children: data.map((d, i) => {
      const xVal = xScale(String(d[xKey]));
      if (xVal == null) {
        return null;
      }
      const yVal = typeof d[dataKey] === 'number' ? d[dataKey] : 0;
      const yPos = yScale(yVal);

      // Bar grows from zero line toward the value
      const barY = Math.min(yPos, zeroY);
      const barHeight = Math.abs(yPos - zeroY);
      return /*#__PURE__*/_jsx("rect", {
        x: xVal,
        y: barY,
        width: xScale.bandwidth(),
        height: Math.max(0, barHeight),
        fill: color,
        rx: radius,
        ry: radius
      }, i);
    })
  });
}