// src/utils/sanitize-data.js
import DOMPurify from 'dompurify'
import { SpyneAppProperties } from './spyne-app-properties.js'

let _sanitizeData
let isConfigured = false
let globalDisable = false
let forceStrict = false // deprecated legacy toggle, see setSanitizeDataForceStrict

/* ---------------------------------------------
 * URI policy
 *
 * Allows https?, mailto:, tel:, data:image/ and any scheme-less
 * (relative, fragment, query, protocol-relative) URL.
 * All other schemes (javascript:, vbscript:, data:text/html, etc.) fail.
 * ------------------------------------------- */
const SAFE_URI_REGEXP = /^(?:(?:https?|mailto|tel):|data:image\/|(?![a-z][a-z0-9+.-]*:)[\s\S]*$)/i

// Browsers strip ASCII control characters and whitespace when parsing URL
// schemes, so "jav\tascript:" executes. Normalize before testing.
// eslint-disable-next-line no-control-regex -- matching control chars is the point
const normalizeUriForCheck = (val) => String(val).replace(/[\u0000-\u0020]/g, '')

const isSafeUri = (val) => SAFE_URI_REGEXP.test(normalizeUriForCheck(val))

/* ---------------------------------------------
 * Mode configurations
 * ------------------------------------------- */
const SAFE_FOR_RICH_TEXT = {
  ALLOWED_TAGS: [
    'a', 'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'dl', 'dt', 'dd', 'ol', 'li', 'hr',
    'blockquote', 'pre', 'code', 'span', 'div', 'section', 'article', 'aside',
    'header', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'figure', 'figcaption',
    'video', 'source', 'iframe', 'input', 'button', 'label', 'link'
  ],
  ADD_TAGS: ['iframe', 'input', 'button', 'link'],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'class', 'title', 'width', 'height', 'style', 'target', 'rel',
    'controls', 'poster', 'type', 'rows', 'cols', 'sandbox'
  ],
  ALLOW_DATA_ATTR: true,
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange'],
  FORBID_TAGS: ['script', 'object', 'embed', 'meta'],
  ALLOWED_URI_REGEXP: SAFE_URI_REGEXP
}

const SAFE_FOR_APP = {
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: SAFE_URI_REGEXP
}

/* ---------------------------------------------
 * Iframe policy
 *
 * Configured via config.iframes at SpyneApp.init:
 *   allow          — undefined (mode default: richtext yes, app no) | true | false
 *   allowedOrigins — [] (any https origin) | ['https://www.youtube.com', ...]
 *   sandbox        — sandbox value forced onto iframes lacking one; false = never force
 *
 * A per-call override can be passed as opts.iframes to sanitizeData.
 * ------------------------------------------- */
const DEFAULT_IFRAME_SANDBOX = 'allow-scripts allow-same-origin allow-popups'

let configuredIframePolicy = { allow: undefined, allowedOrigins: [], sandbox: DEFAULT_IFRAME_SANDBOX }
let activeIframePolicy = configuredIframePolicy

const resolveIframePolicy = (override) => {
  if (!override) return configuredIframePolicy
  return {
    allow: override.allow !== undefined ? override.allow : configuredIframePolicy.allow,
    allowedOrigins: override.allowedOrigins !== undefined ? override.allowedOrigins : configuredIframePolicy.allowedOrigins,
    sandbox: override.sandbox !== undefined ? override.sandbox : configuredIframePolicy.sandbox
  }
}

const iframeAllowedForMode = (mode, policy = activeIframePolicy) => {
  if (policy.allow === undefined) return mode === 'richtext'
  return policy.allow === true
}

// localhost is a secure context per the platform's own definition.
const isTrustworthyLocalHostname = (hostname) =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '[::1]' ||
  hostname.endsWith('.localhost')

