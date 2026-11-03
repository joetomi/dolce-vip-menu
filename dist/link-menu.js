const menuCards = [
  { id: 'regular', title: 'منيو المشروبات', action: 'عرض منيو المشروبات', illustration: 'drinks-wordmark-clear.webp' },
  { id: 'dessert', title: 'منيو الحلويات', action: 'عرض منيو الحلو', illustration: 'desserts-wordmark-clear.webp' }
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

function measureHiddenPanel(panel, width) {
  panel.hidden = false;
  panel.style.position = 'absolute';
  panel.style.visibility = 'hidden';
  panel.style.width = `${width}px`;
  const height = panel.offsetHeight;
  panel.hidden = true;
  panel.style.position = '';
  panel.style.visibility = '';
  panel.style.width = '';
  return height;
}

async function settleScrollBeforeSwitch(next, id) {
  if (!activeMenu) return;
  const current = panels[activeMenu];
  const incomingHeight = next ? measureHiddenPanel(panels[next], current.offsetWidth) : 0;
  const projectedEnd = Math.max(0, document.documentElement.scrollHeight - current.offsetHeight + incomingHeight - innerHeight);
  if (scrollY <= projectedEnd - 80) return;
  const target = Math.max(0, projectedEnd - 80);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scrollTo(0, target);
    return;
  }
  await new Promise(resolve => {
    const start = performance.now();
    const from = scrollY;
    const duration = 1000;
    const step = now => {
      if (id !== transitionId) return resolve();
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      scrollTo(0, from + (target - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

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
  currentAnimation = panel.animate(frames, { duration: 520, easing: 'cubic-bezier(.22, 1, .36, 1)' });
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
  await settleScrollBeforeSwitch(next, id);
  if (id !== transitionId) return;
  if (activeMenu) await animatePanel(panels[activeMenu], false, id);
  if (id !== transitionId) return;
  activeMenu = next;
  if (next) await animatePanel(panels[next], true, id);
}

if (location.hash === '#regular' || location.hash === '#dessert') openMenu(location.hash.slice(1), true);
for (const image of document.querySelectorAll('.menu-panel img')) {
  image.loading = 'eager';
  if (image.decode) image.decode().catch(() => {});
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
