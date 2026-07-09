import {
  mergeAll,
  clone,
  fromPairs,
  toPairs,
  compose,
  includes,
  pickAll,
  lte,
  defaultTo,
  prop,
  is
} from 'ramda'
import { SpyneAppProperties } from '../utils/spyne-app-properties.js'
import { safeClone, safeCloneDeep } from '../utils/safe-clone.js'

// read-only facades for cms-proxied payload subtrees, cached per proxy so
// repeated dispatches of the same canonical data reuse a single wrapper
const _readOnlyFacadeCache = new WeakMap()

export class ChannelPayload {
  /**
   *
   * All Channel data is published using this interface.
   * @module ChannelPayload
   * @type internal
   *
   * @constructor
   * @param {String} channelName
   * @param {String} action
   * @param {Object} payload
   * @param {Element} srcElement
   * @param {Event} event
   *
   * @property {String} channelName - = undefined; The name of the Channel that is sending the payload.
   * @property {String} action - = undefined; An action string that has been registered within the Channel's addRegisteredActions method.
   * @property {Object} payload - = undefined; The data object.
   * @property {HTMLElement} srcElement - = {}; This is populated when triggered from a ViewStream instance.
   * @property {UIEvent} event - = undefined; The UIEvent, if any.
   * @returns Validated ChannelPayload json object
   */
  constructor(channelName, action, payload, srcElement, event, timeLabel) {
    const channel = channelName
    // payload = ChannelPayload.deepFreeze(payload);

    if (timeLabel) {
      console.time(timeLabel)
    }

    const channelPayloadItemObj = { channelName, action, srcElement, event }
    // Object.defineProperty(channelPayloadItemObj, 'payload', {get: () => clone(payload)});
    channelPayloadItemObj.payload = ChannelPayload.deepFreeze(payload)
    /**
     * This is a convenience method that helps with destructuring by merging all properties.
     *
     * @returns
     * JSON Object
     *
     * @example
     * TITLE['<h4>Destructuring Properties using the ChannelPayload props Method</h4>']
     * let {el, action, myVal} = payload.props();
     *
     *
     */

    if (SpyneAppProperties.debug === true) {
      if (Object.prototype.hasOwnProperty.call(payload, 'payload')) {
        const payloadStr = JSON.stringify(payload)
        console.warn(`Spyne Warning: the following payload contains a nested payload property which may create conflicts: Action: ${action}, ${payloadStr}`)
      }

      const channelActionsArr = SpyneAppProperties.getChannelActions(channel)

      ChannelPayload.validateAction(action, channel, channelActionsArr)
    }

    channelPayloadItemObj.clone = () => {
      return mergeAll([
        { payload:safeClone(channelPayloadItemObj.payload) },
        channelPayloadItemObj.payload,
        { channel: clone(channel) },
        { event: clone(event) },
        { srcElement },
        clone(channelPayloadItemObj.srcElement), { action: clone(channelPayloadItemObj.action) }
      ])
    }

    /**
     * Proxy-preserving version of clone. Returns the same merged shape, but
     * the payload is copied with safeCloneDeep, so any CMS proxy objects —
     * at the root or nested inside plain containers or arrays — are revived
     * as writable proxy copies instead of being stripped by a structural
     * clone. Use this when a handler treats the payload as its data source.
     *
     * @returns
     * JSON Object
     *
     * @example
     * TITLE['<h4>Retrieving Proxied Payload Data</h4>']
     * onStoryEvent(e){
     *    const data = e.safeClone();
     *    this.addStoryArticle(data);
     * }
     *
     */
    channelPayloadItemObj.safeClone = () => {
      const revivedPayload = safeCloneDeep(channelPayloadItemObj.payload)
      return mergeAll([
        { payload: revivedPayload },
        revivedPayload,
        { channel },
        { event },
        { srcElement },
        channelPayloadItemObj.srcElement,
        { action: channelPayloadItemObj.action }
      ])
    }

    const channelPayloadItemObjProps = {
      $dir: {
        get: () => channelPayloadItemObj._dir,
        set: (val) => {
          channelPayloadItemObj._dir = val
          return val
        }
      }
    }

    if (channel === 'CHANNEL_ROUTE') {
      // channelPayloadItemObj['location'] = ChannelPayload.getLocationData();
      channelPayloadItemObjProps.location = {
        get: () => ChannelPayload.getLocationData()
      }
      /* channelPayloadItemObjProps['routeData'] = {
        get: ()=>prop('routeData', frozenPayload)
      }
*/
    }

    channelPayloadItemObj._dir = undefined

    Object.defineProperties(channelPayloadItemObj, channelPayloadItemObjProps)

    if (timeLabel) {
      console.timeEnd(timeLabel)
    }
    return channelPayloadItemObj
  }

