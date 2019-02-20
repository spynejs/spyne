//import * as Rx from "rxjs-compat";

import {ChannelsBase} from './channels-base';
import {ChannelStreamItem} from './channel-stream-item';
//import  'whatwg-fetch';
// const R = require('ramda');
import {AsyncSubject, ReplaySubject, Subject, Observable, from} from "rxjs";
import {flatMap, map, multicast,publish,refCount,share, tap} from "rxjs/operators";

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
    let url = R.path(['observableData', 'payload', 'dataUrl'], p)
    this.props.dataUrl = url;

    console.log('update data ',this);

    this.fetchData();
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
      tap(tapLog),
      multicast(this.observer$));

    response$.connect();
  }
}
