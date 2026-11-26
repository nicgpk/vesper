// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartDot.tsx
 * @output Renders scatter dots for a data key
 * @position Child of Chart; reads scales from context
 */

import { useChart } from "./ChartContext.js";
import { xPixel } from "./utils.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Scatter dot marks.
 *
 * @example
 * ```
 * <ChartDot dataKey="outliers" color={useChartColors().categorical(3)[2]} />
 * ```
 */
export function ChartDot({
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
  return /*#__PURE__*/_jsx("g", {
    children: data.map((d, i) => {
      const x = xPixel(d, xKey, xScale);
      const yVal = typeof d[dataKey] === 'number' ? d[dataKey] : 0;
      return /*#__PURE__*/_jsx("circle", {
        cx: x,
        cy: yScale(yVal),
        r: radius,
        fill: color
      }, i);
    })
  });
}