// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartSelect.tsx
 * @output Click/tap to select data points. Pointer events.
 */

import { useCallback } from 'react';
import { useChart } from "./ChartContext.js";
import { xPixel } from "./utils.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ChartSelect({
  onSelect,
  onSelectionChange,
  selected = [],
  color = 'var(--color-accent)',
  radius = 6
}) {
  const {
    width,
    height,
    data,
    xKey,
    xScale,
    yScale
  } = useChart();
  const handlePointerUp = useCallback(e => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) {
      return;
    }
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const local = pt.matrixTransform(e.currentTarget.getScreenCTM()?.inverse());
    let closest = 0,
      minDist = Infinity;
    data.forEach((d, i) => {
      const px = xPixel(d, xKey, xScale);
      const numKeys = Object.keys(d).filter(k => k !== xKey && typeof d[k] === 'number');
      const py = numKeys.length > 0 ? yScale(d[numKeys[0]]) : 0;
      const dist = Math.hypot(px - local.x, py - local.y);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    if (minDist > 30) {
      return;
    }
    onSelect?.(data[closest], closest);
    if (onSelectionChange) {
      if (e.shiftKey || e.metaKey) {
        onSelectionChange(selected.includes(closest) ? selected.filter(i => i !== closest) : [...selected, closest]);
      } else {
        onSelectionChange([closest]);
      }
    }
  }, [data, xKey, xScale, yScale, selected, onSelect, onSelectionChange]);
  return /*#__PURE__*/_jsxs("g", {
    children: [/*#__PURE__*/_jsx("rect", {
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: "transparent",
      style: {
        cursor: 'pointer'
      },
      onPointerUp: handlePointerUp
    }), selected.map(idx => {
      if (idx < 0 || idx >= data.length) {
        return null;
      }
      const d = data[idx];
      const px = xPixel(d, xKey, xScale);
      const yKey = Object.keys(d).find(k => k !== xKey && typeof d[k] === 'number');
      const py = yKey ? yScale(d[yKey]) : 0;
      return /*#__PURE__*/_jsx("circle", {
        cx: px,
        cy: py,
        r: radius,
        fill: "none",
        stroke: color,
        strokeWidth: 2,
        pointerEvents: "none"
      }, idx);
    })]
  });
}