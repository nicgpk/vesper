// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MenuBottomSheetActionList.tsx
 * @input Uses menu data entries and callbacks for selection and drill-in
 * @output Internal touch-friendly action list with row-aligned section headings
 * @position Shared implementation for menu bottom-sheet presentations
 */
import React, { useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Divider } from "../Divider/index.js";
import { Heading } from "../Heading/index.js";
import { Icon, renderIconSlot } from "../Icon/index.js";
import { List, ListItem } from "../List/index.js";
import { useMenuPress } from "../hooks/useMenuPress.js";
import "../theme/tokens.stylex.js";
import { colorVars, spacingVars } from "../theme/tokens.stylex.js";
import { rtlStyles } from "../utils/index.js";
import { getInteractionModality } from "../utils/interactionModality.js";
import { isModifiedClick } from "./menuItemRoles.js";

/** The action rows: ListItem renders its action as a button (or a link). */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SHEET_ROW_SELECTOR = 'button:not(:disabled), a[href]';
const styles = {
  list: {
    k7VYTy: "xpdipgo",
    kfSwDN: "x87ps6o",
    $$css: true
  },
  destructiveAction: {
    "--_item-label-color": "xufyqxy",
    "--_item-description-color": "xqlix59",
    kMwMTN: "xjt36v0",
    $$css: true
  },
  divider: {
    kqGvvJ: "xsq74q5",
    $$css: true
  },
  sectionHeading: {
    kg3NbH: "xrrkdod",
    $$css: true
  }
};
function getItemKey(item, index) {
  return `item-${item.id ?? index}`;
}
export function MenuBottomSheetActionList({
  items,
  onSelect,
  onOpenSubmenu
}) {
  const listRef = useRef(null);
  // The press model: the row under a finger's RELEASE acts, and the
  // highlight (focus) follows the finger across the rows. The sheet is modal,
  // so a release outside it is the scrim's, not a dismissal of ours.
  const menuPress = useMenuPress({
    menuRef: listRef,
    itemSelector: SHEET_ROW_SELECTOR
  });
  const renderItem = (item, index) => {
    const isSubmenu = item.items != null && item.items.length > 0;
    const isDestructive = item.variant === 'destructive';
    const isLink = !isSubmenu && item.href != null;
    const handleActivate = event => {
      if (isLink && item.isDisabled) {
        // A disabled link row goes nowhere.
        event.preventDefault();
        return;
      }
      if (getInteractionModality() === 'pointer') {
        event.currentTarget.blur();
      }
      if (isSubmenu) {
        onOpenSubmenu(item);
      } else if (isLink && isModifiedClick(event)) {
        // A modified click on a link row is the browser's (a new tab); the
        // row's handler stays out of it, the sheet still closes.
        onSelect({
          ...item,
          onClick: undefined
        }, event);
      } else {
        onSelect(item, event);
      }
    };
    return /*#__PURE__*/_jsx(ListItem, {
      label: item.label,
      description: item.description,
      startContent: item.icon ? renderIconSlot(item.icon, {
        size: 'sm',
        color: isDestructive ? 'error' : 'secondary'
      }) : undefined,
      endContent: isSubmenu ? /*#__PURE__*/_jsx(Icon, {
        icon: "chevronRight",
        size: "sm",
        color: "secondary",
        xstyle: rtlStyles.mirror
      }) : item.endContent,
      isDisabled: item.isDisabled
      // A row with an address is a real link in the sheet too: the
      // ListItem renders its anchor, and the row's select handler rides the
      // capture phase — ListItem leaves a click on its inner anchor to the
      // anchor, so `onClick` alone would never run for a link row.
      ,
      href: isLink ? item.href : undefined,
      target: isLink ? item.target : undefined,
      rel: isLink ? item.rel : undefined,
      onClick: isLink ? undefined : handleActivate,
      onClickCapture: isLink ? handleActivate : undefined,
      xstyle: isDestructive && styles.destructiveAction
    }, getItemKey(item, index));
  };
  return /*#__PURE__*/_jsx(List, {
    ref: listRef,
    density: "spacious",
    xstyle: styles.list,
    ...menuPress.menuProps,
    children: items.map((option, index) => {
      if ('type' in option && option.type === 'divider') {
        return /*#__PURE__*/_jsx("li", {
          role: "presentation",
          ...{
            className: "x3ct3a4"
          },
          children: /*#__PURE__*/_jsx(Divider, {
            xstyle: styles.divider
          })
        }, `divider-${index}`);
      }
      if ('type' in option && option.type === 'section') {
        return /*#__PURE__*/_jsx("li", {
          ...{
            className: "x3ct3a4"
          },
          children: /*#__PURE__*/_jsxs("div", {
            role: "group",
            "aria-label": option.title,
            ...{
              className: "x78zum5 xdt5ytf xzye2dw"
            },
            children: [option.title && /*#__PURE__*/_jsx(Heading, {
              level: 4,
              xstyle: styles.sectionHeading,
              children: option.title
            }), /*#__PURE__*/_jsx(List, {
              density: "spacious",
              children: option.items.map(renderItem)
            })]
          })
        }, `section-${option.id ?? index}`);
      }
      return renderItem(option, index);
    })
  });
}
MenuBottomSheetActionList.displayName = 'MenuBottomSheetActionList';