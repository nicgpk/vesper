// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartTooltip.tsx
 * @output Hover tooltip with optional crosshair lines, rendered in the top layer
 * @position Child of Chart; reads scales from context
 *
 * Combines tooltip content and crosshair display into one component.
 * Uses the Astryx Layer system (Popover API) so the tooltip renders above
 * all other content — portaled to the chart container div (outside SVG).
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLayer } from '@astryxdesign/core/Layer';
import { useChart } from "./ChartContext.js";
import { xPixel } from "./utils.js";

/**
 * Crosshair mode:
 * - `'x'` — vertical line only (most common for time series)
 * - `'y'` — horizontal line only
 * - `'xy'` — both axes
 * - `false` — no crosshair lines
 */
import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Chart tooltip with integrated crosshair.
 *
 * Renders crosshair lines within the SVG and a floating tooltip card
 * in the top layer (via Popover API, portaled outside the SVG).
 *
 * @example
 * ```
 * <ChartTooltip />
 * <ChartTooltip crosshair="xy" crosshairLabels />
 * <ChartTooltip crosshair={false} />
 * <ChartTooltip render={(d) => <span>{d.month}: ${d.revenue}</span>} />
 * ```
 */
export function ChartTooltip({
  render,
  crosshair = 'x',
  crosshairLabels = false,
  snap = true,
  xFormat,
  yFormat,
  crosshairColor = 'var(--color-border-emphasized)',
  dot = true
}) {
  const {
    data,
    xKey,
    xScale,
    yScale,
    width,
    height,
    svgRef,
    pointerToData
  } = useChart();
  const [hoverState, setHoverState] = useState(null);

  // Screen-space coords for the tooltip popover
  const [tooltipCoords, setTooltipCoords] = useState({
    x: 0,
    y: 0
  });
  const layerContainerRef = useRef(null);
  const active = useRef(false);
  const layer = useLayer({
    mode: 'fixed'
  });

  // Find nearest data point. Uses Euclidean distance for scatter (linear x)
  // and x-only distance for categorical/time series (band x).
  const findNearest = useCallback((px, py) => {
    if (data.length === 0) {
      return null;
    }
    let closestIdx = 0;
    let minDist = Infinity;

    // Determine y keys (all numeric keys that aren't xKey)
    const yKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== xKey && typeof data[0][k] === 'number') : [];
    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      const datumPx = xPixel(datum, xKey, xScale);
      const dx = datumPx - px;

      // For each y key, compute distance to that point
      let bestDistForDatum = Infinity;
      let _bestYKey = yKeys[0];
      for (const yk of yKeys) {
        const yv = datum[yk];
        if (typeof yv !== 'number') {
          continue;
        }
        const datumPy = yScale(yv);
        const dy = datumPy - py;
        const dist = dx * dx + dy * dy; // squared euclidean
        if (dist < bestDistForDatum) {
          bestDistForDatum = dist;
          _bestYKey = yk;
        }
      }
      if (bestDistForDatum < minDist) {
        minDist = bestDistForDatum;
        closestIdx = i;
      }
    }
    const datum = data[closestIdx];
    const dpx = xPixel(datum, xKey, xScale);

    // Use the y value of the closest key for this datum
    let bestY = 0;
    let bestPy = height / 2;
    let bestDist = Infinity;
    for (const yk of yKeys) {
      const yv = datum[yk];
      if (typeof yv !== 'number') {
        continue;
      }
      const dpy = yScale(yv);
      const dx = dpx - px;
      const dy = dpy - py;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        bestY = yv;
        bestPy = dpy;
      }
    }
    return {
      index: closestIdx,
      point: {
        x: datum[xKey],
        y: bestY,
        px: dpx,
        py: bestPy
      }
    };
  }, [data, xKey, xScale, yScale, height]);
  const updateTooltip = useCallback(e => {
    const dataPoint = pointerToData(e);
    const result = snap ? findNearest(dataPoint.px, dataPoint.py) : {
      index: -1,
      point: dataPoint
    };
    if (result) {
      setHoverState(result);
      setTooltipCoords({
        x: e.clientX + 12,
        y: e.clientY - 8
      });
      layer.show();
    }

    // Resolve portal container on first interaction
    if (!layerContainerRef.current && svgRef.current) {
      layerContainerRef.current = svgRef.current.parentElement;
    }
  }, [pointerToData, findNearest, snap, layer, svgRef]);

  // Touch: tap to show, drag to scrub
  const handlePointerDown = useCallback(e => {
    if (e.pointerType !== 'mouse') {
      e.preventDefault(); // blocks text selection on touch
      active.current = true;
      updateTooltip(e);
    }
  }, [updateTooltip]);

  // Mouse: hover to show. Touch: drag to scrub (only if active).
  const handlePointerMove = useCallback(e => {
    if (e.pointerType !== 'mouse' && !active.current) {
      return;
    }
    updateTooltip(e);
  }, [updateTooltip]);

  // Touch: lift to dismiss
  const handlePointerUp = useCallback(() => {
    if (active.current) {
      active.current = false;
      setHoverState(null);
      layer.hide();
    }
  }, [layer]);
  const handlePointerLeave = useCallback(() => {
    if (!active.current) {
      setHoverState(null);
      layer.hide();
    }
  }, [layer]);
  const fmtX = xFormat ?? (v => v != null ? typeof v === 'number' ? v.toFixed(1) : String(v) : '');
  const fmtY = yFormat ?? (v => v.toFixed(1));
  const datum = hoverState ? data[hoverState.index] : null;
  const point = hoverState?.point ?? null;
  const defaultRender = d => /*#__PURE__*/_jsx("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      fontSize: 12
    },
    children: Object.entries(d).map(([k, v]) => /*#__PURE__*/_jsxs("div", {
      children: [/*#__PURE__*/_jsxs("span", {
        style: {
          color: 'var(--color-text-secondary)'
        },
        children: [k, ":"]
      }), ' ', /*#__PURE__*/_jsx("span", {
        style: {
          fontWeight: 500
        },
        children: String(v)
      })]
    }, k))
  });
  const showX = crosshair === 'x' || crosshair === 'xy';
  const showY = crosshair === 'y' || crosshair === 'xy';

  // Portal target: the chart's container div (parent of the SVG)
  const portalTarget = layerContainerRef.current ?? svgRef.current?.parentElement;
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsxs("g", {
      children: [/*#__PURE__*/_jsx("rect", {
        x: 0,
        y: 0,
        width: width,
        height: height,
        fill: "transparent",
        style: {
          touchAction: 'none'
        },
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerUp,
        onPointerLeave: handlePointerLeave
      }), point && /*#__PURE__*/_jsxs(_Fragment, {
        children: [showX && /*#__PURE__*/_jsx("line", {
          x1: point.px,
          x2: point.px,
          y1: 0,
          y2: height,
          stroke: crosshairColor,
          strokeWidth: 1,
          strokeDasharray: "3 3",
          pointerEvents: "none"
        }), showY && /*#__PURE__*/_jsx("line", {
          x1: 0,
          x2: width,
          y1: point.py,
          y2: point.py,
          stroke: crosshairColor,
          strokeWidth: 1,
          strokeDasharray: "3 3",
          pointerEvents: "none"
        }), dot && snap && hoverState && hoverState.index >= 0 && /*#__PURE__*/_jsx("circle", {
          cx: point.px,
          cy: point.py,
          r: 4,
          fill: "var(--color-background-surface)",
          stroke: crosshairColor,
          strokeWidth: 2,
          pointerEvents: "none"
        }), crosshairLabels && showX && point.x != null && /*#__PURE__*/_jsxs("g", {
          transform: `translate(${point.px},${height})`,
          pointerEvents: "none",
          children: [/*#__PURE__*/_jsx("rect", {
            x: -24,
            y: 2,
            width: 48,
            height: 16,
            rx: 4,
            fill: "var(--color-background-popover)",
            stroke: crosshairColor,
            strokeWidth: 0.5
          }), /*#__PURE__*/_jsx("text", {
            y: 14,
            textAnchor: "middle",
            fontSize: 10,
            fill: "var(--color-text-primary)",
            children: fmtX(point.x)
          })]
        }), crosshairLabels && showY && /*#__PURE__*/_jsxs("g", {
          transform: `translate(0,${point.py})`,
          pointerEvents: "none",
          children: [/*#__PURE__*/_jsx("rect", {
            x: -48,
            y: -8,
            width: 44,
            height: 16,
            rx: 4,
            fill: "var(--color-background-popover)",
            stroke: crosshairColor,
            strokeWidth: 0.5
          }), /*#__PURE__*/_jsx("text", {
            x: -26,
            dy: "0.35em",
            textAnchor: "middle",
            fontSize: 10,
            fill: "var(--color-text-primary)",
            children: fmtY(point.y)
          })]
        })]
      })]
    }), portalTarget && /*#__PURE__*/createPortal(layer.render(datum && hoverState && hoverState.index >= 0 ? /*#__PURE__*/_jsx("div", {
      style: {
        background: 'var(--color-background-popover)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: 'var(--shadow-med)',
        whiteSpace: 'nowrap',
        width: 'fit-content',
        pointerEvents: 'none'
      },
      children: render ? render(datum, hoverState.index) : defaultRender(datum)
    }) : null, {
      x: tooltipCoords.x,
      y: tooltipCoords.y
    }), portalTarget)]
  });
}