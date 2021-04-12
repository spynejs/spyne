import {
  is,
  reject,
  ifElse,
  invoker,
  identity,
  assoc,
  isNil,
  allPass,
  tap,
  forEachObjIndexed,
  not,
  isEmpty,
  always,
  compose,
  equals,
  prop,
  where,
  defaultTo,
  mergeAll,
  __,
  omit,
  path,
    call,
  clone,
  flatten,
  any,
  type,
  curry,
  mergeRight,
} from 'ramda';
const rMap = require('ramda').map;

const isNotArr = compose(not, is(Array));
const isNotEmpty = compose(not, isEmpty);
const isNonEmptyStr = allPass([is(String), isNotEmpty]);
const isNonEmptyArr = allPass([is(Array), isNotEmpty]);
const isObjectFn = compose(allPass([isNotArr, is(Object)]))
const isNonEmptyObjectFn = compose(allPass([isNotEmpty, isNotArr, is(Object)]))

export class ChannelPayloadFilter {
  /**
   * @module ChannelPayloadFilter
   * @type util
   *
   *
   * @desc
   * <p>This utility filters ChannelPayload objects by using query selectors and/or by comparing data properties</p>
   * <h3>The ChannelPayloadFilter features</h3>
   * <ul>
   *   <li>Can be used by Channels and ViewStreams</li>
   *   <li>ChannelPayloadFilter instances can be used as the third parameter when binding actions to ViewStream methods.</li>
   *   <li>Selectors can be a query string, an array of selector strings, or the selector can be an actual dom element.</li>
   *   <li>Selectors are not required and can be disregarded by adding "" or undefined as the selector property.</li>
   *   <li>The data object compares the values from the props() method of a ChannelPayload object</li>
   *   <li>Internally, The data object is conformed to a spec object for ramda&rsquo;s EXT['where', '//ramdajs.com/docs/#where'] method</li>
   *   </ul>
   *
   * @constructor
   * @property {String|Array|HTMLElement} selector The matching element
   * @param {Object} filters Object that contains the selector, props, and debugLabel params.
   * @property {Object} propFilters A json object containing filtering methods for channel props variables.
   *
   * @property {String|Array|HTMLElement} selector - = ''; The matching element.
   * @property {Object} propFilters - = {}; A json object containing comprators for any expected property values.
   * @returns Boolean
   *
   *
   * @example
   * TITLE['<h4>Filtering using Selectors and a Property Comparator Within a ViewStream Instance</h4>']
   *    const mySelectors = ['ul', 'li:first-child'];
   *    const propFilters = {
   *      linkType: "external"
   *    };
   *    const myFilter = new ChannelPayloadFilter(mySelectors, propFilters);
   *
   *    addActionListeners() {
   *      return [
   *                ['CHANNEL_UI_CLICK_EVENT', 'onClickEvent', myFilter]
   *             ]
   *          }
   *
   * @example
   * TITLE['<h4>Filtering Using Method and String Comparators Within a ViewStream Instance</h4>']
   *    const propFilters = {
   *      type: "scrolling-element",
   *      scrollNum:  (n)=>n>=1200 && n<=5000;
   *    };
   *    const myFilter = new ChannelPayloadFilter('', propFilters);
   *
   *    addActionListeners() {
   *      return [
   *                ['CHANNEL_UI_CLICK_EVENT', 'onClickEvent', myFilter]
   *             ]
   *          }
   *
   *
   * @example
   * TITLE['<h4>A Simple Property Filtering Example Within a Channel Instance</h4>']
   * // Filter for a button with a data type of 'link'
   * const myFilter = new ChannelPayloadFilter('' {type: "link"});
   *
   * this.getChannel("CHANNEL_UI")
   * .pipe(filter(myFilter))
   * .subscribe(myChannelMethod);
   *
   */
  constructor(selector, filters={}, debugLabel, testMode) {



    const selectorIsObj = isObjectFn(selector);

    if(selectorIsObj){
      filters = selector;
      selector = prop('selector', filters);
      testMode = testMode || prop("testMode", filters);
      if (prop('label', filters)){
        debugLabel = filters.label;
      } else {
        debugLabel = prop('debugLabel', filters);
      }

    }



    let props = omit(['debugLabel', 'label', 'selector', 'props', 'testMode', 'propFilters'], filters)
    if (filters.props!==undefined) {
      props = mergeAll([filters.props, props])

    } else if (filters.propFilters!==undefined) {
      props = mergeAll([filters.propFilters, props])
    }

    filters['propFilters'] = props;

    let {propFilters} = filters;
    //console.log("selector filters ", {selector, filters})

    // let {selector,propFilters,debugLabel} = filters;

    const addStringSelectorFilter =  isNonEmptyStr(selector) ? ChannelPayloadFilter.filterSelector([selector]) : undefined;
    const addArraySelectorFilter =   isNonEmptyArr(selector) ? ChannelPayloadFilter.filterSelector(selector) : undefined;


    const addDataFilter = isNonEmptyObjectFn(propFilters) ? ChannelPayloadFilter.filterData(propFilters, debugLabel) : undefined;

    //console.log("IS STRING ",{selector, addStringSelectorFilter, addArraySelectorFilter, addDataFilter},isNonEmptyStr(selector))



    let filtersArr = reject(isNil, [addStringSelectorFilter, addArraySelectorFilter, addDataFilter]);
   // console.log('filtersArr is ',{selector})

      // IF ARRAY IS EMPTY ALWAYS RETURN FALSE;

      const filtersAreEmpty = isEmpty(filtersArr);

      if (filtersAreEmpty){
        filtersArr = [always(false)];
        if (path(['Spyne', 'config', 'debug'], window) === true && testMode!==true){
          console.warn(`Spyne Warning: The Channel Filter, with selector: ${selector}, and propFilters:${propFilters} appears to be empty!`);
        }

      }


   // console.log(" VALUES OF FILTERS ",{selector,propFilters,debugLabel,testMode, filtersAreEmpty});
    if (testMode === true){
        return {selector, propFilters, debugLabel, filters, testMode, filtersAreEmpty};
      }

    return allPass(filtersArr);
  }

