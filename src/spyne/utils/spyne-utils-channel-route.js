import { fromEventPattern } from 'rxjs'
import { last, flatten, clone, pick, prop, pickAll, path, equals, compose, keys, filter, propEq, uniq, map, __, chain, is, includes, fromPairs, reject, mergeDeepRight, mergeRight, test, toPairs, values } from 'ramda'
import { SpyneUtilsChannelRouteUrl } from './spyne-utils-channel-route-url'

export class SpyneUtilsChannelRoute {
  constructor() {
    /**
     * @module SpyneUtilsChannelRoute
     * @type internal
     *
     * @constructor
     * @desc
     * Internal utility methods for the SpyneRouteChannel
     *
     */
    this.createPopStateStream = SpyneUtilsChannelRoute.createPopStateStream.bind(this)
  }

  static createPopStateStream(subscribeFn) {
    const addHandler = function(handler) {
      window.onpopstate = handler
    }
    const removeHandler = function() {
      window.onpopstate = function() {}
    }
    const popupObs$ = fromEventPattern(addHandler, removeHandler)

    popupObs$.subscribe(subscribeFn)
  }

  static getLastArrVal(arr) {
    const getLastParam = (a) => last(a) !== undefined ? last(a) : ''
    return getLastParam(arr)
  }

  static compareRouteKeywords(obj = {}, arr) {
    const pickValues = (o, a) => a !== undefined ? pick(a, o) : o
    let obj1 = pickValues(obj, arr)
    return {
      pickValues,
      compare: (obj = {}, arr) => {
        const obj2 = pickValues(obj, arr)
        const compareProps = p => {
          const p1 = prop(p, obj1)
          const p2 = prop(p, obj2)
          const same = equals(p1, p2)
          const previousExists = p1 !== undefined
          const nextExists = p2 !== undefined
          const changed = !same
          const added = previousExists === false && nextExists === true
          const removed = previousExists === true && nextExists === false
          // console.log("P: ",p,{same, previousExists, nextExists});
          const obj = {}
          obj[p] = { same, changed, added, removed, previousExists, nextExists }
          return obj
        }

        const createPred = p => compose(keys, filter(propEq(true, p)))

        const getPropsState = compose(map(compareProps), uniq, chain(keys))([obj1, obj2])
        const pathsChanged = chain(createPred('changed'), getPropsState)
        const pathsAdded = chain(createPred('added'), getPropsState)
        const pathsRemoved = chain(createPred('removed'), getPropsState)
        obj1 = obj2
        return { pathsAdded, pathsRemoved, pathsChanged }
      },

      getComparer: () => obj1

    }
  }

  static getRouteArrData(routeArr, paramsArr) {
    const paths =  filter(includes(__, routeArr), paramsArr)
    const pathInnermost = SpyneUtilsChannelRoute.getLastArrVal(paths)
    // console.log('arr and routeName ',{paths, pathInnermost});
    return { paths, pathInnermost }
  }

  static flattenConfigObject(obj) {
    const go = obj_ => chain(([k, v]) => {
      if (Object.prototype.toString.call(v) === '[object Object]') {
        return map(([k_, v_]) => [`${k}.${k_}`, v_], go(v))
      } else {
        return [[k, v]]
      }
    }, toPairs(obj_))

    // console.log("FLATTEN: ",values(fromPairs(go(obj))));
    return values(fromPairs(go(obj)))
  }

