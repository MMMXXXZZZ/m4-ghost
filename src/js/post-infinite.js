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
    export default () => {
      const container = document.querySelector('.js-infinite-container')
      const nextLink = document.querySelector('.js-next-post-link')

      console.debug('[post-infinite] init check - container:', container)
      console.debug('[post-infinite] init check - nextLink:', nextLink)

      // If we don't have a container or a next link, stop.
      // This acts as the check for "Is this a single post page?"
      if (!container || !nextLink) {
        console.info('[post-infinite] aborted: missing container or next link')
        return
      }

      const analytics = new AnalyticsManager()
      console.debug('[post-infinite] AnalyticsManager instantiated')

      // Observe the initial article
      const initialArticle = container.querySelector('.js-post-article')
      console.debug('[post-infinite] initialArticle:', initialArticle)
      if (initialArticle) {
        analytics.observeArticle(initialArticle, document.title)
        console.info('[post-infinite] observing initial article for Read metric', {title: document.title})
      }

      import InfiniteScroll from 'infinite-scroll'
      import AnalyticsManager from './lib/analytics'
      import videoResponsive from './components/video-responsive'
      import resizeImagesInGalleries from './components/resize-images-galleries'
      import highlightPrismjs from './components/highlight-prismjs'

      export default function initInfiniteScroll() {
        const container = document.querySelector('.js-infinite-container')
        const nextLink = document.querySelector('.js-next-post-link')

        console.debug('[post-infinite] init check - container:', container)
        console.debug('[post-infinite] init check - nextLink:', nextLink)

        if (!container) {
          console.info('[post-infinite] no .js-infinite-container found; skipping init')
          return
        }

        if (!nextLink) {
          console.info('[post-infinite] no .js-next-post-link found; infinite scroll disabled for this page')
          return
        }

        const analytics = new AnalyticsManager()
        console.debug('[post-infinite] AnalyticsManager instantiated')

        const initialArticle = container.querySelector('.js-post-article')
        console.debug('[post-infinite] initialArticle:', initialArticle)
        if (initialArticle) {
          analytics.observeArticle(initialArticle, document.title)
          console.info('[post-infinite] observing initial article for Read metric', {title: document.title})
        }

        if (nextLink && nextLink.href) {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = nextLink.href
          document.head.appendChild(link)
          console.debug('[post-infinite] prefetching next article', nextLink.href)
        }

        const infScroll = new InfiniteScroll(container, {
          path: '.js-next-post-link',
          append: '.js-post-article',
          history: 'push',
          historyTitle: true,
          scrollThreshold: 400,
          hideNav: '.pagination-fallback'
        })

        console.info('[post-infinite] InfiniteScroll initialized')

        infScroll.on('append', (response, path, items) => {
          console.debug('[post-infinite] append event fired', {path, itemsCount: items.length})
          const newArticle = items && items[0]
          if (!newArticle) {
            console.warn('[post-infinite] append event: no article found in items')
            return
          }

          const newTitle = newArticle.dataset.title
          const newUrl = newArticle.dataset.url
          const prevUrl = window.location.pathname

          console.info('[post-infinite] new article appended', {title: newTitle, url: newUrl, prevUrl})

          // Re-init scoped behaviors
          try { videoResponsive(newArticle); console.debug('[post-infinite] videoResponsive ran') } catch (e) { console.error('[post-infinite] videoResponsive error', e) }
          try { resizeImagesInGalleries(newArticle); console.debug('[post-infinite] resizeImagesInGalleries ran') } catch (e) { console.error('[post-infinite] resizeImagesInGalleries error', e) }
          try { highlightPrismjs(newArticle); console.debug('[post-infinite] highlightPrismjs ran') } catch (e) { console.error('[post-infinite] highlightPrismjs error', e) }

          // Analytics
          try { analytics.trackPageView(newUrl, newTitle, prevUrl); console.debug('[post-infinite] analytics.trackPageView called') } catch (e) { console.error('[post-infinite] analytics.trackPageView error', e) }
          try { analytics.observeArticle(newArticle, newTitle); console.debug('[post-infinite] analytics.observeArticle called') } catch (e) { console.error('[post-infinite] analytics.observeArticle error', e) }

          // Chain prefetching
          const nextNextLink = newArticle.querySelector('.js-next-post-data')
          if (nextNextLink && nextNextLink.dataset && nextNextLink.dataset.url) {
            const link = document.createElement('link')
            link.rel = 'prefetch'
            link.href = nextNextLink.dataset.url
            document.head.appendChild(link)
            console.debug('[post-infinite] prefetching next-next article', link.href)
          } else {
            console.debug('[post-infinite] no next-next link found in appended article')
          }
        })

        window.addEventListener('popstate', () => {
          console.info('[post-infinite] popstate event')
        })
      }
