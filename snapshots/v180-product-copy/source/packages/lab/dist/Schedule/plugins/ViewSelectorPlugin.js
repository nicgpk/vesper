// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ViewSelectorPlugin.tsx
 * @input Schedule view options and caller-provided view change callback
 * @output Hook that renders an DropdownMenu plugin for caller-provided views
 * @position Built-in Schedule plugin; re-exported from plugins.tsx
 */
import { useMemo } from 'react';
import { DropdownMenu, DropdownMenuItem } from '@astryxdesign/core/DropdownMenu';
import { Icon } from '@astryxdesign/core/Icon';
import { useScheduleContext } from "../context.js";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
function ScheduleViewSelectorControl({
  onChangeView,
  options
}) {
  const {
    view
  } = useScheduleContext();
  const selectedIndex = options.findIndex(option => option.view === view);
  const selectedLabel = options[selectedIndex]?.label ?? 'View';
  return /*#__PURE__*/_jsx(DropdownMenu, {
    button: {
      label: selectedLabel,
      size: 'sm',
      isDisabled: onChangeView == null
    },
    menuWidth: 160,
    children: options.map((option, index) => /*#__PURE__*/_jsx(DropdownMenuItem, {
      label: option.label,
      onClick: () => onChangeView?.(option.view),
      endContent: index === selectedIndex ? /*#__PURE__*/_jsx(Icon, {
        icon: "check",
        size: "sm",
        color: "primary"
      }) : null
    }, option.label))
  });
}
function createScheduleViewSelectorPlugin(options, {
  onChangeView,
  position = 'end'
} = {}) {
  return {
    renderHeader(startContent, centerContent, endContent) {
      const control = /*#__PURE__*/_jsx(ScheduleViewSelectorControl, {
        onChangeView: onChangeView,
        options: options
      });
      return position === 'start' ? {
        startContent: /*#__PURE__*/_jsxs(_Fragment, {
          children: [startContent, control]
        }),
        centerContent,
        endContent
      } : {
        startContent,
        centerContent,
        endContent: /*#__PURE__*/_jsxs(_Fragment, {
          children: [endContent, control]
        })
      };
    }
  };
}
export function useScheduleViewSelectorPlugin(options, pluginOptions = {}) {
  const {
    onChangeView,
    position = 'end'
  } = pluginOptions;
  return useMemo(() => createScheduleViewSelectorPlugin(options, {
    onChangeView,
    position
  }), [onChangeView, options, position]);
}