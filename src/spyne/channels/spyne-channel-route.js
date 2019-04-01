import { ChannelBaseClass } from './channel-base-class';
import { URLUtils } from '../utils/channel-util-urls';
import { RouteUtils } from '../utils/channel-util-route';
import { BehaviorSubject, ReplaySubject, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  objOf,
  mergeAll,
  path,
  keys,
  prop,
  equals,
  head,
  compose,
  chain,
  pickAll,
  defaultTo,
  isEmpty,
  concat,
  when,
  complement,
  curryN,
  __,
  pathEq
} from 'ramda';
const rMerge = require('ramda').mergeRight;
export class SpyneChannelRoute extends ChannelBaseClass {
  constructor(name = 'CHANNEL_ROUTE', props = {}) {
    /**
     * @module SpyneChannelRoute
     * @desc
     *
     * <h3>This channel takes a fundamental approach to a routing system.</h3>
     * <p>The core of any routing system is two way translation of values:</p>
     * <ol>
     * <li>Transform the window location into usable properties</li>
     * <li>Combine variables to change the window location</li>
     * </ol>
     * <p>This is in essence all of what the ROUTE channel does. </br>It combines values sent from a bound HTML Element, or sent from a ViewStream instance, and uses those properties to create the new window locaiton, building out any missing properties by using the nested route configuration file.
     * </br>In the same way, the ROUTE Channel can transform the string of the window location into a JSON object containing the values that were set in the configuration file.
     * Useful information such as changed, deleted and added properties are also sent in the payload.</p>
     *
     * <h5>The nested route configuration object allows for regular expressions.</h5>
     *
     * <ul>
     * <li>A simple example of two way translation.</li>
     * <li>The key to making this powerful is a configuration file that does much of the work of the translation.</li>
     *
     * <h3>The Nested Routes Object</h3>
     * <p>Like all Channels the ROUTE Channel publishes globally</p>
     * <h4>Publishes all window.location events</h4>
     * ROUTE combines the window location and history apis to automatically publish any window.location changes
     * Using the config.routes Object, the Route Channel will parse the location and transform the location string into an object containing the relevant data.
     *
     * <h5>Allows HTML Elements and ViewStream instances to change window location by updating only the necessary properties.</h5>
     * <ol>
     * </ol>
     *
     *
     * @constructor
     * @param {Object} config
     * @property {String} config.type - = 'slash'; The one other option is 'query' which will use the query syntax for window locaiton.
     * @property {Boolean} config.isHash - = false; If set to true, the window location will use the hashchange event.
     * @property {Boolean} config.isHidden - = false; If set to true, the logic of the route channel will remain, however the window location will not change.
     * @property {Object} config.routes - = {routePath: {routeName:'change'}; This nested Object is used to parse variables from the window location, and this also allows ui channels the ability to send only partial parts of the window location.
     *
     */
    props.sendCurrentPayload = true;
    super('CHANNEL_ROUTE', props);
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
    const converter = str => objOf(str, str);
    let obj = mergeAll(chain(converter, arr));
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
    let routeConfig = path(['channels', 'ROUTE'], spyneConfig);
    if (routeConfig.type === 'query') {
      routeConfig.isHash = false;
    }

    let arr = RouteUtils.flattenConfigObject(routeConfig.routes);
    // console.log("FLATTENED CONFIG ",arr);
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
    payload = rMerge(payload, keywordArrs);
    // console.log("SEND STREAM onIncomingDomEvent", payload, keywordArrs);;
    this.sendChannelPayload(action, payload, undefined, undefined,
      this.navToStream$);
  }

  static checkForRouteParamsOverrides(payload) {
    // console.log("CHECK FOR OVERRIDES ",payload);

    return payload;
  }

  static checkToPreventDefaultEvent(obs) {
    const checkDataForPreventDefault = pathEq(['viewStreamInfo', 'payload', 'eventPreventDefault'], 'true');
    const setPreventDefault = (evt) => {
      if (evt !== undefined) {
        evt.preventDefault();
      }
    };
    const selectEvtAndPreventDefault = compose(setPreventDefault, prop('viewStreamEvent'));
    const checkForPreventDefault = when(checkDataForPreventDefault, selectEvtAndPreventDefault);
    checkForPreventDefault(obs);
  }


  onViewStreamInfo(pl) {
    let action = this.channelActions.CHANNEL_ROUTE_CHANGE_EVENT;
    SpyneChannelRoute.checkToPreventDefaultEvent(pl);
    let payload = this.getDataFromParams(pl);
    let srcElement = path(['viewStreamInfo', 'srcElement'], pl);
    let uiEvent = pl.viewStreamEvent;
    let changeLocationBool = !payload.isHidden;
    let keywordArrs = this.compareRouteKeywords.compare(payload.routeData, payload.paths);
    payload = rMerge(payload, keywordArrs);
    // this.checkForRouteParamsOverrides(payload);
    this.sendRouteStream(payload, changeLocationBool);
    // console.log("SEND STREAM onViewStreamInfo", payload);

    this.sendChannelPayload(action, payload, srcElement, uiEvent,
      this.navToStream$);
  }

  static checkAndConvertStrWithRegexTokens(routeValue, regexTokenObj) {
    let tokenKeysArr = keys(regexTokenObj);

    return tokenKeysArr;
  }

  sendRouteStream(payload, changeWindowLoc = true) {
    if (changeWindowLoc === true) {
      this.setWindowLocation(payload);
    }
  }

  static getRouteState() {
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
    return { routeCount, isDeepLink, isHash, isHidden, routeType };
  }

