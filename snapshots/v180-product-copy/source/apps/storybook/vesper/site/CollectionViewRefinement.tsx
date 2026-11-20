// SPDX-License-Identifier: MIT
// One local collection, three actual representations. No remote actions.
import {useState} from 'react';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Card} from '@astryxdesign/core/Card';
import './collection-view-refinement.css';

export type CollectionView='grid'|'list'|'table';
export const reviewDocuments=[
  {id:'brief',title:'Design brief',type:'Document',status:'Ready'},
  {id:'flow',title:'Onboarding flow',type:'Design',status:'In review'},
  {id:'notes',title:'Review notes',type:'Notes',status:'Draft'},
] as const;
export function collectionView(value:unknown):CollectionView {
  return value==='list'||value==='table'?value:'grid';
}
export function CollectionDocuments({view}:{view:CollectionView}) {
  if(view==='table')return <div className="cvr-table-scroll" role="region" aria-label="Review documents table" tabIndex={0}>
    <table className="cvr-table"><caption>Review documents</caption><thead><tr><th scope="col">Document</th><th scope="col">Type</th><th scope="col">Status</th></tr></thead><tbody>
      {reviewDocuments.map(item=><tr key={item.id}><th scope="row">{item.title}</th><td>{item.type}</td><td>{item.status}</td></tr>)}
    </tbody></table>
  </div>;
  if(view==='list')return <ul className="cvr-list" aria-label="Review documents">
    {reviewDocuments.map(item=><li key={item.id}><div><strong>{item.title}</strong><span>{item.type}</span></div><span className="cvr-status">{item.status}</span></li>)}
  </ul>;
  return <div className="cvr-grid" role="list" aria-label="Review documents">
    {reviewDocuments.map(item=><div key={item.id} role="listitem"><Card padding={3} width="100%"><article className="cvr-card"><span className="cvr-type">{item.type}</span><h3>{item.title}</h3><span className="cvr-status">{item.status}</span></article></Card></div>)}
  </div>;
}
export function CollectionViewRefinement(){
  const [view,setView]=useState<CollectionView>('grid');
  return <div className="cvr-study">
    <header className="cvr-heading"><strong>Review documents</strong><span>3 items</span></header>
    <SegmentedControl label="Collection view" value={view} onChange={value=>setView(collectionView(value))}>
      <SegmentedControlItem value="grid" label="Grid"/><SegmentedControlItem value="list" label="List"/><SegmentedControlItem value="table" label="Table"/>
    </SegmentedControl>
    <CollectionDocuments view={view}/>
    <span className="cvr-announcement" role="status" aria-live="polite">{view==='grid'?'Grid':view==='list'?'List':'Table'} view · 3 documents</span>
  </div>;
}
