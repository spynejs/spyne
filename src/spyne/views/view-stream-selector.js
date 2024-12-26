import { head, compose, reject, split, isEmpty, lte, defaultTo, prop } from 'ramda'
import { SpyneAppProperties } from '../utils/spyne-app-properties'

function generateSpyneSelectorId(el) {
  const num = () => Math.random().toString(36).replace(/\d/gm, '').substring(1, 8)
  let vsid = `${num()}`
  if (el.dataset.vsid === undefined) {
    el.dataset.vsid = vsid
  } else {
    vsid = el.dataset.vsid
  }
  return `[data-vsid='${vsid}']`
}

function isDevMode() {
  return SpyneAppProperties.debug === true
}

function isNodeElement(el) {
  const nodeCheck = compose(lte(0), defaultTo(-1), prop('nodeType'))
  return nodeCheck(el)
}

function getElOrList(cxt, sel, verboseBool = false) {
  const list = getNodeListArray(cxt, sel, verboseBool)
  return list.length === 1 ? head(list) : list
}

function testSelectors(cxt, sel, verboseBool) {
  const el = document.querySelector(cxt)

  const elIsDomElement = compose(lte(0), defaultTo(-1), prop('nodeType'))

  if (el !== null && elIsDomElement(el) === false) {
    console.warn(`Spyne Warning: the el object is not a valid single element, ${el}`)
    return
  }

  if (sel !== undefined && String(sel).trim().length > 0) {
    function isValidSelector(selector) {
      try {
        const elements = document.querySelectorAll(selector)
        return elements.length > 0 // Returns true if the selector is valid and selects at least one element
      } catch (e) {
        return false // Catching an exception means the selector is invalid
      }
    }

    const isValidSelectorBool = isValidSelector(sel)
    if (verboseBool === true && isDevMode() === true && isValidSelectorBool === false) {
      console.warn(`Spyne Warning: the selector, ${sel} does not exist in this el, ${cxt}`)
    }
  }
}

function getNodeListArray(cxt, sel, verboseBool = false) {
  const selector = sel !== undefined ? `${cxt} ${sel}` : cxt
  let isParent = false

  const returnSelectorIfValid = (selector) => {
    let arr = []
    try {
      arr = document.querySelectorAll(selector)
    } catch (e) { arr = [] }
    try {
      isParent = document.querySelector(sel) === document.querySelector(cxt)
      if (isParent === true) {
        arr = [document.querySelector(sel)]
      }
    } catch (e) {
      // return [];
    }
    return arr// document.querySelectorAll(selector);
  }

  const elArr =  returnSelectorIfValid(selector)

  if (verboseBool === true) {
    const mainSel = isParent === true ? 'body' : cxt
    testSelectors(mainSel, sel, verboseBool)
  }

  return elArr
}

function setInlineCss(val, cxt, sel) {
  const arr = getNodeListArray(cxt, sel)
  const addInlineCss = item => {
    item.style.cssText = val
  }
  arr.forEach(addInlineCss)
  return this
}

/**
 *
 * @module ViewStreamSelector
 * @type util
 *
 * @param {String|El} cxt The main element
 * @param {String|El} The selector as a String
 * @returns {function(*=)}
 * @constructor
 */

