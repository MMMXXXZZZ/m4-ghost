import InfiniteScroll from 'infinite-scroll';
import AnalyticsManager from './lib/analytics';

import videoResponsive from './components/video-responsive';
import resizeImagesInGalleries from './components/resize-images-galleries';
import highlightPrism from './components/highlight-prismjs';
import M4Gallery from './components/gallery';

export default () => {
  if (window.M4InfiniteScrollActive) return;

  const container = document.querySelector('.js-infinite-container');
  const initialNextLink = document.querySelector('.js-next-post-link');
  
  // Mobile Menu Diagnostic
  const menuToggle = document.querySelector('.js-menu-toggle');
  console.log('[InfiniteScroll] DOM Check:', { 
    container: !!container, 
    nextLink: !!initialNextLink,
    menuToggle: !!menuToggle 
  });

  if (!container || !initialNextLink) return;

  const analytics = new AnalyticsManager();
  const firstArticle = container.querySelector('.js-post-article');
  if (firstArticle) {
    analytics.observeArticle(firstArticle, document.title);
  }

  const infScroll = new InfiniteScroll(container, {
    // The path function is evaluated before every fetch
    path: function() {
      const articles = document.querySelectorAll('.js-post-article');
      const lastArticle = articles[articles.length - 1];
      if (!lastArticle) return null;
      
      const nextData = lastArticle.querySelector('.js-next-post-data');
      const nextUrl = nextData ? nextData.dataset.url : null;
      
      if (nextUrl) {
        console.log('[InfiniteScroll] Next target identified:', nextUrl);
      }
      return nextUrl;
    },
    append: '.js-post-article',
    history: 'push',
    historyTitle: true,
    scrollThreshold: 800,
    loadOnScroll: true
  });

  infScroll.on('append', (response, path, items) => {
    const newArticle = items[0];
    if (!newArticle) return;

    console.log('[InfiniteScroll] Appended:', newArticle.dataset.title);

    // Re-initialize theme logic for the newly added post content
    videoResponsive(newArticle);
    resizeImagesInGalleries(newArticle);
    highlightPrism(newArticle);
    M4Gallery();

    analytics.trackPageView(newArticle.dataset.url, newArticle.dataset.title, window.location.pathname);
    analytics.observeArticle(newArticle, newArticle.dataset.title);
  });

  infScroll.on('error', (error, path) => {
    console.error('[InfiniteScroll] Fetch failed:', error, path);
  });

  window.M4InfiniteScrollActive = true;
};