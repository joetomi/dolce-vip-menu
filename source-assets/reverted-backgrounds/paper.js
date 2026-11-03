// Alternate the supplied papers in overlapping bands, independent of menu sections.
// Their edges crossfade while the dish layout and scroll positions stay unchanged.
const paperSurface=document.querySelector('#site-paper');
const paperMenu=document.querySelector('main');
let paperLayoutKey='',paperFrame=0;
function arrangePaper(){
 const width=document.documentElement.clientWidth;
 const height=Math.max(paperMenu.getBoundingClientRect().height,window.innerHeight);
 const band=Math.round(Math.max(820,Math.min(width,1280)));
 const blend=Math.round(band*.22),step=band-blend;
 const count=Math.max(1,Math.ceil((height-band)/step)+1);
 const key=`${band}:${count}`;
 if(key===paperLayoutKey)return;
 paperLayoutKey=key;
 const layers=document.createDocumentFragment();
 for(let i=0;i<count;i++){
  const layer=document.createElement('span');
  layer.className=`paper-panel paper-${i%3}${Math.floor(i/3)%2?' paper-mirrored':''}`;
  layer.style.top=`${i*step}px`;
  layer.style.height=`${band}px`;
  layer.style.setProperty('--paper-blend',`${blend}px`);
  layers.append(layer);
 }
 paperSurface.replaceChildren(layers);
}
function schedulePaper(){cancelAnimationFrame(paperFrame);paperFrame=requestAnimationFrame(arrangePaper)}
arrangePaper();
new ResizeObserver(schedulePaper).observe(paperMenu);
window.addEventListener('resize',schedulePaper,{passive:true});
