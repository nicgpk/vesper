// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputPresentation.ts
 * @input A presentation policy, the deprecated nativePicker value, and pointer type
 * @output The resolved picker surface for DateInput, DateTimeInput, and TimeInput
 * @position Shared presentation vocabulary owned by spec:AST-043
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /docs/specs/AST-043-input-presentation/spec.md (FR1–FR3 tables)
 * - /packages/core/src/DateInput/DateInput.tsx
 * - /packages/core/src/DateTimeInput/DateTimeInput.tsx
 * - /packages/core/src/TimeInput/TimeInput.tsx
 */

/** Picker-surface policy for date/time inputs (`spec:AST-043` FR1). */

/** `presentation` for components without a text-only surface: all except `TimeInput` exclude `text-input` (AST-043). */

/** The surface a resolved `InputPresentation` actually renders. */

/** The surface a resolved `PickerPresentation` renders: one where a picker opens. */

/** Deprecated picker policy (`spec:AST-043` FR3). */

/**
 * Typed as the narrower policy because the default opens a picker for every
 * component; it is still a valid `InputPresentation`.
 */
export const DEFAULT_INPUT_PRESENTATION = 'adaptive-native';

/**
 * Map a deprecated `nativePicker` value to its `presentation` equivalent for
 * a component whose every surface opens a picker (`DateInput`,
 * `DateTimeInput`). Their released `never` was Astryx's own pickers on every
 * pointer, so no value maps to `text-input` — which is what lets the return
 * type exclude it.
 */
export function pickerPresentationFromNativePicker(nativePicker) {
  switch (nativePicker) {
    case 'touch':
      return 'adaptive-native';
    case 'always':
      return 'native';
    case 'never':
      return 'adaptive-bottom-sheet';
  }
}

/**
 * Map a deprecated `nativePicker` value to its `presentation` equivalent.
 * `TimeInput` differs: its released `never` is the typed field on every
 * pointer, so it maps to `text-input`, not a sheet policy.
 */
export function presentationFromNativePicker(nativePicker, component) {
  if (component === 'time' && nativePicker === 'never') {
    return 'text-input';
  }
  return pickerPresentationFromNativePicker(nativePicker);
}

/**
 * The effective picker-only policy: explicit `presentation` wins over the
 * deprecated prop. The narrow twin of {@link effectiveInputPresentation} for
 * `DateInput` and `DateTimeInput`, whose `presentation` cannot be
 * `text-input`.
 */
export function effectivePickerPresentation(presentation, nativePicker) {
  if (presentation !== undefined) {
    return presentation;
  }
  if (nativePicker !== undefined) {
    return pickerPresentationFromNativePicker(nativePicker);
  }
  return DEFAULT_INPUT_PRESENTATION;
}

/** The effective policy: explicit `presentation` wins over the deprecated prop. */
export function effectiveInputPresentation(presentation, nativePicker, component) {
  if (presentation !== undefined) {
    return presentation;
  }
  if (nativePicker !== undefined) {
    return presentationFromNativePicker(nativePicker, component);
  }
  return DEFAULT_INPUT_PRESENTATION;
}

/** Resolve a picker-only policy to the surface rendered for the current pointer. */
export function resolvePickerPresentation(presentation, isCoarsePointer) {
  switch (presentation) {
    case 'popover':
      return 'desktop';
    case 'bottom-sheet':
      return 'sheet';
    case 'native':
      return 'native';
    case 'adaptive-bottom-sheet':
      return isCoarsePointer ? 'sheet' : 'desktop';
    case 'adaptive-native':
      return isCoarsePointer ? 'native' : 'desktop';
  }
}

/** Resolve a policy to the surface rendered for the current pointer. */
export function resolveInputPresentation(presentation, isCoarsePointer) {
  return presentation === 'text-input' ? 'text-input' : resolvePickerPresentation(presentation, isCoarsePointer);
}