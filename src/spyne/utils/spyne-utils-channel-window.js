import { fromEventPattern } from 'rxjs'
import { map } from 'rxjs/operators'
import { mapObjIndexed } from 'ramda'

export class SpyneUtilsChannelWindow {
  /**
   * @module SpyneUtilsChannelWindow
   * @type internal
   *
   * @constructor
   * @desc
   * Internal utility methods for SpyneWindowChannel
   *
   *
   */
  constructor() {
    this.createDomObservableFromEvent = SpyneUtilsChannelWindow.createDomObservableFromEvent.bind(
      this)
  }

  static createDomObservableFromEvent(eventName, mapFn, isPassive = true, element = window) {
    const addHandler = handler => element.addEventListener(eventName, handler,
      { passive: isPassive })
    const removeHandler = () => { element[eventName] = (p) => p }
    mapFn = mapFn === undefined ? (p) => p : mapFn
    return fromEventPattern(addHandler, removeHandler).pipe(map(mapFn))
  }

  // MEDIA QUERIES
  static createMediaQuery(str) {
    const mq = window.matchMedia(str)
    this.checkIfValidMediaQuery(mq, str)
    return mq !== false ? mq : false
  }

  static checkIfValidMediaQuery(mq, str) {
    const noSpaces = str => str.replace(/\s+/gm, '')
    const isValidBool = mq.matches !== undefined && noSpaces(mq.media).indexOf(noSpaces(str)) >= 0
    const warnMsg = str => console.warn(`Spyne Info: the following query string, "${str}", has been optimized to "${mq.media}" by the browser and may not be a valid Media Query item!`)
    if (isValidBool === false) {
      warnMsg(str)
    }
    return isValidBool
  }

  static createMediaQueryHandler(query, key) {
    const keyFn = key => p => {
      p.mediaQueryName = key
      return p
    }

    const mapKey = keyFn(key)

    const handlers = (q) => {
      return {
        addHandler: (handler) => { q.addListener(handler) },
        removeHandler: (handler) => { q.onchange = () => {} }
      }
    }
    const mediaQueryHandler = handlers(query)
    /* eslint-disable new-cap */
    return new fromEventPattern(
      mediaQueryHandler.addHandler,
      mediaQueryHandler.removeHandler)
      .pipe(map(mapKey))
  }

  static createMergedObsFromObj(config) {
    const mediaQueriesObj = config.mediaQueries || config.mediaQueries
    const arr = []

    const loopQueries = (val, key, obj) => {
      const mq = SpyneUtilsChannelWindow.createMediaQuery(val)
      if (mq !== false) {
        arr.push(SpyneUtilsChannelWindow.createMediaQueryHandler(mq, key))
      }
      return arr
    }

    mapObjIndexed(loopQueries, mediaQueriesObj)
    return arr
  }
}
