// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SankeyGrid.tsx
 * @output Dashed vertical lines at each column + optional column headers
 * @position Visual layer — structural guide behind the flow ribbons
 */

import { useSankey } from "./SankeyContext.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Vertical grid lines at each column position, with optional column headers.
 *
 * Place before SankeyLink so grid renders behind ribbons.
 */
export function SankeyGrid({
  dashArray = '4 4',
  color,
  opacity = 0.3,
  showHeaders = true
}) {
  const {
    columns,
    height,
    nodeWidth
  } = useSankey();
  return /*#__PURE__*/_jsx("g", {
    children: columns.map((col, i) => /*#__PURE__*/_jsxs("g", {
      children: [/*#__PURE__*/_jsx("line", {
        x1: col.x + nodeWidth / 2,
        x2: col.x + nodeWidth / 2,
        y1: 0,
        y2: height,
        stroke: color || 'var(--color-border, #d0d0d8)',
        strokeOpacity: opacity,
        strokeDasharray: dashArray,
        strokeWidth: 1
      }), showHeaders && col.label && /*#__PURE__*/_jsx("text", {
        x: col.x + nodeWidth / 2,
        y: height - 2,
        textAnchor: "middle",
        style: {
          font: '500 10px/1 system-ui',
          fill: 'var(--color-text-secondary, #6e6e80)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        },
        children: col.label
      })]
    }, i))
  });
}
SankeyGrid.displayName = 'SankeyGrid';