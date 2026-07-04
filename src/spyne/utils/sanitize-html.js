import DOMPurify from 'dompurify'
import { spyneWarn } from './spyne-warn.js'
import { customElementHandling } from './sanitize-data.js'

let _sanitizeHTML
let isConfigured = false

/**
 * Configures the template-layer sanitizer.
 *
 * Sanitization is always on. The three-level posture:
 *
 *   mode: 'app' (default)   — DOMPurify with its standard allowlist
 *   mode: 'richtext'        — additionally admits iframe/link (+ sandbox attr)
 *                             so CMS/authoring content survives templates
 *   strict: true            — additionally registers a Trusted Types 'default'
 *                             policy so DOM sinks route through sanitization
 *   disableSanitize: true   — the only full passthrough; logs a security warning
 */
const sanitizeHTMLConfigure = (config = {}) => {
  if (isConfigured) {
    spyneWarn('sanitizeHTML is already configured. Reconfiguration is not allowed.')
    return
  }

  const {
    strict = false,
    mode = 'app',
    disableSanitize = false,
    allowTargetAttr = true,
    addNoopener = true,
    debug = false,
    iframes = {}
  } = config

  if (disableSanitize === true) {
    console.warn('SPYNE SECURITY WARNING: All HTML sanitization is DISABLED via config.disableSanitize. Do not use this setting in production.')
    _sanitizeHTML = (html) => html
    isConfigured = true
    return
  }

  const isRichtext = ['richtext', 'authoring', 'development'].includes(mode)

  // Iframe admission follows config.iframes.allow when set; otherwise
  // the mode default (richtext yes, app no). The DOMPurify hook added by
  // sanitize-data enforces src origin and sandbox policy on whatever
  // is admitted here.
  const allowIframe = iframes.allow !== undefined ? iframes.allow === true : isRichtext

  const domPurifyConfig = {
    RETURN_TRUSTED_TYPE: false,
    ADD_TAGS: [
      ...(allowIframe ? ['iframe'] : []),
      ...(isRichtext ? ['link'] : [])
    ],
    ADD_ATTR: [
      ...(allowTargetAttr ? ['target'] : []),
      ...(allowIframe ? ['sandbox'] : [])
    ],
    // Admits the framework's spyne-* elements (CMS proxy wrappers) and any
    // elements registered via allowCustomElements/config.customElements.
    // The tag check is a closure, so late plugin registration is honored.
    CUSTOM_ELEMENT_HANDLING: customElementHandling,
    ...(allowIframe !== true && isRichtext ? { FORBID_TAGS: ['iframe'] } : {})
  }

  const sanitizeWithPolicy = (html) => DOMPurify.sanitize(html, domPurifyConfig)

  if (allowTargetAttr) {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (!node || typeof node.getAttribute !== 'function') return
      if (node.tagName !== 'A') return

      const href = node.getAttribute('href')
      const target = node.getAttribute('target')

      // remove target on anchors without href
      if (!href && target) {
        node.removeAttribute('target')
        return
      }

      if (!target) return

      const validTargets = ['_blank', '_self', '_parent', '_top']
      if (!validTargets.includes(target)) {
        node.removeAttribute('target')
        return
      }

      if (target === '_blank' && addNoopener) {
        const currentRel = node.getAttribute('rel') || ''
        const relParts = currentRel.split(/\s+/).filter(Boolean)
        const relSet = new Set(relParts)

        relSet.add('noopener')
        relSet.add('noreferrer')

        node.setAttribute('rel', Array.from(relSet).join(' '))
      }
    })
  }

  _sanitizeHTML = sanitizeWithPolicy

  if (strict === true && window.trustedTypes) {
    try {
      const policy = window.trustedTypes.createPolicy('default', {
        createHTML: (toEscape) => sanitizeWithPolicy(toEscape)
      })

      _sanitizeHTML = (html) => policy.createHTML(html)

      if (debug === true) {
        console.log('SPYNE: Trusted Types default policy registered. Note that browser enforcement additionally requires the CSP header: require-trusted-types-for \'script\'.')
      }
    } catch (err) {
      spyneWarn('SPYNE WARNING: A Trusted Types "default" policy already exists on this page. Falling back to direct sanitization.', err)
    }
  }

  isConfigured = true
}

const sanitizeHTML = (html) => {
  if (!isConfigured) {
    throw new Error('sanitizeHTML is not configured. Call sanitizeHTMLConfigure() with appropriate config.')
  }
  return _sanitizeHTML(html)
}

export { sanitizeHTMLConfigure }
export default sanitizeHTML
