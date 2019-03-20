import { fromEventPattern } from 'rxjs';
const R = require('ramda');

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
    let popupObs$ = fromEventPattern(addHandler, removeHandler);

    popupObs$.subscribe(subscribeFn);
  }

  static getLastArrVal(arr) {
    const getLastParam = (a) => R.last(a) !== undefined ? R.last(a) : '';
    return getLastParam(arr);
  }

  static compareRouteKeywords(obj = {}, arr) {
    const pickValues = (o, a) => a !== undefined ? R.pick(a, o) : o;
    let obj1 = pickValues(obj, arr);
    return {
      pickValues,
      compare: (obj = {}, arr) => {
        let obj2 = pickValues(obj, arr);
        const compareProps = p => {
          let p1 = R.prop(p, obj1);
          let p2 = R.prop(p, obj2);
          let same = R.equals(p1, p2);
          let previousExists = p1 !== undefined;
          let nextExists = p2 !== undefined;
          let changed = !same;
          let added = previousExists === false && nextExists === true;
          let removed = previousExists === true && nextExists === false;
          // console.log("P: ",p,{same, previousExists, nextExists});
          let obj = {};
          obj[p] = { same, changed, added, removed, previousExists, nextExists };
          return obj;
        };

        const createPred = p => R.compose(R.keys, R.filter(R.propEq(p, true)));

        const getPropsState = R.compose(R.map(compareProps), R.uniq, R.chain(R.keys))([obj1, obj2]);
        let pathsChanged = R.chain(createPred('changed'), getPropsState);
        let pathsAdded = R.chain(createPred('added'), getPropsState);
        let pathsRemoved = R.chain(createPred('removed'), getPropsState);
        // console.log("GET KEYS ", pathsChanged);
        obj1 = obj2;
        return { pathsAdded, pathsRemoved, pathsChanged };
      },

      getComparer: () => obj1

    };
  }

  static getRouteArrData(routeArr, paramsArr) {
    let paths =  R.filter(R.contains(R.__, routeArr), paramsArr);
    const pathInnermost = RouteUtils.getLastArrVal(paths);
    // console.log('arr and routeName ',{paths, pathInnermost});
    return { paths, pathInnermost };
  }

  static flattenConfigObject(obj) {
    const go = obj_ => R.chain(([k, v]) => {
      if (Object.prototype.toString.call(v) === '[object Object]') {
        return R.map(([k_, v_]) => [`${k}.${k_}`, v_], go(v));
      } else {
        return [[k, v]];
      }
    }, R.toPairs(obj_));

    // console.log("FLATTEN: ",R.values(R.fromPairs(go(obj))));

    /**
     * TODO: PARSE PAIRS TO ALLOW FOR ARRAYS OR REGEX IN ROUTE CONFIG
     *
     */
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
