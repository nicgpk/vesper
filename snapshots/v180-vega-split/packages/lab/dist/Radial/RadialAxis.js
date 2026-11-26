// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadialAxis.tsx
 * @output Renders axis labels at each spider vertex
 */

import { useRadial } from "./RadialContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Axis labels positioned at each spider chart vertex.
 *
 * @example
 * ```
 * <RadialAxis />
 * ```
 */
export function RadialAxis({
  labelOffset = 16
}) {
  const {
    cx,
    cy,
    radius,
    axes,
    angleByAxis
  } = useRadial();
  if (!axes || !angleByAxis) {
    return null;
  }
  return /*#__PURE__*/_jsx("g", {
    children: axes.map(key => {
      const angle = angleByAxis.get(key);
      if (angle == null) {
        return null;
      }
      const x = cx + Math.cos(angle) * (radius + labelOffset);
      const y = cy + Math.sin(angle) * (radius + labelOffset);

      // Determine text anchor based on position
      const isRight = Math.cos(angle) > 0.1;
      const isLeft = Math.cos(angle) < -0.1;
      const anchor = isRight ? 'start' : isLeft ? 'end' : 'middle';
      return /*#__PURE__*/_jsx("text", {
        x: x,
        y: y,
        textAnchor: anchor,
        dominantBaseline: "central",
        fill: "var(--color-text-secondary)",
        fontSize: 12,
        children: key
      }, key);
    })
  });
}