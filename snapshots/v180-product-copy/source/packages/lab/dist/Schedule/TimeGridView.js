// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TimeGridView.tsx
 * @input Schedule context, visible days, timezone, hour bounds, and the range label
 * @output Shared weekly/day time-grid layout: one scroll viewport whose sticky
 *   day header, all-day row, and hour gutter share the day columns' grid tracks
 * @position Internal view primitive shared by WeeklyView and DayView
 */
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { layerAnimations } from '@astryxdesign/core/Layer';
import { usePopover } from '@astryxdesign/core/Popover';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import { focusOutlineStyles, plainDateAddDays, plainDateFromInstant, plainDateIsBefore, plainDateIsEqual, plainDateToInstant, plainDateToISO } from '@astryxdesign/core/utils';
import { useScrollableArea } from '@astryxdesign/core/hooks';
import { Heading, Text } from '@astryxdesign/core/Text';
import { useScheduleContext } from "./context.js";
import { eventOccursOnDate, isDayEvent } from "./dateMath.js";
import { timeGridViewportScope } from "./schedule.stylex.js";
import { clamp, EventPill, eventPastSurfaceColorStyle, eventSurfaceColorStyle, eventSpansPastDay, formatEventAccessibilityLabel, formatDayNumber, formatEventTime, formatFullDate, formatHour, formatTimezoneAbbreviation, formatWeekday, getEventCategory, getMinutesSinceStartOfDay, isEventInPast, styles } from "./shared.js";
import { layoutTimedEvents } from "./timeGridLayout.js";
import { getInitialTimeGridOffset, isSameRangeKey, TimeGridScrollMemoryContext } from "./timeGridScrollMemory.js";
import { useCurrentTime } from "./useCurrentTime.js";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export function TimeGridView({
  days,
  events,
  focusDate,
  timezoneID,
  minHour,
  maxHour,
  hourHeight,
  label,
  renderPopover
}) {
  const {
    categories,
    headingLevel,
    locale,
    range
  } = useScheduleContext();
  const hasPopover = renderPopover != null;
  const normalizedMinHour = Math.max(0, Math.min(23, Math.floor(minHour)));
  const normalizedMaxHour = Math.max(normalizedMinHour + 1, Math.min(24, Math.floor(maxHour)));
  const hours = Array.from({
    length: normalizedMaxHour - normalizedMinHour
  }, (_, index) => normalizedMinHour + index);
  const allDayEvents = events.filter(isDayEvent);
  const allDaySegments = getAllDayEventSegments(allDayEvents, days);
  const allDayLevelCount = allDaySegments.reduce((levelCount, segment) => Math.max(levelCount, segment.level + 1), 0);
  const instantEvents = events.filter(event => !isDayEvent(event));
  const currentTime = useCurrentTime();
  const currentDate = plainDateFromInstant(currentTime, timezoneID);
  const timezoneLabel = formatTimezoneAbbreviation(days[0] ?? focusDate, timezoneID, locale);
  const {
    getViewportProps,
    getContentProps,
    state: scrollState
  } = useScrollableArea({
    axis: 'both',
    keyboardAccess: {
      owner: 'viewport',
      label: `${label} time grid`,
      role: 'region'
    }
  });

  // Initial position (component:Schedule FR4–FR6): once per rendered range,
  // the viewport opens one hour above now when the range includes today, or
  // at the top of the hour window. The record is shared with the suspended
  // fallback's viewport, so a late loader restores the person's own offset
  // instead of positioning again; clock ticks, data, theme, and resizes never
  // reach this effect because the key does not change.
  const sharedScrollMemory = useContext(TimeGridScrollMemoryContext);
  const localScrollMemory = useRef({
    key: null,
    offset: 0
  });
  const scrollMemory = sharedScrollMemory ?? localScrollMemory;
  const viewportRef = useRef(null);
  const rangeKey = useMemo(() => ({
    start: range.start,
    end: range.end,
    timezoneID,
    minHour: normalizedMinHour,
    maxHour: normalizedMaxHour,
    hourHeight
  }), [hourHeight, normalizedMaxHour, normalizedMinHour, range.end, range.start, timezoneID]);
  const positioning = useRef({
    currentTime,
    days,
    minHour: normalizedMinHour,
    hourHeight
  });
  positioning.current = {
    currentTime,
    days,
    minHour: normalizedMinHour,
    hourHeight
  };
  const isBlockScrollable = scrollState.block.isScrollable;
  // The clock is 0 only in the server snapshot; wait for the client's.
  const hasClock = currentTime !== 0;
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport == null || !isBlockScrollable || !hasClock) {
      return;
    }
    const memory = scrollMemory.current;
    if (memory != null && memory.key != null && isSameRangeKey(memory.key, rangeKey)) {
      if (Math.abs(viewport.scrollTop - memory.offset) > 1) {
        viewport.scrollTop = memory.offset;
      }
      return;
    }
    const offset = getInitialTimeGridOffset({
      ...positioning.current,
      timezoneID,
      scrollHeight: viewport.scrollHeight,
      clientHeight: viewport.clientHeight
    });
    viewport.scrollTop = offset;
    if (memory != null) {
      memory.key = rangeKey;
      memory.offset = offset;
    }
  }, [hasClock, isBlockScrollable, rangeKey, scrollMemory, timezoneID]);
  const rememberScroll = event => {
    const memory = scrollMemory.current;
    if (memory != null && memory.key != null && isSameRangeKey(memory.key, rangeKey)) {
      memory.offset = event.currentTarget.scrollTop;
    }
  };

  // Event popover (component:Schedule FR11–FR12, DEC-1, DEC-5). The grid
  // owns one popover and remembers which painted block opened it, by event id
  // and day so a multi-day event's blocks open it separately. The popover is
  // the system's standard Popover: dialog named by the event's title, modal,
  // auto-focus, hidden fallback close, Escape and light dismiss, standard
  // surface and padding. Content comes from the caller for the open event
  // only; it re-renders with that event's current object while the event
  // stays in range, and the popover closes when its block is no longer
  // painted.
  const [openBlock, setOpenBlock] = useState(null);
  const openBlockRef = useRef(openBlock);
  openBlockRef.current = openBlock;
  const openEvent = openBlock == null ? null : events.find(event => event.id === openBlock.eventID) ?? null;
  const popover = usePopover({
    dialogLabel: openEvent?.title,
    // Popover's own defaults, spelled out where the hook's differ.
    padding: 3,
    surfaceTarget: 'popover',
    onHide: useCallback(() => {
      setOpenBlock(null);
    }, [])
  });
  const popoverRef = useRef(popover);
  popoverRef.current = popover;
  // A pointer press on a block while the popover is open would close it by
  // the browser's light dismiss before the click arrives, and the layer then
  // absorbs a show() from that same press. So the press itself decides: a
  // press on another block closes the popover here, ahead of the browser,
  // and the click that follows opens the pressed block; a press on the open
  // block is remembered so its click ends closed, whichever of the two
  // closed it. A key press starts a new gesture and forgets the press.
  const openBlockAtPressRef = useRef(null);
  const handlePointerDownCapture = pointerEvent => {
    const target = pointerEvent.target;
    const pressedKey = target?.closest('[data-schedule-event-block]')?.getAttribute('data-schedule-event-block') ?? null;
    const current = openBlockRef.current;
    const currentKey = current == null ? null : blockKeyOf(current.eventID, current.dayISO);
    openBlockAtPressRef.current = pressedKey == null ? null : currentKey;
    if (pressedKey != null && currentKey != null && pressedKey !== currentKey && popover.isOpen) {
      popover.hide();
    }
  };
  const forgetPress = () => {
    openBlockAtPressRef.current = null;
  };
  const toggleBlock = (event, dayISO, button) => {
    const key = blockKeyOf(event.id, dayISO);
    const openAtPress = openBlockAtPressRef.current;
    openBlockAtPressRef.current = null;
    const current = openBlockRef.current;
    const isCurrent = current != null && blockKeyOf(current.eventID, current.dayISO) === key;
    if (openAtPress === key || isCurrent && popover.isOpen) {
      if (popover.isOpen) {
        popover.hide();
      }
      return;
    }
    setOpenBlock({
      eventID: event.id,
      dayISO
    });
    popover.triggerRef(button);
    popover.show();
  };
  // Blocks painted this render; the popover may stay open only for one of
  // them.
  const paintedBlockKeys = new Set();
  const openBlockKey = openBlock == null ? null : blockKeyOf(openBlock.eventID, openBlock.dayISO);
  let openContent = null;
  useEffect(() => {
    if (openBlockKey != null && !paintedBlockKeys.has(openBlockKey)) {
      popoverRef.current.hide();
      setOpenBlock(null);
    }
  });
  const viewportProps = getViewportProps({
    ref: viewportRef,
    onScroll: rememberScroll,
    onPointerDownCapture: handlePointerDownCapture,
    onKeyDownCapture: forgetPress,
    ...stylex.props(styles.timeGridViewport, timeGridViewportScope)
  });
  const contentProps = getContentProps(stylex.props(styles.timeGridContent(days.length)));

  // Read-only: everything painted is decoration for sighted users and the
  // hidden grid is what assistive technology reads. With renderPopover the
  // painted events are the accessible representation themselves — buttons
  // that open the popover, or static text for an event without content,
  // grouped by day — so the hidden grid is not rendered twice over. Either
  // way each decorative part is hidden on its own, never the viewport, so
  // the viewport stays a reachable, named keyboard scroll owner.
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [!hasPopover && /*#__PURE__*/_jsx(TimeGridAccessibilityGrid, {
      allDayEvents: allDayEvents,
      categories: categories,
      days: days,
      events: instantEvents,
      focusDate: focusDate,
      hours: hours,
      locale: locale,
      timezoneID: timezoneID,
      timezoneLabel: timezoneLabel
    }), /*#__PURE__*/_jsxs("div", {
      ...stylex.props(styles.timeGridFrame),
      children: [/*#__PURE__*/_jsx("div", {
        ...viewportProps,
        children: /*#__PURE__*/_jsxs("div", {
          ...contentProps,
          children: [/*#__PURE__*/_jsx("div", {
            "aria-hidden": true,
            ...stylex.props(styles.timeGridCorner)
          }), days.map((day, index) => /*#__PURE__*/_jsx("div", {
            "aria-hidden": true,
            ...stylex.props(styles.timeGridHeaderCell, styles.dayColumnPlacement(index), index === days.length - 1 && styles.timeGridHeaderCellLast),
            children: /*#__PURE__*/_jsx(Heading, {
              level: headingLevel,
              color: "secondary",
              display: "block",
              xstyle: styles.timeGridHeaderHeading,
              children: /*#__PURE__*/_jsxs("span", {
                ...stylex.props(styles.timeGridHeaderHeadingContent),
                children: [formatWeekday(day, timezoneID, 'short', locale), /*#__PURE__*/_jsx("span", {
                  ...stylex.props(styles.timeGridDayNumber, plainDateIsEqual(day, focusDate) && styles.timeGridCurrentDayPill),
                  children: formatDayNumber(day, timezoneID, locale)
                })]
              })
            })
          }, plainDateToISO(day))), /*#__PURE__*/_jsx("div", {
            "aria-hidden": true,
            ...stylex.props(styles.allDayLabel),
            children: /*#__PURE__*/_jsx(Text, {
              type: "supporting",
              color: "secondary",
              weight: "bold",
              children: timezoneLabel
            })
          }), /*#__PURE__*/_jsxs("div", {
            ...(hasPopover ? {
              role: 'group',
              'aria-label': 'All-day events'
            } : {
              'aria-hidden': true
            }),
            ...stylex.props(styles.allDayRow(allDayLevelCount)),
            children: [days.map((day, index) => /*#__PURE__*/_jsx("div", {
              "aria-hidden": true,
              ...stylex.props(styles.allDayCell, styles.allDaySubgridPlacement(index), index === days.length - 1 && styles.allDayCellLast)
            }, plainDateToISO(day))), allDaySegments.map(segment => {
              const day = days[segment.columnStart] ?? focusDate;
              const dayISO = plainDateToISO(day);
              const key = `${segment.event.id}:${segment.columnStart}`;
              const pill = /*#__PURE__*/_jsx(EventPill, {
                event: segment.event,
                isPast: isEventInPast(segment.event, currentTime, timezoneID)
              });
              const placement = styles.allDayEventSpan(segment.columnStart, segment.columnEnd, segment.level);
              const content = renderPopover?.(segment.event);
              if (!hasPopover) {
                return /*#__PURE__*/_jsx("div", {
                  ...stylex.props(placement),
                  children: pill
                }, key);
              }
              if (content == null) {
                return /*#__PURE__*/_jsx("div", {
                  "aria-label": formatEventButtonLabel(segment.event, day, timezoneID, categories, locale),
                  ...stylex.props(placement),
                  children: pill
                }, key);
              }
              const blockKey = blockKeyOf(segment.event.id, dayISO);
              paintedBlockKeys.add(blockKey);
              const isOpen = popover.isOpen && openBlockKey === blockKey;
              if (isOpen) {
                openContent = content;
              }
              return /*#__PURE__*/_jsx("button", {
                type: "button",
                "aria-label": formatEventButtonLabel(segment.event, day, timezoneID, categories, locale),
                "aria-haspopup": "dialog",
                "aria-expanded": isOpen,
                "aria-controls": popover.id,
                "data-schedule-event-block": blockKey,
                onClick: domEvent => toggleBlock(segment.event, dayISO, domEvent.currentTarget),
                ...stylex.props(styles.eventButtonReset, placement, styles.eventButtonFocus, focusOutlineStyles.focusVisible),
                children: pill
              }, key);
            })]
          }), /*#__PURE__*/_jsx("div", {
            "aria-hidden": true,
            ...stylex.props(styles.timeLabels),
            children: hours.slice(1).map((hour, index) => /*#__PURE__*/_jsx("div", {
              ...stylex.props(styles.timeLabel, styles.timeLabelPosition(index + 1, hourHeight)),
              children: formatHour(hour, locale)
            }, hour))
          }), days.map((day, index) => {
            const currentTimeTop = getCurrentTimeTop({
              currentTime,
              day,
              timezoneID,
              minHour: normalizedMinHour,
              maxHour: normalizedMaxHour
            });
            return /*#__PURE__*/_jsxs("div", {
              ...(hasPopover ? {
                role: 'group',
                'aria-label': formatFullDate(day, timezoneID, locale)
              } : {
                'aria-hidden': true
              }),
              ...stylex.props(styles.timeColumn, styles.dayColumnPlacement(index), styles.timeColumnRows(hourHeight), index === days.length - 1 && styles.timeColumnLast),
              children: [hours.map((hour, hourIndex) => /*#__PURE__*/_jsx("div", {
                "aria-hidden": true,
                ...stylex.props(styles.hourSlot, hourIndex === hours.length - 1 && styles.hourSlotLast)
              }, hour)), getTimedEventLayouts({
                events: instantEvents.filter(event => eventOccursOnDate(event, day, timezoneID)),
                day,
                timezoneID,
                minHour: normalizedMinHour,
                maxHour: normalizedMaxHour
              }).map(({
                event,
                height,
                top,
                columnStart,
                columnSpan,
                columnCount
              }) => {
                const timeLabel = formatEventTime(event, day, timezoneID, locale);
                const category = getEventCategory(event, categories);
                const blockStyles = [styles.timedEvent, styles.timedEventPosition(clamp(top, 0, 100), clamp(height, 4, 100), columnStart / columnCount * 100, columnSpan / columnCount * 100), isEventInPast(event, currentTime, timezoneID) ? eventPastSurfaceColorStyle(category.color) : eventSurfaceColorStyle(category.color)];
                const blockContent = /*#__PURE__*/_jsxs(_Fragment, {
                  children: [/*#__PURE__*/_jsx(Text, {
                    type: "supporting",
                    color: "inherit",
                    weight: "bold",
                    xstyle: styles.eventTitle,
                    children: event.title
                  }), /*#__PURE__*/_jsx(Text, {
                    type: "supporting",
                    color: "inherit",
                    xstyle: styles.eventTime,
                    children: timeLabel
                  })]
                });
                if (!hasPopover) {
                  return /*#__PURE__*/_jsx("div", {
                    ...stylex.props(...blockStyles),
                    children: blockContent
                  }, event.id);
                }
                const popoverContent = renderPopover(event);
                const buttonLabel = formatEventButtonLabel(event, day, timezoneID, categories, locale);
                if (popoverContent == null) {
                  return /*#__PURE__*/_jsx("div", {
                    "aria-label": buttonLabel,
                    ...stylex.props(...blockStyles),
                    children: blockContent
                  }, event.id);
                }
                const dayISO = plainDateToISO(day);
                const blockKey = blockKeyOf(event.id, dayISO);
                paintedBlockKeys.add(blockKey);
                const isOpen = popover.isOpen && openBlockKey === blockKey;
                if (isOpen) {
                  openContent = popoverContent;
                }
                return /*#__PURE__*/_jsx("button", {
                  type: "button",
                  "aria-label": buttonLabel,
                  "aria-haspopup": "dialog",
                  "aria-expanded": isOpen,
                  "aria-controls": popover.id,
                  "data-schedule-event-block": blockKey,
                  onClick: domEvent => toggleBlock(event, dayISO, domEvent.currentTarget),
                  ...stylex.props(styles.eventButtonReset, ...blockStyles, styles.eventButtonFocus, focusOutlineStyles.focusVisible),
                  children: blockContent
                }, event.id);
              }), plainDateIsEqual(day, currentDate) && currentTimeTop != null && /*#__PURE__*/_jsx("div", {
                "aria-hidden": true,
                ...stylex.props(styles.currentTimeLine(currentTimeTop))
              })]
            }, plainDateToISO(day));
          })]
        })
      }), /*#__PURE__*/_jsx("div", {
        "aria-hidden": true,
        ...stylex.props(styles.timeGridFocusRing)
      })]
    }), hasPopover && popover.render(openContent, {
      placement: 'below',
      alignment: 'start',
      offset: spacingVars['--spacing-1'],
      xstyle: [styles.eventPopover, layerAnimations.below]
    })]
  });
}
function TimeGridAccessibilityGrid({
  allDayEvents,
  categories,
  days,
  events,
  focusDate,
  hours,
  locale,
  timezoneID,
  timezoneLabel
}) {
  return /*#__PURE__*/_jsxs("div", {
    role: "grid",
    "aria-label": "Schedule time grid",
    "aria-readonly": true,
    ...stylex.props(styles.visuallyHidden),
    children: [/*#__PURE__*/_jsxs("div", {
      role: "row",
      children: [/*#__PURE__*/_jsx("div", {
        role: "columnheader",
        "aria-colindex": 1,
        children: "Time"
      }), days.map((day, index) => /*#__PURE__*/_jsx("div", {
        role: "columnheader",
        "aria-colindex": index + 2,
        "aria-current": plainDateIsEqual(day, focusDate) ? 'date' : undefined,
        children: formatFullDate(day, timezoneID, locale)
      }, plainDateToISO(day)))]
    }), /*#__PURE__*/_jsxs("div", {
      role: "row",
      children: [/*#__PURE__*/_jsxs("div", {
        role: "rowheader",
        "aria-colindex": 1,
        children: [timezoneLabel, " all day"]
      }), days.map((day, index) => {
        const cellEvents = allDayEvents.filter(event => eventOccursOnDate(event, day, timezoneID));
        return /*#__PURE__*/_jsx("div", {
          role: "gridcell",
          "aria-colindex": index + 2,
          "aria-label": formatTimeGridAccessibilityCellLabel({
            categories,
            day,
            events: cellEvents,
            label: `${formatFullDate(day, timezoneID, locale)} all day`,
            locale,
            timezoneID
          })
        }, plainDateToISO(day));
      })]
    }), hours.map(hour => /*#__PURE__*/_jsxs("div", {
      role: "row",
      children: [/*#__PURE__*/_jsx("div", {
        role: "rowheader",
        "aria-colindex": 1,
        children: formatHour(hour, locale)
      }), days.map((day, index) => {
        const cellEvents = events.filter(event => eventOverlapsHour(event, day, hour, timezoneID));
        return /*#__PURE__*/_jsx("div", {
          role: "gridcell",
          "aria-colindex": index + 2,
          "aria-label": formatTimeGridAccessibilityCellLabel({
            categories,
            day,
            events: cellEvents,
            label: `${formatFullDate(day, timezoneID, locale)} ${formatHour(hour, locale)}`,
            locale,
            timezoneID
          })
        }, plainDateToISO(day));
      })]
    }, hour))]
  });
}
function formatTimeGridAccessibilityCellLabel({
  categories,
  day,
  events,
  label,
  locale,
  timezoneID
}) {
  if (events.length === 0) {
    return label;
  }
  const eventLabels = events.map(event => formatEventAccessibilityLabel(event, day, timezoneID, categories, locale));
  return `${label}. ${eventLabels.join('. ')}`;
}

