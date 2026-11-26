import fs from 'node:fs';import assert from 'node:assert/strict';import {transformSync} from 'esbuild';
const src=fs.readFileSync('packages/lab/src/MobileTokenizer/MobileTokenizer.tsx','utf8');
const start=src.indexOf('  useEffect(() => {',src.indexOf('// ---- sheet search ----'));
const end=src.indexOf('\n  }, [',start);assert(start>0&&end>start);
const callback=src.slice(start,end).replace('  useEffect(', '')+'\n  }';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};};
const flush=async()=>{await new Promise(resolve=>setImmediate(resolve));};
function harness(){const events=[],timers=new Map(),seqRef={current:0};let timerId=0;const state={results:[],failed:false,loading:false};const setters={setResults:x=>{state.results=x;events.push(['results',x]);},setSearchFailed:x=>{state.failed=x;events.push(['failed',x]);},setIsSearching:x=>{state.loading=x;events.push(['loading',x]);}};return {events,state,timers,run(options={}){const env={isSheetOpen:true,isDisabled:false,query:'Riley',minQueryLength:1,maxMenuItems:2,debounceMs:0,searchSource:{search:()=>[]},seqRef,...setters,setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),...options};const js=transformSync('const effect='+callback,{loader:'ts'}).code;return new Function(...Object.keys(env),js+';return effect();')(...Object.values(env));},tick(){for(const [id,fn]of [...timers]){timers.delete(id);fn();}}};}
const unhandled=[];const onUnhandled=e=>unhandled.push(e);process.on('unhandledRejection',onUnhandled);
try {
 for(const debounceMs of [0,30])for(const query of ['', 'Riley'])for(const outcome of ['resolve','reject']){
  const h=harness(),d=deferred(),source={bootstrap:()=>d.promise,search:()=>d.promise};const cleanup=h.run({debounceMs,query,searchSource:source});if(debounceMs)h.tick();assert.equal(typeof cleanup,'function');cleanup();h.events.length=0;d[outcome](outcome==='resolve'?[{id:'old'}]:Error('old'));await flush();assert.deepEqual(h.events,[],`${debounceMs} ${query} ${outcome} after cleanup`);
 }
 const pending=harness();pending.run({debounceMs:30,searchSource:{search:()=>{throw Error('must not run');}}})();pending.tick();await flush();assert.equal(pending.timers.size,0);
 for(const option of [{isSheetOpen:false},{isDisabled:true}]){const h=harness();assert.equal(h.run(option),undefined);assert.equal(h.events.length,0);}
 for(const source of [{search:()=>Promise.reject(Error('fail'))},{search:()=>{throw Error('sync fail');}}]){const h=harness();const cleanup=h.run({searchSource:source});await flush();assert(h.state.failed);assert.equal(h.state.loading,false);assert.deepEqual(h.state.results,[]);cleanup();h.run({searchSource:{search:()=>[{id:'ok'}]}});await flush();assert(!h.state.failed);assert.deepEqual(h.state.results,[{id:'ok'}]);}
 for(const staleOutcome of ['resolve','reject']){const h=harness(),old=deferred(),next=deferred();const cleanup=h.run({searchSource:{search:()=>old.promise}});cleanup();h.run({searchSource:{search:()=>next.promise}});next.resolve([{id:'new'},{id:'2'},{id:'3'}]);await flush();assert.deepEqual(h.state.results,[{id:'new'},{id:'2'}]);h.events.length=0;old[staleOutcome](staleOutcome==='resolve'?[{id:'old'}]:Error('old'));await flush();assert.deepEqual(h.events,[]);assert(!h.state.failed);}
 const short=harness();short.run({query:'a',minQueryLength:2,searchSource:{search:()=>{throw Error('must not search');}}});await flush();assert.deepEqual(short.state.results,[]);assert(!short.state.failed&&!short.state.loading);
 const fallback=harness();fallback.run({query:'',searchSource:{search:q=>{assert.equal(q,'');return [{id:'bootstrap-fallback'}];}}});await flush();assert.equal(fallback.state.results[0].id,'bootstrap-fallback');
 await flush();assert.deepEqual(unhandled,[]);
} finally {process.removeListener('unhandledRejection',onUnhandled);}
// Selected rows are derived independently from search results; the search effect never mutates value.
assert(!callback.includes('onChange('));assert(!callback.includes('setSelectedItemsAtOpen('));
for(const text of ['isSearching || searchFailed','Your selections are unchanged.','setRetrySearch(value => value + 1)','!isSearching && !searchFailed','retrySearch,','isDisabled,'])assert(src.includes(text),text);
const visibleStart=src.indexOf('  const visibleItems = useMemo(() => {');const visibleEnd=src.indexOf('\n  }, [query, results, selectedItemsAtOpen, value]);',visibleStart);const visible=src.slice(visibleStart,visibleEnd).replace('  const visibleItems = useMemo(', '')+'\n}';const js=transformSync('const fn='+visible,{loader:'ts'}).code;const selected=[{id:'riley',label:'Riley'}];const result=new Function('query','results','selectedItemsAtOpen','value',js+';return fn();')('',[],selected,selected);assert.deepEqual(result,selected);
console.log('Independent extracted MobileTokenizer effect: async/sync failures, immediate/debounced cleanup, canceled timers, close/disabled guards, source/retry stale results and failures, cap/minimum/bootstrap, retained selection + retry/Create wiring pass. No mounted/browser verification.');
