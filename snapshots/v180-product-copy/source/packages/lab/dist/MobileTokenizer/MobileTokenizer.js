// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MobileTokenizer.tsx
 * @input Uses public @astryxdesign/core components only (AlertDialog,
 *   BottomSheet, BottomSheetSwitcher, Button, CheckboxIndicator, EmptyState,
 *   Field, Icon, Text, TextInput, Token)
 * @output Exports MobileTokenizer — Lab prototype of the touch Tokenizer
 *   flow with a single searchable sheet, stable in-session checkbox ordering,
 *   and progressive long-list rendering
 * @position Lab (canary) stack layer 1: validates the design before the
 *   Core promotion (Tokenizer presentation="bottom-sheet").
 *
 * API mirrors Core Tokenizer (label/searchSource/value/onChange/change,
 * hasCreate, maxEntries) so graduation is an import swap. Differences from
 * Core are the Lab deltas: the filter is a bordered TextInput (Core's
 * PanelSearchInput is not exported), strings are literals (no i18n keys),
 * and there is no theming/spec contract yet.
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { AlertDialog } from '@astryxdesign/core/AlertDialog';
import { BottomSheet } from '@astryxdesign/core/BottomSheet';
import { BottomSheetSwitcher } from '@astryxdesign/core/BottomSheet';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Field } from '@astryxdesign/core/Field';
import { Icon } from '@astryxdesign/core/Icon';
import { CheckboxIndicator } from '@astryxdesign/core/Indicator';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Token } from '@astryxdesign/core/Token';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, radiusVars, sizeVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const CREATABLE_ID_PREFIX = '__xds_create__';
const LIST_RENDER_BATCH_SIZE = 50;
const LIST_LOAD_MORE_THRESHOLD_PX = 200;
function ListBulletIcon(props) {
  return /*#__PURE__*/_jsxs("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    ...props,
    children: [/*#__PURE__*/_jsx("path", {
      d: "M8.5 6h11M8.5 12h11M8.5 18h11",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "4.5",
      cy: "6",
      r: "1",
      fill: "currentColor"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "4.5",
      cy: "12",
      r: "1",
      fill: "currentColor"
    }), /*#__PURE__*/_jsx("circle", {
      cx: "4.5",
      cy: "18",
      r: "1",
      fill: "currentColor"
    })]
  });
}
const styles = {
  footerAction: {
    kzQI83: "x1iyjqo2",
    kCS8Yb: "x1r8uery",
    $$css: true
  },
  filterInput: {
    kzQI83: "x1iyjqo2",
    kmuXW: "xs83m0k",
    kCS8Yb: "x1r8uery",
    k7Eaqz: "xeuugli",
    kZKoxP: "xssyfek",
    kAzted: "x1xf4nls",
    $$css: true
  },
  empty: {
    kzQI83: "x1iyjqo2",
    $$css: true
  }
};
export function MobileTokenizer({
  label,
  searchSource,
  value,
  onChange,
  placeholder,
  description,
  isOptional,
  isDisabled = false,
  hasCreate = false,
  maxEntries,
  maxMenuItems = 10,
  minQueryLength = 1,
  debounceMs = 150,
  emptySearchResultsText = 'No results found',
  onChangeQuery,
  xstyle
}) {
  const triggerId = useId();
  const [activeSheet, setActiveSheet] = useState(null);
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);
  const selectedIds = useMemo(() => new Set(value.map(v => v.id)), [value]);
  const isAtMax = maxEntries != null && value.length >= maxEntries;
  const handleAdd = item => {
    if (isAtMax || selectedIds.has(item.id)) {
      return;
    }
    if (hasCreate && typeof item.id === 'string' && item.id.startsWith(CREATABLE_ID_PREFIX)) {
      const created = item.id.slice(CREATABLE_ID_PREFIX.length);
      if (selectedIds.has(created)) {
        return;
      }
      const createdItem = {
        id: created,
        label: created
      };
      const real = createdItem;
      onChange([...value, real], {
        item: real,
        type: 'create'
      });
      return;
    }
    onChange([...value, item], {
      item,
      type: 'add'
    });
  };
  const handleRemove = item => onChange(value.filter(v => v.id !== item.id), {
    item,
    type: 'remove'
  });
  const handleClearAll = () => {
    if (value.length > 0) {
      onChange([], {
        item: value[value.length - 1],
        type: 'remove'
      });
    }
  };

  // ---- sheet search ----
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [retrySearch, setRetrySearch] = useState(0);
  const [renderedItemCount, setRenderedItemCount] = useState(LIST_RENDER_BATCH_SIZE);
  const seqRef = useRef(0);
  const lastLoadScrollHeightRef = useRef(null);
  const [selectedItemsAtOpen, setSelectedItemsAtOpen] = useState(value);
  const isSheetOpen = activeSheet === 'manage';
  useEffect(() => {
    if (!isSheetOpen || isDisabled) {
      return;
    }
    const seq = ++seqRef.current;
    setSearchFailed(false);
    setResults([]);
    setIsSearching(true);
    const run = async () => {
      setIsSearching(true);
      try {
        const trimmed = query.trim();
        let items;
        if (trimmed === '') {
          items = searchSource.bootstrap ? await searchSource.bootstrap() : await searchSource.search('');
        } else if (trimmed.length < minQueryLength) {
          items = [];
        } else {
          items = await searchSource.search(query);
        }
        if (seqRef.current === seq) {
          setResults(items.slice(0, maxMenuItems));
        }
      } catch {
        if (seqRef.current === seq) {
          setResults([]);
          setSearchFailed(true);
        }
      } finally {
        if (seqRef.current === seq) {
          setIsSearching(false);
        }
      }
    };
    const timer = debounceMs > 0 ? setTimeout(() => {
      void run();
    }, debounceMs) : null;
    if (timer === null) void run();
    return () => {
      seqRef.current += 1;
      if (timer !== null) clearTimeout(timer);
    };
  }, [isSheetOpen, isDisabled, query, searchSource, minQueryLength, maxMenuItems, debounceMs, retrySearch]);
  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = item => normalizedQuery === '' || item.label.toLowerCase().includes(normalizedQuery);
    const selectedAtOpenMatches = selectedItemsAtOpen.filter(matchesQuery);
    const selectedAtOpenIds = new Set(selectedAtOpenMatches.map(item => item.id));
    const resultIds = new Set(results.map(item => item.id));
    const selectedItemsMissingFromResults = value.filter(item => !selectedAtOpenIds.has(item.id) && !resultIds.has(item.id) && matchesQuery(item));

    // Selection changes update checkbox state without moving an existing row.
    // The next open snapshots the latest value and applies selected-first order.
    return [...selectedAtOpenMatches, ...selectedItemsMissingFromResults, ...results.filter(item => !selectedAtOpenIds.has(item.id))];
  }, [query, results, selectedItemsAtOpen, value]);
  const renderedItems = visibleItems.slice(0, renderedItemCount);
  const createItem = useMemo(() => {
    const trimmed = query.trim();
    if (!hasCreate || trimmed === '' || isAtMax || isSearching || searchFailed) {
      return null;
    }
    if (selectedIds.has(trimmed) || value.some(item => item.label.toLowerCase() === trimmed.toLowerCase()) || results.some(r => r.label.toLowerCase() === trimmed.toLowerCase())) {
      return null;
    }
    return {
      id: `${CREATABLE_ID_PREFIX}${trimmed}`,
      label: `Create "${trimmed}"`
    };
  }, [hasCreate, query, results, selectedIds, isAtMax, value, isSearching, searchFailed]);
  return /*#__PURE__*/_jsxs(Field, {
    label: label,
    description: description,
    isOptional: isOptional,
    isDisabled: isDisabled,
    inputID: triggerId,
    xstyle: xstyle,
    children: [/*#__PURE__*/_jsx("button", {
      type: "button",
      id: triggerId,
      "aria-haspopup": "dialog",
      "aria-expanded": activeSheet != null,
      "aria-label": label,
      disabled: isDisabled,
      onClick: () => {
        setSelectedItemsAtOpen(value);
        lastLoadScrollHeightRef.current = null;
        setRenderedItemCount(LIST_RENDER_BATCH_SIZE);
        setActiveSheet('manage');
      },
      ...{
        className: "x78zum5 x1a02dak x6s0dn4 xzye2dw xh8yej3 x1gg8mnh xu0wf1k xf314gf xmkeg23 x1y0btm7 x14i3s5s xh6dtrn xjbqb8w x1yc453h x1ypdohk x16khyan"
      },
      children: value.length > 0 ? value.map(item => /*#__PURE__*/_jsx(Token, {
        label: item.label,
        isDisabled: isDisabled
      }, item.id)) : /*#__PURE__*/_jsx("span", {
        ...{
          className: "xv1l7n4"
        },
        children: placeholder ?? ''
      })
    }), !isDisabled && /*#__PURE__*/_jsx(BottomSheetSwitcher, {
      activeSheet: activeSheet,
      onActiveSheetChange: id => setActiveSheet(id),
      children: /*#__PURE__*/_jsx(BottomSheet, {
        sheetId: "manage",
        label: label,
        height: "tall",
        children: /*#__PURE__*/_jsxs("div", {
          ...{
            className: "x78zum5 xdt5ytf x5yr21d x2lwn1j xrrkdod xoxd1wu xvmdzux"
          },
          children: [/*#__PURE__*/_jsx("div", {
            ...{
              className: "x78zum5 xuk3077 x1wesfrj"
            },
            children: /*#__PURE__*/_jsx(TextInput, {
              label: `Search ${label}`,
              isLabelHidden: true,
              placeholder: "Search...",
              startIcon: "search",
              value: query,
              size: "lg",
              width: "100%",
              hasClear: true,
              onChange: next => {
                lastLoadScrollHeightRef.current = null;
                setRenderedItemCount(LIST_RENDER_BATCH_SIZE);
                setQuery(next);
                onChangeQuery?.(next);
              },
              xstyle: styles.filterInput
            })
          }), searchFailed && /*#__PURE__*/_jsxs("div", {
            role: "alert",
            children: [/*#__PURE__*/_jsx(Text, {
              type: "body",
              children: "Could not load choices. Your selections are unchanged."
            }), /*#__PURE__*/_jsx(Button, {
              label: "Retry search",
              onClick: () => setRetrySearch(value => value + 1)
            })]
          }), /*#__PURE__*/_jsxs("div", {
            ...{
              className: "x78zum5 xdt5ytf x1iyjqo2 x1odjw0f x2lwn1j"
            },
            role: "group",
            "aria-label": label,
            "data-testid": "mobile-tokenizer-list",
            "data-rendered-count": renderedItems.length,
            "data-total-count": visibleItems.length,
            onScroll: event => {
              const list = event.currentTarget;
              const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
              if (distanceFromBottom <= LIST_LOAD_MORE_THRESHOLD_PX && lastLoadScrollHeightRef.current !== list.scrollHeight) {
                lastLoadScrollHeightRef.current = list.scrollHeight;
                setRenderedItemCount(current => Math.min(current + LIST_RENDER_BATCH_SIZE, visibleItems.length));
              }
            },
            children: [createItem != null && /*#__PURE__*/_jsxs("div", {
              "data-testid": "mobile-tokenizer-create-row",
              ...{
                className: "x78zum5 x6s0dn4 x1txdalj xh8yej3 x1gg8mnh xce4md1 x7a5moj"
              },
              children: [/*#__PURE__*/_jsx("span", {
                ...{
                  className: "x1iyjqo2 xeuugli"
                },
                children: /*#__PURE__*/_jsx(Text, {
                  type: "body",
                  children: createItem.label
                })
              }), /*#__PURE__*/_jsx(Button, {
                label: "Add",
                "aria-label": `Add ${query.trim()}`,
                variant: "secondary",
                size: "lg",
                onClick: () => {
                  handleAdd(createItem);
                  lastLoadScrollHeightRef.current = null;
                  setRenderedItemCount(LIST_RENDER_BATCH_SIZE);
                  setQuery('');
                }
              })]
            }), !isSearching && !searchFailed && visibleItems.length === 0 && createItem == null ? /*#__PURE__*/_jsx(EmptyState, {
              icon: /*#__PURE__*/_jsx(Icon, {
                icon: query.trim() === '' ? ListBulletIcon : 'search',
                size: "lg",
                color: "secondary"
              }),
              title: query.trim() === '' ? 'No items available' : emptySearchResultsText,
              description: query.trim() === '' ? 'There are no items to choose from.' : 'Try a different search.',
              isCompact: true,
              xstyle: styles.empty
            }) : renderedItems.map(item => {
              const isSelected = selectedIds.has(item.id);
              const rowDisabled = !isSelected && isAtMax;
              return /*#__PURE__*/_jsxs("button", {
                type: "button",
                role: "checkbox",
                "aria-checked": isSelected,
                "aria-label": item.label,
                disabled: rowDisabled,
                onClick: () => isSelected ? handleRemove(item) : handleAdd(item),
                ...{
                  className: "x78zum5 x6s0dn4 x1qughib x1txdalj xh8yej3 x1gg8mnh xce4md1 x7a5moj xc342km xh6dtrn xjbqb8w x1tgivj0 x1yc453h x1ypdohk x16khyan"
                },
                children: [/*#__PURE__*/_jsx("span", {
                  ...{
                    className: "x1iyjqo2 xeuugli"
                  },
                  children: /*#__PURE__*/_jsx(Text, {
                    type: "body",
                    children: item.label
                  })
                }), /*#__PURE__*/_jsx(CheckboxIndicator, {
                  state: isSelected ? 'checked' : 'unchecked',
                  size: "md",
                  isDisabled: rowDisabled
                })]
              }, item.id);
            })]
          }), query.trim() === '' && /*#__PURE__*/_jsxs("div", {
            ...{
              className: "x78zum5 x6s0dn4 x1txdalj x1vlblms xr1yuqi"
            },
            children: [/*#__PURE__*/_jsx(Button, {
              label: "Clear all",
              variant: "secondary",
              size: "lg",
              isDisabled: value.length === 0,
              onClick: () => setIsClearConfirmationOpen(true),
              xstyle: styles.footerAction
            }), /*#__PURE__*/_jsx(Button, {
              label: "Done",
              variant: "primary",
              size: "lg",
              onClick: () => {
                setQuery('');
                setActiveSheet(null);
              },
              xstyle: styles.footerAction
            })]
          }), /*#__PURE__*/_jsx(AlertDialog, {
            isOpen: isClearConfirmationOpen,
            onOpenChange: setIsClearConfirmationOpen,
            title: "Clear all selected items?",
            description: `This removes all selected items from ${label}.`,
            actionLabel: "Clear selection",
            onAction: () => {
              handleClearAll();
              setIsClearConfirmationOpen(false);
            }
          })]
        })
      })
    })]
  });
}
MobileTokenizer.displayName = 'MobileTokenizer';