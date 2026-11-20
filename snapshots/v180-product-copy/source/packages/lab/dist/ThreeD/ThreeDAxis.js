// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThreeDAxis.tsx
 * @output 3D axis lines with labels at each end
 */

import { use3D } from "./ThreeDContext.js";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export function ThreeDAxis({
  labels = true
}) {
  const {
    project,
    xKey,
    yKey,
    zKey,
    xDomain,
    yDomain,
    zDomain
  } = use3D();
  const origin = project(0, 0, 0);
  const xEnd = project(1, 0, 0);
  const yEnd = project(0, 1, 0);
  const zEnd = project(0, 0, 1);
  const lineColor = 'var(--color-border-emphasized)';
  const labelColor = 'var(--color-text-secondary)';
  return /*#__PURE__*/_jsxs("g", {
    children: [/*#__PURE__*/_jsx("line", {
      x1: origin.px,
      y1: origin.py,
      x2: xEnd.px,
      y2: xEnd.py,
      stroke: lineColor,
      strokeWidth: 1.5
    }), /*#__PURE__*/_jsx("line", {
      x1: origin.px,
      y1: origin.py,
      x2: yEnd.px,
      y2: yEnd.py,
      stroke: lineColor,
      strokeWidth: 1.5
    }), /*#__PURE__*/_jsx("line", {
      x1: origin.px,
      y1: origin.py,
      x2: zEnd.px,
      y2: zEnd.py,
      stroke: lineColor,
      strokeWidth: 1.5
    }), labels && /*#__PURE__*/_jsxs(_Fragment, {
      children: [/*#__PURE__*/_jsxs("text", {
        x: xEnd.px + 8,
        y: xEnd.py,
        fill: labelColor,
        fontSize: 11,
        dominantBaseline: "central",
        children: [xKey, " [", xDomain[0], "-", xDomain[1], "]"]
      }), /*#__PURE__*/_jsxs("text", {
        x: yEnd.px + 8,
        y: yEnd.py,
        fill: labelColor,
        fontSize: 11,
        dominantBaseline: "central",
        children: [yKey, " [", yDomain[0], "-", yDomain[1], "]"]
      }), /*#__PURE__*/_jsxs("text", {
        x: zEnd.px + 8,
        y: zEnd.py,
        fill: labelColor,
        fontSize: 11,
        dominantBaseline: "central",
        children: [zKey, " [", zDomain[0], "-", zDomain[1], "]"]
      })]
    })]
  });
}