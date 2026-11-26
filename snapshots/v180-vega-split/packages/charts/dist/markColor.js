// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markColor.ts
 * @output Color resolution shared by marks
 * @position Used by mark renderers to turn an optional color into a concrete one
 *
 * Precedence: an explicit color (string or accessor) always wins; otherwise the
 * chart root's palette color for the series (`_resolvedColor`); otherwise a real
 * data-viz token fallback. This is what makes an un-colored `bar('revenue')`
 * render a real color instead of the historical broken `--color-chart-1`.
 *
 * Empty strings are treated as "unset" at every level (an empty `fill`/`stroke`
 * paints nothing), and a per-point accessor that returns a non-string or empty
 * value falls through to the palette rather than emitting an invalid paint.
 */

import { DEFAULT_SERIES_COLOR } from "./types.js";

/** A usable CSS paint value — a non-blank string. */
function isPaint(value) {
  // A whitespace-only string is an invalid paint (it renders as the initial
  // color, not the intended fallback), so treat it as "unset" like an empty one.
  return typeof value === 'string' && value.trim().length > 0;
}

/** The palette color assigned by the chart root, or the last-resort token. */
function fallbackFill(def) {
  return isPaint(def._resolvedColor) ? def._resolvedColor : DEFAULT_SERIES_COLOR;
}

/** The single resolved color for a series (line/area/band and similar). */
export function seriesFill(def, color) {
  if (isPaint(color)) {
    return color;
  }
  return fallbackFill(def);
}

/** Per-point fill: an accessor wins, then an explicit string, then the palette. */
export function pointFill(def, color, datum, index) {
  if (typeof color === 'function') {
    try {
      const resolved = color(datum, index);
      if (isPaint(resolved)) {
        return resolved;
      }
    } catch {
      // A consumer accessor can throw on unexpected data; fall through to the
      // palette/token fallback rather than crashing the whole chart render.
    }
  } else if (isPaint(color)) {
    return color;
  }
  return fallbackFill(def);
}