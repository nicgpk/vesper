// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Icon.tsx
 * @input Uses ReactSVGProps, icon components or semantic icon names
 * @output Exports Icon component, IconProps, IconColor, IconSize, IconType types
 * @position Core implementation; consumed by index.ts, tested by Icon.test.tsx
 *
 * Supports two modes:
 * - Component mode: Pass an SVG icon component (e.g. from @heroicons/react) — rendered
 *   directly with and spread SVG props.
 * - String mode: Pass a semantic name (e.g. 'close', 'chevronDown') — resolved from the
 *   theme's icon registry (or built-in fallback SVGs) and wrapped in a styled span.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Icon/Icon.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Icon/Icon.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Icon/index.ts (exports if types change)
 * - /apps/storybook/stories/Icon.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Icon/ (showcase blocks)
 */
import React from 'react';
import * as stylex from '@stylexjs/stylex';
import "../theme/tokens.stylex.js";
import { colorVars } from "../theme/tokens.stylex.js";
import { useThemeName } from "../theme/useTheme.js";
import { getIcon } from "./globalIconRegistry.js";
import { mergeProps } from "../utils/index.js";
import { themeProps } from "../utils/themeProps.js";
import { useIconSize } from "./IconDefaultSizeContext.js";
import { iconBoxSizeStyles, iconSizeStyles } from "./IconSize.stylex.js";
import { jsx as _jsx } from "react/jsx-runtime";
// =============================================================================
// Styles
// =============================================================================

const styles = {
  root: {
    kmuXW: "x2lah0s",
    $$css: true
  },
  span: {
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kmuXW: "x2lah0s",
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
  tertiary: {
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
  success: {
    kMwMTN: "xtjic6",
    $$css: true
  },
  error: {
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
  },
  blue: {
    kMwMTN: "x1fns2mt",
    $$css: true
  },
  red: {
    kMwMTN: "xeffzf7",
    $$css: true
  },
  green: {
    kMwMTN: "xmxeech",
    $$css: true
  },
  gray: {
    kMwMTN: "x1eyinzz",
    $$css: true
  },
  cyan: {
    kMwMTN: "x157w0xa",
    $$css: true
  },
  teal: {
    kMwMTN: "x1f3zxcb",
    $$css: true
  },
  yellow: {
    kMwMTN: "x1g6zdft",
    $$css: true
  },
  orange: {
    kMwMTN: "xxu74a4",
    $$css: true
  },
  pink: {
    kMwMTN: "x1kxxfg5",
    $$css: true
  },
  purple: {
    kMwMTN: "xzdw94u",
    $$css: true
  }
};

// =============================================================================
// Types
// =============================================================================

/**
 * Type for icon components that can be passed to Icon.
 * Use this type when accepting an icon prop in other components.
 */

/**
 * Props for Icon component.
 * Extends SVGProps to allow passing additional SVG attributes (used when icon is a component).
 */

/**
 * Derives the ARIA attributes for an icon from its `label` prop.
 *
 * - Non-empty `label` → meaningful image: `role="img"` + `aria-label`, and no
 *   `aria-hidden` (an `aria-hidden` element is removed from the accessibility
 *   tree, so its accessible name would be ignored).
 * - Omitted or empty `label` → decorative default: `aria-hidden="true"`.
 *
 * The result is spread BEFORE `{...props}` in both render modes so an explicit
 * `aria-hidden` / `role` / `aria-label` from the consumer always wins.
 */
function getIconA11yProps(label) {
  return label != null && label !== '' ? {
    role: 'img',
    'aria-label': label
  } : {
    'aria-hidden': 'true'
  };
}

// =============================================================================
// Component
// =============================================================================

/**
 * Renders an icon from the icon registry or a custom SVG component.
 *
 * @example
 * ```
 * <Icon icon="close" size="md" color="primary" />
 * ```
 */
export function Icon({
  icon,
  color = 'inherit',
  size: sizeProp,
  label,
  ref,
  className,
  style,
  xstyle,
  ...props
}) {
  const size = useIconSize(sizeProp);
  // Derive ARIA from `label`: decorative (aria-hidden) by default, or a
  // meaningful image (role="img" + aria-label) when `label` is non-empty.
  const a11yProps = getIconA11yProps(label);

  // String mode: resolve from icon registry, wrap in styled span
  if (typeof icon === 'string') {
    return /*#__PURE__*/_jsx(IconFromRegistry, {
      name: icon,
      color: color,
      size: size,
      a11yProps: a11yProps,
      className: className,
      style: style,
      xstyle: xstyle,
      spanProps: props
    });
  }

  // Component mode: render SVG component directly with ref forwarding
  const IconComponent = icon;
  return /*#__PURE__*/_jsx(IconComponent, {
    ref: ref
    // Derived a11y (decorative default or meaningful `label`) is spread
    // BEFORE {...props} so an explicit aria-hidden/role/aria-label from the
    // consumer still wins as an escape hatch.
    ,
    ...a11yProps,
    ...mergeProps(themeProps('icon', {
      size,
      color
    }), stylex.props(styles.root, colorStyles[color], iconSizeStyles[size], xstyle), className ?? undefined, style),
    ...props
  });
}
Icon.displayName = 'Icon';

// =============================================================================
// Internal: Registry Icon Renderer
// =============================================================================

/**
 * Internal component that resolves a semantic icon name from the registry
 * and renders it in a styled span with proper sizing.
 *
 * Extracted as a separate component so getIcon is only called
 * when the icon prop is a string.
 */
function IconFromRegistry({
  name,
  color,
  size,
  a11yProps,
  className,
  style,
  xstyle,
  spanProps
}) {
  const themeName = useThemeName();
  const resolvedIcon = getIcon(name, themeName);
  if (resolvedIcon == null) {
    return null;
  }

  // The styling props (className, style, xstyle) are handled here so they
  // COMPOSE with the internal astryx-icon + StyleX classes/styles instead of
  // being shadowed by the later spread: xstyle folds into stylex.props, and
  // className/style merge via mergeProps. Other span props keep their prior
  // precedence (spread before the internal merge).
  const restSpanProps = spanProps ?? {};
  return /*#__PURE__*/_jsx("span", {
    ...a11yProps,
    ...restSpanProps,
    ...mergeProps(themeProps('icon', {
      size,
      color
    }), stylex.props(styles.span, colorStyles[color], iconBoxSizeStyles[size], xstyle), className ?? undefined, style),
    children: resolvedIcon
  });
}

/**
 * Renders an icon slot value. Handles semantic names, ReactNode values, and
 * component types:
 * - If the value is a semantic icon name string, wraps it in Icon.
 * - If the value is a component (function or forwardRef object), wraps it in Icon.
 * - Otherwise, renders the ReactNode directly.
 */
export function renderIconSlot(icon, props) {
  if (typeof icon === 'string') {
    return /*#__PURE__*/_jsx(Icon, {
      icon: icon,
      ...props
    });
  }
  if (typeof icon === 'function' || typeof icon === 'object' && icon !== null && 'render' in icon) {
    return /*#__PURE__*/_jsx(Icon, {
      icon: icon,
      ...props
    });
  }
  return icon;
}