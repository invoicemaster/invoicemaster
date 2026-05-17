import { renderGalleryAsLinks } from './templates.js?v=1779039163817';

const container = document.getElementById('cross-links-gallery');
if (container) {
  const currentId = container.dataset.exclude || null;
  renderGalleryAsLinks(container, { excludeId: currentId, pathPrefix: './' });
}
