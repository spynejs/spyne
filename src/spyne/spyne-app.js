import {ChannelsMap} from './channels/channels-map';
import {ViewStream} from './views/view-stream';
import {SpyneAppProperties} from './utils/spyne-app-properties';
import {deepMerge} from './utils/deep-merge';
const _channels = new ChannelsMap();
const version = '0.19.1';

class SpyneApplication {
  /**
   *
   * SpyneApp creates the global Spyne object, and creates the following items
   * <ul>
   *
   * <li>LINK['ChannelsMap', 'channels-controller'] that directs the flow of data to all Channels</li>
   * <li>LINK['SpyneChannelUI', 'spyne-channel-u-i'], that broadcast all user interaction events</li>
   * <li>LINK['SpyneChannelRoute', 'spyne-channel-route'], that broadcast window location changes and is the only other channel that can be bound to user events</li>
   * <li>LINK['SpyneChannelWindow', 'spyne-channel-window'], that broadcast all requested window and document events, such as scrolling, resizing and media queries</li>
   * <li>LINK['SpyneChannelLifecycle', 'spyne-channel-lifecycle'], that broadcasts rendering and removing of ViewStream elements that have been directed to broadcast their lifecycle events</li>
   * </ul>
   *
   *
   * @module SpyneApp
   * @type core
   *
   * @constructor
   * @param {Object} config
   * @property {Object} config - = {}; This global config object is mainly used to provide configuration details for two SpyneChannels, CHANNEL_ROUTE and CHANNEL_WINDOW.
   */

  constructor() {
    this.version = version

    //console.log('spyne app created')


  }
  get channels(){
    return _channels;
  }

  init(config = {}, testMode=false) {
    //this.channels = new ChannelsMap();
    /*!
     * Spyne 0.19.1
     * https://spynejs.org
     *
     * @license Copyright 2017-2021, Frank Batista, Relevant Context, LLC. All rights reserved.
     * Spyne is licensed under the GNU Lesser General Public License v3.0
     *
     * @author: Frank Batista,
     * @email:  frbatista.nyc@gmail.com
    */
    /* eslint-disable */


    if(SpyneAppProperties.initialized === true){
      if (testMode){
        return 'The Spyne Application has already been initialized!';
      } else {
        console.warn('The Spyne Application has already been initialized!');
      }
      return
    }


    let defaultConfig = {
      scrollLock: false,
      scrollLockX: 31,
      scrollLockY: 0,
      debug: true,
      plugins:{

      },
      tmp: {},
      channels: {
        WINDOW: {
          mediqQueries: {

          },
          events: [],
          listenForResize: true,
          listenForOrientation: true,
          listenForScroll: false,
          listenForMouseWheel: false,
          debounceMSTimeForResize: 200,
          debounceMSTimeForScroll: 150
        },

        ROUTE: {
          type: 'slash',
          isHash: false,
          isHidden: false,
          add404s: false,
          routes: {
            'routePath' : {
              'routeName' : 'change'
            }
          }

        }
      }
    };
    if (config !== undefined) {
       config = SpyneAppProperties.initialize(defaultConfig, config, _channels);
      //window.Spyne = this;
      //window.Spyne['config'] = deepMerge(defaultConfig, config)
    }

    this.pluginsFn = SpyneAppProperties.getPluginsMethodObj(config['pluginMethods']);
    this.getChannelActions = (str) => _channels.getChannelActions(str);
    this.registerChannel = (val) => _channels.registerStream(val);
    this.registerDataChannel = (obs$) => _channels.registerStream(obs$);
    this.listChannels = () => Array.from(_channels.map.keys());
    let nullHolder = new ViewStream({ id:'spyne-null-views' });
    nullHolder.appendToDom(document.body);
    nullHolder.props.el.style.cssText = 'display:none; opacity:0; pointer-events:none;';
    _channels.init();

    if (SpyneAppProperties.config.debug===true){
       window.Spyne = {version};
    }


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

  /**
   *
   * This method will add the channel to the registered list so that it can subscribed by all ViewStream and Channel instances.
   * @param {Channel} c
   *
   *
   */
  static registerChannel(c) {
    if (SpyneAppProperties.initialized === false) {
      console.warn('Spyne has not been initialized');
    } else {
      return _channels.registerStream(c);
    }
  }
}


export let SpyneApp = new SpyneApplication();
