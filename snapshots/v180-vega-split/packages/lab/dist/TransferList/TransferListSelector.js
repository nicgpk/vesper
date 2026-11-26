// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TransferListSelector.tsx
 * @input Controlled option data, uncontrolled ComplexSelector state, TransferList, action controls, and the core i18n catalog
 * @output Exports the immediate-or-staged TransferListSelector composition with draft cleanup after dismissal
 * @position Lab collection input shell; consumed by the TransferList entry point, docs, and tests
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/TransferList/TransferListSelector.test.tsx
 * - /packages/lab/src/TransferList/TransferList.doc.mjs
 * - /packages/lab/src/TransferList/index.ts
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Button } from '@astryxdesign/core/Button';
import { ComplexSelector } from '@astryxdesign/core/ComplexSelector';
import { useTranslator } from '@astryxdesign/core/i18n';
import { HStack } from '@astryxdesign/core/Stack';
import '@astryxdesign/core/theme/tokens.stylex';
import { borderVars, colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import { TransferList } from "./TransferList.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const DEFAULT_SELECTOR_WIDTH = 'min(41rem, calc(100vw - 32px))';
const _temp = {
  kskxy: "x12ajvvl",
  kmVPX3: "x1717udv",
  kVQacm: "xb3r6kr",
  kaIpWk: "x1pjcqnp",
  "$$css": true
};
const styles = {
  content: width => [_temp, {
    kzqmXN: width != null ? "x5lhr3w" : width,
    ks0D6T: width != null ? "xf68679" : width,
    $$css: true
  }, {
    "--x-width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width),
    "--x-maxWidth": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width)
  }],
  footer: {
    kmuXW: "x2lah0s",
    kEafiO: "x11xkdxz",
    kPef9Z: "x13fuv20",
    kLZC3w: "x1pc3f07",
    kWkggS: "x10xzikg",
    $$css: true
  }
};
function areOrderedValuesEqual(first, second) {
  return first.length === second.length && first.every((item, index) => item === second[index]);
}
function ResetDraftAfterClose({
  isOpen,
  resetDraft
}) {
  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      resetDraft();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, resetDraft]);
  return null;
}

/**
 * A transfer-list field that opens in a selector popover.
 *
 * The field label, description, and trigger remain outside the popup. Changes
 * commit immediately by default. Set commitBehavior="staged" when the workflow
 * needs explicit Apply and Cancel actions.
 *
 * @example
 * ```
 * <TransferListSelector
 *   label="Visible fields"
 *   options={columnOptions}
 *   value={visibleColumns}
 *   onChange={setVisibleColumns}
 * />
 * ```
 */
