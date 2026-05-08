import DOMPurify from 'dompurify'

let _sanitizeHTML
let isConfigured = false

const sanitizeHTMLConfigure = (config = {}) => {
  if (isConfigured) {
    console.warn('sanitizeHTML is already configured. Reconfiguration is not allowed.')
    return
  }

  const {
    strict = true,
    allowTargetAttr = true,
    addNoopener = true
  } = config

  if (!strict) {
    _sanitizeHTML = (html) => html
    isConfigured = true
    return
  }

  const domPurifyConfig = {
    RETURN_TRUSTED_TYPE: false,
    ADD_ATTR: allowTargetAttr ? ['target'] : []
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

  if (window.trustedTypes) {
    const policy = window.trustedTypes.createPolicy('default', {
      createHTML: (toEscape) => sanitizeWithPolicy(toEscape)
    })

    _sanitizeHTML = (html) => policy.createHTML(html)
  } else {
    _sanitizeHTML = (html) => sanitizeWithPolicy(html)
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
