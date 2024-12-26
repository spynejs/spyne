import { baseCoreMixins } from '../utils/mixins/base-core-mixins'
import { SpyneAppProperties } from '../utils/spyne-app-properties'
import { deepMerge } from '../utils/deep-merge'
import { safeClone } from '../utils/safe-clone'
import {
  findStrOrRegexMatchStr,
  getConstructorName
} from '../utils/frp-tools'
import { ViewStreamElement } from './view-stream-element'
import { registeredStreamNames } from '../channels/channels-config'
import { ViewStreamBroadcaster } from './view-stream-broadcaster'
import { ViewStreamPayload } from './view-stream-payload'
import { ChannelPayloadFilter } from '../utils/channel-payload-filter'
import { ViewStreamObservable } from '../utils/viewstream-observables'
import { ViewStreamSelector } from './view-stream-selector'
import { Subject, of } from 'rxjs'
import { mergeMap, map, takeWhile, filter, tap, skip, finalize } from 'rxjs/operators'
import {
  pick,
  compose,
  isNil,
  all,
  forEach,
  toLower,
  either,
  findIndex,
  apply,
  test,
  flatten,
  prop,
  always,
  lte,
  defaultTo,
  propSatisfies,
  allPass,
  curry,
  is,
  slice,
  path,
  omit,
  ifElse,
  mergeRight,
  where,
  equals
  , map as rMap
} from 'ramda'

export class ViewStream {
  /**
   * @module ViewStream
   *
   * @desc
   *
   * <p>ViewStream is the interactive-view component, and its core functionality is comprised of two internal components: </p>
   <ul class='basic'>
   *
   */
  constructor(props = {}) {
    this.vsnum = Math.random()
    this.addMixins()
    this._postRenderCalled = false
    this.defaults = () => {
      const vsid = this.createId()
      const id = props.id ? props.id : vsid
      return {
        vsid,
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
        id$: `#${id}`,
        viewClass: ViewStreamElement,
        extendedSourcesHashMethods: {},
        debug: false,
        template: undefined,
        node: document.createDocumentFragment(),
        name: getConstructorName(this)
      }
    }
    this._state = {}
    this.$dirs = ViewStreamObservable.createDirectionalFiltersObject()
    this.addDefaultDirection = ViewStreamObservable.addDefaultDir
    this.addDownInternalDir = ViewStreamObservable.addDownInternalDir
    // this.props = Object.assigREADY_FOR_VS_DETRITUS_COLLECTn({}, this.defaults(), props);
    this.props = deepMerge(this.defaults(), props)
    this.sendLifecycleMethod = this.props.sendLifecyleEvents === true ? this.sendLifecycleMethodActive.bind(this) : this.sendLifecycleMethodInactive.bind(this)
    const attributesArr = this.attributesArray
    // let attributesArr = ['id', 'class', 'dataset'];
    this.props.domAttributes = pick(attributesArr, this.props)
    if (this.props.traits !== undefined) {
      this.addTraits(this.props.traits)
    }
    this.loadAllMethods()
    this.props.action = 'LOADED'
    this.sink$ = new Subject()
    const ViewClass = this.props.viewClass
    this.view = new ViewClass(this.sink$, {}, this.props.vsid,
      this.props.id)// new this.props.viewClass(this.sink$);
    this.sourceStreams = this.view.sourceStreams
    this._rawSource$ = this.view.getSourceStream()
    this._rawSource$.viewName = this.props.name
    this.sendEventsDownStream = this.sendEventsDownStreamFn
    this.initViewStream()
    this.isDevMode = ViewStream.isDevMode()
    this.props.addedChannels = []
    this.checkIfElementAlreadyExists()
  }

  // ============================= HASH KEY AND SPIGOT METHODS==============================
  get source$() {
    return this._source$
  }

