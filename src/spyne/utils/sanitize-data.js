// src/utils/sanitize-data.js
import DOMPurify from 'dompurify'
import { SpyneAppProperties } from './spyne-app-properties.js'

let _sanitizeData
let isConfigured = false
let forceStrict = false // legacy compatibility toggle

/* ---------------------------------------------
 * Mode configurations
 * ------------------------------------------- */
const SAFE_FOR_RICH_TEXT = {
  ALLOWED_TAGS: [
    'a', 'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li',
    'blockquote', 'pre', 'code', 'span', 'div', 'section', 'article', 'aside',
    'header', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'figure', 'figcaption',
    'video', 'source'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'width', 'height', 'style', 'target', 'rel',
    'controls', 'poster', 'type', 'rows', 'cols'
  ],
  ALLOW_DATA_ATTR: true,
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'link'],
  SAFE_URL_PATTERN: /^(https?:|mailto:|tel:|data:image\/)/i
}

const SAFE_FOR_APP = {
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange'],
  ALLOW_DATA_ATTR: false
}

/* ---------------------------------------------
 * Determine sanitization mode from SpyneAppProperties
 * ------------------------------------------- */
const resolveDefaultMode = () => {
  try {
    const mode = SpyneAppProperties?.mode
    if (mode === 'authoring' || mode === 'development') return 'richtext'
  } catch (e) {
    // Fallback: assume production strict mode
  }
  return 'app'
}

/* --------------------------------------------- */
function makeSanitizeFn(mode = 'app') {
  const cfg = mode === 'richtext' ? SAFE_FOR_RICH_TEXT : SAFE_FOR_APP

  return (html) => {
    let clean = DOMPurify.sanitize(html, cfg)

    // In richtext mode, enforce safe URL schemes for href/src
    if (mode === 'richtext') {
      clean = clean.replace(/<(a|img)\b([^>]+?)>/gi, (match) => {
        return match.replace(/\b(href|src)="([^"]*)"/gi, (m, attr, val) => {
          return SAFE_FOR_RICH_TEXT.SAFE_URL_PATTERN.test(val) ? m : `${attr}=""`
        })
      })
    }
    return clean
  }
}

/* ---------------------------------------------
 * Configure once (kept for compatibility)
 * ------------------------------------------- */
const sanitizeDataConfigure = (config = {}) => {
  if (isConfigured) {
    console.warn('sanitizeData is already configured. Reconfiguration is not allowed.')
    return
  }

  const { strict = false } = config
  const processFactory = (mode) => {
    const sanitizeStr = makeSanitizeFn(mode)
    const process = (val) => {
      if (Array.isArray(val)) return val.map(process)
      if (val && typeof val === 'object') {
        const out = {}
        for (const [k, v] of Object.entries(val)) {
          out[k] = (typeof v === 'string') ? sanitizeStr(v) : process(v)
        }
        return out
      }
      return (typeof val === 'string') ? sanitizeStr(val) : val
    }
    return process
  }

  _sanitizeData = (data, opts = {}) => {
    const { disableSanitize = false, mode } = opts
    const legacyStrict = forceStrict || strict
    const effectiveMode = mode || (legacyStrict ? 'app' : resolveDefaultMode())
    if (disableSanitize) return data
    return processFactory(effectiveMode)(data)
  }

  sanitizeDataConfigure.sanitizeDataForce = (data, mode) => {
    const effective = mode || resolveDefaultMode()
    return processFactory(effective)(data)
  }

  isConfigured = true
}

/* ---------------------------------------------
 * Configurable runtime sanitizer
 * ------------------------------------------- */
const sanitizeData = (data, opts = {}) => {
  if (!isConfigured) {
    throw new Error('sanitizeData is not configured. Call sanitizeDataConfigure() first.')
  }
  return _sanitizeData(data, opts)
}

/* ---------------------------------------------
 * Always-on sanitizer with environment default
 * ------------------------------------------- */
const sanitizeDataForce = (data, mode) => {
  if (!isConfigured || !sanitizeDataConfigure.sanitizeDataForce) {
    const sanitizeStr = makeSanitizeFn(mode || resolveDefaultMode())
    return (typeof data === 'string') ? sanitizeStr(data) : data
  }
  return sanitizeDataConfigure.sanitizeDataForce(data, mode)
}

/* ---------------------------------------------
 * Event-target sanitizer
 * ------------------------------------------- */
const sanitizeEventTarget = (el, mode) => {
  if (!el) return
  const effectiveMode = mode || resolveDefaultMode()
  const sanitizeStr = makeSanitizeFn(effectiveMode)
  const UNSAFE_RE = /<(?:script|iframe|object|embed|form|input|button|link|meta)[^>]*>|on\w+=|javascript:/i

  if (typeof el.value === 'string' && UNSAFE_RE.test(el.value)) {
    const clean = sanitizeStr(el.value)
    if (clean !== el.value) el.value = clean
  }
  if (el.isContentEditable && typeof el.innerHTML === 'string' && UNSAFE_RE.test(el.innerHTML)) {
    const clean = sanitizeStr(el.innerHTML)
    if (clean !== el.innerHTML) el.innerHTML = clean
  }
}

/* --------------------------------------------- */
const setSanitizeDataForceStrict = (bool = true) => { forceStrict = !!bool }

export {
  sanitizeDataConfigure,
  sanitizeData,
  sanitizeDataForce,
  sanitizeEventTarget,
  setSanitizeDataForceStrict
}
export default sanitizeData
