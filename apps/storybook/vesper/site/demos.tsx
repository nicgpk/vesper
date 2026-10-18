/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Public built Astryx components and the surrounding Vesper theme/providers.
 * @output Full family coverage with truthful interactions and padded overlay previews.
 * @position Vesper Pages component directory; no Storybook runtime or story imports.
 */
import {useId, useState, type ComponentType, type ComponentProps} from 'react';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Calendar, type ISODateString} from '@astryxdesign/core/Calendar';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {DateInput} from '@astryxdesign/core/DateInput';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {HoverCard} from '@astryxdesign/core/HoverCard';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MultiSelector} from '@astryxdesign/core/MultiSelector';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Popover} from '@astryxdesign/core/Popover';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Section} from '@astryxdesign/core/Section';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tokenizer} from '@astryxdesign/core/Tokenizer';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {coreBasicDemos} from './coreBasicDemos';
import {coreContentDemos} from './coreContentDemos';
import {navigationDemos} from './navigationDemos';
import {chatDemos} from './chatDemos';
import {chartDemos} from './chartDemos';
import {extensionDemos} from './extensionDemos';

export type Demo = {
  id: string;
  name: string;
  category: string;
  description: string;
  material: string;
  /** Meaningful excerpt of the live preview; state belongs to the caller. */
  code: string;
  Preview: ComponentType;
  /** Public component symbols visibly demonstrated together by this example. */
  covers?: string[];
  /** Identifies expensive graphics and editors for preview hosts and diagnostics. */
  heavy?: boolean;
};
const lens =
  'Neutral surfaces use the Vesper lens; selected and semantic states keep a solid signal.';
const options = [
  {value: 'design', label: 'Design'},
  {value: 'research', label: 'Research'},
  {value: 'engineering', label: 'Engineering'},
];
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

