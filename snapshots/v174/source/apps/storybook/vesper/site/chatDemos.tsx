/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Public built Astryx Chat components, browser-local state, and parent theme/providers.
 * @output Six native Chat previews with readable compact reasoning and full public coverage.
 * @position Vesper Pages demo catalog; no stories, remote services, or automatic microphone access.
 */
import {useEffect, useRef, useState} from 'react';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Stack';
import {
  ChatComposer,
  ChatComposerDrawer,
  ChatComposerInput,
  ChatComposerTokenElement,
  ChatDictationButton,
  ChatLayout,
  ChatLayoutScrollButton,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSendButton,
  ChatSystemMessage,
  ChatTokenizedText,
  ChatToolCalls,
  useChatLayoutContext,
  type ChatComposerInputHandle,
  type ChatComposerToken,
  type UseSpeechRecognitionReturn,
} from '@astryxdesign/core/Chat';
import {
  ChatEmojiPicker,
  ChatReactionBar,
  ChatReasoning,
  ChatTypingIndicator,
  ChatUnreadDivider,
  type ChatReaction,
} from '@astryxdesign/lab';
import type {Demo} from './demos';

const mention: ChatComposerToken = {
  value: '@Riley',
  label: 'Riley',
  variant: 'neutral',
};
const lexicalConfig = {
  namespace: 'VesperNativeChatTokens',
  onError(error: Error) {
    throw error;
  },
};

function ConversationPreview() {
  const [typing, setTyping] = useState(true);
  return (
    <div className="demo-stack">
      <ChatMessageList density="balanced">
        <ChatSystemMessage variant="divider">
          Today · Design review
        </ChatSystemMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble
            name="You"
            metadata={<ChatMessageMetadata timestamp="10:24" status="read" />}>
            Could you review the collection with @Riley?
          </ChatMessageBubble>
        </ChatMessage>
        <ChatUnreadDivider label="New replies" />
        <ChatMessage sender="assistant">
          <ChatMessageBubble name="Studio assistant" group="first">
            <ChatTokenizedText tokens={[mention]}>
              I shared the local draft with @Riley.
            </ChatTokenizedText>
          </ChatMessageBubble>
          <ChatMessageBubble
            group="last"
            metadata={
              <ChatMessageMetadata
                timestamp="10:25"
                footer="Preview conversation"
              />
            }>
            The next step is a contrast and keyboard review.
          </ChatMessageBubble>
        </ChatMessage>
        <ChatSystemMessage>
          Messages stay on this page.
        </ChatSystemMessage>
        {typing && <ChatTypingIndicator names={['Riley']} />}
      </ChatMessageList>
      <Button
        label={typing ? 'Hide typing indicator' : 'Show typing indicator'}
        variant="ghost"
        onClick={() => setTyping(value => !value)}
      />
    </div>
  );
}

function ComposerPreview() {
  const [draft, setDraft] = useState('Please review the collection.');
  const [sent, setSent] = useState('Nothing sent yet.');
  const input = useRef<ChatComposerInputHandle>(null);
  return (
    <LexicalComposer initialConfig={lexicalConfig}>
      <div className="demo-stack">
        <p className="demo-copy">
          Insert a mention, edit the draft, then press Enter or Send. No message
          leaves this page.
        </p>
        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSubmit={value => {
            setSent(value);
            setDraft('');
          }}
          drawer={
            <ChatComposerDrawer count={1} label="Review context">
              <div className="demo-row">
                <span className="demo-label">Reviewer</span>
                <ChatComposerTokenElement token={mention} />
              </div>
            </ChatComposerDrawer>
          }
          input={
            <ChatComposerInput
              label="Review message"
              handleRef={input}
              pasteAsToken={false}
            />
          }
          footerActions={
            <Button
              label="Mention Riley"
              size="sm"
              variant="ghost"
              onClick={() => {
                input.current?.focus();
                input.current?.insertToken(mention);
                // insertToken mutates the editor; publish its serialized value to the controlled draft.
                if (input.current) {setDraft(input.current.getValue());}
              }}
            />
          }
          sendButton={<ChatSendButton />}
        />
        <p className="demo-result" role="status">
          Last local message: {sent}
        </p>
      </div>
    </LexicalComposer>
  );
}

