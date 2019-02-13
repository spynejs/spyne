import {baseCoreMixins} from '../utils/mixins/base-core-mixins';
import {baseStreamsMixins} from '../utils/mixins/base-streams-mixins';
import {deepMerge} from '../utils/deep-merge';
import {
  ifNilThenUpdate,
  convertDomStringMapToObj,
  findStrOrRegexMatchStr,
  getConstructorName
} from '../utils/frp-tools';
// import {gc} from '../utils/gc';
import {ViewToDomMediator} from './view-to-dom-mediator';
import {ViewStreamEnhancerLoader} from './view-stream-enhancer-loader';
import {registeredStreamNames} from '../channels/channels-config';
import {ViewStreamBroadcaster} from './view-stream-broadcaster';
import {ChannelsPayload} from '../channels/channels-payload';
import {LifecyleObservables} from '../utils/viewstream-lifecycle-observables';
import {DomItemSelectors} from './dom-item-selectors';

//import * as Rx from "rxjs-compat";
import {Subject, Observable, merge} from "rxjs";
import {mergeMap, map,takeWhile,filter, tap, finalize} from "rxjs/operators";
const R = require('ramda');

export class ViewStream {
  /**
   * @module ViewStream
   * @borrows DomItemSelectors as el$
   *
   * @desc
   * The ViewStream is a special type of view that not only renders dom elements, but can be combined with other ViewStreams to create a 'smart' dom tree that automatically renders, change state and disposes of itself based on other ViewsStreams within its branch and based on subscribed channels.
   *
   *
   * @example
   * // returns <h2>Hello World</h2>
   * new ViewStream({tagName:'h2', data:'Hello World'};
   * @example
   * //  returns
   * <ul>
   *    <li>firstName: Jane<li>
   *    <li>lastName: Doe<li>
   *    <li>Age: 23<li>
   * </ul>
   *R.map(updateProperties),
   * let myTemplate = '<li>firstName: {{fName}}<li>lastName: {{lName}}<li>Age: {{age}}';
   * let myData = {fName: Jane, lName: Doe, age:23};
   * new ViewStream({tagName:'ul', data:myData, template:myTemplate});
   *
   *
   *
   * @constructor
   * @param {object} props This json object takes in parameters to generate or reference the dom element
   * @property {string} props.tagName - = 'div'; This can be any dom tag
   * @property {domItem} props.el - = undefined; if defined, ViewStream will connect to that element
   * @property {string|object} props.data - = undefined;  string for innerText or Json object for html template
   * @property {boolean} props.animateIn - = false; animates in View
   * @property {number} props.animateInTime - = .5;
   * @property {boolean} props.animateOut - = false; animates in View
   * @property {number} props.animateOutTime - = .5;
   * @property {string} props.id - = undefined; generates a random id if left undefined
   * @property {boolean} props.debug - = false;
   * @property {template} props.template - = undefined; html template
   *
   */
  constructor(props = {}) {
    this.checker = Math.random();
    this.addMixins();
    this.defaults = () => {
      const cid = this.createId();
      const id = props.id ? props.id : cid;
      return {
        cid,
        id,
        tagName: 'div',
        el: undefined,
        data: undefined,
        animateIn: false,
        animateInTime: 0.5,
        animateOut: false,
        animateOutTime: 0.5,
        hashId: `#${id}`,
        viewClass: ViewToDomMediator,
        extendedSourcesHashMethods: {},
        debug: false,
        template: undefined,
        node: document.createDocumentFragment(),
        name: getConstructorName(this)
      };
    };
    this._state = {};
    this.$dirs = LifecyleObservables.createDirectionalFiltersObject();
    this.addDefaultDirection = LifecyleObservables.addDefaultDir;
    this.addDownInternalDir = LifecyleObservables.addDownInternalDir;
    //this.props = Object.assign({}, this.defaults(), props);
    this.props = deepMerge(this.defaults(), props);
    //window.Spyne['config'] = deepMerge(defaultConfig, config);// Object.assign({}, defaultConfig, config);// config !== undefined ? config : defaultConfig;
    let attributesArr = ['id', 'class', 'dataset'];
    const addToAttributes = (arr) => attributesArr.concat(arr);

    this.props['domAttributes'] = R.pick(attributesArr,
      this.props);
    this.loadEnhancers();
    this.loadAllMethods();
    this.props.action = 'LOADED';
    this.sink$ = new Subject();
    const ViewClass = this.props.viewClass;
    this.view = new ViewClass(this.sink$, {}, this.props.cid,
      this.constructor.name);// new this.props.viewClass(this.sink$);
    this.sourceStreams = this.view.sourceStreams;
    this._rawSource$ = this.view.getSourceStream();
    this._rawSource$['viewName'] = this.props.name;
    this.sendEventsDownStream = this.sendEventsDownStreamFn;
    this.initViewStream();
    this.checkIfElementAlreadyExists();
  }

