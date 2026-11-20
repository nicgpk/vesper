/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Public built lab/richtext components, local fixtures, and gallery providers.
 * @output Controlled extension previews with host-relative sizing, scoped surface hooks, and labeled rich text.
 * @position Vesper Pages extension previews; compound members render in their owners.
 */
import {useEffect, useRef, useState} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {Button} from '@astryxdesign/core/Button';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {Section} from '@astryxdesign/core/Section';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  CircularProgress,
  CodeEditor,
  Drawer,
  DrawerHeader,
  InfoTip,
  ListInput,
  LogStream,
  MobileTokenizer,
  SVGIcon,
  Schedule,
  Stat,
  Tour,
  TourStep,
  TransferList,
  TransferListSelector,
  createEventFromISO,
  createScheduleListView,
  heartIcon,
  type LogEntry,
  type SVGIconVariation,
} from '@astryxdesign/lab';
import {
  RichTextEditor,
  RichTextEditorAutoLinkPlugin,
  RichTextEditorToolbar,
  RichTextView,
} from '@astryxdesign/richtext';

import type {Demo} from './demos';

function CircularProgressPreview() {
  const [value, setValue] = useState(65);
  return (
    <div className="demo-stack">
      <div className="progress-comparison">
        <CircularProgress
          label="Collection indexing"
          value={value}
          size="lg"
          hasValueLabel
          isLabelHidden={false}
        />
        <CircularProgress
          label="Preparing preview"
          size="lg"
          isIndeterminate
          isLabelHidden={false}
        />
      </div>
      <Slider
        label="Indexing completion"
        value={value}
        onChange={setValue}
        min={0}
        max={100}
      />
    </div>
  );
}

const initialCode =
  'const collection = {\n  name: "Vesper",\n  isPublished: false,\n};';
function CodeEditorPreview() {
  const [code, setCode] = useState(initialCode);
  const [readOnly, setReadOnly] = useState(false);
  return (
    <div className="demo-stack">
      <CodeEditor
        className="vesper-code-editor"
        label="Collection configuration"
        language="javascript"
        value={code}
        onChange={setCode}
        hasLineNumbers
        isReadOnly={readOnly}
        maxHeight={240}
      />
      <div className="demo-row">
        <Switch
          label="Read-only source"
          value={readOnly}
          onChange={setReadOnly}
        />
        <Button label="Reset source" onClick={() => setCode(initialCode)} />
      </div>
      <p className="demo-copy">
        Code isn’t run. Press Escape, then Tab to leave the editor.
      </p>
    </div>
  );
}

function DrawerPreview() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Evening collection');
  const [shared, setShared] = useState(false);
  return (
    <div className="demo-stack">
      <Button label="Inspect collection" onClick={() => setOpen(true)} />
      <p className="demo-copy">
        {name} · {shared ? 'Sharing enabled for this session' : 'Private collection'}
      </p>
      <Drawer
        label="Collection inspector"
        isOpen={open}
        onOpenChange={setOpen}
        purpose="form"
        width={400}>
        <DrawerHeader
          title="Collection inspector"
          subtitle="No invitations will be sent"
          onOpenChange={setOpen}
        />
        <Section padding={4}>
          <div className="demo-stack">
            <TextInput
              label="Collection name"
              value={name}
              onChange={setName}
            />
            <Switch
              label="Share collection"
              value={shared}
              onChange={setShared}
            />
            <Button label="Done" onClick={() => setOpen(false)} />
          </div>
        </Section>
      </Drawer>
    </div>
  );
}

function InfoTipPreview() {
  return (
    <div className="demo-row">
      <span className="demo-label">Collection visibility</span>
      <InfoTip
        label="About collection visibility"
        content="Sharing settings apply only to this session. No invitations are sent."
      />
    </div>
  );
}

function ListInputPreview() {
  const nextID = useRef(3);
  const [items, setItems] = useState([
    {id: 1, name: 'Review contrast'},
    {id: 2, name: 'Check keyboard navigation'},
  ]);
  return (
    <ListInput
      label="Release checklist"
      description="Edit, add, remove, or drag the checklist rows."
      value={items}
      onChange={setItems}
      getItemKey={item => item.id}
      createItem={() => ({id: nextID.current++, name: ''})}
      itemName="task"
      maxItems={5}
      isReorderable
      columns={[
        {
          key: 'name',
          header: 'Task',
          renderInput: ({
            item,
            label,
            isLabelHidden,
            isDisabled,
            status,
            statusVariant,
            updateItem,
          }) => (
            <TextInput
              label={label}
              isLabelHidden={isLabelHidden}
              isDisabled={isDisabled}
              status={status}
              statusVariant={statusVariant}
              value={item.name}
              onChange={name => updateItem({...item, name})}
            />
          ),
        },
      ]}
    />
  );
}

