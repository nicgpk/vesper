// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThreeDScatter.tsx
 * @output 3D scatter plot — projected circles with depth-based sizing/opacity
 */

import { useMemo } from 'react';
import { use3D } from "./ThreeDContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
export function ThreeDScatter({
  color,
  radius = 4,
  opacity = 0.85
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
  const points = useMemo(() => {
    return data.map((d, i) => {
      const nx = normalize(d[xKey], xDomain);
      const ny = normalize(d[yKey], yDomain);
      const nz = normalize(d[zKey], zDomain);
      const {
        px,
        py,
        depth
      } = project(nx, ny, nz);
      return {
        px,
        py,
        depth,
        index: i
      };
    }).sort((a, b) => a.depth - b.depth); // painter's algorithm
  }, [data, xKey, yKey, zKey, project, xDomain, yDomain, zDomain, normalize]);
  return /*#__PURE__*/_jsx("g", {
    children: points.map(p => {
      const depthFactor = 0.75 + (p.depth + 0.5) * 0.25; // 0.5-1.0
      return /*#__PURE__*/_jsx("circle", {
        cx: p.px,
        cy: p.py,
        r: radius * depthFactor,
        fill: color,
        fillOpacity: opacity * depthFactor
      }, p.index);
    })
  });
}