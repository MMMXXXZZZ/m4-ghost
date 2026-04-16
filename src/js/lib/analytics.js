/**
 * Matomo Analytics & Engagement Manager
 * Handles SPA-like page transitions and scoped scroll tracking.
 *
 * ─── Prerendering guard ───────────────────────────────────────────────────────
 * The Speculation Rules API (speculation-rules.js) currently uses `prefetch`,
 * which does NOT execute JavaScript, so Matomo is safe today.
 *
 * If you ever upgrade to `prerender`, JavaScript DOES run in the background tab.
 * Matomo's own tracking snippet (in your Ghost template / code injection) would
 * fire before the user actually views the page, double-counting the pageview.
 *
 * To fix that at the snippet level, wrap Matomo's trackPageView push like:
 *
 *   if (document.prerendering) {
 *     document.addEventListener('prerenderingchange', () => {
 *       _paq.push(['trackPageView'])
 *     }, { once: true })
 *   } else {
 *     _paq.push(['trackPageView'])
 *   }
 *
 * The `trackPageView` calls inside this class (used by infinite scroll) are
 * triggered by user scroll action and are therefore already safe — they only
 * fire once the article is actually visible.
 */
export default class AnalyticsManager {
  constructor () {
    this.currentPath = window.location.pathname
    this.observers = new Map()
  }

  /**
   * Track a virtual pageview for an infinite-scroll article transition.
   * Safe from prerendering double-counting: this is only called from the
   * InfiniteScroll 'append' event, which requires real user scroll action.
   */
  trackPageView (url, title, previousUrl) {
    console.debug('[AnalyticsManager] trackPageView called', { url, title, previousUrl })

    if (!window._paq) {
      console.warn('[AnalyticsManager] window._paq is not available; skipping Matomo calls')
      this.currentPath = url
      return
    }

    this.currentPath = url

    try {
      window._paq.push(['setReferrerUrl', previousUrl])
      window._paq.push(['setCustomUrl', url])
      window._paq.push(['setDocumentTitle', title])
      window._paq.push(['setGenerationTimeMs', 0])
      window._paq.push(['trackPageView'])
      window._paq.push(['enableLinkTracking'])
      window._paq.push(['MediaAnalytics::scanForMedia'])
      console.info('[AnalyticsManager] Matomo trackPageView pushed', { url, title })
    } catch (err) {
      console.error('[AnalyticsManager] error pushing to _paq', err)
    }
  }

  /**
   * Observe an article element and fire a "Read" event once the user has
   * spent meaningful time with ≥50% of it in view.
   *
   * This is also safe from prerendering because IntersectionObserver entries
   * do not fire while the page is in the prerendered (background) state —
   * the page must be active and visible for intersections to occur.
   */
  observeArticle (articleElement, title) {
    console.debug('[AnalyticsManager] observeArticle called', { title })
    if (!articleElement) return

    let hasRead     = false
    let timeStarted = 0

    const READ_THRESHOLD_PERCENT = 0.5
    const READ_TIME_MS           = 10000

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= READ_THRESHOLD_PERCENT) {
          if (!timeStarted) timeStarted = Date.now()

          const dwellTime = Date.now() - timeStarted
          if (dwellTime > READ_TIME_MS && !hasRead) {
            this.triggerReadEvent(title)
            hasRead = true
            observer.unobserve(articleElement)
          }
        } else {
          timeStarted = 0
        }
      })
    }, {
      threshold: [0, 0.25, 0.5, 0.75, 1]
    })

    observer.observe(articleElement)
    this.observers.set(articleElement, observer)
    console.debug('[AnalyticsManager] IntersectionObserver attached for article', { title })
  }

  triggerReadEvent (title) {
    if (window._paq) {
      window._paq.push(['trackEvent', 'Article', 'Read', title])
    }
    console.log(`[Analytics] Marked as read: ${title}`)
  }

  cleanup () {
    this.observers.forEach(obs => obs.disconnect())
    this.observers.clear()
  }
}
