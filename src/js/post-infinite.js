import InfiniteScroll from 'infinite-scroll'
import AnalyticsManager from './lib/analytics'
import videoResponsive from './components/video-responsive'
import resizeImagesInGalleries from './components/resize-images-galleries'
import highlightPrism from './components/highlight-prismjs'

export default () => {
  const container = document.querySelector('.js-infinite-container')
  const nextLink = document.querySelector('.js-next-post-link')

  if (!container || !nextLink) return

  const analytics = new AnalyticsManager()

  const initialArticle = container.querySelector('.js-post-article')
  if (initialArticle) {
    analytics.observeArticle(initialArticle, document.title)
  }

  const infScroll = new InfiniteScroll(container, {
    path: '.js-next-post-link',
    append: '.js-post-article',
    history: 'push',
    historyTitle: true,
    scrollThreshold: 400,
    hideNav: '.pagination-fallback'
  })

  // Prefetch NEXT article
  if (nextLink.href) {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = nextLink.href
    document.head.appendChild(link)
  }

  infScroll.on('append', (response, path, items) => {
    const newArticle = items[0]
    const newTitle = newArticle.dataset.title
    const newUrl = newArticle.dataset.url
    const prevUrl = window.location.pathname

    // Re-init scoped behaviors
    videoResponsive(newArticle)
    resizeImagesInGalleries(newArticle)
    highlightPrism(newArticle, 'pre[class*=language-] code')

    // Analytics
    analytics.trackPageView(newUrl, newTitle, prevUrl)
    analytics.observeArticle(newArticle, newTitle)

    // Chain prefetching
    const nextNextLink = newArticle.querySelector('.js-next-post-data')
    if (nextNextLink && nextNextLink.dataset.url) {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = nextNextLink.dataset.url
      document.head.appendChild(link)
    }
  })

  window.addEventListener('popstate', () => {
    // Optional: could detect current visible article and update analytics
  })
}
