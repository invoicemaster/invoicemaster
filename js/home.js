import { renderShowcase } from './showcase.js?v=1778733427221';
import { wireEmailLinks } from './contact.js?v=1778733427221';
import { registerServiceWorker } from './pwa.js?v=1778733427221';

const container = document.getElementById('showcase');
if (container) renderShowcase(container);
wireEmailLinks();
registerServiceWorker();
