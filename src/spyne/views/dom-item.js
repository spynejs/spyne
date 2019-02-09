// import {createElement} from '../utils/dom-methods';
import {baseCoreMixins} from '../utils/mixins/base-core-mixins';
import { DomTemplateRenderer } from './dom-template-renderer';
import {deepMerge} from '../utils/deep-merge';
// import {DomTemplateRenderer} from './template-renderer';

const R = require('ramda');

export class DomItem {
  /**
   * @module DomItem
   *
   * @desc
   * This class is mostly used internally by the ViewStream object, but it can be also used to generate a lightweight dom element that contains no props or parameters.
   *
   * @constructor
   * @param {string} tagName the tagname for this dom element.
   * @param {object} attributes any domElement attribute (except for class )
   * @param {string|object} content string for text tags and json for templates
   * @param {template} template
   */

  constructor(tagName = 'div', attributes = {}, content = undefined, template = undefined) {
    let isSimpleView = R.is(String, attributes);
    if (isSimpleView === true) {
      content = attributes;
      attributes = {};
    }
    this.props = new Map();
    this.setProp('fragment', document.createDocumentFragment());
    this.setProp('tagName', tagName);
    this.setProp('attrs', this.updateAttrs(attributes));
    this.setProp('content', content);
    this.setProp('template', template);
    this.addMixins();
  }

  setProp(key, val) {
    this.props.set(key, val);
  }

  getProp(val) {
    return this.props.get(val);
  }

  get el() {
    return this.props.get('el');
  }

  setElAttrs(el, params) {
    let addAttributes = (val, key) => {
      let addToDataset = (val, key) => { el.dataset[key] = val; };
      if (key === 'dataset') {
        R.forEachObjIndexed(addToDataset, val);
      } else {
        el.setAttribute(key, val);
      }
    };
    this.getProp('attrs').forEach(addAttributes);
    return el;
  }

  updateAttrs(params, m) {
    let theMap = m !== undefined ? m : new Map();
    let addAttributes = (val, key) => theMap.set(key, val);
    R.mapObjIndexed(addAttributes, params);
    return theMap;
  }

  addTemplate(el) {
    let template = this.getProp('template');

    let addTmpl = (template) => {
      let data = this.getProp('content');
      data = R.is(Object, data) ? data : {};

      let frag = new DomTemplateRenderer(template, data).getTemplateNode();
      el.appendChild(frag);
      return el;
    };
    let doNothing = (el) => el;
    return template !== undefined ? addTmpl(template) : doNothing(el);
  }

  createElement(tagName = 'div') {
    return document.createElement(tagName);
  }

  addContent(el) {
    let text = (this.getProp('content'));
    let isText = R.is(String, text);
    if (isText === true) {
      let txt = document.createTextNode(text);
      el.appendChild(txt);
    }
    return el;
  }

  execute() {
    let el = R.pipe(
      this.createElement.bind(this),
      this.setElAttrs.bind(this),
      this.addTemplate.bind(this),
      this.addContent.bind(this)
    )(this.getProp('tagName'));
    // this.getProp('fragment').appendChild(el);
    this.props.set('el', el);
  }

  /**
   * This method will render the DomElement
   * @returns {*}
   */
  render() {
    this.execute();
    return this.getProp('el');
  }

  returnIfDefined(obj, val) {
    if (val !== undefined) {
      let isObj = typeof (val) === 'undefined';
      isObj === false ? obj[val] = val : obj[val] = deepMerge(obj[va], val);// Object.assign(obj[val], val);
    }
  }

  updateprops(val) {
    this.returnIfDefined(this.props, val);
    return this;
  }

  updatepropsAndRun(val) {
    this.updateprops(val);
    this.execute();
    return this.getProp('fragment');
  }

  unmount() {
    if (this.props !== undefined) {
      // console.log('dom item unmounting ', this, this.props);
      this.getProp('el').remove();
      this.props.clear();
      this.gc();
    }
  }

  updateTag(tagName = 'div') { this.updateprops(tagName); }
  updateAttributes(attrs = {}) { this.updateprops(attrs); }
  updateTemplate(template) { this.updateprops(template); }
  updateData(data = {}) { this.updateprops(data); }
  addTagAndRender(tagName = 'div') { this.updatepropsAndRun(tagName); }
  addAttrsibutesAndRender(attrs = {}) { this.updatepropsAndRun(attrs); }
  addTemplateAndRender(template) { this.updatepropsAndRun(template); }
  addDataAndRender(data = {}) { this.updatepropsAndRun(data); }
  //  ==================================
  // BASE CORE MIXINS
  //  ==================================
  addMixins() {
    let coreMixins = baseCoreMixins();
    this.gc = coreMixins.gc.bind(this);
  }
}
