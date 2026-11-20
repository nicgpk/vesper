// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartArea.tsx
 * @output Renders a filled area between two y-bounds — confidence intervals, bands, ranges
 * @position Child of Chart; reads scales from context
 */

import { useMemo } from 'react';
import { area, curveMonotoneX } from 'd3-shape';
import { useChart } from "./ChartContext.js";
import { xPixel } from "./utils.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Area band between two y-values. Use for confidence intervals, error ranges,
 * or any min/max band around a line.
 *
 * @example
 * ```
 * <ChartArea yUpper="upper95" yLower="lower95" color={colors[0]} />
 * <ChartArea yUpper="upper95" baseline="mean" color={colors[0]} />
 * ```
 */
export function ChartArea({
  yUpper,
  yLower,
  baseline,
  color,
  opacity = 0.2,
  stroke = false,
  strokeWidth = 1
}) {
  const {
    data,
    xKey,
    xScale,
    yScale
  } = useChart();
  const upperKey = yUpper ?? baseline;
  const lowerKey = yLower ?? baseline;
  const pathD = useMemo(() => {
    if (!upperKey || !lowerKey) {
      return '';
    }
    const generator = area().x(d => xPixel(d, xKey, xScale)).y0(d => {
      const v = typeof d[lowerKey] === 'number' ? d[lowerKey] : 0;
      return yScale(v);
    }).y1(d => {
      const v = typeof d[upperKey] === 'number' ? d[upperKey] : 0;
      return yScale(v);
    }).curve(curveMonotoneX);
    return generator(data) ?? '';
  }, [data, xKey, xScale, yScale, upperKey, lowerKey]);
  if (!pathD) {
    return null;
  }
  return /*#__PURE__*/_jsxs("g", {
    children: [/*#__PURE__*/_jsx("path", {
      d: pathD,
      fill: color,
      fillOpacity: opacity,
      stroke: "none"
    }), stroke && /*#__PURE__*/_jsx("path", {
      d: pathD,
      fill: "none",
      stroke: color,
      strokeWidth: strokeWidth,
      strokeOpacity: opacity * 2
    })]
  });
}