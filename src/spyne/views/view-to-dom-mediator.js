import { baseCoreMixins } from '../utils/mixins/base-core-mixins';
import { DomItem } from './dom-item';
import { ifNilThenUpdate, convertDomStringMapToObj } from '../utils/frp-tools';
import { fadein, fadeout } from '../utils/viewstream-animations';
import { LifecyleObservables } from '../utils/viewstream-lifecycle-observables';
import { deepMerge } from '../utils/deep-merge';
import { Subject, Observable, bindCallback } from 'rxjs';
import * as R from 'ramda';

export class ViewToDomMediator {
  constructor(sink$, viewProps = {}, cid = '', vsName = 'theName') {
    this.addMixins();
    this._state = 'INIT';
    this.cid = cid;
    this.vsName = vsName;
    this.defaults = {
      debug:false,
      extendedHashMethods: {}
    };
    this.options = deepMerge(this.defaults, viewProps);
    let createExtraStatesMethod = (arr) => {
      let [action, funcStr] = arr;
      this.options.extendedHashMethods[action] = (p) => this[funcStr](p);
    };
    this.addActionListeners().forEach(createExtraStatesMethod);
    this.options.hashMethods = this.setHashMethods(this.options.extendedHashMethods);
    this.sink$ = sink$;
    this.sink$
      .subscribe(this.onSinkSubscribe.bind(this));

    this.$dirs = LifecyleObservables.createDirectionalFiltersObject();
    this.addDefaultDir = LifecyleObservables.addDefaultDir;
    this.sourceStreams = LifecyleObservables.createDirectionalObservables(new Subject(), this.vsName, this.cid);
    this._source$ = this.sourceStreams.toInternal$; //  new Subject();
  }
  addActionListeners() {
    return [];
  }
  setHashMethods(extendedHashMethodsObj = {}) {
    let defaultHashMethods = {
      'GARBAGE_COLLECT'                : (p) => this.onGarbageCollect(p),
      'READY_FOR_GC'                   : (p) => this.onReadyForGC(p),
      'DISPOSE'                        : (p) => this.onDispose(p),
      'RENDER'                         : (p) => this.onRender(p),
      'RENDER_AND_ATTACH_TO_PARENT'    : (p) => this.onRenderAndAttachToParent(p),
      'RENDER_AND_ATTACH_TO_DOM'       : (p) => this.onRenderAndAttachToDom(p),
      'ATTACH_CHILD_TO_SELF'           : (p) => this.onAttachChildToSelf(p)
    };
    return deepMerge(defaultHashMethods, extendedHashMethodsObj);
  }

  createDomItem() {
    this.props = this.props !== undefined ? this.props : {};
    let removeIsNil = (val) => val !== undefined;
    let attrs = R.filter(removeIsNil, R.pick(['id', 'className'], this.props));
    return new DomItem(this.props.tagName, attrs, this.props.data, this.props.template);
  }

  onDisposeCompleted(d) {
    // console.log('bv self disposed after animateOut ', d, this);
  }

  animateInTween(el, time) {
    fadein(el, time);
  }

  animateOutTween(el, time, callback) {
    // console.log('anim out ', {el, time, callback});
    fadeout(el, time, callback);
  }

  setAnimateIn(d) {
    if (d.animateIn === true) {
      let el = d.el !== undefined ? d.el : this.domItem.el;
      this.animateInTween(el, d.animateInTime);
    }
  }

  disposeMethod(d) {
    let el = d.el.el !== undefined ? d.el.el : d.el; // DOM ITEMS HAVE THEIR EL ITEMS NESTED

    const gcData = { action:'READY_FOR_GC', $dir:this.$dirs.PI, el };

    let animateOut = (d, callback) => {
      this.animateOutTween(el, d.animateOutTime, callback);
    };

    let fadeOutObs = bindCallback(animateOut);
    let onFadeoutCompleted = (e) => {
      // console.log('fade out completed ', e, d);
      this._source$.next(gcData);
    };

    let onFadeoutObs = (d) => {
      fadeOutObs(d)
        .subscribe(onFadeoutCompleted);
      return { action:'DISPOSING', $dir:this.$dirs.CI };
    };
    let onEmptyObs = () => ({ action:'DISPOSE_AND_READY_FOR_GC', $dir:this.$dirs.CI });
    let fn = d.animateOut === true ? onFadeoutObs : onEmptyObs;
    return fn(d);
  }

