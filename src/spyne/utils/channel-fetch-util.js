import { from } from 'rxjs';
import { flatMap, map, publish, tap } from 'rxjs/operators';
import {
  compose,
  prop,
  defaultTo,
  over,
  lensProp,
  has,
  propEq,
  when,
  propIs,
  allPass,
  assoc,
  pick,
  mergeDeepRight,
  path, clone,
} from 'ramda';
export class ChannelFetchUtil {
// METHOD GET POST PUT PATCH DELETE
  /**
   * @module ChannelFetchUtil
   * @type util
   *
   *
   * @desc
   * This is the core object used for ChannelFetch. This utility wraps the javascript fetch api into an observable.
   *
   * @constructor
   * @param {Object} options Properties used to create the fetch request
   * @param {function} subscriber A method assigned to listen to the result
   * @param {Boolean} testMode Controls the initializtion for unit tests
   *
   * @property {Object} options.url - = undefined; The url used for the request
   * @property {Object} options.serverOptions - = undefined; The properties, header, body, mode, method, for the request
   * @property {Object} options.mapFn - = undefined; A method that can be used to parse the data before it's returned
   * @property {Object} options.responseType - = 'json'; Default is json
   * @property {Object} options.debug - = false; will trace the fetch response to the console befor the observable completes
   * @property {Function} Subscriber - = undefined; the method that will be called when the fetch is complete.
   * @property {Boolean} testMode - = false; Used for unit testing.
   *
   * @returns The fetched response parsed by the set parameters.
   *
   *
   * @example
   * TITLE['<h4>Using ChannelFetchUtil to Retrieve an Image</h4>']
   *
   *   const url = "/static/images/myimage.jpg";
   *   const responseType = "blob";
   *   const onImgBlobReturned = (blob)=>{
   *        let blobUrl = URL.createObjectURL(blob);
   *        this.appendView(
   *            new ViewStream({
   *              tagName: 'img',
   *              src: blobUrl,
   *              width:300
   *            })
   *           )}
   *
   *   new ChannelFetchUtil({url, responseType}, onImgBlobReturned);
   *
   *
   */


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
    debug = true;

    const onMapResponse = (data)=>{
      let payload = {}
      const obj = {payload};
      const tmpLabel = `fetch-temp-${Math.floor(Math.random()*100000)}`;
      if (window.spyneTmp===undefined){
        window.spyneTmp = {};
      }
      window.spyneTmp[tmpLabel] = data;
/*

      Object.defineProperty(obj, payload, {

        get: ()=>compose(clone, path(['spyneTmp', tmpLabel]))(window)
      })
*/


        subscriber(tmpLabel);

    }




    window.fetch(url, serverOptions)
        .then(r => r[responseType]())
        .then(onMapResponse);



   /* const tapLogDebug = p => console.log('DEBUG FETCH :', p);
    const tapLog = debug === true ? tapLogDebug : () => {};

    const addToTmpDir = (o)=>{
      const tmpLabel = `fetch-${Math.floor(Math.random()*100000)}`;
      let payloadPath = ['Spyne', 'config', 'tmp'];
      let tmpDir = path(payloadPath, window);

      if (tmpDir===undefined) {
        payloadPath = ['spyneTmp'];
        window['spyneTmp'] = {};
        tmpDir = path(payloadPath, window);
      }




      const payloadPathAll = clone(payloadPath);
      payloadPathAll.push(tmpLabel);
      tmpDir[tmpLabel] = o;

      let pl = {};
      const d = {pl};

      Object.defineProperties(d, {
        pl: {
          get: ()=> compose(clone, path(payloadPathAll))(window)

        }
      })


      console.log('payload path all ',{payloadPathAll, payloadPath, d}, compose(clone, path(payloadPathAll))(window));

      return d.pl;
    }




    let response$ = from(window.fetch(url, serverOptions))
      .pipe(tap(tapLog), flatMap(r => from(r[responseType]())),
        map(addToTmpDir),
        map(mapFn),
        publish());

    response$.connect();

    response$.subscribe(subscriber);*/
  }

  static setMapFn(opts) {
    const getFn = compose(defaultTo((p) => p), prop('mapFn'));
    return getFn(opts);
  }

  static setUrl(opts) {
    let url = prop('url', opts);
    if (url === undefined) {
      console.warn(`SPYNE WARNING: URL is undefined for data channel`);
    }
    return url;
  }

  static setResponseType(opts) {
    return defaultTo('json', prop('responseType', opts));
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
    const convertToJSON = when(propIs(Object, 'body'), compose(over(lensProp('body'), JSON.stringify)));

    return convertToJSON(obj);
  }

  static updateMethodWhenBodyExists(opts) {
    const hasBody = has('body');
    const methodIsGet = propEq('method', 'GET');
    const pred = allPass([hasBody, methodIsGet]);
    return when(pred, assoc('method', 'POST'))(opts);
  }

  static setServerOptions(opts) {
    let options = pick(['header', 'body', 'mode', 'method'], opts);
    let mergedOptions = mergeDeepRight(ChannelFetchUtil.baseOptions(), options);
    mergedOptions = ChannelFetchUtil.updateMethodWhenBodyExists(mergedOptions);
    mergedOptions = ChannelFetchUtil.stringifyBodyIfItExists(mergedOptions);
    return mergedOptions;
  }

  static baseOptions() {
    return {
      method: 'GET',
      headers: {
        "Accept": "application/json, text/plain, */*"
      }
    };
  }
}
