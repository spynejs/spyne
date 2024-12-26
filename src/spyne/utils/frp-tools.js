import { defaultTo, match, forEach, test, includes, without, complement, isEmpty, values, isNil, filter, __, keys, compose, head, map, cond, T, allPass, concat, uniq } from 'ramda'
const isIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  // let safari = /safari/.test(userAgent);
  const ios = /iphone|ipod|ipad/.test(userAgent)
  return ios === true
}

const delayCall = async(fn, time) => {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const timeoutHandler = async() => {
    await sleep(1)
    window.requestAnimationFrame(fn)
  }

  window.setTimeout(timeoutHandler, time)
}

const getConstructorName = (obj) => {
  if (obj.constructor.name !== undefined) {
    return obj.constructor.name
  }
  const re = /^(function\s)(\w+)(\(.*)$/
  const str = obj.toString()
  return defaultTo(String(str).substr(0, 12), match(re, str)[2])
}

const arrFromMapKeys = (map) => {
  const arr = []
  const addKeysToArr = (v, k, i) => arr.push(k)
  forEach(addKeysToArr, map)
  return arr
}

const findStrFromRegexArr = (obj, str) => {
  if (obj[str] !== undefined) {
    return str
  }
  const checkIfMatch = s => test(new RegExp(s), str)
  const checkStrMatch = includes(str)
  const checkIfRegExMatch = compose(includes(true), map(checkIfMatch))
  const runMatchChecks = cond([
    [checkStrMatch, () => str],
    [checkIfRegExMatch, () => str],
    [T, () => undefined]
  ])
  return runMatchChecks(obj)
}

const findStrOrRegexMatchStr = (obj, str) => {
  if (obj[str] !== undefined) {
    return str
  }
  const createRe = s => new RegExp(s)
  const checkerIfRegexMatchExists = compose(head, filter(compose(test(__, str), createRe)))
  return checkerIfRegexMatchExists(keys(obj))
}

const closest = (array, num) => {
  let i = 0
  let minDiff = 1000
  let ans
  for (i in array) {
    const m = Math.abs(num - array[i])
    if (m < minDiff) {
      minDiff = m
      ans = array[i]
    }
  }
  return ans
}

const convertDomStringMapToObj = (domMap) => {
  const obj = {}
  for (const d in domMap) {
    obj[d] = domMap[d]
  }
  return obj
}

// const passPageData = pick(['params', 'routeId', 'data'], __);

const subscribeFn = {
  next:     x => console.log(`next      ${x}`),
  error:    x => console.log(`error     ${x}`),
  complete: x => console.log(`complete  ${x}`)
}

const right = x => ({
  map: f => right(f(x)),
  fold: (f, g) => g(x),
  inspect: () => `right(${x})`

})

const ifNilThenUpdate = (val, newVal) => {
  const isNilBool = isNil(val)
  return isNilBool ? newVal : val
}

const left = x => ({
  map: f => left(x),
  fold: (f, g) => f(x),
  inspect: () => `left(${x})`
})

const checkIfObjIsNotEmptyOrNil = (obj) => {
  const isNotEmpty = compose(complement(isEmpty), head, values)
  const isNotNil = compose(complement(isNil), head, values)
  const isNotNilAndIsNotEmpty = allPass([isNotEmpty, isNotNil])
  return isNotNilAndIsNotEmpty(obj)
}

const fromNullable = x => x !== null ? right(x) : left(null)

const findInObj = (obj, val, error = null) => {
  const found = obj[val]
  return found ? right(found) : left(error)
}
const pullRouteInfo = () => {
  const str = pullHashAndSlashFromPath(window.location.hash)
  const routeId = pullMainRoute(str)
  const params = pullParams(str)
  return { routeId, params }
}

function getAllMethodNames(instance, omittedMethods = []) {
  // Optionally rename `instance` to something more descriptive:
  const baseClassMethodsArr = ['length', 'name', 'prototype', 'constructor']
  const combinedOmittedMethods = concat(baseClassMethodsArr, omittedMethods)

  // Filter out omitted
  const omitPropsFromArr = compose(without(combinedOmittedMethods), uniq)

  // Pull out instance methods
  const methods = omitPropsFromArr(
    Object.getOwnPropertyNames(instance.constructor.prototype)
  )

  // Pull out static methods
  const staticMethods = omitPropsFromArr(
    Object.getOwnPropertyNames(instance.constructor)
  )

  const allMethods = concat(methods, staticMethods)

  return { methods, staticMethods, allMethods }
}

/* const getAllMethodNames3 = (_this = this, omittedMethods = []) => {
  const getPropNamesArr = (obj = this, omittedMethods = []) => {
    return Object.getOwnPropertyNames(obj)
  }
  // Filter Methods
  const baseClassMethodsArr = ['length', 'name', 'prototype', 'constructor']
  omittedMethods = concat(baseClassMethodsArr, omittedMethods)
  const omitPropsFromArr = compose(without(omittedMethods), uniq)

  // PULL OUT METHOD NAMES
  const methods = omitPropsFromArr(Object.getOwnPropertyNames(_this.constructor.prototype))
  const staticMethods = omitPropsFromArr(getPropNamesArr(_this.constructor))
  const allMethods = concat(methods, staticMethods)

  return { methods, staticMethods, allMethods }
  // return 'fn';
} */

// ROUTE REGEX EXPRESSIONS
const removeSlashes = str => str.replace(/^(\/)(.*)/g, '$2')
const routeRE = /^(\/?)(\w*)(\/?)(.*)/g
const pullHashAndSlashFromPath = (str) => str.replace(/^(#\/?)(.*)/, '$2')
const pullSlashFromPath = (str) => str.replace(/^(\/?)(.*)/, '$2')
const pullMainRoute = (str) => str.replace(routeRE, '$2')
const pullParams =    (str) => str.replace(routeRE, '$4')
const pullTranslateX = str => str.replace(/^(matrix)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*)(,.*)/, '$6')
const pullTranslateY = str => str.replace(/^(matrix)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d)(.*)/, '$7')
const pullTranslateYFromHeader = str => str.replace(/^(transform: matrix)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*)(\).*;)/, '$6')
export { getConstructorName, arrFromMapKeys, getAllMethodNames, findStrOrRegexMatchStr, findStrFromRegexArr, checkIfObjIsNotEmptyOrNil, isIOS, pullRouteInfo, pullTranslateYFromHeader, pullSlashFromPath, pullHashAndSlashFromPath, closest, pullTranslateY, pullTranslateX, pullMainRoute, pullParams, right, left, fromNullable, findInObj, ifNilThenUpdate, removeSlashes, subscribeFn, convertDomStringMapToObj, delayCall }
