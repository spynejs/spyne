import DOMPurify from 'dompurify'

let _sanitizeHTML
let isConfigured = false

const sanitizeHTMLConfigure = (config) => {
  if (!isConfigured) {
    if (config.strict) {
      if (window.trustedTypes) {
        const policy = window.trustedTypes.createPolicy('default', {
          createHTML: (to_escape) => DOMPurify.sanitize(to_escape, { RETURN_TRUSTED_TYPE: false })
        })

        _sanitizeHTML = (html) => policy.createHTML(html)
      } else {
        _sanitizeHTML = (html) => DOMPurify.sanitize(html)
      }
    } else {
      _sanitizeHTML = (html) => html // No sanitization if not required
    }
    isConfigured = true
  } else {
    console.warn('sanitizeHTML is already configured. Reconfiguration is not allowed.')
  }
}

const sanitizeHTML = (html) => {
  if (!isConfigured) {
    throw new Error('sanitizeHTML is not configured. Call sanitizeHTMLConfigure() with appropriate config.')
  }
  return _sanitizeHTML(html)
}

export { sanitizeHTMLConfigure }
export default sanitizeHTML
