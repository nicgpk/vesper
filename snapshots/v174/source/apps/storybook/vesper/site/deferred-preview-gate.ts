// One-way gate: scrolling away never destroys an initialized study's local state.
export function createDeferredPreviewGate(load:()=>void){
 let loaded=false,disposed=false,visible=false,focused=false;
 const activate=()=>{if(loaded||disposed)return false;loaded=true;load();return true;};
 return {
  intersect(value:boolean){visible=value;return value&&!focused?activate():false;},
  focus(value:boolean){focused=value;return !value&&visible?activate():false;},
  manual:activate,
  dispose(){disposed=true;},
 };
}
