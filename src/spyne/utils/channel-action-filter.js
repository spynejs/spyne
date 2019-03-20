import * as R from 'ramda';

export class ChannelActionFilter {
  constructor(selector, data) {
    const addStringSelectorFilter =  R.is(String, selector) ? ChannelActionFilter.filterSelector([selector]) : undefined;
    const addArraySelectorFilter = R.is(Array, selector) ? ChannelActionFilter.filterSelector(selector) : undefined;
    const addDataFilter = R.is(Object, data) ? ChannelActionFilter.filterData(data) : undefined;

    const filtersArr = R.reject(R.isNil, [addStringSelectorFilter, addArraySelectorFilter, addDataFilter]);

    return R.allPass(filtersArr);
  }

  static filterData(filterJson) {
    let compareData = () => {
      // DO NOT ALLOW AN EMPTY OBJECT TO RETURN TRUEs
      if (R.isEmpty(filterJson)) {
        return R.always(false);
      }
      //  CHECKS ALL VALUES IN JSON TO DETERMINE IF THERE ARE FILTERING METHODS

      let typeArrFn = R.compose(R.values, R.map(R.type));
      let filterValsArr = typeArrFn(filterJson);

      let sendMalFormedWarningBool = R.uniq(filterValsArr).length > 1;
      if (sendMalFormedWarningBool === true) {
        console.warn('Spyne Warningd: The data values in ChannelActionFilters needs to be either all methods or all static values.  DATA: ', filterJson);
      }

      // console.log("FILTER JSON: ",filterJson);
      const isAllMethods  = R.all(R.equals('Function'), filterValsArr);

      // PULL OUT THE CHANNEL PAYLOAD OBJECT IN THE MAIN PAYLOAD
      // let payload = R.prop('channelPayload', eventData)

      // IF THERE ARE METHODS IN THE FILTERING JSON, THEN USE R.where or R.whereEq if Basic JSON
      let fMethod = isAllMethods === true ? R.where(filterJson) : R.whereEq(filterJson);

      return R.compose(fMethod, R.defaultTo({}));
    };

    return compareData();
  }

  static checkPayloadSelector(arr, payload) {
    // ELEMENT FROM PAYLOAD
    let el = R.path(['el'], payload);

    // RETURN BOOLEAN MATCH WITH PAYLOAD EL
    const compareEls = (elCompare) => elCompare.isEqualNode((el));

    // LOOP THROUGH NODES IN querySelectorAll()
    const mapNodeArrWithEl = (sel) => {
      // convert nodelist to array of els
      let nodeArr = R.flatten(document.querySelectorAll(sel));
      // els array to boolean array
      return R.map(compareEls, nodeArr);
    };

    // CHECK IF PAYLOAD EL EXISTS
    if (typeof (el) !== 'object') {
      return false;
    }

    // LOOP THROUGH ALL SELECTORS IN MAIN ARRAY
    let nodeArrResult = R.compose(R.flatten, R.map(mapNodeArrWithEl))(arr);
    if (R.isEmpty(nodeArrResult) === true) {
      return false;
    }

    return R.any(R.equals(true), nodeArrResult);
  }

  static filterSelector(selectorArr) {
    let arr = R.reject(R.isEmpty, selectorArr);
    let payloadCheck = R.curry(ChannelActionFilter.checkPayloadSelector);
    return payloadCheck(arr);
  }
}
