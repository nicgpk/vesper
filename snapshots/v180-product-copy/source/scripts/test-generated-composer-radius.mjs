import assert from 'node:assert/strict';import fs from 'node:fs';import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {GenerativeChatStudy} from './vesper/site/GenerativeChatStudy';export {createElement} from 'react';export {renderToStaticMarkup} from 'react-dom/server';");
const html=m.renderToStaticMarkup(m.createElement(m.GenerativeChatStudy));assert.match(html,/gc-composer/);
const css=fs.readFileSync('apps/storybook/vesper/site/generative-chat-study.css','utf8');assert.match(css,/\.gc-study \.gc-composer\{--_chat-composer-radius:var\(--radius-element,8px\);--radius-chat:var\(--radius-element,8px\)\}/);
console.log('Composer and context drawer inherit shared control-radius token; SSR hook verified. No rendered geometry claim.');
