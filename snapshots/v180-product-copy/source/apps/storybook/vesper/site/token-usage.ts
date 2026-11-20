// SPDX-License-Identifier: MIT
/** Cached input and reasoning output are subsets, not additional tokens. */
export type TokenUsage = {
 input: number;
 cachedInput?: number;
 output: number;
 reasoningOutput?: number;
};
export const usageExamples = {
 first: {input: 2940, cachedInput: 0, output: 900, reasoningOutput: 240},
 followup: {input: 3880, cachedInput: 2048, output: 600, reasoningOutput: 120},
} satisfies Record<string, TokenUsage>;

export function tokenBreakdown(usage: TokenUsage) {
 const {input, cachedInput, output, reasoningOutput} = usage;
 const values = [input, output, ...(cachedInput === undefined ? [] : [cachedInput]), ...(reasoningOutput === undefined ? [] : [reasoningOutput])];
 const total = input + output;
 if (values.some(value => !Number.isSafeInteger(value) || value < 0) ||
     !Number.isSafeInteger(total) || (cachedInput ?? 0) > input || (reasoningOutput ?? 0) > output) return null;
 return {
  total,
  input,
  output,
  cachedInput,
  reasoningOutput,
  uncachedInput: cachedInput === undefined ? undefined : input - cachedInput,
  otherOutput: reasoningOutput === undefined ? undefined : output - reasoningOutput,
 };
}
