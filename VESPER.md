# Vesper baseline

Vesper is a standalone design-system baseline built on [Astryx](https://github.com/facebook/astryx). Its starting commit is `f4984589e75e5543c187ecb7491d050c6bde691c`. The upstream MIT license, copyright notices, components, stories, documentation, and original Gothic theme are retained. New Vesper source carries MIT SPDX notices.

The Storybook explorer defaults to Vesper Dark. Its toolbar also offers Vesper Light, Vesper Contrast, and Original Gothic. Vesper themes inherit Gothic through Astryx's supported theme API; the original Gothic package is unchanged.

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
