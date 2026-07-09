import { Channel } from './channel.js'
import { checkIfObjIsNotEmptyOrNil } from '../utils/frp-tools.js'
import { SpyneAppProperties } from '../utils/spyne-app-properties.js'
import { SpyneUtilsChannelWindow } from '../utils/spyne-utils-channel-window.js'
import { merge } from 'rxjs'
import { map, debounceTime, skipWhile, buffer, bufferCount, throttleTime, filter } from 'rxjs/operators'
import { curry, pick, partialRight, mapObjIndexed, apply, map as rMap } from 'ramda'
import { deepMerge } from '../utils/deep-merge.js'

const customActionsArr = []

export class SpyneChannelWindow extends Channel {
  /**
   * @module SpyneChannelWindow
   * @type core
   *
   * @desc
   * The Window Channel will listen to window and document events that are set in its configuration file
   * <div class='btn btn-blue-ref btn-console modal-btn'  data-type='modal-window' data-value='windowEvents'>View Window Events</div></br></br>
   *
   * @constructor
   * @param {String} CHANNEL_NAME
   * @param {Object} config
   * @property {Object} config - = {}; The config has several options used to listen to window and document events.
   * @property {Array} config.events - = []; Any window and document events can be added here.
   * @property {Array} config.customEvents - = []; Application CustomEvents to capture. Each entry is either an event name string, or an object with a name property plus ONE rate/batch option: buffer (ms of quiet that closes a batch; emits one payload whose payload.detail is the array of batched details), count (batch every n events), debounce (ms; emits only the latest event), or throttle (ms; emits the leading event per window). Example: ['simple_event', {name: 'spyne_cms_item_connected', buffer: 400}].
   * @property {Object} config.mediaQueries - = {}; Media queries are added as key,value pairs; the key is the name of the boolean for the query, the value is the query itself.
   * @property {Boolean} config.listenForResize - = true; This is default listening for resize event.
   * @property {Boolean} config.listenForOrientation - = true; Listen for horizontal and landscape orientation changes on mobile devices.
   * @property {Boolean} config.listenForMouseWheel - = false; If set to true, will listen for mouseWheel and will add direction and distance parameters.
   * @property {Boolean} config.debounceMSTimeForResize - = 200; The time between resize events in milliseconds.
   * @property {Boolean} config.debounceMSTimeForScroll - = 150; The time between scroll events in milliseconds.
   * @property {String} CHANNEL_NAME - = 'CHANNEL_WINDOW';
   *
   *
   */
  constructor(CHANNEL_NAME = 'CHANNEL_WINDOW') {
    super(CHANNEL_NAME)
    this.bindStaticMethods()
    this.currentScrollY = 0
  }

  initializeStream() {
    this.domChannelConfig = SpyneAppProperties.config.channels.WINDOW
    const obs$Arr = this.getActiveObservables()
    const dom$ = merge(...obs$Arr)
    this.dom$ = dom$
    dom$.subscribe(p => {
      const { action, payload, srcElement, event } = p
      this.sendChannelPayload(action, payload, srcElement, event)
    })
  }

  static getMouseWheelMapFn(event) {
    const action = this.channelActions.CHANNEL_WINDOW_WHEEL_EVENT
    const scrollDir = event.deltaY <= 0 ? 'up' : 'down'
    const { deltaX, deltaY, deltaZ } = event
    const payload = { scrollDir, deltaX, deltaY, deltaZ }
    const srcElement = event.srcElement
    return { action, payload, srcElement, event }
  }

  static createCurriedGenericEvent(actionStr) {
    const action = `CHANNEL_WINDOW_${actionStr.toUpperCase()}_EVENT`
    const curryFn = curry(SpyneChannelWindow.mapGenericEvent)
    return curryFn(action)
  }

  static mapGenericEvent(actn, event) {
    // console.log("map generic event ",actn);
    const action = actn
    const payload = event
    const srcElement = event.srcElement
    return { action, payload, srcElement, event }
  }

  static getResizeMapFn(event) {
    const action = this.channelActions.CHANNEL_WINDOW_RESIZE_EVENT
    const payload = pick(
      ['innerWidth', 'innerHeight', 'outerWidth', 'outerHeight'], window)
    const srcElement = event.srcElement
    return { action, payload, srcElement, event }
  }