export function TransferListSelector({
  label,
  description,
  options,
  value,
  onChange,
  changeAction,
  commitBehavior = 'immediate',
  triggerLabel,
  isDisabled,
  isLoading,
  width,
  applyLabel: applyLabelFromProps,
  cancelLabel: cancelLabelFromProps,
  selectedLabel,
  availableLabel,
  hasSearch,
  searchLabel,
  searchPlaceholder,
  isReorderable,
  hasSelectAll,
  hasClear,
  renderOption,
  selectedEmptyText,
  availableEmptyText,
  noResultsText,
  ...selectorProps
}) {
  const t = useTranslator();
  const applyLabel = applyLabelFromProps ?? t('@astryx.transferListSelector.apply');
  const cancelLabel = cancelLabelFromProps ?? t('@astryx.transferListSelector.cancel');
  const [draftValue, setDraftValue] = useState(value);
  const previousAppliedValueRef = useRef([...value]);
  const previousCommitBehaviorRef = useRef(commitBehavior);
  const resetDraft = useCallback(() => {
    setDraftValue([...value]);
  }, [value]);
  useEffect(() => {
    const previousAppliedValue = previousAppliedValueRef.current;
    previousAppliedValueRef.current = [...value];
    if (!areOrderedValuesEqual(previousAppliedValue, value)) {
      resetDraft();
    }
  }, [resetDraft, value]);
  useEffect(() => {
    if (previousCommitBehaviorRef.current !== commitBehavior) {
      resetDraft();
    }
    previousCommitBehaviorRef.current = commitBehavior;
  }, [commitBehavior, resetDraft]);
  const resolvedWidth = typeof width === 'number' ? `${width}px` : width ?? DEFAULT_SELECTOR_WIDTH;
  return /*#__PURE__*/_jsx(ComplexSelector, {
    ...selectorProps,
    label: label,
    description: description,
    value: value,
    onChange: onChange,
    changeAction: changeAction,
    triggerLabel: triggerLabel ?? t('@astryx.transferListSelector.triggerLabel', {
      count: value.length
    }),
    isDisabled: isDisabled,
    isLoading: isLoading,
    width: resolvedWidth,
    contentXstyle: styles.content(resolvedWidth),
    children: (appliedValue, commit, close, state) => {
      const isStaged = commitBehavior === 'staged';
      const transferListValue = isStaged ? draftValue : appliedValue;
      return /*#__PURE__*/_jsxs("div", {
        "aria-busy": state.isBusy || undefined,
        ...{
          className: "x78zum5 xdt5ytf xeuugli x2lwn1j xedcshv"
        },
        children: [isStaged && /*#__PURE__*/_jsx(ResetDraftAfterClose, {
          isOpen: state.isOpen,
          resetDraft: resetDraft
        }), /*#__PURE__*/_jsx("fieldset", {
          disabled: isDisabled,
          ...{
            0: {
              className: "x1iyjqo2 xs83m0k xdl72j9 xeuugli x2lwn1j x1ghz6dp x1717udv xc342km xng3xce x1odjw0f xish69e"
            },
            1: {
              className: "x1iyjqo2 xs83m0k xdl72j9 xeuugli x2lwn1j x1ghz6dp x1717udv xc342km xng3xce x1odjw0f xish69e x19v85br x16khyan"
            }
          }[!!state.isBusy << 0],
          children: /*#__PURE__*/_jsx(TransferList, {
            label: label,
            isLabelHidden: true,
            options: options,
            value: transferListValue,
            onChange: nextValue => {
              // Now that busy no longer disables the fieldset, the controls
              // stay live while a change is in flight; ignore transfers
              // until it settles so one pending action cannot be stacked.
              if (state.isBusy) {
                return;
              }
              if (isStaged) {
                setDraftValue(nextValue);
              } else {
                commit([...nextValue]);
              }
            },
            selectedLabel: selectedLabel,
            availableLabel: availableLabel,
            hasSearch: hasSearch,
            searchLabel: searchLabel,
            searchPlaceholder: searchPlaceholder,
            isReorderable: isReorderable,
            hasSelectAll: hasSelectAll,
            hasClear: hasClear,
            renderOption: renderOption,
            selectedEmptyText: selectedEmptyText,
            availableEmptyText: availableEmptyText,
            noResultsText: noResultsText
          })
        }), isStaged && /*#__PURE__*/_jsxs(HStack, {
          gap: 2,
          hAlign: "end",
          padding: 3,
          xstyle: styles.footer,
          children: [/*#__PURE__*/_jsx(Button, {
            label: cancelLabel,
            variant: "ghost",
            size: "sm",
            onClick: () => {
              resetDraft();
              close();
            }
          }), /*#__PURE__*/_jsx(Button, {
            label: applyLabel,
            variant: "primary",
            size: "sm",
            isDisabled: isDisabled || state.isBusy,
            isLoading: state.isBusy,
            onClick: () => {
              if (!areOrderedValuesEqual(draftValue, value)) {
                commit([...draftValue]);
              }
              close();
            }
          })]
        })]
      });
    }
  });
}
TransferListSelector.displayName = 'TransferListSelector';