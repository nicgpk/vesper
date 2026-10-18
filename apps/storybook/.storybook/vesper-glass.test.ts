/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Vesper's shared glass material configuration.
 * @output Regression coverage for glass, native field corners and consistent bright semantic controls.
 * @position Local theme tests, independent of upstream theme styling.
 */
import {describe, expect, it} from 'vitest';
import {glassComponents, glassTokens, glassLocalTokens} from '../themes/glass';

describe('Vesper glass material', () => {
  it('uses the bright success palette for status indicators and semantic badges too', () => {
    expect(glassTokens['--color-success']).toBe(
      glassLocalTokens['--vesper-notification-success'],
    );
    expect(glassTokens['--color-on-success']).toBe('#FFFFFF');
    expect(glassComponents.badge?.['variant:success']).toMatchObject({
      backgroundColor: 'var(--color-success)',
      color: 'var(--color-on-success)',
    });
  });
  it('leaves connected field corners to native component rules', () => {
    for (const target of [
      'text-input',
      'time-input',
      'number-input',
      'selector',
      'multi-selector',
      'complex-selector',
      'input-group-text',
    ]) {
      expect(
        glassComponents[target]?.base?.borderRadius,
        target,
      ).toBeUndefined();
    }
  });
  it('brightens notification fills while preserving AA contrast with white ink', () => {
    const luminance = (hex: string) => {
      const rgb = [1, 3, 5].map(
        offset => parseInt(hex.slice(offset, offset + 2), 16) / 255,
      );
      const linear = rgb.map(value =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      );
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    };
    for (const [tone, previous] of [
      ['success', '#15803D'],
      ['error', '#D93443'],
      ['warning', '#A16207'],
      ['info', '#2563EB'],
    ] as const) {
      const current = luminance(
        glassLocalTokens[`--vesper-notification-${tone}`],
      );
      expect(current, tone).toBeGreaterThan(luminance(previous));
      expect(1.05 / (current + 0.05), tone).toBeGreaterThanOrEqual(4.5);
    }
    expect(glassLocalTokens['--vesper-notification-ink']).toBe('#FFFFFF');
  });
  it('uses primary semantic fills for notifications rather than muted tints', () => {
    for (const status of ['success', 'error', 'warning', 'info']) {
      const tone = status === 'info' ? 'accent' : status;
      expect(
        glassComponents.banner?.[`status:${status}`]?.backgroundColor,
      ).toBe(`var(--color-${tone})`);
    }
    expect(glassComponents.toast?.['type:info']?.backgroundColor).toBe(
      'var(--color-accent)',
    );
    expect(glassComponents.toast?.['type:error']?.backgroundColor).toBe(
      'var(--color-error)',
    );
  });
  it('paints avatar elevation outside the intentional image clip', () => {
    expect(glassComponents.avatar?.base?.boxShadow).toBe(
      'var(--vesper-glass-elevation)',
    );
    expect(glassComponents['avatar-fallback']?.base?.boxShadow).toBe(
      'var(--vesper-glass-inset)',
    );
  });
  it('does not paint triggers, inner listboxes, or unreachable composer frames', () => {
    for (const target of [
      'top-nav-menu',
      'top-nav-mega-menu',
      'typeahead-dropdown',
      'more-menu',
      'chat-composer',
    ]) {
      expect(glassComponents[target], target).toBeUndefined();
    }
  });

  it('extends glass to painted form controls without hiding validation', () => {
    for (const target of [
      'number-input',
      'date-input',
      'date-range-input',
      'date-time-input-date-segment',
      'date-time-input-time-segment',
      'time-input',
      'tokenizer',
      'typeahead',
    ]) {
      expect(glassComponents[target]?.base?.backdropFilter, target).toBe(
        'blur(12px) saturate(1.35)',
      );
      expect(
        glassComponents[target]?.['status:error']?.borderColor,
        target,
      ).toBe('var(--color-error)');
    }
  });

  it('does not turn transparent or categorical cards and ghost selectors into glass', () => {
    expect(glassComponents.card?.base?.backgroundColor).toBeUndefined();
    expect(glassComponents.card?.['variant:default']?.backgroundColor).toBe(
      'var(--vesper-glass-panel)',
    );
    expect(glassComponents.selector?.base?.backgroundColor).toBeUndefined();
    expect(glassComponents.selector?.['variant:input']?.backgroundColor).toBe(
      'var(--vesper-glass-fill)',
    );
  });
  it('keeps content inset from glass rims and avatar geometry inherited', () => {
    expect(glassComponents.collapsible?.base?.padding).toBe('var(--spacing-3)');
    expect(glassComponents['avatar-fallback']?.base?.borderRadius).toBe(
      'inherit',
    );
  });
  it('gives neutral actions a translucent, rim-lit surface', () => {
    expect(glassComponents.button?.['variant:secondary']).toMatchObject({
      backgroundColor: 'var(--vesper-glass-fill)',
      backdropFilter: 'blur(12px) saturate(1.35)',
      boxShadow: 'var(--vesper-glass-shadow)',
    });
    expect(glassTokens['--radius-element']).toBe('12px');
  });

  it('keeps primary and destructive actions opaque and legible', () => {
    expect(glassComponents.button?.['variant:primary']).toMatchObject({
      backgroundColor: 'var(--color-accent)',
      color: 'var(--color-on-accent)',
    });
    expect(glassComponents.button?.['variant:destructive']).toMatchObject({
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-on-error)',
    });
    expect(glassTokens['--color-on-accent']).toBe('#FFFFFF');
  });
});
