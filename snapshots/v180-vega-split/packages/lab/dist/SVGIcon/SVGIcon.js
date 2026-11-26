// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SVGIcon.tsx
 * @input SVG path data with per-element roles, variation preset, size, color
 * @output CSS-variable-driven SVG icon with role-aware rendering and mask-based gaps
 * @position Core implementation for the lab SVG icon system
 *
 * Two key concepts beyond basic CSS-var-driven icons:
 *
 * 1. Path roles — each element is either "fill" (closed shapes that switch between
 *    stroke and fill across variations) or "stroke" (lines that always stay stroked).
 *
 * 2. Mask-based gaps — in bold/filled mode, overlapping fill-role shapes get
 *    auto-generated SVG masks. Secondary fill shapes are knocked out of primary
 *    shapes with a configurable gap and corner rounding, producing clean negative
 *    space on any background.
 */
import { useId } from 'react';
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps } from '@astryxdesign/core/utils';
import "./tokens.stylex.js";
import { iconVars } from "./tokens.stylex.js";
import { variations, opticalSize } from "./variations.stylex.js";
import { themeProps } from '@astryxdesign/core/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Role determines how an element behaves across variations.
 * - "fill": closed shapes — stroked in linear, filled in bold
 * - "stroke": lines/detail strokes — always rendered as strokes
 */

/** Shape element within an icon layer */

/** Definition of an SVG icon's geometry */
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// =============================================================================
// Styles
// =============================================================================

const styles = {
  root: {
    k1xSpc: "x3nfvp2",
    kmuXW: "x2lah0s",
    kzqmXN: "x1oai4fc",
    kZKoxP: "xhigkf7",
    kZCmMZ: "xmarwi5",
    kLKAdn: "xpgmcrp",
    $$css: true
  }
};
const colorStyles = {
  primary: {
    kMwMTN: "xtbr613",
    $$css: true
  },
  secondary: {
    kMwMTN: "xv9yike",
    $$css: true
  },
  disabled: {
    kMwMTN: "xqa6c3m",
    $$css: true
  },
  accent: {
    kMwMTN: "xqwr325",
    $$css: true
  },
  positive: {
    kMwMTN: "xtjic6",
    $$css: true
  },
  negative: {
    kMwMTN: "xjt36v0",
    $$css: true
  },
  warning: {
    kMwMTN: "xs3pv69",
    $$css: true
  },
  inherit: {
    kMwMTN: "x1heor9g",
    $$css: true
  }
};

// =============================================================================
// Shape Renderer
// =============================================================================

function renderShapeElement(attrs, type, key) {
  const props = {
    ...attrs,
    key
  };
  switch (type) {
    case 'path':
      return /*#__PURE__*/_jsx("path", {
        ...props
      });
    case 'circle':
      return /*#__PURE__*/_jsx("circle", {
        ...props
      });
    case 'rect':
      return /*#__PURE__*/_jsx("rect", {
        ...props
      });
    case 'line':
      return /*#__PURE__*/_jsx("line", {
        ...props
      });
    case 'polyline':
      return /*#__PURE__*/_jsx("polyline", {
        ...props
      });
    case 'polygon':
      return /*#__PURE__*/_jsx("polygon", {
        ...props
      });
    default:
      return null;
  }
}

// =============================================================================
// Mask Generation
// =============================================================================

/** Check whether bold mode needs a mask for this layer */
function needsMask(variation, primaryFillShapes, secondaryShapes) {
  if (variation !== 'bold') {
    return false;
  }
  return primaryFillShapes.length > 0 && secondaryShapes.length > 0;
}

/**
 * Render mask knockout shapes — secondary elements become holes
 * in the primary layer, with gap and corner rounding from CSS vars.
 */
function renderMaskKnockouts(shapes) {
  return shapes.map((shape, i) => {
    const role = shape.role ?? 'fill';
    // Stroke-role knockouts need wider stroke to fully cover the visible stroke + gap
    // Fill-role knockouts just need the gap width for the border around the hole
    const knockoutWidth = role === 'stroke' ? `calc(${iconVars['--icon-stroke-width']} + ${iconVars['--icon-gap']} * 2)` : iconVars['--icon-gap'];
    return renderShapeElement({
      ...shape.attrs,
      fill: role === 'fill' ? 'black' : 'none',
      stroke: 'black',
      strokeWidth: knockoutWidth,
      strokeLinecap: 'round',
      strokeLinejoin: iconVars['--icon-gap-linejoin']
    }, shape.type, `knockout-${i}`);
  });
}

// =============================================================================
// Layer Renderers
// =============================================================================

