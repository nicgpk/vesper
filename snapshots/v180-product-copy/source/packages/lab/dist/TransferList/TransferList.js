// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TransferList.tsx
 * @input Controlled option data, React DOM portals, local action glyphs, shared Lab reorder styles, and the core i18n catalog
 * @output Exports TransferList with immediate transfers, vertical reordering, and responsive scroll ownership
 * @position Lab collection input; consumed by index.ts, TransferListSelector, docs, and tests
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/TransferList/TransferList.doc.mjs
 * - /packages/lab/src/TransferList/TransferList.test.tsx
 * - /packages/lab/src/TransferList/index.ts
 */
import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { flushSync } from 'react-dom';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Item } from '@astryxdesign/core/Item';
import { useLayer } from '@astryxdesign/core/Layer';
import { List } from '@astryxdesign/core/List';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { useAnnounce } from '@astryxdesign/core/hooks';
import { useTranslator } from '@astryxdesign/core/i18n';
import '@astryxdesign/core/theme/tokens.stylex';
import { borderVars, colorVars, sizeVars, spacingVars, typeScaleVars } from '@astryxdesign/core/theme/tokens.stylex';
import { focusOutlineStyles, mergeProps, mergeRefs, themeProps } from '@astryxdesign/core/utils';
import { reorderStyles } from "../reorderStyles.js";
import "./tokens.stylex.js";
import { transferListVars } from "./tokens.stylex.js";

// Lucide glyphs the shared icon registry does not carry (there is no `add` or
// `grip` semantic name). Typed as icon components and rendered through `Icon`
// so sizing, colour and a11y come from the icon pipeline rather than a raw
// inline `<svg>`. Removal reuses the registry `close` glyph instead.
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function PlusIcon(props) {
  return /*#__PURE__*/_jsxs("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: [/*#__PURE__*/_jsx("path", {
      d: "M5 12h14"
    }), /*#__PURE__*/_jsx("path", {
      d: "M12 5v14"
    })]
  });
}
function GripVerticalIcon(props) {
  return /*#__PURE__*/_jsxs("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: [/*#__PURE__*/_jsx("circle", {
      cx: "9",
      cy: "5",
      r: "1"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "9",
      cy: "12",
      r: "1"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "9",
      cy: "19",
      r: "1"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "15",
      cy: "5",
      r: "1"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "15",
      cy: "12",
      r: "1"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "15",
      cy: "19",
      r: "1"
    })]
  });
}
const styles = {
  root: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kOIVth: "xxhr3t",
    k7Eaqz: "xeuugli",
    k9g6sI: "x12h1iku",
    $$css: true
  },
  search: {
    kUk6DE: "x98rzlu",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  panel: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    k7Eaqz: "xeuugli",
    kVQacm: "xb3r6kr",
    kInvED: "x1wfwxd8 x1bqaal",
    $$css: true
  },
  panelDivider: {
    k2ei4v: "xgbv0en x12eanku",
    kVhnKS: "x1t7ytsu",
    kGJrpR: "x1j92z86",
    kEafiO: "x972fbf x165mbd2",
    kPef9Z: "x13fuv20",
    kLZC3w: "x1pc3f07",
    $$css: true
  },
  headerAction: {
    kZKoxP: "xt7dq6l",
    kAzted: "x1gdqauq",
    k8WAf4: "xt970qd",
    kg3NbH: "xnjsko4",
    kaIpWk: "x2u8bby",
    kMwMTN: "xjse4m1",
    kKwaWg: "x18o3ruo xrz1bfo xuqm82a",
    kybGjl: "x1hl2dhg xg9gykk",
    kGuDYH: "xjm74w1",
    k63SB2: "xxovm9e",
    kLWn49: "xw6l6zx",
    $$css: true
  },
  item: {
    k7Eaqz: "xeuugli",
    kg3NbH: "xrrkdod",
    $$css: true
  },
  reorderHandle: {
    keTefX: "x1m70ojl",
    $$css: true
  },
  draggingItem: {
    kWkggS: "xgcxg3y",
    $$css: true
  },
  dragPreviewContainer: {
    kH6xsr: "x3ct3a4",
    $$css: true
  }
};
const dynamicStyles = {
  dragPreview: width => [{
    kzqmXN: width != null ? "x5lhr3w" : width,
    $$css: true
  }, {
    "--x-width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width)
  }]
};
function moveItem(value, fromIndex, toIndex) {
  const nextValue = [...value];
  const [item] = nextValue.splice(fromIndex, 1);
  nextValue.splice(toIndex, 0, item);
  return nextValue;
}