  get attributesArray() {
    return [
      // Global Attributes
      'accesskey', 'class', 'contenteditable', 'dir', 'draggable', 'hidden', 'id', 'lang', 'spellcheck', 'style', 'tabindex', 'title', 'translate',

      // Accessiblity Attributes
      'aria-autocomplete', 'aria-checked', 'aria-disabled', 'aria-expanded', 'aria-haspopup', 'aria-hidden', 'aria-invalid', 'aria-label', 'aria-level', 'aria-multiline', 'aria-multiselectable', 'aria-orientation', 'aria-pressed', 'aria-readonly', 'aria-required', 'aria-selected', 'aria-sort', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext', 'aria-atomic', 'aria-busy', 'aria-live', 'aria-relevant', 'aria-dropeffect', 'aria-grabbed', 'aria-activedescendant', 'aria-controls', 'aria-describedby', 'aria-flowto', 'aria-labelledby', 'aria-owns', 'aria-posinset', 'aria-setsize',

      // Specific Attributes for input
      'accept', 'autocomplete', 'autofocus', 'checked', 'dirname', 'disabled', 'form', 'formaction',
      'formenctype', 'formmethod', 'formnovalidate', 'formtarget', 'list', 'max', 'maxlength',
      'min', 'minlength', 'multiple', 'name', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'step', 'value',

      // Specific Attributes for img
      'alt', 'srcset', 'sizes', 'usemap', 'ismap',

      // Specific Attributes for a and link
      'href', 'target', 'download', 'ping', 'rel', 'hreflang', 'as', 'media',

      // Specific Attributes for form
      'accept-charset', 'action', 'enctype', 'novalidate',

      // Specific Attributes for meta
      'content', 'charset', 'http-equiv',

      // Specific Attributes for script
      'async', 'defer', 'integrity', 'nomodule', 'nonce', 'referrerpolicy',

      // Other Element-specific Attributes
      'autocapitalize', 'autoplay', 'buffered', 'challenge', 'cite', 'code', 'codebase', 'color', 'cols', 'colspan', 'contextmenu', 'controls', 'coords', 'crossorigin', 'csp', 'dataset', 'datetime', 'decoding', 'default', 'for', 'headers', 'high', 'icon', 'importance', 'itemprop', 'keytype', 'kind', 'label', 'language', 'lazyload', 'loop', 'low', 'manifest', 'method', 'muted', 'open', 'optimum', 'poster', 'preload', 'radiogroup', 'reversed', 'role', 'rows', 'rowspan', 'sandbox', 'scope', 'scoped', 'selected', 'shape', 'slot', 'span', 'srcdoc', 'src', 'type', 'srclang', 'start', 'summary', 'wrap', 'width', 'height'
    ]
  }

  static isDevMode() {
    return SpyneAppProperties.debug
  }

