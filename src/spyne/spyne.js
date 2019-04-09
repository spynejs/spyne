import { ChannelsController } from './channels/channels-controller';
import { DomItem } from './views/dom-item';
import { ViewStreamObservable } from './views/view-stream-observable';
import { ViewStream } from './views/view-stream-base';
import { ViewStreamBroadcaster } from './views/view-stream-broadcaster';
import { SpyneTrait } from './utils/spyne-trait';
import { ViewStreamPayload } from './views/view-stream-payload';
import { ChannelBaseClass } from './channels/channel-base-class';
import { ChannelFetch } from './channels/channel-fetch-class';
import { ChannelPayload } from './channels/channel-payload-class';
import {ChannelPayloadFilter} from './utils/channel-payload-filter';
import { deepMerge } from './utils/deep-merge';

class SpyneApp {
  /**
   *
   * SpyneApp initializes the app and creates a global Spyne object that can be used to contain global properties and has several methods
   *
   * <h3>Initializing Internal Spyne Channels</h3>
   * <p>Internal Spyne Channels extend the <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="channel-base-class"  href="/guide/reference/channel-base-class" >ChannelBaseClass</a>.</br>
   *
   * And Spyne App automatically creates all internal Spyne channels when instantiated.
   * There is one Internal channel for each type of information, <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="spyne-channel-u-i"  href="/guide/reference/spyne-channel-u-i" >UI</a>., <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="spyne-channel-window"  href="/guide/reference/spyne-channel-window" >WINDOW</a>., <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="spyne-channel-route"  href="/guide/reference/spyne-channel-route" >ROUTE</a>. and <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="spyne-channel-life-cycle"  href="/guide/reference/spyne-channel-life-cycle" >LIFECYCLE</a> <br/>These channels are not meant to be extended.</p>
   *
   *     <h3>Each Channel have the following unique properties</h3>
   * <ol>
   *     <li>Each may have seperate type of configuration properties</li>
   *     <li>Internal Channels listens for their respective event types</li>
   *     <li>Internal Channels returns specific relevant properties in their channel payloads</li>
   * </ol>
   * @module SpyneApp
   *
   *
   * @constructor
   * @param {Object} config
   */
  constructor(config = {}) {
    this.channels = new ChannelsController();
    this.VERSION = '0.9.16';
    this.ViewStream = ViewStream;
    this.BasicView = ViewStreamObservable;
    this.DomItem = DomItem;
    this.ViewStreamBroadcaster = ViewStreamBroadcaster;
    this.ChannelsPayload = ViewStreamPayload;
    this.ChannelsController = ChannelsController;
    this.ChannelsBase = ChannelBaseClass;
    this.ChannelPayloadItem = ChannelPayload;
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
  ViewStreamObservable,
  ChannelBaseClass,
  ChannelFetch,
  ChannelsController,
  ViewStreamPayload,
  ChannelPayload,
    ChannelPayloadFilter,
  DomItem,
  ViewStream,
  ViewStreamBroadcaster,
  SpyneTrait,
  SpyneApp,
  deepMerge
};
