import { SpyneUtilsChannelRoute } from './spyne-utils-channel-route.js'
import { SpyneUtilsChannelRouteUrl } from './spyne-utils-channel-route-url.js'
import { SpynePluginsMethods } from './spyne-plugins-methods.js'
import { deepMerge } from './deep-merge.js'

let _config
let _channels
let _channelsMap
let _initialized
let _debug = true
let _enableCMSProxies = false
let _cmsRehydrator
let _cmsLineageWarner
const _excludeChannelsFromConsole = []
/* eslint-disable */
let _linksData
let _navLinks
let _IMG_PATH
const _doNotTrackChannelsArr = []
const _proxiesMap = new Map()

function random6Chars() {
  // For simplicity: slice(2, 8) gets 6 random chars from the substring
  return Math.random().toString(36).slice(2, 8);
}

const _spynePluginMethods = new SpynePluginsMethods()

class SpyneAppPropertiesClass {
  constructor() {
    _initialized = false
  }

  get channelsMap() {
    return _channelsMap
  }

  get initialized() {
    return _initialized
  }

  get config() {
    return _config
  }

  get debug() {
    return _debug
  }

  /**
   * The application's sanitization mode, set via config.mode in SpyneApp.init.
   * 'app' (default) is the strict production posture; 'richtext' (aliases:
   * 'authoring', 'development') is the permissive posture for CMS and
   * authoring tools.
   */
  get mode() {
    return _config?.mode !== undefined ? _config.mode : 'app'
  }

  /**
   * This is mostly used for debugging purposes
   *
   * @example
   * TITLE['<h4>Listing the registereed Channels in the browser console</h4>']
   * SpyneApp.listChannels();
   *
   * @returns A list of all registered channels
   */
  static listChannels() {
    return Array.from(_channels.map.keys())
  }

  initialize(defaultConfig = {}, config = {}, channelsMap, routeUtils) {
    _channels = channelsMap
    _config = deepMerge(defaultConfig, config)
    // console.log("config is ", { defaultConfig,config });
    if (_config.channels && _config.channels.ROUTE) {
      // _config = SpyneUtilsChannelRoute.conformRouteObject(_config)
      _config = routeUtils.conformRouteObject(_config)
    }
    _IMG_PATH = _config?.IMG_PATH
    _debug = _config.debug !== undefined ? _config.debug : _debug
    this.getChannelActions = _channels.getChannelActions.bind(_channels)
    this.listRegisteredChannels = _channels.listRegisteredChannels.bind(_channels)
    _initialized = true
    this._initialized = _initialized
    this.setChannelsMap()
    if (config?.baseHref) {
      this.setHeadBaseHref(config.baseHref)
    }
    return _config
  }

  setHeadBaseHref(str) {
    // Create a new base element
    const baseTag = document.createElement('base')
    // Set the href attribute to the desired base URL
    baseTag.href = str // You can set this to any base URL
    // Append the base element to the head section of the document
    document.head.appendChild(baseTag)
  }

  conformRouteConfig(add404Props = false) {
    /**
     * THIS METHOD IS PRIMARILY USED FOR SPA GEN SITE GENERATION
     */

    // eslint-disable-next-line no-undef
    _config = SpyneUtilsChannelRoute.conformRouteObject(_config, add404Props)
  }

  setChannelsMap() {
    const getStream = _channels.getStream.bind(_channels)
    const testStream =  _channels.testStream.bind(_channels)
    const getProxySubject = _channels.getProxySubject.bind(_channels)

    _channelsMap = { getStream, testStream, getProxySubject }
  }

// ──────────────────────────────────────────────────────────────────────────
// FIXED: durable setProp/getProp + isolated ephemeral (read-once) tier
//
// Contract after fix:
//   setProp(key, val)            → durable. Persists for the app lifespan.
//                                   Returns val.
//   setProp(key, val, true)      → ephemeral. Read-once via getProp. Returns val.
//   createTempProp(val)          → ephemeral with generated key. Returns the key.
//   getProp(key)                 → returns durable value if present;
//                                   otherwise returns ephemeral value ONCE,
//                                   then deletes it. The two tiers cannot
//                                   shadow each other.
// ──────────────────────────────────────────────────────────────────────────

  setProp(key, val, isTemp = false) {
    if (isTemp) {
      _config.ephemeralProps[key] = val;
    } else {
      _config.tmpProps[key] = val;
    }
    return val;                       // FIX 2: both tiers return the stored value
  }

  getProp(key) {
    // FIX 1+3: durable tier resolves FIRST and independently. A durable value
    // can never be shadowed or consumed by a same-named ephemeral key.
    if (_config?.tmpProps && Object.prototype.hasOwnProperty.call(_config.tmpProps, key)) {
      return _config.tmpProps[key];
    }
    // Ephemeral tier: read-once. Only reached when no durable value exists.
    if (_config?.ephemeralProps && Object.prototype.hasOwnProperty.call(_config.ephemeralProps, key)) {
      const tempVal = _config.ephemeralProps[key];
      delete _config.ephemeralProps[key];
      return tempVal;
    }
    return undefined;
  }

  createTempProp(value) {
    const key = random6Chars();
    this.setProp(key, value, true);   // isTemp = true
    return key;                       // returns key (correct — caller needs it to read back)
  }


