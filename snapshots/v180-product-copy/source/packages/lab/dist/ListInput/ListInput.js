// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListInput.tsx
 * @input React, StyleX, Astryx field/list/button/icon/layer/empty-state primitives, compact size context, browser scroll geometry, programmatic theme tokens, and shared Lab reorder styles
 * @output Exports ListInput and its controlled data, column, renderer, and change types
 * @position Lab experiment (RFC facebook/astryx#4531) for editing compact repeated records
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/ListInput/ListInput.doc.mjs
 * - /packages/lab/src/ListInput/ListInput.test.tsx
 * - /packages/lab/src/ListInput/index.ts
 * - /apps/storybook/stories/ListInput.stories.tsx
 */
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { flushSync } from 'react-dom';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Field } from '@astryxdesign/core/Field';
import { FieldStatus } from '@astryxdesign/core/FieldStatus';
import { Icon } from '@astryxdesign/core/Icon';
import { useAnnounce, useMediaQuery } from '@astryxdesign/core/hooks';
import { IconButton } from '@astryxdesign/core/IconButton';
import { useTranslator } from '@astryxdesign/core/i18n';
import { useLayer } from '@astryxdesign/core/Layer';
import { SizeProvider } from '@astryxdesign/core/SizeContext';
import { useTheme } from '@astryxdesign/core/theme';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, fontWeightVars, sizeVars, spacingVars, typeScaleVars } from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps, themeProps } from '@astryxdesign/core/utils';
import { reorderStyles } from "../reorderStyles.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const styles = {
  item: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    k7Eaqz: "xeuugli",
    kVAEAm: "x1n2onr6",
    $$css: true
  },
  row: {
    k1xSpc: "xrvj5dj",
    kGNEyG: "xpqajaz",
    k1C7PZ: "x1lfs0n9",
    khm7nJ: "xxs79tx xrs5tkd",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  rowFieldsOnly: {
    kumcoG: "x1mkdm3x",
    $$css: true
  },
  rowWithReorder: {
    kumcoG: "x1ni329g",
    $$css: true
  },
  rowWithRemove: {
    kumcoG: "x1ni329g",
    $$css: true
  },
  rowWithBothControls: {
    kumcoG: "x1nra26t",
    $$css: true
  },
  fields: {
    k1xSpc: "xrvj5dj x12gktpv",
    kGNEyG: "xpqajaz",
    kOIVth: "xzye2dw xyn4b6",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  contentOnly: {
    kBCFzs: "x1osaytk",
    $$css: true
  },
  contentBeforeOneControl: {
    kBCFzs: "x1rlpkp8",
    $$css: true
  },
  contentBeforeBothControls: {
    kBCFzs: "xez1zrf",
    $$css: true
  },
  itemStatus: {
    kbNqZ1: "x7sv70a x1nh3qrq",
    keoZOQ: "xcsaf9d xc47mtf",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  actionRow: {
    k1xSpc: "xrvj5dj",
    kGNEyG: "x6s0dn4",
    k1C7PZ: "x1lfs0n9",
    keoZOQ: "xtbrsbv",
    $$css: true
  },
  actionContent: {
    k7Eaqz: "xeuugli",
    $$css: true
  }
};
const _temp = {
  k3aq6I: "xsqj5wx",
  "$$css": true
};
const dynamicStyles = {
  fields: gridTemplateColumns => [{
    kumcoG: (gridTemplateColumns != null ? "x39pwss " : gridTemplateColumns) + "x540v0d",
    $$css: true
  }, {
    "--x-1pds3uo": gridTemplateColumns != null ? gridTemplateColumns : undefined
  }],
  dragPreview: (x, y, width) => [_temp, {
    kzqmXN: width != null ? "x5lhr3w" : width,
    $$css: true
  }, {
    "--x-width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(width),
    "--x-transform": `translate3d(${x}px, ${y}px, 0)` != null ? `translate3d(${x}px, ${y}px, 0)` : undefined
  }],
  rowTransition: name => [{
    knxT9A: name != null ? "xqwjeat" : name,
    $$css: true
  }, {
    "--x-viewTransitionName": name != null ? name : undefined
  }]
};
function GripVerticalIcon(props) {
  return /*#__PURE__*/_jsxs("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    ...props,
    children: [/*#__PURE__*/_jsx("circle", {
      cx: "9",
      cy: "6",
      r: "1.5",
      fill: "currentColor"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "15",
      cy: "6",
      r: "1.5",
      fill: "currentColor"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "9",
      cy: "12",
      r: "1.5",
      fill: "currentColor"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "15",
      cy: "12",
      r: "1.5",
      fill: "currentColor"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "9",
      cy: "18",
      r: "1.5",
      fill: "currentColor"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "15",
      cy: "18",
      r: "1.5",
      fill: "currentColor"
    })]
  });
}
function resolveColumnTrack(width) {
  if (width?.type === 'pixel') {
    return `${width.value}px`;
  }
  const proportion = width?.value ?? 1;
  const minWidth = width?.minWidth ?? 140;
  return `minmax(${minWidth}px, ${proportion}fr)`;
}
function moveItem(value, fromIndex, toIndex) {
  if (fromIndex === toIndex) {
    return value.slice();
  }
  const nextValue = value.slice();
  const [item] = nextValue.splice(fromIndex, 1);
  nextValue.splice(toIndex, 0, item);
  return nextValue;
}
function joinIDs(...ids) {
  const resolved = ids.filter(Boolean);
  return resolved.length > 0 ? resolved.join(' ') : undefined;
}
const focusableFieldSelector = '[data-list-input-cell] input, [data-list-input-cell] select, [data-list-input-cell] textarea, [data-list-input-cell] button, [data-list-input-cell] [tabindex]:not([tabindex="-1"])';
function getScrollableAncestors(element) {
  const scrollRoots = [];
  let current = element.parentElement;
  while (current != null) {
    const overflowY = window.getComputedStyle(current).overflowY;
    const isScrollable = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && current.scrollHeight > current.clientHeight;
    if (isScrollable) {
      scrollRoots.push(current);
    }
    current = current.parentElement;
  }
  return scrollRoots;
}
function isVerticallyPerceivable(element) {
  const elementBounds = element.getBoundingClientRect();
  const viewportBottom = window.innerHeight || document.documentElement.clientHeight;
  let visibleTop = 0;
  let visibleBottom = viewportBottom;
  let current = element.parentElement;
  while (current != null) {
    const overflowY = window.getComputedStyle(current).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay' || overflowY === 'hidden' || overflowY === 'clip') {
      const bounds = current.getBoundingClientRect();
      const contentTop = bounds.top + current.clientTop;
      visibleTop = Math.max(visibleTop, contentTop);
      visibleBottom = Math.min(visibleBottom, contentTop + current.clientHeight);
    }
    current = current.parentElement;
  }
  const elementCenter = (elementBounds.top + elementBounds.bottom) / 2;
  return elementCenter >= visibleTop && elementCenter <= visibleBottom;
}
function scrollByInstantly(scrollRoot, delta) {
  const styleTarget = scrollRoot ?? document.documentElement;
  const previousBehavior = styleTarget.style.getPropertyValue('scroll-behavior');
  const previousPriority = styleTarget.style.getPropertyPriority('scroll-behavior');
  styleTarget.style.setProperty('scroll-behavior', 'auto', 'important');
  try {
    if (scrollRoot != null) {
      scrollRoot.scrollTop += delta;
    } else {
      window.scrollBy(0, delta);
    }
  } finally {
    if (previousBehavior === '') {
      styleTarget.style.removeProperty('scroll-behavior');
    } else {
      styleTarget.style.setProperty('scroll-behavior', previousBehavior, previousPriority);
    }
  }
}
const viewTransitionRootClassNames = stylex.props(reorderStyles.viewTransitionRoot).className?.split(/\s+/).filter(Boolean) ?? [];
let activeViewTransitionCount = 0;
function addViewTransitionRootStyles() {
  if (activeViewTransitionCount === 0) {
    document.documentElement.classList.add(...viewTransitionRootClassNames);
  }
  activeViewTransitionCount += 1;
}
function removeViewTransitionRootStyles() {
  activeViewTransitionCount = Math.max(0, activeViewTransitionCount - 1);
  if (activeViewTransitionCount === 0) {
    document.documentElement.classList.remove(...viewTransitionRootClassNames);
  }
}
function animateControlledUpdate(update) {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && typeof document.startViewTransition === 'function') {
    addViewTransitionRootStyles();
    try {
      const transition = document.startViewTransition(() => flushSync(update));
      void transition.finished.then(removeViewTransitionRootStyles, removeViewTransitionRootStyles);
    } catch {
      removeViewTransitionRootStyles();
      update();
    }
    return;
  }
  update();
}
function transitionName(scope, key) {
  return `${scope}-${String(key)}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}
function parseDuration(value) {
  const normalizedValue = value.trim();
  const duration = Number.parseFloat(normalizedValue);
  if (!Number.isFinite(duration)) {
    return 0;
  }
  if (normalizedValue.endsWith('ms')) {
    return duration;
  }
  return normalizedValue.endsWith('s') ? duration * 1000 : 0;
}
function captureMutationLayout(root, activeAnimations) {
  const snapshots = new Map();
  const elements = [];
  for (const child of root.children) {
    if (!(child instanceof HTMLElement)) {
      continue;
    }
    if (child.tagName === 'OL') {
      for (const item of child.children) {
        if (item instanceof HTMLElement && item.dataset.listInputMotionKey != null) {
          elements.push(item);
        }
      }
    } else if (child.dataset.listInputMotionKey != null) {
      elements.push(child);
    }
  }
  for (const element of elements) {
    const key = element.dataset.listInputMotionKey;
    if (key == null) {
      continue;
    }
    const rect = element.getBoundingClientRect();
    activeAnimations.get(element)?.cancel();
    activeAnimations.delete(element);
    snapshots.set(key, {
      element,
      rect
    });
  }
  return snapshots;
}
function startMutationAnimation(element, keyframes, options, activeAnimations) {
  try {
    const animation = element.animate(keyframes, options);
    activeAnimations.set(element, animation);
    void animation.finished.then(() => {
      if (activeAnimations.get(element) === animation) {
        activeAnimations.delete(element);
      }
    }, () => {
      if (activeAnimations.get(element) === animation) {
        activeAnimations.delete(element);
      }
    });
  } catch {
    // Motion is progressive enhancement; the controlled update already ran.
  }
}

/**
 * A compact editor for short collections of consistent, simple records.
 *
 * ListInput owns list semantics, add/remove controls, handle-only reordering,
 * live collection motion, focus restoration, announcements, and list/item/
 * field validation placement. Consumers keep ownership of the controlled data
 * and render each field with standard Astryx inputs.
 *
 * @example
 * ```
 * <ListInput
 *   label="Guests"
 *   value={guests}
 *   onChange={setGuests}
 *   getItemKey={guest => guest.id}
 *   createItem={() => ({id: crypto.randomUUID(), name: '', email: ''})}
 *   columns={columns}
 *   itemName="guest"
 *   isReorderable
 * />
 * ```
 */
export function ListInput({
  label,
  description,
  value,
  onChange,
  getItemKey,
  createItem,
  columns,
  itemName = 'item',
  status,
  getItemStatus,
  getFieldStatus,
  isReorderable = false,
  isDisabled = false,
  isLoading = false,
  maxItems,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  ref,
  ...rest
}) {
  const generatedID = useId();
  const groupID = `list-input-${generatedID}`;
  const labelID = `${groupID}-label`;
  const descriptionID = description ? `${groupID}-description` : undefined;
  const statusID = status?.message ? `${groupID}-status` : undefined;
  const reorderInstructionsID = `${groupID}-reorder-instructions`;
  const rowRefs = useRef(new Map());
  const groupRef = useRef(null);
  const addActionRef = useRef(null);
  const addButtonRef = useRef(null);
  const addPointerAnchorTopRef = useRef(null);
  const addAnchorFrameRef = useRef(null);
  const pendingFocusRef = useRef(null);
  const pendingAddScrollAnchorRef = useRef(null);
  const pendingMutationMotionRef = useRef(null);
  const activeMutationAnimationsRef = useRef(new Map());
  const dragPreviewRef = useRef(null);
  const reorderStateRef = useRef(null);
  const [reorderState, setReorderStateState] = useState(null);
  const t = useTranslator();
  const announce = useAnnounce();
  const {
    tokens: themeTokens
  } = useTheme();
  const mutationDuration = parseDuration(themeTokens['--duration-fast-max'] ?? '');
  const mutationEasing = themeTokens['--ease-standard'] ?? 'linear';
  const mutationEntryOffset = themeTokens['--spacing-2'] ?? '8px';
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const {
    render: renderDragPreviewLayer,
    show: showDragPreviewLayer,
    hide: hideDragPreviewLayer
  } = useLayer({
    mode: 'fixed'
  });
  const setReorderState = nextState => {
    reorderStateRef.current = nextState;
    setReorderStateState(nextState);
  };
  const displayValue = useMemo(() => {
    if (reorderState == null) {
      return value;
    }
    if (reorderState.mode === 'pointer') {
      return reorderState.originalValue;
    }
    return moveItem(reorderState.originalValue, reorderState.fromIndex, reorderState.toIndex);
  }, [reorderState, value]);
  const showReorderColumn = isReorderable;
  const showRemoveColumn = true;
  const fieldGridTemplate = useMemo(() => columns.map(column => resolveColumnTrack(column.width)).join(' '), [columns]);
  const pointerPlacement = useMemo(() => {
    if (reorderState?.mode !== 'pointer' || !reorderState.hasPointerMoved || reorderState.toIndex === reorderState.fromIndex) {
      return null;
    }
    const remainingItems = reorderState.originalValue.filter((_, index) => index !== reorderState.fromIndex);
    const beforeItem = remainingItems[reorderState.toIndex];
    if (beforeItem != null) {
      return {
        position: 'before',
        itemKey: String(getItemKey(beforeItem))
      };
    }
    const afterItem = remainingItems.at(-1);
    return afterItem == null ? null : {
      position: 'after',
      itemKey: String(getItemKey(afterItem))
    };
  }, [getItemKey, reorderState]);
  const previewCloneKey = reorderState?.mode === 'pointer' ? String(reorderState.itemKey) : null;
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    const itemKeys = new Set();
    for (const item of value) {
      const key = String(getItemKey(item));
      if (itemKeys.has(key)) {
        console.warn(`ListInput: getItemKey returned duplicate key "${key}". Keys must be unique and stable.`);
        break;
      }
      itemKeys.add(key);
    }
    const columnKeys = new Set();
    for (const column of columns) {
      if (columnKeys.has(column.key)) {
        console.warn(`ListInput: columns contains duplicate key "${column.key}". Column keys must be unique.`);
        break;
      }
      columnKeys.add(column.key);
    }
  }, [columns, getItemKey, value]);
  useEffect(() => {
    if ((isDisabled || isLoading) && reorderStateRef.current) {
      setReorderState(null);
      announce(t('@astryx.listInput.announceReorderCancelled'));
    }
  }, [isDisabled, isLoading, announce, t]);
  useEffect(() => {
    const activeAnimations = activeMutationAnimationsRef.current;
    return () => {
      if (addAnchorFrameRef.current != null) {
        window.cancelAnimationFrame(addAnchorFrameRef.current);
      }
      for (const animation of activeAnimations.values()) {
        animation.cancel();
      }
      activeAnimations.clear();
    };
  }, []);
  useEffect(() => {
    if (!prefersReducedMotion) {
      return;
    }
    for (const animation of activeMutationAnimationsRef.current.values()) {
      animation.cancel();
    }
    activeMutationAnimationsRef.current.clear();
    pendingMutationMotionRef.current = null;
  }, [prefersReducedMotion]);
  useLayoutEffect(() => {
    const pendingAnchor = pendingAddScrollAnchorRef.current;
    if (pendingAnchor == null) {
      return;
    }
    const matchesValue = value.length === pendingAnchor.expectedKeys.length && value.every((item, index) => String(getItemKey(item)) === pendingAnchor.expectedKeys[index]);
    if (!matchesValue) {
      pendingAddScrollAnchorRef.current = null;
      return;
    }
    pendingAddScrollAnchorRef.current = null;
    const addAction = addActionRef.current;
    if (addAction == null) {
      return;
    }
    const pendingFocus = pendingFocusRef.current;
    const addedRow = rowRefs.current.get(pendingAnchor.itemKey);
    const focusTarget = pendingFocus?.target === 'first-field' && pendingFocus.itemKey === pendingAnchor.itemKey ? addedRow?.querySelector(focusableFieldSelector) ?? null : null;
    if (focusTarget != null) {
      focusTarget.focus({
        preventScroll: true
      });
      pendingFocusRef.current = null;
    }

    // Resolve after insertion: the new record may make a nearer overflow
    // container scrollable for the first time. Cascade any clamped remainder
    // outward so a partially growing inner container does not displace Add.
    const preserveAddPosition = () => {
      const scrollRoots = getScrollableAncestors(addAction);
      for (const scrollRoot of scrollRoots) {
        const scrollDelta = addAction.getBoundingClientRect().top - pendingAnchor.addTop;
        if (Math.abs(scrollDelta) < 0.5) {
          break;
        }
        scrollByInstantly(scrollRoot, scrollDelta);
      }
      const viewportDelta = addAction.getBoundingClientRect().top - pendingAnchor.addTop;
      if (Math.abs(viewportDelta) >= 0.5) {
        scrollByInstantly(null, viewportDelta);
      }
    };
    preserveAddPosition();

    // Slight clipping should not move Add away from an active pointer. Only a
    // meaningfully hidden target takes priority over pointer anchoring.
    if (focusTarget != null && !isVerticallyPerceivable(focusTarget)) {
      focusTarget.scrollIntoView?.({
        block: 'nearest',
        inline: 'nearest'
      });
    } else {
      // Recheck once after the browser's native anchoring/focus phase. This is
      // interaction-scoped work, not a persistent scroll or resize observer.
      if (addAnchorFrameRef.current != null) {
        window.cancelAnimationFrame(addAnchorFrameRef.current);
      }
      addAnchorFrameRef.current = window.requestAnimationFrame(() => {
        addAnchorFrameRef.current = null;
        if (addAction.isConnected) {
          preserveAddPosition();
        }
      });
    }
  }, [getItemKey, value]);
  useLayoutEffect(() => {
    const pendingMotion = pendingMutationMotionRef.current;
    if (pendingMotion == null) {
      return;
    }
    if (!pendingMotion.matchesValue(value)) {
      pendingMutationMotionRef.current = null;
      return;
    }
    pendingMutationMotionRef.current = null;
    const root = groupRef.current;
    if (root == null) {
      return;
    }
    const activeAnimations = activeMutationAnimationsRef.current;
    const after = captureMutationLayout(root, activeAnimations);
    const options = {
      duration: pendingMotion.duration,
      easing: pendingMotion.easing
    };
    const hasSizeChange = Array.from(after).some(([key, nextSnapshot]) => {
      const previousSnapshot = pendingMotion.before.get(key);
      return previousSnapshot != null && (Math.abs(previousSnapshot.rect.width - nextSnapshot.rect.width) >= 0.5 || Math.abs(previousSnapshot.rect.height - nextSnapshot.rect.height) >= 0.5);
    });
    const hasEnteringParticipant = Array.from(after.keys()).some(key => !pendingMotion.before.has(key));
    for (const [key, nextSnapshot] of after) {
      const previousSnapshot = pendingMotion.before.get(key);
      if (previousSnapshot == null) {
        startMutationAnimation(nextSnapshot.element, [{
          transform: `translateY(${pendingMotion.entryOffset})`
        }, {
          transform: 'translateY(0)'
        }], options, activeAnimations);
        continue;
      }
      // Appended rows already carry the orientation cue; moving the Add action
      // from beneath them would temporarily overlap the new live controls.
      if (hasSizeChange || hasEnteringParticipant) {
        continue;
      }
      const deltaX = previousSnapshot.rect.left - nextSnapshot.rect.left;
      const deltaY = previousSnapshot.rect.top - nextSnapshot.rect.top;
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        continue;
      }
      startMutationAnimation(nextSnapshot.element, [{
        transform: `translate(${deltaX}px, ${deltaY}px)`
      }, {
        transform: 'translate(0, 0)'
      }], options, activeAnimations);
    }
  }, [value]);
  useLayoutEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (pendingFocus == null) {
      return;
    }
    let target = null;
    if (pendingFocus.target === 'add') {
      target = addButtonRef.current;
    } else if (pendingFocus.itemKey != null) {
      const row = rowRefs.current.get(pendingFocus.itemKey);
      const selector = pendingFocus.target === 'remove' ? '[data-list-input-remove]' : focusableFieldSelector;
      target = row?.querySelector(selector) ?? null;
    }
    if (target != null) {
      target.focus();
      pendingFocusRef.current = null;
    }
  }, [value]);
  useLayoutEffect(() => {
    const previewHost = dragPreviewRef.current;
    if (previewHost == null || previewCloneKey == null) {
      return;
    }
    const sourceRow = rowRefs.current.get(previewCloneKey);
    if (sourceRow == null) {
      return;
    }
    const clone = sourceRow.cloneNode(true);
    previewHost.style.direction = getComputedStyle(sourceRow).direction;
    clone.style.opacity = '1';
    clone.removeAttribute('data-list-input-reorder-source');
    clone.removeAttribute('data-list-input-drop-target');
    clone.removeAttribute('data-list-input-reorder');
    clone.removeAttribute('data-list-input-remove');
    clone.removeAttribute('data-list-input-row');
    clone.setAttribute('aria-hidden', 'true');
    const clonedElements = [clone, ...clone.querySelectorAll('*')];
    for (const element of clonedElements) {
      element.removeAttribute('id');
      element.removeAttribute('aria-describedby');
      element.removeAttribute('aria-labelledby');
      element.removeAttribute('name');
      element.removeAttribute('data-list-input-reorder-source');
      element.removeAttribute('data-list-input-drop-target');
      element.removeAttribute('data-list-input-reorder');
      element.removeAttribute('data-list-input-remove');
      element.setAttribute('tabindex', '-1');
      element.style.viewTransitionName = 'none';
    }
    previewHost.replaceChildren(clone);
    showDragPreviewLayer();
    return () => {
      hideDragPreviewLayer();
      previewHost.replaceChildren();
      previewHost.style.removeProperty('direction');
    };
  }, [hideDragPreviewLayer, previewCloneKey, showDragPreviewLayer]);
  const mutationsDisabled = isDisabled || isLoading;
  const hasReachedMax = maxItems != null && value.length >= maxItems;
  const cancelMutationAnimations = () => {
    for (const animation of activeMutationAnimationsRef.current.values()) {
      animation.cancel();
    }
    activeMutationAnimationsRef.current.clear();
  };
  const settleReorderBeforeMutation = () => {
    if (reorderState == null && reorderStateRef.current == null) {
      return;
    }
    flushSync(() => setReorderState(null));
  };
  const prepareMutationMotion = nextValue => {
    const root = groupRef.current;
    if (root == null || prefersReducedMotion || mutationDuration <= 0 || typeof root.animate !== 'function') {
      pendingMutationMotionRef.current = null;
      return;
    }
    const expectedKeys = nextValue.map(item => String(getItemKey(item)));
    const pendingMotion = {
      before: captureMutationLayout(root, activeMutationAnimationsRef.current),
      duration: mutationDuration,
      easing: mutationEasing,
      entryOffset: mutationEntryOffset,
      matchesValue: candidate => candidate.length === expectedKeys.length && candidate.every((item, index) => String(getItemKey(item)) === expectedKeys[index])
    };
    pendingMutationMotionRef.current = pendingMotion;
    window.setTimeout(() => {
      // Delayed controlled updates cannot safely reuse viewport measurements
      // from the originating interaction. Synchronous updates consume the
      // snapshot in the layout effect before the next task.
      if (pendingMutationMotionRef.current === pendingMotion) {
        pendingMutationMotionRef.current = null;
      }
    }, 0);
  };
  const prepareAddScrollAnchor = (nextValue, itemKey, pointerDownTop) => {
    const addAction = addActionRef.current;
    if (addAction == null) {
      pendingAddScrollAnchorRef.current = null;
      return;
    }
    const pendingAnchor = {
      addTop: pointerDownTop ?? addAction.getBoundingClientRect().top,
      expectedKeys: nextValue.map(item => String(getItemKey(item))),
      itemKey
    };
    pendingAddScrollAnchorRef.current = pendingAnchor;
    window.setTimeout(() => {
      // Controlled updates that arrive in a later task cannot safely reuse a
      // pointer position captured during the originating click.
      if (pendingAddScrollAnchorRef.current === pendingAnchor) {
        pendingAddScrollAnchorRef.current = null;
      }
    }, 0);
  };
  const handleAddPointerDown = event => {
    if (event.button !== 0 || !event.isPrimary || mutationsDisabled || hasReachedMax) {
      addPointerAnchorTopRef.current = null;
      return;
    }
    addPointerAnchorTopRef.current = addActionRef.current?.getBoundingClientRect().top ?? null;
  };
  const handleAdd = event => {
    if (mutationsDisabled || hasReachedMax) {
      return;
    }
    settleReorderBeforeMutation();
    const item = createItem();
    const nextValue = [...value, item];
    const itemKey = String(getItemKey(item));
    pendingFocusRef.current = {
      itemKey,
      target: 'first-field'
    };
    if (event.detail > 0) {
      prepareAddScrollAnchor(nextValue, itemKey, addPointerAnchorTopRef.current ?? undefined);
    } else {
      pendingAddScrollAnchorRef.current = null;
    }
    addPointerAnchorTopRef.current = null;
    prepareMutationMotion(nextValue);
    onChange(nextValue, {
      type: 'add',
      item,
      index: value.length
    });
    announce(t('@astryx.listInput.announceAdded', {
      itemName,
      position: value.length + 1
    }));
  };
  const handleUpdate = (item, index, nextItem, columnKey) => {
    if (mutationsDisabled) {
      return;
    }
    const nextValue = value.slice();
    nextValue[index] = nextItem;
    onChange(nextValue, {
      type: 'update',
      item: nextItem,
      previousItem: item,
      index,
      columnKey
    });
  };
  const handleRemove = item => {
    if (mutationsDisabled) {
      return;
    }
    settleReorderBeforeMutation();
    const itemKey = String(getItemKey(item));
    const index = value.findIndex(candidate => String(getItemKey(candidate)) === itemKey);
    if (index < 0) {
      return;
    }
    const removedItem = value[index];
    const nextValue = value.filter((_, itemIndex) => itemIndex !== index);
    const nextFocusItem = nextValue[Math.min(index, nextValue.length - 1)];
    pendingFocusRef.current = nextFocusItem == null ? {
      target: 'add'
    } : {
      itemKey: String(getItemKey(nextFocusItem)),
      target: 'remove'
    };
    prepareMutationMotion(nextValue);
    onChange(nextValue, {
      type: 'remove',
      item: removedItem,
      index
    });
    announce(t('@astryx.listInput.announceRemoved', {
      itemName,
      position: index + 1
    }));
  };
  const startReorder = (item, index, mode, pointerId, pointerGeometry) => {
    if (mutationsDisabled || !isReorderable) {
      return;
    }
    cancelMutationAnimations();
    setReorderState({
      itemKey: getItemKey(item),
      fromIndex: index,
      toIndex: index,
      originalValue: value.slice(),
      mode,
      pointerId,
      ...pointerGeometry,
      hasPointerMoved: false
    });
    announce(t('@astryx.listInput.announceGrabbed', {
      itemName,
      position: index + 1
    }));
  };
  const previewReorder = toIndex => {
    const currentState = reorderStateRef.current;
    if (currentState == null) {
      return;
    }
    const boundedIndex = Math.max(0, Math.min(toIndex, currentState.originalValue.length - 1));
    if (boundedIndex === currentState.toIndex) {
      return;
    }
    setReorderState({
      ...currentState,
      toIndex: boundedIndex
    });
    announce(t('@astryx.listInput.announceMovedToPosition', {
      itemName,
      position: boundedIndex + 1,
      total: currentState.originalValue.length
    }));
  };
  const cancelReorder = () => {
    if (reorderStateRef.current == null) {
      return;
    }
    setReorderState(null);
    announce(t('@astryx.listInput.announceReorderCancelled'));
  };
  const commitReorder = () => {
    const currentState = reorderStateRef.current;
    if (currentState == null) {
      return;
    }
    if (currentState.mode === 'pointer' && !currentState.hasPointerMoved) {
      setReorderState(null);
      return;
    }
    const nextValue = moveItem(currentState.originalValue, currentState.fromIndex, currentState.toIndex);
    const item = currentState.originalValue[currentState.fromIndex];
    const hasChanged = currentState.fromIndex !== currentState.toIndex;
    if (currentState.mode === 'pointer') {
      flushSync(() => setReorderState(null));
    } else {
      setReorderState(null);
    }
    if (!hasChanged) {
      announce(t('@astryx.listInput.announceReturnedToPosition', {
        itemName,
        position: currentState.fromIndex + 1
      }));
      return;
    }
    const commit = () => onChange(nextValue, {
      type: 'reorder',
      item,
      fromIndex: currentState.fromIndex,
      toIndex: currentState.toIndex
    });
    if (currentState.mode === 'pointer') {
      animateControlledUpdate(commit);
    } else {
      commit();
    }
    announce(t('@astryx.listInput.announceDropped', {
      itemName,
      position: currentState.toIndex + 1,
      total: currentState.originalValue.length
    }));
  };
  const moveWithArrowKey = (item, fromIndex, offset) => {
    cancelMutationAnimations();
    const toIndex = Math.max(0, Math.min(fromIndex + offset, value.length - 1));
    if (toIndex === fromIndex) {
      announce(t('@astryx.listInput.announceAlreadyAtBoundary', {
        itemName,
        boundary: offset < 0 ? 'first' : 'last'
      }));
      return;
    }
    const nextValue = moveItem(value, fromIndex, toIndex);
    animateControlledUpdate(() => onChange(nextValue, {
      type: 'reorder',
      item,
      fromIndex,
      toIndex
    }));
    announce(t('@astryx.listInput.announceMovedToPosition', {
      itemName,
      position: toIndex + 1,
      total: value.length
    }));
  };
  const handleReorderKeyDown = (event, item, index) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const activeState = reorderStateRef.current;
    const isActivationKey = event.key === ' ' || event.key === 'Enter';
    if (activeState == null) {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveWithArrowKey(item, index, -1);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveWithArrowKey(item, index, 1);
        return;
      }
      if (isActivationKey) {
        event.preventDefault();
        startReorder(item, index, 'keyboard');
      }
      return;
    }
    if (String(activeState.itemKey) !== String(getItemKey(item))) {
      return;
    }
    if (isActivationKey) {
      event.preventDefault();
      commitReorder();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelReorder();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      previewReorder(activeState.toIndex - 1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      previewReorder(activeState.toIndex + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      previewReorder(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      previewReorder(activeState.originalValue.length - 1);
    }
  };
  const handlePointerMove = event => {
    const activeState = reorderStateRef.current;
    if (activeState == null || activeState.mode !== 'pointer' || activeState.pointerId !== event.pointerId) {
      return;
    }
    const horizontalDistance = event.clientX - (activeState.pointerStartX ?? event.clientX);
    const verticalDistance = event.clientY - (activeState.pointerStartY ?? event.clientY);
    const hasCrossedThreshold = activeState.hasPointerMoved || Math.hypot(horizontalDistance, verticalDistance) >= 5;
    const remainingItems = activeState.originalValue.filter((_, index) => index !== activeState.fromIndex);
    let targetIndex = activeState.fromIndex;
    if (hasCrossedThreshold) {
      event.preventDefault();
      targetIndex = remainingItems.length;
      for (let index = 0; index < remainingItems.length; index++) {
        const row = rowRefs.current.get(String(getItemKey(remainingItems[index])));
        if (row == null) {
          continue;
        }
        const bounds = row.getBoundingClientRect();
        if (event.clientY < bounds.top + bounds.height / 2) {
          targetIndex = index;
          break;
        }
      }
    }
    const nextState = {
      ...activeState,
      pointerClientX: event.clientX,
      pointerClientY: event.clientY,
      hasPointerMoved: hasCrossedThreshold,
      toIndex: targetIndex
    };
    if (activeState.pointerClientX === nextState.pointerClientX && activeState.pointerClientY === nextState.pointerClientY && activeState.hasPointerMoved === nextState.hasPointerMoved && activeState.toIndex === nextState.toIndex) {
      return;
    }
    setReorderState(nextState);
    if (hasCrossedThreshold && activeState.toIndex !== targetIndex) {
      announce(t('@astryx.listInput.announceMovedToPosition', {
        itemName,
        position: targetIndex + 1,
        total: activeState.originalValue.length
      }));
    }
  };
  const rowLayoutStyle = showReorderColumn ? showRemoveColumn ? styles.rowWithBothControls : styles.rowWithReorder : showRemoveColumn ? styles.rowWithRemove : styles.rowFieldsOnly;
  const contentGridStyle = showReorderColumn ? styles.contentBeforeBothControls : showRemoveColumn ? styles.contentBeforeOneControl : styles.contentOnly;
  const dragPreviewPosition = reorderState?.mode === 'pointer' && reorderState.pointerClientX != null && reorderState.pointerClientY != null && reorderState.pointerOffsetX != null && reorderState.pointerOffsetY != null && reorderState.previewWidth != null ? {
    x: reorderState.pointerClientX - reorderState.pointerOffsetX,
    y: reorderState.pointerClientY - reorderState.pointerOffsetY,
    width: reorderState.previewWidth
  } : null;
  return /*#__PURE__*/_jsxs(SizeProvider, {
    value: "md",
    children: [/*#__PURE__*/_jsx(Field, {
      ref: ref,
      label: label,
      description: description,
      inputID: groupID,
      labelID: labelID,
      descriptionID: descriptionID,
      isGroupLabel: true,
      isLabelHidden: isLabelHidden,
      isOptional: isOptional,
      isRequired: isRequired,
      isDisabled: isDisabled,
      status: status == null ? undefined : {
        ...status,
        messageID: statusID
      },
      statusVariant: "detached",
      ...rest,
      children: /*#__PURE__*/_jsxs("div", {
        ref: groupRef,
        id: groupID,
        role: "group",
        "aria-labelledby": labelID,
        "aria-describedby": joinIDs(descriptionID, statusID),
        "aria-disabled": isDisabled || undefined,
        "aria-busy": isLoading || undefined,
        ...mergeProps(themeProps('list-input', {
          state: isLoading ? 'loading' : isDisabled ? 'disabled' : undefined,
          reorderable: isReorderable ? 'true' : undefined
        }), {
          className: "x78zum5 xdt5ytf xeuugli x1xzczws xh8yej3 x12h1iku x63rumg"
        }),
        children: [/*#__PURE__*/_jsx("ol", {
          role: "list",
          "aria-labelledby": labelID,
          "aria-describedby": joinIDs(descriptionID, statusID),
          ...{
            className: "x78zum5 xdt5ytf x1txdalj x6pnyrg x3ct3a4 x1ghz6dp x1717udv"
          },
          children: displayValue.length === 0 ? /*#__PURE__*/_jsx("li", {
            "data-list-input-motion-key": "state:empty",
            ...{
              className: "xh8yej3"
            },
            children: /*#__PURE__*/_jsx(EmptyState, {
              title: t('@astryx.listInput.emptyTitle', {
                itemName
              }),
              description: t('@astryx.listInput.emptyDescription', {
                itemName
              }),
              isCompact: true
            })
          }) : displayValue.map((item, index) => {
            const itemKey = getItemKey(item);
            const itemKeyString = String(itemKey);
            const isActiveReorder = reorderState != null && String(reorderState.itemKey) === itemKeyString;
            const dropPosition = pointerPlacement?.itemKey === itemKeyString ? pointerPlacement.position : null;
            const isPointerReorderSource = isActiveReorder && reorderState?.mode === 'pointer';
            const itemStatus = getItemStatus?.(item, index);
            const itemStatusID = itemStatus?.message ? `${groupID}-item-${index}-status` : undefined;
            return /*#__PURE__*/_jsx("li", {
              "data-list-input-motion-key": `item:${itemKeyString}`,
              "data-list-input-drop-target": dropPosition ?? undefined,
              "aria-describedby": itemStatusID,
              "aria-invalid": itemStatus?.type === 'error' || undefined,
              "aria-posinset": index + 1,
              "aria-setsize": displayValue.length,
              ...stylex.props(styles.item, dropPosition === 'before' && reorderStyles.dropBefore, dropPosition === 'after' && reorderStyles.dropAfter),
              children: /*#__PURE__*/_jsxs("div", {
                "data-list-input-reorder-source": isActiveReorder || undefined,
                ref: node => {
                  if (node == null) {
                    rowRefs.current.delete(itemKeyString);
                  } else {
                    rowRefs.current.set(itemKeyString, node);
                  }
                },
                "data-list-input-row": itemKeyString,
                ...stylex.props(styles.row, rowLayoutStyle, dynamicStyles.rowTransition(transitionName(groupID, itemKey)), isPointerReorderSource && reorderStyles.source),
                children: [/*#__PURE__*/_jsx("div", {
                  ...stylex.props(styles.fields, dynamicStyles.fields(fieldGridTemplate)),
                  children: columns.map((column, columnIndex) => {
                    const fieldStatus = getFieldStatus?.(item, column.key, index);
                    const isRepeatedLabel = index !== 0;
                    const cellLabel = isRepeatedLabel ? t('@astryx.listInput.fieldLabelWithPosition', {
                      header: column.header,
                      itemName,
                      position: index + 1,
                      total: displayValue.length
                    }) : column.header;
                    const valueContext = {
                      item,
                      index,
                      label: cellLabel,
                      isLabelHidden: true
                    };
                    const content = column.renderInput({
                      ...valueContext,
                      status: fieldStatus,
                      statusVariant: 'tooltip',
                      isDisabled: isDisabled || isLoading,
                      isLoading,
                      updateItem: (nextItem, changeColumnKey) => handleUpdate(item, index, nextItem, changeColumnKey ?? column.key)
                    });
                    return /*#__PURE__*/_jsxs("div", {
                      "data-list-input-cell": String(columnIndex),
                      ...{
                        className: "xeuugli xm5moh1 x1v2w52t"
                      },
                      children: [/*#__PURE__*/_jsx("span", {
                        "aria-hidden": "true",
                        "data-list-input-column-label": isRepeatedLabel ? 'responsive' : 'primary',
                        ...{
                          0: {
                            className: "x1lliihq xlstkdb xx3ixyd x1tgivj0 xcr08ib x1kq96og x1e4wzip"
                          },
                          1: {
                            className: "xlstkdb xx3ixyd x1tgivj0 xcr08ib x1kq96og x1e4wzip x1s85apg x1jiamoa"
                          }
                        }[!!isRepeatedLabel << 0],
                        children: column.header
                      }), /*#__PURE__*/_jsx("div", {
                        ...{
                          className: "xeuugli"
                        },
                        children: content
                      })]
                    }, column.key);
                  })
                }), showRemoveColumn ? /*#__PURE__*/_jsx("div", {
                  ...{
                    className: "x78zum5 x6s0dn4 x7fd4wk xl56j7k x1uogy3y xm5moh1 x4qyour x15daork x1y9m8ji"
                  },
                  children: /*#__PURE__*/_jsx(IconButton, {
                    label: t('@astryx.listInput.removeItem', {
                      itemName,
                      position: index + 1
                    }),
                    tooltip: isDisabled || isLoading ? t('@astryx.listInput.removeUnavailable', {
                      itemName
                    }) : t('@astryx.listInput.removeItem', {
                      itemName,
                      position: index + 1
                    }),
                    icon: /*#__PURE__*/_jsx(Icon, {
                      icon: "close",
                      size: "sm"
                    }),
                    variant: "ghost",
                    size: "md",
                    isDisabled: isDisabled || isLoading,
                    "data-list-input-remove": "",
                    onClick: () => handleRemove(item)
                  })
                }) : null, showReorderColumn ? /*#__PURE__*/_jsx("div", {
                  ...{
                    className: "x78zum5 x6s0dn4 x7fd4wk xl56j7k x1uogy3y xm5moh1 x1b1z6u9 x15daork x1y9m8ji"
                  },
                  children: /*#__PURE__*/_jsx(IconButton, {
                    label: t('@astryx.listInput.reorderItem', {
                      itemName,
                      position: index + 1
                    }),
                    icon: /*#__PURE__*/_jsx(Icon, {
                      icon: GripVerticalIcon,
                      size: "sm"
                    }),
                    variant: "ghost",
                    size: "md",
                    isDisabled: isDisabled || isLoading,
                    "aria-describedby": reorderInstructionsID,
                    "aria-pressed": isActiveReorder || undefined,
                    "data-list-input-reorder": "",
                    xstyle: [reorderStyles.handle, isActiveReorder && reorderStyles.handleActive],
                    onKeyDown: event => handleReorderKeyDown(event, item, index),
                    onBlur: () => {
                      const activeState = reorderStateRef.current;
                      if (activeState?.mode === 'keyboard' && String(activeState.itemKey) === itemKeyString) {
                        cancelReorder();
                      }
                    },
                    onPointerDown: event => {
                      if (event.button !== 0 || isDisabled || isLoading) {
                        return;
                      }
                      const sourceRow = rowRefs.current.get(itemKeyString);
                      if (sourceRow == null) {
                        return;
                      }
                      const bounds = sourceRow.getBoundingClientRect();
                      event.currentTarget.setPointerCapture?.(event.pointerId);
                      startReorder(item, index, 'pointer', event.pointerId, {
                        pointerStartX: event.clientX,
                        pointerStartY: event.clientY,
                        pointerOffsetX: event.clientX - bounds.left,
                        pointerOffsetY: event.clientY - bounds.top,
                        pointerClientX: event.clientX,
                        pointerClientY: event.clientY,
                        previewWidth: bounds.width
                      });
                    },
                    onPointerMove: handlePointerMove,
                    onPointerUp: event => {
                      const activeState = reorderStateRef.current;
                      if (activeState?.mode === 'pointer' && activeState.pointerId === event.pointerId) {
                        commitReorder();
                        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
                          event.currentTarget.releasePointerCapture?.(event.pointerId);
                        }
                      }
                    },
                    onPointerCancel: event => {
                      const activeState = reorderStateRef.current;
                      if (activeState?.mode === 'pointer' && activeState.pointerId === event.pointerId) {
                        cancelReorder();
                        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
                          event.currentTarget.releasePointerCapture?.(event.pointerId);
                        }
                      }
                    },
                    onLostPointerCapture: event => {
                      const activeState = reorderStateRef.current;
                      if (activeState?.mode === 'pointer' && activeState.pointerId === event.pointerId) {
                        cancelReorder();
                      }
                    }
                  })
                }) : null, itemStatus?.message ? /*#__PURE__*/_jsx(FieldStatus, {
                  id: itemStatusID,
                  type: itemStatus.type,
                  message: itemStatus.message,
                  variant: "detached",
                  "data-list-input-item-status": "",
                  xstyle: [styles.itemStatus, contentGridStyle]
                }) : null]
              })
            }, itemKey);
          })
        }), /*#__PURE__*/_jsx("div", {
          ref: addActionRef,
          "data-list-input-motion-key": "action:add",
          ...stylex.props(styles.actionRow, rowLayoutStyle),
          children: /*#__PURE__*/_jsx("div", {
            "data-list-input-add-content": "",
            ...stylex.props(styles.actionContent, contentGridStyle),
            children: /*#__PURE__*/_jsx(Button, {
              ref: addButtonRef,
              label: t('@astryx.listInput.addItem', {
                itemName
              }),
              variant: "secondary",
              size: "md",
              width: "100%",
              isDisabled: isDisabled || hasReachedMax,
              isLoading: isLoading,
              onPointerDown: handleAddPointerDown,
              onPointerCancel: () => {
                addPointerAnchorTopRef.current = null;
              },
              onClick: handleAdd
            })
          })
        }), showReorderColumn ? /*#__PURE__*/_jsx(VisuallyHidden, {
          as: "div",
          id: reorderInstructionsID,
          children: t('@astryx.listInput.reorderInstructions')
        }) : null]
      })
    }), dragPreviewPosition != null ? renderDragPreviewLayer(/*#__PURE__*/_jsx("div", {
      ref: dragPreviewRef,
      "aria-hidden": "true",
      "data-list-input-drag-preview": "",
      ...{
        className: "x12h1iku x63rumg xh8yej3"
      }
    }), {
      x: 0,
      y: 0,
      xstyle: [reorderStyles.preview, dynamicStyles.dragPreview(dragPreviewPosition.x, dragPreviewPosition.y, dragPreviewPosition.width)]
    }) : null]
  });
}
ListInput.displayName = 'ListInput';