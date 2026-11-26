// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file plugins.tsx
 * @input Built-in schedule plugin hooks and stable defaults
 * @output Default Schedule plugin list and plugin hook re-exports
 * @position Plugin barrel; plugin implementations live in separate files
 */
import { defaultSchedulePaginationPlugin } from "./PaginationPlugin.js";
export { useSchedulePaginationPlugin } from "./PaginationPlugin.js";
export { useScheduleViewSelectorPlugin } from "./ViewSelectorPlugin.js";
export const defaultSchedulePlugins = [defaultSchedulePaginationPlugin];