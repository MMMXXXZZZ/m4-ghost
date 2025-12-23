import InfiniteScroll from 'infinite-scroll';
import AnalyticsManager from './lib/analytics';

import videoResponsive from './components/video-responsive';
import resizeImagesInGalleries from './components/resize-images-galleries';
import highlightPrism from './components/highlight-prismjs';
import M4Gallery from './components/gallery';

export default () => {
  // Prevent double initialization
  if (window.M4InfiniteScrollActive) return;

  const container = document.querySelector('.js-infinite-container');
  const initialLink = document.querySelector('.js-next-post-link');

  if (!container || !initialLink) {
    console.log('[InfiniteScroll] Required DOM elements not found. Skipping.');
    return;
  }

  console.log('[InfiniteScroll] Initializing engine...');

  const analytics = new AnalyticsManager();
  const firstArticle = container.querySelector('.js-post-article');
  
  if (firstArticle) {
    analytics.observeArticle(firstArticle, document.title);
  }

  // We track the next URL in a variable to bypass library regex parsing
  let nextFetchUrl = initialLink.getAttribute('href');

  const infScroll = new InfiniteScroll(container, {
    path: () => nextFetchUrl,
    append: '.js-post-article',
    history: 'push',
    historyTitle: true,
    scrollThreshold: 600,
    loadOnScroll: true
  });

  // 'load' fires as soon as the data is fetched, allowing us to grab the NEXT url
  infScroll.on('load', (body) => {
    const nextData = body.querySelector('.js-next-post-data');
    nextFetchUrl = nextData ? nextData.dataset.url : null;
    
    if (!nextFetchUrl) {
      console.log('[InfiniteScroll] Reached end of post stream.');
      infScroll.options.loadOnScroll = false;
    } else {
      console.log('[InfiniteScroll] Next URL queued:', nextFetchUrl);
    }
  });

  infScroll.on('append', (response, path, items) => {
    const newArticle = items[0];
    if (!newArticle) return;

    console.log('[InfiniteScroll] Content Appended:', newArticle.dataset.title);

    // Re-trigger theme-specific JS for the new content
    videoResponsive(newArticle);
    resizeImagesInGalleries(newArticle);
    highlightPrism(newArticle);
    M4Gallery();

    analytics.trackPageView(newArticle.dataset.url, newArticle.dataset.title, window.location.pathname);
    analytics.observeArticle(newArticle, newArticle.dataset.title);
  });

  window.M4InfiniteScrollActive = true;
  console.log('[InfiniteScroll] Engine is active and watching scroll.');
};