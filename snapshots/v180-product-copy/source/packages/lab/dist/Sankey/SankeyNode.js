// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SankeyNode.tsx
 * @output Renders node indicators with optional glow
 * @position Visual layer — node bars that labels sit on
 *
 * Reads nodeColor from chart context. When set, all nodes use that color.
 * Otherwise, uses each node's individual oklch color from data.
 */

import { useSankey } from "./SankeyContext.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function oklch(c, alpha) {
  return `oklch(${c[0]} ${c[1]} ${c[2]} / ${alpha})`;
}

/**
 * Renders all node indicators in the Sankey chart.
 *
 * Color comes from the chart's `nodeColor` prop (global override)
 * or each node's individual color from data.
 */
export function SankeyNode({
  glow = true
}) {
  const {
    nodes,
    nodeColor
  } = useSankey();
  return /*#__PURE__*/_jsx("g", {
    children: nodes.map(node => {
      const fill = nodeColor || oklch(node.color, 0.9);
      const glowFill = nodeColor || oklch(node.color, 0.12);
      return /*#__PURE__*/_jsxs("g", {
        children: [glow && /*#__PURE__*/_jsx("rect", {
          x: node.x - 3,
          y: node.y - 1,
          width: node.width + 6,
          height: node.height + 2,
          rx: 4,
          fill: glowFill,
          opacity: nodeColor ? 0.12 : 1
        }), /*#__PURE__*/_jsx("rect", {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
          rx: 1.5,
          fill: fill
        })]
      }, node.id);
    })
  });
}
SankeyNode.displayName = 'SankeyNode';