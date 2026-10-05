/* eslint-disable @astryx/copyright-header -- Original Vesper extension; upstream notices remain in reused source. */
// SPDX-License-Identifier: MIT
import {describe, it, expect} from 'vitest';
import {initialState, reduceConversation} from '../vesper/conversations/state';
import {createSoundController} from '../vesper/conversations/sound';

describe('Vesper conversation event contract', () => {
  const start = {
    id: 'event-start',
    type: 'start' as const,
    runId: 'run-1',
    userId: 'user-1',
    assistantId: 'assistant-1',
    text: 'Hello',
  };
  it('deduplicates stable events and preserves streamed content on stop', () => {
    const started = reduceConversation(initialState, start);
    expect(reduceConversation(started, start)).toBe(started);
    const delta = {
      id: 'delta-1',
      type: 'delta' as const,
      runId: 'run-1',
      text: 'First chunk',
    };
    const streamed = reduceConversation(started, delta);
    expect(reduceConversation(streamed, delta)).toBe(streamed);
    const stopped = reduceConversation(streamed, {
      id: 'stop-1',
      type: 'stop',
      runId: 'run-1',
    });
    expect(stopped.run?.status).toBe('stopped');
    expect(stopped.messages.at(-1)?.text).toBe('First chunk');
    expect(
      reduceConversation(stopped, {
        id: 'late',
        type: 'delta',
        runId: 'run-1',
        text: ' must not append',
      }).messages,
    ).toEqual(stopped.messages);
  });
  it('ignores stale runs and retries with fresh IDs without duplicating user messages', () => {
    const error = reduceConversation(reduceConversation(initialState, start), {
      id: 'err-1',
      type: 'error',
      runId: 'run-1',
      message: 'Mock failure',
    });
    const retry = reduceConversation(error, {
      id: 'retry-1',
      type: 'retry',
      runId: 'run-2',
      assistantId: 'assistant-2',
    });
    expect(retry.messages.filter(m => m.role === 'user')).toHaveLength(1);
    expect(retry.run?.id).toBe('run-2');
    expect(
      reduceConversation(retry, {
        id: 'old',
        type: 'delta',
        runId: 'run-1',
        text: 'stale',
      }).messages,
    ).toEqual(retry.messages);
    expect(
      reduceConversation(retry, {
        id: 'complete',
        type: 'complete',
        runId: 'run-2',
      }).run?.status,
    ).toBe('complete');
  });
  it('keeps tool IDs stable and stops pending tool work on cancellation', () => {
    const s = reduceConversation(reduceConversation(initialState, start), {
      id: 'tool-1',
      type: 'tool',
      runId: 'run-1',
      tool: {id: 'lookup', name: 'Palette lookup', status: 'running'},
    });
    const done = reduceConversation(s, {
      id: 'tool-2',
      type: 'tool',
      runId: 'run-1',
      tool: {
        id: 'lookup',
        name: 'Palette lookup',
        status: 'complete',
        result: 'Local tokens read',
      },
    });
    expect(done.run?.tools).toHaveLength(1);
    expect(done.run?.tools[0].result).toBe('Local tokens read');
    const completed = reduceConversation(done, {
      id: 'done',
      type: 'complete',
      runId: 'run-1',
    });
    const next = reduceConversation(completed, {
      id: 'next',
      type: 'start',
      runId: 'run-2',
      userId: 'user-2',
      assistantId: 'assistant-2',
      text: 'Another question',
    });
    expect(
      next.messages.find(m => m.id === 'assistant-1')?.tools?.[0].result,
    ).toBe('Local tokens read');
    const stopped = reduceConversation(s, {
      id: 'stop',
      type: 'stop',
      runId: 'run-1',
    });
    expect(stopped.run?.tools[0].status).toBe('stopped');
  });
});
describe('shared opt-in sound controller', () => {
  it('is silent by default, muted, and at zero volume; deduplicates and rate limits events', async () => {
    let plays = 0;
    const sound = createSoundController(async () => {
      plays++;
    });
    expect(await sound.play({id: 'default', kind: 'complete'}, 0)).toBe(false);
    sound.configure({enabled: true, muted: false, volume: 0.2});
    expect(await sound.play({id: 'a', kind: 'complete'}, 1000)).toBe(true);
    expect(await sound.play({id: 'a', kind: 'complete'}, 2000)).toBe(false);
    expect(await sound.play({id: 'b', kind: 'error'}, 1200)).toBe(false);
    sound.configure({muted: true});
    expect(await sound.play({id: 'c', kind: 'complete'}, 3000)).toBe(false);
    sound.configure({muted: false, volume: 0});
    expect(await sound.play({id: 'd', kind: 'complete'}, 4000)).toBe(false);
    expect(plays).toBe(1);
  });
  it('handles blocked audio without an unhandled rejection', async () => {
    const sound = createSoundController(async () => {
      throw new Error('Autoplay blocked');
    });
    sound.configure({enabled: true});
    expect(await sound.play({id: 'blocked', kind: 'complete'}, 1000)).toBe(
      false,
    );
    expect(sound.snapshot().blocked).toBe(true);
  });
});
