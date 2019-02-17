const R = require('ramda');

export class ChannelActionFilter {

  constructor(selector, data) {
    const obj = {selector, data};




    const testRun = R.compose(R.not, R.isNil);

     const addStringSelectorFilter =  R.is(String, selector) ? ChannelActionFilter.filterSelector(selector) : undefined;
     const addArraySelectorFilter = R.is(Array, selector) ? ChannelActionFilter.filterSelectorArr(selector) : undefined;
     const addDataFilter = R.is(Object, data) ? ChannelActionFilter.filterData(data) : undefined;

    const filterArr = R.reject(R.isNil, [addStringSelectorFilter, addArraySelectorFilter, addDataFilter]);
    console.log(filterArr,' checking filters ');

    if (data === undefined){
     // return ChannelActionFilter.filterBySelector(selector);
    }

  }

  static checkPayloadSelector(str, payload){
    let el = R.path(['srcElement', 'el'], payload);
    if (typeof(el)!=="object"){
      return false;
    }


  }

  static filterSelectorArr(arr){
    return 'filtering array of selectors'+arr;
  }

  static filterSelector(str){
    return 'filtering a string selector '+str;
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