const initialEntries: LogEntry[] = [
  {
    id: 'ready',
    timestamp: '09:00:00',
    level: 'info',
    message: 'Collection review started.',
  },
  {
    id: 'check',
    timestamp: '09:00:01',
    level: 'debug',
    message: 'Loaded collection configuration.',
  },
  {
    id: 'warning',
    timestamp: '09:00:02',
    level: 'warn',
    message: 'One checklist task is incomplete.',
    detail: (
      <p className="demo-copy">
        Review focus order before publishing the collection.
      </p>
    ),
  },
];
function LogStreamPreview() {
  const sequence = useRef(3);
  const [entries, setEntries] = useState(initialEntries);
  const [following, setFollowing] = useState(true);
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Button
          label="Run next check"
          onClick={() => {
            const id = sequence.current++;
            setEntries(current => [
              ...current.slice(-19),
              {
                id: `local-${id}`,
                timestamp: `09:00:${String(id).padStart(2, '0')}`,
                level: 'info',
                message: `Review check ${id} completed.`,
              },
            ]);
          }}
        />
        <Button label="Clear log" onClick={() => setEntries([])} />
        <Switch
          label="Follow latest"
          value={following}
          onChange={setFollowing}
        />
      </div>
      <LogStream
        label="Collection activity"
        hasTimestamps={false}
        entries={entries}
        isFollowing={following}
        onFollowChange={setFollowing}
        maxHeight={240}
      />
      {entries.length === 0 && (
        <p className="demo-copy" role="status">
          Log cleared. Run the next check to see new activity.
        </p>
      )}
    </div>
  );
}

const teammates = [
  {id: 'riley', label: 'Riley Morgan'},
  {id: 'kai', label: 'Kai Ortiz'},
  {id: 'alex', label: 'Alex Chen'},
  {id: 'amara', label: 'Amara Okafor'},
  {id: 'noor', label: 'Noor Haddad'},
  {id: 'priya', label: 'Priya Shah'},
  {id: 'mateo', label: 'Mateo Rivera'},
  {id: 'jules', label: 'Jules Martin'},
  {id: 'hana', label: 'Hana Sato'},
  {id: 'samira', label: 'Samira Ali'},
  {id: 'leo', label: 'Leo Park'},
  {id: 'ines', label: 'Ines Costa'},
];
const teammateSource = {
  bootstrap: () => teammates,
  search: (query: string) =>
    teammates.filter(person =>
      person.label.toLowerCase().includes(query.toLowerCase()),
    ),
};
function MobileTokenizerPreview() {
  const [value, setValue] = useState([teammates[0]]);
  return (
    <div className="demo-stack">
      <MobileTokenizer
        label="Collection reviewers"
        description="Search by name, select your reviewers, then choose Done."
        searchSource={teammateSource}
        maxMenuItems={teammates.length}
        value={value}
        onChange={setValue}
        placeholder="Choose reviewers"
      />
      <p className="demo-copy">
        Selected:{' '}
        {value.map(person => person.label).join(', ') || 'No reviewers'}
      </p>
    </div>
  );
}

const iconVariations: SVGIconVariation[] = [
  'linear',
  'bold',
  'twotone',
  'bulk',
  'broken',
];
function SVGIconPreview() {
  const [variation, setVariation] = useState<SVGIconVariation>('twotone');
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <SVGIcon
          icon={heartIcon}
          variation={variation}
          size="lg"
          color="accent"
          aria-hidden="true"
        />
        <span className="demo-label">Heart · {variation}</span>
      </div>
      <Selector
        label="Icon variation"
        value={variation}
        onChange={value => {
          const next = iconVariations.find(variation => variation === value);
          if (next) {setVariation(next);}
        }}
        options={iconVariations.map(value => ({value, label: value}))}
      />
    </div>
  );
}