  static getDataFromParams(pl, config = this.routeConfigJson) {
    let routeData = path(['viewStreamInfo', 'payload'], pl);

    let routeValue = this.getRouteStrFromParams(routeData, config);

    // WINDOW LOCATION HASN'T BEEN CHANGED YET, SO WILL GET STR PARAMS
    const getPropFromConfig = (prp, defalt) => defaultTo(defalt, prop(prp, config));
    let typeForStr = getPropFromConfig('type', 'slash');
    let isHashForStr = getPropFromConfig('isHash', false);
    let nextWindowLoc = URLUtils.formatStrAsWindowLocation(routeValue);
    let dataFromStr = this.getDataFromLocationStr(typeForStr, isHashForStr, nextWindowLoc);

    // console.log(" DATA FROM STRING ",{routeValue, pl, dataFromStr});
    let { pathInnermost, paths } = dataFromStr;

    routeData = rMerge(dataFromStr.routeData, routeData);

    let { routeCount, isDeepLink, isHash, isHidden, routeType } = this.getExtraPayloadParams(
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
    // type = config.isHash === true ? ''
    const str = URLUtils.getLocationStrByType(type, hashIsTrue);
    let { paths, pathInnermost, routeData, routeValue } = SpyneChannelRoute.getParamsFromRouteStr(
      str, config, type);
    let { routeCount, isDeepLink, isHash, routeType, isHidden } = this.getExtraPayloadParams(
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

  static getDataFromLocationStr(t = 'slash', isHash = this.routeConfigJson.isHash, loc = window.location) {
    const type = this.routeConfigJson !== undefined
      ? this.routeConfigJson.type
      : t;

    // console.log("DATA CHECK STRING ",loc);
    const str = URLUtils.getLocationStrByType(type, isHash, loc);
    let { paths, pathInnermost, routeData, routeValue } = this.getParamsFromRouteStr(
      str, this.routeConfigJson, type);
    const action = this.getRouteState();
    return { paths, pathInnermost, routeData, routeValue, action };
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
    return pickAll(locationParamsArr, window.location);
  }

  static getRouteStrFromParams(paramsData, routeConfig, t) {
    const type = t !== undefined ? t : routeConfig.type;
    let obj = URLUtils.convertParamsToRoute(paramsData, routeConfig, type);

    // console.log("ROUTE getRouteStrFromParams ",paramsData,obj);
    return obj;
  }

  static getParamsFromRouteStr(str, routeConfig, t) {
    const type = t !== undefined ? t : routeConfig.type;
    let obj = URLUtils.convertRouteToParams(str, routeConfig, type);
    // console.log("ROUTE getParamsFromRouteStr ",obj);
    return obj;
  }

  checkEmptyRouteStr(str, isHash = false) {
    const isEmptyBool = isEmpty(str);
    const pathNameIsEmptyBool = isEmptyBool === true && isHash === false;
    const hashNameIsEmptyBool = isEmptyBool === true && isHash === true;
    const hashNameBool = isEmptyBool === false && isHash === true;

    // console.log('ROUTE STR CHECK ', {str, isHash});
    if (pathNameIsEmptyBool === true || hashNameIsEmptyBool === true) {
      return '/';
    } else if (hashNameBool === true) {
      return concat('#', str);
    }
    return str;
  }
  static removeLastSlash(str) {
    let re = /^(.*)(\/)$/;
    return str.replace(re, '$1');
  }

  setWindowLocation(channelPayload) {
    let { isHash, routeValue } = channelPayload;
    routeValue = this.checkEmptyRouteStr(routeValue, isHash);
    // console.log("SET WINDOW LOCATION ",routeValue, channelPayload);
    if (isHash === true) {
      let pathName = SpyneChannelRoute.removeLastSlash(window.location.pathname);
      routeValue = pathName + routeValue;
      // window.location.hash = routeValue;
      // console.log('ROUTE STR FOR HASH ', routeValue);
      window.history.pushState({}, '', routeValue);
    } else {
      // routeValue =  when(isEmpty, always('/'))(routeValue);
      const checkForSlash = when(
        compose(complement(equals('/')), head), concat('/', __));
      window.history.pushState({}, '', checkForSlash(routeValue));
    }
  }

  getWindowLocation() {
    return window.location.pathname; // pullHashAndSlashFromPath(window.location.hash);
  }

  bindStaticMethods() {
    this.getIsDeepLinkBool = SpyneChannelRoute.getIsDeepLinkBool.bind(this);
    this.getDataFromLocationStr = SpyneChannelRoute.getDataFromLocationStr.bind(
      this);
    this.onIncomingDomEvent = SpyneChannelRoute.onIncomingDomEvent.bind(this);
    this.getDataFromString = SpyneChannelRoute.getDataFromString.bind(this);
    this.getParamsFromRouteStr = SpyneChannelRoute.getParamsFromRouteStr.bind(this);
    this.getLocationData = SpyneChannelRoute.getLocationData.bind(this);
    this.getRouteState = SpyneChannelRoute.getRouteState.bind(this);
    this.getDataFromParams = SpyneChannelRoute.getDataFromParams.bind(this);
    this.getRouteCount = SpyneChannelRoute.getRouteCount.bind(this);
    this.getExtraPayloadParams = SpyneChannelRoute.getExtraPayloadParams.bind(this);
    const curriedGetRoute = curryN(3, SpyneChannelRoute.getRouteStrFromParams);
    this.getRouteStrFromParams = curriedGetRoute(__, this.routeConfigJson,
      this.routeConfigJson.type);
  }
}
