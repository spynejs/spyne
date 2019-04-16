import { Channel } from './channel';
import { SpyneUtilsChannelRouteUrl } from '../utils/spyne-utils-channel-route-url';
import { SpyneUtilsChannelRoute } from '../utils/spyne-utils-channel-route';
import { BehaviorSubject, ReplaySubject, merge } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import {
  objOf,
  mergeAll,
  path,
  keys,
  prop,
  equals,
    find,
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
  pathEq, test, replace,
} from 'ramda';
const ramdaFilter = require('ramda').filter;
const rMerge = require('ramda').mergeRight;
export class SpyneChannelRoute extends Channel {
  constructor(name = 'CHANNEL_ROUTE', props = {}) {
    /**
     * @module SpyneChannelRoute
     * @type core
     *
     * @desc
     *
     *   <p>This channel uses a nested routes JSON object to provide logic and structure to the window location pathname. </p>
     *   <h3>The Routes Config Object</h3>
     *   <ol>
     *     <li>The location pathname is typically a series of consecutive strings separated by slashes. The order of the strings reveals the current context of the website.</li>
     *     <li>The Routes configuration file is composed of a routesPath Object for every level of the pathname</li>
     *     <li>The only required property for every routesPath object is the routesKey property</li>
     *     <li>After the routeKey property, there is key, value pairs that describe that return the value for the routeKey or the value for the String for that level in the window pathname</li>
     *     </ol>
     *
     *    <h3>The routePath object</h3>
     *    <ul>
     *      <li>This is the basic routePath object with its one requirement, routeKey which value is a String</br>
     *        <pre>
     *            {
     *                routePath: {
     *                  routeKey: 'page',
     *                  dataValue: 'path-name-value'
     *
     *                }
     *            }
     *
     *          </pre>
     *
     *        </li>
     *
     *
     *    </ul>
     *
     *   <p>The routes object is able to express every combination of the nested variables by providing a  'routePath' for every combination of the site.</p>
     *
     *   <article class='code-example' id='routes-config-example'></article>
     *
     * <p>The SpyneChannelRoute has the two main duties:
     * <ul>
     *
     *   <li>Listen to window location changes and translate the location pathname into a series of relevant properties</li>
     *   <li>Combine data and the current location to update the window location path and to also send a payload of the properties that represent that location</li>
     * </ul>
     *  <p>Just as the window location is a series of nested values, this channels configuration file is a series of nested "routePath" objects, eaching containing a "routeKey" value that maps to a series of properties</p>
     *  <p>Open the Route Console Window to see the practical use of expressing the window location and route properties through the use of the nested configuration file</p>
     ** <p>This Channel uses a nested config file to expresses the window location as both a path string and also as properties that reveals the app's current context</p>
     * CONVERTING THE USER WINDOW LOCATION REQUEST
     * This maps the current window location to its respective properties by traversing the nested config file
     *
     * CONVERTING PROPERTIES TO WINDOW LOCATION
     * This channel plucks relevant properties based on the config file and determines new locaiton by filling in the blanks
     *
     *
     <h3>The Route config maps the window location with string or regex comparators</h3>
     *
     *
     * <h3>Working with the Routes Config Object</h3>
     * <ol>
     * <li>The window location is essentially a series of nested values that expresses the current context of the application.</li>
     * <li>The user interacts with a site's menu ui to choose a desired context, which is reflected in the window location.</li>
     * </ol>
     * <h3>How SpyneChannelRoute Works</h3>
     * <div class='btn btn-blue-ref btn-console' data-type="console" data-value="open" data-channel-type="route">CLICK TO OPEN ROUTE PANEL</div>
     *
     * <h3>The Spyne Routing System</h3>
     * <ul>
     * <li>Allows developers to just add just the required variables to update the window location</li>
     * </ul>
     *
     * <h4>TODOS; OPEN UP THE ROUTE PANEL, show examples of how to update the location with ViewStream, and explain how only guide has nested properties</h4>
     *
     * </br> </br></br></br></br></br></br></br>
     * <p>The core of any routing system is two way translation of values:</p>
     * <ol>
     * <li>Transform the window location into usable properties</li>
     * <li>Combine variables to change the window location</li>
     * </ol>
     * <p>This is in essence all of what the ROUTE channel does.</p>
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
     * @property {String} config.type - = 'slash'; This property determines the url structure by conforming the window pathname to either the slash, query or hash formats.
     * @property {Object} config.routes - = {routePath: {routeName:'change'}; This nested Object is used to contruct the window pathname and to express the window location as model variables.
     *
     */
    props.sendCurrentPayload = true;
    super('CHANNEL_ROUTE', props);
    this.createChannelActionsObj();
    this.routeConfigJson = this.getRouteConfig();
    this.bindStaticMethods();
    this.navToStream$ = new ReplaySubject(1);
    const filterUndefined = (e)=>e!==undefined;
    this.observer$ = this.navToStream$.pipe(map(info => this.onMapNext(info)));
    // let compareKeysFn = SpyneUtilsChannelRoute.compareRouteKeywords.bind(this);
    this.compareRouteKeywords = SpyneUtilsChannelRoute.compareRouteKeywords();
  }

