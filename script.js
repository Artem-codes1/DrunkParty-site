// DrunkParty — static demo interactions
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  mobileMenu?.classList.remove('open');
  mobileMenu?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  mobileMenu?.classList.toggle('open', !isOpen);
  mobileMenu?.setAttribute('aria-hidden', String(isOpen));
  document.body.classList.toggle('menu-open', !isOpen);
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

// Reveal elements when they enter the viewport.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
  revealObserver.observe(element);
});

// Countdown to the next party: 18 October 2026 at 22:00 in Kemerovo.
const eventDate = new Date('2026-10-18T22:00:00+05:00');
const countdownItems = document.querySelectorAll('[data-count]');

function updateCountdown() {
  const distance = eventDate.getTime() - Date.now();
  const values = {
    days: Math.max(0, Math.floor(distance / 86400000)),
    hours: Math.max(0, Math.floor((distance / 3600000) % 24)),
    minutes: Math.max(0, Math.floor((distance / 60000) % 60)),
    seconds: Math.max(0, Math.floor((distance / 1000) % 60))
  };

  countdownItems.forEach((item) => {
    const key = item.dataset.count;
    item.textContent = String(values[key]).padStart(key === 'days' ? 3 : 2, '0');
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Interactive FAQ.
document.querySelectorAll('.faq-item button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const wasOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach((otherItem) => {
      otherItem.classList.remove('open');
      otherItem.querySelector('button')?.setAttribute('aria-expanded', 'false');
      const icon = otherItem.querySelector('i');
      if (icon) icon.textContent = '+';
    });

    if (!wasOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
      button.querySelector('i').textContent = '−';
    }
  });
});

// Demo ticket dialog.
const modal = document.querySelector('.modal');
const modalPanel = modal?.querySelector('.modal-panel');
const modalSelection = modal?.querySelector('#modal-selection');
const modalConfirmation = modal?.querySelector('#modal-confirmation');
const selectedTicket = modal?.querySelector('#selected-ticket');
const selectedPrice = modal?.querySelector('#selected-price');
const ticketButtons = modal?.querySelectorAll('.ticket-select');
let lastFocusedElement = null;

function openModal() {
  if (!modal || !modalPanel) return;
  lastFocusedElement = document.activeElement;
  modalSelection.hidden = false;
  modalConfirmation.hidden = true;
  modalPanel.classList.remove('is-confirmation');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-close')?.focus();
}

function closeModal() {
  if (!modal || !modalPanel) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  modalSelection.hidden = false;
  modalConfirmation.hidden = true;
  modalPanel.classList.remove('is-confirmation');
  lastFocusedElement?.focus();
}

function showConfirmation(button) {
  if (!modal || !modalPanel || !modalSelection || !modalConfirmation || !selectedTicket || !selectedPrice) return;
  selectedTicket.textContent = button.dataset.ticket;
  selectedPrice.textContent = button.dataset.price;
  modalSelection.hidden = true;
  modalConfirmation.hidden = false;
  modalPanel.classList.add('is-confirmation');
  modalConfirmation.querySelector('.confirmation-telegram')?.focus();
}

document.querySelectorAll('.buy-button').forEach((button) => {
  button.addEventListener('click', openModal);
});

ticketButtons?.forEach((button) => {
  button.addEventListener('click', () => showConfirmation(button));
});

modal?.querySelector('.modal-close')?.addEventListener('click', closeModal);
modal?.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (modal?.classList.contains('open')) closeModal();
    else closeMenu();
  }
});

// A subtle parallax effect on the hero artwork.
const hero = document.querySelector('.hero');
const heroDisc = document.querySelector('.hero-disc');
const glow = document.querySelector('.cursor-glow');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (hero && heroDisc && !reducedMotion) {
  hero.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 12;
    const y = (event.clientY / window.innerHeight - 0.5) * 12;
    heroDisc.style.transform = `translate(${x}px, ${y}px)`;
  });
}

if (glow && !reducedMotion) {
  window.addEventListener('pointermove', (event) => {
    glow.style.opacity = '1';
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
  window.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });
}

// Event detail buttons open a dedicated, non-technical information panel.
document.querySelectorAll('.event-link').forEach((button) => {
  button.addEventListener('click', () => {
    const eventName = button.dataset.event;
    const eventRow = button.closest('.event-row');
    const status = eventRow?.querySelector('.ticket-status')?.textContent?.trim() || 'БИЛЕТЫ ЕЩЁ';
    const date = eventRow?.querySelector('.event-date')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const place = eventRow?.querySelector('.event-place')?.textContent?.trim() || '';

    const existingToast = document.querySelector('.event-toast');
    existingToast?.remove();

    const toast = document.createElement('div');
    toast.className = 'event-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<span>${date}</span><strong>${eventName}</strong><p>${place}</p><small>${status}</small>`;
    document.body.appendChild(toast);

    window.setTimeout(() => toast.classList.add('visible'), 10);
    window.setTimeout(() => {
      toast.classList.remove('visible');
      window.setTimeout(() => toast.remove(), 350);
    }, 3200);

    button.textContent = 'ПОЛУЧЕНО';
    button.disabled = true;
    window.setTimeout(() => {
      button.innerHTML = 'ПОДРОБНЕЕ <span>↗</span>';
      button.disabled = false;
    }, 1800);
  });
});

// Social links are intentionally simulated in this portfolio template.
document.querySelectorAll('[data-social]').forEach((button) => {
  button.addEventListener('click', () => {
    const network = button.dataset.social;
    const toast = document.createElement('div');
    toast.className = 'event-toast social-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<span>СОЦИАЛЬНАЯ СЕТЬ</span><strong>${network}</strong><p>Подставьте URL профиля клиента.</p>`;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.classList.add('visible'), 10);
    window.setTimeout(() => toast.remove(), 3000);
  });
});
