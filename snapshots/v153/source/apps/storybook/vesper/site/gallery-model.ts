/* SPDX-License-Identifier: MIT
 * Discovery only: original demo definitions and behavior are not modified.
 */
export type DiscoveryScope = 'featured' | 'all' | 'chat' | 'loading';
export const featuredIds = [
  'chat-composer', 'chat-reasoning', 'chat-parallel-tools', 'chat-response-feedback', 'loading-text', 'loading-tool', 'loading-cube',
  'chat-conversation', 'chat-layout', 'selector',
  'chat-approval', 'chat-reactions', 'native-selection-tools',
  'form-field-family', 'popover', 'carousel',
] as const;
export const featureLinks = [
  {id: 'chat-composer', title: 'Compose with context', label: '01 / Conversation', art: 'dunes-ridge'},
  {id: 'chat-reasoning', title: 'Follow the work', label: '02 / Tool calls', art: 'nature-ocean'},
  {id: 'loading-text', title: 'Make waiting visible', label: '03 / Feedback', art: 'nature-forest'},
] as const;
export type Discoverable = {id: string; name: string; category: string; covers?: string[]};
// Keep compact identifiers searchable while also accepting their natural spacing.
export function searchText(value:string):string {
 return value.replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2').replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
}
export function matchesStudy(item:Discoverable,query:string):boolean {
 const raw=`${item.name} ${item.category} ${(item.covers??[]).join(' ')}`;
 const normalized=searchText(query);
 return !query.trim() || (!!normalized && searchText(raw).includes(normalized)) || raw.toLowerCase().includes(query.trim().toLowerCase());
}
export function discover<T extends Discoverable>(items: readonly T[], scope: DiscoveryScope, category: string, query: string): T[] {
  const needle = query.trim().toLowerCase();
  const eligible = items.filter(item =>
    (category === 'All' || item.category === category) &&
    (matchesStudy(item,query)) &&
    (needle || scope === 'all' || (scope === 'chat' ? item.id.startsWith('chat-') : scope === 'loading' ? item.category === 'Loading' : (featuredIds as readonly string[]).includes(item.id))));
  if (scope === 'featured' && !needle) {
    return eligible.sort((a, b) => (featuredIds as readonly string[]).indexOf(a.id) - (featuredIds as readonly string[]).indexOf(b.id));
  }
  return eligible;
}
