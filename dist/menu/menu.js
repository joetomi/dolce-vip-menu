const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photoSizes={"9507":[742,496],"9508":[730,442],"9509":[748,507],"9515":[718,463],"9516":[716,460],"9517":[712,446],"9576":[646,543],"9573":[790,384],"9574":[727,371],"9575":[706,353],"1735":[255,663],"1737":[286,705],"1742":[383,630],"1743":[316,606],"1746":[392,678],"1747":[332,605],"1749":[345,661]};
let index=0;
function dish(item,featured=false){
 const side=index++%2===0?'right':'left';const size=photoSizes[item.id];
 return `<article id="dish-${item.id}" data-category="${item.category}" tabindex="-1" class="dish-unit image-${side} ${featured?'featured':''} ${['mojito','cold'].includes(item.category)?'beverage':''}" aria-labelledby="name-${item.id}">${featured?'<p class="chef-note">اختيار الشيف</p>':''}<figure class="single-art"><img src="assets/web/${item.id}.webp" ${size[0]>480?`srcset="assets/web/${item.id}-480.webp 480w, assets/web/${item.id}.webp ${size[0]}w" sizes="${featured?'(min-width: 600px) 480px, 74vw':'(min-width: 960px) 500px, 54vw'}"`:''} decoding="async" width="${size[0]}" height="${size[1]}" alt="${escapeText(item.name)}" ${featured?'fetchpriority="high"':'loading="lazy"'}></figure><div class="name-panel">${['tl','tr','br','bl'].map(c=>`<span class="corner ${c}" aria-hidden="true"></span>`).join('')}${featured?'<span class="chef-accent" aria-hidden="true"></span>':''}<h3 id="name-${item.id}">${escapeText(item.name)}</h3><span class="english" lang="en">${escapeText(item.en)}</span>${item.description?`<p class="dish-description">${escapeText(item.description)}</p>`:''}${item.price!=null?`<span class="price">${escapeText(item.price)} د.ل</span>`:''}</div></article>`;
}
const featured=items.find(item=>item.id===featuredId);
function renderCategory(c,i){return `<section id="section-${c[0]}" data-category="${c[0]}" tabindex="-1" class="individual-category" aria-labelledby="category-${c[0]}">${c[0]==='main'?`<div id="chef-intro">${dish(featured,true)}</div>`:''}${i?'<div class="section-divider" aria-hidden="true"></div>':''}<header class="category-heading"><span class="english category-en" lang="en">${c[2]}</span><h2 id="category-${c[0]}">${c[1]}</h2></header>${items.filter(item=>item.category===c[0]&&item.id!==featuredId).map(item=>dish(item)).join('')}</section>`}
const drinkPortraits=new Set(['1735','1737','1742','1747','1749']);
function drinkPortrait(id,alt,extra=''){return `<figure class="drink-portrait ${extra}"><img src="assets/beverage-portraits/${id}.webp" alt="${escapeText(alt)}" width="640" height="853" loading="lazy" decoding="async"></figure>`}
function drinkList(entries){return `<ul class="drink-list">${entries.map(item=>`<li><article class="drink-item ${drinkPortraits.has(item.id)?'has-portrait':''}" id="dish-${item.id}" data-category="${item.category}" tabindex="-1" aria-labelledby="name-${item.id}"><div class="drink-copy">${item.note?`<span class="drink-note">${escapeText(item.note)}</span>`:''}<h4 id="name-${item.id}">${escapeText(item.name)}</h4><span class="drink-english" lang="en">${escapeText(item.en)}</span>${item.description?`<p>${escapeText(item.description)}</p>`:''}${item.price!=null?`<span class="price">${escapeText(item.price)} د.ل</span>`:''}</div>${drinkPortraits.has(item.id)?drinkPortrait(item.id,item.name):''}</article></li>`).join('')}</ul>`}
function drinkGroup(key){
 const c=beverageCategories.find(category=>category[0]===key);
 const entries=beverageItems.filter(item=>item.category===key);
 const number=String(beverageCategories.indexOf(c)+1).padStart(2,'0');
 return `<section class="drink-category" id="section-${key}" data-category="${key}" tabindex="-1" aria-labelledby="category-${key}" ${key==='hot'?'':'hidden'}><header class="drink-category-heading"><div><span class="drink-category-en" lang="en">${escapeText(c[2])}</span><h3 id="category-${key}">${escapeText(c[1])}</h3></div><span class="drink-category-number" aria-hidden="true">${number}</span></header>${drinkList(entries)}<p class="drink-category-end">دولتشي <span aria-hidden="true">·</span> <span lang="en">DOLCE VIP</span></p></section>`;
}
function drinkMenu(){return `<section id="section-drinks" class="beverage-menu" data-category="drinks" tabindex="-1" aria-labelledby="beverage-title"><header class="beverage-masthead"><div class="beverage-intro"><span class="beverage-kicker" lang="en">DOLCE VIP</span><h2 id="beverage-title">المشروبات</h2><span class="beverage-subtitle" lang="en">THE DRINKS MENU</span><span class="beverage-intro-rule" aria-hidden="true"></span></div><div class="beverage-photo-composition">${drinkPortrait('1749','من تصوير مشروبات دولتشي','portrait-main')}${drinkPortrait('1735','من تصوير مشروبات دولتشي','portrait-small')}</div></header><nav class="beverage-selector" aria-label="اختيار قسم المشروبات">${beverageCategories.map(c=>`<button type="button" data-drink-category="${c[0]}" aria-controls="section-${c[0]}" aria-pressed="${c[0]==='hot'}">${escapeText(c[1])}</button>`).join('')}</nav><div class="beverage-chapters">${beverageCategories.map(c=>drinkGroup(c[0])).join('')}</div></section>`}
const menuPages=[
 {key:'main',label:'الأطباق الرئيسية',icon:'meals',content:()=>categories.filter(c=>['main','pasta'].includes(c[0])).map(renderCategory).join('')},
 {key:'starters',label:'المقبلات',icon:'salad',content:()=>categories.filter(c=>c[0]==='salad').map(renderCategory).join('')},
 {key:'dessert',label:'الحلو',icon:'dessert',content:()=>categories.filter(c=>c[0]==='dessert').map(renderCategory).join('')},
 {key:'drinks',label:'المشروبات',icon:'drinks',content:drinkMenu}
];
const menuBook=document.querySelector('#menu-content');
menuBook.innerHTML=menuPages.map((page,i)=>`<section id="page-${page.key}" class="menu-page page-${page.key}" data-page="${page.key}" role="tabpanel" aria-labelledby="tab-${page.key}" tabindex="-1" ${i?'hidden aria-hidden="true" inert':''}>${page.content()}<footer class="menu-page-footer"><span>${page.label}</span><span lang="en">${String(i+1).padStart(2,'0')} / 04</span></footer></section>`).join('');
const imageStatus=document.createElement('div');
imageStatus.className='menu-image-status';imageStatus.hidden=true;imageStatus.setAttribute('role','status');
menuBook.append(imageStatus);
const pendingImageDecodes=new WeakMap();
function prepareImage(img){
 if(pendingImageDecodes.has(img))return pendingImageDecodes.get(img);
 const preparation=(async()=>{
  // Hidden pages must load their images too; decode resolves only when pixels
  // are ready to paint, rather than merely when the download has finished.
  img.loading='eager';
  if(img.complete&&!img.naturalWidth)img.src=img.getAttribute('src');
  if(typeof img.decode==='function'){
   try{await img.decode()}catch(error){
    // A responsive source can change during resize while its first decode runs.
    if(!img.complete||img.naturalWidth>0)await img.decode();else throw error;
   }
  }else if(!img.complete){
   await new Promise((resolve,reject)=>{
    const loaded=()=>{clean();resolve()};const failed=()=>{clean();reject(new Error('Image failed'))};
    const clean=()=>{img.removeEventListener('load',loaded);img.removeEventListener('error',failed)};
    img.addEventListener('load',loaded,{once:true});img.addEventListener('error',failed,{once:true});
    if(img.complete){img.naturalWidth?loaded():failed()}
   });
  }
  if(!img.complete||!img.naturalWidth)throw new Error('Image unavailable');
 })();
 pendingImageDecodes.set(img,preparation);
 preparation.then(()=>pendingImageDecodes.delete(img),()=>pendingImageDecodes.delete(img));
 return preparation;
}
function preparePageImages(page){return Promise.all(Array.from(page.querySelectorAll('img'),prepareImage))}
function showImageStatus(message,retryKey){
 imageStatus.replaceChildren();imageStatus.hidden=!message;
 if(!message)return;
 const text=document.createElement('span');text.textContent=message;imageStatus.append(text);
 if(retryKey){
  const retry=document.createElement('button');retry.type='button';retry.textContent='إعادة المحاولة';
  retry.addEventListener('click',()=>showPage(retryKey));imageStatus.append(retry);
 }
}
function selectDrinkCategory(key){
 document.querySelectorAll('.drink-category').forEach(section=>{section.hidden=section.dataset.category!==key});
 document.querySelectorAll('[data-drink-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.drinkCategory===key)));
}
document.querySelector('.beverage-selector').addEventListener('click',event=>{
 const button=event.target.closest('[data-drink-category]');if(!button)return;
 if(menuBook.classList.contains('is-scroll-fitting'))window.scrollTo({top:window.scrollY,behavior:'instant'});
 const token=++pageTransitionVersion;
 menuBook.style.minHeight=`${Math.max(menuBook.offsetHeight,requiredBookFloor())}px`;
 selectDrinkCategory(button.dataset.drinkCategory);
 history.replaceState(null,'',`#section-${button.dataset.drinkCategory}`);
 markCurrent(`section-${button.dataset.drinkCategory}`);
 fitPageScroll(document.querySelector('#page-drinks'),true,token);
});
const categoryStrip=document.querySelector('#category-strip');
document.querySelector('#category-links').innerHTML=menuPages.map((page,i)=>`<li role="presentation"><button type="button" id="tab-${page.key}" role="tab" data-page-target="${page.key}" aria-controls="page-${page.key}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" ${i===0?'aria-current="page"':''}><svg viewBox="0 0 32 32" aria-hidden="true"><use href="menu/category-icons.svg#${page.icon}"></use></svg><span>${page.label}</span></button></li>`).join('');
new IntersectionObserver(([entry])=>categoryStrip.classList.toggle('is-stuck',!entry.isIntersecting&&entry.boundingClientRect.top<10),{rootMargin:'-10px 0px 0px 0px'}).observe(document.querySelector('#category-sentinel'));
const navigation=document.querySelector('#dish-navigation');
navigation.innerHTML=categories.map(c=>`<section class="drawer-group" aria-labelledby="nav-${c[0]}"><h3 id="nav-${c[0]}">${c[1]}</h3><ul>${items.filter(item=>item.category===c[0]).map(item=>`<li><a href="#dish-${item.id}"><span>${escapeText(item.name)}</span><span class="english" lang="en">${escapeText(item.en)}</span></a></li>`).join('')}</ul></section>`).join('');
const toggle=document.querySelector('#menu-toggle'),drawer=document.querySelector('#menu-drawer');
let openingFrame=0,closingTimer=0,closing=false;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function resetDrawer(){
 cancelAnimationFrame(openingFrame);clearTimeout(closingTimer);closing=false;
 drawer.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','فتح قائمة الأطباق');
 document.documentElement.classList.remove('drawer-open');
 if(drawer.contains(toggle))document.body.insertBefore(toggle,document.querySelector('main'));
}
function finishClose(){if(drawer.open)drawer.close();resetDrawer();toggle.focus({preventScroll:true})}
function closeDrawer(immediate=false){
 if(!drawer.open)return;
 cancelAnimationFrame(openingFrame);clearTimeout(closingTimer);closing=true;
 drawer.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');
 if(immediate||reducedMotion.matches){finishClose();return;}
 closingTimer=setTimeout(finishClose,320);
}
function openDrawer(){
 if(drawer.open){if(closing){clearTimeout(closingTimer);closing=false;drawer.classList.add('is-open');toggle.setAttribute('aria-expanded','true')}return;}closing=false;clearTimeout(closingTimer);
 // Keep the same button in the modal's top layer so its morph stays visible.
 drawer.append(toggle);toggle.setAttribute('autofocus','');drawer.showModal();
 document.documentElement.classList.add('drawer-open');
 toggle.getBoundingClientRect();
 toggle.setAttribute('aria-label','إغلاق القائمة');toggle.setAttribute('aria-expanded','true');
 drawer.querySelector('.drawer-surface').getBoundingClientRect();
 openingFrame=requestAnimationFrame(()=>{if(drawer.open&&!closing)drawer.classList.add('is-open')});
}
toggle.addEventListener('click',()=>drawer.open&&!closing?closeDrawer():openDrawer());
drawer.addEventListener('cancel',event=>{event.preventDefault();closeDrawer()});
drawer.addEventListener('close',resetDrawer);
drawer.addEventListener('click',event=>{if(event.target!==drawer)return;const r=drawer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDrawer()});
let activePage='main',pageTransitionVersion=0,pageAnimations=[],bookFloorFrame=0;
function updatePageTabs(selectedPage=activePage){
 categoryStrip.querySelectorAll('[data-page-target]').forEach(button=>{
  const current=button.dataset.pageTarget===selectedPage;
  button.setAttribute('aria-selected',String(current));button.tabIndex=current?0:-1;
  if(current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
 });
}
// Reserve height only while images load and the transition/scroll adjustment runs.
function requiredBookFloor(){return Math.max(0,Math.ceil(window.scrollY+window.innerHeight-(menuBook.getBoundingClientRect().top+window.scrollY)+1))}
function releaseBookFloor(){
 if(menuBook.classList.contains('is-switching')||menuBook.classList.contains('is-scroll-fitting'))return;
 const needed=requiredBookFloor(),current=parseFloat(menuBook.style.minHeight)||0;
 if(needed<current)menuBook.style.minHeight=`${needed}px`;
}
window.addEventListener('scroll',()=>{cancelAnimationFrame(bookFloorFrame);bookFloorFrame=requestAnimationFrame(releaseBookFloor)},{passive:true});
async function fitPageScroll(page,animate,token){
 const bookTop=menuBook.getBoundingClientRect().top+window.scrollY;
 const documentHeight=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);
 const tail=Math.max(0,documentHeight-bookTop-menuBook.offsetHeight);
 const naturalEnd=Math.max(0,bookTop+page.offsetHeight+tail-window.innerHeight);
 const visibleItems=Array.from(page.querySelectorAll('.dish-unit,.drink-item')).filter(item=>item.getClientRects().length);
 const lastBottom=visibleItems.length?Math.max(...visibleItems.map(item=>item.getBoundingClientRect().bottom+window.scrollY)):null;
 const pastLastItem=lastBottom!==null&&lastBottom-window.scrollY<categoryStrip.getBoundingClientRect().bottom+20;
 if(window.scrollY<=naturalEnd+1&&!pastLastItem){menuBook.style.minHeight='';return true}
 // End with the last available item visible, rather than retaining an empty tail
 // inherited from the longer menu. Valid positions are left untouched.
 const target=Math.max(0,Math.min(naturalEnd,lastBottom===null?naturalEnd:lastBottom+32-window.innerHeight));
 menuBook.classList.add('is-scroll-fitting');
 const smooth=animate&&!reducedMotion.matches;
 window.scrollTo({top:target,behavior:smooth?'smooth':'instant'});
 if(smooth){
  await new Promise(resolve=>{
   const started=performance.now();
   function check(){
    if(token!==pageTransitionVersion||Math.abs(window.scrollY-target)<2||performance.now()-started>1600){resolve();return}
    requestAnimationFrame(check);
   }
   requestAnimationFrame(check);
  });
 }
 if(token!==pageTransitionVersion)return false;
 menuBook.classList.remove('is-scroll-fitting');
 // If a user interrupts the smooth scroll, do not force a second jump.
 menuBook.style.minHeight=Math.abs(window.scrollY-target)<2?'':`${requiredBookFloor()}px`;
 return true;
}
function settlePages(){
 pageAnimations.forEach(animation=>animation.cancel());pageAnimations=[];
 menuBook.querySelectorAll(':scope > .menu-page').forEach(page=>{
  const current=page.dataset.page===activePage;page.hidden=!current;page.inert=!current;
  page.setAttribute('aria-hidden',String(!current));page.removeAttribute('style');
 });
 menuBook.classList.remove('is-switching','is-preparing','is-scroll-fitting');menuBook.removeAttribute('aria-busy');
}
async function showPage(key,animate=true){
 if(!menuPages.some(page=>page.key===key))return false;
 const token=++pageTransitionVersion;
 // Stop a previous correction at its current position before handling a new tab.
 if(menuBook.classList.contains('is-scroll-fitting'))window.scrollTo({top:window.scrollY,behavior:'instant'});
 // Prevent a browser jump while the incoming page is being prepared.
 menuBook.style.minHeight=`${Math.max(menuBook.offsetHeight,requiredBookFloor())}px`;
 settlePages();
 const previous=document.querySelector(`#page-${activePage}`),next=document.querySelector(`#page-${key}`);
 updatePageTabs(key);menuBook.classList.add('is-preparing');menuBook.setAttribute('aria-busy','true');
 showImageStatus('جارٍ تجهيز القائمة…');
 try{await preparePageImages(next)}catch(error){
  if(token!==pageTransitionVersion)return false;
  settlePages();updatePageTabs();showImageStatus('تعذّر تحميل صور القسم. حاول مجددًا.',key);return false;
 }
 if(token!==pageTransitionVersion)return false;
 menuBook.classList.remove('is-preparing');showImageStatus('');
 if(key===activePage){
  menuBook.removeAttribute('data-initial-loading');settlePages();updatePageTabs();
  return fitPageScroll(next,animate,token);
 }
 const canAnimate=animate&&!reducedMotion.matches&&typeof previous.animate==='function';
 updatePageTabs(key);menuBook.classList.add('is-switching');menuBook.setAttribute('aria-busy','true');
 previous.inert=true;
 if(canAnimate){
  const fadeOut=previous.animate([{opacity:1},{opacity:0}],{duration:260,easing:'ease-out',fill:'forwards'});
  pageAnimations=[fadeOut];
  await fadeOut.finished.catch(()=>{});
  if(token!==pageTransitionVersion)return false;
  previous.hidden=true;fadeOut.cancel();pageAnimations=[];
 }
 previous.hidden=true;previous.setAttribute('aria-hidden','true');
 next.hidden=false;next.inert=false;next.setAttribute('aria-hidden','false');
 activePage=key;
 menuBook.removeAttribute('data-initial-loading');
 const scrollFit=fitPageScroll(next,animate,token);
 if(canAnimate){
  const fadeIn=next.animate([{opacity:0},{opacity:1}],{duration:380,easing:'ease-in-out',fill:'forwards'});
  pageAnimations=[fadeIn];
  await fadeIn.finished.catch(()=>{});
  if(token!==pageTransitionVersion)return false;
 }
 const fitted=await scrollFit;if(!fitted||token!==pageTransitionVersion)return false;
 settlePages();
 document.querySelector('#page-announcement').textContent=`قسم ${menuPages.find(page=>page.key===key).label}`;
 return true;
}
function markCurrent(id){
 navigation.querySelectorAll('a').forEach(a=>{if(a.hash===`#${id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 updatePageTabs();
}
async function scrollToEntry(id,smooth=true){
 const target=document.getElementById(id);if(!target)return;
 const page=target.closest('.menu-page');
 if(page&&(page.dataset.page!==activePage||menuBook.hasAttribute('data-initial-loading'))){const completed=await showPage(page.dataset.page,smooth);if(!completed)return;}
 const drinkSection=target.closest('.drink-category');if(drinkSection)selectDrinkCategory(drinkSection.dataset.category);
 const offset=categoryStrip.getBoundingClientRect().height+28;
 target.focus({preventScroll:true});window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+window.scrollY-offset),behavior:smooth&&!reducedMotion.matches?'smooth':'instant'});markCurrent(id);
}
navigation.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;event.preventDefault();const id=link.hash.slice(1);closeDrawer(true);history.replaceState(null,'',link.hash);scrollToEntry(id)});
categoryStrip.addEventListener('click',event=>{const button=event.target.closest('[data-page-target]');if(!button)return;history.replaceState(null,'',`#page-${button.dataset.pageTarget}`);showPage(button.dataset.pageTarget)});
categoryStrip.addEventListener('keydown',event=>{
 const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(event.key))return;
 const buttons=Array.from(categoryStrip.querySelectorAll('[data-page-target]'));
 const current=buttons.indexOf(event.target);if(current<0)return;
 event.preventDefault();let next=current;
 if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else next=(current+(event.key==='ArrowLeft'?1:-1)+buttons.length)%buttons.length;
 buttons[next].focus({preventScroll:true});history.replaceState(null,'',`#page-${buttons[next].dataset.pageTarget}`);showPage(buttons[next].dataset.pageTarget);
});
async function initializeMenu(){
 const id=/^#(?:dish-|section-|page-)/.test(location.hash)?location.hash.slice(1):'';
 const target=id?document.getElementById(id):null;
 const page=target?.closest('.menu-page');
 const ready=await showPage(page?.dataset.page||'main',false);
 if(ready&&target)scrollToEntry(id,false);
}
initializeMenu();
