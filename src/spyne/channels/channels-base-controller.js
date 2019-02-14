// import {baseCoreMixins}    from '../utils/mixins/base-core-mixins';
// import {BaseStreamsMixins} from '../utils/mixins/base-streams-mixins';
import {ChannelRoute} from './channel-route';
import {ChannelUI} from './channel-ui';
import {ChannelWindow} from './channel-window';
import {ChannelViewStreamLifecycle} from './channel-viewstream-lifecycle';
import {validate} from '../utils/channel-config-validator';

//import * as Rx from "rxjs-compat";
import {Subject} from "rxjs";


// const R = require('ramda');

export class ChannelsBaseController {
  constructor(obs$) {
    this.addMixins();
    this.map = new Map();

   // console.log('Rx is ',Rx);
    // console.log('RX IS ', Subject);
    this.map.set('DISPATCHER', new Subject());
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
    this.routeValueeam = new ChannelRoute();
    this.map.set('ROUTE', this.routeValueeam);

    this.uiStream = new ChannelUI();
    this.map.set('UI', this.uiStream);

    this.domStream = new ChannelWindow();
    this.map.set('WINDOW', this.domStream);

    this.viewStreamLifecycle = new ChannelViewStreamLifecycle();
    this.map.set('VIEWSTREAM_LIFECYCLE', this.viewStreamLifecycle);

    this.routeValueeam.initializeStream();
    this.domStream.initializeStream();
  }

  addKeyEvent(key) {
    this.map.get('UI').addKeyEvent(key);
  }

  registerStream(name, val) {
    this.map.set(name, val);
    val.initializeStream();
  }

  getChannelActions(str) {
    return this.map.get(str).addRegisteredActions();
  }

  getStream(name) {
    if (this.map.get(name) === undefined) {
      console.warn(
        `Spyne Warning: The Channel named "${name}" does not appear to be registered!`);
    } else {
      return this.map.get(name);
    }
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
