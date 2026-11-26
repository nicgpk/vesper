// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dateMath.ts
 * @input PlainDate records, Instant epoch milliseconds, IANA timezone IDs
 * @output Pure range, conversion, formatting, and event-overlap utilities
 * @position Shared schedule utility layer; consumed by Schedule and tests
 */

import { plainDateAddDays, plainDateFromInstant, plainDateIsAfter, plainDateIsBefore, plainDateToInstant } from '@astryxdesign/core/utils';
export function getBrowserTimezoneID() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
export function isDayEvent(event) {
  return typeof event.start !== 'number';
}
export function getScheduleRangeFromDates({
  startDate,
  endDate,
  timezoneID
}) {
  return {
    startDate,
    endDate,
    start: plainDateToInstant(startDate, timezoneID),
    end: plainDateToInstant(endDate, timezoneID)
  };
}
export function enumerateDates(start, endExclusive) {
  const dates = [];
  let current = start;
  while (plainDateIsBefore(current, endExclusive)) {
    dates.push(current);
    current = plainDateAddDays(current, 1);
  }
  return dates;
}
export function eventOverlapsRange(event, range, timezoneID) {
  if (isDayEvent(event)) {
    const eventStart = plainDateToInstant(event.start, timezoneID);
    const eventEnd = plainDateToInstant(plainDateAddDays(event.end, 1), timezoneID);
    return eventStart < range.end && eventEnd > range.start;
  }
  return event.start < range.end && event.end > range.start;
}
export function eventOccursOnDate(event, date, timezoneID) {
  if (isDayEvent(event)) {
    return !plainDateIsAfter(event.start, date) && !plainDateIsBefore(event.end, date);
  }
  const startDate = plainDateFromInstant(event.start, timezoneID);
  const endDate = plainDateFromInstant(Math.max(event.end - 1, event.start), timezoneID);
  return !plainDateIsAfter(startDate, date) && !plainDateIsBefore(endDate, date);
}
export function sortEvents(events, timezoneID) {
  return [...events].sort((a, b) => {
    const aStart = getEventSortStart(a, timezoneID);
    const bStart = getEventSortStart(b, timezoneID);
    return aStart < bStart ? -1 : aStart > bStart ? 1 : a.title.localeCompare(b.title);
  });
}
function getEventSortStart(event, timezoneID) {
  return isDayEvent(event) ? plainDateToInstant(event.start, timezoneID) : event.start;
}