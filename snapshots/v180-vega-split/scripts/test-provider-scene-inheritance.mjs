import assert from 'node:assert/strict';import fs from 'node:fs';import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {providerRegionTheme,ProviderPreview} from './vesper/site/coreContentDemos';export {dunesPalettes} from './themes/dunes-palettes';export {createElement} from 'react';export {renderToString} from 'react-dom/server';export {Theme} from '@astryxdesign/core/theme';");
for(const scene of Object.keys(m.dunesPalettes))for(const mode of ['light','dark'])for(const override of [null,true,false]){const ambient=m.dunesPalettes[scene][mode];const target=m.providerRegionTheme(ambient.name,mode,override);assert.equal(target,m.dunesPalettes[scene][override===null?mode:override?'dark':'light']);}
assert.equal(m.providerRegionTheme('vesper-contrast','dark',null).name,'vesper-contrast');
for(const scene of Object.keys(m.dunesPalettes)){const t=m.dunesPalettes[scene];assert.equal(m.providerRegionTheme(t.contrast.name,'dark',null),t.contrast);assert.equal(m.providerRegionTheme(t.contrast.name,'dark',false),t.light);}
const html=m.renderToString(m.createElement(m.Theme,{theme:m.dunesPalettes.ocean.dark,mode:'dark'},m.createElement(m.ProviderPreview)));assert(html.includes('provider-region'));assert(html.includes('Use light region'));assert(html.includes('Localized selector'));assert(html.includes('Explore the layout composition'));
assert.doesNotMatch(html,/data-local-appearance/);
const css=fs.readFileSync('apps/storybook/vesper/site/provider-region.css','utf8');assert(css.includes('var(--vesper-glass-panel)'));assert(css.includes('prefers-reduced-transparency'));assert(css.includes('forced-colors'));
const defaultRule=css.match(/\.provider-region \{([^}]+)/)?.[1];
assert.ok(defaultRule);
assert.doesNotMatch(defaultRule,/background|border|backdrop-filter|shadow/);
assert.match(css,/\.provider-region\[data-local-appearance\] \{\s+background: var\(--vesper-glass-panel\)/);
const src=fs.readFileSync('apps/storybook/vesper/site/coreContentDemos.tsx','utf8');
assert.match(src,/padding=\{darkOverride === null \? 0 : 4\}/);
assert.match(src,/data-local-appearance=\{darkOverride === null \? undefined : dark \? 'dark' : 'light'\}/);
console.log('36 palette/mode/override checks, contrast following and Ocean provider SSR pass; no rendered contrast or geometry verification.');
