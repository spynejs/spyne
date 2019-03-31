import {mergeAll, includes, pickAll} from 'ramda';

export class ChannelPayload {
  /**
   *
   * All payloads sent from Channels returns an instance of this class
   * @module ChannelPayload
   *
   * @constructor
   * @param {String} channelName
   * @param {String} action
   * @param {Object} channelPayload
   * @param {Element} srcElement
   * @param {Event} event
   *
   * @property {String} channelName - = undefined; The channel name used to register the channel.
   * @property {String} action - = undefined; An action string that has been registered in the registeredActions method.
   * @property {Object} channelPayload - = undefined; The data object returned; if the action is from a UI Element, this would typically be the dataset values.
   * @property {HTMLElement} srcElement - = {}; This is populated when the action is triggered from an element.
   * @property {UIEvent} event - = undefined; This will be populated if the event is triggered by the browser.
   * @returns Validated payload object
   */
  constructor(channelName, action, channelPayload, srcElement, event) {
    let channel = channelName;

    let channelPayloadItemObj = { channelName, action, channelPayload, srcElement, event };

    /**
     * This is a convenience method that helps with descructuring by merging all properties.
     *
     * @returns
     * Object
     *
     * @example
     * let {el, action, myVal} = payload.props();
     *
     *
     */
    channelPayloadItemObj.props = () => mergeAll([channelPayloadItemObj.channelPayload, { channel }, { event }, { action: channelPayloadItemObj.action }, channelPayloadItemObj.srcElement, channelPayloadItemObj.event]);
    const channelActionsArr = window.Spyne.getChannelActions(channel);

    ChannelPayload.validateAction(action, channel, channelActionsArr);

    if (channel === 'CHANNEL_ROUTE') {
      channelPayloadItemObj['location'] = ChannelPayload.getLocationData();
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
