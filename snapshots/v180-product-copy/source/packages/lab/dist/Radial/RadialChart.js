// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadialChart.tsx
 * @output Root radial chart container — spider, pie, donut
 * @position Parent component; all radial marks read from its context
 *
 * Owns the radial coordinate space: center, radius, angle/radius scales.
 * Same Tier 1 guarantee as Chart — all children map through the same context.
 *
 * Accessibility: the svg is exposed as a named image (role="img" + aria-label,
 * overridable via `label`), and small datasets are mirrored in a visually
 * hidden data table (slices in pie mode, axis values in spider mode).
 */

import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { RadialProvider } from "./RadialContext.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Maximum number of data points (rows × axes in spider mode, slices in pie
 * mode) for which the visually hidden data-table fallback is rendered. Beyond
 * this a table is more noise than signal, so larger charts are name-only.
 */
const MAX_TABLE_POINTS = 100;

/**
 * Row header for a spider-mode table row: the first string field in the row
 * (the same heuristic RadialArea uses to match its `dataKey`), else the index.
 */
function spiderRowHeader(row, index) {
  const name = Object.values(row).find(v => typeof v === 'string');
  return typeof name === 'string' ? name : `Series ${index + 1}`;
}

/**
 * Root radial chart container. Computes angular/radial scales and provides
 * them to children via context.
 *
 * @example
 * ```
 * <RadialChart data={data} axes={['speed', 'handling', 'comfort']} height={400}>
 *   <RadialGrid rings={5} />
 *   <RadialArea dataKey="modelA" color={colors[0]} />
 *   <RadialAxis />
 * </RadialChart>
 * <RadialChart data={data} valueKey="revenue" labelKey="region" height={400}>
 *   <RadialSlice />
 * </RadialChart>
 * <RadialChart data={data} valueKey="revenue" labelKey="region" innerRadius={0.6} height={400}>
 *   <RadialSlice />
 * </RadialChart>
 * ```
 */
export function RadialChart({
  data,
  height = 400,
  axes,
  valueKey,
  labelKey,
  innerRadius: innerRadiusFraction = 0,
  padAngle = 0.02,
  label,
  children
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  const size = Math.min(containerWidth, height);
  const cx = containerWidth / 2;
  const cy = height / 2;
  const outerRadius = size / 2 - 40; // leave room for labels
  const innerRadiusPx = outerRadius * innerRadiusFraction;
  const mode = axes ? 'spider' : 'pie';

  // Spider: compute axis angles and domains
  const spiderCtx = useMemo(() => {
    if (!axes || axes.length === 0) {
      return {};
    }
    const angleByAxis = new Map();
    const step = 2 * Math.PI / axes.length;
    axes.forEach((key, i) => {
      // Start from top (-PI/2) and go clockwise
      angleByAxis.set(key, -Math.PI / 2 + step * i);
    });

    // Compute domain per axis
    const axisDomains = new Map();
    for (const key of axes) {
      let min = Infinity;
      let max = -Infinity;
      for (const d of data) {
        const v = d[key];
        if (typeof v === 'number') {
          if (v < min) {
            min = v;
          }
          if (v > max) {
            max = v;
          }
        }
      }
      // Include 0 as floor
      if (min > 0) {
        min = 0;
      }
      axisDomains.set(key, [min, max]);
    }
    const radiusScale = t => innerRadiusPx + t * (outerRadius - innerRadiusPx);
    return {
      axes,
      angleByAxis,
      radiusScale,
      axisDomains
    };
  }, [axes, data, outerRadius, innerRadiusPx]);

  // Pie: compute slices
  const pieCtx = useMemo(() => {
    if (!valueKey) {
      return {};
    }
    const total = data.reduce((sum, d) => {
      const v = d[valueKey];
      return sum + (typeof v === 'number' ? v : 0);
    }, 0);
    if (total === 0) {
      return {
        slices: []
      };
    }
    const totalPad = padAngle * data.length;
    const available = 2 * Math.PI - totalPad;
    let currentAngle = -Math.PI / 2; // start from top

    const slices = data.map(d => {
      const v = typeof d[valueKey] === 'number' ? d[valueKey] : 0;
      const percentage = v / total;
      const sweep = percentage * available;
      const slice = {
        key: labelKey ? String(d[labelKey]) : String(v),
        value: v,
        startAngle: currentAngle,
        endAngle: currentAngle + sweep,
        percentage
      };
      currentAngle += sweep + padAngle;
      return slice;
    });
    return {
      slices
    };
  }, [data, valueKey, labelKey, padAngle]);
  const ctx = useMemo(() => ({
    cx,
    cy,
    radius: outerRadius,
    innerRadius: innerRadiusPx,
    data,
    mode,
    ...spiderCtx,
    ...pieCtx
  }), [cx, cy, outerRadius, innerRadiusPx, data, mode, spiderCtx, pieCtx]);
  const accessibleLabel = label ?? (mode === 'spider' ? `Radar chart of ${(axes ?? []).join(', ')}` : `Pie chart of ${valueKey ?? 'values'}`);
  const slices = pieCtx.slices ?? [];
  const showPieTable = mode === 'pie' && slices.length > 0 && slices.length <= MAX_TABLE_POINTS;
  const showSpiderTable = mode === 'spider' && axes != null && axes.length > 0 && data.length > 0 && data.length * axes.length <= MAX_TABLE_POINTS;
  return /*#__PURE__*/_jsxs("div", {
    ref: containerRef,
    style: {
      width: '100%'
    },
    children: [containerWidth > 0 && /*#__PURE__*/_jsx("svg", {
      role: "img",
      "aria-label": accessibleLabel,
      width: containerWidth,
      height: height,
      children: /*#__PURE__*/_jsx(RadialProvider, {
        value: ctx,
        children: children
      })
    }), showPieTable && /*#__PURE__*/_jsx(VisuallyHidden, {
      as: "div",
      children: /*#__PURE__*/_jsxs("table", {
        children: [/*#__PURE__*/_jsx("caption", {
          children: `${accessibleLabel} data`
        }), /*#__PURE__*/_jsx("thead", {
          children: /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              scope: "col",
              children: labelKey ?? 'Label'
            }), /*#__PURE__*/_jsx("th", {
              scope: "col",
              children: valueKey
            }), /*#__PURE__*/_jsx("th", {
              scope: "col",
              children: "Percentage"
            })]
          })
        }), /*#__PURE__*/_jsx("tbody", {
          children: slices.map((slice, i) => /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              scope: "row",
              children: slice.key
            }), /*#__PURE__*/_jsx("td", {
              children: String(slice.value)
            }), /*#__PURE__*/_jsx("td", {
              children: `${(slice.percentage * 100).toFixed(1)}%`
            })]
          }, i))
        })]
      })
    }), showSpiderTable && /*#__PURE__*/_jsx(VisuallyHidden, {
      as: "div",
      children: /*#__PURE__*/_jsxs("table", {
        children: [/*#__PURE__*/_jsx("caption", {
          children: `${accessibleLabel} data`
        }), /*#__PURE__*/_jsx("thead", {
          children: /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              scope: "col",
              children: "Series"
            }), axes.map(key => /*#__PURE__*/_jsx("th", {
              scope: "col",
              children: key
            }, key))]
          })
        }), /*#__PURE__*/_jsx("tbody", {
          children: data.map((row, i) => /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              scope: "row",
              children: spiderRowHeader(row, i)
            }), axes.map(key => /*#__PURE__*/_jsx("td", {
              children: row[key] == null ? '' : String(row[key])
            }, key))]
          }, i))
        })]
      })
    })]
  });
}