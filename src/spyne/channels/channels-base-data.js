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
    this.startFetch();
  }


  addRegisteredActions() {
    return [
      'CHANNEL_DATA_EVENT',
        ['CHANNEL_UPDATE_DATA_EVENT', 'onFetchUpdate']
    ];
  }


  startFetch(options={}, subscriber=this.onFetchReturned.bind(this)){
    let fetchProps = this.consolidateAllFetchProps(options);
    new ChannelFetchUtil(fetchProps, subscriber);
  }

  onFetchUpdate(evt){
    let propsOptions = this.getPropsForFetch(evt);
    this.startFetch(propsOptions);

  }

  onFetchReturned(streamItem){
    let payload = this.createChannelStreamItem(streamItem);
    this.observer$.next(payload);
  }

  createChannelStreamItem (payload, action='CHANNEL_DATA_EVENT') {
    return new ChannelStreamItem(this.props.name, action, payload);
  }

  getPropsForFetch(evt){
    let dataObj = R.path(['observableData', 'payload'], evt);
    return R.pick(["mapFn", "url", "header", "body","mode","method", "responseType", "debug"], dataObj);
  }

   consolidateAllFetchProps(options, props=this.props){
    //let currentOptions = R.merge({url}, options);
    let propsOptions = R.pick(["mapFn", "url", "header", "body","mode","method", "responseType", "debug"], props);
    const mergeOptions = (o1,o2) => R.mergeDeepRight(o1,o2);
    const filterOutUndefined = R.reject(R.isNil);
    return R.compose(filterOutUndefined, mergeOptions)(propsOptions, options);
  }

  get observer() {
    return this.observer$;
  }


}
