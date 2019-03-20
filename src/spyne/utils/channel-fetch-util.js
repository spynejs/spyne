import { from } from 'rxjs';
import { flatMap, map, publish, tap } from 'rxjs/operators';
import * as R from 'ramda';
export class ChannelFetchUtil {
// METHOD GET POST PUT PATCH DELETE

  constructor(options, subscriber, testMode) {
    // console.log('url ',url,options);
    const testSubscriber = (p) => console.log('FETCH RETURNED ', p);

    this._mapFn = ChannelFetchUtil.setMapFn(options);
    this._url = ChannelFetchUtil.setUrl(options);
    this._responseType = ChannelFetchUtil.setResponseType(options);
    this._serverOptions = ChannelFetchUtil.setServerOptions(options);
    this._subscriber = subscriber !== undefined ? subscriber : testSubscriber;
    this.debug = options.debug !== undefined ? options.debug : false;

    let fetchProps = {
      mapFn: this.mapFn,
      url: this.url,
      serverOptions: this.serverOptions,
      responseType: this.responseType,
      debug: this.debug
    };
    if (testMode !== true) {
      ChannelFetchUtil.startWindowFetch(fetchProps, this._subscriber);
    }
  }

  static startWindowFetch(props, subscriber) {
    let { mapFn, url, serverOptions, responseType, debug } = props;
    const tapLogDebug = p => console.log('DEBUG FETCH :', p);
    const tapLog = debug === true ? tapLogDebug : () => {};

    let response$ = from(window.fetch(url, serverOptions))
      .pipe(tap(tapLog), flatMap(r => from(r[responseType]())),
        map(mapFn),
        publish());

    response$.connect();

    response$.subscribe(subscriber);
  }

  static setMapFn(opts) {
    const getFn = R.compose(R.defaultTo((p) => p), R.prop('mapFn'));
    return getFn(opts);
  }

  static setUrl(opts) {
    let url = R.prop('url', opts);
    if (url === undefined) {
      console.warn(`SPYNE WARNING: URL is undefined for data channel`);
    }
    return url;
  }

  static setResponseType(opts) {
    return R.defaultTo('json', R.prop('responseType', opts));
  }

  get mapFn() {
    return this._mapFn;
  }

  get url() {
    return this._url;
  }

  get serverOptions() {
    return this._serverOptions;
  }

  get responseType() {
    return this._responseType;
  }

  static stringifyBodyIfItExists(obj) {
    const convertToJSON = R.when(R.propIs(Object, 'body'), R.compose(R.over(R.lensProp('body'), JSON.stringify)));

    return convertToJSON(obj);
  }

  static updateMethodWhenBodyExists(opts) {
    const hasBody = R.has('body');
    const methodIsGet = R.propEq('method', 'GET');
    const pred = R.allPass([hasBody, methodIsGet]);
    return R.when(pred, R.assoc('method', 'POST'))(opts);
  }

  static setServerOptions(opts) {
    let options = R.pick(['header', 'body', 'mode', 'method'], opts);
    let mergedOptions = R.mergeDeepRight(ChannelFetchUtil.baseOptions(), options);
    mergedOptions = ChannelFetchUtil.updateMethodWhenBodyExists(mergedOptions);
    mergedOptions = ChannelFetchUtil.stringifyBodyIfItExists(mergedOptions);
    return mergedOptions;
  }

  static baseOptions() {
    return {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    };
  }
}
