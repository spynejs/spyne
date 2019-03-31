import { baseCoreMixins } from '../utils/mixins/base-core-mixins';
import { baseStreamsMixins } from '../utils/mixins/base-streams-mixins';
import { deepMerge } from '../utils/deep-merge';
import {
  ifNilThenUpdate,
  convertDomStringMapToObj,
  findStrOrRegexMatchStr,
  getConstructorName
} from '../utils/frp-tools';
// import {gc} from '../utils/gc';
import { ViewStreamObservable } from './view-stream-observable';
import { ViewStreamEnhancerLoader } from './view-stream-enhancer-loader';
import { registeredStreamNames } from '../channels/channels-config';
import { ViewStreamBroadcaster } from './view-stream-broadcaster';
import { ViewStreamPayload } from './view-stream-payload';
import { ChannelPayloadFilter } from '../utils/channel-payload-filter';
import { LifecyleObservables } from '../utils/viewstream-lifecycle-observables';
import {ViewStreamSelector} from './view-stream-selector';
import { Subject, of } from 'rxjs';
import { mergeMap, map, takeWhile, filter, tap, finalize } from 'rxjs/operators';
import {pick, compose, toLower, either ,prop, always, lte, defaultTo, propSatisfies, allPass, curry, is, path, ifElse, clone,  mergeRight, where, equals} from 'ramda';

