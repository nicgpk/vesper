# V165 candidate: source-specific evidence previews

Built on isolated v164 candidate; frozen v163 and live publisher source untouched.

Nic's screenshot shows identical decorative sparklines for the Research and Analytics source cards, alongside his requests for stronger tool feedback, meaningful interactions, and less filler. This pass replaces the decorative lines with actual authored content structures:

- Research source: two clearly labeled authored observation excerpts.
- Analytics source: a labeled illustrative funnel using the same 120 starts, 84 reviews, 72 completions already in the underlying tool result.
- Waiting, reading and stopped states retain source-specific shaped placeholders. Only actively reading shapes shimmer white.
- Retry keeps completed research evidence visible while recovering metrics.
- Unavailable source displays recovery guidance instead of a decorative chart.
- Narrow viewport source cards stack, with reduced-motion and forced-colors fallbacks.
- Dead sparkline styles removed; prior lifecycle test updated to the new presentation contract.

Tests passed: source evidence SSR in every state, retained results/partial/retry/cancel/stale events, tool presentation SSR, v164 document reading suite, and all 107 native previews SSR. Build coverage is unchanged at 107 routes and 228 native components.

Not live AI or live data. No browser rendering or mounted interaction verification. Exact geometry/animation/contrast remain unverified. Build retains existing StyleX side-effect warnings and native JSX key-spread warning.

Publication pending coordination. Do not call this deployed, visually verified, or a complete gallery redesign.
