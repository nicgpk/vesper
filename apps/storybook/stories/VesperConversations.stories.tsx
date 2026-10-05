/* eslint-disable @astryx/copyright-header -- Original Vesper extension; upstream notices remain in reused source. */
// SPDX-License-Identifier: MIT
/** Local deterministic app adapter. Reusable UI exports live in vesper/conversations. */
import {useState, useReducer, useRef, useEffect} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {
  Conversation,
  initialState,
  reduceConversation,
  isActive,
  createSoundController,
} from '../vesper/conversations';
import type {ConversationState, SoundEvent} from '../vesper/conversations';
import {mockEvents} from '../vesper/conversations/mock';

const styles = stylex.create({
  page: {
    maxWidth: 960,
    marginInline: 'auto',
    padding: spacingVars['--spacing-4'],
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-primary'],
    minWidth: 0,
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-3'],
    flexWrap: 'wrap',
  },
  note: {
    color: colorVars['--color-text-secondary'],
    fontSize: 13,
    lineHeight: 1.5,
    marginBlock: spacingVars['--spacing-2'],
  },
  controls: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    flexWrap: 'wrap',
    alignItems: 'center',
    fontSize: 13,
  },
  field: {
    display: 'flex',
    gap: spacingVars['--spacing-1'],
    alignItems: 'center',
  },
});
const meta: Meta = {
  title: 'Core/Themes/Vesper Conversations',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;
const seed: ConversationState = {
  ...initialState,
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to Vesper Conversations. Try a message, stop a response, or simulate an error. Everything here runs locally.',
    },
  ],
};
function Demo({longHistory = false}: {longHistory?: boolean}) {
  const [state, dispatch] = useReducer(
    reduceConversation,
    longHistory
      ? {
          ...seed,
          messages: [
            ...seed.messages,
            ...Array.from({length: 18}, (_, i) => ({
              id: `history-${i}`,
              role: (i % 2 ? 'assistant' : 'user') as 'assistant' | 'user',
              text:
                `History ${i + 1}: ` +
                'A deliberately long local message preserves readable wrapping and scroll position. '.repeat(
                  10,
                ),
            })),
          ],
        }
      : seed,
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const [draft, setDraft] = useState('How should I use the Vesper themes?');
  const [fail, setFail] = useState(false);
  const [duplicates, setDuplicates] = useState(false);
  const controller = useRef<ReturnType<typeof createSoundController> | null>(
    null,
  );
  controller.current ??= createSoundController();
  const soundController = controller.current;
  const [sound, setSound] = useState(soundController.snapshot());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const counter = useRef(0);
  const active = useRef<string | null>(null);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    active.current = null;
  };
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      active.current = null;
    },
    [],
  );
  const eventSound = (event: SoundEvent) => {
    void soundController
      .play(event)
      .then(() => setSound(soundController.snapshot()));
  };
  const schedule = (runId: string, shouldFail: boolean) => {
    active.current = runId;
    for (const {at, event} of mockEvents(runId, shouldFail)) {
      timers.current.push(
        setTimeout(() => {
          if (active.current !== runId) {
            return;
          }
          dispatch(event);
          if (duplicates) {
            dispatch(event);
          }
          if (event.type === 'complete' || event.type === 'error') {
            active.current = null;
            eventSound({id: event.id, kind: event.type});
          }
        }, at),
      );
    }
  };
  const send = (value: string) => {
    if (active.current || isActive(stateRef.current.run) || !value.trim()) {
      return;
    }
    const id = `run-${++counter.current}`;
    clear();
    dispatch({
      id: `${id}-start`,
      type: 'start',
      runId: id,
      userId: `${id}-user`,
      assistantId: `${id}-assistant`,
      text: value,
    });
    setDraft('');
    eventSound({id: `${id}-sent`, kind: 'sent'});
    schedule(id, fail);
  };
  const stop = () => {
    const runId = active.current;
    if (!runId) {
      return;
    }
    clear();
    dispatch({id: `${runId}-stop`, type: 'stop', runId});
    eventSound({id: `${runId}-stop`, kind: 'stopped'});
  };
  const retry = () => {
    if (
      active.current ||
      !stateRef.current.run ||
      !['error', 'stopped'].includes(stateRef.current.run.status)
    ) {
      return;
    }
    const id = `run-${++counter.current}`;
    clear();
    dispatch({
      id: `id-${id}-retry`,
      type: 'retry',
      runId: id,
      assistantId: `${id}-assistant`,
    });
    schedule(id, false);
  };
  const configure = (
    settings: Parameters<
      ReturnType<typeof createSoundController>['configure']
    >[0],
  ) => {
    soundController.configure(settings);
    setSound(soundController.snapshot());
  };
  return (
    <main {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.top)}>
        <Heading level={1}>Vesper Conversations</Heading>
        <Button
          label={sound.enabled ? 'Disable sound' : 'Enable sound'}
          variant="secondary"
          size="sm"
          onClick={() => configure({enabled: !sound.enabled})}
        />
      </div>
      <p {...stylex.props(styles.note)}>
        A local interaction demo. No model, account, or network connection
        required. Sound starts off.
      </p>
      <div {...stylex.props(styles.controls)}>
        <label {...stylex.props(styles.field)}>
          <input
            type="checkbox"
            checked={fail}
            onChange={e => setFail(e.target.checked)}
            disabled={isActive(state.run)}
          />
          Simulate next error
        </label>
        <label {...stylex.props(styles.field)}>
          <input
            type="checkbox"
            checked={duplicates}
            onChange={e => setDuplicates(e.target.checked)}
            disabled={isActive(state.run)}
          />
          Replay duplicate events
        </label>
        {sound.enabled && (
          <>
            <label {...stylex.props(styles.field)}>
              <input
                type="checkbox"
                checked={sound.muted}
                onChange={e => configure({muted: e.target.checked})}
              />
              Mute sound
            </label>
            <label {...stylex.props(styles.field)}>
              Volume
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sound.volume}
                onChange={e => configure({volume: Number(e.target.value)})}
              />
            </label>
          </>
        )}
      </div>
      {sound.blocked && (
        <p role="status" {...stylex.props(styles.note)}>
          Audio is unavailable or blocked by the browser. Conversation controls
          still work.
        </p>
      )}
      <Conversation
        state={state}
        draft={draft}
        onDraftChange={setDraft}
        onSend={send}
        onStop={stop}
        onRetry={retry}
      />
    </main>
  );
}
export const DemoFlow: Story = {render: () => <Demo />};
export const LongHistory: Story = {render: () => <Demo longHistory />};