  checkIfElementAlreadyExists() {
    const elIsDomElement = el => el !== undefined && el.tagName !== undefined;
    const elIsRendered = el => document.body.contains(el);
    const elIsReadyBool = R.propSatisfies(
      R.allPass([elIsRendered, elIsDomElement]), 'el');
    if (elIsReadyBool(this.props)) {
      this.postRender();
    }
  }

  loadEnhancers(arr = []) {
    let enhancerLoader = new ViewStreamEnhancerLoader(this, arr);
    this.props['enhancersMap'] = enhancerLoader.getEnhancersMap();
    enhancerLoader = undefined;
  }

  loadAllMethods() {
    const channelFn = R.curry(this.onChannelMethodCall.bind(this));
    let createExtraStatesMethod = (arr) => {
      let [action, funcStr, enhancer] = arr;
      let defaultEnhancer = R.defaultTo('LOCAL');
      this.props.extendedSourcesHashMethods[action] = channelFn(funcStr,
        defaultEnhancer(enhancer));
    };
    this.addActionListeners().forEach(createExtraStatesMethod);
    this.props.hashSourceMethods = this.setSourceHashMethods(
      this.props.extendedSourcesHashMethods);
  }

  addActionListeners() {
    return [];
  }

  onChannelMethodCall(str, enhancer, p) {
    if (p.$dir !== undefined && p.$dir.includes('child') &&
        this.deleted !== true) {
      let obj = deepMerge({},p);// Object.assign({}, p);
      obj['$dir'] = this.$dirs.C;
      this.sourceStreams.raw$.next(obj);
    }

    const methodsArr = this.props.enhancersMap.get(enhancer);
    if (R.contains(str, methodsArr) === false) {
      console.warn(
        `Spyne Warning: The method, "${str}", does not appear to exist in ${enhancer} file! `);
    } else {
      this[str](p);
    }
  }

  setSourceHashMethods(extendedSourcesHashMethods = {}) {
    let hashSourceKeys = {
      'DISPOSING': (p) => this.checkParentDispose(p),
      'DISPOSE': (p) => this.onDispose(p),
      // 'CHILD_DISPOSE'                    : (p) => this.onDispose(p),
      'RENDERED': (p) => this.onRendered(p),
      'RENDERED_AND_ATTACHED_TO_DOM': (p) => this.onRendered(p),
      'RENDERED_AND_ATTACHED_TO_PARENT': (p) => this.onRendered(p),
      // 'CHILD_RENDERED'                   : (p) => this.attachChildToView(p),
      'READY_FOR_GC': (p) => this.onReadyToGC(p),
      'NOTHING': () => ({})
    };
    return deepMerge.all([{}, hashSourceKeys, extendedSourcesHashMethods]);
  }

  //  =====================================================================
  // ====================== MAIN STREAM METHODS ==========================
  initViewStream() {
    this._source$ = this._rawSource$.pipe(map(
      (payload) => this.onMapViewSource(payload)), takeWhile(this.notGCSTATE));

    this.initAutoMergeSourceStreams();
    this.updateSourceSubscription(this._source$, true);
  }

  notGCSTATE(p) {
    return !p.action.includes('READY_FOR_GC');
  }

  eqGCSTATE(p) {
    return !p.action.includes('READY_FOR_GC');
  }

  notCOMPLETED(p) {
    return !p.action.includes('COMPLETED');
  }

