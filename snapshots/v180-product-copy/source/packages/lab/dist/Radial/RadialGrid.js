// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadialGrid.tsx
 * @output Renders concentric grid rings and axis lines for spider charts
 */

import { useRadial } from "./RadialContext.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Concentric grid rings and axis lines for spider charts.
 *
 * @example
 * ```
 * <RadialGrid rings={5} />
 * ```
 */
export function RadialGrid({
  rings = 5
}) {
  const {
    cx,
    cy,
    radius,
    innerRadius,
    axes,
    angleByAxis,
    radiusScale
  } = useRadial();
  if (!axes || !angleByAxis || !radiusScale) {
    return null;
  }
  return /*#__PURE__*/_jsxs("g", {
    children: [Array.from({
      length: rings
    }, (_, i) => {
      const t = (i + 1) / rings;
      const r = radiusScale(t);
      // Draw polygon ring connecting points at this radius
      const points = axes.map(key => {
        const angle = angleByAxis.get(key);
        if (angle == null) {
          return '';
        }
        return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
      }).filter(Boolean).join(' ');
      return /*#__PURE__*/_jsx("polygon", {
        points: points,
        fill: "none",
        stroke: "var(--color-border)",
        strokeOpacity: 0.3,
        strokeWidth: 1
      }, i);
    }), axes.map(key => {
      const angle = angleByAxis.get(key);
      if (angle == null) {
        return null;
      }
      return /*#__PURE__*/_jsx("line", {
        x1: cx + Math.cos(angle) * innerRadius,
        y1: cy + Math.sin(angle) * innerRadius,
        x2: cx + Math.cos(angle) * radius,
        y2: cy + Math.sin(angle) * radius,
        stroke: "var(--color-border)",
        strokeOpacity: 0.3,
        strokeWidth: 1
      }, key);
    })]
  });
}