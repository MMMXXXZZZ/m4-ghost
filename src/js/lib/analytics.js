/**
 * Matomo Analytics & Engagement Manager
 * Handles SPA-like page transitions and scoped scroll tracking.
 */
export default class AnalyticsManager {
  constructor() {
    this.currentPath = window.location.pathname
    this.observers = new Map()
  }

  // Track a new virtual page view (Issue #1)
  trackPageView(url, title, previousUrl) {
    console.debug('[AnalyticsManager] trackPageView called', {url, title, previousUrl})
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
      console.info('[AnalyticsManager] Matomo trackPageView pushed', {url, title})
    } catch (err) {
      console.error('[AnalyticsManager] error pushing to _paq', err)
    }
  }

  // Observe an article for "Read" status (Issue #2, #3)
  observeArticle(articleElement, title) {
  console.debug('[AnalyticsManager] observeArticle called', {title})
    if (!articleElement) return

    let hasRead = false
    let timeStarted = 0

    const READ_THRESHOLD_PERCENT = 0.5
    const READ_TIME_MS = 10000

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
  console.debug('[AnalyticsManager] IntersectionObserver attached for article', {title})
  }

  triggerReadEvent(title) {
    if (window._paq) {
      window._paq.push(['trackEvent', 'Article', 'Read', title])
    }
  console.log(`[Analytics] Marked as read: ${title}`)
  }

  cleanup() {
    this.observers.forEach(obs => obs.disconnect())
    this.observers.clear()
  }
}