// Case folding is locale-independent here, matching Selector, MultiSelector,
// and CommandPalette. Locale-sensitive folding would mean raw Intl access,
// which the shipped packages route through the provider instead.
function matchesQuery(option, query) {
  if (query === '') {
    return true;
  }
  const description = typeof option.description === 'string' ? option.description : '';
  return [option.label, description, option.group ?? ''].some(part => part.toLowerCase().includes(query));
}

/**
 * A controlled dual-panel collection input for choosing and ordering values.
 * Selection, ordering, drafts, persistence, and saved views stay explicit in
 * the consumer; this component owns only search and active gesture state.
 *
 * @example
 * ```
 * const [columns, setColumns] = useState(['name', 'status']);
 * <TransferList
 *   label="Table columns"
 *   options={columnOptions}
 *   value={columns}
 *   onChange={setColumns}
 * />
 * ```
 */
export function TransferList({
  label,
  isLabelHidden = false,
  description,
  options,
  value,
  onChange,
  selectedLabel: selectedLabelFromProps,
  availableLabel: availableLabelFromProps,
  hasSearch = false,
  searchLabel,
  searchPlaceholder: searchPlaceholderFromProps,
  isReorderable = true,
  hasSelectAll = false,
  hasClear = false,
  renderOption,
  selectedEmptyText: selectedEmptyTextFromProps,
  availableEmptyText: availableEmptyTextFromProps,
  noResultsText: noResultsTextFromProps,
  xstyle,
  className,
  style,
  ref,
  role,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...restProps
}) {
  const t = useTranslator();
  const selectedLabel = selectedLabelFromProps ?? t('@astryx.transferList.selectedLabel');
  const availableLabel = availableLabelFromProps ?? t('@astryx.transferList.availableLabel');
  const searchPlaceholder = searchPlaceholderFromProps ?? t('@astryx.transferList.searchPlaceholder');
  const selectedEmptyText = selectedEmptyTextFromProps ?? t('@astryx.transferList.selectedEmpty');
  const availableEmptyText = availableEmptyTextFromProps ?? t('@astryx.transferList.availableEmpty');
  const noResultsText = noResultsTextFromProps ?? t('@astryx.transferList.noResults');
  const labelId = useId();
  const descriptionId = useId();
  const selectedHeadingId = useId();
  const availableHeadingId = useId();
  const reorderInstructionsId = useId();
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const selectedPanelRef = useRef(null);
  const availablePanelRef = useRef(null);
  const selectedRowRefs = useRef(new Map());
  const dragPreviewRef = useRef(null);
  // The ghost that follows the pointer is a layer, not a portal into body.
  // Its coordinates come from getBoundingClientRect, so they are viewport
  // relative; the top layer is the only host that reads them that way from
  // any scroll position and still paints above a Popover or open dialog.
  const dragPreviewLayer = useLayer({
    mode: 'fixed'
  });
  const currentValueRef = useRef(value);
  const reorderSessionRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [query, setQuery] = useState('');
  const [reorderSession, setReorderSessionState] = useState(null);
  const announce = useAnnounce();
  currentValueRef.current = value;
  const setReorderSession = useCallback(nextSession => {
    reorderSessionRef.current = nextSession;
    setReorderSessionState(nextSession);
  }, []);
  const optionByValue = useMemo(() => {
    const map = new Map();
    options.forEach(option => map.set(option.value, option));
    return map;
  }, [options]);
  const selectedValues = useMemo(() => new Set(value), [value]);
  const normalizedQuery = query.trim().toLowerCase();
  const selectedOptions = useMemo(() => value.map(optionValue => optionByValue.get(optionValue)).filter(option => option != null && matchesQuery(option, normalizedQuery)), [normalizedQuery, optionByValue, value]);
  const availableOptions = useMemo(() => options.filter(option => !selectedValues.has(option.value) && matchesQuery(option, normalizedQuery)), [normalizedQuery, options, selectedValues]);
  const groupedAvailable = useMemo(() => {
    const groups = new Map();
    availableOptions.forEach(option => {
      const group = option.group ?? '';
      const items = groups.get(group);
      if (items) {
        items.push(option);
      } else {
        groups.set(group, [option]);
      }
    });
    return Array.from(groups.entries());
  }, [availableOptions]);
  const pointerPlacement = useMemo(() => {
    if (reorderSession?.mode !== 'pointer' || !reorderSession.hasPointerMoved || reorderSession.toIndex === reorderSession.fromIndex) {
      return null;
    }
    const remainingValues = reorderSession.originalValue.filter(optionValue => optionValue !== reorderSession.value);
    const beforeValue = remainingValues[reorderSession.toIndex];
    if (beforeValue != null) {
      return {
        value: beforeValue,
        position: 'before'
      };
    }
    const afterValue = remainingValues.at(-1);
    return afterValue == null ? null : {
      value: afterValue,
      position: 'after'
    };
  }, [reorderSession]);
  const previewCloneValue = reorderSession?.mode === 'pointer' ? reorderSession.value : null;
  useLayoutEffect(() => {
    const previewHost = dragPreviewRef.current;
    if (previewHost == null || previewCloneValue == null) {
      return;
    }
    const sourceRow = selectedRowRefs.current.get(previewCloneValue);
    if (sourceRow == null) {
      return;
    }
    const clone = sourceRow.cloneNode(true);
    previewHost.style.direction = getComputedStyle(sourceRow).direction;
    clone.style.opacity = '1';
    clone.setAttribute('aria-hidden', 'true');
    const clonedElements = [clone, ...clone.querySelectorAll('*')];
    for (const element of clonedElements) {
      element.removeAttribute('id');
      element.removeAttribute('aria-describedby');
      element.removeAttribute('aria-labelledby');
      element.removeAttribute('name');
      for (const attribute of Array.from(element.attributes)) {
        if (attribute.name.startsWith('data-transfer-list-')) {
          element.removeAttribute(attribute.name);
        }
      }
      element.setAttribute('tabindex', '-1');
    }
    previewHost.replaceChildren(clone);
    return () => {
      previewHost.replaceChildren();
      previewHost.style.removeProperty('direction');
    };
  }, [previewCloneValue]);
  const commit = useCallback(nextValue => {
    currentValueRef.current = nextValue;
    onChange(nextValue);
  }, [onChange]);
  const focusAfterTransfer = useCallback((side, index) => {
    const moveFocus = () => {
      const panel = side === 'selected' ? selectedPanelRef.current : availablePanelRef.current;
      const actions = panel?.querySelectorAll(`[data-transfer-list-action="${side}"]:not([disabled]):not([aria-disabled="true"])`);
      if (actions && actions.length > 0) {
        actions[Math.min(index, actions.length - 1)]?.focus();
      } else if (hasSearch) {
        searchRef.current?.focus();
      } else {
        panel?.focus();
      }
    };
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(moveFocus);
    } else {
      setTimeout(moveFocus, 0);
    }
  }, [hasSearch]);
  const addOption = useCallback((option, index) => {
    if (option.isTransferDisabled || currentValueRef.current.includes(option.value)) {
      return;
    }
    const nextValue = [...currentValueRef.current, option.value];
    commit(nextValue);
    announce(t('@astryx.transferList.announceAdded', {
      label: option.label,
      count: nextValue.length
    }));
    focusAfterTransfer('available', index);
  }, [announce, commit, focusAfterTransfer, t]);
  const removeOption = useCallback((option, index) => {
    if (option.isTransferDisabled) {
      return;
    }
    const nextValue = currentValueRef.current.filter(item => item !== option.value);
    commit(nextValue);
    announce(t('@astryx.transferList.announceRemoved', {
      label: option.label,
      count: nextValue.length
    }));
    focusAfterTransfer('selected', index);
  }, [announce, commit, focusAfterTransfer, t]);
  const addAll = useCallback(() => {
    const additions = options.filter(option => !option.isTransferDisabled && !currentValueRef.current.includes(option.value)).map(option => option.value);
    if (additions.length > 0) {
      commit([...currentValueRef.current, ...additions]);
      announce(t('@astryx.transferList.announceBulkAdded', {
        count: additions.length
      }));
    }
  }, [announce, commit, options, t]);
  const clearSelected = useCallback(() => {
    const nextValue = currentValueRef.current.filter(optionValue => {
      const option = optionByValue.get(optionValue);
      return option == null || option.isTransferDisabled;
    });
    const removed = currentValueRef.current.length - nextValue.length;
    if (removed > 0) {
      commit(nextValue);
      announce(t('@astryx.transferList.announceBulkRemoved', {
        count: removed
      }));
    }
  }, [announce, commit, optionByValue, t]);
  const movableRange = useCallback((optionValue, orderedValue) => {
    const index = orderedValue.indexOf(optionValue);
    let start = 0;
    let end = orderedValue.length - 1;
    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      const option = optionByValue.get(orderedValue[cursor]);
      if (option == null || option.isReorderDisabled) {
        start = cursor + 1;
        break;
      }
    }
    for (let cursor = index + 1; cursor < orderedValue.length; cursor += 1) {
      const option = optionByValue.get(orderedValue[cursor]);
      if (option == null || option.isReorderDisabled) {
        end = cursor - 1;
        break;
      }
    }
    return {
      index,
      start,
      end
    };
  }, [optionByValue]);
  const moveOption = useCallback((optionValue, requestedIndex) => {
    const nextValue = [...currentValueRef.current];
    const {
      index,
      start,
      end
    } = movableRange(optionValue, nextValue);
    if (index < 0) {
      return false;
    }
    const target = Math.max(start, Math.min(end, requestedIndex));
    if (target === index) {
      return false;
    }
    nextValue.splice(index, 1);
    nextValue.splice(target, 0, optionValue);
    commit(nextValue);
    return true;
  }, [commit, movableRange]);
  const beginReorder = useCallback((option, mode, pointerGeometry) => {
    if (option.isReorderDisabled || !isReorderable) {
      return;
    }
    const index = currentValueRef.current.indexOf(option.value);
    if (index < 0 || mode === 'pointer' && pointerGeometry == null) {
      return;
    }
    setReorderSession({
      value: option.value,
      label: option.label,
      mode,
      originalValue: [...currentValueRef.current],
      fromIndex: index,
      toIndex: index,
      ...pointerGeometry,
      hasPointerMoved: false
    });
    if (mode === 'keyboard') {
      announce(t('@astryx.transferList.announceGrabbed', {
        label: option.label,
        position: index + 1,
        total: currentValueRef.current.length
      }));
    }
  }, [announce, isReorderable, setReorderSession, t]);
  const finishReorder = useCallback(cancelled => {
    const session = reorderSessionRef.current;
    if (!session) {
      return;
    }
    if (session.mode === 'pointer') {
      if (cancelled || !session.hasPointerMoved) {
        setReorderSession(null);
        if (cancelled) {
          announce(t('@astryx.transferList.announceMoveCancelled', {
            label: session.label
          }));
        }
        return;
      }
      const hasChanged = session.fromIndex !== session.toIndex;
      const nextValue = moveItem(session.originalValue, session.fromIndex, session.toIndex);
      flushSync(() => setReorderSession(null));
      if (hasChanged) {
        commit(nextValue);
        announce(t('@astryx.transferList.announceDropped', {
          label: session.label,
          position: session.toIndex + 1,
          total: session.originalValue.length
        }));
      } else {
        announce(t('@astryx.transferList.announceReturned', {
          label: session.label,
          position: session.fromIndex + 1
        }));
      }
      return;
    }
    if (cancelled) {
      commit(session.originalValue);
      announce(t('@astryx.transferList.announceMoveCancelled', {
        label: session.label
      }));
    } else {
      const index = currentValueRef.current.indexOf(session.value);
      announce(t('@astryx.transferList.announceDropped', {
        label: session.label,
        position: index + 1,
        total: currentValueRef.current.length
      }));
    }
    setReorderSession(null);
  }, [announce, commit, setReorderSession, t]);
  const handleReorderClick = useCallback(option => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (reorderSessionRef.current?.value === option.value) {
      finishReorder(false);
    } else {
      beginReorder(option, 'keyboard');
    }
  }, [beginReorder, finishReorder]);
  const handleReorderKeyDown = useCallback((event, option) => {
    const session = reorderSessionRef.current;
    if (session?.value !== option.value || session.mode !== 'keyboard') {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      finishReorder(true);
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      finishReorder(false);
      return;
    }
    const {
      index,
      start,
      end
    } = movableRange(option.value, currentValueRef.current);
    const targets = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      Home: start,
      End: end
    };
    const target = targets[event.key];
    if (target == null) {
      return;
    }
    event.preventDefault();
    if (moveOption(option.value, target)) {
      const nextIndex = currentValueRef.current.indexOf(option.value);
      announce(t('@astryx.transferList.announceMovedToPosition', {
        label: option.label,
        position: nextIndex + 1,
        total: currentValueRef.current.length
      }));
    }
  }, [announce, finishReorder, movableRange, moveOption, t]);
  const handlePointerDown = useCallback((event, option) => {
    if (event.button !== 0 || option.isReorderDisabled) {
      return;
    }
    const sourceRow = selectedRowRefs.current.get(option.value);
    if (sourceRow == null) {
      return;
    }
    const bounds = sourceRow.getBoundingClientRect();
    suppressClickRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    beginReorder(option, 'pointer', {
      pointerId: event.pointerId,
      pointerStartY: event.clientY,
      pointerOffsetY: event.clientY - bounds.top,
      pointerClientY: event.clientY,
      previewX: bounds.left,
      previewWidth: bounds.width
    });
  }, [beginReorder]);
  const handlePointerMove = useCallback((event, option) => {
    const session = reorderSessionRef.current;
    if (session?.value !== option.value || session.mode !== 'pointer' || session.pointerId !== event.pointerId) {
      return;
    }
    const verticalDistance = event.clientY - (session.pointerStartY ?? event.clientY);
    const hasCrossedThreshold = session.hasPointerMoved || Math.abs(verticalDistance) >= 5;
    let targetIndex = session.fromIndex;
    if (hasCrossedThreshold) {
      event.preventDefault();
      const {
        start,
        end
      } = movableRange(session.value, session.originalValue);
      const remainingValues = session.originalValue.filter(optionValue => optionValue !== session.value);
      const candidates = session.originalValue.map((optionValue, originalIndex) => ({
        optionValue,
        originalIndex
      })).filter(candidate => candidate.optionValue !== session.value && candidate.originalIndex >= start && candidate.originalIndex <= end).map(candidate => ({
        row: selectedRowRefs.current.get(candidate.optionValue),
        targetIndex: remainingValues.indexOf(candidate.optionValue)
      })).filter(candidate => candidate.row != null);
      if (candidates.length > 0) {
        targetIndex = candidates[candidates.length - 1].targetIndex + 1;
        for (const candidate of candidates) {
          const bounds = candidate.row.getBoundingClientRect();
          if (event.clientY < bounds.top + bounds.height / 2) {
            targetIndex = candidate.targetIndex;
            break;
          }
        }
        targetIndex = Math.max(start, Math.min(end, targetIndex));
      }
    }
    const nextSession = {
      ...session,
      pointerClientY: event.clientY,
      hasPointerMoved: hasCrossedThreshold,
      toIndex: targetIndex
    };
    setReorderSession(nextSession);
    if (hasCrossedThreshold && session.toIndex !== targetIndex) {
      announce(t('@astryx.transferList.announceMovedToPosition', {
        label: option.label,
        position: targetIndex + 1,
        total: session.originalValue.length
      }));
    }
  }, [announce, movableRange, setReorderSession, t]);
  const handlePointerEnd = useCallback((event, cancelled) => {
    const session = reorderSessionRef.current;
    if (session?.mode !== 'pointer' || session.pointerId !== event.pointerId) {
      return;
    }
    if (cancelled) {
      suppressClickRef.current = false;
    } else {
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    finishReorder(cancelled);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  }, [finishReorder]);
  const handleSearch = useCallback(nextQuery => {
    setQuery(nextQuery);
    const normalized = nextQuery.trim().toLowerCase();
    if (normalized === '') {
      announce('');
    } else {
      const count = options.filter(option => matchesQuery(option, normalized)).length;
      announce(t('@astryx.transferList.announceSearchResults', {
        count
      }));
    }
  }, [announce, options, t]);
  const optionActions = (option, side, index) => {
    const isTransferDisabled = option.isTransferDisabled === true;
    const disabledReason = option.disabledMessage ?? t('@astryx.transferList.transferDisabled', {
      label: option.label
    });
    if (side === 'available') {
      return /*#__PURE__*/_jsx(IconButton, {
        label: t('@astryx.transferList.addOption', {
          label: option.label
        }),
        icon: /*#__PURE__*/_jsx(Icon, {
          icon: PlusIcon,
          size: "sm"
        }),
        size: "sm",
        variant: "ghost",
        isDisabled: isTransferDisabled,
        tooltip: isTransferDisabled ? disabledReason : undefined,
        "data-transfer-list-action": "available",
        onClick: () => addOption(option, index)
      });
    }
    return /*#__PURE__*/_jsx(IconButton, {
      label: t('@astryx.transferList.removeOption', {
        label: option.label
      }),
      icon: /*#__PURE__*/_jsx(Icon, {
        icon: "close",
        size: "sm"
      }),
      size: "sm",
      variant: "ghost",
      isDisabled: isTransferDisabled,
      tooltip: isTransferDisabled ? disabledReason : undefined,
      "data-transfer-list-action": "selected",
      onClick: () => removeOption(option, index)
    });
  };
  const dragPreviewPosition = reorderSession?.mode === 'pointer' && reorderSession.pointerClientY != null && reorderSession.pointerOffsetY != null && reorderSession.previewX != null && reorderSession.previewWidth != null ? {
    x: reorderSession.previewX,
    y: reorderSession.pointerClientY - reorderSession.pointerOffsetY,
    width: reorderSession.previewWidth
  } : null;
  const isDraggingPreview = dragPreviewPosition != null;
  const {
    show: showDragPreview,
    hide: hideDragPreview
  } = dragPreviewLayer;
  useEffect(() => {
    if (!isDraggingPreview) {
      return undefined;
    }
    showDragPreview();
    return hideDragPreview;
  }, [isDraggingPreview, showDragPreview, hideDragPreview]);
  const reorderControl = option => {
    if (!isReorderable) {
      return undefined;
    }
    const active = reorderSession?.value === option.value;
    const isReorderDisabled = option.isReorderDisabled === true;
    const disabledReason = option.disabledMessage ?? t('@astryx.transferList.reorderDisabled', {
      label: option.label
    });
    return /*#__PURE__*/_jsx(IconButton, {
      label: t('@astryx.transferList.reorderOption', {
        label: option.label
      }),
      "aria-describedby": reorderInstructionsId,
      "aria-pressed": active,
      icon: /*#__PURE__*/_jsx(Icon, {
        icon: GripVerticalIcon,
        size: "sm"
      }),
      size: "sm",
      variant: "ghost",
      isDisabled: isReorderDisabled,
      tooltip: isReorderDisabled ? disabledReason : undefined,
      xstyle: [styles.reorderHandle, reorderStyles.handle, active && reorderStyles.handleActive],
      onClick: () => handleReorderClick(option),
      onKeyDown: event => handleReorderKeyDown(event, option),
      onPointerDown: event => handlePointerDown(event, option),
      onPointerMove: event => handlePointerMove(event, option),
      onPointerUp: event => handlePointerEnd(event, false),
      onPointerCancel: event => handlePointerEnd(event, true),
      onLostPointerCapture: event => {
        const session = reorderSessionRef.current;
        if (session?.mode === 'pointer' && session.pointerId === event.pointerId) {
          suppressClickRef.current = false;
          finishReorder(true);
        }
      }
    });
  };
  const transferItem = (option, side, index) => {
    const active = reorderSession?.value === option.value;
    const isPointerSource = active && reorderSession?.mode === 'pointer';
    const dropPosition = pointerPlacement?.value === option.value ? pointerPlacement.position : null;
    const orderedIndex = currentValueRef.current.indexOf(option.value);
    return /*#__PURE__*/_jsx(Item, {
      as: "li",
      ref: node => {
        if (side !== 'selected') {
          return;
        }
        if (node == null) {
          selectedRowRefs.current.delete(option.value);
        } else {
          selectedRowRefs.current.set(option.value, node);
        }
      },
      density: "compact",
      startContent: side === 'selected' ? reorderControl(option) : undefined,
      label: renderOption?.(option) ?? option.label,
      endContent: optionActions(option, side, index),
      xstyle: [styles.item, active && reorderSession?.mode === 'keyboard' && styles.draggingItem, isPointerSource && reorderStyles.source, dropPosition === 'before' && reorderStyles.dropBefore, dropPosition === 'after' && reorderStyles.dropAfter],
      "data-transfer-list-row": side === 'selected' ? option.value : undefined,
      "data-transfer-list-reorder-source": isPointerSource || undefined,
      "data-transfer-list-drop-target": dropPosition ?? undefined,
      "data-transfer-list-index": side === 'selected' ? String(orderedIndex) : undefined,
      ...themeProps('transfer-list-item', {
        side,
        state: option.isTransferDisabled || option.isReorderDisabled ? 'disabled' : active ? 'reordering' : 'enabled'
      })
    }, option.value);
  };
  const describedBy = [ariaDescribedBy, description != null ? descriptionId : undefined].filter(Boolean).join(' ') || undefined;
  return /*#__PURE__*/_jsxs("div", {
    ref: mergeRefs(ref, rootRef),
    ...restProps,
    ...mergeProps(themeProps('transfer-list'), stylex.props(styles.root, xstyle), className, style),
    role: role ?? 'group',
    "aria-labelledby": ariaLabelledBy ?? labelId,
    "aria-describedby": describedBy,
    children: [/*#__PURE__*/_jsxs("div", {
      ...{
        className: "x78zum5 xdt5ytf xzye2dw xrrkdod"
      },
      children: [isLabelHidden ? /*#__PURE__*/_jsx(VisuallyHidden, {
        id: labelId,
        children: label
      }) : /*#__PURE__*/_jsx(Text, {
        id: labelId,
        type: "label",
        display: "block",
        children: label
      }), description != null && /*#__PURE__*/_jsx(Text, {
        id: descriptionId,
        type: "supporting",
        display: "block",
        children: description
      })]
    }), hasSearch && /*#__PURE__*/_jsx("div", {
      ...{
        className: "x78zum5 xuk3077 x1txdalj xeuugli x1b2ylru"
      },
      children: /*#__PURE__*/_jsx(TextInput, {
        ref: searchRef,
        role: "searchbox",
        label: searchLabel ?? t('@astryx.transferList.searchLabel', {
          label
        }),
        isLabelHidden: true,
        value: query,
        placeholder: searchPlaceholder,
        startIcon: /*#__PURE__*/_jsx(Icon, {
          icon: "search",
          size: "sm",
          color: "secondary"
        }),
        hasClear: true,
        width: "100%",
        xstyle: styles.search,
        onChange: handleSearch
      })
    }), /*#__PURE__*/_jsx(VisuallyHidden, {
      id: reorderInstructionsId,
      children: t('@astryx.transferList.reorderInstructions')
    }), /*#__PURE__*/_jsxs("div", {
      ...mergeProps(themeProps('transfer-list-collection'), {
        className: "xrvj5dj xcjjqqt x1sp3fdr xxhr3t xeuugli"
      }),
      children: [/*#__PURE__*/_jsxs("div", {
        ref: selectedPanelRef,
        role: "group",
        "aria-labelledby": selectedHeadingId,
        tabIndex: -1,
        ...mergeProps(themeProps('transfer-list-panel', {
          side: 'selected'
        }), stylex.props(focusOutlineStyles.focusVisible, styles.panel)),
        children: [/*#__PURE__*/_jsxs("div", {
          ...{
            className: "x78zum5 x6s0dn4 x1qughib x1txdalj xjbqb8w x101j7pr xce4md1 xrrkdod x92x3c3 x1q0q8m5 xw8gpjh"
          },
          children: [/*#__PURE__*/_jsx(Text, {
            id: selectedHeadingId,
            type: "label",
            color: "secondary",
            children: selectedLabel
          }), hasClear && /*#__PURE__*/_jsx(Button, {
            label: t('@astryx.transferList.clear'),
            size: "sm",
            variant: "ghost",
            xstyle: styles.headerAction,
            "data-transfer-list-header-action": "true",
            isDisabled: !value.some(optionValue => !optionByValue.get(optionValue)?.isTransferDisabled),
            onClick: clearSelected
          })]
        }), /*#__PURE__*/_jsx("div", {
          "data-transfer-list-panel-body": "selected",
          ...{
            className: "xu95rz8 x2opm4d x9rxgia xcpr047 x1odjw0f x2kikmz xish69e xf3ta42 x185mbhu x19acri0 x1717udv"
          },
          children: selectedOptions.length > 0 ? /*#__PURE__*/_jsx(List, {
            density: "compact",
            header: /*#__PURE__*/_jsx(VisuallyHidden, {
              children: selectedLabel
            }),
            children: selectedOptions.map((option, index) => transferItem(option, 'selected', index))
          }) : /*#__PURE__*/_jsx("div", {
            "data-transfer-list-empty": "selected",
            ...{
              className: "x78zum5 x6s0dn4 xl56j7k xu95rz8 x2opm4d x1shk3sm x2b8uid"
            },
            children: /*#__PURE__*/_jsx(Text, {
              type: "supporting",
              color: "secondary",
              children: normalizedQuery === '' ? selectedEmptyText : noResultsText
            })
          })
        })]
      }), /*#__PURE__*/_jsxs("div", {
        ref: availablePanelRef,
        role: "group",
        "aria-labelledby": availableHeadingId,
        tabIndex: -1,
        ...mergeProps(themeProps('transfer-list-panel', {
          side: 'available'
        }), stylex.props(focusOutlineStyles.focusVisible, styles.panel, styles.panelDivider)),
        children: [/*#__PURE__*/_jsxs("div", {
          ...{
            className: "x78zum5 x6s0dn4 x1qughib x1txdalj xjbqb8w x101j7pr xce4md1 xrrkdod x92x3c3 x1q0q8m5 xw8gpjh"
          },
          children: [/*#__PURE__*/_jsx(Text, {
            id: availableHeadingId,
            type: "label",
            color: "secondary",
            children: availableLabel
          }), hasSelectAll && /*#__PURE__*/_jsx(Button, {
            label: t('@astryx.transferList.addAll'),
            size: "sm",
            variant: "ghost",
            xstyle: styles.headerAction,
            "data-transfer-list-header-action": "true",
            isDisabled: !options.some(option => !option.isTransferDisabled && !currentValueRef.current.includes(option.value)),
            onClick: addAll
          })]
        }), /*#__PURE__*/_jsx("div", {
          "data-transfer-list-panel-body": "available",
          ...{
            className: "xu95rz8 x2opm4d x9rxgia xcpr047 x1odjw0f x2kikmz xish69e xf3ta42 x185mbhu x19acri0 x1717udv"
          },
          children: availableOptions.length > 0 ? /*#__PURE__*/_jsx(List, {
            density: "compact",
            header: /*#__PURE__*/_jsx(VisuallyHidden, {
              children: availableLabel
            }),
            children: groupedAvailable.map(([group, groupOptions]) => /*#__PURE__*/_jsxs(Fragment, {
              children: [(group !== '' || groupedAvailable.length > 1) && /*#__PURE__*/_jsx("li", {
                role: "presentation",
                ...{
                  className: "xu0wf1k xrrkdod xcsaf9d x14l7nz5"
                },
                children: /*#__PURE__*/_jsx(Text, {
                  type: "body",
                  weight: "bold",
                  color: "primary",
                  children: group || t('@astryx.transferList.ungroupedLabel')
                })
              }), groupOptions.map(option => transferItem(option, 'available', availableOptions.indexOf(option)))]
            }, group || 'ungrouped'))
          }) : /*#__PURE__*/_jsx("div", {
            "data-transfer-list-empty": "available",
            ...{
              className: "x78zum5 x6s0dn4 xl56j7k xu95rz8 x2opm4d x1shk3sm x2b8uid"
            },
            children: /*#__PURE__*/_jsx(Text, {
              type: "supporting",
              color: "secondary",
              children: normalizedQuery === '' ? availableEmptyText : noResultsText
            })
          })
        })]
      })]
    }), dragPreviewPosition != null ? dragPreviewLayer.render(/*#__PURE__*/_jsx("div", {
      ref: dragPreviewRef,
      "aria-hidden": "true",
      "data-transfer-list-drag-preview": "",
      ...stylex.props(reorderStyles.preview, styles.dragPreviewContainer, dynamicStyles.dragPreview(dragPreviewPosition.width))
    }), {
      x: dragPreviewPosition.x,
      y: dragPreviewPosition.y
    }) : null]
  });
}
TransferList.displayName = 'TransferList';