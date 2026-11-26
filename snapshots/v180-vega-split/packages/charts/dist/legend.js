// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file legend.ts
 * @output Legend utility — derives legend items from series definitions
 * @position Used by Chart to bridge series → legend items
 */

import { DEFAULT_SERIES_COLOR, isUtilityMarkType } from "./types.js";
/**
 * A series appears in the legend if it's a primary (non-utility) mark. Its
 * representative color is the static color, else the root-assigned palette color
 * (so auto-colored AND accessor-colored series still show up — previously an
 * accessor color silently dropped the series from the legend).
 */
function legendColor(series) {
  if (isUtilityMarkType(series.type)) {
    return undefined;
  }
  return series.color ?? series._resolvedColor ?? DEFAULT_SERIES_COLOR;
}

/**
 * Derive legend items from series definitions. Skips utility marks.
 */
export function deriveLegendItems(series) {
  const items = [];
  for (const s of series) {
    const color = legendColor(s);
    if (color == null) {
      continue;
    }
    items.push({
      label: s.label ?? s.key,
      color,
      type: s.type
    });
  }
  return items;
}