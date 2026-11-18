/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Built Astryx CSS, React, and the native Vesper browser.
 * @output Standalone component previews mounted in the public page.
 * @position Vesper Pages client entry; independent of the Storybook runtime.
 */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/lab/lab.css';
import '@astryxdesign/charts/charts.css';
import '@astryxdesign/richtext/richtext.css';
import {App} from './App';

const root = document.getElementById('app');
if (!root) {
  throw new Error('The Vesper component browser needs its application root.');
}
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
