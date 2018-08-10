import {ChannelsBase} from '../channels/channels-base';
import {checkIfObjIsNotEmptyOrNil} from '../utils/frp-tools';
import {ChannelUtilsDom} from '../utils/channel-util-dom';
const R = require('ramda');
//import * as Rx from "rxjs-compat";
import {Observable, Subject} from "rxjs";
//import {merge, map} from "rxjs/operators";


export class ChannelWindow extends ChannelsBase {
  constructor() {
    super();
    this.bindStaticMethods();
    this.observer$ = new Subject();
    this.props.name = 'WINDOW';
  }

  initializeStream() {
    this.domChannelConfig = window.Spyne.config.channels.WINDOW;
    this.currentScrollY = window.scrollY;
    let obs$Arr = this.getActiveObservables();
    let dom$ = Observable.merge(...obs$Arr);

    dom$.subscribe(p => {
      let {action, channelPayload, srcElement, event} = p;
      this.sendStreamItem(action, channelPayload, srcElement, event);
    });
  }

  static getScrollMapFn(event) {
    let action = this.channelActions.CHANNEL_WINDOW_SCROLL_EVENT;
    let scrollY = window.scrollY;
    let scrollDistance = this.currentScrollY - scrollY;
    let scrollDir = scrollDistance >= 0 ? 'up' : 'down';
    this.currentScrollY = scrollY;
    let channelPayload = {scrollY, scrollDistance, scrollDir};
    let srcElement = event.srcElement;
    return {action, channelPayload, srcElement, scrollDistance, event};
  }

  static getMouseWheelMapFn(event) {
    let action = this.channelActions.CHANNEL_WINDOW_MOUSEWHEEL_EVENT;
    let scrollDir = event.deltaY <= 0 ? 'up' : 'down';
    let {deltaX, deltaY, deltaZ} = event;
    let channelPayload = {scrollDir, deltaX, deltaY, deltaZ};
    let srcElement = event.srcElement;
    return {action, channelPayload, srcElement, event};
  }

  static createCurriedGenericEvent(actionStr){
    let action = `CHANNEL_WINDOW_${actionStr.toUpperCase()}_EVENT`;
    let curryFn = R.curry(ChannelWindow.mapGenericEvent);
    return  curryFn(action);
  }

  static mapGenericEvent(actn, event){
    console.log("map generic event ",actn);
    let action = actn;
    let channelPayload = event;
    let srcElement = event.srcElement;
    return {action, channelPayload, srcElement, event};
  }

  static getResizeMapFn(event) {
    let action = this.channelActions.CHANNEL_WINDOW_RESIZE_EVENT;
    let channelPayload = R.pick(
      ['innerWidth', 'innerHeight', 'outerWidth', 'outerHeight'], window);
    let srcElement = event.srcElement;
    return {action, channelPayload, srcElement, event};
  }

  static getOrientationMapFn(event) {
    let action = this.channelActions.CHANNEL_WINDOW_ORIENTATION_EVENT;
    const orientationStr = '(orientation: portrait)';
    let isPortraitBool = window.matchMedia(orientationStr).matches;
    let channelPayload = R.pick(
      ['innerWidth', 'innerHeight', 'outerWidth', 'outerHeight'], window);
    channelPayload['orientation'] = isPortraitBool === true
      ? 'portrait'
      : 'landscape';
    let srcElement = event.srcElement;
    return {action, channelPayload, srcElement, event};
  }

  getMediaQueryMapFn(event) {
    let action = this.channelActions.CHANNEL_WINDOW_MEDIA_QUERY_EVENT;
    let channelPayload = R.pick(['matches', 'media', 'mediaQueryName'], event);
    let srcElement = event.srcElement;
    return {action, channelPayload, srcElement, event};
  }

  createMouseWheelObservable(config) {
    const debounceTime = config.debounceMSTimeForScroll;

    return ChannelUtilsDom.createDomObservableFromEvent('mousewheel',
      ChannelWindow.getMouseWheelMapFn.bind(this)).debounceTime(debounceTime);
  }

  createScrollObservable(config) {
    const skipWhenDirIsMissing = evt => evt.scrollDistance === 0;
    const debounceTime = config.debounceMSTimeForScroll;
    return ChannelUtilsDom.createDomObservableFromEvent('scroll',
      ChannelWindow.getScrollMapFn.bind(this))
      .debounceTime(debounceTime)
      .skipWhile(skipWhenDirIsMissing);
  }

  createOrientationObservable(config) {
    // console.log("add orientation");orientationchange
    return ChannelUtilsDom.createDomObservableFromEvent('orientationchange',
      ChannelWindow.getOrientationMapFn.bind(this));
  }

  createResizeObservable(config) {
    const debounceTime = config.debounceMSTimeForResize;
    // console.log('resize this ', this);

    return ChannelUtilsDom.createDomObservableFromEvent('resize',
      ChannelWindow.getResizeMapFn.bind(this)).debounceTime(debounceTime);
  }

  getEventsFromConfig(config = this.domChannelConfig){
    let obs$Arr = config.events;

    const addWindowEventToArr = str =>{
      let mapFn = ChannelWindow.createCurriedGenericEvent(str);
      return ChannelUtilsDom.createDomObservableFromEvent(str, mapFn);
    };


    return R.map(addWindowEventToArr, obs$Arr);

  }

