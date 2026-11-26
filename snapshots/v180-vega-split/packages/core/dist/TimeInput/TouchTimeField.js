// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TouchTimeField.tsx
 * @input Uses React, Field, BottomSheet, Wheel, DateInput touch geometry
 *   tokens, and shared time utilities
 * @output Exports TouchTimeField — the bottom-sheet surface behind TimeInput
 * @position Internal component; consumed by TimeInput.tsx for `presentation`
 *   sheet surfaces (`spec:AST-043` DEC-3: the time half of DateTimeInput's sheet)
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TimeInput/TimeInput.tsx
 * - /packages/core/src/TimeInput/TimeInput.doc.mjs
 * - /packages/core/src/DateTimeInput/TouchDateTimeField.tsx (wheel behavior)
 */
import { useCallback, useId, useMemo, useOptimistic, useRef, useState, useTransition } from 'react';
import * as stylex from '@stylexjs/stylex';
import { BottomSheet } from "../BottomSheet/index.js";
import { Button } from "../Button/index.js";
import { Field, InputClearButton, inputWrapperStyles, inputStatusBorderStyles, inputStatusHoverShadowStyles, inputStatusFocusWithinStyles } from "../Field/index.js";
import { useInputGroup } from "../InputGroup/InputGroupContext.js";
import { groupStyles } from "../InputGroup/groupStyles.js";
import { useInputStatusIcon } from "../hooks/useInputStatusIcon.js";
import { useMergedRefs } from "../hooks/useMergedRefs.js";
import { useResolvedRequired } from "../hooks/useResolvedRequired.js";
import { Icon } from "../Icon/index.js";
import { useTranslator } from "../i18n/index.js";
import "../theme/tokens.stylex.js";
import { sizeVars, spacingVars } from "../theme/tokens.stylex.js";
import { useSize } from "../SizeContext/SizeContext.js";
import { Spinner } from "../Spinner/index.js";
import { useTooltip } from "../Tooltip/index.js";
import { Wheel } from "../DateInput/Wheel.js";
import "../DateInput/tokens.stylex.js";
import { dateInputTouchGeometry } from "../DateInput/tokens.stylex.js";
import { focusOutlineStyles } from "../utils/focusOutline.stylex.js";
import { themeProps } from "../utils/themeProps.js";
import { clampTime, formatDisplayTime12h, formatDisplayTime24h, formatISOTime, getInputARIA, isTimeInRange, mergeProps, parseISOTime } from "../utils/index.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const sizeStyles = {
  sm: {
    kZKoxP: "x6k0iem",
    k7Eaqz: "x1i9suas",
    $$css: true
  },
  md: {
    kZKoxP: "x1ueg155",
    k7Eaqz: "x1i9suas",
    $$css: true
  },
  lg: {
    kZKoxP: "xssyfek",
    k7Eaqz: "x1i9suas",
    $$css: true
  }
};
const styles = {
  iconButton: {
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kmVPX3: "x1717udv",
    kogj98: "x1ghz6dp",
    kMzoRj: "xc342km",
    ksu8eU: "xng3xce",
    kWkggS: "xjbqb8w",
    kkrTdU: "x1ypdohk x16khyan",
    kmuXW: "x2lah0s",
    $$css: true
  }
};
function twoDigits(value) {
  return String(value).padStart(2, '0');
}
function hour12From24(hour) {
  return hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
}
function hour24From12(hour, meridiem) {
  if (meridiem === 0) {
    return hour === 12 ? 0 : hour;
  }
  return hour === 12 ? 12 : hour + 12;
}
function timeToSeconds(time) {
  if (time == null) {
    return null;
  }
  const parsed = parseISOTime(time);
  return parsed == null ? null : parsed.hour * 3600 + parsed.minute * 60 + parsed.second;
}
function rangeOverlaps(startSecond, endSecond, min, max) {
  const minSecond = timeToSeconds(min);
  const maxSecond = timeToSeconds(max);
  return (minSecond == null || endSecond >= minSecond) && (maxSecond == null || startSecond <= maxSecond);
}

