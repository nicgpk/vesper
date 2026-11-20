// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Chart.tsx
 * @output Root chart container — sets up SVG, scales, and context
 * @position Parent component; all chart marks/axes/interactions are children
 *
 * Handles the d3 margin convention: outer SVG at full size, inner <g> translated
 * by margins. Children receive scales and dimensions via context.
 *
 * Accessibility: the svg is exposed as a named image (role="img" + aria-label,
 * overridable via `label`), and small datasets are mirrored in a visually
 * hidden data table so screen reader users can read the underlying values.
 */

import { useMemo, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { isBandScale } from "./utils.js";
import { ChartProvider } from "./ChartContext.js";

/**
 * Controls how the y-axis domain is computed:
 * - `'auto'` — includes 0 when all values are positive (default, bar-friendly)
 * - `'zero'` — symmetric range centered on 0 (good for +/- data)
 * - `'data'` — tight fit to data extent only (no forced zero)
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const DEFAULT_MARGIN = {
  top: 16,
  right: 16,
  bottom: 32,
  left: 48
};

/**
 * Maximum number of data points (rows × series) for which the visually hidden
 * data-table fallback is rendered. Beyond this a table is more noise than
 * signal for screen reader users, so larger charts are name-only.
 */
const MAX_TABLE_POINTS = 100;

/** Stringify a cell value for the hidden data table. */
function tableCell(value) {
  return value == null ? '' : String(value);
}

/**
 * Root chart container. Computes scales from data and provides them to children.
 *
 * @example
 * ```
 * <Chart data={data} xKey="month" yKeys={['revenue']} height={300}>
 *   <ChartAxis position="bottom" />
 *   <ChartAxis position="left" />
 *   <ChartBar dataKey="revenue" color={useChartColors().categorical(1)[0]} />
 * </Chart>
 * ```
 */
export function Chart({
  data,
  xKey,
  yKeys,
  height = 300,
  margin: marginOverride,
  yBaseline = 'auto',
  yDomain: yDomainProp,
  xDomain: xDomainProp,
  interactive = false,
  label,
  children
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
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

  // Block scroll/zoom on the container when interactive.
  // Must be non-passive to actually prevent default on touch events.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !interactive) {
      return;
    }
    const prevent = e => e.preventDefault();
    el.addEventListener('touchstart', prevent, {
      passive: false
    });
    el.addEventListener('touchmove', prevent, {
      passive: false
    });
    return () => {
      el.removeEventListener('touchstart', prevent);
      el.removeEventListener('touchmove', prevent);
    };
  }, [interactive]);
  const margin = useMemo(() => ({
    ...DEFAULT_MARGIN,
    ...marginOverride
  }), [marginOverride]);
  const innerWidth = Math.max(0, containerWidth - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);
  const xScale = useMemo(() => {
    const xValues = data.map(d => d[xKey]);
    const isNumeric = xValues.every(v => typeof v === 'number');
    if (isNumeric) {
      if (xDomainProp) {
        // Explicit domain is authoritative — use as-is
        return scaleLinear().domain(xDomainProp).range([0, innerWidth]);
      }
      // Auto-compute from data
      const nums = xValues;
      let min = Infinity;
      let max = -Infinity;
      for (const n of nums) {
        if (n < min) {
          min = n;
        }
        if (n > max) {
          max = n;
        }
      }
      return scaleLinear().domain([min, max]).range([0, innerWidth]).nice();
    }

    // Categorical — xDomain doesn't apply to band scales
    return scaleBand().domain(xValues.map(String)).range([0, innerWidth]).padding(0.2);
  }, [data, xKey, innerWidth, xDomainProp]);
  const yScale = useMemo(() => {
    if (yDomainProp) {
      // Explicit domain is authoritative — use as-is.
      // No baseline adjustment, no .nice(). The caller owns the domain
      // (e.g. zoom/pan controls) and rounding would cause ratcheting.
      return scaleLinear().domain(yDomainProp).range([innerHeight, 0]);
    }

    // Auto-compute from data
    let min = Infinity;
    let max = -Infinity;
    for (const d of data) {
      for (const key of yKeys) {
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
    }
    if (yBaseline === 'zero') {
      const abs = Math.max(Math.abs(min), Math.abs(max));
      min = -abs;
      max = abs;
    } else if (yBaseline === 'auto') {
      if (min > 0) {
        min = 0;
      }
      if (max < 0) {
        max = 0;
      }
    }
    return scaleLinear().domain([min, max]).range([innerHeight, 0]).nice();
  }, [data, yKeys, innerHeight, yBaseline, yDomainProp]);
  const pixelToData = useCallback((px, py) => {
    const y = yScale.invert(py);
    let x;
    if (isBandScale(xScale)) {
      const domain = xScale.domain();
      const step = xScale.step();
      const idx = Math.min(domain.length - 1, Math.max(0, Math.floor(px / step)));
      x = domain[idx];
    } else {
      x = xScale.invert(px);
    }
    return {
      x,
      y,
      px,
      py
    };
  }, [xScale, yScale]);
  const pointerToData = useCallback(e => {
    const svg = svgRef.current;
    if (!svg) {
      return {
        x: null,
        y: 0,
        px: 0,
        py: 0
      };
    }
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    // Transform to the inner <g> coordinate space (accounts for margins)
    const gEl = svg.querySelector('g');
    const ctm = gEl?.getScreenCTM?.()?.inverse();
    const local = ctm ? pt.matrixTransform(ctm) : {
      x: 0,
      y: 0
    };
    return pixelToData(local.x, local.y);
  }, [pixelToData]);
  const ctx = useMemo(() => ({
    width: innerWidth,
    height: innerHeight,
    margin,
    xKey,
    data,
    xScale,
    yScale,
    svgRef,
    pointerToData,
    pixelToData
  }), [innerWidth, innerHeight, margin, xKey, data, xScale, yScale, pointerToData, pixelToData]);
  const containerStyle = {
    width: '100%',
    touchAction: interactive ? 'none' : undefined,
    userSelect: interactive ? 'none' : undefined
  };
  const accessibleLabel = label ?? `Chart of ${yKeys.join(', ')} by ${xKey}`;
  const showDataTable = data.length > 0 && data.length * Math.max(yKeys.length, 1) <= MAX_TABLE_POINTS;
  return /*#__PURE__*/_jsxs("div", {
    ref: containerRef,
    style: containerStyle,
    children: [containerWidth > 0 && /*#__PURE__*/_jsxs("svg", {
      ref: svgRef,
      role: "img",
      "aria-label": accessibleLabel,
      width: containerWidth,
      height: height,
      style: interactive ? {
        touchAction: 'none'
      } : undefined,
      children: [/*#__PURE__*/_jsx("defs", {
        children: /*#__PURE__*/_jsx("clipPath", {
          id: "astryx-chart-plot",
          children: /*#__PURE__*/_jsx("rect", {
            x: 0,
            y: 0,
            width: innerWidth,
            height: innerHeight
          })
        })
      }), /*#__PURE__*/_jsx("g", {
        transform: `translate(${margin.left},${margin.top})`,
        children: /*#__PURE__*/_jsx(ChartProvider, {
          value: ctx,
          children: children
        })
      })]
    }), showDataTable && /*#__PURE__*/_jsx(VisuallyHidden, {
      as: "div",
      children: /*#__PURE__*/_jsxs("table", {
        children: [/*#__PURE__*/_jsx("caption", {
          children: `${accessibleLabel} data`
        }), /*#__PURE__*/_jsx("thead", {
          children: /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              scope: "col",
              children: xKey
            }), yKeys.map(key => /*#__PURE__*/_jsx("th", {
              scope: "col",
              children: key
            }, key))]
          })
        }), /*#__PURE__*/_jsx("tbody", {
          children: data.map((d, i) => /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              scope: "row",
              children: tableCell(d[xKey])
            }), yKeys.map(key => /*#__PURE__*/_jsx("td", {
              children: tableCell(d[key])
            }, key))]
          }, i))
        })]
      })
    })]
  });
}