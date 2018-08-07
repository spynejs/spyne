import {ChannelsBase} from '../channels/channels-base';
import {URLUtils} from '../utils/channel-util-urls';
import {RouteUtils} from '../utils/channel-util-route';
import * as Rx from "rxjs";

const R = require('ramda');

export class ChannelRoute extends ChannelsBase {
  constructor() {
    super();
    this.createChannelActionsObj();
    this.props.name = 'ROUTE';
    this.routeConfigJson = this.getRouteConfig();
    this.bindStaticMethods();
    this.navToStream$ = new Rx.BehaviorSubject();
    this.observer$ = this.navToStream$.map(info => this.onMapNext(info));

  }

  initializeStream() {
    this.initStream();
  }

  createChannelActionsObj() {
    let arr = this.addRegisteredActions();
    const converter = str => R.objOf(str, str);
    let obj = R.mergeAll(R.chain(converter, arr));
    this.channelActions = obj;
  }

  addRegisteredActions() {
    return [
      'CHANNEL_ROUTE_DEEPLINK_EVENT',
      'CHANNEL_ROUTE_CHANGE_EVENT'
    ];
  }

  getRouteConfig() {
    const spyneConfig = window.Spyne.config;
    let routeConfig = R.path(['channels', 'ROUTE'], spyneConfig);
    if (routeConfig.type === 'query') {
      routeConfig.isHash = false;
    }

    let arr = RouteUtils.flattenConfigObject(routeConfig.routes);
    routeConfig['paramsArr'] = arr;
    return routeConfig;
  }

  initStream() {
    this.firstLoadStream$ = new Rx.BehaviorSubject(
      this.onIncomingDomEvent(undefined, this.routeConfigJson,
        '' + 'CHANNEL_ROUTE_DEEPLINK_EVENT'));
    RouteUtils.createPopStateStream(this.onIncomingDomEvent.bind(this));

    this.observer$ = Rx.Observable.merge(this.firstLoadStream$,
      this.navToStream$);
  }

  onMapNext(data, firstLoaded = false) {
    data['action'] = 'CHANNEL_ROUTE_CHANGE_EVENT';
    return data;
  }

  static onIncomingDomEvent(evt, config = this.routeConfigJson, actn) {
    let action = actn !== undefined
      ? actn
      : this.channelActions.CHANNEL_ROUTE_CHANGE_EVENT;
    let payload = this.getDataFromString(config);
    // console.log('route dom ',action, payload);
    this.sendStreamItem(action, payload, undefined, undefined,
      this.navToStream$);
  }

  onIncomingObserverableData(pl) {
    let action = this.channelActions.CHANNEL_ROUTE_CHANGE_EVENT;
    let payload = this.getDataFromParams(pl);
    let srcElement = R.path(['observableData', 'srcElement'], pl);
    let uiEvent = pl.observableEvent;
    let changeLocationBool = !payload.isHidden;
    this.sendRouteStream(payload, changeLocationBool);
    this.sendStreamItem(action, payload, srcElement, uiEvent,
      this.navToStream$);
  }

  sendRouteStream(payload, changeWindowLoc = true) {
    if (changeWindowLoc === true) {
      this.setWindowLocation(payload);
    }
  }

  static getRouteState(str) {
    return 'CHANNEL_ROUTE_CHANGE_EVENT';
  }

  static getIsDeepLinkBool() {
    return this._routeCount === 0;
  }

  static getRouteCount() {
    if (this._routeCount === undefined) {
      this._routeCount = 0;
      return this._routeCount;
    }
    this._routeCount += 1;
    return this._routeCount;
  }

  static getExtraPayloadParams(config = this.routeConfigJson) {
    let routeCount = this.getRouteCount();
    let isDeepLink = this.getIsDeepLinkBool();
    let isHash = config.isHash;
    let isHidden = config.isHidden;
    let routeType = config.type;
    return {routeCount, isDeepLink, isHash, isHidden, routeType};
  }

  static getDataFromParams(pl, config = this.routeConfigJson) {
    let keywords = R.path(['observableData', 'payload'], pl);

    let routeValue = this.getRouteStrFromParams(keywords, config);

    let dataFromStr = this.getDataFromLocationStr();
    let {routeKeyword, routeKeywordsArr} = dataFromStr;

    keywords = R.merge(dataFromStr.keywords, keywords);

    let {routeCount, isDeepLink, isHash, isHidden, routeType} = this.getExtraPayloadParams(
      config);
    return {
      isDeepLink,
      routeCount,
      routeKeyword,
      routeKeywordsArr,
      keywords,
      routeValue,
      isHash,
      isHidden,
      routeType
    };
  }

