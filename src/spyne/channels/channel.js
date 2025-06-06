import { registeredStreamNames } from './channels-config.js'
import { ChannelPayload } from './channel-payload-class.js'
import { SpyneAppProperties } from '../utils/spyne-app-properties.js'
import { RouteChannelUpdater } from '../utils/route-channel-updater.js'

import { ReplaySubject, Subject, forkJoin, EMPTY } from 'rxjs'
import { filter, map, take, combineLatestWith } from 'rxjs/operators'
import {
  ifElse,
  identity,
  head,
  mergeAll,
  objOf,
  view,
  is,
  chain,
  lensIndex,
  always,
  fromPairs,
  path,
  isEmpty,
  equals,
  prop,
  propEq
  , map as rMap
} from 'ramda'

export class Channel {
  /**
   * @module Channel
   * @type extendable
   *
   * @desc
   * <p>The Channel component wraps methods and functionality around an RxJs Subject, to create a one-way data flow between itself and other Channels and ViewStreams.</p>
   * <p>Channels get data by importing json objects, subscribing to other Channels and by parsing ViewStream info.</p>
   * <h3>The Basic Channel Structure</h3>
   * <ul>
   * <li>Channels requires a unique name, for example, <b>CHANNEL_MYCHANNEL</b>, which components use to select and subscribe to any channel.</li>
   * <li>Channels are instantiated and 'registered' with the LINK['SpyneApp', 'spyne-app'].</li>
   * <li>Channels remain persistent and are not deleted.</li>
   * </ul>
   * <h3>Components that extend Channel</h3>
   * <ul>
   * <li>The four Spyne Channels, LINK['SpyneChannelUI', 'spyne-channel-u-i'], LINK['SpyneChannelWindow', 'spyne-channel-window'], LINK['SpyneChannelRoute', 'spyne-channel-route'] and LINK['SpyneChannelLifecycle', 'spyne-channel-lifecycle'], all extend Channel.</li>
   * <li>ChannelFetch also extends Channel, adds a ChannelFetchUtil component to immediately publish fetched responses.</li>
   * </ul>
   * <h3>Sending ChannelPayloads</h3>
   *   <p>Channels send data using the <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="channel-send-channel-payload"  href="/guide/reference/channel-send-channel-payload" >sendChannelPayload</a>
   method.</p>
   *
   *
   * <h3>Receiving Data from ViewStream Instances</h3>
   * <p>ViewStreams can send data to any custom channel using the <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-send-into-to-channel"  href="/guide/reference/view-stream-send-info-to-channel" >sendInfoToChannel</a>
   method. Channels cam listen to any ViewStream data directed to itself through the default method, <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="channel-on-view-stream-info"  href="/guide/reference/channel-on-view-stream-info" >onViewStreamInfo</a>. </p>
   *
   *
   * @example
   * TITLE["<h4>Registering a New Channel Instance</h4>"]
   * SpyneApp.register(new Channel("CHANNEL_MYCHANNEL");
   *
   *
   * @constructor
   * @param {string} CHANNEL_NAME
   * @param {Object} props This json object takes in parameters to initialize the channel
   * @property {String} CHANNEL_NAME - = undefined; This will be the registered name for this channel.
   * @property {Object} props - = {}; The props objects allows for custom properties for the channel.
   * @property {Object} props.sendCachedPayload - = false; Publishes its most current payload to late subscribers, when set to true.
   *
   */
  constructor(CHANNEL_NAME, props = {}) {
    this.addRegisteredActions.bind(this)
    this.createChannelActionsObj(CHANNEL_NAME, props.extendedActionsArr)

    // Basic props setup
    props.name = CHANNEL_NAME
    props.defaultActions = props.data !== undefined ? [`${props.name}_EVENT`] : []
    this.props = props

    this.props.isRegistered = false
    this.props.isProxy =
      this.props.isProxy === undefined ? false : this.props.isProxy

    // Determine a default from presence of props.data
    const defaultCachedPayloadBool = this.props.data !== undefined

    // If props.replay is defined, override sendCachedPayload with it.
    // Otherwise, use the existing sendCachedPayload property or default.
    if (typeof this.props.replay !== 'undefined') {
      this.props.sendCachedPayload = this.props.replay
    } else {
      this.props.sendCachedPayload =
        this.props.sendCachedPayload === undefined
          ? defaultCachedPayloadBool
          : this.props.sendCachedPayload
    }

    this.sendPayloadToRouteChannel = new RouteChannelUpdater(this)
    this.createChannelActionMethods()

    // Set up streams
    this.streamsController = SpyneAppProperties.channelsMap
    const observer$ = this.getMainObserver()
    this.checkForPersistentDataMode = Channel.checkForPersistentDataMode.bind(this)
    this.observer$ = this.props.observer = observer$

    // Subscribe to DISPATCHER
    const dispatcherStream$ = this.streamsController.getStream('DISPATCHER')
    const payloadPredByChannelName = propEq(props.name, 'name')
    dispatcherStream$
      .pipe(filter(payloadPredByChannelName))
      .subscribe((val) => this.onReceivedObservable(val))
  }

