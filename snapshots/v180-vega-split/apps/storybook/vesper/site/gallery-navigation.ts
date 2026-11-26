/* SPDX-License-Identifier: MIT — route/focus decisions, no DOM selector interpolation. */
export type RouteFocus = 'none' | 'search' | 'heading' | 'origin';
export function routeFocus(previous: string, next: string, searchRequested: boolean, originExists: boolean): RouteFocus {
  if (previous === next) return 'none';
  if (searchRequested && !next) return 'search';
  if (next) return 'heading';
  return originExists ? 'origin' : 'heading';
}
export function isPlainActivation(event: {button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean}): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/** Gallery shortcuts must not steal editor/link commands or IME input. */
export function shouldFocusGallerySearch(event:{defaultPrevented:boolean;isComposing:boolean;metaKey:boolean;ctrlKey:boolean;altKey:boolean;shiftKey:boolean;key:string},editing:boolean):boolean {
  return !event.defaultPrevented&&!event.isComposing&&!event.altKey&&!event.shiftKey&&!editing&&(event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k';
}
export function isEditingSurface(node:{tagName?:string;isContentEditable?:boolean;getAttribute?:(name:string)=>string|null}):boolean {
  return ['INPUT','TEXTAREA','SELECT'].includes(node.tagName?.toUpperCase()??'')||node.isContentEditable===true||['textbox','combobox'].includes(node.getAttribute?.('role')??'');
}