function AlertDialogPreview() {
  const [open, setOpen] = useState(false);
  const [archived, setArchived] = useState(false);
  return (
    <div className="demo-stack">
      <Button label="Archive collection" onClick={() => setOpen(true)} />
      <p className="demo-result" role="status">
        {archived
          ? 'Collection archived in this preview.'
          : 'Your collection is active.'}
      </p>
      <AlertDialog
        isOpen={open}
        onOpenChange={setOpen}
        title="Archive this collection?"
        description="This local preview keeps all your files. You can continue exploring after closing."
        actionLabel="Archive collection"
        onAction={() => {
          setArchived(true);
          setOpen(false);
        }}
      />
    </div>
  );
}
function AvatarPreview() {
  const [person, setPerson] = useState('riley');
  const name = people.find(item => item.id === person)?.label ?? 'Riley Morgan';
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Avatar name={name} shape="rounded" size="lg" />
        <span className="demo-label">{name}</span>
      </div>
      <Selector
        label="Preview a teammate"
        value={person}
        onChange={setPerson}
        options={people.map(item => ({value: item.id, label: item.label}))}
      />
    </div>
  );
}
function BottomSheetPreview() {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState(true);
  return (
    <div className="demo-stack">
      <Button label="Collection filters" onClick={() => setOpen(true)} />
      <BottomSheet
        label="Collection filters"
        isOpen={open}
        onOpenChange={setOpen}
        height="hug">
        <Section padding={6}>
          <div className="demo-stack">
            <h3 className="demo-label">Collection filters</h3>
            <Switch
              label="Recently updated only"
              value={recent}
              onChange={setRecent}
            />
            <Button
              label="Apply filters"
              variant="primary"
              onClick={() => setOpen(false)}
            />
          </div>
        </Section>
      </BottomSheet>
      <p className="demo-result">
        {recent ? 'Showing recent updates' : 'Showing all collections'}
      </p>
    </div>
  );
}
function BreadcrumbsPreview() {
  const [location, setLocation] = useState('Evening collection');
  return (
    <div className="demo-stack">
      <Breadcrumbs label="Collection location">
        <BreadcrumbItem
          menu={[
            {label: 'Workspace', onClick: () => setLocation('Workspace')},
            {label: 'Collections', onClick: () => setLocation('Collections')},
          ]}>
          Workspace
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>{location}</BreadcrumbItem>
      </Breadcrumbs>
      <p className="demo-copy">
        Open the workspace crumb to move within this local preview.
      </p>
    </div>
  );
}
function ButtonPreview() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Button
          label={saved ? 'Saved' : 'Save changes'}
          variant="primary"
          onClick={() => setSaved(true)}
        />
        <Button label="Reset" onClick={() => setSaved(false)} />
      </div>
      <p role="status" className="demo-result">
        {saved ? 'Changes saved locally.' : 'A few changes are waiting.'}
      </p>
    </div>
  );
}
function CalendarPreview() {
  const [date, setDate] = useState<ISODateString>('2026-11-01');
  return (
    <div className="demo-stack">
      <Calendar
        mode="single"
        value={date}
        onChange={setDate}
        weekStartsOn="mon"
      />
      <p className="demo-result" role="status">
        Review date: {date}
      </p>
    </div>
  );
}
function CardPreview() {
  const [saved, setSaved] = useState(false);
  return (
    <Card width="100%">
      <div className="demo-stack">
        <h3 className="demo-label">Evening collection</h3>
        <p className="demo-copy">A quiet place for the next round of ideas.</p>
        <Button
          label={saved ? 'Added to workspace' : 'Add to workspace'}
          onClick={() => setSaved(value => !value)}
        />
      </div>
    </Card>
  );
}
function CheckboxPreview() {
  const [snap, setSnap] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [mixed, setMixed] = useState<boolean | 'indeterminate'>(
    'indeterminate',
  );
  return (
    <div className="demo-stack">
      <CheckboxInput label="Snap to grid" value={snap} onChange={setSnap} />
      <CheckboxInput
        label="Show hidden files"
        value={hidden}
        onChange={setHidden}
      />
      <CheckboxInput label="Shared folders" value={mixed} onChange={setMixed} />
      <CheckboxInput label="Managed by workspace" value={true} isDisabled />
    </div>
  );
}
function CollapsiblePreview() {
  const [open, setOpen] = useState(true);
  return (
    <div className="demo-stack">
      <Collapsible
        trigger="What is in this collection?"
        isOpen={open}
        onOpenChange={setOpen}>
        <p className="demo-copy">
          Notes, material studies, and a few ideas ready for review.
        </p>
      </Collapsible>
      <Collapsible trigger="Who can see it?" defaultIsOpen={false}>
        <p className="demo-copy">Only people you invite to the workspace.</p>
      </Collapsible>
    </div>
  );
}
function DateInputPreview() {
  const [date, setDate] =
    useState<ComponentProps<typeof DateInput>['value']>('2026-11-01');
  return (
    <div className="demo-stack">
      <DateInput label="Release date" value={date} onChange={setDate} />
      <p className="demo-copy">Choose a day for the next collection review.</p>
    </div>
  );
}
function DialogPreview() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Evening collection');
  return (
    <div className="demo-stack">
      <Button label="Edit collection" onClick={() => setOpen(true)} />
      <p className="demo-result">{name || 'Untitled collection'}</p>
      <Dialog isOpen={open} onOpenChange={setOpen} width={420}>
        <DialogHeader title="Edit collection" onOpenChange={setOpen} />
        <div className="demo-stack">
          <TextInput label="Collection name" value={name} onChange={setName} />
          <Button
            label="Done"
            variant="primary"
            onClick={() => setOpen(false)}
          />
        </div>
      </Dialog>
    </div>
  );
}
function DividerPreview() {
  const [strong, setStrong] = useState(false);
  return (
    <div className="demo-stack">
      <p className="demo-label">Workspace notes</p>
      <Divider label="Today" variant={strong ? 'strong' : 'subtle'} />
      <p className="demo-copy">Your next review is ready.</p>
      <Switch label="Stronger separator" value={strong} onChange={setStrong} />
    </div>
  );
}
function DropdownMenuPreview() {
  const [action, setAction] = useState('No action selected');
  return (
    <div className="demo-stack">
      <DropdownMenu
        button={{label: 'Collection actions'}}
        items={[
          {
            label: 'Save collection',
            onClick: () => setAction('Collection saved locally'),
          },
          {
            label: 'Duplicate collection',
            onClick: () => setAction('A local copy is ready'),
          },
          {
            label: 'Move to archive',
            onClick: () => setAction('Collection moved to the local archive'),
          },
        ]}
      />
      <p className="demo-result" role="status">
        {action}
      </p>
    </div>
  );
}
function HoverCardPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="demo-stack">
      <HoverCard
        label="Riley Morgan profile"
        touchTrigger="tap"
        onOpenChange={setOpen}
        content={
          <div className="demo-stack">
            <Avatar name="Riley Morgan" size="lg" />
            <strong>Riley Morgan</strong>
            <p className="demo-copy">Design partner · Evening collection</p>
          </div>
        }>
        <Button label="Riley Morgan" variant="ghost" />
      </HoverCard>
      <p className="demo-copy">
        {open
          ? 'Profile preview is open.'
          : 'Hover or focus to preview your teammate.'}
      </p>
    </div>
  );
}
function IconButtonPreview() {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('Ready to copy a collection link.');
  async function copyCollectionLink() {
    try {
      await navigator.clipboard.writeText(
        new URL('#/components/card', window.location.href).href,
      );
      setCopied(true);
      setMessage('Collection link copied.');
    } catch {
      setCopied(false);
      setMessage('Copy unavailable. Open the collection link below.');
    }
  }
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <IconButton
          label="Copy collection link"
          tooltip="Copy collection link"
          icon={<Icon icon={copied ? 'check' : 'copy'} />}
          onClick={copyCollectionLink}
        />
        <Button
          label="Reset"
          variant="ghost"
          onClick={() => {
            setCopied(false);
            setMessage('Ready to copy a collection link.');
          }}
        />
      </div>
      <p className="demo-result" role="status">
        {message}
      </p>
      <a href="#/components/card">Open the collection</a>
    </div>
  );
}
function MultiSelectorPreview() {
  const [audience, setAudience] = useState(['design']);
  return (
    <div className="demo-stack">
      <MultiSelector
        label="Review teams"
        value={audience}
        onChange={setAudience}
        options={options}
      />
      <p className="demo-result">{audience.length} teams selected</p>
    </div>
  );
}
function NumberInputPreview() {
  const [quantity, setQuantity] = useState(12);
  return (
    <div className="demo-stack">
      <NumberInput
        label="Edition size"
        value={quantity}
        onChange={setQuantity}
        min={1}
        max={100}
      />
      <p className="demo-result">{quantity} copies in this edition</p>
    </div>
  );
}
function PopoverPreview() {
  const [read, setRead] = useState(false);
  return (
    <div className="demo-stack">
      <Popover
        label="Workspace activity"
        width={260}
        content={
          <div className="demo-stack">
            <strong>{read ? 'All caught up' : 'A collection is ready'}</strong>
            <p className="demo-copy">
              Riley shared a new set of material studies.
            </p>
            <Button label="Mark as read" onClick={() => setRead(true)} />
          </div>
        }>
        <Button label={read ? 'Activity · caught up' : 'Workspace activity'} />
      </Popover>
    </div>
  );
}
function ProgressBarPreview() {
  const [progress, setProgress] = useState(24);
  return (
    <div className="demo-stack">
      <ProgressBar label="Collection upload" value={progress} />
      <p className="demo-result" role="status">
        {progress}% complete
      </p>
      <div className="demo-row">
        <Button
          label="Advance upload"
          onClick={() => setProgress(value => Math.min(100, value + 20))}
          isDisabled={progress === 100}
        />
        <Button label="Reset" variant="ghost" onClick={() => setProgress(0)} />
      </div>
    </div>
  );
}
function RadioListPreview() {
  const [access, setAccess] = useState('invited');
  return (
    <div className="demo-stack">
      <RadioList label="Collection access" value={access} onChange={setAccess}>
        <RadioListItem
          value="invited"
          label="Invited people"
          description="Keep the review within your team."
        />
        <RadioListItem
          value="workspace"
          label="Workspace"
          description="Let everyone in the workspace explore."
        />
      </RadioList>
    </div>
  );
}
function SegmentedControlPreview() {
  const [view, setView] = useState('grid');
  return (
    <div className="demo-stack">
      <SegmentedControl label="Collection view" value={view} onChange={setView}>
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>
      <p className="demo-result">Current view: {view}</p>
    </div>
  );
}
function SelectorPreview() {
  const [team, setTeam] = useState('design');
  return (
    <div className="demo-stack">
      <Selector
        label="Owning team"
        value={team}
        onChange={setTeam}
        options={options}
      />
      <p className="demo-copy">
        Choose the team responsible for the next review.
      </p>
    </div>
  );
}
function SliderPreview() {
  const [volume, setVolume] = useState(62);
  return (
    <div className="demo-stack">
      <Slider
        label="Ambient volume"
        value={volume}
        onChange={setVolume}
        min={0}
        max={100}
      />
      <p className="demo-result">{volume}% volume</p>
    </div>
  );
}
function SwitchPreview() {
  const [sync, setSync] = useState(true);
  const [quiet, setQuiet] = useState(false);
  return (
    <div className="demo-stack">
      <Switch
        label="Sync collections"
        value={sync}
        onChange={setSync}
        labelPosition="start"
        labelSpacing="spread"
      />
      <Switch
        label="Quiet hours"
        value={quiet}
        onChange={setQuiet}
        labelPosition="start"
        labelSpacing="spread"
      />
      <Switch label="Managed setting" value={false} isDisabled />
    </div>
  );
}
function TabsPreview() {
  const id = useId();
  const [tab, setTab] = useState('notes');
  return (
    <div className="demo-stack">
      <TabList
        role="tablist"
        aria-label="Collection details"
        value={tab}
        onChange={setTab}
        hasDivider={false}>
        <Tab
          id={`${id}-notes`}
          panelId={`${id}-panel`}
          value="notes"
          label="Notes"
        />
        <Tab
          id={`${id}-activity`}
          panelId={`${id}-panel`}
          value="activity"
          label="Activity"
        />
      </TabList>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${tab}`}
        tabIndex={0}
        className="demo-copy">
        {tab === 'notes'
          ? 'A collection of quiet, considered surfaces.'
          : 'Riley added three material studies.'}
      </div>
    </div>
  );
}
function TextAreaPreview() {
  const [notes, setNotes] = useState(
    'A collection of quiet, considered surfaces.',
  );
  return (
    <div className="demo-stack">
      <TextArea label="Collection notes" value={notes} onChange={setNotes} />
      <p className="demo-result">{notes.length} characters</p>
    </div>
  );
}
function TextInputPreview() {
  const [name, setName] = useState('Evening collection');
  return (
    <div className="demo-stack">
      <TextInput
        label="Collection name"
        value={name}
        onChange={setName}
        hasClear
        placeholder="Name your collection"
      />
      <p className="demo-result">{name || 'Untitled collection'}</p>
    </div>
  );
}
function ToggleButtonPreview() {
  const [pinned, setPinned] = useState(false);
  return (
    <div className="demo-stack">
      <ToggleButton
        label="Pin collection"
        isPressed={pinned}
        onPressedChange={setPinned}
      />
      <p className="demo-result">
        {pinned ? 'Pinned to your workspace' : 'Not pinned'}
      </p>
    </div>
  );
}
function TokenizerPreview() {
  const [reviewers, setReviewers] = useState([people[0]]);
  return (
    <div className="demo-stack">
      <Tokenizer
        label="Reviewers"
        value={reviewers}
        onChange={setReviewers}
        searchSource={peopleSource}
        hasEntriesOnFocus
        hasClear
        debounceMs={0}
        placeholder="Search teammates"
      />
      <p className="demo-result">{reviewers.length} reviewers selected</p>
    </div>
  );
}
function TooltipPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="demo-stack">
      <Tooltip
        content="Only invited people can view this collection."
        isOpen={open}
        onOpenChange={setOpen}
        focusTrigger="always"
        touchTrigger="tap">
        <Button label="About collection access" variant="ghost" />
      </Tooltip>
      <p className="demo-copy">Hover, focus, or tap for a short explanation.</p>
    </div>
  );
}

/** Source excerpts use the same public APIs as their live previews. */
const baseDemos: Demo[] = [
  {
    id: 'alert-dialog',
    name: 'Alert dialog',
    category: 'Overlays',
    description: 'Confirm an archive action without leaving the workspace.',
    material:
      'A neutral dialog surface separates the decision; the destructive action remains solid.',
    code: '<AlertDialog isOpen={open} onOpenChange={setOpen} title="Archive this collection?" description="Your files stay in this local preview." actionLabel="Archive collection" onAction={() => { setArchived(true); setOpen(false); }} />',
    Preview: AlertDialogPreview,
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'Display',
    description: 'Switch teammates to explore name-based avatars.',
    material:
      'Identity content stays legible within the rounded avatar boundary.',
    code: '<Avatar name={name} shape="rounded" size="lg" />',
    Preview: AvatarPreview,
  },
  {
    id: 'bottom-sheet',
    name: 'Bottom sheet',
    category: 'Overlays',
    description: 'Open a real sheet and apply a workspace filter.',
    material:
      'The sheet is a single neutral surface above a scrim, not a lens on each row.',
    code: '<BottomSheet label="Collection filters" isOpen={open} onOpenChange={setOpen} height="hug"><Section padding={6}><div className="demo-stack"><h3>Collection filters</h3><Switch label="Recently updated only" value={recent} onChange={setRecent} /><Button label="Apply filters" variant="primary" onClick={() => setOpen(false)} /></div></Section></BottomSheet>',
    Preview: BottomSheetPreview,
  },
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    category: 'Navigation',
    description: 'Explore a nested workspace through a breadcrumb menu.',
    material:
      'Text and separators stay lightweight; the menu owns its floating surface.',
    code: '<Breadcrumbs label="Collection location"><BreadcrumbItem menu={[{label: "Workspace", onClick: () => setLocation("Workspace")} ]}>Workspace</BreadcrumbItem><BreadcrumbItem isCurrent>{location}</BreadcrumbItem></Breadcrumbs>',
    Preview: BreadcrumbsPreview,
  },
  {
    id: 'button',
    name: 'Button',
    category: 'Actions',
    description: 'Save and reset a local collection state.',
    material:
      'Secondary actions use a neutral lens; the primary action uses a solid accent.',
    code: '<Button label={saved ? "Saved" : "Save changes"} variant="primary" onClick={() => setSaved(true)} />',
    Preview: ButtonPreview,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    category: 'Inputs',
    description: 'Pick a review date and navigate between months.',
    material:
      'The calendar keeps one surface with a solid selected-day signal.',
    code: '<Calendar mode="single" value={date} onChange={setDate} weekStartsOn="mon" />',
    Preview: CalendarPreview,
  },
  {
    id: 'card',
    name: 'Card',
    category: 'Layout',
    description: 'A collection summary with a working workspace action.',
    material:
      'One neutral lens groups the content; nested text does not add more glass.',
    code: '<Card width="100%"><h3>Evening collection</h3><Button label={saved ? "Added to workspace" : "Add to workspace"} onClick={() => setSaved(value => !value)} /></Card>',
    Preview: CardPreview,
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'Inputs',
    description: 'Try checked, unchecked, mixed, and disabled choices.',
    material:
      'Checked and mixed marks use solid selection colors instead of transparent signals.',
    code: '<CheckboxInput label="Snap to grid" value={snap} onChange={setSnap} />\n<CheckboxInput label="Shared folders" value={mixed} onChange={setMixed} />',
    Preview: CheckboxPreview,
  },
  {
    id: 'collapsible',
    name: 'Collapsible',
    category: 'Layout',
    description: 'Expand and collapse collection guidance.',
    material:
      'A shared disclosure surface keeps expanded content visually connected.',
    code: '<Collapsible trigger="What is in this collection?" isOpen={open} onOpenChange={setOpen}><p>Notes and material studies ready for review.</p></Collapsible>',
    Preview: CollapsiblePreview,
  },
  {
    id: 'date-input',
    name: 'Date input',
    category: 'Inputs',
    description: 'Edit a release date or choose it from the calendar.',
    material: lens,
    code: '<DateInput label="Release date" value={date} onChange={setDate} />',
    Preview: DateInputPreview,
  },
  {
    id: 'dialog',
    name: 'Dialog',
    category: 'Overlays',
    description: 'Edit a collection name in a focused modal.',
    material:
      'A single dialog lens floats above a scrim; fields retain their own control boundaries.',
    code: '<Dialog isOpen={open} onOpenChange={setOpen} width={420}><DialogHeader title="Edit collection" onOpenChange={setOpen} /><TextInput label="Collection name" value={name} onChange={setName} /><Button label="Done" onClick={() => setOpen(false)} /></Dialog>',
    Preview: DialogPreview,
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'Layout',
    description: 'Compare subtle and strong labelled separators.',
    material: 'A separator is a line, not a translucent surface.',
    code: '<Divider label="Today" variant={strong ? "strong" : "subtle"} />',
    Preview: DividerPreview,
  },
  {
    id: 'dropdown-menu',
    name: 'Dropdown menu',
    category: 'Overlays',
    description: 'Choose a collection action and see its local result.',
    material:
      'The popup owns one neutral lens; individual rows remain part of that surface.',
    code: '<DropdownMenu button={{label: "Collection actions"}} items={[{label: "Save collection", onClick: () => setAction("Collection saved locally")}]} />',
    Preview: DropdownMenuPreview,
  },
  {
    id: 'hover-card',
    name: 'Hover card',
    category: 'Overlays',
    description: 'Preview a teammate by hovering or focusing their name.',
    material: 'A neutral floating lens holds supplementary profile content.',
    code: '<HoverCard label="Riley Morgan profile" touchTrigger="tap" onOpenChange={setOpen} content={<p>Design partner · Evening collection</p>}><Button label="Riley Morgan" variant="ghost" /></HoverCard>',
    Preview: HoverCardPreview,
  },
  {
    id: 'icon-button',
    name: 'Icon button',
    category: 'Actions',
    description:
      'Copy a real collection-preview link with an accessible icon action.',
    material:
      'A compact neutral control keeps its icon and focus signal legible.',
    code: 'async function copyCollectionLink() { try { await navigator.clipboard.writeText(new URL("#/components/card", window.location.href).href); setCopied(true); setMessage("Collection link copied."); } catch { setCopied(false); setMessage("Copy unavailable. Open the collection link below."); } }\n<IconButton label="Copy collection link" tooltip="Copy collection link" icon={<Icon icon={copied ? "check" : "copy"} />} onClick={copyCollectionLink} />',
    Preview: IconButtonPreview,
  },
  {
    id: 'multi-selector',
    name: 'Multi-selector',
    category: 'Inputs',
    description: 'Choose several teams for the next review.',
    material: 'A neutral field and popup frame solid selected-state signals.',
    code: '<MultiSelector label="Review teams" value={audience} onChange={setAudience} options={options} />',
    Preview: MultiSelectorPreview,
  },
  {
    id: 'number-input',
    name: 'Number input',
    category: 'Inputs',
    description: 'Adjust an edition size within a bounded range.',
    material: lens,
    code: '<NumberInput label="Edition size" value={quantity} onChange={setQuantity} min={1} max={100} />',
    Preview: NumberInputPreview,
  },
  {
    id: 'popover',
    name: 'Popover',
    category: 'Overlays',
    description: 'Read workspace activity and mark it as read.',
    material: 'One floating neutral lens groups supporting copy and actions.',
    code: '<Popover label="Workspace activity" width={260} content={<Button label="Mark as read" onClick={() => setRead(true)} />}><Button label="Workspace activity" /></Popover>',
    Preview: PopoverPreview,
  },
  {
    id: 'progress-bar',
    name: 'Progress bar',
    category: 'Feedback',
    description: 'Advance and reset a simulated local upload.',
    material:
      'The progress fill is a solid signal rather than a transparent lens.',
    code: '<ProgressBar label="Collection upload" value={progress} />\n<Button label="Advance upload" onClick={() => setProgress(value => Math.min(100, value + 20))} />',
    Preview: ProgressBarPreview,
  },
  {
    id: 'radio-list',
    name: 'Radio list',
    category: 'Inputs',
    description: 'Select one access policy for a collection.',
    material:
      'The selected radio stays solid so the choice is distinct from the backdrop.',
    code: '<RadioList label="Collection access" value={access} onChange={setAccess}><RadioListItem value="invited" label="Invited people" /><RadioListItem value="workspace" label="Workspace" /></RadioList>',
    Preview: RadioListPreview,
  },
  {
    id: 'segmented-control',
    name: 'Segmented control',
    category: 'Inputs',
    description: 'Switch between collection view modes.',
    material: 'A shared neutral rail holds the selected segment signal.',
    code: '<SegmentedControl label="Collection view" value={view} onChange={setView}><SegmentedControlItem value="grid" label="Grid" /><SegmentedControlItem value="list" label="List" /><SegmentedControlItem value="table" label="Table" /></SegmentedControl>',
    Preview: SegmentedControlPreview,
  },
  {
    id: 'selector',
    name: 'Selector',
    category: 'Inputs',
    description: 'Choose the team responsible for a collection.',
    material: lens,
    code: '<Selector label="Owning team" value={team} onChange={setTeam} options={options} />',
    Preview: SelectorPreview,
  },
  {
    id: 'slider',
    name: 'Slider',
    category: 'Inputs',
    description: 'Adjust the ambient volume with a pointer or keyboard.',
    material: 'The thumb and active track use clear solid state signals.',
    code: '<Slider label="Ambient volume" value={volume} onChange={setVolume} min={0} max={100} />',
    Preview: SliderPreview,
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'Inputs',
    description: 'Toggle immediate workspace preferences.',
    material:
      'The enabled track and thumb remain solid rather than blurring the selected state.',
    code: '<Switch label="Sync collections" value={sync} onChange={setSync} labelPosition="start" labelSpacing="spread" />',
    Preview: SwitchPreview,
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'Navigation',
    description: 'Move between notes and activity with linked tab panels.',
    material:
      'The tab rail groups navigation; selection stays distinct from the neutral surface.',
    code: '<TabList role="tablist" aria-label="Collection details" value={tab} onChange={setTab} hasDivider={false}><Tab id={`${id}-notes`} panelId={`${id}-panel`} value="notes" label="Notes" /><Tab id={`${id}-activity`} panelId={`${id}-panel`} value="activity" label="Activity" /></TabList>\n<div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`} tabIndex={0}>{tab === "notes" ? "Collection notes" : "Recent activity"}</div>',
    Preview: TabsPreview,
  },
  {
    id: 'text-area',
    name: 'Text area',
    category: 'Inputs',
    description: 'Write a longer collection note with a live character count.',
    material: lens,
    code: '<TextArea label="Collection notes" value={notes} onChange={setNotes} />',
    Preview: TextAreaPreview,
  },
  {
    id: 'text-input',
    name: 'Text input',
    category: 'Inputs',
    description: 'Rename a collection or clear the field.',
    material: lens,
    code: '<TextInput label="Collection name" value={name} onChange={setName} hasClear placeholder="Name your collection" />',
    Preview: TextInputPreview,
  },
  {
    id: 'toggle-button',
    name: 'Toggle button',
    category: 'Actions',
    description: 'Pin and unpin a collection with a persistent pressed state.',
    material:
      'An unpressed neutral control becomes a clear selected signal when pressed.',
    code: '<ToggleButton label="Pin collection" isPressed={pinned} onPressedChange={setPinned} />',
    Preview: ToggleButtonPreview,
  },
  {
    id: 'tokenizer',
    name: 'Tokenizer',
    category: 'Inputs',
    description: 'Search local teammates and add or remove reviewer tokens.',
    material:
      'A shared input lens contains removable selections and a neutral search popup.',
    code: '<Tokenizer label="Reviewers" value={reviewers} onChange={setReviewers} searchSource={peopleSource} hasEntriesOnFocus hasClear debounceMs={0} placeholder="Search teammates" />',
    Preview: TokenizerPreview,
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'Overlays',
    description: 'Reveal a short access explanation on hover or focus.',
    material:
      'A compact neutral overlay keeps supplementary text separate from the backdrop.',
    code: '<Tooltip content="Only invited people can view this collection." isOpen={open} onOpenChange={setOpen} focusTrigger="always" touchTrigger="tap"><Button label="About collection access" variant="ghost" /></Tooltip>',
    Preview: TooltipPreview,
  },
];

