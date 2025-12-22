import docSelectorAll from '../app/document-query-selector-all'

export default (root = document) => {
  /* Iframe SRC video */
  const selectors = [
    'iframe[src*="player.vimeo.com"]',
    'iframe[src*="dailymotion.com"]',
    'iframe[src*="youtube.com"]',
    'iframe[src*="youtube-nocookie.com"]',
    'iframe[src*="player.twitch.tv"]',
    'iframe[src*="kickstarter.com"][src*="video.html"]'
  ]

  // Scope the query to the provided root
  const iframes = (root && root.querySelectorAll) ? root.querySelectorAll(selectors.join(',')) : docSelectorAll(selectors.join(','))

  if (!iframes || !iframes.length) return

  iframes.forEach(el => {
    // Idempotency: skip already processed elements
    if (el.classList.contains('js-video-processed') || (el.parentNode && el.parentNode.classList && el.parentNode.classList.contains('video-responsive'))) return

    const parentForVideo = document.createElement('div')
    parentForVideo.className = 'video-responsive'
    el.parentNode.insertBefore(parentForVideo, el)
    parentForVideo.appendChild(el)
    el.removeAttribute('height')
    el.removeAttribute('width')

    // Mark as processed
    el.classList.add('js-video-processed')
  })
}
