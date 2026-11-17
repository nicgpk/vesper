# V79 checkpoint

This additive checkpoint preserves the current interactive gallery and its recovered native authoring tree. Existing repository code and branches are unchanged.

## Contents

- `hosted/`: all 13 deployed files, including the compiled application, styles, image and catalog data.
- `source/`: all 1,292 files of the recovered native authoring tree, including original implementations, explicit gallery adapters, standalone dependency lock and recovery receipts. Dependencies, caches and generated dist directories are not included.
- `SHA256SUMS.json`: complete source and hosted file inventory.

Original native source is pinned to commit `01ebdf616a14b5eaaea090762864eaad51327752`; original implementation files are distinguished from new shell/build adapters in the recovery receipts. The standalone scaffold is not the original full monorepo toolchain. Preserve the root repository's existing packages and tooling; this directory is an isolated checkpoint, not a replacement.

For the already-built gallery, run `python -m http.server --directory hosted 8000` here and open localhost:8000. The original native implementations cover 228 documented components through 100 demos. Source/build checks are documented in `source/EXACT-RECOVERY.md`; no browser, pixel-match, GPU or native focus/keyboard verification is claimed. This checkpoint does not alter publication or sharing.
