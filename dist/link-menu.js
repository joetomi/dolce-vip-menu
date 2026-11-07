const menuCards = [
  { id: 'mains', title: 'الأطباق الرئيسية', action: 'عرض منيو الأطباق الرئيسية', illustration: 'mains-wordmark.svg' },
  { id: 'regular', title: 'منيو المشروبات', action: 'عرض منيو المشروبات', illustration: 'drinks-wordmark-clear.webp' },
  { id: 'dessert', title: 'منيو الحلويات', action: 'عرض منيو الحلو', illustration: 'desserts-wordmark-clear.webp' }
];

const panels = {
  mains: document.getElementById('mains-panel'),
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
  button.querySelector('.menu-card__illustration').src = `assets/link-menu/${item.illustration}?v=4`;
  button.querySelector('.menu-card__action-label').textContent = item.action;
  button.addEventListener('click', () => openMenu(item.id));
  return button;
}

for (const item of menuCards) cardGrid.append(makeCard(item));
const buttons = [...cardGrid.querySelectorAll('.menu-card')];

let activeMenu = null;
let transitionId = 0;
let currentAnimation = null;

function releaseScrollGuard() {
  if (document.querySelector('.profile').offsetHeight >= scrollY + innerHeight) {
    document.body.style.minHeight = '';
  }
}

window.addEventListener('scroll', releaseScrollGuard, { passive: true });

async function animatePanel(panel, opening, id) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    panel.hidden = !opening;
    return;
  }
  if (opening) panel.hidden = false;
  const height = panel.scrollHeight;
  panel.style.overflow = 'hidden';
  const frames = opening
    ? [{ height: '0px', opacity: 0, transform: 'translateY(-12px)' }, { height: `${height}px`, opacity: 1, transform: 'translateY(0)' }]
    : [{ height: `${height}px`, opacity: 1, transform: 'translateY(0)' }, { height: '0px', opacity: 0, transform: 'translateY(-12px)' }];
  currentAnimation = panel.animate(frames, { duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)' });
  try { await currentAnimation.finished; } catch { return; }
  if (id !== transitionId) return;
  if (!opening) panel.hidden = true;
  panel.style.overflow = '';
  currentAnimation = null;
}

async function openMenu(key, immediate = false) {
  const id = ++transitionId;
  currentAnimation?.cancel();
  currentAnimation = null;
  for (const panel of Object.values(panels)) panel.style.overflow = '';
  const next = activeMenu === key ? null : key;
  for (const button of buttons) button.setAttribute('aria-expanded', String(button.dataset.menu === next));
  history.replaceState(null, '', next ? `#${next}` : location.pathname + location.search);
  if (immediate) {
    for (const [name, panel] of Object.entries(panels)) panel.hidden = name !== next;
    activeMenu = next;
    return;
  }
  if (activeMenu) document.body.style.minHeight = `${Math.ceil(scrollY + innerHeight + 2)}px`;
  if (activeMenu) await animatePanel(panels[activeMenu], false, id);
  if (id !== transitionId) return;
  activeMenu = next;
  if (next) await animatePanel(panels[next], true, id);
  if (id !== transitionId) return;
  if (next) {
    const top = Math.max(0, scrollY + panels[next].getBoundingClientRect().top - 12);
    window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  releaseScrollGuard();
}

if (Object.hasOwn(panels, location.hash.slice(1))) openMenu(location.hash.slice(1), true);
for (const image of document.querySelectorAll('.menu-panel img')) {
  image.loading = 'eager';
  if (image.decode) image.decode().catch(() => {});
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
