/* eslint-disable @astryx/copyright-header -- Original Vesper extension; upstream notices remain in reused source. */
// SPDX-License-Identifier: MIT
/** Provider-neutral events. IDs belong to the app, never to a model SDK. */
export type RunPhase =
  'working' | 'streaming' | 'complete' | 'stopped' | 'error';
export type ToolPhase =
  'pending' | 'running' | 'complete' | 'stopped' | 'error';
export interface ToolState {
  id: string;
  name: string;
  status: ToolPhase;
  target?: string;
  result?: string;
  error?: string;
}
export interface MessageState {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  runId?: string;
  status?: RunPhase;
  tools?: ToolState[];
}
export interface RunState {
  id: string;
  assistantId: string;
  status: RunPhase;
  tools: ToolState[];
  error?: string;
}
export interface ConversationState {
  messages: MessageState[];
  run: RunState | null;
  seen: string[];
}
type Identity = {id: string; runId: string};
export type ConversationEvent = Identity &
  (
    | {type: 'start'; userId: string; assistantId: string; text: string}
    | {type: 'retry'; assistantId: string}
    | {type: 'delta'; text: string}
    | {type: 'tool'; tool: ToolState}
    | {type: 'complete' | 'stop'}
    | {type: 'error'; message: string}
  );
export const initialState: ConversationState = {
  messages: [],
  run: null,
  seen: [],
};
export const isActive = (run: RunState | null) =>
  run?.status === 'working' || run?.status === 'streaming';
export function reduceConversation(
  state: ConversationState,
  event: ConversationEvent,
): ConversationState {
  if (state.seen.includes(event.id)) {
    return state;
  }
  const seen = [...state.seen, event.id];
  if (event.type === 'start') {
    if (
      isActive(state.run) ||
      !event.text.trim() ||
      state.messages.some(
        m => m.id === event.userId || m.id === event.assistantId,
      )
    ) {
      return state;
    }
    return {
      seen,
      run: {
        id: event.runId,
        assistantId: event.assistantId,
        status: 'working',
        tools: [],
      },
      messages: [
        ...state.messages,
        {id: event.userId, role: 'user', text: event.text.trim()},
        {
          id: event.assistantId,
          role: 'assistant',
          text: '',
          runId: event.runId,
          status: 'working',
        },
      ],
    };
  }
  if (event.type === 'retry') {
    if (
      !state.run ||
      !['error', 'stopped'].includes(state.run.status) ||
      event.runId === state.run.id ||
      state.messages.some(m => m.id === event.assistantId)
    ) {
      return state;
    }
    return {
      seen,
      run: {
        id: event.runId,
        assistantId: event.assistantId,
        status: 'working',
        tools: [],
      },
      messages: [
        ...state.messages,
        {
          id: event.assistantId,
          role: 'assistant',
          text: '',
          runId: event.runId,
          status: 'working',
        },
      ],
    };
  }
  const run = state.run;
  if (!run || run.id !== event.runId || !isActive(run)) {
    return state;
  }
  if (event.type === 'tool') {
    const tools = run.tools.some(t => t.id === event.tool.id)
      ? run.tools.map(t => (t.id === event.tool.id ? event.tool : t))
      : [...run.tools, event.tool];
    return {
      ...state,
      seen,
      run: {...run, tools},
      messages: state.messages.map(m =>
        m.id === run.assistantId ? {...m, tools} : m,
      ),
    };
  }
  if (event.type === 'delta') {
    return {
      ...state,
      seen,
      run: {...run, status: 'streaming'},
      messages: state.messages.map(m =>
        m.id === run.assistantId
          ? {...m, status: 'streaming', text: m.text + event.text}
          : m,
      ),
    };
  }
  const status =
    event.type === 'stop'
      ? 'stopped'
      : event.type === 'error'
        ? 'error'
        : 'complete';
  const error = event.type === 'error' ? event.message : undefined;
  const tools = run.tools.map(t =>
    ['pending', 'running'].includes(t.status)
      ? {...t, status: 'stopped' as const}
      : t,
  );
  return {
    ...state,
    seen,
    run: {
      ...run,
      status,
      error,
      tools,
    },
    messages: state.messages.map(m =>
      m.id === run.assistantId ? {...m, status, tools} : m,
    ),
  };
}
