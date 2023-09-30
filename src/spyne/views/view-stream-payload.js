import {SpyneAppProperties} from '../utils/spyne-app-properties';
import {safeClone} from '../utils/safe-clone';
import { gc } from '../utils/gc';
import {
  compose,
  clone,
  fromPairs,
  toPairs,
  is,
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
    this.sendToDirectorStream(options);
  }

  sendToDirectorStream(payload) {
    let directorStream$ = SpyneAppProperties.channelsMap.getStream('DISPATCHER');
    const frozenPayload = safeClone(payload);
    //console.log("VS PAYLOAD ",frozenPayload);
    directorStream$.next(frozenPayload);
    payload = undefined;

    delete this;
  }

  static deepClone(o) {
    const isArr = is(Array);
    const isObj = is(Object);
    const isIter = ob => isArr(ob)===false && isObj(ob)===true;
    const isIterable = isIter(o);
    return isIterable ? compose(fromPairs, toPairs, clone)(o) : clone(o);

  }


  static getMouseEventKeys() {
    return ['altKey', 'bubbles', 'cancelBubble', 'cancelable', 'clientX', 'clientY', 'composed', 'ctrlKey', 'currentTarget', 'defaultPrevented', 'detail', 'eventPhase', 'fromElement', 'isTrusted', 'layerX', 'layerY', 'metaKey', 'movementX', 'movementY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'path', 'relatedTarget', 'returnValue', 'screenX', 'screenY', 'shiftKey', 'sourceCapabilities', 'srcElement', 'target', 'timeStamp', 'toElement', 'type', 'view', 'which', 'x', 'y'];
  }

  addMixins() {
    this.gc = gc;
  }
}
