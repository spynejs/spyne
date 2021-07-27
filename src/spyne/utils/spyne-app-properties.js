import {SpyneUtilsChannelRoute} from './spyne-utils-channel-route';
import {SpyneScrollLock} from './spyne-scroll-lock';
import {SpynePluginsMethods} from './spyne-plugins-methods';
import {ChannelsMap} from '../channels/channels-map';
import {deepMerge} from './deep-merge';
import {prop, path} from 'ramda';

let _config;
let _channels;
let _channelsMap
let _initialized = false;
let _debug = true;

const _spyneScrollLock = new SpyneScrollLock();
const _spynePluginMethods = new SpynePluginsMethods();


class SpyneAppPropertiesClass{

  constructor() {


  }



  initialize(defaultConfig={}, config={}, channelsMap){
    _channels = channelsMap;
    const userConfig = SpyneUtilsChannelRoute.conformRouteObject(config);
    _config = deepMerge(defaultConfig, userConfig);
    _debug = _config.debug!== undefined ? _config.debug : _debug;
    this.getChannelActions = _channels.getChannelActions.bind(_channels);
    this.listRegisteredChannels = _channels.listRegisteredChannels.bind(_channels);
    _initialized = true;
   // if (channelsMap!==undefined) {
      this.setChannelsMap();
    //}

    return _config;

  }

  conformRouteConfig(add404Props=false){
    /**
     * THIS METHOD IS PRIMARILY USED FOR SPA GEN SITE GENERATION
     */

    _config = SpyneUtilsChannelRoute.conformRouteObject(_config, add404Props);

  }



  setChannelsMap(){
    let obj = {};



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

  get channelsMap(){
    return _channelsMap;
  }

  get initialized(){
    return _initialized;
  }

  get scrollLock(){
    return _spyneScrollLock;
  }




  setChannelConfig(channelName, config){
    _config.channels[channelName] = config;
    return _config.channels[channelName];
  }


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

    //console.log("MAIN CONFIG IS ",{channelName, channelConfig, config});

    return channelConfig;
  }




  get config(){
    return _config;
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

  /**
   * This method is useful to check in the console or in the code what actions are available to be listened to.
   * @param {String} channelName
   * @returns {Array} An array of Actions that can be listened to
   */
/*  getChannelActions(channelName) {
    return _channels.getChannelActions(channelName);
  }*/


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

  get debug(){
    return _debug;
    //return _config['debug']===true;
  }




}

export let SpyneAppProperties = new SpyneAppPropertiesClass();
