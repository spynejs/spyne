import { registeredStreamNames } from './channels-config';
import { ChannelPayloadItem } from './channel-payload-item';
import { ReplaySubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import {ifElse, isString, identity, head, mergeAll, objOf, view, is, chain, lensIndex, always, fromPairs, path, equals, prop} from 'ramda';
const rMap = require('ramda').map;
const rMerge = require('ramda').mergeRight;

export class ChannelsBase {
  /**
   * @module ChannelsBase
   * @desc
   * This class is extended when creating a new Channel.
   *
   *
   * @constructor
   * @param {string} name This is the name that will be used to get the channel
   * @param {object} props This json object takes in parameters to initialize the channel
   * @property {Subject} this.observer$ = new Subject(); Depending on required behavior, this can be a Subject, BehaviorSubject or AsynSubject.
   *
   */
  constructor(name = 'observer', props = {}) {
    this.addRegisteredActions.bind(this);
    this.createChannelActionsObj();
    props.name = name;
    this.props = props;
    this.props.isProxy = this.props.isProxy === undefined ? false : this.props.isProxy;
    this.props.sendCurrentPayload = this.props.sendCurrentPayload === undefined ? false : this.props.sendCurrentPayload;
    this.createChannelActionMethods();
    this.streamsController = window.Spyne.channels;// getGlobalParam('streamsController');
    let observer$ = this.getMainObserver();

    this.observer$ = this.props['observer'] = observer$;
    let dispatcherStream$ = this.streamsController.getStream('DISPATCHER');
    dispatcherStream$.subscribe((val) => this.onReceivedObservable(val));
  }

  getMainObserver() {
    let proxyExists = this.streamsController.testStream(this.props.name);

    if (proxyExists === true) {
      return this.streamsController.getProxySubject(this.props.name, this.props.sendCurrentPayload);
    } else {
      return this.props.sendCurrentPayload === true ? new ReplaySubject(1) : new Subject();
    }
  }

  //  OVERRIDE INITIALIZATION METHOD
  /**
   * This method is called as soon as the channel is ready.
   */
  onChannelInitialized() {

  }

  get isProxy() {
    return this.props.isProxy;
  }

  get channelName() {
    return this.props.name;
  }

  /**
   *
   * @returns
   * returns the source observable for the channel
   */
  get observer() {
    return this.observer$;
  }

  // DO NOT OVERRIDE THIS METHOD
  initializeStream() {
    this.onChannelInitialized();
  }

  setTrace(bool) {
  }

  createChannelActionsObj() {
    const getActionVal = ifElse(is(String), identity, head);
    let arr = rMap(getActionVal, this.addRegisteredActions());
    // console.log("ARR IS ",arr);
    const converter = str => objOf(str, str);
    let obj = mergeAll(chain(converter, arr));
    this.channelActions = obj;
  }

  createChannelActionMethods() {
    const defaultFn = 'onViewStreamInfo';
    const getActionVal = ifElse(is(String), identity, head);
    const getCustomMethod = val => {
      const methodStr = view(lensIndex(1), val);
      const hasMethod = typeof (this[methodStr]) === 'function';
      if (hasMethod === true) {
        this[methodStr].bind(this);
      } else {
        console.warn(`"${this.props.name}", REQUIRES THE FOLLOWING METHOD ${methodStr} FOR ACTION, ${val[0]}`);
      }

      return methodStr;
    };

    const getArrMethod =  ifElse(is(String), always(defaultFn), getCustomMethod);

    const createObj = val => {
      let key = getActionVal(val);
      let method =  getArrMethod(val);
      return [key, method];
    };

    this.channelActionMethods = fromPairs(rMap(createObj, this.addRegisteredActions()));

    // console.log('the channel action methods ',this.channelActionMethods);
  }

  /**
   *
   * @desc
   * Any action that is to be used by the channel is required to be added here.
   * If the action is added as a paired array, then the second value will be the method directed if a viewstream sends info.
   *
   */
  addRegisteredActions() {
    return [];
  }

  onReceivedObservable(obj) {
    this.onIncomingObservable(obj);
  }

  getActionMethodForObservable(obj) {
    const defaultFn = this.onViewStreamInfo.bind(this);

    let methodStr = path(['data', 'action'], obj);
    const methodVal = prop(methodStr, this.channelActionMethods);

    let fn = defaultFn;

    if (methodVal !== undefined && methodVal !== 'onViewStreamInfo') {
      const methodExists = typeof (this[methodVal]) === 'function';
      if (methodExists === true) {
        fn = this[methodVal].bind(this);
      }
    }

    return fn;
  }

  onIncomingObservable(obj) {
    let eqsName = equals(obj.name, this.props.name);
    const mergeProps = (d) => mergeAll([d, { action: prop('action', d) }, prop('payload', d), prop('srcElement', d)]);
    let dataObj = obsVal => ({
      props: () => mergeProps(obj.data),
      viewStreamInfo: obj.data,
      viewStreamEvent: obsVal
    });
    let onSuccess = (obj) => obj.observable.pipe(map(dataObj))
      .subscribe(this.getActionMethodForObservable(obj));
    let onError = () => {};
    return eqsName === true ? onSuccess(obj) : onError();
  }

  /**
   * This method returns any ViewStream info payloads that are directed to this channel.
   *
   * @param {Object} obj
   */
  onViewStreamInfo(obj) {
  }


  /**
   *
   * This is a convenience method that formats a ChannelPayloadItem, that the source observable for the channel uses to send.
   *
   * @param {String} action
   * @param {Object} payload
   * @param {HTMLElement} srcElement
   * @param {HTMLElement} event
   * @param {Observable} obs$
   */
  sendChannelPayload(action, payload, srcElement = {}, event = {}, obs$ = this.observer$) {
    // MAKES ALL CHANNEL BASE AND DATA STREAMS CONSISTENT
    let channelPayloadItem = new ChannelPayloadItem(this.props.name, action, payload, srcElement, event);
    // console.log("CHANNEL STREEM ITEM ",channelPayloadItem);

    obs$.next(channelPayloadItem);
  }

  /**
   *
   * This method allows channels to subscribe to other channels.
   * @param {String} channel The registered name of the requested channel.
   * @returns {Subject} This will return the observer$ Subject variable.
   */
  getChannel(channel) {
    let isValidChannel = c => registeredStreamNames().includes(c);
    let error = c => console.warn(
      `channel name ${c} is not within ${registeredStreamNames}`);
    let startSubscribe = (c) => this.streamsController.getStream(c).observer;
    let fn = ifElse(isValidChannel, startSubscribe, error);
    return fn(channel);
  }
}
