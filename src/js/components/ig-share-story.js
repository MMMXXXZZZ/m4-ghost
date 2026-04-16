/**
 * ig-share-story.js
 *
 * "Add to Story" button — shares the post's feature image via the
 * Web Share API so the user can paste it into an Instagram Story.
 *
 * Usage (in a Ghost template):
 *   <div class="ig-share-root" data-image="{{feature_image}}"></div>
 *
 * Configuration:
 *   Set ICON_URL to the URL of the Instagram-camera icon you want
 *   displayed in the circular button container.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const ICON_URL = 'PLACEHOLDER_TEXT'   // ← replace with your icon URL

// ─── Language support ─────────────────────────────────────────────────────────

const translations = {
  es: {
    addToStory:   'Agregar a Historia',
    selectApp:    'Selecciona Instagram',
    errorMessage: 'Error al compartir. Por favor intenta nuevamente.',
    mobileOnly:   '(Solo móvil)',
  },
  en: {
    addToStory:   'Add to Story',
    selectApp:    'Select Instagram',
    errorMessage: 'Error sharing. Please try again.',
    mobileOnly:   '(Mobile only)',
  },
}

function getLang () {
  const lang = (navigator.language || navigator.userLanguage || 'es').slice(0, 2)
  return lang === 'en' ? 'en' : 'es'
}

// ─── Device detection ─────────────────────────────────────────────────────────

function isMobileDevice () {
  return (
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1)
  )
}

// ─── CSS custom property for the icon URL ─────────────────────────────────────
// The rest of the styles live in _ig-share-story.scss.

function injectIconVar () {
  if (document.getElementById('ig-share-icon-var')) return
  const style = document.createElement('style')
  style.id = 'ig-share-icon-var'
  style.textContent = `:root { --ig-share-icon-url: url('${ICON_URL}'); }`
  document.head.appendChild(style)
}

// ─── Button rendering ─────────────────────────────────────────────────────────

function renderShareButton (root, imageUrl, lang) {
  const t = translations[lang]

  root.innerHTML = `
    <button type="button" class="ig-share-btn" aria-label="${t.addToStory}">
      <div class="ig-share-btn__icon"></div>
      <div class="ig-share-btn__text-wrap">
        <div class="ig-share-btn__label">${t.addToStory}</div>
      </div>
    </button>
  `

  const button = root.querySelector('button')
  const isMobile = isMobileDevice()

  if (!isMobile) {
    button.disabled = true
    button.querySelector('.ig-share-btn__label').innerHTML =
      `${t.addToStory}<br><span class="ig-share-btn__note">${t.mobileOnly}</span>`
    return
  }

  button.addEventListener('click', async function () {
    if (button.classList.contains('ig-share-btn--loading')) return

    const textWrap     = button.querySelector('.ig-share-btn__text-wrap')
    const originalLabel = textWrap.querySelector('.ig-share-btn__label')
    const loadingLabel  = document.createElement('div')

    button.classList.add('ig-share-btn--loading')
    loadingLabel.className = 'ig-share-btn__label ig-share-btn__label--enter'
    loadingLabel.textContent = t.selectApp
    textWrap.appendChild(loadingLabel)

    setTimeout(() => {
      originalLabel.classList.add('ig-share-btn__label--exit')
      originalLabel.style.pointerEvents = 'none'
    }, 10)

    try {
      await new Promise(resolve => setTimeout(resolve, 700))

      const response = await fetch(imageUrl, { mode: 'cors' })
      if (!response.ok) throw new Error('Image load failed')
      const blob = await response.blob()
      const file = new File([blob], 'historia.png', { type: blob.type })

      if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
        throw new Error("Web Share API not supported or can't share files")
      }

      await navigator.share({ files: [file] })

    } catch (_err) {
      alert(t.errorMessage)

    } finally {
      loadingLabel.classList.remove('ig-share-btn__label--enter')
      loadingLabel.classList.add('ig-share-btn__label--exit')

      setTimeout(() => {
        textWrap.removeChild(loadingLabel)
        originalLabel.classList.remove('ig-share-btn__label--exit')
        originalLabel.style.pointerEvents = 'auto'
        button.classList.remove('ig-share-btn--loading')
      }, 400)
    }
  })
}

// ─── Public init ──────────────────────────────────────────────────────────────

export default function initIgShareStory () {
  injectIconVar()
  const lang = getLang()

  document.querySelectorAll('.ig-share-root[data-image]').forEach(root => {
    const imageUrl = root.getAttribute('data-image')
    if (imageUrl) renderShareButton(root, imageUrl, lang)
  })
}
