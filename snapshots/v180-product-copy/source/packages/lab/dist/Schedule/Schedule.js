// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Schedule.tsx
 * @input Calendar events, event loader functions, view objects, date/focusDate/timezone props, and provider locale
 * @output Generic read-only schedule shell that renders arbitrary schedule views
 * @position Lab component shell; concrete views live in separate view files
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Schedule/index.ts
 * - /packages/lab/src/Schedule/Schedule.test.tsx
 * - /apps/storybook/stories/Schedule.stories.tsx
 */
import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useLocale } from '@astryxdesign/core/i18n';
import { mergeProps, plainDateFromInstant } from '@astryxdesign/core/utils';
import { eventOverlapsRange, getBrowserTimezoneID, sortEvents } from "./dateMath.js";
import { ScheduleContext } from "./context.js";
import { defaultSchedulePlugins } from "./plugins/index.js";
import { styles } from "./shared.js";
import { TimeGridScrollMemoryContext } from "./timeGridScrollMemory.js";
import { createZonedDateTime } from "./zonedDateTime.js";
import { themeProps } from '@astryxdesign/core/utils';
import { jsx as _jsx } from "react/jsx-runtime";
const eventLoaderCache = new WeakMap();
function readAsyncEvents(loader, start, end) {
  let loaderCache = eventLoaderCache.get(loader);
  if (loaderCache == null) {
    loaderCache = new Map();
    eventLoaderCache.set(loader, loaderCache);
  }
  const key = `${start}:${end}`;
  let record = loaderCache.get(key);
  if (record == null) {
    record = {
      status: 'pending',
      promise: Promise.resolve().then(() => loader(start, end)).then(value => {
        if (record != null) {
          record.status = 'fulfilled';
          record.value = value;
        }
      }, error => {
        if (record != null) {
          record.status = 'rejected';
          record.error = error;
        }
      }),
      value: [],
      error: null
    };
    loaderCache.set(key, record);
  }
  if (record.status === 'pending') {
    throw record.promise;
  }
  if (record.status === 'rejected') {
    throw record.error;
  }
  return record.value;
}
function resolveEvents(eventSource, range, timezoneID) {
  const events = typeof eventSource === 'function' ? readAsyncEvents(eventSource, range.start, range.end) : eventSource;
  return sortEvents(events.filter(event => eventOverlapsRange(event, range, timezoneID)), timezoneID);
}
function getRange(view, date) {
  const [start, end] = view.getDateRange(date);
  return {
    start: start.instant,
    end: end.instant,
    startDate: plainDateFromInstant(start.instant, start.timezoneID),
    endDate: plainDateFromInstant(end.instant, end.timezoneID)
  };
}
function ScheduleViewContent({
  view,
  eventSource,
  categories,
  date,
  focusDate,
  locale,
  isLoading,
  onPreviousDate,
  previousDateLabel,
  onToday,
  onNextDate,
  nextDateLabel,
  plugins,
  headingLevel
}) {
  const Component = view.component;
  const range = getRange(view, date);
  const events = isLoading ? [] : resolveEvents(eventSource, range, date.timezoneID);
  return /*#__PURE__*/_jsx(ScheduleContext.Provider, {
    value: {
      events,
      categories,
      date,
      focusDate,
      timezoneID: date.timezoneID,
      locale,
      range,
      isLoading,
      onPreviousDate,
      previousDateLabel,
      onToday,
      onNextDate,
      nextDateLabel,
      view,
      plugins,
      headingLevel
    },
    children: /*#__PURE__*/_jsx(Component, {
      options: view.options
    })
  });
}
export function Schedule({
  view,
  events,
  categories = [],
  date,
  focusDate: focusDateProp,
  onChangeDate,
  timezoneID: timezoneIDProp,
  plugins = defaultSchedulePlugins,
  headingLevel = 3,
  xstyle,
  className,
  style,
  ...rest
}) {
  const locale = useLocale();
  const timezoneID = timezoneIDProp ?? getBrowserTimezoneID();
  const [internalFocusDate] = useState(() => Date.now());
  const focusDate = focusDateProp ?? internalFocusDate;
  const zonedDateTime = useMemo(() => createZonedDateTime(date, timezoneID), [date, timezoneID]);
  const focusZonedDateTime = useMemo(() => createZonedDateTime(focusDate, timezoneID), [focusDate, timezoneID]);
  const updateDate = useCallback(nextDate => {
    onChangeDate?.(nextDate);
  }, [onChangeDate]);
  const shiftToRange = useCallback(nextRange => {
    const currentRange = view.getDateRange(zonedDateTime);
    updateDate(zonedDateTime.instant + nextRange[0].instant - currentRange[0].instant);
  }, [updateDate, view, zonedDateTime]);
  const previousDateRange = useMemo(() => view.getPreviousDateRange(zonedDateTime), [view, zonedDateTime]);
  const nextDateRange = useMemo(() => view.getNextDateRange(zonedDateTime), [view, zonedDateTime]);
  const onPreviousDate = useCallback(() => {
    shiftToRange(previousDateRange.range);
  }, [previousDateRange, shiftToRange]);
  const onToday = useCallback(() => {
    updateDate(Date.now());
  }, [updateDate]);
  const onNextDate = useCallback(() => {
    shiftToRange(nextDateRange.range);
  }, [nextDateRange, shiftToRange]);
  // Lives above the suspense boundary so the fallback's viewport and the
  // loaded content's viewport share one scroll record per rendered range.
  const timeGridScrollMemory = useRef({
    key: null,
    offset: 0
  });
  return /*#__PURE__*/_jsx("div", {
    ...rest,
    ...mergeProps(themeProps('schedule'), stylex.props(styles.root, xstyle), className, style),
    children: /*#__PURE__*/_jsx(TimeGridScrollMemoryContext.Provider, {
      value: timeGridScrollMemory,
      children: /*#__PURE__*/_jsx(Suspense, {
        fallback: /*#__PURE__*/_jsx(ScheduleViewContent, {
          view: view,
          eventSource: [],
          categories: categories,
          date: zonedDateTime,
          focusDate: focusZonedDateTime,
          locale: locale,
          isLoading: true,
          onPreviousDate: onPreviousDate,
          previousDateLabel: previousDateRange.label,
          onToday: onToday,
          onNextDate: onNextDate,
          nextDateLabel: nextDateRange.label,
          plugins: plugins,
          headingLevel: headingLevel
        }),
        children: /*#__PURE__*/_jsx(ScheduleViewContent, {
          view: view,
          eventSource: events,
          categories: categories,
          date: zonedDateTime,
          focusDate: focusZonedDateTime,
          locale: locale,
          isLoading: false,
          onPreviousDate: onPreviousDate,
          previousDateLabel: previousDateRange.label,
          onToday: onToday,
          onNextDate: onNextDate,
          nextDateLabel: nextDateRange.label,
          plugins: plugins,
          headingLevel: headingLevel
        })
      })
    })
  });
}