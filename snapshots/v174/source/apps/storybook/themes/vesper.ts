/* eslint-disable @astryx/copyright-header -- Original Vesper extension; upstream notices remain in reused source. */
// SPDX-License-Identifier: MIT
// Vesper-owned local themes. Original Gothic source remains unchanged.
/**
 * @input Supported Astryx theme inheritance and Vesper's glass material.
 * @output Glass Dark/Light with bright success signals and an opaque accessible Contrast palette.
 * @position Local explorer theme authoring; no upstream theme replacement.
 */
import {
  defineTheme,
  defineSyntaxTheme,
  type DefineThemeInput,
} from '@astryxdesign/core/theme';
import {gothicTheme} from '@astryxdesign/theme-gothic';
import {glassComponents, glassLocalTokens, glassTokens} from './glass';

type Tokens = NonNullable<DefineThemeInput['tokens']>;
const light: Tokens = {
  ...glassTokens,
  '--color-background-body': '#F3EEE5',
  '--color-background-surface': '#F3EEE5',
  '--color-background-card': '#FFFCF7',
  '--color-background-popover': '#FFFCF7',
  '--color-background-muted': '#E4DCCF',
  '--color-background-inverted': '#101314',
  '--color-text-primary': '#29241F',
  '--color-text-secondary': '#64594F',
  '--color-text-disabled': '#7B8084',
  '--color-text-accent': '#2563EB',
  '--color-icon-primary': '#171C20',
  '--color-icon-secondary': '#495056',
  '--color-icon-disabled': '#7B8084',
  '--color-icon-accent': '#2563EB',
  '--color-accent': '#2563EB',
  '--color-accent-muted': '#2563EB1A',
  '--color-on-accent': '#FFFFFF',
  '--color-on-dark': '#FAF8F3',
  '--color-on-light': '#171C20',
  '--color-neutral': '#171C2014',
  '--color-overlay': '#101314B3',
  '--color-overlay-hover': '#171C2010',
  '--color-overlay-pressed': '#171C2020',
  '--color-border': '#18181B26',
  '--color-border-emphasized': '#495056',
  '--focus-outline-color': '#2563EB',
  '--color-success-muted': '#DCE8D4',
  '--color-error': '#D93443',
  '--color-error-muted': '#F0DDE0',
  '--color-warning': '#725310',
  '--color-warning-muted': '#F1E7C5',
  '--color-on-success': '#FFFFFF',
  '--color-on-error': '#FFFFFF',
  '--color-on-warning': '#FFFFFF',
  '--color-background-error-inverted': '#873C43',
  '--color-skeleton': '#C0BCB5',
  '--color-shadow': '#10131426',
  '--color-tint-hover': 'black',
  '--shadow-inset-hover': 'inset 0 0 0 1px #495056',
  '--shadow-inset-selected': 'inset 0 0 0 2px #233B50',
  '--shadow-inset-warning': 'inset 0 0 0 1px #725310',
  '--shadow-inset-error': 'inset 0 0 0 1px #873C43',
};

const contrast: Tokens = {
  '--color-background-body': '#080B0D',
  '--color-background-surface': '#080B0D',
  '--color-background-card': '#11181D',
  '--color-background-popover': '#182228',
  '--color-background-muted': '#182228',
  '--color-background-inverted': '#FFFFFF',
  '--color-text-primary': '#FFFFFF',
  '--color-text-secondary': '#CFD9DF',
  '--color-text-disabled': '#7E8991',
  '--color-text-accent': '#E8F1F6',
  '--color-icon-primary': '#FFFFFF',
  '--color-icon-secondary': '#CFD9DF',
  '--color-icon-disabled': '#7E8991',
  '--color-icon-accent': '#E8F1F6',
  '--color-accent': '#E8F1F6',
  '--color-accent-muted': '#E8F1F630',
  '--color-on-accent': '#080B0D',
  '--color-on-dark': '#FFFFFF',
  '--color-on-light': '#080B0D',
  '--color-neutral': '#CFD9DF30',
  '--color-overlay': '#080B0DE6',
  '--color-overlay-hover': '#FFFFFF20',
  '--color-overlay-pressed': '#FFFFFF33',
  '--color-border': '#8D9BA5',
  '--color-border-emphasized': '#CFD9DF',
  '--focus-outline-color': '#FFE39A',
  '--focus-outline-width': '3px',
  '--color-success': '#C5E6A7',
  '--color-success-muted': '#C5E6A7',
  '--color-error': '#FFD1D0',
  '--color-error-muted': '#FFD1D0',
  '--color-warning': '#FFE39A',
  '--color-warning-muted': '#FFE39A',
  '--color-on-success': '#162315',
  '--color-on-error': '#381A19',
  '--color-on-warning': '#302409',
  '--color-background-error-inverted': '#873C43',
  '--color-skeleton': '#7E8991',
  '--shadow-inset-hover': 'inset 0 0 0 1px #CFD9DF',
  '--shadow-inset-selected': 'inset 0 0 0 2px #FFE39A',
  '--shadow-inset-success': 'inset 0 0 0 1px #C5E6A7',
  '--shadow-inset-warning': 'inset 0 0 0 1px #FFE39A',
  '--shadow-inset-error': 'inset 0 0 0 1px #FFD1D0',
};

