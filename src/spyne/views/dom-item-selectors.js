const R = require('ramda');
// const Rx = require('rxjs');

export class DomItemSelectors {
  constructor(cxt, str) {
    this.el = str !== undefined ? cxt.querySelectorAll(str) : cxt;
    this.queryStr = str;
    if (this.el.length === 1) {
      this.el = R.head(this.el);
    } else if (this.el.constructor.name === 'NodeList') {
      this.el = DomItemSelectors.createArrayFromNodeList(this.el);
    }
    this.cList = this.el.classList;


    this.elProps = new Map();

    this.createMethods();
  }

  static createArrayFromNodeList(nList){
    const reducer = (acc, item)=>{acc.push(item); return acc;};
    return  R.reduce(reducer,[], nList);
  }

  createMethods() {
    const mapAddClass = (item, s) => {
      if (item!==undefined) {
        item.classList.add(s);
      }
    }
    const mapRemoveClass = (item, s) => {
      if (item!==undefined) {
        item.classList.remove(s)
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

    const mapToggleClass = (item, s, bool=true) => {
      item.classList.toggle(s, bool);
      return item;
    };


    this.addClass = this.mapToValue(mapAddClass);
    this.removeClass = this.mapToValue(mapRemoveClass);
    this.setClass = this.mapToValue(mapSetClass);
    this.inlineCss = this.mapToValue(mapInlineCss);
    this.toggleClass = this.mapToValue(mapToggleClass);
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
      if (item!==undefined) {
        item.classList.add(str);
      }
    };
    const remover = (item) => {
      if(item!==undefined) {
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

  query(str) {
    const elementExists = this.el.querySelector(str);
    //console.log('query is ',this.el,str, elementExists);
    if (elementExists!==null){
      return new DomItemSelectors(this.el, str);
    } else {
      const id = this.el.getAttribute('id');
      console.warn(`Spyne Warning: the element, "${str}" does not exist in this element, "${id}"!`);
    }

  }

  getEl() {
    return this.el;
  }

  get elArr() {
    if (this.el.constructor.name === 'NodeList') {
      return DomItemSelectors.createArrayFromNodeList(this.el);
    } else {
      return [].concat(this.el);
    }
  }

/*
  getBoxEl() {
    console.log('getbox el ',this.el);
    return [].concat(this.el);
  }
*/

  unmount() {
    this.el = undefined;
    this.cList = undefined;
    this.inline = undefined;
  }
}
