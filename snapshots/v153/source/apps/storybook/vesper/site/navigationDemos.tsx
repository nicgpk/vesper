/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Public built Astryx navigation APIs and the surrounding Vesper providers.
 * @output Stateful navigation previews with end-aligned actions and two-tier product navigation.
 * @position Vesper component catalog extension; no Storybook or private CSS overrides.
 */
import {useId, useState, useReducer} from 'react';
import {moreReducer,initialMore} from './more-menu-state';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {MobileNav, MobileNavToggle} from '@astryxdesign/core/MobileNav';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {NavHeadingMenu, NavHeadingMenuItem} from '@astryxdesign/core/NavMenu';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Outline} from '@astryxdesign/core/Outline';
import {OverflowList} from '@astryxdesign/core/OverflowList';
import {Pagination} from '@astryxdesign/core/Pagination';
import {
  SideNav,
  SideNavCollapseButton,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {TabList, Tab, TabMenu} from '@astryxdesign/core/TabList';
import {
  TopNav,
  TopNavHeading,
  TopNavItem,
  TopNavMenu,
  TopNavMegaMenu,
  TopNavMegaMenuItem,
  TopNavMegaMenuFeaturedCard,
} from '@astryxdesign/core/TopNav';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {Demo} from './demos';

function SideNavigationPreview() {
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState('Overview');
  const [workspace, setWorkspace] = useState('Design studio');
  const collapsible = {
    isCollapsed: collapsed,
    onCollapsedChange: setCollapsed,
    hasButton: false,
  };
  return (
    <div className="demo-stack">
      <SideNav
        collapsible={collapsible}
        header={
          <SideNavHeading
            heading="Studio"
            subheading={workspace}
            menu={
              <NavHeadingMenu>
                <NavHeadingMenuItem
                  label="Design studio"
                  onClick={() => setWorkspace('Design studio')}
                />
                <NavHeadingMenuItem
                  label="Research lab"
                  onClick={() => setWorkspace('Research lab')}
                />
              </NavHeadingMenu>
            }
          />
        }
        footerIcons={<SideNavCollapseButton />}>
        <SideNavSection title="Workspace">
          <SideNavItem
            label="Overview"
            icon="viewColumns"
            isSelected={page === 'Overview'}
            onClick={() => setPage('Overview')}
          />
          <SideNavItem label="Collections" icon="menu" collapsible>
            <SideNavItem
              label="Materials"
              isSelected={page === 'Materials'}
              onClick={() => setPage('Materials')}
            />
            <SideNavItem
              label="Patterns"
              isSelected={page === 'Patterns'}
              onClick={() => setPage('Patterns')}
            />
          </SideNavItem>
          <SideNavItem
            label="Settings"
            icon="wrench"
            isSelected={page === 'Settings'}
            onClick={() => setPage('Settings')}
          />
          <SideNavItem label="Unavailable" isDisabled />
        </SideNavSection>
      </SideNav>
      <p className="demo-result" role="status">
        {workspace} · {page} ·{' '}
        {collapsed ? 'Collapsed rail' : 'Expanded navigation'}
      </p>
    </div>
  );
}

export const mobileWorkspaceInitial = {open:false,destination:'Overview',compact:false};
export function mobileWorkspaceReducer(state:typeof mobileWorkspaceInitial, action:{type:string;value?:boolean;destination?:string}) {
  if(action.type==='open') return {...state,open:!!action.value};
  if(action.type==='navigate' && ['Overview','Collections','Settings'].includes(action.destination || '')) return {...state,destination:action.destination!,open:false};
  if(action.type==='density') return {...state,compact:!!action.value};
  return state;
}
export function MobileWorkspaceContent({destination,compact,onDensity}:{destination:string;compact:boolean;onDensity:(compact:boolean)=>void}) {
  const headingId=useId();
  return <section className="demo-stack" aria-labelledby={headingId}>
    <h3 id={headingId} className="demo-label">{destination}</h3>
    {destination==='Overview' ? <><p className="demo-copy">2 of 3 documents ready</p><p className="demo-copy">Next: review the onboarding flow.</p><WorkspaceRows view="activity" compact={compact}/></> :
      destination==='Collections' ? <><p className="demo-copy">Review collection · 3 documents</p><WorkspaceRows view="overview" compact={compact}/></> :
      <><div className="demo-row" role="group" aria-label="Content spacing"><Button label="Comfortable" variant={!compact?'primary':'secondary'} aria-pressed={!compact} onClick={()=>onDensity(false)}/><Button label="Compact" variant={compact?'primary':'secondary'} aria-pressed={compact} onClick={()=>onDensity(true)}/></div><WorkspaceRows view="overview" compact={compact}/><p className="demo-copy">Spacing stays selected across views.</p></>}
    <small className="demo-copy">Local review content</small>
  </section>;
}
export function MobileNavigationPreview() {
  const [state,dispatch]=useReducer(mobileWorkspaceReducer,mobileWorkspaceInitial);
  return <div className="demo-stack">
    <AppShell className="preview-app-shell" height="fill" variant="surface" contentPadding={3}
      topNav={<div className="demo-row"><MobileNavToggle label="Open navigation"/><span className="demo-label">Review workspace</span></div>}
      mobileNav={{hasToggle:false,breakpoint:'2xl',isOpen:state.open,onOpenChange:value=>dispatch({type:'open',value}),content:
        <MobileNav header="Review workspace"><div className="demo-stack">{['Overview','Collections','Settings'].map(label=><Button key={label} label={label} variant={state.destination===label?'secondary':'ghost'} aria-current={state.destination===label?'page':undefined} onClick={()=>dispatch({type:'navigate',destination:label})}/>)}</div></MobileNav>}}>
      <MobileWorkspaceContent destination={state.destination} compact={state.compact} onDensity={value=>dispatch({type:'density',value})}/>
    </AppShell>
    <p className="demo-copy" role="status">{state.destination} · {state.compact?'Compact':'Comfortable'} spacing</p>
    <small className="demo-copy">Navigation follows viewport width, not card width.</small>
  </div>;
}

function TopNavigationPreview() {
  const [page, setPage] = useState('Overview');
  return (
    <div className="demo-stack">
      <TopNav
        label="Product navigation"
        heading={
          <TopNavHeading
            heading="Studio"
            logo={<NavIcon icon={<Icon icon="viewColumns" />} />}
          />
        }
        endContent={
          <TopNavMenu
            label="Resources"
            items={[
              {
                title: 'Documentation',
                description: 'Guides and component APIs',
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true">
                    <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6" />
                  </svg>
                ),
                onClick: () => setPage('Documentation'),
              },
              {
                title: 'Changelog',
                description: 'Recent product updates',
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                ),
                onClick: () => setPage('Changelog'),
              },
            ]}
          />
        }
      />
      <nav aria-label="Workspace destinations">
        <OverflowList
          minVisibleItems={0}
          overflowRenderer={hidden => (
            <MoreMenu
              label="More workspace destinations"
              alignment="end"
              items={hidden.map(item => ({
                label: ['Overview', 'Library'][item.index],
                onClick: () => setPage(['Overview', 'Library'][item.index]),
              }))}
            />
          )}>
          {['Overview', 'Library'].map(label => (
            <TopNavItem
              key={label}
              label={label}
              href="#"
              isSelected={page === label}
              onClick={event => {
                event.preventDefault();
                setPage(label);
              }}
            />
          ))}
        </OverflowList>
      </nav>
      <p className="demo-result" role="status">
        Local destination: {page}
      </p>
      <p className="demo-copy">
        Open Resources for guides and updates. Workspace destinations
        stay on a separate row.
      </p>
    </div>
  );
}

