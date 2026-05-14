import { renderShowcase } from './showcase.js?v=1778784886142';
import { wireEmailLinks } from './contact.js?v=1778784886142';
import { registerServiceWorker } from './pwa.js?v=1778784886142';

const container = document.getElementById('showcase');
if (container) renderShowcase(container);
wireEmailLinks();
registerServiceWorker();