  static getOrientationMapFn(event) {
    const action = this.channelActions.CHANNEL_WINDOW_ORIENTATION_EVENT
    const orientationStr = '(orientation: portrait)'
    const isPortraitBool = window.matchMedia(orientationStr).matches
    const payload = pick(
      ['innerWidth', 'innerHeight', 'outerWidth', 'outerHeight'], window)
    payload.orientation = isPortraitBool === true
      ? 'portrait'
      : 'landscape'
    const srcElement = event.srcElement
    return { action, payload, srcElement, event }
  }

  getMediaQueryMapFn(event) {
    const action = this.channelActions.CHANNEL_WINDOW_MEDIA_QUERY_EVENT
    const payload = pick(['matches', 'media', 'mediaQueryName'], event)
    const srcElement = event.srcElement
    return { action, payload, srcElement, event }
  }

  createMouseWheelObservable(config) {
    const debounceT = config.debounceMSTimeForScroll

    return SpyneUtilsChannelWindow.createDomObservableFromEvent('wheel',
      SpyneChannelWindow.getMouseWheelMapFn.bind(this))
      .pipe(
        debounceTime(debounceT)
      )
  }

  static getScrollData() {
    let currentScrollY = 0

    const getScrollData = (scrollY) => {
      const scrollDistance = currentScrollY - scrollY
      const scrollDir = scrollDistance >= 0 ? 'up' : 'down'
      currentScrollY = scrollY
      return { scrollY, scrollDistance, scrollDir }
    }
    return getScrollData
  }

  static getScrollY(scrollElement) {
    return scrollElement.pageYOffset !== undefined ? scrollElement.pageYOffset : scrollElement.scrollTop
  }

  static getScrollMapFn(event, interval, action, scrollDataFn, scrollElement) {
    const scrollY = SpyneChannelWindow.getScrollY(scrollElement)
    const payload = scrollDataFn(scrollY)
    const { scrollDistance } = payload
    const srcElement = event.srcElement
    return { action, payload, srcElement, scrollDistance, event }
  }

  createScrollObservable(config, scrollElement = window, isPassive = true) {
    const skipWhenDirIsMissing = evt => evt.scrollDistance === 0
    const dTime = config.debounceMSTimeForScroll

    const element = scrollElement

    const isWindow = scrollElement === window

    const scrollElForVals = config.scrollElForVals !== undefined ? config.scrollElForVals : scrollElement
    const action = isWindow ? 'CHANNEL_WINDOW_SCROLL_EVENT' : 'CHANNEL_WINDOW_ELEMENT_SCROLL_EVENT'

    const scrollDataFn = SpyneChannelWindow.getScrollData()
    // console.log("SCROLL ELEMENT ",action,scrollElement, scrollElForVals);
    const scrollMapFn = partialRight(SpyneChannelWindow.getScrollMapFn, [action, scrollDataFn, scrollElForVals, isPassive, element]).bind(this)

    // console.log("createScrollObservable ", {scrollMapFn, scrollDataFn, action, config, scrollElement, element})

    return SpyneUtilsChannelWindow.createDomObservableFromEvent('scroll',
      scrollMapFn, isPassive, element)
      .pipe(
        debounceTime(dTime),
        skipWhile(skipWhenDirIsMissing),
        map(p => {
          const newScrollY = SpyneChannelWindow.getScrollY(element)
          p.payload.scrollDistanceAbs = Math.abs(this.currentScrollY - newScrollY)
          this.currentScrollY = newScrollY
          return p
        })
      )
  }

  createOrientationObservable(config) {
    // console.log("add orientation");orientationchange
    return SpyneUtilsChannelWindow.createDomObservableFromEvent('orientationchange',
      SpyneChannelWindow.getOrientationMapFn.bind(this))
  }

  createResizeObservable(config) {
    const dTime = config.debounceMSTimeForResize
    // console.log('resize this ', this);

    return SpyneUtilsChannelWindow.createDomObservableFromEvent('resize',
      SpyneChannelWindow.getResizeMapFn.bind(this)).pipe(debounceTime(dTime))
  }

