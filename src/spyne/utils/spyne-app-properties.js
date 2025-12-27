import { SpyneUtilsChannelRoute } from './spyne-utils-channel-route.js'
import { SpynePluginsMethods } from './spyne-plugins-methods.js'
import { deepMerge } from './deep-merge.js'

let _config
let _channels
let _channelsMap
let _initialized
let _debug = true
let _enableCMSProxies = false
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

  setProp(key, val, isTemp = false) {
    if (isTemp) {
      _config.ephemeralProps[key] = val;
      return val;
    } else {
      _config.tmpProps[key] = val;
    }
    return  key;
  }

  getProp(key) {
    if (_config.ephemeralProps.hasOwnProperty(key)) {
      const tempVal = _config.ephemeralProps[key];
      delete _config.ephemeralProps[key];
      return tempVal;
    }
    return _config?.tmpProps?.[key];
  }

  createTempProp(value) {
    const key = random6Chars();
    this.setProp(key, value, true); // isTemp = true
    return key;
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
