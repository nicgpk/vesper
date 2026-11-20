// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zonedDateTime.ts
 * @input Instant epoch milliseconds and IANA timezone IDs
 * @output Lightweight ZonedDateTime helpers used by Schedule views
 * @position Internal timezone-aware date bridge between schedule shell and views
 */

import { plainDateAddDays, plainDateFromInstant, plainDateToInstant } from '@astryxdesign/core/utils';
export function createZonedDateTime(date, timezoneID) {
  return zonedDateTimeFromInstant(date, timezoneID);
}
export function zonedDateTimeFromInstant(instant, timezoneID) {
  return {
    instant,
    timezoneID,
    toPlainDate: () => plainDateFromInstant(instant, timezoneID),
    addDays: days => {
      const date = plainDateAddDays(plainDateFromInstant(instant, timezoneID), days);
      return zonedDateTimeFromInstant(plainDateToInstant(date, timezoneID), timezoneID);
    },
    startOfDay: () => {
      const date = plainDateFromInstant(instant, timezoneID);
      return zonedDateTimeFromInstant(plainDateToInstant(date, timezoneID), timezoneID);
    }
  };
}
export function scheduleRangeToZonedDateTimeRange(range, timezoneID) {
  return [zonedDateTimeFromInstant(range.start, timezoneID), zonedDateTimeFromInstant(range.end, timezoneID)];
}