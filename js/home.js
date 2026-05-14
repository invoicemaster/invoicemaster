import { renderShowcase } from './showcase.js?v=1778786333403';
import { wireEmailLinks } from './contact.js?v=1778786333403';
import { registerServiceWorker } from './pwa.js?v=1778786333403';

const container = document.getElementById('showcase');
if (container) renderShowcase(container);
wireEmailLinks();
registerServiceWorker();
