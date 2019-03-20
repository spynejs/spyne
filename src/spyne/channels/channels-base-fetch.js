import { ChannelsBase } from './channels-base';
import { ChannelFetchUtil } from '../utils/channel-fetch-util';
import * as R from 'ramda';

export class ChannelsFetch extends ChannelsBase {
  constructor(name, props = {}) {
    props.sendLastPayload = true;
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
    let dataObj = R.path(['viewStreamInfo', 'payload'], evt);
    return R.pick(['mapFn', 'url', 'header', 'body', 'mode', 'method', 'responseType', 'debug'], dataObj);
  }

  consolidateAllFetchProps(options, props = this.props) {
    // let currentOptions = R.merge({url}, options);
    let propsOptions = R.pick(['mapFn', 'url', 'header', 'body', 'mode', 'method', 'responseType', 'debug'], props);
    const mergeOptions = (o1, o2) => R.mergeDeepRight(o1, o2);
    const filterOutUndefined = R.reject(R.isNil);
    return R.compose(filterOutUndefined, mergeOptions)(propsOptions, options);
  }

  get observer() {
    return this.observer$;
  }
}