  getActiveObservables(config = this.domChannelConfig) {
    let obs$Arr = [];

    // CHECK TO ADD MEDIA QUERY OBSERVABLE
    // ==========================================
    config['listenForMediaQueries'] = checkIfObjIsNotEmptyOrNil(
      config.mediqQueries);

    // =========================================

    // config.listenForResize = false;
    // config.listenForMouseWheel = true;
    // config.listenForScroll = false;
    let methods = {
      'listenForResize': this.createResizeObservable.bind(this),
      'listenForOrientation': this.createOrientationObservable.bind(this),
      'listenForScroll': this.createScrollObservable.bind(this),
      'listenForMouseWheel': this.createMouseWheelObservable.bind(this)
    };

    const addObservableToArr = (method, key, i) => {
      const addObsBool = config[key];
      if (addObsBool) {
        obs$Arr.push(method(config));
      } else {

      }
    };

    R.mapObjIndexed(addObservableToArr, methods);

    // 'listenForMediaQueries' : this.getMediaQueryObservable.bind(this)
    this.checkForMediaQueries(config.listenForMediaQueries);

    let eventsArr = this.getEventsFromConfig(config);
    obs$Arr = obs$Arr.concat(eventsArr);

    return obs$Arr;
  }

  checkForMediaQueries(bool) {
    const sendMQStream = p => {
      let {action, channelPayload, srcElement, event} = p;
      this.sendStreamItem(action, channelPayload, srcElement, event,
        this.observer$);
    };

    if (bool === true) {
      this.getMediaQueryObservable(this.domChannelConfig)
        .subscribe(sendMQStream);
    }
  }

  getMediaQueryObservable(config) {
    let arr = this.createMergedObsFromObj(config);
    return Observable.merge(...arr).map(this.getMediaQueryMapFn.bind(this));
  }

  addRegisteredActions() {
    return [
      'CHANNEL_WINDOW_SCROLL_EVENT',
      'CHANNEL_WINDOW_MOUSEWHEEL_EVENT',
      'CHANNEL_WINDOW_MEDIA_QUERY_EVENT',
      'CHANNEL_WINDOW_RESIZE_EVENT',
      'CHANNEL_WINDOW_ORIENTATION_EVENT',
      'CHANNEL_WINDOW_CACHED_EVENT',
      'CHANNEL_WINDOW_ERROR_EVENT',
      'CHANNEL_WINDOW_ABORT_EVENT',
      'CHANNEL_WINDOW_LOAD_EVENT',
      'CHANNEL_WINDOW_BEFOREUNLOAD_EVENT',
      'CHANNEL_WINDOW_UNLOAD_EVENT',
      'CHANNEL_WINDOW_ONLINE_EVENT',
      'CHANNEL_WINDOW_OFFLINE_EVENT',
      'CHANNEL_WINDOW_FOCUS_EVENT',
      'CHANNEL_WINDOW_BLUR_EVENT',
      'CHANNEL_WINDOW_OPEN_EVENT',
      'CHANNEL_WINDOW_MESSAGE_EVENT',
      'CHANNEL_WINDOW_ERROR_EVENT',
      'CHANNEL_WINDOW_CLOSE_EVENT',
      'CHANNEL_WINDOW_PAGEHIDE_EVENT',
      'CHANNEL_WINDOW_PAGESHOW_EVENT',
      'CHANNEL_WINDOW_POPSTATE_EVENT',
      'CHANNEL_WINDOW_ANIMATIONSTART_EVENT',
      'CHANNEL_WINDOW_ANIMATIONEND_EVENT',
      'CHANNEL_WINDOW_ANIMATIONITERATION_EVENT',
      'CHANNEL_WINDOW_TRANSITIONSTART_EVENT',
      'CHANNEL_WINDOW_TRANSITIONCANCEL_EVENT',
      'CHANNEL_WINDOW_TRANSITIONEND_EVENT',
      'CHANNEL_WINDOW_TRANSITIONRUN_EVENT',
      'CHANNEL_WINDOW_RESET_EVENT',
      'CHANNEL_WINDOW_SUBMIT_EVENT',
      'CHANNEL_WINDOW_BEFOREPRINT_EVENT',
      'CHANNEL_WINDOW_AFTERPRINT_EVENT',
      'CHANNEL_WINDOW_COMPOSITIONSTART_EVENT',
      'CHANNEL_WINDOW_COMPOSITIONUPDATE_EVENT',
      'CHANNEL_WINDOW_COMPOSITIONEND_EVENT',
      'CHANNEL_WINDOW_FULLSCREENCHANGE_EVENT',
      'CHANNEL_WINDOW_FULLSCREENERROR_EVENT',
      'CHANNEL_WINDOW_CUT_EVENT',
      'CHANNEL_WINDOW_COPY_EVENT'
    ];
  }

  bindStaticMethods() {
    this.createMediaQueryHandler = ChannelUtilsDom.createMediaQueryHandler.bind(
      this);
    this.createMergedObsFromObj = ChannelUtilsDom.createMergedObsFromObj.bind(
      this);
  }
}