/** The button reads the actual layout scroll container, not the page or a simulated flag. */
function LayoutScrollControl() {
  const layout = useChatLayoutContext();
  const [scrolledUp, setScrolledUp] = useState(false);
  useEffect(() => {
    const element = layout?.scrollContainerRef.current;
    if (!element) {return;}
    const update = () =>
      setScrolledUp(
        element.scrollHeight - element.clientHeight - element.scrollTop > 40,
      );
    update();
    element.addEventListener('scroll', update, {passive: true});
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [layout]);
  return (
    <ChatLayoutScrollButton
      isVisible={scrolledUp}
      label="Latest messages"
      onClick={() => {
        const element = layout?.scrollContainerRef.current;
        element?.scrollTo({top: element.scrollHeight, behavior: 'smooth'});
      }}
    />
  );
}

function LayoutPreview() {
  const container = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<string[]>([]);
  return (
    <div className="demo-stack">
      <p className="demo-copy">
        A self-scrolling conversation with its composer dock contained in this
        card. Scroll up to reveal Latest messages.
      </p>
      <div className="demo-controls">
        <Button
          label="Read earlier messages"
          variant="ghost"
          onClick={() =>
            container.current?.scrollTo({top: 0, behavior: 'instant'})
          }
        />
      </div>
      <Stack height={440} width="100%">
        <ChatLayout
          ref={container}
          density="compact"
          scrollButton={<LayoutScrollControl />}
          composer={
            <ChatComposer
              placeholder="Add a local message…"
              onSubmit={value => setMessages(previous => [...previous, value])}
            />
          }>
          <ChatMessageList density="compact">
            {Array.from({length: 10}, (_, index) => (
              <ChatMessage
                key={index}
                sender={index % 2 ? 'user' : 'assistant'}>
                <ChatMessageBubble
                  name={index % 2 ? 'You' : 'Studio assistant'}>
                  {index % 2
                    ? `Review note ${index + 1}: keep the message readable on its surface.`
                    : `Review note ${index + 1}: keep the latest decision easy to find.`}
                </ChatMessageBubble>
              </ChatMessage>
            ))}
            {messages.map((message, index) => (
              <ChatMessage key={`local-${index}`} sender="user">
                <ChatMessageBubble>{message}</ChatMessageBubble>
              </ChatMessage>
            ))}
          </ChatMessageList>
        </ChatLayout>
      </Stack>
    </div>
  );
}

function ReasoningPreview() {
  return (
    <ChatMessageList density="compact">
      <ChatMessage sender="assistant">
        <ChatMessageBubble name="Studio assistant" variant="ghost" width="100%">
          <div className="demo-stack">
            <p className="demo-copy">
              Illustrative explanation and tool results, not a live model run.
            </p>
            <ChatReasoning
              label="Review approach"
              duration="2s"
              defaultIsExpanded>
              Check readable text, visible keyboard focus, and sender alignment
              before publishing the collection.
            </ChatReasoning>
            <ChatToolCalls
              label="Review checks"
              defaultIsExpanded
              calls={[
                {
                  key: 'contrast',
                  name: 'contrast_check',
                  status: 'complete',
                  duration: '240ms',
                  resultDetail:
                    'Illustrative result: primary text remains readable on the card surface.',
                },
                {
                  key: 'keyboard',
                  name: 'keyboard_check',
                  status: 'error',
                  duration: '120ms',
                  errorMessage:
                    'Illustrative failure: action needs an accessible name.',
                  resultDetail:
                    'Attachment action — illustrative result; no checks or tools were executed.',
                },
              ]}
            />
          </div>
        </ChatMessageBubble>
      </ChatMessage>
    </ChatMessageList>
  );
}

function ReactionsPreview() {
  const [reactions, setReactions] = useState<ChatReaction[]>([
    {emoji: '👍', count: 2, isSelected: false, label: 'Thumbs up'},
    {emoji: '🎉', count: 1, isSelected: true, label: 'Celebration'},
  ]);
  const [chosen, setChosen] = useState('No emoji selected.');
  const toggle = (emoji: string) =>
    setReactions(previous => {
      const existing = previous.find(reaction => reaction.emoji === emoji);
      return existing
        ? previous.map(reaction =>
            reaction.emoji === emoji
              ? {
                  ...reaction,
                  isSelected: !reaction.isSelected,
                  count: reaction.count + (reaction.isSelected ? -1 : 1),
                }
              : reaction,
          )
        : [...previous, {emoji, count: 1, isSelected: true, label: emoji}];
    });
  return (
    <div className="demo-stack">
      <ChatMessageList>
        <ChatMessage sender="assistant">
          <ChatMessageBubble
            name="Riley"
            metadata={
              <ChatReactionBar
                reactions={reactions}
                onToggle={toggle}
                onAdd={emoji => {
                  setChosen(emoji);
                  setReactions(previous =>
                    previous.some(reaction => reaction.emoji === emoji)
                      ? previous.map(reaction =>
                          reaction.emoji === emoji && !reaction.isSelected
                            ? {
                                ...reaction,
                                count: reaction.count + 1,
                                isSelected: true,
                              }
                            : reaction,
                        )
                      : [
                          ...previous,
                          {emoji, count: 1, isSelected: true, label: emoji},
                        ],
                  );
                }}
              />
            }>
            The collection is ready for review. What do you think?
          </ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>
      <ChatEmojiPicker onSelect={setChosen}>
        <Button label="Choose an emoji" variant="ghost" />
      </ChatEmojiPicker>
      <p className="demo-result" role="status">
        Selected emoji: {chosen}
      </p>
    </div>
  );
}

// Only the browser's explicitly local recognition path is allowed. The ordinary
// Web Speech API can use a remote service, so it is deliberately never invoked.
type LocalRecognition = {
  processLocally: boolean;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: {error: string}) => void) | null;
  onresult:
    | ((event: {
        resultIndex: number;
        results: ArrayLike<{isFinal: boolean; 0: {transcript: string}}>;
      }) => void)
    | null;
};
type LocalRecognitionConstructor = {
  new (): LocalRecognition;
  prototype: LocalRecognition;
  available(options: {langs: string[]; processLocally: true}): Promise<string>;
};
function localRecognitionConstructor(): LocalRecognitionConstructor | null {
  if (typeof window === 'undefined') {return null;}
  const browser = window as unknown as {
    SpeechRecognition?: LocalRecognitionConstructor;
    webkitSpeechRecognition?: LocalRecognitionConstructor;
  };
  const Constructor =
    browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
  return Constructor &&
    'processLocally' in Constructor.prototype &&
    typeof Constructor.available === 'function'
    ? Constructor
    : null;
}

