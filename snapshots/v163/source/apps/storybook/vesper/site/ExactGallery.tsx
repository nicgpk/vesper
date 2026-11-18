/* SPDX-License-Identifier: MIT
 * Adapter changes ONLY gallery navigation/composition. Native Preview below is
 * copied verbatim from pinned App.tsx (01ebdf616a14b5eaaea090762864eaad51327752).
 * Native controls are preserved; six chat compositions are refined and loading studies added.
 * Load original docs.css and preview.css, including dunes.jpg, before shell CSS.
 */
import {useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type KeyboardEvent as ReactKeyboardEvent} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {Card} from '@astryxdesign/core/Card';
import {Selector} from '@astryxdesign/core/Selector';
import {LayerProvider} from '@astryxdesign/core/Layer';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {dunesPalettes, paletteNames, validPalette, type DunesPalette} from '../../themes/dunes-palettes';
import type {Demo} from './demos';
import {libraryDemos as demos} from './library-demos';
import {getComponentPages} from './catalog';
import {getPreviewLayout} from './study-preview-layout';
import './exact-gallery.css';
import {bentoSpans} from './bento-layout';
import './gallery-spacing.css';
import {routeFocus, isPlainActivation} from './gallery-navigation';
import './dunes-theme.css';
import {discover, featureLinks, type DiscoveryScope} from './gallery-model';

