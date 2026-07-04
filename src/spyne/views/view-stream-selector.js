import { head, compose, reject, split, isEmpty, lte, defaultTo, prop } from 'ramda'
import { spyneWarn } from '../utils/spyne-warn.js'
import { SpyneAppProperties } from '../utils/spyne-app-properties.js'

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
    spyneWarn(`Spyne Warning: the el object is not a valid single element, ${el}`)
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
      spyneWarn(`Spyne Warning: the selector, ${sel} does not exist in this el, ${cxt}`)
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
    return selector
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
    return selector
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
    return selector
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
    return selector
  }

  selector.toggle = (c, bool) => {
    selector.toggleClass(c, bool)
    return selector
  }

  /**
   * Attaches html to the Selector's element (the first match when the
   * selector matches multiple elements).
   * @param htmlElement
   */
  selector.appendChild = (htmlElement) => {
    const el = selector.el
    if (el !== null) {
      el.appendChild(htmlElement)
    } else {
      spyneWarn(`Spyne Warning: The selector, ${sel} does not appear to be valid!`)
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
    return selector
  }

  /**
   *
   * @param {String} c
   * @param {String|HTMLElement} elSel The selector for the element.
   * @desc Sets the class active HTMLElement from a NodeList.
   */
  selector.setActiveItem = (c, elSel) => {
    const arr = getNodeListArray(cxt, sel)
    const currentEl = typeof elSel === 'string'
      ? getElOrList(cxt, elSel)
      : elSel

    arr.forEach(item => item.classList.remove(c))

    if (isNodeElement(currentEl) === true) {
      const matchingEl = Array.from(arr).find(item => item === currentEl)

      if (matchingEl) {
        matchingEl.classList.add(c)
      } else if (isDevMode() === true) {
        spyneWarn(
          `Spyne Warning: The selector, ${elSel}, is valid but does not match any item in setActiveItem: ${c}`
        )
      }
    } else if (isDevMode() === true) {
      spyneWarn(
        `Spyne Warning: The selector, ${elSel}, does not appear to be a valid item in setActiveItem: ${c}`
      )
    }

    return selector
  }

  /**
   *
   * @function el
   *
   * @desc
   * getter that always resolves to a single element: the matched element,
   * or the first item when the selector matches multiple elements (a
   * warning is logged in debug mode).
   *
   * @returns
   * An HTMLElement, or null when the selector matches nothing
   * (mirroring querySelector)
   */

  /**
   *
   * @function els
   *
   * @desc
   * getter that always resolves to an Array of the matched elements.
   *
   * @returns
   * An Array of HTMLElements; empty when the selector matches nothing
   */

  /**
   *
   * @function length
   *
   * @desc
   * Determines the length of the NodeList
   *
   * @returns
   * The number of elements matched by the selector
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

  const getElsArray = (verboseBool = true) => Array.from(getNodeListArray(cxt, sel, verboseBool))

  Object.defineProperty(selector, 'el', {
    get: () => {
      const list = getElsArray()
      if (list.length > 1 && isDevMode() === true) {
        spyneWarn(`Spyne Warning: el$("${sel !== undefined ? sel : cxt}").el matched ${list.length} elements; returning the first. Use .els for the full list.`)
      }
      return list.length >= 1 ? list[0] : null
    }
  })
  Object.defineProperty(selector, 'els', { get: () => getElsArray() })
  Object.defineProperty(selector, 'arr', { get: () => getElsArray() })

  // Undocumented. Retains the pre-0.24 polymorphic el contract — a single
  // element, a NodeList, or an empty NodeList depending on match count —
  // to assist in debugging and migrating older SpyneJS apps.
  Object.defineProperty(selector, 'elLegacy', { get: () => getElOrList(cxt, sel, true) })
  Object.defineProperty(selector, 'len', { get: () => getNodeListArray(cxt, sel, false).length })
  Object.defineProperty(selector, 'length', { get: () => getNodeListArray(cxt, sel, false).length })
  Object.defineProperty(selector, 'exists', { get: () => getNodeListArray(cxt, sel, false).length >= 1 })

  Object.defineProperty(selector, 'inline', { set: (val) => setInlineCss(val, cxt, sel), get: () => selector })
  Object.defineProperty(selector, 'inlineCss', { set: (val) => setInlineCss(val, cxt, sel), get: () => selector })

  return selector
}

export { ViewStreamSelector }
