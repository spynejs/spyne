import { Channel } from './channel.js'
import { ChannelFetchUtil } from '../utils/channel-fetch-util.js'
import { path, pick, mergeDeepRight, all, allPass, either, values, defaultTo, reject, compose, isNil } from 'ramda'

export class ChannelFetch extends Channel {
  /**
   * @module ChannelFetch
   * @type extendable
   * @desc
   * <p>ChannelFetch extends Channel and is designed to create a Channel from fetched http data.</p>
   * <p>A ChannelFetch instance can be created with just the channel name and url properties.</p>
   * <p>The data is fetched once, but the ChannelFetch's data is always available to other Channel and ViewStream instances</p>
   *
   * <h3>The ChannelFetch Class</h3>
   * <ul>
   * <li>Extends Channel and uses the ChannelFetchUtil to make any type of http(s) request.</li>
   * <li>Requires a url property at instantiation.</li>
   * <li>The response data is published as a ChannelPayload.</li>
   * <li>The action for the returned ChannelFetch data is always in the following format, "CHANNEL_NAME_RESPONSE_EVENT"</li>
   * <li>The default request type is a GET request that returns a JSON object.</li>
   * <li>However, any type of request and return type can be configured by using the body property when creating the instance.</li>
   * <li>The mapFn gives access to the returned response and can be use to parse the data before it is published to other Channels and ViewStream instances.</li>
   * <li>Channel Fetch will send the last response to future subscribers, and will not make further http(s) requests unless directed to do  so.</li>
   * <li>Data can be Fetched again, by sending a "CHANNEL_NAME_UPDATE_RESPONSE_EVENT" action from a ViewStream's sendInfoToChannel method.</li>
   * </ul>
   *
   * @constructor
   * @param {String} name
   * @param {Object} props
   *
   * @property {String} name - = undefined; The registered name for the channel.
   * @property {String} props.url - = undefined; The url to be fetched.
   * @property {Function} props.mapFn - = undefined; This method is called immediately after the fetched response and behaves like any map method.
   * @property {Object} props.body - = undefined; This will update the options, including header options, sent along with the fetch request. Default options uses a GET request.
   *
   * @example
   * TITLE["<h4>A ViewStream Instance Sending A Fetch Update Request</h4>"]
   * const action = "CHANNEL_FETCHCHANNEL_NAME_UPDATE_RESPONSE_EVENT";
   * const url = "//site.com/json/";
   * const body = {
   *     method: "POST"
   * }
   *
   * this.sendInfoToChannel("CHANNEL_FETCHCHANNEL_NAME", {action, url, body});
   *
   *
   */

  constructor(name, props = {}) {
    // ALLOW FOR GENERIC MAP PROPERTY

    ChannelFetch.validateMapMethod(props, name)

    if (props.map !== undefined) {
      props.mapFn = props.map
    }
    props.extendedActionsArr = [
      `${name}_RESPONSE_EVENT`,
      [`${name}_REQUEST_EVENT`, 'onFetchUpdate']
    ]
    props.sendCachedPayload = true
    super(name, props)
  }

  static validateMapMethod(props, name, testMode = false) {
    const isNotEmpty = arr => arr.length >= 1
    const isNotFunction = val => typeof (val) !== 'function'
    const isUndefinedOrWrongType = either(isNil, isNotFunction)
    const isUndefined = all(isUndefinedOrWrongType)
    const isNotUndefinedAndIsNotEmpty = allPass([isUndefined, isNotEmpty])
    const mapMethodIsInvalid = compose(isNotUndefinedAndIsNotEmpty, values, pick(['map', 'mapFn']))(props)

    if (mapMethodIsInvalid) {
      if (testMode === false) {
        console.warn(`Spyne Warning: The map method for ChannelFetch, ${name}, appears to be invalid`)
      }
      return false
    }

    return true
  }

  onRegistered(props = this.props) {
    if (props?.pause !== true) {
      this.startFetch()
    }
  }

  addRegisteredActions(name) {
    const arr = [
      'CHANNEL_RESPONSE_EVENT',
      ['CHANNEL_UPDATE_RESPONSE_EVENT', 'onFetchUpdate'],
      ['CHANNEL_FETCH_REQUEST_EVENT', 'onFetchUpdate']
    ]

    const extendedArr = compose(defaultTo([]), path(['props', 'extendedActionsArr']))
    return arr.concat(extendedArr(this))
  }

  startFetch(options = {}, subscriber = this.onFetchReturned.bind(this)) {
    const fetchProps = this.consolidateAllFetchProps(options)
    return new ChannelFetchUtil(fetchProps, subscriber, false, this.props.name)
  }

  onFetchUpdate(evt) {
    const propsOptions = this.getPropsForFetch(evt)
    this.startFetch(propsOptions)
  }

  onFetchReturned(streamItem) {
    return this.createChannelPayloadItem(streamItem)
  }

  createChannelPayloadItem(payload, action = `${this.props.name}_RESPONSE_EVENT`) {
    const { name, sendCachedPayload, url } = this.props
    const srcElement = { name, sendCachedPayload, url }
    this.sendChannelPayload(action, payload, srcElement)
  }

  getPropsForFetch(evt) {
    const dataObj = path(['viewStreamInfo', 'payload'], evt)
    return pick(['mapFn', 'url', 'header', 'body', 'mode', 'method', 'responseType', 'debug'], dataObj)
  }

  consolidateAllFetchProps(options, props = this.props) {
    const propsOptions = pick(['mapFn', 'url', 'header', 'body', 'mode', 'method', 'responseType', 'debug'], props)
    const mergeOptions = (o1, o2) => mergeDeepRight(o1, o2)
    const filterOutUndefined = reject(isNil)
    return compose(filterOutUndefined, mergeOptions)(propsOptions, options)
  }

  get observer() {
    return this.observer$
  }
}
