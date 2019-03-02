const R = require('ramda');
import {from} from "rxjs";
import {flatMap, map,publish,tap} from "rxjs/operators";

export class ChannelFetchUtil  {

// METHOD GET POST PUT PATCH DELETE


  constructor(options, subscriber){
      //console.log('url ',url,options);

      this._url = ChannelFetchUtil.setUrl(options);
      this._responseType = ChannelFetchUtil.setResponseType(options);
      this._serverOptions = ChannelFetchUtil.setServerOptions(options);
      this.subscriber = subscriber;

      //console.log("SERVER OPTIONS ",this.serverOptions);

  }

  static setUrl(opts){
    let url = R.prop('url', opts);
    if (url === undefined){
      console.warn(`SPYNE WARNING: URL is undefined for data channel`);
    }
    return url;
  }


  static setResponseType(opts){
    return R.defaultTo('json', R.prop('responseType', opts));
  }

  get url(){
    return this._url;
  }

  get serverOptions(){
    return this._serverOptions;
  }

  get responseType(){
    return this._responseType;
  }

  static stringifyBodyIfItExists(obj){
    const convertToJSON = R.when(R.propIs(Object, 'body'), R.compose( R.over(R.lensProp('body'), JSON.stringify) ))

    return convertToJSON(obj);
  }

  static updateMethodWhenBodyExists(opts){
    const hasBody = R.has('body');
    const methodIsGet = R.propEq('method', 'GET');
    const pred = R.all([hasBody, methodIsGet]);
    R.when(pred, R.assoc('method', 'POST'))(opts);

    return opts;
  }

  static setServerOptions(opts){
    let options = R.pick(['header', 'body', 'mode', 'method'], opts);
    options=ChannelFetchUtil.stringifyBodyIfItExists(options);
    options = ChannelFetchUtil.updateMethodWhenBodyExists(options);
    //console.log("options ",options);

    let mergedOptions = R.mergeDeepRight(ChannelFetchUtil.baseOptions(), options);


    return mergedOptions;
  }


  static baseOptions(){
    return {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    };
  }

  static testOptions(options, type='get'){


  }

  static getData(){
    // mapFn, subscriber

  }

  static postData(){
    //mapFn ,subscriber, body, method, headers


  }

  static deleteData(){

  }
















};