// Categorical surfaces always carry paired foregrounds. Chart colors are
// independently tuned against plot surfaces; labels/patterns remain necessary.
const categories = {
  blue: ['#DDE5F3', '#253957', '#C6DBFF', '#172D4E'],
  cyan: ['#D9E9EF', '#214759', '#BAE7F7', '#133A4C'],
  gray: ['#E6E2DA', '#30373C', '#303C45', '#FFFFFF'],
  green: ['#DCE8D4', '#2B4727', '#C5E6A7', '#162F15'],
  orange: ['#F0E0CE', '#673712', '#FFDBAD', '#4D290B'],
  pink: ['#EFDBE3', '#68253F', '#FFD1E1', '#51152C'],
  purple: ['#E7DDED', '#482454', '#E6CEFF', '#321442'],
  red: ['#F0DDE0', '#742E34', '#FFD1D0', '#381A19'],
  teal: ['#D7E9E1', '#1E493D', '#B9EBDA', '#10392C'],
  yellow: ['#F1E7C5', '#624910', '#FFE39A', '#302409'],
} as const;
for (const [name, [lightBg, lightFg, darkBg, darkFg]] of Object.entries(
  categories,
)) {
  for (const [tokens, bg, fg] of [
    [light, lightBg, lightFg],
    [contrast, darkBg, darkFg],
  ] as const) {
    Object.assign(tokens, {
      [`--color-background-${name}`]: bg,
      [`--color-border-${name}`]: fg,
      [`--color-text-${name}`]: fg,
      [`--color-icon-${name}`]: fg,
    });
  }
}
const charts = {
  blue: ['#30527C', '#B5D6FF'],
  orange: ['#8A4D18', '#FFD0A0'],
  purple: ['#68447D', '#DFC3FF'],
  green: ['#3F6335', '#BEE79D'],
  pink: ['#8C4268', '#FFBEDA'],
  cyan: ['#276277', '#A8E4F7'],
  red: ['#96404A', '#FFB8BB'],
  teal: ['#276456', '#A3E8D0'],
  brown: ['#775537', '#E8CAA5'],
  indigo: ['#4B538B', '#C3CAFF'],
} as const;
for (const [name, [lightColor, darkColor]] of Object.entries(charts)) {
  Object.assign(light, {[`--color-data-categorical-${name}`]: lightColor});
  Object.assign(contrast, {[`--color-data-categorical-${name}`]: darkColor});
}
light['--color-data-neutral'] = '#5C656D';
contrast['--color-data-neutral'] = '#CFD9DF';

const lightSyntax = defineSyntaxTheme({
  name: 'vesper-light',
  tokens: {
    keyword: '#68447D',
    string: '#31552C',
    comment: '#495056',
    number: '#725310',
    function: '#30527C',
    type: '#68447D',
    variable: '#171C20',
    operator: '#495056',
    constant: '#725310',
    tag: '#873C43',
    attribute: '#276456',
    property: '#30527C',
    punctuation: '#495056',
    background: '#FAF8F3',
  },
});
const contrastSyntax = defineSyntaxTheme({
  name: 'vesper-contrast',
  tokens: {
    keyword: '#DFC3FF',
    string: '#BEE79D',
    comment: '#CFD9DF',
    number: '#FFE39A',
    function: '#B5D6FF',
    type: '#DFC3FF',
    variable: '#FFFFFF',
    operator: '#CFD9DF',
    constant: '#FFD0A0',
    tag: '#FFB8BB',
    attribute: '#A3E8D0',
    property: '#A8E4F7',
    punctuation: '#CFD9DF',
    background: '#080B0D',
  },
});