function MegaNavigationPreview() {
  const [destination, setDestination] = useState('Choose a product');
  const [open, setOpen] = useState(false);
  return (
    <div className="demo-stack">
      <TopNav
        label="Product navigation"
        heading={<TopNavHeading heading="Studio" />}
        startContent={
          <TopNavMegaMenu
            label="Products"
            onOpenChange={setOpen}
            items={
              <>
                <TopNavMegaMenuItem
                  title="Materials"
                  description="Explore surface and color foundations."
                  icon={<Icon icon="menu" />}
                  onClick={() => setDestination('Materials')}
                />
                <TopNavMegaMenuItem
                  title="Patterns"
                  description="Compose accessible product experiences."
                  icon={<Icon icon="wrench" />}
                  onClick={() => setDestination('Patterns')}
                />
              </>
            }
            featured={
              <TopNavMegaMenuFeaturedCard
                title="Build your workspace"
                description="Start with native components and keep their interactions intact.">
                <Button
                  label="Explore starter"
                  onClick={() => setDestination('Starter guide')}
                />
              </TopNavMegaMenuFeaturedCard>
            }
          />
        }
      />
      <p className="demo-result" role="status">
        {open ? 'Products menu open' : 'Products menu closed'} · {destination}
      </p>
      <p className="demo-copy">
        Open Products to reveal both rich items and the featured card. The
        mega-menu target styles its trigger; the panel is a separate native
        surface.
      </p>
    </div>
  );
}

