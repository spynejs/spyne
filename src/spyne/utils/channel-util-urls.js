const R = require('ramda');

export class URLUtils {
  constructor() {
    this.checkIfObjIsNotEmptyOrNil = URLUtils.checkIfObjIsNotEmptyOrNil.bind(this);
  }

  static checkIfObjIsNotEmptyOrNil(obj) {
    const isNotEmpty = R.compose(R.complement(R.isEmpty), R.head, R.values);
    const isNotNil = R.compose(R.complement(R.isNil), R.head, R.values);
    const isNotNilAndIsNotEmpty = R.allPass([isNotEmpty, isNotNil]);
    return isNotNilAndIsNotEmpty(obj);
  }

  static checkIfParamValueMatchesRegex(paramValue, routeObj) {
    const rejectParamKey = R.reject(R.equals('keyword'));
    const keysArr = R.compose(rejectParamKey, R.keys);
    const testForRegexMatch = str => R.test(new RegExp(str), paramValue);
    const checker = R.compose(R.find(testForRegexMatch), keysArr);
    const regexMatchStr = checker(routeObj);
    if (R.is(String, regexMatchStr)) {
      routeObj = R.assoc(paramValue, R.prop(regexMatchStr, routeObj), routeObj);
    }
    return routeObj;
  }

