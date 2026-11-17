/* SPDX-License-Identifier: MIT
 * Adapter changes ONLY gallery navigation/composition. Native Preview below is
 * copied verbatim from pinned App.tsx (01ebdf616a14b5eaaea090762864eaad51327752).
 * All interactive interiors remain the original demos and native dependencies.
 * Load original docs.css and preview.css, including dunes.jpg, before shell CSS.
 */
import {useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type KeyboardEvent as ReactKeyboardEvent} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {Card} from '@astryxdesign/core/Card';
import {LayerProvider} from '@astryxdesign/core/Layer';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {vesperLightTheme, vesperDarkTheme, vesperContrastTheme} from '../../themes/vesper';
import {demos, type Demo} from './demos';
import {getComponentPages} from './catalog';
import {getPreviewLayout} from './preview-layout';
import './exact-gallery.css';

type Appearance = 'light' | 'dark' | 'contrast';
const themes = {light: vesperLightTheme, dark: vesperDarkTheme, contrast: vesperContrastTheme};
const categories = ['All', ...Array.from(new Set(demos.map(demo => demo.category))).sort()];
const pages = getComponentPages(demos);
function selectedId() {
  const value = window.location.hash.match(/^#\/components\/([^/]+)$/)?.[1];
  try { return value ? decodeURIComponent(value) : ''; } catch { return ''; }
}
function Preview({demo, detail = false}: {demo: Demo; detail?: boolean}) {
  const Component = demo.Preview;
  const route = useRef<{href: string; state: unknown} | null>(null);
  function rememberRoute() {
    route.current = {href: window.location.href, state: window.history.state};
  }
  function containDocumentFragment(
    event: ReactMouseEvent<HTMLDivElement> | ReactKeyboardEvent<HTMLDivElement>,
  ) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if ('key' in event && event.key !== ' ' && event.key !== 'Spacebar') {
      return;
    }
    const anchor =
      event.target instanceof Element ? event.target.closest('a[href]') : null;
    const href = anchor?.getAttribute('href');
    if (!href?.startsWith('#') || href.startsWith('#/')) {
      return;
    }
    // Let native handlers run first (including Outline's controlled indicator),
    // but keep their document fragments from replacing the showcase hash route.
    const handled = event.defaultPrevented;
    event.preventDefault();
    if (route.current && window.location.href !== route.current.href) {
      window.history.replaceState(route.current.state, '', route.current.href);
    }
    if (!handled && href.length > 1) {
      event.currentTarget
        .querySelector<HTMLElement>(`#${CSS.escape(href.slice(1))}`)
        ?.focus();
    }
  }
  return (
    <div
      className={`demo-stage${detail ? ' is-detail' : ''}`}
      data-layout={getPreviewLayout(demo.id)}
      aria-label={`${demo.name} live preview`}>
      <div className="demo-content">
        <Card width="100%" padding={0} className="preview-backing">
          <div
            className="preview-scroll"
            role="region"
            aria-label={`${demo.name} preview content`}
            onClickCapture={rememberRoute}
            onKeyDownCapture={rememberRoute}
            onClick={containDocumentFragment}
            onKeyDown={containDocumentFragment}
            tabIndex={0}>
            <Component />
          </div>
        </Card>
      </div>
    </div>
  );
}


export function ExactGallery() {
  const [appearance, setAppearance] = useState<Appearance>(() => {
    const value = document.documentElement.dataset.theme;
    return value === 'light' || value === 'contrast' ? value : 'dark';
  });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [active, setActive] = useState(selectedId);
  const search = useRef<HTMLInputElement>(null);
  const selected = demos.find(demo => demo.id === active) ?? pages.find(page => page.id === active)?.demo;
  const visible = demos.filter(demo => (category === 'All' || demo.category === category) &&
    `${demo.name} ${demo.category} ${(demo.covers ?? []).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => {
    const navigate = () => setActive(selectedId());
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); search.current?.focus();
      }
    };
    window.addEventListener('hashchange', navigate);
    window.addEventListener('keydown', shortcut);
    return () => { window.removeEventListener('hashchange', navigate); window.removeEventListener('keydown', shortcut); };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
    document.documentElement.style.colorScheme = appearance === 'light' ? 'light' : 'dark';
  }, [appearance]);
  useEffect(() => { document.title = selected ? `${selected.name} · Interaction library` : 'Interaction library'; }, [selected]);
  return (
    <Theme theme={themes[appearance]} mode={appearance === 'light' ? 'light' : 'dark'}>
      <LayerProvider>
        <InternationalizationProvider locale="en" dir="ltr">
          <div className="exact-gallery-shell">
            <a className="exact-skip" href="#exact-main">Skip to collection</a>
            <header className="exact-header">
              <a className="exact-home" href="#/components" aria-label="Interaction library home">
                <span className="exact-mark" aria-hidden="true"><i/><i/><i/><i/></span>
                <span>Interactions</span>
              </a>
              <div className="exact-appearance" role="group" aria-label="Appearance">
                {(['light', 'dark', 'contrast'] as Appearance[]).map(mode => (
                  <button key={mode} type="button" aria-pressed={appearance === mode} onClick={() => setAppearance(mode)}>{mode[0].toUpperCase() + mode.slice(1)}</button>
                ))}
              </div>
            </header>
            <main id="exact-main" className="exact-main" tabIndex={-1}>
              <div className="exact-intro">
                {active ? <a className="exact-back" href="#/components">← Collection</a> : null}
                <h1>{selected?.name ?? (active ? 'Component not found' : 'Interaction studies.')}</h1>
                <p>{selected ? selected.category : 'Live controls. Clear states. Original interactions.'}</p>
              </div>
              {!active ? <>
                <div className="exact-collection-bar">
                  <h2>The collection <span>{demos.length} studies</span></h2>
                  <label className="exact-search"><span className="exact-sr">Find a component</span><input ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a component…"/><kbd>⌘ K</kbd></label>
                </div>
                <div className="exact-filter-row">
                  <div className="exact-filters" role="group" aria-label="Filter collection">{categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
                  <span className="exact-count" aria-live="polite">{visible.length} shown</span>
                </div>
                <div className="exact-grid">
                  {visible.map(demo => <article key={demo.id} className="component-tile exact-tile" data-exact-layout={getPreviewLayout(demo.id)}>
                    <Preview demo={demo}/>
                    <div className="exact-caption"><a href={`#/components/${demo.id}`}>{demo.name}<span aria-hidden="true">↗</span></a><span>{demo.category}</span></div>
                  </article>)}
                </div>
                {!visible.length ? <div className="exact-empty"><h2>No matches</h2><button type="button" onClick={() => {setQuery('');setCategory('All');search.current?.focus();}}>Clear filters</button></div> : null}
              </> : selected ? <section className="exact-detail detail-preview"><Preview demo={selected} detail/></section> : <a href="#/components">Return to the collection</a>}
            </main>
          </div>
        </InternationalizationProvider>
      </LayerProvider>
    </Theme>
  );
}
