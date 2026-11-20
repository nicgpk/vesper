// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TourContext.ts
 * @input Uses React createContext
 * @output Exports TourContext, TourContextValue, TourDismissSource
 * @position Internal context; provided by Tour, consumed by TourStep + useTour
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Tour/Tour.tsx
 * - /packages/lab/src/Tour/TourStep.tsx
 * - /packages/lab/src/Tour/useTour.ts
 * - /packages/lab/src/Tour/Tour.doc.mjs
 */
import { createContext } from 'react';

/**
 * Why a tour was dismissed. Lets a consumer distinguish "finished the whole
 * tour" from the various early exits, so it can persist "has seen this tour"
 * appropriately.
 * - `backdrop`: clicked the dimmed background
 * - `escape`: pressed Escape at any step
 * - `close`: pressed the step's close (X) control
 * - `skip`: chose "skip"/"maybe later" on the first step
 * - `complete`: advanced past the final step
 */

/**
 * Value shared from the Tour controller to its steps. Steps register
 * themselves on mount (so the controller learns the step order from the
 * children, in document order) and read whether they are the active step.
 */

export const TourContext = /*#__PURE__*/createContext(null);