const scheduleDate = Date.parse('2026-10-19T09:00:00Z');
const scheduleView = createScheduleListView({days: 3});
const scheduleEvents = [
  createEventFromISO({
    id: 'review',
    title: 'Design review',
    start: '2026-10-19T09:00:00Z',
    end: '2026-10-19T09:45:00Z',
  }),
  createEventFromISO({
    id: 'handoff',
    title: 'Collection handoff',
    start: '2026-10-20T14:00:00Z',
    end: '2026-10-20T15:00:00Z',
  }),
];
function SchedulePreview() {
  const [date, setDate] = useState(scheduleDate);
  return (
    <div className="demo-stack">
      <p className="demo-copy">
        October 2026 · All times in UTC. Scroll sideways to see the full agenda.
      </p>
      <div
        className="schedule-preview-scroll"
        role="region"
        aria-label="Scrollable agenda"
        tabIndex={0}>
        <div className="schedule-preview">
          <Schedule
            view={scheduleView}
            events={scheduleEvents}
            date={date}
            focusDate={scheduleDate}
            onChangeDate={setDate}
            timezoneID="UTC"
          />
        </div>
      </div>
      <Button
        label="Return to agenda"
        onClick={() => setDate(scheduleDate)}
      />
    </div>
  );
}

function StatPreview() {
  return (
    <div className="demo-row">
      <Stat
        label="Reviewed components"
        value="128"
        delta={{value: '+16', direction: 'up'}}
        description="Since last release"
      />
      <Stat
        label="Open issues"
        value="4"
        delta={{value: '−3', direction: 'down', sentiment: 'positive'}}
        description="Since last release"
      />
    </div>
  );
}

export function TourPreview() {
  const first = useRef<HTMLButtonElement>(null);
  const second = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(false);
  const [panel,setPanel]=useState<'overview'|'checklist'|null>(null);
  const [result, setResult] = useState('Get to know your collection in two steps.');
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Button
          ref={first}
          label="Collection overview"
          onClick={() => {setPanel('overview');setResult('Collection overview opened.');}}
        />
        <Button
          ref={second}
          label="Review checklist"
          onClick={() => {setPanel('checklist');setResult('Review checklist opened.');}}
        />
      </div>
      <Button
        label="Start guided tour"
        isDisabled={active}
        onClick={() => {setActive(true);setResult('Walkthrough in progress.');}}
      />
      <p className="demo-copy" role="status">
        {result}
      </p>
      {panel&&<section aria-label={panel==='overview'?'Collection overview':'Review checklist'} className="demo-stack">
        <h3 className="demo-label">{panel==='overview'?'Evening collection':'Before sharing'}</h3>
        {panel==='overview'?<p className="demo-copy">Three review notes cover art direction, typography and interaction quality. Keep comments together before the next revision.</p>:<ul style={{margin:0,paddingLeft:20}}><li>Review the draft and intended audience.</li><li>Check small-screen layout and keyboard access.</li><li>Confirm permission before sharing.</li></ul>}
        <Button label="Close details" variant="ghost" onClick={()=>{setPanel(null);setResult('Details closed.');}}/>
      </section>}
      <Tour
        isActive={active}
        isStepCountShown
        onDismiss={source => {
          setActive(false);
          setResult(
            source === 'complete'
              ? 'Walkthrough completed.'
              : 'Walkthrough dismissed. You can restart it.',
          );
        }}>
        <TourStep targetRef={first} heading="Your collection">
          Open the collection overview to inspect its details.
        </TourStep>
        <TourStep targetRef={second} heading="Review before publishing">
          Keep release checks together in the review checklist.
        </TourStep>
      </Tour>
    </div>
  );
}

