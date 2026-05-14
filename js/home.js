import { renderShowcase } from './showcase.js?v=1778732496823';
import { wireEmailLinks } from './contact.js?v=1778732496823';

const container = document.getElementById('showcase');
if (container) renderShowcase(container);
wireEmailLinks();
