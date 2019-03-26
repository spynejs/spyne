import { ChannelsBaseController } from './channels/channels-base-controller';
import { DomItem } from './views/dom-item';
import { DomItemObservable } from './views/dom-item-observable';
import { ViewStream } from './views/view-stream';
import { ViewStreamBroadcaster } from './views/view-stream-broadcaster';
import { SpyneTrait } from './utils/spyne-trait';
import { ViewStreamPayload } from './views/view-stream-payload';
import { ChannelsBase } from './channels/channels-base';
import { ChannelsFetch } from './channels/channels-base-fetch';
import { ChannelPayloadItem } from './channels/channel-payload-item';
import { deepMerge } from './utils/deep-merge';

class SpyneApp {
  /**
   *
   * SpyneApp initializes the app and creates a global Spyne object that can be used to contain global properties and has several methods
   *
   * @param {Object} config
   */

  constructor(config = {}) {
    this.channels = new ChannelsBaseController();
    this.VERSION = '0.9.14';
    this.ViewStream = ViewStream;
    this.BasicView = DomItemObservable;
    this.DomItem = DomItem;
    this.ViewStreamBroadcaster = ViewStreamBroadcaster;
    this.ChannelsPayload = ViewStreamPayload;
    this.ChannelsBaseController = ChannelsBaseController;
    this.ChannelsBase = ChannelsBase;
    this.ChannelPayloadItem = ChannelPayloadItem;
    window.Spyne = this;
    let defaultConfig = {
      channels: {
        verbose: false,
        WINDOW: {
          mediqQueries: {
          /*  'test': '(max-width: 500px)',
            'newTest': '(max-width: 800px)' */
          },
          events: [],
          listenForResize: true,
          listenForOrientation: true,
          listenForScroll: true,
          listenForMouseWheel: false,
          debounceMSTimeForResize: 200,
          debounceMSTimeForScroll: 150
        },

        ROUTE: {
          type: 'slash',
          isHash: false,
          isHidden: false,
          routes: {
            'routePath' : {
              'routeName' : 'change'
            }
          }

        }
      }
    };
    if (config !== undefined) {
      window.Spyne['config'] = deepMerge(defaultConfig, config);
    }
    this.getChannelActions = (str) => window.Spyne.channels.getChannelActions(str);
    this.registerChannel = (val) => this.channels.registerStream(val);
    this.registerDataChannel = (obs$) => this.channels.registerStream(obs$);
    this.listChannels = () => Array.from(window.Spyne.channels.map.keys());
    let nullHolder = new ViewStream({ id:'spyne-null-views' });
    nullHolder.appendToDom(document.body);
    nullHolder.props.el.style.cssText = 'display:none; opacity:0; pointer-events:none;';
    this.channels.init();
  }

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
  DomItemObservable,
  ChannelsBase,
  ChannelsFetch,
  ChannelsBaseController,
  ViewStreamPayload,
  ChannelPayloadItem,
  DomItem,
  ViewStream,
  ViewStreamBroadcaster,
  SpyneTrait,
  SpyneApp,
  deepMerge
};