/** One painted block: an event on one day. Ids may contain any character. */
function blockKeyOf(eventID, dayISO) {
  return `${dayISO}/${eventID}`;
}

/**
 * A block exposed on its own, rather than inside a dated cell, carries the day
 * in its name. The visible text — title, then time — leads the name, then the
 * category and the full date.
 */
function formatEventButtonLabel(event, day, timezoneID, categories, locale) {
  const category = getEventCategory(event, categories);
  const timeLabel = isDayEvent(event) ? 'all day' : formatEventTime(event, day, timezoneID, locale);
  return `${event.title}, ${timeLabel}, ${category.label}, ${formatFullDate(day, timezoneID, locale)}`;
}
function eventOverlapsHour(event, day, hour, timezoneID) {
  if (!eventOccursOnDate(event, day, timezoneID)) {
    return false;
  }
  const hourStart = plainDateToInstant(day, timezoneID, hour);
  const hourEnd = hour === 23 ? plainDateToInstant(plainDateAddDays(day, 1), timezoneID) : plainDateToInstant(day, timezoneID, hour + 1);
  return event.start < hourEnd && event.end > hourStart;
}
function getAllDayEventSegments(events, days) {
  const levels = [];
  return events.map(event => {
    const startIndex = days.findIndex(day => !plainDateIsBefore(day, event.start));
    const endIndexFromRight = [...days].reverse().findIndex(day => !plainDateIsBefore(event.end, day));
    if (startIndex < 0 || endIndexFromRight < 0) {
      return null;
    }
    const endIndex = days.length - 1 - endIndexFromRight;
    return {
      event,
      startIndex,
      endIndex
    };
  }).filter(segment => segment != null).sort((a, b) => {
    if (a.startIndex !== b.startIndex) {
      return a.startIndex - b.startIndex;
    }
    const aDuration = a.endIndex - a.startIndex;
    const bDuration = b.endIndex - b.startIndex;
    return bDuration - aDuration || a.event.title.localeCompare(b.event.title);
  }).map(({
    event,
    startIndex,
    endIndex
  }) => {
    const level = getAvailableAllDayLevel(levels, startIndex);
    levels[level] = endIndex;
    return {
      event,
      columnStart: startIndex,
      columnEnd: endIndex,
      level
    };
  });
}
function getAvailableAllDayLevel(levels, columnStart) {
  const level = levels.findIndex(columnEnd => columnStart > columnEnd);
  return level >= 0 ? level : levels.length;
}
function getTimedEventLayouts({
  events,
  day,
  timezoneID,
  minHour,
  maxHour
}) {
  const minMinute = minHour * 60;
  const maxMinute = maxHour * 60;
  const intervals = events.flatMap(event => {
    const startDate = plainDateFromInstant(event.start, timezoneID);
    const rawStart = plainDateIsBefore(startDate, day) ? 0 : getMinutesSinceStartOfDay(event.start, timezoneID);
    const rawEnd = eventSpansPastDay(event, day, timezoneID) ? 24 * 60 : getMinutesSinceStartOfDay(event.end, timezoneID);
    if (rawEnd <= minMinute || rawStart >= maxMinute) {
      return [];
    }
    const visibleStart = Math.max(rawStart, minMinute);
    // A block is at least fifteen minutes tall so a short event stays legible.
    const visibleEnd = Math.min(maxMinute, Math.max(visibleStart + 15, rawEnd));
    return visibleEnd > visibleStart ? [{
      event,
      visibleStart,
      visibleEnd
    }] : [];
  });
  return layoutTimedEvents(intervals, minMinute, maxMinute);
}
function getCurrentTimeTop({
  currentTime,
  day,
  timezoneID,
  minHour,
  maxHour
}) {
  const currentDate = plainDateFromInstant(currentTime, timezoneID);
  if (!plainDateIsEqual(day, currentDate)) {
    return null;
  }
  const currentMinute = getMinutesSinceStartOfDay(currentTime, timezoneID);
  const minMinute = minHour * 60;
  const maxMinute = maxHour * 60;
  if (currentMinute < minMinute || currentMinute > maxMinute) {
    return null;
  }
  return (currentMinute - minMinute) / (maxMinute - minMinute) * 100;
}