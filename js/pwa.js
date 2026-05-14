/* Service worker registration + visible install button.
   - Registers `/sw.js` on http(s) only.
   - When the new SW takes over, reloads so users see fresh assets.
   - Shows a floating "Install app" button in the bottom-right (or full-width
     on mobile) using the native beforeinstallprompt where available; on iOS
     Safari (which doesn't fire that event) it shows tap-to-see-instructions. */

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('SW registration failed', err));
  });

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  setupInstallButton();
}

let deferredPrompt = null;
const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_WINDOW = 7 * 24 * 60 * 60 * 1000; // 7 days

function setupInstallButton() {
  // Already installed? Don't show.
  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
  if (standalone) return;

  // Recently dismissed? Wait it out.
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
  if (dismissedAt && Date.now() - dismissedAt < DISMISS_WINDOW) return;

  const btn = createButton();

  // Chrome / Edge / other Chromium — wait for the criteria to be met
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    revealButton(btn);
  });

  // iOS Safari — no beforeinstallprompt event. Detect and show with instructions.
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIos) {
    btn.dataset.platform = 'ios';
    revealButton(btn);
  }

  btn.querySelector('.pwa-install-action').addEventListener('click', async () => {
    if (btn.dataset.platform === 'ios') {
      alert('To install InvoiceMaster:\n\n1. Tap the Share button (the square with the up arrow).\n2. Scroll down and tap "Add to Home Screen".\n3. Tap "Add".\n\nThe app will appear on your home screen.');
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === 'accepted') btn.hidden = true;
  });

  btn.querySelector('.pwa-install-close').addEventListener('click', (e) => {
    e.stopPropagation();
    btn.hidden = true;
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  });

  window.addEventListener('appinstalled', () => { btn.hidden = true; });
}

function createButton() {
  let btn = document.getElementById('pwa-install-btn');
  if (btn) return btn;
  btn = document.createElement('div');
  btn.id = 'pwa-install-btn';
  btn.className = 'pwa-install-btn no-print';
  btn.hidden = true;
  btn.innerHTML = `
    <button class="pwa-install-action" type="button" aria-label="Install InvoiceMaster as an app">
      <svg class="pwa-install-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3v12" />
        <path d="M7 10l5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
      <span>Install app</span>
    </button>
    <button class="pwa-install-close" type="button" aria-label="Dismiss for a week">×</button>
  `;
  document.body.appendChild(btn);
  return btn;
}

function revealButton(btn) {
  // Tiny delay so it feels intentional, not pushy
  setTimeout(() => { btn.hidden = false; }, 1200);
}
