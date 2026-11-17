/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Built public Astryx exports, Vesper themes, and caller-owned preview state.
 * @output Native content/providers with filtered document results and legible loading icons.
 * @position Vesper component catalog; no story runtime or core source imports.
 */
import {useState, type ComponentProps} from 'react';
import type {Demo} from './demos';
import {Button} from '@astryxdesign/core/Button';
import {HStack, VStack, Stack, StackItem} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {InputGroup, InputGroupText} from '@astryxdesign/core/InputGroup';
import {TextInput} from '@astryxdesign/core/TextInput';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {Item} from '@astryxdesign/core/Item';
import {Kbd} from '@astryxdesign/core/Kbd';
import {LayerProvider} from '@astryxdesign/core/Layer';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Lightbox} from '@astryxdesign/core/Lightbox';
import {Link, LinkProvider} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  MediaTheme,
  SyntaxTheme,
  Theme,
  useTheme,
} from '@astryxdesign/core/theme';
import {githubDark} from '@astryxdesign/core/theme/syntax';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Overlay} from '@astryxdesign/core/Overlay';
import {
  PowerSearch,
  type PowerSearchConfig,
  type PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';
import {RadioIndicator} from '@astryxdesign/core/Indicator';
import {ResizeHandle, useResizable} from '@astryxdesign/core/Resizable';
import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {Section} from '@astryxdesign/core/Section';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector, SelectorOption} from '@astryxdesign/core/Selector';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Step, Stepper} from '@astryxdesign/core/Stepper';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSelectionToolbar,
} from '@astryxdesign/core/Table';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {TimeInput} from '@astryxdesign/core/TimeInput';
import {Timer} from '@astryxdesign/core/Timer';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Toast} from '@astryxdesign/core/Toast';
import {ToggleButton, ToggleButtonGroup} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Typeahead, TypeaheadItem} from '@astryxdesign/core/Typeahead';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {
  vesperDarkTheme,
  vesperLightTheme,
  vesperContrastTheme,
} from '../../themes/vesper';

function LayoutPreview() {
  const panel = useResizable({defaultSize: 150, minSize: 100, maxSize: 240});
  return (
    <Layout
      height="auto"
      padding={3}
      header={
        <LayoutHeader hasDivider>
          <Heading level={4}>Collection workspace</Heading>
        </LayoutHeader>
      }
      start={
        <HStack gap={0}>
          <LayoutPanel
            resizable={panel.props}
            label="Collection inspector"
            padding={3}>
            <VStack gap={2}>
              <Text type="label">Inspector</Text>
              <Text as="p" type="supporting">
                Drag the handle to resize this panel.
              </Text>
            </VStack>
          </LayoutPanel>
          <ResizeHandle
            resizable={panel.props}
            label="Resize inspector"
            hasDivider
          />
        </HStack>
      }
      content={
        <LayoutContent>
          <Section padding={3} variant="muted">
            <VStack gap={3}>
              <Text>Content region</Text>
              <Stack direction="horizontal" gap={2}>
                <StackItem size="fill">
                  <Text type="supporting">Flexible content</Text>
                </StackItem>
                <Text type="supporting">Fixed detail</Text>
              </Stack>
            </VStack>
          </Section>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <Text type="supporting">All changes saved locally</Text>
        </LayoutFooter>
      }
    />
  );
}

function ReadingPreview() {
  return (
    <div className="demo-stack">
      <Heading level={4}>Release notes</Heading>
      <Text as="p">
        Readable primary text with{' '}
        <Link href="#/components/markdown">linked context</Link> and{' '}
        <Kbd keys="mod+k" /> shortcuts.
      </Text>
      <SyntaxTheme theme={githubDark}>
        <Markdown headingLevelStart={5}>
          {
            '# A focused update\n\n**Strong hierarchy**, supporting copy, and code retain their semantic ink.\n\n```ts\nconst status = "ready";\n```\n\n- Keyboard access\n- Clear feedback'
          }
        </Markdown>
      </SyntaxTheme>
      <List header="Review checklist" hasDividers>
        <ListItem
          label="Review content"
          description="Verify copy before publishing"
        />
        <ListItem
          label="Confirm accessibility"
          description="Check names and keyboard access"
        />
      </List>
      <Item
        label="Publication ready"
        description="Editorial review completed"
        startContent={<Icon icon="check" color="success" />}
      />
      <MetadataList title="Release details">
        <MetadataListItem label="Owner">Design systems</MetadataListItem>
        <MetadataListItem label="Updated">
          <Timestamp value="2026-10-01T09:00:00Z" format="date" />
        </MetadataListItem>
      </MetadataList>
    </div>
  );
}