  static getLocationStrByType(t, isHash = false) {
    const type = isHash === true ? 'hash' : t;

    const typeMap = {
      'slash': 'pathname',
      'query': 'search',
      'hash': 'hash'
    };
    const prop = typeMap[type];
    let str  = R.prop(prop, window.location);
    let checkForSlashAndHash = /^(\/)?(#)?(\/)?(.*)$/;
    return str.replace(checkForSlashAndHash, '$4');
  }

  static createRouteArrayFromParams(data, route, t = 'slash', paramsFromLoc) {
    let urlArr = [];
    let loopThroughParam = (routeObj) => {
      let urlObj = {};
      let keyword = routeObj.keyword; // PARAM FORM SPYNE CONFIG
      let paramValFromData = data[keyword] !== undefined ? data[keyword] : R.prop(keyword, paramsFromLoc); // PULL VALUE FOR THIS PARAM FROM DATA
      const paramValType = typeof (routeObj[paramValFromData]);
      // console.log({routeObj, paramValType, paramValFromData, keyword})

      if (paramValType === 'string') {
        paramValFromData = routeObj[paramValFromData];
      } else if (paramValType === 'undefined') {
        routeObj = this.checkIfParamValueMatchesRegex(paramValFromData, routeObj);
      }

      urlObj[keyword] = paramValFromData;

      // console.log("URL OBJ ",urlObj);
      if (this.checkIfObjIsNotEmptyOrNil(urlObj)) {
        // console.log("FOUND ",{paramValFromData, paramValType, urlObj, routeObj});
        urlArr.push(urlObj);
      } else {
        // console.log("NOT FOUND ",paramValFromData, paramValType, urlObj, routeObj);

      }

      const isObject = R.is(Object, routeObj);
      const objectParamExists = R.has(paramValFromData, routeObj);
      const objectContainsRoute = R.has('route', routeObj);
      const recursivelyCallLoopBool = objectParamExists && isObject;
      // console.log("CHECKS ", {isObject, objectParamExists, objectContainsRoute, recursivelyCallLoopBool})
      if (recursivelyCallLoopBool === true) {
        let newObj = routeObj[paramValFromData];
        // console.log("NEW OBJ ",{paramValFromData, routeObj, newObj});
        if (R.has('route', newObj)) {
          loopThroughParam(newObj.route);
        }
      } else if (objectContainsRoute === true && paramValFromData !== undefined) {
        loopThroughParam(routeObj.route);
      }
    };

    loopThroughParam(route);

    return urlArr;
  }

  static createSlashString(arr) {
    const arrClear = R.reject(R.isNil);
    const notUndefined = R.when(R.complement(R.isNil, R.__), R.join('/'));

    const joiner = R.compose(notUndefined, arrClear, R.flatten,
      R.map(R.values));

    return joiner(arr);
  }

  static createQueryString(arr) {
    const arrClear = R.reject(R.isNil);

    const isNotNilAndIsNotEmpty = this.checkIfObjIsNotEmptyOrNil;

    const createPair = R.compose(
      R.join('='),
      R.flatten,
      R.toPairs);

    const checkPair = R.ifElse(
      isNotNilAndIsNotEmpty,
      createPair,
      R.always(undefined)
    );

    const mapArrayOfPairs = R.map(checkPair);

    const checkIfStrIsEmpty = R.when(
      R.complement(R.isEmpty),
      R.concat('?'));

    const createQs = R.compose(
      checkIfStrIsEmpty,
      R.join('&'),
      arrClear,
      mapArrayOfPairs);

    return createQs(arr);
  }

  static convertParamsToRoute(data, r = window.Spyne.config.channels.ROUTE, t, locStr) {
    const urlType = t !== undefined ? t : r.type;
    const isHash = r.isHash;
    let route = r.routes.route;
    let locationStr = locStr !== undefined ? locStr : this.getLocationStrByType(urlType, isHash);
    let paramsFromCurrentLocation = this.convertRouteToParams(locationStr, r, urlType).keywords;

    let urlArr = this.createRouteArrayFromParams(data, route, urlType, paramsFromCurrentLocation);
    // THIS CREATES A QUERY PATH STR
    if (urlType === 'query') {
      return this.createQueryString(urlArr);
    }

    // THIS CREATES A SLASH PATH STR
    return this.createSlashString(urlArr);
  }

  static checkIfValueShouldMapToParam(obj, str) {
    let invertedObj = R.invert(obj);

    let checkIfValMapsToParam = R.compose(R.is(String), R.head, R.defaultTo([]),
      R.prop(str));
    let getParam = R.compose(R.head, R.prop(str));

    let strCheck = R.ifElse(
      checkIfValMapsToParam,
      getParam,
      R.always(str)
    );

    return strCheck(invertedObj);
  }

  static createArrFromSlashStr(str) {
    const slashRe = /^([/])?(.*)$/;
    return str.replace(slashRe, '$2').split('/');
  }

  static convertSlashRouteStrToParamsObj(topLevelRoute, str) {
    const routeValue = str;
    let valuesArr = this.createArrFromSlashStr(str);
    let routeKeywordsArr = [];
    let routedValuesArr = [];
    let latestObj = topLevelRoute;
    let createParamsFromStr = (total, currentValue) => {
      let routeValueStr = this.checkIfValueShouldMapToParam(latestObj, currentValue);

      latestObj = this.checkIfParamValueMatchesRegex(currentValue, latestObj);

      if (latestObj !== undefined) {
        routeKeywordsArr.push(latestObj.keyword);
        routedValuesArr.push(routeValueStr);
      }
      let strPath = [currentValue, 'route'];
      let routeParamPath = ['route'];
      let objectFromStr = R.path(strPath, latestObj);
      let objectFromRouteParam = R.path(routeParamPath, latestObj);

      if (objectFromStr !== undefined) {
        latestObj = objectFromStr;
      } else if (objectFromRouteParam !== undefined) {
        latestObj = objectFromRouteParam;
      }
    };

    R.reduce(createParamsFromStr, 0, valuesArr);
    let keywords = R.zipObj(routeKeywordsArr, routedValuesArr);
    const routeKeyword = this.getLastArrVal(routeKeywordsArr);
    return {routeKeywordsArr, routeKeyword, keywords, routeValue};
  }

  static getLastArrVal(arr) {
    const getLastParam = (a) => R.last(a) !== undefined ? R.last(a) : '';
    return getLastParam(arr);
  }

  static createDefaultParamFromEmptyStr(topLevelRoute, str) {
    let obj = {};
    let keyword = topLevelRoute.keyword;
    obj[keyword] = this.checkIfValueShouldMapToParam(topLevelRoute, str);
    return obj;
  }

  static convertQueryStrToParams(topLevelRoute, str) {
    const queryRe = /^([?])?(.*)$/;
    const routeValue = str;
    let strArr = str.replace(queryRe, '$2');
    let convertToParams = R.compose(R.map(R.split('=')), R.split('&'));
    let paramsArr = convertToParams(strArr);
    let keywords = R.fromPairs(paramsArr);

    let routeKeywordsArr = R.map(R.head, paramsArr);

    if (R.isEmpty(str) === true) {
      keywords = this.createDefaultParamFromEmptyStr(topLevelRoute, str);
      routeKeywordsArr = R.keys(keywords);
    }
    let routeKeyword = this.getLastArrVal(routeKeywordsArr);

    return {routeKeywordsArr, routeKeyword, keywords, routeValue};
  }

  static convertRouteToParams(str, routeConfig, t) {
    if (routeConfig === undefined) {
      return {};
    }
    const type = t !== undefined ? t : routeConfig.type;
    let topLevelRoute = routeConfig.routes.route;

    if (type === 'query') {
      return this.convertQueryStrToParams(topLevelRoute, str);
    }

    return this.convertSlashRouteStrToParamsObj(topLevelRoute, str);
  }
}
