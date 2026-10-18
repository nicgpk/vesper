# Vesper baseline

Vesper is a standalone design-system baseline built on [Astryx](https://github.com/facebook/astryx). Its starting commit is `f4984589e75e5543c187ecb7491d050c6bde691c`. The upstream MIT license, copyright notices, components, stories, documentation, and original Gothic theme are retained. New Vesper source carries MIT SPDX notices.

The Storybook explorer defaults to Vesper Dark. Its toolbar also offers Vesper Light, Vesper Contrast, and Original Gothic. Vesper themes inherit Gothic through Astryx's supported theme API; the original Gothic package is unchanged.

## Glass component preview

Vesper Light and Dark use a Liqui-inspired frosted material: translucent neutral
surfaces, highlighted inset rims, soft shadows, 12px control corners, compact
sans-serif typography, and solid blue accent actions. Destructive actions and
value-bearing controls remain solid. Vesper Contrast uses opaque surfaces and
strong boundaries instead. These are local theme overrides, not changes to the
upstream components or Original Gothic.

The Overview story is an interactive gallery of 18 component categories,
including buttons, text/number/date inputs, text areas, switches, checkboxes,
single/multi-selectors, sliders, tabs, segmented controls, accordions, menus,
popovers, dialogs, progress, and avatars. Its photographic backdrop is bundled locally; attribution lives
in `apps/storybook/vesper/assets/README.md`.

The material uses CSS backdrop blur rather than Liqui's displacement-map
refraction engine. It aims for similar surfaces and visual hierarchy, not an
identical optical simulation.

With Storybook running, verify the gallery in Chrome:

```sh
node apps/storybook/vesper/verify.mjs http://localhost:6006
```

This checks controls, keyboard interactions, dialog focus restoration, all three
Vesper themes, and 390px/320px layouts. Screenshots and its JSON receipt go to
ignored `local-baseline/glass/`. Theme configuration tests run with
`pnpm exec vitest run apps/storybook/.storybook/vesper-glass.test.ts --project node`.

The material also reaches the matching painted surfaces across the Storybook
catalog. Ghost selectors, transparent/categorical cards, solid value indicators,
validation borders, data marks, and structural layout components retain their
own semantics. See `apps/storybook/vesper/README.md` for the complete catalog
render-sweep and focused semantic-regression commands.

## Public component browser

The Pages demo is a native component collection inspired by Liqui's documentation
layout: sidebar navigation, photographed live previews, and individual component
pages with material notes and copyable React source. Visitors interact directly
with the components rather than opening Storybook.

The collection covers 228 documented public components and composition parts
across 100 live examples, including core, lab, chat, charts, rich text, and Vega.
Every symbol has a component page; related parts share a working composition.
Each preview has a readable, theme-aware Card backing: independently frosted in
Light and Dark, opaque in Contrast. The content layer stays transparent so the
components retain their own glass. Stage, Card, and control corners follow the
page/container/element radius tokens. The build
derives the inventory from public documentation/exports and rejects missing,
unknown, or duplicate coverage instead of trusting a manually maintained count.

After building the public packages, run `node scripts/build-vesper-pages.mjs`
and serve `local-baseline/vesper-pages/`. The site supports root and `/vesper/`
hosting with hash-based deep links. Light, Dark, and Contrast use the same Vesper
themes as the development explorer. No Storybook build or runtime is needed by
the public demo. See `.github/vesper-pages/README.md` for build and browser checks.

## Run locally

Use the Node version in `.nvmrc` and the exact package manager in `package.json` (`packageManager`). Install the pinned pnpm version using your existing package-manager setup, then run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

Open `http://localhost:6006/?path=/story/core-themes-vesper--overview` for themes or `http://localhost:6006/?path=/story/core-themes-vesper-conversations--demo-flow` for Conversations.

## Conversations

`apps/storybook/vesper/conversations/index.ts` exports local, importable Conversation, Message, StreamingText, Composer, RunStatus, and ToolCall compositions. They reuse Astryx's chat primitives. These exports are not a separately published package.

The event reducer uses app-owned message, run, tool, and event IDs. It deduplicates events, rejects stale runs, preserves partial output on stop, and retries with fresh IDs without duplicating the user message. The demo uses deterministic local events; it needs no model API, backend, credentials, or network requests. Sound is optional and off by default. Reduced motion has a static streaming alternative.

## Verification

The Windows baseline passed aggregate package and Storybook builds, Storybook TypeScript, changed-file ESLint and formatting, and 136 affected tests across nine suites. Browser checks covered all three Vesper themes, keyboard dialog behavior, keyboard chat submission, stop/error/retry, narrow layouts, long-history scroll behavior, reduced motion, and unavailable audio.

The opaque sampled text and graphics pairs passed the measured contrast thresholds. These checks do not certify every chart ramp, series adjacency, or component state. Sound audibility was not evaluated.

Two pre-existing Storybook tree assertions fail for upstream story naming and grouping. The entire repository suite and release CI are not claimed green. Desktop screenshots and runtime records stay in ignored `local-baseline/` and are not part of the source distribution.

Windows fixes normalize Babel/Vite library paths so core styles retain their intended priority, invoke TypeScript directly with Node in a unique native temporary directory when synchronizing CLI declarations, and normalize CLI structure-check paths to match the existing recorded gaps. New violations and stale gap entries still fail the check.

## Cloud setup candidate

In the current [Codex Cloud environment flow](https://learn.chatgpt.com/docs/environments/cloud-environments), select this repository and ask setup to validate the Vesper branch. Set Node from `.nvmrc` and install the exact pnpm version declared by `packageManager`, then use:

```sh
pnpm install --frozen-lockfile
pnpm build
```

The same build initializes the workspace packages needed by tests. Keep the frozen lockfile and repository dependency-script policy. The local demo requires no secrets. This recipe is prepared for cloud validation; it has not been executed in a cloud environment.

Personal desktop Codex instructions and agent configuration are outside this repository and are not transferred by cloning it. Preserve the canonical repository `AGENTS.md`; configure any cloud team separately using supported environment capabilities.

Inherited upstream GitHub workflows include release and deployment automation. Review the destination's Actions settings before making this branch its default or pushing to `main`; the baseline does not authorize publishing packages or deploying sites.
