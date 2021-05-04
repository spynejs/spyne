import {SpyneUtilsChannelRoute} from './spyne-utils-channel-route';
import {deepMerge} from './deep-merge';

let _config;
let _channels;

class SpyneAppPropertiesClass{

  constructor() {



  }

  initialize(defaultConfig={}, config={}, channelsMap=new Map()){
    _channels = channelsMap;
    const userConfig = SpyneUtilsChannelRoute.conformRouteObject(config);
    _config = deepMerge(defaultConfig, userConfig);
    console.log("CONFIG IN PROPS IS ",{_config})
    return _config;

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
   * @param {String} str
   * @returns {Array} An array of Actions that can be listened to
   */
  static getChannelActions(str) {
    return _channels.getChannelActions(str);
  }


  registerChannel(){


  }

  get channelsMap(){
    return this._channelsMap;
  }


  tempGetChannelsInstance(){

  }

  tempGetConfig(){


  }




}

export let SpyneAppProperties = new SpyneAppPropertiesClass();