const records = [
  {id: 'release', name: 'Release notes', status: 'Ready'},
  {id: 'guide', name: 'Usage guide', status: 'In review'},
];
function TablePreview() {
  const [keys, setKeys] = useState<Set<string>>(new Set(['release']));
  const [message, setMessage] = useState('Select rows to enable bulk actions.');
  function select(id: string, checked: boolean) {
    setKeys(previous => {
      const next = new Set(previous);
      if (checked) {next.add(id);}
      else {next.delete(id);}
      return next;
    });
  }
  return (
    <div className="demo-stack">
      <p className="demo-copy">
        On narrow screens, scroll the table and bulk actions together.
      </p>
      <div
        className="table-preview-scroll"
        role="region"
        aria-label="Scrollable documents and bulk actions"
        tabIndex={0}>
        <div className="demo-stack table-preview-canvas">
          <TableSelectionToolbar
            selection={{
              selectedKeys: keys,
              selectedCount: keys.size,
              hasSelection: keys.size > 0,
              clearSelection: () => setKeys(new Set()),
            }}
            startContent={
              <Button
                label="Mark reviewed"
                onClick={() =>
                  setMessage(`${keys.size} documents marked reviewed.`)
                }
                isDisabled={keys.size === 0}
              />
            }
          />
          <Table aria-label="Collection documents" hasHover>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Select</TableHeaderCell>
                <TableHeaderCell>Document</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map(row => (
                <TableRow key={row.id}>
                  <TableCell>
                    <CheckboxInput
                      label={`Select ${row.name}`}
                      isLabelHidden
                      value={keys.has(row.id)}
                      onChange={checked => select(row.id, checked)}
                    />
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>
                  2 documents in this collection
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
      <p className="demo-result" role="status">
        {message}
      </p>
    </div>
  );
}

const people = [
  {id: 'riley', label: 'Riley Morgan'},
  {id: 'kai', label: 'Kai Ortiz'},
  {id: 'alex', label: 'Alex Chen'},
];
const peopleSource = {
  bootstrap: () => people,
  search: (query: string) =>
    people.filter(person =>
      person.label.toLowerCase().includes(query.toLowerCase()),
    ),
};
function SearchPreview() {
  const [person, setPerson] = useState<(typeof people)[number] | null>(null);
  return (
    <div className="demo-stack">
      <Typeahead
        label="Assign reviewer"
        searchSource={peopleSource}
        value={person}
        onChange={setPerson}
        hasEntriesOnFocus
        debounceMs={0}
        renderItem={item => (
          <TypeaheadItem item={item} description="Collection reviewer" />
        )}
      />
      <p className="demo-copy">
        Focus or type to explore the results; use arrows and Enter to choose.
      </p>
      <p className="demo-result" role="status">
        {person ? `Assigned to ${person.label}` : 'No reviewer assigned'}
      </p>
    </div>
  );
}
const filterConfig: PowerSearchConfig = {
  name: 'CollectionSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [
              {value: 'ready', label: 'Ready'},
              {value: 'review', label: 'In review'},
            ],
          },
        },
      ],
    },
  ],
};
type SearchDocument = {title: string; status: 'ready' | 'review'};
const searchDocuments: ReadonlyArray<SearchDocument> = [
  {title: 'Release notes', status: 'ready'},
  {title: 'Usage guide', status: 'review'},
];
export function getPowerSearchResults(
  filters: ReadonlyArray<PowerSearchFilter>,
): ReadonlyArray<SearchDocument> {
  return searchDocuments.filter(document =>
    filters.every(
      filter =>
        filter.field === 'status' &&
        filter.operator === 'is' &&
        filter.value.type === 'enum' &&
        filter.value.value === document.status,
    ),
  );
}
function PowerSearchPreview() {
  const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([
    {field: 'status', operator: 'is', value: {type: 'enum', value: 'ready'}},
  ]);
  const results = getPowerSearchResults(filters);
  return (
    <div className="demo-stack">
      <PowerSearch
        config={filterConfig}
        filters={filters}
        onChange={setFilters}
        label="Filter documents"
        resultCount={results.length}
      />
      <p className="demo-result">
        {results.length
          ? results
              .map(
                document =>
                  `${document.title} · ${document.status === 'ready' ? 'Ready' : 'In review'}`,
              )
              .join('; ')
          : 'No matching documents'}
      </p>
    </div>
  );
}
function InputPreview() {
  const [slug, setSlug] = useState('collection');
  const [time, setTime] = useState<ComponentProps<typeof TimeInput>['value']>(
    '09:30' as ComponentProps<typeof TimeInput>['value'],
  );
  const [choice, setChoice] = useState('ready');
  return (
    <div className="demo-stack publication-fields">
      <InputGroup
        label="Collection address"
        description="Private collection URL">
        <InputGroupText>https://</InputGroupText>
        <TextInput label="Address path" value={slug} onChange={setSlug} />
      </InputGroup>
      <TimeInput
        label="Publication time"
        description="24-hour local time"
        value={time}
        onChange={setTime}
        hourFormat="24h"
        presentation="adaptive-bottom-sheet"
        width="100%"
        hasClear
      />
      <Selector
        label="Review state"
        description="Publication workflow"
        value={choice}
        onChange={setChoice}
        options={[
          {value: 'ready', label: 'Ready'},
          {value: 'review', label: 'In review'},
        ]}
        renderOption={option => (
          <SelectorOption
            label={option.label}
            description="Publication workflow"
          />
        )}
      />
      <p className="demo-result" role="status">
        {time ? `Scheduled for ${time}` : 'Choose a publication time'} ·{' '}
        {choice === 'ready' ? 'Ready to publish' : 'In review'}
      </p>
    </div>
  );
}
function SelectionPreview() {
  const [selected, setSelected] = useState(true);
  const [view, setView] = useState<string | null>('comfortable');
  const [tags, setTags] = useState(['Research', 'Design']);
  return (
    <div className="demo-stack">
      <SelectableCard
        label="Include editorial review"
        isSelected={selected}
        onChange={setSelected}>
        <HStack gap={2} vAlign="center">
          <RadioIndicator state={selected ? 'checked' : 'unchecked'} />
          <Text>Include editorial review</Text>
        </HStack>
      </SelectableCard>
      <Toolbar
        label="Reading density"
        startContent={
          <ToggleButtonGroup
            type="single"
            label="Density"
            value={view}
            onChange={setView}>
            <ToggleButton value="compact" label="Compact" />
            <ToggleButton value="comfortable" label="Comfortable" />
          </ToggleButtonGroup>
        }
      />
      <div className="demo-row">
        {tags.map(tag => (
          <Token
            key={tag}
            label={tag}
            onRemove={() => setTags(tags.filter(value => value !== tag))}
          />
        ))}
        {tags.length === 0 && (
          <Button
            label="Restore labels"
            onClick={() => setTags(['Research', 'Design'])}
          />
        )}
      </div>
      <p className="demo-result">
        {selected ? 'Review included' : 'Review omitted'} · {view}
      </p>
    </div>
  );
}
function ProgressPreview() {
  const [active, setActive] = useState(1);
  const [startTime, setStartTime] = useState(() => Date.now());
  return (
    <div className="demo-stack">
      <Stepper
        activeStep={active}
        onStepClick={setActive}
        label="Publishing progress">
        <Step step={0} label="Draft" />
        <Step step={1} label="Review" />
        <Step step={2} label="Publish" />
      </Stepper>
      <div className="progress-summary">
        <div className="progress-service">
          <StatusDot variant="success" label="Service available" />
          <Text type="label">Service available</Text>
        </div>
        <div className="progress-elapsed">
          <Text type="supporting">Elapsed</Text>
          <Timer
            className="progress-clock"
            startTime={startTime}
            format="clock"
            type="body"
            color="primary"
            weight="semibold"
          />
        </div>
      </div>
      <div className="progress-activity">
        <span className="progress-sync-icon">
          <Spinner size="sm" shade="inherit" aria-label="Syncing changes" />
        </span>
        <Text type="supporting">Syncing changes</Text>
        <Button
          className="progress-restart"
          label="Restart timer"
          variant="ghost"
          size="sm"
          onClick={() => setStartTime(Date.now())}
        />
      </div>
      <div className="progress-loading">
        <Skeleton width="100%" height={8} />
        <Skeleton width="65%" height={8} index={1} />
      </div>
      <Text type="supporting">
        Illustrative sync state. The timer runs locally.
      </Text>
    </div>
  );
}
const artwork =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"%3E%3Crect width="640" height="400" fill="%231B2542"/%3E%3Ccircle cx="320" cy="200" r="110" fill="%238CA5EF"/%3E%3Cpath d="M0 340L240 150L430 400H0" fill="%234D6588"/%3E%3C/svg%3E';
function MediaPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="demo-stack">
      <div className="demo-stack media-preview">
        <Overlay
          position="bottom"
          content={
            <MediaTheme mode="dark">
              <Button label="Open artwork" onClick={() => setOpen(true)} />
            </MediaTheme>
          }>
          <img
            className="media-artwork"
            src={artwork}
            alt="Abstract moon above a mountain ridge"
            width="320"
            height="200"
          />
        </Overlay>
        <Thumbnail
          src={artwork}
          alt="Abstract moon and mountain"
          label="Artwork preview"
          onClick={() => setOpen(true)}
        />
      </div>
      <Lightbox
        isOpen={open}
        onOpenChange={setOpen}
        hasZoom
        media={{
          src: artwork,
          alt: 'Abstract moon above a mountain ridge',
          caption: 'Local artwork — no external image service',
        }}
      />
    </div>
  );
}
function ProviderPreview() {
  const ambient = useTheme();
  const [darkOverride, setDarkOverride] = useState<boolean | null>(null);
  const dark = darkOverride ?? ambient.mode === 'dark';
  const regionTheme =
    darkOverride === null && ambient.name === 'vesper-contrast'
      ? vesperContrastTheme
      : dark
        ? vesperDarkTheme
        : vesperLightTheme;
  const [value, setValue] = useState('');
  // LinkProvider deliberately uses the native anchor adapter, without a router dependency.
  return (
    <Theme theme={regionTheme} mode={dark ? 'dark' : 'light'}>
      <InternationalizationProvider
        locale="en"
        overrides={{
          en: {'@astryx.selector.placeholder': 'Choose a review state'},
        }}>
        <LinkProvider component="a">
          <Section padding={4}>
            <div className="demo-stack">
              <Button
                label={dark ? 'Use light region' : 'Use dark region'}
                onClick={() => setDarkOverride(!dark)}
              />
              {darkOverride !== null && (
                <Button
                  label="Follow page appearance"
                  onClick={() => setDarkOverride(null)}
                />
              )}
              <Selector
                label="Localized selector"
                value={value}
                onChange={setValue}
                options={[{value: 'ready', label: 'Ready'}]}
              />
              <Link href="#/components/layout">
                Explore the layout composition
              </Link>
              <Text type="supporting">
                Follows page appearance until you explicitly switch this region.
              </Text>
              <VisuallyHidden>
                Theme and localization changes are scoped to this example.
              </VisuallyHidden>
            </div>
          </Section>
        </LinkProvider>
      </InternationalizationProvider>
    </Theme>
  );
}
function FeedbackPreview() {
  const [visible, setVisible] = useState(true);
  const [type, setType] = useState<'info' | 'error'>('info');
  return (
    <LayerProvider>
      <div className="demo-stack">
        {visible ? (
          <Toast
            type={type}
            autoHideDuration={5000}
            body={
              type === 'error'
                ? 'Collection could not be saved. Try again.'
                : 'Collection saved. This preview keeps the notification until dismissed.'
            }
            isAutoHide={false}
            onDismiss={() => setVisible(false)}
          />
        ) : (
          <Button
            label="Show saved notification"
            onClick={() => setVisible(true)}
          />
        )}
        <p className="demo-result" role="status">
          {visible
            ? 'Saved notification is visible.'
            : 'Notification dismissed.'}
        </p>
        <div className="demo-row">
          {(['info', 'error'] as const).map(value => (
            <Button
              key={value}
              label={`Show ${value} toast`}
              variant={type === value ? 'primary' : 'secondary'}
              onClick={() => {
                setType(value);
                setVisible(true);
              }}
            />
          ))}
        </div>
      </div>
    </LayerProvider>
  );
}
function ScrollPreview() {
  return (
    <ScrollableArea
      label="Document activity"
      height={160}
      overscroll="contain"
      padding={3}>
      <List header="Recent activity" hasDividers>
        {[
          'Draft created',
          'Reviewer assigned',
          'Copy edited',
          'Accessibility checked',
          'Review approved',
          'Publication scheduled',
        ].map(label => (
          <ListItem
            key={label}
            label={label}
            description="Collection activity"
          />
        ))}
      </List>
    </ScrollableArea>
  );
}

