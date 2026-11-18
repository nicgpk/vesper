// SPDX-License-Identifier: MIT
/* global document, matchMedia, localStorage */
/** @input Stored appearance preference. @output Valid initial theme before paint. @position Pages head bootstrap. */
(() => {
  let theme = matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  try {
    const stored = localStorage.getItem('vesper-pages-theme');
    if (['light', 'dark', 'contrast'].includes(stored)) theme = stored;
  } catch {
    /* Storage may be unavailable in private or sandboxed contexts. */
  }
  document.documentElement.dataset.theme = theme;
  let palette='sand';
  try {const value=localStorage.getItem('vesper-nature-theme');if(['sand','ocean','forest'].includes(value))palette=value;} catch {}
  document.documentElement.dataset.palette=palette;
})();
