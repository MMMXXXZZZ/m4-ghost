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

const ICON_URL = 'data:image/png;base64,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'   // ← replace with your icon URL

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
