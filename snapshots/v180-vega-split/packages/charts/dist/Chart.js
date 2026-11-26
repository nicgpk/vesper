// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Chart.tsx (v2)
 * @input Data, scale configuration, series definitions, optional chrome, and root DOM props
 * @output Root chart — coordinates layout, rendering, and events
 * @position Top-level; delegates everything to series configs and interaction slots
 *
 * The chart root has ZERO knowledge of mark types. It:
 *   1. Runs the layout engine (scales + stacking + grouping)
 *   2. Calls each series' resolve() and render() methods
 *   3. Provides a single event layer for interaction children
 *
 * Accessibility: the svg is exposed as a named image (role="img"; `title` or a
 * derived default as aria-label), and small datasets are mirrored in a
 * visually hidden data table for screen reader users.
 */

'use client';

import { useId, useMemo, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { computeLayout } from "./layout.js";
import { ChartProvider } from "./ChartContext.js";
import { Text, VStack, HStack, VisuallyHidden, useLocale, useTranslator } from '@astryxdesign/core';
import { useMergedRefs } from '@astryxdesign/core/hooks';
import { mergeProps } from '@astryxdesign/core/utils';
import '@astryxdesign/core/theme/tokens.stylex';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { ChartLegend } from "./ChartLegend.js";
import { deriveLegendItems } from "./legend.js";
import { ChartTooltip } from "./ChartTooltip.js";
import { useChartColors } from "./useChartColors.js";
import { formatList } from "./formatters.js";
import { isUtilityMarkType } from "./types.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const DEFAULT_MARGIN = {
  top: 24,
  right: 24,
  bottom: 32,
  left: 48
};

/**
 * Maximum number of data points (rows × data keys) for which the visually
 * hidden data-table fallback is rendered. Beyond this a table is more noise
 * than signal for screen reader users, so larger charts are name-only.
 */
const MAX_TABLE_POINTS = 100;

/** Stringify a cell value for the hidden data table. */
function tableCell(value) {
  return value == null ? '' : String(value);
}
const styles = {
  container: {
    kzqmXN: "xh8yej3",
    $$css: true
  }
};

/**
 * Renders several series against one responsive x/y coordinate system.
 *
 * @example
 * ```
 * <Chart
 *   data={monthlyRevenue}
 *   xKey="month"
 *   series={[bar('revenue'), line('trend')]}
 *   title="Monthly revenue"
 *   grid={<ChartGrid horizontal />}
 *   axes={<><ChartAxis position="bottom" /><ChartAxis position="left" /></>}
 *   legend
 *   tooltip
 * />
 * ```
 */
