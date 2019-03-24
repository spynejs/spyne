import * as R from 'ramda';


function generateSpyneSelectorId(el) {
  //const num = () => Math.floor(Math.random(10000000) * 10000000);
  const num = () => Math.random().toString(36).substring(2, 8);;
  let ssid = `${num()}`;
  if (el.dataset.ssid === undefined) {
    el.dataset.ssid = ssid;
  } else {
    ssid = el.dataset.ssid;
  }
  return `[data-ssid='${ssid}']`;
}

function getElOrList(cxt, str) {
  let list = getNodeListArray(cxt, str);
  return list.length === 1 ? R.head(list) : list;
};

function testSelectors(cxt, str) {
  let el = document.querySelector(cxt);

  const elIsDomElement = R.compose(R.lte(0), R.defaultTo(-1),
      R.prop('nodeType'));

  if (elIsDomElement(el) === false) {
    console.warn(`Spyne warning: the el object is not a valid single element, ${el}`);
    return;
  }

  if (str !== undefined) {
    let query = el.querySelector(str);
    if (query === null) {
      console.warn(`Spyne warning: the selector, ${str} does not exist in this el, ${cxt}`);
    }
  }

}

function getNodeListArray(cxt, str) {
  let selector = str !== undefined ? `${cxt} ${str}` : cxt;
  return document.querySelectorAll(selector);
}

function setInlineCss(val, cxt, str) {
  let arr = getNodeListArray(cxt, str);
  const addInlineCss = item => item.style.cssText = val;
  arr.forEach(addInlineCss);
  return this;
}

/**
 *
 * @module DomItemSelector
 * @param {String|El} cxt The main element
 * @param {String|El} The selector as a String
 * @returns {function(*=)}
 * @constructor
 */

function DomItemSelector(cxt, str) {
  cxt = typeof (cxt) === 'string' ? cxt : generateSpyneSelectorId(cxt);
  testSelectors(cxt, str);

  function nested(str) {
    return DomItemSelector(cxt, str);
  }

  nested.getNodeListArray = () => getNodeListArray(cxt, str);

  /**
   *
   *
   * @property {String} c - = undefined; The class to be added.
   * @param {String} c
   * @desc Adds the class to the Element or to the NodeList.
   *
   */
  nested.addClass = (c) => {
    let arr = getNodeListArray(cxt, str);
    const addClass = item => item.classList.add(c);
    arr.forEach(addClass);
    return this;
  };

  /**
   *
   * @param {String} c
   * @desc Removes the class to the Element or to the NodeList.
   */
  nested.removeClass = (c) => {
    let arr = getNodeListArray(cxt, str);
    const removeClass = item => item.classList.remove(c);
    arr.forEach(removeClass);
    return this;
  };

  /**
   *
   * @param {String} c
   * @desc Sets the class to equal exactly the class string.
   */
  nested.setClass = (c) => {
    let arr = getNodeListArray(cxt, str);
    const removeClass = item => item.classList = c;
    arr.forEach(removeClass);
    return this;
  };

  nested.unmount = () => {
    console.log('unmounting selector ', this);
  };


  /**
   *
   * @param {String} c
   * @param {Boolean} bool Default is undefined.
   * @desc Sets the class based on the provided boolean or the toggles the class.
   *
   * @example
   * this.props.el$.toggleClass('myclass', true);
   *
   */
  nested.toggleClass = (c, bool) => {
    let arr = getNodeListArray(cxt, str);
    const toggleClass = item => {
      bool = bool !== undefined ? bool : !item.classList.contains(c);
      item.classList.toggle(c, bool);
    };
    arr.forEach(toggleClass);
    return this;
  };

  nested.setActiveItem = (sel, c) => {
    return nested.toggleActiveEl(c, sel);
  };


  /**
   *
   * @param {String} c
   * @param {String|HTMLElement} sel The selector for the element.
   * @desc Sets the class active HTMLElement from a NodeList.
   */
  nested.toggleActiveEl = (c, sel) => {
    let arr = getNodeListArray(cxt, str);
    let currentEl = typeof (sel) === 'string' ? getElOrList(cxt, sel) : sel;
    const toggleBool = item => item.classList.toggle(c, item.isEqualNode(currentEl));
    arr.forEach(toggleBool);
    return this;
  };

  Object.defineProperty(nested, 'el', {get: () => getElOrList(cxt, str)});
  Object.defineProperty(nested, 'inlineCss', {set: (val) => setInlineCss(val, cxt, str)});

  return nested;

}

export {DomItemSelector};
