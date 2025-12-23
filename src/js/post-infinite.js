import InfiniteScroll from 'infinite-scroll';
import AnalyticsManager from './lib/analytics';

import videoResponsive from './components/video-responsive';
import resizeImagesInGalleries from './components/resize-images-galleries';
import highlightPrism from './components/highlight-prismjs';
import M4Gallery from './components/gallery';

export default () => {
  const container = document.querySelector('.js-infinite-container');
  const nextLink = document.querySelector('.js-next-post-link');

  if (!container || !nextLink) {
    return;
  }

  console.log('[InfiniteScroll] Initializing engine on container...');

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
    const newArticle = items[0];
    if (!newArticle) return;

    console.log('[InfiniteScroll] Appended:', newArticle.dataset.title);

    const newTitle = newArticle.dataset.title;
    const newUrl = newArticle.dataset.url;
    const referrer = window.location.pathname; 

    // Re-initialize theme features for new content
    videoResponsive(newArticle);
    resizeImagesInGalleries(newArticle);
    highlightPrism(newArticle);
    M4Gallery();

    analytics.trackPageView(newUrl, newTitle, referrer);
    analytics.observeArticle(newArticle, newTitle);

    // Update the pagination link for the NEXT scroll operation
    const nextData = newArticle.querySelector('.js-next-post-data');
    if (nextData && nextData.dataset.url) {
        nextLink.href = nextData.dataset.url;
        
        const prefetch = document.createElement('link');
        prefetch.rel = 'prefetch';
        prefetch.href = nextData.dataset.url;
        document.head.appendChild(prefetch);
    }
  });

  console.log('[InfiniteScroll] Engine Ready.');
};