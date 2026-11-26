// src/VegaChart.tsx
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { parse, View } from "vega";
import { compile } from "vega-lite";

// src/schema.ts
var SCHEMA_RE = /schema\/([\w-]+)\/([\w.-]+)\.json$/;
function parseSchema(schema) {
  if (schema === void 0 || schema === null) {
    return { ok: false, error: 'Spec is missing a $schema field. Add "$schema": "https://vega.github.io/schema/vega/v5.json" or the vega-lite equivalent.' };
  }
  if (typeof schema !== "string") {
    return { ok: false, error: `$schema must be a string, got ${typeof schema}.` };
  }
  const match = SCHEMA_RE.exec(schema);
  if (!match) {
    return {
      ok: false,
      error: `Unrecognized $schema URL: "${schema}". Expected format: https://vega.github.io/schema/{vega|vega-lite}/{version}.json`
    };
  }
  const [, library, version] = match;
  if (library !== "vega" && library !== "vega-lite") {
    return {
      ok: false,
      error: `Unknown schema library "${library}". Must be "vega" or "vega-lite".`
    };
  }
  return { ok: true, library, version };
}

// src/viewInputs.ts
var MAX_DEPTH = 100;
var OPAQUE = /* @__PURE__ */ Symbol("astryx.vega.opaque");
function opaque(value) {
  return { [OPAQUE]: value };
}
function isOpaque(value) {
  return typeof value === "object" && value !== null && OPAQUE in value;
}
function latchViewInputs(inputs) {
  return { inputs, snapshot: snapshotValue(inputs, 0, /* @__PURE__ */ new Set()) };
}
function latchIsCurrent(latch, inputs) {
  return matchesSnapshot(latch.snapshot, inputs);
}
function snapshotValue(value, depth, path) {
  if (!isWalkable(value)) {
    return value;
  }
  if (depth >= MAX_DEPTH || path.has(value)) {
    return opaque(value);
  }
  path.add(value);
  const copy = Array.isArray(value) ? value.map((item) => snapshotValue(item, depth + 1, path)) : Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      snapshotValue(entry, depth + 1, path)
    ])
  );
  path.delete(value);
  return copy;
}
function matchesSnapshot(snapshot, value) {
  if (isOpaque(snapshot)) {
    return Object.is(snapshot[OPAQUE], value);
  }
  if (Array.isArray(snapshot)) {
    return Array.isArray(value) && snapshot.length === value.length && snapshot.every((item, index) => matchesSnapshot(item, value[index]));
  }
  if (isPlainObject(snapshot)) {
    if (!isPlainObject(value)) {
      return false;
    }
    const keys = Object.keys(snapshot);
    return keys.length === Object.keys(value).length && keys.every(
      (key) => Object.prototype.hasOwnProperty.call(value, key) && matchesSnapshot(snapshot[key], value[key])
    );
  }
  return Object.is(snapshot, value);
}
function isWalkable(value) {
  return Array.isArray(value) || isPlainObject(value);
}
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

// src/VegaChart.tsx
import { jsx } from "react/jsx-runtime";
function VegaChart({
  spec,
  data,
  compileOptions,
  parseConfig,
  parseOptions,
  viewOptions,
  className,
  style,
  ref,
  onReady: onReadyProp,
  onError: onErrorProp,
  ...props
}) {
  const containerRef = useRef(null);
  const inputs = {
    spec,
    compileOptions,
    parseConfig,
    parseOptions,
    viewOptions
  };
  const [latch, setLatch] = useState(() => latchViewInputs(inputs));
  if (!latchIsCurrent(latch, inputs)) {
    setLatch(latchViewInputs(inputs));
  }
  const onReady = useEffectEvent((view) => {
    onReadyProp?.(view);
  });
  const onError = useEffectEvent((error) => {
    onErrorProp?.(error);
  });
  const loadInitialData = useEffectEvent((view) => {
    if (!data) {
      return;
    }
    for (const [name, tuples] of Object.entries(data)) {
      view.data(name, tuples);
    }
  });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const { spec: spec2 } = latch.inputs;
    let cancelled = false;
    let view = null;
    const fail = (err) => {
      if (!cancelled) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    };
    try {
      const schemaResult = parseSchema(spec2.$schema);
      if (!schemaResult.ok) {
        fail(new Error(schemaResult.error));
        return;
      }
      const vegaSpec = schemaResult.library === "vega-lite" ? compile(spec2, latch.inputs.compileOptions).spec : spec2;
      const runtime = parse(
        vegaSpec,
        latch.inputs.parseConfig,
        latch.inputs.parseOptions
      );
      view = new View(runtime, {
        hover: true,
        ...latch.inputs.viewOptions,
        container
      });
      loadInitialData(view);
      view.runAsync().then(() => {
        if (cancelled) {
          view?.finalize();
          return;
        }
        if (view) {
          onReady(view);
        }
      }).catch(fail);
    } catch (err) {
      fail(err);
    }
    return () => {
      cancelled = true;
      view?.finalize();
    };
  }, [latch]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: (node) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      className,
      style,
      ...props
    }
  );
}
VegaChart.displayName = "VegaChart";

