/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Active Vesper theme and real, controlled Astryx components.
 * @output An interactive material gallery over a locally hosted photographic backdrop.
 * @position Vesper's sample page; component behavior remains owned by Astryx.
 */
import {useId, useState, type ComponentProps, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Switch} from '@astryxdesign/core/Switch';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Slider} from '@astryxdesign/core/Slider';
import {Selector} from '@astryxdesign/core/Selector';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Popover} from '@astryxdesign/core/Popover';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Avatar} from '@astryxdesign/core/Avatar';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {DateInput} from '@astryxdesign/core/DateInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {MultiSelector} from '@astryxdesign/core/MultiSelector';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
const dunes = new URL('./assets/dunes.jpg', import.meta.url).href;

const styles = stylex.create({
  page: {
    maxWidth: 1120,
    marginInline: 'auto',
    padding: {
      default: 'var(--spacing-8)',
      '@media (max-width: 600px)': 'var(--spacing-3)',
    },
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-body)',
  },
  masthead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-3)',
    paddingBottom: 'var(--spacing-5)',
    borderBottom: '1px solid var(--color-border)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '-0.04em',
  },
  orb: {
    height: 24,
    width: 24,
    borderRadius: 'var(--radius-full)',
    backgroundImage:
      'linear-gradient(145deg, #FFFFFF99, #FFFFFF08 45%, #00000088)',
    backgroundColor: 'var(--color-text-secondary)',
    boxShadow: 'inset 0 1px 1px #FFFFFF80, 0 1px 3px #00000020',
  },
  muted: {color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.65},
  intro: {paddingBlock: 'var(--spacing-8)'},
  eyebrow: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    margin: 0,
    marginBottom: 'var(--spacing-2)',
  },
  title: {
    fontSize: {default: 36, '@media (max-width: 600px)': 30},
    fontWeight: 600,
    letterSpacing: '-0.045em',
    lineHeight: 1.15,
    margin: 0,
  },
  lead: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
    maxWidth: 620,
    marginBottom: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, minmax(0, 1fr))',
      '@media (max-width: 680px)': 'minmax(0, 1fr)',
    },
    gap: 'var(--spacing-6)',
  },
  tile: {minWidth: 0, margin: 0},
  stage: {
    position: 'relative',
    isolation: 'isolate',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    padding: 'var(--spacing-5)',
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--vesper-backdrop)',
    overflow: 'hidden',
  },
  photo: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: '50% 55%',
    zIndex: -2,
    filter: 'saturate(0.45) brightness(0.92)',
  },
  shade: {
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    backgroundColor: 'light-dark(#F1E9D210, #050B2340)',
  },
  caption: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
    paddingTop: 'var(--spacing-3)',
  },
  captionTitle: {fontSize: 13, fontWeight: 500, margin: 0},
  captionDetail: {fontSize: 11, color: 'var(--color-text-secondary)'},
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    width: '100%',
    maxWidth: 292,
    minWidth: 0,
  },
  glass: {
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--vesper-glass-fill)',
    backgroundImage: 'var(--vesper-glass-gradient)',
    backdropFilter: 'blur(12px) saturate(1.35)',
    border: '1px solid var(--vesper-glass-rim)',
    boxShadow: 'var(--vesper-glass-shadow)',
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: 600,
    margin: 0,
    marginBottom: 'var(--spacing-2)',
  },
  small: {fontSize: 12, lineHeight: 1.65, margin: 0},
  space: {height: 'var(--spacing-2)'},
  footer: {
    marginTop: 'var(--spacing-8)',
    paddingTop: 'var(--spacing-5)',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
  },
});

function Tile({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <section {...stylex.props(styles.tile)} aria-label={`${title} preview`}>
      <div {...stylex.props(styles.stage)}>
        <img src={dunes} alt="" {...stylex.props(styles.photo)} />
        <div aria-hidden="true" {...stylex.props(styles.shade)} />
        {children}
      </div>
      <div {...stylex.props(styles.caption)}>
        <h2 {...stylex.props(styles.captionTitle)}>{title}</h2>
        <span {...stylex.props(styles.captionDetail)}>{detail}</span>
      </div>
    </section>
  );
}

