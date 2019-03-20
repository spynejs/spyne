import { ChannelsBase } from '../channels/channels-base';
const R = require('ramda');

export class ChannelViewStreamLifecycle extends ChannelsBase {
  constructor(props = {}) {
    super('CHANNEL_LIFECYCLE', props);
  }

  addRegisteredActions() {
    return [
      'CHANNEL_LIFECYCLE_RENDERED_EVENT',
      'CHANNEL_LIFECYCLE_REMOVED_EVENT'
    ];
  }

  onIncomingViewStreamInfo(obj) {
    let data = obj.viewStreamInfo;
    let action = data.action;
    let payload = R.prop('srcElement', data);
    payload['action'] = action;
    this.onSendEvent(action, payload);
  }

  onSendEvent(actionStr, payload = {}) {
    const action = this.channelActions[actionStr];
    const srcElement = {};
    const event = undefined;
    const delayStream = () => this.sendChannelPayload(action, payload, srcElement, event);
    window.setTimeout(delayStream, 0);
  }
}
