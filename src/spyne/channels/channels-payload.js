// import {baseCoreMixins} from '../utils/mixins/base-core-mixins';
import {uiValidations, routeValidations, lifestreamValidations} from './channels-config';
import {validate} from '../utils/channel-config-validator';
import {gc} from '../utils/gc';
// import {Right, Left, findInObj} from '../utils/frp-tools';
import {findInObj} from '../utils/frp-tools';
// import * as Rx from "rxjs-compat";

 const R = require('ramda');
export class ChannelsPayload {
  constructor(name, observable, data, action = 'subscribe', debug = false) {
    this.addMixins();
    this.options = {
     "name" : name,
      "observable": observable,
      "data": data,
      "action": action
    };
    this.getValidationChecks(name);
  }
  getValidationChecks(n) {
    let left  = e => console.warn(e);
    let right = val => this.onRunValidations(val);
    const channelMap = window.Spyne.channels.map;
    let obj = {
      UI:         uiValidations,
      ROUTE:      uiValidations,
      LIFESTREAM: uiValidations
    };
   // console.log('channel map ',channelMap.has(n), n, channelMap);

    if (channelMap.has(n) === true){
      return right(uiValidations)
    } else {
      return left ('payload Needs a Valid Stream Name!');//
    }
   /* return findInObj(obj, n, 'payload Needs a Valid Stream Name!')
      .fold(left, right);*/
  }
  onRunValidations(checks) {
    validate(checks(), this.options).fold(
      this.onError.bind(this),
      this.onSuccess.bind(this));
  }
  onPayloadValidated(p) {
    this.sendToDirectorStream(p);
  }
  sendToDirectorStream(payload) {
    let streamsController = window.Spyne.channels;// getGlobalParam('streamsController');
    let directorStream$ = streamsController.getStream('DISPATCHER');
    //console.log('payload is ',payload);
    directorStream$.next(payload);
    this.gc();
  }
  onError(errors) {
    console.warn('payload failed due to:\n' + errors.map(e => '* ' + e).join('\n'));
    this.gc();
  }
  onSuccess(payload) {
    this.onPayloadValidated(payload);
  }
  addMixins() {
    //  ==================================
    // BASE CORE MIXINS
    //  ==================================
    // let coreMixins = baseCoreMixins();
    this.gc = gc;
  }
}
