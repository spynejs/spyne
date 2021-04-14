// import {baseCoreMixins}    from '../utils/mixins/base-core-mixins';
// import {BaseStreamsMixins} from '../utils/mixins/base-streams-mixins';
import { SpyneChannelRoute } from './spyne-channel-route';
import { SpyneChannelUI } from './spyne-channel-ui';
import { SpyneChannelWindow } from './spyne-channel-window';
import { SpyneChannelLifecycle } from './spyne-channel-lifecycle';
import { validate } from '../utils/channel-config-validator';

import { Subject } from 'rxjs';
import { ChannelProxy } from './channel-proxy';
import {propEq, pluck, prop, filter, pathEq, clone, reject, compose, join} from 'ramda';
const rMap = require('ramda').map;

// import * as R from 'ramda';

export class ChannelsDelegator {
  /**
   * @module ChannelsDelegator
   * @type internal
   *
   * @desc
   * This object creates the logic so that Channels and ViewStreams can communicate with each other
   *
   * @constructor
   *
   */


  constructor() {
    this.addMixins();
    this.map = new Map();

    // console.log('Rx is ',Rx);
    // console.log('RX IS ', Subject);
    this.map.set('DISPATCHER', new Subject());
    this.listRegisteredChannels = ChannelsDelegator.listRegisteredChannels.bind(this);
    this.getChannelsList = ChannelsDelegator.getChannelsList.bind(this);
    //window.setTimeout(this.checkForMissingChannels.bind(this), 8000);
  }

  static getChannelsList() {
    const proxyMapFn =  (k, v) => {
      let key = k[0];
      let val = k[1].constructor.name;
      return { key, val };
    };
    return Array.from(window.Spyne.channels.map, proxyMapFn);
  }

  static listRegisteredChannels(showOnlyProxies = false) {
    let proxyMap = this.getChannelsList();
    let rejectProxyFn = reject(propEq('val', 'ChannelProxy'));
    let filterProxyFn = filter(propEq('val', 'ChannelProxy'));
    let fn = showOnlyProxies === true ? filterProxyFn : rejectProxyFn;
    let removedProxyArr = fn(proxyMap);
    return pluck(['key'], removedProxyArr);
  }
  listProxyChannels() {
    return this.listRegisteredChannels(true);
  }

  checkForMissingChannels() {
    let proxyMap = this.getChannelsList();
    let filterProxyFn = filter(propEq('val', 'ChannelProxy'));
    let filterProxyArr = filterProxyFn(proxyMap);

    if (filterProxyArr.length >= 1) {
      let channelStr = filterProxyArr.length === 1 ? 'Channel has' : 'Channels have';
      let channels = compose(join(', '), rMap(prop('key')))(filterProxyArr);
      let filterPrefixWarning = `Spyne Warning: The following ${channelStr} not been initialized: ${channels}`;
      console.warn(filterPrefixWarning);
      // console.log("FILTER PROXY WARNING ",filterProxyArr);
    }

    // console.log(filterProxy(proxyMap),' proxyMap ', proxyMap);
  }

  init() {
    this.createMainStreams();
  }

  createObserver(obj) {
    // RIGHT NOW THIS CREATES THE DISPATCHER STREAM
    validate(obj.validations, obj.init);
    this.map.set(obj.init.name, obj.init.observable());
  }

  createMainStreams() {
    this.routeStream = new SpyneChannelRoute();
    this.map.set('CHANNEL_ROUTE', this.routeStream);
    window.Spyne.config.channels['CHANNEL_ROUTE'] = {};

    this.uiStream = new SpyneChannelUI();
    this.map.set('CHANNEL_UI', this.uiStream);
    window.Spyne.config.channels['CHANNEL_UI'] = {};

    this.domStream = new SpyneChannelWindow();
    this.map.set('CHANNEL_WINDOW', this.domStream);
    window.Spyne.config.channels['CHANNEL_WINDOW'] = {};
    
    this.viewStreamLifecycle = new SpyneChannelLifecycle();
    this.map.set('CHANNEL_LIFECYCLE', this.viewStreamLifecycle);
    window.Spyne.config.channels['CHANNEL_LIFECYCLE'] = {};

    this.routeStream.initializeStream();
    this.domStream.initializeStream();
  }

  addKeyEvent(key) {
    this.map.get('UI').addKeyEvent(key);
  }

  registerStream(val) {
    let name = val.channelName;
    const nameExists = this.map.has(name);
    if (nameExists){
      const isAlreadyRegisterd = compose(pathEq(['props', 'isRegistered'], true))(this.map.get(name));
      if(isAlreadyRegisterd){
        console.warn(`Spyne Warning: The Channel, ${name}, has already been registered!`);
        return;
      }
    }

    window.Spyne.config.channels[name] = {};

    this.map.set(name, val);
    val.initializeStream();
  }

  getChannelActions(str) {
    return this.map.get(str).addRegisteredActions();
  }

  getProxySubject(name, isReplaySubject = false) {
    let subjectType = isReplaySubject === true ? 'replaySubject' : 'subject';

    return this.map.get(name)[subjectType];
  }

  testStream(name) {
    return this.map.get(name) !== undefined;
  }

  getStream(name) {
    if (this.testStream(name) === false) {
      this.map.set(name, new ChannelProxy(name));
    }

    return this.map.get(name);
  }

  addMixins() {
    //  ==================================
    // BASE CORE DECORATORS
    //  ==================================
    // let coreMixins =  baseCoreMixins();
    //  ==================================
    // BASE STREAMS DECORATORS
    //  ==================================
    // let streamsMixins = BaseStreamsMixins();
  }
}
