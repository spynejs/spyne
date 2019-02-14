import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ChannelsBase} from '../channels/channels-base';

export class ChannelViewStreamLifecycle extends ChannelsBase {

  constructor(props = {}) {

    super(props);
    this.props.name = 'VIEWSTREAM_LIFECYCLE';
    this.observer$ = new Subject();
  }

  addRegisteredActions() {
    return [
      'VIEWSTREAM_RENDERED',
      'VIEWSTREAM_DISPOSED'
    ];
  }

  onIncomingObserverableData(obj) {
    let data = obj.observableData;
    let action = data.action;
    let payload = R.prop('srcElement', data);
    this.onSendEvent(action, payload);
  }

  onSendEvent(actionStr, payload = {}) {
    const action = this.channelActions[actionStr];
    const srcElement = {};
    const event = undefined;
    this.sendStreamItem(action, payload, srcElement, event);
  }

}