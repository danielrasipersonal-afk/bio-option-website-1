const loader = document.querySelector('.loader');
const counter = document.querySelector('.loading-count');
const hero = document.querySelector('.hero');
const headline = document.querySelector('.headline');
const contactLink = document.querySelector('.contact-link');
const contactArtwork = contactLink.querySelector('img');
const contactCursor = document.querySelector('.contact-cursor');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const interactiveElements = 'a, button, input, textarea, select, [contenteditable]';
let contactOpening = false;

function hideContactCursor() {
  contactCursor.hidden = true;
  hero.classList.remove('has-contact-cursor');
}

hero.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || !contactArtwork.naturalWidth || event.target.closest(interactiveElements)) {
    hideContactCursor();
    return;
  }

  contactCursor.style.setProperty('--cursor-x', `${event.clientX}px`);
  contactCursor.style.setProperty('--cursor-y', `${event.clientY}px`);
  contactCursor.hidden = false;
  hero.classList.add('has-contact-cursor');
});

headline.addEventListener('pointermove', event => {
  if (reduceMotion.matches || event.pointerType !== 'mouse') return;

  const bounds = headline.getBoundingClientRect();
  const position = Math.max(-1, Math.min(1, 2 * (event.clientX - bounds.left) / bounds.width - 1));
  headline.style.setProperty('--pointer-skew', `${14 + Math.abs(position) * 13}deg`);
  headline.style.setProperty('--pointer-shift', `${position * 2.4}%`);
});

hero.addEventListener('click', event => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const clickedLink = contactLink.contains(event.target);
  const clickedCursor = !contactCursor.hidden && event.detail === 1 &&
    (!event.pointerType || event.pointerType === 'mouse') &&
    !event.target.closest(`${interactiveElements}, .star-decoration`) && window.getSelection()?.isCollapsed !== false;
  if (!clickedLink && !clickedCursor) return;
  if (clickedLink && reduceMotion.matches) return;

  event.preventDefault();
  if (contactOpening) return;
  if (reduceMotion.matches) {
    window.location.href = contactLink.href;
    return;
  }

  contactOpening = true;
  const feedback = clickedLink ? contactLink : contactCursor;
  feedback.classList.add('is-contacting');
  window.setTimeout(() => {
    feedback.classList.remove('is-contacting');
    contactOpening = false;
    window.location.href = contactLink.href;
  }, 220);
});

hero.addEventListener('pointerleave', hideContactCursor);
hero.addEventListener('pointercancel', hideContactCursor);
window.addEventListener('blur', hideContactCursor);

if (!reduceMotion.matches) {
  const pageAssets = [
    ...[...document.images].map(image => image.decode()),
    document.fonts.load('800 1em Syne'),
    document.fonts.load('400 1em Inter')
  ];
  loader.hidden = false;

  const start = performance.now();
  const duration = 1600;
  let assetsReady = false;
  Promise.allSettled(pageAssets).then(() => {
    assetsReady = true;
  });

  function updateCounter(now) {
    const progress = Math.max(0, Math.floor((now - start) / duration * 100));
    const value = Math.min(progress, assetsReady ? 100 : 99);
    counter.textContent = String(value).padStart(2, '0');
    loader.style.setProperty('--loading-progress', value / 100);

    if (value < 100) {
      requestAnimationFrame(updateCounter);
      return;
    }

    hero.classList.add('is-revealing');
    loader.classList.add('is-finished');
    window.setTimeout(() => {
      loader.hidden = true;
    }, 620);
  }

  requestAnimationFrame(updateCounter);
}
