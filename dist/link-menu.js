const menuCards = [
  { id: 'regular', title: 'منيو المشروبات', action: 'عرض المنيو', illustration: 'drinks-wordmark-ar.svg' },
  { id: 'dessert', title: 'منيو الحلويات', action: 'عرض المنيو', illustration: 'desserts-wordmark-ar.svg' }
];

const panels = {
  regular: document.getElementById('regular-panel'),
  dessert: document.getElementById('dessert-panel')
};
const cardGrid = document.getElementById('menu-choices');

function makeCard(item) {
  const button = document.createElement('button');
  button.className = 'menu-card';
  button.type = 'button';
  button.dataset.menu = item.id;
  button.setAttribute('aria-label', `${item.title}، ${item.action}`);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `${item.id}-panel`);
  button.innerHTML = `<span class="menu-card__main"><img class="menu-card__illustration" alt="" width="220" height="120"></span><span class="menu-card__action"><svg class="menu-card__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg><span class="menu-card__action-label"></span></span>`;
  button.querySelector('.menu-card__illustration').src = `assets/link-menu/${item.illustration}`;
  button.querySelector('.menu-card__action-label').textContent = item.action;
  button.addEventListener('click', () => openMenu(item.id));
  return button;
}

for (const item of menuCards) cardGrid.append(makeCard(item));
const buttons = [...cardGrid.querySelectorAll('.menu-card')];

function openMenu(key) {
  const shouldOpen = panels[key].hidden;
  for (const [name, panel] of Object.entries(panels)) panel.hidden = name !== key || !shouldOpen;
  for (const button of buttons) button.setAttribute('aria-expanded', String(button.dataset.menu === key && shouldOpen));
  history.replaceState(null, '', shouldOpen ? `#${key}` : location.pathname + location.search);
}

if (location.hash === '#regular' || location.hash === '#dessert') openMenu(location.hash.slice(1));
for (const image of document.querySelectorAll('.menu-panel img')) {
  image.loading = 'eager';
  if (image.decode) image.decode().catch(() => {});
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