type Appearance = 'light' | 'dark' | 'contrast';

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
      data-study={demo.id}
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
  const [palette,setPalette]=useState<DunesPalette>(()=>validPalette(document.documentElement.dataset.palette));
  useEffect(()=>{document.documentElement.dataset.palette=palette;try{localStorage.setItem('vesper-nature-theme',palette);}catch{}},[palette]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [scope, setScope] = useState<DiscoveryScope>('featured');
  const [featureGroup,setFeatureGroup]=useState<string|null>(null);
  const [active, setActive] = useState(selectedId);
  const search = useRef<HTMLInputElement>(null);
  const main = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousRoute = useRef(active);
  const requestSearch = useRef(false);
  const originKey = useRef<string | null>(null);
  const originLinks = useRef(new Map<string, HTMLAnchorElement>());
  function originRef(key: string, element: HTMLAnchorElement | null) {
    if (element) originLinks.current.set(key, element);
    else originLinks.current.delete(key);
  }
  function rememberOrigin(key: string, event: ReactMouseEvent<HTMLAnchorElement>) {
    if (isPlainActivation(event)) originKey.current = key;
  }
  const selected = demos.find(demo => demo.id === active) ?? pages.find(page => page.id === active)?.demo;
  const featureSelection=featureLinks.find(item=>item.id===featureGroup);
  const visible = discover(demos, scope, category, query).filter(item=>!featureSelection||(featureSelection.ids as readonly string[]).includes(item.id));
  const desktopSpans=bentoSpans(visible,6);
  const largeSpans=bentoSpans(visible,3), mediumSpans=bentoSpans(visible,2);
  useEffect(() => {
    const navigate = () => setActive(selectedId());
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (search.current) {search.current.focus();return;}
        requestSearch.current = true;
        window.location.hash = '#/components';
      }
    };
    window.addEventListener('hashchange', navigate);
    window.addEventListener('keydown', shortcut);
    return () => { window.removeEventListener('hashchange', navigate); window.removeEventListener('keydown', shortcut); };
  }, []);
  useEffect(() => {
    const origin = originKey.current ? originLinks.current.get(originKey.current) : undefined;
    const target = routeFocus(previousRoute.current, active, requestSearch.current, Boolean(origin));
    previousRoute.current = active;
    if (target === 'none') return;
    if (target === 'search') {requestSearch.current = false;search.current?.focus();}
    else if (target === 'origin') origin?.focus();
    else heading.current?.focus();
  }, [active]);
  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
    document.documentElement.style.colorScheme = appearance === 'light' ? 'light' : 'dark';
  }, [appearance]);
  useEffect(() => { document.title = selected ? `${selected.name} · Interaction library` : 'Interaction library'; }, [selected]);
  return (
    <Theme theme={dunesPalettes[palette][appearance]} mode={appearance === 'light' ? 'light' : 'dark'}>
      <LayerProvider>
        <InternationalizationProvider locale="en" dir="ltr">
          <div className="exact-gallery-shell" data-art={palette==='sand'?'dunes':palette}>
            <a className="exact-skip" href="#exact-main" onClick={event => {event.preventDefault();main.current?.focus();}}>Skip to content</a>
            <header className="exact-header">
              <a className="exact-home" href="#/components" aria-label="Studies home">
                <svg className="exact-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 3a13 13 0 0 1 11.26 19.5M27.26 22.5A13 13 0 0 1 4.74 22.5M4.74 22.5A13 13 0 0 1 16 3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="18 10"/><circle cx="16" cy="16" r="4" fill="currentColor"/></svg>
                <span>Studies</span>
              </a>
              <div className="exact-appearance" role="group" aria-label="Appearance">
                {(['light', 'dark', 'contrast'] as Appearance[]).map(mode => (
                  <button key={mode} type="button" aria-pressed={appearance === mode} onClick={() => setAppearance(mode)}>{mode[0].toUpperCase() + mode.slice(1)}</button>
                ))}
              </div>
            </header>
            <main ref={main} id="exact-main" className="exact-main" tabIndex={-1}>
              <div className="exact-intro">
                {active ? <a className="exact-back" href="#/components">← Collection</a> : null}
                <h1 ref={heading} tabIndex={-1}>{selected?.name ?? (active ? 'Component not found' : 'Interaction studies.')}</h1>
                <p>{selected ? selected.category : 'An interaction library, in living color.'}</p>
              </div>
              {!active ? <>
                <nav className="exact-feature-strip" aria-label="Featured studies">
                  {featureLinks.map(feature => <button type="button" className="exact-feature" key={feature.id} aria-pressed={featureGroup===feature.id} onClick={()=>{setFeatureGroup(feature.id);setScope('all');setCategory('All');setQuery('');document.getElementById('collection-heading')?.focus();}}>
                    <img src={`assets/${feature.art}-768.webp`} srcSet={`assets/${feature.art}-384.webp 384w, assets/${feature.art}-768.webp 768w, assets/${feature.art}.webp 1536w`} sizes="(max-width:680px) calc(100vw - 32px), (max-width:1040px) 31vw, 380px" loading={feature.id===featureLinks[0].id?"eager":"lazy"} fetchPriority={feature.id===featureLinks[0].id?"high":"auto"} alt="" width="1536" height="1024" decoding="async"/>
                    <span className="exact-feature-copy"><span className="exact-feature-label">{feature.label}</span><strong>{feature.title}</strong><span className="exact-feature-count">{feature.ids.filter(id=>demos.some(demo=>demo.id===id)).length} studies</span></span>
                    <span className="exact-feature-arrow" aria-hidden="true">↓</span>
                  </button>)}
                </nav>
                <div className="exact-collection-bar">
                  <h2 id="collection-heading" tabIndex={-1} className="docs-section-heading">{featureSelection?.title??'The collection'} <span>{featureSelection?visible.length:discover(demos,'all','All','').length} studies</span></h2>
                  <div className="dunes-palettes" role="group" aria-label="Nature theme">{paletteNames.map(name=><button key={name} type="button" aria-pressed={palette===name} onClick={()=>setPalette(name)} disabled={appearance==='contrast'}><span className={`dunes-swatch dunes-swatch-${name}`} aria-hidden="true"/>{name==='sand'?'Dunes':name[0].toUpperCase()+name.slice(1)}</button>)}</div>
                  <label className="exact-search"><span className="exact-sr">Find a component</span><input ref={search} type="search" value={query} onChange={event => {setQuery(event.target.value);if (event.target.value.trim()) {setScope('all');setCategory('All');}}} placeholder="Find a component…"/><kbd>⌘ K</kbd></label>
                </div>
                <div className="exact-discovery-row">
                  <div className="exact-scopes" role="group" aria-label="Browse studies">
                    {([{id: 'featured', label: 'Selected'}, {id: 'all', label: `All ${discover(demos,'all','All','').length}`}, {id: 'chat', label: 'Chat & tools'}, {id: 'loading', label: 'Loading'}] as const).map(item => <button key={item.id} type="button" aria-pressed={!featureSelection&&scope === item.id} onClick={() => {setFeatureGroup(null);setScope(item.id);setCategory('All');setQuery('');}}>{item.label}</button>)}
                  </div>
                  {scope === 'all'&&!featureSelection ? <div className="exact-category-picker"><Selector label="Category" value={category} onChange={setCategory} options={categories.map(item => ({value: item, label: item === 'All' ? 'All categories' : item}))}/></div> : null}
                  <span className="exact-count" aria-live="polite">{visible.length} shown</span>
                </div>
                <div className="exact-grid">
                  {visible.map((demo,index) => <article key={demo.id} className="component-tile exact-tile" data-exact-layout={getPreviewLayout(demo.id)} data-span-desktop={desktopSpans[index]} data-span-large={largeSpans[index]} data-span-medium={mediumSpans[index]}>
                    <Preview demo={demo}/>
                    <div className="exact-caption"><a ref={element => originRef(`tile:${demo.id}`, element)} onClick={event => rememberOrigin(`tile:${demo.id}`, event)} href={`#/components/${demo.id}`}>{demo.name}<span aria-hidden="true">↗</span></a><span>{demo.category}</span></div>
                  </article>)}
                </div>
                {!visible.length ? <div className="exact-empty"><h2 className="docs-section-heading">No matches</h2><button type="button" onClick={() => {setFeatureGroup(null);setQuery('');setCategory('All');setScope('all');search.current?.focus();}}>Clear filters</button></div> : null}
              </> : selected ? <section className="exact-detail detail-preview"><Preview demo={selected} detail/></section> : <a href="#/components">Return to the collection</a>}
            </main>
          </div>
        </InternationalizationProvider>
      </LayerProvider>
    </Theme>
  );
}
