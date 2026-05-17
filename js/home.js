import { renderShowcase } from './showcase.js?v=1778985349915';
import { wireEmailLinks } from './contact.js?v=1778985349915';
import { registerServiceWorker } from './pwa.js?v=1778985349915';

const container = document.getElementById('showcase');
if (container) renderShowcase(container);
wireEmailLinks();
registerServiceWorker();