const material =
  'The surrounding Vesper Card provides readable backing; semantic states keep their own ink and fills.';
export const coreContentDemos: Demo[] = [
  {
    id: 'native-layout',
    name: 'Layout regions & stacks',
    category: 'Layout',
    description:
      'Bounded workspace with a functional resizable inspector and named regions.',
    material,
    code: '<Layout header={<LayoutHeader />} start={<LayoutPanel resizable={panel.props} />} content={<LayoutContent />} footer={<LayoutFooter />} />\n<ResizeHandle resizable={panel.props} />',
    Preview: LayoutPreview,
    covers: [
      'HStack',
      'VStack',
      'Stack',
      'StackItem',
      'Layout',
      'LayoutContent',
      'LayoutHeader',
      'LayoutFooter',
      'LayoutPanel',
      'ResizeHandle',
      'Section',
    ],
  },
  {
    id: 'native-markdown',
    name: 'Text, Markdown & metadata',
    category: 'Content',
    description:
      'Semantic prose, syntax-highlighted code, checklist rows, and record metadata.',
    material,
    code: '<SyntaxTheme theme={githubDark}><Markdown headingLevelStart={5}>{source}</Markdown></SyntaxTheme>\n<MetadataList><MetadataListItem label="Updated"><Timestamp value="2026-10-01" /></MetadataListItem></MetadataList>',
    Preview: ReadingPreview,
    covers: [
      'Heading',
      'Text',
      'Link',
      'Kbd',
      'Markdown',
      'SyntaxTheme',
      'List',
      'ListItem',
      'Item',
      'Icon',
      'MetadataList',
      'MetadataListItem',
      'Timestamp',
    ],
  },
  {
    id: 'native-table-composition',
    name: 'Table & selection toolbar',
    category: 'Data',
    description:
      'Select real rows, clear selection, and run a local bulk review action.',
    material,
    code: '// Host CSS: .table-preview-scroll {overflow-x:auto} .table-preview-canvas {min-width:480px}\n<div className="table-preview-scroll" role="region" aria-label="Documents and bulk actions" tabIndex={0}><div className="table-preview-canvas"><TableSelectionToolbar selection={selection} startContent={<Button label="Mark reviewed" />} /><Table><TableHeader>...</TableHeader><TableBody>...</TableBody><TableFooter>...</TableFooter></Table></div></div>',
    Preview: TablePreview,
    covers: [
      'Table',
      'TableHeader',
      'TableHeaderCell',
      'TableBody',
      'TableRow',
      'TableCell',
      'TableFooter',
      'TableSelectionToolbar',
    ],
  },
  {
    id: 'native-typeahead',
    name: 'Typeahead & custom results',
    category: 'Inputs',
    description:
      'Local reviewer search with composed result rows; focus the field to see suggestions.',
    material,
    code: '<Typeahead label="Assign reviewer" searchSource={peopleSource} value={person} onChange={setPerson} hasEntriesOnFocus renderItem={item => <TypeaheadItem item={item} description="Collection reviewer" />} />',
    Preview: SearchPreview,
    covers: ['Typeahead', 'TypeaheadItem'],
  },
  {
    id: 'native-power-search',
    name: 'PowerSearch',
    category: 'Inputs',
    description:
      'Structured status filters backed by local configuration and result feedback.',
    material,
    code: 'const results = getPowerSearchResults(filters);\n<PowerSearch config={filterConfig} filters={filters} onChange={setFilters} resultCount={results.length} />',
    Preview: PowerSearchPreview,
    covers: ['PowerSearch'],
  },
  {
    id: 'native-input-group-time',
    name: 'Input addons, time & rich options',
    category: 'Inputs',
    description:
      'Editable URL prefix group, controlled publication time, and composed selector options.',
    material,
    code: '<InputGroup label="Collection address" description="Private collection URL"><InputGroupText>https://</InputGroupText><TextInput label="Address path" value={slug} onChange={setSlug} /></InputGroup>\n<TimeInput label="Publication time" description="24-hour local time" value={time} onChange={setTime} hourFormat="24h" presentation="adaptive-bottom-sheet" width="100%" hasClear />',
    Preview: InputPreview,
    covers: ['InputGroup', 'InputGroupText', 'TimeInput', 'SelectorOption'],
  },
  {
    id: 'native-selection-tools',
    name: 'Selection, tokens & toolbar',
    category: 'Inputs',
    description: 'Toggle review inclusion, change density, and remove labels.',
    material,
    code: '<SelectableCard label="Include editorial review" isSelected={selected} onChange={setSelected}><RadioIndicator state={selected ? "checked" : "unchecked"} /></SelectableCard>\n<Token label="Design" onRemove={remove} />',
    Preview: SelectionPreview,
    covers: [
      'SelectableCard',
      'RadioIndicator',
      'ToggleButtonGroup',
      'Toolbar',
      'Token',
    ],
  },
  {
    id: 'native-progress-feedback',
    name: 'Progress & loading feedback',
    category: 'Feedback',
    description:
      'Interactive workflow steps, semantic status, a live timer, and loading placeholders.',
    material,
    code: '<Stepper activeStep={active} onStepClick={setActive}><Step step={0} label="Draft" /><Step step={1} label="Review" /><Step step={2} label="Publish" /></Stepper>\n<Timer startTime={startTime} format="clock" type="body" color="primary" weight="semibold" />\n<Button label="Restart timer" variant="ghost" size="sm" onClick={() => setStartTime(Date.now())} />\n// Host CSS: .progress-sync-icon {display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:var(--color-accent);color:var(--color-on-accent)}\n<span className="progress-sync-icon"><Spinner size="sm" shade="inherit" aria-label="Syncing changes" /></span>',
    Preview: ProgressPreview,
    covers: ['Stepper', 'Step', 'StatusDot', 'Spinner', 'Skeleton', 'Timer'],
  },
  {
    id: 'native-media-viewer',
    name: 'Media overlay & lightbox',
    category: 'Content',
    description:
      'Self-contained artwork with readable scrim actions, clickable thumbnail, and zoom viewer.',
    material,
    code: '// Host CSS: .media-preview {width:320px;max-width:100%} .media-artwork {display:block;width:100%;height:auto}\n<div className="media-preview"><Overlay position="bottom" content={<MediaTheme mode="dark"><Button label="Open artwork" onClick={() => setOpen(true)} /></MediaTheme>}><img className="media-artwork" src={artwork} alt="Abstract moon above a mountain ridge" width="320" height="200" /></Overlay></div>\n<Lightbox isOpen={open} onOpenChange={setOpen} media={media} hasZoom />',
    Preview: MediaPreview,
    covers: ['Overlay', 'MediaTheme', 'Thumbnail', 'Lightbox'],
  },
  {
    id: 'native-content-providers',
    name: 'Theme, locale & link providers',
    category: 'System',
    description:
      'Scoped theme switching, localized selector copy, native link adapter, and screen-reader context.',
    material,
    code: '<Theme theme={theme} mode={mode}><InternationalizationProvider locale="en" overrides={overrides}><LinkProvider component="a">{content}</LinkProvider></InternationalizationProvider></Theme>',
    Preview: ProviderPreview,
    covers: [
      'Theme',
      'InternationalizationProvider',
      'LinkProvider',
      'VisuallyHidden',
    ],
  },
  {
    id: 'native-toast-content',
    name: 'Toast & layer context',
    category: 'Feedback',
    description:
      'Persistent, dismissible saved notification with its own local preview context.',
    material,
    code: '<LayerProvider><Toast type="info" autoHideDuration={5000} body="Collection saved" isAutoHide={false} onDismiss={() => setVisible(false)} /></LayerProvider>',
    Preview: FeedbackPreview,
    covers: ['Toast', 'LayerProvider'],
  },
  {
    id: 'native-scrollable-area',
    name: 'ScrollableArea',
    category: 'Layout',
    description:
      'Named bounded activity viewport with contained overscroll and real list content.',
    material,
    code: '<ScrollableArea label="Document activity" height={160} overscroll="contain" padding={3}>{activity}</ScrollableArea>',
    Preview: ScrollPreview,
    covers: ['ScrollableArea'],
  },
];
