// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MonthlyView.tsx
 * @input Schedule context and monthly view options
 * @output Month grid schedule view factory
 * @position Concrete schedule view; exported as createScheduleMonthlyView
 */
import * as stylex from '@stylexjs/stylex';
import { plainDateAddDays, plainDateAddMonths, plainDateFromInstant, plainDateIsAfter, plainDateIsBefore, plainDateIsEqual, plainDateSetEndOfWeekExclusive, plainDateSetFirstOfMonth, plainDateSetStartOfWeek, plainDateToISO } from '@astryxdesign/core/utils';
import { Heading, Text } from '@astryxdesign/core/Text';
import { enumerateDates, getScheduleRangeFromDates, isDayEvent } from "./dateMath.js";
import { useScheduleContext } from "./context.js";
import { formatDayNumber, formatEventAccessibilityLabel, formatFullDate, formatMonthTitle, formatWeekday, isEventInPast, MonthEventPill, ScheduleFrame, ScheduleMonthTitle, styles } from "./shared.js";
import { useCurrentTime } from "./useCurrentTime.js";
import { scheduleRangeToZonedDateTimeRange } from "./zonedDateTime.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function ScheduleMonthlyView(_props) {
  const {
    events,
    categories,
    date,
    focusDate,
    timezoneID,
    locale,
    range,
    isLoading,
    headingLevel
  } = useScheduleContext();
  const rangeDate = date.toPlainDate();
  const highlightedDate = focusDate.toPlainDate();
  const currentTime = useCurrentTime();
  const days = enumerateDates(range.startDate, range.endDate);
  const weeks = getWeeks(days);
  const eventSegments = getMonthEventSegments(events, days, timezoneID);
  const eventsByDay = getMonthEventsByDay(events, days, timezoneID);
  return /*#__PURE__*/_jsx(ScheduleFrame, {
    title: /*#__PURE__*/_jsx(ScheduleMonthTitle, {
      date: rangeDate,
      timezoneID: timezoneID
    }),
    titleLabel: formatMonthTitle(rangeDate, timezoneID, locale),
    isLoading: isLoading,
    children: /*#__PURE__*/_jsxs("div", {
      role: "grid",
      "aria-label": formatMonthTitle(rangeDate, timezoneID, locale),
      "aria-readonly": true
      // The grid scrolls horizontally at narrow viewports and contains no
      // focusable descendants, so it must be focusable itself for keyboard
      // scrolling (axe: scrollable-region-focusable).
      ,
      tabIndex: 0,
      ...stylex.props(styles.monthGrid),
      children: [/*#__PURE__*/_jsx("div", {
        role: "row",
        ...stylex.props(styles.weekHeader),
        children: days.slice(0, 7).map((day, index) => /*#__PURE__*/_jsx("div", {
          role: "columnheader",
          "aria-label": formatWeekday(day, timezoneID, 'long', locale),
          "aria-colindex": index + 1,
          ...stylex.props(styles.weekdayLabel),
          children: /*#__PURE__*/_jsx(Heading, {
            level: headingLevel,
            color: "secondary",
            display: "block",
            xstyle: styles.weekdayHeading,
            children: formatWeekday(day, timezoneID, 'short', locale)
          })
        }, plainDateToISO(day)))
      }), /*#__PURE__*/_jsxs("div", {
        ...stylex.props(styles.monthGridSurface),
        children: [/*#__PURE__*/_jsx("div", {
          ...stylex.props(styles.monthCellGrid),
          children: weeks.map((week, weekIndex) => /*#__PURE__*/_jsx("div", {
            role: "row",
            ...stylex.props(styles.monthGridRow),
            children: week.map((day, dayIndex) => {
              const index = weekIndex * 7 + dayIndex;
              const isOutsideMonth = day.month !== rangeDate.month;
              const dayEvents = eventsByDay.get(plainDateToISO(day)) ?? EMPTY_EVENTS;
              return /*#__PURE__*/_jsxs("div", {
                role: "gridcell",
                "aria-label": formatFullDate(day, timezoneID, locale),
                "aria-colindex": dayIndex + 1,
                "aria-current": plainDateIsEqual(day, highlightedDate) ? 'date' : undefined,
                ...stylex.props(styles.monthCell, index % 7 === 6 && styles.monthCellLastColumn, index >= days.length - 7 && styles.monthCellLastRow, isOutsideMonth && styles.monthCellOutside),
                children: [/*#__PURE__*/_jsx("div", {
                  ...stylex.props(styles.monthDayNumber, plainDateIsEqual(day, highlightedDate) && styles.currentDayPill),
                  children: /*#__PURE__*/_jsx(Text, {
                    type: "supporting",
                    color: "inherit",
                    weight: "medium",
                    hasTabularNumbers: true,
                    children: formatDayNumber(day, timezoneID, locale)
                  })
                }), dayEvents.length > 0 && /*#__PURE__*/_jsx("ul", {
                  ...stylex.props(styles.visuallyHidden),
                  children: dayEvents.map(event => /*#__PURE__*/_jsx("li", {
                    children: formatEventAccessibilityLabel(event, day, timezoneID, categories, locale)
                  }, event.id))
                })]
              }, plainDateToISO(day));
            })
          }, plainDateToISO(week[0])))
        }), /*#__PURE__*/_jsx("div", {
          "aria-hidden": true,
          ...stylex.props(styles.monthEventOverlay),
          children: eventSegments.map(segment => /*#__PURE__*/_jsx("div", {
            ...stylex.props(styles.monthEventSpan(segment.week, segment.columnStart, segment.columnEnd, segment.level)),
            children: /*#__PURE__*/_jsx(MonthEventPill, {
              event: segment.event,
              timezoneID: timezoneID,
              isPast: isEventInPast(segment.event, currentTime, timezoneID)
            })
          }, `${segment.event.id}:${segment.week}:${segment.columnStart}`))
        })]
      })]
    })
  });
}
function getWeeks(days) {
  const weeks = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}
