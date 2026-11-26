// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartLegend.tsx
 * @input Legend items plus logical position and alignment
 * @output Standalone chart legend component
 * @position Can be used inside Chart via the `legend` prop, or independently
 *
 * @example
 * ```
 * <Chart
 *   data={data}
 *   xKey="month"
 *   series={series}
 *   legend={{position: 'top', alignment: 'start'}}
 * />
 * ```
 */

'use client';

import { HStack, Text, useTranslator, VStack } from '@astryxdesign/core';
import { ChartSwatch, swatchVariantForType } from "./ChartSwatch.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ChartLegend({
  items = [],
  position = 'bottom',
  alignment = 'start'
}) {
  const t = useTranslator();
  if (items.length === 0) {
    return null;
  }
  const isVertical = position === 'start' || position === 'end';

  // Rows are stateless, but labels aren't guaranteed unique (two series can
  // share a label), so disambiguate with the index to keep keys collision-free.
  const legendItems = items.map((item, i) => /*#__PURE__*/_jsxs(HStack, {
    gap: 2,
    vAlign: "center",
    role: "listitem",
    children: [/*#__PURE__*/_jsx(ChartSwatch, {
      color: item.color,
      variant: swatchVariantForType(item.type)
    }), /*#__PURE__*/_jsx(Text, {
      type: "supporting",
      children: item.label
    })]
  }, `${item.label}-${i}`));
  if (isVertical) {
    return /*#__PURE__*/_jsx(VStack, {
      gap: 2,
      hAlign: alignment,
      role: "list",
      "aria-label": t('@astryx.chartLegend.label'),
      children: legendItems
    });
  }
  return /*#__PURE__*/_jsx(HStack, {
    gap: 4,
    justify: alignment,
    vAlign: "center",
    wrap: "wrap",
    role: "list",
    "aria-label": t('@astryx.chartLegend.label'),
    children: legendItems
  });
}