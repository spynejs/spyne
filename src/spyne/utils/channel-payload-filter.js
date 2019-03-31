import {is, filter, reject, isNil, allPass, isEmpty, isAlways, compose, uniq, equals, all, prop, whereEq, where, defaultTo, path, values, type, flatten, any, curry} from 'ramda';
const rMap = require('ramda').map;
export class ChannelPayloadFilter {
  /**
   * @module ChannelPayloadFilter
   *
   * @desc
   * Filters Channel Actions before the assigned method is called.<span class='break'/>
   * Actions can be filtered by a selector when triggered by an HTML element, and/or actions can be filtered by the values returned by that action.
   *
   * @constructor
   * @param {String|Array|HTMLElement} selector The matching element
   * @param {Object} data A json object containing filtering methods for channel props variables
   *
   * @property {String|Array|HTMLElement} selector The matching element
   * @property {Object} data A json object containing filtering methods for channel props variables
   * @example
   *    let data = {
   *      linkType: (type)=>type==='external'
   *    };
   * let myFilter = new ChannelPayloadFilter(['ul', 'li:first-child'], data);
   *
   *    addActionListeners() {
   *      return [
   *                ['CHANNEL_UI_CLICK_EVENT', 'onClickEvent', myFilter]
   *             ]
   *          }
   *
   */
  constructor(selector, data) {
    const addStringSelectorFilter =  is(String, selector) ? ChannelPayloadFilter.filterSelector([selector]) : undefined;
    const addArraySelectorFilter = is(Array, selector) ? ChannelPayloadFilter.filterSelector(selector) : undefined;
    const addDataFilter = is(Object, data) ? ChannelPayloadFilter.filterData(data) : undefined;

    const filtersArr = reject(isNil, [addStringSelectorFilter, addArraySelectorFilter, addDataFilter]);

    return allPass(filtersArr);
  }

  static filterData(filterJson) {
    let compareData = () => {
      // DO NOT ALLOW AN EMPTY OBJECT TO RETURN TRUEs
      if (isEmpty(filterJson)) {
        return always(false);
      }
      //  CHECKS ALL VALUES IN JSON TO DETERMINE IF THERE ARE FILTERING METHODS

      let typeArrFn = compose(values, rMap(type));
      let filterValsArr = typeArrFn(filterJson);

      let sendMalFormedWarningBool = uniq(filterValsArr).length > 1;
      if (sendMalFormedWarningBool === true) {
        console.warn('Spyne Warningd: The data values in ChannelActionFilters needs to be either all methods or all static values.  DATA: ', filterJson);
      }

      // console.log("FILTER JSON: ",filterJson);
      const isAllMethods  = all(equals('Function'), filterValsArr);

      // PULL OUT THE CHANNEL PAYLOAD OBJECT IN THE MAIN PAYLOAD
      // let payload = prop('channelPayload', eventData)

      // IF THERE ARE METHODS IN THE FILTERING JSON, THEN USE where or whereEq if Basic JSON
      let fMethod = isAllMethods === true ? where(filterJson) : whereEq(filterJson);

      return compose(fMethod, defaultTo({}));
    };

    return compareData();
  }

  static checkPayloadSelector(arr, payload) {
    // ELEMENT FROM PAYLOAD
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
