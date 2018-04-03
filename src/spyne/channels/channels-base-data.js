import Rx from 'rxjs';
import {ChannelsBase} from './channels-base';
import {ChannelStreamItem} from './channel-stream-item';
import  'whatwg-fetch';
// const R = require('ramda');

export class ChannelsBaseData extends ChannelsBase {
  constructor(props = {}) {
    super(props);
    this.props = props;
    this.observer$ = new Rx.AsyncSubject();
    this.fetchData();
  }
  get observer() {
    return this.observer$;
  }

  addRegisteredActions() {
    return [
      'CHANNEL_DATA_EVENT'
    ];
  }

  fetchData() {
    const mapFn = this.props.map !== undefined ? this.props.map : (p) => p;

    const createChannelStreamItem = (payload) => {
      let action = 'CHANNEL_DATA_EVENT';
      return new ChannelStreamItem(this.props.name, action, payload);
    };

    let response$ = Rx.Observable.fromPromise(window.fetch(this.props.dataUrl))
      .flatMap(r => Rx.Observable.fromPromise(r.json()))
      .map(mapFn)
      .map(createChannelStreamItem)
      .multicast(this.observer$);

    response$.connect();
  }
}
