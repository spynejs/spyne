
const R = require('ramda');

export class ChannelStreamItem {
  constructor(channelName, action, channelPayload, srcElement, event) {
    let channel = channelName;

    let channelStreamItemObj = {channel, action, channelPayload, srcElement, event};

    channelStreamItemObj['props'] = ()=>R.mergeAll([channelStreamItemObj.channelPayload, {channel},{event}, {action: channelStreamItemObj.action}, channelStreamItemObj.srcElement, channelStreamItemObj.event]);
    const channelActionsArr = window.Spyne.getChannelActions(channel);

    ChannelStreamItem.validateAction(action, channel, channelActionsArr);

    if (channel === 'CHANNEL_ROUTE') {
      channelStreamItemObj['location'] = ChannelStreamItem.getLocationData();
    }

    return channelStreamItemObj;
  }

  static validateAction(action, channel, arr) {
    let isInArr = R.contains(action, arr);
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
    return R.pickAll(locationParamsArr, window.location);
  }

  static getStreamItem() {

  }

  static getMouseEventKeys() {
    return ['altKey', 'bubbles', 'cancelBubble', 'cancelable', 'clientX', 'clientY', 'composed', 'ctrlKey', 'currentTarget', 'defaultPrevented', 'detail', 'eventPhase', 'fromElement', 'isTrusted', 'layerX', 'layerY', 'metaKey', 'movementX', 'movementY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'path', 'relatedTarget', 'returnValue', 'screenX', 'screenY', 'shiftKey', 'sourceCapabilities', 'srcElement', 'target', 'timeStamp', 'toElement', 'type', 'view', 'which', 'x', 'y'];
  }
}
