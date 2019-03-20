import { registeredStreamNames } from './channels-config';
import { ChannelPayloadItem } from './channel-payload-item';
import { ReplaySubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as R from 'ramda';

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
    this.props.sendLastPayload = this.props.sendLastPayload === undefined ? false : this.props.sendLastPayload;
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
      return this.streamsController.getProxySubject(this.props.name, this.props.sendLastPayload);
    } else {
      return this.props.sendLastPayload === true ? new ReplaySubject(1) : new Subject();
    }
  }

  //  OVERRIDE INITIALIZATION METHOD
  onChannelInitialized() {

  }

  get isProxy() {
    return this.props.isProxy;
  }

  get channelName() {
    return this.props.name;
  }

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
    const getActionVal = R.ifElse(R.is(String), R.identity, R.head);
    let arr = R.map(getActionVal, this.addRegisteredActions());
    // console.log("ARR IS ",arr);
    const converter = str => R.objOf(str, str);
    let obj = R.mergeAll(R.chain(converter, arr));
    this.channelActions = obj;
  }

  createChannelActionMethods() {
    const defaultFn = 'onIncomingViewStreamInfo';
    const getActionVal = R.ifElse(R.is(String), R.identity, R.head);
    const getCustomMethod = val => {
      const methodStr = R.view(R.lensIndex(1), val);
      const hasMethod = typeof (this[methodStr]) === 'function';
      if (hasMethod === true) {
        this[methodStr].bind(this);
      } else {
        console.warn(`"${this.props.name}", REQUIRES THE FOLLOWING METHOD ${methodStr} FOR ACTION, ${val[0]}`);
      }

      return methodStr;
    };

    const getArrMethod =  R.ifElse(R.is(String), R.always(defaultFn), getCustomMethod);

    const createObj = val => {
      let key = getActionVal(val);
      let method =  getArrMethod(val);
      return [key, method];
    };

    this.channelActionMethods = R.fromPairs(R.map(createObj, this.addRegisteredActions()));

    // console.log('the channel action methods ',this.channelActionMethods);
  }

  addRegisteredActions() {
    return [];
  }

  onReceivedObservable(obj) {
    this.onIncomingObservable(obj);
  }

  getActionMethodForObservable(obj) {
    const defaultFn = this.onIncomingViewStreamInfo.bind(this);

    let methodStr = R.path(['data', 'action'], obj);
    const methodVal = R.prop(methodStr, this.channelActionMethods);

    let fn = defaultFn;

    if (methodVal !== undefined && methodVal !== 'onIncomingViewStreamInfo') {
      const methodExists = typeof (this[methodVal]) === 'function';
      if (methodExists === true) {
        fn = this[methodVal].bind(this);
      }
    }

    return fn;
  }

  onIncomingObservable(obj) {
    let eqsName = R.equals(obj.name, this.props.name);
    const mergeProps = (d) => R.mergeAll([d, { action: R.prop('action', d) }, R.prop('payload', d), R.prop('srcElement', d)]);
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

  onIncomingViewStreamInfo(obj) {
  }

  sendChannelPayload(action, payload, srcElement = {}, event = {}, obs$ = this.observer$) {
    // MAKES ALL CHANNEL BASE AND DATA STREAMS CONSISTENT
    let channelPayloadItem = new ChannelPayloadItem(this.props.name, action, payload, srcElement, event);
    // console.log("CHANNEL STREEM ITEM ",channelPayloadItem);

    obs$.next(channelPayloadItem);
  }

  /**
   *
   * This method allows channels to subscribe to other channels.
   * @property {String} channel The registered name of the requested channel.
   * @returns {Subject} This will return the observer$ Subject variable.
   */
  getChannel(channel) {
    let isValidChannel = c => registeredStreamNames().includes(c);
    let error = c => console.warn(
      `channel name ${c} is not within ${registeredStreamNames}`);
    let startSubscribe = (c) => this.streamsController.getStream(c).observer;
    let fn = R.ifElse(isValidChannel, startSubscribe, error);
    return fn(channel);
  }
}
