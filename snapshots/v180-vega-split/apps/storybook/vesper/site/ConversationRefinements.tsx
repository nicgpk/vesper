/* SPDX-License-Identifier: MIT
 * Local conversation compositions; no network or model invocation. Original
 * native Chat components, catalog sources, and existing refinements stay intact.
 */
import {useEffect, useReducer, useRef, useState, type ComponentType} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Stack';
import {ChatComposer, ChatLayout, ChatLayoutScrollButton, ChatMessage, ChatMessageBubble, ChatMessageList, ChatMessageMetadata, ChatSystemMessage, ChatTokenizedText, useChatLayoutContext, type ChatComposerToken} from '@astryxdesign/core/Chat';
import {ChatTypingIndicator, ChatUnreadDivider} from '@astryxdesign/lab';
import './conversation-refinements.css';

export type ReplyState = {phase: 'idle' | 'drafting' | 'cancelled' | 'ready'; run: number};
export const initialReply: ReplyState = {phase: 'idle', run: 0};
export type ReplyEvent = {type: 'start'} | {type: 'stop'} | {type: 'finish'; run: number};
export function replyReducer(state: ReplyState, event: ReplyEvent): ReplyState {
  if (event.type === 'start') return state.phase === 'drafting' ? state : {phase: 'drafting', run: state.run + 1};
  if (event.type === 'stop') return state.phase === 'drafting' ? {...state, phase: 'cancelled'} : state;
  return state.phase === 'drafting' && event.run === state.run ? {...state, phase: 'ready'} : state;
}
export function cleanMessage(value: string): string | null {return value.trim() || null;}
export function isAboveLatest(scrollHeight: number, clientHeight: number, scrollTop: number): boolean {return scrollHeight - clientHeight - scrollTop > 40;}
export function preferredScrollBehavior(reduced: boolean): ScrollBehavior {return reduced ? 'instant' : 'smooth';}
function scrollBehavior(): ScrollBehavior {return preferredScrollBehavior(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);}
const riley: ChatComposerToken = {value: '@Riley', label: 'Riley', variant: 'neutral'};

export function ConversationRefinement() {
  const [state, dispatch] = useReducer(replyReducer, initialReply);
  const busy = state.phase === 'drafting';
  useEffect(() => {
    if (!busy) return;
    const run = state.run;
    const timer = window.setTimeout(() => dispatch({type: 'finish', run}), 2400);
    return () => window.clearTimeout(timer);
  }, [busy, state.run]);
  const status = busy ? 'Preparing a reply' : state.phase === 'ready' ? 'Draft ready' : state.phase === 'cancelled' ? 'Drafting stopped' : '';
  return <div className="cv-study">
    <header className="cv-heading"><strong>Keep the thread</strong></header>
    <ChatMessageList density="compact">
      <ChatSystemMessage variant="divider">Onboarding review</ChatSystemMessage>
      <ChatMessage sender="user"><ChatMessageBubble name="You" metadata={<ChatMessageMetadata footer="Review thread"/>}><ChatTokenizedText tokens={[riley]}>Could @Riley review the approval step?</ChatTokenizedText></ChatMessageBubble></ChatMessage>
      <ChatUnreadDivider label="Review note"/>
      <ChatMessage sender="assistant"><ChatMessageBubble name="Review partner">The draft is clear. Before publishing, show what will change and keep undo nearby.</ChatMessageBubble></ChatMessage>
      {busy ? <div className="cv-typing"><ChatTypingIndicator names={['Draft']}/></div> : null}
      {state.phase === 'ready' ? <ChatMessage sender="user"><ChatMessageBubble name="Your reply" metadata={<ChatMessageMetadata footer="Draft"/>}>Agreed. I’ll add a preview before approval and keep undo visible after publishing.</ChatMessageBubble></ChatMessage> : null}
    </ChatMessageList>
    <p className="cv-status" role="status" aria-live="polite" aria-atomic="true"><span className={busy ? 'cv-shimmer' : undefined}>{status}</span></p>
    <div className="cv-actions">{busy ? <Button label="Stop drafting" onClick={() => dispatch({type: 'stop'})}/> : <Button label={state.phase === 'cancelled' ? 'Retry reply' : state.phase === 'ready' ? 'Draft again' : 'Prepare a reply'} variant="primary" onClick={() => dispatch({type: 'start'})}/>}</div>
  </div>;
}

export const reviewTranscript = [
  {sender: 'user', name: 'You', text: 'Let’s review the onboarding flow before we hand it over.'},
  {sender: 'assistant', name: 'Review partner', text: 'Start with the first decision. What does someone need to understand before continuing?'},
  {sender: 'user', name: 'You', text: 'Which workspace they are joining, and who can see their work.'},
  {sender: 'assistant', name: 'Review partner', text: 'Put those details beside the invitation. Keep permissions visible rather than behind a tooltip.'},
  {sender: 'user', name: 'You', text: 'Then show the draft before the final approval.'},
  {sender: 'assistant', name: 'Review partner', text: 'Yes. A clear preview reduces surprises. After approval, show the outcome and a way to undo.'},
  {sender: 'user', name: 'You', text: 'I’ll bring that sequence to the next review.'},
] as const;

function LatestControl({revision}: {revision: number}) {
  const layout = useChatLayoutContext();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = layout?.scrollContainerRef.current;
    if (!element) return;
    const update = () => setVisible(isAboveLatest(element.scrollHeight, element.clientHeight, element.scrollTop));
    update();
    element.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(element);
    if (layout?.contentRef.current) observer?.observe(layout.contentRef.current);
    return () => {element.removeEventListener('scroll', update);window.removeEventListener('resize', update);observer?.disconnect();};
  }, [layout, revision]);
  return <ChatLayoutScrollButton isVisible={visible} label="Latest messages" onClick={() => {const element = layout?.scrollContainerRef.current;element?.scrollTo({top: element.scrollHeight, behavior: scrollBehavior()});}}/>;
}
export function LayoutRefinement() {
  const container = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  return <div className="cv-study">
    <header className="cv-heading"><strong>From context to next step</strong></header>
    <div className="cv-actions"><Button label="Read the earlier decisions" variant="ghost" onClick={() => container.current?.scrollTo({top: 0, behavior: scrollBehavior()})}/></div>
    <Stack height={440} width="100%">
      <ChatLayout ref={container} density="compact" scrollButton={<LatestControl revision={messages.length}/>}
        composer={<ChatComposer value={draft} onChange={setDraft} placeholder="Write a reply…" onSubmit={value => {const message = cleanMessage(value);if (!message) return;setMessages(previous => [...previous, message]);setDraft('');setNotice('Draft added to the thread.');}}/>}>
        <ChatMessageList density="compact">
          <ChatSystemMessage variant="divider">Onboarding · earlier decisions</ChatSystemMessage>
          {reviewTranscript.map((message, index) => <ChatMessage key={`context-${index}`} sender={message.sender}><ChatMessageBubble name={message.name}>{message.text}</ChatMessageBubble></ChatMessage>)}
          {messages.map((message, index) => <ChatMessage key={`local-${index}`} sender="user"><ChatMessageBubble name="You" metadata={<ChatMessageMetadata footer="Draft"/>}>{message}</ChatMessageBubble></ChatMessage>)}
        </ChatMessageList>
      </ChatLayout>
    </Stack>
    <p className="cv-note" role="status" aria-live="polite">{notice}</p>
  </div>;
}
export const conversationOverrides: Record<string, ComponentType> = {'chat-conversation': ConversationRefinement, 'chat-layout': LayoutRefinement};