const materialTheme = defineTheme({
  name: 'vesper-material',
  extends: gothicTheme,
  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'Inter',
      fallbacks: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    heading: {
      family: 'Inter',
      fallbacks: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    code: {family: 'ui-monospace', fallbacks: 'Consolas, monospace'},
  },
  motion: {fast: 150, medium: 250, slow: 400, ratio: 0.75},
  tokens: glassTokens,
  localTokens: glassLocalTokens,
  components: glassComponents,
});

export const vesperDarkTheme = defineTheme({
  name: 'vesper-dark',
  extends: materialTheme,
  localTokens: {'--vesper-glass-fill': '#302B2666', '--vesper-glass-panel': '#302B26CC', '--vesper-backdrop': '#1B1917'},
  tokens: {
    '--color-background-body': '#1B1917',
    '--color-background-surface': '#24211E',
    '--color-background-card': '#302B26',
    '--color-background-popover': '#39322B',
    '--color-background-muted': '#FFFFFF12',
    '--color-text-primary': '#F5EFE5',
    '--color-text-secondary': '#C7BDB0',
    '--color-text-disabled': '#7D828C',
    '--color-icon-primary': '#F5EFE5',
    '--color-icon-secondary': '#C7BDB0',
    '--color-neutral': '#FFFFFF18',
    '--color-accent-muted': '#2563EB33',
    '--color-text-accent': '#91B9FF',
    '--color-icon-accent': '#91B9FF',
    '--color-text-pink': '#682039',
    '--color-icon-pink': '#682039',
    '--color-text-yellow': '#624910',
    '--color-icon-yellow': '#624910',
    '--color-data-categorical-purple': '#A58ADA',
    '--color-syntax-comment': '#96A0AB',
    '--color-border': '#FFFFFF26',
    '--color-border-emphasized': '#A1A1AA',
  },
});
export const vesperLightTheme = defineTheme({
  name: 'vesper-light',
  extends: materialTheme,
  localTokens: {'--vesper-glass-fill': '#FFFCF745', '--vesper-glass-panel': '#F3EEE5B8', '--vesper-backdrop': '#E4DCCF'},
  tokens: light,
  syntax: lightSyntax,
  onDark: {tokens: contrast},
  onLight: {tokens: light},
  components: {
    button: {'variant:destructive': {color: 'var(--color-on-error)'}},
  },
});
export const vesperContrastTheme = defineTheme({
  name: 'vesper-contrast',
  extends: materialTheme,
  tokens: contrast,
  syntax: contrastSyntax,
  onDark: {tokens: contrast},
  onLight: {tokens: light},
  localTokens: {
    ...glassLocalTokens,
    '--vesper-glass-fill': '#11181D',
    '--vesper-progress-track': '#303C45',
    '--vesper-glass-panel': '#11181D',
    '--vesper-glass-rim': '#8D9BA5',
    '--vesper-glass-gradient': 'none',
    '--vesper-glass-shadow': 'none',
    '--vesper-glass-inset': 'none',
    '--vesper-glass-elevation': 'none',
    '--vesper-notification-success': 'var(--color-success)',
    '--vesper-notification-error': 'var(--color-error)',
    '--vesper-notification-warning': 'var(--color-warning)',
    '--vesper-notification-info': 'var(--color-accent)',
    '--vesper-notification-ink': 'var(--color-on-accent)',
  },
  components: {
    button: {
      'variant:secondary': {
        borderColor: 'var(--color-border)',
        borderWidth: '1px',
        borderStyle: 'solid',
      },
    },
    card: {
      base: {
        borderColor: 'var(--color-border)',
        borderWidth: '1px',
        borderStyle: 'solid',
      },
    },
  },
});
