import { isEmpty, head, values, compose, prop, complement, isNil, allPass, reduce, filter, equals, toPairs, replace, either, propEq, __, invert, path, zipObj, reject, keys, find, assoc, is, has, when, split, always, concat, join, flatten, map, ifElse, test, findLastIndex, last, defaultTo, fromPairs } from 'ramda'
import { SpyneAppProperties } from './spyne-app-properties.js'

export class SpyneUtilsChannelRouteUrl {
  constructor() {
    /**
     * @module SpyneUtilsChannelRouteUrl
     * @type internal
     *
     * @constructor
     * @desc
     * Internal url methods for the SpyneRouteChannel
     */
    this.checkIfObjIsNotEmptyOrNil = SpyneUtilsChannelRouteUrl.checkIfObjIsNotEmptyOrNil.bind(this)
  }

  static checkIfObjIsNotEmptyOrNil(obj) {
    const isNotEmpty = compose(complement(isEmpty), head, values)
    const isNotNil = compose(complement(isNil), head, values)
    const isNotNilAndIsNotEmpty = allPass([isNotEmpty, isNotNil])
    return isNotNilAndIsNotEmpty(obj)
  }

  static checkIfParamValueMatchesRegex(paramValue, routeObj) {
    const rejectParamKey = reject(equals('routeName'))
    const keysArr = compose(rejectParamKey, keys)
    const testForRegexMatch = str => test(new RegExp(str), paramValue)
    const checker = compose(find(testForRegexMatch), keysArr)
    const regexMatchStr = checker(routeObj)
    if (is(String, regexMatchStr)) {
      routeObj = assoc(paramValue, prop(regexMatchStr, routeObj), routeObj)
    }
    return routeObj
  }

  static formatStrAsWindowLocation(str) {
    const hash = str
    const search = str
    const pathname = str
    return { hash, search, pathname }
  }

