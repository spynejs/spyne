const R = require('ramda');
import * as Rx from "rxjs";


export class RouteUtils {
  constructor() {
    this.createPopStateStream = RouteUtils.createPopStateStream.bind(this);
  }

  static createPopStateStream(subscribeFn) {
    let addHandler = function(handler) {
      window.onpopstate = handler;
    };
    let removeHandler = function() {
      window.onpopstate = function() {};
    };
    let popupObs$ = Rx.Observable.fromEventPattern(addHandler, removeHandler);

    popupObs$.subscribe(subscribeFn);
  }

  static getLastArrVal(arr) {
    const getLastParam = (a) => R.last(a) !== undefined ? R.last(a) : '';
    return getLastParam(arr);
  }

  static getRouteArrData(routeArr, paramsArr) {
    let routeKeywordsArr =  R.filter(R.contains(R.__, routeArr), paramsArr);
    const routeKeyword = RouteUtils.getLastArrVal(routeKeywordsArr);
    // console.log('arr and keyword ',{routeKeywordsArr, routeKeyword});
    return {routeKeywordsArr, routeKeyword};
  }

  static flattenConfigObject(obj) {
    const go = obj_ => R.chain(([k, v]) => {
      if (Object.prototype.toString.call(v) === '[object Object]') {
        return R.map(([k_, v_]) => [`${k}.${k_}`, v_], go(v));
      } else {
        return [[k, v]];
      }
    }, R.toPairs(obj_));

    return R.values(R.fromPairs(go(obj)));
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
      'hash'];
    return R.pickAll(locationParamsArr, window.location);
  }
}
