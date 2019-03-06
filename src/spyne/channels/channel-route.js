import {ChannelsBase} from '../channels/channels-base';
import {URLUtils} from '../utils/channel-util-urls';
import {RouteUtils} from '../utils/channel-util-route';
//import * as Rx from "rxjs-compat";
import {BehaviorSubject, ReplaySubject, Subject, Observable, of, merge} from "rxjs";
import {map} from "rxjs/operators";


const R = require('ramda');

export class ChannelRoute extends ChannelsBase {
  constructor(name="CHANNEL_ROUTE", props={}) {
    props.sendLastPayload = true;
    super("CHANNEL_ROUTE", props);
    this.createChannelActionsObj();
    this.routeConfigJson = this.getRouteConfig();
    this.bindStaticMethods();
    this.navToStream$ = new ReplaySubject(1);
    this.observer$ = this.navToStream$.pipe(map(info => this.onMapNext(info)));
   // let compareKeysFn = RouteUtils.compareRouteKeywords.bind(this);
    this.compareRouteKeywords = RouteUtils.compareRouteKeywords();

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
    //console.log("FLATTENED CONFIG ",arr);
    routeConfig['paramsArr'] = arr;
    return routeConfig;
  }

  initStream() {
    this.firstLoadStream$ = new BehaviorSubject(
      this.onIncomingDomEvent(undefined, this.routeConfigJson,
        '' + 'CHANNEL_ROUTE_DEEPLINK_EVENT'));
    RouteUtils.createPopStateStream(this.onIncomingDomEvent.bind(this));

    this.observer$ = merge(this.firstLoadStream$,
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
    let keywordArrs = this.compareRouteKeywords.compare(payload.routeData, payload.paths);
    payload = R.merge(payload, keywordArrs);
    //console.log("SEND STREAM onIncomingDomEvent", payload, keywordArrs);;
    this.sendStreamItem(action, payload, undefined, undefined,
      this.navToStream$);
  }

  static checkForRouteParamsOverrides(payload){
    //console.log("CHECK FOR OVERRIDES ",payload);

    return payload;
  }

  onIncomingObserverableData(pl) {
    let action = this.channelActions.CHANNEL_ROUTE_CHANGE_EVENT;
    let payload = this.getDataFromParams(pl);
    let srcElement = R.path(['observableData', 'srcElement'], pl);
    let uiEvent = pl.observableEvent;
    let changeLocationBool = !payload.isHidden;
    let keywordArrs = this.compareRouteKeywords.compare(payload.routeData, payload.paths);
    payload = R.merge(payload, keywordArrs);
   // this.checkForRouteParamsOverrides(payload);
    this.sendRouteStream(payload, changeLocationBool);
    //console.log("SEND STREAM onIncomingObserverableData", payload);

    this.sendStreamItem(action, payload, srcElement, uiEvent,
      this.navToStream$);
  }



  static checkAndConvertStrWithRegexTokens(routeValue, regexTokenObj){
    let tokenKeysArr = R.keys(regexTokenObj);


    return tokenKeysArr;

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
    let routeData = R.path(['observableData', 'payload'], pl);

    let routeValue = this.getRouteStrFromParams(routeData, config);

    // WINDOW LOCATION HASN'T BEEN CHANGED YET, SO WILL GET STR PARAMS
    const getPropFromConfig = (prp, defalt) => R.defaultTo(defalt, R.prop(prp, config));
    let typeForStr = getPropFromConfig('type', 'slash');
    let isHashForStr = getPropFromConfig('isHash', false);
    let nextWindowLoc = URLUtils.formatStrAsWindowLocation(routeValue);
    let dataFromStr = this.getDataFromLocationStr(typeForStr, isHashForStr, nextWindowLoc);

    //console.log(" DATA FROM STRING ",{routeValue, pl, dataFromStr});
    let {pathInnermost, paths} = dataFromStr;

    routeData = R.merge(dataFromStr.routeData, routeData);

    let {routeCount, isDeepLink, isHash, isHidden, routeType} = this.getExtraPayloadParams(
      config);
    return {
      isDeepLink,
      routeCount,
      pathInnermost,
      paths,
      routeData,
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
    let {paths, pathInnermost, routeData, routeValue} = ChannelRoute.getParamsFromRouteStr(
      str, config, type);
    let {routeCount, isDeepLink, isHash, routeType, isHidden} = this.getExtraPayloadParams(
      config);

    let obj = {
      isDeepLink,
      routeCount,
      pathInnermost,
      paths,
      routeData,
      routeValue,
      isHash,
      isHidden,
      routeType
    };
    return obj;
  }

  static getDataFromLocationStr(t = 'slash', isHash=this.routeConfigJson.isHash, loc=window.location) {
    const type = this.routeConfigJson !== undefined
      ? this.routeConfigJson.type
      : t;


    //console.log("DATA CHECK STRING ",loc);
    const str = URLUtils.getLocationStrByType(type, isHash, loc);
    let {paths, pathInnermost, routeData, routeValue} = this.getParamsFromRouteStr(
      str, this.routeConfigJson, type);
    const action = this.getRouteState();
    return {paths, pathInnermost, routeData, routeValue, action};
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
    let obj= URLUtils.convertParamsToRoute(paramsData, routeConfig, type);

    //console.log("ROUTE getRouteStrFromParams ",paramsData,obj);
    return obj;

  }

  static getParamsFromRouteStr(str, routeConfig, t) {
    const type = t !== undefined ? t : routeConfig.type;
    let obj = URLUtils.convertRouteToParams(str, routeConfig, type);
      //console.log("ROUTE getParamsFromRouteStr ",obj);
    return obj;
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
    //console.log("SET WINDOW LOCATION ",routeValue, channelPayload);
    if (isHash === true) {
      let pathName = ChannelRoute.removeLastSlash(window.location.pathname);
      routeValue = pathName+routeValue;
      // window.location.hash = routeValue;
      //console.log('ROUTE STR FOR HASH ', routeValue);
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
