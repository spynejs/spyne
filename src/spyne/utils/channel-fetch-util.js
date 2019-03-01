const R = require('ramda');
import {from} from "rxjs";
import {flatMap, map,publish,tap} from "rxjs/operators";

export class ChannelFetchUtil  {




  constructor(url, options, subscriber){
      //console.log('url ',url,options);

      this.url = url;
      this._serverOptions = ChannelFetchUtil.getServerOptions(options);
      this.subscriber = subscriber;

      //console.log("SERVER OPTIONS ",this.serverOptions);

  }

   get serverOptions(){
    return this._serverOptions;
  }

  static stringifyBodyIfItExists(obj){
    const convertToJSON = R.when(R.propIs(Object, 'body'), R.compose( R.over(R.lensProp('body'), JSON.stringify) ))

    return convertToJSON(obj);
  }

  static getServerOptions(opts){
    let options = R.pick(['header', 'body', 'method'], opts);
    options=ChannelFetchUtil.stringifyBodyIfItExists(options);
    //console.log("options ",options);

    let mergedOptions = R.mergeDeepRight(ChannelFetchUtil.baseOptions(), options);

    //console.log("merged options ",mergedOptions);

    return mergedOptions;
  }


  static baseOptions(){
    return {
      method: 'POST',
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }

    }
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