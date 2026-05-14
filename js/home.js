import { renderShowcase } from './showcase.js?v=1778785944366';
import { wireEmailLinks } from './contact.js?v=1778785944366';
import { registerServiceWorker } from './pwa.js?v=1778785944366';

const container = document.getElementById('showcase');
if (container) renderShowcase(container);
wireEmailLinks();
registerServiceWorker();
