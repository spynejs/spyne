import { clone, compose, fromPairs, is, path, toPairs } from 'ramda'
import { SpyneAppProperties } from './spyne-app-properties.js'

const getPropType = (prp) => {
  let type = typeof prp
  if (['number', 'boolean', 'string'].includes(type)) {
    type = 'primitive'
  } else if (type === 'object') {
    if (Array.isArray(prp)) {
      type = 'array'
    } else if (prp === null) {
      type = 'undefined'
    }
  }
  return type
}

const cmsDataReviveNestedProxyObj = (proxyObj = {}, proxyReviverMethod) => {
  const { __proxy__proxyName } = proxyObj

  if (__proxy__proxyName === undefined) {
    console.error('object is not proxy object ', proxyObj)
  }

  const cloneNestedProxyObj = (target, pathArr) => {
    const nestedProxyObj = path(pathArr, proxyObj)
    const { __proxy__isProxy, __proxy__props } = nestedProxyObj
    return __proxy__isProxy ? proxyReviverMethod(target, __proxy__props) : target
  }

  const rootObj = cloneNestedProxyObj(clone(proxyObj), [])

  const proxyIterable = (iterObj, iterPath) => {
    const dataPath = iterPath || []
    const loopObj = ([key, prop]) => {
      const type = getPropType(prop)
      const clonedPath = [...dataPath]
      clonedPath.push(key)
      if (type === 'object' || type === 'array') {
        iterObj[key] = cloneNestedProxyObj(prop, clonedPath)
        proxyIterable(prop, clonedPath)
      }
    }
    Object.entries(iterObj).forEach(loopObj)
  }

  proxyIterable(rootObj)
  // console.timeEnd('proxify2');

  return rootObj
}

const reviveIfProxy = (o = {}) => {
  const { __proxy__proxyName } = o
  if (__proxy__proxyName !== undefined) {
    const proxyReviverMethod = SpyneAppProperties.getProxyReviver(__proxy__proxyName)
    if (typeof proxyReviverMethod === 'function') {
      return cmsDataReviveNestedProxyObj(o, proxyReviverMethod)
    }
  }
  return undefined
}

/**
 *
 * Deep, proxy-preserving clone. Unlike safeClone — which only revives when the
 * ROOT object is a proxy — this walks plain containers (objects and arrays)
 * and revives any nested proxy it finds, so wrappers that hold proxied data
 * (e.g. channel payloads, pageData containers) survive cloning intact.
 * Functions are passed through by reference; cycles are guarded.
 *
 * @param {Object|Array} o
 * @returns A writable copy in which every nested proxy has been revived
 */
export const safeCloneDeep = function(o, seen = new WeakSet()) {
  if (o === null || typeof o !== 'object') {
    return o
  }

  const revived = reviveIfProxy(o)
  if (revived !== undefined) {
    return revived
  }

  if (seen.has(o)) {
    return o
  }
  seen.add(o)

  if (Array.isArray(o)) {
    return o.map(item => safeCloneDeep(item, seen))
  }

  const out = {}
  Object.entries(o).forEach(([key, val]) => {
    out[key] = safeCloneDeep(val, seen)
  })
  return out
}

/**
 * Re-wraps a derived array with the SOURCE array's proxy metadata via the
 * registered reviver. Native filter/reject/map keep element identity but
 * return a plain array — losing the array-level proxy that string-item
 * template loops (e.g. {{#titles}}) rely on for __cms__dataId / keyFor
 * lookups. In production (no proxies) this is a single undefined check.
 *
 * Note: the reviver rebuilds its key/value map from the derived contents, so
 * value-keyed lookups survive while original index positions shift.
 */
const rewrapArrayFromSource = (sourceArr, resultArr) => {
  const proxyName = sourceArr?.__proxy__proxyName
  if (proxyName === undefined) {
    return resultArr
  }
  const proxyReviverMethod = SpyneAppProperties.getProxyReviver(proxyName)
  if (typeof proxyReviverMethod !== 'function') {
    return resultArr
  }
  return proxyReviverMethod(resultArr, sourceArr.__proxy__props)
}

/**
 *
 * Proxy-preserving Array.prototype.filter: elements keep their identity
 * (native behavior) AND the returned array keeps the source array's proxy
 * metadata. Use in place of ramda filter / arr.filter on CMS data.
 */
export const safeFilter = function(arr, predicate) {
  return rewrapArrayFromSource(arr, arr.filter(predicate))
}

/**
 *
 * Proxy-preserving reject — inverse of safeFilter.
 */
export const safeReject = function(arr, predicate) {
  return rewrapArrayFromSource(arr, arr.filter((item, i) => predicate(item, i) === false))
}

/**
 *
 * Proxy-preserving Array.prototype.map with an augment-in-place contract:
 * proxied elements arrive in the callback as WRITABLE revived copies, so
 * `safeMap(stories, s => { s.type = 'story'; return s; })` is safe by
 * construction (no silent live-proxy write traps). Plain elements pass by
 * reference exactly like native map, so production cost matches native.
 * A callback that builds an entirely new object per element still strips
 * that element's identity — there is nothing left to preserve.
 */
export const safeMap = function(arr, mapFn) {
  const result = arr.map((item, i) => {
    const isProxied = item !== null && typeof item === 'object' && item.__proxy__proxyName !== undefined
    return mapFn(isProxied ? safeCloneDeep(item) : item, i)
  })
  return rewrapArrayFromSource(arr, result)
}

/**
 *
 * Revive-then-augment. Live CMS proxies silently ignore writes of new keys,
 * so properties cannot be attached to them directly. This returns a writable,
 * proxy-preserved copy of o with the given props applied — the sanctioned way
 * to add view or route properties to CMS-proxied data.
 *
 * @param {Object|Array} o
 * @param {Object} propsObj properties to assign onto the revived copy
 * @returns A writable proxy-preserved copy carrying the extra props
 */
export const safeAugment = function(o, propsObj = {}) {
  const target = safeCloneDeep(o)
  Object.entries(propsObj).forEach(([key, val]) => {
    target[key] = val
  })
  return target
}

export const safeClone = function(o, deep = false) {
  const revived = reviveIfProxy(o)
  if (revived !== undefined) {
    return revived
  }

  if (deep === true) {
    return safeCloneDeep(o)
  }

  const isArr = is(Array)
  const isObj = is(Object)
  const isIter = ob => isArr(ob) === false && isObj(ob) === true
  const isIterable = isIter(o)
  return isIterable ? compose(fromPairs, toPairs, clone)(o) : clone(o)
}
