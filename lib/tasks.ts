export type Link={label:string;url:string};
export type Task={id:string;title:string;notes:string;q:number;x:number;y:number;done:boolean;due:string;sources:Link[];links:Link[];created_at?:string;aged_from?:string;done_at?:string};
export const quadrants=[{name:'Do first',label:'DO',hint:'Important and time-sensitive'},{name:'Schedule',label:'PLAN',hint:'Protect time for meaningful work'},{name:'Delegate',label:'HAND OFF',hint:'Keep it moving without doing it all'},{name:'Let go',label:'DEFER',hint:'Not everything needs your attention'}];
// Board geometry, shared by layout, drag snapping and card placement.
// Quadrants are 820x620 with a 20px gap; cards are 274x164. Cards keep a 16px
// inset from the sides and bottom, and sit 16px below the + button (16px from
// the top corner, 36px tall), so the top inset is 68px.
export const QUAD={x:[40,880],y:[170,810],w:820,h:620,gap:20},CARD={w:274,h:164},INSET=16,TOP_INSET=68;
export function quadrantAt(x:number,y:number){return (y+CARD.h/2>=QUAD.y[1]-QUAD.gap/2?2:0)+(x+CARD.w/2>=QUAD.x[1]-QUAD.gap/2?1:0);}
export function snapTo(q:number,x:number,y:number){const qx=QUAD.x[q%2],qy=QUAD.y[q>=2?1:0];return {x:Math.max(qx+INSET,Math.min(qx+QUAD.w-CARD.w-INSET,x)),y:Math.max(qy+TOP_INSET,Math.min(qy+QUAD.h-CARD.h-INSET,y))};}
// New cards fill a centred 2x3 grid, then stack with a small offset.
export function positionFor(q:number,n:number){const qx=QUAD.x[q%2],qy=QUAD.y[q>=2?1:0],step=330;return snapTo(q,qx+(QUAD.w-CARD.w-step)/2+(n%2)*step,qy+TOP_INSET+(Math.floor(n/2)%3)*186+Math.floor(n/6)*8);}
export const seedTasks:Task[]=[];
