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

  // Use root.querySelectorAll to scope the search
  const iframes = root.querySelectorAll(selectors.join(','))

  if (!iframes.length) return

  iframes.forEach(el => {
    // Check if already processed
    if (el.parentNode.classList.contains('video-responsive')) return

    const parentForVideo = document.createElement('div')
    parentForVideo.className = 'video-responsive'
    el.parentNode.insertBefore(parentForVideo, el)
    parentForVideo.appendChild(el)
    el.removeAttribute('height')
    el.removeAttribute('width')
  })
}