  getMainObserver() {
    if (this.streamsController === undefined) {
      console.warn(`Spyne Warning: The following channel, ${this.props.name}, appears to be registered before Spyne has been initialized.`)
    }

    const proxyExists = this.streamsController.testStream(this.props.name)

    if (proxyExists === true) {
      return this.streamsController.getProxySubject(this.props.name, this.props.sendCachedPayload)
    } else {
      return this.props.sendCachedPayload === true ? new ReplaySubject(1) : new Subject()
    }
  }

  //  OVERRIDE INITIALIZATION METHOD
  /**
   * <p>(Deprecated. Use onRegistered). This method is empty and is called as soon as the Channel has been registered.</p>
   * <p>Tasks such as subscribing to other channels, and sending initial payloads can be added here.</p>
   */
  onChannelInitialized() {

  }

  //  OVERRIDE INITIALIZATION METHOD
  /**
   * <p>This method is empty and is called as soon as the Channel has been registered.</p>
   * <p>Tasks such as subscribing to other channels, and sending initial payloads can be added here.</p>
   */
  onRegistered(props = this.props) {
    if (props.data !== undefined) {
      const action = Object.keys(this.channelActions)[0]
      // console.log("CHANNELS ACTIONS IS ",this.channelActions);
      // Object(this.channelActions).keys[0];
      this.sendChannelPayload(action, props.data)
    }
  }

  get isProxy() {
    return this.props.isProxy
  }

  get channelName() {
    return this.props.name
  }

  /**
   *
   * @desc
   * returns the source observable for the channel
   */
  get observer() {
    return this.observer$
  }

  checkForTraits() {
    const addTraits = (traits) => {
      if (traits.constructor.name !== 'Array') {
        traits = [traits]
      }
      const addTrait = (TraitClass) => {
        return new TraitClass(this)
      }

      traits.forEach(addTrait)
    }

    if (this.props.traits !== undefined) {
      addTraits(this.props.traits)
    }
  }

  // DO NOT OVERRIDE THIS METHOD
  initializeStream() {
    this.checkForTraits()
    this.onChannelInitialized()
    this.checkForPersistentDataMode()
    this.onRegistered()
    this.props.isRegistered = true
  }

  static checkForPersistentDataMode(props = this.props, actionsObj = this.channelActions) {
    const actionsObjIsEmpty = isEmpty(actionsObj)
    const dataIsAdded = prop('data', props) !== undefined
    const autoSetToCachedPayload = actionsObjIsEmpty === true && dataIsAdded === true
    const setDefaultActionsObj = () => {
      const { name } = props
      const actionStr = `${name}_EVENT`
      return {
        [actionStr] : actionStr
      }
    }

    if (autoSetToCachedPayload) {
      props.sendCachedPayload = true
      actionsObj = setDefaultActionsObj()

      if (this.channelActions !== undefined) {
        this.channelActions = actionsObj
      }
    }

    // console.log("PROPS IS ",{actionsObjIsEmpty, dataIsAdded, props, actionsObj}, this.channelActions)
    return { props, actionsObj }
  }

  setTrace(bool) {
  }

  createChannelActionsObj(name, extendedActionsArr = []) {
    const getActionVal = ifElse(is(String), identity, head)
    const mainArr = extendedActionsArr.concat(this.addRegisteredActions(name))
    const arr = rMap(getActionVal, mainArr)
    const converter = str => objOf(str, str)
    const obj = mergeAll(chain(converter, arr))
    this.channelActions = obj
  }