/**
 * The Astryx bottom-sheet time surface: a read-only closed field that opens
 * hour/minute(/second/meridiem) wheels in a BottomSheet. Wheels commit live,
 * clamped to `min`/`max`; the footer Save button only closes the sheet.
 */
export function TouchTimeField({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  disabledMessage,
  value,
  onChange,
  changeAction,
  isLoading = false,
  min,
  max,
  hasSeconds = false,
  hasClear = false,
  hourFormat = '12h',
  placeholder: placeholderFromProps,
  size: sizeProp,
  status,
  statusVariant = 'attached',
  labelTooltip,
  width,
  xstyle,
  className,
  style,
  ref
}) {
  const t = useTranslator();
  const isEffectivelyRequired = useResolvedRequired({
    isRequired,
    isOptional
  });
  const placeholder = placeholderFromProps ?? t('@astryx.timeInput.placeholder');
  const size = useSize(sizeProp, 'md');
  const id = useId();
  const inputLabelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef(null);
  const mergedInputRef = useMergedRefs(ref, inputRef);
  const inputGroup = useInputGroup();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;
  const isEffectivelyDisabled = isDisabled || isLoading;
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage
  });
  const {
    statusIcon,
    describedBy: statusTooltipDescribedBy
  } = useInputStatusIcon({
    status,
    statusVariant,
    isInGroup: !!inputGroup
  });
  const {
    ariaLabelledBy,
    ariaDescribedBy
  } = getInputARIA(inputLabelID, [description ? descriptionID : null, statusVariant !== 'tooltip' && status?.message ? statusMessageID : null, statusTooltipDescribedBy, showsDisabledMessage ? disabledMessageTooltip.describedBy : null], inputGroup);
  const fireChange = useCallback(newValue => {
    if (isEffectivelyDisabled) {
      return;
    }
    onChange?.(newValue);
    if (changeAction) {
      startTransition(async () => {
        setOptimisticValue(newValue);
        await changeAction(newValue);
      });
    }
  }, [changeAction, isEffectivelyDisabled, onChange, setOptimisticValue]);
  const formatDisplayTime = hourFormat === '12h' ? formatDisplayTime12h : formatDisplayTime24h;
  const displayValue = optimisticValue ? formatDisplayTime(optimisticValue, hasSeconds) : '';
  const fallbackTime = useMemo(() => {
    const now = new Date();
    return formatISOTime({
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds()
    }, hasSeconds);
  }, [hasSeconds]);
  const parsedWheelTime = useMemo(() => parseISOTime(optimisticValue ?? fallbackTime) ?? {
    hour: 0,
    minute: 0,
    second: 0
  }, [fallbackTime, optimisticValue]);
  const composeWheelTime = useCallback(patch => {
    const meridiem = patch.meridiem ?? (parsedWheelTime.hour < 12 ? 0 : 1);
    let hour = parsedWheelTime.hour;
    if (patch.hour24 !== undefined) {
      hour = patch.hour24;
    } else if (patch.hour12 !== undefined) {
      hour = hour24From12(patch.hour12, meridiem);
    } else if (patch.meridiem !== undefined) {
      hour = hour24From12(hour12From24(hour), patch.meridiem);
    }
    return formatISOTime({
      hour,
      minute: patch.minute ?? parsedWheelTime.minute,
      second: hasSeconds ? patch.second ?? parsedWheelTime.second : 0
    }, hasSeconds);
  }, [hasSeconds, parsedWheelTime]);
  const commitWheelTime = useCallback(rawTime => {
    const next = clampTime(rawTime, min, max, hasSeconds);
    if (next !== optimisticValue && isTimeInRange(next, min, max)) {
      fireChange(next);
    }
  }, [fireChange, hasSeconds, max, min, optimisticValue]);
  const hourOptions = useMemo(() => {
    if (hourFormat === '24h') {
      return Array.from({
        length: 24
      }, (_, hour) => ({
        value: hour,
        label: twoDigits(hour),
        isDisabled: !rangeOverlaps(hour * 3600, hour * 3600 + 3599, min, max)
      }));
    }
    const meridiem = parsedWheelTime.hour < 12 ? 0 : 1;
    return Array.from({
      length: 12
    }, (_, index) => {
      const hour = index + 1;
      const hour24 = hour24From12(hour, meridiem);
      return {
        value: hour,
        label: String(hour),
        isDisabled: !rangeOverlaps(hour24 * 3600, hour24 * 3600 + 3599, min, max)
      };
    });
  }, [hourFormat, max, min, parsedWheelTime.hour]);
  const minuteOptions = useMemo(() => Array.from({
    length: 60
  }, (_, minute) => {
    const start = parsedWheelTime.hour * 3600 + minute * 60;
    return {
      value: minute,
      label: twoDigits(minute),
      isDisabled: !rangeOverlaps(start, start + (hasSeconds ? 59 : 0), min, max)
    };
  }), [hasSeconds, max, min, parsedWheelTime.hour]);
  const secondOptions = useMemo(() => Array.from({
    length: 60
  }, (_, second) => ({
    value: second,
    label: twoDigits(second),
    isDisabled: !isTimeInRange(formatISOTime({
      hour: parsedWheelTime.hour,
      minute: parsedWheelTime.minute,
      second
    }, true), min, max)
  })), [max, min, parsedWheelTime.hour, parsedWheelTime.minute]);
  const meridiemOptions = useMemo(() => [{
    value: 0,
    label: t('@astryx.dateTimeInput.meridiemAM'),
    isDisabled: !rangeOverlaps(0, 11 * 3600 + 3599, min, max)
  }, {
    value: 1,
    label: t('@astryx.dateTimeInput.meridiemPM'),
    isDisabled: !rangeOverlaps(12 * 3600, 23 * 3600 + 3599, min, max)
  }], [max, min, t]);
  const openSheet = useCallback(() => {
    if (!isEffectivelyDisabled) {
      setIsSheetOpen(true);
    }
  }, [isEffectivelyDisabled]);
  const inputWrapper = /*#__PURE__*/_jsxs("div", {
    ref: el => {
      disabledMessageTooltip.ref(el);
    },
    ...mergeProps(themeProps('time-input', {
      size,
      status: status?.type ?? null,
      disabled: isDisabled ? 'disabled' : null
    }), stylex.props(inputWrapperStyles.base, sizeStyles[size], isDisabled && inputWrapperStyles.disabled, status && inputStatusBorderStyles[status.type], status && !isDisabled && inputStatusHoverShadowStyles[status.type], status && inputStatusFocusWithinStyles[status.type], inputGroup && groupStyles.inGroup, xstyle), className, style),
    children: [/*#__PURE__*/_jsx("button", {
      type: "button",
      onClick: openSheet,
      disabled: isEffectivelyDisabled,
      "aria-label": t('@astryx.timeInput.openPicker', {
        label
      }),
      tabIndex: -1,
      ...stylex.props(focusOutlineStyles.focusVisible, styles.iconButton),
      children: /*#__PURE__*/_jsx(Icon, {
        icon: "clock",
        size: "sm",
        color: "secondary"
      })
    }), /*#__PURE__*/_jsx("input", {
      ref: mergedInputRef,
      id: id,
      type: "text",
      role: "combobox",
      value: displayValue,
      readOnly: true,
      inputMode: "none",
      onChange: () => {},
      onClick: openSheet,
      placeholder: placeholder,
      disabled: isEffectivelyDisabled && !showsDisabledMessage,
      "aria-disabled": showsDisabledMessage ? 'true' : undefined,
      "aria-describedby": ariaDescribedBy,
      "aria-required": isEffectivelyRequired ? 'true' : undefined,
      "aria-invalid": status?.type === 'error' ? 'true' : undefined,
      "aria-busy": isBusy || undefined,
      "aria-expanded": isSheetOpen,
      "aria-haspopup": "dialog",
      "aria-autocomplete": "none",
      autoComplete: "off",
      "aria-labelledby": ariaLabelledBy,
      ...{
        className: "x1lliihq x98rzlu xeuugli xc342km xng3xce x1717udv xjbqb8w x1a2a7pz x1ypdohk x16khyan"
      }
    }), isBusy && /*#__PURE__*/_jsx(Spinner, {
      size: "sm"
    }), hasClear && optimisticValue && !isEffectivelyDisabled && /*#__PURE__*/_jsx(InputClearButton, {
      label: t('@astryx.timeInput.clearLabel', {
        label
      }),
      onClick: () => fireChange(undefined)
    }), statusIcon, /*#__PURE__*/_jsx(BottomSheet, {
      isOpen: isSheetOpen,
      onOpenChange: setIsSheetOpen,
      label: label,
      height: "hug",
      children: /*#__PURE__*/_jsxs("div", {
        ...{
          className: "x9f619 x78zum5 xdt5ytf xh8yej3 xeuugli x1txdalj x1pzlopt x1adxfkp x1awphl8"
        },
        children: [/*#__PURE__*/_jsxs("div", {
          ...{
            className: "x78zum5 xh8yej3 xeuugli xm8gem x1txdalj"
          },
          children: [/*#__PURE__*/_jsx(Wheel, {
            label: t('@astryx.dateTimeInput.hourWheel'),
            options: hourOptions,
            value: hourFormat === '24h' ? parsedWheelTime.hour : hour12From24(parsedWheelTime.hour),
            isActive: isSheetOpen,
            onChange: hour => commitWheelTime(hourFormat === '24h' ? composeWheelTime({
              hour24: hour
            }) : composeWheelTime({
              hour12: hour
            }))
          }), /*#__PURE__*/_jsx(Wheel, {
            label: t('@astryx.dateTimeInput.minuteWheel'),
            options: minuteOptions,
            value: parsedWheelTime.minute,
            isActive: isSheetOpen,
            onChange: minute => commitWheelTime(composeWheelTime({
              minute
            }))
          }), hasSeconds && /*#__PURE__*/_jsx(Wheel, {
            label: t('@astryx.dateTimeInput.secondWheel'),
            options: secondOptions,
            value: parsedWheelTime.second,
            isActive: isSheetOpen,
            onChange: second => commitWheelTime(composeWheelTime({
              second
            }))
          }), hourFormat === '12h' && /*#__PURE__*/_jsx(Wheel, {
            label: t('@astryx.dateTimeInput.meridiemWheel'),
            options: meridiemOptions,
            value: parsedWheelTime.hour < 12 ? 0 : 1,
            isActive: isSheetOpen,
            onChange: meridiem => commitWheelTime(composeWheelTime({
              meridiem
            }))
          })]
        }), /*#__PURE__*/_jsx("div", {
          ...{
            className: "x78zum5 xr1yuqi xfsso4q"
          },
          children: /*#__PURE__*/_jsx(Button, {
            variant: "primary",
            size: "md",
            width: "100%",
            label: t('@astryx.dateInput.savePicking'),
            onClick: () => setIsSheetOpen(false)
          })
        })]
      })
    }), showsDisabledMessage && disabledMessageTooltip.renderTooltip(disabledMessage)]
  });
  if (inputGroup) {
    return inputWrapper;
  }
  return /*#__PURE__*/_jsx(Field, {
    label: label,
    isLabelHidden: isLabelHidden,
    description: description,
    inputID: id,
    descriptionID: description ? descriptionID : undefined,
    isOptional: isOptional,
    isRequired: isRequired,
    isDisabled: isDisabled,
    status: status ? {
      type: status.type,
      message: status.message,
      messageID: status.message ? statusMessageID : undefined
    } : undefined,
    statusVariant: statusVariant,
    labelTooltip: labelTooltip,
    width: width,
    children: inputWrapper
  });
}
TouchTimeField.displayName = 'TouchTimeField';