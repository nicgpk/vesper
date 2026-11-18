/* SPDX-License-Identifier: MIT — route/focus decisions, no DOM selector interpolation. */
export type RouteFocus = 'none' | 'search' | 'heading' | 'origin';
export function routeFocus(previous: string, next: string, searchRequested: boolean, originExists: boolean): RouteFocus {
  if (previous === next) return 'none';
  if (searchRequested && !next) return 'search';
  if (next) return 'heading';
  return originExists ? 'origin' : 'heading';
}
export function isPlainActivation(event: {button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean}): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