export function MoreActionsPreview() {
 const [state,dispatch]=useReducer(moreReducer,initialMore);
 return <div className="demo-stack">
  <div className="demo-row"><strong className="demo-label">Material collection</strong>
   <MoreMenu label="Material collection actions" alignment="end" items={[
    {label:'Duplicate collection',isDisabled:state.copied,onClick:()=>dispatch({type:'duplicate'})},
    {label:state.pinned?'Unpin collection':'Pin collection',isDisabled:state.archived,onClick:()=>dispatch({type:'pin'})},
    {label:state.archived?'Restore collection':'Archive collection',onClick:()=>dispatch({type:'archive'})},
   ]}/>
  </div>
  <dl className="demo-stack" style={{margin:0,gap:4}}><dt>Location</dt><dd style={{margin:0}}>{state.archived?'Archive':'Workspace'}{state.pinned?' · Pinned':''}</dd></dl>
  {state.copied&&<div className="demo-row"><span>Material collection copy · Workspace</span><Button label="Remove copy" variant="ghost" onClick={()=>dispatch({type:'remove-copy'})}/></div>}
  <p className="demo-result" role="status">{state.notice}</p>
  <small className="demo-copy">Changes stay on this page.</small>
 </div>;
}

function OverflowNavigationPreview() {
  const labels = [
    'Overview',
    'Materials',
    'Patterns',
    'Tokens',
    'Accessibility',
  ];
  const [selected, setSelected] = useState('Overview');
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="demo-stack">
      <OverflowList
        minVisibleItems={1}
        maxVisibleItems={expanded ? 5 : 2}
        overflowRenderer={hidden => (
          <MoreMenu
            label={`${hidden.length} more destinations`}
            items={hidden.map(item => ({
              label: labels[item.index],
              onClick: () => setSelected(labels[item.index]),
            }))}
          />
        )}>
        {labels.map(label => (
          <Button
            key={label}
            label={label}
            variant={label === selected ? 'primary' : 'ghost'}
            onClick={() => setSelected(label)}
          />
        ))}
      </OverflowList>
      <Button
        label={expanded ? 'Limit to two visible items' : 'Allow all five items'}
        variant="secondary"
        onClick={() => setExpanded(!expanded)}
      />
      <p className="demo-result" role="status">
        Local destination: {selected}. Items also collapse automatically when
        the row is narrow.
      </p>
    </div>
  );
}

