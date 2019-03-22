import * as R from 'ramda';

function getElFromQuery(elStr, str){
  console.log("GET EL FROM QUEYR ",elStr);
  let el = document.querySelector(elStr);
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

function generateSpyneSelectorId(el){
  const num = ()=>Math.floor(Math.random(10000000)*10000000);
  let spyneSelectorId = `ss-id-${num()}`;
  if (el.dataset.spyneSelectorId===undefined){
    el.dataset.spyneSelectorId = spyneSelectorId;
  } else {
    spyneSelectorId = el.dataset.spyneSelectorId;
  }
  return `[data-spyne-selector-id='${spyneSelectorId}']`;

}

function generateEl(cxt, str){
  let mainEl = typeof (cxt) === 'string' ? cxt: generateSpyneSelectorId(cxt);


/*  if (document.querySelectorAll(cxt).length === 1) {
    console.warn(`Spyne Warning: selector element, ${cxt} is too vague`)
  }*/

  let selectorStringIsEmptyBool = R.either(R.isNil, R.isEmpty)(str);
  let _el = selectorStringIsEmptyBool ? document.querySelector(mainEl) : getElFromQuery(mainEl, str);
  console.log("EL IS FN ", mainEl);

 /* if (_el.length === 1) {
    _el = R.head(_el);
  } else if (_el.constructor.name === 'NodeList') {
    _el = createArrayFromNodeList(_el);
  }*/
  return _el;

}


function getElOrList(cxt,str){
  let list = getNodeListArray(cxt, str);
   return list.length === 1 ? R.head(list) : list;
};

 function testSelectors(cxt, str){
  let el = document.querySelector(cxt);

  const elIsDomElement = R.compose(R.lte(0), R.defaultTo(-1), R.prop('nodeType'));

  if (elIsDomElement(el)===false){
    console.warn(`Spyne warning: the el object is not a valid single element, ${el}`);
    return;
  }

  if (str!==undefined){
    let query = el.querySelector(str);
    if (query===null){
      console.warn(`Spyne warning: the selector, ${str} does not exist in this el, ${cxt}`);
    }
  }

}

function getNodeListArray(cxt, str){
  let selector = str !== undefined ? `${cxt} ${str}` : cxt;
  return document.querySelectorAll(selector);
}

function setInlineCss(val, cxt,str){
   let arr = getNodeListArray(cxt, str);
   const addInlineCss  = item => item.style.cssText = val;
   arr.forEach(addInlineCss);
   return this;
}



function DomItemSelector(cxt, str) {

   cxt = typeof (cxt) === 'string' ? cxt: generateSpyneSelectorId(cxt);

   testSelectors(cxt, str);

  function nested(str){
    return DomItemSelector(cxt, str);
  }

  nested.getNodeListArray = ()=>getNodeListArray(cxt, str);

  nested.addClass = (c)=>{
      let arr = getNodeListArray(cxt, str);
      const addClass = item => item.classList.add(c);
      arr.forEach(addClass);
      return this;
  };

  nested.removeClass = (c)=>{
    let arr = getNodeListArray(cxt, str);
    const removeClass = item => item.classList.remove(c);
    arr.forEach(removeClass);
    return this;
  };

  nested.setClass = (c)=>{
    let arr = getNodeListArray(cxt, str);
    const removeClass = item => item.classList = c;
    arr.forEach(removeClass);
    return this;
  };

  nested.unmount = ()=>{
    console.log('unmounting selector ',this);
  };

  nested.toggleClass = (c, bool)=>{
    let arr = getNodeListArray(cxt, str);
    const toggleClass = item => {
      bool = bool !== undefined ? bool : !item.classList.contains(c);
      item.classList.toggle(c, bool);
    };
    arr.forEach(toggleClass);
    return this;
  };

  nested.setActiveItem = (sel, c)=>{
      return nested.toggleEls(c, sel);
  };

  nested.toggleEls = (c, sel)=>{
    let arr = getNodeListArray(cxt, str);
    let currentEl = typeof(sel) === "string" ? getElOrList(cxt, sel) : sel;
    const toggleBool = item => item.classList.toggle(c, item.isEqualNode(currentEl));
    arr.forEach(toggleBool);
    return this;
  };



  Object.defineProperty(nested, 'el', {get: ()=>getElOrList(cxt, str)});
  Object.defineProperty(nested, 'inlineCss', {set: (val)=>setInlineCss(val, cxt, str)});

 // Object.defineProperty(o, 'b', { get: function() { return this.a + 1; } });

  return nested;


}

export {DomItemSelector, generateEl, getElFromQuery}
