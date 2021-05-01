import { ChannelsDelegator } from './channels/channels-delegator';
import { ChannelDataPacketGenerator } from './utils/channel-data-packet-generator';
import { DomElement, DomEl } from './views/dom-element';
import {DomElementTemplate} from './views/dom-element-template';
import { ViewStreamElement } from './views/view-stream-element';
import { ViewStreamSelector} from './views/view-stream-selector';
import { ViewStream } from './views/view-stream';
import { ViewStreamBroadcaster } from './views/view-stream-broadcaster';
import { SpyneTrait } from './utils/spyne-trait';
import { ViewStreamPayload } from './views/view-stream-payload';
import { Channel } from './channels/channel';
import { ChannelFetch } from './channels/channel-fetch-class';
import {ChannelFetchUtil} from './utils/channel-fetch-util';
import { ChannelPayload } from './channels/channel-payload-class';
import {ChannelPayloadFilter} from './utils/channel-payload-filter';
import {SpyneUtilsChannelRoute} from './utils/spyne-utils-channel-route';
import {SpynePlugin} from './spyne-plugins';
import { deepMerge } from './utils/deep-merge';

class SpyneApp {
  /**
   *
   * SpyneApp creates the global Spyne object, and creates the following items
   * <ul>
   *
   * <li>LINK['ChannelsDelegator', 'channels-controller'] that directs the flow of data to all Channels</li>
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
  constructor(config = {}) {
    this.channels = new ChannelsDelegator();
    this.VERSION = '0.16.2';
/*!
 * Spyne 0.16.2
 * https://spynejs.org
 *
 * @license Copyright 2017-2020, Frank Batista, Relevant Context, LLC. All rights reserved.
 * Spyne is licensed under the GNU Lesser General Public License v3.0
 *
 * @author: Frank Batista,
 * @email:  frbatista.nyc@gmail.com
*/
/* eslint-disable */
    this.ViewStream = ViewStream;
    this.BasicView = ViewStreamElement;
    this.DomEl = DomElement;
    this.ViewStreamBroadcaster = ViewStreamBroadcaster;
    this.ChannelsPayload = ViewStreamPayload;
    this.ChannelsController = ChannelsDelegator;
    this.ChannelsBase = Channel;
    this.ChannelPayloadItem = ChannelPayload;
    this._channelDataPacketGenerator = new ChannelDataPacketGenerator();
    window.Spyne = this;
    let defaultConfig = {
      scrollLock: false,
      scrollLockX: 31,
      scrollLockY: 0,
      debug: false,
      utils: {
        tableRE: /^([^>]*?)(<){1}(\b)(thead|col|colgroup|tbody|td|tfoot|tr|th)(\b)([^\0]*)$/
      },
      tmp:{

      },
      plugins:{

      },
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

        },

        CHANNEL_ROUTE: {},
        CHANNEL_UI: {},
      }
    };
    if (config !== undefined) {
      config = SpyneUtilsChannelRoute.conformRouteObject(config);
      window.Spyne['config'] = deepMerge(defaultConfig, config)
    }


    //const ranNum = Math.random();
    //console.log('ranNum is ',{ranNum})
    this.getChannelActions = (str) => window.Spyne.channels.getChannelActions(str);
    this.registerChannel = (val) => this.channels.registerStream(val);
    this.registerDataChannel = (obs$) => this.channels.registerStream(obs$);
    this.listChannels = () => Array.from(window.Spyne.channels.map.keys());
    let nullHolder = new ViewStream({ id:'spyne-null-views' });
    nullHolder.appendToDom(document.body);
    nullHolder.props.el.style.cssText = 'display:none; opacity:0; pointer-events:none;';
    this.channels.init();
  }


  get createDataPacket(){
    return this._channelDataPacketGenerator.createDataPacket;
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
    return Array.from(window.Spyne.channels.map.keys());
  }

  /**
   * This method is useful to check in the console or in the code what actions are available to be listened to.
   * @param {String} str
   * @returns {Array} An array of Actions that can be listened to
   */
  static getChannelActions(str) {
    return window.Spyne.channels.getChannelActions(str);
  }

  /**
   *
   * This method will add the channel to the registered list so that it can subscribed by all ViewStream and Channel instances.
   * @param {Channel} c
   *
   *
   */
  static registerChannel(c) {
    if (window.Spyne === undefined) {
      console.warn('Spyne has not been initialized');
    } else {
      return window.Spyne.channels.registerStream(c);
    }
  }
}

window['Spyne'] = SpyneApp;
export {
  ViewStreamElement,
  Channel,
  ChannelFetch,
    ChannelFetchUtil,
  ChannelsDelegator,
  ViewStreamPayload,
  ChannelPayload,
    ChannelPayloadFilter,
  DomElement,
    DomEl,
  DomElementTemplate,
  ViewStream,
    ViewStreamSelector,
  ViewStreamBroadcaster,
  SpyneTrait,
  SpyneApp,
  SpynePlugin,
  deepMerge
};
