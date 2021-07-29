import { uiValidations } from '../channels/channels-config';
import {SpyneAppProperties} from '../utils/spyne-app-properties';
//import { validate } from '../utils/channel-config-validator';
import { gc } from '../utils/gc';
import {
  compose,
  clone,
  fromPairs,
  toPairs,
  __,
  lte, defaultTo, prop, is,
} from 'ramda';

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
    //this.addMixins();
    const options = {
      'name' : name,
      'observable': observable,
      'data': data,
      'action': action
    };
   // this.getValidationChecks(name);
    this.sendToDirectorStream(options);
  }
/*  getValidationChecks(n) {
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
    /!*validate(checks(), this.options).fold(
      this.onError.bind(this),
      this.onSuccess.bind(this));*!/
  }
  onPayloadValidated(p) {
    this.sendToDirectorStream(p);
  }*/
  sendToDirectorStream(payload) {
    let directorStream$ = SpyneAppProperties.channelsMap.getStream('DISPATCHER');
    const frozenPayload = ViewStreamPayload.deepClone(payload);
    //console.log('payload is ',frozenPayload);
    directorStream$.next(frozenPayload);
    payload = undefined;

    //this.gc();
    //console.timeEnd(label);

    delete this;
  }
/*
  onError(errors) {
    console.warn('payload failed due to:\n' + errors.map(e => '* ' + e).join('\n'));
    this.gc();
  }
  onSuccess(payload) {
    this.onPayloadValidated(payload);
  }
*/

  static deepClone(o) {
    const isArr = is(Array);
    const isObj = is(Object);
    const isIter = ob => isArr(ob)===false && isObj(ob)===true;
    const isIterable = isIter(o);
    return isIterable ? compose(fromPairs, toPairs, clone)(o) : clone(o);

  }



  static deepFreeze(o) {
    //return o;
    //return Object.freeze(o);
    const elIsDomElement = compose(lte(0), defaultTo(-1), prop('nodeType'));

    try {
      Object.freeze(o);
      Object.getOwnPropertyNames(o).forEach(function(prop) {
        if (o.hasOwnProperty(prop)
            && elIsDomElement(o[prop]) === false
            && o[prop] !== null
            && (typeof o[prop] === "object" || typeof o[prop] === "function")
            && !Object.isFrozen(o[prop])) {
          ChannelPayload.deepFreeze(o[prop]);
        }
      });

    } catch(e){
      //console.log("FREEZE ERR ",{o,e});
      return o;

    }

    return o;
  }

  static getMouseEventKeys() {
    return ['altKey', 'bubbles', 'cancelBubble', 'cancelable', 'clientX', 'clientY', 'composed', 'ctrlKey', 'currentTarget', 'defaultPrevented', 'detail', 'eventPhase', 'fromElement', 'isTrusted', 'layerX', 'layerY', 'metaKey', 'movementX', 'movementY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'path', 'relatedTarget', 'returnValue', 'screenX', 'screenY', 'shiftKey', 'sourceCapabilities', 'srcElement', 'target', 'timeStamp', 'toElement', 'type', 'view', 'which', 'x', 'y'];
  }



  addMixins() {
    //  ==================================
    // BASE CORE MIXINS
    //  ==================================
    // let coreMixins = baseCoreMixins();
    this.gc = gc;
  }
}
