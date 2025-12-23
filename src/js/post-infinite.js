import InfiniteScroll from 'infinite-scroll';
import AnalyticsManager from './lib/analytics';

import videoResponsive from './components/video-responsive';
import resizeImagesInGalleries from './components/resize-images-galleries';
import highlightPrism from './components/highlight-prismjs';
import M4Gallery from './components/gallery';

export default () => {
  const container = document.querySelector('.js-infinite-container');
  const nextLink = document.querySelector('.js-next-post-link');

  console.log('[InfiniteScroll] Component found:', { 
    container: !!container, 
    nextLink: !!nextLink 
  });

  if (!container || !nextLink) {
    console.log('[InfiniteScroll] Missing container or link. Exiting.');
    return;
  }

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
    scrollThreshold: 600,
    status: '.page-load-status'
  });

  infScroll.on('append', (response, path, items) => {
    console.log('[InfiniteScroll] Appended new content.');
    
    const newArticleWrapper = items[0];
    if (!newArticleWrapper) return;

    const newTitle = newArticleWrapper.dataset.title;
    const newUrl = newArticleWrapper.dataset.url;
    const referrer = window.location.pathname; 

    // Re-initialize theme features for new content
    videoResponsive(newArticleWrapper);
    resizeImagesInGalleries(newArticleWrapper);
    highlightPrism(newArticleWrapper);
    M4Gallery();

    analytics.trackPageView(newUrl, newTitle, referrer);
    analytics.observeArticle(newArticleWrapper, newTitle);

    const nextData = newArticleWrapper.querySelector('.js-next-post-data');
    if (nextData && nextData.dataset.url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = nextData.dataset.url;
        document.head.appendChild(link);
    }
  });

  console.log('[InfiniteScroll] Initialized successfully.');
};