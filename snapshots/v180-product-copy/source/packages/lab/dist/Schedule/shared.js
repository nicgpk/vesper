// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file shared.tsx
 * @input Schedule events, dates, timezone IDs, provider locale, and display metadata
 * @output Shared rendering primitives, formatters, and styles for schedule views
 * @position Internal view utility module; consumed by Monthly, Weekly, Day, and List views
 */
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { borderVars, colorVars, focusVars, fontWeightVars, radiusVars, spacingVars, typographyVars, typeScaleVars } from '@astryxdesign/core/theme/tokens.stylex';
import { Spinner } from '@astryxdesign/core/Spinner';
import { HStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { plainDateFromInstant, plainDateIsAfter, plainDateIsBefore, plainDateToInstant } from '@astryxdesign/core/utils';
import { isDayEvent } from "./dateMath.js";
import { useScheduleContext } from "./context.js";
import "./schedule.stylex.js";
import { timeGridViewportScope } from "./schedule.stylex.js";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const DEFAULT_EVENT_CATEGORY = {
  label: 'Event',
  color: 'blue'
};
export function ScheduleFrame({
  title,
  titleLabel,
  isLoading,
  children
}) {
  const {
    plugins
  } = useScheduleContext();
  const initialHeader = {
    startContent: null,
    centerContent: /*#__PURE__*/_jsxs("span", {
      ...{
        className: "x3nfvp2 x6s0dn4 x1txdalj"
      },
      children: [/*#__PURE__*/_jsx(Heading, {
        level: 2,
        children: title
      }), /*#__PURE__*/_jsx("span", {
        ...{
          0: {
            className: "x3nfvp2"
          },
          1: {
            className: "x3nfvp2 xlshs6z"
          }
        }[!!!isLoading << 0],
        children: /*#__PURE__*/_jsx(Spinner, {
          size: "md",
          "aria-label": "Loading events"
        })
      })]
    }),
    endContent: null
  };
  const header = plugins.reduce((content, plugin) => plugin.renderHeader?.(content.startContent, content.centerContent, content.endContent) ?? content, initialHeader);
  return /*#__PURE__*/_jsxs("section", {
    ...{
      className: "x98rzlu x78zum5 xdt5ytf xeuugli x2lwn1j x1litavf x1y0btm7 x14i3s5s x1hviunn x1de1mus xb3r6kr"
    },
    "aria-label": titleLabel,
    children: [/*#__PURE__*/_jsxs("div", {
      ...{
        className: "xrvj5dj x37c5m6 x6s0dn4 xjcht0a x8o8v82 x1pzlopt x92x3c3 x1q0q8m5 xw8gpjh"
      },
      children: [/*#__PURE__*/_jsx(HStack, {
        gap: 8,
        align: "center",
        xstyle: styles.headerControls,
        children: header.startContent
      }), /*#__PURE__*/_jsx(HStack, {
        gap: 8,
        align: "center",
        xstyle: styles.headerTitle,
        children: header.centerContent
      }), /*#__PURE__*/_jsx(HStack, {
        gap: 8,
        align: "center",
        justify: "end",
        xstyle: styles.headerStatus,
        children: header.endContent
      })]
    }), children]
  });
}
export function ScheduleMonthTitle({
  date,
  timezoneID
}) {
  const {
    locale
  } = useScheduleContext();
  return /*#__PURE__*/_jsx(LocalizedMonthTitle, {
    date: date,
    timezoneID: timezoneID,
    locale: locale
  });
}
function LocalizedMonthTitle({
  date,
  timezoneID,
  locale
}) {
  const parts = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: timezoneID,
    calendar: 'gregory'
  }).formatToParts(new Date(plainDateToInstant(date, timezoneID, 12)));
  return parts.map((part, index) => part.type === 'month' ? /*#__PURE__*/_jsx("span", {
    ...{
      className: "x1lvx875"
    },
    children: part.value
  }, index) : part.value);
}
export function ScheduleRangeMonthTitle({
  start,
  end,
  timezoneID
}) {
  const {
    locale
  } = useScheduleContext();
  if (start.year === end.year && start.month === end.month) {
    return /*#__PURE__*/_jsx(ScheduleMonthTitle, {
      date: start,
      timezoneID: timezoneID
    });
  }
  const startMonth = formatWithPlainDate(start, timezoneID, {
    month: 'long'
  }, locale);
  const endMonthTitle = /*#__PURE__*/_jsx(LocalizedMonthTitle, {
    date: end,
    timezoneID: timezoneID,
    locale: locale
  });
  return start.year === end.year ? /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("span", {
      ...{
        className: "x1lvx875"
      },
      children: startMonth
    }), " -", ' ', endMonthTitle]
  }) : /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(LocalizedMonthTitle, {
      date: start,
      timezoneID: timezoneID,
      locale: locale
    }), ' ', "- ", endMonthTitle]
  });
}
export function EventPill({
  event,
  day,
  timezoneID,
  isPast = false
}) {
  const {
    categories,
    locale
  } = useScheduleContext();
  const category = getEventCategory(event, categories);
  const timeLabel = day != null && timezoneID != null && !isDayEvent(event) ? formatEventTime(event, day, timezoneID, locale) : null;
  return /*#__PURE__*/_jsxs("span", {
    ...stylex.props(styles.eventPill, isPast ? eventPastSurfaceColorStyle(category.color) : eventSurfaceColorStyle(category.color)),
    children: [timeLabel != null && /*#__PURE__*/_jsx(Text, {
      type: "supporting",
      color: "inherit",
      xstyle: styles.eventTime,
      children: timeLabel
    }), /*#__PURE__*/_jsx(Text, {
      type: "supporting",
      color: "inherit",
      weight: "bold",
      xstyle: styles.eventTitle,
      children: event.title
    })]
  });
}
export function MonthEventPill({
  event,
  timezoneID,
  isPast = false
}) {
  const {
    categories,
    locale
  } = useScheduleContext();
  const category = getEventCategory(event, categories);
  const timeLabel = isDayEvent(event) ? null : formatEventStartTime(event, timezoneID, locale);
  return /*#__PURE__*/_jsxs("span", {
    ...stylex.props(styles.eventPill, isPast ? eventPastSurfaceColorStyle(category.color) : eventSurfaceColorStyle(category.color)),
    children: [timeLabel != null && /*#__PURE__*/_jsx(Text, {
      type: "supporting",
      color: "inherit",
      xstyle: styles.eventTime,
      children: timeLabel
    }), /*#__PURE__*/_jsx(Text, {
      type: "supporting",
      color: "inherit",
      weight: "bold",
      xstyle: styles.eventTitle,
      children: event.title
    })]
  });
}
export function ListEventRow({
  event,
  timezoneID,
  isPast = false
}) {
  const {
    categories,
    locale
  } = useScheduleContext();
  const category = getEventCategory(event, categories);
  return /*#__PURE__*/_jsxs("div", {
    ...{
      className: "xrvj5dj x857yr4 x6s0dn4 x1txdalj xeuugli"
    },
    children: [/*#__PURE__*/_jsx("span", {
      "aria-hidden": true,
      ...stylex.props(styles.listEventDot, eventDotColorStyle(category.color), isPast && styles.listEventDotPast)
    }), /*#__PURE__*/_jsx("span", {
      ...{
        className: "x9ynric xv1l7n4 x141an7d x1ltkj2j xuxw1ft"
      },
      children: isDayEvent(event) ? 'All day' : formatEventTimeRange(event, timezoneID, locale)
    }), /*#__PURE__*/_jsx("span", {
      ...{
        0: {
          className: "x9ynric x1tgivj0 xeuugli xb3r6kr xlyipyv xuxw1ft xjm74w1 xw6l6zx x1e4wzip"
        },
        1: {
          className: "x9ynric xeuugli xb3r6kr xlyipyv xuxw1ft xjm74w1 xw6l6zx x1e4wzip xv1l7n4"
        }
      }[!!isPast << 0],
      children: event.title
    })]
  });
}
export function getEventCategory(event, categories) {
  return categories.find(category => category.label === event.category) ?? (event.category != null ? {
    label: event.category,
    color: DEFAULT_EVENT_CATEGORY.color
  } : DEFAULT_EVENT_CATEGORY);
}
export function eventDotColorStyle(color) {
  switch (color) {
    case 'cyan':
      return styles.eventDotCyan;
    case 'gray':
      return styles.eventDotGray;
    case 'green':
      return styles.eventDotGreen;
    case 'orange':
      return styles.eventDotOrange;
    case 'pink':
      return styles.eventDotPink;
    case 'purple':
      return styles.eventDotPurple;
    case 'red':
      return styles.eventDotRed;
    case 'teal':
      return styles.eventDotTeal;
    case 'yellow':
      return styles.eventDotYellow;
    case 'blue':
    default:
      return styles.eventDotBlue;
  }
}
export function eventSurfaceColorStyle(color) {
  switch (color) {
    case 'cyan':
      return styles.eventSurfaceCyan;
    case 'gray':
      return styles.eventSurfaceGray;
    case 'green':
      return styles.eventSurfaceGreen;
    case 'orange':
      return styles.eventSurfaceOrange;
    case 'pink':
      return styles.eventSurfacePink;
    case 'purple':
      return styles.eventSurfacePurple;
    case 'red':
      return styles.eventSurfaceRed;
    case 'teal':
      return styles.eventSurfaceTeal;
    case 'yellow':
      return styles.eventSurfaceYellow;
    case 'blue':
    default:
      return styles.eventSurfaceBlue;
  }
}
export function eventPastSurfaceColorStyle(color) {
  switch (color) {
    case 'cyan':
      return styles.eventPastSurfaceCyan;
    case 'gray':
      return styles.eventPastSurfaceGray;
    case 'green':
      return styles.eventPastSurfaceGreen;
    case 'orange':
      return styles.eventPastSurfaceOrange;
    case 'pink':
      return styles.eventPastSurfacePink;
    case 'purple':
      return styles.eventPastSurfacePurple;
    case 'red':
      return styles.eventPastSurfaceRed;
    case 'teal':
      return styles.eventPastSurfaceTeal;
    case 'yellow':
      return styles.eventPastSurfaceYellow;
    case 'blue':
    default:
      return styles.eventPastSurfaceBlue;
  }
}
export function formatWithPlainDate(date, timezoneID, options, locale) {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: timezoneID,
    calendar: 'gregory'
  }).format(new Date(plainDateToInstant(date, timezoneID, 12)));
}
export function formatMonthTitle(date, timezoneID, locale) {
  return formatWithPlainDate(date, timezoneID, {
    month: 'long',
    year: 'numeric'
  }, locale);
}
export function formatWeekTitle(start, end, timezoneID, locale) {
  if (start.year === end.year && start.month === end.month) {
    return formatMonthTitle(start, timezoneID, locale);
  }
  const startMonth = formatWithPlainDate(start, timezoneID, {
    month: 'long'
  }, locale);
  const endMonthTitle = formatMonthTitle(end, timezoneID, locale);
  return start.year === end.year ? `${startMonth} - ${endMonthTitle}` : `${formatMonthTitle(start, timezoneID, locale)} - ${endMonthTitle}`;
}
export function formatFullDate(date, timezoneID, locale) {
  return formatWithPlainDate(date, timezoneID, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }, locale);
}
export function formatWeekday(date, timezoneID, weekday, locale) {
  return formatWithPlainDate(date, timezoneID, {
    weekday
  }, locale);
}
export function formatDayNumber(date, timezoneID, locale) {
  return formatWithPlainDate(date, timezoneID, {
    day: 'numeric'
  }, locale);
}
export function formatHour(hour, locale) {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(2026, 0, 1, hour)));
}
export function formatTimezoneAbbreviation(date, timezoneID, locale) {
  const part = new Intl.DateTimeFormat(locale, {
    timeZone: timezoneID,
    timeZoneName: 'short'
  }).formatToParts(new Date(plainDateToInstant(date, timezoneID, 12))).find(({
    type
  }) => type === 'timeZoneName');
  return part?.value ?? timezoneID;
}
export function formatEventTime(event, day, timezoneID, locale) {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneID
  });
  return `${formatter.format(new Date(event.start))} - ${formatter.format(new Date(event.end))}`;
}
export function formatEventTimeRange(event, timezoneID, locale) {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneID
  });
  return `${formatter.format(new Date(event.start))} - ${formatter.format(new Date(event.end))}`;
}
export function formatEventStartTime(event, timezoneID, locale) {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneID
  }).format(new Date(event.start));
}
export function formatEventAccessibilityLabel(event, day, timezoneID, categories, locale) {
  const category = getEventCategory(event, categories);
  const timeLabel = isDayEvent(event) ? 'all day' : formatEventTime(event, day, timezoneID, locale);
  return `${event.title}, ${category.label}, ${timeLabel}`;
}
export function getMinutesSinceStartOfDay(instant, timezoneID) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneID,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(instant));
  const lookup = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  return lookup.hour * 60 + lookup.minute;
}
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
export function eventSpansPastDay(event, day, timezoneID) {
  return plainDateIsAfter(plainDateFromInstant(Math.max(event.end - 1, event.start), timezoneID), day);
}
export function isEventInPast(event, currentTime, timezoneID) {
  if (isDayEvent(event)) {
    return plainDateIsBefore(event.end, plainDateFromInstant(currentTime, timezoneID));
  }
  return event.end <= currentTime;
}
const baseText = {
  fontFamily: typographyVars['--font-family-body'],
  color: colorVars['--color-text-primary']
};
const _temp = {
  kbNqZ1: "x33j1x8",
  kBCFzs: "x14d52f8",
  kSGwAc: "x1y8v6su",
  k7Eaqz: "xeuugli",
  keTefX: "xladpz9",
  k71WvV: "x1h1dc9q",
  keoZOQ: "x1vhfslr",
  kfzvcC: "x67bb7w",
  kY2c9j: "x1vjfegm",
  "$$css": true
};
const _temp2 = {
  k1xSpc: "xrvj5dj",
  kumcoG: "xqketvx",
  k9llMU: "x1eiw8i6",
  k7Eaqz: "xkj4a21",
  "$$css": true
};
const _temp3 = {
  kBCFzs: "x14d52f8",
  "$$css": true
};
const _temp4 = {
  kBCFzs: "x17d9j0x",
  kbNqZ1: "x7sv70a",
  k1xSpc: "xrvj5dj",
  kumcoG: "x4w6khx",
  kVAEAm: "x7wzq59",
  k87sOh: "x1ng4z2i",
  kY2c9j: "xhtitgo",
  kHBbk8: "xc8icb0",
  kAzted: "x82snj4",
  k7Eaqz: "xeuugli",
  kWkggS: "x1de1mus",
  kt9PQ7: "x92x3c3",
  kfdmCh: "x1q0q8m5",
  kL6WhQ: "xw8gpjh",
  "$$css": true
};
const _temp5 = {
  kBCFzs: "x14d52f8",
  "$$css": true
};
const _temp6 = {
  kbNqZ1: "x1ms6mhf",
  kBCFzs: "x14d52f8",
  kSGwAc: "x1y8v6su",
  k7Eaqz: "xeuugli",
  keTefX: "xladpz9",
  k71WvV: "x1h1dc9q",
  keoZOQ: "x1vhfslr",
  "$$css": true
};
const _temp7 = {
  k87sOh: "xjbys53",
  "$$css": true
};
const _temp8 = {
  kJBjZk: "xhij9v2",
  "$$css": true
};
const _temp9 = {
  k87sOh: "xjbys53",
  kZKoxP: "x16ye13r",
  kLqNvP: "x1lxsm33",
  kzqmXN: "x1uyokj7",
  "$$css": true
};
const _temp0 = {
  kVAEAm: "x10l6tqk",
  kkqhue: "x17y0mx6",
  k87sOh: "xjbys53",
  kEafiO: "xamhcws",
  kPef9Z: "x13fuv20",
  kLZC3w: "x5mp61g",
  kY2c9j: "x1vjfegm",
  kfzvcC: "x47corl",
  kgeoSG: "x1cpjm7i",
  kEoFBp: "x1hmns74",
  kSJ0CW: "xh7j7mt",
  k96MEf: "x1mpa3hi",
  kOlAkY: "xaknh5y",
  kgzTxl: "x17zp9gg",
  kPB484: "xmwhqxd",
  kLkRvE: "x19jfor0",
  "$$css": true
};
export const styles = {
  root: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    k7Eaqz: "xeuugli",
    kAzted: "x2lwn1j",
    $$css: true
  },
  frame: {
    kUk6DE: "x98rzlu",
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    k7Eaqz: "xeuugli",
    kAzted: "x2lwn1j",
    kMzoRj: "x1litavf",
    ksu8eU: "x1y0btm7",
    kVAM5u: "x14i3s5s",
    kaIpWk: "x1hviunn",
    kWkggS: "x1de1mus",
    kVQacm: "xb3r6kr",
    $$css: true
  },
  header: {
    k1xSpc: "xrvj5dj",
    kumcoG: "x37c5m6",
    kGNEyG: "x6s0dn4",
    kOIVth: "xjcht0a",
    k8WAf4: "x8o8v82",
    kg3NbH: "x1pzlopt",
    kt9PQ7: "x92x3c3",
    kfdmCh: "x1q0q8m5",
    kL6WhQ: "xw8gpjh",
    $$css: true
  },
  headerControls: {
    kFhvOy: "x1lqcxt8",
    $$css: true
  },
  headerTitle: {
    kFhvOy: "x7v7x1q",
    k9WMMc: "x2b8uid",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  headerTitleContent: {
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kOIVth: "x1txdalj",
    $$css: true
  },
  loadingSpinner: {
    k1xSpc: "x3nfvp2",
    $$css: true
  },
  loadingSpinnerHidden: {
    k33iCy: "xlshs6z",
    $$css: true
  },
  headerStatus: {
    kFhvOy: "x1qab1bc",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  titleEmphasis: {
    k63SB2: "x1lvx875",
    $$css: true
  },
  visuallyHidden: {
    kVAEAm: "x10l6tqk",
    kzqmXN: "x1i1rx1s",
    kZKoxP: "xjm9jq1",
    kmVPX3: "x1717udv",
    kogj98: "xkdpibf",
    kVQacm: "xb3r6kr",
    kMcinP: "xeh89do",
    khDVqt: "xuxw1ft",
    kMzoRj: "xc342km",
    $$css: true
  },
  weekHeader: {
    k1xSpc: "xrvj5dj",
    kumcoG: "x1gj6vdr",
    kt9PQ7: "x92x3c3",
    kfdmCh: "x1q0q8m5",
    kL6WhQ: "xw8gpjh",
    $$css: true
  },
  weekdayLabel: {
    k8WAf4: "xce4md1",
    kg3NbH: "xrrkdod",
    k9WMMc: "x2b8uid",
    $$css: true
  },
  weekdayHeading: {
    k9WMMc: "x2b8uid",
    $$css: true
  },
  monthGrid: {
    kXHlph: "xw2csxc",
    $$css: true
  },
  monthGridSurface: {
    kVAEAm: "x1n2onr6",
    kzqmXN: "xh8yej3",
    k7Eaqz: "x1uz6y0c",
    $$css: true
  },
  monthCellGrid: {
    k1xSpc: "xrvj5dj",
    kumcoG: "x1gj6vdr",
    kJBjZk: "xc2ull6",
    $$css: true
  },
  monthGridRow: {
    k1xSpc: "xjp7ctv",
    $$css: true
  },
  monthEventOverlay: {
    kVAEAm: "x10l6tqk",
    kpwlN0: "x10a8y8t",
    k1xSpc: "xrvj5dj",
    kumcoG: "x1gj6vdr",
    kJBjZk: "xc2ull6",
    kfzvcC: "x47corl",
    $$css: true
  },
  monthCell: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kOIVth: "xzye2dw",
    k7Eaqz: "xeuugli",
    kmVPX3: "x1717udv",
    ke9TFa: "xw8tdv1",
    k8ry5P: "x18b5jzi",
    kBCPoo: "x1gejf6u",
    kt9PQ7: "x92x3c3",
    kfdmCh: "x1q0q8m5",
    kL6WhQ: "xw8gpjh",
    kWkggS: "x1de1mus",
    $$css: true
  },
  monthCellLastColumn: {
    ke9TFa: "x10w94by",
    $$css: true
  },
  monthCellLastRow: {
    kt9PQ7: "x1qhh985",
    $$css: true
  },
  monthCellOutside: {
    kWkggS: "xwmxj5m",
    $$css: true
  },
  monthDayNumber: {
    kSGwAc: "xqcrz7y",
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "x1nhvcw1",
    kzqmXN: "xvy4d1p",
    kZKoxP: "xxk0z11",
    kogj98: "x10h29id",
    kZCmMZ: "x1vsv5vr",
    kwRFfy: "xyri2b",
    kaIpWk: "xjspbzw",
    kMwMTN: "xv1l7n4",
    $$css: true
  },
  currentDayPill: {
    kMwMTN: "x17wrial",
    kWkggS: "x1ewilqj",
    $$css: true
  },
  monthEventStack: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kOIVth: "x1lsbc85",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  monthEventSpan: (week, columnStart, columnEnd, level) => [_temp, {
    "--x-gridRow": `${week + 1}` != null ? `${week + 1}` : undefined,
    "--x-gridColumn": `${columnStart + 1} / ${columnEnd + 2}` != null ? `${columnStart + 1} / ${columnEnd + 2}` : undefined,
    "--x-marginBlockStart": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`${30 + level * 29}px`)
  }],
  eventPill: {
    kMv6JI: "x9ynric",
    kMwMTN: "x1tgivj0",
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    kOIVth: "xzye2dw",
    k7Eaqz: "xeuugli",
    kMzoRj: "x1litavf",
    ksu8eU: "x1y0btm7",
    kaIpWk: "xx3sua9",
    k8WAf4: "x13f7esw",
    kg3NbH: "x4ezzuc",
    kGuDYH: "x141an7d",
    kLWn49: "x1ltkj2j",
    k63SB2: "x1e4wzip",
    $$css: true
  },
  eventTitle: {
    kVQacm: "xb3r6kr",
    kg5iWk: "xlyipyv",
    khDVqt: "xuxw1ft",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  eventTime: {
    k1xSpc: "x1lliihq xt8ngn3",
    kVQacm: "xb3r6kr",
    kg5iWk: "xlyipyv",
    khDVqt: "xuxw1ft",
    kmuXW: "x2lah0s",
    kSiTet: "x1us6l5c",
    $$css: true
  },
  moreEvents: {
    kMv6JI: "x9ynric",
    kMwMTN: "xv1l7n4",
    kGuDYH: "x141an7d",
    kLWn49: "x1ltkj2j",
    $$css: true
  },
  timeGridFrame: {
    kVAEAm: "x1n2onr6",
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kzQI83: "x1iyjqo2",
    kmuXW: "xs83m0k",
    kCS8Yb: "x1xkqpvf",
    kAzted: "x2lwn1j",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  timeGridViewport: {
    kzQI83: "x1iyjqo2",
    kmuXW: "xs83m0k",
    kCS8Yb: "x1r8uery",
    kAzted: "x2lwn1j",
    k7Eaqz: "xeuugli",
    kZ7BSC: "x185mbhu",
    kHBbk8: "xc8icb0",
    k3XXqK: "x1t137rt",
    $$css: true
  },
  timeGridFocusRing: {
    kVAEAm: "x10l6tqk",
    kpwlN0: "x10a8y8t",
    kfzvcC: "x47corl",
    kMeerF: "x1k57tk5 x1pbqdyb",
    k3XXqK: "x1t137rt xfo4oy",
    kjBf7l: "x1uczgqu x1243db4",
    kInvED: "x1c097ug",
    $$css: true
  },
  timeGridContent: columnCount => [_temp2, {
    "--x-gridTemplateColumns": `60px repeat(${Math.max(1, columnCount)}, minmax(140px, 1fr))` != null ? `60px repeat(${Math.max(1, columnCount)}, minmax(140px, 1fr))` : undefined,
    "--x-minWidth": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`${60 + Math.max(1, columnCount) * 140}px`)
  }],
  dayColumnPlacement: index => [_temp3, {
    "--x-gridColumn": `${index + 2}` != null ? `${index + 2}` : undefined
  }],
  timeGridCorner: {
    kBCFzs: "xgkxs2y",
    kbNqZ1: "x1ms6mhf",
    kVAEAm: "x7wzq59",
    k87sOh: "x13vifvy",
    kLqNvP: "x1o0tod",
    kY2c9j: "xzkaem6",
    kWkggS: "x1de1mus",
    ke9TFa: "xw8tdv1",
    k8ry5P: "x18b5jzi",
    kBCPoo: "x1gejf6u",
    kt9PQ7: "x92x3c3",
    kfdmCh: "x1q0q8m5",
    kL6WhQ: "xw8gpjh",
    $$css: true
  },
  timeGridHeaderCell: {
    kbNqZ1: "x1ms6mhf",
    kVAEAm: "x7wzq59",
    k87sOh: "x13vifvy",
    kY2c9j: "xhtitgo",
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kOIVth: "x1lsbc85",
    k7Eaqz: "xeuugli",
    kWkggS: "x1de1mus",
    ke9TFa: "xw8tdv1",
    k8ry5P: "x18b5jzi",
    kBCPoo: "x1gejf6u",
    kt9PQ7: "x92x3c3",
    kfdmCh: "x1q0q8m5",
    kL6WhQ: "xw8gpjh",
    $$css: true
  },
  timeGridHeaderCellLast: {
    ke9TFa: "x10w94by",
    $$css: true
  },
  timeGridHeaderHeading: {
    k9WMMc: "x2b8uid",
    $$css: true
  },
  timeGridHeaderHeadingContent: {
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kOIVth: "xzye2dw",
    $$css: true
  },
  timeGridDayNumber: {
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kaIpWk: "xjspbzw",
    $$css: true
  },
  timeGridCurrentDayPill: {
    k7Eaqz: "x17s4nb9",
    kZKoxP: "x1gnnpzl",
    kLWn49: "xklk4pu",
    kMwMTN: "x17wrial",
    kWkggS: "x1ewilqj",
    $$css: true
  },
  allDayLabel: {
    kBCFzs: "xgkxs2y",
    kbNqZ1: "x7sv70a",
    kVAEAm: "x7wzq59",
    k87sOh: "x1ng4z2i",
    kLqNvP: "x1o0tod",
    kY2c9j: "xzkaem6",
    k8WAf4: "xu0wf1k",
    kg3NbH: "xf314gf",
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    kjj79g: "x13a6bvl",
    kWkggS: "x1de1mus",
    ke9TFa: "xw8tdv1",
    k8ry5P: "x18b5jzi",
    kBCPoo: "x1gejf6u",
    kt9PQ7: "x92x3c3",
    kfdmCh: "x1q0q8m5",
    kL6WhQ: "xw8gpjh",
    $$css: true
  },
  allDayRow: levelCount => [_temp4, {
    "--x-minHeight": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(levelCount > 0 ? `${3 + levelCount * 27}px` : '26px')
  }],
  allDaySubgridPlacement: index => [_temp5, {
    "--x-gridColumn": `${index + 1}` != null ? `${index + 1}` : undefined
  }],
  allDayCell: {
    kbNqZ1: "x1ms6mhf",
    k7Eaqz: "xeuugli",
    ke9TFa: "xw8tdv1",
    k8ry5P: "x18b5jzi",
    kBCPoo: "x1gejf6u",
    $$css: true
  },
  allDayCellLast: {
    ke9TFa: "x10w94by",
    $$css: true
  },
  allDayEventSpan: (columnStart, columnEnd, level) => [_temp6, {
    "--x-gridColumn": `${columnStart + 1} / ${columnEnd + 2}` != null ? `${columnStart + 1} / ${columnEnd + 2}` : undefined,
    "--x-marginBlockStart": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`${2 + level * 27}px`)
  }],
  timeLabels: {
    kBCFzs: "xgkxs2y",
    kbNqZ1: "xz51j44",
    kVAEAm: "x7wzq59",
    kLqNvP: "x1o0tod",
    kY2c9j: "xhtitgo",
    kWkggS: "x1de1mus",
    ke9TFa: "xw8tdv1",
    k8ry5P: "x18b5jzi",
    kBCPoo: "x1gejf6u",
    $$css: true
  },
  timeLabel: {
    kMv6JI: "x9ynric",
    kMwMTN: "xv1l7n4",
    kVAEAm: "x10l6tqk",
    kkqhue: "x17y0mx6",
    k3aq6I: "x1cb1t30",
    kZCmMZ: "x1vsv5vr",
    kwRFfy: "x1nryj5t",
    kGuDYH: "x141an7d",
    kLWn49: "x1ltkj2j",
    k9WMMc: "xp4054r",
    $$css: true
  },
  timeLabelPosition: (index, hourHeight) => [_temp7, {
    "--x-top": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`${index * hourHeight - 1}px`)
  }],
  timeColumn: {
    kbNqZ1: "xz51j44",
    kVAEAm: "x1n2onr6",
    kHBbk8: "xc8icb0",
    k1xSpc: "xrvj5dj",
    k7Eaqz: "xeuugli",
    ke9TFa: "xw8tdv1",
    k8ry5P: "x18b5jzi",
    kBCPoo: "x1gejf6u",
    $$css: true
  },
  timeColumnRows: hourHeight => [_temp8, {
    "--x-gridAutoRows": `${hourHeight}px` != null ? `${hourHeight}px` : undefined
  }],
  timeColumnLast: {
    ke9TFa: "x10w94by",
    $$css: true
  },
  hourSlot: {
    kt9PQ7: "x92x3c3",
    kfdmCh: "x1q0q8m5",
    kL6WhQ: "xw8gpjh",
    $$css: true
  },
  hourSlotLast: {
    kt9PQ7: "x1qhh985",
    $$css: true
  },
  timedEvent: {
    kMv6JI: "x9ynric",
    kMwMTN: "x1tgivj0",
    kVAEAm: "x10l6tqk",
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kOIVth: "xxhr3t",
    kAzted: "xjwf9q1",
    k7Eaqz: "xeuugli",
    kVQacm: "xb3r6kr",
    k9g6sI: "x12h1iku",
    kMzoRj: "x1litavf",
    ksu8eU: "x1y0btm7",
    kaIpWk: "xx3sua9",
    kLKAdn: "xbx876j",
    kGO01o: "xy143xn",
    kg3NbH: "x7a5moj",
    kGuDYH: "x141an7d",
    kLWn49: "x1ltkj2j",
    k63SB2: "x1e4wzip",
    $$css: true
  },
  eventButtonReset: {
    kysU6D: "xjyslct",
    k1xSpc: "x1lliihq",
    kFhvOy: "xuy72oy",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kMzoRj: "xc342km",
    ksu8eU: "xng3xce",
    kWkggS: "xjbqb8w",
    kMwMTN: "x1heor9g",
    kVVagm: "xln7xf2",
    k9WMMc: "x1yc453h",
    kkrTdU: "x1ypdohk x16khyan",
    $$css: true
  },
  eventButtonFocus: {
    kY2c9j: "x135w3n3",
    $$css: true
  },
  eventPopover: {
    kB7OPa: "x9f619",
    kskxy: "x1kucsgy",
    kORKVm: "x1odjw0f",
    $$css: true
  },
  timedEventPosition: (top, height, inlineStart, inlineSize) => [_temp9, {
    "--x-top": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`calc(${top}% + 2px)`),
    "--x-height": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`calc(${height}% - 5px)`),
    "--x-insetInlineStart": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`calc(${inlineStart}% + ${spacingVars['--spacing-0-5']})`),
    "--x-inlineSize": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`calc(${inlineSize}% - ${spacingVars['--spacing-0-5']} * 2)`)
  }],
  currentTimeLine: top => [_temp0, {
    "--x-top": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`calc(${top}% + 2px)`)
  }],
  list: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    $$css: true
  },
  listDay: {
    k1xSpc: "xrvj5dj",
    kumcoG: "x1cmcxw8",
    kGNEyG: "x7a106z",
    k1C7PZ: "xewh9hi",
    k8WAf4: "x8o8v82",
    kg3NbH: "xrrkdod",
    kt9PQ7: "x92x3c3",
    kfdmCh: "x1q0q8m5",
    kL6WhQ: "xw8gpjh",
    $$css: true
  },
  listDayLast: {
    kt9PQ7: "x1qhh985",
    $$css: true
  },
  listDayHeading: {
    kBCFzs: "xgkxs2y",
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "x1nhvcw1",
    k1C7PZ: "xak3so",
    keoZOQ: "x160xvyo",
    keTefX: "xhi58n4",
    $$css: true
  },
  listDayNumber: {
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "x13a6bvl",
    kzqmXN: "x1849jeq",
    kZKoxP: "x1gnnpzl",
    kaIpWk: "xjspbzw",
    $$css: true
  },
  listDayNumberText: {
    k63SB2: "x1lvx875",
    $$css: true
  },
  listDayNumberCurrent: {
    kjj79g: "xl56j7k",
    kMwMTN: "x17wrial",
    kWkggS: "x1ewilqj",
    $$css: true
  },
  listEvents: {
    kBCFzs: "x1npkx4u",
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kOIVth: "x1txdalj",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  listNowRow: {
    kVAEAm: "x1n2onr6",
    kZKoxP: "x170jfvy",
    kqGvvJ: "x1yqqeh1",
    kgeoSG: "x1cpjm7i",
    kEoFBp: "x1hmns74",
    kpsdNU: "xm4btww",
    k96MEf: "xw9j58",
    kg8CZY: "x1b8stmw",
    k2L7bE: "xnvurfn",
    kwknyK: "x1b5r9ul",
    k5JduY: "x1s928wv",
    kwXMNM: "x1j6awrg",
    kc1e00: "xxxjk75",
    k3foIR: "x1m1drc7",
    kkgrvl: "xg4xgkf",
    k4zj60: "x1bymyaz",
    kUfP38: "xq94oqs",
    ks3ayO: "xvgeimn",
    $$css: true
  },
  listEventRow: {
    k1xSpc: "xrvj5dj",
    kumcoG: "x857yr4",
    kGNEyG: "x6s0dn4",
    kOIVth: "x1txdalj",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  listEventDot: {
    kzqmXN: "x1fsd2vl",
    kZKoxP: "x170jfvy",
    kaIpWk: "xjspbzw",
    $$css: true
  },
  listEventTime: {
    kMv6JI: "x9ynric",
    kMwMTN: "xv1l7n4",
    kGuDYH: "x141an7d",
    kLWn49: "x1ltkj2j",
    khDVqt: "xuxw1ft",
    $$css: true
  },
  listEventTitle: {
    kMv6JI: "x9ynric",
    kMwMTN: "x1tgivj0",
    k7Eaqz: "xeuugli",
    kVQacm: "xb3r6kr",
    kg5iWk: "xlyipyv",
    khDVqt: "xuxw1ft",
    kGuDYH: "xjm74w1",
    kLWn49: "xw6l6zx",
    k63SB2: "x1e4wzip",
    $$css: true
  },
  listEventTitlePast: {
    kMwMTN: "xv1l7n4",
    $$css: true
  },
  listEventDotPast: {
    kSiTet: "xbyyjgo",
    $$css: true
  },
  eventBlue: {
    kMwMTN: "x1vvqiwl",
    kWkggS: "x1o0wnni",
    kVAM5u: "xlee4gx",
    $$css: true
  },
  eventDotBlue: {
    kWkggS: "xr0mm9x",
    $$css: true
  },
  eventSurfaceBlue: {
    kMwMTN: "x1vvqiwl",
    kVAM5u: "xlee4gx",
    kWkggS: "xuei7rd",
    $$css: true
  },
  eventPastSurfaceBlue: {
    kMwMTN: "xda2nnr",
    kVAM5u: "x103w4nt",
    kWkggS: "xndu7tf",
    $$css: true
  },
  eventCyan: {
    kMwMTN: "x1txnczv",
    kWkggS: "x1rgj867",
    kVAM5u: "xb1xfl",
    $$css: true
  },
  eventDotCyan: {
    kWkggS: "xl5sasa",
    $$css: true
  },
  eventSurfaceCyan: {
    kMwMTN: "x1txnczv",
    kVAM5u: "xb1xfl",
    kWkggS: "xt74dbf",
    $$css: true
  },
  eventPastSurfaceCyan: {
    kMwMTN: "x1u1o4zu",
    kVAM5u: "x14n1b0s",
    kWkggS: "xjwanps",
    $$css: true
  },
  eventGray: {
    kMwMTN: "xru1t7f",
    kWkggS: "xspzpui",
    kVAM5u: "x1w9ec3u",
    $$css: true
  },
  eventDotGray: {
    kWkggS: "xdomwnj",
    $$css: true
  },
  eventSurfaceGray: {
    kMwMTN: "xru1t7f",
    kVAM5u: "x1w9ec3u",
    kWkggS: "x1j9tyrv",
    $$css: true
  },
  eventPastSurfaceGray: {
    kMwMTN: "xv1l7n4",
    kVAM5u: "x14i3s5s",
    kWkggS: "x1o2lugu",
    $$css: true
  },
  eventGreen: {
    kMwMTN: "xltfdvo",
    kWkggS: "x1sqjeoo",
    kVAM5u: "xy90a9n",
    $$css: true
  },
  eventDotGreen: {
    kWkggS: "x6ipefc",
    $$css: true
  },
  eventSurfaceGreen: {
    kMwMTN: "xltfdvo",
    kVAM5u: "xy90a9n",
    kWkggS: "x1obh4um",
    $$css: true
  },
  eventPastSurfaceGreen: {
    kMwMTN: "x2xxiir",
    kVAM5u: "x1uk4s2l",
    kWkggS: "x1xcvo73",
    $$css: true
  },
  eventOrange: {
    kMwMTN: "xm47u9q",
    kWkggS: "x1e9xt6e",
    kVAM5u: "xloqurj",
    $$css: true
  },
  eventDotOrange: {
    kWkggS: "x1f80rgn",
    $$css: true
  },
  eventSurfaceOrange: {
    kMwMTN: "xm47u9q",
    kVAM5u: "xloqurj",
    kWkggS: "xu0zddy",
    $$css: true
  },
  eventPastSurfaceOrange: {
    kMwMTN: "xnveu8w",
    kVAM5u: "x1nhezck",
    kWkggS: "x8ayxpi",
    $$css: true
  },
  eventPink: {
    kMwMTN: "xiuofww",
    kWkggS: "xnpoty2",
    kVAM5u: "x1czkbn8",
    $$css: true
  },
  eventDotPink: {
    kWkggS: "x17ey546",
    $$css: true
  },
  eventSurfacePink: {
    kMwMTN: "xiuofww",
    kVAM5u: "x1czkbn8",
    kWkggS: "x903q04",
    $$css: true
  },
  eventPastSurfacePink: {
    kMwMTN: "x1gcpyt4",
    kVAM5u: "x1ykxfgw",
    kWkggS: "xiipwng",
    $$css: true
  },
  eventPurple: {
    kMwMTN: "x1m9wyeb",
    kWkggS: "x16i6n6f",
    kVAM5u: "xq98wne",
    $$css: true
  },
  eventDotPurple: {
    kWkggS: "xpp9lhe",
    $$css: true
  },
  eventSurfacePurple: {
    kMwMTN: "x1m9wyeb",
    kVAM5u: "xq98wne",
    kWkggS: "xya6syd",
    $$css: true
  },
  eventPastSurfacePurple: {
    kMwMTN: "x1xphww9",
    kVAM5u: "x1jpwwg7",
    kWkggS: "x1rfpnkv",
    $$css: true
  },
  eventRed: {
    kMwMTN: "x1joocv1",
    kWkggS: "x1cibrc5",
    kVAM5u: "xjqgoec",
    $$css: true
  },
  eventDotRed: {
    kWkggS: "xg9c4l2",
    $$css: true
  },
  eventSurfaceRed: {
    kMwMTN: "x1joocv1",
    kVAM5u: "xjqgoec",
    kWkggS: "xfna726",
    $$css: true
  },
  eventPastSurfaceRed: {
    kMwMTN: "xogwzh6",
    kVAM5u: "x1t9827k",
    kWkggS: "xcostcg",
    $$css: true
  },
  eventTeal: {
    kMwMTN: "x9x0lbs",
    kWkggS: "x1jtji5o",
    kVAM5u: "x1r9gxr1",
    $$css: true
  },
  eventDotTeal: {
    kWkggS: "x1m3yk8c",
    $$css: true
  },
  eventSurfaceTeal: {
    kMwMTN: "x9x0lbs",
    kVAM5u: "x1r9gxr1",
    kWkggS: "x1607b1m",
    $$css: true
  },
  eventPastSurfaceTeal: {
    kMwMTN: "x1s4jh2n",
    kVAM5u: "x1ooq0ed",
    kWkggS: "xuro2n0",
    $$css: true
  },
  eventYellow: {
    kMwMTN: "xdhq94a",
    kWkggS: "x1bo7t0x",
    kVAM5u: "x1kpnwn1",
    $$css: true
  },
  eventDotYellow: {
    kWkggS: "x154rz6c",
    $$css: true
  },
  eventSurfaceYellow: {
    kMwMTN: "xdhq94a",
    kVAM5u: "x1kpnwn1",
    kWkggS: "x1sjw1wq",
    $$css: true
  },
  eventPastSurfaceYellow: {
    kMwMTN: "x1wzna5w",
    kVAM5u: "x1t0z2uq",
    kWkggS: "x17tjail",
    $$css: true
  }
};