  notGCCOMPLETE(p) {
    return !p.action.includes('GC_COMPLETE');
  }

  testVal(p) {
    console.log('TESTING VALL IS ', p);
  }

  addParentStream(obs, attachData) {
    let filterOutNullData = (data) => data !== undefined && data.action !==
        undefined;
    let checkIfDisposeOrFadeout = (d) => {
      let data = deepMerge({}, d);

      if (data.action === 'DISPOSE_AND_READY_FOR_GC') {
        this.onDispose(data);
        data.action = 'READY_FOR_GC';
      }
      return data;
    };

    this.parent$ = obs.pipe(
        filter(filterOutNullData),
      map(checkIfDisposeOrFadeout),
      takeWhile(this.notGCCOMPLETE));
    this.updateSourceSubscription(this.parent$, false, 'PARENT');
    this.renderAndAttachToParent(attachData);
  }

  addChildStream(obs$) {
    let filterOutNullData = (data) => data !== undefined && data.action !==
        undefined;
    let child$ = obs$.pipe(
        filter(filterOutNullData),
      tap(p => this.tracer('addChildStraem do ', p)),
      map((p) => {
        return p;
      }),
      finalize(p => this.onChildCompleted(child$.source)));
    this.updateSourceSubscription(child$, true, 'CHILD');
  }

  onChildDisposed(p){

  }

  onChildCompleted(p) {
    let findName = (x) => {
      let finalDest = (y) => {
        while (y.destination !== undefined) {
          y = finalDest(y.destination);
        }
        return y;
      };
      return R.pick(['viewName', 'cid'], finalDest(x));
    };
    let childCompletedData= findName(p);
    this.tracer('onChildCompleted ', this.checker, p);
    //console.log('obj is ',childCompletedName,obj,this.props);
    this.onChildDisposed(childCompletedData, p);
    return childCompletedData;
  }

  initAutoMergeSourceStreams() {
    // ====================== SUBSCRIPTION SOURCE =========================
    let subscriber = {
      next: this.onSubscribeToSourcesNext.bind(this),
      error: this.onSubscribeToSourcesError.bind(this),
      complete: this.onSubscribeToSourcesComplete.bind(this)
    };
    // let takeBeforeGCOld = (val) => val.action !== 'GARBAGE_COLLECTED';
    // let takeBeforeGC = (p) => !p.action.includes('READY_FOR_GC');
    // let mapToState = (val) => ({action:val});
    //  =====================================================================
    // ========== METHODS TO CHECK FOR WHEN TO COMPLETE THE STREAM =========
    let completeAll = () => {
      this.props.el$.unmount();
      this.uberSource$.complete();
      this.autoSubscriber$.complete();
      this.sink$.complete();
      this.props = undefined;
      this.deleted = true;
      this.tracer('completeAll', this.deleted, this.props);
    };
    let decrementOnObservableClosed = () => {
      obsCount -= 1;
      if (obsCount === 0) {
        completeAll();
      }
    };
    //  =====================================================================
    // ======================== INIT STREAM METHODS ========================
    let obsCount = 0;
    this.uberSource$ = new Subject();
    // ======================= COMPOSED RXJS OBSERVABLE ======================
    let incrementObservablesThatCloses = () => { obsCount += 1; };
    this.autoMergeSubject$ = this.uberSource$.pipe(mergeMap((obsData) => {
      let branchObservable$ = obsData.observable.pipe(filter(
        (p) => p !== undefined && p.action !== undefined), map(p => {
        // console.log('PAYLOAD IS ', p, this.constructor.name)
        let payload = deepMerge({},p);
        payload.action = p.action;// addRelationToState(obsData.rel, p.action);
        this.tracer('autoMergeSubject$', payload);
        return payload;
      }));

      if (obsData.autoClosesBool === false) {
        return branchObservable$;
      } else {
        incrementObservablesThatCloses();
        return branchObservable$.pipe(finalize(decrementOnObservableClosed));
      }
    }));
    // ============================= SUBSCRIBER ==============================
    this.autoSubscriber$ = this.autoMergeSubject$
    // .do((p) => console.log('SINK DATA ', this.constructor.name, p))
      .pipe(filter((p) => p !== undefined && p.action !== undefined))
      .subscribe(subscriber);
  }

