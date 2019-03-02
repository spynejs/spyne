//import * as Rx from "rxjs-compat";
import {ChannelsBase} from './channels-base';
import {ChannelStreamItem} from './channel-stream-item';
import {ChannelFetchUtil} from '../utils/channel-fetch-util';
//import  'whatwg-fetch';
// const R = require('ramda');
import {from} from "rxjs";
import {flatMap, map,publish,tap} from "rxjs/operators";

export class ChannelsBaseData extends ChannelsBase {
  constructor(name, props = {}) {
    props.sendLastPayload = true;
    super(name, props);
  }


  onStreamInitialized(){
    this.fetchData();
  }

  get observer() {
    return this.observer$;
  }

  addRegisteredActions() {
    return [
      'CHANNEL_DATA_EVENT',
        ['CHANNEL_UPDATE_DATA_EVENT', 'onUpdateData']
    ];
  }

  onUpdateData(p){
    let dataObj = R.path(['observableData', 'payload'], p);
    let propsOptions = R.pick(["mapFn", "url", "header", "body","mode","method", "responseType", "debug"], dataObj);
    this.fetchData("", propsOptions);

  }

  onDataFetched(streamItem){
    console.log("DATA FETCHED ",streamItem);
    let payload = this.createChannelStreamItem(streamItem);
    this.observer$.next(payload);
  }

  createChannelStreamItem (payload, action='CHANNEL_DATA_EVENT') {
    return new ChannelStreamItem(this.props.name, action, payload);
  }

   getFetchProps(url, options, props=this.props){
    let currentOptions = R.merge({url}, options);
    let propsOptions = R.pick(["mapFn", "url", "header", "body","mode","method", "responseType", "debug"], props);
    const mergeOptions = (o1,o2) => R.mergeDeepRight(o1,o2);
    const filterOutUndefined = R.reject(R.isNil);
    return R.compose(filterOutUndefined, mergeOptions)(propsOptions, currentOptions);
  }

  fetchData(url=this.props.url, options={}, subscriber=this.onDataFetched.bind(this)){
      let fetchProps = this.getFetchProps(url, options);
      new ChannelFetchUtil(fetchProps, subscriber);
    // mapFn, url, {header,body,mode,method}, responseType, debug
  }

}
