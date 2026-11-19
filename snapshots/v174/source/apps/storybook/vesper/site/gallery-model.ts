/* SPDX-License-Identifier: MIT
 * Discovery only: original demo definitions and behavior are not modified.
 */
export type DiscoveryScope = 'featured' | 'all' | 'chat' | 'loading';
export const featuredIds = [
  'chat-generative-ui', 'chat-reasoning', 'chat-parallel-tools', 'chat-response-feedback', 'loading-text', 'loading-tool', 'loading-cube',
  'chat-layout', 'selector',
  'chat-approval', 'chat-reactions', 'native-selection-tools',
  'form-field-family', 'popover', 'carousel',
] as const;
export const featureLinks = [
  {id: 'chat-generative-ui', title: 'Conversations', label: 'Chat and response', art: 'dunes-ridge', ids:['chat-generative-ui','chat-layout','chat-reactions']},
  {id: 'chat-reasoning', title: 'Tools and decisions', label: 'Work and review', art: 'nature-ocean', ids:['chat-reasoning','chat-parallel-tools','chat-approval']},
  {id: 'loading-text', title: 'Loading and feedback', label: 'Motion and status', art: 'nature-forest', ids:['loading-text','loading-tool','loading-cube']},
] as const;
// Kept in the route registry for existing links, omitted from gallery browsing.
export const consolidatedStudyIds = ['chat-conversation','chat-composer','more-actions','dropdown-menu','checkbox-list','selection-indicators','base-typeahead','icon-button','button-group','toggle-button','avatar-group','collapsible-group'] as const;
export type Discoverable = {id: string; name: string; category: string; categories?:string[]; covers?: string[]; searchTerms?:string[]};
// Keep compact identifiers searchable while also accepting their natural spacing.
export function searchText(value:string):string {
 return value.replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2').replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
}
export function matchesStudy(item:Discoverable,query:string):boolean {
 const raw=`${item.name} ${item.category} ${(item.categories??[]).join(' ')} ${(item.covers??[]).join(' ')} ${(item.searchTerms??[]).join(' ')}`;
 const normalized=searchText(query);
 return !query.trim() || (!!normalized && searchText(raw).includes(normalized)) || raw.toLowerCase().includes(query.trim().toLowerCase());
}
export function discover<T extends Discoverable>(items: readonly T[], scope: DiscoveryScope, category: string, query: string): T[] {
  const needle = query.trim().toLowerCase();
  const eligible = items.filter(item =>
    !(consolidatedStudyIds as readonly string[]).includes(item.id) &&
    (category === 'All' || item.category === category || item.categories?.includes(category)) &&
    (matchesStudy(item,query)) &&
    (needle || scope === 'all' || (scope === 'chat' ? item.id.startsWith('chat-') : scope === 'loading' ? item.category === 'Loading' : (featuredIds as readonly string[]).includes(item.id))));
  if (scope === 'featured' && !needle) {
    return eligible.sort((a, b) => (featuredIds as readonly string[]).indexOf(a.id) - (featuredIds as readonly string[]).indexOf(b.id));
  }
  return eligible;
}

/** Match original variant names/symbols, not the broad family category. */
export function matchingFamilyVariants(item:{familyVariants?:{id:string;name:string;covers?:string[]}[]},query:string){
 if(!query.trim())return [];
 return (item.familyVariants??[]).filter(variant=>matchesStudy({...variant,category:''},query));
}
