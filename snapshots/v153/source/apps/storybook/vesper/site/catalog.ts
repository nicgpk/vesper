/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Native examples and the public symbols each composition demonstrates.
 * @output Individually addressable component pages sharing their real family preview.
 * @position Native catalog routing; composition members are not fake standalone widgets.
 */
import type {Demo} from './demos';
export function componentSlug(symbol: string): string {
  return symbol
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}
export function componentLabel(symbol: string): string {
  return symbol
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}
export function getComponentPages(demos: Demo[]) {
  return demos
    .flatMap(demo =>
      (demo.covers || []).map(symbol => ({
        id: componentSlug(symbol),
        symbol,
        label: componentLabel(symbol),
        demo,
      })),
    )
    .sort((a, b) => a.symbol.localeCompare(b.symbol, 'en'));
}