// src/vegaLiteConfig.ts
var DEFAULT_STROKE_WIDTH = 2;
var DEFAULT_POINT_SIZE = 64;
var DEFAULT_LEGEND_ORIENT = "right";
var LEGEND_OFFSET = 16;
var TITLE_OFFSET = 16;
function buildVegaLiteConfig(token) {
  return {
    axis: {
      domainColor: token("--color-icon-primary"),
      domainWidth: 0.5,
      gridColor: token("--color-background-muted"),
      labelColor: token("--color-text-secondary"),
      labelFont: token("--font-family-body"),
      labelFontSize: 12,
      labelLineHeight: 16,
      labelPadding: 8,
      tickCount: 5,
      ticks: false,
      title: null
    },
    axisX: {
      grid: false
    },
    axisXQuantitative: {
      domain: true
    },
    axisY: {
      domain: false
    },
    axisYQuantitative: {
      grid: true,
      gridWidth: 0.5
    },
    background: token("--color-background-card"),
    legend: {
      labelColor: token("--color-text-secondary"),
      labelFont: token("--font-family-body"),
      labelFontSize: 12,
      labelPadding: 8,
      offset: LEGEND_OFFSET,
      orient: DEFAULT_LEGEND_ORIENT,
      rowPadding: 12,
      title: null,
      titleColor: token("--color-text-secondary"),
      titleFont: token("--font-family-heading"),
      titleFontSize: 16
    },
    line: {
      strokeCap: "round",
      strokeJoin: "round",
      strokeWidth: DEFAULT_STROKE_WIDTH
    },
    padding: 16,
    point: {
      shape: "circle",
      size: DEFAULT_POINT_SIZE,
      fill: token("--color-background-card")
    },
    range: {
      category: [
        token("--color-data-categorical-blue"),
        token("--color-data-categorical-orange"),
        token("--color-data-categorical-purple"),
        token("--color-data-categorical-green"),
        token("--color-data-categorical-pink"),
        token("--color-data-categorical-cyan"),
        token("--color-data-categorical-red"),
        token("--color-data-categorical-teal"),
        token("--color-data-categorical-brown"),
        token("--color-data-categorical-indigo")
      ],
      diverging: [
        token("--color-data-blue-5"),
        token("--color-data-blue-4"),
        token("--color-data-blue-3"),
        token("--color-data-blue-2"),
        token("--color-data-blue-1"),
        token("--color-data-gray-1"),
        token("--color-data-red-1"),
        token("--color-data-red-2"),
        token("--color-data-red-3"),
        token("--color-data-red-4"),
        token("--color-data-red-5")
      ],
      heatmap: [
        token("--color-data-blue-1"),
        token("--color-data-blue-2"),
        token("--color-data-blue-3"),
        token("--color-data-blue-4"),
        token("--color-data-blue-5")
      ],
      ordinal: [
        token("--color-data-blue-5"),
        token("--color-data-blue-4"),
        token("--color-data-blue-3"),
        token("--color-data-blue-2"),
        token("--color-data-blue-1")
      ],
      ramp: [
        token("--color-data-blue-1"),
        token("--color-data-blue-2"),
        token("--color-data-blue-3"),
        token("--color-data-blue-4"),
        token("--color-data-blue-5")
      ]
    },
    scale: {
      bandPaddingInner: 0.1
    },
    text: {
      color: token("--color-text-primary")
    },
    title: {
      anchor: "start",
      color: token("--color-text-primary"),
      subtitleFontWeight: "normal",
      subtitleColor: token("--color-text-secondary"),
      offset: TITLE_OFFSET
    },
    view: {
      stroke: null
    }
  };
}
export {
  DEFAULT_LEGEND_ORIENT,
  DEFAULT_POINT_SIZE,
  DEFAULT_STROKE_WIDTH,
  LEGEND_OFFSET,
  TITLE_OFFSET,
  VegaChart,
  buildVegaLiteConfig,
  parseSchema
};
