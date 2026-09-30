export type Link={label:string;url:string};
export type Task={id:string;title:string;notes:string;q:number;x:number;y:number;done:boolean;due:string;sources:Link[];links:Link[];created_at?:string;aged_from?:string;done_at?:string};
export const quadrants=[{name:'Do first',label:'DO',hint:'Important and time-sensitive'},{name:'Schedule',label:'PLAN',hint:'Protect time for meaningful work'},{name:'Delegate',label:'HAND OFF',hint:'Keep it moving without doing it all'},{name:'Let go',label:'DEFER',hint:'Not everything needs your attention'}];
// Board geometry, shared by layout, drag snapping and card placement.
// Quadrants are 820x620 with a 20px gap; cards are 274x164. Everything keeps a
// 16px inset: cards from the box edges, and from the 36px + button, which sits
// 16px in from the box's top-right corner.
export const QUAD={x:[40,880],y:[170,810],w:820,h:620,gap:20},CARD={w:274,h:164},INSET=16,PLUS=36;
export function quadrantAt(x:number,y:number){return (y+CARD.h/2>=QUAD.y[1]-QUAD.gap/2?2:0)+(x+CARD.w/2>=QUAD.x[1]-QUAD.gap/2?1:0);}
export function snapTo(q:number,x:number,y:number){
  const qx=QUAD.x[q%2],qy=QUAD.y[q>=2?1:0];
  let cx=Math.max(INSET,Math.min(QUAD.w-CARD.w-INSET,x-qx)),cy=Math.max(INSET,Math.min(QUAD.h-CARD.h-INSET,y-qy));
  // Keep clear of the + button: push the card left of it or below it, whichever is the smaller move.
  const left=QUAD.w-INSET-PLUS-INSET-CARD.w,below=INSET+PLUS+INSET;
  if(cx>left&&cy<below){if(cx-left<below-cy)cx=left;else cy=below;}
  return {x:qx+cx,y:qy+cy};
}
// New cards fill a centred 2x3 grid, then stack with a small offset.
export function positionFor(q:number,n:number){const qx=QUAD.x[q%2],qy=QUAD.y[q>=2?1:0],step=330;return snapTo(q,qx+(QUAD.w-CARD.w-step)/2+(n%2)*step,qy+INSET+(Math.floor(n/2)%3)*212+Math.floor(n/6)*8);}
export const seedTasks:Task[]=[];
