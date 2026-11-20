// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file formatters.ts
 * @input Tick values and optional BCP 47 locale tags
 * @output Built-in tick format utilities for common data types
 * @position Utility; consumed by ChartAxis via tickFormat prop
 */

/**
 * Compact number formatter (e.g. 1200 → "1.2K", 1500000 → "1.5M")
 */
export function compactNumber(value) {
  const n = Number(value);
  if (isNaN(n)) {
    return String(value);
  }
  if (Math.abs(n) >= 1_000_000_000) {
    return `${strip(n / 1_000_000_000)}B`;
  }
  if (Math.abs(n) >= 1_000_000) {
    return `${strip(n / 1_000_000)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `${strip(n / 1_000)}K`;
  }
  return n.toString();
}

/**
 * Currency formatter factory. Returns a tick format function.
 *
 * @example
 * ```
 * <ChartAxis tickFormat={currency()} />       // $1.5K
 * <ChartAxis tickFormat={currency('€')} />    // €1.5K
 * <ChartAxis tickFormat={currency('¥')} />    // ¥1.5K
 * ```
 */
export function currency(symbol = '$', locale = 'en') {
  return value => {
    const n = Number(value);
    if (isNaN(n)) {
      return String(value);
    }
    if (Math.abs(n) >= 1_000_000_000) {
      return `${symbol}${strip(n / 1_000_000_000)}B`;
    }
    if (Math.abs(n) >= 1_000_000) {
      return `${symbol}${strip(n / 1_000_000)}M`;
    }
    if (Math.abs(n) >= 1_000) {
      return `${symbol}${strip(n / 1_000)}K`;
    }
    return `${symbol}${n.toLocaleString(locale)}`;
  };
}

/** Remove trailing .0 from fixed-point strings */
function strip(n) {
  const s = n.toFixed(1);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}

/**
 * Percent formatter (e.g. 0.45 → "45%", 1.2 → "120%")
 */
export function percent(value) {
  const n = Number(value);
  if (isNaN(n)) {
    return String(value);
  }
  return `${Math.round(n * 100)}%`;
}

/**
 * Date formatter — short date (e.g. "Jan 5", "Mar 12")
 */
export function shortDate(value, locale = 'en') {
  const d = value instanceof Date ? value : new Date(Number(value));
  if (isNaN(d.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    calendar: 'gregory'
  }).format(d);
}

/**
 * Date formatter — month/year (e.g. "Jan 2024", "Mar 2025")
 */
export function monthYear(value, locale = 'en') {
  const d = value instanceof Date ? value : new Date(Number(value));
  if (isNaN(d.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    calendar: 'gregory'
  }).format(d);
}