export function ComponentGallery() {
  const tabId = useId();
  const [name, setName] = useState('Evening collection');
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [snap, setSnap] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [mixed, setMixed] = useState<boolean | 'indeterminate'>(
    'indeterminate',
  );
  const [volume, setVolume] = useState(62);
  const [surface, setSurface] = useState('squircle');
  const [tab, setTab] = useState('lens');
  const [dialog, setDialog] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState(false);
  const [quantity, setQuantity] = useState(12);
  const [release, setRelease] =
    useState<ComponentProps<typeof DateInput>['value']>('2026-11-01');
  const [notes, setNotes] = useState(
    'A collection of quiet, considered surfaces.',
  );
  const [audience, setAudience] = useState(['design']);
  const [view, setView] = useState('grid');
  return (
    <main {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.masthead)}>
        <div {...stylex.props(styles.brand)}>
          <span aria-hidden="true" {...stylex.props(styles.orb)} />
          vesper
        </div>
        <span {...stylex.props(styles.muted)}>
          Design system / Component preview
        </span>
      </header>
      <div {...stylex.props(styles.intro)}>
        <p {...stylex.props(styles.eyebrow)}>MATERIAL STUDIES / 01</p>
        <h1 {...stylex.props(styles.title)}>A lighter kind of interface.</h1>
        <p {...stylex.props(styles.lead)}>
          Soft glass. Clear intent. Familiar components with translucent
          surfaces, a little depth, and room for the world behind them.
        </p>
        <p {...stylex.props(styles.muted)}>
          Explore the live controls below. Switch Light, Dark, or Contrast in
          the theme toolbar.
        </p>
      </div>
      <div {...stylex.props(styles.grid)}>
        <Tile title="Button" detail="Glass · accent · danger">
          <div {...stylex.props(styles.row)}>
            <Button
              label={saved ? 'Saved' : 'Save changes'}
              variant="primary"
              onClick={() => setSaved(true)}
            />
            <Button label="Preview" onClick={() => setDialog(true)} />
            <Button
              label="Delete"
              variant="destructive"
              onClick={() => setNotice(true)}
            />
          </div>
        </Tile>
        <Tile title="Input" detail="A surface you can write on">
          <div {...stylex.props(styles.column, styles.glass)}>
            <TextInput
              label="Collection name"
              value={name}
              onChange={v => {
                setName(v);
                setSaved(false);
              }}
              placeholder="Name your collection"
              hasClear
            />
          </div>
        </Tile>
        <Tile title="Switch" detail="Solid, meaningful state">
          <div {...stylex.props(styles.column, styles.glass)}>
            <Switch
              label="Wi-Fi"
              value={wifi}
              onChange={setWifi}
              labelPosition="start"
              labelSpacing="spread"
            />
            <Switch
              label="Bluetooth"
              value={bluetooth}
              onChange={setBluetooth}
              labelPosition="start"
              labelSpacing="spread"
            />
            <Switch label="Airplane mode" value={false} isDisabled />
          </div>
        </Tile>
        <Tile title="Checkbox" detail="On · off · mixed · disabled">
          <div {...stylex.props(styles.column, styles.glass)}>
            <CheckboxInput
              label="Snap to grid"
              value={snap}
              onChange={setSnap}
            />
            <CheckboxInput
              label="Show hidden files"
              value={hidden}
              onChange={setHidden}
            />
            <CheckboxInput
              label="Partially selected"
              value={mixed}
              onChange={setMixed}
            />
            <CheckboxInput label="Unavailable" value={false} isDisabled />
          </div>
        </Tile>
        <Tile title="Select" detail="Frosted trigger & popup">
          <div {...stylex.props(styles.column, styles.glass)}>
            <Selector
              label="Surface profile"
              value={surface}
              onChange={setSurface}
              options={[
                {value: 'squircle', label: 'Squircle'},
                {value: 'rounded', label: 'Rounded'},
                {value: 'capsule', label: 'Capsule'},
              ]}
            />
          </div>
        </Tile>
        <Tile title="Slider" detail="A tactile, solid thumb">
          <div {...stylex.props(styles.column, styles.glass)}>
            <Slider
              label="Volume"
              value={volume}
              onChange={setVolume}
              min={0}
              max={100}
            />
            <p {...stylex.props(styles.small)}>{volume}% volume</p>
          </div>
        </Tile>
        <Tile title="Tabs" detail="Lens · tint · rim">
          <div {...stylex.props(styles.column)}>
            <TabList
              role="tablist"
              aria-label="Glass material"
              value={tab}
              onChange={setTab}
              hasDivider={false}>
              <Tab
                id={`${tabId}-lens`}
                panelId={`${tabId}-panel`}
                value="lens"
                label="Lens"
              />
              <Tab
                id={`${tabId}-tint`}
                panelId={`${tabId}-panel`}
                value="tint"
                label="Tint"
              />
              <Tab
                id={`${tabId}-rim`}
                panelId={`${tabId}-panel`}
                value="rim"
                label="Rim"
              />
            </TabList>
            <div
              role="tabpanel"
              id={`${tabId}-panel`}
              aria-labelledby={`${tabId}-${tab}`}
              tabIndex={0}
              {...stylex.props(styles.glass, styles.small)}>
              {tab === 'lens'
                ? 'A translucent surface keeps the landscape in view, while a soft blur gives content its own space.'
                : tab === 'tint'
                  ? 'A neutral tint adapts to light and dark. Blue is reserved for actions and selected states.'
                  : 'A fine highlight catches the upper edge. Soft shadows lift the surface without a heavy border.'}
            </div>
          </div>
        </Tile>
        <Tile title="Accordion" detail="One surface, less noise">
          <div {...stylex.props(styles.column)}>
            <Collapsible trigger="What makes it glass?" defaultIsOpen>
              <p {...stylex.props(styles.small)}>
                A translucent tint, a soft backdrop blur, and a rim that catches
                the light.
              </p>
            </Collapsible>
            <Collapsible
              trigger="What about accessibility?"
              defaultIsOpen={false}>
              <p {...stylex.props(styles.small)}>
                Keyboard controls stay native. Contrast mode replaces
                translucent panels with opaque surfaces.
              </p>
            </Collapsible>
          </div>
        </Tile>
        <Tile title="Popover" detail="A little more context">
          <Popover
            label="Notifications"
            width={280}
            content={
              <div>
                <h3 {...stylex.props(styles.panelTitle)}>All caught up.</h3>
                <p {...stylex.props(styles.small)}>
                  Your collection is ready. New activity will appear here.
                </p>
              </div>
            }>
            <Button label="Notifications" />
          </Popover>
        </Tile>
        <Tile title="Dialog" detail="Focused, not disconnected">
          <Button label="Share collection" onClick={() => setDialog(true)} />
        </Tile>
        <Tile title="Progress" detail="Clear even at a glance">
          <div {...stylex.props(styles.column, styles.glass)}>
            <ProgressBar label="Uploading" value={24} />
            <ProgressBar label="Rendering" value={68} />
            <ProgressBar label="Sync complete" value={100} />
          </div>
        </Tile>
        <Tile title="Number input" detail="Glass field · precise value">
          <div {...stylex.props(styles.column, styles.glass)}>
            <NumberInput
              label="Edition size"
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={100}
            />
          </div>
        </Tile>
        <Tile title="Date input" detail="A lens for the calendar">
          <div {...stylex.props(styles.column, styles.glass)}>
            <DateInput
              label="Release date"
              value={release}
              onChange={setRelease}
            />
          </div>
        </Tile>
        <Tile title="Text area" detail="Room for a longer thought">
          <div {...stylex.props(styles.column, styles.glass)}>
            <TextArea
              label="Collection notes"
              value={notes}
              onChange={setNotes}
            />
          </div>
        </Tile>
        <Tile title="Multi-select" detail="Glass shell · solid selections">
          <div {...stylex.props(styles.column, styles.glass)}>
            <MultiSelector
              label="Audience"
              value={audience}
              onChange={setAudience}
              options={[
                {value: 'design', label: 'Design'},
                {value: 'engineering', label: 'Engineering'},
                {value: 'research', label: 'Research'},
              ]}
            />
          </div>
        </Tile>
        <Tile title="Segmented control" detail="Glass rail · solid choice">
          <div {...stylex.props(styles.column)}>
            <SegmentedControl
              label="Collection view"
              value={view}
              onChange={setView}>
              <SegmentedControlItem value="grid" label="Grid" />
              <SegmentedControlItem value="list" label="List" />
              <SegmentedControlItem value="table" label="Table" />
            </SegmentedControl>
          </div>
        </Tile>
        <Tile title="Dropdown menu" detail="One surface, not a lens per row">
          <DropdownMenu
            button={{label: 'Collection actions'}}
            items={[
              {label: 'Preview collection', onClick: () => setDialog(true)},
              {label: 'Save collection', onClick: () => setSaved(true)},
            ]}
          />
        </Tile>
        <Tile title="Avatar" detail="People, in the same material">
          <div {...stylex.props(styles.row)}>
            <Avatar name="Riley Morgan" shape="rounded" size="lg" />
            <Avatar name="Kai Ortiz" shape="rounded" size="lg" />
            <Avatar name="Alex Chen" shape="rounded" size="lg" />
          </div>
        </Tile>
      </div>
      <footer {...stylex.props(styles.footer)}>
        <span {...stylex.props(styles.muted)}>
          Vesper / Built with Astryx. Inspired by Liqui.
        </span>
        <span {...stylex.props(styles.muted)} role="status">
          {saved
            ? `Saved “${name}” locally.`
            : 'Live components. Local preview. No data leaves this page.'}
        </span>
      </footer>
      <Dialog isOpen={dialog} onOpenChange={setDialog} width={420}>
        <DialogHeader
          title="Share collection"
          onOpenChange={setDialog}
          hasDivider={false}
        />
        <div {...stylex.props(styles.column)}>
          <p {...stylex.props(styles.small)}>
            Invite someone to explore “{name || 'Untitled collection'}”. This is
            a local preview; no invitation is sent.
          </p>
          <TextInput label="Collection" value={name} onChange={setName} />
          <Button
            label="Done"
            variant="primary"
            onClick={() => setDialog(false)}
          />
        </div>
      </Dialog>
      <Dialog isOpen={notice} onOpenChange={setNotice} width={400}>
        <DialogHeader
          title="Delete collection?"
          onOpenChange={setNotice}
          hasDivider={false}
        />
        <p {...stylex.props(styles.small)}>
          This preview does not delete data. Your collection stays exactly as it
          is.
        </p>
        <div {...stylex.props(styles.space)} />
        <Button label="Keep collection" onClick={() => setNotice(false)} />
      </Dialog>
    </main>
  );
}
