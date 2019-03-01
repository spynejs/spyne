//import * as Rx from "rxjs-compat";

import {ChannelsBase} from './channels-base';
import {ChannelStreamItem} from './channel-stream-item';
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
    let url = R.path(['observableData', 'payload', 'dataUrl'], p);

    if (url === undefined){
      console.warn("SPYNE Warning: dataUrl parameter is required to update data", url);
    } else {
      this.props.dataUrl = url;
      this.fetchData();
    }
  }

  onDataFetched(streamItem){
    this.observer$.next(streamItem);
  }


  fetchData() {
    const tapLog = p => console.log('data returned :',this.props.name, p);
    const mapFn = this.props.map !== undefined ? this.props.map : (p) => p;
    const createChannelStreamItem = (payload) => {
      let action = 'CHANNEL_DATA_EVENT';
      return new ChannelStreamItem(this.props.name, action, payload);
    };


    let response$ = from(window.fetch(this.props.dataUrl))
      .pipe(flatMap(r => from(r.json())),
      map(mapFn),
      map(createChannelStreamItem),
     // tap(tapLog),
      publish());

    response$.connect();

    response$.subscribe(this.onDataFetched.bind(this))
  }
}
