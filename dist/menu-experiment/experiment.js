const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let index=0;
function dish(item,featured=false){
 const side=index++%2===0?'right':'left';
 return `<article class="dish-unit image-${side} ${featured?'featured':''}" aria-labelledby="name-${item.id}"><figure class="single-art"><img src="../assets/floating/${item.id}.webp" alt="${escapeText(item.name)}" ${featured?'fetchpriority="high"':'loading="lazy"'}></figure><div class="name-panel">${['tl','tr','br','bl'].map(c=>`<span class="corner ${c}" aria-hidden="true"></span>`).join('')}${featured?'<p class="eyebrow">اختيار الشيف</p>':''}<h3 id="name-${item.id}">${escapeText(item.name)}</h3><span class="english" lang="en">${escapeText(item.en)}</span>${item.price!=null?`<span class="price">${escapeText(item.price)} د.ل</span>`:''}</div></article>`;
}
const featured=items.find(item=>item.id===featuredId);
document.querySelector('#experiment-content').innerHTML=dish(featured,true)+categories.filter(c=>c[3]==='food').map((c,i)=>`<section class="individual-category" aria-labelledby="category-${c[0]}">${i?'<div class="section-divider" aria-hidden="true"></div>':''}<header class="category-heading"><span class="english category-en" lang="en">${c[2]}</span><h2 id="category-${c[0]}">${c[1]}</h2></header>${items.filter(item=>item.category===c[0]&&item.id!==featuredId).map(item=>dish(item)).join('')}</section>`).join('');