function ViewStreamSelector(cxt, sel) {
  cxt = typeof (cxt) === 'string' ? cxt : generateSpyneSelectorId(cxt)
  testSelectors(cxt, sel, false)

  function selector(sel) {
    return ViewStreamSelector(cxt, sel)
  }

  /**
   * Convenience method to map through a NodeList.
   *
   * @param {Function} fn
   * @returns An array of elements
   */
  selector.map = (fn) => Array.from(getNodeListArray(cxt, sel)).map(fn)

  /**
   * Convenience method to iterate through a NodeList
   *
   * @param {Function} fn
   * @returns An array of elements
   */
  selector.forEach = (fn) => Array.from(getNodeListArray(cxt, sel)).map(fn)

  selector.getNodeListArray = () => getNodeListArray(cxt, sel)

  /**
   *
   * Adds the class to the Element or to the NodeList.
   * @param {String} c
   *
   *
   * @property {String} c - = undefined; The class to be added.
   *
   **/
  selector.addClass = (c) => {
    const arr = getNodeListArray(cxt, sel)
    const addClass = item => item.classList.add(c)
    arr.forEach(addClass)
    return this
  }

  /**
   *
   * @param {String} c
   * @desc Removes the class to the Element or to the NodeList.
   */
  selector.removeClass = (c) => {
    const arr = getNodeListArray(cxt, sel)
    const removeClass = item => {
      item.classList.remove(c)
    }
    arr.forEach(removeClass)
    return this
  }

  /**
   *
   * @param {String} c
   * @desc Sets the class to equal exactly the class string.
   */
  selector.setClass = (c) => {
    const arr = getNodeListArray(cxt, sel)
    /**
    * NON IE CLEANER SOLUTION
    * const removeClass = item => item.classList = c;
    *  arr.forEach(removeClass);
    */

    const setTheClass = item => {
      const removeClassStrArr = compose(reject(isEmpty), split(' '))(item.className)
      const classStrArr = c.split(' ')
      const remover = s => item.classList.remove(s)
      const adder = sel => item.classList.add(sel)
      removeClassStrArr.forEach(remover)
      classStrArr.forEach(adder)
    }
    arr.forEach(setTheClass)
    return this
  }

  selector.unmount = () => {
    // console.log('unmounting selector ', this);
  }

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
  selector.toggleClass = (c, bool) => {
    const arr = getNodeListArray(cxt, sel)
    const toggleClass = item => {
      bool = bool !== undefined ? bool : !item.classList.contains(c)
      bool ? item.classList.add(c) : item.classList.remove(c)
    }
    arr.forEach(toggleClass)
    return this
  }

  selector.toggle = (c, bool) => {
    selector.toggleClass(c, bool)
    return this
  }

  /**
   * Attaches html to the Selector's element
   * @param htmlElement
   */
  selector.appendChild = (htmlElement) => {
    if (selector.el.length !== 0) {
      selector.el.appendChild(htmlElement)
    } else {
      console.warn(`Spyne Warning: The selector, ${sel} does not appear to be valid!`)
    }

    return selector.el
  }

  /**
   *
   * Adds class with a delay of 1ms to allow css to register a transition.
   * @param c
   */
  selector.addAnimClass = (c) => {
    const delayAddClass = () => {
      const arr = getNodeListArray(cxt, sel)
      const addClass = item => {
        try {
          item.classList.add(c)
        } catch (e) {
        }
      }
      arr.forEach(addClass)
    }
    requestAnimationFrame(delayAddClass)
    // window.setTimeout(delayAddClass, 1);
  }

  /**
   *
   * @param {String} c
   * @param {String|HTMLElement} elSel The selector for the element.
   * @desc Sets the class active HTMLElement from a NodeList.
   */
  selector.setActiveItem = (c, elSel) => {
    const arr = getNodeListArray(cxt, sel)
    const currentEl = typeof (elSel) === 'string' ? getElOrList(cxt, elSel) : elSel
    const toggleBool = item => item.isEqualNode(currentEl) ? item.classList.add(c) : item.classList.remove(c)
    if (isNodeElement(currentEl) === true) {
      arr.forEach(toggleBool)
    } else if (isDevMode() === true) {
      // console.log("SEL IS ",elSel,c);
      console.warn(`Spyne Warning: The selector, ${elSel}, does not appear to be a valid item in setActiveItem: ${c}`)
    }
    return this
  }

  /**
   *
   * @function el
   *
   * @desc
   * getter for the selector
   *
   * @returns
   * The a single element or a NodeList from the selector
   */

  /**
   *
   * @function length
   *
   * @desc
   * Determines the length of the NodeList
   *
   * @returns
   * The length of the selector as a NodeList
   */

  /**
   *
   * @function exists
   *
   * @desc
   * Determines whether an the selected element exists
   *
   * @returns
   * Boolean
   */

  Object.defineProperty(selector, 'el', { get: () => getElOrList(cxt, sel, true) })
  Object.defineProperty(selector, 'els', { get: () => getNodeListArray(cxt, sel) })
  Object.defineProperty(selector, 'len', { get: () => getNodeListArray(cxt, sel, false).length })
  Object.defineProperty(selector, 'exists', { get: () => getNodeListArray(cxt, sel, false).length >= 1 })
  Object.defineProperty(selector, 'exist', { get: () => getNodeListArray(cxt, sel, false).length >= 1 })
  Object.defineProperty(selector, 'nodeList', { get: () => getNodeListArray(cxt, sel) })
  Object.defineProperty(selector, 'arr', {
    get: () => {
      const el = getElOrList(cxt, sel, true)
      if (el === undefined) {
        return []
      } else if (el.length === undefined) {
        return [el]
      } else {
        return Array.from(el)
      }
    }
  })

  Object.defineProperty(selector, 'inline', { set: (val) => setInlineCss(val, cxt, sel), get: () => selector })
  Object.defineProperty(selector, 'inlineCss', { set: (val) => setInlineCss(val, cxt, sel), get: () => selector })

  return selector
}

export { ViewStreamSelector }