export const reviewWorkspace = {
  documents: [{name:'Design brief',detail:'Ready'}, {name:'Onboarding flow',detail:'In review'}, {name:'Review notes',detail:'Ready'}],
  activity: [{name:'09:00 · Brief prepared',detail:'Design brief is ready for review.'}, {name:'09:15 · Review opened',detail:'Onboarding flow needs a final check.'}, {name:'09:30 · Notes added',detail:'Review notes capture the next changes.'}],
  members: [{name:'Riley Morgan',detail:'Design reviewer'}, {name:'Kai Ortiz',detail:'Content reviewer'}],
} as const;
export function workspaceRows(view:string) {
  return view==='activity' ? reviewWorkspace.activity : view==='members' ? reviewWorkspace.members : reviewWorkspace.documents;
}
export function WorkspaceRows({view,compact}:{view:string;compact:boolean}) {
  return <ul className="workspace-view-rows" data-density={compact?'compact':'comfortable'}>
    {workspaceRows(view).map(row=><li key={row.name}><strong>{row.name}</strong><span>{row.detail}</span></li>)}
  </ul>;
}
export function TabMenuPreview() {
  const [tab,setTab]=useState('overview');
  const [compact,setCompact]=useState(false);
  const headingId=useId();
  const title=tab==='activity'?'Activity':tab==='members'?'Reviewers':tab==='settings'?'Display':'Overview';
  return <div className="demo-stack">
    <TabList value={tab} onChange={setTab} aria-label="Review workspace views" hasDivider={false}>
      <Tab value="overview" label="Overview" />
      <TabMenu label="More views" options={[{value:'activity',label:'Activity'},{value:'members',label:'Members'},{value:'settings',label:'Settings'}]}/>
    </TabList>
    <section className="demo-stack" aria-labelledby={headingId}>
      <h3 id={headingId} className="demo-label">{title}</h3>
      {tab==='overview' && <p className="demo-copy">3 documents · 2 ready. Next: review the onboarding flow.</p>}
      {tab==='settings' && <div className="demo-row" role="group" aria-label="Content spacing">
        <Button label="Comfortable" variant={!compact?'primary':'secondary'} aria-pressed={!compact} onClick={()=>setCompact(false)}/>
        <Button label="Compact" variant={compact?'primary':'secondary'} aria-pressed={compact} onClick={()=>setCompact(true)}/>
      </div>}
      <WorkspaceRows view={tab} compact={compact}/>
      {tab==='settings' && <p className="demo-copy">Spacing applies across these views. Changes stay on this page.</p>}
    </section>
    <p className="demo-copy" role="status">{title} view · {compact?'Compact':'Comfortable'} spacing</p>
    <small className="demo-copy">Authored review content. No team activity is fetched or changed.</small>
  </div>;
}

function OutlinePreview() {
  const prefix = useId();
  const items = [
    {id: `${prefix}-overview`, label: 'Overview', level: 2},
    {id: `${prefix}-materials`, label: 'Materials', level: 2},
    {id: `${prefix}-tokens`, label: 'Surface tokens', level: 3},
  ];
  const [active, setActive] = useState(items[0].id);
  return (
    <div className="demo-stack">
      <Outline
        items={items}
        activeId={active}
        onActiveIdChange={setActive}
        hasScrollOnClick={false}
        label="Document contents"
      />
      <div className="demo-copy">
        <h3 id={items[0].id}>Overview</h3>
        <p>A native table of contents, not application routing.</p>
        <h3 id={items[1].id}>Materials</h3>
        <p>
          Choose a heading to move the active indicator without scrolling the
          catalog.
        </p>
        <h4 id={items[2].id}>Surface tokens</h4>
        <p>Nested levels retain their native indentation.</p>
      </div>
    </div>
  );
}

function PaginationPreview() {
  const [page, setPage] = useState(1);
  const records = [
    'Glass foundation',
    'Neutral surfaces',
    'Accent signals',
    'Navigation patterns',
    'Keyboard focus',
    'Responsive layout',
    'Motion guidance',
    'Content hierarchy',
    'Theme integration',
  ];
  return (
    <div className="demo-stack">
      <ul className="demo-copy">
        {records.slice((page - 1) * 3, page * 3).map(record => (
          <li key={record}>{record}</li>
        ))}
      </ul>
      <Pagination
        page={page}
        onChange={setPage}
        totalItems={records.length}
        pageSize={3}
        size="sm"
        label="Collection pages"
      />
      <p className="demo-result" role="status">
        Page {page} of 3 · Showing three local collection entries.
      </p>
    </div>
  );
}

function TreeNavigationPreview() {
  const [selected, setSelected] = useState('Surfaces');
  return (
    <div className="demo-stack">
      <TreeList
        header="Library"
        items={[
          {
            id: 'foundations',
            label: 'Foundations',
            isExpanded: true,
            children: ['Surfaces', 'Color', 'Typography'].map(label => ({
              id: label,
              label,
              isSelected: selected === label,
              onClick: () => setSelected(label),
            })),
          },
          {
            id: 'patterns',
            label: 'Patterns',
            isExpanded: true,
            children: ['Navigation', 'Forms'].map(label => ({
              id: label,
              label,
              isSelected: selected === label,
              onClick: () => setSelected(label),
            })),
          },
        ]}
      />
      <p className="demo-result" role="status">
        Selected: {selected}. Expand or collapse branches with their chevrons.
      </p>
    </div>
  );
}

