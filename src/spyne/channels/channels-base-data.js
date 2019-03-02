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
    this.initialized = false;
  }

  testFetch(){
    const subscriber = (p)=>{
      console.log("TEST URIL ",p);
    };

    let url = "http://spyne-cms.com/wp-json/acf/v3/posts/95";

    new ChannelFetchUtil({url, debug:true}, subscriber);

  }

  onStreamInitialized(){

   // this.fetchData();
    this.fetchDataNew();

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
    let url = R.path(['observableData', 'payload', 'url'], p);

    if (url === undefined){
      console.warn("SPYNE Warning: url parameter is required to update data", url);
    } else {
      this.props.url = url;
      this.fetchData();
    }
  }

  onDataFetched(streamItem){

    console.log("DATA STREAM ",streamItem);
    let payload = this.createChannelStreamItem(streamItem);
    console.log("DATA PAYLOAD ",payload);
    this.observer$.next(payload);
  }

  createChannelStreamItem (payload, action='CHANNEL_DATA_EVENT') {
    return new ChannelStreamItem(this.props.name, action, payload);
  }

   getFetchProps(url, options, props=this.props){
    let currentOptions = R.merge({url}, options);
    let propsOptions = R.pick(["mapFn", "url", "header", "body","mode","method", "responseType", "debug"], props);
    return R.mergeDeepRight(propsOptions, currentOptions);
  }

  fetchDataNew(url=this.props.url, options={}, subscriber=this.onDataFetched.bind(this)){
      let fetchProps = this.getFetchProps(url, options);

      new ChannelFetchUtil(fetchProps, subscriber);
    // mapFn, url, {header,body,mode,method}, responseType, debug

  }


  fetchData() {
    let options =  {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      responseType: 'json'
    };


    const tapLog = p => console.log('data returned :',this.props.name, p);
    const mapFn = this.props.map !== undefined ? this.props.map : (p) => p;
    const createChannelStreamItem = (payload) => {
      let action = 'CHANNEL_DATA_EVENT';
      return new ChannelStreamItem(this.props.name, action, payload);
    };


    let response$ = from(window.fetch(this.props.url, options))
      .pipe(tap(tapLog), flatMap(r => from(r[options.responseType]())),
        map(mapFn),
      map(createChannelStreamItem),
      publish());

    response$.connect();

    response$.subscribe(this.onDataFetched.bind(this))
  }
}