  // ========================= MERGE STREAMS TO MAIN SUBSCRIBER =================
  updateSourceSubscription(obs$, autoClosesBool = false, rel) {
    // const directionArr = sendDownStream === true ? this.$dirs.DI : this.$dirs.I;
    let obj = {
      observable: obs$,
      autoClosesBool,
      rel
    };
    this.tracer('updateSourceSubscription ', this.checker, obj);
    this.uberSource$.next(obj);
  }

  // ============================= SUBSCRIBER METHODS ==============================
  onSubscribeToSourcesNext(payload = {}) {
    let defaultToFn = R.defaultTo((p) => this.sendExtendedStreams(p));

    // ****USE REGEX AS PREDICATE CHECK FOR PAYLOAD.ACTION IN HASH METHODS OBJ
    // const hashAction = this.props.hashSourceMethods[payload.action];
    const hashActionStr = findStrOrRegexMatchStr(this.props.hashSourceMethods,
      payload.action);
    const hashAction = this.props.hashSourceMethods[hashActionStr];
    // console.log('S PAYLOAD ', this.props.name, typeof (hashAction), payload);

    let fn = defaultToFn(hashAction);

    // console.log('hash methods ', fn, this.props.name, payload.action, hashActionStr, this.props.hashSourceMethods);

    fn(payload);
    // console.log(fn, payload, ' THE PAYLOAD FROM SUBSCRIBE IS ', ' ---- ', ' ---> ', this.props);
    // console.log('DISPOSER VS NEXT', this.constructor.name, payload);

    this.tracer('onSubscribeToSourcesNext', {payload});
  }

  onSubscribeToSourcesError(payload = '') {
    console.log('ALL ERROR  ', this.constructor.name, payload);
  }

  onSubscribeToSourcesComplete() {
    // console.log('==== DISPOSER ALL COMPLETED ====', this.constructor.name);
    this.tracer('onSubscribeToSourcesComplete', 'GARBAGE_COLLECT');

    this.openSpigot('GARBAGE_COLLECT');
  }

  //  =======================================================================================
  // ============================= HASH KEY AND SPIGOT METHODS==============================
  get source$() {
    return this._source$;
  }

  sendExtendedStreams(payload) {
    this.tracer('sendExtendedStreams', payload);
    // console.log('extended methods ', payload.action, payload);
    this.openSpigot(payload.action, payload);
  }

  // ===================================== RENDER METHODS ==================================
  renderAndAttachToParent(attachData) {
    // let childRenderData = attachData;
    this.openSpigot('RENDER_AND_ATTACH_TO_PARENT', attachData);
  }

  renderView() {
    this.openSpigot('RENDER');
  }

  renderViewAndAttachToDom(node, type, attachType) {
    let attachData = {node, type, attachType};
    this.openSpigot('RENDER_AND_ATTACH_TO_DOM', {attachData});
  }

  attachChildToView(data) {
    // let childRenderData = data.attachData;
    // console.log('CHILD DATA ', this.constructor.name, childRenderData);
    // this.openSpigot('ATTACH_CHILD_TO_SELF', {childRenderData});
  }

  // ===================================== DISPOSE METHODS =================================
  checkParentDispose(p) {
    if (p.from$ === 'parent') {
      this.onDispose(p);
    }
  }

  onBeforeDispose(){

  }

  onDispose(p) {
    // console.log('DISPOSER VS onDispose ', this.constructor.name);
    this.onBeforeDispose();
    this.openSpigot('DISPOSE');
  }

  onChildDispose(p) {
  }

  onParentDisposing(p) {
    // this.updateSourceSubscription(this._source$);
    this.openSpigot('DISPOSE');
  }

  onReadyToGC(p) {
    const isInternal = p.from$ !== undefined && p.from$ === 'internal';
    if (isInternal) {
      // this.openSpigot('GARBAGE_COLLECT');
    }
    this.tracer('onReadyToGC', isInternal, p);
  }

  // ===================================== SINK$ METHODS =================================