  static getLocationStrByType(t, isHash = false, loc = window.location) {
    const type = isHash === true ? 'hash' : t

    const typeMap = {
      slash: 'pathname',
      query: 'search',
      hash: 'hash'
    }
    const propVal = typeMap[type]
    const str  = prop(propVal, loc)
    const checkForSlashAndHash = /^(\/)?(#)?(\/)?(.*)$/
    // console.log("DATA LOC STR ",{str, loc, prop, type,isHash});
    return str.replace(checkForSlashAndHash, '$4')
  }

  static createRouteArrayFromParams(data, route, t = 'slash', paramsFromLoc) {
    const urlArr = []
    const loopThroughParam = (routeObj) => {
      const urlObj = {}
      const keyword = routeObj.routeName // PARAM FORM SPYNE CONFIG
      let paramValFromData = data[keyword] !== undefined ? data[keyword] : prop(keyword, paramsFromLoc) // PULL VALUE FOR THIS PARAM FROM DATA
      const paramValType = typeof (routeObj[paramValFromData])

      if (paramValType === 'string') {
        paramValFromData = routeObj[paramValFromData]
      } else if (paramValType === 'undefined') {
        routeObj = this.checkIfParamValueMatchesRegex(paramValFromData, routeObj)
      }

      urlObj[keyword] = paramValFromData

      if (this.checkIfObjIsNotEmptyOrNil(urlObj)) {
        urlArr.push(urlObj)
      }

      const isObject = is(Object, routeObj)
      const objectParamExists = has(paramValFromData, routeObj)
      const objectContainsRoute = has('routePath', routeObj)
      const recursivelyCallLoopBool = objectParamExists && isObject
      if (recursivelyCallLoopBool === true) {
        const newObj = routeObj[paramValFromData]
        if (has('routePath', newObj)) {
          loopThroughParam(newObj.routePath)
        }
      } else if (objectContainsRoute === true && paramValFromData !== undefined) {
        loopThroughParam(routeObj.routePath)
      }
    }

    loopThroughParam(route)

    return urlArr
  }

  static createSlashString(arr) {
    const arrClear = reject(isNil)
    const notUndefined = when(complement(isNil, __), join('/'))
    const stripRegex = replace(/^(\^*)(.*|^\$)(\$)$/, '$2')
    const joiner = compose(stripRegex, notUndefined, arrClear, flatten, map(values))
    return joiner(arr)
  }

  static createQueryString(arr) {
    const arrClear = reject(isNil)

    const isNotNilAndIsNotEmpty = this.checkIfObjIsNotEmptyOrNil

    const createPair = compose(
      join('='),
      flatten,
      toPairs)

    const checkPair = ifElse(
      isNotNilAndIsNotEmpty,
      createPair,
      always(undefined)
    )

    const mapArrayOfPairs = map(checkPair)

    const checkIfStrIsEmpty = when(
      complement(isEmpty),
      concat('?'))

    const createQs = compose(
      checkIfStrIsEmpty,
      join('&'),
      arrClear,
      mapArrayOfPairs)

    return createQs(arr)
  }

  static checkPayloadForRegexOverrides(urlsArr, data, parseString = 'Value') {
    // CHECK IF PAYLOAD HAS ANY OVERRIDES
    const getPropValOverride = (key) => prop(`${key}${parseString}`, data)

    // GET ANY POSSIBLE VALUE USING THE CURRENT KEY
    const getOverrideVal = compose(getPropValOverride, head, keys)

    // MAP ALL OBJECT VALS TO TEST FOR OVERRIDES
    const mapUrlProps = (prop) => {
      const overrideVal = getOverrideVal(prop)

      // console.log("override val ",overrideVal, data);
      // if regex value is found
      if (overrideVal !== undefined) {
        return assoc(compose(head, keys)(prop), overrideVal, prop)
      }
      // identity
      return prop
    }

    return map(mapUrlProps, urlsArr)
  }

  static checkForRouteValWithMultipleVals(urlsArr) {
    // Define the internal method to extract the string before the pipe
    const getStringBeforePipe = (input) => {
      const match = input.match(/^[^|]*/)
      return match ? (match[0] === '^$' ? '' : match[0]) : input
    }

    const mapUrlArrObj = (obj) => {
      const pipeReducer = (acc, key) => {
        acc[key] = getStringBeforePipe(obj[key])
        return acc
      }

      if (typeof obj === 'object') {
        obj = Object.keys(obj).reduce(pipeReducer, {})
      }
      return obj
    }

    if (Array.isArray(urlsArr) === true) {
      return urlsArr.map(mapUrlArrObj)
    }

    return urlsArr
  }

  static checkForRouteValsPartMatch(urlsArr, data = {}) {
    /**
     * 1. Loop through urlsArr
     * 2. Loop through properties
     * 3. Apply matchGlobPattern to each property value and check for match with data object property
     * 4. Return the updated object with matched values, or keep the original pattern if no match
     */

    const matchGlobPattern = (str, globPattern) => {
      const globPatternMatch = (pattern, value) => {
        const escapedPattern = pattern
          .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&') // Escape special characters
          .replace(/\*/g, '[\\w\\d_-]*') // * should match any sequence of alphanumeric, underscores, or dashes

        const regexPattern = new RegExp(`^${escapedPattern}$`) // Match the full string
        return regexPattern.test(value)
      }

      // Split the globPattern by pipe (|)
      const patterns = globPattern.split('|')

      // Check if the string matches any of the patterns
      const hasMatch = patterns.some((pattern) => globPatternMatch(pattern, str))

      // Return the string if there's a match, otherwise return the glob pattern
      return hasMatch ? str : globPattern
    }

    // Function to check and replace matching properties
    const replaceMatchingProperty = (obj) => {
      const updatedObj = { ...obj } // Create a copy of the object to avoid mutation

      // Function to check each property and apply matchGlobPattern
      const checkAndReplaceProperty = (key) => {
        if (Object.prototype.hasOwnProperty.call(updatedObj, key) && data[key]) {
          updatedObj[key] = matchGlobPattern(data[key], updatedObj[key])
        }
      }

      // Loop through the properties of the object
      Object.keys(updatedObj).forEach(checkAndReplaceProperty)

      return updatedObj
    }

    // Loop through the array and replace matching properties
    return urlsArr.map(replaceMatchingProperty)
  }

  static convertParamsToRoute(data, r = SpyneAppProperties.config.channels.ROUTE, t, locStr) {
    const urlType = t !== undefined ? t : r.type
    const isHash = r.isHash
    const route = r.routes.routePath
    const locationStr = locStr !== undefined ? locStr : this.getLocationStrByType(urlType, isHash)
    const paramsFromCurrentLocation = this.convertRouteToParams(locationStr, r, urlType).routeData
    let urlArr = this.createRouteArrayFromParams(data, route, urlType, paramsFromCurrentLocation)

    urlArr = SpyneUtilsChannelRouteUrl.checkPayloadForRegexOverrides(urlArr, data)
    urlArr = SpyneUtilsChannelRouteUrl.checkForRouteValWithMultipleVals(urlArr)
    // THIS WILL MATCH EXACTLY THE PROPERTY ID, SO pageId="dashboard_1" will return that instead of globPattern[0]
    // urlArr = SpyneUtilsChannelRouteUrl.checkForRouteValsPartMatch(urlArr, data)
    // console.log('PARAMS TO ROUTE ', { data, r, urlArr, locationStr, paramsFromCurrentLocation })

    // THIS CREATES A QUERY PATH STR
    if (urlType === 'query') {
      return this.createQueryString(urlArr)
    }

    return this.createSlashString(urlArr)
  }

  static findIndexOfMatchedStringOrRegex(mainStr, paramsArr) {
    const is404 = paramsArr.includes('.+')

    const reFn = (s) => {
      if (is404) {
        if (!s.startsWith('^')) {
          s = '^' + s
        }
        if (!s.endsWith('$')) {
          s = s + '$'
        }
      }

      return new RegExp(s)
    }

    const checkForEmpty =  replace(/^$/, '^$')
    const createStrRegexTest = (str) => {
      return {
        str,
        re: reFn(str)
      }
    }

    const checkForEitherStrOrReMatch =  either(
      propEq(mainStr, 'str'), compose(test(__, mainStr), prop('re'))
    )

    const findMatchIndex = compose(findLastIndex(equals(true)), map(checkForEitherStrOrReMatch), map(createStrRegexTest), map(checkForEmpty))

    return findMatchIndex(paramsArr)
  }

  static checkIfValueShouldMapToParam(obj, str, regexTokens) {
    //
    //
    //       THIS IS A VERY IMPORTANT METHOD
    //       IT COMPARES THE STRING TO BE MATCHED WITH THE ROUTE PATH OBJECT
    //       AND IT WILL RETURN ONE OF THREE THINGS
    //       1. THE STRING ITSELF
    //       2. A MATCHING KEY FROM THE CURRENT OBJECT
    //       3. THE ROUTENAME
    //

    // GO THROUGH KEYS AND CHECK IF REGEX MATCHES

    // GO THROUGH ROUTE CONFIG TO FIGURE OUT IF VAL OR KEY SHOULD BE COMPARED
    // if the value is an object, choose the key of the route path to check against
    const getValCompareArr = compose(map(last), map(filter(is(String))), toPairs)

    // CREATE THE ARRAY OF EITHER VALS OR KEYS
    const paramsArr = getValCompareArr(obj)

    // RESULTS FROM PARAM CHECK
    // let paramIndex = checkForParamsMatch(paramsArr);

    const paramIndex = SpyneUtilsChannelRouteUrl.findIndexOfMatchedStringOrRegex(str, paramsArr)

    // DEFAULT VAL FOR STRING
    let paramStr = str

    // LEGACY METHOD -- TURN OFF
    // WHEN THERE IS A MATCH FROM THE CURRENT ROUTE PATH OBJECT
    if (paramIndex >= 0) {
      const param = paramsArr[paramIndex]
      const invertedObj = invert(obj)

      // PULL INVERTED OBJECT TO SEE IF STR MATCHES
      const getParamInverted = compose(head, defaultTo([]), prop(param))
      const paramInverted = getParamInverted(invertedObj)
      // spyne 11.0.1;
      const re =  /^([-$\w]*)$/
      const keyMatch =  re.test(paramInverted)

      if (keyMatch === true && is(String, paramInverted) === true) {
        paramStr = paramInverted
      }
    }

    return paramStr
  }

  static createArrFromSlashStr(str) {
    const slashRe = /^([/])?(.*)$/
    return str.replace(slashRe, '$2').split('/')
  }

  static convertSlashRouteStrToParamsObj(topLevelRoute, str, regexTokens) {
    const routeValue = str
    const valuesArr = this.createArrFromSlashStr(str)
    const paths = []
    const routedValuesArr = []
    let latestObj = topLevelRoute
    const createParamsFromStr = (total, currentValue) => {
      const routeValueStr = this.checkIfValueShouldMapToParam(latestObj, currentValue, regexTokens)

      latestObj = this.checkIfParamValueMatchesRegex(currentValue, latestObj)
      const prevPathNotEqCurrentPath = (str) => str !== last(paths)

      const isEmptyOrNil = either(isEmpty, isNil)

      if (latestObj !== undefined && prevPathNotEqCurrentPath(latestObj.routeName) && isEmptyOrNil(routeValueStr) === false) {
        paths.push(latestObj.routeName)
        routedValuesArr.push(routeValueStr)
      }
      const strPath = [currentValue, 'routePath']
      const routeParamPath = ['routePath']
      const objectFromStr = path(strPath, latestObj)
      const objectFromRouteParam = path(routeParamPath, latestObj)

      if (objectFromStr !== undefined) {
        latestObj = objectFromStr
      } else if (objectFromRouteParam !== undefined) {
        latestObj = objectFromRouteParam
      }
    }

    reduce(createParamsFromStr, 0, valuesArr)
    const routeData = zipObj(paths, routedValuesArr)
    const pathInnermost = this.getLastArrVal(paths)
    return { paths, pathInnermost, routeData, routeValue }
  }

  static getLastArrVal(arr) {
    const getLastParam = (a) => last(a) !== undefined ? last(a) : ''
    return getLastParam(arr)
  }

  static createDefaultParamFromEmptyStr(topLevelRoute, str) {
    const obj = {}
    const keyword = topLevelRoute.routeName
    obj[keyword] = this.checkIfValueShouldMapToParam(topLevelRoute, str)
    return obj
  }

  static convertQueryStrToParams(topLevelRoute, str, regexTokens) {
    const queryRe = /^([?])?(.*)$/
    const routeValue = str
    const strArr = str.replace(queryRe, '$2')
    const convertToParams = compose(map(split('=')), split('&'))
    const paramsArr = convertToParams(strArr)
    let routeData = fromPairs(paramsArr)

    let paths = map(head, paramsArr)

    if (isEmpty(str) === true) {
      routeData = this.createDefaultParamFromEmptyStr(topLevelRoute, str, regexTokens)
      paths = keys(routeData)
    }
    const pathInnermost = this.getLastArrVal(paths)

    return { paths, pathInnermost, routeData, routeValue }
  }

  static convertRouteToParams(str, routeConfig, t) {
    const addSlash = (url) => url.replace(/\/$|$/, '/')
    if (routeConfig === undefined) {
      return {}
    }
    const type = t !== undefined ? t : routeConfig.type
    const regexTokens = defaultTo({}, prop('regexTokens', routeConfig))
    const topLevelRoute = routeConfig.routes.routePath

    if (type === 'query') {
      return this.convertQueryStrToParams(topLevelRoute, str)
    }
    str = addSlash(str)

    return this.convertSlashRouteStrToParamsObj(topLevelRoute, str, regexTokens)
  }
}
