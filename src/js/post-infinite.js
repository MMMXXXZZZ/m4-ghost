import InfiniteScroll from 'infinite-scroll';
import AnalyticsManager from './lib/analytics';

import videoResponsive from './components/video-responsive';
import resizeImagesInGalleries from './components/resize-images-galleries';
import highlightPrism from './components/highlight-prismjs';
import M4Gallery from './components/gallery';

export default () => {
  if (window.M4InfiniteScrollActive) return;

  const container = document.querySelector('.js-infinite-container');
  const initialLink = document.querySelector('.js-next-post-link');

  if (!container || !initialLink) {
    console.warn('[InfiniteScroll] Scroller aborted. Container or initial link missing.');
    return;
  }

  const analytics = new AnalyticsManager();
  const firstArticle = container.querySelector('.js-post-article');
  if (firstArticle) analytics.observeArticle(firstArticle, document.title);

  let nextFetchUrl = initialLink.getAttribute('href');

  const infScroll = new InfiniteScroll(container, {
    path: () => nextFetchUrl,
    append: '.js-post-article',
    history: 'push',
    historyTitle: true,
    scrollThreshold: 1000, // Increased threshold for smoother triggering
    loadOnScroll: true,
    checkLastPage: '.js-next-post-link'
  });

  // Track the request start
  infScroll.on('request', (path) => {
    console.log(`[InfiniteScroll] Fetching next post: ${path}`);
  });

  // 'load' fires when the HTML is received
  infScroll.on('load', (body, path) => {
    console.group(`[InfiniteScroll] Loading Page: ${path}`);
    
    const nextData = body.querySelector('.js-next-post-data');
    const hasArticle = !!body.querySelector('.js-post-article');
    
    console.log('Target article found in response:', hasArticle);
    
    if (nextData) {
      nextFetchUrl = nextData.dataset.url;
      console.log('Next URL discovered in response:', nextFetchUrl);
    } else {
      nextFetchUrl = null;
      console.log('No next link found in response. This is the last post.');
      infScroll.options.loadOnScroll = false;
    }
    
    console.groupEnd();
  });

  // 'append' fires after the HTML is added to the DOM
  infScroll.on('append', (response, path, items) => {
    const newArticle = items[0];
    if (!newArticle) {
        console.error('[InfiniteScroll] Append failed: No items found in response matching ".js-post-article"');
        return;
    }

    const title = newArticle.dataset.title || 'Unknown Title';
    console.log(`[InfiniteScroll] Successfully appended: ${title}`);

    // Re-initialize theme logic
    videoResponsive(newArticle);
    resizeImagesInGalleries(newArticle);
    highlightPrism(newArticle);
    M4Gallery();

    analytics.trackPageView(newArticle.dataset.url, title, window.location.pathname);
    analytics.observeArticle(newArticle, title);
  });

  infScroll.on('error', (error, path) => {
    console.error(`[InfiniteScroll] Error loading ${path}:`, error);
  });

  window.M4InfiniteScrollActive = true;
  console.log('[InfiniteScroll] Engine active.');
};