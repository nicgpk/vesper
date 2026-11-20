import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {shouldStartReading,createReadingAutoStart,readingTimings,TextLoadingPreview} from './vesper/site/LoadingStudies';export {createElement} from 'react';export {renderToString} from 'react-dom/server';export {loadingReducer,initialLoadingState} from './vesper/site/loading-machine';");
let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++};
const eligible={ratio:.35,documentVisible:true,reducedMotion:false};
eq(m.shouldStartReading(eligible),true);
for(const state of [{...eligible,ratio:.349},{...eligible,ratio:0},{...eligible,documentVisible:false},{...eligible,reducedMotion:true}])eq(m.shouldStartReading(state),false);
let starts=0,g=m.createReadingAutoStart(()=>starts++);
eq(g.check({...eligible,documentVisible:false}),false);eq(starts,0);eq(g.check(eligible),true);eq(g.check(eligible),false);eq(starts,1);
g=m.createReadingAutoStart(()=>starts++);g.manual();eq(g.check(eligible),false);eq(starts,1);
g=m.createReadingAutoStart(()=>starts++);g.dispose();eq(g.check(eligible),false);
eq(m.readingTimings,[1800,3600,6000]);
let s=m.loadingReducer(m.initialLoadingState,{type:'start'}),cancel=m.loadingReducer(s,{type:'cancel'});eq(m.loadingReducer(cancel,{type:'finish',run:s.run}),cancel);
const retry=m.loadingReducer(cancel,{type:'start'});eq(m.loadingReducer(retry,{type:'finish',run:s.run}),retry);
const html=m.renderToString(m.createElement(m.TextLoadingPreview));assert(html.includes('Summarize notes'));n++;assert(!html.includes('ls-text-shimmer'));n++;
const source=readFileSync('apps/storybook/vesper/site/LoadingStudies.tsx','utf8');
for(const text of ['ref={root}','threshold:[0,.35,1]','document.visibilityState===\'visible\'','observer.disconnect()',"document.removeEventListener('visibilitychange',visibility)","motion.removeEventListener('change',check)",'timers.forEach(timer => window.clearTimeout(timer))','function useLoadingStudy(timings = [950, 1900, 3100])']){assert(source.includes(text),text);n++;}
console.log(n+' reading visibility/manual lifecycle, finite timing, SSR and cleanup checks pass. No browser playback verification.');