  static getDataFromString(config = this.routeConfigJson, actn) {
    const type = config.type;
    const hashIsTrue = config.isHash === true;
    //type = config.isHash === true ? ''
    const str = URLUtils.getLocationStrByType(type, hashIsTrue);
    let {routeKeywordsArr, routeKeyword, keywords, routeValue} = ChannelRoute.getParamsFromRouteStr(
      str, config, type);
    let {routeCount, isDeepLink, isHash, routeType, isHidden} = this.getExtraPayloadParams(
      config);

    let obj = {
      isDeepLink,
      routeCount,
      routeKeyword,
      routeKeywordsArr,
      keywords,
      routeValue,
      isHash,
      isHidden,
      routeType
    };
    return obj;
  }

  static getDataFromLocationStr(t = 'slash') {
    const type = this.routeConfigJson !== undefined
      ? this.routeConfigJson.type
      : t;
    const str = URLUtils.getLocationStrByType(type);
    let {routeKeywordsArr, routeKeyword, keywords, routeValue} = this.getParamsFromRouteStr(
      str, this.routeConfigJson, type);
    const action = this.getRouteState();
    return {routeKeywordsArr, routeKeyword, keywords, routeValue, action};
  }

  static getLocationData() {
    const locationParamsArr = [
      'href',
      'origin',
      'protocol',
      'host',
      'hostname',
      'port',
      'pathname',
      'search',
      'hash'];
    return R.pickAll(locationParamsArr, window.location);
  }

  static getRouteStrFromParams(paramsData, routeConfig, t) {
    const type = t !== undefined ? t : routeConfig.type;
    return URLUtils.convertParamsToRoute(paramsData, routeConfig, type);
  }

  static getParamsFromRouteStr(str, routeConfig, t) {
    const type = t !== undefined ? t : routeConfig.type;
    return URLUtils.convertRouteToParams(str, routeConfig, type);
  }

  checkEmptyRouteStr(str, isHash = false) {
    const isEmpty = R.isEmpty(str);
    const pathNameIsEmptyBool = isEmpty === true && isHash === false;
    const hashNameIsEmptyBool = isEmpty === true && isHash === true;
    const hashNameBool = isEmpty === false && isHash === true;

    //console.log('ROUTE STR CHECK ', {str, isHash});
    if (pathNameIsEmptyBool === true || hashNameIsEmptyBool === true) {
      return '/';
    } else if (hashNameBool === true) {
      return R.concat('#', str);
    }
    return str;
  }
  static removeLastSlash(str){
    let re = /^(.*)(\/)$/;
    return str.replace(re, '$1');
  }

  setWindowLocation(channelPayload) {
    let {isHash, routeValue} = channelPayload;
    routeValue = this.checkEmptyRouteStr(routeValue, isHash);
    if (isHash === true) {
      let pathName = ChannelRoute.removeLastSlash(window.location.pathname);
      routeValue = pathName+routeValue;
      // window.location.hash = routeValue;
     // console.log('ROUTE STR FOR HASH ', routeValue);
      window.history.pushState({}, '', routeValue);
    } else {
      // routeValue =  R.when(R.isEmpty, R.always('/'))(routeValue);
      const checkForSlash = R.when(
        R.compose(R.complement(R.equals('/')), R.head), R.concat('/', R.__));
      window.history.pushState({}, '', checkForSlash(routeValue));
    }
  }

  getWindowLocation() {
    return window.location.pathname; // pullHashAndSlashFromPath(window.location.hash);
  }

  bindStaticMethods() {
    this.getIsDeepLinkBool = ChannelRoute.getIsDeepLinkBool.bind(this);
    this.getDataFromLocationStr = ChannelRoute.getDataFromLocationStr.bind(
      this);
    this.onIncomingDomEvent = ChannelRoute.onIncomingDomEvent.bind(this);
    this.getDataFromString = ChannelRoute.getDataFromString.bind(this);
    this.getParamsFromRouteStr = ChannelRoute.getParamsFromRouteStr.bind(this);
    this.getLocationData = ChannelRoute.getLocationData.bind(this);
    this.getRouteState = ChannelRoute.getRouteState.bind(this);
    this.getDataFromParams = ChannelRoute.getDataFromParams.bind(this);
    this.getRouteCount = ChannelRoute.getRouteCount.bind(this);
    this.getExtraPayloadParams = ChannelRoute.getExtraPayloadParams.bind(this);
    const curriedGetRoute = R.curryN(3, ChannelRoute.getRouteStrFromParams);
    this.getRouteStrFromParams = curriedGetRoute(R.__, this.routeConfigJson,
      this.routeConfigJson.type);
  }
}
