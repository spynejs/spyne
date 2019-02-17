const R = require('ramda');

export class ChannelActionFilter {

  constructor(selector, data) {
    const obj = {selector, data};




    const testRun = R.compose(R.not, R.isNil);

     const addStringSelectorFilter =  R.is(String, selector) ? ChannelActionFilter.filterSelector([selector]) : undefined;
     const addArraySelectorFilter = R.is(Array, selector) ? ChannelActionFilter.filterSelector(selector) : undefined;
     const addDataFilter = R.is(Object, data) ? ChannelActionFilter.filterData(data) : undefined;

    const filterArr = R.reject(R.isNil, [addStringSelectorFilter, addArraySelectorFilter, addDataFilter]);
    console.log(filterArr,' checking filters ');

    if (data === undefined){
     // return ChannelActionFilter.filterBySelector(selector);
    }
    return filterArr;

  }

  static checkPayloadSelector(arr, payload){
    let el = R.path(['srcElement', 'el'], payload);

    const compareEls = (elCompare) => elCompare.isEqualNode(el);

    const mapNodeArrWithEl = (sel) => {
      let nodeArr = R.flatten(document.querySelectorAll(sel));
      if (R.isEmpty(nodeArr)){
        return false;
      }

      return R.map(compareEls, nodeArr);

    };


    const compareStrWithEl = (str) => {
      let arr = R.flatten(document.querySelectorAll(str));


    };



    //console.log("PAYLOAD EL IS ",el);


    if (typeof(el)!=="object"){
      return false;
    }

    let nodeArrResult = R.compose(R.flatten ,R.map(mapNodeArrWithEl))(arr);
    console.log("node arr resulst ",nodeArrResult);
    return  nodeArrResult;

  }

  static filterSelectorArr(arr){
    return 'filtering array of selectors'+arr;
  }

  static filterSelector(arr){
    let payloadCheck = R.curry(ChannelActionFilter.checkPayloadSelector);
    return payloadCheck(arr);
  }

  static filterData(obj){
    return 'filtering data '+obj;
  }

  static filterBySelector(selector){

    const filterSelector = R.curry((selector, el) => {
      let selectorEl = document.querySelector(selector);
      return selectorEl!==null && selectorEl.isEqualNode(el);
    });

    return filterSelector(selector);


    // NEED TO TEST THAT THE EL OBJECT IS NODE

  }






}