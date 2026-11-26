// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CalendarEvent.ts
 * @input ISO event definitions and PlainDate/Instant primitives
 * @output Calendar event types and event construction helpers
 * @position Public schedule event model; consumed by Schedule and views
 */

import { plainDateFromISO } from '@astryxdesign/core/utils';
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
export function createEventFromISO({
  id,
  title,
  category,
  start,
  end
}) {
  if (DATE_ONLY_RE.test(start) && DATE_ONLY_RE.test(end)) {
    return {
      id,
      title,
      category,
      start: plainDateFromISO(start),
      end: plainDateFromISO(end)
    };
  }
  return {
    id,
    title,
    category,
    start: Date.parse(start),
    end: Date.parse(end)
  };
}