export function Chart({
  data,
  xKey,
  series,
  height = 300,
  margin: marginOverride,
  yBaseline,
  yDomain,
  xDomain,
  grid,
  axes,
  legend,
  tooltip,
  interactions,
  children,
  title,
  subtitle,
  ref,
  xstyle,
  className,
  style,
  ...rest
}) {
  const chartId = useId();
  const descId = `${chartId}-desc`;
  // useId() can contain ':' which is invalid in an SVG url(#id) reference.
  const clipId = `plot-${chartId.replace(/:/g, '')}`;
  const containerRef = useRef(null);
  const mergedContainerRef = useMergedRefs(containerRef, ref);
  const svgRef = useRef(null);
  const t = useTranslator();
  const locale = useLocale();
  const [containerWidth, setContainerWidth] = useState(0);
  const pointerHandlers = useRef(new Set());
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
  const margin = useMemo(() => ({
    ...DEFAULT_MARGIN,
    ...marginOverride
  }), [marginOverride]);
  // Clamp plot dimensions to finite, non-negative values. layout.ts hardens
  // against NaN in the *data*, but a non-finite `height` prop or margin override
  // would still collapse every scale range — and the clipPath/event-rect
  // geometry — into NaN. `containerWidth` is always finite (from ResizeObserver).
  const safeHeight = Number.isFinite(height) ? Math.max(0, height) : 0;
  const rawInnerWidth = containerWidth - margin.left - margin.right;
  const rawInnerHeight = safeHeight - margin.top - margin.bottom;
  const innerWidth = Number.isFinite(rawInnerWidth) ? Math.max(0, rawInnerWidth) : 0;
  const innerHeight = Number.isFinite(rawInnerHeight) ? Math.max(0, rawInnerHeight) : 0;

  // ─── Color assignment ─────────────────────────────────────────────────
  // Give every primary series that doesn't supply a static color (auto-colored
  // or accessor-colored) a distinct color from the theme's categorical palette.
  // Utility marks (band/errorBar/referenceLine) don't consume palette slots.
  // Assigned during render (like the layout pass annotates `_uid`) so the first
  // paint is already colored; intentionally not a `useMemo` — it mutates the
  // caller's series defs, and useMemo is allowed to drop its cached result.
  const chartColors = useChartColors();
  const needsColor = series.filter(s => !isUtilityMarkType(s.type) && s.color == null);
  const palette = chartColors.categorical(Math.max(needsColor.length, 1));
  for (let i = 0; i < needsColor.length; i++) {
    needsColor[i]._resolvedColor = palette[i % palette.length];
  }

  // ─── Layout pass ──────────────────────────────────────────────────────
  const layout = useMemo(() => computeLayout({
    data,
    xKey,
    series,
    width: innerWidth,
    height: innerHeight,
    yBaseline,
    yDomain,
    xDomain
  }), [data, xKey, series, innerWidth, innerHeight, yBaseline, yDomain, xDomain]);
  const seriesCtx = useMemo(() => ({
    data,
    xKey,
    xScale: layout.xScale,
    yScale: layout.yScale,
    yBandScale: layout.yBandScale,
    width: innerWidth,
    height: innerHeight
  }), [data, xKey, layout, innerWidth, innerHeight]);

  // ─── Event dispatch ───────────────────────────────────────────────────
  const onPointer = useCallback(handler => {
    pointerHandlers.current.add(handler);
    return () => {
      pointerHandlers.current.delete(handler);
    };
  }, []);
  const dispatch = useCallback(e => {
    for (const handler of pointerHandlers.current) {
      handler(e);
    }
  }, []);
  const handlePointerMove = useCallback(e => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const ctm = e.currentTarget.getScreenCTM()?.inverse();
    if (!ctm) {
      return;
    }
    const cursor = point.matrixTransform(ctm);

    // Find nearest point by x-distance only (full vertical column is the hover zone)
    let nearest = null;
    let bestXDist = Infinity;
    for (const [seriesKey, points] of layout.resolved) {
      for (const p of points) {
        const xDist = Math.abs(p.px - cursor.x);
        if (xDist < bestXDist) {
          bestXDist = xDist;
          nearest = {
            ...p,
            seriesKey
          };
        }
      }
    }
    dispatch({
      x: cursor.x,
      y: cursor.y,
      nearest,
      active: e.buttons > 0
    });
  }, [layout.resolved, dispatch]);
  const handlePointerLeave = useCallback(() => {
    dispatch({
      x: -1,
      y: -1,
      nearest: null,
      active: false
    });
  }, [dispatch]);

  // ─── Context for interactions + v1 chrome ─────────────────────────────
  const ctx = useMemo(() => ({
    width: innerWidth,
    height: innerHeight,
    margin,
    data,
    xKey,
    xScale: layout.xScale,
    yScale: layout.yScale,
    yBandScale: layout.yBandScale,
    resolved: layout.resolved,
    onPointer,
    svgRef
  }), [innerWidth, innerHeight, margin, data, xKey, layout, onPointer]);

  // ─── Accessibility ─────────────────────────────────────────────────────
  // The svg is exposed as a named image. `title` (when given) is the name;
  // otherwise a localized default is derived from the primary series + x key.
  const primarySeries = series.filter(s => !isUtilityMarkType(s.type));
  const accessibleLabel = title ?? (primarySeries.length > 0 ? t('@astryx.chart.labelWithSeries', {
    series: formatList(primarySeries.map(s => s.label ?? s.key), locale),
    xKey
  }) : t('@astryx.chart.label'));
  const tableKeys = Array.from(new Set(primarySeries.flatMap(s => s.dataKeys)));
  const showDataTable = data.length > 0 && tableKeys.length > 0 && data.length * tableKeys.length <= MAX_TABLE_POINTS;

  // ─── Legend ────────────────────────────────────────────────────────────
  const legendConfig = legend === true ? {} : legend || null;
  const legendElement = legendConfig ? /*#__PURE__*/_jsx(ChartLegend, {
    items: legendConfig.items ?? deriveLegendItems(series),
    position: legendConfig.position,
    alignment: legendConfig.alignment
  }) : null;
  const legendPosition = legendConfig?.position ?? 'bottom';
  const isLegendHorizontal = legendPosition === 'start' || legendPosition === 'end';

  // ─── Render ───────────────────────────────────────────────────────────
  if (containerWidth === 0) {
    return /*#__PURE__*/_jsx("div", {
      ref: mergedContainerRef,
      ...mergeProps(stylex.props(styles.container, xstyle), {
        style: {
          height: safeHeight
        }
      }, className, style),
      ...rest
    });
  }
  return /*#__PURE__*/_jsxs("div", {
    ref: mergedContainerRef,
    ...mergeProps(stylex.props(styles.container, xstyle), className, style),
    ...rest,
    children: [(title || subtitle) && /*#__PURE__*/_jsxs("div", {
      ...{
        className: "xwh1t77"
      },
      children: [title && /*#__PURE__*/_jsx(Text, {
        type: "body",
        weight: "semibold",
        display: "block",
        children: title
      }), subtitle && /*#__PURE__*/_jsx(Text, {
        type: "supporting",
        display: "block",
        children: subtitle
      })]
    }), /*#__PURE__*/_jsx(ChartProvider, {
      value: ctx,
      children: legendConfig == null ? renderSvg() : isLegendHorizontal ? /*#__PURE__*/_jsxs(HStack, {
        gap: 4,
        children: [legendPosition === 'start' && legendElement, /*#__PURE__*/_jsx("div", {
          ...{
            className: "x98rzlu xeuugli x7giv3"
          },
          children: renderSvg()
        }), legendPosition === 'end' && legendElement]
      }) : /*#__PURE__*/_jsxs(VStack, {
        gap: 4,
        children: [legendPosition === 'top' && legendElement, renderSvg(), legendPosition === 'bottom' && legendElement]
      })
    }), renderDataTable()]
  });
  function renderSvg() {
    return /*#__PURE__*/_jsxs("svg", {
      ref: svgRef,
      role: "img",
      width: "100%",
      height: safeHeight,
      "aria-label": accessibleLabel,
      "aria-describedby": subtitle ? descId : undefined,
      children: [title && /*#__PURE__*/_jsx("title", {
        children: title
      }), subtitle && /*#__PURE__*/_jsx("desc", {
        id: descId,
        children: subtitle
      }), /*#__PURE__*/_jsx("defs", {
        children: /*#__PURE__*/_jsx("clipPath", {
          id: clipId,
          children: /*#__PURE__*/_jsx("rect", {
            x: 0,
            y: 0,
            width: innerWidth,
            height: innerHeight
          })
        })
      }), /*#__PURE__*/_jsxs("g", {
        transform: `translate(${margin.left},${margin.top})`,
        children: [grid, /*#__PURE__*/_jsx("g", {
          clipPath: `url(#${clipId})`,
          children: series.map(s => {
            const resolved = s._uid ? layout.resolved.get(s._uid) : undefined;
            if (!resolved) {
              return null;
            }
            return /*#__PURE__*/_jsx("g", {
              children: s.render(resolved, seriesCtx)
            }, s._uid);
          })
        }), axes, /*#__PURE__*/_jsx("rect", {
          x: 0,
          y: 0,
          width: innerWidth,
          height: innerHeight,
          fill: "transparent",
          onPointerMove: handlePointerMove,
          onPointerLeave: handlePointerLeave
        }), interactions, tooltip && /*#__PURE__*/_jsx(ChartTooltip, {
          series: series,
          ...(tooltip === true ? {} : tooltip)
        }), children]
      })]
    });
  }
  function renderDataTable() {
    if (!showDataTable) {
      return null;
    }
    return /*#__PURE__*/_jsx(VisuallyHidden, {
      as: "div",
      children: /*#__PURE__*/_jsxs("table", {
        children: [/*#__PURE__*/_jsx("caption", {
          children: t('@astryx.chart.dataTableCaption', {
            label: accessibleLabel
          })
        }), /*#__PURE__*/_jsx("thead", {
          children: /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              scope: "col",
              children: xKey
            }), tableKeys.map(key => /*#__PURE__*/_jsx("th", {
              scope: "col",
              children: key
            }, key))]
          })
        }), /*#__PURE__*/_jsx("tbody", {
          children: data.map((d, i) => /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              scope: "row",
              children: tableCell(d[xKey])
            }), tableKeys.map(key => /*#__PURE__*/_jsx("td", {
              children: tableCell(d[key])
            }, key))]
          }, i))
        })]
      })
    });
  }
}
Chart.displayName = 'Chart';