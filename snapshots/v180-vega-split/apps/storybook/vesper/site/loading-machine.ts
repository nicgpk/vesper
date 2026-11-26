/* SPDX-License-Identifier: MIT — finite, browser-local loading studies. */
export type LoadingPhase = 'idle' | 'running' | 'complete' | 'cancelled' | 'error';
export type LoadingState = {phase: LoadingPhase; run: number; step: number; shouldFail: boolean};
export const initialLoadingState: LoadingState = {phase: 'idle', run: 0, step: 0, shouldFail: false};
export type LoadingEvent =
  | {type: 'start'; shouldFail?: boolean}
  | {type: 'cancel'}
  | {type: 'clear'}
  | {type: 'advance'; run: number; step: number}
  | {type: 'finish'; run: number};
export function loadingReducer(state: LoadingState, event: LoadingEvent): LoadingState {
  if (event.type === 'clear') return {...initialLoadingState, run: state.run + 1};
  if (event.type === 'start') {
    if (state.phase === 'running') return state;
    return {phase: 'running', run: state.run + 1, step: 0, shouldFail: event.shouldFail ?? false};
  }
  if (event.type === 'cancel') return state.phase === 'running' ? {...state, phase: 'cancelled'} : state;
  if (state.phase !== 'running' || event.run !== state.run) return state;
  if (event.type === 'advance') return {...state, step: Math.max(state.step, Math.min(2, Math.max(0, Math.trunc(event.step))))};
  return {...state, phase: state.shouldFail ? 'error' : 'complete', step: 2};
}
