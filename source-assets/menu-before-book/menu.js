const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photoSizes={"9507":[742,496],"9508":[730,442],"9509":[748,507],"9515":[718,463],"9516":[716,460],"9517":[712,446],"9576":[646,543],"9573":[790,384],"9574":[727,371],"9575":[706,353],"1735":[255,663],"1737":[286,705],"1742":[383,630],"1743":[316,606],"1746":[392,678],"1747":[332,605],"1749":[345,661]};
let index=0;
function dish(item,featured=false){
 const side=index++%2===0?'right':'left';const size=photoSizes[item.id];
 return `<article id="dish-${item.id}" data-category="${item.category}" tabindex="-1" class="dish-unit image-${side} ${featured?'featured':''} ${['mojito','cold'].includes(item.category)?'beverage':''}" aria-labelledby="name-${item.id}">${featured?'<p class="chef-note">اختيار الشيف</p>':''}<figure class="single-art"><img src="assets/web/${item.id}.webp" ${size[0]>480?`srcset="assets/web/${item.id}-480.webp 480w, assets/web/${item.id}.webp ${size[0]}w" sizes="${featured?'(min-width: 600px) 480px, 74vw':'(min-width: 960px) 500px, 54vw'}"`:''} decoding="async" width="${size[0]}" height="${size[1]}" alt="${escapeText(item.name)}" ${featured?'fetchpriority="high"':'loading="lazy"'}></figure><div class="name-panel">${['tl','tr','br','bl'].map(c=>`<span class="corner ${c}" aria-hidden="true"></span>`).join('')}${featured?'<span class="chef-accent" aria-hidden="true"></span>':''}<h3 id="name-${item.id}">${escapeText(item.name)}</h3><span class="english" lang="en">${escapeText(item.en)}</span>${item.description?`<p class="dish-description">${escapeText(item.description)}</p>`:''}${item.price!=null?`<span class="price">${escapeText(item.price)} د.ل</span>`:''}</div></article>`;
}
const featured=items.find(item=>item.id===featuredId);
document.querySelector('#chef-intro').innerHTML=dish(featured,true);
function renderCategory(c,i){return `<section id="section-${c[0]}" data-category="${c[0]}" tabindex="-1" class="individual-category" aria-labelledby="category-${c[0]}">${i?'<div class="section-divider" aria-hidden="true"></div>':''}<header class="category-heading"><span class="english category-en" lang="en">${c[2]}</span><h2 id="category-${c[0]}">${c[1]}</h2></header>${items.filter(item=>item.category===c[0]&&item.id!==featuredId).map(item=>dish(item)).join('')}</section>`}
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
document.querySelector('#menu-content').innerHTML=categories.filter(c=>c[3]==='food').map(renderCategory).join('')+drinkMenu();
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
const stripItems=[['main','وجبات','meals'],['pasta','باستا','pasta'],['salad','سلطات','salad'],['dessert','حلويات','dessert'],['drinks','المشروبات','drinks']];
document.querySelector('#category-links').innerHTML=stripItems.map(([key,label,icon])=>`<li><button type="button" data-target="section-${key}" data-category="${key}"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="menu/category-icons.svg#${icon}"></use></svg><span>${label}</span></button></li>`).join('');
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
function markCurrent(id){navigation.querySelectorAll('a').forEach(a=>{if(a.hash===`#${id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});const category=document.getElementById(id)?.dataset.category;const stripCategory=beverageCategories.some(c=>c[0]===category)?'drinks':category;categoryStrip.querySelectorAll('[data-target]').forEach(button=>{if(button.dataset.category===stripCategory)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current')})}
function scrollToEntry(id,smooth=true){const target=document.getElementById(id);if(!target)return;const drinkSection=target.closest('.drink-category');if(drinkSection)selectDrinkCategory(drinkSection.dataset.category);const inIntro=!!target.closest('#chef-intro');const offset=inIntro?16:categoryStrip.getBoundingClientRect().height+28;target.focus({preventScroll:true});window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+window.scrollY-offset),behavior:smooth&&!reducedMotion.matches?'smooth':'instant'});markCurrent(id)}
navigation.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;event.preventDefault();const id=link.hash.slice(1);closeDrawer(true);history.replaceState(null,'',link.hash);scrollToEntry(id)});
categoryStrip.addEventListener('click',event=>{const button=event.target.closest('[data-target]');if(!button)return;history.replaceState(null,'',`#${button.dataset.target}`);scrollToEntry(button.dataset.target)});
if(/^#(?:dish-|section-)/.test(location.hash))requestAnimationFrame(()=>scrollToEntry(location.hash.slice(1),false));