  createChannelActionMethods() {
    const defaultFn = 'onViewStreamInfo'
    const getActionVal = ifElse(is(String), identity, head)
    const delayCheckIfTraitMethodHasBeenAdded = (methodStr, val) => {
      const delayer = () => {
        if (typeof this[methodStr] !== 'function') {
          console.warn(`"${this.props.name}", REQUIRES THE FOLLOWING METHOD ${methodStr} FOR ACTION, ${val[0]}`)
        }
      }
      window.setTimeout(delayer, 100)
    }

    const getCustomMethod = val => {
      const methodStr = view(lensIndex(1), val)
      delayCheckIfTraitMethodHasBeenAdded(methodStr, val)
      return methodStr
    }

    const getArrMethod =  ifElse(is(String), always(defaultFn), getCustomMethod)

    const createObj = val => {
      const key = getActionVal(val)
      const method =  getArrMethod(val)
      return [key, method]
    }

    this.channelActionMethods = fromPairs(rMap(createObj, this.addRegisteredActions()))

    // console.log('the channel action methods ',this.channelActionMethods);
  }

  /**
   *
   * @desc
   * <p>Channels send along Action names along with its payload.</p>
   * <p>Before any action can be used, that action needs to be registered using this method.</p>
   * <p>ViewStream instances can filter ChannelPayloads by binding specific LINK['actions to local methods', 'view-stream-add-action-listeners'].</p>
   * <p>Forcing registration of actions allows Spyne to validate Actions, and is also a useful way to keep track of all Actions that are intended to be used.</p>
   *
   * @returns
   * Array of Strings
   *
   * @example
   * TITLE["<h4>Registering Actions in the addRegisteredActions method</h4>"]
   *    addRegisteredActions() {
   *     return [
   *        'CHANNEL_MY_CHANNEL_EVENT',
   *        'CHANNEL_MY_CHANNEL_UPDATE_EVENT'
   *       ];
   *      }
   *
   */
  addRegisteredActions() {
    let arr = []
    if (path(['props', 'data'], this)) {
      arr = [`${this.props.name}_EVENT`]
    }
    return arr
  }

  onReceivedObservable(obj) {
    this.onIncomingObservable(obj)
  }

  getActionMethodForObservable(obj) {
    obj.unpacked = true
    const defaultFn = this.onViewStreamInfo.bind(this)

    const methodStr = path(['data', 'action'], obj)
    const methodVal = prop(methodStr, this.channelActionMethods)

    let fn = defaultFn

    if (methodVal !== undefined && methodVal !== 'onViewStreamInfo') {
      const methodExists = typeof (this[methodVal]) === 'function'
      if (methodExists === true) {
        fn = this[methodVal].bind(this)
      }
    }

    return fn
  }

  onIncomingObservable(obj) {
    const eqsName = equals(obj.name, this.props.name)
    const { action, payload, srcElement } = obj.data
    // console.log("INCOMING ",{action, payload, srcElement}, {obj});
    const mergeProps = (d) => mergeAll([d, { action: prop('action', d) }, prop('payload', d), prop('srcElement', d)])
    const dataObj = obsVal => ({
      clone: () => mergeProps(obj.data),
      action,
      payload,
      srcElement,
      event: obsVal
    })
    const onSuccess = (obj) => obj.observable.pipe(map(dataObj))
      .subscribe(this.getActionMethodForObservable(obj))
    const onError = () => {}
    return eqsName === true ? onSuccess(obj) : onError()
  }

  /**
   *
   * <p>ViewSteam instances can send info to channels through its LINK['sendInfoToChannel, 'view-stream-send-info-to-channel'] method.</p>
   * <p>Data received from ViewStreams are directed to this method.</p>
   * <p>ViewStreams send data using the LINK['ViewStreamPayload', 'view-stream-payload'] format.</p>
   *
   * @param {ViewStreamPayload} obj
   *
   * @example
   * TITLE["<h4>Parsing Data Returned from a ViewStream Instance</h4>"]
   * onViewStreamInfo(obj){
   *     let data = obj.viewStreamInfo;
   *     let action = data.action;
   *     let newPayload = this.parseViewStreamData(data);
   *     this.sendChannelPayload(action, newPayload);
   * }
   *
   *
   */
  onViewStreamInfo(obs) {
  }

