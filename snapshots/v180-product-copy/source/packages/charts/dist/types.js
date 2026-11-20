// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @output Core types for the v2 chart architecture
 * @position Foundation — consumed by layout, renderers, and interactions
 */

/**
 * A color for a mark: either a constant CSS color/token, or an accessor that
 * returns a color per datum (for per-element coloring, e.g. positive/negative).
 */

/**
 * Fallback series color used when a mark has neither an explicit color nor a
 * palette color assigned by the chart root. Uses an EMITTED core token
 * (`--color-accent`) — the data-viz `--color-data-*` tokens are JS-only values
 * (resolved via useChartColors), not CSS custom properties, so `var(--color-data-*)`
 * would render nothing. The chart root normally assigns a resolved palette color,
 * so this is only a last-resort fallback.
 */
export const DEFAULT_SERIES_COLOR = 'var(--color-accent)';

/**
 * Controls how the y-axis domain is derived when no explicit `yDomain` is given:
 * - `'auto'` (default) — bar/area marks pin an honest zero baseline; continuous-
 *   only charts (line/dot/…) get a little headroom so points don't touch edges.
 * - `'zero'` — symmetric around zero (good for +/- data like profit/loss).
 * - `'data'` — tight fit to the data extent (no zero forcing, no headroom).
 */

/** Resolved pixel position for a single data point in a series */

/** Context passed to resolve() and render() on each series */

/**
 * The standardized shape every mark helper returns.
 * Each mark type is self-contained: it knows how to resolve positions
 * and how to render itself. The chart root just iterates and calls.
 *
 * A SeriesDef instance is single-use: the layout/render pass annotates it in
 * place (`_uid`, `_isTopOfStack`, `_resolvedColor`), so a given def must belong
 * to exactly one <Chart>. Build a fresh series array per chart rather than
 * sharing the same mark objects across charts.
 */

/** Resolved positions for all series */

/** Pointer event normalized to plot-area coordinates */

/** Context provided by Chart to interaction children */

/**
 * Series mark types that are utility / annotation marks rather than primary
 * data. They're skipped from chrome surfaces (legend, tooltip rows) since
 * they don't represent values the user is comparing.
 */
export const UTILITY_MARK_TYPES = new Set(['referenceLine', 'errorBar', 'band']);

/** True if the series type is a utility / annotation mark. */
export function isUtilityMarkType(type) {
  return UTILITY_MARK_TYPES.has(type);
}