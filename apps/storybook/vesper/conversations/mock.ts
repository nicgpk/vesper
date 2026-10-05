/* eslint-disable @astryx/copyright-header -- Original Vesper extension; upstream notices remain in reused source. */
// SPDX-License-Identifier: MIT
import type {ConversationEvent} from './state';
/** Fixed mock schedule, not estimates of model speed or real product metrics. */
export function mockEvents(
  runId: string,
  fail = false,
): Array<{at: number; event: ConversationEvent}> {
  const chunks = [
    'A calm interface starts with clear hierarchy. ',
    'Use semantic surface and text tokens, then keep the primary action easy to find. ',
    'Vesper Light preserves the same typography and spacing; Contrast strengthens boundaries and keyboard focus.\n\n',
    'These are deterministic local demo messages. No model or external service was called.',
  ];
  const events: Array<{at: number; event: ConversationEvent}> = [
    {
      at: 350,
      event: {
        id: `${runId}-tool-start`,
        type: 'tool',
        runId,
        tool: {
          id: `${runId}-palette`,
          name: 'Read palette',
          target: 'Local semantic tokens',
          status: 'running',
        },
      },
    },
    {
      at: 1100,
      event: {
        id: `${runId}-tool-done`,
        type: 'tool',
        runId,
        tool: {
          id: `${runId}-palette`,
          name: 'Read palette',
          target: 'Local semantic tokens',
          status: 'complete',
          result: 'Read the local Vesper palette. This is mock activity.',
        },
      },
    },
  ];
  chunks.forEach((text, i) =>
    events.push({
      at: 1400 + i * 500,
      event: {id: `${runId}-delta-${i}`, type: 'delta', runId, text},
    }),
  );
  events.push(
    fail
      ? {
          at: 2150,
          event: {
            id: `${runId}-error`,
            type: 'error',
            runId,
            message:
              'The local mock was interrupted. Retry keeps your message.',
          },
        }
      : {at: 3500, event: {id: `${runId}-complete`, type: 'complete', runId}},
  );
  return events.filter(e => !fail || e.at <= 2150).sort((a, b) => a.at - b.at);
}
