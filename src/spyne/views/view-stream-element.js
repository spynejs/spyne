import { DomElement } from './dom-element.js'
import { fadein, fadeout } from '../utils/viewstream-animations.js'
import { ViewStreamObservable } from '../utils/viewstream-observables.js'
import { deepMerge } from '../utils/deep-merge.js'
import { Subject, bindCallback } from 'rxjs'
import { filter, isNil, pick, props, defaultTo } from 'ramda'

export class ViewStreamElement {
  /**
   * @module ViewStreamElement
   * @type internal
   * @desc
   * This is an internal class that is part of the ViewStream observable system.
   *
   * @constructor
   * @param {Observable} sink$
   * @param {Object} viewProps
   * @param {String} vsid
   * @param {String} vsName
   *
   */
  constructor(sink$, viewProps = {}, vsid = '', vsName = 'theName') {
    this.addMixins()
    this._state = 'INIT'
    this.vsid = vsid
    this.el = viewProps.el
    this.vsName = vsName
    this.defaults = {
      debug:false,
      extendedHashMethods: {}
    }
    this.options = deepMerge(this.defaults, viewProps)
    const createExtraStatesMethod = (arr) => {
      const [action, funcStr] = arr
      this.options.extendedHashMethods[action] = (p) => this[funcStr](p)
    }
    this.addActionListeners().forEach(createExtraStatesMethod)
    this.options.hashMethods = this.setHashMethods(this.options.extendedHashMethods)
    this.sink$ = sink$
    this.sink$
      .subscribe(this.onObsSinkSubscribe.bind(this))

    this.$dirs = ViewStreamObservable.createDirectionalFiltersObject()
    this.addDefaultDir = ViewStreamObservable.addDefaultDir
    this.sourceStreams = ViewStreamObservable.createDirectionalObservables(new Subject(), this.vsName, this.vsid)
    this._source$ = this.sourceStreams.toInternal$ //  new Subject();
  }

  addActionListeners() {
    return []
  }

  setHashMethods(extendedHashMethodsObj = {}) {
    const defaultHashMethods = {
      VS_DETRITUS_COLLECT                : (p) => this.onGarbageCollect(p),
      READY_FOR_VS_DETRITUS_COLLECT                   : (p) => this.onReadyForGC(p),
      EXTIRPATE                        : (p) => this.onDispose(p),
      VS_SPAWN                         : (p) => this.onRender(p),
      VS_SPAWN_AND_ATTACH_TO_PARENT    : (p) => this.onRenderAndAttachToParent(p),
      VS_SPAWN_AND_ATTACH_TO_DOM       : (p) => this.onRenderAndAttachToDom(p),
      ATTACH_CHILD_TO_SELF           : (p) => this.onAttachChildToSelf(p)
    }
    return deepMerge(defaultHashMethods, extendedHashMethodsObj)
  }

  createDomItem() {
    this.props = this.props !== undefined ? this.props : {}
    const removeIsNil = (val) => val !== undefined
    const attrs = filter(removeIsNil, pick(['id', 'className'], this.props))
    const { tagName, data, template } = this.props
    return new DomElement(tagName, attrs, data, template)
  }

  onDisposeCompleted(d) {
    // console.log('bv self disposed after animateOut ', d, this);
  }

  animateInTween(el, time) {
    fadein(el, time)
  }

  animateOutTween(el, time, callback) {
    // console.log('anim out ', {el, time, callback});
    fadeout(el, time, callback)
  }

  setAnimateIn(d) {
    if (d.animateIn === true) {
      const el = d.el !== undefined ? d.el : this.domItem.el
      this.animateInTween(el, d.animateInTime)
    }
  }

  /**
   *
   * @param {Object} d
   * @returns payload that confirms dispose
   */

  disposeMethod(d) {
    const el = d.el.el !== undefined ? d.el.el : d.el // DOM ITEMS HAVE THEIR EL ITEMS NESTED

    const gcData = { action:'READY_FOR_VS_DETRITUS_COLLECT', $dir:this.$dirs.PI, el }

    const animateOut = (d, callback) => {
      this.animateOutTween(el, d.animateOutTime, callback)
    }

    const fadeOutObs = bindCallback(animateOut)
    const onFadeoutCompleted = (e) => {
      this._source$.next(gcData)
    }

    const onFadeoutObs = (d) => {
      fadeOutObs(d)
        .subscribe(onFadeoutCompleted)
      return { action:'EXTIRPATING', $dir:this.$dirs.CI }
    }
    const onEmptyObs = () => ({ action:'EXTIRPATE_AND_READY_FOR_VS_DETRITUS_COLLECT', $dir:this.$dirs.CI })
    const fn = d.animateOut === true ? onFadeoutObs : onEmptyObs
    return fn(d)
  }

