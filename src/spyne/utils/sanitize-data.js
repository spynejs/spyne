// src/utils/sanitize-data.js
import DOMPurify from 'dompurify'
import { spyneWarn } from './spyne-warn.js'
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
 * Custom elements
 *
 * The framework's own custom elements (spyne-*) are first-party output —
 * the CMS proxy wraps editable content in <spyne-cms-item> etc. — and are
 * admitted in every mode. They are inert without their defining plugin
 * and the attribute check below only admits data-* on them.
 *
 * Additional elements register via allowCustomElements() (additive only;
 * names must contain a hyphen per the custom-element spec, so built-in
 * tags like script or iframe can never be admitted through this path)
 * or via config.customElements at SpyneApp.init.
 * ------------------------------------------- */
const SPYNE_CUSTOM_ELEMENT_RE = /^spyne-[a-z][a-z0-9-]*$/i

const allowedCustomElementPatterns = []

const allowCustomElements = (elements = []) => {
  const arr = Array.isArray(elements) ? elements : [elements]

  arr.forEach((entry) => {
    if (entry instanceof RegExp) {
      allowedCustomElementPatterns.push(entry)
      return
    }

    const name = String(entry).toLowerCase()
    if (/^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(name) !== true) {
      spyneWarn(`SPYNE WARNING: "${entry}" is not a valid custom element name (a hyphen is required) and was not added to the sanitizer allowlist.`)
      return
    }

    allowedCustomElementPatterns.push(name)
  })
}

const customElementTagCheck = (tagName) => {
  if (SPYNE_CUSTOM_ELEMENT_RE.test(tagName)) return true

  return allowedCustomElementPatterns.some(p =>
    p instanceof RegExp ? p.test(tagName) : p === tagName
  )
}

const CUSTOM_ELEMENT_HANDLING = {
  tagNameCheck: customElementTagCheck,
  attributeNameCheck: /^data-[a-z0-9-]+$/i,
  allowCustomizedBuiltInElements: false
}

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
  ALLOWED_URI_REGEXP: SAFE_URI_REGEXP,
  CUSTOM_ELEMENT_HANDLING
}

const SAFE_FOR_APP = {
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: SAFE_URI_REGEXP,
  CUSTOM_ELEMENT_HANDLING
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
      spyneWarn(`SPYNE WARNING: iframe src "${src}" was removed by the iframe policy (same-origin, https, or an allowed origin is required).`)
      node.removeAttribute('src')
    }

    const { sandbox } = activeIframePolicy
    if (sandbox !== false && node.hasAttribute('sandbox') !== true) {
      node.setAttribute('sandbox', sandbox)
    }
  })
}

/* ---------------------------------------------
 * Anchor policy
 *
 * Configured via config.anchors at SpyneApp.init:
 *   allowTarget    — true (default) admits target on dynamic anchors in
 *                    every mode; the hook validates values and forces
 *                    noopener. false strips target everywhere.
 *   addNoopener    — true (default) forces rel="noopener noreferrer"
 *                    onto target="_blank" anchors.
 *   allowedDomains — [] (any destination the URI scheme policy allows) |
 *                    ['https://github.com', ...] restricts cross-origin
 *                    hrefs to the listed origins. Same-origin, relative,
 *                    mailto: and tel: hrefs are always allowed.
 *
 * A per-call override can be passed as opts.anchors to sanitizeData.
 * The legacy top-level allowTargetAttr and addNoopener config keys are
 * honored as fallbacks.
 * ------------------------------------------- */
// target accepts any browsing-context name; these are the keywords that
// stay in the same context and therefore carry no opener risk.
const SAME_CONTEXT_TARGETS = ['_self', '_parent', '_top']

let configuredAnchorPolicy = { allowTarget: true, addNoopener: true, allowedDomains: [] }
let activeAnchorPolicy = configuredAnchorPolicy

const resolveAnchorPolicy = (override) => {
  if (!override) return configuredAnchorPolicy
  return {
    allowTarget: override.allowTarget !== undefined ? override.allowTarget === true : configuredAnchorPolicy.allowTarget,
    addNoopener: override.addNoopener !== undefined ? override.addNoopener === true : configuredAnchorPolicy.addNoopener,
    allowedDomains: override.allowedDomains !== undefined ? override.allowedDomains : configuredAnchorPolicy.allowedDomains
  }
}

const isAllowedAnchorHref = (href, policy = activeAnchorPolicy) => {
  const normalized = normalizeUriForCheck(href)

  // mailto: and tel: are not domains and always pass.
  if (/^(mailto|tel):/i.test(normalized)) return true

  let resolved
  try {
    resolved = new URL(normalized, window.location.href)
  } catch (e) {
    return false
  }

  // Same-origin links (including relative hrefs) are never restricted.
  if (resolved.origin === window.location.origin && resolved.origin !== 'null') {
    return true
  }

  if (/^https?:$/.test(resolved.protocol) !== true) return false

  const domains = policy.allowedDomains
  if (!Array.isArray(domains) || domains.length === 0) return true

  return domains.some(d => {
    try {
      return new URL(d).origin === resolved.origin
    } catch (e) {
      return false
    }
  })
}

const forceNoopenerRel = (el) => {
  const currentRel = el.getAttribute('rel') || ''
  const relSet = new Set(currentRel.split(/\s+/).filter(Boolean))

  relSet.add('noopener')
  relSet.add('noreferrer')

  el.setAttribute('rel', Array.from(relSet).join(' '))
}

