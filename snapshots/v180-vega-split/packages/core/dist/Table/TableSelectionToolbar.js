// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TableSelectionToolbar.tsx
 * @input Uses Toolbar, Button, and selection state from useTableSelectionState
 * @output Exports TableSelectionToolbar and its props
 * @position Product-composed selection UI; never injected by the Table plugin
 */
import { Button } from "../Button/index.js";
import { Toolbar } from "../Toolbar/index.js";
import { useTranslator } from "../i18n/index.js";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Selection-aware action surface that remains outside the Table plugin.
 *
 * The caller owns action content and placement. This component owns only the
 * shared Toolbar presentation, selected count, and complete clear command.
 */
export function TableSelectionToolbar({
  selection,
  label: labelFromProps,
  renderSelectionLabel,
  clearLabel: clearLabelFromProps,
  size = 'sm',
  variant = 'muted',
  ...toolbarProps
}) {
  const t = useTranslator();
  const label = labelFromProps ?? t('@astryx.table.selection.bulkActionsLabel');
  const clearLabel = clearLabelFromProps ?? t('@astryx.table.selection.clearAll');
  if (!selection.hasSelection) {
    return null;
  }
  const selectionLabel = renderSelectionLabel == null ? t('@astryx.table.selection.selectedCount', {
    count: selection.selectedCount
  }) : renderSelectionLabel(selection.selectedCount);
  return /*#__PURE__*/_jsx(Toolbar, {
    ...toolbarProps,
    label: label,
    size: size,
    variant: variant,
    endContent: /*#__PURE__*/_jsxs(_Fragment, {
      children: [/*#__PURE__*/_jsx("span", {
        children: selectionLabel
      }), /*#__PURE__*/_jsx(Button, {
        label: clearLabel,
        variant: "ghost",
        onClick: selection.clearSelection
      })]
    })
  });
}
TableSelectionToolbar.displayName = 'TableSelectionToolbar';