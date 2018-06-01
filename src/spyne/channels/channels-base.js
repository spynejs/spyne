import {registeredStreamNames} from './channels-config';
import {ChannelStreamItem} from './channel-stream-item';
import {deepMerge} from '../utils/deep-merge';
// import {baseCoreMixins}    from '../utils/mixins/base-core-mixins';
// import {BaseStreamsMixins} from '../utils/mixins/base-streams-mixins';
const Rx = require('rxjs');
const R = require('ramda');

export class ChannelsBase {
  constructor(props = {}) {
    this.addMixins();
    this.addRegisteredActions.bind(this);
    this.createChannelActionsObj();
    const defaultName = {name: 'observer'};
    let observer$ = new Rx.Subject();
   // this.props = Object.assign({}, defaultName, props);
    this.props = deepMerge(defaultName, props);
    this.observer$ = this.props['observer'] = observer$;
    this.streamsController = window.Spyne.channels;// getGlobalParam('streamsController');
    let dispatcherStream$ = this.streamsController.getStream('DISPATCHER');
    dispatcherStream$.subscribe((val) => this.onIncomingObservable(val));
  }

  initializeStream(){
  }

  setTrace(bool) {
  }

  createChannelActionsObj() {
    let arr = this.addRegisteredActions();
    const converter = str => R.objOf(str, str);
    let obj = R.mergeAll(R.chain(converter, arr));
    this.channelActions = obj;
  }

  addRegisteredActions() {
    return [];
  }

  get observer() {
    return this.observer$;
  }

  onIncomingObservable(obj) {
    let eqsName = R.equals(obj.name, this.props.name);
    let dataObj = obsVal => ({
      observableData: obj.data,
      observableEvent: obsVal
    });
    let onSuccess = (obj) => obj.observable.map(dataObj)
      .subscribe(this.onIncomingObserverableData.bind(this));
    let onError = () => {};
    return eqsName === true ? onSuccess(obj) : onError();
  }

  onIncomingObserverableData(obj) {
  }

  sendStreamItem(action, payload, srcElement, event, obs$ = this.observer$) {
   // MAKES ALL CHANNEL BASE AND DATA STREAMS CONSISTENT
    let channelStreamItem = new ChannelStreamItem(this.props.name, action,
      payload, srcElement, event);
    //console.log("CHANNEL STREEM ITEM ",channelStreamItem);
      let obj = channelStreamItem;
    Object.freezeV2 = function( obj ) {
      var props = Object.getOwnPropertyNames( obj );

      for ( var i = 0; i < props.length; i++ ) {
        var desc = Object.getOwnPropertyDescriptor( obj, props[i] );

        if ( "value" in desc ) {
          desc.writable = false;
        }

        desc.configurable = false;
        Object.defineProperty( obj, props[i], desc );
      }

      return Object.preventExtensions( obj );
    };


    obs$.next(Object.freezeV2(channelStreamItem));
  }

  getChannel(channel) {
    let isValidChannel = c => registeredStreamNames().includes(c);
    let error = c => console.warn(
      `channel name ${c} is not within ${registeredStreamNames}`);
    let startSubscribe = (c) => this.streamsController.getStream(c).observer;
    let fn = R.ifElse(isValidChannel, startSubscribe, error);
    return fn(channel);
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
    // let testFunc = streamsMixins.testFunc;
  }
}