  static checkIfActionsAreRegistered(channelsArr = [], actionsArr) {
    if (actionsArr.length > 0) {
      const getAllActions = (a) => {
        const getRegisteredActionsArr = (str) => SpyneAppProperties.getChannelActions(str)
        const arr =  a.map(getRegisteredActionsArr)
        return flatten(arr)
      }
      const checkForMatch = (strMatch) => {
        const re = new RegExp(strMatch)
        const actionIndex = findIndex(test(re), getAllActionsArr)
        if (actionIndex < 0) {
          const channelSyntax = channelsArr.length === 1 ? 'from added channel' : 'from added channels'
          console.warn(`Spyne Warning: The action, ${strMatch}, in ${this.props.name}, does not match any of the registered actions ${channelSyntax}, ${channelsArr.join(', ')}`)
        }
        //  const vsnum = ()=> R.test(new RegExp(str), "CHANNEL_ROUTE_TEST_EVENT")
      }
      const getAllActionsArr = getAllActions(channelsArr)
      actionsArr.forEach(checkForMatch)
    }
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

  static isValidNestedArr(eventsArr) {
    const isTrue = equals(true)
    const allIsTrue = all(isTrue)
    const isString = is(String)
    const isValidArr = compose(allIsTrue, rMap(isString), slice(0, 2), defaultTo([]))
    const mapEventsArrFn = compose(allIsTrue, rMap(isValidArr), defaultTo([]))
    return mapEventsArrFn(eventsArr)
  }

  static elIsDomElement(o) {
    if (is(String, o)) {
      o = document.querySelector(o)
    }

    return compose(lte(0), defaultTo(-1), prop('nodeType'))(o)
  }

  updatePropsToMatchEl() {
    const getTagName = compose(toLower, either(prop('tagName'), always('')))
    this.props.tagName = getTagName(this.props.el)
  }

  //  =====================================================================

  checkIfElementAlreadyExists() {
    const elIsDomElement = compose(lte(0), defaultTo(-1), prop('nodeType'))
    const elIsRendered = el => document.body.contains(el)
    const elIsReadyBool = propSatisfies(
      allPass([elIsRendered, elIsDomElement]), 'el')
    if (elIsReadyBool(this.props)) {
      this.updatePropsToMatchEl()
      this.postRender()
    } else if (this.props.el === null) {
      console.error(`Spyne Error: The defined element for this ViewStream instance, ${this.constructor.name}, appears to not exist.`)
    }
  }

  loadAllMethods() {
    const channelFn = curry(this.onChannelMethodCall.bind(this))
    const createExtraStatesMethod = (arr) => {
      let [action, funcStr, actionFilter] = arr
      if (is(String, actionFilter)) {
        actionFilter = new ChannelPayloadFilter({ selector:actionFilter })
      }
      this.props.extendedSourcesHashMethods[action] = channelFn(funcStr,
        actionFilter)
    }
    this.addActionListeners().forEach(createExtraStatesMethod)
    this.props.hashSourceMethods = this.setSourceHashMethods(
      this.props.extendedSourcesHashMethods)
  }

  /**
   * Binds channel actions to local methods, formatted as array values.
   * <ul>
   * <li><b>First value:</b> Action name, as a string or as a basic Regular Expression.
   * <li><b>Second value:</b> The method to be called when the action is published.
   * <li><b>Third optional value:</b> This is a filter option that can be a selector string. or an instance of the LINK['channelPayloadFilter', 'channel-payload-filter'].
   * </ul>
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
    return []
  }

  onChannelMethodCall(str, actionFilter, p) {
    const runFunc = (payload) => {
      if (this[str] === undefined) {
        console.warn(`Spyne Warning: The method, ${str} does not appear to exist in ${this.constructor.name}!`)
      } else {
        this[str](payload)
      }
    }

    if (p.$dir !== undefined && p.$dir.includes('child') &&
        this.deleted !== true) {
      const obj = deepMerge({}, p)// Object.assign({}, p);
      obj.$dir = this.$dirs.C
      this.sourceStreams.raw$.next(obj)
    }
    const filterPayload = defaultTo(always(true), actionFilter)

    if (filterPayload(p) === true) {
      p = omit(['$dir'], p)
      runFunc(p)
    }
  }

  setSourceHashMethods(extendedSourcesHashMethods = {}) {
    const hashSourceKeys = {
      EXTIRPATING: (p) => this.checkParentDispose(p),
      EXTIRPATE: (p) => this.disposeViewStream(p),
      // 'CHILD_EXTIRPATE'                    : (p) => this.disposeViewStream(p),
      VS_SPAWNED: (p) => this.onVSRendered(p),
      VS_SPAWNED_AND_ATTACHED_TO_DOM: (p) => this.onVSRendered(p),
      VS_SPAWNED_AND_ATTACHED_TO_PARENT: (p) => this.onVSRendered(p),
      // 'CHILD_VS_SPAWNED'                   : (p) => this.attachChildToView(p),
      READY_FOR_VS_DETRITUS_COLLECT: (p) => this.onReadyToGC(p),
      VS_NULLITY: () => ({})
    }
    return deepMerge.all([{}, hashSourceKeys, extendedSourcesHashMethods])
  }

  // ====================== MAIN STREAM METHODS ==========================
  initViewStream() {
    this._source$ = this._rawSource$.pipe(map(
      (payload) => this.onMapViewSource(payload)), takeWhile(this.notGCSTATE))

    this.initAutoMergeSourceStreams()
    this.updateSourceSubscription(this._source$, true)
  }

  notGCSTATE(p) {
    return !p.action.includes('READY_FOR_VS_DETRITUS_COLLECT')
  }

  eqGCSTATE(p) {
    return !p.action.includes('READY_FOR_VS_DETRITUS_COLLECT')
  }

  notCOMPLETED(p) {
    return !p.action.includes('COMPLETED')
  }

  notGCCOMPLETE(p) {
    return !p.action.includes('GC_COMPLETE')
  }

  testVal(p) {
    console.log('TESTING VALL IS ', p)
  }

  addParentStream(obs, attachData) {
    const filterOutNullData = (data) => data !== undefined && data.action !==
        undefined
    const checkIfDisposeOrFadeout = (d) => {
      const data = deepMerge({}, d)

      if (data.action === 'EXTIRPATE_AND_READY_FOR_VS_DETRITUS_COLLECT') {
        this.disposeViewStream(data)
        data.action = 'READY_FOR_VS_DETRITUS_COLLECT'
      }
      return data
    }

    this.parent$ = obs.pipe(
      filter(filterOutNullData),
      map(checkIfDisposeOrFadeout))
    this.updateSourceSubscription(this.parent$, false, 'PARENT')
    this.renderAndAttachToParent(attachData)
  }

  addChildStream(obs$) {
    const filterOutNullData = (data) => data !== undefined && data.action !==
        undefined
    const child$ = obs$.pipe(
      filter(filterOutNullData),
      tap(p => this.tracer('addChildStraem do ', p)),
      map((p) => {
        return p
      }),
      finalize(p => this.onChildCompleted(child$.source)))
    this.updateSourceSubscription(child$, true, 'CHILD')
  }

  onChildDisposed(p) {

  }

  //  =======================================================================================

  onChildCompleted(p) {
    const findName = (x) => {
      const finalDest = (y) => {
        while (y.destination !== undefined) {
          y = finalDest(y.destination)
        }
        return y
      }
      return pick(['id', 'vsid'], finalDest(x))
    }
    const childCompletedData = findName(p)
    this.tracer('onChildCompleted ', this.vsnum, p)
    // console.log('obj is ',childCompletedName,obj,this.props);
    this.onChildDisposed(childCompletedData, p)
    return childCompletedData
  }

  initAutoMergeSourceStreams() {
    // ====================== SUBSCRIPTION SOURCE =========================
    const subscriber = {
      next: this.onSubscribeToSourcesNext.bind(this),
      error: this.onSubscribeToSourcesError.bind(this),
      complete: this.onSubscribeToSourcesComplete.bind(this)
    }
    // let takeBeforeGCOld = (val) => val.action !== 'VS_DETRITUS_COLLECTED';
    // let takeBeforeGC = (p) => !p.action.includes('READY_FOR_VS_DETRITUS_COLLECT');
    // let mapToState = (val) => ({action:val});
    //  =====================================================================
    // ========== METHODS TO CHECK FOR WHEN TO COMPLETE THE STREAM =========
    const completeAll = () => {
      this.props.el$ = undefined
      this.uberSource$.complete()
      this.autoSubscriber$.complete()
      this.sink$.complete()
      this.props = undefined
      this.deleted = true
      this.tracer('completeAll', this.deleted, this.props)
    }
    const decrementOnObservableClosed = () => {
      obsCount -= 1
      if (obsCount === 0) {
        completeAll()
      }
    }
    //  =====================================================================
    // ======================== INIT STREAM METHODS ========================
    let obsCount = 0
    this.uberSource$ = new Subject()
    // ======================= COMPOSED RXJS OBSERVABLE ======================
    const incrementObservablesThatCloses = () => { obsCount += 1 }
    this.autoMergeSubject$ = this.uberSource$.pipe(mergeMap((obsData) => {
      const branchObservable$ = obsData.observable.pipe(filter(
        (p) => p !== undefined && p.action !== undefined), map(p => {
        // console.log('PAYLOAD IS ', p, this.constructor.name)
        const payload = deepMerge({}, p)
        payload.action = p.action// addRelationToState(obsData.rel, p.action);
        this.tracer('autoMergeSubject$', payload)
        return payload
      }))

      if (obsData.autoClosesBool === false) {
        return branchObservable$
      } else {
        incrementObservablesThatCloses()
        return branchObservable$.pipe(finalize(decrementOnObservableClosed))
      }
    }))
    // ============================= SUBSCRIBER ==============================
    this.autoSubscriber$ = this.autoMergeSubject$
    // .do((p) => console.log('SINK DATA ', this.constructor.name, p))
      .pipe(filter((p) => p !== undefined && p.action !== undefined))
      .subscribe(subscriber)
  }

  // ========================= MERGE STREAMS TO MAIN SUBSCRIBER =================
  updateSourceSubscription(obs$, autoClosesBool = false, rel) {
    // const directionArr = sendDownStream === true ? this.$dirs.DI : this.$dirs.I;
    const obj = {
      observable: obs$,
      autoClosesBool,
      rel
    }
    this.tracer('updateSourceSubscription ', this.vsnum, obj)
    this.uberSource$.next(obj)
  }

  // ============================= SUBSCRIBER METHODS ==============================
  onSubscribeToSourcesNext(payload = {}) {
    const defaultToFn = defaultTo((p) => this.sendExtendedStreams(p))

    // ****USE REGEX AS PREDICATE CHECK FOR PAYLOAD.ACTION IN HASH METHODS OBJ
    // const hashAction = this.props.hashSourceMethods[payload.action];
    const hashActionStr = findStrOrRegexMatchStr(this.props.hashSourceMethods,
      payload.action)
    const hashAction = this.props.hashSourceMethods[hashActionStr]
    // console.log('S PAYLOAD ', this.props.name, typeof (hashAction), payload);

    const fn = defaultToFn(hashAction)

    // console.log('hash methods ', fn, this.props.name, payload.action, hashActionStr, this.props.hashSourceMethods);

    fn(payload)
    // console.log(fn, payload, ' THE PAYLOAD FROM SUBSCRIBE IS ', ' ---- ', ' ---> ', this.props);
    // console.log('EXTIRPATER VS NEXT', this.constructor.name, payload);

    this.tracer('onSubscribeToSourcesNext', { payload })
  }

  onSubscribeToSourcesError(payload = '') {
    console.log('ALL ERROR  ', this.constructor.name, payload)
  }

  /*
    attachChildToView(data) {
      // let childRenderData = data.attachData;
      // console.log('CHILD DATA ', this.constructor.name, childRenderData);
      // this.openSpigot('ATTACH_CHILD_TO_SELF', {childRenderData});
    }
  */

  onSubscribeToSourcesComplete() {
    // console.log('==== EXTIRPATER ALL COMPLETED ====', this.constructor.name);
    this.tracer('onSubscribeToSourcesComplete', 'VS_DETRITUS_COLLECT')

    this.openSpigot('VS_DETRITUS_COLLECT')
  }

  sendExtendedStreams(payload) {
    this.tracer('sendExtendedStreams', payload)
    // console.log('extended methods ', payload.action, payload);
    this.openSpigot(payload.action, payload)
  }

  // ===================================== VS_SPAWN METHODS ==================================
  renderAndAttachToParent(attachData) {
    // let childRenderData = attachData;
    this.openSpigot('VS_SPAWN_AND_ATTACH_TO_PARENT', attachData)
  }

  renderView() {
    this.openSpigot('VS_SPAWN')
  }

  renderViewAndAttachToDom(node, type, attachType) {
    const attachData = { node, type, attachType }
    this.openSpigot('VS_SPAWN_AND_ATTACH_TO_DOM', { attachData })
  }

  // ===================================== EXTIRPATE METHODS =================================
  checkParentDispose(p) {
    if (p.from$ === 'parent') {
      this.disposeViewStream(p)
    }
  }

  onBeforeDispose() {

  }

  // ===================================== SINK$ METHODS =================================

  /**
   *
   * Wraps window.setTimeout with a check to see if "this" ViewStream element and its props property still exists
   * @property {function} fn - = 'function'; The local method that is to be called.
   * @property {number} ms - = 0;  The time, in milleseconds, for the timeout.
   * @property {boolean} bind - = false;  When true, will bind the method to 'this'.
   *
   */

  setTimeout(fn, ms = 0, bind = false) {
    const timeoutMethod = (...args) => {
      if (this !== undefined && this.props !== undefined) {
        const methodFn = bind === true ? fn.bind(this) : fn
        apply(methodFn, args)
      }
    }
    window.setTimeout(timeoutMethod, ms)
  }

  /**
   *
   * Begins the removal process of the ViewStream instance along with all of its chained ViewStream children.
   */
  disposeViewStream(p) {
    // console.log('EXTIRPATER VS onDispose ', this.constructor.name);
    this.onBeforeDispose()
    this.openSpigot('EXTIRPATE')
  }

  onChildDispose(p) {
  }

  onParentDisposing(p) {
    // this.updateSourceSubscription(this._source$);
    this.openSpigot('EXTIRPATE')
  }

  onReadyToGC(p) {
    const isInternal = p.from$ !== undefined && p.from$ === 'internal'
    if (isInternal) {
      // this.openSpigot('VS_DETRITUS_COLLECT');
    }
    this.tracer('onReadyToGC', isInternal, p)
  }

  openSpigot(action, obj = {}) {
    if (this.props !== undefined) {
      this.props.action = action
      const data = mergeRight(this.props, obj)
      // let data = Object.assign({}, this.props, obj);

      this.sink$.next(Object.freeze(data))
    }
  }

  setAttachData(attachType, query) {
    const checkQuery = () => {
      const q = this.props.el.querySelector(query)
      const isDevMode = ViewStream.isDevMode()
      if (isDevMode === true && is(String, query) && isNil(q)) {
        console.warn(`Spyne Warning: The appendView query in ${this.props.name}, '${query}', appears to not exist!`)
      }
      return q
    }

    return {
      node: this.props.el,
      type: 'ViewStreamObservable',
      attachType,
      query: checkQuery(query)
    }
  }

  getParentEls(el, num) {
    const getElem = el => el.parentElement
    let iter = 0
    let parentEl = el
    while (iter < num) {
      parentEl = getElem(parentEl)
      iter++
    }
    return parentEl
  }

  setAttachParentData(attachType, query, level) {
    query = query !== '' ? query : undefined
    const node = this.getParentEls(this.props.el, level)
    return {
      node,
      type: 'ViewStreamObservable',
      attachType,
      query: node.querySelector(query)
    }
  }

  onMapViewSource(payload = {}) {
    this.props = mergeRight(this.props, payload)
    return payload
  }

  // ====================== ATTACH STREAM AND DOM DATA AGGREGATORS==========================
  exchangeViewsWithChild(childView, attachData) {
    this.addChildStream(childView.sourceStreams.toParent$)
    childView.addParentStream(this.sourceStreams.toChild$, attachData)
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
    // console.log("append to dom ",this.props.vsid, this.props.el);
    if (this.props.el !== undefined) {
      console.warn(`Spyne Warning: The ViewStream, ${this.props.name}, has an element, ${this.props.el}, that is already rendered and does not need to be appendedToDom. This may create unsusual side effects!`)
    }
    this.renderViewAndAttachToDom(node, 'dom', 'appendChild')
  }

  appendToDomAfter(node) {
    if (this.props.el !== undefined) {
      console.warn(`Spyne Warning: The ViewStream, ${this.props.name}, has an element, ${this.props.el}, that is already rendered and does not need to be appendedToDomAfter. This may create unsusual side effects!`)
    }
    this.renderViewAndAttachToDom(node, 'dom', 'after')
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
    if (this.props.el !== undefined) {
      console.warn(`Spyne Warning: The ViewStream, ${this.props.name}, has an element, ${this.props.el}, that is already rendered and does not need to be prependedToDom. This may create unsusual side effects!`)
    }
    this.renderViewAndAttachToDom(node, 'dom', 'prependChild')
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
    this.exchangeViewsWithChild(v, this.setAttachData('appendChild', query))
  }

  appendViewAfter(v, query) {
    this.exchangeViewsWithChild(v, this.setAttachData('after', query))
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

  appendViewToParentEl(v, query, level = 1) {
    this.exchangeViewsWithChild(v,
      this.setAttachParentData('appendChild', query, level))
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
   * childView.prependViewToParentEl(parentView)
   *
   * */
  prependViewToParentEl(v, query, level = 1) {
    this.exchangeViewsWithChild(v,
      this.setAttachParentData('prependChild', query, level))
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
    this.exchangeViewsWithChild(v, this.setAttachData('prependChild', query))
  }

  /**
   *  Appends a ViewStream object that are not rendered to the #spyne-null-views div.
   */
  appendToNull() {
    const node = document.getElementById('spyne-null-views')
    this.renderViewAndAttachToDom(node, 'dom', 'appendChild')
  }

  onVSRendered(payload) {
    // console.log('VS_SPAWN: ', this.props.name, payload);
    if (payload.from$ === 'internal') {
      // this.props['el'] = payload.el.el;

      this.postRender()
      // this.broadcaster = new Spyne.ViewStreamBroadcaster(this.props, this.broadcastEvents);
    }
  }

  postRender() {
    if (this._postRenderedCalled === true) {
      return
    }

    this.beforeAfterRender()
    this.afterRender()

    this.onRendered()
    const startAnimFrameAfterRendered = () => this.onAnimFrameAfterRendered()
    requestAnimationFrame(startAnimFrameAfterRendered)

    if (this.isDevMode === true) {
      const eventsArr = this.broadcastEvents()
      const isValidArr = ViewStream.isValidNestedArr(eventsArr)
      if (isValidArr === false) {
        console.warn(`Spyne Warning: The array returned from broadcastEvents in ${this.props.name}, '${JSON.stringify(eventsArr)}', does not appear to be properly formatted!`)
      }
    }
    this.initializeChannels()
    this.viewsStreamBroadcaster = new ViewStreamBroadcaster(this.props, this.broadcastEvents.bind(this))
    this.afterBroadcastEvents()

    this._postRenderedCalled = true
  }

  addTraits(traits) {
    if (traits.constructor.name !== 'Array') {
      traits = [traits]
    }
    const addTrait = (TraitClass) => {
      new TraitClass(this)
    }

    traits.forEach(addTrait)
  }

  // ================================= METHODS TO BE EXTENDED ==============================

  afterBroadcastEvents() {
    if (this.isDevMode === true) {
      const pullActionsFromList = (arr) => arr[0]
      const nestedActionsArr = this.addActionListeners()

      const actionsArr = nestedActionsArr.map(pullActionsFromList)

      const isValidArr = ViewStream.isValidNestedArr(nestedActionsArr)

      if (isValidArr === false) {
        console.warn(`Spyne Warning: The array returned from addActionsListeners in ${this.props.name}, '${JSON.stringify(nestedActionsArr)}', does not appear to be properly formatted!`)
      } else {
        const checkForExistingMethod = (arr) => {
          const method = defaultTo('', arr[1])
          const isMethod = is(Function, this[method])
          if (isMethod === false) {
            console.warn(`Spyne Warning: The method in addActionListeners nested Array, '${JSON.stringify(arr)}', in ${this.props.name}, does not appear to exist!`)
          }
        }
        compose(forEach(checkForExistingMethod), defaultTo([]))(nestedActionsArr)
      }

      const delayForProxyChannelResets = () => {
        if (path(['props', 'addedChannels'], this) !== undefined) {
          ViewStream.checkIfActionsAreRegistered.bind(this)(this.props.addedChannels, actionsArr)
        }
      }
      this.setTimeout(delayForProxyChannelResets, 500)
    }
  }

  setDataVSID() {
    this.props.el.dataset.vsid = this.props.vsid// String(this.props.vsid).replace(/^(vsid-)(.*)$/, '$2');
  }

  beforeAfterRender() {
    /*    let dm2 = function(el) {
          return function(str = '') {
            return new DomItemSelectors(el, str);
          };
        }; */

    // this.props.el$ = dm2(this.props.el);
    this.setDataVSID()
    this.props.el$ = ViewStreamSelector(this.props.el)
    // console.log('EL IS ', this.props.el$.elArr);
    // window.theEl$ = this.props.el$;
  }

  // THIS IS AN EVENT HOLDER METHOD BECAUSE SENDING DOWNSTREAM REQUIRE THE PARENT TO HAVE A METHOD
  downStream() {

  }

  /**
   *
   * This method is called as soon as the element has been rendered.
   *
   */

  onRendered() {
  }

  /**
   *
   * This method is useful to add animation classes to be called immediately after rendering.
   *
   */

  onAnimFrameAfterRendered() {
  }

  /**
   *
   * (Deprecated. Use onRendered). This method is called as soon as the element has been rendered.
   *
   */

  afterRender() {
  }

  broadcastEvents() {
    // ADD BUTTON EVENTS AS NESTED ARRAYS
    return []
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
    const isValidChannel = c => registeredStreamNames().includes(c)
    const error = c => console.warn(
        `channel name ${c} is not within ${registeredStreamNames}`)
    const startSubscribe = (c) => {
      const obs$ = SpyneAppProperties.channelsMap.getStream(c).observer

      return obs$.pipe(takeWhile(p => this.deleted !== true))
    }// getGlobalParam('streamsController').getStream(c).observer;

    const fn = ifElse(isValidChannel, startSubscribe, error)

    return fn(channel)
  }

  /**
   * CHECKS TO SEE IF CHANNELS HAVE BEEN ADDED TO props.channels object;
   */
  initializeChannels() {
    const addChannel = (channel) => {
      const [channelName, skipFirst = false] = Array.isArray(channel) ? channel : [channel]
      this?.addChannel(channelName, skipFirst)
    }
    if (Array.isArray(this?.props?.channels)) {
      this?.props?.channels?.forEach(addChannel)
    }
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

  addChannel(channelName, skipFirst = false, sendDownStream = false, bool = false) {
    const directionArr = sendDownStream === true ? this.$dirs.CI : this.$dirs.I
    const mapDirection = p => {
      // et p2 = defaultTo({}, clone(p));
      const pl = p// || {};
      pl.$dir = directionArr
      return pl
      // return deepMerge(dirObj, p2);
      // Object.assign({$dir: directionArr}, clone(p))
    }
    if (this?.props?.addedChannels?.includes(channelName) === true) {
      // CHECKS IF CHANNEL HAS ALREADY BEEN ADDED
      return
    }
    const isLocalEventCheck = path(['srcElement', 'isLocalEvent'])
    const cidCheck = path(['srcElement', 'vsid'])
    const cidMatches = p => {
      const vsid = cidCheck(p)
      const isLocalEvent = isLocalEventCheck(p)
      const filterEvent = isLocalEvent !== true || vsid === this.props.vsid
      // console.log("checks ",vsid,this.props.vsid, isLocalEvent,filterEvent);
      return filterEvent
    }

    const pipeArr = [map(mapDirection), filter(cidMatches)]
    if (skipFirst === true) {
      pipeArr.unshift(skip(1))
    }

    const channel$ = this.getChannel(channelName).pipe(...pipeArr)
    this.updateSourceSubscription(channel$, false)
    this.props.addedChannels.push(channelName)
  }

  checkIfChannelExists(channelName) {
    const channelExists = SpyneAppProperties.channelsMap.testStream(channelName)
    if (channelExists !== true) {
      console.warn(`SPYNE WARNING: The ChannelPayload from ${this.props.name}, has been sent to a channel, ${channelName}, that has not been registered!`)
    }
    return channelExists
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

  sendInfoToChannel(channelName, pl = {}, action) {
    const payload = pl

    const defaultToAction = defaultTo('VIEWSTREAM_EVENT')
    const channelDefaultActionHash = {
      CHANNEL_ROUTE: 'CHANNEL_ROUTE_CHANGE_EVENT'
    }
    const getActionFn = compose(defaultToAction, prop(channelName))

    action = action || getActionFn(channelDefaultActionHash)

    const data = { payload, action }

    try {
      data.srcElement = compose(pick(['id', 'vsid', 'class', 'tagName']), prop('props'))(this)
      if (this.checkIfChannelExists(channelName) === true) {
        if (/CHANNEL_LIFECYCLE/.test(action) === false) {
          Object.defineProperties(data, {
            payload: {
              get: () => safeClone(pl)
            }
          })
        }
        const obs$ = of(data)
        return new ViewStreamPayload(channelName, obs$, data)
      }
    } catch (e) {
      console.warn('SPYNE WARNING ', e)
    }
  }

  tracer(...args) {
    this.sendLifecycleMethod(...args)
  }

  sendLifecycleMethodInactive() {

  }

  sendLifecycleMethodActive(val, p) {
    const isRendered = where({
      from$: equals('internal'),
      action: equals('VS_SPAWNED_AND_ATTACHED_TO_PARENT')
    }, p)
    const isDisposed = p === 'VS_DETRITUS_COLLECT'
    if (isRendered === true) {
      this.sendInfoToChannel('CHANNEL_LIFECYCLE', { action:'CHANNEL_LIFECYCLE_RENDERED_EVENT' }, 'CHANNEL_LIFECYCLE_RENDERED_EVENT')
    } else if (isDisposed === true) {
      this.sendInfoToChannel('CHANNEL_LIFECYCLE', { action:'CHANNEL_LIFECYCLE_DISPOSED_EVENT' }, 'CHANNEL_LIFECYCLE_DISPOSED_EVENT')
    }
  }

  createActionFilter(selectors, data) {
    return new ChannelPayloadFilter(selectors, data)
  }

  isLocalEvent(channelPayloadItem) {
    const itemEl = path(['srcElement', 'el'], channelPayloadItem)
    const thisEl = path(['props', 'el'], this)
    // console.log('this el is ',{thisEl, itemEl});
    return ViewStream.elIsDomElement(thisEl) && ViewStream.elIsDomElement(itemEl) && thisEl.contains(itemEl)
  }

  //  =======================================================================================
  addMixins() {
    //  ==================================
    // BASE CORE MIXINS
    //  ==================================
    const coreMixins = baseCoreMixins()
    this.createId = coreMixins.createId
  }
}
