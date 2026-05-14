import { renderGalleryAsLinks } from './templates.js?v=1778785944366';

const container = document.getElementById('cross-links-gallery');
if (container) {
  const currentId = container.dataset.exclude || null;
  renderGalleryAsLinks(container, { excludeId: currentId, pathPrefix: './' });
}
