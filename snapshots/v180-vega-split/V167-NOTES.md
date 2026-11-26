# V167 candidate: visible, escapable collection filtering

Based on deployed v166 source candidate. Publisher and prior previews unchanged.

Concrete bug found: selecting a featured collection limited the gallery to three IDs, then typing a global component search changed scope/category but retained that hidden collection restriction. A valid search such as Calendar could incorrectly return no results.

- Nonempty global search now exits the featured collection.
- An active collection has a visible 'Viewing [collection]' context and 'Show all studies' reset.
- Reset clears collection/query/category and returns keyboard focus to the persistent collection heading.
- Responsive touch target and forced-color focus styling included.

Passed: actual extracted search/reset transition tests with setter spies, discovery/category tests, navigation pure/source/SSR test, standalone 107-route/228-component build. Navigation test was stale before this change: its pinned Preview equality now excludes only the pre-existing presentation data-study attribute, and the obsolete feature-link check now verifies the existing featured-filter button behavior. Production Preview behavior was not changed.

No mounted/browser visual verification; no large visual redesign claimed. This is a focused navigation clarity/correctness fix. Not deployed by this worker.
