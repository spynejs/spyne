//import * as Rx from "rxjs-compat";
import {Observable, fromEventPattern} from "rxjs";
import {map} from "rxjs/operators";
const R = require('ramda');

export class ChannelUtilsDom {
  constructor() {
    this.createDomObservableFromEvent = ChannelUtilsDom.createDomObservableFromEvent.bind(
      this);
  }

  static createDomObservableFromEvent(eventName, mapFn, isPassive = true) {
    let addHandler = handler => window.addEventListener(eventName, handler,
      {passive: isPassive});
    let removeHandler = () => { window[eventName] = (p) => p; };
    mapFn = mapFn === undefined ? (p)=>p : mapFn;
    return fromEventPattern(addHandler, removeHandler).pipe(map(mapFn));
  }

  // MEDIA QUERIES
  static createMediaQuery(str) {
    const mq = window.matchMedia(str);
    this.checkIfValidMediaQuery(mq, str);
    return mq;
  }

  static checkIfValidMediaQuery(mq, str) {
    const noSpaces = str => str.replace(/\s+/gm, '');
    const isValidBool = mq.constructor.name === 'MediaQueryList' && noSpaces(mq.media) === noSpaces(str);
    const warnMsg = str => console.warn(`Spyne Warning: the following query string, "${str}", does not match "${mq.media}" and may not be a valid Media Query item!`);
    if (isValidBool === false) {
      warnMsg(str);
    }
    return isValidBool;
  }

  static createMediaQueryHandler(query, key) {
    let keyFn = key => p => {
      p['mediaQueryName'] = key;
      return p;
    };

    let mapKey = keyFn(key);

    let handlers = (q) => {
      return {
        addHandler: (handler) => { q.onchange = handler; },
        removeHandler: (handler) => { q.onchange = () => {}; }
      };
    };
    let mediaQueryHandler = handlers(query);
    return new fromEventPattern(
      mediaQueryHandler.addHandler,
      mediaQueryHandler.removeHandler)
      .pipe(map(mapKey));
  }

  static createMergedObsFromObj(config) {
    let mediaQueriesObj = config.mediqQueries;
    let arr = [];

    const loopQueries = (val, key, obj) => {
      let mq = ChannelUtilsDom.createMediaQuery(val);
      arr.push(ChannelUtilsDom.createMediaQueryHandler(mq, key));
      // return arr;
    };

    R.mapObjIndexed(loopQueries, mediaQueriesObj);
    // let obs$ = Observable.merge(...arr);
    // console.log('arr is ',arr);
    return arr;
  }
}
