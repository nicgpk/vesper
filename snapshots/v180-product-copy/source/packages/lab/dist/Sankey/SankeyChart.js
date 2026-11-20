// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SankeyChart.tsx
 * @output Root Sankey container — computes layout and provides context
 * @position Parent component; all Sankey marks are children
 *
 * When columns × minColumnWidth exceeds the container, the chart
 * scrolls horizontally rather than squishing columns together.
 *
 * Accessibility: the svg is exposed as a named image (role="img" + aria-label,
 * overridable via `label`) in both the scrolling and non-scrolling paths, and
 * small graphs are mirrored in a visually hidden From/To/Value table.
 */

import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { SankeyProvider } from "./SankeyContext.js";
import { computeLayout } from "./layout.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Maximum number of links for which the visually hidden data-table fallback is
 * rendered. Beyond this a table is more noise than signal, so larger charts
 * are name-only.
 */
const MAX_TABLE_LINKS = 100;

/** Resolve column count from raw column input or auto-detect from graph */
function resolveColumnCount(columns, nodes, links) {
  if (columns) {
    return columns.length;
  }
  // Quick topological column count
  const inDegree = new Map();
  const outEdges = new Map();
  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    outEdges.set(n.id, []);
  });
  links.forEach(l => {
    inDegree.set(l.target, (inDegree.get(l.target) || 0) + 1);
    outEdges.get(l.source)?.push(l.target);
  });
  const colMap = new Map();
  const queue = [];
  nodes.forEach(n => {
    if (inDegree.get(n.id) === 0) {
      queue.push(n.id);
      colMap.set(n.id, 0);
    }
  });
  while (queue.length) {
    const id = queue.shift();
    if (id == null) {
      break;
    }
    const col = colMap.get(id) ?? 0;
    for (const tgt of outEdges.get(id) || []) {
      colMap.set(tgt, Math.max(colMap.get(tgt) || 0, col + 1));
      inDegree.set(tgt, (inDegree.get(tgt) || 0) - 1);
      if (inDegree.get(tgt) === 0) {
        queue.push(tgt);
      }
    }
  }
  return Math.max(...Array.from(colMap.values()), 0) + 1;
}

/**
 * Root component for Sankey/flow diagrams.
 *
 * Computes layout from nodes + links, exposes positions via context.
 * Width is responsive but enforces minColumnWidth — scrolls when needed.
 *
 * @example
 * ```
 * <SankeyChart
 *   nodes={nodes}
 *   links={links}
 *   columns={[
 *     {ids: ['a', 'b'], label: 'Source'},
 *     {ids: ['c', 'd'], label: 'Target'},
 *   ]}>
 *   <SankeyGrid />
 *   <SankeyLink />
 *   <SankeyNode />
 *   <SankeyLabel />
 * </SankeyChart>
 * ```
 */
export function SankeyChart({
  nodes,
  links,
  columns,
  height = 320,
  nodeWidth = 20,
  nodeGap = 14,
  nodeColor,
  minColumnWidth = 160,
  label = 'Sankey chart',
  children
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const colCount = useMemo(() => resolveColumnCount(columns, nodes, links), [columns, nodes, links]);
  const minWidth = colCount * minColumnWidth;
  const chartWidth = Math.max(containerWidth, minWidth);
  const needsScroll = containerWidth > 0 && chartWidth > containerWidth;
  const layout = useMemo(() => {
    if (containerWidth === 0) {
      return null;
    }
    return computeLayout(nodes, links, {
      width: chartWidth,
      height,
      nodeWidth,
      nodeGap,
      columns
    });
  }, [nodes, links, chartWidth, height, nodeWidth, nodeGap, columns, containerWidth]);
  const ctx = useMemo(() => {
    if (!layout) {
      return null;
    }
    return {
      nodes: layout.nodes,
      links: layout.links,
      columns: layout.columns,
      width: chartWidth,
      height,
      valueScale: layout.valueScale,
      maxValue: layout.maxValue,
      nodeWidth,
      nodeColor
    };
  }, [layout, chartWidth, height, nodeWidth, nodeColor]);
  const nodeLabelById = useMemo(() => new Map(nodes.map(n => [n.id, n.label || n.id])), [nodes]);
  const showDataTable = links.length > 0 && links.length <= MAX_TABLE_LINKS;
  return /*#__PURE__*/_jsxs("div", {
    ref: containerRef,
    style: {
      width: '100%'
    },
    children: [ctx && /*#__PURE__*/_jsx("div", {
      role: needsScroll ? 'group' : undefined,
      "aria-label": needsScroll ? label : undefined,
      tabIndex: needsScroll ? 0 : undefined,
      style: needsScroll ? {
        overflowX: 'auto',
        overflowY: 'hidden'
      } : undefined,
      children: /*#__PURE__*/_jsx("svg", {
        role: "img",
        "aria-label": label,
        width: chartWidth,
        height: height,
        style: {
          overflow: 'visible',
          display: 'block'
        },
        children: /*#__PURE__*/_jsx(SankeyProvider, {
          value: ctx,
          children: children
        })
      })
    }), showDataTable && /*#__PURE__*/_jsx(VisuallyHidden, {
      as: "div",
      children: /*#__PURE__*/_jsxs("table", {
        children: [/*#__PURE__*/_jsx("caption", {
          children: `${label} data`
        }), /*#__PURE__*/_jsx("thead", {
          children: /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              scope: "col",
              children: "From"
            }), /*#__PURE__*/_jsx("th", {
              scope: "col",
              children: "To"
            }), /*#__PURE__*/_jsx("th", {
              scope: "col",
              children: "Value"
            })]
          })
        }), /*#__PURE__*/_jsx("tbody", {
          children: links.map((link, i) => /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              scope: "row",
              children: nodeLabelById.get(link.source) ?? link.source
            }), /*#__PURE__*/_jsx("td", {
              children: nodeLabelById.get(link.target) ?? link.target
            }), /*#__PURE__*/_jsx("td", {
              children: String(link.value)
            })]
          }, i))
        })]
      })
    })]
  });
}
SankeyChart.displayName = 'SankeyChart';