const isAllowedIframeSrc = (src, policy = activeIframePolicy) => {
  const normalized = normalizeUriForCheck(src)

  let resolved
  try {
    resolved = new URL(normalized, window.location.href)
  } catch (e) {
    return false
  }

  // Executable/pseudo schemes (javascript:, data:, vbscript:) resolve with
  // an opaque 'null' origin and fail both checks below.

  // Same-origin embeds (including relative src) are as trusted as the
  // page itself and always pass, regardless of scheme or allowlist.
  if (resolved.origin === window.location.origin && resolved.origin !== 'null') {
    return true
  }

  // Cross-origin embeds must be https, or http on a localhost host
  // (a secure context) to keep local development friction-free.
  const isSecure = resolved.protocol === 'https:' ||
    (resolved.protocol === 'http:' && isTrustworthyLocalHostname(resolved.hostname))

  if (isSecure !== true) return false

  const origins = policy.allowedOrigins
  if (!Array.isArray(origins) || origins.length === 0) return true

  return origins.some(o => {
    try {
      return new URL(o).origin === resolved.origin
    } catch (e) {
      return false
    }
  })
}

let iframeHookAdded = false
const addIframeHardeningHook = () => {
  if (iframeHookAdded) return
  iframeHookAdded = true

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (!node || node.tagName !== 'IFRAME') return

    const src = node.getAttribute('src') || ''
    if (src !== '' && isAllowedIframeSrc(src) !== true) {
      console.warn(`SPYNE WARNING: iframe src "${src}" was removed by the iframe policy (same-origin, https, or an allowed origin is required).`)
      node.removeAttribute('src')
    }

    const { sandbox } = activeIframePolicy
    if (sandbox !== false && node.hasAttribute('sandbox') !== true) {
      node.setAttribute('sandbox', sandbox)
    }
  })
}

/* ---------------------------------------------
 * Determine sanitization mode
 *
 * Explicit config always wins; the build environment is only a
 * fallback when no mode has been configured.
 * ------------------------------------------- */
const RICHTEXT_ALIASES = ['richtext', 'authoring', 'development']

const resolveDefaultMode = () => {
  const configMode = SpyneAppProperties?.mode

  if (RICHTEXT_ALIASES.includes(configMode)) return 'richtext'
  if (configMode === 'app') return 'app'

  try {
    if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development') {
      return 'richtext'
    }
  } catch (e) {
    // no build-time env available
  }

  return 'app'
}

/* --------------------------------------------- */
const buildModeConfig = (mode) => {
  const base = mode === 'richtext' ? SAFE_FOR_RICH_TEXT : SAFE_FOR_APP
  const allowIframe = iframeAllowedForMode(mode)

  if (mode === 'richtext' && allowIframe !== true) {
    return {
      ...base,
      ALLOWED_TAGS: base.ALLOWED_TAGS.filter(t => t !== 'iframe'),
      ADD_TAGS: base.ADD_TAGS.filter(t => t !== 'iframe'),
      FORBID_TAGS: [...base.FORBID_TAGS, 'iframe']
    }
  }

  if (mode === 'app' && allowIframe === true) {
    return {
      ...base,
      FORBID_TAGS: base.FORBID_TAGS.filter(t => t !== 'iframe'),
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['sandbox']
    }
  }

  return base
}

function makeSanitizeFn(mode = 'app') {
  const cfg = buildModeConfig(mode)

  return (html) => DOMPurify.sanitize(html, cfg)
}

/* ---------------------------------------------
 * Configure once
 * ------------------------------------------- */
