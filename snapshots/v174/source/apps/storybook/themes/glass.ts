/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Astryx's public theme targets and Vesper-local material tokens.
 * @output Native-corner glass controls, spaced reactions and consistent bright success signals.
 * @position Vesper theme material, never a replacement for component behavior.
 */
import type {DefineThemeInput} from '@astryxdesign/core/theme';

export const glassTokens: NonNullable<DefineThemeInput['tokens']> = {
  '--radius-inner': '6px',
  '--radius-element': '12px',
  '--radius-container': '18px',
  '--radius-page': '24px',
  '--color-accent': '#2563EB',
  '--color-text-accent': '#2563EB',
  '--color-icon-accent': '#2563EB',
  '--color-on-accent': '#FFFFFF',
  '--color-success': '#00883E',
  '--color-on-success': '#FFFFFF',
  '--shadow-inset-success': 'inset 0 0 0 1px #00883E',
  '--color-error': '#D93443',
  '--color-on-error': '#FFFFFF',
  '--focus-outline-color': '#2563EB',
  '--focus-outline-width': '2px',
  '--focus-outline-offset': '3px',
};

export const glassLocalTokens = {
  '--vesper-notification-success': '#00883E',
  '--vesper-notification-error': '#E12B3C',
  '--vesper-notification-warning': '#BD5900',
  '--vesper-notification-info': '#3569F3',
  '--vesper-notification-ink': '#FFFFFF',
  '--vesper-glass-inset':
    'inset 0 1px 1px #FFFFFFB3, inset 0 -1px 1px #FFFFFF26, inset 1px 0 1px #FFFFFF40',
  '--vesper-glass-elevation': '0 2px 5px #00000018, 0 8px 24px #00000012',
  '--vesper-glass-fill': 'light-dark(#FFFFFF45, #20252D66)',
  '--vesper-glass-panel': 'light-dark(#F9FAFBB8, #20252DCC)',
  '--vesper-glass-rim': 'light-dark(#FFFFFFB3, #FFFFFF40)',
  '--vesper-glass-shadow':
    'inset 0 1px 1px #FFFFFFB3, inset 0 -1px 1px #FFFFFF26, inset 1px 0 1px #FFFFFF40, 0 2px 5px #00000018, 0 8px 24px #00000012',
  '--vesper-glass-gradient':
    'linear-gradient(155deg, #FFFFFF30 0%, #FFFFFF05 45%, #FFFFFF0A 100%)',
  '--vesper-backdrop': 'light-dark(#DEE3E5, #111820)',
};

const glass = {
  backgroundColor: 'var(--vesper-glass-fill)',
  backgroundImage: 'var(--vesper-glass-gradient)',
  backdropFilter: 'blur(12px) saturate(1.35)',
  borderColor: 'var(--vesper-glass-rim)',
  borderStyle: 'solid',
  borderWidth: '1px',
  boxShadow: 'var(--vesper-glass-shadow)',
};
const panel = {
  ...glass,
  backgroundColor: 'var(--vesper-glass-panel)',
  backdropFilter: 'blur(24px) saturate(1.4)',
};

export const glassComponents: NonNullable<DefineThemeInput['components']> = {
  button: {
    base: {
      // The radius token already styles standalone buttons. Let native group
      // corner rules win instead of flattening them with another shorthand.
      fontSize: '13px',
      fontWeight: '600',
      transitionDuration: '150ms',
    },
    'variant:secondary': {
      ...glass,
      color: 'var(--color-text-primary)',
    },
    'variant:primary': {
      backgroundColor: 'var(--color-accent)',
      color: 'var(--color-on-accent)',
      boxShadow: '0 2px 5px #00000014',
    },
    'variant:destructive': {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-on-error)',
    },
  },
  'text-input': {base: glass},
  'text-area': {base: glass},
  selector: {
    'variant:input': glass,
  },
  'input-group-text': {base: glass},
  badge: {
    'variant:success': {
      backgroundColor: 'var(--color-success)',
      color: 'var(--color-on-success)',
    },
  },
  'selector-popup': {base: {...panel, borderRadius: 'var(--radius-container)'}},
  popover: {base: {...panel, borderRadius: 'var(--radius-container)'}},
  'chat-reaction-bar': {
    // Bubble metadata intentionally pulls inward; reactions need their own
    // clearance rather than changing spacing for timestamps and other metadata.
    base: {marginBlockStart: 'var(--spacing-2)'},
  },
  dialog: {base: {...panel, borderRadius: 'var(--radius-page)'}},
  card: {
    base: {borderRadius: 'var(--radius-container)'},
    'variant:default': panel,
  },
  'selectable-card': {
    'selected:true': {
      boxShadow:
        'inset 0 0 0 2px var(--color-accent), var(--vesper-glass-shadow)',
    },
  },
  collapsible: {
    base: {
      ...glass,
      borderRadius: 'var(--radius-container)',
      padding: 'var(--spacing-3)',
    },
  },
  'collapsible-trigger': {base: {fontSize: '13px', fontWeight: '600'}},
  'tab-strip': {
    base: {...glass, borderRadius: 'var(--radius-element)', padding: '4px'},
  },
  tab: {
    base: {borderRadius: '8px', fontSize: '13px'},
    selected: {
      backgroundColor: 'var(--color-accent)',
      color: 'var(--color-on-accent)',
    },
  },
  'tab-indicator': {base: {backgroundColor: 'transparent'}},
  'switch-thumb': {
    base: {backgroundColor: '#FFFFFF', boxShadow: '0 1px 4px #00000030'},
  },
  'slider-thumb': {
    base: {backgroundColor: '#FFFFFF', boxShadow: '0 1px 4px #00000030'},
  },
  avatar: {base: {boxShadow: 'var(--vesper-glass-elevation)'}},
  'avatar-fallback': {
    base: {
      ...glass,
      color: 'var(--color-text-primary)',
      borderRadius: 'inherit',
      boxShadow: 'var(--vesper-glass-inset)',
    },
  },
  text: {
    'type:display-1': {fontFamily: 'var(--font-family-body)'},
    'type:display-2': {fontFamily: 'var(--font-family-body)'},
    'type:display-3': {fontFamily: 'var(--font-family-body)'},
  },
};

