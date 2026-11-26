// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SankeyLink.tsx
 * @output Renders flow ribbons with configurable color modes
 * @position Visual layer — the colorful flowing areas between nodes
 *
 * Color modes: flat CSS string, 'source', 'target', 'gradient',
 * or {gradient: bias} for leaned transitions.
 */

import { useSankey } from "./SankeyContext.js";

/**
 * Link color mode:
 * - `'gradient'` — even transition from source to target color
 * - `'source'` — each link uses its source node's color
 * - `'target'` — each link uses its target node's color
 * - `{gradient: number}` — biased gradient (0–1). 0.2 = source-leaned, 0.8 = target-leaned
 * - `string` — any CSS color for flat uniform fill
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function oklch(c, alpha) {
  return `oklch(${c[0]} ${c[1]} ${c[2]} / ${alpha})`;
}
function resolveColor(color) {
  if (typeof color === 'object' && 'gradient' in color) {
    return {
      type: 'gradient',
      bias: color.gradient
    };
  }
  if (color === 'gradient') {
    return {
      type: 'gradient',
      bias: 0.5
    };
  }
  if (color === 'source') {
    return {
      type: 'source'
    };
  }
  if (color === 'target') {
    return {
      type: 'target'
    };
  }
  return {
    type: 'flat',
    value: color
  };
}

/**
 * Renders all link ribbons in the Sankey chart.
 *
 * Place before SankeyNode so nodes render on top.
 */
export function SankeyLink({
  color = 'gradient',
  opacity = 0.7,
  tension = 0.5
}) {
  const {
    links
  } = useSankey();
  const mode = resolveColor(color);
  return /*#__PURE__*/_jsxs("g", {
    children: [mode.type === 'gradient' && /*#__PURE__*/_jsx("defs", {
      children: links.map((link, i) => /*#__PURE__*/_jsx(GradientDef, {
        index: i,
        link: link,
        opacity: opacity,
        bias: mode.bias
      }, i))
    }), links.map((link, i) => {
      const sx = link.source.x + link.source.width;
      const tx = link.target.x;
      const sy = link.sourceY;
      const ty = link.targetY;
      const lh = link.height;
      const dx = (tx - sx) * tension;
      const d = [`M${sx},${sy}`, `C${sx + dx},${sy} ${tx - dx},${ty} ${tx},${ty}`, `L${tx},${ty + lh}`, `C${tx - dx},${ty + lh} ${sx + dx},${sy + lh} ${sx},${sy + lh}`, 'Z'].join(' ');
      let fill;
      let pathOpacity;
      if (mode.type === 'flat') {
        fill = mode.value;
        pathOpacity = opacity;
      } else if (mode.type === 'source') {
        fill = oklch(link.source.color, opacity);
      } else if (mode.type === 'target') {
        fill = oklch(link.target.color, opacity);
      } else {
        fill = `url(#astryx-sankey-grad-${i})`;
      }
      return /*#__PURE__*/_jsx("path", {
        d: d,
        fill: fill,
        opacity: pathOpacity
      }, i);
    })]
  });
}

/** Gradient definition with bias-adjusted stops */
function GradientDef({
  index,
  link,
  opacity,
  bias
}) {
  const sx = link.source.x + link.source.width;
  const tx = link.target.x;
  const s1 = Math.max(0, bias - 0.15);
  const s2 = Math.min(1, bias + 0.15);
  return /*#__PURE__*/_jsxs("linearGradient", {
    id: `astryx-sankey-grad-${index}`,
    x1: sx,
    x2: tx,
    y1: 0,
    y2: 0,
    gradientUnits: "userSpaceOnUse",
    children: [/*#__PURE__*/_jsx("stop", {
      offset: "0%",
      stopColor: oklch(link.source.color, opacity)
    }), /*#__PURE__*/_jsx("stop", {
      offset: `${s1 * 100}%`,
      stopColor: oklch(link.source.color, opacity * 0.9)
    }), /*#__PURE__*/_jsx("stop", {
      offset: `${s2 * 100}%`,
      stopColor: oklch(link.target.color, opacity * 0.9)
    }), /*#__PURE__*/_jsx("stop", {
      offset: "100%",
      stopColor: oklch(link.target.color, opacity)
    })]
  });
}
SankeyLink.displayName = 'SankeyLink';