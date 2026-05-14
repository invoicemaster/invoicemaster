import { renderShowcase } from './showcase.js?v=1778796839793';
import { wireEmailLinks } from './contact.js?v=1778796839793';
import { registerServiceWorker } from './pwa.js?v=1778796839793';

const container = document.getElementById('showcase');
if (container) renderShowcase(container);
wireEmailLinks();
registerServiceWorker();