const EMPTY_EVENTS = [];
function getMonthEventsByDay(events, days, timezoneID) {
  const eventsByDay = new Map();
  days.forEach(day => {
    eventsByDay.set(plainDateToISO(day), []);
  });
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  if (firstDay == null || lastDay == null) {
    return eventsByDay;
  }
  events.forEach(event => {
    const [eventStart, eventEnd] = getEventDateSpan(event, timezoneID);
    if (plainDateIsBefore(eventEnd, firstDay) || plainDateIsAfter(eventStart, lastDay)) {
      return;
    }
    let current = plainDateIsBefore(eventStart, firstDay) ? firstDay : eventStart;
    const visibleEnd = plainDateIsAfter(eventEnd, lastDay) ? lastDay : eventEnd;
    while (!plainDateIsAfter(current, visibleEnd)) {
      eventsByDay.get(plainDateToISO(current))?.push(event);
      current = plainDateAddDays(current, 1);
    }
  });
  return eventsByDay;
}
const MAX_MONTH_EVENT_LEVELS = 4;
function getMonthEventSegments(events, days, timezoneID) {
  const segments = [];
  const levelsByWeek = [];
  const monthEvents = events.map(event => {
    const [eventStart, eventEnd] = getEventDateSpan(event, timezoneID);
    const startIndex = days.findIndex(day => !plainDateIsBefore(day, eventStart));
    const endIndexFromRight = [...days].reverse().findIndex(day => !plainDateIsAfter(day, eventEnd));
    if (startIndex < 0 || endIndexFromRight < 0) {
      return null;
    }
    const endIndex = days.length - 1 - endIndexFromRight;
    return {
      event,
      startIndex,
      endIndex,
      isPriority: isDayEvent(event) || endIndex > startIndex
    };
  }).filter(record => record != null).sort((a, b) => {
    if (a.startIndex !== b.startIndex) {
      return a.startIndex - b.startIndex;
    }
    if (a.isPriority !== b.isPriority) {
      return a.isPriority ? -1 : 1;
    }
    const aDuration = a.endIndex - a.startIndex;
    const bDuration = b.endIndex - b.startIndex;
    if (aDuration !== bDuration) {
      return bDuration - aDuration;
    }
    return a.event.title.localeCompare(b.event.title);
  });
  monthEvents.forEach(({
    event,
    startIndex,
    endIndex
  }) => {
    const [eventStart, eventEnd] = getEventDateSpan(event, timezoneID);
    if (plainDateIsBefore(eventEnd, days[0]) || plainDateIsAfter(eventStart, days[days.length - 1])) {
      return;
    }
    for (let week = Math.floor(startIndex / 7); week <= Math.floor(endIndex / 7); week += 1) {
      const columnStart = week === Math.floor(startIndex / 7) ? startIndex % 7 : 0;
      const columnEnd = week === Math.floor(endIndex / 7) ? endIndex % 7 : 6;
      const weekLevels = levelsByWeek[week] ??= [];
      const level = getAvailableLevel(weekLevels, columnStart);
      if (level < MAX_MONTH_EVENT_LEVELS) {
        weekLevels[level] = columnEnd;
        segments.push({
          event,
          week,
          columnStart,
          columnEnd,
          level
        });
      }
    }
  });
  return segments;
}
function getEventDateSpan(event, timezoneID) {
  if (isDayEvent(event)) {
    return [event.start, event.end];
  }
  return [plainDateFromInstant(event.start, timezoneID), plainDateFromInstant(Math.max(event.end - 1, event.start), timezoneID)];
}
function getAvailableLevel(levels, columnStart) {
  const level = levels.findIndex(columnEnd => columnStart > columnEnd);
  return level >= 0 ? level : levels.length;
}
export function createScheduleMonthlyView({
  weekStartsOn = 0
} = {}) {
  return {
    component: ScheduleMonthlyView,
    options: {
      weekStartsOn
    },
    getDateRange: date => {
      const range = getMonthDateRange({
        date: date.toPlainDate(),
        timezoneID: date.timezoneID,
        weekStartsOn
      });
      return scheduleRangeToZonedDateTimeRange(range, date.timezoneID);
    },
    getPreviousDateRange: date => {
      const range = getMonthDateRange({
        date: plainDateAddMonths(date.toPlainDate(), -1),
        timezoneID: date.timezoneID,
        weekStartsOn
      });
      return {
        label: 'Previous month',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID)
      };
    },
    getNextDateRange: date => {
      const range = getMonthDateRange({
        date: plainDateAddMonths(date.toPlainDate(), 1),
        timezoneID: date.timezoneID,
        weekStartsOn
      });
      return {
        label: 'Next month',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID)
      };
    }
  };
}
function getMonthDateRange({
  date,
  timezoneID,
  weekStartsOn
}) {
  const firstOfMonth = plainDateSetFirstOfMonth(date);
  const nextMonth = plainDateAddMonths(firstOfMonth, 1);
  return getScheduleRangeFromDates({
    startDate: plainDateSetStartOfWeek(firstOfMonth, weekStartsOn),
    endDate: plainDateSetEndOfWeekExclusive(plainDateAddDays(nextMonth, -1), weekStartsOn),
    timezoneID
  });
}