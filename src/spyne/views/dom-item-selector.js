import * as R from 'ramda';

function getElFromQuery(el, str){
  const elementExists = el.querySelector(str);
  // console.log('query is ',this._el,str, elementExists);
  if (elementExists !== null) {
    return el.querySelectorAll(str);
  } else {
    const id = el.getAttribute('id');
    console.warn(`Spyne Warning: the element, "${str}" does not exist in this element, "${id}"!`);
  }
  return { el:undefined };
}

function createArrayFromNodeList(nodeList){
  return Array.from(nodeList);
}

function generateEl(cxt, str){
  let mainEl = typeof (cxt) === 'string' ? document.querySelectorAll(cxt) : cxt;
  let queryStr = str;
  if (mainEl.length === 1) {
    mainEl = R.head(mainEl);
  } else if (mainEl.constructor.name === 'NodeList') {
    mainEl = createArrayFromNodeList(mainEl);
  }

  let selectorStringIsEmptyBool = R.either(R.isNil, R.isEmpty)(str);
  let _el = selectorStringIsEmptyBool ? mainEl : getElFromQuery(mainEl, str);

  if (_el.length === 1) {
    _el = R.head(_el);
  } else if (_el.constructor.name === 'NodeList') {
    _el = createArrayFromNodeList(_el);
  }
  return _el;

}



function DomItemSelector(cxt, str) {

  let setClass = ()=>console.log("set class for ",cxt,' and ',str);;


  function nested(str){
    return DomItemSelector(cxt, str);
  }

  nested.tester = ()=>console.log("TESTING ",cxt);
  nested.setClass = setClass;
  Object.defineProperty(nested, 'el', {get: ()=>generateEl(cxt, str)});
 // Object.defineProperty(o, 'b', { get: function() { return this.a + 1; } });

  return nested;


}

export {DomItemSelector, generateEl, getElFromQuery}
