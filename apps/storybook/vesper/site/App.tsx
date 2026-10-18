/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Real component demos, native hash navigation, and Vesper appearance.
 * @output Component documentation with composition-aware widths and safe paint viewports.
 * @position Public showcase; local preview fragments stay separate from documentation routes.
 */
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {Card} from '@astryxdesign/core/Card';
import {LayerProvider} from '@astryxdesign/core/Layer';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {
  vesperLightTheme,
  vesperDarkTheme,
  vesperContrastTheme,
} from '../../themes/vesper';
import {demos, type Demo} from './demos';
import {componentLabel, componentSlug, getComponentPages} from './catalog';
import {getPreviewLayout} from './preview-layout';

const componentPages = getComponentPages(demos);

type Appearance = 'light' | 'dark' | 'contrast';
const themes = {
  light: vesperLightTheme,
  dark: vesperDarkTheme,
  contrast: vesperContrastTheme,
};
const initialAppearance = (): Appearance => {
  const value = document.documentElement.dataset.theme;
  return value === 'dark' || value === 'contrast' ? value : 'light';
};
const routeId = () => {
  const hash = window.location.hash;
  if (!hash || hash === '#/components' || hash === '#/components/') {
    return '';
  }
  const match = /^#\/components\/([^/]+)$/.exec(hash);
  try {
    return match ? decodeURIComponent(match[1]) : '__not-found__';
  } catch {
    return '__not-found__';
  }
};

function Navigation({
  active,
  query,
  onNavigate,
}: {
  active: string;
  query: string;
  onNavigate?: () => void;
}) {
  const visible = componentPages.filter(page =>
    `${page.symbol} ${page.label} ${page.demo.category} ${page.demo.description}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  return (
    <nav aria-label="Components">
      <a
        className={`nav-overview${active === '' ? ' is-active' : ''}`}
        href="#/components"
        onClick={onNavigate}
        aria-current={active === '' ? 'page' : undefined}>
        <span aria-hidden="true">▦</span> All components{' '}
        <span className="nav-count">{componentPages.length}</span>
      </a>
      <p className="nav-heading">COMPONENTS</p>
      <div className="nav-list">
        {visible.map(page => (
          <a
            key={page.id}
            href={`#/components/${page.id}`}
            onClick={onNavigate}
            className={active === page.id ? 'is-active' : undefined}
            aria-current={active === page.id ? 'page' : undefined}>
            {page.label}
          </a>
        ))}
      </div>
      {visible.length === 0 && <p className="nav-empty">No matches.</p>}
    </nav>
  );
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

function ComponentDetail({demo, symbol}: {demo: Demo; symbol?: string}) {
  const [copyStatus, setCopyStatus] = useState('');
  async function copyCode() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(demo.code);
      setCopyStatus('Copied');
    } catch {
      setCopyStatus('Copy unavailable. Select the code to copy.');
    }
  }
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">{demo.category}</p>
        <h1>{symbol ? componentLabel(symbol) : demo.name}</h1>
        <p className="lead">{demo.description}</p>
        {symbol && (
          <p className="usage-note">
            {symbol} is shown in context in the {demo.name} example. Related
            parts share the live composition and source.
          </p>
        )}
      </div>
      <section
        id="preview"
        className="detail-preview"
        aria-labelledby="preview-heading">
        <div className="section-line">
          <h2 id="preview-heading">Preview</h2>
          <span className="live-label">
            <span aria-hidden="true" />
            Live component
          </span>
        </div>
        <Preview demo={demo} detail />
      </section>
      <section
        id="material"
        className="detail-material"
        aria-labelledby="material-heading">
        <p className="eyebrow">THE MATERIAL</p>
        <h2 id="material-heading">On glass</h2>
        <p>{demo.material}</p>
        <p className="muted">
          The surface changes. Keyboard behavior, focus, and meaningful states
          stay with the original Astryx component.
        </p>
        <div
          className="component-members"
          aria-label="Components in this example">
          {(demo.covers || []).map(name => (
            <a key={name} href={`#/components/${componentSlug(name)}`}>
              {name}
            </a>
          ))}
        </div>
      </section>
      <section id="usage" aria-labelledby="usage-heading">
        <div className="section-line">
          <h2 id="usage-heading">React usage</h2>
          <button className="quiet-button" onClick={copyCode} type="button">
            Copy source <span aria-hidden="true">⧉</span>
          </button>
        </div>
        <div className="source-code">
          <div className="code-label">React · TSX</div>
          <pre tabIndex={0} role="region" aria-label="React usage source">
            <code>{demo.code}</code>
          </pre>
        </div>
        <p className="copy-status" role="status">
          {copyStatus}
        </p>
        <p className="usage-note">
          Import the component from Astryx and render it inside your Vesper
          Theme provider. Examples use the same components you are interacting
          with above.
        </p>
      </section>
      <a className="back-link" href="#/components">
        ← All components
      </a>
    </>
  );
}

