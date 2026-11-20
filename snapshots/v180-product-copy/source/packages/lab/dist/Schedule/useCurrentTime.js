// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useCurrentTime.ts
 * @input Browser clock
 * @output A shared ticking Instant value for schedule current-time affordances
 * @position Internal hook consumed by schedule views
 */
import { useSyncExternalStore } from 'react';
const UPDATE_INTERVAL_MS = 60 * 1000;
const listeners = new Set();
let interval = null;
let currentTime = Date.now();
function getSnapshot() {
  return currentTime;
}

// SSR returns 0 because current time only drives client-side affordances
// (now-indicator line, past-event dimming) that are acceptable to hydrate.
function getServerSnapshot() {
  return 0;
}
function subscribe(listener) {
  listeners.add(listener);
  if (interval == null) {
    // The module may have loaded long before Schedule mounted.
    currentTime = Date.now();
    interval = setInterval(() => {
      currentTime = Date.now();
      listeners.forEach(activeListener => activeListener());
    }, UPDATE_INTERVAL_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && interval != null) {
      clearInterval(interval);
      interval = null;
    }
  };
}
export function useCurrentTime() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}