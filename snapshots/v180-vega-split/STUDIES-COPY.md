# Studies copy standard

Write the interface as a real workspace. Give controls task names, describe what the user can do, and make waiting, empty, success, and error states useful.

Do not label component UI as a demo, sample, test, prototype, simulation, fixture, or illustration. Avoid equivalent copy about how a study was made. Use plausible project names, messages, values, and activity instead.

Do not invent live integrations, measurements, publication, uploads, billing, or persistence. The collection and detail pages state that the workspace uses built-in data and no live services. Keep a concise notice in the component where behavior could otherwise surprise someone: for example, where a message goes or whether a file is uploaded.

Run `node scripts/check-vesper-product-copy.mjs`. The standalone gallery build runs this check automatically; review new and changed interaction states as well.
