import InfiniteScroll from 'infinite-scroll';
import AnalyticsManager from './lib/analytics';

import videoResponsive from './components/video-responsive';
import resizeImagesInGalleries from './components/resize-images-galleries';
import highlightPrism from './components/highlight-prismjs';
import M4Gallery from './components/gallery';

export default () => {
  // Guard against double initialization
  if (window.M4InfiniteScrollActive) {
    console.log('[InfiniteScroll] Already active. Skipping second init.');
    return;
  }

  const container = document.querySelector('.js-infinite-container');
  const nextLink = document.querySelector('.js-next-post-link');

  if (!container || !nextLink) {
    console.warn('[InfiniteScroll] Missing container or next link.');
    return;
  }

  console.log('[InfiniteScroll] Initializing engine with path function...');

  const analytics = new AnalyticsManager();
  const firstArticle = container.querySelector('.js-post-article');
  
  if (firstArticle) {
    analytics.observeArticle(firstArticle, document.title);
  }

  const infScroll = new InfiniteScroll(container, {
    // FIXED: Use a function for path to handle non-numeric Ghost post URLs
    path: function() {
        const link = document.querySelector('.js-next-post-link');
        return link ? link.getAttribute('href') : null;
    },
    append: '.js-post-article',
    history: 'push',
    historyTitle: true,
    scrollThreshold: 800,
    hideNav: '.pagination-fallback'
  });

  infScroll.on('append', (response, path, items) => {
    const newArticle = items[0];
    if (!newArticle) return;

    console.log('[InfiniteScroll] Appended:', newArticle.dataset.title);

    // Re-initialize theme features
    videoResponsive(newArticle);
    resizeImagesInGalleries(newArticle);
    highlightPrism(newArticle);
    M4Gallery();

    analytics.trackPageView(newArticle.dataset.url, newArticle.dataset.title, window.location.pathname);
    analytics.observeArticle(newArticle, newArticle.dataset.title);

    // Update the next link reference for the next scroll trigger
    const nextData = newArticle.querySelector('.js-next-post-data');
    const globalNextLink = document.querySelector('.js-next-post-link');
    
    if (nextData && nextData.dataset.url && globalNextLink) {
        globalNextLink.setAttribute('href', nextData.dataset.url);
        console.log('[InfiniteScroll] Updated next path to:', nextData.dataset.url);
    } else {
        console.log('[InfiniteScroll] No more posts to load. Destroying instance.');
        infScroll.destroy();
    }
  });

  window.M4InfiniteScrollActive = true;
  console.log('[InfiniteScroll] Engine initialized and monitoring scroll.');
};