// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ToggleButton.tsx
 * @input Uses Button, React, StyleX, theme tokens
 * @output Exports ToggleButton component and types
 * @position Thin wrapper over Button; adds controlled toggle pattern
 *
 * ToggleButton wraps Button with `isPressed` and adds:
 * - `onPressedChange` from internal `onClick`; `pressedChangeAction` via Button
 * - `pressedIcon` for outline-to-filled icon swap
 * - Font weight shift on press with width reservation to prevent layout shift
 * - Group integration via ToggleButtonGroupContext
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ToggleButton/index.ts (exports if types change)
 * - /apps/storybook/stories/ToggleButton.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/ToggleButton/ (showcase blocks)
 */
import React, { useOptimistic } from 'react';
import * as stylex from '@stylexjs/stylex';
import "../theme/tokens.stylex.js";
import { colorVars, fontWeightVars } from "../theme/tokens.stylex.js";
import { Button } from "../Button/index.js";
import { useToggleButtonGroup } from "./ToggleButtonGroup.js";
import { themeProps } from "../utils/themeProps.js";

// =============================================================================
// Styles
// =============================================================================

/**
 * Font weight shift on press with width reservation trick.
 * A hidden span renders the same text at semibold weight to reserve
 * the wider width, preventing layout shift when toggling.
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const pressedStyles = {
  background: {
    kAXs8y: "x1kzknox",
    kWkggS: "xi89dp7 x1jzqe4",
    kMwMTN: "x1k5gbb1",
    $$css: true
  }
};
// =============================================================================
// Props
// =============================================================================

// =============================================================================
// Component
// =============================================================================

/**
 * A button that toggles between pressed and unpressed states.
 * Thin wrapper over Button — adds controlled toggle pattern,
 * icon swap, and font weight emphasis.
 *
 * Use for toolbar actions, view mode switches, and formatting controls.
 * For on/off settings, use Switch instead.
 *
 * Works standalone (with `isPressed`/`onPressedChange`) or inside
 * ToggleButtonGroup (which controls selection via `value`).
 *
 * @example
 * ```
 * const [isBold, setIsBold] = useState(false);
 * <ToggleButton
 *   label="Bold"
 *   icon={<BoldIcon />}
 *   isPressed={isBold}
 *   onPressedChange={setIsBold}
 * />
 * ```
 */
export function ToggleButton({
  ref,
  label,
  isPressed: isPressedProp,
  onPressedChange: onPressedChangeProp,
  pressedChangeAction,
  size: sizeProp,
  elevation = 'none',
  isDisabled: isDisabledProp = false,
  isLoading = false,
  icon,
  isIconOnly = false,
  pressedIcon,
  children,
  tooltip,
  value,
  xstyle,
  className: _className,
  style,
  ...props
}) {
  const group = useToggleButtonGroup();
  const committedPressed = group && value != null ? group.selectedValues.has(value) : isPressedProp ?? false;
  const size = sizeProp ?? group?.size ?? 'md';
  // Either source disabling this button is enough. `??` could not express that:
  // the group always supplies a boolean (its own prop defaults to false), so the
  // fallback never ran and an enabled group handed a member that had disabled
  // itself its availability back. A group still disables everything it contains
  // — that is the half `??` got right — but it cannot re-enable a member
  // (family:buttons FR3).
  const isDisabled = (group?.isDisabled ?? false) || isDisabledProp;
  const [optimisticPressed, setOptimisticPressed] = useOptimistic(committedPressed);
  const isPressed = optimisticPressed;
  // Both paths use the same in-flight intent, so re-clicks reverse a pending
  // toggle rather than deriving from the stale controlled value.
  const nextPressed = !isPressed;
  const resolvedIcon = isPressed && pressedIcon ? pressedIcon : icon;
  const handleClick = event => {
    if (isDisabled) {
      return;
    }
    if (group && value != null) {
      group.toggle(value);
      event.preventDefault();
      return;
    }
    onPressedChangeProp?.(nextPressed, event);
  };

  // Button runs onClick first and skips clickAction when the callback prevents
  // default. Its transition owns both the optimistic update and pending UI.
  const clickAction = pressedChangeAction && !(group && value != null) ? async () => {
    setOptimisticPressed(nextPressed);
    await pressedChangeAction(nextPressed);
  } : undefined;

  // isIconOnly prop is the source of truth for icon-only rendering.
  const labelContent = children != null ? /*#__PURE__*/_jsxs("span", {
    ...{
      className: "x3nfvp2 xdt5ytf x6s0dn4 xl56j7k"
    },
    children: [/*#__PURE__*/_jsx("span", {
      ...{
        0: {},
        1: {
          className: "x2mo6ok"
        }
      }[!!isPressed << 0],
      children: children
    }), /*#__PURE__*/_jsx("span", {
      ...{
        className: "x1lliihq x2mo6ok xqtp20y xb3r6kr xlshs6z x47corl"
      },
      "aria-hidden": "true",
      children: children
    })]
  }) : !isIconOnly ? /*#__PURE__*/_jsxs("span", {
    ...{
      className: "x3nfvp2 xdt5ytf x6s0dn4 xl56j7k"
    },
    children: [/*#__PURE__*/_jsx("span", {
      ...{
        0: {},
        1: {
          className: "x2mo6ok"
        }
      }[!!isPressed << 0],
      children: label
    }), /*#__PURE__*/_jsx("span", {
      ...{
        className: "x1lliihq x2mo6ok xqtp20y xb3r6kr xlshs6z x47corl"
      },
      "aria-hidden": "true",
      children: label
    })]
  }) : undefined;
  return /*#__PURE__*/_jsx(Button, {
    ref: ref,
    label: label,
    variant: "ghost",
    size: size,
    elevation: elevation,
    isDisabled: isDisabled,
    isLoading: isLoading,
    isInterruptible: true,
    isIconOnly: isIconOnly,
    "aria-pressed": isPressed,
    icon: resolvedIcon,
    tooltip: tooltip,
    ...themeProps('toggle-button', {
      isPressed: isPressed ? 'true' : 'false',
      elevation
    }),
    xstyle: [isPressed ? pressedStyles.background : undefined, xstyle],
    style: style,
    onClick: handleClick,
    clickAction: clickAction,
    ...props,
    children: labelContent
  });
}
ToggleButton.displayName = 'ToggleButton';