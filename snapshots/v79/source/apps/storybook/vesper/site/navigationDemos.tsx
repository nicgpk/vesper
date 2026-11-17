/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Public built Astryx navigation APIs and the surrounding Vesper providers.
 * @output Stateful navigation previews with end-aligned actions and two-tier product navigation.
 * @position Vesper component catalog extension; no Storybook or private CSS overrides.
 */
import {useId, useState} from 'react';
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
            heading="Vesper"
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

function MobileNavigationPreview() {
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState('Overview');
  return (
    <div className="demo-stack">
      <AppShell
        className="preview-app-shell"
        height="fill"
        variant="surface"
        contentPadding={3}
        topNav={
          <div className="demo-row">
            <MobileNavToggle label="Open preview navigation" />
            <span className="demo-label">Vesper mobile workspace</span>
          </div>
        }
        mobileNav={{
          hasToggle: false,
          breakpoint: '2xl',
          isOpen: open,
          onOpenChange: setOpen,
          content: (
            <MobileNav header="Explore Vesper">
              <div className="demo-stack">
                {['Overview', 'Collections', 'Settings'].map(label => (
                  <Button
                    key={label}
                    label={label}
                    variant="ghost"
                    onClick={() => {
                      setDestination(label);
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            </MobileNav>
          ),
        }}>
        <p className="demo-copy">
          Use the hamburger to open the native drawer. Escape, the close button,
          or a destination closes it.
        </p>
        <p className="demo-result" role="status">
          Current destination: {destination}
        </p>
      </AppShell>
      <p className="demo-copy">
        The native toggle is responsive: this example uses AppShell’s 2xl
        breakpoint. Narrow the browser below that theme breakpoint to reveal it;
        card width alone does not change the viewport.
      </p>
    </div>
  );
}

function TopNavigationPreview() {
  const [page, setPage] = useState('Overview');
  return (
    <div className="demo-stack">
      <TopNav
        label="Preview product navigation"
        heading={
          <TopNavHeading
            heading="Vesper"
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
      <nav aria-label="Preview workspace destinations">
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
        Identity and Resources stay on the first tier; workspace destinations
        use a separate responsive OverflowList below, so neither tier needs
        sideways scrolling. Hover or activate Resources for illustrated
        documentation and update links. Its theme target belongs to the trigger,
        not the panel.
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
        label="Preview mega navigation"
        heading={<TopNavHeading heading="Vesper" />}
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
                title="Build with Vesper"
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

function MoreActionsPreview() {
  const [action, setAction] = useState('No action yet');
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <span className="demo-label">Material collection</span>
        <MoreMenu
          label="Collection actions"
          alignment="end"
          items={[
            {
              label: 'Duplicate collection',
              onClick: () => setAction('Collection duplicated locally'),
            },
            {
              label: 'Pin collection',
              onClick: () => setAction('Collection pinned locally'),
            },
            {
              label: 'Archive collection',
              onClick: () => setAction('Collection archived locally'),
            },
          ]}
        />
      </div>
      <p className="demo-result" role="status">
        {action}
      </p>
    </div>
  );
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

function TabMenuPreview() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="demo-stack">
      <TabList
        value={tab}
        onChange={setTab}
        aria-label="Collection views"
        hasDivider>
        <Tab value="overview" label="Overview" />
        <TabMenu
          label="More views"
          options={[
            {value: 'activity', label: 'Activity'},
            {value: 'members', label: 'Members'},
            {value: 'settings', label: 'Settings'},
          ]}
        />
      </TabList>
      <p className="demo-result" role="status">
        {tab === 'overview'
          ? 'Collection overview'
          : tab === 'activity'
            ? 'Recent collection activity'
            : tab === 'members'
              ? 'Collection members'
              : 'Collection settings'}
      </p>
    </div>
  );
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
        label="Preview document contents"
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
        label="Preview collection pages"
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
        header="Vesper library"
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
      'The sidebar and heading retain their Vesper theme treatment; selection and disclosure remain native. Open the heading to inspect its menu surface.',
    covers: [
      'SideNav',
      'SideNavCollapseButton',
      'SideNavHeading',
      'SideNavItem',
      'SideNavSection',
      'NavHeadingMenu',
    ],
    code: `<SideNav collapsible={{isCollapsed, onCollapsedChange, hasButton: false}} header={<SideNavHeading heading="Vesper" menu={<NavHeadingMenu><NavHeadingMenuItem label="Design studio" onClick={selectWorkspace} /></NavHeadingMenu>} />} footerIcons={<SideNavCollapseButton />}><SideNavSection title="Workspace"><SideNavItem label="Collections" collapsible><SideNavItem label="Materials" onClick={selectMaterials} /></SideNavItem></SideNavSection></SideNav>`,
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
    code: `// Preview host: .preview-app-shell { height: 360px; min-height: 0; }\n<AppShell className="preview-app-shell" height="fill" topNav={<MobileNavToggle />} mobileNav={{hasToggle: false, breakpoint: '2xl', content: <MobileNav header="Explore Vesper">{destinations}</MobileNav>}}>{content}</AppShell>`,
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
    code: `<TopNav heading={<TopNavHeading heading="Vesper" logo={<NavIcon icon={<Icon icon="viewColumns" />} />} />} endContent={<TopNavMenu label="Resources" items={[{title: 'Documentation', description: 'Guides and component APIs', icon: <DocumentationIllustration />, onClick: selectDocs}, {title: 'Changelog', description: 'Recent product updates', icon: <UpdatesIllustration />, onClick: selectChangelog}]} />} />\n<nav aria-label="Workspace destinations"><OverflowList minVisibleItems={0} overflowRenderer={hidden => <MoreMenu label="More workspace destinations" alignment="end" items={hidden.map(item => ({label: labels[item.index], onClick: () => selectPage(labels[item.index])}))} />}>{labels.map(label => <TopNavItem key={label} label={label} href="#" isSelected={page === label} onClick={event => {event.preventDefault(); selectPage(label);}} />)}</OverflowList></nav>\n// labels = ['Overview', 'Library']; illustrations are caller-authored SVGs using currentColor.`,
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
    code: `<TopNav startContent={<TopNavMegaMenu label="Products" items={<TopNavMegaMenuItem title="Materials" description="Surface foundations" onClick={selectMaterials} />} featured={<TopNavMegaMenuFeaturedCard title="Build with Vesper"><Button label="Explore starter" onClick={selectStarter} /></TopNavMegaMenuFeaturedCard>} />} />`,
    Preview: MegaNavigationPreview,
  },
  {
    id: 'more-actions',
    name: 'MoreMenu',
    category: 'Navigation',
    description:
      'A native overflow action menu updates the collection’s local action status.',
    material:
      'The MoreMenu public target is on its DropdownMenu surface, while the three-dot trigger uses the native Button treatment.',
    covers: ['MoreMenu'],
    code: `<MoreMenu label="Collection actions" alignment="end" items={[{label: 'Duplicate collection', onClick: duplicateCollection}, {label: 'Pin collection', onClick: pinCollection}]} />`,
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
      'A tab-list overflow menu switches between activity, members, and settings and mirrors the selected label on its trigger.',
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
      'Outline exposes a native indicator track and active rail, not a separate glass panel. Automatic scroll is intentionally disabled for this embedded preview.',
    covers: ['Outline'],
    code: `<Outline items={headings} activeId={active} onActiveIdChange={setActive} hasScrollOnClick={false} label="Preview document contents" />`,
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
      'Rows, chevrons, and hierarchy guides keep their native Vesper treatment; branches start expanded so their children are immediately inspectable.',
    covers: ['TreeList'],
    code: `<TreeList header="Vesper library" items={[{id: 'foundations', label: 'Foundations', isExpanded: true, children: [{id: 'surfaces', label: 'Surfaces', isSelected, onClick: selectSurfaces}]}]} />`,
    Preview: TreeNavigationPreview,
  },
];

export const navigationDemos: Demo[] = records;
