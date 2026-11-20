# v169: matching component routes in family search

Base: v168. Focused discoverability change, not a visual leap.

Problem: exact searches for consolidated originals such as AvatarGroup or CheckboxList found the correct family but its default Person/Checkboxes preview. Users had to infer which renamed variant matched.

Change: preserve original variant names and native-symbol coverage as family metadata. Search results show `Matching components` links to matching original detail routes. Blank queries and broad category-only searches add no links. Cards remain consolidated; 95 visible studies,107 original routes,228 native pages. Links use existing origin-ref/navigation handling so the return path has a specific focus target. Native Preview unchanged.

Files: demos.tsx, StudyFamilies.tsx, gallery-model.ts, ExactGallery.tsx, exact-gallery.css; new test-family-search-matches.mjs.

Validation: matching routes/compact and spaced symbols/blank and category behavior/source navigation wiring; family/category coverage; navigation 26 assertions; standalone build success (107/228/228). Independent review passed with no blocking source regression; reviewer independently ran matching-search, family/category, navigation and global-search suites. No browser rendering/focus/wrapping proof. Known existing build warnings for public package StyleX side effects remain.

No deployment or sharing changes by this agent.
