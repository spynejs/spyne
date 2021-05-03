import {SpyneUtilsChannelRoute} from './spyne-utils-channel-route';
import {deepMerge} from './deep-merge';

let _config;
let _channels;

class SpyneAppPropertiesClass{

  constructor() {



  }

  initialize(defaultConfig={}, config={}){
    const userConfig = SpyneUtilsChannelRoute.conformRouteObject(config);
    _config = deepMerge(defaultConfig, userConfig);
    console.log("CONFIG IN PROPS IS ",{_config})
    return _config;

  }


  get config(){
    return _config;
  }

  listChannels(){


  }

  getChannelConfigByName(channelName){

  }


  getChannelActions(){

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
