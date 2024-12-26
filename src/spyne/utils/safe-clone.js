import { clone, compose, fromPairs, is, path, toPairs } from 'ramda'
import { SpyneAppProperties } from './spyne-app-properties'

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

const cmsDataReviveNestedProxyObj = (proxyObj, proxyReviverMethod) => {
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

export const safeClone = function(o) {
  const { __proxy__proxyName } = o
  if (__proxy__proxyName !== undefined) {
    const proxyReviverMethod = SpyneAppProperties.getProxyReviver(__proxy__proxyName)
    if (typeof proxyReviverMethod === 'function') {
      return cmsDataReviveNestedProxyObj(o, proxyReviverMethod)
    }
  }

  const isArr = is(Array)
  const isObj = is(Object)
  const isIter = ob => isArr(ob) === false && isObj(ob) === true
  const isIterable = isIter(o)
  return isIterable ? compose(fromPairs, toPairs, clone)(o) : clone(o)
}
