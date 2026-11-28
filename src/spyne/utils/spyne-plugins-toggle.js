import { filter } from 'rxjs/operators'

// Turning plugins off and on with a key combination.
//
// A plugin can be turned off for the current tab, and on again, by the keys in
// the app's config, `pluginsToggleKeys`, unless its own config has
// `allowDisabling: false`. A plugin that does real work for the app gives itself
// that default in its class's defaultConfig(); what an app passes when it makes
// the plugin overrules the class (SpynePlugin.allowsDisabling).
// The state is kept in session storage. It takes effect when the page loads, so a
// toggle stores the new state and reloads the page.
//
// The toggle is for development. It is on in a development build and off in a
// production build, unless the app's config says otherwise: `allowToggling: true`
// turns it on in production, for testing, and `allowToggling: false` turns it off
// everywhere. While it is off nothing below happens: no keys are heard, nothing
// is added to the window channel, and no plugin is left out.
//
// The keys are heard on the window channel, as CHANNEL_WINDOW_KEYDOWN_EVENT.
// While the toggle is on, SpyneApp.init adds 'keydown' to the window channel's
// events, so the toggle does not depend on the app listing it. Nothing here adds
// a listener to the page. A plugin does not listen either: it is asked once, when
// it is registered, whether the plugins are off (SpynePlugin.register). The
// window channel is not subscribed to until a plugin that can be turned off is
// registered.

const STORAGE_KEY = 'spynePluginsDisabled'
const WINDOW_CHANNEL = 'CHANNEL_WINDOW'
const KEYDOWN_ACTION = 'CHANNEL_WINDOW_KEYDOWN_EVENT'
// the window events the toggle reads
const REQUIRED_WINDOW_EVENTS = ['keydown']

const MODIFIER_PROPS = {
  ctrl: 'ctrlKey',
  control: 'ctrlKey',
  alt: 'altKey',
  option: 'altKey',
  shift: 'shiftKey',
  meta: 'metaKey',
  cmd: 'metaKey'
}

let _subscription
let _noticeGiven = false
let _warningGiven = false

const storage = () => {
  // reading the property can throw where storage is blocked
  try {
    return window.sessionStorage
  } catch (e) {
    return undefined
  }
}

/**
 * Whether the app was built for development. An app's bundler writes the value in
 * place of process.env.NODE_ENV when it builds. Where nothing does (no bundler, or
 * one that leaves it), there is no `process` in a browser, and the answer is no.
 *
 * @returns {Boolean}
 */
export function isDevelopmentBuild() {
  try {
    return process.env.NODE_ENV === 'development'
  } catch (e) {
    return false
  }
}

/**
 * Reads a key combination such as 'ctrl+alt+p' into the properties of a keydown
 * event that it has to match. The last part is the key: a letter, a digit, or the
 * name of a physical key as KeyboardEvent.code gives it ('F8', 'Backquote').
 * The parts before it are modifiers: ctrl, alt (or option), shift, meta (or cmd).
 * At least one of ctrl, alt or meta is required, so that typing never toggles.
 *
 * @param {String} keysStr
 * @returns {Object|undefined} undefined where the string is not a combination
 */
export function parsePluginsToggleKeys(keysStr) {
  if (typeof keysStr !== 'string') {
    return undefined
  }
  const parts = keysStr.split('+').map(part => part.trim()).filter(part => part !== '')
  const keyPart = parts.pop()
  const keys = { ctrlKey: false, altKey: false, shiftKey: false, metaKey: false }

  if (keyPart === undefined || MODIFIER_PROPS[keyPart.toLowerCase()] !== undefined) {
    return undefined
  }
  for (const part of parts) {
    const modifierProp = MODIFIER_PROPS[part.toLowerCase()]
    if (modifierProp === undefined) {
      return undefined
    }
    keys[modifierProp] = true
  }
  if (keys.ctrlKey === false && keys.altKey === false && keys.metaKey === false) {
    return undefined
  }
  if (/^[a-z]$/i.test(keyPart)) {
    keys.code = `Key${keyPart.toUpperCase()}`
  } else if (/^[0-9]$/.test(keyPart)) {
    keys.code = `Digit${keyPart}`
  } else if (/^[A-Z][A-Za-z0-9]+$/.test(keyPart)) {
    keys.code = keyPart
  } else {
    return undefined
  }
  return keys
}

/**
 * The keys that toggle the plugins in this app, or undefined where the toggle is
 * off. It is off where the app's config has `allowToggling: false`; where
 * `allowToggling` is left out and the app was not built for development; and
 * where `pluginsToggleKeys` is not a combination.
 *
 * @param {Object} config the app's merged config
 * @param {Boolean} isDevelopment
 * @returns {Object|undefined} the combination, as parsePluginsToggleKeys reads it
 */
export function pluginsToggleKeysOf(config, isDevelopment = isDevelopmentBuild()) {
  const allowToggling = config?.allowToggling
  const isAllowed = allowToggling === true || (allowToggling !== false && isDevelopment === true)

  return isAllowed === true ? parsePluginsToggleKeys(config?.pluginsToggleKeys) : undefined
}

/**
 * Whether a keydown event is the combination. The physical key is matched
 * (event.code), since alt changes the character a key gives on some keyboards.
 * A key held down counts once.
 *
 * @param {KeyboardEvent} event
 * @param {Object} keys from parsePluginsToggleKeys
 * @returns {Boolean}
 */
