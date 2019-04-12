import { Channel } from './channel';
import { ChannelFetchUtil } from '../utils/channel-fetch-util';
import {path, pick, mergeRight, mergeDeepRight, defaultTo, reject, compose, isNil} from 'ramda';

export class ChannelFetch extends Channel {
  /**
   * @module ChannelFetch
   * @type extendable
   * @desc
   * <p>Extends Channel and uses the ChannelFetchUtil to make any type of http(s) request.</p>
   * <p>Requires a url property at instantiation.</p>
   * <p>The response data is published as a ChannelPayload along with the CHANNEL_UPDATE_DATA_EVENT action.</p>
   * <p>The default request type is a GET request that returns a JSON object.</p>
   * <p>However, any type of request and return type can be configured by adding a body property when creating the instance.</p>
   * <p>Channel Fetch will send the last response to future subscribers, and will not make further http(s) requests unless directed to do  so.</p>
   * <p>Data can be Fetched again, by sending a "CHANNEL_UPDATE_DATA_EVENT" action from a ViewStream's sendInfoToChannel method.</p>
   *
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
    props.extendedActionsArr = [
      `${name}_DATA_EVENT`,
      [`${name}_UPDATE_DATA_EVENT`, 'onFetchUpdate']
    ];
    props.sendCurrentPayload = true;
    super(name, props);
  }

  onChannelInitialized() {
    this.startFetch();
  }

  addRegisteredActions(name) {
    let arr = [
      'CHANNEL_DATA_EVENT',
      ['CHANNEL_UPDATE_DATA_EVENT', 'onFetchUpdate']
    ];

    let extendedArr = compose(defaultTo([]), path(['props', 'extendedActionsArr']));
    return arr.concat(extendedArr(this));
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

  createChannelPayloadItem(payload, action = `${this.props.name}_DATA_EVENT`) {
    console.log("FETCH ",this.props.name, {action,payload});
    // return new ChannelPayload(this.props.name, action, payload);
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
