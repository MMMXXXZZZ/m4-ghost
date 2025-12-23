import InfiniteScroll from 'infinite-scroll';
import AnalyticsManager from './lib/analytics';

import videoResponsive from './components/video-responsive';
import resizeImagesInGalleries from './components/resize-images-galleries';
import highlightPrism from './components/highlight-prismjs';
import M4Gallery from './components/gallery';

export default () => {
  if (window.M4InfiniteScrollActive) return;

  console.log('[Diagnostic] Starting deep DOM scan...');

  // 1. Standard Check
  const container = document.querySelector('.js-infinite-container');
  const nextLink = document.querySelector('.js-next-post-link');
  
  console.log('[Diagnostic] Primary Selectors:', { 
    container: !!container, 
    nextLink: !!nextLink 
  });

  // 2. Fallback search: If container isn't found, find the article and its parents
  if (!container) {
    const article = document.querySelector('article.post');
    if (article) {
      console.log('[Diagnostic] Found <article>. Parent hierarchy:');
      let p = article.parentElement;
      while (p && p !== document.body) {
        console.log(`  - <${p.tagName.toLowerCase()}> Classes: "${p.className}" ID: "${p.id}"`);
        p = p.parentElement;
      }
    } else {
      console.warn('[Diagnostic] No <article.post> found at all.');
    }
  }

  // 3. Link discovery: If nextLink isn't found, search for any <a> containing "Next"
  if (!nextLink) {
    const allLinks = Array.from(document.querySelectorAll('a'));
    const nextMaybe = allLinks.find(l => l.textContent.toLowerCase().includes('next'));
    if (nextMaybe) {
      console.log('[Diagnostic] Potential Next Link found by text search:', {
        href: nextMaybe.getAttribute('href'),
        classes: nextMaybe.className
      });
    }
  }

  if (!container || !nextLink) {
    console.error('[Diagnostic] Initialization aborted: Required markers missing.');
    return;
  }

  const analytics = new AnalyticsManager();
  const firstArticle = container.querySelector('.js-post-article');
  
  if (firstArticle) {
    analytics.observeArticle(firstArticle, document.title);
  }

  const infScroll = new InfiniteScroll(container, {
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

    videoResponsive(newArticle);
    resizeImagesInGalleries(newArticle);
    highlightPrism(newArticle);
    M4Gallery();

    analytics.trackPageView(newArticle.dataset.url, newArticle.dataset.title, window.location.pathname);
    analytics.observeArticle(newArticle, newArticle.dataset.title);

    const nextData = newArticle.querySelector('.js-next-post-data');
    const globalNextLink = document.querySelector('.js-next-post-link');
    if (nextData && nextData.dataset.url && globalNextLink) {
        globalNextLink.setAttribute('href', nextData.dataset.url);
    }
  });

  window.M4InfiniteScrollActive = true;
  console.log('[Diagnostic] Scroller active.');
};