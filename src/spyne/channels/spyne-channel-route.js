import { Channel } from './channel';
import { SpyneUtilsChannelRouteUrl } from '../utils/spyne-utils-channel-route-url';
import { SpyneUtilsChannelRoute } from '../utils/spyne-utils-channel-route';
import {SpyneAppProperties} from '../utils/spyne-app-properties';
import { ReplaySubject, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  pick,
  find,
  omit,
  over,
  mergeRight,
  is,
  objOf,
  mergeAll,
  path,
  keys,
  prop,
  equals,
  head,
  compose,
  lensProp,
  chain,
  pickAll,
  defaultTo,
  isEmpty,
  concat,
  when,
  complement,
    reverse,
  curryN,
  __,
  test,
  replace,
  toPairs,
  reduce
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
     * <p>The SpyneChannelRoute has the two main duties:
     *  <ul>
     *   <li>Combine data with the current window location to update the location's pathname.</li>
     *   <li>Listen to window location changes to translate the location pathname into a series of model properties.</li>
     * </ul>
     * <p>In both cases, this channel sends a ChannelPayload containing updated route properties.</p>
     *
     * <h3>The two actions that are regsitered for the Route channel are:</h3>
     * <ul>
     * <li>CHANNEL_ROUTE_DEEPLINK_EVENT</li>
     * <li>CHANNEL_ROUTE_CHANGE_EVENT</li>
     *  </ul>
     *
     *    <h3>The Routes Configuration Object</h3>
     *    <p>Thr routes configuration object is used to map the location string to and from a route model.</p>
     *
     *     <pre>           {
     *                routePath: {
     *                  routeName: 'levelOneProp',
     *                  routeOption1: 'branching-ends-here',
     *                  routeOption2: {
     *                     routePath: {
     *                             routeName: 'levelTwoProp',
     *                             optionLevel2: 'level-2-branch-ends-here'
     *
     *                             }
     *                         }
     *                }
     *            }
     *
     *          </pre>
     *     <p>This config object consists of nested routePath objects that corresponds to all of the branching possiblities for the app.</p>
     *    <p>The routeName value is the property name for each routePath.</p>
     *    <h3>Route Options</h3>
     *    <p>A routePath may contain several route option key-value pairs, which is used to map between data and the window location.</p>
     *    <ul class='basic'>
     *      <li>
     *         <h5 class='basic'>The Route Option Key (or left value)</h5>
     *         <ul class='decimal'>
     *         <li>Maps the window location to route data properties</li>
     *         <li>This channel can 'fill in the blanks' so that only the updated level routeNames are required to revise the window location</li>
     *          <li>Can be a regex pattern so that multiple data properties can share the same branching logic</li>
     *          </ul>
     *      </li>
     *
     *      <li>
     *           <h5 class='basic'>The Route Option Value (or right value)</h5>
     *           <ul class='decimal'>
     *           <li>Maps data properties to part of a window location</li>
     *          <li>Determines the string value for its level of the window location</li>
     *          <li>The value can be a regex pattern so that multiple locations can map to same routeData property</li>
     *          <li>Branching ends for the route option when this value is a either a String or a regex pattern</li>
     *          <li>Branching continues for the route option when this value is a nested routePath object</li>
     *          </ul>
     *      </li>
     *      </ul>
     *
     *      <h3>Enhancing The App's Routing Logic</h3>
     *      <p>The best practice for a Spyne App is to have one component, a custom channel, listen to the SpyneRouteChannel. All other components will then listen to the custom route channel. This allows the custom route channel to enhance routing logic with more data and custom actions.</p>
     *      <p>You can see this custom routing channel in action in the Spyne Starter App</p>
     *
     *      <h4 class='basic'>Examining this Site's Route Configuration</h4>
     *      <article class='code-example' id='routes-config-example'></article>
     *      <p>You can see this site routing in action by opening up the console's routes panel</p>
     *      <div class='btn btn-blue-ref btn-console' data-type="console" data-value="open" data-channel-type="route">CLICK TO OPEN ROUTE PANEL</div>
     *
     * @example
     * TITLE["<h4>Binding UI ELements to the Route Channel</h4>"]
     * // This also is an example of how to override the RouteOption value (useful when the value is a regex pattern)
     * <div class='btn' data-channel="ROUTE" data-page-id='home' data-page-id-value=''>HOME</div>
     *
     * @example
     * TITLE["<h4>Updating the Route Channel using ViewStream&rsquo;s sendInfoToChannel</h4>"]
     * const dataUpdateObj = {pageId:'guide', section:'reference', menuItem:'spyne-route-channel'};
     * this.sendInfoToChannel("CHANNEL_ROUTE", dataUpdateObj);
     *
     * @example
     * TITLE["<h4>Updating the Route Channel using Channel&rsquo;s sendPayloadToRouteChannel</h4>"]
     * const dataUpdateObj = {pageId:'guide', section:'reference', menuItem:'spyne-route-channel'};
     * this.sendPayloadToRouteChannel(dataUpdateObj);
     *
     * @constructor
     * @param {Object} config
     * @property {String} config.type - = 'slash'; This property determines the url structure by conforming the window pathname to either the slash, query or hash formats.
     * @property {Object} config.routes - = {routePath: {routeName:'change'}; This nested Object is used to contruct the window pathname and to express the window location as model variables.
     * @property {String} CHANNEL_NAME - = 'CHANNEL_ROUTE';
     *
     */
    props.sendCachedPayload = true;
    super('CHANNEL_ROUTE', props);
    this.createChannelActionsObj();
    this.routeConfigJson = this.getRouteConfig();
    this.bindStaticMethods();
    this.navToStream$ = new ReplaySubject(1);
    this.observer$ = this.navToStream$.pipe(map(info => this.onMapNext(info)));
    // let compareKeysFn = SpyneUtilsChannelRoute.compareRouteKeywords.bind(this);
    this.compareRouteKeywords = SpyneUtilsChannelRoute.compareRouteKeywords();
  }

  checkConfigForHash(){
    // LEGACY CHECK TO SIMPLIFY CONFIG FOR HASH;
    let isHashType = SpyneAppProperties.config.channels.ROUTE.type==='hash';
    if (isHashType === true){
      SpyneAppProperties.config.channels.ROUTE.type = 'slash';
      SpyneAppProperties.config.channels.ROUTE.isHash = true;
    }

  }

  onRegistered() {
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
      'CHANNEL_ROUTE_CHANGE_EVENT',
      'CHANNEL_ROUTE_CONFIG_UPDATED_EVENT',
      ['CHANNEL_ROUTE_UPDATE_CONFIG_EVENT', 'updateRouteConfig']
    ];
  }

  updateRouteConfig(e){

    const newRoutesObj  = pick(['isHash', 'isHidden', 'routes','type'], e.payload);

    SpyneAppProperties.config.channels.ROUTE =  mergeRight(SpyneAppProperties.config.channels.ROUTE, newRoutesObj);


    SpyneAppProperties.conformRouteConfig();


     const routeConfig = this.getRouteConfig();
     const action = 'CHANNEL_ROUTE_CONFIG_UPDATED_EVENT';

    this.routeConfigJson = routeConfig;
    this.bindStaticMethodsWithConfigData();


    this.sendChannelPayload(action, routeConfig, {}, {}, this.navToStream$);
  }

  getRouteConfig() {
    const spyneConfig = SpyneAppProperties.config;
    let routeConfig = path(['channels', 'ROUTE'], spyneConfig);
    if (routeConfig.type === 'query') {
      routeConfig.isHash = false;
    }

    let arr = SpyneUtilsChannelRoute.flattenConfigObject(routeConfig.routes);
    // console.log("FLATTENED CONFIG ",arr);
    routeConfig['paramsArr'] = arr;
    //console.log("ROUTE CONFIG IS ",routeConfig);
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
   // console.log("MAP NEXT ",{firstLoaded, data});
    data['action'] = 'CHANNEL_ROUTE_CHANGE_EVENT';
    return data;
  }

  static removeSSID(payload){
    const routeLens = lensProp(['routeData']);
    const omitSSID = over(routeLens, omit(['vsid']));
    return omitSSID(payload);;
  }

  static onIncomingDomEvent(evt, config = this.routeConfigJson, actn) {
    let action = actn !== undefined
      ? actn
      : this.channelActions.CHANNEL_ROUTE_CHANGE_EVENT;

    // CHECK IF THIS IS A HISTORY EVENT BY USING THE routeCount PROPERTY
    let eventCount = path(['state', 'routeCount'], evt);
    let isHistoryCount = is(Number, eventCount) === true;
    let payload = this.getDataFromString(config, isHistoryCount);
     if (isHistoryCount===true){
       payload.routeCount = eventCount;
     }
     // ===============================================================

    let keywordArrs = this.compareRouteKeywords.compare(payload.routeData, payload.paths);
    payload = rMerge(payload, keywordArrs);
    // console.log("SEND STREAM onIncomingDomEvent", payload, keywordArrs);;
   // payload = SpyneChannelRoute.removeSSID(payload);
      this.sendChannelPayload(action, payload, undefined, evt, this.navToStream$);

  }

  static checkForRouteParamsOverrides(payload) {
    // console.log("CHECK FOR OVERRIDES ",payload);

    return payload;
  }

  static checkForEventMethods(obs){
    const re = /^(event)([A-Z].*)([A-Z].*)$/gm;
    const getMethods = compose(ramdaFilter(test(re)), keys, prop('payload'));
    const methodsArr = getMethods(obs);
    if (methodsArr.length>=1) {
      const evt = prop('event', obs);
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


  static checkForEndRoute(pl, routeConfigJson = this.routeConfigJson, debugBool){

    const endRoute = compose(equals("true"), path(['payload', 'endRoute']))(pl);

    if (endRoute!==true){
      return pl;
    }
    const debug = debugBool !== undefined ? debugBool : SpyneAppProperties.debug === true;
     const {payload} = pl;


      const getPropVal = (routePath) => {
        const routeName = prop('routeName', routePath);
        if (routeName){
          const keysArr = compose(keys, omit(['routeName']))(routePath);
          let routeNameVal = payload[routeName]
          const pred = arrStr => new RegExp(`^${arrStr}$`).test(routeNameVal);
          const routeVal = find(pred, keysArr);
          return routeVal;

        }
      }

      let iter = 0;
      const onReduceRoutePaths = (acc=[], arr)=>{
        const [key, val] = arr;
        const {routePath} = val;
        const routeName = prop('routeName', routePath);
        const routeNameVal = getPropVal(routePath);
        const isObj = is(Object, val);
        const isArr = is(Array, val);
        const iterObj = isObj === true && isArr === false;
        iter = iter+1;
        if (iterObj) {
          const nextRoutePath = routePath[routeNameVal];
          //console.log('key is ',{iter,acc,key, routeName, routeNameVal, iterObj, nextRoutePath});
          if (nextRoutePath){
              compose(reverse, reduce(onReduceRoutePaths, acc), toPairs)({nextRoutePath})
          } else{
            //console.log("KEY IS ",{iter,key, routeName, routeNameVal})
            if (iter===1){
              if (debug) {
                console.warn(`Spyne Warning: use of end route method should add start route value of "${routeName}".`)
              }
            } else {
              acc.push(routeName)
            }
          }
         // compose(reduce(onReduceRoutePaths), toPairs)(nextRoutePath);
        }
        return acc;

      }

      const {routes} = routeConfigJson;

      const endRouteValArr = compose(reverse, reduce(onReduceRoutePaths, []), toPairs)({routes});
        //console.log('end route val arr ',endRouteValArr);
        if(endRouteValArr.length===1){
          const endRouteVal = endRouteValArr[0];
          pl.payload[endRouteVal] = "";
        } else{
          if (debug) {
           // console.warn(`Spyne Warning: the end route param did not yield any results for ${JSON.stringify(payload)} `);
          }
        }

    return pl;

  }

  onViewStreamInfo(pl) {
    let action = this.channelActions.CHANNEL_ROUTE_CHANGE_EVENT;
    SpyneChannelRoute.checkForEventMethods(pl);
    pl = this.checkForEndRoute(pl);
    let payload = this.getDataFromParams(pl);

    let srcElement = prop('srcElement', pl);
    let event = prop('event', pl);
    let changeLocationBool = !payload.isHidden;
    let keywordArrs = this.compareRouteKeywords.compare(payload.routeData, payload.paths);

    payload = rMerge(payload, keywordArrs);
    this.sendRouteStream(payload, changeLocationBool);

    payload = SpyneChannelRoute.removeSSID(payload);

    this.sendChannelPayload(action, payload, srcElement, event,
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

  static getIsDeepLinkBool(isHistory) {
    return isHistory === false && this._routeCount === 0;
  }

  static getRouteCount(isHistory=false) {
    if (this._routeCount === undefined) {
      this._routeCount = 0;
      return this._routeCount;
    }
    if (isHistory===false) {
      this._routeCount += 1;
    }
    return this._routeCount;
  }

  static getExtraPayloadParams(config = this.routeConfigJson, isHistory=false) {
    let routeCount = this.getRouteCount(isHistory);
    let isDeepLink = this.getIsDeepLinkBool(isHistory);
    //console.log("GETTING DEEP LINK ", {routeCount, isDeepLink,isHistory, config})
    let isHash = config.isHash;
    let isHidden = config.isHidden;
    let routeType = config.type;
    return { routeCount, isDeepLink, isHash,isHistory, isHidden, routeType };
  }

  static getDataFromParams(pl, config = this.routeConfigJson) {
    let routeData = prop('payload', pl);

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

    let { routeCount, isDeepLink, isHash,isHistory, isHidden, routeType } = this.getExtraPayloadParams(
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
      isHistory,
      routeType
    };
  }

  static getDataFromString(config = this.routeConfigJson, isHistory=false) {
    const type = config.type;
    const hashIsTrue = config.isHash === true;
    // type = config.isHash === true ? ''
    const str = SpyneUtilsChannelRouteUrl.getLocationStrByType(type, hashIsTrue);
    let { paths, pathInnermost, routeData, routeValue } = SpyneChannelRoute.getParamsFromRouteStr(
      str, config, type);
    let { routeCount, isDeepLink, isHash, routeType, isHidden } = this.getExtraPayloadParams(
      config,isHistory);

    let obj = {
      isDeepLink,
      routeCount,
      pathInnermost,
      paths,
      routeData,
      routeValue,
      isHash,
      isHidden,
      isHistory,
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
     let {routeCount} = channelPayload;
    if (isHash === true) {
      let pathName = SpyneChannelRoute.removeLastSlash(window.location.pathname);
      routeValue = pathName + routeValue;
      // window.location.hash = routeValue;
      // console.log('ROUTE STR FOR HASH ', routeValue);
      window.history.pushState({routeCount}, '', routeValue);
    } else {
      // routeValue =  when(isEmpty, always('/'))(routeValue);
      const checkForSlash = when(
        compose(complement(equals('/')), head), concat('/', __));
      window.history.pushState({routeCount}, '', checkForSlash(routeValue));
    }
  }

  getWindowLocation() {
    return window.location.pathname; // pullHashAndSlashFromPath(window.location.hash);
  }

  bindStaticMethods() {
    this.checkForEndRoute = SpyneChannelRoute.checkForEndRoute.bind(this);
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
    this.bindStaticMethodsWithConfigData();
  }

  bindStaticMethodsWithConfigData(){
    const curriedGetRoute = curryN(3, SpyneChannelRoute.getRouteStrFromParams);
    this.getRouteStrFromParams = curriedGetRoute(__, this.routeConfigJson,
        this.routeConfigJson.type);
  }

}
