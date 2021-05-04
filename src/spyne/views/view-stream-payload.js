import { uiValidations } from '../channels/channels-config';
import {SpyneAppProperties} from '../utils/spyne-app-properties';
//import { validate } from '../utils/channel-config-validator';
import { gc } from '../utils/gc';

export class ViewStreamPayload {
  /**
   *
   * Observables sent from ViewStreams to Channels are validated by this class
   *
   * @module ViewStreamPayload
   * @type internal
   *
   * @constructor
   * @param {String} name
   * @param {Observable} observable
   * @param {Object} data
   * @param {String} action
   * @param {Boolean} debug
   */
  constructor(name, observable, data, action = 'subscribe', debug = false) {
    this.addMixins();
    this.options = {
      'name' : name,
      'observable': observable,
      'data': data,
      'action': action
    };
   // this.getValidationChecks(name);
    this.sendToDirectorStream(this.options);
  }
  getValidationChecks(n) {
    let left  = e => console.warn(e);
    let right = val => this.onRunValidations(val);
    let channelExists = SpyneAppProperties.channelsMap.testStream(n);
    if (channelExists === true) {
      return right(uiValidations);
    } else {
      return left('payload Needs a Valid Stream Name!');//
    }
  }
  onRunValidations(checks) {
    /*validate(checks(), this.options).fold(
      this.onError.bind(this),
      this.onSuccess.bind(this));*/
  }
  onPayloadValidated(p) {
    this.sendToDirectorStream(p);
  }
  sendToDirectorStream(payload) {
    let directorStream$ = SpyneAppProperties.channelsMap.getStream('DISPATCHER');
    // console.log('payload is ',payload);
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
