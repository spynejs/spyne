const R = require('ramda');

export class DomItemSelectors {
  constructor(cxt, str) {
    this.mainEl = typeof (cxt) === 'string' ? document.querySelectorAll(cxt) : cxt;
    this.queryStr = str;
    if (this.mainEl.length === 1) {
      this.mainEl = R.head(this.mainEl);
    } else if (this.mainEl.constructor.name === 'NodeList') {
      this.mainEl = DomItemSelectors.createArrayFromNodeList(this.mainEl);
    }

    let selectorStringIsEmptyBool = R.either(R.isNil, R.isEmpty)(str);
    this._el = selectorStringIsEmptyBool ? this.mainEl : this.getElFromQuery(this.mainEl, str);
    if (this._el.length === 1) {
      this._el = R.head(this._el);
    } else if (this.el.constructor.name === 'NodeList') {
      this._el = DomItemSelectors.createArrayFromNodeList(this._el);
    }

    this.createMethods();

    // this.query(str);
    // this.cList = this._el.classList;

    // this._elProps = new Map();
    // console.log("CXT STR ",cxt,str, document.querySelectorAll(cxt));
    // this.createMethods();
  }

  static createArrayFromNodeList(nList) {
    const reducer = (acc, item) => { acc.push(item); return acc; };
    return R.reduce(reducer, [], nList);
  }

  createMethods() {
    const mapAddClass = (item, s) => {
      if (item !== undefined && item.classList !== undefined && s !== undefined) {
        item.classList.add(s);
      }
    };
    const mapRemoveClass = (item, s) => {
      if (item !== undefined && item.classList !== undefined && s !== undefined) {
        item.classList.remove(s);
      }
    };
    const mapSetClass = (item, s) => {
      item.classList.value = s;
      return item;
    };
    const mapInlineCss = (item, s) => {
      item.style.cssText = s;
      return item;
    };

    const mapToggleClass = (item, s, bool = true) => {
      item.classList.toggle(s, bool);
      return item;
    };

    const mapToggleEls = (item, s, el) => {
      let bool = item === el;
      item.classList.toggle(s, bool);
      return item;
    };

    this.addClass = this.mapToValue(mapAddClass);
    this.removeClass = this.mapToValue(mapRemoveClass);
    this.setClass = this.mapToValue(mapSetClass);
    this.inlineCss = this.mapToValue(mapInlineCss);
    this.toggleClass = this.mapToValue(mapToggleClass);
    this.toggleEls = this.mapToValue(mapToggleEls);
  }

  mapMethod(fn) {
    // Add a function to the class that will wait for a string param
    return (str) => {
      this.elArr.map(fn);
      return this;
    };
  }

  addAnimClass(str) {
    const adder = () => this.addClass(str);
    requestAnimationFrame(() => {
      setTimeout(adder, 0);
    });
    return this;
  }

  mapToValue(f) {
    return (str, ...args) => {
      // console.log('str f this', str, f, this);
      this.elArr.map(item => f(item, str, ...args));
      return this;
    };
  }

  setClassOnBool(str = '', bool = true) {
    if (bool) {
      this.addClass(str);
    } else {
      this.removeClass(str);
    }
    return this;
  }

  setActiveItem(query, str) {
    const activeEl = document.querySelector(this.queryStr + query);
    const filterForActive = item => item === activeEl;
    // const onActive = bool => bool === true ? item.addClass(str) : item.removeClass(str);
    const adder = (item) => {
      if (item !== undefined) {
        item.classList.add(str);
      }
    };
    const remover = (item) => {
      if (item !== undefined) {
        item.classList.remove(str);
      }
    };
    const mapTheActive = R.ifElse(
      filterForActive,
      adder,
      remover
    );

    this.elArr.map(mapTheActive);
  }

  getElFromQuery(el, str) {
    //  console.log("DOM ITEM QUERY ",el,str);

    const elementExists = el.querySelector(str);
    // console.log('query is ',this._el,str, elementExists);
    if (elementExists !== null) {
      return el.querySelectorAll(str);
    } else {
      const id = this._el.getAttribute('id');
      console.warn(`Spyne Warning: the element, "${str}" does not exist in this element, "${id}"!`);
    }
    return { el:undefined };
  }

  query(str) {
    const elementExists = this._el.querySelector(str);
    // console.log('query is ',this._el,str, elementExists);
    if (elementExists !== null) {
      return new DomItemSelectors(this._el, str);
    } else {
      const id = this._el.getAttribute('id');
      console.warn(`Spyne Warning: the element, "${str}" does not exist in this element, "${id}"!`);
    }
    return { el:undefined };
  }

  getEl() {
    return this._el;
  }

  get el() {
    return this._el;
  }

  get elArr() {
    if (this._el.constructor.name === 'NodeList') {
      return DomItemSelectors.createArrayFromNodeList(this._el);
    } else {
      return [].concat(this._el);
    }
  }

  /*
  getBoxEl() {
    console.log('getbox el ',this._el);
    return [].concat(this._el);
  }
*/

  unmount() {
    this._el = undefined;
    this.cList = undefined;
    this.inline = undefined;
  }
}