const sanitizeDataConfigure = (config = {}) => {
  if (isConfigured) {
    console.warn('sanitizeData is already configured. Reconfiguration is not allowed.')
    return
  }

  const { strict = false, disableSanitize = false, iframes } = config

  globalDisable = disableSanitize === true

  if (iframes && typeof iframes === 'object') {
    configuredIframePolicy = resolveIframePolicy(iframes)
    activeIframePolicy = configuredIframePolicy
  }

  if (globalDisable) {
    console.warn('SPYNE SECURITY WARNING: All data sanitization is DISABLED via config.disableSanitize. Do not use this setting in production.')
  } else {
    addIframeHardeningHook()
  }

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
    const { disableSanitize: callDisable = false, mode, iframes: iframesOverride } = opts
    if (globalDisable || callDisable) return data

    const legacyStrict = forceStrict || strict
    const effectiveMode = mode || (legacyStrict ? 'app' : resolveDefaultMode())

    // Sanitization is synchronous, so the per-call iframe policy can be
    // scoped with a swap-and-restore around the processing pass.
    activeIframePolicy = resolveIframePolicy(iframesOverride)
    try {
      return processFactory(effectiveMode)(data)
    } finally {
      activeIframePolicy = configuredIframePolicy
    }
  }

  sanitizeDataConfigure.sanitizeDataForce = (data, mode) => {
    if (globalDisable) return data
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
 * Attribute sanitizer
 *
 * The single value-level guard for the attribute channel
 * (DomElement.setElAttrs). Attribute names are gated by the
 * DomElement/ViewStream allowlists; this validates values.
 *
 * Independent of sanitizeDataConfigure so it is always available.
 * Returns { allowed: Boolean, value }.
 * ------------------------------------------- */
const URL_ATTRS = [
  'href', 'src', 'action', 'formaction', 'ping', 'poster',
  'cite', 'codebase', 'manifest', 'icon', 'background'
]

const sanitizeAttribute = (key, value, tagName) => {
  if (globalDisable) return { allowed: true, value }

  const k = String(key).toLowerCase()
  const tag = String(tagName || '').toUpperCase()

  // Event-handler attributes are never legitimate in SpyneJS —
  // broadcastEvents is the declared mechanism for interactivity.
  if (k.startsWith('on')) {
    return { allowed: false, value }
  }

  // srcdoc is a full HTML document; sanitize it as one.
  if (k === 'srcdoc') {
    const cfg = buildModeConfig(resolveDefaultMode())
    return { allowed: true, value: DOMPurify.sanitize(String(value), cfg) }
  }

  // Iframe src follows the iframe policy: https-only, plus the
  // configured origin allowlist.
  if (tag === 'IFRAME' && k === 'src') {
    return { allowed: isAllowedIframeSrc(value, configuredIframePolicy), value }
  }

  if (URL_ATTRS.includes(k) && isSafeUri(value) !== true) {
    return { allowed: false, value }
  }

  return { allowed: true, value }
}

/**
 * Applies the configured iframe sandbox policy to an element created
 * through the attribute channel (DomElement), mirroring the DOMPurify
 * hook that guards parsed HTML.
 */
const applyIframeHardening = (el) => {
  if (globalDisable || !el || el.tagName !== 'IFRAME') return el

  const { sandbox } = configuredIframePolicy
  if (sandbox !== false && el.hasAttribute('sandbox') !== true) {
    el.setAttribute('sandbox', sandbox)
  }

  return el
}

/* ---------------------------------------------
 * Event-target sanitizer
 * ------------------------------------------- */
const sanitizeEventTarget = (el, mode) => {
  if (!el || globalDisable) return
  const effectiveMode = mode || resolveDefaultMode()
  const sanitizeStr = makeSanitizeFn(effectiveMode)
  const UNSAFE_RE = /<(?:script|object|embed|form|input|button|link|meta)[^>]*>|on\w+=|javascript:/i
  if (typeof el.value === 'string' && UNSAFE_RE.test(el.value)) {
    const clean = sanitizeStr(el.value)
    if (clean !== el.value) el.value = clean
  }
  if (el.isContentEditable && typeof el.innerHTML === 'string' && UNSAFE_RE.test(el.innerHTML)) {
    const clean = sanitizeStr(el.innerHTML)
    if (clean !== el.innerHTML) el.innerHTML = clean
  }
}

/* ---------------------------------------------
 * @deprecated Use sanitizeData(data, { mode: 'app' }) per call, or set
 * config.mode at SpyneApp.init. Retained for backward compatibility.
 * ------------------------------------------- */
const setSanitizeDataForceStrict = (bool = true) => {
  console.warn('SPYNE DEPRECATION: setSanitizeDataForceStrict is deprecated. Pass { mode: "app" } to sanitizeData, or set config.mode in SpyneApp.init.')
  forceStrict = !!bool
}

export {
  sanitizeDataConfigure,
  sanitizeData,
  sanitizeDataForce,
  sanitizeAttribute,
  applyIframeHardening,
  sanitizeEventTarget,
  setSanitizeDataForceStrict
}
export default sanitizeData
