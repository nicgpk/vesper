# V168 candidate: defer expensive offscreen gallery previews

Based on deployed v167 candidate. Performance follow-up authorized by root to Nic's lag report. No major visual redesign claimed.

The All gallery previously mounted every graphics/editor study immediately. Now only the eight existing `heavy`-marked studies are gated until their tile is near the viewport (400px margin) or explicitly requested. Lightweight studies and component-detail/deep-link routes remain immediate. Once mounted, a study is never unloaded just because the user scrolls away, preserving its local state.

A visible Load preview fallback is available. When the placeholder has keyboard focus it is not silently removed by the observer; explicit loading transfers focus into the real preview region. Leaving a focused placeholder allows pending near-viewport activation. Browsers without IntersectionObserver mount immediately as before. Observer teardown/stale callbacks and effect replay are guarded.

Passed: pure gate visibility/focus/manual/once-only/dispose/replay checks; SSR proving a heavy child is not invoked before activation; eight-heavy scope; source contracts for fallback/deep-link behavior; prior search/reset and navigation checks; standalone build with 107 routes and 228 component coverage.

Limits: no measured speedup or image-download reduction claimed. JS modules remain bundled. Initial Selected collection has no heavy studies, so this primarily improves All browsing. Browser mounting, GPU behavior, scroll geometry and focus have not been verified. Placeholder-to-content height can vary; actual layout shift must be checked in rendered testing. Existing build warnings unchanged. No concurrent deployment performed.
