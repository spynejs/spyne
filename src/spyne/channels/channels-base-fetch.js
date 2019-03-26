import { ChannelsBase } from './channels-base';
import { ChannelFetchUtil } from '../utils/channel-fetch-util';
import {path, pick, mergeRight, mergeDeepRight, reject, compose, isNil} from 'ramda';

export class ChannelsFetch extends ChannelsBase {
  constructor(name, props = {}) {
    props.sendCurrentPayload = true;
    super(name, props);
  }

  onChannelInitialized() {
    this.startFetch();
  }

  addRegisteredActions() {
    return [
      'CHANNEL_DATA_EVENT',
      ['CHANNEL_UPDATE_DATA_EVENT', 'onFetchUpdate']
    ];
  }

  startFetch(options = {}, subscriber = this.onFetchReturned.bind(this)) {
    let fetchProps = this.consolidateAllFetchProps(options);
    return new ChannelFetchUtil(fetchProps, subscriber);
  }

  onFetchUpdate(evt) {
    let propsOptions = this.getPropsForFetch(evt);
    this.startFetch(propsOptions);
  }

  onFetchReturned(streamItem) {
    let payload = this.createChannelPayloadItem(streamItem);
    this.observer$.next(payload);
  }

  createChannelPayloadItem(payload, action = 'CHANNEL_DATA_EVENT') {
    // return new ChannelPayloadItem(this.props.name, action, payload);
    this.sendChannelPayload(action, payload);
  }

  getPropsForFetch(evt) {
    let dataObj = path(['viewStreamInfo', 'payload'], evt);
    return pick(['mapFn', 'url', 'header', 'body', 'mode', 'method', 'responseType', 'debug'], dataObj);
  }

  consolidateAllFetchProps(options, props = this.props) {
    // let currentOptions = mergeRight({url}, options);
    let propsOptions = pick(['mapFn', 'url', 'header', 'body', 'mode', 'method', 'responseType', 'debug'], props);
    const mergeOptions = (o1, o2) => mergeDeepRight(o1, o2);
    const filterOutUndefined = reject(isNil);
    return compose(filterOutUndefined, mergeOptions)(propsOptions, options);
  }

  get observer() {
    return this.observer$;
  }
}
