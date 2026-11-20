// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PaginationPlugin.tsx
 * @input Schedule date navigation callbacks from Schedule context
 * @output Hook and default plugin that render previous, today, and next controls
 * @position Built-in Schedule plugin; re-exported from plugins.tsx
 */
import { useMemo } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { rtlStyles } from '@astryxdesign/core/utils';
import { useScheduleContext } from "../context.js";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
function SchedulePaginationControls() {
  const {
    onPreviousDate,
    previousDateLabel,
    onToday,
    onNextDate,
    nextDateLabel
  } = useScheduleContext();
  return /*#__PURE__*/_jsxs(ButtonGroup, {
    label: "Schedule pagination",
    size: "sm",
    children: [/*#__PURE__*/_jsx(IconButton, {
      label: previousDateLabel,
      icon: /*#__PURE__*/_jsx(Icon, {
        icon: "chevronLeft",
        size: "sm",
        color: "inherit",
        xstyle: rtlStyles.mirror
      }),
      onClick: onPreviousDate
    }), /*#__PURE__*/_jsx(Button, {
      label: "Today",
      size: "sm",
      onClick: onToday
    }), /*#__PURE__*/_jsx(IconButton, {
      label: nextDateLabel,
      icon: /*#__PURE__*/_jsx(Icon, {
        icon: "chevronRight",
        size: "sm",
        color: "inherit",
        xstyle: rtlStyles.mirror
      }),
      onClick: onNextDate
    })]
  });
}
function createSchedulePaginationPlugin({
  position = 'start'
} = {}) {
  return {
    renderHeader(startContent, centerContent, endContent) {
      const controls = /*#__PURE__*/_jsx(SchedulePaginationControls, {});
      return position === 'start' ? {
        startContent: /*#__PURE__*/_jsxs(_Fragment, {
          children: [controls, startContent]
        }),
        centerContent,
        endContent
      } : {
        startContent,
        centerContent,
        endContent: /*#__PURE__*/_jsxs(_Fragment, {
          children: [endContent, controls]
        })
      };
    }
  };
}
export const defaultSchedulePaginationPlugin = createSchedulePaginationPlugin();
export function useSchedulePaginationPlugin({
  position = 'start'
} = {}) {
  return useMemo(() => createSchedulePaginationPlugin({
    position
  }), [position]);
}