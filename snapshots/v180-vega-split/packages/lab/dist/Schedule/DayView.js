// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DayView.tsx
 * @input Schedule context and day view options
 * @output Single-day time-grid schedule view factory
 * @position Concrete schedule view; exported as createScheduleDayView
 */
import { DATE_FORMAT_WITH_WEEKDAY, plainDateAddDays, plainDateFormat } from '@astryxdesign/core/utils';
import { enumerateDates, getScheduleRangeFromDates } from "./dateMath.js";
import { useScheduleContext } from "./context.js";
import { ScheduleMonthTitle, ScheduleFrame } from "./shared.js";
import { TimeGridView } from "./TimeGridView.js";
import { scheduleRangeToZonedDateTimeRange } from "./zonedDateTime.js";
import { jsx as _jsx } from "react/jsx-runtime";
function ScheduleDayView({
  options
}) {
  const {
    events,
    date,
    focusDate,
    timezoneID,
    locale,
    range,
    isLoading
  } = useScheduleContext();
  const {
    minHour = 0,
    maxHour = 24,
    hourHeight = 100,
    renderPopover
  } = options;
  const rangeDate = date.toPlainDate();
  const days = enumerateDates(range.startDate, range.endDate);
  const titleLabel = plainDateFormat(rangeDate, DATE_FORMAT_WITH_WEEKDAY, locale);
  return /*#__PURE__*/_jsx(ScheduleFrame, {
    title: /*#__PURE__*/_jsx(ScheduleMonthTitle, {
      date: rangeDate,
      timezoneID: timezoneID
    }),
    titleLabel: titleLabel,
    isLoading: isLoading,
    children: /*#__PURE__*/_jsx(TimeGridView, {
      days: days,
      events: events,
      focusDate: focusDate.toPlainDate(),
      timezoneID: timezoneID,
      minHour: minHour,
      maxHour: maxHour,
      hourHeight: hourHeight,
      label: titleLabel,
      renderPopover: renderPopover
    })
  });
}
export function createScheduleDayView({
  minHour = 0,
  maxHour = 24,
  hourHeight = 100,
  renderPopover
} = {}) {
  return {
    component: ScheduleDayView,
    options: {
      minHour,
      maxHour,
      hourHeight,
      renderPopover
    },
    getDateRange: date => {
      const range = getDayDateRange({
        date: date.toPlainDate(),
        timezoneID: date.timezoneID
      });
      return scheduleRangeToZonedDateTimeRange(range, date.timezoneID);
    },
    getPreviousDateRange: date => {
      const range = getDayDateRange({
        date: plainDateAddDays(date.toPlainDate(), -1),
        timezoneID: date.timezoneID
      });
      return {
        label: 'Previous day',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID)
      };
    },
    getNextDateRange: date => {
      const range = getDayDateRange({
        date: plainDateAddDays(date.toPlainDate(), 1),
        timezoneID: date.timezoneID
      });
      return {
        label: 'Next day',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID)
      };
    }
  };
}
function getDayDateRange({
  date,
  timezoneID
}) {
  return getScheduleRangeFromDates({
    startDate: date,
    endDate: plainDateAddDays(date, 1),
    timezoneID
  });
}