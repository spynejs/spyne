import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ChannelsBase} from '../channels/channels-base';
const R = require('ramda');

export class ChannelViewStreamLifecycle extends ChannelsBase {

  constructor(props = {}) {
    super('CHANNEL_VIEWSTREAM_LIFECYCLE', props);
  }

  addRegisteredActions() {
    return [
      'CHANNEL_VIEWSTREAM_LIFECYCLE_RENDERED_EVENT',
      'CHANNEL_VIEWSTREAM_LIFECYCLE_REMOVED_EVENT'
    ];
  }

  onIncomingObserverableData(obj) {
    let data = obj.observableData;
    let action = data.action;
    let payload = R.prop('srcElement', data);
    payload['action'] = action;
    this.onSendEvent(action, payload);
  }

  onSendEvent(actionStr, payload = {}) {
    const action = this.channelActions[actionStr];
    const srcElement = {};
    const event = undefined;
    this.sendStreamItem(action, payload, srcElement, event);
  }

}