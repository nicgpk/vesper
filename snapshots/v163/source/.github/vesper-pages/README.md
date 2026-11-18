# Vesper Pages

Vesper's GitHub Pages source is separate from `.github/pages`, which remains the
upstream compatibility page. Only `nicgpk/vesper` on `main` can run the new deploy
job. The upstream workflow explicitly excludes that repository. Local building
never deploys anything; enabling Pages with GitHub Actions is a repository-owner
step.

## Build

From the repository root, after installing with pnpm 11:

```sh
pnpm build
node --test scripts/build-vesper-pages.test.mjs
node scripts/build-vesper-pages.mjs
```

The ignored output is `local-baseline/vesper-pages/`. Serve that directory at `/`
or `/vesper/`; all assets resolve relative to that base. This is a native React
component browser, not a directory of links to another explorer. Every overview
tile contains the real component. Opening its title shows a larger interactive
preview, material notes, and copyable React usage without leaving the site.

`apps/storybook/vesper/site/demos.tsx` is the single registry for previews and
their metadata. `App.tsx` owns navigation, filtering, and theme selection.
Although these sources share a workspace with development stories, the public
bundle does not import Storybook, render frames, or depend on its build output.
The builder uses compiled public package exports and the compiled Astryx CSS.

The registry combines family modules and declares exact public-symbol `covers`
for each composition. The builder discovers the documented public inventory,
rejects missing, unknown, or duplicate coverage, and emits `coverage.json` and
`component-pages.json`. Each symbol has an addressable page even when compound
members share a genuinely rendered example. Usage snippets are excerpts of the
public composition, not complete copies of its local state or host adapters.

Every preview sits in a real, theme-aware Card: a separate translucent frost
plane backs the content in Light and Dark; Contrast stays opaque. The Card's
content container has no backdrop filter, so nested controls keep their own
glass rendering rather than sampling a flattened ancestor. Horizontal scrolling preserves wide examples
without clipping their controls. Document-fragment interactions inside previews
do not replace the site's hash route; application links use component routes.

Preview padding belongs inside the rounded scroll viewport, not outside it:
otherwise scroll clipping cuts off control shadows and focus rings. The backing
Card permits escaping paint while the viewport keeps a 24px inset and follows
the Card's radius. Only the photographed stage intentionally clips its backdrop.
The stage uses the page-radius token, the backing uses the container-radius
token, and controls keep their own element-radius tokens. Layout containment
keeps fixed-position demo UI local without adding a backdrop root.

`site/preview-layout.ts` assigns docs-only control, wide-content, and workspace
profiles to known examples. Dense editors, chats, tables, and charts get wider
detail canvases; workspaces use the available width and span the overview row.
Application shells run in bounded, rounded preview windows with real responsive
navigation rather than inheriting a full-viewport minimum height inside a card.
Compact detail stages use a smaller minimum height and grow with their contents.
Tables and schedules own their inner horizontal scrolling, leaving instructions
and status/reset actions stationary. Editor surfaces use opaque semantic backing
inside the glass Card so syntax remains readable. Notification verification includes
fresh direct navigation, because pre-warming a theme can hide first-load ink defects.

Docs resets live in a low-priority layer before library styles, so native
content-box sizing and proportional typography remain intact. Avatar elevation
paints on the root, not inside its image clip. Within native preview facepiles,
presence-bearing members paint above neighbors inside the group's isolation
boundary; this is local ordering, not a page-wide z-index rank.

Notifications use saturated solid primary fills for success, error, warning,
and info; neutral controls retain glass. Contrast uses its high-contrast palette.
The Banner example switches among all four statuses; Toast exposes its supported
info/error types. Nested provider examples follow page appearance by default
and switch themes only when explicitly requested within the example.

`--out <directory>` supports an isolated generated artifact.
Use a dedicated generated output directory, not a directory containing authored
files. The builder refuses repository ancestors and authored source directories.
Rebuilding removes known generated assets from the previous site, including its
old bundled explorer. It never modifies upstream `.github/pages` source.

## Appearance and assets

The build bundles `apps/storybook/themes/vesper.ts` using the built
public package exports (not source TS path aliases). Astryx `defineTheme` resolves
the inheritance; its resolved semantic and local material tokens generate
`theme.css`. The shell does not maintain a second palette or glass token table.
Light/Dark/Contrast preference persists in `vesper-pages-theme`; unavailable
storage does not prevent switching. Interactive previews require JavaScript,
and the shell includes a clear no-script message.

Metadata loads through native ESM in the application's package context, honoring
conditional import exports and asynchronous modules such as Vega. Generated
loader files are removed after loading; they are never shipped in the site.

`dunes.jpg` is copied locally from `apps/storybook/vesper/assets/dunes.jpg`.
The original image is https://images.unsplash.com/photo-1473580044384-7ba9967e16a0,
used under the [Unsplash License](https://unsplash.com/license). Its source and
license are also documented in the adjacent Storybook assets README. There are
no runtime CDN dependencies in the homepage.

Native links use `#/components` and `#/components/button`, so refresh and deep
links work on static Pages hosting without a server rewrite. The 404 page offers
explicit collection recovery while preserving queries and valid component
fragments; it never blanket-redirects URLs.

## Browser verification

With the artifact served at both `/` and `/vesper/` on a local origin:

```sh
pnpm exec tsc --noEmit -p apps/storybook/vesper/site/tsconfig.json
VESPER_PAGES_URL=http://127.0.0.1:4175 node .github/vesper-pages/verify-native.mjs
VESPER_PAGES_URL=http://127.0.0.1:4175 node .github/vesper-pages/verify-artifacts.mjs
node .github/vesper-pages/verify-compositions.mjs
node .github/vesper-pages/verify-deep-ui.mjs
node .github/vesper-pages/verify-dense-ui.mjs
node .github/vesper-pages/verify-time-ui.mjs
VESPER_PAGES_URL=http://127.0.0.1:4175 node .github/vesper-pages/verify-component-artifacts.mjs
VESPER_PAGES_URL=http://127.0.0.1:4175 node .github/vesper-pages/verify-notifications.mjs
```

The verifier uses installed Chrome. It checks both base paths, every registered
component detail in all three themes, actual stateful controls, theme persistence,
filtering/empty state, native history/deep links, mobile navigation/overflow,
blocked storage, and WCAG A/AA axe scans. Screenshots and JSON evidence go to
ignored `local-baseline/vesper-native-evidence/`. This verifier and this README
are not shipped in the Pages artifact.
