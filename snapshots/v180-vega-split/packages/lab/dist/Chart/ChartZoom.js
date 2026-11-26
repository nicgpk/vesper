// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartZoom.tsx
 * @output Scroll/pinch zoom + drag pan with optional toolbar.
 * @position Child of Chart; modifies x/yDomain via callbacks
 *
 * Zoom is aspect-ratio-normalized: both axes scale by the same visual
 * factor regardless of their domain ranges. Reset button restores
 * the initial domains captured on mount.
 */

import { useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '@astryxdesign/core/IconButton';
import { useChart } from "./ChartContext.js";
import { isBandScale } from "./utils.js";

/** Toolbar position relative to the chart */
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Chart toolbar icons (16x16 SVG)
function ZoomInIcon() {
  return /*#__PURE__*/_jsx("svg", {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    children: /*#__PURE__*/_jsx("path", {
      d: "M8 3v10M3 8h10"
    })
  });
}
function ZoomOutIcon() {
  return /*#__PURE__*/_jsx("svg", {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    children: /*#__PURE__*/_jsx("path", {
      d: "M3 8h10"
    })
  });
}
function ResetIcon() {
  return /*#__PURE__*/_jsx("svg", {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: /*#__PURE__*/_jsx("path", {
      d: "M2 8a6 6 0 1 1 1.5 4M2 12V8h4"
    })
  });
}
export function ChartZoom({
  onXDomainChange,
  onYDomainChange,
  zoomSpeed = 0.1,
  xOnly = false,
  yOnly = false,
  toolbar = 'top-right'
}) {
  const {
    width,
    height,
    xScale,
    yScale,
    svgRef
  } = useChart();

  // Capture initial domains on mount for reset
  const initialDomainsRef = useRef(null);
  useEffect(() => {
    if (initialDomainsRef.current) {
      return;
    } // only capture once
    const xDomain = isBandScale(xScale) ? null : xScale.domain();
    const yDomain = yScale.domain();
    initialDomainsRef.current = {
      x: xDomain,
      y: yDomain
    };
  }, [xScale, yScale]);
  const dragRef = useRef(null);
  const pointersRef = useRef(new Map());
  const pinchRef = useRef(null);
  const getXDomain = useCallback(() => isBandScale(xScale) ? [0, 0] : xScale.domain(), [xScale]);

  // Zoom a single axis around a pivot point by a factor.
  // factor > 1 = zoom out, factor < 1 = zoom in.
  const zoomAxis = useCallback((domain, factor, pivot) => {
    const [lo, hi] = domain;
    const range = hi - lo;
    const leftRatio = (pivot - lo) / range;
    const newRange = range * factor;
    return [pivot - newRange * leftRatio, pivot + newRange * (1 - leftRatio)];
  }, []);
  const zoomBy = useCallback((factor, pivotX, pivotY) => {
    if (!yOnly && !isBandScale(xScale)) {
      const linear = xScale;
      const [xMin, xMax] = linear.domain();
      const xPivot = pivotX != null ? linear.invert(pivotX) : (xMin + xMax) / 2;
      onXDomainChange?.(zoomAxis([xMin, xMax], factor, xPivot));
    }
    if (!xOnly) {
      const [yMin, yMax] = yScale.domain();
      const yPivot = pivotY != null ? yScale.invert(pivotY) : (yMin + yMax) / 2;
      onYDomainChange?.(zoomAxis([yMin, yMax], factor, yPivot));
    }
  }, [xScale, yScale, onXDomainChange, onYDomainChange, xOnly, yOnly, zoomAxis]);
  const handleWheel = useCallback(e => {
    e.preventDefault();
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) {
      return;
    }
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const local = pt.matrixTransform(e.currentTarget.getScreenCTM()?.inverse());

    // Clamp delta to prevent trackpad acceleration from blowing out the domain.
    // A single tick should zoom by at most zoomSpeed (10% default).
    const clampedDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 50);
    const rawFactor = 1 + clampedDelta / 50 * zoomSpeed;

    // Apply per-axis, normalizing by each axis's pixel-to-domain ratio
    // so both axes zoom at the same visual rate.
    if (!yOnly && !isBandScale(xScale)) {
      const linear = xScale;
      const [xMin, xMax] = linear.domain();
      const xPivot = linear.invert(local.x);
      onXDomainChange?.(zoomAxis([xMin, xMax], rawFactor, xPivot));
    }
    if (!xOnly) {
      const [yMin, yMax] = yScale.domain();
      const yPivot = yScale.invert(local.y);
      onYDomainChange?.(zoomAxis([yMin, yMax], rawFactor, yPivot));
    }
  }, [zoomSpeed, xScale, yScale, onXDomainChange, onYDomainChange, xOnly, yOnly, zoomAxis]);
  const onPointerDown = useCallback(e => {
    e.target.setPointerCapture(e.pointerId);
    e.preventDefault(); // prevent selection on touch
    pointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY
    });
    if (pointersRef.current.size === 2) {
      const pts = [...pointersRef.current.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchRef.current = {
        dist,
        xDomain: getXDomain(),
        yDomain: yScale.domain()
      };
      dragRef.current = null;
    } else if (pointersRef.current.size === 1) {
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        xDomain: getXDomain(),
        yDomain: yScale.domain()
      };
    }
  }, [getXDomain, yScale]);
  const onPointerMove = useCallback(e => {
    pointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY
    });
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = [...pointersRef.current.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const ratio = pinchRef.current.dist / dist;
      if (!yOnly && !isBandScale(xScale)) {
        const [xMin, xMax] = pinchRef.current.xDomain;
        const mid = (xMin + xMax) / 2;
        const half = (xMax - xMin) / 2 * ratio;
        onXDomainChange?.([mid - half, mid + half]);
      }
      if (!xOnly) {
        const [yMin, yMax] = pinchRef.current.yDomain;
        const mid = (yMin + yMax) / 2;
        const half = (yMax - yMin) / 2 * ratio;
        onYDomainChange?.([mid - half, mid + half]);
      }
    } else if (dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (!yOnly && !isBandScale(xScale)) {
        const [xMin, xMax] = dragRef.current.xDomain;
        const xShift = -(dx / width) * (xMax - xMin);
        onXDomainChange?.([xMin + xShift, xMax + xShift]);
      }
      if (!xOnly) {
        const [yMin, yMax] = dragRef.current.yDomain;
        const yShift = dy / height * (yMax - yMin);
        onYDomainChange?.([yMin + yShift, yMax + yShift]);
      }
    }
  }, [xScale, width, height, onXDomainChange, onYDomainChange, xOnly, yOnly]);
  const onPointerUp = useCallback(e => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      dragRef.current = null;
    }
  }, []);
  const handleReset = useCallback(() => {
    const init = initialDomainsRef.current;
    if (!init) {
      return;
    }
    if (init.x) {
      onXDomainChange?.(init.x);
    }
    onYDomainChange?.(init.y);
  }, [onXDomainChange, onYDomainChange]);

  // Toolbar portal target
  const portalTarget = svgRef.current?.parentElement;

  // Toolbar position styles
  const toolbarPositionStyle = pos => {
    const base = {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      zIndex: 1
    };
    switch (pos) {
      case 'top-right':
        return {
          ...base,
          top: 8,
          right: 8
        };
      case 'top-left':
        return {
          ...base,
          top: 8,
          left: 8
        };
      case 'bottom-right':
        return {
          ...base,
          bottom: 8,
          right: 8
        };
      case 'bottom-left':
        return {
          ...base,
          bottom: 8,
          left: 8
        };
    }
  };
  const zoomRectStyle = {
    cursor: 'grab',
    touchAction: 'none',
    userSelect: 'none'
  };
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("g", {
      children: /*#__PURE__*/_jsx("rect", {
        x: 0,
        y: 0,
        width: width,
        height: height,
        fill: "transparent",
        style: zoomRectStyle,
        onWheel: handleWheel,
        onPointerDown: onPointerDown,
        onPointerMove: onPointerMove,
        onPointerUp: onPointerUp,
        onPointerCancel: onPointerUp
      })
    }), toolbar && portalTarget && /*#__PURE__*/createPortal(/*#__PURE__*/_jsxs("div", {
      style: toolbarPositionStyle(toolbar),
      children: [/*#__PURE__*/_jsx(IconButton, {
        label: "Zoom in",
        icon: /*#__PURE__*/_jsx(ZoomInIcon, {}),
        variant: "ghost",
        size: "sm",
        onClick: () => zoomBy(1 / (1 + zoomSpeed))
      }), /*#__PURE__*/_jsx(IconButton, {
        label: "Zoom out",
        icon: /*#__PURE__*/_jsx(ZoomOutIcon, {}),
        variant: "ghost",
        size: "sm",
        onClick: () => zoomBy(1 + zoomSpeed)
      }), /*#__PURE__*/_jsx(IconButton, {
        label: "Reset zoom",
        icon: /*#__PURE__*/_jsx(ResetIcon, {}),
        variant: "ghost",
        size: "sm",
        onClick: handleReset
      })]
    }), portalTarget)]
  });
}