  static validateAction(action, channel, arr) {
    const isInArr = includes(action, arr)
    if (isInArr === false && SpyneAppProperties.initialized === true) {
      console.warn(`warning: Action: '${action}' is not registered within the ${channel} channel!`)
    }
    return isInArr
  }

  static getLocationData() {
    const locationParamsArr = [
      'href',
      'origin',
      'protocol',
      'host',
      'hostname',
      'port',
      'pathname',
      'search',
      'hash']
    return pickAll(locationParamsArr, window.location)
  }

  static getStreamItem() {

  }

  static deepClone(o) {
    const isArr = is(Array)
    const isObj = is(Object)
    const isIter = ob => isArr(ob) === false && isObj(ob) === true
    const isIterable = isIter(o)
    return isIterable ? compose(fromPairs, toPairs, clone)(o) : clone(o)
  }

  /**
   * Wraps a CMS-proxied payload subtree in a read-only facade. Payloads are
   * reference-by-wire (every subscriber shares the same object), and freezing
   * a proxy would freeze the CANONICAL cms target for the whole app — so
   * instead the payload boundary gets a lightweight second proxy that blocks
   * writes while reads (and nested reads) pass through. Consumers that need
   * a writable copy call e.safeClone(). Facades are cached per proxy so
   * repeated dispatches of the same data reuse one wrapper.
   */
  static createReadOnlyProxyFacade(proxyObj) {
    if (_readOnlyFacadeCache.has(proxyObj)) {
      return _readOnlyFacadeCache.get(proxyObj)
    }

    const warnBlockedWrite = (propName) => {
      if (SpyneAppProperties.debug === true) {
        console.warn(`Spyne Warning: blocked write of '${String(propName)}' on read-only channel payload data; use e.safeClone() for a writable copy`)
      }
      return true // silent no-op; returning false would throw in strict mode
    }

    const facade = new Proxy(proxyObj, {
      get(target, propName) {
        const val = target[propName]
        // nested cms containers are proxies themselves — wrap them so deep
        // writes are blocked too (cached, so repeat reads reuse the facade)
        if (val !== null && typeof val === 'object' && val.__proxy__isProxy === true) {
          return ChannelPayload.createReadOnlyProxyFacade(val)
        }
        return val
      },
      set(target, propName) {
        return warnBlockedWrite(propName)
      },
      defineProperty(target, propName) {
        return warnBlockedWrite(propName)
      },
      deleteProperty(target, propName) {
        return warnBlockedWrite(propName)
      }
    })

    _readOnlyFacadeCache.set(proxyObj, facade)
    return facade
  }

  static deepFreeze(o) {
    // return o;
    // return Object.freeze(o);
    const elIsDomElement = compose(lte(0), defaultTo(-1), prop('nodeType'))

    // CMS proxy subtrees are NOT frozen (that would freeze the canonical cms
    // target app-wide) — they are wrapped in a read-only facade instead, so
    // the payload immutability contract holds without copies
    if (o !== null && typeof o === 'object' && o.__proxy__isProxy === true) {
      return ChannelPayload.createReadOnlyProxyFacade(o)
    }

    try {
      // children first: proxy subtrees must be swapped for their facades
      // BEFORE the parent is frozen, or the assignment would be rejected
      Object.getOwnPropertyNames(o).forEach(function(prop) {
        const val = o[prop]
        if (Object.prototype.hasOwnProperty.call(o, prop) &&
            elIsDomElement(val) === false &&
            val !== null &&
            (typeof val === 'object' || typeof val === 'function') &&
            !Object.isFrozen(val)) {
          const processed = ChannelPayload.deepFreeze(val)
          if (processed !== val) {
            o[prop] = processed
          }
        }
      })
      Object.freeze(o)
    } catch (e) {
      // console.log("FREEZE ERR ",{o,e});
      return o
    }

    return o
  }

  static getMouseEventKeys() {
    return ['altKey', 'bubbles', 'cancelBubble', 'cancelable', 'clientX', 'clientY', 'composed', 'ctrlKey', 'currentTarget', 'defaultPrevented', 'detail', 'eventPhase', 'fromElement', 'isTrusted', 'layerX', 'layerY', 'metaKey', 'movementX', 'movementY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'path', 'relatedTarget', 'returnValue', 'screenX', 'screenY', 'shiftKey', 'sourceCapabilities', 'srcElement', 'target', 'timeStamp', 'toElement', 'type', 'view', 'which', 'x', 'y']
  }
}
