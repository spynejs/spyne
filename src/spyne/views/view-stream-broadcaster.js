import {baseStreamsMixins} from '../utils/mixins/base-streams-mixins';
import {ifNilThenUpdate, convertDomStringMapToObj} from '../utils/frp-tools';

const Rx = require('rxjs');
const R = require('ramda');

export class ViewStreamBroadcaster {
  constructor(props, broadcastFn) {
    this.addMixins();
    this.props = props;
    this.broadcastFn = broadcastFn;
    this.broadcaster(this.broadcastFn);
  }

  addDblClickEvt(q) {
    let dblclick$ = Rx.Observable.fromEvent(q, 'click');
    // console.log('ADDING DBL CLICK ', q);
    let stream$ = dblclick$.buffer(dblclick$.debounceTime(250))
      .filter(p => p.length === 2)
      .map(p => {
        let data = R.clone(p[0]);
        // ADD DOUBLECLICK TO UI EVENTS
        data['typeOverRide'] = 'dblclick';
        return data;
      });
    return stream$;
  }

  //  ==================================================================
  // BROADCAST BUTTON EVENTS
  //  ==================================================================
  broadcast(args) {
    // payloads to send, based on either the array or the elements dataMap
    let channelPayloads = {
      'UI': this.sendUIPayload,
      'ROUTE': this.sendRoutePayload
    };
    // spread operator to select variables from arrays
    let [selector, event, local] = args;

    //console.log('args is ',args);
    // btn query
    // let query = this.props.el.querySelectorAll(selector);
    let channel; // hoist channel and later check if chnl exists
    let query = this.props.el.querySelectorAll(selector);
    let isLocalEvent = local!==undefined;
    let addObservable = (q) => {
      // the  btn observable
      let observable = event !== 'dblClick'
        ? Rx.Observable.fromEvent(q, event)
        : this.addDblClickEvt(q);
      // select channel and data values from either the array or the element's dom Map
      channel =  q.dataset.channel;//ifNilThenUpdate(chnl, q.dataset.channel);
     let data = {};// convertDomStringMapToObj(q.dataset);
      data['payload'] = convertDomStringMapToObj(q.dataset);
      data.payload = R.omit(['channel'], data.payload);
      data['channel'] = channel;
      // payload needs cid# to pass verification

      // data['event'] = event;
      // data['el'] = q;
      data['srcElement'] = {};// R.pick(['cid','viewName'], data);
      data.srcElement['cid'] = this.props.id;
      data.srcElement['isLocalEvent'] = isLocalEvent;
      data.srcElement['viewName'] = this.props.name;
      data.srcElement['event'] = event;
      data.srcElement['el'] = q;
      // select the correct payload
      let channelPayload = channel !== undefined ? channelPayloads[channel] : channelPayloads['UI'];
      // run payload
      channelPayload(observable, data);
    };

    if (query === undefined || query.length <= 0) {
      query = this.props.el;
      addObservable(query, event);
    } else {
      query.forEach = Array.prototype.forEach;
      query.forEach(addObservable);
    }
  }

  broadcaster(arrFn) {
    let broadcastArr = arrFn();
    broadcastArr.forEach(args => this.broadcast(args));
  }

  //  =================================================================
  addMixins() {
    //  ==================================
    // BASE STREAM MIXINS
    //  ==================================
    let streamMixins = baseStreamsMixins();
    this.sendUIPayload = streamMixins.sendUIPayload;
    this.sendRoutePayload = streamMixins.sendRoutePayload;
    this.createLifeStreamPayload = streamMixins.createLifeStreamPayload;
  }
}
