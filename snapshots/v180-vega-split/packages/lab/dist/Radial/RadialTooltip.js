// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadialTooltip.tsx
 * @output Hover tooltip for radial charts (pie/donut/spider)
 * @position Child of RadialChart; reads geometry from radial context
 *
 * Uses the Astryx Layer system for top-layer rendering.
 * Hit-tests pointer position against slices (pie/donut) or axis proximity (spider).
 * Portals the popover div outside the SVG into the chart container.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLayer } from '@astryxdesign/core/Layer';
import { useRadial } from "./RadialContext.js";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Tooltip for radial charts. Detects which slice the pointer is over
 * using polar coordinate math and renders a tooltip in the top layer.
 *
 * @example
 * ```
 * <RadialChart data={data} valueKey="revenue" labelKey="region" height={400}>
 *   <RadialSlice colors={colors} />
 *   <RadialTooltip />
 * </RadialChart>
 * ```
 */
export function RadialTooltip({
  render,
  highlight = true,
  highlightOffset = 6
}) {
  const {
    cx,
    cy,
    radius,
    innerRadius,
    slices,
    mode,
    data,
    axes,
    angleByAxis,
    axisDomains
  } = useRadial();
  const [hoverState, setHoverState] = useState(null);
  const [tooltipCoords, setTooltipCoords] = useState({
    x: 0,
    y: 0
  });
  const svgRef = useRef(null);
  const portalRef = useRef(null);
  const active = useRef(false);
  const layer = useLayer({
    mode: 'fixed'
  });

  // Resolve SVG + portal target from the <g> mount
  const gRef = useCallback(el => {
    if (el) {
      svgRef.current = el.ownerSVGElement;
      portalRef.current = el.ownerSVGElement?.parentElement ?? null;
    }
  }, []);
  const hitTestPie = useCallback((localX, localY) => {
    if (!slices || slices.length === 0) {
      return null;
    }
    const dx = localX - cx;
    const dy = localY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius || dist < innerRadius) {
      return null;
    }
    let angle = Math.atan2(dy, dx);
    if (angle < -Math.PI / 2) {
      angle += 2 * Math.PI;
    }
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i];
      if (angle >= slice.startAngle && angle <= slice.endAngle) {
        return {
          label: slice.key,
          value: slice.value,
          percentage: slice.percentage,
          index: i
        };
      }
    }
    return null;
  }, [slices, cx, cy, radius, innerRadius]);
  const hitTestSpider = useCallback((localX, localY) => {
    if (!axes || !angleByAxis || !axisDomains) {
      return null;
    }
    const dx = localX - cx;
    const dy = localY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius + 20) {
      return null;
    }
    const angle = Math.atan2(dy, dx);
    let nearestAxis = axes[0];
    let minAngleDist = Infinity;
    for (const [key, axisAngle] of angleByAxis) {
      let diff = Math.abs(angle - axisAngle);
      if (diff > Math.PI) {
        diff = 2 * Math.PI - diff;
      }
      if (diff < minAngleDist) {
        minAngleDist = diff;
        nearestAxis = key;
      }
    }
    if (minAngleDist > Math.PI / axes.length) {
      return null;
    }
    let bestIdx = 0;
    let bestVal = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i][nearestAxis];
      if (typeof v === 'number' && v > bestVal) {
        bestVal = v;
        bestIdx = i;
      }
    }
    return {
      label: nearestAxis,
      value: bestVal,
      index: bestIdx
    };
  }, [axes, angleByAxis, axisDomains, cx, cy, radius, data]);
  const updateTooltip = useCallback(e => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM()?.inverse();
    if (!ctm) {
      return;
    }
    const local = pt.matrixTransform(ctm);
    const hit = mode === 'pie' ? hitTestPie(local.x, local.y) : hitTestSpider(local.x, local.y);
    if (hit) {
      setHoverState(hit);
      setTooltipCoords({
        x: e.clientX + 12,
        y: e.clientY - 8
      });
      layer.show();
    } else {
      setHoverState(null);
      layer.hide();
    }
  }, [mode, hitTestPie, hitTestSpider, layer]);

  // Touch: tap to show, drag to scrub
  const handlePointerDown = useCallback(e => {
    if (e.pointerType !== 'mouse') {
      e.preventDefault();
      active.current = true;
      updateTooltip(e);
    }
  }, [updateTooltip]);

  // Mouse: hover. Touch: drag (only if active).
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
  const defaultRender = d => /*#__PURE__*/_jsxs("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      fontSize: 12
    },
    children: [/*#__PURE__*/_jsx("div", {
      style: {
        fontWeight: 600
      },
      children: d.label
    }), /*#__PURE__*/_jsxs("div", {
      children: [/*#__PURE__*/_jsx("span", {
        style: {
          color: 'var(--color-text-secondary)'
        },
        children: "Value:"
      }), ' ', /*#__PURE__*/_jsx("span", {
        style: {
          fontWeight: 500
        },
        children: d.value.toLocaleString()
      })]
    }), d.percentage != null && /*#__PURE__*/_jsxs("div", {
      children: [/*#__PURE__*/_jsx("span", {
        style: {
          color: 'var(--color-text-secondary)'
        },
        children: "Share:"
      }), ' ', /*#__PURE__*/_jsxs("span", {
        style: {
          fontWeight: 500
        },
        children: [Math.round(d.percentage * 100), "%"]
      })]
    })]
  });
  const highlightSlice = highlight && hoverState && mode === 'pie' && slices?.[hoverState.index];
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsxs("g", {
      ref: gRef,
      children: [/*#__PURE__*/_jsx("circle", {
        cx: cx,
        cy: cy,
        r: radius + 10,
        fill: "transparent",
        style: {
          touchAction: 'none'
        },
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerUp,
        onPointerLeave: handlePointerLeave
      }), highlightSlice && /*#__PURE__*/_jsx("g", {
        transform: (() => {
          const midAngle = (highlightSlice.startAngle + highlightSlice.endAngle) / 2;
          const tx = Math.cos(midAngle) * highlightOffset;
          const ty = Math.sin(midAngle) * highlightOffset;
          return `translate(${tx},${ty})`;
        })(),
        pointerEvents: "none",
        opacity: 0.3,
        children: /*#__PURE__*/_jsx("circle", {
          cx: cx,
          cy: cy,
          r: radius,
          fill: "none",
          stroke: "var(--color-border-emphasized)",
          strokeWidth: 2
        })
      })]
    }), portalRef.current && /*#__PURE__*/createPortal(layer.render(hoverState ? /*#__PURE__*/_jsx("div", {
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
      children: render ? render(hoverState) : defaultRender(hoverState)
    }) : null, {
      x: tooltipCoords.x,
      y: tooltipCoords.y
    }), portalRef.current)]
  });
}