  sendEventsDownStreamFn(o, action = {}) {
    // console.log('OBJ ACTION ', o, action);
    let obj = deepMerge({action}, o);
    // obj['action'] = action;
    obj['$dir'] = this.$dirs.C;
    // console.log('OBJ FINAL ', obj);
    this.sourceStreams.raw$.next(obj);
  }

  openSpigot(action, obj = {}) {
    if (this.props !== undefined) {
      this.props.action = action;
      let data = R.merge(this.props, obj);
      this.sink$.next(Object.freeze(data));
    }
  }

  setAttachData(attachType, query) {
    return {
      node: this.props.el,
      type: 'ViewToDomMediator',
      attachType,
      query: this.props.el.querySelector(query)
    };
  }

  getParentEls(el, num) {
    let getElem = el => el.parentElement;
    let iter = 0;
    let parentEl = el;
    while (iter < num) {
      parentEl = getElem(parentEl);
      iter++;
    }
    return parentEl;
  }

  setAttachParentData(attachType, query, level) {
    return {
      node: this.getParentEls(this.props.el, level),
      type: 'ViewToDomMediator',
      attachType,
      query: this.props.el.parentElement.querySelector(query)
    };
  }

  onMapViewSource(payload = {}) {
    this.props = R.merge(this.props, payload);
    return payload;
  }

  // ====================== ATTACH STREAM AND DOM DATA AGGREGATORS==========================
  exchangeViewsWithChild(childView, attachData) {
    this.addChildStream(childView.sourceStreams.toParent$);
    childView.addParentStream(this.sourceStreams.toChild$, attachData);
  }

  /**
   * Appends a ViewStream object to an existing dom element.
   * @property {dom} node the ViewStream child that is to be attached.
   * @example
   * //  returns
   * <body>
   *    <h2>Hello World</h2>
   * </body>
   *
   * let viewStream = new ViewStream('h2', 'Hello World');
   * viewStream.appendToDom(document.body);
   *
   */
  appendToDom(node) {
    this.renderViewAndAttachToDom(node, 'dom', 'appendChild');
  }

  /**
   * Prepends the current ViewStream object to an existing dom element.
   * @property {dom} node the ViewStream child that is to be attached.
   *
   * @example
   * this.prependToDom(document.body);
   *
   */

  prependToDom(node) {
    this.renderViewAndAttachToDom(node, 'dom', 'prependChild');
  }

  /**
   * This method appends a child ViewStream object. <br>After the attachment, rxjs observables are exchanged between the parent and child ViewStream objects.<br><br>
   * @property {ViewStream} v the ViewStream child that is to be attached.
   * @property {string} query a querySelector within this ViewStream.
   *
   * @example
   * //  returns
   * <body>
   *    <main>
   *        <h2>Hello World</h2>
   *    </main>
   * </body>
   *
   *
   * let parentView = new ViewStream('main');
   * parentView.appendToDom(document.body);
   *
   * let childView = new ViewStream({tagName:'h2', data:'Hello World'};
   * parentView.appendView(childView)
   *
   * */
  appendView(v, query) {
    this.exchangeViewsWithChild(v, this.setAttachData('appendChild', query));
  }

  /**
   * This method appends a child ViewStream object to a parent ViewStream object.
   * @property {ViewStream} v the ViewStream parent.
   * @property {string} query a querySelector within this ViewStream.
   * @property {level} this parameters can attach the viewStream's dom element up the dom tree while still maintaining the parent-child relationship of the ViewStream objects.
   *
   * @example
   * //  returns
   * <body>
   *    <main>
   *        <h2>Hello World</h2>
   *    </main>
   * </body>
   *
   *
   * let parentView = new ViewStream('main');
   * parentView.appendToDom(document.body);
   *
   * let childView = new ViewStream({tagName:'h2', data:'Hello World'};
   * childView.appendToParent(parentView)
   *
   * */

  appendViewToParent(v, query, level = 1) {
    this.exchangeViewsWithChild(v,
      this.setAttachParentData('appendChild', query, level));
  }

