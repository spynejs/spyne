import {SpyneUtilsChannelRoute} from './spyne-utils-channel-route';
import {SpynePluginsMethods} from './spyne-plugins-methods';
import {deepMerge} from './deep-merge';
import {path} from 'ramda';

let _config;
let _channels;
let _channelsMap
let _initialized = false;
let _debug = true;

const _spynePluginMethods = new SpynePluginsMethods();


class SpyneAppPropertiesClass{

  constructor() {


  }

  get channelsMap(){
    return _channelsMap;
  }

  get initialized(){
    return _initialized;
  }

  get config(){
    return _config;
  }

  get debug(){
    return _debug;
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
    return Array.from(_channels.map.keys());
  }

  initialize(defaultConfig={}, config={}, channelsMap){
    _channels = channelsMap;
    let userConfig = config;
    if (config.channels && config.channels.ROUTE) {
       userConfig = SpyneUtilsChannelRoute.conformRouteObject(config);
    }
    _config = deepMerge(defaultConfig, userConfig);
    _debug = _config.debug!== undefined ? _config.debug : _debug;
    this.getChannelActions = _channels.getChannelActions.bind(_channels);
    this.listRegisteredChannels = _channels.listRegisteredChannels.bind(_channels);
    _initialized = true;
     this.setChannelsMap();


    return _config;

  }

  conformRouteConfig(add404Props=false){
    /**
     * THIS METHOD IS PRIMARILY USED FOR SPA GEN SITE GENERATION
     */

    _config = SpyneUtilsChannelRoute.conformRouteObject(_config, add404Props);

  }

  setChannelsMap(){
    const getStream = _channels.getStream.bind(_channels);
    const testStream =  _channels.testStream.bind(_channels);
    const getProxySubject = _channels.getProxySubject.bind(_channels);

    _channelsMap = {getStream, testStream, getProxySubject}

  }

  setProp(key, val){
    _config.tmp[key]=val;
  }

  getProp(key){
    return path(['tmp', key], _config);
  }

  setChannelConfig(channelName, config){
    _config.channels[channelName] = config;
    return _config.channels[channelName];
  }

  /**
   * This method is useful to check in the console or in the code what actions are available to be listened to.
   * @param {String} channelName
   * @returns {Array} An array of Actions that can be listened to
   */
/*  getChannelActions(channelName) {
    return _channels.getChannelActions(channelName);
  }*/

  getChannelConfig(channelName, config=_config){
    if (channelName === 'CHANNEL_ROUTE'){
      channelName = "ROUTE";
    } else if (channelName === 'CHANNEL_WINDOW'){
      channelName = "WINDOW";
    }

    if (config === undefined || _config.channels === undefined){
      console.warn('Spyne warning: Spyne config object is empty!')
      return;
    }

    const channelConfig = _config.channels[channelName];

    if (channelConfig === undefined){
      console.warn(`Spyne warning: Spyne configuration for channel, ${channelName} is empty!`)
      return;
    }

    return channelConfig;
  }

  registerChannel(){


  }

  addPluginConfig(pluginName, pluginConfig={}){
    if (_config['plugins']===undefined){
      _config['plugins'] = {};
    }
    this.addPluginMethods(pluginConfig['pluginMethods'])

    _config.plugins[pluginName]=pluginConfig;

  }

  getPluginsMethodObj(pluginMethodsObj){
    if(pluginMethodsObj){
      this.addPluginMethods(pluginMethodsObj);
    }

    return _spynePluginMethods.pluginMethodsObj;
  }

  addPluginMethods(pluginMethods){

    if (pluginMethods){

      _spynePluginMethods.addMethods(pluginMethods);

    }


  }

  getPluginConfigByPluginName(pluginName){
    return _config.plugins[pluginName];
  }

  tempGetChannelsInstance(){

  }

  tempGetConfig(){


  }




}

export let SpyneAppProperties = new SpyneAppPropertiesClass();