  /**
   *
   * @desc
   *
   * <p>This method takes an action, a data object and other properties to create and publish a LINK['ChannelPayload', 'channel-payload'] object.</p>
   * <p>Once the action and payload is validated, this method will publish the data by using the channel's source Subject next() method.
   * <p>This consistent format allows subscribers to understand how to parse any incoming channel data.</p>
   *
   * @param {String} action
   * @param {Object} payload
   * @param {HTMLElement} srcElement
   * @param {HTMLElement} event
   * @param {Observable} obs$
   * @property {String} action - = undefined; Required. An action is a string, typically in the format of "CHANNEL_NAME_ACTION_NAME_EVENT", and that has been added in the addRegisteredActions method.
   * @property {Object} payload - = undefined; Required. This can be any javascript object and is used to send any custom data.
   * @property {HTMLElement} srcElement - = Not Required. undefined; This can be either the element returned from the UI Channel, or the srcElement from a ViewStream instance.
   * @property {UIEvent} event - = undefined; Not Required. This will be defined if the event is from the UI Channel.
   * @property {Observable} obs$ - = this.observer; This default is the source observable for this channel.
   *
   * @example
   * TITLE['<h4>Publishing a ChannelPayload</h4>']
   * let action = "CHANNEL_MY_CHANNEL_REGISTERED_ACTION_EVENT";
   * let data = {foo:"bar"};
   * this.sendChannelPayload(action, data);
   *
   */
  sendChannelPayload(action, payload, srcElement = {}, event = {}, obs$ = this.observer$) {
    // MAKES ALL CHANNEL BASE AND DATA STREAMS CONSISTENT

    const channelPayloadItem = new ChannelPayload(this.props.name, action, payload, srcElement, event)
    // console.log("CHANNEL STREEM ITEM ",channelPayloadItem);

    // const onNextFrame = ()=>obs$.next(channelPayloadItem);
    // requestAnimationFrame(onNextFrame)

    obs$.next(channelPayloadItem)
  }

  /**
   *
   * <p>Allows channels to subscribe to other channels.</p>
   * <p>This method returns the source rxjs Subject for the requested Channel, which can be listened to by calling its subscribe method.</p>
   * <p>Knowledge of rxjs is not required to subscribe to and parse Channel data.</p>
   * <p>But accessing the rxjs Subject gives developers the ability to use all of the available rxjs mapping and observable tools.</p>
   *
   * @param {String} channelName The registered name of the requested channel.
   * @returns
   * The source rxjs Subject of the requested channel.
   * @example
   * TITLE["<h4>Subscribing to a Channel Using the getChannel method</h4>"]
   * let route$ = this.getChannel("CHANNEL_ROUTE")
   * route$.subscribe(localMethod);
   *
   *
   */
  getChannel(channelName, payloadFilter) {
    const isValidChannel = c => registeredStreamNames().includes(c)
    const error = c => console.warn(
        `channel name ${c} is not within ${registeredStreamNames}`)
    const startSubscribe = (c) => {
      const obs$ = this.streamsController.getStream(c).observer
      if (payloadFilter !== undefined) {
        return obs$.pipe(filter(payloadFilter))
      }

      return obs$
    }
    const fn = ifElse(isValidChannel, startSubscribe, error)
    return fn(channelName)
  }

  /**
   * Merge Channels is a convenience method to forkJoin Channel.observer$
   *
   * */

  mergeChannels(channelsArr, emitOnce = true) {
    // 1) Normalize inputs to Observables
    const channelObservables = channelsArr.map(item => {
      if (typeof item === 'string') {
        const chan$ = this.getChannel(item)
        return emitOnce ? chan$.pipe(take(1)) : chan$
      }
      return emitOnce ? item.pipe(take(1)) : item
    })

    // 2) Combine them
    let combined$
    if (emitOnce) { // one‑shot: snapshot then complete
      combined$ = forkJoin(channelObservables)
    } else { // live updates: combineLatestWith
      if (channelObservables.length === 0) {
        combined$ = EMPTY
      } else if (channelObservables.length === 1) {
        combined$ = channelObservables[0]
      } else {
        const [first$, ...rest$] = channelObservables
        combined$ = first$.pipe(combineLatestWith(...rest$))
      }
    }

    // 3) Map array → keyed object
    return combined$.pipe(
      map(resultsArr => {
        const obj = {}
        channelsArr.forEach((item, idx) => {
          const key = typeof item === 'string' ? item : `channel_${idx}`
          obj[key] = resultsArr[idx]
        })
        return obj
      })
    )
  }

  static checkForNotTrackFlag(props = {}) {
    if (props.doNotTrack === true) {
      SpyneAppProperties.doNotTrackChannel(props.channelName)
    }
  }
}