  /**
   * This method prepends a child ViewStream object to a parent ViewStream object.
   * @property {ViewStream} v the ViewStream parent.
   * @property {string} query a querySelector within this ViewStream.
   * @property {number} level this parameter can attach the viewStream's dom element up the dom tree while still maintaining the parent-child relationship of the ViewStream objects.
   *
   * @example
   * let parentView = new ViewStream('main');
   * parentView.prependToDom(document.body);
   *
   * let childView = new ViewStream({tagName:'h2', data:'Hello World'};
   * childView.prependViewToParent(parentView)
   *
   * */
  prependViewToParent(v, query, level = 1) {
    this.exchangeViewsWithChild(v,
      this.setAttachParentData('prependChild', query, level));
  }

  /**
   *
   *
   * This method prepends a child ViewStream object to the current ViewStream object. <br>After the attachment, rxjs observables are exchanged between the parent and child ViewStream objects.<br><br>
   * @property {ViewStream} v the ViewStream child that is to be attached.
   * @property {string} query a querySelector within this ViewStream.
   *
   * @example
   * //  returns
   * <body>
   *    <main>
   *        <h2>Hello World</h2>
   *    </main>
   * </body>
   *
   * let parentView = new ViewStream('main');
   * parentView.appendToDom(document.body);
   *
   * let childView = new ViewStream({tagName:'h2', data:'Hello World'};
   * parentView.prependView(childView);
   *
   * */

  prependView(v, query) {
    this.exchangeViewsWithChild(v, this.setAttachData('prependChild', query));
  }


  /**
   *  Appends a ViewStream object that are not rendered to the #spyne-null-views div.
   */
  appendToNull() {
    let node = document.getElementById('spyne-null-views');
    this.renderViewAndAttachToDom(node, 'dom', 'appendChild');
  }


  onRendered(payload) {
    // console.log('RENDER: ', this.props.name, payload);
    if (payload.from$ === 'internal') {
      // this.props['el'] = payload.el.el;

      this.postRender();
      // this.broadcaster = new Spyne.ViewStreamBroadcaster(this.props, this.broadcastEvents);
    }
  }

  postRender() {
    this.beforeAfterRender();
    this.afterRender();
    this.viewsStreamBroadcaster = new ViewStreamBroadcaster(this.props,
      this.broadcastEvents);
  }

  beforeAfterRender() {
    this.props.el$ = new DomItemSelectors(this.props.el);

    // console.log('EL IS ', this.props.el$.elArr);
    // window.theEl$ = this.props.el$;
  }

  // ================================= METHODS TO BE EXTENDED ==============================
  /**
   *
   * This method is called once the ViewStream's domElement has been rendered and attached to the dom.
   * <br>
   * This method is empty and is meant to be overridden.
   *
   * */

  // THIS IS AN EVENT HOLDER METHOD BECAUSE SENDING DOWNSTREAM REQUIRE THE PARENT TO HAVE A METHOD
  downStream() {

  }

  afterRender() {
  }

  /**
   *
   * Add any query within the ViewStream's dom and any dom events to automatically be observed by the UI Channel.
   * <br>
   * @example
   *
   *  broadcastEvents() {
     *  // ADD BUTTON EVENTS AS NESTED ARRAYS
     *  return [
     *       ['#my-button', 'mouseover'],
     *       ['#my-input', 'change']
     *     ]
     *   }
   *
   *
   * */

  broadcastEvents() {
    // ADD BUTTON EVENTS AS NESTED ARRAYS
    return [];
  }

  /**
   *
   * Automatically connect to an instance of registered channels, such as 'DOM', 'UI', and 'ROUTE' channels.
   *
   *
   * @example
   *
   * let uiChannel = this.getChannel('UI');
   *
   * uiChannel
   *    .filter((p) => p.data.id==='#my-button')
   *    .subscribe((p) => console.log('my button was clicked ', p));
   *
   * */

  getChannel(channel) {
    let isValidChannel = c => registeredStreamNames().includes(c);
    let error = c => console.warn(
      `channel name ${c} is not within ${registeredStreamNames}`);
    let startSubscribe = (c) => {
      let obs$ = window.Spyne.channels.getStream(c).observer;
      return obs$.pipe(takeWhile(p => this.deleted !== true));
    };// getGlobalParam('streamsController').getStream(c).observer;

    let fn = R.ifElse(isValidChannel, startSubscribe, error);

    return fn(channel);
  }

