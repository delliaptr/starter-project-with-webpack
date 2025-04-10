import '../styles/styles.css';
import '../styles/responsive.css';

import App from './pages/app';
import { registerServiceWorker } from './utils/sw-register';

document.addEventListener('DOMContentLoaded', async () => {
  // Register service worker
  await registerServiceWorker();
  
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  const skipToContentLink = document.querySelector('.skip-to-content');
  const mainContent = document.querySelector('#main-content');

  if (skipToContentLink && mainContent) {
    skipToContentLink.addEventListener('click', (e) => {
      e.preventDefault();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    });
  }
});