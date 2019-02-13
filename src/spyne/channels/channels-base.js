import {registeredStreamNames} from './channels-config';
import {ChannelStreamItem} from './channel-stream-item';
import {deepMerge} from '../utils/deep-merge';
// import {baseCoreMixins}    from '../utils/mixins/base-core-mixins';
// import {BaseStreamsMixins} from '../utils/mixins/base-streams-mixins';
import { Subject} from "rxjs";
import {map} from "rxjs/operators";

//import * as Rx from "rxjs-compat";

const R = require('ramda');

export class ChannelsBase {
  /**
   * @module ChannelsBase
   * @desc
   * This class is extended when creating a new Channel.
   *
   *
   * @constructorExamples ['new EXAMPLE1()', 'TESTING EXAMPLE 2']
   *
   * @constructor
   * @param {object} props This json object takes in parameters to initialize the channel
   * @property {Subject} this.observer$ = new Subject(); Depending on required behavior, this can be a Subject, BehaviorSubject or AsynSubject.
   *
   */
  constructor(props = {}) {
    this.addMixins();
    this.addRegisteredActions.bind(this);
    this.createChannelActionsObj();
    const defaultName = {name: 'observer'};
    let observer$ = new Subject();
   // this.props = Object.assign({}, defaultName, props);
    this.props = deepMerge(defaultName, props);
    this.createChannelActionMethods();

    this.observer$ = this.props['observer'] = observer$;
    this.streamsController = window.Spyne.channels;// getGlobalParam('streamsController');
    let dispatcherStream$ = this.streamsController.getStream('DISPATCHER');
    dispatcherStream$.subscribe((val) => this.onReceivedObservable(val));
  }


  //  OVERRIDE INITIALIZATION METHOD
  onStreamInitialized(){

  }


  // DO NOT OVERRIDE THIS METHOD
  initializeStream(){
    this.onStreamInitialized();
  }

  setTrace(bool) {
  }


  createChannelActionsObj() {
    const getActionVal = R.ifElse(R.is(String), R.identity, R.head);
    let arr =R.map(getActionVal, this.addRegisteredActions());
    //console.log("ARR IS ",arr);
    const converter = str => R.objOf(str, str);
    let obj = R.mergeAll(R.chain(converter, arr));
    this.channelActions = obj;
  }

  createChannelActionMethods(){
    const defaultFn = 'onIncomingObserverableData';
    const getActionVal = R.ifElse(R.is(String), R.identity, R.head);
    const getCustomMethod = val => {
      const methodStr = R.view(R.lensIndex(1), val);
      const hasMethod = typeof(this[methodStr]) === 'function';
      if (hasMethod === true){
        this[methodStr].bind(this);
      } else {
        console.warn(`"${this.props.name}", REQUIRES THE FOLLOWING METHOD ${methodStr} FOR ACTION, ${val[0]}`);
      }

      return methodStr;
    };

    const  getArrMethod =  R.ifElse(R.is(String), R.always(defaultFn),getCustomMethod);

    const createObj = val => {
     let key = getActionVal(val);
     let method =  getArrMethod(val);
      return [key, method];
    };

    this.channelActionMethods =  R.fromPairs(R.map(createObj, this.addRegisteredActions()));

    //console.log('the channel action methods ',this.channelActionMethods);


  }


  addRegisteredActions() {
    return [];
  }

  get observer() {
    return this.observer$;
  }

  onReceivedObservable(obj){
    let action = obj.action;

   // console.log("BASE ACTION IS ",obj);
    this.onIncomingObservable(obj);


  }

  getActionMethodForObservable(obj){

    const defaultFn = this.onIncomingObserverableData.bind(this);

    let methodStr = R.path(['data', 'action'], obj);
    const methodVal = R.prop(methodStr, this.channelActionMethods);
   // console.log('getting obj is METHOD STR ',{methodStr,methodExists,methodVal}, this[methodVal]);;


    let fn = defaultFn;//.defaultTo(this[methodVal], defaultFn);

    if (methodVal !== undefined && methodVal!=='onIncomingObserverableData') {
      const methodExists = typeof(this[methodVal]) === 'function';
      if (methodExists === true) {
        fn = this[methodVal];
        console.log("METHOD EXISTS ", methodVal, fn);
      }
    }

    return fn;
  }

  onIncomingObservable(obj) {
    let eqsName = R.equals(obj.name, this.props.name);
    let dataObj = obsVal => ({
      observableData: obj.data,
      observableEvent: obsVal
    });
    let onSuccess = (obj) => obj.observable.pipe(map(dataObj))
      .subscribe(this.getActionMethodForObservable(obj));
    let onError = () => {};
    return eqsName === true ? onSuccess(obj) : onError();
  }

  onIncomingObserverableData(obj) {
  }

  sendStreamItem(action, payload, srcElement, event, obs$ = this.observer$) {
   // MAKES ALL CHANNEL BASE AND DATA STREAMS CONSISTENT
    let channelStreamItem = new ChannelStreamItem(this.props.name, action, payload, srcElement, event);
   // console.log("CHANNEL STREEM ITEM ",channelStreamItem);
/*
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
*/


    obs$.next(channelStreamItem);
  }


  /**
   *
   * This method allows channels to subscribe to other channels.
   * @property {String} channel The registered name of the requested channel.
   * @returns {Subject} This will return the observer$ Subject variable.
   */
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
