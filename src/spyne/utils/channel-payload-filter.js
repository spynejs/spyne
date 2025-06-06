import {
  is,
  reject,
  isNil,
  find,
  allPass,
  forEachObjIndexed,
  not,
  isEmpty,
  always,
  compose,
  equals,
  prop,
  where,
  defaultTo,
  mergeAll,
  F,
  omit,
  flatten,
  any,
  curry,
  lte
  , map as rMap
} from 'ramda'

import { SpyneAppProperties } from './spyne-app-properties.js'

const isNotArr = compose(not, is(Array))
const isNotEmpty = compose(not, isEmpty)
const isNonEmptyStr = allPass([is(String), isNotEmpty])
const isNonEmptyArr = allPass([is(Array), isNotEmpty])
const isObjectFn = compose(allPass([isNotArr, is(Object)]))
const isNonEmptyObjectFn = compose(allPass([isNotEmpty, isNotArr, is(Object)]))

const isString  = (val) => is(String, val)
const isBoolean = (val) => is(Boolean, val)
const isNumber  = (val) => is(Number, val)
const isArrayFn = (val) => is(Array, val)

export class ChannelPayloadFilter {
  /**
   * @module ChannelPayloadFilter
   * @type util
   *
   *
   * @desc
   * <p>This utility filters ChannelPayload objects by using query selectors and/or by comparing data properties</p>
   * <h3>The ChannelPayloadFilter features</h3>
   * <ul>
   *   <li>Can be used by Channels and ViewStreams</li>
   *   <li>ChannelPayloadFilter instances can be used as the third parameter when binding actions to ViewStream methods.</li>
   *   <li>Selectors can be a query string, an array of selector strings, or the selector can be an actual dom element.</li>
   *   <li>Selectors are not required and can be disregarded by adding "" or undefined as the selector property.</li>
   *   <li>The data object compares the values from the props() method of a ChannelPayload object</li>
   *   <li>Internally, The data object is conformed to a spec object for ramda&rsquo;s EXT['where', '//ramdajs.com/docs/#where'] method</li>
   *   </ul>
   *
   * @constructor
   * @property {String|Array|HTMLElement} selector The matching element
   * @param {Object} filters Object that contains the selector, props, and debugLabel params.
   * @property {Object} propFilters A json object containing filtering methods for channel props variables.
   *
   * @property {String|Array|HTMLElement} selector - = ''; The matching element.
   * @property {Object} propFilters - = {}; A json object containing comprators for any expected property values.
   * @returns Boolean
   *
   *
   * @example
   * TITLE['<h4>Filtering using Selectors and a Property Comparator Within a ViewStream Instance</h4>']
   *    const mySelectors = ['ul', 'li:first-child'];
   *    const propFilters = {
   *      linkType: "external"
   *    };
   *    const myFilter = new ChannelPayloadFilter(mySelectors, propFilters);
   *
   *    addActionListeners() {
   *      return [
   *                ['CHANNEL_UI_CLICK_EVENT', 'onClickEvent', myFilter]
   *             ]
   *          }
   *
   * @example
   * TITLE['<h4>Filtering Using Method and String Comparators Within a ViewStream Instance</h4>']
   *    const propFilters = {
   *      type: "scrolling-element",
   *      scrollNum:  (n)=>n>=1200 && n<=5000;
   *    };
   *    const myFilter = new ChannelPayloadFilter('', propFilters);
   *
   *    addActionListeners() {
   *      return [
   *                ['CHANNEL_UI_CLICK_EVENT', 'onClickEvent', myFilter]
   *             ]
   *          }
   *
   *
   * @example
   * TITLE['<h4>A Simple Property Filtering Example Within a Channel Instance</h4>']
   * // Filter for a button with a data type of 'link'
   * const myFilter = new ChannelPayloadFilter('' {type: "link"});
   *
   * this.getChannel("CHANNEL_UI")
   * .pipe(filter(myFilter))
   * .subscribe(myChannelMethod);
   *
   */
  constructor(selector, filters = {}, debugLabel, testMode) {
    const selectorIsObj = isObjectFn(selector)

    if (selectorIsObj) {
      filters = selector
      selector = prop('selector', filters)
      testMode = testMode || prop('testMode', filters)
    }

    const debugLabelArr = [debugLabel, prop('debugLabel', filters)]

    debugLabel = compose(find(is(String)))(debugLabelArr)

    let props = omit(['debugLabel', 'label', 'selector', 'props', 'testMode', 'propFilters'], filters)
    if (filters.props !== undefined) {
      props = mergeAll([filters.props, props])
    } else if (filters.propFilters !== undefined) {
      props = mergeAll([filters.propFilters, props])
    }

    filters.propFilters = props

    const { propFilters } = filters

    const addStringSelectorFilter =  isNonEmptyStr(selector) ? ChannelPayloadFilter.filterSelector([selector], debugLabel) : undefined
    const addArraySelectorFilter =   isNonEmptyArr(selector) ? ChannelPayloadFilter.filterSelector(selector, debugLabel) : undefined
    const addDataFilter = isNonEmptyObjectFn(propFilters) ? ChannelPayloadFilter.filterData(propFilters, debugLabel) : undefined

    let filtersArr = reject(isNil, [addStringSelectorFilter, addArraySelectorFilter, addDataFilter])

    // IF ARRAY IS EMPTY ALWAYS RETURN FALSE;

    const filtersAreEmpty = isEmpty(filtersArr)

    if (filtersAreEmpty) {
      filtersArr = [always(false)]
      if (SpyneAppProperties.debug === true && testMode !== true) {
        console.warn(`Spyne Warning: The Channel Filter, with selector: ${selector}, and propFilters:${propFilters} appears to be empty!`)
      }
    }
    if (testMode === true) {
      return { selector, propFilters, debugLabel, filters, testMode, filtersAreEmpty }
    }

    return allPass(filtersArr)
  }

