// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Timer.tsx
 * @input Uses an optional start time, standardized format, Timestamp typography, BaseProps, and React ref
 * @output Exports Timer, TimerProps, and TimerFormat with non-rendering elapsed-time updates
 * @position Core content primitive for elapsed duration in active operations
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Timer/Timer.spec.md
 * - /packages/core/src/Timer/Timer.doc.mjs
 * - /packages/core/src/Timer/Timer.test.tsx
 * - /packages/core/src/Timer/index.ts
 * - /apps/storybook/stories/Timer.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Timer/
 */
import { useEffect, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useMergedRefs } from "../hooks/useMergedRefs.js";
import { Text } from "../Text/index.js";
import { mergeProps } from "../utils/index.js";
import { themeProps } from "../utils/themeProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
const ONE_HOUR_SECONDS = 60 * 60;
const MAX_TIMEOUT_MS = 2_147_483_647;
function pad(value) {
  return String(value).padStart(2, '0');
}
function resolveFormat(format) {
  return format === 'clock' ? 'clock' : 'elapsed';
}
function getElapsedMilliseconds(now, startTime) {
  return Math.max(0, now - startTime);
}
function getPresentation(elapsedMilliseconds, format) {
  const elapsedSeconds = Math.floor(elapsedMilliseconds / ONE_SECOND_MS);
  if (format === 'clock') {
    const hours = Math.floor(elapsedSeconds / ONE_HOUR_SECONDS);
    const minutes = Math.floor(elapsedSeconds % ONE_HOUR_SECONDS / 60);
    const seconds = elapsedSeconds % 60;
    return {
      dateTime: `PT${elapsedSeconds}S`,
      text: hours > 0 ? `${String(hours)}:${pad(minutes)}:${pad(seconds)}` : `${String(minutes)}:${pad(seconds)}`
    };
  }
  if (elapsedSeconds < 60) {
    return {
      dateTime: `PT${elapsedSeconds}S`,
      text: `${String(elapsedSeconds)}s`
    };
  }
  const totalMinutes = Math.floor(elapsedSeconds / 60);
  if (totalMinutes < 60) {
    return {
      dateTime: `PT${elapsedSeconds}S`,
      text: `${String(totalMinutes)}m ${pad(elapsedSeconds % 60)}s`
    };
  }
  const representedSeconds = totalMinutes * 60;
  return {
    dateTime: `PT${representedSeconds}S`,
    text: `${String(Math.floor(totalMinutes / 60))}h ${pad(totalMinutes % 60)}m`
  };
}
function getMillisecondsUntilNextChange(now, startTime, elapsedMilliseconds, format) {
  if (now < startTime) {
    return Math.min(startTime - now + ONE_SECOND_MS, MAX_TIMEOUT_MS);
  }
  const precision = format === 'elapsed' && elapsedMilliseconds >= ONE_HOUR_SECONDS * ONE_SECOND_MS ? ONE_MINUTE_MS : ONE_SECOND_MS;
  return precision - elapsedMilliseconds % precision;
}
/**
 * Displays a standardized elapsed duration without scheduling React tick renders.
 *
 * Timer writes changing text and its ISO 8601 duration directly to the owned
 * `<time>` node. Use `elapsed` for compact duration text or `clock` for a
 * stopwatch-like reading.
 *
 * @example
 * ```
 * <Timer />
 * <Timer format="clock" />
 * ```
 */
export function Timer({
  startTime,
  format = 'elapsed',
  type = 'supporting',
  size,
  color = 'secondary',
  weight,
  ref,
  xstyle,
  className,
  style,
  ...rest
}) {
  const [mountTime] = useState(() => Date.now());
  const timerRef = useRef(null);
  const mergedRef = useMergedRefs(ref, timerRef);
  const resolvedFormat = resolveFormat(format);
  const initialPresentation = getPresentation(0, resolvedFormat);
  useEffect(() => {
    const resolvedStartTime = startTime !== undefined && Number.isFinite(startTime) ? startTime : mountTime;
    let timeoutID;
    let previousDateTime;
    let previousText;
    const tick = () => {
      const now = Date.now();
      const elapsedMilliseconds = getElapsedMilliseconds(now, resolvedStartTime);
      const presentation = getPresentation(elapsedMilliseconds, resolvedFormat);
      const node = timerRef.current;
      if (node != null) {
        if (presentation.text !== previousText) {
          node.textContent = presentation.text;
          previousText = presentation.text;
        }
        if (presentation.dateTime !== previousDateTime) {
          node.dateTime = presentation.dateTime;
          previousDateTime = presentation.dateTime;
        }
      }
      timeoutID = setTimeout(tick, getMillisecondsUntilNextChange(now, resolvedStartTime, elapsedMilliseconds, resolvedFormat));
    };
    tick();
    return () => {
      if (timeoutID !== undefined) {
        clearTimeout(timeoutID);
      }
    };
  }, [mountTime, resolvedFormat, startTime]);
  const timerProps = mergeProps(themeProps('timer'), {
    className,
    style
  });
  return /*#__PURE__*/_jsx(Text, {
    type: type,
    size: size,
    color: color,
    weight: weight,
    xstyle: xstyle,
    ...timerProps,
    children: /*#__PURE__*/_jsx("time", {
      ...rest,
      ref: mergedRef,
      dateTime: "PT0S",
      ...{
        className: "x1heor9g xt0psk2 xjb2p0i x1qlqyl8 x1j61x8r xss6m8b x1pd3egz x15bjb6t"
      },
      children: initialPresentation.text
    })
  });
}
Timer.displayName = 'Timer';