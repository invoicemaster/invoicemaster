import { renderShowcase } from './showcase.js?v=1778791897844';
import { wireEmailLinks } from './contact.js?v=1778791897844';
import { registerServiceWorker } from './pwa.js?v=1778791897844';

const container = document.getElementById('showcase');
if (container) renderShowcase(container);
wireEmailLinks();
registerServiceWorker();