  disposeMethod1(d) {
    let onFadeoutObs = () => {
      let el = d.el.el !== undefined ? d.el.el : d.el; // DOM ITEMS HAVE THEIR EL ITEMS NESTED
      const gcData = { action:'READY_FOR_GC', $dir:this.$dirs.PI, el };

      d.el$.setClass(d.animateOutClass);
      // console.log('DISPOSE FADE OUT ', el, this.$dirs, d.animateOutClass);

      const subscriber = () => {
        // console.log('MEDIATOR FADEOUT COMPLETE ', this.cid, gcData, this.animateOutClass, d);
        this._source$.next(gcData);
      };

      Observable.fromEvent(el, 'transitionend')
        .filter(e => e.target === el)
        .take(1)
        .subscribe(subscriber);
    };
    let onEmptyObs = () => ({ action:'DISPOSE_AND_READY_FOR_GC', $dir:this.$dirs.CI });
    if (d.animateOutClass !== undefined) {
      onFadeoutObs();
      return { action:'DISPOSING', $dir:this.$dirs.CI };
    } else {
      return onEmptyObs();
    }
  }

  onDispose(d) {
    return this.disposeMethod(d);
  }

  removeStream() {
    // this.sourceStreams.completeAll();
    if (this.sourceStreams !== undefined) {
      this.sourceStreams.completeStream(['internal', 'child']);
    }
    // this._source$.complete();
    // this._source$.isStopped = true;
  }

  onGarbageCollect9(p) {
    // console.log('MEDIATOR onGarbageCollect ', this.cid, this.vsName, p);
    const t = this.vsName === 'PageChildBox' ? 1000 : 0;
    window.setTimeout(this.onGarbageCollectRun.bind(this), t);
  }

  onReadyForGC(p) {
    this.removeStream();
  }

  onGarbageCollect(p) {
    // console.log('MEDIATOR onGarbageCollect ', this.cid, this.vsName, p);
    this.domItem.unmount();

    if (this.sourceStreams !== undefined) {
      this.sourceStreams.completeStream(['parent']);
    }

    delete this;
  }

  getSourceStream() {
    return this._source$;
  }

  combineDomItems(d) {
    let container =  R.isNil(d.query) ? d.node : d.query;
    let prepend = (node, item) => node.insertBefore(item, node.firstChild);
    let append = (node, item) => node.appendChild(item);
    // DETERMINE WHETHER TO USE APPEND OR PREPEND
    // ON CONNECTING DOM ITEMS TO EACH OTHER
    // this.domItemEl = this.domItem.render();
    let attachFunc = d.attachType === 'appendChild' ? append : prepend;
    // d.node = R.isNil(d.query) ? d.node : d.query;
    attachFunc(container, this.domItem.render());
    this.setAnimateIn(d);
  }

  onAttachChildToSelf(p) {
    let data = p.childRenderData;
    this.combineDomItems(data);
    return {
      action: 'CHILD_ATTACHED',
      $dir: this.$dirs.PI
    };
  }

  onRenderAndAttachToParent(d) {
    this.onRender(d);
    this.combineDomItems(d);
    return {
      action: 'RENDERED_AND_ATTACHED_TO_PARENT',
      el: this.domItem.el,
      $dir: this.$dirs.PI
    };
  }

  renderDomItem(d) {
    this.domItem = new DomItem(...d);
    return this.domItem;
  }

  onRender(d) {
    let getEl = (data) => this.renderDomItem(data);
    let el =  getEl(R.props(['tagName', 'domAttributes', 'data', 'template'], d));
    return {
      action: 'RENDERED',
      el,
      $dir: this.$dirs.I
    };
  }

  extendedMethods(data) {
  }

  onRenderAndAttachToDom(d) {
    let getEl = (data) => this.renderDomItem(data);
    // let getEl = (data) => new DomItem(...data);
    d.attachData['el'] = getEl(R.props(['tagName', 'domAttributes', 'data', 'template'], d));
    this.combineDomItems(d.attachData);
    return {
      action: 'RENDERED_AND_ATTACHED_TO_DOM',
      el:     d.attachData['el'].el,
      $dir: this.$dirs.CI
    };
  }

  onSinkSubscribe(payload) {
    let action = payload.action;
    let defaultToFn = R.defaultTo((data) => this.extendedMethods(data));
    let fn = defaultToFn(this.options.hashMethods[action]);
    // console.log('MEDIATOR onSinkSubscribe before ', this.cid, action, payload);
    let data = fn(payload);
    // data = this.addDefaultDir(data);
    // console.log('add default dir ', data);
    let sendData = (d) => this._source$.next(d);
    if (data !== undefined) {
      // console.log('MEDIATOR onSinkSubscribe ', this.cid, data, payload);
      sendData(Object.freeze(data));
    }
  }

  addMixins() {
    //  ==================================
    // BASE CORE MIXINS
    //  ==================================
    let coreMixins = baseCoreMixins();
    this.createId = coreMixins.createId;
    this.createpropsMap = coreMixins.createpropsMap;
    this.convertDomStringMapToObj = convertDomStringMapToObj;
    this.ifNilThenUpdate = ifNilThenUpdate;
  }
}
