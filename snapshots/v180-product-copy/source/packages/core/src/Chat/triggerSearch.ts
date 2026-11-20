// Copyright (c) Meta Platforms, Inc. and affiliates.
import type {SearchableItem, SearchSource} from '../Typeahead/types';

/** Local request lifecycle; no detection requests and no dependence on cancellation. */
export function createTriggerSearch(commit: (items: SearchableItem[], isLoading: boolean) => void) {
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let active: SearchSource | null = null;
  const asyncSources = new WeakSet<SearchSource>();
  function cancel() {
    generation += 1;
    if (timer !== null) {clearTimeout(timer);timer = null;}
    const source = active;active = null;
    // Cancellation is optional; stale completion guards remain authoritative.
    try {source?.cancel?.();} catch { /* A faulty cancel must not revive old results. */ }
  }
  function search(source: SearchSource | undefined, query: string, delay: number) {
    cancel();
    const request = generation;
    if (!source) {commit([], false);return;}
    active = source;
    commit([], true); // Previous-query options must not remain selectable.
    const finish = (items: SearchableItem[]) => {
      if (request !== generation) return;
      active = null;
      commit(items, false);
    };
    const run = () => {
      timer = null;
      if (request !== generation) return;
      try {
        const result = source.search(query);
        if (Array.isArray(result)) {finish(result);return;}
        asyncSources.add(source);
        Promise.resolve(result).then(finish, () => finish([]));
      } catch {finish([]);}
    };
    // Learn from the first real query. Never issue an empty probe to detect async.
    if (asyncSources.has(source) && delay > 0) timer = setTimeout(run, delay);
    else run();
  }
  return {search, cancel};
}
