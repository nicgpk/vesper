// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/referenceLine.tsx
 * @output Horizontal or vertical reference line/band annotation. Labels are
 *   clamped to stay fully inside the plot (which is clipped) for both
 *   orientations, and non-finite y/x values render nothing.
 */

import { isBandScale } from "../utils.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Badge dimensions — matches crosshair label style.
const BADGE_H = 14;
const BADGE_RX = 3;
const LABEL_FONT_SIZE = 10;
// Rough per-glyph advance + horizontal padding for width estimation.
const LABEL_CHAR_W = 6.5;
const LABEL_PAD = 12;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));

/** Estimated badge width for a label (0 when there's no label). */
function labelWidth(label) {
  return label ? label.length * LABEL_CHAR_W + LABEL_PAD : 0;
}

/**
 * The label badge, positioned by its top-left corner so callers can clamp it
 * into the plot uniformly regardless of orientation.
 */
function ReferenceLabel({
  x,
  topY,
  width,
  color,
  text
}) {
  return /*#__PURE__*/_jsxs("g", {
    transform: `translate(${x},${topY})`,
    pointerEvents: "none",
    children: [/*#__PURE__*/_jsx("rect", {
      x: 0,
      y: 0,
      width: width,
      height: BADGE_H,
      rx: BADGE_RX,
      fill: "var(--color-background-popover)",
      fillOpacity: 0.85,
      stroke: color,
      strokeWidth: 0.5
    }), /*#__PURE__*/_jsx("text", {
      x: width / 2,
      y: BADGE_H / 2,
      dy: "0.35em",
      textAnchor: "middle",
      fontSize: LABEL_FONT_SIZE,
      fontWeight: 500,
      fill: color,
      children: text
    })]
  });
}

/**
 * Reference line or band annotation. Not a data series — renders at fixed values.
 *
 * @example
 * ```
 * series={[line('revenue'), referenceLine({y: 100, label: 'Target'})]}
 * ```
 */
export function referenceLine(options) {
  const color = options.color ?? 'var(--color-border-emphasized)';
  const strokeWidth = options.strokeWidth ?? 1;
  const strokeDasharray = options.strokeDasharray ?? '6 3';
  const label = options.label;
  const labelPosition = options.labelPosition ?? 'end';
  const bandOpacity = options.bandOpacity ?? 0.1;
  const textW = labelWidth(label);
  return {
    type: 'referenceLine',
    key: `ref-${options.y ?? options.x ?? 'none'}`,
    dataKeys: [],
    layout: {},
    // No data points to resolve — this is a fixed annotation
    resolve() {
      return [];
    },
    render(_resolved, ctx) {
      const {
        width,
        height,
        xScale,
        yScale
      } = ctx;
      // Keep the badge fully inside the (clipped) plot on both axes.
      const bxMax = width - textW - 2;

      // Horizontal reference line or band
      if (options.y != null) {
        if (!Number.isFinite(options.y)) {
          return null;
        }
        const py = yScale(options.y);
        if (!Number.isFinite(py)) {
          return null;
        }
        const desiredBx = labelPosition === 'end' ? bxMax : 2;
        const bx = clamp(desiredBx, 2, bxMax);
        const labelTopY = clamp(py - BADGE_H / 2, 0, height - BADGE_H);

        // Band mode: shaded region between y and y2
        if (options.y2 != null && Number.isFinite(options.y2)) {
          const py2 = yScale(options.y2);
          const top = Math.min(py, py2);
          const bandHeight = Math.abs(py2 - py);
          return /*#__PURE__*/_jsxs("g", {
            children: [/*#__PURE__*/_jsx("rect", {
              x: 0,
              y: top,
              width: width,
              height: bandHeight,
              fill: color,
              opacity: bandOpacity
            }), /*#__PURE__*/_jsx("line", {
              x1: 0,
              x2: width,
              y1: py,
              y2: py,
              stroke: color,
              strokeWidth: strokeWidth,
              strokeDasharray: strokeDasharray
            }), /*#__PURE__*/_jsx("line", {
              x1: 0,
              x2: width,
              y1: py2,
              y2: py2,
              stroke: color,
              strokeWidth: strokeWidth,
              strokeDasharray: strokeDasharray
            }), label && /*#__PURE__*/_jsx(ReferenceLabel, {
              x: bx,
              topY: labelTopY,
              width: textW,
              color: color,
              text: label
            })]
          });
        }

        // Single horizontal line
        return /*#__PURE__*/_jsxs("g", {
          children: [/*#__PURE__*/_jsx("line", {
            x1: 0,
            x2: width,
            y1: py,
            y2: py,
            stroke: color,
            strokeWidth: strokeWidth,
            strokeDasharray: strokeDasharray
          }), label && /*#__PURE__*/_jsx(ReferenceLabel, {
            x: bx,
            topY: labelTopY,
            width: textW,
            color: color,
            text: label
          })]
        });
      }

      // Vertical reference line (linear x only — a band scale has no pixel
      // position for an arbitrary numeric x).
      if (options.x != null && !isBandScale(xScale)) {
        if (!Number.isFinite(options.x)) {
          return null;
        }
        const px = xScale(options.x);
        if (!Number.isFinite(px)) {
          return null;
        }
        const desiredTopY = labelPosition === 'end' ? 4 : height - BADGE_H - 4;
        const labelTopY = clamp(desiredTopY, 0, height - BADGE_H);
        const bx = clamp(px - textW / 2, 2, bxMax);
        return /*#__PURE__*/_jsxs("g", {
          children: [/*#__PURE__*/_jsx("line", {
            x1: px,
            x2: px,
            y1: 0,
            y2: height,
            stroke: color,
            strokeWidth: strokeWidth,
            strokeDasharray: strokeDasharray
          }), label && /*#__PURE__*/_jsx(ReferenceLabel, {
            x: bx,
            topY: labelTopY,
            width: textW,
            color: color,
            text: label
          })]
        });
      }
      return null;
    }
  };
}