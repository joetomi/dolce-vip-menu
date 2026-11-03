const $=selector=>document.querySelector(selector);
const dialog=$('#detail');
let group='food',category='all';
const compositions=[
 {key:'featured',category:'main',ids:[featuredId],photo:featuredId,side:'right',label:false},
 {key:'pasta',category:'pasta',photo:'9517',side:'left'},
 {key:'salad',category:'salad',photo:'9576',side:'right',botanical:true},
 {key:'main',category:'main',photo:'9508',side:'left',botanical:true},
 {key:'dessert',category:'dessert',photo:'9573',side:'right'},
 {key:'mojito',category:'mojito',photo:'1749',side:'right'},
 {key:'cold',category:'cold',photo:'1735',side:'left'}
];
const escapeText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const photo=(item,detail=false)=>`<img ${detail?'class="detail-image"':''} src="assets/${detail?'editorial':'print'}/${item.id}${!detail&&['9517','9573','9508'].includes(item.id)?'-tall':''}.webp" alt="${escapeText(item.name)}" ${detail?'':'loading="eager"'}>`;
function renderCategories(){
 $('#categories').innerHTML=[['all','جميع الأصناف'],...categories.filter(entry=>entry[3]===group)].map(entry=>`<button data-category="${entry[0]}" aria-pressed="${category===entry[0]}" class="${category===entry[0]?'active':''}">${entry[1]}</button>`).join('');
}
function render(){
 const query=$('#search').value.trim().toLocaleLowerCase();let count=0;
 $('#sections').innerHTML=compositions.filter(c=>categories.find(entry=>entry[0]===c.category)[3]===group&&(category==='all'||category===c.category)).map(c=>{
  const list=items.filter(item=>item.category===c.category&&(c.ids?c.ids.includes(item.id):item.id!==featuredId)&&(item.name+' '+item.en).toLocaleLowerCase().includes(query));
  if(!list.length)return '';count+=list.length;
  const entry=categories.find(entry=>entry[0]===c.category),visual=items.find(item=>item.id===c.photo);
  const number=String(compositions.indexOf(c)+1).padStart(2,'0');
  const names=list.map(item=>`<li><button class="dish-name" data-id="${item.id}" aria-label="تفاصيل ${escapeText(item.name)}"><span class="name-line"><span>${escapeText(item.name)}</span>${item.price!=null?`<span class="price">${escapeText(item.price)} د.ل</span>`:''}</span><span class="translation" lang="en">${escapeText(item.en)}</span></button></li>`).join('');
  return `<section class="menu-region photo-${c.side} collection ${c.key==='featured'?'signature':''} ${c.category==='cold'||c.category==='mojito'?'beverages':''}" data-category="${c.category}" aria-labelledby="heading-${c.key}"><figure class="editorial-photo">${photo(visual)}</figure><div class="editorial-copy"><span class="folio" aria-hidden="true">${number}</span><span class="section-label" lang="en">${entry[2]}</span>${c.label===false?`<h2 id="heading-${c.key}" class="visually-hidden">${escapeText(list[0].name)}</h2>`:`<h2 class="collection-title" id="heading-${c.key}">${entry[1]}</h2>`}<ul class="dish-list">${names}</ul>${c.botanical?'<img class="botanical" src="assets/olive-small.svg" alt="" aria-hidden="true">':''}</div></section>`;
 }).join('');
 $('#empty').hidden=count>0;
}
function openDish(id){const item=items.find(entry=>entry.id===id);if(!item)return;$('#detail-content').innerHTML=`${photo(item,true)}<div class="detail-text"><h2 id="dialog-title">${escapeText(item.name)}</h2><span class="translation" lang="en">${escapeText(item.en)}</span>${item.price!=null?`<p>${escapeText(item.price)} د.ل</p>`:''}${item.description?`<p>${escapeText(item.description)}</p>`:''}</div>`;dialog.showModal()}
document.addEventListener('click',event=>{const button=event.target.closest('[data-id]');if(button)openDish(button.dataset.id)});
document.querySelectorAll('[data-group]').forEach(button=>button.onclick=()=>{group=button.dataset.group;category='all';document.querySelectorAll('[data-group]').forEach(tab=>{tab.classList.toggle('active',tab===button);tab.setAttribute('aria-pressed',tab===button)});renderCategories();render()});
$('#categories').onclick=event=>{const button=event.target.closest('[data-category]');if(button){category=button.dataset.category;renderCategories();render();$('.menu-index').open=false}};
$('#search').oninput=render;$('.close').onclick=()=>dialog.close();dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close()});renderCategories();render();