  static filterData(filterJson, filterdebugLabel) {
    const debugLabel = filterdebugLabel;
    let compareData = () => {
      // DO NOT ALLOW AN EMPTY OBJECT TO RETURN TRUEs
      if (isEmpty(filterJson)) {
        return always(false);
      }

      //console.log("FILTER JSON ",filterJson);
      //  CHECKS ALL VALUES IN JSON TO DETERMINE IF THERE ARE FILTERING METHODS

      //let typeArrFn = compose(values, rMap(type));

      /*let sendMalFormedWarningBool = uniq(filterValsArr).length > 1;
      if (sendMalFormedWarningBool === true) {
        console.warn('Spyne Warningd: The data values in ChannelActionFilters needs to be either all methods or all static values.  DATA: ', filterJson);
      }*/

      const createCurryComparator = compareStr => (str)=>{
        return str===compareStr;
      };
      const checkToConvertToFn = (val, key, obj)=>val = is(String, val)===true ? createCurryComparator(val) : val;
      filterJson = rMap(checkToConvertToFn, filterJson);

      // console.log("FILTER JSON: ",{filterJson, newJson});
      //const isAllMethods  = all(equals('Function'), filterValsArr);

      // PULL OUT THE CHANNEL PAYLOAD OBJECT IN THE MAIN PAYLOAD
      // let payload = prop('channelPayload', eventData)

      // IF THERE ARE METHODS IN THE FILTERING JSON, THEN USE where or whereEq if Basic JSON
     // let fMethod = isAllMethods === true ? where(filterJson) : whereEq(filterJson);

      // TAP LOGGER

      const tapLogger = (comparedObj)=>{
        if (debugLabel===undefined){
          return comparedObj;
        }
        const propsBooleans = {};
        const mapBools = (value,key)=>propsBooleans[key] = value(prop(key, comparedObj));
        forEachObjIndexed(mapBools, filterJson);
        console.log(`%c CHANNEL PAYLOAD FILTER DEBUGGER '${debugLabel}': `, "color:orange;",{propsBooleans, comparedObj});

        return comparedObj;
        };

      // END TAP LOGGER

      let fMethod = where(filterJson);

      let getFilteringObj =  (v)=>{
        const {payload} = v || {};
        return Object.assign({}, v, payload);
      }


      return compose( fMethod, tapLogger, defaultTo({}),  getFilteringObj);

    };
   // const filterLabel = `filtering-${Math.floor(Math.random()*999999)}`;
    //console.time(filterLabel);
   // const val = compareData();

    //console.timeEnd(filterLabel);
    //return val;
    return compareData();
  }

  static checkPayloadSelector(arr, payload) {
    // ELEMENT FROM PAYLOADs

    let payloadIsNotProps = compose(equals('Function'),type, prop('props')  )(payload);
    payload = payloadIsNotProps === true ? payload.payload : payload;


    let el = path(['el'], payload);

    // RETURN BOOLEAN MATCH WITH PAYLOAD EL
    const compareEls = (elCompare) => elCompare.isEqualNode((el));

    // LOOP THROUGH NODES IN querySelectorAll()
    const mapNodeArrWithEl = (sel) => {
      // convert nodelist to array of els
      let nodeArr = flatten(document.querySelectorAll(sel));
      // els array to boolean array
      return rMap(compareEls, nodeArr);
    };

    // CHECK IF PAYLOAD EL EXISTS
    if (typeof (el) !== 'object') {
      return false;
    }

    // LOOP THROUGH ALL SELECTORS IN MAIN ARRAY
    let nodeArrResult = compose(flatten, rMap(mapNodeArrWithEl))(arr);
    if (isEmpty(nodeArrResult) === true) {
      return false;
    }

    return any(equals(true), nodeArrResult);
  }


  static filterSelector(selectorArr) {
    let arr = reject(isEmpty, selectorArr);
    let payloadCheck = curry(ChannelPayloadFilter.checkPayloadSelector);
    return payloadCheck(arr);
  }
}
