# Vesper Studies: v180 + product copy

This snapshot preserves the recovered v180 workbench and its subsequent gallery improvements, including Image material, scenic themes, compact chat loading, clearer tool progress, and the gallery-wide copy pass. It is a standalone source checkpoint, not a replacement for the root app or the GitHub Pages build.

## Build locally

From this snapshot's `source/` directory with Node.js and npm:

```sh
npm ci --ignore-scripts
mkdir -p node_modules/@astryxdesign
for p in core lab charts richtext vega; do
  ln -s "../../packages/$p" "node_modules/@astryxdesign/$p"
done
ln -s ../../packages/themes/gothic node_modules/@astryxdesign/theme-gothic
node scripts/build-exact-gallery.mjs --out local-baseline/v180-product-copy
```

The build contains 109 studies and 228 component coverage entries.
