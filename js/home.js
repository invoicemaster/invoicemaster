import { renderShowcase } from './showcase.js?v=1779039163817';
import { wireEmailLinks } from './contact.js?v=1779039163817';
import { registerServiceWorker } from './pwa.js?v=1779039163817';

const container = document.getElementById('showcase');
if (container) renderShowcase(container);
wireEmailLinks();
registerServiceWorker();
