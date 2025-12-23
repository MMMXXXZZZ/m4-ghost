import InfiniteScroll from 'infinite-scroll';
import AnalyticsManager from './lib/analytics';

import videoResponsive from './components/video-responsive';
import resizeImagesInGalleries from './components/resize-images-galleries';
import highlightPrism from './components/highlight-prismjs';
import M4Gallery from './components/gallery';

export default () => {
  console.log('[Forensics] Starting DOM Interrogation...');

  const byClass = document.querySelector('.js-infinite-container');
  const byId = document.getElementById('diagnostic-container');
  const nextLink = document.querySelector('.js-next-post-link');
  
  // LOGGING: Detailed status
  console.log('[Forensics] Results:', {
    foundByClass: !!byClass,
    foundById: !!byId,
    foundNextLink: !!nextLink,
    bodyClasses: document.body.className
  });

  if (!byClass && !byId) {
    console.error('[Forensics] CRITICAL: Content container not found. Inspecting parent structure...');
    const mainContainer = document.querySelector('.container.mx-auto.flex');
    if (mainContainer) {
        console.log('[Forensics] Parent flex container found. Children classes:');
        Array.from(mainContainer.children).forEach((child, i) => {
            console.log(`  Child ${i}: <${child.tagName.toLowerCase()}> Classes: "${child.className}"`);
        });
    } else {
        console.log('[Forensics] Main flex container ".container.mx-auto.flex" not found either.');
    }
    return;
  }

  const container = byClass || byId;

  if (!nextLink) {
    console.warn('[Forensics] Container exists but ".js-next-post-link" is missing. Is this the latest post?');
    return;
  }

  console.log('[Forensics] Success. Initializing Infinite Scroll.');

  const analytics = new AnalyticsManager();
  const firstArticle = container.querySelector('.js-post-article') || container.querySelector('article');
  
  if (firstArticle) {
    analytics.observeArticle(firstArticle, document.title);
  }

  const infScroll = new InfiniteScroll(container, {
    path: '.js-next-post-link',
    append: '.js-post-article',
    history: 'push',
    historyTitle: true,
    scrollThreshold: 800,
    hideNav: '.pagination-fallback'
  });

  infScroll.on('append', (response, path, items) => {
    const newArticle = items[0];
    if (!newArticle) return;

    console.log('[Forensics] Content Appended:', newArticle.dataset.title || 'Untitled');

    videoResponsive(newArticle);
    resizeImagesInGalleries(newArticle);
    highlightPrism(newArticle);
    M4Gallery();

    analytics.trackPageView(newArticle.dataset.url, newArticle.dataset.title, window.location.pathname);
    analytics.observeArticle(newArticle, newArticle.dataset.title);

    const nextData = newArticle.querySelector('.js-next-post-data');
    if (nextData && nextData.dataset.url) {
        nextLink.href = nextData.dataset.url;
    }
  });
};