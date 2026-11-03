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
function selectDrinkCategory(key){
 document.querySelectorAll('.drink-category').forEach(section=>{section.hidden=section.dataset.category!==key});
 document.querySelectorAll('[data-drink-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.drinkCategory===key)));
}
document.querySelector('.beverage-selector').addEventListener('click',event=>{
 const button=event.target.closest('[data-drink-category]');if(!button)return;
 selectDrinkCategory(button.dataset.drinkCategory);
 history.replaceState(null,'',`#section-${button.dataset.drinkCategory}`);
 markCurrent(`section-${button.dataset.drinkCategory}`);
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
let activePage='main',pageTurnVersion=0,pageAnimations=[];
function updatePageTabs(){
 categoryStrip.querySelectorAll('[data-page-target]').forEach(button=>{
  const current=button.dataset.pageTarget===activePage;
  button.setAttribute('aria-selected',String(current));button.tabIndex=current?0:-1;
  if(current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
 });
}
function settlePages(){
 pageAnimations.forEach(animation=>animation.cancel());pageAnimations=[];
 menuBook.querySelectorAll('.menu-page').forEach(page=>{
  const current=page.dataset.page===activePage;page.hidden=!current;page.inert=!current;
  page.setAttribute('aria-hidden',String(!current));page.removeAttribute('style');
 });
 menuBook.style.minHeight='';menuBook.classList.remove('is-turning');menuBook.removeAttribute('aria-busy');
}
function alignBook(smooth=false){
 const offset=categoryStrip.getBoundingClientRect().height+28;
 window.scrollTo({top:Math.max(0,menuBook.getBoundingClientRect().top+window.scrollY-offset),behavior:smooth&&!reducedMotion.matches?'smooth':'instant'});
}
function showPage(key,animate=true,align=true){
 if(!menuPages.some(page=>page.key===key))return Promise.resolve(false);
 const token=++pageTurnVersion;settlePages();
 if(key===activePage){if(align)alignBook(true);return Promise.resolve(true)}
 const oldKey=activePage,previous=document.querySelector(`#page-${oldKey}`),next=document.querySelector(`#page-${key}`);
 const previousHeight=previous.getBoundingClientRect().height;
 activePage=key;updatePageTabs();
 next.hidden=false;next.inert=false;next.setAttribute('aria-hidden','false');
 previous.inert=true;previous.setAttribute('aria-hidden','true');
 if(align)alignBook();
 const finish=()=>{if(token!==pageTurnVersion)return false;settlePages();document.querySelector('#page-announcement').textContent=`قسم ${menuPages.find(page=>page.key===key).label}`;return true};
 if(!animate||reducedMotion.matches||!previous.animate){finish();return Promise.resolve(true)}
 const direction=menuPages.findIndex(page=>page.key===key)>menuPages.findIndex(page=>page.key===oldKey)?1:-1;
 menuBook.style.minHeight=`${Math.max(previousHeight,next.getBoundingClientRect().height)}px`;
 menuBook.classList.add('is-turning');menuBook.setAttribute('aria-busy','true');
 previous.style.position='absolute';previous.style.inset='0 0 auto';previous.style.zIndex='2';
 previous.style.transformOrigin=direction===1?'right center':'left center';
 next.style.transformOrigin=direction===1?'right center':'left center';
 const outgoing=previous.animate([{transform:'rotateY(0deg)',opacity:1,filter:'brightness(1)'},{transform:`rotateY(${direction*86}deg)`,opacity:0,filter:'brightness(.83)'}],{duration:440,easing:'cubic-bezier(.4,0,.7,1)',fill:'both'});
 const incoming=next.animate([{transform:`rotateY(${-direction*52}deg)`,opacity:.3},{transform:'rotateY(0deg)',opacity:1}],{duration:560,easing:'cubic-bezier(.16,.7,.25,1)',fill:'both'});
 pageAnimations=[outgoing,incoming];
 return Promise.allSettled(pageAnimations.map(animation=>animation.finished)).then(finish);
}
function markCurrent(id){
 navigation.querySelectorAll('a').forEach(a=>{if(a.hash===`#${id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 updatePageTabs();
}
async function scrollToEntry(id,smooth=true){
 const target=document.getElementById(id);if(!target)return;
 const page=target.closest('.menu-page');
 if(page&&page.dataset.page!==activePage){const completed=await showPage(page.dataset.page,smooth,smooth);if(!completed)return;}
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
 buttons[next].focus();history.replaceState(null,'',`#page-${buttons[next].dataset.pageTarget}`);showPage(buttons[next].dataset.pageTarget);
});
if(/^#(?:dish-|section-|page-)/.test(location.hash))requestAnimationFrame(()=>scrollToEntry(location.hash.slice(1),false));