  static addRouteDatasets(channelRouteObj) {
    // channelRouteObj.type='query';

    const { type, isHash } = channelRouteObj

    // create href and check to see if need to convert to hash href links
    const getHREF = (obj) => {
      const santizeHREF = str => {
        const hrefRE = /^(.*\/)([\w-]*\/?)(.*)$/gm
        // const hrefRE = /^(.*\/)([\w-]*)(.*)$/gm;
        str = str.replace(hrefRE, '$1$2')
        // str = String(str).replace('^$', "");
        return str
      }

      const headStrVal = type === 'query' ? '' : isHash === true ? '#' : '/'
      const hrefStr =  SpyneUtilsChannelRouteUrl.convertParamsToRoute(obj, channelRouteObj)
      return headStrVal + santizeHREF(hrefStr)
    }

    // remove special chars from href
    const sanitizeStr = (str) => String(str).replace(/([^A-Za-z0-9-_])/g, '')

    // test whether to use key or val
    const isValidStrRE = /^([A-Za-z0-9_-])+$/m

    const createInitialValFn = (accMain = [], routePathObj, objAcc = {}) => {
      let { routeName } = routePathObj

      const propsReducer = (acc, arrPair) => {
        const [key, val] = arrPair
        const isObject = is(Object, val)

        const createTitle = (str) => String(str).replace(/([-_])/g, ' ').toUpperCase()

        const getLinkText = str => test(isValidStrRE, str) ? createTitle(str) : key

        if (key === 'routeName' || key === '404') {
          return acc
        }

        routeName = routeName || prop('routeName', val)
        // console.log("THE KEY IS ",{key,val,routeName})

        let o = clone(objAcc)
        o[routeName] = sanitizeStr(key)

        if (isObject === true) {
          if (keys(o).length === 1) {
            const subRouteName = path(['routePath', 'routeName'], val)
            if (subRouteName) {
              const oBase = clone(o)
              oBase[subRouteName] = ''
              oBase.navLevel = keys(objAcc).length
              oBase.title = getLinkText(key)
              oBase.href = getHREF(oBase)
              acc.push(oBase)
            }
          }
          o = createInitialValFn(accMain, val, o)
        } else {
          o.title = getLinkText(key)
          o.href = getHREF(o)
        }
        o.navLevel = keys(objAcc).length
        acc.push(o)
        return acc
      }

      return toPairs(routePathObj).reduce(propsReducer, [])
    }

    const reducedArr = createInitialValFn([], channelRouteObj.routes)
    const routeDatasetsArr = flatten(reducedArr)

    const getNavProps = (datasetsArr) => {
      const exclude = reject(includes(__, ['title', 'href', 'navLevel']))
      const getMainKeys = compose(uniq, exclude, flatten, map(keys))
      return getMainKeys(datasetsArr)
    }
    const routeNamesArr = getNavProps(routeDatasetsArr)

    return { routeDatasetsArr, routeNamesArr }
  }

  static conformRouteObject(channelRouteObj = {}, add404Props = false) {
    const channelsRoutePath = path(['channels', 'ROUTE'], channelRouteObj)
    let { add404s } = channelsRoutePath !== undefined ? channelsRoutePath : channelRouteObj
    add404s = add404s || add404Props
    const parseRoutePath = (a) => {
      const val = a[1]
      const isArr = is(Array, val)
      if (val === '') {
        a[1] = '^$'
      } else if (isArr) {
        a[1] = val.join('|')
      }
      return a
    }

    const transduceConfig = (arr) => {
      const [key, val] = arr
      const obj404 = add404s ? { 404: '.+' } : {}
      const isObj = is(Object, val)
      const isArr = is(Array, val)
      const iterObj = isObj === true && isArr === false
      const isRoutePath = key === 'routePath'
      if (iterObj) {
        arr[1] = configMapperFn(arr[1])
        if (isRoutePath) {
          arr[1] = compose(mergeDeepRight(obj404), fromPairs, map(parseRoutePath), toPairs)(arr[1])
        }
      }
      return arr
    }

    const configMapperFn = compose(fromPairs, map(transduceConfig), toPairs)

    if (channelsRoutePath !== undefined) {
      channelRouteObj.channels.ROUTE = configMapperFn(channelRouteObj.channels.ROUTE)
      const extraRouteData = SpyneUtilsChannelRoute.addRouteDatasets(channelRouteObj.channels.ROUTE)
      channelRouteObj.channels.ROUTE = mergeRight(channelRouteObj.channels.ROUTE, extraRouteData)
      return channelRouteObj
    }

    return configMapperFn(channelRouteObj)
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
}
