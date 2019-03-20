const R = require('ramda');
const isIOS = () => {
  let userAgent = window.navigator.userAgent.toLowerCase();
  // let safari = /safari/.test(userAgent);
  let ios = /iphone|ipod|ipad/.test(userAgent);
  return ios === true;
};

const getConstructorName = (obj) => {
  if (obj.constructor.name !== undefined) {
    return obj.constructor.name;
  }
  const re = /^(function\s)(\w+)(\(.*)$/;
  let str = obj.toString();
  return R.defaultTo(String(str).substr(0, 12), R.match(re, str)[2]);
};

const arrFromMapKeys = (map) => {
  let arr = [];
  const addKeysToArr = (v, k, i) => arr.push(k);
  R.forEach(addKeysToArr, map);
  return arr;
};

const findStrFromRegexArr = (obj, str) => {
  if (obj[str] !== undefined) {
    return str;
  }
  const checkIfMatch = s => R.test(new RegExp(s), str);
  const checkStrMatch = R.contains(str);
  const checkIfRegExMatch = R.compose(R.contains(true), R.map(checkIfMatch));
  const runMatchChecks = R.cond([
    [checkStrMatch, () => str],
    [checkIfRegExMatch, () => str],
    [R.T, () => undefined]
  ]);
  return runMatchChecks(obj);
};

const findStrOrRegexMatchStr = (obj, str) => {
  if (obj[str] !== undefined) {
    return str;
  }
  const createRe = s => new RegExp(s);
  let checkerIfRegexMatchExists = R.compose(R.head, R.filter(R.compose(R.test(R.__, str), createRe)));
  return checkerIfRegexMatchExists(R.keys(obj));
};

const closest = (array, num) => {
  let i = 0;
  let minDiff = 1000;
  let ans;
  for (i in array) {
    let m = Math.abs(num - array[i]);
    if (m < minDiff) {
      minDiff = m;
      ans = array[i];
    }
  }
  return ans;
};

const convertDomStringMapToObj = (domMap) => {
  let obj = {};
  for (let d in domMap) {
    obj[d] = domMap[d];
  }
  return obj;
};

// const passPageData = R.pick(['params', 'routeId', 'data'], R.__);

const subscribeFn = {
  next:     x => console.log(`next      ${x}`),
  error:    x => console.log(`error     ${x}`),
  complete: x => console.log(`complete  ${x}`)
};

const right = x => ({
  map: f => right(f(x)),
  fold: (f, g) => g(x),
  inspect: () => `right(${x})`

});

const ifNilThenUpdate = (val, newVal) => {
  let isNil = R.isNil(val);
  return isNil ? newVal : val;
};

const left = x => ({
  map: f => left(x),
  fold: (f, g) => f(x),
  inspect: () => `left(${x})`
});

const checkIfObjIsNotEmptyOrNil = (obj) => {
  const isNotEmpty = R.compose(R.complement(R.isEmpty), R.head, R.values);
  const isNotNil = R.compose(R.complement(R.isNil), R.head, R.values);
  const isNotNilAndIsNotEmpty = R.allPass([isNotEmpty, isNotNil]);
  return isNotNilAndIsNotEmpty(obj);
};

const fromNullable = x => x !== null ? right(x) : left(null);

const findInObj = (obj, val, error = null) => {
  const found = obj[val];
  return found ? right(found) : left(error);
};
const pullRouteInfo = () => {
  let str = pullHashAndSlashFromPath(window.location.hash);
  let routeId = pullMainRoute(str);
  let params = pullParams(str);
  return { routeId, params };
};

const getAllMethodNames = (_this = this, omittedMethods = []) => {
  const getPropNamesArr = (obj = this, omittedMethods = []) => {
    return Object.getOwnPropertyNames(obj);
  };
  // Filter Methods
  let baseClassMethodsArr = ['length', 'name', 'prototype', 'constructor'];
  omittedMethods = R.concat(baseClassMethodsArr, omittedMethods);
  let omitPropsFromArr = R.compose(R.without(omittedMethods), R.uniq);

  // PULL OUT METHOD NAMES
  let methods = omitPropsFromArr(Object.getOwnPropertyNames(_this.constructor.prototype));
  let staticMethods = omitPropsFromArr(getPropNamesArr(_this.constructor));
  let allMethods = R.concat(methods, staticMethods);

  return { methods, staticMethods, allMethods };
  // return 'fn';
};

// ROUTE REGEX EXPRESSIONS
const removeSlashes = str => str.replace(/^(\/)(.*)/g, '$2');
const routeRE = /^(\/?)(\w*)(\/?)(.*)/g;
const pullHashAndSlashFromPath = (str) => str.replace(/^(#\/?)(.*)/, '$2');
const pullSlashFromPath = (str) => str.replace(/^(\/?)(.*)/, '$2');
const pullMainRoute = (str) => str.replace(routeRE, '$2');
const pullParams =    (str) => str.replace(routeRE, '$4');
const pullTranslateX = str => str.replace(/^(matrix)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*)(,.*)/, '$6');
const pullTranslateY = str => str.replace(/^(matrix)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d)(.*)/, '$7');
const pullTranslateYFromHeader = str => str.replace(/^(transform: matrix)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*)(\).*;)/, '$6');
export { getConstructorName, arrFromMapKeys, getAllMethodNames, findStrOrRegexMatchStr, findStrFromRegexArr, checkIfObjIsNotEmptyOrNil, isIOS, pullRouteInfo, pullTranslateYFromHeader, pullSlashFromPath, pullHashAndSlashFromPath, closest, pullTranslateY, pullTranslateX, pullMainRoute, pullParams, right, left, fromNullable, findInObj, ifNilThenUpdate, removeSlashes, subscribeFn, convertDomStringMapToObj };
