import { Channel } from './channel'
import { checkIfObjIsNotEmptyOrNil } from '../utils/frp-tools'
import { SpyneAppProperties } from '../utils/spyne-app-properties'
import { SpyneUtilsChannelWindow } from '../utils/spyne-utils-channel-window'
import { merge } from 'rxjs'
import { map, debounceTime, skipWhile } from 'rxjs/operators'
import { curry, pick, partialRight, mapObjIndexed, apply, map as rMap } from 'ramda'
import { deepMerge } from '../utils/deep-merge'

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

    const addWindowEventToArr = str => {
      const mapFn = SpyneChannelWindow.createCurriedGenericEvent(str)
      return SpyneUtilsChannelWindow.createDomObservableFromEvent(str, mapFn)
    }

    return rMap(addWindowEventToArr, obs$Arr)
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

  addRegisteredActions() {
    return [
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
