// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartCandlestick.tsx
 * @output Renders candlestick/box-whisker marks for OHLC or statistical data
 * @position Child of Chart; reads scales from context
 *
 * Two variants:
 * - `'default'` — filled body with whiskers (traditional candlestick/box plot)
 * - `'bar'` — OHLC bar — vertical line with open/close ticks
 */

import { useChart } from "./ChartContext.js";
import { isBandScale } from "./utils.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Candlestick / box-whisker marks.
 *
 * @example
 * ```
 * <ChartCandlestick
 *   high="high" low="low" open="open" close="close"
 *   upColor={useChartColors().semantic.positive}
 *   downColor={useChartColors().semantic.negative}
 * />
 * <ChartCandlestick
 *   variant="bar"
 *   high="max" low="min" open="q1" close="median"
 *   color={useChartColors().categorical(1)[0]}
 * />
 * ```
 */
export function ChartCandlestick({
  high,
  low,
  open,
  close,
  variant = 'default',
  upColor,
  downColor,
  color,
  bodyWidth = 0.6,
  strokeWidth = 1.5,
  radius = 2
}) {
  const {
    data,
    xKey,
    xScale,
    yScale
  } = useChart();
  if (!isBandScale(xScale)) {
    return null;
  }
  const bw = xScale.bandwidth();
  return /*#__PURE__*/_jsx("g", {
    children: data.map((d, i) => {
      const xVal = xScale(String(d[xKey]));
      if (xVal == null) {
        return null;
      }
      const hVal = typeof d[high] === 'number' ? d[high] : 0;
      const lVal = typeof d[low] === 'number' ? d[low] : 0;
      const oVal = typeof d[open] === 'number' ? d[open] : 0;
      const cVal = typeof d[close] === 'number' ? d[close] : 0;
      const isUp = cVal >= oVal;
      const fill = color ?? (isUp ? upColor ?? 'var(--color-data-categorical-green)' : downColor ?? 'var(--color-data-categorical-red)');
      const centerX = xVal + bw / 2;
      const yHigh = yScale(hVal);
      const yLow = yScale(lVal);
      const yOpen = yScale(oVal);
      const yClose = yScale(cVal);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyBot = Math.max(yOpen, yClose);
      if (variant === 'bar') {
        // OHLC bar: vertical line (high→low), left tick at open, right tick at close
        const tickLen = bw * bodyWidth * 0.4;
        return /*#__PURE__*/_jsxs("g", {
          children: [/*#__PURE__*/_jsx("line", {
            x1: centerX,
            x2: centerX,
            y1: yHigh,
            y2: yLow,
            stroke: fill,
            strokeWidth: strokeWidth
          }), /*#__PURE__*/_jsx("line", {
            x1: centerX - tickLen,
            x2: centerX,
            y1: yOpen,
            y2: yOpen,
            stroke: fill,
            strokeWidth: strokeWidth
          }), /*#__PURE__*/_jsx("line", {
            x1: centerX,
            x2: centerX + tickLen,
            y1: yClose,
            y2: yClose,
            stroke: fill,
            strokeWidth: strokeWidth
          })]
        }, i);
      }

      // Default variant: filled body with whiskers
      const bodyW = bw * bodyWidth;
      const bodyX = centerX - bodyW / 2;
      const bodyH = Math.max(1, bodyBot - bodyTop);
      return /*#__PURE__*/_jsxs("g", {
        children: [/*#__PURE__*/_jsx("line", {
          x1: centerX,
          x2: centerX,
          y1: yHigh,
          y2: bodyTop,
          stroke: fill,
          strokeWidth: strokeWidth
        }), /*#__PURE__*/_jsx("line", {
          x1: centerX,
          x2: centerX,
          y1: bodyBot,
          y2: yLow,
          stroke: fill,
          strokeWidth: strokeWidth
        }), /*#__PURE__*/_jsx("rect", {
          x: bodyX,
          y: bodyTop,
          width: bodyW,
          height: bodyH,
          fill: fill,
          rx: radius,
          ry: radius
        })]
      }, i);
    })
  });
}