const baseCoverage: Record<string, string[]> = {
  'alert-dialog': ['AlertDialog'],
  avatar: ['Avatar'],
  'bottom-sheet': ['BottomSheet'],
  breadcrumbs: ['Breadcrumbs', 'BreadcrumbItem'],
  button: ['Button'],
  calendar: ['Calendar'],
  card: ['Card'],
  checkbox: ['CheckboxInput'],
  collapsible: ['Collapsible'],
  'date-input': ['DateInput'],
  dialog: ['Dialog', 'DialogHeader'],
  divider: ['Divider'],
  'dropdown-menu': ['DropdownMenu'],
  'hover-card': ['HoverCard'],
  'icon-button': ['IconButton'],
  'multi-selector': ['MultiSelector'],
  'number-input': ['NumberInput'],
  popover: ['Popover'],
  'progress-bar': ['ProgressBar'],
  'radio-list': ['RadioList', 'RadioListItem'],
  'segmented-control': ['SegmentedControl', 'SegmentedControlItem'],
  selector: ['Selector'],
  slider: ['Slider'],
  switch: ['Switch'],
  tabs: ['TabList', 'Tab'],
  'text-area': ['TextArea'],
  'text-input': ['TextInput'],
  'toggle-button': ['ToggleButton'],
  tokenizer: ['Tokenizer'],
  tooltip: ['Tooltip'],
};

export const demos: Demo[] = [
  ...baseDemos.map(demo => ({...demo, covers: baseCoverage[demo.id]})),
  ...coreBasicDemos,
  ...coreContentDemos,
  ...navigationDemos,
  ...chatDemos,
  ...chartDemos,
  ...extensionDemos,
].sort((a, b) => a.name.localeCompare(b.name));