  /**
   *
   * Preferred method to connect to instances of registered channels, such as 'DOM', 'UI', and 'ROUTE' channels.
   *
   * Add Channel will automatically unsubscribe to the channel, whereas the getChannel method requires the developer to manually unsubscribe.
   *
   * @property {string} str The name of the registered Channel that was added to the Channels Controller.
   * @property {boolean} bool false, add true if the View should wait for this channel to unsubscribe before removing itself.
   * @property {sendDownStream} bool The direction where the stream is allowed to travel.
   *
   * @example
   *
   * let routeChannel = this.addChannel('ROUTE');
   *
   *      addActionListeners() {
     *           return [
     *             ['CHANNEL_ROUTE_CHANGE_EVENT', 'onMapRouteEvent']
     *           ]
     *       }
   *
   *       onMapRouteEvent(p) {
     *          console.log('the route value is ', p);
     *       }
   *
   *
   * */

  addChannel(str, sendDownStream = false, bool = false) {
    const directionArr = sendDownStream === true ? this.$dirs.CI : this.$dirs.I;
    const mapDirection = p => {
      let p2 = R.defaultTo({}, R.clone(p));
      let dirObj = {$dir: directionArr};
      return deepMerge(dirObj, p2);
     // Object.assign({$dir: directionArr}, R.clone(p))
    };
    const isLocalEventCheck = R.path(['srcElement', 'isLocalEvent']);
    const cidCheck = R.path(['srcElement', 'cid']);
    const cidMatches = p => {
      let cid = cidCheck(p);
      let isLocalEvent = isLocalEventCheck(p);
      const filterEvent = isLocalEvent !== true || cid === this.props.cid;
      //console.log("checks ",cid,this.props.cid, isLocalEvent,filterEvent);
      return filterEvent;
    };



    let channel$ = this.getChannel(str).pipe(map(mapDirection), filter(cidMatches));
    this.updateSourceSubscription(channel$, false);
  }

  /**
   * Method to send data to any registered channel.
   * @property {string} channelName The name of the registered Channel that was added to the Channels Controller.
   * @property {string} action The event type that listeners can point to.
   * @property {object} payload {}, The main data to send to the channel.
   * @example
   * let payload = {'location' : 'about'};
   * let action = 'PAGE_CHANGE_EVENT';
   * this.sendChannelPayload('ROUTE', paylaod, action);
   *
   * */

  sendChannelPayload(channelName, payload = {},  action="VIEWSTREAM_EVENT") {
    let data = {payload, action};
    data['srcElement'] = {};// R.pick(['cid','viewName'], data);
    data.srcElement['cid'] = this.props.id;
    data.srcElement['isLocalEvent'] = false;
    data.srcElement['viewName'] = this.props.name;
    let obs$ = Observable.of(data);
    return new ChannelsPayload(channelName, obs$, data);
  }

  tracer() {

  }

  isLocalEvent(channelStreamItem) {
    const itemEl = R.path(['srcElement', 'el'], channelStreamItem);
    return itemEl !== undefined &&
        this.props.el.contains(channelStreamItem.srcElement.el);
  }

  //  =======================================================================================
  addMixins() {
    //  ==================================
    // BASE CORE MIXINS
    //  ==================================
    let coreMixins = baseCoreMixins();
    this.createId = coreMixins.createId;
    this.createpropsMap = coreMixins.createpropsMap;
    this.convertDomStringMapToObj = convertDomStringMapToObj;
    this.ifNilThenUpdate = ifNilThenUpdate;
    // this.gc = gc.bind(this);
    //  ==================================
    // BASE STREAM MIXINS
    //  ==================================
    let streamMixins = baseStreamsMixins();
    this.sendUIPayload = streamMixins.sendUIPayload;
    this.sendRoutePayload = streamMixins.sendRoutePayload;
    this.createLifeStreamPayload = streamMixins.createLifeStreamPayload;
  }
}