  setChannelConfig(channelName, config) {
    _config.channels[channelName] = config
    return _config.channels[channelName]
  }

  /**
   * This method is useful to check in the console or in the code what actions are available to be listened to.
   * @param {String} channelName
   * @returns {Array} An array of Actions that can be listened to
   */
  /*  getChannelActions(channelName) {
    return _channels.getChannelActions(channelName);
  } */

  getChannelConfig(channelName, config = _config) {
    if (channelName === 'CHANNEL_ROUTE') {
      channelName = 'ROUTE'
    } else if (channelName === 'CHANNEL_WINDOW') {
      channelName = 'WINDOW'
    }

    if (config === undefined || _config.channels === undefined) {
      console.warn('Spyne warning: Spyne config object is empty!')
      return
    }

    const channelConfig = _config.channels[channelName]

    if (channelConfig === undefined) {
      console.warn(`Spyne warning: Spyne configuration for channel, ${channelName} is empty!`)
      return
    }

    return channelConfig
  }

  registerChannel() {

  }

  addPluginConfig(pluginName, pluginConfig = {}) {
    if (_config.plugins === undefined) {
      _config.plugins = {}
    }
    this.addPluginMethods(pluginConfig.pluginMethods)

    _config.plugins[pluginName] = pluginConfig
  }

  getPluginsMethodObj(pluginMethodsObj) {
    if (pluginMethodsObj) {
      this.addPluginMethods(pluginMethodsObj)
    }

    return _spynePluginMethods.pluginMethodsObj
  }

  addPluginMethods(pluginMethods) {
    if (pluginMethods) {
      _spynePluginMethods.addMethods(pluginMethods)
    }
  }

  doNotTrackChannel(channelName) {
    _doNotTrackChannelsArr.push(channelName)
  }

  getUntrackedChannelsList() {
    return _doNotTrackChannelsArr
  }

  registerProxyReviver(name, method) {
    _proxiesMap.set(name, method)
    // console.log("REGISTERD PROXY REVIVER",_proxiesMap, _proxiesMap.get(name));
  }

  // This is the new method you add
  registerPlugin(pluginInstance) {
    if (!this._initialized) {
      console.warn('SpyneApp is not initialized yet. Plugin will not be fully registered.')
    }
    // console.log("INSTANCE ",this, pluginInstance)

    pluginInstance.register(this)
  }

  getProxyReviver(proxyName) {
    return _proxiesMap.get(proxyName)
  }

  /**
   * Registers the CMS re-hydration hook consulted by DomElementTemplate when
   * it receives plain (unproxied) data while CMS proxies are enabled. The
   * hook receives the template data and returns either revived proxy data
   * for that content or undefined to decline. Implementations must be cheap
   * for non-CMS data — ideally a single own-property read before bailing.
   */
  registerCmsRehydrator(method) {
    _cmsRehydrator = method
  }

  get rehydrateCmsData() {
    return _cmsRehydrator
  }

  /**
   * Registers the debug-mode hook DomElementTemplate calls when data renders
   * unproxied while CMS proxies are enabled and re-hydration declined —
   * the lineage reporter that turns silent proxy strips into warnings.
   */
  registerCmsLineageWarner(method) {
    _cmsLineageWarner = method
  }

  get warnUnproxiedCmsData() {
    return _cmsLineageWarner
  }

  getPluginConfigByPluginName(pluginName) {
    return _config.plugins[pluginName]
  }

  get IMG_PATH() {
    return _IMG_PATH
  }

  get excludeChannelsFromConsole() {
    return _excludeChannelsFromConsole
  }

  // Setter for _excludeChannelsFromConsole
  set excludeChannelsFromConsole(value) {
    if (typeof value === 'string') {
      // Push a single string into the array if not already present
      if (!_excludeChannelsFromConsole.includes(value)) {
        _excludeChannelsFromConsole.push(value)
      }
    } else if (Array.isArray(value)) {
      // Merge an array into the existing array, avoiding duplicates
      value.forEach(item => {
        if (typeof item === 'string' && !_excludeChannelsFromConsole.includes(item)) {
          _excludeChannelsFromConsole.push(item)
        }
      })
    } else {
      console.warn('Invalid value provided to excludeChannelsFromConsole. Only strings or arrays are allowed.')
    }
  }

  get linksData() {
    console.warn('get links data in SpyneAppProperties is deprecated, use navLinks')
    return _navLinks
  }

  set linksData(arr) {
    console.warn('set links data in SpyneAppProperties is deprecated, use navLinks')
  }

  get navLinks() {
    return _navLinks
  }

  set navLinks(arr) {
    _navLinks = arr
  }

  get enableCMSProxies(){
    return _enableCMSProxies
  }

  getHrefFromData(routeProps={}){

    return SpyneUtilsChannelRouteUrl.convertParamsToRoute(routeProps);

  }

  set enableCMSProxies(bool=true){
    _enableCMSProxies = Boolean(bool);
  }

  setCMSProxyMethod(fn){
    this.enableCMSProxies = true;
    this.formatTemplateForProxyData = fn;

  }

  tempGetChannelsInstance() {

  }

  tempGetConfig() {

  }
}

export const SpyneAppProperties = new SpyneAppPropertiesClass()
