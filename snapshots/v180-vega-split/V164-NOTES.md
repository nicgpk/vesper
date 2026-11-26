# V164 candidate: document reading sequence

User evidence: Nic asked for visually stronger loading states, small appropriately sized loading elements, white broad shimmer, and clearer tool feedback. This scoped pass improves Document shimmer only, not the entire gallery.

- The existing bare document status now has a compact three-section Studio brief sheet.
- A broad white sheen tracks one active section. Completed sections receive a check; copy remains readable in all phases.
- The document demonstration uses six seconds to make the sequence observable. It is still authored local simulation, not actual model reading.
- Source selection, cancellation, retry, archive failure and recovery remain intact. Unavailable archive copy no longer narrates a successful read.
- Radius uses the shared 8px control token. Reduced motion, reduced transparency and forced-colors fallbacks included.

Verification: focused document phase/SSR test, loading reducer/recovery, reading visibility/density/scale, shimmer contracts, study family/discovery and native SSR/bundle tests pass. Build reports 107 routes and full 228-component coverage. Browser geometry, animation appearance, composited contrast and mounted interactions unverified. Existing build warnings about ignored bare StyleX imports and native key spread remain. Legacy cube shimmer review script could not run due to hardcoded missing /tmp/vesper-v93-native input; unchanged cube source was not modified.

Changes are isolated from frozen v163 in vesper-v164-candidate. No GitHub mutation or sharing change. Private deployment pending coordination with the active publisher.