let anchorHookAdded = false
const addAnchorHardeningHook = () => {
  if (anchorHookAdded) return
  anchorHookAdded = true

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (!node || typeof node.getAttribute !== 'function') return
    if (node.tagName !== 'A') return

    const policy = activeAnchorPolicy
    const href = node.getAttribute('href')

    if (href && policy.allowedDomains.length > 0 && isAllowedAnchorHref(href, policy) !== true) {
      spyneWarn(`SPYNE WARNING: anchor href "${href}" was removed by the anchor policy (same-origin or an allowed domain is required).`)
      node.removeAttribute('href')
    }

    const target = node.getAttribute('target')
    if (!target) return

    // target without an href serves no purpose.
    if (policy.allowTarget !== true || !node.getAttribute('href')) {
      node.removeAttribute('target')
      return
    }

    // Any browsing-context name is valid; _blank and named windows both
    // hand the opened page an opener reference, so noopener applies to
    // every target except the same-context keywords.
    if (SAME_CONTEXT_TARGETS.includes(target) !== true && policy.addNoopener === true) {
      forceNoopenerRel(node)
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

  if (mode === 'app') {
    const cfg = { ...base }
    const addAttr = []

    if (allowIframe === true) {
      cfg.FORBID_TAGS = base.FORBID_TAGS.filter(t => t !== 'iframe')
      cfg.ADD_TAGS = ['iframe']
      addAttr.push('sandbox')
    }

    // DOMPurify strips target by default; re-admit it (with rel) so the
    // anchor hook can validate values and force noopener instead.
    if (activeAnchorPolicy.allowTarget === true) {
      addAttr.push('target', 'rel')
    }

    if (addAttr.length > 0) {
      cfg.ADD_ATTR = addAttr
    }

    return cfg
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
    spyneWarn('sanitizeData is already configured. Reconfiguration is not allowed.')
    return
  }

  const { strict = false, disableSanitize = false, iframes, customElements, anchors, allowTargetAttr, addNoopener } = config

  globalDisable = disableSanitize === true

  if (customElements !== undefined) {
    allowCustomElements(customElements)
  }

  if (iframes && typeof iframes === 'object') {
    configuredIframePolicy = resolveIframePolicy(iframes)
    activeIframePolicy = configuredIframePolicy
  }

  // config.anchors wins; the legacy top-level allowTargetAttr/addNoopener
  // keys are honored as fallbacks.
  configuredAnchorPolicy = resolveAnchorPolicy({
    allowTarget: anchors?.allowTarget !== undefined ? anchors.allowTarget : allowTargetAttr,
    addNoopener: anchors?.addNoopener !== undefined ? anchors.addNoopener : addNoopener,
    allowedDomains: anchors?.allowedDomains
  })
  activeAnchorPolicy = configuredAnchorPolicy

  if (globalDisable) {
    console.warn('SPYNE SECURITY WARNING: All data sanitization is DISABLED via config.disableSanitize. Do not use this setting in production.')
  } else {
    addIframeHardeningHook()
    addAnchorHardeningHook()
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
    const { disableSanitize: callDisable = false, mode, iframes: iframesOverride, anchors: anchorsOverride } = opts
    if (globalDisable || callDisable) return data

    const legacyStrict = forceStrict || strict
    const effectiveMode = mode || (legacyStrict ? 'app' : resolveDefaultMode())

    // Sanitization is synchronous, so the per-call iframe and anchor
    // policies can be scoped with a swap-and-restore around the pass.
    activeIframePolicy = resolveIframePolicy(iframesOverride)
    activeAnchorPolicy = resolveAnchorPolicy(anchorsOverride)
    try {
      return processFactory(effectiveMode)(data)
    } finally {
      activeIframePolicy = configuredIframePolicy
      activeAnchorPolicy = configuredAnchorPolicy
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

  // Anchor href follows the anchor policy: safe scheme, plus the
  // configured domain allowlist for cross-origin destinations.
  if (tag === 'A' && k === 'href') {
    if (isSafeUri(value) !== true) return { allowed: false, value }
    if (configuredAnchorPolicy.allowedDomains.length > 0 && isAllowedAnchorHref(value, configuredAnchorPolicy) !== true) {
      return { allowed: false, value }
    }
    return { allowed: true, value }
  }

  if (URL_ATTRS.includes(k) && isSafeUri(value) !== true) {
    return { allowed: false, value }
  }

  return { allowed: true, value }
}

/**
 * Applies the configured iframe and anchor policies to an element created
 * through the attribute channel (DomElement), mirroring the DOMPurify
 * hooks that guard parsed HTML.
 */
const applyElementHardening = (el) => {
  if (globalDisable || !el) return el

  if (el.tagName === 'IFRAME') {
    const { sandbox } = configuredIframePolicy
    if (sandbox !== false && el.hasAttribute('sandbox') !== true) {
      el.setAttribute('sandbox', sandbox)
    }
  }

  if (el.tagName === 'A') {
    const policy = configuredAnchorPolicy
    const target = el.getAttribute('target')

    if (target) {
      if (policy.allowTarget !== true || !el.getAttribute('href')) {
        el.removeAttribute('target')
      } else if (SAME_CONTEXT_TARGETS.includes(target) !== true && policy.addNoopener === true) {
        forceNoopenerRel(el)
      }
    }
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
  spyneWarn('SPYNE DEPRECATION: setSanitizeDataForceStrict is deprecated. Pass { mode: "app" } to sanitizeData, or set config.mode in SpyneApp.init.')
  forceStrict = !!bool
}

export {
  sanitizeDataConfigure,
  sanitizeData,
  sanitizeDataForce,
  sanitizeAttribute,
  applyElementHardening,
  allowCustomElements,
  CUSTOM_ELEMENT_HANDLING as customElementHandling,
  sanitizeEventTarget,
  setSanitizeDataForceStrict
}
export default sanitizeData