const fieldOptions = [
  {value: 'name', label: 'Name'},
  {value: 'status', label: 'Status'},
  {value: 'owner', label: 'Owner'},
  {value: 'updated', label: 'Last updated'},
];
const collectionFieldValues: Readonly<Record<string, string>> = {
  name: 'Evening collection',
  status: 'In review',
  owner: 'Riley Morgan',
  updated: 'Today, 09:30',
};
export function selectedCollectionFields(fields: readonly string[]) {
  return fieldOptions.filter(option => fields.includes(option.value)).map(option => ({
    label: option.label,
    value: collectionFieldValues[option.value],
  }));
}
export function CollectionFieldPreview({title, fields}: {title: string; fields: readonly string[]}) {
  const details = selectedCollectionFields(fields);
  return <section aria-label={title} className="demo-stack">
    <strong>{title}</strong>
    {details.length ? <dl className="collection-field-details">
      {details.map(detail => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}
    </dl> : <p className="demo-copy">No details selected. Add fields to show collection information.</p>}
    <span className="demo-copy" role="status">{details.length} {details.length === 1 ? 'field' : 'fields'} visible</span>
  </section>;
}
export function TransferListPreview() {
  const [fields, setFields] = useState<readonly string[]>(['name', 'status']);
  const [customFields, setCustomFields] = useState<readonly string[]>(['name']);
  return (
    <div className="demo-stack transfer-list-preview">
      <TransferListSelector
        width="min(41rem, 100cqi)"
        label="Visible collection fields"
        options={fieldOptions}
        value={fields}
        onChange={setFields}
        triggerLabel={`${fields.length} visible fields`}
        hasSearch
        hasSelectAll
        hasClear
        commitBehavior="staged"
      />
      <ComplexSelector
        label="Custom field picker"
        triggerLabel={`${customFields.length} custom fields`}
        value={customFields}
        onChange={setCustomFields}>
        {(_value, commit, close) => (
          <div className="demo-stack">
            <Button
              label="Use compact preset"
              onClick={() => commit(['name', 'owner'])}
            />
            <TransferList
              label="Custom visible fields"
              options={fieldOptions}
              value={customFields}
              onChange={commit}
              hasSearch
              hasClear
              hasSelectAll
            />
            <Button label="Done" onClick={close} />
          </div>
        )}
      </ComplexSelector>
      <CollectionFieldPreview title="After Apply" fields={fields} />
      <CollectionFieldPreview title="Immediate changes" fields={customFields} />
      <p className="demo-copy">Choose which details to show. Use Apply to confirm review fields; summary fields update as you select them.</p>
    </div>
  );
}

// Lexical's public serialized state shape: one paragraph and one text node.
const initialRichText = JSON.stringify({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Review the collection, then share your notes.',
            type: 'text',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
});
function ReadOnlyPreviewLabel() {
  const [editor] = useLexicalComposerContext();
  useEffect(
    () =>
      editor.registerRootListener(root => {
        root?.setAttribute('aria-label', 'Rendered collection notes');
      }),
    [editor],
  );
  return null;
}

function RichTextPreview() {
  const [value, setValue] = useState(initialRichText);
  const [linkStatus, setLinkStatus] = useState(
    'Type an email address followed by a space to try auto-linking.',
  );
  return (
    <div className="demo-stack">
      <p className="demo-copy rich-text-scroll-hint">
        More formatting tools → scroll the toolbar horizontally on narrow
        screens.
      </p>
      <RichTextEditor
        label="Collection notes"
        defaultValue={initialRichText}
        onChange={state => setValue(JSON.stringify(state.toJSON()))}
        toolbar={<RichTextEditorToolbar />}
        plugins={
          <RichTextEditorAutoLinkPlugin
            onChange={url =>
              setLinkStatus(
                url
                  ? 'Link added to your notes.'
                  : 'Auto-link removed.',
              )
            }
          />
        }
        maxLength={800}
      />
      <p className="demo-copy" role="status">
        {linkStatus}
      </p>
      <h4 className="demo-label">Read-only preview · updates as you type</h4>
      <RichTextView
        value={value}
        plugins={<ReadOnlyPreviewLabel />}
        errorFallback={
          <p className="demo-copy">The note could not be rendered.</p>
        }
      />
    </div>
  );
}

const material =
  'Public extension components inherit the surrounding Vesper tokens; semantic colors remain distinct.';
export const extensionDemos: Demo[] = [
  {
    id: 'circular-progress',
    name: 'CircularProgress',
    covers: ['CircularProgress'],
    category: 'Feedback',
    description:
      'Adjust a labeled progress ring alongside an indeterminate state.',
    material,
    code: '<CircularProgress label="Collection indexing" value={value} hasValueLabel />',
    Preview: CircularProgressPreview,
  },
  {
    id: 'code-editor',
    name: 'CodeEditor',
    covers: ['CodeEditor'],
    category: 'Forms',
    description:
      'Edit the file, lock it for reading, or restore the original text.',
    material,
    heavy: true,
    code: '<CodeEditor label="Collection configuration" language="javascript" value={code} onChange={setCode} hasLineNumbers />',
    Preview: CodeEditorPreview,
  },
  {
    id: 'drawer',
    name: 'Drawer',
    covers: ['Drawer', 'DrawerHeader'],
    category: 'Overlays',
    description:
      'Inspect and edit collection details in a dismissible side panel.',
    material,
    code: '<Drawer label="Collection inspector" isOpen={open} onOpenChange={setOpen}><DrawerHeader title="Collection inspector" onOpenChange={setOpen} /><Section padding={4}>Inspector content</Section></Drawer>',
    Preview: DrawerPreview,
  },
  {
    id: 'info-tip',
    name: 'InfoTip',
    covers: ['InfoTip'],
    category: 'Feedback',
    description:
      'Focus or hover the information button for concise contextual help.',
    material,
    code: '<InfoTip label="About collection visibility" content="Private collections are only visible to you." />',
    Preview: InfoTipPreview,
  },
  {
    id: 'list-input',
    name: 'ListInput',
    covers: ['ListInput'],
    category: 'Forms',
    description:
      'A controlled checklist with editable cells, add/remove actions, and reordering.',
    material,
    code: '<ListInput label="Release checklist" value={items} onChange={setItems} getItemKey={item => item.id} createItem={createItem} columns={columns} isReorderable />',
    Preview: ListInputPreview,
  },
  {
    id: 'log-stream',
    name: 'LogStream',
    covers: ['LogStream'],
    category: 'Feedback',
    description:
      'Run checks, inspect warnings, and follow new activity.',
    material,
    code: '<LogStream label="Local collection activity" entries={entries} hasTimestamps={false} isFollowing={following} onFollowChange={setFollowing} maxHeight={240} />',
    Preview: LogStreamPreview,
  },
  {
    id: 'mobile-tokenizer',
    name: 'MobileTokenizer',
    covers: ['MobileTokenizer'],
    category: 'Forms',
    description:
      'Choose reviewers using a searchable touch-oriented sheet and removable tokens.',
    material,
    code: '<MobileTokenizer label="Collection reviewers" searchSource={teammateSource} value={value} onChange={setValue} />',
    Preview: MobileTokenizerPreview,
  },
  {
    id: 'rich-text-editor',
    name: 'RichTextEditor',
    covers: [
      'RichTextEditor',
      'RichTextEditorAutoLinkPlugin',
      'RichTextEditorToolbar',
      'RichTextView',
    ],
    category: 'Forms',
    description:
      'Author formatted notes with a real toolbar, automatic links, and a synchronized read-only view.',
    material,
    heavy: true,
    code: '<RichTextEditor label="Collection notes" defaultValue={initialRichText} onChange={state => setValue(JSON.stringify(state.toJSON()))} toolbar={<RichTextEditorToolbar />} plugins={<RichTextEditorAutoLinkPlugin />} /><RichTextView value={value} />',
    Preview: RichTextPreview,
  },
  {
    id: 'schedule',
    name: 'Schedule',
    covers: ['Schedule'],
    category: 'Data',
    description:
      'Browse a three-day agenda in UTC.',
    material,
    heavy: true,
    code: '<Schedule view={scheduleView} events={scheduleEvents} date={date} onChangeDate={setDate} timezoneID="UTC" />',
    Preview: SchedulePreview,
  },
  {
    id: 'stat',
    name: 'Stat',
    covers: ['Stat'],
    category: 'Data',
    description:
      'See how review counts and open issues changed since the last release.',
    material,
    code: '<Stat label="Open issues" value="4" delta={{value: "−3", direction: "down", sentiment: "positive"}} />',
    Preview: StatPreview,
  },
  {
    id: 'svg-icon',
    name: 'SVGIcon',
    covers: ['SVGIcon'],
    category: 'Content',
    description:
      'Switch a public heart icon definition between five native visual variations.',
    material,
    code: '<SVGIcon icon={heartIcon} variation={variation} size="lg" color="accent" aria-hidden="true" />',
    Preview: SVGIconPreview,
  },
  {
    id: 'tour',
    name: 'Tour',
    covers: ['Tour', 'TourStep'],
    category: 'Overlays',
    description:
      'Start, advance, dismiss, and restart a two-step tour anchored to real controls.',
    material,
    code: "// Included local composition, not a package export.\nimport {TourPreview} from './extensionDemos';\n<TourPreview />",
    Preview: TourPreview,
  },
  {
    id: 'transfer-list',
    name: 'TransferList',
    covers: ['TransferList', 'TransferListSelector'],
    category: 'Forms',
    description:
      'Choose collection details and compare Apply-first with immediate changes.',
    material,
    code: '<TransferListSelector label="Visible collection fields" width="min(41rem, 100cqi)" options={fieldOptions} value={fields} onChange={setFields} commitBehavior="staged" /><ComplexSelector label="Custom field picker" value={customFields} onChange={setCustomFields}>{(_value, commit) => <TransferList label="Custom visible fields" options={fieldOptions} value={customFields} onChange={commit} />}</ComplexSelector> // Immediate wrapper: container: vesper-transfer-list / inline-size',
    Preview: TransferListPreview,
  },
];
