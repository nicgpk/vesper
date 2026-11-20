// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/bar.tsx
 * @output Bar series — self-contained resolve + render
 * @position Standalone mark; chart root calls resolve() then render()
 *
 * Robust to missing/NaN values (bars with no finite height are skipped rather
 * than drawn at the baseline) and to degenerate bandwidths (grouped bar widths
 * are clamped to a non-negative value). Negative values grow downward from zero.
 */

import { pointFill } from "../markColor.js";
import { jsx as _jsx } from "react/jsx-runtime";
/** Clamp a user opacity into [0,1], falling back when it isn't a finite number. */
function clampOpacity(value, fallback) {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(1, Math.max(0, n));
}

/** Coerce a user length (radius/width) to a finite, non-negative number. */
function nonNegative(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

/** True when every coordinate is finite — a NaN/Infinity would corrupt the path. */
function rectIsFinite(x, y, w, h) {
  return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h);
}

/**
 * Build an SVG path for a rectangle with only the top corners rounded.
 * When `r` is 0, produces a simple rect path with no curves. Returns an empty
 * path (draws nothing) if any coordinate is non-finite.
 */
function roundedTopRect(x, y, w, h, r) {
  if (!rectIsFinite(x, y, w, h)) {
    return '';
  }
  // Clamp radius to half the smaller dimension
  const cr = Math.min(r, w / 2, h / 2);
  if (!(cr > 0)) {
    return `M${x},${y + h}V${y}H${x + w}V${y + h}Z`;
  }
  return `M${x},${y + h}` + `V${y + cr}Q${x},${y} ${x + cr},${y}` + `H${x + w - cr}Q${x + w},${y} ${x + w},${y + cr}` + `V${y + h}Z`;
}

/**
 * Build an SVG path for a rectangle with only the bottom corners rounded.
 * Returns an empty path if any coordinate is non-finite.
 */
function roundedBottomRect(x, y, w, h, r) {
  if (!rectIsFinite(x, y, w, h)) {
    return '';
  }
  const cr = Math.min(r, w / 2, h / 2);
  if (!(cr > 0)) {
    return `M${x},${y}V${y + h}H${x + w}V${y}Z`;
  }
  return `M${x},${y}` + `V${y + h - cr}Q${x},${y + h} ${x + cr},${y + h}` + `H${x + w - cr}Q${x + w},${y + h} ${x + w},${y + h - cr}` + `V${y}Z`;
}
export function bar(dataKey, options = {}) {
  const color = options.color;
  const opacity = clampOpacity(options.opacity, 1);
  const radius = nonNegative(options.radius, 4);
  let barWidth = 0;
  let barOffset = 0;
  const seriesDef = {
    type: 'bar',
    key: dataKey,
    dataKeys: [dataKey],
    color: typeof color === 'string' ? color : undefined,
    label: options.label ?? dataKey,
    layout: {
      stack: options.stack,
      group: options.group,
      includeZero: true
    },
    resolve(ctx, stackOffsets, groupInfo) {
      const {
        data,
        xKey,
        xScale,
        yScale
      } = ctx;
      if (!('bandwidth' in xScale)) {
        return [];
      }
      const bandScale = xScale;
      const bw = bandScale.bandwidth();
      if (groupInfo && groupInfo.count > 0) {
        const gutter = bw * 0.05;
        const totalGutters = gutter * (groupInfo.count - 1);
        // Clamp: with many groups in a narrow band, gutters can exceed the band
        // and drive the raw width negative — a negative width mirrors the path.
        barWidth = Math.max(0, (bw - totalGutters) / groupInfo.count);
        barOffset = groupInfo.index * (barWidth + gutter);
      } else {
        barWidth = bw;
        barOffset = 0;
      }
      const points = [];
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        // Unknown categories aren't in the band domain → NaN px so render skips
        // them rather than stacking phantom bars at the origin.
        const xBase = bandScale(String(d[xKey]));
        const px = xBase == null ? NaN : xBase + barOffset + barWidth / 2;
        let py;
        let py0;
        if (stackOffsets) {
          const offset = stackOffsets[i];
          py = offset ? yScale(offset.y1) : NaN;
          py0 = offset ? yScale(offset.y0) : NaN;
        } else {
          const raw = d[dataKey];
          const v = typeof raw === 'number' && Number.isFinite(raw) ? raw : NaN;
          py = yScale(v);
          py0 = yScale(0);
        }
        points.push({
          px,
          py,
          py0,
          dataIndex: i
        });
      }
      return points;
    },
    render(resolved, ctx) {
      const {
        data
      } = ctx;
      const isTop = seriesDef._isTopOfStack !== false;
      const r = isTop ? radius : 0;
      if (!(barWidth > 0)) {
        return null;
      }
      return /*#__PURE__*/_jsx("g", {
        opacity: opacity,
        children: resolved.map(p => {
          const d = data[p.dataIndex];
          if (!d || !Number.isFinite(p.px) || !Number.isFinite(p.py) || !Number.isFinite(p.py0)) {
            return null;
          }
          const fill = pointFill(seriesDef, color, d, p.dataIndex);
          const x = p.px - barWidth / 2;
          const y = Math.min(p.py, p.py0);
          const h = Math.max(0, Math.abs(p.py0 - p.py));
          const growsUp = p.py <= p.py0;
          const d_attr = growsUp ? roundedTopRect(x, y, barWidth, h, r) : roundedBottomRect(x, y, barWidth, h, r);
          return /*#__PURE__*/_jsx("path", {
            d: d_attr,
            fill: fill
          }, p.dataIndex);
        })
      });
    }
  };
  return seriesDef;
}