  getEventsFromConfig(config = this.domChannelConfig) {
    const obs$Arr = config.events

    const customEntries = Array.isArray(config.customEvents)
      ? config.customEvents.map(SpyneChannelWindow.conformCustomEventConfig).filter(entry => entry !== null)
      : []

    customEntries.forEach(entry => this.updateChannelActions(entry.name))

    const addWindowEventToArr = str => {
      const mapFn = SpyneChannelWindow.createCurriedGenericEvent(str)
      return SpyneUtilsChannelWindow.createDomObservableFromEvent(str, mapFn)
    }

    const addCustomEventToArr = ({ name, operator, value }) => {
      const obs$ = addWindowEventToArr(name)
      return operator === undefined ? obs$ : SpyneChannelWindow.customizeCustomEventObservable(obs$, operator, value)
    }

    return rMap(addWindowEventToArr, obs$Arr).concat(rMap(addCustomEventToArr, customEntries))
  }

  /**
   * Normalizes a config.customEvents entry — an event name string or a
   * {name, <operator>} object — to {name, operator, value}. Complexity is
   * capped at one level: a single operator key (buffer, count, debounce or
   * throttle); when several are set the first in that order wins.
   */
  static conformCustomEventConfig(entry) {
    if (typeof entry === 'string') {
      return { name: entry, operator: undefined, value: undefined }
    }

    if (entry !== null && typeof entry === 'object' && typeof entry.name === 'string') {
      const operatorKeys = ['buffer', 'count', 'debounce', 'throttle']
      const setKeys = operatorKeys.filter(key => entry[key] !== undefined)
      const operator = setKeys[0]

      if (setKeys.length > 1 && SpyneAppProperties.debug === true) {
        console.warn(`Spyne Warning: the customEvent, ${entry.name}, sets multiple operators (${setKeys.join(', ')}); using ${operator}.`)
      }

      return { name: entry.name, operator, value: operator !== undefined ? entry[operator] : undefined }
    }

    console.warn(`Spyne Warning: the following config.customEvents entry is not a string or a {name} object and was skipped: ${JSON.stringify(entry)}`)
    return null
  }

  /**
   * Applies the entry's rate/batch operator to the conformed CustomEvent
   * observable. buffer and count emit ONE batched payload (payload.detail is
   * the array of each event's detail); debounce and throttle pass single
   * conformed events through untouched.
   */
  static customizeCustomEventObservable(obs$, operator, value) {
    switch (operator) {
      case 'buffer':
        // quiet-gap batching: the batch closes after `value` ms without a new event
        return obs$.pipe(
          buffer(obs$.pipe(debounceTime(value))),
          filter(pArr => pArr.length > 0),
          map(SpyneChannelWindow.mapBatchedEvents)
        )
      case 'count':
        // fixed-size batching: a partial batch is held until it fills
        return obs$.pipe(
          bufferCount(value),
          map(SpyneChannelWindow.mapBatchedEvents)
        )
      case 'debounce':
        return obs$.pipe(debounceTime(value))
      case 'throttle':
        return obs$.pipe(throttleTime(value))
      default:
        return obs$
    }
  }

  static mapBatchedEvents(pArr) {
    const last = pArr[pArr.length - 1]
    const { action, srcElement, event } = last
    const detail = pArr.map(p => p.event !== undefined && p.event !== null ? p.event.detail : undefined)
    const payload = { detail, isBatch: true, batchCount: pArr.length }
    return { action, payload, srcElement, event }
  }

  getActiveObservables(config = this.domChannelConfig) {
    let obs$Arr = []

    // CHECK TO ADD MEDIA QUERY OBSERVABLE
    // ==========================================
    config.listenForMediaQueries = checkIfObjIsNotEmptyOrNil(
      config.mediaQueries) || checkIfObjIsNotEmptyOrNil(
      config.mediaQueries)

    // =========================================

    const methods = {
      listenForResize: this.createResizeObservable.bind(this),
      listenForOrientation: this.createOrientationObservable.bind(this),
      listenForScroll: this.createScrollObservable.bind(this),
      listenForWheel: this.createMouseWheelObservable.bind(this)
    }

    const addObservableToArr = (method, key, i) => {
      const addObsBool = config[key]
      if (addObsBool) {
        obs$Arr.push(method(config))
      }
    }

    mapObjIndexed(addObservableToArr, methods)

    // 'listenForMediaQueries' : this.getMediaQueryObservable.bind(this)
    this.checkForMediaQueries(config.listenForMediaQueries)

    const eventsArr = this.getEventsFromConfig(config)
    obs$Arr = obs$Arr.concat(eventsArr)

    return obs$Arr
  }