const records: (Demo & {covers: string[]})[] = [
  {
    id: 'side-navigation',
    name: 'SideNav family',
    category: 'Navigation',
    description:
      'A workspace sidebar with a workspace-switching heading menu, nested sections, selection, disabled items, and a working collapsed rail.',
    material:
      'Open the workspace heading to switch teams; expand sections to explore.',
    covers: [
      'SideNav',
      'SideNavCollapseButton',
      'SideNavHeading',
      'SideNavItem',
      'SideNavSection',
      'NavHeadingMenu',
    ],
    code: `<SideNav collapsible={{isCollapsed, onCollapsedChange, hasButton: false}} header={<SideNavHeading heading="Studio" menu={<NavHeadingMenu><NavHeadingMenuItem label="Design studio" onClick={selectWorkspace} /></NavHeadingMenu>} />} footerIcons={<SideNavCollapseButton />}><SideNavSection title="Workspace"><SideNavItem label="Collections" collapsible><SideNavItem label="Materials" onClick={selectMaterials} /></SideNavItem></SideNavSection></SideNav>`,
    Preview: SideNavigationPreview,
  },
  {
    id: 'mobile-navigation',
    name: 'MobileNav & MobileNavToggle',
    category: 'Navigation',
    description:
      'An AppShell-aware hamburger opens the native mobile drawer with local destinations. Visible below the theme’s 2xl viewport breakpoint.',
    material:
      'The drawer is a native overlay panel with its own backdrop. The responsive toggle disappears above the configured viewport breakpoint; narrow card width alone is not mobile mode.',
    covers: ['MobileNav', 'MobileNavToggle'],
    code: `// Preview host: .preview-app-shell { height: 360px; min-height: 0; }\n<AppShell className="preview-app-shell" height="fill" topNav={<MobileNavToggle />} mobileNav={{hasToggle: false, breakpoint: '2xl', content: <MobileNav header="Explore workspace">{destinations}</MobileNav>}}>{content}</AppShell>`,
    Preview: MobileNavigationPreview,
  },
  {
    id: 'top-navigation',
    name: 'TopNav & Resources menu',
    category: 'Navigation',
    description:
      'Product identity, a circular NavIcon, selectable local destinations, and a native rich Resources dropdown.',
    material:
      'TopNav, heading, and item targets retain native theme styling. TopNavMenu targets its trigger, not the painted popover panel. Open Resources to inspect the panel.',
    covers: ['TopNav', 'TopNavHeading', 'TopNavItem', 'TopNavMenu', 'NavIcon'],
    code: `<TopNav heading={<TopNavHeading heading="Studio" logo={<NavIcon icon={<Icon icon="viewColumns" />} />} />} endContent={<TopNavMenu label="Resources" items={[{title: 'Documentation', description: 'Guides and component APIs', icon: <DocumentationIllustration />, onClick: selectDocs}, {title: 'Changelog', description: 'Recent product updates', icon: <UpdatesIllustration />, onClick: selectChangelog}]} />} />\n<nav aria-label="Workspace destinations"><OverflowList minVisibleItems={0} overflowRenderer={hidden => <MoreMenu label="More workspace destinations" alignment="end" items={hidden.map(item => ({label: labels[item.index], onClick: () => selectPage(labels[item.index])}))} />}>{labels.map(label => <TopNavItem key={label} label={label} href="#" isSelected={page === label} onClick={event => {event.preventDefault(); selectPage(label);}} />)}</OverflowList></nav>\n// labels = ['Overview', 'Library']; illustrations are caller-authored SVGs using currentColor.`,
    Preview: TopNavigationPreview,
  },
  {
    id: 'mega-navigation',
    name: 'TopNavMegaMenu family',
    category: 'Navigation',
    description:
      'Open Products for a native mega-menu composition with rich destination items and a featured card with a local action.',
    material:
      'The mega-menu public target belongs to the trigger, not the painted panel. Rich items and the featured card are only visible after opening Products.',
    covers: [
      'TopNavMegaMenu',
      'TopNavMegaMenuItem',
      'TopNavMegaMenuFeaturedCard',
    ],
    code: `<TopNav startContent={<TopNavMegaMenu label="Products" items={<TopNavMegaMenuItem title="Materials" description="Surface foundations" onClick={selectMaterials} />} featured={<TopNavMegaMenuFeaturedCard title="Build your workspace"><Button label="Explore starter" onClick={selectStarter} /></TopNavMegaMenuFeaturedCard>} />} />`,
    Preview: MegaNavigationPreview,
  },
  {
    id: 'more-actions',
    name: 'MoreMenu',
    category: 'Navigation',
    description:
      'Duplicate, pin, archive and restore a local collection with visible state.',
    material:
      'The MoreMenu public target is on its DropdownMenu surface, while the three-dot trigger uses the native Button treatment.',
    covers: ['MoreMenu'],
    code: "// Included local composition, not a package export.\nimport {MoreActionsPreview} from './navigationDemos';\n<MoreActionsPreview />",
    Preview: MoreActionsPreview,
  },
  {
    id: 'overflow-navigation',
    name: 'OverflowList',
    category: 'Navigation',
    description:
      'A responsive destination row caps visible items and exposes every hidden destination through a working MoreMenu.',
    material:
      'OverflowList owns layout rather than a painted panel. Its children and overflow menu retain native component styling; the two/five-item control makes overflow observable.',
    covers: ['OverflowList'],
    code: `<OverflowList minVisibleItems={1} maxVisibleItems={2} overflowRenderer={hidden => <MoreMenu label={hidden.length + ' more destinations'} items={hidden.map(item => ({label: labels[item.index], onClick: () => select(labels[item.index])}))} />}>{buttons}</OverflowList>`,
    Preview: OverflowNavigationPreview,
  },
  {
    id: 'tab-overflow-menu',
    name: 'TabMenu',
    category: 'Navigation',
    description:
      'Switch between review documents, activity and reviewers; adjust content spacing across views.',
    material:
      'The tab indicator and overflow panel are native; the selected tab changes local content rather than navigating away.',
    covers: ['TabMenu'],
    code: `<TabList value={tab} onChange={setTab} aria-label="Collection views"><Tab value="overview" label="Overview" /><TabMenu label="More views" options={[{value: 'activity', label: 'Activity'}, {value: 'members', label: 'Members'}]} /></TabList>`,
    Preview: TabMenuPreview,
  },
  {
    id: 'document-outline',
    name: 'Outline',
    category: 'Navigation',
    description:
      'A controlled same-page outline with real heading targets and nested levels; click to move the active indicator without scrolling the catalog.',
    material:
      'An active rail marks the selected section. Selection does not scroll the page.',
    covers: ['Outline'],
    code: `<Outline items={headings} activeId={active} onActiveIdChange={setActive} hasScrollOnClick={false} label="Document contents" />`,
    Preview: OutlinePreview,
  },
  {
    id: 'collection-pagination',
    name: 'Pagination',
    category: 'Navigation',
    description:
      'Three real pages of local collection entries with working numbered and previous/next controls.',
    material:
      'Paging controls keep native selection, focus, and disabled states; the list changes with the current page.',
    covers: ['Pagination'],
    code: `<Pagination page={page} onChange={setPage} totalItems={9} pageSize={3} size="sm" />`,
    Preview: PaginationPreview,
  },
  {
    id: 'library-tree',
    name: 'TreeList',
    category: 'Navigation',
    description:
      'Expandable library branches with native connector guides, current selection, and local leaf actions.',
    material:
      'Expanded branches reveal the library hierarchy.',
    covers: ['TreeList'],
    code: `<TreeList header="Library" items={[{id: 'foundations', label: 'Foundations', isExpanded: true, children: [{id: 'surfaces', label: 'Surfaces', isSelected, onClick: selectSurfaces}]}]} />`,
    Preview: TreeNavigationPreview,
  },
];

export const navigationDemos: Demo[] = records;
