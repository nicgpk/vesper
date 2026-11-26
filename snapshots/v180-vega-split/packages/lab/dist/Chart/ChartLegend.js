import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartLegend.tsx
 * @output Renders a legend — discrete swatches or continuous gradient bar
 * @position Child of Chart or standalone
 *
 * Two modes:
 * - Discrete: pass `items` — renders color swatches with labels
 * - Gradient: pass `gradient` + `domain` — renders a continuous color bar with tick labels
 *
 * The `gradient` prop accepts the output of useChartColors().sequential/diverging directly.
 */

/** Build a CSS linear-gradient from an array of color stops */
function toGradientCSS(colors) {
  if (colors.length === 0) {
    return 'transparent';
  }
  if (colors.length === 1) {
    return colors[0];
  }
  const stops = colors.map((c, i) => `${c} ${i / (colors.length - 1) * 100}%`);
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

/**
 * Chart legend — discrete swatches or continuous gradient.
 *
 * @example
 * ```
 * <ChartLegend items={[
 *   {label: 'Revenue', color: colors[0]},
 *   {label: 'Expenses', color: colors[1]},
 * ]} />
 * <ChartLegend
 *   gradient={useChartColors().sequential.blue(5)}
 *   domain={[0, 100]}
 *   label="Temperature"
 * />
 * <ChartLegend
 *   gradient={useChartColors().diverging.coldHot(7)}
 *   domain={[-50, 50]}
 *   label="Change %"
 * />
 * ```
 */
export function ChartLegend({
  items,
  gradient,
  domain,
  label,
  ticks = 3,
  tickFormat = String
}) {
  // Gradient mode
  if (gradient && gradient.length > 0 && domain) {
    const [min, max] = domain;
    const tickValues = Array.from({
      length: ticks
    }, (_, i) => min + i / (ticks - 1) * (max - min));
    return /*#__PURE__*/_jsx("foreignObject", {
      x: 0,
      y: -4,
      width: "100%",
      height: 48,
      style: {
        overflow: 'visible'
      },
      children: /*#__PURE__*/_jsxs("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          color: 'var(--color-text-secondary)'
        },
        children: [label && /*#__PURE__*/_jsx("span", {
          style: {
            fontWeight: 500,
            color: 'var(--color-text-primary)'
          },
          children: label
        }), /*#__PURE__*/_jsxs("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: 200
          },
          children: [/*#__PURE__*/_jsx("div", {
            style: {
              height: 10,
              borderRadius: 4,
              background: toGradientCSS(gradient)
            }
          }), /*#__PURE__*/_jsx("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between'
            },
            children: tickValues.map(v => /*#__PURE__*/_jsx("span", {
              style: {
                fontSize: 10
              },
              children: tickFormat(v)
            }, v))
          })]
        })]
      })
    });
  }

  // Discrete mode
  if (!items || items.length === 0) {
    return null;
  }
  return /*#__PURE__*/_jsx("foreignObject", {
    x: 0,
    y: -4,
    width: "100%",
    height: 24,
    style: {
      overflow: 'visible'
    },
    children: /*#__PURE__*/_jsx("div", {
      style: {
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        fontSize: 12,
        color: 'var(--color-text-secondary)'
      },
      children: items.map(item => /*#__PURE__*/_jsxs("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 4
        },
        children: [/*#__PURE__*/_jsx("div", {
          style: {
            width: 10,
            height: 10,
            borderRadius: 2,
            backgroundColor: item.color,
            flexShrink: 0
          }
        }), /*#__PURE__*/_jsx("span", {
          children: item.label
        })]
      }, item.label))
    })
  });
}