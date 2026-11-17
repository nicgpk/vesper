/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Public Astryx component entry points and the surrounding site theme/providers.
 * @output Stateful core previews with inset sheet steps, readable action groups, and collection fixtures.
 * @position Vesper component directory extension; no Storybook runtime or story imports.
 */
import {useId, useState} from 'react';
import type {Demo} from './demos';
import {AppShell} from '@astryxdesign/core/AppShell';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Avatar, AvatarStatusDot} from '@astryxdesign/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {
  BaseTypeahead,
  createStaticSource,
  type SearchableItem,
} from '@astryxdesign/core/Typeahead';
import {Blockquote} from '@astryxdesign/core/Blockquote';
import {BottomSheet, BottomSheetSwitcher} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Card} from '@astryxdesign/core/Card';
import {Carousel} from '@astryxdesign/core/Carousel';
import {Center} from '@astryxdesign/core/Center';
import {CheckIndicator, CheckboxIndicator} from '@astryxdesign/core/Indicator';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Citation} from '@astryxdesign/core/Citation';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Code} from '@astryxdesign/core/Code';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible, CollapsibleGroup} from '@astryxdesign/core/Collapsible';
import {
  CommandPalette,
  CommandPaletteInput,
  CommandPaletteFooter,
  CommandPaletteEmpty,
} from '@astryxdesign/core/CommandPalette';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {ContextMenu, ContextMenuItem} from '@astryxdesign/core/ContextMenu';
import {
  DateRangeInput,
  type DateRange,
} from '@astryxdesign/core/DateRangeInput';
import {
  DateTimeInput,
  type ISODateTimeString,
} from '@astryxdesign/core/DateTimeInput';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuDivider,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSubMenu,
} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Field, FieldLabel, FieldStatus} from '@astryxdesign/core/Field';
import {FileInput} from '@astryxdesign/core/FileInput';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Grid, GridSpan} from '@astryxdesign/core/Grid';
import {TopNav, TopNavHeading} from '@astryxdesign/core/TopNav';
import {SideNav, SideNavItem} from '@astryxdesign/core/SideNav';
import {Section} from '@astryxdesign/core/Section';

const people: SearchableItem[] = [
  {id: 'riley', label: 'Riley Morgan'},
  {id: 'kai', label: 'Kai Ortiz'},
  {id: 'alex', label: 'Alex Chen'},
];
const peopleSource = createStaticSource(people);
const commands = createStaticSource([
  {
    id: 'collections',
    label: 'Open collections',
    auxiliaryData: {group: 'Navigation'},
  },
  {
    id: 'settings',
    label: 'Open settings',
    auxiliaryData: {group: 'Navigation'},
  },
  {id: 'create', label: 'Create collection', auxiliaryData: {group: 'Actions'}},
]);