export class ViewStream {
  /**
   * @module ViewStream
   * @borrows DomItemSelectors as el$
   *
   * @desc
   * <p>ViewStreams are the core of this framework.</br>Taking analogy of Spyne, they are basically the nervous system of the application.</p>
   * <h3>ViewStreams have three main tasks:</h3>
   * <ol>
   * <li>Render or reference an HTML element
   * <li>Broadcast UI events
   * <li>Provide tools to maintain state
   * </ol>
   *
   * <h4>Rendering</h4>
   * <p>ViewStream will progressively enhance the rendering of its element based on the values defined within the <i>props</i> property.</p>
   * <ul>
   *     <li>A ViewStream instance will reference an element instead of rendering when the <i>el</i> property is defined at instantiation.</li>
   *     <li>An empty div is returned when no values are assigned to its <i>props</i> property.</li>
   *     <li>A single element is rendered when only the tagName and data (as String) are defined.</li>
   *     <li>The instance will render a template when that property is defined and will populate the template if the data property is defined as an object.</li>
   *     <li>ViewStreams will apply any HTML attributes defined within  <i>props</i> to the rendered element, for example, <i>src</i> for img and video tags.</li>
   *
   *     </ul>
   *
   * The <i>props</i> property is also used to hold all of the internal values within the ViewStream instance.
   *
   * <h5>Appending to Document</h5>
   * <p>ViewStreams renders an HTML DocumentFragment and only attaches that element to the DOM when appended to another ViewStream instance or to an existing HTML element.</p>
   * <p>Below are the methods that appends the View to the DOM:</p>
   *
   *
   *    <div class='method-section'>
   *        <h5>Appending To Other ViewStreams</h5>
   *
   *        <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-append-view"  href="/guide/reference/view-stream-append-view" >appendView</a>
   *        <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-prepend-view"  href="/guide/reference/view-stream-prepend-view" >prependView</a>
   *        <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-append-view-to-parent"  href="/guide/reference/view-stream-append-view-to-parent" >appendViewToParent</a>
   *        <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-prepend-view-to-parent"  href="/guide/reference/view-stream-prepend-view-to-parent" >prependViewToParent</a>
   *        </div>
   *
   *
   *    <div class='method-section'>
   *        <h5>Appending Directly to the DOM</h5>
   *
   *        <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-append-to-dom"  href="/guide/reference/view-stream-append-to-dom" >appendToDom</a>
   *        <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-prepend-to-dom"  href="/guide/reference/view-stream-prepend-to-dom" >prependToDom</a>
   *
   *        </div>
   *
   *    <div class='method-section'>
   *        <h5>Appended but hidden</h5>
   *
   *        <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-append-to-null"  href="/guide/reference/view-stream-append-to-null" >appendToNull</a>
   *
   *        </div>
   *
   * <h4>Broadcasting Events</h4>
   * <p>ViewStreams instances has two methods of broadcasting events:</p>
   *    <div class='method-section'>
   * <h5><a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-broadcast-events"  href="/guide/reference/view-stream-broadcast-events" >1. broadcastEvents Method</a></h5>
   *   <p>  Elements listed here will automatically be published to the UI Channel, and the dataset values for that element will be returned along with the relevant action.</br>The event will be published to the ROUTE Channel when the element's dataset value for channel is set to "ROUTE"</p>
   *  </div>
   *    <div class='method-section'>
   * <h5><a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-send-info-to-channel"  href="/guide/reference/view-stream-send-info-channel" >2. sendInfoToChannel Method</a></h5>
   *   <p>Any type of data can be sent to any channel using the sendInfoToChannel method. This can be especially useful to allow global communication of data from third-party libraries and resources.</p>
   * </div>
   *
   *
   * <h4>State Management</h4>
   * <p>There are several properties, methods and structures that allow ViewStream instances to maintain state, with code that is DRY and easy to reason about.
   *  The key innovation is the swapping of ViewStream internal observables to create a smart chain of views that reactively render and dispose entire branches with little or no code.</br>
   *  The following items assist in maintaining state:
   * </p>
   * <ul>
   *     <li>all properties contained in one element, <i>props</i></li>
   *     <li>The <i>props.el$</i> object, an instance of <a class='linker no-break' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-selector"  href="/guide/reference/view-stream-selector" >ViewStreamSelector</a>, that has special selector and class manipulation methods</li>
   *     <li>The swapping of observables when appending ViewStream instances to one another</li>
   *     <li>The consolidation of channel actions into the <a class='linker no-break' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-add-action-listeners"  href="/guide/reference/view-stream-add=action-listeners" >addActionListeners</a> method, that directs events to custom methods</li>
   *     <li><a class='linker no-break' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="spyne-trait"  href="/guide/reference/spyne-trait" >SpyneTraits</a> that allow for the enhancing and exchanging of methods</li>
   *     <li><a class='linker no-break' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="channel-action-filter"  href="/guide/reference/channel-action-filter" >ChannelActionFilters</a> that allow for the prefiltering of actions</li>
   *     <li>The ability to limit UI event publishing to locally elements using the third 'local' parameter in broadcastEvents</li>
   *     <li>Automatic subscribing and unsubscribing of all observables using the <a class='linker no-break' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-add-channel"  href="/guide/reference/view-stream-add-channel" >addChannel</a> method</li>
   *     <li><a class='linker no-break' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="view-stream-after-render"  href="/guide/reference/view-stream-after-render" >afterRender</a> method allows for adding functionality</li>
   *     <li>communicate render and dispose events for an ViewStream method throught the <a class='linker no-break' data-channel="ROUTE"  data-event-prevent-default="true" data-is-manual-scroll='true' data-section='overview' data-menu-item="intro-channel-life-cycle"  href="/guide/overview/intro-channel-life-cycle" >LIFECYCLE_CHANNEL</a> method</li>
   *     <li>Automatic removing of all elements and properties from the DOM and from memory</li>
   *     </ul>
   *
   *
   * @constructor
   * @param {object} props This json object takes in parameters to generate or reference the dom element
   * @property {string} props.tagName - = 'div'; This can be any dom tag
   * @property {domItem} props.el - = undefined; if defined, ViewStream will connect to that element. If undefined, the instance will create its element based on the defined properties, and assign that element to this property.
   * @property {string|object} props.data - = undefined;  string for innerText or Json object for html template
   * @property {boolean} props.sendLifecyleEvents = false; When set to true, the view will automatically send its rendering and disposing events to the CHANNEL_LIFECYCLE.
   * @property {string} props.id - = undefined; generates a random id if left undefined
   * @property {template} props.template - = undefined; html template
   * @special {"name": "DomItem", "desc": "ViewStreams uses the DomItem class to render html tags and templates.", "link":"dom-item"}
   * @special {"name": "ViewStreamSelector", "desc": "The <b>props.el$</b> property creates an instance of this class, used to query elements within the props.el element; also has methods to update css classes.", "link":"dom-item-selectors"}
   *
   *
   *
   *
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
        sendLifecyleEvents: false,
        hashId: `#${id}`,
        viewClass: ViewStreamObservable,
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
    // this.props = Object.assign({}, this.defaults(), props);
    this.props = deepMerge(this.defaults(), props);
    this.sendLifecycleMethod = this.props.sendLifecyleEvents === true ? this.sendLifecycleMethodActive.bind(this) : this.sendLifecycleMethodInactive.bind(this);
    let attributesArr = this.attributesArray;
    // let attributesArr = ['id', 'class', 'dataset'];
    this.props['domAttributes'] = pick(attributesArr, this.props);
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

  updatePropsToMatchEl() {
    const getTagName = compose(toLower, either(prop('tagName'), always('')));
    this.props.tagName = getTagName(this.props.el);
  }

  checkIfElementAlreadyExists() {
    const elIsDomElement = compose(lte(0), defaultTo(-1), prop('nodeType'));
    const elIsRendered = el => document.contains(el);
    const elIsReadyBool = propSatisfies(
      allPass([elIsRendered, elIsDomElement]), 'el');

    if (elIsReadyBool(this.props)) {
      this.updatePropsToMatchEl();
      this.postRender();
    }
  }

  loadEnhancers(arr = []) {
    let enhancerLoader = new ViewStreamEnhancerLoader(this, arr);
    this.props['enhancersMap'] = enhancerLoader.getEnhancersMap();
    enhancerLoader = undefined;
  }

  loadAllMethods() {
    const channelFn = curry(this.onChannelMethodCall.bind(this));
    let createExtraStatesMethod = (arr) => {
      let [action, funcStr, actionFilter] = arr;
      if (is(String, actionFilter)) {
        actionFilter = ChannelPayloadFilter(actionFilter);
      }
      this.props.extendedSourcesHashMethods[action] = channelFn(funcStr,
        actionFilter);
    };
    this.addActionListeners().forEach(createExtraStatesMethod);
    this.props.hashSourceMethods = this.setSourceHashMethods(
      this.props.extendedSourcesHashMethods);
  }

  /**
   * This method will direct data from channels to methods,
   * The method takes a nested array.
   * The firset element is the name of the action.
   * The second value is the name of the method that will be called when the action is published.
   * A third option value is a selector string (if the action is based on an event from an HTMLElement, or this could be an instance of the <a class='linker' data-channel="ROUTE"  data-event-prevent-default="true" data-menu-item="channel-action-filter"  href="/guide/reference/channel-action-filter" >ChannelPayloadFilter</a>.
   *
   * @example
   *   addActionListeners() {
   *     return [
   *     ['CHANNEL_UI_CLICK_EVENT', 'onClickEvent', 'li.myclass'],
   *     ['CHANNEL_MY_CUSTOM_EVENT', 'onActionReturned']
   *            ]
   *           }
   *
   * @returns Nested Array
   */
  addActionListeners() {
    return [];
  }

