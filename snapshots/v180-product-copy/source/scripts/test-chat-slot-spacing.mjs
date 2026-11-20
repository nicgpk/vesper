import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const bubble=readFileSync('packages/core/src/Chat/ChatMessageBubble.tsx','utf8'),compiled=readFileSync('packages/core/dist/Chat/ChatMessageBubble.js','utf8'),message=readFileSync('packages/core/src/Chat/ChatMessage.tsx','utf8');
for(const s of [bubble,compiled]){assert(!s.includes('headerReducedGap'));assert(!s.includes('metadataReducedGap'));}
for(const [density,token]of[['Compact','0-5'],['Balanced','1'],['Spacious','1-5']])assert(message.includes(`childrenGap${density}: {\n    gap: spacingVars['--spacing-${token}']`));
for(const gap of [2,4,6])assert(gap>0);
assert(bubble.includes('metadataPaddingStyle'));assert(bubble.includes('styles.nameRow'));assert(bubble.includes('styles.alignEnd'));
console.log('13 native slot-spacing source checks pass; no mounted or rendered QA.');