function DictationPreview() {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState('');
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [notice, setNotice] = useState(
    'Local-only dictation requires browser support and an already-installed English language pack. No language packs are downloaded.',
  );
  const recognition = useRef<LocalRecognition | null>(null);
  const mounted = useRef(true);
  const starting = useRef(false);
  const Constructor = localRecognitionConstructor();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      recognition.current?.abort();
    };
  }, []);
  const start = async () => {
    if (!Constructor || starting.current || recognition.current) {return;}
    starting.current = true;
    try {
      const availability = await Constructor.available({
        langs: ['en-US'],
        processLocally: true,
      });
      if (!mounted.current) {return;}
      if (availability !== 'available') {
        setNotice(
          `Local dictation unavailable (${availability}). Type instead; no download or cloud fallback is used.`,
        );
        return;
      }
      const instance = new Constructor();
      instance.processLocally = true;
      instance.lang = 'en-US';
      instance.continuous = false;
      instance.interimResults = true;
      instance.onstart = () => {
        if (mounted.current) {
          setListening(true);
          setNotice('Listening locally. Stop when finished.');
        }
      };
      instance.onend = () => {
        recognition.current = null;
        if (mounted.current) {
          setListening(false);
          setInterim('');
        }
      };
      instance.onerror = event => {
        if (mounted.current)
          {setNotice(
            `Local dictation unavailable: ${event.error}. Type instead.`,
          );}
      };
      instance.onresult = event => {
        if (!mounted.current) {return;}
        let partial = '';
        for (
          let index = event.resultIndex;
          index < event.results.length;
          index++
        ) {
          const result = event.results[index];
          if (result.isFinal)
            {setDraft(
              previous =>
                `${previous}${previous ? ' ' : ''}${result[0].transcript}`,
            );}
          else {partial += result[0].transcript;}
        }
        setInterim(partial);
      };
      recognition.current = instance;
      instance.start();
    } catch {
      recognition.current?.abort();
      recognition.current = null;
      if (mounted.current) {
        setListening(false);
        setNotice(
          'Local recognition could not start. Check browser permissions or type instead.',
        );
      }
    } finally {
      starting.current = false;
    }
  };
  const dictation: UseSpeechRecognitionReturn = {
    isSupported: Constructor !== null,
    isListening: listening,
    isSpeaking: interim.length > 0,
    interimTranscript: interim,
    volume: 0,
    bands: [],
    rawBands: [],
    start: () => {
      void start();
    },
    stop: () => recognition.current?.stop(),
    abort: () => recognition.current?.abort(),
    toggle: () => {
      if (recognition.current) {recognition.current.stop();}
      else {void start();}
    },
  };
  return (
    <div className="demo-stack">
      <p className="demo-copy">
        {Constructor
          ? notice
          : 'On-device speech recognition is unavailable in this browser. The microphone stays disabled; typing and sending still work. Cloud recognition is never used.'}
      </p>
      <ChatComposer
        value={draft}
        onChange={setDraft}
        onSubmit={value => {
          setSent(value);
          setDraft('');
        }}
        placeholder="Type a message, or use local dictation if available…"
        sendActions={
          <ChatDictationButton
            dictation={dictation}
            isHiddenWhenUnsupported={false}
            label={listening ? 'Stop local dictation' : 'Start local dictation'}
          />
        }
      />
      {interim && (
        <p className="demo-copy" role="status">
          Interim speech: {interim}
        </p>
      )}
      <p className="demo-result" role="status">
        {sent
          ? `Last local message: ${sent}`
          : 'No recording starts until you explicitly press the microphone. No audio playback.'}
      </p>
    </div>
  );
}