function AppShellPreview() {
  const [page, setPage] = useState('Overview');
  return (
    <AppShell
      className="preview-app-shell"
      height="fill"
      contentPadding={4}
      mobileNav={{breakpoint: 'md'}}
      topNav={
        <TopNav
          label="Example application"
          heading={<TopNavHeading heading="Collection studio" />}
        />
      }
      sideNav={
        <SideNav aria-label="Example sections">
          {['Overview', 'Library'].map(label => (
            <SideNavItem
              key={label}
              label={label}
              isSelected={page === label}
              onClick={() => setPage(label)}
            />
          ))}
        </SideNav>
      }>
      <div className="demo-stack">
        <h1 className="demo-shell-title">{page}</h1>
        <p className="demo-copy">
          {page === 'Overview'
            ? 'Recent work in your collection studio.'
            : 'Browse the sample collections in this workspace.'}
        </p>
        {['Evening collection', 'Material studies'].map((name, index) => (
          <Card key={name} padding={3}>
            <div className="demo-stack">
              <strong>{name}</strong>
              <p className="demo-copy">
                {index === 0
                  ? 'Draft · Ready for review'
                  : 'Published · Shared with the team'}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
function AspectPreview() {
  const [square, setSquare] = useState(false);
  return (
    <div className="demo-stack">
      <Button
        label={square ? 'Use widescreen ratio' : 'Use square ratio'}
        onClick={() => setSquare(!square)}
      />
      <AspectRatio ratio={square ? 1 : 16 / 9} fit="center">
        <Section
          width="100%"
          height="100%"
          padding={0}
          variant="muted"
          dividers={['top', 'bottom', 'start', 'end']}>
          <Center width="100%" height="100%" padding={4}>
            <div className="demo-stack">
              <strong>Evening collection</strong>
              <p className="demo-copy">
                6 chapters · A study of light after sunset
              </p>
            </div>
          </Center>
        </Section>
      </AspectRatio>
      <p className="demo-copy">
        {square ? 'Square · 1:1' : 'Widescreen · 16:9'} · Centered collection
        cover
      </p>
    </div>
  );
}
function AvatarGroupPreview() {
  const [expanded, setExpanded] = useState(false);
  const [online, setOnline] = useState(true);
  return (
    <div className="demo-stack">
      <AvatarGroup size="lg">
        <Avatar
          name="Riley Morgan"
          status={
            <AvatarStatusDot
              variant={online ? 'success' : 'neutral'}
              label={online ? 'Online' : 'Away'}
            />
          }
        />
        <Avatar name="Kai Ortiz" />
        {expanded ? (
          <>
            <Avatar name="Alex Chen" />
            <Avatar name="Jordan Lee" />
          </>
        ) : (
          <AvatarGroupOverflow count={2} onClick={() => setExpanded(true)} />
        )}
      </AvatarGroup>
      <div className="demo-row">
        <Badge
          variant={online ? 'success' : 'neutral'}
          label={online ? 'Available' : 'Away'}
        />
        <Button
          label="Toggle Riley’s availability"
          onClick={() => setOnline(!online)}
        />
        {expanded && (
          <Button label="Collapse team" onClick={() => setExpanded(false)} />
        )}
      </div>
    </div>
  );
}
function BannerPreview() {
  const [visible, setVisible] = useState(true);
  const [status, setStatus] = useState<
    'info' | 'success' | 'warning' | 'error'
  >('info');
  const messages = {
    info: [
      'Collection sharing is ready',
      'Invite teammates when you are ready to review.',
    ],
    success: [
      'Collection published',
      'Your changes are available to the team.',
    ],
    warning: [
      'Review is required',
      'Check the sharing settings before publishing.',
    ],
    error: [
      'Collection could not be shared',
      'Check your connection and try again.',
    ],
  };
  return (
    <div className="demo-stack">
      {visible ? (
        <Banner
          status={status}
          title={messages[status][0]}
          description={messages[status][1]}
          isDismissable
          onDismiss={() => setVisible(false)}
        />
      ) : (
        <p className="demo-result" role="status">
          Announcement dismissed.
        </p>
      )}
      <Button label="Restore announcement" onClick={() => setVisible(true)} />
      <div className="demo-row">
        {(['info', 'success', 'warning', 'error'] as const).map(value => (
          <Button
            key={value}
            label={`Show ${value} notification`}
            variant={status === value ? 'primary' : 'secondary'}
            onClick={() => {
              setStatus(value);
              setVisible(true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
function BaseTypeaheadPreview() {
  const [person, setPerson] = useState<SearchableItem | null>(null);
  const id = useId();
  return (
    <div className="demo-stack">
      <Field
        label="Find a teammate"
        inputID={id}
        description="Type a name or focus to browse the local directory.">
        <BaseTypeahead
          inputId={id}
          searchSource={peopleSource}
          value={person}
          onChange={setPerson}
          hasEntriesOnFocus
          debounceMs={0}
          placeholder="Search Riley, Kai, or Alex"
        />
      </Field>
      <p className="demo-result" role="status">
        {person ? `Selected: ${person.label}` : 'No teammate selected.'}
      </p>
      <Button label="Clear teammate" onClick={() => setPerson(null)} />
    </div>
  );
}
function SheetSwitcherPreview() {
  const [sheet, setSheet] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  return (
    <div className="demo-stack">
      <Button
        label="Start collection setup"
        onClick={() => setSheet('details')}
      />
      <BottomSheetSwitcher activeSheet={sheet} onActiveSheetChange={setSheet}>
        <BottomSheet sheetId="details" label="Collection details" height="hug">
          <Section padding={6}>
            <div className="demo-stack">
              <h3 className="demo-label">Collection details</h3>
              <p className="demo-copy">
                Create a private collection for your next review.
              </p>
              <Button
                label="Continue to confirmation"
                onClick={() => setSheet('confirm')}
              />
            </div>
          </Section>
        </BottomSheet>
        <BottomSheet sheetId="confirm" label="Confirm collection" height="hug">
          <Section padding={6}>
            <div className="demo-stack">
              <h3 className="demo-label">Ready to create</h3>
              <Button
                label="Back to details"
                onClick={() => setSheet('details')}
              />
              <Button
                label="Create collection"
                variant="primary"
                onClick={() => {
                  setFinished(true);
                  setSheet(null);
                }}
              />
            </div>
          </Section>
        </BottomSheet>
      </BottomSheetSwitcher>
      <p className="demo-result" role="status">
        {finished
          ? 'Collection created locally.'
          : 'Two sheets share one modal flow.'}
      </p>
    </div>
  );
}
function ButtonGroupPreview() {
  const [action, setAction] = useState('No action yet');
  return (
    <div className="demo-stack">
      <ButtonGroup
        className="preview-review-actions"
        label="Review actions"
        orientation="vertical">
        {['Approve', 'Request changes', 'Save draft'].map(label => (
          <Button key={label} label={label} onClick={() => setAction(label)} />
        ))}
      </ButtonGroup>
      <p className="demo-result" role="status">
        {action}
      </p>
    </div>
  );
}
function CarouselPreview() {
  return (
    <div className="demo-stack">
      <Carousel
        aria-label="Collection chapters"
        hasButtons
        hasSnap
        hasEdgeFade
        gap={3}>
        {[
          {
            title: 'Arrival',
            description: 'The last sunlight on the station platform.',
          },
          {
            title: 'Blue hour',
            description: 'Quiet streets between daylight and dusk.',
          },
          {
            title: 'City lights',
            description: 'Neon reflections along the river.',
          },
          {
            title: 'Night garden',
            description: 'Leaves and shadows under the moon.',
          },
          {
            title: 'Afterglow',
            description: 'Warm windows against a violet sky.',
          },
          {
            title: 'Home',
            description: 'A familiar doorway at the end of the walk.',
          },
        ].map(({title, description}, index) => (
          <Card key={title} width={220} padding={4}>
            <div className="demo-stack">
              <Badge label={`Chapter ${index + 1}`} />
              <h3 className="demo-label">{title}</h3>
              <p className="demo-copy">{description}</p>
            </div>
          </Card>
        ))}
      </Carousel>
      <p className="demo-copy">
        Scroll or use the arrows to explore all six chapters.
      </p>
    </div>
  );
}
function IndicatorsPreview() {
  const [selected, setSelected] = useState(true);
  return (
    <div className="demo-stack">
      <Button
        label={selected ? 'Unselect example' : 'Select example'}
        onClick={() => setSelected(!selected)}
      />
      <div className="demo-row">
        <CheckIndicator state={selected ? 'checked' : 'unchecked'} />
        <span className="demo-label">
          Single selection: {selected ? 'selected' : 'not selected'}
        </span>
      </div>
      <div className="demo-row">
        <CheckboxIndicator state={selected ? 'checked' : 'unchecked'} />
        <span className="demo-label">
          Checkbox: {selected ? 'checked' : 'unchecked'}
        </span>
      </div>
      <div className="demo-row">
        <CheckboxIndicator state="indeterminate" />
        <span className="demo-label">Partially selected group</span>
      </div>
      <p className="demo-copy">
        Indicators are decorative visuals; the owning control provides
        interaction and accessible state.
      </p>
    </div>
  );
}
function CheckboxListPreview() {
  const [selected, setSelected] = useState(['design']);
  return (
    <div className="demo-stack">
      <CheckboxList
        label="Review disciplines"
        value={selected}
        onChange={setSelected}
        hasDividers>
        <CheckboxListItem
          value="design"
          label="Design"
          description="Visual direction and interaction"
        />
        <CheckboxListItem
          value="research"
          label="Research"
          description="Evidence and participant feedback"
        />
        <CheckboxListItem
          value="engineering"
          label="Engineering"
          description="Implementation and delivery"
        />
      </CheckboxList>
      <p className="demo-result" role="status">
        {selected.length ? selected.join(', ') : 'No disciplines selected'}
      </p>
    </div>
  );
}
function EditorialPreview() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="demo-stack">
      <Blockquote cite="Collection studio notes">
        Make the next step clear before adding another layer.
      </Blockquote>
      <p className="demo-copy">
        Use <Code>contentPadding</Code> to set the shell’s reading space. Read
        the public source{' '}
        <Citation
          number={1}
          source={{
            title: 'Astryx public repository',
            url: 'https://github.com/facebook/astryx',
          }}
        />
        .
      </p>
      <CodeBlock
        title="A readable surface"
        language="tsx"
        code={'<Card padding={4}>\n  <p>Review notes</p>\n</Card>'}
        hasLineNumbers
        hasCopyButton
        onCopy={() => setCopied(true)}
      />
      <p className="demo-result" role="status">
        {copied
          ? 'Example copied.'
          : 'Copy the example or inspect its line numbers.'}
      </p>
    </div>
  );
}
function EmptyCollectionPreview() {
  const [created, setCreated] = useState(false);
  const [opened, setOpened] = useState(false);
  return (
    <div className="demo-stack">
      {!created ? (
        <EmptyState
          title="No collections yet"
          description="Start with a private space for review notes."
          actions={
            <Button
              label="Create your first collection"
              variant="primary"
              onClick={() => setCreated(true)}
            />
          }
        />
      ) : (
        <ClickableCard
          label="Open evening collection"
          padding={6}
          onClick={() => setOpened(true)}>
          <h3 className="demo-label">Evening collection</h3>
          <p className="demo-copy">A private workspace for your next review.</p>
        </ClickableCard>
      )}
      <p className="demo-result" role="status">
        {opened
          ? 'Evening collection opened locally.'
          : created
            ? 'Select the card to open it.'
            : 'Your collection list is empty.'}
      </p>
      {created && (
        <Button
          label="Reset collection list"
          onClick={() => {
            setCreated(false);
            setOpened(false);
          }}
        />
      )}
    </div>
  );
}
function AccordionPreview() {
  return (
    <CollapsibleGroup type="single" defaultValue="sharing" hasDividers>
      <Collapsible value="sharing" trigger="Who can view this collection?">
        <p className="demo-copy">
          Only invited teammates can view a private collection.
        </p>
      </Collapsible>
      <Collapsible value="exports" trigger="Can I export my notes?">
        <p className="demo-copy">
          You can export a copy whenever you need to share a snapshot.
        </p>
      </Collapsible>
      <Collapsible value="retention" trigger="Where are preview changes saved?">
        <p className="demo-copy">
          These examples keep changes in local component state only.
        </p>
      </Collapsible>
    </CollapsibleGroup>
  );
}
function PalettePreview() {
  const [selected, setSelected] = useState('');
  return (
    <div className="demo-stack">
      <CommandPalette
        isOpen
        isInline
        onOpenChange={() => {}}
        searchSource={commands}
        width="100%"
        label="Collection commands"
        value={selected}
        onValueChange={setSelected}
        input={
          <CommandPaletteInput
            label="Search collection commands"
            placeholder="Search commands; try an unmatched term"
            hasAutoFocus={false}
          />
        }
        footer={
          <CommandPaletteFooter>
            Arrow keys to navigate · Enter to select · Search for “missing” to
            see the empty state
          </CommandPaletteFooter>
        }
        emptySearchText={
          <CommandPaletteEmpty>
            No matching command. Try “collection” or “settings”.
          </CommandPaletteEmpty>
        }
      />
      <p className="demo-result" role="status">
        {selected
          ? `Selected command: ${selected}`
          : 'Choose a command from Navigation or Actions.'}
      </p>
    </div>
  );
}
function ComplexSelectorPreview() {
  const [choice, setChoice] = useState('Private');
  return (
    <div className="demo-stack">
      <ComplexSelector
        label="Collection access"
        value={choice}
        onChange={setChoice}
        triggerLabel={choice}>
        {(value, onChange, close) => (
          <div className="demo-stack">
            {['Private', 'Team', 'Public'].map(label => (
              <Button
                key={label}
                label={`${label}${value === label ? ' (current)' : ''}`}
                onClick={() => {
                  onChange(label);
                  close();
                }}
              />
            ))}
          </div>
        )}
      </ComplexSelector>
      <p className="demo-result" role="status">
        Access: {choice}
      </p>
    </div>
  );
}
function ContextMenuPreview() {
  const [action, setAction] = useState('No action selected');
  return (
    <div className="demo-stack">
      <ContextMenu
        label="Collection context actions"
        menuContent={
          <>
            <ContextMenuItem
              label="Open collection"
              description="View review notes"
              onClick={() => setAction('Opened collection')}
            />
            <ContextMenuItem
              label="Duplicate collection"
              onClick={() => setAction('Created a duplicate')}
            />
          </>
        }>
        <ClickableCard
          label="Open evening collection"
          padding={4}
          onClick={() => setAction('Opened collection')}>
          <div className="demo-stack">
            <strong>Evening collection</strong>
            <p className="demo-copy">6 chapters · Private collection</p>
            <p className="demo-copy">Riley Morgan · Ready for review</p>
          </div>
        </ClickableCard>
      </ContextMenu>
      <p className="demo-copy">
        Right-click or long-press the collection for actions. With the card
        focused, press Shift+F10. Select the card to open it directly.
      </p>
      <p className="demo-result" role="status">
        {action}
      </p>
    </div>
  );
}
function DatesPreview() {
  const [range, setRange] = useState<DateRange | null>(null);
  const [dateTime, setDateTime] = useState<ISODateTimeString | undefined>(
    undefined,
  );
  return (
    <div className="demo-stack">
      <DateRangeInput
        label="Review window"
        value={range}
        onChange={setRange}
        numberOfMonths={1}
        hasClear
      />
      <DateTimeInput
        label="Review meeting"
        value={dateTime}
        onChange={setDateTime}
        hourFormat="24h"
        hasClear
      />
      <p className="demo-result" role="status">
        Window: {range ? `${range.start} – ${range.end}` : 'not set'} · Meeting:{' '}
        {dateTime ?? 'not set'}
      </p>
    </div>
  );
}
function DropdownFamilyPreview() {
  const [notifications, setNotifications] = useState(true);
  const [sort, setSort] = useState('newest');
  const [action, setAction] = useState('No collection action yet');
  return (
    <div className="demo-stack">
      <DropdownMenu button={{label: 'Collection menu'}} menuWidth={260}>
        <DropdownMenuItem
          label="Open collection"
          onClick={() => setAction('Opened collection')}
        />
        <DropdownMenuCheckboxItem
          label="Notify me about updates"
          value={notifications}
          onChange={setNotifications}
          hasCloseOnSelect={false}
        />
        <DropdownMenuDivider />
        <DropdownMenuRadioGroup
          label="Sort collections"
          value={sort}
          onChange={setSort}
          hasCloseOnSelect={false}>
          <DropdownMenuRadioItem value="newest" label="Newest first" />
          <DropdownMenuRadioItem value="oldest" label="Oldest first" />
        </DropdownMenuRadioGroup>
        <DropdownMenuDivider />
        <DropdownMenuSubMenu label="Move to" presentation="flyout">
          <DropdownMenuItem
            label="Favorites"
            onClick={() => setAction('Moved to Favorites')}
          />
          <DropdownMenuItem
            label="Archive"
            onClick={() => setAction('Moved to Archive')}
          />
        </DropdownMenuSubMenu>
      </DropdownMenu>
      <p className="demo-result" role="status">
        {action} · Notifications {notifications ? 'on' : 'off'} · Sort {sort}
      </p>
    </div>
  );
}
function FieldsPreview() {
  const sliderId = useId();
  const notesId = useId();
  const statusId = useId();
  const [confidence, setConfidence] = useState(60);
  const [notes, setNotes] = useState('Ready for review');
  const [files, setFiles] = useState<File | File[] | null>(null);
  return (
    <FormLayout direction="vertical">
      <Field
        label="Review confidence"
        inputID={sliderId}
        description="A custom range control with the shared field wrapper.">
        <input
          id={sliderId}
          type="range"
          min={0}
          max={100}
          value={confidence}
          onChange={event => setConfidence(Number(event.target.value))}
        />
      </Field>
      <div className="demo-stack">
        <FieldLabel label="Reviewer note" inputID={notesId} />
        <input
          id={notesId}
          value={notes}
          aria-describedby={statusId}
          onChange={event => setNotes(event.target.value)}
        />
        <FieldStatus
          id={statusId}
          type={notes.trim() ? 'success' : 'warning'}
          message={
            notes.trim()
              ? 'Note is ready to share.'
              : 'Add a note before sharing.'
          }
          variant="detached"
        />
      </div>
      <FileInput
        label="Attach review material"
        value={files}
        onChange={setFiles}
        accept=".txt,.md,.pdf"
        mode="dropzone"
        maxSize={5000000}
        description="Text, Markdown, or PDF. Files stay in this preview; nothing is uploaded."
      />
      <p className="demo-result" role="status">
        Confidence: {confidence}% ·{' '}
        {files
          ? Array.isArray(files)
            ? files.map(file => file.name).join(', ')
            : files.name
          : 'No attachment selected'}
      </p>
    </FormLayout>
  );
}
function GridPreview() {
  const [full, setFull] = useState(true);
  return (
    <div className="demo-stack">
      <Button
        label={full ? 'Span one column' : 'Span full row'}
        onClick={() => setFull(!full)}
      />
      <Grid columns={2} gap={3}>
        <GridSpan columns={full ? 'full' : 1}>
          <Card padding={4}>
            <h3 className="demo-label">Featured collection</h3>
            <p className="demo-copy">This item changes its column span.</p>
          </Card>
        </GridSpan>
        <Card padding={4}>Review notes</Card>
        <Card padding={4}>References</Card>
      </Grid>
    </div>
  );
}

const defineDemo = (demo: Demo & {covers: string[]}) => demo;
const material =
  'Public Astryx components on the Vesper surface; semantic and selected states retain their native signals.';

export const coreBasicDemos: Demo[] = [
  defineDemo({
    id: 'app-shell',
    name: 'AppShell',
    category: 'Layout',
    covers: ['AppShell'],
    description:
      'An application frame with working section navigation, header, and content landmarks.',
    material,
    code: `// Preview host: .preview-app-shell { height: 360px; min-height: 0; }\n<AppShell className="preview-app-shell" height="fill" contentPadding={4} mobileNav={{breakpoint: 'md'}}\n  topNav={<TopNav label="Example application" heading={<TopNavHeading heading="Collection studio" />} />}\n  sideNav={<SideNav aria-label="Example sections">\n    {['Overview', 'Library'].map(label => <SideNavItem key={label} label={label}\n      isSelected={page === label} onClick={() => setPage(label)} />)}\n  </SideNav>}>\n  <h1>{page}</h1>\n</AppShell>`,
    Preview: AppShellPreview,
  }),
  defineDemo({
    id: 'aspect-ratio',
    name: 'AspectRatio & Center',
    category: 'Layout',
    covers: ['AspectRatio', 'Center'],
    description:
      'A bounded collection cover switches between square and widescreen while its title and chapter summary stay centered.',
    material,
    code: `<Button label="Change ratio" onClick={() => setSquare(!square)} />\n<AspectRatio ratio={square ? 1 : 16 / 9} fit="center">\n  <Section width="100%" height="100%" padding={0} variant="muted"\n    dividers={['top', 'bottom', 'start', 'end']}>\n    <Center width="100%" height="100%" padding={4}>\n      <div className="demo-stack">\n        <strong>Evening collection</strong>\n        <p>6 chapters · A study of light after sunset</p>\n      </div>\n    </Center>\n  </Section>\n</AspectRatio>\n<p>{square ? 'Square · 1:1' : 'Widescreen · 16:9'} · Centered collection cover</p>`,
    Preview: AspectPreview,
  }),
  defineDemo({
    id: 'avatar-group',
    name: 'AvatarGroup & presence',
    category: 'Data display',
    covers: ['AvatarGroup', 'AvatarGroupOverflow', 'AvatarStatusDot', 'Badge'],
    description:
      'An overlapping team, clickable overflow, and a live availability badge.',
    material,
    code: `<AvatarGroup size="lg">\n  <Avatar name="Riley Morgan" status={<AvatarStatusDot\n    variant={online ? 'success' : 'neutral'} label={online ? 'Online' : 'Away'} />} />\n  <Avatar name="Kai Ortiz" />\n  {expanded ? <><Avatar name="Alex Chen" /><Avatar name="Jordan Lee" /></>\n    : <AvatarGroupOverflow count={2} onClick={() => setExpanded(true)} />}\n</AvatarGroup>\n<Badge variant={online ? 'success' : 'neutral'} label={online ? 'Available' : 'Away'} />\n<Button label="Toggle availability" onClick={() => setOnline(!online)} />`,
    Preview: AvatarGroupPreview,
  }),
  defineDemo({
    id: 'banner',
    name: 'Banner',
    category: 'Feedback',
    covers: ['Banner'],
    description: 'A dismissible announcement with a local restore control.',
    material,
    code: `{visible && <Banner status="info" title="Collection sharing is ready"\n  description="Invite teammates when you are ready to review."\n  isDismissable onDismiss={() => setVisible(false)} />}\n<Button label="Restore announcement" onClick={() => setVisible(true)} />`,
    Preview: BannerPreview,
  }),
  defineDemo({
    id: 'base-typeahead',
    name: 'BaseTypeahead',
    category: 'Inputs',
    covers: ['BaseTypeahead'],
    description:
      'The low-level typeahead inside a labelled field, with real local search and selection feedback.',
    material,
    code: `const peopleSource = createStaticSource([\n  {id: 'riley', label: 'Riley Morgan'}, {id: 'kai', label: 'Kai Ortiz'}, {id: 'alex', label: 'Alex Chen'},\n]);\n<Field label="Find a teammate" inputID={id}>\n  <BaseTypeahead inputId={id} searchSource={peopleSource} value={person}\n    onChange={setPerson} hasEntriesOnFocus debounceMs={0} />\n</Field>`,
    Preview: BaseTypeaheadPreview,
  }),
  defineDemo({
    id: 'bottom-sheet-switcher',
    name: 'BottomSheetSwitcher',
    category: 'Overlays',
    covers: ['BottomSheetSwitcher'],
    description:
      'A two-step collection setup flow sharing one bottom-sheet host, with back and finish actions.',
    material,
    code: `<Button label="Start collection setup" onClick={() => setSheet('details')} />\n<BottomSheetSwitcher activeSheet={sheet} onActiveSheetChange={setSheet}>\n  <BottomSheet sheetId="details" label="Collection details" height="hug">\n    <Section padding={6}><div className="demo-stack">\n      <h3>Collection details</h3>\n      <p>Create a private collection for your next review.</p>\n      <Button label="Continue to confirmation" onClick={() => setSheet('confirm')} />\n    </div></Section>\n  </BottomSheet>\n  <BottomSheet sheetId="confirm" label="Confirm collection" height="hug">\n    <Section padding={6}><div className="demo-stack">\n      <h3>Ready to create</h3>\n      <Button label="Back to details" onClick={() => setSheet('details')} />\n      <Button label="Create collection" variant="primary" onClick={() => {setFinished(true); setSheet(null);}} />\n    </div></Section>\n  </BottomSheet>\n</BottomSheetSwitcher>`,
    Preview: SheetSwitcherPreview,
  }),
  defineDemo({
    id: 'button-group',
    name: 'ButtonGroup',
    category: 'Actions',
    covers: ['ButtonGroup'],
    description:
      'Vertically connected review actions keep complete labels at narrow widths, with shared keyboard navigation and live feedback.',
    material,
    code: `<ButtonGroup className="preview-review-actions" label="Review actions" orientation="vertical">\n  {['Approve', 'Request changes', 'Save draft'].map(label =>\n    <Button key={label} label={label} onClick={() => setAction(label)} />)}\n</ButtonGroup>\n<p role="status">{action}</p>`,
    Preview: ButtonGroupPreview,
  }),
  defineDemo({
    id: 'carousel',
    name: 'Carousel',
    category: 'Layout',
    covers: ['Carousel'],
    description:
      'Six compact chapter cards with distinct scene summaries, native scrolling, snap points, and navigation arrows.',
    material,
    code: `// Each chapter has a title and its own scene summary.\n<Carousel aria-label="Collection chapters" hasButtons hasSnap hasEdgeFade gap={3}>\n  {chapters.map(({title, description}, index) =>\n    <Card key={title} width={220} padding={4}>\n      <div className="demo-stack">\n        <Badge label={'Chapter ' + (index + 1)} />\n        <h3>{title}</h3><p>{description}</p>\n      </div>\n    </Card>)}\n</Carousel>\n<p>Scroll or use the arrows to explore all six chapters.</p>`,
    Preview: CarouselPreview,
  }),
  defineDemo({
    id: 'selection-indicators',
    name: 'Selection indicators',
    category: 'Inputs',
    covers: ['CheckIndicator', 'CheckboxIndicator'],
    description:
      'Decorative selected, unselected, and mixed visuals driven by a real state-changing button.',
    material,
    code: `<Button label="Toggle selection" onClick={() => setSelected(!selected)} />\n<CheckIndicator state={selected ? 'checked' : 'unchecked'} />\n<CheckboxIndicator state={selected ? 'checked' : 'unchecked'} />\n<CheckboxIndicator state="indeterminate" />`,
    Preview: IndicatorsPreview,
  }),
  defineDemo({
    id: 'checkbox-list',
    name: 'CheckboxList',
    category: 'Inputs',
    covers: ['CheckboxList', 'CheckboxListItem'],
    description:
      'A labelled multi-selection list with descriptions and a live selection summary.',
    material,
    code: `<CheckboxList label="Review disciplines" value={selected} onChange={setSelected} hasDividers>\n  <CheckboxListItem value="design" label="Design" description="Visual direction and interaction" />\n  <CheckboxListItem value="research" label="Research" description="Evidence and participant feedback" />\n  <CheckboxListItem value="engineering" label="Engineering" description="Implementation and delivery" />\n</CheckboxList>`,
    Preview: CheckboxListPreview,
  }),
  defineDemo({
    id: 'editorial-content',
    name: 'Editorial & code',
    category: 'Typography',
    covers: ['Blockquote', 'Citation', 'Code', 'CodeBlock'],
    description:
      'A quotation, cited reference, inline code, and copyable numbered source block in one reading context.',
    material,
    code: `<Blockquote cite="Collection studio notes">Make the next step clear before adding another layer.</Blockquote>\n<p>Use <Code>contentPadding</Code> for reading space.\n  <Citation number={1} source={{title: 'Astryx public repository', url: 'https://github.com/facebook/astryx'}} />\n</p>\n<CodeBlock title="A readable surface" language="tsx"\n  code={'<Card padding={4}>\\n  <p>Review notes</p>\\n</Card>'}\n  hasLineNumbers hasCopyButton onCopy={() => setCopied(true)} />`,
    Preview: EditorialPreview,
  }),
  defineDemo({
    id: 'empty-collection',
    name: 'EmptyState & ClickableCard',
    category: 'Data display',
    covers: ['EmptyState', 'ClickableCard'],
    description:
      'Create an item from an empty state, then interact with its real clickable card; reset to repeat.',
    material,
    code: `{!created ? <EmptyState title="No collections yet"\n  description="Start with a private space for review notes."\n  actions={<Button label="Create your first collection" onClick={() => setCreated(true)} />} />\n  : <ClickableCard label="Open evening collection" padding={6} onClick={() => setOpened(true)}>\n      <h3>Evening collection</h3><p>A private workspace for your next review.</p>\n    </ClickableCard>}`,
    Preview: EmptyCollectionPreview,
  }),
  defineDemo({
    id: 'collapsible-group',
    name: 'CollapsibleGroup',
    category: 'Disclosure',
    covers: ['CollapsibleGroup'],
    description:
      'A real single-open accordion linking three collection-help disclosures.',
    material,
    code: `<CollapsibleGroup type="single" defaultValue="sharing" hasDividers>\n  <Collapsible value="sharing" trigger="Who can view this collection?">Only invited teammates.</Collapsible>\n  <Collapsible value="exports" trigger="Can I export my notes?">Export a snapshot whenever needed.</Collapsible>\n  <Collapsible value="retention" trigger="Where are changes saved?">Local component state only.</Collapsible>\n</CollapsibleGroup>`,
    Preview: AccordionPreview,
  }),
  defineDemo({
    id: 'command-palette',
    name: 'CommandPalette family',
    category: 'Navigation',
    covers: [
      'CommandPalette',
      'CommandPaletteInput',
      'CommandPaletteList',
      'CommandPaletteGroup',
      'CommandPaletteItem',
      'CommandPaletteEmpty',
      'CommandPaletteFooter',
    ],
    description:
      'An inline command picker: the root renders its actual List, Group, and Item components from grouped search data. Search an unmatched term for Empty.',
    material,
    code: `const commands = createStaticSource([\n  {id: 'collections', label: 'Open collections', auxiliaryData: {group: 'Navigation'}},\n  {id: 'settings', label: 'Open settings', auxiliaryData: {group: 'Navigation'}},\n  {id: 'create', label: 'Create collection', auxiliaryData: {group: 'Actions'}},\n]);\n// CommandPalette renders CommandPaletteList, CommandPaletteGroup, and\n// CommandPaletteItem from this source, preserving shared keyboard behavior.\n<CommandPalette isOpen isInline onOpenChange={() => {}} searchSource={commands}\n  width="100%" value={selected} onValueChange={setSelected}\n  input={<CommandPaletteInput label="Search collection commands" hasAutoFocus={false} />}\n  footer={<CommandPaletteFooter>Arrow keys to navigate · Enter to select</CommandPaletteFooter>}\n  emptySearchText={<CommandPaletteEmpty>No matching command.</CommandPaletteEmpty>} />`,
    Preview: PalettePreview,
  }),
  defineDemo({
    id: 'complex-selector',
    name: 'ComplexSelector',
    category: 'Inputs',
    covers: ['ComplexSelector'],
    description:
      'A rich access picker using the public render function to commit a value and close the popover.',
    material,
    code: `<ComplexSelector label="Collection access" value={choice} onChange={setChoice} triggerLabel={choice}>\n  {(value, onChange, close) => <div className="demo-stack">\n    {['Private', 'Team', 'Public'].map(label => <Button key={label}\n      label={label + (value === label ? ' (current)' : '')}\n      onClick={() => {onChange(label); close();}} />)}\n  </div>}\n</ComplexSelector>`,
    Preview: ComplexSelectorPreview,
  }),
  defineDemo({
    id: 'context-menu',
    name: 'ContextMenu',
    category: 'Navigation',
    covers: ['ContextMenu', 'ContextMenuItem'],
    description:
      'A collection card with owner and chapter metadata opens directly or exposes compound actions by right-click, long-press, or keyboard.',
    material,
    code: `<ContextMenu label="Collection context actions" menuContent={<>\n  <ContextMenuItem label="Open collection" description="View review notes" onClick={() => setAction('Opened collection')} />\n  <ContextMenuItem label="Duplicate collection" onClick={() => setAction('Created a duplicate')} />\n</>}>\n  <ClickableCard label="Open evening collection" padding={4} onClick={() => setAction('Opened collection')}>\n    <div className="demo-stack">\n      <strong>Evening collection</strong>\n      <p>6 chapters · Private collection</p>\n      <p>Riley Morgan · Ready for review</p>\n    </div>\n  </ClickableCard>\n</ContextMenu>\n<p>Right-click or long-press for actions; focus the card and press Shift+F10. Select to open directly.</p>`,
    Preview: ContextMenuPreview,
  }),
  defineDemo({
    id: 'date-range-and-time',
    name: 'DateRangeInput & DateTimeInput',
    category: 'Inputs',
    covers: ['DateRangeInput', 'DateTimeInput'],
    description:
      'A review date window and meeting date/time, with controlled values and clear actions.',
    material,
    code: `<DateRangeInput label="Review window" value={range} onChange={setRange} numberOfMonths={1} hasClear />\n<DateTimeInput label="Review meeting" value={dateTime} onChange={setDateTime} hourFormat="24h" hasClear />`,
    Preview: DatesPreview,
  }),
  defineDemo({
    id: 'dropdown-menu-family',
    name: 'DropdownMenu members',
    category: 'Navigation',
    covers: [
      'DropdownMenuItem',
      'DropdownMenuCheckboxItem',
      'DropdownMenuDivider',
      'DropdownMenuRadioGroup',
      'DropdownMenuRadioItem',
      'DropdownMenuSubMenu',
    ],
    description:
      'Open the menu to toggle notifications, choose a radio sort order, or enter a real move-to submenu.',
    material,
    code: `<DropdownMenu button={{label: 'Collection menu'}}>\n  <DropdownMenuItem label="Open collection" onClick={() => setAction('Opened collection')} />\n  <DropdownMenuCheckboxItem label="Notify me about updates" value={notifications}\n    onChange={setNotifications} hasCloseOnSelect={false} />\n  <DropdownMenuDivider />\n  <DropdownMenuRadioGroup label="Sort collections" value={sort} onChange={setSort} hasCloseOnSelect={false}>\n    <DropdownMenuRadioItem value="newest" label="Newest first" />\n    <DropdownMenuRadioItem value="oldest" label="Oldest first" />\n  </DropdownMenuRadioGroup>\n  <DropdownMenuDivider />\n  <DropdownMenuSubMenu label="Move to" presentation="flyout">\n    <DropdownMenuItem label="Favorites" onClick={() => setAction('Moved to Favorites')} />\n    <DropdownMenuItem label="Archive" onClick={() => setAction('Moved to Archive')} />\n  </DropdownMenuSubMenu>\n</DropdownMenu>`,
    Preview: DropdownFamilyPreview,
  }),
  defineDemo({
    id: 'form-field-family',
    name: 'Fields & file input',
    category: 'Inputs',
    covers: ['Field', 'FieldLabel', 'FieldStatus', 'FileInput', 'FormLayout'],
    description:
      'A custom range in Field, explicitly linked label and validation status, and a working local-only file dropzone.',
    material,
    code: `<FormLayout direction="vertical">\n  <Field label="Review confidence" inputID={sliderId}>\n    <input id={sliderId} type="range" min={0} max={100} value={confidence}\n      onChange={event => setConfidence(Number(event.target.value))} />\n  </Field>\n  <div className="demo-stack">\n    <FieldLabel label="Reviewer note" inputID={notesId} />\n    <input id={notesId} value={notes} aria-describedby={statusId} onChange={event => setNotes(event.target.value)} />\n    <FieldStatus id={statusId} type={notes.trim() ? 'success' : 'warning'}\n      message={notes.trim() ? 'Note is ready to share.' : 'Add a note before sharing.'} variant="detached" />\n  </div>\n  <FileInput label="Attach review material" value={files} onChange={setFiles}\n    accept=".txt,.md,.pdf" mode="dropzone" maxSize={5000000} />\n</FormLayout>`,
    Preview: FieldsPreview,
  }),
  defineDemo({
    id: 'grid',
    name: 'Grid & GridSpan',
    category: 'Layout',
    covers: ['Grid', 'GridSpan'],
    description:
      'A two-column card grid with a featured card that can span the entire row.',
    material,
    code: `<Button label="Change span" onClick={() => setFull(!full)} />\n<Grid columns={2} gap={3}>\n  <GridSpan columns={full ? 'full' : 1}><Card padding={4}>Featured collection</Card></GridSpan>\n  <Card padding={4}>Review notes</Card><Card padding={4}>References</Card>\n</Grid>`,
    Preview: GridPreview,
  }),
];
