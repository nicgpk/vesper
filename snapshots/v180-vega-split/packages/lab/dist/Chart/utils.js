// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file utils.ts
 * @output Shared utilities for chart components
 * @position Internal helpers; consumed by mark, axis, and interaction components
 */

/** Type guard for d3 band scales */
export function isBandScale(scale) {
  return typeof scale === 'function' && 'bandwidth' in scale;
}

/**
 * Get the x pixel position for a datum using the chart's xKey and xScale.
 * For band scales, returns the center of the band.
 */
export function xPixel(d, xKey, xScale) {
  const raw = d[xKey];
  if (isBandScale(xScale)) {
    return (xScale(String(raw)) ?? 0) + xScale.bandwidth() / 2;
  }
  return xScale(raw);
}