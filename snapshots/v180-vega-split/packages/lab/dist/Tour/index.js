// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Tour, TourStep, useTour
 * @output Re-exports the Tour lab experiment's public API
 * @position Lab entry point for the Tour directory
 *
 * SYNC: When modified, update /packages/lab/src/Tour/Tour.doc.mjs
 */
export { Tour } from "./Tour.js";
export { TourStep } from "./TourStep.js";
export { useTour } from "./useTour.js";