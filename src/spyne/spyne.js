import { ChannelsBaseController } from './channels/channels-base-controller';
import { DomItem } from './views/dom-item';
import { ViewToDomMediator } from './views/view-to-dom-mediator';
import { ViewStream } from './views/view-stream';
import { ViewStreamBroadcaster } from './views/view-stream-broadcaster';
import { SpyneTrait } from './utils/spyne-trait';
import { ViewStreamPayload } from './views/view-stream-payload';
import { ChannelsBase } from './channels/channels-base';
import { ChannelsFetch } from './channels/channels-base-fetch';
import { ChannelPayloadItem } from './channels/channel-payload-item';
import { deepMerge } from './utils/deep-merge';

class SpyneApp {
  constructor(config = {}) {
    this.channels = new ChannelsBaseController();
    this.VERSION = '0.9.13';
    this.ViewStream = ViewStream;
    this.BasicView = ViewToDomMediator;
    this.DomItem = DomItem;
    this.ViewStreamBroadcaster = ViewStreamBroadcaster;
    this.ChannelsPayload = ViewStreamPayload;
    this.ChannelsBaseController = ChannelsBaseController;
    this.ChannelsBase = ChannelsBase;
    this.ChannelPayloadItem = ChannelPayloadItem;
    window.Spyne = this;
    let defaultConfig = {
      channels: {
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
      window.Spyne['config'] = deepMerge(defaultConfig, config);// Object.assign({}, defaultConfig, config);// config !== undefined ? config : defaultConfig;
      // console.log("CONFIG IS ",{defaultConfig, config},window.Spyne.config)
    }
    this.getChannelActions = (str) => window.Spyne.channels.getChannelActions(str);
    this.registerChannel = (val) => this.channels.registerStream(val);
    this.registerDataChannel = (obs$) => this.channels.registerStream(obs$);
    this.listChannels = () => Array.from(window.Spyne.channels.map.keys());
    let nullHolder = new ViewStream({ id:'spyne-null-views' });
    nullHolder.appendToDom(document.body);
    nullHolder.props.el.style.cssText = 'display:none; opacity:0; pointer-events:none;';
    this.channels.init();

    // window.Spyne.channels.init();
  }

  static listChannels() {
    return Array.from(window.Spyne.channels.map.keys());
  }

  static getChannelActions(str) {
    return window.Spyne.channels.getChannelActions(str);
  }

  static registerChannel(val) {
    if (window.Spyne === undefined) {
      console.warn('Spyne has not been initialized');
    } else {
      return window.Spyne.channels.registerStream(val);
    }
  }
}

// let Spyne = {ViewToDomMediator, ChannelsBase, ChannelsBaseController, ViewStreamPayload, DomItem, ViewStream, ViewStreamBroadcaster, registerChannel};
window['Spyne'] = SpyneApp;
export {
  ViewToDomMediator,
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