  onChannelMethodCall(str, actionFilter, p) {
    if (p.$dir !== undefined && p.$dir.includes('child') &&
        this.deleted !== true) {
      let obj = deepMerge({}, p);// Object.assign({}, p);
      obj['$dir'] = this.$dirs.C;
      this.sourceStreams.raw$.next(obj);
    }
    let filterPayload =  defaultTo(always(true), actionFilter);
    if (filterPayload(p.props()) === true) {
      this[str](p);
    }
  }

  setSourceHashMethods(extendedSourcesHashMethods = {}) {
    let hashSourceKeys = {
      'DISPOSING': (p) => this.checkParentDispose(p),
      'DISPOSE': (p) => this.disposeViewStream(p),
      // 'CHILD_DISPOSE'                    : (p) => this.disposeViewStream(p),
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
        this.disposeViewStream(data);
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

  onChildDisposed(p) {

  }

  onChildCompleted(p) {
    let findName = (x) => {
      let finalDest = (y) => {
        while (y.destination !== undefined) {
          y = finalDest(y.destination);
        }
        return y;
      };
      return pick(['viewName', 'cid'], finalDest(x));
    };
    let childCompletedData = findName(p);
    this.tracer('onChildCompleted ', this.checker, p);
    // console.log('obj is ',childCompletedName,obj,this.props);
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
      this.props.el$ = undefined;
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
        let payload = deepMerge({}, p);
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
    let defaultToFn = defaultTo((p) => this.sendExtendedStreams(p));

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

    this.tracer('onSubscribeToSourcesNext', { payload });
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
    let attachData = { node, type, attachType };
    this.openSpigot('RENDER_AND_ATTACH_TO_DOM', { attachData });
  }

/*
  attachChildToView(data) {
    // let childRenderData = data.attachData;
    // console.log('CHILD DATA ', this.constructor.name, childRenderData);
    // this.openSpigot('ATTACH_CHILD_TO_SELF', {childRenderData});
  }
*/

  // ===================================== DISPOSE METHODS =================================
  checkParentDispose(p) {
    if (p.from$ === 'parent') {
      this.disposeViewStream(p);
    }
  }

  onBeforeDispose() {

  }

  disposeViewStream(p) {
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

  openSpigot(action, obj = {}) {
    if (this.props !== undefined) {
      this.props.action = action;
      let data = mergeRight(this.props, obj);
      this.sink$.next(Object.freeze(data));
    }
  }

  setAttachData(attachType, query) {
    return {
      node: this.props.el,
      type: 'ViewStreamObservable',
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
      type: 'ViewStreamObservable',
      attachType,
      query: this.props.el.parentElement.querySelector(query)
    };
  }

  onMapViewSource(payload = {}) {
    this.props = mergeRight(this.props, payload);
    return payload;
  }

  // ====================== ATTACH STREAM AND DOM DATA AGGREGATORS==========================
  exchangeViewsWithChild(childView, attachData) {
    this.addChildStream(childView.sourceStreams.toParent$);
    childView.addParentStream(this.sourceStreams.toChild$, attachData);
  }

  /**
   * Appends a ViewStream object to an existing dom element.
   * @param {HTMLElement} node the ViewStream child that is to be attached.
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
   * @param {HTMLElement} node the ViewStream child that is to be attached.
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
   * @param {ViewStream} v the ViewStream child that is to be attached.
   * @param {string} query a querySelector within this ViewStream.
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
   * @param {ViewStream} v the ViewStream parent.
   * @param {string} query a querySelector within this ViewStream.
   * @param {level} this parameters can attach the viewStream's dom element up the dom tree while still maintaining the parent-child relationship of the ViewStream objects.
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
   * @param {ViewStream} v
   * @param {string} query
   * @param {number} level
   *
   * @property {ViewStream} v - = undefined; the ViewStream parent.
   * @property {string} query - = undefined; a querySelector within this ViewStream.
   * @property {number} level - = 1; this parameter can attach the viewStream's dom element up the dom tree while still maintaining the parent-child relationship of the ViewStream objects.
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
   * @param {ViewStream} v the ViewStream child that is to be attached.
   * @param {string} query a querySelector within this ViewStream.
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
/*    let dm2 = function(el) {
      return function(str = '') {
        return new DomItemSelectors(el, str);
      };
    };*/

    //this.props.el$ = dm2(this.props.el);
    this.props.el$ = ViewStreamSelector(this.props.el);
    // console.log('EL IS ', this.props.el$.elArr);
    // window.theEl$ = this.props.el$;
  }

  // ================================= METHODS TO BE EXTENDED ==============================


  // THIS IS AN EVENT HOLDER METHOD BECAUSE SENDING DOWNSTREAM REQUIRE THE PARENT TO HAVE A METHOD
  downStream() {

  }

  /**
   *
   * This method is called as soon as the element has been rendered.
   *
   */

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

    let fn = ifElse(isValidChannel, startSubscribe, error);

    return fn(channel);
  }

  /**
   *
   * Preferred method to connect to instances of registered channels, such as 'DOM', 'UI', and 'ROUTE' channels.
   *
   * Add Channel will automatically unsubscribe to the channel, whereas the getChannel method requires the developer to manually unsubscribe.
   *
   * @param {string} str The name of the registered Channel that was added to the Channels Controller.
   * @param {boolean} bool false, add true if the View should wait for this channel to unsubscribe before removing itself.
   * @param {sendDownStream} bool The direction where the stream is allowed to travel.
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
      let p2 = defaultTo({}, clone(p));
      let dirObj = { $dir: directionArr };
      return deepMerge(dirObj, p2);
      // Object.assign({$dir: directionArr}, clone(p))
    };
    const isLocalEventCheck = path(['srcElement', 'isLocalEvent']);
    const cidCheck = path(['srcElement', 'cid']);
    const cidMatches = p => {
      let cid = cidCheck(p);
      let isLocalEvent = isLocalEventCheck(p);
      const filterEvent = isLocalEvent !== true || cid === this.props.cid;
      // console.log("checks ",cid,this.props.cid, isLocalEvent,filterEvent);
      return filterEvent;
    };

    let channel$ = this.getChannel(str).pipe(map(mapDirection), filter(cidMatches));
    this.updateSourceSubscription(channel$, false);
  }


  checkIfChannelExists(channelName) {
    let channelExists = window.Spyne.channels.map.get(channelName) !== undefined;
    if (channelExists !== true) {
      console.warn(`SPYNE WARNING: The ChannelPayload from ${this.props.name}, has been sent to a channel, ${channelName}, that has not been registered!`);
    }
    return channelExists;
  }


  /**
   *
   * @param {String} channelName
   * @param {Object} payload
   * @param {String} action
   * @property {string} channelName - = undefined; The name of the registered Channel.
   * @property {object} payload - = {}; The main data to send to the channel.
   * @property {string} action - = "VIEWSTREAM_EVENT"; The action sent to the channel.
   * @desc
   * This method creates a versatile and consistent method to communicate with all channels.
   *
   *
   */

  sendInfoToChannel(channelName, payload = {}, action = 'VIEWSTREAM_EVENT') {
    let data = { payload, action };
    data['srcElement'] = {};// pick(['cid','viewName'], data);
    data.srcElement['cid'] = path(['props', 'cid'], this);
    data.srcElement['id'] = path(['props', 'id'], this);
    data.srcElement['isLocalEvent'] = false;
    data.srcElement['viewName'] = this.props.name;
    if (this.checkIfChannelExists(channelName) === true) {
      let obs$ = of(data);
      return new ViewStreamPayload(channelName, obs$, data);
    }
  }

  tracer(...args) {
    this.sendLifecycleMethod(...args);
  }
  sendLifecycleMethodInactive() {

  }

  sendLifecycleMethodActive(val, p) {
    let isRendered = where({
      from$: equals('internal'),
      action: equals('RENDERED_AND_ATTACHED_TO_PARENT')
    }, p);
    let isDisposed = p === 'GARBAGE_COLLECT';
    if (isRendered === true) {
      this.sendInfoToChannel('CHANNEL_LIFECYCLE', { action:'CHANNEL_LIFECYCLE_RENDERED_EVENT' }, 'CHANNEL_LIFECYCLE_RENDERED_EVENT');
    } else if (isDisposed === true) {
      this.sendInfoToChannel('CHANNEL_LIFECYCLE', { action:'CHANNEL_LIFECYCLE_REMOVED_EVENT' }, 'CHANNEL_LIFECYCLE_REMOVED_EVENT');
    }
  }

  createActionFilter(selectors, data) {
    return new ChannelPayloadFilter(selectors, data);
  }

  isLocalEvent(channelPayloadItem) {
    const itemEl = path(['srcElement', 'el'], channelPayloadItem);
    return itemEl !== undefined &&
        this.props.el.contains(channelPayloadItem.srcElement.el);
  }

  get attributesArray() {
    return [
      'accept',
      'accept-charset',
      'accesskey',
      'action',
      'align',
      'allow',
      'alt',
      'async',
      'autocapitalize',
      'autocomplete',
      'autofocus',
      'autoplay',
      'bgcolor',
      'border',
      'buffered',
      'challenge',
      'charset',
      'checked',
      'cite',
      'class',
      'code',
      'codebase',
      'color',
      'cols',
      'colspan',
      'content',
      'contenteditable',
      'contextmenu',
      'controls',
      'coords',
      'crossorigin',
      'csp',
      'dataset',
      'datetime',
      'decoding',
      'default',
      'defer',
      'dir',
      'dirname',
      'disabled',
      'download',
      'draggable',
      'dropzone',
      'enctype',
      'for',
      'form',
      'formaction',
      'headers',
      'height',
      'hidden',
      'high',
      'href',
      'hreflang',
      'http-equiv',
      'icon',
      'id',
      'importance',
      'integrity',
      'ismap',
      'itemprop',
      'keytype',
      'kind',
      'label',
      'lang',
      'language',
      'lazyload',
      'list',
      'loop',
      'low',
      'manifest',
      'max',
      'maxlength',
      'minlength',
      'media',
      'method',
      'min',
      'multiple',
      'muted',
      'name',
      'novalidate',
      'open',
      'optimum',
      'pattern',
      'ping',
      'placeholder',
      'poster',
      'preload',
      'radiogroup',
      'readonly',
      'referrerpolicy',
      'rel',
      'required',
      'reversed',
      'rows',
      'rowspan',
      'sandbox',
      'scope',
      'scoped',
      'selected',
      'shape',
      'size',
      'sizes',
      'slot',
      'span',
      'spellcheck',
      'src',
      'srcdoc',
      'srclang',
      'srcset',
      'start',
      'step',
      'style',
      'summary',
      'tabindex',
      'target',
      'title',
      'translate',
      'type',
      'usemap',
      'value',
      'width',
      'wrap'
    ];
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