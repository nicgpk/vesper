# Vesper material verification

Vesper's theme owns the material, while Astryx continues to own component
structure, keyboard behavior, focus, and selection semantics. The sample uses
real controlled components, not painted replicas.

## Material boundaries

- Use glass on neutral painted controls and popup surfaces: text/number/date/time
  inputs, selector shells, tokenizer/typeahead shells, menus, popovers, hover
  cards, tooltips, dialogs, bottom sheets, and segmented rails.
- Keep value, status, and data encodings solid: primary/destructive actions,
  selected segments and toggles, checkbox/radio/switch indicators, chart marks,
  progress fills, status tokens, validation borders, and categorical card fills.
- Do not add a lens to labels, layout rows, table cells, icons, or every menu
  option. Compositions inherit the material from their painted child components.
- DateTimeInput's row is structural; its date and time segments own the glass.
  Ghost selectors and transparent cards remain unpainted. Selected cards retain
  a distinct accent ring.
- Contrast mode uses opaque neutral material tokens. Original Gothic is not
  changed.
- Keep reachability gaps explicit: ChatComposer's target is on a layout frame,
  not its opaque body. TopNav menu targets are triggers; the standard menu uses
  Popover, while the mega-menu's opaque inner panel has no public target. These
  surfaces are not made glass by painting their outer frame or trigger.
- Typeahead's inner listbox inherits its Popover lens rather than adding a
  second blurred panel.

## Browser commands

Start Storybook in development mode. An inherited `NODE_ENV=production` can
break React Fast Refresh, so use `NODE_ENV=development` in a POSIX shell when
necessary. All commands below run from the repository root.

```sh
node apps/storybook/vesper/verify.mjs http://localhost:6006
node apps/storybook/vesper/verify-semantics.mjs http://localhost:6006
node apps/storybook/vesper/audit-catalog.mjs http://localhost:6006 vesper-dark current
node apps/storybook/vesper/audit-catalog.mjs http://localhost:6006 vesper-light current
node apps/storybook/vesper/audit-catalog.mjs http://localhost:6006 vesper-contrast current
```

`verify.mjs` checks the expanded sample's controls, keyboard behavior, overlays,
and desktop/390px/320px layout. `verify-semantics.mjs` additionally opens actual
component stories to verify validation borders, categorical card colors, ghost
selectors, solid toggles, and popup material.

`audit-catalog.mjs` derives every story group from the running Storybook index.
It chooses Default, Basic, Overview, or Showcase when present, otherwise the
first indexed story. Each group receives a screenshot and a runtime/material
receipt. The index, JSONL results, screenshots, and counted summary are saved
under ignored `local-baseline/catalog/`. Interrupted runs resume from successful
groups and retry issue/failed groups; use a new run label for a fresh audit.

This is an exhaustive **group inventory and representative render sweep**, not
an exhaustive interaction test of every story variant. A collapsed overlay's
representative may show its trigger only; the focused surface checks open those
surfaces separately. Theme-comparison stories can intentionally provide their
own local theme instead of the selected global Vesper theme.

The material uses CSS backdrop blur and highlighted rims, not Liqui's optical
refraction engine. Compare actual viewport screenshots before reporting an
empty offscreen glass panel: Chromium full-page captures can omit composited
content that renders correctly after scrolling into view.
