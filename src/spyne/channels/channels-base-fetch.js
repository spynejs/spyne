import { ChannelsBase } from './channels-base';
import { ChannelFetchUtil } from '../utils/channel-fetch-util';
import {path, pick, mergeRight, mergeDeepRight, reject, compose, isNil} from 'ramda';

export class ChannelsFetch extends ChannelsBase {
  /**
   * @module ChannelsFetch
   * @desc
   * Extends ChannelBase and addes the ChannelFetchUtil to create a system that is able to coordinate with an api. <span class='break'/>
   * The fetch request can be updated from any ViewStream instance by using the sendInfoChannel method. <span class='break'/>
   * It is recommended that a ChannelsFetch instance be created for each type of request. For example, one ChannelsFetch can read the amount available from a checking account, while another instance writes to that checking account.
   * A main channel can maintain the state of both.
   *
   * @constructor
   * @param {String} name
   * @param {Object} props
   *
   * @property {String} name - = undefined; The regsitered name for the channel.
   * @property {String} props.url - = undefined; The url to be fetched.
   * @property {Object} props.body - = undefined; This will update the options sent along with the fetch request. Default options uses a GET request.
   *
   * @example
   * // updating the fetch request from a ViewStream instance
   * const action = "CHANNEL_UPDATE_DATA_EVENT";
   * const url = "//site.com/json/";
   * const body = {
   *     method: "POST"
   * }
   *
   * this.sendInfoToChannel("CHANNEL_MY_FETCH", {action, url, body});
   *
   */


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
