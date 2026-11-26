// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/line.tsx
 * @output Line series — self-contained resolve + render
 *
 * Missing / non-finite values become gaps (via d3's `.defined()`) instead of a
 * misleading drop to the baseline, and per-point dots are only drawn where the
 * point is finite.
 */

import { line as d3Line, curveLinear, curveMonotoneX, curveNatural, curveStep } from 'd3-shape';
import { seriesFill } from "../markColor.js";
import { xPixel } from "../utils.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const CURVES = {
  linear: curveLinear,
  monotone: curveMonotoneX,
  natural: curveNatural,
  step: curveStep
};
/** A point is drawable only when both of its plotted coordinates are finite. */
function isFinitePoint(p) {
  return Number.isFinite(p.px) && Number.isFinite(p.py);
}
export function line(dataKey, options = {}) {
  const color = options.color;
  const curve = options.curve ?? 'monotone';
  const strokeWidth = typeof options.strokeWidth === 'number' && Number.isFinite(options.strokeWidth) ? Math.max(0, options.strokeWidth) : 2;
  const dots = options.dots ?? false;
  const seriesDef = {
    type: 'line',
    key: dataKey,
    dataKeys: [dataKey],
    color,
    label: options.label ?? dataKey,
    layout: {},
    resolve(ctx) {
      const {
        data,
        xKey,
        xScale,
        yScale
      } = ctx;
      const points = [];
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const raw = d[dataKey];
        const v = typeof raw === 'number' && Number.isFinite(raw) ? raw : NaN;
        points.push({
          px: xPixel(d, xKey, xScale),
          py: yScale(v),
          py0: yScale(0),
          dataIndex: i
        });
      }
      return points;
    },
    render(resolved) {
      if (resolved.length === 0) {
        return null;
      }
      const curveFactory = CURVES[curve] ?? curveMonotoneX;
      const pathGen = d3Line().defined(isFinitePoint).x(d => d.px).y(d => d.py).curve(curveFactory);
      const pathD = pathGen(resolved) ?? '';
      const strokeColor = seriesFill(seriesDef, color);
      return /*#__PURE__*/_jsxs("g", {
        children: [/*#__PURE__*/_jsx("path", {
          d: pathD,
          fill: "none",
          stroke: strokeColor,
          strokeWidth: strokeWidth
        }), dots && resolved.filter(isFinitePoint).map(p => /*#__PURE__*/_jsx("circle", {
          cx: p.px,
          cy: p.py,
          r: 3,
          fill: strokeColor
        }, p.dataIndex))]
      });
    }
  };
  return seriesDef;
}