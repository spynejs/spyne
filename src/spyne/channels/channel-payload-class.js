import {
  mergeAll,
  clone,
  fromPairs,
  toPairs,
  compose,
  mergeDeepRight,
  mergeRight,
  pathEq,
  includes,
  pickAll,
  __,
  lte, defaultTo, prop, is, mapObjIndexed,
} from 'ramda';
import {SpyneAppProperties} from '../utils/spyne-app-properties';

export class ChannelPayload {
  /**
   *
   * All Channel data is published using this interface.
   * @module ChannelPayload
   * @type internal
   *
   * @constructor
   * @param {String} channelName
   * @param {String} action
   * @param {Object} payload
   * @param {Element} srcElement
   * @param {Event} event
   *
   * @property {String} channelName - = undefined; The name of the Channel that is sending the payload.
   * @property {String} action - = undefined; An action string that has been registered within the Channel's addRegisteredActions method.
   * @property {Object} payload - = undefined; The data object.
   * @property {HTMLElement} srcElement - = {}; This is populated when triggered from a ViewStream instance.
   * @property {UIEvent} event - = undefined; The UIEvent, if any.
   * @returns Validated ChannelPayload json object
   */
  constructor(channelName, action, payload, srcElement, event, timeLabel) {
    let channel = channelName;
    //payload = ChannelPayload.deepFreeze(payload);

    if(timeLabel){
      console.time(timeLabel);
    }

    let channelPayloadItemObj = { channelName, action, srcElement, event };
   // Object.defineProperty(channelPayloadItemObj, 'payload', {get: () => clone(payload)});
    const frozenPayload = ChannelPayload.deepFreeze(payload);
    channelPayloadItemObj['payload'] = frozenPayload;
    /**
     * This is a convenience method that helps with destructuring by merging all properties.
     *
     * @returns
     * JSON Object
     *
     * @example
     * TITLE['<h4>Destructuring Properties using the ChannelPayload props Method</h4>']
     * let {el, action, myVal} = payload.props();
     *
     *
     */



    if (SpyneAppProperties.debug === true){
      if (payload.hasOwnProperty('payload')){
        let payloadStr = JSON.stringify(payload);
        console.warn(`Spyne Warning: the following payload contains a nested payload property which may create conflicts: Action: ${action}, ${payloadStr}`);
      }

      const channelActionsArr = SpyneAppProperties.getChannelActions(channel);

      ChannelPayload.validateAction(action, channel, channelActionsArr);


    }



   /* channelPayloadItemObj.props = () => clone(mergeAll([
        {payload:ChannelPayload.deepClone(channelPayloadItemObj.payload)},
      channelPayloadItemObj.payload,
        { channel },
        { event: event },
        {srcElement: srcElement},
                channelPayloadItemObj.srcElement, {
        action: channelPayloadItemObj.action }
         ]));
*/


    const channelPayloadItemObjProps = {
      $dir: {
        get: () => channelPayloadItemObj._dir,
        set: (val) => channelPayloadItemObj._dir=val
      }
    }



    if (channel === 'CHANNEL_ROUTE') {
      //channelPayloadItemObj['location'] = ChannelPayload.getLocationData();
      channelPayloadItemObjProps['location'] = {
        get: ()=>ChannelPayload.getLocationData()
      }
     /* channelPayloadItemObjProps['routeData'] = {
        get: ()=>prop('routeData', frozenPayload)
      }
*/
    }

    channelPayloadItemObj._dir = undefined;

    Object.defineProperties(channelPayloadItemObj, channelPayloadItemObjProps)

    if(timeLabel){
      console.timeEnd(timeLabel);
    }
    return channelPayloadItemObj;
  }

  static validateAction(action, channel, arr) {
    let isInArr = includes(action, arr);
    if (isInArr === false && SpyneAppProperties.initialized === true) {
      console.warn(`warning: Action: '${action}' is not registered within the ${channel} channel!`);
    }
    return isInArr;
  }

  static getLocationData() {
    const locationParamsArr = [
      'href',
      'origin',
      'protocol',
      'host',
      'hostname',
      'port',
      'pathname',
      'search',
      'hash'];
    return pickAll(locationParamsArr, window.location);
  }

  static getStreamItem() {

  }

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
}