// These targets own the painted control, not labels, groups, or value glyphs.
// DateTimeInput's root is a layout row: only its two segments are surfaces.
const inputTargets = [
  'text-input',
  'text-area',
  'number-input',
  'date-input',
  'date-range-input',
  'date-time-input-date-segment',
  'date-time-input-time-segment',
  'time-input',
  'tokenizer',
  'typeahead',
] as const;
const validation = {
  'status:error': {borderColor: 'var(--color-error)'},
  'status:warning': {borderColor: 'var(--color-warning)'},
  'status:success': {borderColor: 'var(--color-success)'},
};
for (const target of inputTargets) {
  glassComponents[target] = {
    base: glass,
    ...validation,
  };
}
for (const target of [
  'selector',
  'multi-selector',
  'complex-selector',
] as const) {
  glassComponents[target] = {
    'variant:input': glass,
    ...validation,
  };
}

// A lens belongs on the popup itself, never each action or option row.
// Typeahead's inner listbox inherits Popover. TopNav targets are triggers,
// and the mega-menu's opaque inner panel is not publicly theme-reachable.
for (const target of [
  'selector-popup',
  'multi-selector-popup',
  'complex-selector-popup',
  'dropdown-menu',
  'context-menu',
  'hover-card',
  'tab-menu-dropdown',
  'breadcrumb-menu',
] as const) {
  glassComponents[target] = {
    base: {
      ...panel,
      borderRadius: 'var(--radius-container)',
      color: 'var(--color-text-primary)',
    },
  };
}
glassComponents.tooltip = {
  base: {
    ...panel,
    borderRadius: 'var(--radius-element)',
    color: 'light-dark(var(--color-on-light), var(--color-on-dark))',
  },
};
// Status notifications use solid primary fills, not glass or muted tints.
glassComponents.banner = {};
glassComponents['banner-icon'] = {};
for (const status of ['success', 'error', 'warning', 'info'] as const) {
  const tone = status === 'info' ? 'accent' : status;
  const foreground = 'var(--vesper-notification-ink)';
  glassComponents.banner[`status:${status}`] = {
    [`--color-${tone}`]: `var(--vesper-notification-${status})`,
    backgroundColor: `var(--color-${tone})`,
    color: foreground,
    '--color-text-primary': foreground,
    '--color-text-secondary': foreground,
  };
  glassComponents['banner-icon'][`status:${status}`] = {color: foreground};
}
glassComponents.toast = {
  base: {
    color: 'var(--vesper-notification-ink)',
    '--color-text-primary': 'var(--vesper-notification-ink)',
    '--color-text-secondary': 'var(--vesper-notification-ink)',
    '--color-icon-primary': 'var(--vesper-notification-ink)',
    '--color-icon-secondary': 'var(--vesper-notification-ink)',
  },
  'type:info': {
    backgroundColor: 'var(--color-accent)',
    '--color-accent': 'var(--vesper-notification-info)',
  },
  'type:error': {
    backgroundColor: 'var(--color-error)',
    '--color-error': 'var(--vesper-notification-error)',
  },
};
glassComponents['bottom-sheet'] = {
  base: {
    ...panel,
    borderTopLeftRadius: 'var(--radius-page)',
    borderTopRightRadius: 'var(--radius-page)',
  },
};
// ChatComposer's target is an outer layout frame; its opaque body is not a
// public target. Do not add a misleading second lens around that body.
glassComponents['segmented-control'] = {
  base: {...glass},
};
glassComponents['segmented-control-item'] = {
  // Keep the selected fill concentric with the outer track, including its
  // glass border. A fixed inner radius diverges when size/theme tokens change.
  base: {borderRadius: 'max(0px, calc(var(--_segmented-control-radius) - var(--_segmented-control-padding) - 1px))'},
  selected: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
};
// Toggles communicate a value. Strip inherited secondary-button glass rather
// than building a lens that changes the meaning of its selected fill.
glassComponents['toggle-button'] = {
  base: {backgroundImage: 'none', backdropFilter: 'none', boxShadow: 'none'},
  'isPressed:true': {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
};

// Progress tracks are not status-field surfaces: keep the arc distinguishable.
glassComponents['circular-progress-track']={base:{stroke:'var(--vesper-progress-track, var(--color-track))'}};
glassComponents['circular-progress-fill']={'variant:accent':{stroke:'var(--color-text-accent)'}};
