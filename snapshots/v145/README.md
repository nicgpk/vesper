# V145 checkpoint

Additive checkpoint of the latest native interactive gallery, including Dunes, Ocean and Forest scene themes. Existing repository packages, workflows, history and v79 are unchanged.

- hosted/: exact compiled gallery and delivered artwork.
- source/: native components, adapters, themes, tests, scripts, lockfiles and original artwork. Dependencies, generated dist, temporary audits and operational review notes are excluded.
- SHA256SUMS.json: exact file integrity inventory.

This isolated checkpoint does not replace the root monorepo toolchain. Serve hosted/ with a static server. Source uses the included standalone dependency lock and requires local package builds before scripts/build-exact-gallery.mjs.

Validation: nature-theme source/VM checks, 48 opaque color pairs (minimum 5.36:1), planner and spacing contracts, seven catalog/native tests and full gallery build passed. The rebuild matches hosted/ byte-for-byte. Existing React key-spread and StyleX side-effect warnings remain. Browser pixels, composited transparency, GPU behavior, native wrapping and focus are not verified.

No public deployment or sharing change is included.
