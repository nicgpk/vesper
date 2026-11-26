import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShowcaseModule} from './load-vesper-module.mjs';
const m=await loadShowcaseModule("export {shouldFocusGallerySearch,isEditingSurface} from './vesper/site/gallery-navigation';");
const base={defaultPrevented:false,isComposing:false,metaKey:false,ctrlKey:true,altKey:false,shiftKey:false,key:'k'};
assert(m.shouldFocusGallerySearch(base,false));assert(m.shouldFocusGallerySearch({...base,ctrlKey:false,metaKey:true,key:'K'},false));
for(const update of [{defaultPrevented:true},{isComposing:true},{altKey:true},{shiftKey:true},{ctrlKey:false},{key:'l'}])assert.equal(m.shouldFocusGallerySearch({...base,...update},false),false);
assert.equal(m.shouldFocusGallerySearch(base,true),false);
for(const tagName of ['input','TEXTAREA','SELECT'])assert(m.isEditingSurface({tagName}));
assert(m.isEditingSurface({tagName:'DIV',isContentEditable:true}));
for(const role of ['textbox','combobox'])assert(m.isEditingSurface({tagName:'DIV',getAttribute:name=>name==='role'?role:null}));
for(const tagName of ['BUTTON','A','DIV'])assert.equal(m.isEditingSurface({tagName}),false);
assert.equal(m.isEditingSurface({}),false);
const source=readFileSync('apps/storybook/vesper/site/ExactGallery.tsx','utf8');
assert(source.includes('event.composedPath().some(node=>node instanceof HTMLElement&&isEditingSurface(node))'));
const shortcut=source.slice(source.indexOf('const shortcut ='),source.indexOf("window.addEventListener('hashchange'"));
assert(shortcut.indexOf('if (shouldFocusGallerySearch(event,editing))')<shortcut.indexOf('event.preventDefault();'));
assert(source.includes("window.location.hash = '#/components'"));
console.log('Gallery shortcut preserves editable/editor/combobox input, handled events, IME, Alt/Shift combinations; Ctrl/Meta K retained outside editors. Pure/source tests, not browser shortcut proof.');
// Execute the actual handler body with a minimal DOM boundary, not a duplicate handler.
const body=source.match(/const shortcut = \(event: KeyboardEvent\) => \{([\s\S]*?)\n    \};/)?.[1];assert(body);
const run=new Function('event','HTMLElement','isEditingSurface','shouldFocusGallerySearch','search','requestSearch','window',body);
class Element{constructor(tagName,editable=false){this.tagName=tagName;this.isContentEditable=editable;}getAttribute(){return null;}}
for(const editing of [false,true])for(const hasSearch of [false,true]){
 let prevented=false,focused=false;const requestSearch={current:false};const window={location:{hash:'#/components/rich-text-editor'}};
 const event={...base,composedPath:()=>[new Element(editing?'TEXTAREA':'BUTTON')],preventDefault(){prevented=true;}};
 run(event,Element,m.isEditingSurface,m.shouldFocusGallerySearch,{current:hasSearch?{focus(){focused=true;}}:null},requestSearch,window);
 assert.equal(prevented,!editing);assert.equal(focused,!editing&&hasSearch);assert.equal(requestSearch.current,!editing&&!hasSearch);
 assert.equal(window.location.hash,!editing&&!hasSearch?'#/components':'#/components/rich-text-editor');
}
console.log('Actual shortcut body keeps editing in-place; non-editing focus and detail-to-search transitions pass.');
