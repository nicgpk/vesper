// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThreeDSurface.tsx
 * @output 3D surface mesh — projected triangulated grid with color mapping
 */

import { useMemo } from 'react';
import { use3D } from "./ThreeDContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
function lerpColor(colors, t) {
  const clamped = Math.max(0, Math.min(1, t));
  if (colors.length === 1) {
    return colors[0];
  }
  const scaled = clamped * (colors.length - 1);
  const lo = Math.floor(scaled);
  const hi = Math.min(lo + 1, colors.length - 1);
  // Simple: just return the nearest
  return scaled - lo < 0.5 ? colors[lo] : colors[hi];
}

/**
 * 3D surface mesh. Data should be a grid of points with x, y (height), z.
 * Points are triangulated in order and colored by y-value.
 */
export function ThreeDSurface({
  colorRange,
  opacity = 0.8,
  wireframe = false
}) {
  const {
    data,
    xKey,
    yKey,
    zKey,
    project,
    xDomain,
    yDomain,
    zDomain,
    normalize
  } = use3D();
  const faces = useMemo(() => {
    // Detect grid dimensions from unique x and z values
    const xVals = [...new Set(data.map(d => d[xKey]))].sort((a, b) => a - b);
    const zVals = [...new Set(data.map(d => d[zKey]))].sort((a, b) => a - b);
    const cols = xVals.length;
    const rows = zVals.length;
    if (cols < 2 || rows < 2) {
      return [];
    }

    // Build lookup grid
    const grid = new Map();
    for (const d of data) {
      grid.set(`${d[xKey]},${d[zKey]}`, d);
    }
    const result = [];
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const corners = [grid.get(`${xVals[c]},${zVals[r]}`), grid.get(`${xVals[c + 1]},${zVals[r]}`), grid.get(`${xVals[c + 1]},${zVals[r + 1]}`), grid.get(`${xVals[c]},${zVals[r + 1]}`)];
        if (corners.some(c => !c)) {
          continue;
        }
        const validCorners = corners.filter(c => c != null);
        const projected = validCorners.map(d => {
          const nx = normalize(d[xKey], xDomain);
          const ny = normalize(d[yKey], yDomain);
          const nz = normalize(d[zKey], zDomain);
          return {
            ...project(nx, ny, nz),
            ny
          };
        });
        const avgY = projected.reduce((s, p) => s + p.ny, 0) / 4;
        const avgDepth = projected.reduce((s, p) => s + p.depth, 0) / 4;
        const color = lerpColor(colorRange, avgY);
        result.push({
          points: projected.map(p => `${p.px},${p.py}`).join(' '),
          color,
          depth: avgDepth
        });
      }
    }
    return result.sort((a, b) => a.depth - b.depth);
  }, [data, xKey, yKey, zKey, project, xDomain, yDomain, zDomain, normalize, colorRange]);
  return /*#__PURE__*/_jsx("g", {
    children: faces.map((f, i) => /*#__PURE__*/_jsx("polygon", {
      points: f.points,
      fill: wireframe ? 'none' : f.color,
      fillOpacity: opacity,
      stroke: wireframe ? f.color : f.color,
      strokeWidth: wireframe ? 1 : 0.5,
      strokeOpacity: wireframe ? 0.8 : 0.3
    }, i))
  });
}