  checkForMediaQueries(bool) {
    const sendMQStream = p => {
      const { action, payload, srcElement, event } = p
      this.sendChannelPayload(action, payload, srcElement, event,
        this.observer$)
    }

    if (bool === true) {
      this.getMediaQueryObservable(this.domChannelConfig)
        .subscribe(sendMQStream)
    }
  }

  getMediaQueryObservable(config) {
    const arr = this.createMergedObsFromObj(config)
    // console.log("ARR IS ",{arr});
    const obs$ = apply(merge, arr)
    return obs$.pipe(map(this.getMediaQueryMapFn.bind(this)))
  }

  updateChannelActions(str) {
    if (typeof str !== 'string') {
      return
    }
    function getWindowAction() {
      return `CHANNEL_WINDOW_${str.toUpperCase()}_EVENT`
    }
    const windowAction = getWindowAction()
    customActionsArr.push(windowAction)
  }

  addRegisteredActions() {
    const mainActions = [
      'CHANNEL_WINDOW_ABORT_EVENT',
      'CHANNEL_WINDOW_AFTERPRINT_EVENT',
      'CHANNEL_WINDOW_ANIMATIONEND_EVENT',
      'CHANNEL_WINDOW_ANIMATIONITERATION_EVENT',
      'CHANNEL_WINDOW_ANIMATIONSTART_EVENT',
      'CHANNEL_WINDOW_APPINSTALLED_EVENT',
      'CHANNEL_WINDOW_BEFOREPRINT_EVENT',
      'CHANNEL_WINDOW_BEFOREUNLOAD_EVENT',
      'CHANNEL_WINDOW_BEGINEVENT_EVENT',
      'CHANNEL_WINDOW_BLUR_EVENT',
      'CHANNEL_WINDOW_CACHED_EVENT',
      'CHANNEL_WINDOW_CHANGE_EVENT',
      'CHANNEL_WINDOW_CLICK_EVENT',
      'CHANNEL_WINDOW_CLOSE_EVENT',
      'CHANNEL_WINDOW_COMPOSITIONEND_EVENT',
      'CHANNEL_WINDOW_COMPOSITIONSTART_EVENT',
      'CHANNEL_WINDOW_COMPOSITIONUPDATE_EVENT',
      'CHANNEL_WINDOW_COPY_EVENT',
      'CHANNEL_WINDOW_CUT_EVENT',
      'CHANNEL_WINDOW_DBLCLICK_EVENT',
      'CHANNEL_WINDOW_DEVICECHANGE_EVENT',
      'CHANNEL_WINDOW_DEVICELIGHT_EVENT',
      'CHANNEL_WINDOW_DEVICEMOTION_EVENT',
      'CHANNEL_WINDOW_DEVICEORIENTATION_EVENT',
      'CHANNEL_WINDOW_DEVICEPROXIMITY_EVENT',
      'CHANNEL_WINDOW_DOMATTRIBUTENAMECHANGED_EVENT',
      'CHANNEL_WINDOW_DOMATTRMODIFIED_EVENT',
      'CHANNEL_WINDOW_DOMCHARACTERDATAMODIFIED_EVENT',
      'CHANNEL_WINDOW_DOMCONTENTLOADED_EVENT',
      'CHANNEL_WINDOW_DOMCONTENTLOADED_EVENT',
      'CHANNEL_WINDOW_DOMELEMENTNAMECHANGED_EVENT',
      'CHANNEL_WINDOW_DRAGEND_EVENT',
      'CHANNEL_WINDOW_DRAGENTER_EVENT',
      'CHANNEL_WINDOW_DRAGLEAVE_EVENT',
      'CHANNEL_WINDOW_DRAGOVER_EVENT',
      'CHANNEL_WINDOW_DRAGSTART_EVENT',
      'CHANNEL_WINDOW_DRAG_EVENT',
      'CHANNEL_WINDOW_DROP_EVENT',
      'CHANNEL_WINDOW_ELEMENT_SCROLL_EVENT',
      'CHANNEL_WINDOW_ERROR_EVENT',
      'CHANNEL_WINDOW_FOCUSIN_EVENT',
      'CHANNEL_WINDOW_FOCUS_EVENT',
      'CHANNEL_WINDOW_FULLSCREENCHANGE_EVENT',
      'CHANNEL_WINDOW_FULLSCREENERROR_EVENT',
      'CHANNEL_WINDOW_HASHCHANGE_EVENT',
      'CHANNEL_WINDOW_INPUT_EVENT',
      'CHANNEL_WINDOW_INVALID_EVENT',
      'CHANNEL_WINDOW_KEYDOWN_EVENT',
      'CHANNEL_WINDOW_KEYPRESS_EVENT',
      'CHANNEL_WINDOW_KEYUP_EVENT',
      'CHANNEL_WINDOW_LOAD_EVENT',
      'CHANNEL_WINDOW_MEDIA_QUERY_EVENT',
      'CHANNEL_WINDOW_MESSAGE_EVENT',
      'CHANNEL_WINDOW_MOUSEDOWN_EVENT',
      'CHANNEL_WINDOW_MOUSEENTER_EVENT',
      'CHANNEL_WINDOW_MOUSELEAVE_EVENT',
      'CHANNEL_WINDOW_MOUSEMOVE_EVENT',
      'CHANNEL_WINDOW_MOUSEOUT_EVENT',
      'CHANNEL_WINDOW_MOUSEOVER_EVENT',
      'CHANNEL_WINDOW_MOUSEUP_EVENT',
      'CHANNEL_WINDOW_MOUSEWHEEL_EVENT',
      'CHANNEL_WINDOW_OFFLINE_EVENT',
      'CHANNEL_WINDOW_ONLINE_EVENT',
      'CHANNEL_WINDOW_OPEN_EVENT',
      'CHANNEL_WINDOW_ORIENTATION_EVENT',
      'CHANNEL_WINDOW_PAGEHIDE_EVENT',
      'CHANNEL_WINDOW_PAGESHOW_EVENT',
      'CHANNEL_WINDOW_PASTE_EVENT',
      'CHANNEL_WINDOW_POPSTATE_EVENT',
      'CHANNEL_WINDOW_POPSTATE_EVENT',
      'CHANNEL_WINDOW_PROGRESSEVENTS_EVENT',
      'CHANNEL_WINDOW_RESET_EVENT',
      'CHANNEL_WINDOW_RESIZE_EVENT',
      'CHANNEL_WINDOW_SCROLL_ELEMENT_ADDED_EVENT',
      'CHANNEL_WINDOW_SCROLL_EVENT',
      'CHANNEL_WINDOW_SCROLL_LOCK_EVENT',
      ['CHANNEL_WINDOW_SCROLL_LOCK_EVENT', 'onScrollLockEvent'],
      ['CHANNEL_WINDOW_SET_ELEMENT_TO_SCROLL_EVENT', 'onSetElementToScroll'],
      'CHANNEL_WINDOW_STORAGE_EVENT',
      'CHANNEL_WINDOW_SUBMIT_EVENT',
      'CHANNEL_WINDOW_TRANSITIONCANCEL_EVENT',
      'CHANNEL_WINDOW_TRANSITIONEND_EVENT',
      'CHANNEL_WINDOW_TRANSITIONRUN_EVENT',
      'CHANNEL_WINDOW_TRANSITIONSTART_EVENT',
      'CHANNEL_WINDOW_UNLOAD_EVENT',
      'CHANNEL_WINDOW_WHEEL_EVENT'
    ]

    return mainActions.concat(customActionsArr)
  }

  onScrollLockEvent(e) {
    // DEPRECATED -- MOVED TO spyne-plugin-scroll-lock;
  }

  onSetElementToScroll(e) {
    let { config, el, scrollElement } = e.payload
    config = config || {}
    config = deepMerge(this.domChannelConfig, config)

    scrollElement = scrollElement || el

    const action = 'CHANNEL_WINDOW_SCROLL_ELEMENT_ADDED_EVENT'
    this.sendChannelPayload(action, { el }, el)

    this.createScrollObservable(config, scrollElement)
      .subscribe(p => {
        const { action, payload, srcElement, event } = p
        this.sendChannelPayload(action, payload, srcElement, event)
      })
  }

  bindStaticMethods() {
    this.createMediaQueryHandler = SpyneUtilsChannelWindow.createMediaQueryHandler.bind(
      this)
    this.createMergedObsFromObj = SpyneUtilsChannelWindow.createMergedObsFromObj.bind(
      this)
  }
}
