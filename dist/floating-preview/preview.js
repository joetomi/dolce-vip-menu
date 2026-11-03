const featured=items.find(item=>item.id===featuredId);
const assets=document.querySelector('main').dataset.assets;
const text=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const row=item=>`<li><div class="item-line"><span class="name">${text(item.name)}</span>${item.price!=null?`<span class="price">${text(item.price)} د.ل</span>`:''}</div><span class="english" lang="en">${text(item.en)}</span></li>`;
document.querySelector('#chef-name').textContent=featured.name;
document.querySelector('#chef-english').textContent=featured.en;
const hero=document.querySelector('#chef-image');hero.src=`${assets}/floating/${featured.id}.webp`;hero.alt=featured.name;
if(featured.price!=null)document.querySelector('#chef-price').textContent=featured.price+' د.ل';
document.querySelector('#main-items').innerHTML=items.filter(item=>item.category==='main'&&item.id!==featuredId).map(row).join('');
const selected=[{category:'pasta',image:'9517',side:'left'},{category:'salad',image:'9576',side:'right'},{category:'dessert',image:'9573',side:'left'}];
document.querySelector('#food-sections').innerHTML=selected.map(section=>{
 const category=categories.find(entry=>entry[0]===section.category);
 const visual=items.find(item=>item.id===section.image);
 const list=items.filter(item=>item.category===section.category);
 return `<section class="food-section side-${section.side} ${section.category}" aria-labelledby="heading-${section.category}"><figure class="food-art"><img src="${assets}/floating/${visual.id}.webp" alt="${text(visual.name)}" loading="lazy"></figure><div class="food-copy"><div class="section-heading"><span class="english category-en" lang="en">${text(category[2])}</span><h2 id="heading-${section.category}">${text(category[1])}</h2></div><ul class="menu-list">${list.map(row).join('')}</ul></div></section>`;
}).join('');