  checkConfigForHash(){
    // LEGACY CHECK TO SIMPLIFY CONFIG FOR HASH;
    let isHashType = window.Spyne.config.channels.ROUTE.type==='hash';
    if (isHashType === true){
      window.Spyne.config.channels.ROUTE.type = 'slash';
      window.Spyne.config.channels.ROUTE.isHash = true;
    }

  }

  onChannelInitialized() {
    this.checkConfigForHash();
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

    let arr = SpyneUtilsChannelRoute.flattenConfigObject(routeConfig.routes);
    // console.log("FLATTENED CONFIG ",arr);
    routeConfig['paramsArr'] = arr;
    return routeConfig;
  }

  initStream() {
    this.firstLoadStream$ = new ReplaySubject(1);
      this.onIncomingDomEvent(undefined, this.routeConfigJson, '' + 'CHANNEL_ROUTE_DEEPLINK_EVENT');

    SpyneUtilsChannelRoute.createPopStateStream(this.onIncomingDomEvent.bind(this));

    this.observer$ = merge(this.firstLoadStream$,
      this.navToStream$);
  }

  onMapNext(data, firstLoaded = false) {
    console.log("MAP NEXT ",{firstLoaded, data});
    data['action'] = 'CHANNEL_ROUTE_CHANGE_EVENT';
    return data;
  }

  static removeSSID(payload){
    const routeLens = R.lensProp(['routeData']);
    const omitSSID = R.over(routeLens, R.omit(['vsid']));
    return omitSSID(payload);;
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
   // payload = SpyneChannelRoute.removeSSID(payload);
      this.sendChannelPayload(action, payload, undefined, undefined, this.navToStream$);

  }

  static checkForRouteParamsOverrides(payload) {
    // console.log("CHECK FOR OVERRIDES ",payload);

    return payload;
  }

  static checkForEventMethods(obs){
    const re = /^(event)([A-Z].*)([A-Z].*)$/gm;
    const getMethods = compose(ramdaFilter(test(re)), keys, path(['viewStreamInfo', 'payload']));
    const methodsArr = getMethods(obs);
    if (methodsArr.length>=1) {
      const evt = prop('viewStreamEvent', obs);
      if (evt !== undefined) {
        const methodUpdate = (match,p1,p2,p3,p4)=>String(p2).toLowerCase()+p3+p4;
        const methodStrReplace = replace(/^(event)([A-Z])(.*)([A-Z].*)$/gm, methodUpdate);
        const runMethod = (methodStr)=>{
          const m = methodStrReplace(methodStr);
          if (evt[m]!==undefined) {evt[m]();}
        };
        methodsArr.forEach(runMethod)
      }
    }

    return obs;
  }



/*
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
*/


  onViewStreamInfo(pl) {
    let action = this.channelActions.CHANNEL_ROUTE_CHANGE_EVENT;
    SpyneChannelRoute.checkForEventMethods(pl);
    let payload = this.getDataFromParams(pl);
    let srcElement = path(['viewStreamInfo', 'srcElement'], pl);
    let uiEvent = pl.viewStreamEvent;
    let changeLocationBool = !payload.isHidden;
    let keywordArrs = this.compareRouteKeywords.compare(payload.routeData, payload.paths);
    payload = rMerge(payload, keywordArrs);
    // this.checkForRouteParamsOverrides(payload);
    this.sendRouteStream(payload, changeLocationBool);
    // console.log("SEND STREAM onViewStreamInfo", payload);
    payload = SpyneChannelRoute.removeSSID(payload);

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
    let nextWindowLoc = SpyneUtilsChannelRouteUrl.formatStrAsWindowLocation(routeValue);
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
    const str = SpyneUtilsChannelRouteUrl.getLocationStrByType(type, hashIsTrue);
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
    const str = SpyneUtilsChannelRouteUrl.getLocationStrByType(type, isHash, loc);
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
    let obj = SpyneUtilsChannelRouteUrl.convertParamsToRoute(paramsData, routeConfig, type);

    // console.log("ROUTE getRouteStrFromParams ",paramsData,obj);
    return obj;
  }

  static getParamsFromRouteStr(str, routeConfig, t) {
    const type = t !== undefined ? t : routeConfig.type;
    let obj = SpyneUtilsChannelRouteUrl.convertRouteToParams(str, routeConfig, type);
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
