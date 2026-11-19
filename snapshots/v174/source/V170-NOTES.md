# v170: preserve native editing shortcuts

Base v169. Interaction correctness only, not a visual redesign.

The gallery's window-level Ctrl/Meta K listener previously prevented the key and could return from a component detail to search even while editing in an input, code editor, rich text or composer. It also ignored already-handled events.

The listener now respects defaultPrevented, composition input and Alt/Shift combinations. It checks the event's composed path for input/textarea/select, contenteditable, textbox and combobox surfaces. Those keep their native keyboard behavior. Ctrl/Meta K outside editing retains the existing focus-search or detail-to-search flow. No package control, gallery route or original Preview changes.

Files: gallery-navigation.ts, ExactGallery.tsx; new test-gallery-shortcut-boundaries.mjs.

Validation: pure boundary tests plus execution of actual shortcut handler with DOM-boundary mocks proves no preventDefault/focus/navigation during editing, and preserved focus/navigation outside it. Existing navigation and family-search suites pass. Standalone build succeeds:107 routes,228 documented/covered symbols. Independent review pending. Real browser editor shortcuts/focus remain unverified.

No source publication/deployment by this agent.