  onDispose(d) {
    return this.disposeMethod(d)
  }

  removeStream() {
    // this.sourceStreams.completeAll();
    if (this.sourceStreams !== undefined) {
      this.sourceStreams.completeStream(['internal', 'child'])
    }
  }

  onReadyForGC(p) {
    this.removeStream()
  }

  onGarbageCollect(p) {
    if (this.domItem !== undefined) {
      this.domItem.unmount()
    }

    if (this.sourceStreams !== undefined) {
      this.sourceStreams.completeStream(['parent'])
    }

    delete this
  }

  getSourceStream() {
    return this._source$
  }

  combineDomItems(d) {
    if (this.el !== undefined) {
      return
    }

    const container =  isNil(d.query) ? d.node : d.query
    const prepend = (node, item) => node.insertBefore(item, node.firstChild)
    const append = (node, item) => node.appendChild(item)
    const after = (node, item) => node.after(item)

    const defaultFn = prepend
    const attachTypeHash = {
      appendChild : append,
      after
    }
    // DETERMINE WHETHER TO USE APPEND OR PREPEND
    // ON CONNECTING DOM ITEMS TO EACH OTHER
    // let attachFunc = d.attachType === 'appendChild' ? append : prepend;
    const attachFunc = attachTypeHash[d.attachType] || defaultFn
    attachFunc(container, this.domItem.render())
    this.setAnimateIn(d)
  }

  /**
   *
   * @param p
   * @returns payload to append child element to current element
   */

  onAttachChildToSelf(p) {
    const data = p.childRenderData
    this.combineDomItems(data)
    return {
      action: 'CHILD_ATTACHED',
      $dir: this.$dirs.PI
    }
  }

  /**
   *
   * @param {Object} d
   * @returns payload that attaches current child element to parent
   */
  onRenderAndAttachToParent(d) {
    this.onRender(d)
    this.combineDomItems(d)
    return {
      action: 'VS_SPAWNED_AND_ATTACHED_TO_PARENT',
      el: this.el || this.domItem.el,
      $dir: this.$dirs.PI
    }
  }

  renderDomItem(d) {
    const [tagName, attributes, data, template] = d
    this.domItem = new DomElement({ tagName, attributes, data, template })
    return this.domItem
  }

  onRender(d) {
    const getEl = (data) => this.renderDomItem(data)
    const el = this.el || getEl(props(['tagName', 'domAttributes', 'data', 'template'], d))
    return {
      action: 'VS_SPAWNED',
      el,
      $dir: this.$dirs.I
    }
  }

  extendedMethods(data) {
  }

  /**
   *
   * @param d
   * @returns
   * Payload containing the action, internal observable and element.
   */
  onRenderAndAttachToDom(d) {
    const getEl = (data) => this.renderDomItem(data)
    d.attachData.el = getEl(props(['tagName', 'domAttributes', 'data', 'template'], d))
    this.combineDomItems(d.attachData)
    return {
      action: 'VS_SPAWNED_AND_ATTACHED_TO_DOM',
      el:   this.el || d.attachData.el.el,
      $dir: this.$dirs.CI
    }
  }

  /**
   *
   * The ViewStream directs all relevant actions to the DomElement to render and dispose of itself
   *
   * @param {Object} payload
   */
  onObsSinkSubscribe(payload) {
    const action = payload.action
    const defaultToFn = defaultTo((data) => this.extendedMethods(data))
    const fn = defaultToFn(this.options.hashMethods[action])
    const data = fn(payload)
    const sendData = (d) => this._source$.next(d)
    if (data !== undefined) {
      sendData(Object.freeze(data))
    }
  }

  addMixins() {
    //  ==================================
    // BASE CORE MIXINS
    //  ==================================
    // let coreMixins = baseCoreMixins();
  }
}
