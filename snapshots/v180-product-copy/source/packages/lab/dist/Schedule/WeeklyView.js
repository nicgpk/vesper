// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file WeeklyView.tsx
 * @input Schedule context and weekly view options
 * @output Week time-grid schedule view factory
 * @position Concrete schedule view; exported as createScheduleWeeklyView
 */
import { plainDateAddDays, plainDateSetStartOfWeek } from '@astryxdesign/core/utils';
import { enumerateDates, getScheduleRangeFromDates } from "./dateMath.js";
import { useScheduleContext } from "./context.js";
import { formatWeekTitle, ScheduleFrame, ScheduleRangeMonthTitle } from "./shared.js";
import { TimeGridView } from "./TimeGridView.js";
import { scheduleRangeToZonedDateTimeRange } from "./zonedDateTime.js";
import { jsx as _jsx } from "react/jsx-runtime";
function ScheduleWeeklyView({
  options
}) {
  const {
    events,
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
  const days = enumerateDates(range.startDate, range.endDate);
  const highlightedDate = focusDate.toPlainDate();
  const titleLabel = formatWeekTitle(days[0], days[days.length - 1], timezoneID, locale);
  return /*#__PURE__*/_jsx(ScheduleFrame, {
    title: /*#__PURE__*/_jsx(ScheduleRangeMonthTitle, {
      start: days[0],
      end: days[days.length - 1],
      timezoneID: timezoneID
    }),
    titleLabel: titleLabel,
    isLoading: isLoading,
    children: /*#__PURE__*/_jsx(TimeGridView, {
      days: days,
      events: events,
      focusDate: highlightedDate,
      timezoneID: timezoneID,
      minHour: minHour,
      maxHour: maxHour,
      hourHeight: hourHeight,
      label: titleLabel,
      renderPopover: renderPopover
    })
  });
}
export function createScheduleWeeklyView({
  weekStartsOn = 0,
  minHour = 0,
  maxHour = 24,
  hourHeight = 100,
  renderPopover
} = {}) {
  return {
    component: ScheduleWeeklyView,
    options: {
      weekStartsOn,
      minHour,
      maxHour,
      hourHeight,
      renderPopover
    },
    getDateRange: date => {
      const range = getWeekDateRange({
        date: date.toPlainDate(),
        timezoneID: date.timezoneID,
        weekStartsOn
      });
      return scheduleRangeToZonedDateTimeRange(range, date.timezoneID);
    },
    getPreviousDateRange: date => {
      const range = getWeekDateRange({
        date: plainDateAddDays(date.toPlainDate(), -7),
        timezoneID: date.timezoneID,
        weekStartsOn
      });
      return {
        label: 'Previous week',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID)
      };
    },
    getNextDateRange: date => {
      const range = getWeekDateRange({
        date: plainDateAddDays(date.toPlainDate(), 7),
        timezoneID: date.timezoneID,
        weekStartsOn
      });
      return {
        label: 'Next week',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID)
      };
    }
  };
}
function getWeekDateRange({
  date,
  timezoneID,
  weekStartsOn
}) {
  const startDate = plainDateSetStartOfWeek(date, weekStartsOn);
  return getScheduleRangeFromDates({
    startDate,
    endDate: plainDateAddDays(startDate, 7),
    timezoneID
  });
}