const material =
  'Conversation content sits on the parent readable card; semantic sender, error, reaction, and focus states stay distinct.';
export const chatDemos: Demo[] = [
  {
    id: 'chat-conversation',
    name: 'Chat conversation',
    category: 'Chat',
    description:
      'Sender-aware bubbles, metadata, tokenized mentions, unread and typing states.',
    material,
    covers: [
      'ChatMessage',
      'ChatMessageBubble',
      'ChatMessageList',
      'ChatMessageMetadata',
      'ChatSystemMessage',
      'ChatTokenizedText',
      'ChatTypingIndicator',
      'ChatUnreadDivider',
    ],
    code: '<ChatMessageList><ChatMessage sender="assistant"><ChatMessageBubble name="Studio assistant" metadata={<ChatMessageMetadata timestamp="10:25" />}><ChatTokenizedText tokens={tokens}>{text}</ChatTokenizedText></ChatMessageBubble></ChatMessage><ChatUnreadDivider label="New replies" /><ChatTypingIndicator names={["Riley"]} /></ChatMessageList>',
    Preview: ConversationPreview,
  },
  {
    id: 'chat-composer',
    name: 'Chat composer and tokens',
    category: 'Chat',
    description:
      'Editable input, visible token element in a safe editor context, collapsible drawer and local submission.',
    material,
    covers: [
      'ChatComposer',
      'ChatComposerDrawer',
      'ChatComposerInput',
      'ChatComposerTokenElement',
      'ChatSendButton',
    ],
    code: '<LexicalComposer initialConfig={config}><ChatComposer value={draft} onChange={setDraft} onSubmit={sendLocally} drawer={<ChatComposerDrawer count={1} label="Review context"><ChatComposerTokenElement token={mention} /></ChatComposerDrawer>} input={<ChatComposerInput handleRef={input} />} sendButton={<ChatSendButton />} /></LexicalComposer>',
    Preview: ComposerPreview,
  },
  {
    id: 'chat-layout',
    name: 'Chat layout and scroll control',
    category: 'Chat',
    description:
      'Contained dock and actual scroll-state-driven navigation through a longer conversation.',
    material,
    covers: ['ChatLayout', 'ChatLayoutScrollButton'],
    code: '<Stack height={440}><ChatLayout composer={<ChatComposer onSubmit={appendLocalMessage} />} scrollButton={<LayoutScrollControl />}><ChatMessageList>{messages}</ChatMessageList></ChatLayout></Stack> // LayoutScrollControl reads useChatLayoutContext().scrollContainerRef.',
    Preview: LayoutPreview,
  },
  {
    id: 'chat-reasoning',
    name: 'Chat reasoning and tool calls',
    category: 'Chat',
    description:
      'Expandable illustrative explanation and inspectable success/error tool results.',
    material,
    covers: ['ChatReasoning', 'ChatToolCalls'],
    code: '// Put long targets in resultDetail rather than competing with tool names in narrow rows.\n<ChatMessageList density="compact"><ChatMessage sender="assistant"><ChatMessageBubble variant="ghost" width="100%"><ChatReasoning label="Review approach" defaultIsExpanded>{explanation}</ChatReasoning><ChatToolCalls calls={exampleCalls} defaultIsExpanded /></ChatMessageBubble></ChatMessage></ChatMessageList>',
    Preview: ReasoningPreview,
  },
  {
    id: 'chat-reactions',
    name: 'Chat emoji and reactions',
    category: 'Chat',
    description:
      'Toggle reaction counts, add a reaction, and filter the native emoji picker.',
    material,
    covers: ['ChatEmojiPicker', 'ChatReactionBar'],
    code: '<ChatReactionBar reactions={reactions} onToggle={toggleReaction} onAdd={addReaction} /><ChatEmojiPicker onSelect={setEmoji}><Button label="Choose an emoji" /></ChatEmojiPicker>',
    Preview: ReactionsPreview,
  },
  {
    id: 'chat-dictation',
    name: 'Chat local-only dictation',
    category: 'Chat',
    description:
      'Real microphone control with an honest disabled fallback; no cloud speech, downloads or automatic recording.',
    material,
    covers: ['ChatDictationButton'],
    code: '<ChatComposer value={draft} onChange={setDraft} onSubmit={sendLocally} sendActions={<ChatDictationButton dictation={localOnlyRecognition} isHiddenWhenUnsupported={false} />} /> // Requires processLocally=true and an already-installed language pack; never uses cloud recognition.',
    Preview: DictationPreview,
  },
];