export function App() {
  const [appearance, setAppearance] = useState<Appearance>(initialAppearance);
  const [active, setActive] = useState(routeId);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileNavRef = useRef<HTMLDetailsElement>(null);
  const initialRoute = useRef(true);
  const selectedPage = componentPages.find(page => page.id === active);
  const selected = demos.find(demo => demo.id === active) || selectedPage?.demo;
  const memberSymbol = !demos.some(demo => demo.id === active)
    ? selectedPage?.symbol
    : undefined;
  const visible = demos.filter(demo =>
    `${demo.name} ${demo.category} ${demo.description} ${(demo.covers || []).join(' ')}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  useEffect(() => {
    const navigate = () => setActive(routeId());
    window.addEventListener('hashchange', navigate);
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => {
      window.removeEventListener('hashchange', navigate);
      window.removeEventListener('keydown', shortcut);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
    document.documentElement.style.colorScheme =
      appearance === 'light' ? 'light' : 'dark';
    try {
      localStorage.setItem('vesper-pages-theme', appearance);
    } catch {
      /* Appearance still works when storage is unavailable. */
    }
  }, [appearance]);
  useEffect(() => {
    document.title = `${memberSymbol ? componentLabel(memberSymbol) : selected?.name || (active ? 'Component not found' : 'Components')} — Vesper`;
    if (mobileNavRef.current) {
      mobileNavRef.current.open = false;
    }
    if (initialRoute.current) {
      initialRoute.current = false;
      return;
    }
    document.getElementById('main-content')?.focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: 'instant'});
  }, [active, selected, memberSymbol]);
  return (
    <Theme
      theme={themes[appearance]}
      mode={appearance === 'light' ? 'light' : 'dark'}>
      <LayerProvider>
        <InternationalizationProvider locale="en" dir="ltr">
          <div className="docs-shell">
            <a
              className="skip"
              href="#main-content"
              onClick={event => {
                event.preventDefault();
                document.getElementById('main-content')?.focus();
              }}>
              Skip to content
            </a>
            <aside className="sidebar" aria-label="Component library">
              <a
                className="brand"
                href="#/components"
                aria-label="Vesper components">
                <span className="brand-orb" aria-hidden="true" />
                vesper<span className="brand-tag">design</span>
              </a>
              <div className="sidebar-rule" />
              <Navigation active={active} query={query} />
              <footer className="sidebar-footer">
                <a href="https://github.com/nicgpk/vesper">
                  Vesper on GitHub <span aria-hidden="true">↗</span>
                </a>
                <span>Built on Astryx</span>
              </footer>
            </aside>
            <div className="docs-body">
              <header className="topbar">
                <a className="mobile-brand" href="#/components">
                  vesper
                  <span className="brand-orb" aria-hidden="true" />
                </a>
                <div className="breadcrumb">
                  <a href="#/components">Components</a>
                  {active && (
                    <>
                      <span aria-hidden="true">/</span>
                      <span>
                        {memberSymbol
                          ? componentLabel(memberSymbol)
                          : selected?.name || 'Not found'}
                      </span>
                    </>
                  )}
                </div>
                <div className="search-box">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    aria-label="Search components"
                    placeholder="Search components…"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Escape') {
                        setQuery('');
                      }
                    }}
                    ref={searchRef}
                  />
                  <kbd>⌘ K</kbd>
                </div>
                <div className="topbar-tools">
                  <label className="appearance-label" htmlFor="appearance">
                    Appearance
                  </label>
                  <select
                    id="appearance"
                    aria-label="Appearance"
                    value={appearance}
                    onChange={event =>
                      setAppearance(event.target.value as Appearance)
                    }>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="contrast">Contrast</option>
                  </select>
                </div>
              </header>
              <div className="mobile-navigation-wrap">
                <details className="mobile-navigation" ref={mobileNavRef}>
                  <summary>
                    Browse components <span aria-hidden="true">⌄</span>
                  </summary>
                  <Navigation active={active} query={query} />
                </details>
              </div>
              <div className="content-layout">
                <main id="main-content" tabIndex={-1}>
                  {selected ? (
                    <ComponentDetail
                      key={selected.id}
                      demo={selected}
                      symbol={memberSymbol}
                    />
                  ) : active ? (
                    <section className="not-found">
                      <p className="eyebrow">404</p>
                      <h1>Component not found</h1>
                      <p>That example is not in this collection.</p>
                      <a className="back-link" href="#/components">
                        All components
                      </a>
                    </section>
                  ) : (
                    <>
                      <div className="page-heading">
                        <p className="eyebrow">THE COMPONENT COLLECTION</p>
                        <h1>Components</h1>
                        <p className="lead">
                          Every component, on a real backdrop.
                        </p>
                      </div>
                      <div className="introduction">
                        <p>
                          {componentPages.length} documented components across{' '}
                          {demos.length} live examples. Related parts are shown
                          together in context, on readable cards over the
                          backdrop.
                        </p>
                        <p>
                          Try every example right here. Open a component for a
                          closer look, the thinking behind its material, and
                          React source you can copy.
                        </p>
                      </div>
                      <aside className="material-note">
                        <span className="note-icon" aria-hidden="true">
                          i
                        </span>
                        <p>
                          Glass where it belongs. Selection, validation, and
                          data stay clear. Our material uses frosted blur—not
                          optical refraction.
                        </p>
                      </aside>
                      <div className="collection-toolbar">
                        <span className="collection-title">
                          Explore the collection
                        </span>
                        <p role="status">
                          {query
                            ? `${visible.length} of ${demos.length} examples`
                            : `${componentPages.length} components · ${demos.length} examples`}
                        </p>
                      </div>
                      {visible.length ? (
                        <section
                          className="component-grid"
                          aria-label="Live components">
                          {visible.map(demo => (
                            <article
                              className="component-tile"
                              data-demo-id={demo.id}
                              key={demo.id}>
                              <Preview demo={demo} />
                              <div className="tile-caption">
                                <a
                                  href={`#/components/${demo.id}`}
                                  aria-label={`View ${demo.name}`}>
                                  {demo.name}
                                  <span aria-hidden="true">↗</span>
                                </a>
                                <p>{demo.category}</p>
                              </div>
                            </article>
                          ))}
                        </section>
                      ) : (
                        <section className="empty-results">
                          <h2>No components found.</h2>
                          <p>
                            Try a different name or explore the full collection.
                          </p>
                          <button
                            className="quiet-button"
                            type="button"
                            onClick={() => {
                              setQuery('');
                              searchRef.current?.focus();
                            }}>
                            Clear search
                          </button>
                        </section>
                      )}
                      <section className="collection-footer" id="about">
                        <h2>A material, not a different way to interact.</h2>
                        <p>
                          These previews render the original Astryx React
                          components with Vesper's shared theme. Transparent
                          structure stays transparent. Meaningful states stay
                          meaningful. Contrast mode trades translucency for an
                          opaque, readable surface.
                        </p>
                        <a href="https://github.com/nicgpk/vesper">
                          Explore the source <span aria-hidden="true">↗</span>
                        </a>
                      </section>
                    </>
                  )}
                  <footer className="page-footer">
                    <span>Vesper · A softer expression of Astryx</span>
                    <a href="https://unsplash.com/license">
                      Backdrop: Unsplash ↗
                    </a>
                  </footer>
                </main>
                <aside className="page-toc" aria-label="On this page">
                  <p>On this page</p>
                  {selected ? (
                    <>
                      <a
                        href="#preview"
                        onClick={event => {
                          event.preventDefault();
                          document
                            .getElementById('preview')
                            ?.scrollIntoView({behavior: 'smooth'});
                        }}>
                        Preview
                      </a>
                      <a
                        href="#material"
                        onClick={event => {
                          event.preventDefault();
                          document
                            .getElementById('material')
                            ?.scrollIntoView({behavior: 'smooth'});
                        }}>
                        On glass
                      </a>
                      <a
                        href="#usage"
                        onClick={event => {
                          event.preventDefault();
                          document
                            .getElementById('usage')
                            ?.scrollIntoView({behavior: 'smooth'});
                        }}>
                        React usage
                      </a>
                    </>
                  ) : (
                    <>
                      <span className="toc-active">The collection</span>
                      <a
                        href="#about"
                        onClick={event => {
                          event.preventDefault();
                          document
                            .getElementById('about')
                            ?.scrollIntoView({behavior: 'smooth'});
                        }}>
                        About the material
                      </a>
                    </>
                  )}
                  <div className="toc-rule" />
                  <span className="toc-footnote">
                    Real components.
                    <br />
                    No replicas.
                  </span>
                </aside>
              </div>
            </div>
          </div>
        </InternationalizationProvider>
      </LayerProvider>
    </Theme>
  );
}
