// SPDX-License-Identifier: MIT
import {useState} from 'react';
import {Icon} from '@astryxdesign/core/Icon';
import {Button} from '@astryxdesign/core/Button';
import type {Demo} from './demos';
import {tokenBreakdown, usageExamples, type TokenUsage} from './token-usage';
import './token-usage.css';

const number = new Intl.NumberFormat('en-US');
export function TokenUsageBreakdown({usage, compact = false}: {usage: TokenUsage | null; compact?: boolean}) {
 const counts = usage && tokenBreakdown(usage);
 if (!counts) return <p className="tu-note">Token usage unavailable.</p>;
 const {total, input, output, cachedInput, reasoningOutput, uncachedInput, otherOutput} = counts;
 const segments = [
  {tone:'input', value:uncachedInput ?? input},
  {tone:'cached', value:cachedInput ?? 0},
  {tone:'output', value:otherOutput ?? output},
  {tone:'reasoning', value:reasoningOutput ?? 0},
 ];
 return <div className="tu-breakdown" data-compact={compact}>
  {!compact && <div className="tu-total"><strong>{number.format(total)}</strong> <span>tokens total</span></div>}
  {total > 0 && <div className="tu-track" aria-hidden="true">{segments.filter(({value})=>value>0).map(({tone,value})=><span key={tone} data-tone={tone} style={{flexGrow:value}} />)}</div>}
  <div className="tu-groups">
   <dl className="tu-group">
    <div><dt>Input</dt><dd>{number.format(input)}</dd></div>
    {cachedInput !== undefined && <div className="tu-sub"><dt><i data-tone="cached" aria-hidden="true"/>Cached</dt><dd>{number.format(cachedInput)}</dd></div>}
    {uncachedInput !== undefined && <div className="tu-sub"><dt><i data-tone="input" aria-hidden="true"/>Uncached</dt><dd>{number.format(uncachedInput)}</dd></div>}
   </dl>
   <dl className="tu-group">
    <div><dt>Output</dt><dd>{number.format(output)}</dd></div>
    {reasoningOutput !== undefined && <div className="tu-sub"><dt><i data-tone="reasoning" aria-hidden="true"/>Reasoning</dt><dd>{number.format(reasoningOutput)}</dd></div>}
    {otherOutput !== undefined && <div className="tu-sub"><dt><i data-tone="output" aria-hidden="true"/>Other output</dt><dd>{number.format(otherOutput)}</dd></div>}
   </dl>
  </div>
 </div>;
}

export function InlineTokenUsage({usage}: {usage: TokenUsage}) {
 const counts = tokenBreakdown(usage);
 if (!counts) return null;
 return <details className="tu-inline">
  <summary><Icon icon="info" size="xsm" aria-hidden="true"/><span className="tu-sr">Last reply token usage: </span><span className="tu-count">{number.format(counts.total)} tokens</span><Icon icon="chevronDown" size="xsm" className="tu-chevron" aria-hidden="true"/></summary>
  <TokenUsageBreakdown usage={usage} compact />
 </details>;
}

export function TokenUsageStudy() {
 const [run, setRun] = useState<keyof typeof usageExamples>('followup');
 return <section className="tu-study" aria-label="Token usage">
  <header className="tu-header"><strong>Token usage</strong><span>Per response</span></header>
  <div className="tu-switch" role="group" aria-label="Request">
   <Button label="First request" size="sm" variant={run === 'first' ? 'primary' : 'secondary'} aria-pressed={run === 'first'} onClick={()=>setRun('first')} />
   <Button label="Follow-up" size="sm" variant={run === 'followup' ? 'primary' : 'secondary'} aria-pressed={run === 'followup'} onClick={()=>setRun('followup')} />
  </div>
  <div className="tu-sr" role="status">{run === 'first' ? 'First request' : 'Follow-up'}: {number.format(usageExamples[run].input + usageExamples[run].output)} tokens total.</div>
  <TokenUsageBreakdown usage={usageExamples[run]} />
 </section>;
}
export const tokenUsageDemo: Demo = {
 id:'chat-token-usage',name:'Token usage',category:'Chat',
 description:'Compare two responses and see how cached tokens fit within input and reasoning tokens fit within output.',
 material:'A token breakdown with an expandable chat variant. Totals reflect input and output, with cached and reasoning tokens shown within their respective groups.',
 code:"import {TokenUsageBreakdown} from './TokenUsageStudy';\n<TokenUsageBreakdown usage={{input:3880,cachedInput:2048,output:600,reasoningOutput:120}} />",
 Preview:TokenUsageStudy,
};