  static filterData(filterJson, filterdebugLabel) {
    const debugLabel = filterdebugLabel

    const compareData = () => {
      // DO NOT ALLOW AN EMPTY OBJECT TO RETURN TRUEs
      if (isEmpty(filterJson)) {
        return always(false)
      }

      //  CHECKS ALL VALUES IN JSON TO DETERMINE IF THERE ARE FILTERING METHODS

      const createCurryComparator = compareStr => (str) => {
        return str === compareStr
      }
      const checkToConvertToFn = (val, key, obj) => {
        let fnVal = F
        if (isString(val) || isBoolean(val) || isNumber(val)) {
          fnVal = createCurryComparator(val)
        } else if (typeof val === 'function') {
          return val
        } else if (isArrayFn(val) || isObjectFn(val)) {
          console.warn(
              `ChannelPayloadFilter: Property "${val}" is an array/object, which is not allowed. ` +
              'This property will always return false.'
          )
          return fnVal
        }
        return fnVal
      }
      filterJson = rMap(checkToConvertToFn, filterJson)

      // TAP LOGGER
      const tapLogger = (comparedObj) => {
        if (debugLabel === undefined) {
          return comparedObj
        }
        const propsBooleans = {}
        const mapBools = (value, key) => {
          propsBooleans[key] = value(prop(key, comparedObj))
        }
        forEachObjIndexed(mapBools, filterJson)
        console.log(`%c CHANNEL PAYLOAD FILTER DEBUGGER ["${debugLabel}"] - values:    `, 'color:orange;', { propsBooleans, comparedObj })

        return comparedObj
      }

      // END TAP LOGGER
      const fMethod = where(filterJson)

      const getFilteringObj =  (v) => {
        const { payload, srcElement, event } = v || {}
        const o = Object.assign({}, v, srcElement, event, payload)
        // console.log('o is ',o);
        return o
      }

      return compose(fMethod, tapLogger, defaultTo({}), getFilteringObj)
    }

    return compareData()
  }

  static checkPayloadSelector(arr, debugLabel, srcPayload) {
    // ELEMENT FROM PAYLOADs
    const { payload, srcElement, event } = srcPayload || {}

    const reduceFindEl = (acc, src) => {
      const el = prop('el', src)
      if (ChannelPayloadFilter.elIsDomElement(el) && acc === undefined) {
        acc = el
      }
      return acc
    }

    const el = [srcElement, payload, prop('srcElement', event), srcPayload].reduce(reduceFindEl, undefined)

    // RETURN BOOLEAN MATCH WITH PAYLOAD EL
    const compareEls = (elCompare) => elCompare.isEqualNode((el))

    // LOOP THROUGH NODES IN querySelectorAll()
    const mapNodeArrWithEl = (sel) => {
      // convert nodelist to array of els
      const nodeArr = flatten(document.querySelectorAll(sel))
      // els array to boolean array
      return rMap(compareEls, nodeArr)
    }

    if (debugLabel !== undefined) {
      const nodeArrResultsDebugger = compose(flatten, rMap(mapNodeArrWithEl))(arr)
      const selectorsArr = arr
      console.log(`%c CHANNEL PAYLOAD FILTER DEBUGGER ["${debugLabel}"] - selectors: `, 'color:orange;', { el, selectorsArr, nodeArrResultsDebugger })
    }

    // CHECK IF PAYLOAD EL EXISTS
    if (typeof (el) !== 'object') {
      return false
    }

    // LOOP THROUGH ALL SELECTORS IN MAIN ARRAY
    const nodeArrResult = compose(flatten, rMap(mapNodeArrWithEl))(arr)
    if (isEmpty(nodeArrResult) === true) {
      return false
    }

    return any(equals(true), nodeArrResult)
  }

  static elIsDomElement(o) {
    if (is(String, o)) {
      o = document.querySelector(o)
    }

    return compose(lte(0), defaultTo(-1), prop('nodeType'))(o)
  }

  static filterSelector(selectorArr, debugLabel) {
    const arr = reject(isEmpty, selectorArr)
    const payloadCheck = curry(ChannelPayloadFilter.checkPayloadSelector)
    return payloadCheck(arr, debugLabel)
  }
}
