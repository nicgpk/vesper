/* eslint-disable @astryx/copyright-header -- Original Vesper extension; upstream notices remain in reused source. */
// SPDX-License-Identifier: MIT
'use client';
/** Thin compositions over Astryx Chat. The application owns state and actions. */
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  ChatLayout,
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatComposer,
  ChatToolCalls,
} from '@astryxdesign/core/Chat';
import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  colorVars,
  spacingVars,
  durationVars,
  easeVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import type {
  ConversationState,
  MessageState,
  RunState,
  ToolState,
} from './state';
import {isActive} from './state';

const styles = stylex.create({
  viewport: {
    height: 'min(680px, calc(100dvh - 160px))',
    minHeight: 380,
    minWidth: 0,
    overflowY: 'auto',
  },
  text: {whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: 0},
  streamed: {
    transition: {
      default: `opacity ${durationVars['--duration-fast']} ${easeVars['--ease-standard']}`,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flexWrap: 'wrap',
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-secondary'],
    fontSize: 13,
    paddingBlock: spacingVars['--spacing-2'],
  },
  error: {color: colorVars['--color-error']},
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    minWidth: 0,
  },
});
export function StreamingText({
  text,
  isStreaming = false,
}: {
  text: string;
  isStreaming?: boolean;
}) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)', true);
  const waiting = isStreaming && reduced;
  return (
    <p
      {...stylex.props(styles.text, !reduced && styles.streamed)}
      data-streaming={isStreaming || undefined}
      data-reduced-motion={reduced || undefined}>
      {waiting
        ? 'Receiving response. Full text will appear when complete.'
        : text || (isStreaming ? 'Receiving response…' : '')}
    </p>
  );
}
export function Message({
  message,
  tools = [],
}: {
  message: MessageState;
  tools?: ToolState[];
}) {
  return (
    <ChatMessage sender={message.role} data-message-id={message.id}>
      <ChatMessageBubble
        variant={message.role === 'assistant' ? 'ghost' : 'filled'}
        name={
          message.role === 'user'
            ? 'You'
            : message.role === 'assistant'
              ? 'Vesper'
              : 'System'
        }>
        <div {...stylex.props(styles.body)}>
          {tools.map(tool => (
            <ToolCall key={tool.id} tool={tool} />
          ))}
          <StreamingText
            text={message.text}
            isStreaming={
              message.status === 'working' || message.status === 'streaming'
            }
          />
          {message.status === 'stopped' && (
            <Badge label="Response stopped" variant="neutral" />
          )}
          {message.status === 'error' && (
            <Badge label="Response interrupted" variant="error" />
          )}
        </div>
      </ChatMessageBubble>
    </ChatMessage>
  );
}
export function ToolCall({tool}: {tool: ToolState}) {
  if (tool.status === 'stopped') {
    return (
      <div data-tool-id={tool.id}>
        <Badge label={`${tool.name} — stopped`} variant="neutral" />
      </div>
    );
  }
  return (
    <ChatToolCalls
      data-tool-id={tool.id}
      calls={[
        {
          key: tool.id,
          name: tool.name,
          status: tool.status,
          target: tool.target,
          errorMessage: tool.error,
          resultDetail: tool.result ? (
            <p {...stylex.props(styles.text)}>{tool.result}</p>
          ) : undefined,
        },
      ]}
    />
  );
}
const phaseLabel = {
  working: 'Working',
  streaming: 'Receiving response',
  complete: 'Complete',
  stopped: 'Stopped',
  error: 'Response failed',
};
export function RunStatus({
  run,
  onRetry,
}: {
  run: RunState | null;
  onRetry?: () => void;
}) {
  return (
    <div
      {...stylex.props(styles.status, run?.status === 'error' && styles.error)}>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-run-status={run?.status || 'idle'}>
        {run ? phaseLabel[run.status] : 'Ready'}
        {run?.error ? ` — ${run.error}` : ''}
      </span>
      {run && ['error', 'stopped'].includes(run.status) && onRetry && (
        <Button
          label="Retry response"
          variant="secondary"
          size="sm"
          onClick={onRetry}
        />
      )}
    </div>
  );
}
export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  busy,
  footer,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  onStop?: () => void;
  busy: boolean;
  footer?: ReactNode;
}) {
  return (
    <ChatComposer
      value={value}
      onChange={onChange}
      onSubmit={onSend}
      onStop={onStop}
      isStopShown={busy}
      isDisabled={busy}
      elevation="none"
      placeholder="Write a message…"
      footerActions={footer}
    />
  );
}
export interface ConversationProps {
  state: ConversationState;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (value: string) => void;
  onStop: () => void;
  onRetry?: () => void;
  footer?: ReactNode;
}
export function Conversation({
  state,
  draft,
  onDraftChange,
  onSend,
  onStop,
  onRetry,
  footer,
}: ConversationProps) {
  const busy = isActive(state.run);
  return (
    <section aria-label="Conversation">
      <RunStatus run={state.run} onRetry={onRetry} />
      <ChatLayout
        xstyle={styles.viewport}
        data-testid="conversation-scroll"
        composer={
          <Composer
            value={draft}
            onChange={onDraftChange}
            onSend={onSend}
            onStop={onStop}
            busy={busy}
            footer={footer}
          />
        }>
        <ChatMessageList align="top" isStreaming={busy}>
          {state.messages.map(message => (
            <Message
              key={message.id}
              message={message}
              tools={message.tools || []}
            />
          ))}
        </ChatMessageList>
      </ChatLayout>
    </section>
  );
}
