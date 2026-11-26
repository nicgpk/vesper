import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('apps/storybook/vesper/site/ChatRefinements.tsx','utf8');
const contract=readFileSync('packages/core/src/Chat/ChatComposer.tsx','utf8');
assert(contract.includes('Actions rendered on the left side of the footer. Use `size="md"` buttons'));
assert(source.includes('footerActions={expanded ? <Button label="Mention Riley" size="md" variant="ghost"'));
assert(source.includes('input.current?.insertToken(mention)'));
assert(source.includes('sendButton={<ChatSendButton/>}'));
console.log('4 footer action contract checks pass; native sizing unchanged, not rendered geometry.');