export function matchesPluginsToggleKeys(event, keys) {
  return keys !== undefined &&
    event !== undefined &&
    event.repeat !== true &&
    event.code === keys.code &&
    event.ctrlKey === keys.ctrlKey &&
    event.altKey === keys.altKey &&
    event.shiftKey === keys.shiftKey &&
    event.metaKey === keys.metaKey
}

/**
 * @returns {Boolean} true where the plugins have been turned off for this tab
 */
export function pluginsAreDisabled() {
  try {
    return storage().getItem(STORAGE_KEY) === '1'
  } catch (e) {
    return false
  }
}

/**
 * Stores the state for this tab.
 *
 * @param {Boolean} disabled
 * @returns {Boolean} false where the state could not be stored
 */
export function setPluginsDisabled(disabled) {
  try {
    if (disabled === true) {
      storage().setItem(STORAGE_KEY, '1')
    } else {
      storage().removeItem(STORAGE_KEY)
    }
    return true
  } catch (e) {
    return false
  }
}

/**
 * Turns the plugins off where they are on, and on where they are off, and
 * reloads the page so that it takes effect. Where the state cannot be stored
 * nothing is reloaded.
 *
 * @param {Function} reload
 * @returns {Boolean} whether the plugins are now off
 */
export function togglePlugins(reload = () => window.location.reload()) {
  const disable = pluginsAreDisabled() === false

  if (setPluginsDisabled(disable) === true) {
    reload()
  }
  return pluginsAreDisabled()
}

/**
 * Adds the window events the toggle reads to the window channel's events, while
 * the toggle is on in this app (pluginsToggleKeysOf). SpyneApp.init calls it once
 * the config is merged and before the window channel is started, so an app does
 * not have to list them. The app's own array is left as it was: the config is
 * given a new one.
 *
 * @param {Object} config the app's merged config
 * @param {Boolean} isDevelopment
 * @returns {Array} the events that were added
 */
export function addPluginsToggleWindowEvents(config, isDevelopment = isDevelopmentBuild()) {
  const windowConfig = config?.channels?.WINDOW

  if (windowConfig === undefined || pluginsToggleKeysOf(config, isDevelopment) === undefined) {
    return []
  }
  const events = Array.isArray(windowConfig.events) ? windowConfig.events : []
  const added = REQUIRED_WINDOW_EVENTS.filter(eventName => events.includes(eventName) === false)

  if (added.length > 0) {
    windowConfig.events = [...events, ...added]
  }
  return added
}

/**
 * Subscribes to the window channel for the app's key combination, once. A second
 * call is answered from the first.
 *
 * The keys are not listened for, and false is returned, where the toggle is off
 * in this app (pluginsToggleKeysOf), or where the window channel does not carry
 * 'keydown', which SpyneApp.init sees to and so is not expected. The second is
 * said once, in debug mode.
 *
 * @param {SpyneAppProperties} appProps the app's properties, as a plugin is handed them
 * @param {Object} options
 * @property {Function} options.onToggle
 * @property {Boolean} options.isDevelopment
 * @returns {Boolean} whether the keys are listened for
 */
export function listenForPluginsToggle(appProps, { onToggle = togglePlugins, isDevelopment = isDevelopmentBuild() } = {}) {
  if (_subscription !== undefined) {
    return true
  }
  const keys = pluginsToggleKeysOf(appProps?.config, isDevelopment)

  if (keys === undefined) {
    return false
  }
  const windowEvents = appProps.config.channels?.WINDOW?.events

  if (Array.isArray(windowEvents) === false || REQUIRED_WINDOW_EVENTS.every(eventName => windowEvents.includes(eventName)) === false) {
    if (appProps.debug === true && _warningGiven === false) {
      _warningGiven = true
      console.warn(`Spyne Warning: config.pluginsToggleKeys, "${appProps.config.pluginsToggleKeys}", needs 'keydown' in config.channels.WINDOW.events. The keys will not turn plugins off or on.`)
    }
    return false
  }
  _subscription = appProps.channelsMap.getStream(WINDOW_CHANNEL).observer
    .pipe(filter(channelPayload => channelPayload.action === KEYDOWN_ACTION && matchesPluginsToggleKeys(channelPayload.event, keys)))
    .subscribe(() => onToggle())
  return true
}

/**
 * @returns {Boolean} whether the keys are listened for
 */
export function isListeningForPluginsToggle() {
  return _subscription !== undefined
}

/**
 * Says once per page, in the console, that plugins were left out and which keys
 * bring them back. Without it a developer who pressed the keys in this tab some
 * time ago would find the plugins gone and nothing to say why.
 *
 * @param {String} keysStr
 */
export function notePluginsDisabled(keysStr) {
  if (_noticeGiven === false) {
    _noticeGiven = true
    console.info(`Spyne: the plugins that allow it are turned off for this tab. Press ${keysStr} to turn them on.`)
  }
}

/**
 * Unsubscribes and forgets what was said. For tests.
 */
export function resetPluginsToggle() {
  if (_subscription !== undefined) {
    _subscription.unsubscribe()
  }
  _subscription = undefined
  _noticeGiven = false
  _warningGiven = false
}