function renderFillRoleShapes(shapes, layer, maskId) {
  const fillVar = layer === 'primary' ? iconVars['--icon-layer-primary-fill'] : iconVars['--icon-layer-secondary-fill'];
  const strokeVar = layer === 'primary' ? iconVars['--icon-layer-primary-stroke'] : iconVars['--icon-layer-secondary-stroke'];
  const opacityVar = layer === 'primary' ? iconVars['--icon-layer-primary-opacity'] : iconVars['--icon-layer-secondary-opacity'];
  if (shapes.length === 0) {
    return null;
  }
  return /*#__PURE__*/_jsx("g", {
    style: {
      fill: fillVar,
      stroke: strokeVar,
      opacity: opacityVar,
      strokeWidth: iconVars['--icon-stroke-width'],
      strokeLinecap: iconVars['--icon-stroke-linecap'],
      strokeLinejoin: iconVars['--icon-stroke-linejoin']
    },
    mask: maskId ? `url(#${maskId})` : undefined,
    children: shapes.map((shape, i) => renderShapeElement(shape.attrs, shape.type, `${layer}-fill-${i}`))
  });
}
function renderStrokeRoleShapes(shapes, layer) {
  const fillVar = layer === 'primary' ? iconVars['--icon-layer-primary-stroke-role-fill'] : iconVars['--icon-layer-secondary-stroke-role-fill'];
  const strokeVar = layer === 'primary' ? iconVars['--icon-layer-primary-stroke-role-stroke'] : iconVars['--icon-layer-secondary-stroke-role-stroke'];
  const opacityVar = layer === 'primary' ? iconVars['--icon-layer-primary-stroke-role-opacity'] : iconVars['--icon-layer-secondary-stroke-role-opacity'];
  const widthVar = layer === 'primary' ? iconVars['--icon-layer-primary-stroke-role-width'] : iconVars['--icon-layer-secondary-stroke-role-width'];
  if (shapes.length === 0) {
    return null;
  }
  return /*#__PURE__*/_jsx("g", {
    style: {
      fill: fillVar,
      stroke: strokeVar,
      opacity: opacityVar,
      strokeWidth: widthVar,
      strokeLinecap: iconVars['--icon-stroke-linecap'],
      strokeLinejoin: iconVars['--icon-stroke-linejoin']
    },
    children: shapes.map((shape, i) => renderShapeElement(shape.attrs, shape.type, `${layer}-stroke-${i}`))
  });
}

// =============================================================================
// Component
// =============================================================================

function splitByRole(shapes) {
  const fill = [];
  const stroke = [];
  for (const shape of shapes) {
    if (shape.role === 'stroke') {
      stroke.push(shape);
    } else {
      fill.push(shape);
    }
  }
  return {
    fill,
    stroke
  };
}

/**
 * CSS-variable-driven SVG icon with role-aware rendering.
 *
 * Each shape element has a role ("fill" or "stroke") that determines how it
 * behaves across variations. In bold mode, overlapping fill-role shapes get
 * auto-generated SVG masks for clean gap subtraction.
 *
 * @example
 * ```
 * <SVGIcon icon={bellIcon} variation="twotone" size="md" color="accent" />
 * ```
 */
export function SVGIcon({
  icon,
  variation = 'linear',
  size = 'md',
  color = 'primary',
  strokeWidth,
  style,
  ...props
}) {
  const uid = useId();
  const viewBox = icon.viewBox ?? '0 0 24 24';
  const hasSecondary = icon.secondary && icon.secondary.length > 0;
  const primarySplit = splitByRole(icon.primary);
  const secondarySplit = hasSecondary ? splitByRole(icon.secondary ?? []) : {
    fill: [],
    stroke: []
  };
  const allSecondary = [...secondarySplit.fill, ...secondarySplit.stroke];
  const useMask = needsMask(variation, primarySplit.fill, allSecondary);
  const maskId = useMask ? `${uid}-mask` : undefined;

  // Extract raw CSS property name from StyleX var reference: "var(--xABC)" -> "--xABC"
  const strokeWidthProp = iconVars['--icon-stroke-width'].replace(/^var\((.+)\)$/, '$1');
  const strokeWidthOverride = {
    [strokeWidthProp]: String(strokeWidth)
  };
  const overrideStyle = {
    ...style,
    ...(strokeWidth != null ? strokeWidthOverride : undefined)
  };

  // Decorative by default, meaningful when named — mirroring core Icon's
  // `label` logic. When the consumer passes an accessible name
  // (aria-label / aria-labelledby), expose the svg as role="img" instead of
  // hiding it: an aria-hidden element is removed from the accessibility
  // tree, so its accessible name would be ignored. Spread BEFORE {...props}
  // so an explicit aria-hidden/role from the consumer always wins.
  const hasAccessibleName = props['aria-label'] != null || props['aria-labelledby'] != null;
  const a11yProps = hasAccessibleName ? {
    role: 'img'
  } : {
    'aria-hidden': true
  };
  return /*#__PURE__*/_jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: viewBox,
    ...a11yProps,
    ...mergeProps(themeProps('svg-icon', {
      variation,
      size,
      color
    }), stylex.props(styles.root, colorStyles[color], variations[variation], opticalSize[size])),
    style: overrideStyle,
    ...props,
    children: [useMask && /*#__PURE__*/_jsx("defs", {
      children: /*#__PURE__*/_jsxs("mask", {
        id: maskId,
        children: [/*#__PURE__*/_jsx("rect", {
          width: "24",
          height: "24",
          fill: "white"
        }), renderMaskKnockouts([...secondarySplit.fill, ...secondarySplit.stroke])]
      })
    }), renderFillRoleShapes(primarySplit.fill, 'primary', maskId), renderStrokeRoleShapes(primarySplit.stroke, 'primary'), hasSecondary && !useMask && /*#__PURE__*/_jsxs(_Fragment, {
      children: [renderFillRoleShapes(secondarySplit.fill, 'secondary'), renderStrokeRoleShapes(secondarySplit.stroke, 'secondary')]
    })]
  });
}
SVGIcon.displayName = 'SVGIcon';