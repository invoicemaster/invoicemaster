import { renderShowcase } from './showcase.js?v=1778786723368';
import { wireEmailLinks } from './contact.js?v=1778786723368';
import { registerServiceWorker } from './pwa.js?v=1778786723368';

const container = document.getElementById('showcase');
if (container) renderShowcase(container);
wireEmailLinks();
registerServiceWorker();
