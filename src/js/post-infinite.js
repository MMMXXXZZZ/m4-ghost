import InfiniteScroll from 'infinite-scroll';
import AnalyticsManager from './lib/analytics';

import videoResponsive from './components/video-responsive';
import resizeImagesInGalleries from './components/resize-images-galleries';
import highlightPrism from './components/highlight-prismjs';
import M4Gallery from './components/gallery';

export default () => {
  console.log('[InfiniteScroll] Starting diagnostic check...');

  const container = document.querySelector('.js-infinite-container');
  const nextLink = document.querySelector('.js-next-post-link');
  
  // LOGGING: Tell us exactly what is missing
  if (!container) console.warn('[InfiniteScroll] Selector ".js-infinite-container" NOT FOUND in DOM.');
  if (!nextLink) console.warn('[InfiniteScroll] Selector ".js-next-post-link" NOT FOUND in DOM.');

  if (!container || !nextLink) {
    // If not found, let's see what's actually there
    const mainCols = document.querySelectorAll('.flex-auto');
    console.log('[InfiniteScroll] Possible containers found (.flex-auto count):', mainCols.length);
    return;
  }

  console.log('[InfiniteScroll] All elements found. Initializing engine.');

  const analytics = new AnalyticsManager();
  const firstArticle = container.querySelector('.js-post-article');
  
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
    const newArticleWrapper = items[0];
    if (!newArticleWrapper) return;

    console.log('[InfiniteScroll] Appended:', newArticleWrapper.dataset.title);

    const newTitle = newArticleWrapper.dataset.title;
    const newUrl = newArticleWrapper.dataset.url;
    const referrer = window.location.pathname; 

    // Re-run theme features on new content
    videoResponsive(newArticleWrapper);
    resizeImagesInGalleries(newArticleWrapper);
    highlightPrism(newArticleWrapper);
    M4Gallery();

    analytics.trackPageView(newUrl, newTitle, referrer);
    analytics.observeArticle(newArticleWrapper, newTitle);

    // Update the link for the next trigger
    const nextData = newArticleWrapper.querySelector('.js-next-post-data');
    if (nextData && nextData.dataset.url) {
        nextLink.href = nextData.dataset.url;
    }
  });

  console.log('[InfiniteScroll] Engine is active and watching scroll.');
};