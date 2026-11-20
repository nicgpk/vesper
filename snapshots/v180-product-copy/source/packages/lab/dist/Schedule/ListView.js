// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListView.tsx
 * @input Schedule context and list view options
 * @output Event-list schedule view factory
 * @position Concrete schedule view; exported as createScheduleListView
 */
import * as stylex from '@stylexjs/stylex';
import { plainDateAddDays, plainDateFromInstant, plainDateIsEqual, plainDateToISO } from '@astryxdesign/core/utils';
import { Heading } from '@astryxdesign/core/Text';
import { enumerateDates, eventOccursOnDate, getScheduleRangeFromDates, isDayEvent } from "./dateMath.js";
import { useScheduleContext } from "./context.js";
import { formatDayNumber, formatFullDate, formatWeekday, formatWeekTitle, isEventInPast, ListEventRow, ScheduleFrame, ScheduleRangeMonthTitle, styles } from "./shared.js";
import { useCurrentTime } from "./useCurrentTime.js";
import { scheduleRangeToZonedDateTimeRange } from "./zonedDateTime.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function ScheduleListView(_props) {
  const {
    events,
    timezoneID,
    locale,
    range,
    isLoading,
    headingLevel
  } = useScheduleContext();
  const days = enumerateDates(range.startDate, range.endDate);
  const currentTime = useCurrentTime();
  const currentPlainDate = plainDateFromInstant(currentTime, timezoneID);
  const endDate = plainDateAddDays(range.endDate, -1);
  const titleLabel = formatWeekTitle(range.startDate, endDate, timezoneID, locale);
  const visibleDays = days.map(day => {
    const isCurrentDay = plainDateIsEqual(day, currentPlainDate);
    const isBaseDay = plainDateIsEqual(day, range.startDate);
    const dayEvents = events.filter(event => eventOccursOnDate(event, day, timezoneID));
    return {
      day,
      dayEvents,
      isCurrentDay,
      isVisible: dayEvents.length > 0 || isCurrentDay || isBaseDay
    };
  }).filter(dayRecord => dayRecord.isVisible);
  return /*#__PURE__*/_jsx(ScheduleFrame, {
    title: /*#__PURE__*/_jsx(ScheduleRangeMonthTitle, {
      start: range.startDate,
      end: endDate,
      timezoneID: timezoneID
    }),
    titleLabel: titleLabel,
    isLoading: isLoading,
    children: /*#__PURE__*/_jsx("div", {
      ...stylex.props(styles.list),
      children: visibleDays.map(({
        day,
        dayEvents,
        isCurrentDay
      }, index) => /*#__PURE__*/_jsxs("section", {
        ...stylex.props(styles.listDay, index === visibleDays.length - 1 && styles.listDayLast),
        children: [/*#__PURE__*/_jsx(ListDayHeading, {
          day: day,
          isCurrentDay: isCurrentDay,
          timezoneID: timezoneID,
          headingLevel: headingLevel
        }), /*#__PURE__*/_jsx("div", {
          ...stylex.props(styles.listEvents),
          children: renderListRows({
            events: dayEvents,
            timezoneID,
            showCurrentTime: isCurrentDay && !isLoading,
            currentTime
          })
        })]
      }, plainDateToISO(day)))
    })
  });
}
function ListDayHeading({
  day,
  isCurrentDay,
  timezoneID,
  headingLevel
}) {
  const {
    locale
  } = useScheduleContext();
  return /*#__PURE__*/_jsxs(Heading, {
    level: headingLevel,
    color: "secondary",
    display: "block",
    "aria-label": formatFullDate(day, timezoneID, locale),
    "aria-current": isCurrentDay ? 'date' : undefined,
    xstyle: styles.listDayHeading,
    children: [/*#__PURE__*/_jsx("span", {
      ...stylex.props(styles.listDayNumber, isCurrentDay && styles.listDayNumberCurrent),
      children: /*#__PURE__*/_jsx("span", {
        ...stylex.props(styles.listDayNumberText),
        children: formatDayNumber(day, timezoneID, locale)
      })
    }), formatWeekday(day, timezoneID, 'short', locale)]
  });
}
function renderListRows({
  events,
  timezoneID,
  showCurrentTime,
  currentTime
}) {
  const rows = events.map(event => /*#__PURE__*/_jsx(ListEventRow, {
    event: event,
    timezoneID: timezoneID,
    isPast: isEventInPast(event, currentTime, timezoneID)
  }, event.id));
  if (!showCurrentTime) {
    return rows;
  }
  const marker = /*#__PURE__*/_jsx("div", {
    "aria-hidden": true,
    ...stylex.props(styles.listNowRow)
  }, "current-time");
  const insertIndex = events.findIndex(event => !isDayEvent(event) && event.start > currentTime);
  if (insertIndex < 0) {
    return [...rows, marker];
  }
  return [...rows.slice(0, insertIndex), marker, ...rows.slice(insertIndex)];
}
export function createScheduleListView({
  days: listDays = 7
} = {}) {
  return {
    component: ScheduleListView,
    options: {
      days: listDays
    },
    getDateRange: date => {
      const range = getListDateRange({
        date: date.toPlainDate(),
        timezoneID: date.timezoneID,
        days: listDays
      });
      return scheduleRangeToZonedDateTimeRange(range, date.timezoneID);
    },
    getPreviousDateRange: date => {
      const range = getListDateRange({
        date: plainDateAddDays(date.toPlainDate(), -listDays),
        timezoneID: date.timezoneID,
        days: listDays
      });
      return {
        label: 'Previous list range',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID)
      };
    },
    getNextDateRange: date => {
      const range = getListDateRange({
        date: plainDateAddDays(date.toPlainDate(), listDays),
        timezoneID: date.timezoneID,
        days: listDays
      });
      return {
        label: 'Next list range',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID)
      };
    }
  };
}
function getListDateRange({
  date,
  timezoneID,
  days
}) {
  return getScheduleRangeFromDates({
    startDate: date,
    endDate: plainDateAddDays(date, days),
    timezoneID
  });
}