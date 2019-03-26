import {mergeAll, includes, pickAll} from 'ramda';

export class ChannelPayloadItem {
  /**
   *
   * All payloads sent from Channels returns an instance of this class
   * @module ChannelPayloadItem
   *
   * @constructor
   * @param {String} channelName
   * @param {String} action
   * @param {Object} channelPayload
   * @param {Element} srcElement
   * @param {Event} event
   * @returns Validated Payload
   */
  constructor(channelName, action, channelPayload, srcElement, event) {
    let channel = channelName;

    let channelPayloadItemObj = { channel, action, channelPayload, srcElement, event };

    channelPayloadItemObj['props'] = () => mergeAll([channelPayloadItemObj.channelPayload, { channel }, { event }, { action: channelPayloadItemObj.action }, channelPayloadItemObj.srcElement, channelPayloadItemObj.event]);
    const channelActionsArr = window.Spyne.getChannelActions(channel);

    ChannelPayloadItem.validateAction(action, channel, channelActionsArr);

    if (channel === 'CHANNEL_ROUTE') {
      channelPayloadItemObj['location'] = ChannelPayloadItem.getLocationData();
    }

    return channelPayloadItemObj;
  }

  static validateAction(action, channel, arr) {
    let isInArr = includes(action, arr);
    if (isInArr === false && window.Spyne !== undefined) {
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

  static getMouseEventKeys() {
    return ['altKey', 'bubbles', 'cancelBubble', 'cancelable', 'clientX', 'clientY', 'composed', 'ctrlKey', 'currentTarget', 'defaultPrevented', 'detail', 'eventPhase', 'fromElement', 'isTrusted', 'layerX', 'layerY', 'metaKey', 'movementX', 'movementY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'path', 'relatedTarget', 'returnValue', 'screenX', 'screenY', 'shiftKey', 'sourceCapabilities', 'srcElement', 'target', 'timeStamp', 'toElement', 'type', 'view', 'which', 'x', 'y'];
  }
}
